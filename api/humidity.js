import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("humidity_app");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

function getThresholdStatus(humidity) {
  if (humidity <= 40) {
    return "good";
  }
  if (humidity <= 55) {
    return "okay";
  }
  if (humidity <= 65) {
    return "caution";
  }
  return "bad";
}

function getRangeStart(range) {
  const now = new Date();

  switch (range) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

function roundNumber(value) {
  return Math.round(value * 10) / 10;
}

function formatLabel(date, range) {
  const d = new Date(date);

  if (range === "24h") {
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    const readings = db.collection("readings");

    if (req.method === "POST") {
      const { city, humidity, source } = req.body || {};

      if (!city || humidity === undefined || humidity === null) {
        return res.status(400).json({
          error: "Missing required fields: city and humidity",
        });
      }

      const parsedHumidity = Number(humidity);

      if (Number.isNaN(parsedHumidity)) {
        return res.status(400).json({
          error: "Humidity must be a valid number",
        });
      }

      const newReading = {
        city,
        humidity: parsedHumidity,
        source: source || "unknown",
        createdAt: new Date(),
      };

      await readings.insertOne(newReading);

      return res.status(201).json({
        success: true,
        message: "Humidity reading saved",
        reading: newReading,
      });
    }

    if (req.method === "GET") {
      const city = req.query.city || "Sensor";
      const range = req.query.range || "week";

      // latest reading only
      if (range === "latest") {
        const latestReading = await readings.findOne(
          { city },
          { sort: { createdAt: -1 } }
        );

        if (!latestReading) {
          return res.status(200).json({
            city,
            latest: null,
            humidity: null,
            status: "unknown",
            lastUpdated: null,
          });
        }

        return res.status(200).json({
          city,
          latest: latestReading,
          humidity: roundNumber(latestReading.humidity),
          status: getThresholdStatus(latestReading.humidity),
          lastUpdated: latestReading.createdAt,
        });
      }

      const startDate = getRangeStart(range);

      const docs = await readings
        .find({
          city,
          createdAt: { $gte: startDate },
        })
        .sort({ createdAt: 1 })
        .toArray();

      if (!docs.length) {
        return res.status(200).json({
          city,
          range,
          labels: [],
          series: [],
          avg: 0,
          high: 0,
          low: 0,
          latest: null,
          status: "unknown",
          riskHours: 0,
        });
      }

      const labels = docs.map((doc) => formatLabel(doc.createdAt, range));
      const series = docs.map((doc) => roundNumber(doc.humidity));

      const humidities = docs.map((doc) => doc.humidity);
      const avg =
        humidities.reduce((sum, val) => sum + val, 0) / humidities.length;
      const high = Math.max(...humidities);
      const low = Math.min(...humidities);
      const latest = docs[docs.length - 1];

      // rough estimate of time spent above 55%
      let riskHours = 0;
      for (let i = 1; i < docs.length; i++) {
        const prev = docs[i - 1];
        const curr = docs[i];

        if (prev.humidity > 55) {
          const diffMs = new Date(curr.createdAt) - new Date(prev.createdAt);
          riskHours += diffMs / (1000 * 60 * 60);
        }
      }

      return res.status(200).json({
        city,
        range,
        labels,
        series,
        avg: roundNumber(avg),
        high: roundNumber(high),
        low: roundNumber(low),
        latest: {
          humidity: roundNumber(latest.humidity),
          createdAt: latest.createdAt,
          source: latest.source,
        },
        status: getThresholdStatus(latest.humidity),
        riskHours: roundNumber(riskHours),
      });
    }

    return res.status(405).json({
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("API error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
