let currentRange = "week";

// ---------- DOM ----------
const humidityValueEl = document.getElementById("humidityValue");
const humiditySentenceEl = document.getElementById("humiditySentence");
const orbValueEl = document.getElementById("orbValue");
const humidityStatusEl = document.getElementById("humidityStatus");
const lastUpdatedEl = document.getElementById("lastUpdated");
const roomMoodTextEl = document.getElementById("roomMoodText");
const moodSwingsTextEl = document.getElementById("moodSwingsText");
const recommendationTitleEl = document.getElementById("recommendationTitle");
const recommendationTextEl = document.getElementById("recommendationText");
const avgValueEl = document.getElementById("avgValue");
const highValueEl = document.getElementById("highValue");
const lowValueEl = document.getElementById("lowValue");
const riskHoursTextEl = document.getElementById("riskHoursText");
const riskHoursValueEl = document.getElementById("riskHoursValue");

const chartLineEl = document.getElementById("chartLine");
const chartPointsEl = document.getElementById("chartPoints");
const chartLabelsEl = document.getElementById("chartLabels");

const rangeButtons = document.querySelectorAll(".range-switch button");
const root = document.documentElement;

// ---------- Helpers ----------
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function setThemeByHumidity(humidity) {
  if (humidity <= 40) {
    root.style.setProperty("--humidity-accent", "#5cc7d8");
    root.style.setProperty("--mood-accent", "#22a352");
    root.style.setProperty("--status-bg", "rgba(34, 163, 82, 0.14)");
    root.style.setProperty("--status-text", "#17733a");
    root.style.setProperty("--orb-accent", "#5cc7d8");
    root.style.setProperty("--line-accent", "#22a352");

    humidityStatusEl.textContent = "Very comfortable";
    roomMoodTextEl.textContent = "This is the kind of room humidity your filament cannot really complain about.";
    moodSwingsTextEl.textContent = "easy days.";
    recommendationTitleEl.textContent = "Honestly, your room is behaving itself.";
    recommendationTextEl.textContent =
      "These conditions are pretty friendly for casual printing and general filament storage. Sealed storage is still smart, but nothing feels urgent.";
  } else if (humidity <= 55) {
    root.style.setProperty("--humidity-accent", "#5cc7d8");
    root.style.setProperty("--mood-accent", "#22a352");
    root.style.setProperty("--status-bg", "rgba(34, 163, 82, 0.14)");
    root.style.setProperty("--status-text", "#17733a");
    root.style.setProperty("--orb-accent", "#5cc7d8");
    root.style.setProperty("--line-accent", "#22a352");

    humidityStatusEl.textContent = "Pretty reasonable";
    roomMoodTextEl.textContent =
      "Not awful. Not ideal. Kind of a “your filament won’t file a complaint yet” situation.";
    moodSwingsTextEl.textContent = "mood swings.";
    recommendationTitleEl.textContent = "Print if you want, just don’t get too comfortable.";
    recommendationTextEl.textContent =
      "The room is workable right now, but if readings keep trending upward, storage and drying start becoming more important.";
  } else if (humidity <= 65) {
    root.style.setProperty("--humidity-accent", "#d89b3e");
    root.style.setProperty("--mood-accent", "#d89b3e");
    root.style.setProperty("--status-bg", "rgba(216, 155, 62, 0.18)");
    root.style.setProperty("--status-text", "#9f6213");
    root.style.setProperty("--orb-accent", "#d89b3e");
    root.style.setProperty("--line-accent", "#d89b3e");

    humidityStatusEl.textContent = "Getting a bit damp";
    roomMoodTextEl.textContent =
      "You are still in workable territory, but this is the point where exposed filament starts becoming less happy over time.";
    moodSwingsTextEl.textContent = "questionable choices.";
    recommendationTitleEl.textContent = "Your filament is starting to side-eye you.";
    recommendationTextEl.textContent =
      "You can still print, but PETG, TPU, and nylon would benefit from more careful storage and maybe a quick drying pass.";
  } else {
    root.style.setProperty("--humidity-accent", "#d96b6b");
    root.style.setProperty("--mood-accent", "#d96b6b");
    root.style.setProperty("--status-bg", "rgba(217, 107, 107, 0.18)");
    root.style.setProperty("--status-text", "#9c3535");
    root.style.setProperty("--orb-accent", "#d96b6b");
    root.style.setProperty("--line-accent", "#d96b6b");

    humidityStatusEl.textContent = "Not loving this";
    roomMoodTextEl.textContent =
      "Yeah, this is the part where your filament starts developing trust issues.";
    moodSwingsTextEl.textContent = "humidity drama.";
    recommendationTitleEl.textContent = "This is dry-box territory.";
    recommendationTextEl.textContent =
      "At this point, long exposure is not doing your filament any favors. Drying and sealed storage are strongly recommended.";
  }
}

function updateLatestUI(latest) {
  if (!latest || latest.humidity == null) {
    humidityValueEl.textContent = "--";
    humiditySentenceEl.textContent = "--% humidity.";
    orbValueEl.textContent = "--%";
    humidityStatusEl.textContent = "No data yet";
    lastUpdatedEl.textContent = "Waiting for sensor data";
    return;
  }

  const humidity = Math.round(latest.humidity * 10) / 10;
  humidityValueEl.textContent = humidity;
  humiditySentenceEl.textContent = `${humidity}% humidity.`;
  orbValueEl.textContent = `${humidity}%`;
  lastUpdatedEl.textContent = `Last updated ${formatTime(latest.createdAt)}`;

  setThemeByHumidity(humidity);
}

function updateSummaryUI(data) {
  avgValueEl.textContent = `${data.avg ?? 0}%`;
  highValueEl.textContent = `${data.high ?? 0}%`;
  lowValueEl.textContent = `${data.low ?? 0}%`;

  const riskHours = Number(data.riskHours ?? 0).toFixed(1);
  riskHoursTextEl.textContent = `${riskHours} hours`;
  riskHoursValueEl.textContent = `${riskHours}h`;
}

function buildChart(labels, series) {
  chartLineEl.setAttribute("points", "");
  chartPointsEl.innerHTML = "";
  chartLabelsEl.innerHTML = "";

  if (!labels.length || !series.length) {
    chartLabelsEl.innerHTML = `
      <text x="80" y="180">No humidity history yet. Let the sensor cook for a bit.</text>
    `;
    return;
  }

  const xMin = 80;
  const xMax = 920;
  const yMin = 60;
  const yMax = 300;

  const minVal = Math.min(...series, 30);
  const maxVal = Math.max(...series, 80);

  const safeMin = Math.floor(minVal - 5);
  const safeMax = Math.ceil(maxVal + 5);
  const valRange = Math.max(1, safeMax - safeMin);

  const points = series.map((value, index) => {
    const x =
      labels.length === 1
        ? (xMin + xMax) / 2
        : xMin + (index / (labels.length - 1)) * (xMax - xMin);

    const y = yMax - ((value - safeMin) / valRange) * (yMax - yMin);
    return { x, y, value };
  });

  chartLineEl.setAttribute(
    "points",
    points.map((p) => `${p.x},${p.y}`).join(" ")
  );

  points.forEach((p) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", "6");
    chartPointsEl.appendChild(circle);
  });

  // Show up to 6 labels max so it does not get messy
  const maxLabels = 6;
  const step = Math.max(1, Math.ceil(labels.length / maxLabels));

  labels.forEach((label, index) => {
    if (index % step !== 0 && index !== labels.length - 1) return;

    const x =
      labels.length === 1
        ? (xMin + xMax) / 2
        : xMin + (index / (labels.length - 1)) * (xMax - xMin);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", "334");
    text.setAttribute("text-anchor", "middle");
    text.textContent = label;
    chartLabelsEl.appendChild(text);
  });
}

async function fetchHumidity(range = "week") {
  try {
    const res = await fetch(`/api/humidity?city=Sensor&range=${range}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch humidity");
    }

    if (range === "latest") {
      if (data.latest) {
        updateLatestUI(data.latest);
        avgValueEl.textContent = "--%";
        highValueEl.textContent = "--%";
        lowValueEl.textContent = "--%";
        riskHoursTextEl.textContent = "-- hours";
        riskHoursValueEl.textContent = "--h";
        buildChart([], []);
      } else {
        updateLatestUI(null);
      }
      return;
    }

    updateLatestUI(data.latest);
    updateSummaryUI(data);
    buildChart(data.labels || [], data.series || []);
  } catch (error) {
    console.error("Humidity fetch error:", error);
    humidityStatusEl.textContent = "Something broke";
    lastUpdatedEl.textContent = "Could not load sensor data";
  }
}

// ---------- Range buttons ----------
rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    rangeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentRange = button.dataset.range;
    fetchHumidity(currentRange);
  });
});

// ---------- Background reveals ----------
const revealElements = document.querySelectorAll(".reveal-bg");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((el) => revealObserver.observe(el));

// ---------- Parallax ----------
const parallaxElements = document.querySelectorAll(".parallax");

function handleParallax() {
  const scrollY = window.scrollY;

  parallaxElements.forEach((el) => {
    const speed = parseFloat(el.dataset.speed || "0.1");
    const offset = scrollY * speed;
    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

window.addEventListener("scroll", handleParallax, { passive: true });
handleParallax();

// ---------- Initial load ----------
fetchHumidity(currentRange);

// Refresh every 60 seconds
setInterval(() => {
  fetchHumidity(currentRange);
}, 60000);
