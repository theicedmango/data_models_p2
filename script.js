let currentRange = "24h";

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
const chartEmptyStateEl = document.getElementById("chartEmptyState");
const chartTooltipEl = document.getElementById("chartTooltip");

const rangeButtons = document.querySelectorAll(".range-switch button");
const root = document.documentElement;

// ---------- Helpers ----------
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Toronto",
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setThemeByHumidity(humidity) {
  const fillPercent = `${clamp(humidity, 0, 100)}%`;
  root.style.setProperty("--fill-percent", fillPercent);

  if (humidity <= 45) {
    root.style.setProperty("--humidity-accent", "#22A352");
    root.style.setProperty("--status-bg", "rgba(34, 163, 82, 0.14)");
    root.style.setProperty("--status-text", "#17733A");
    root.style.setProperty("--orb-accent", "#22A352");
    root.style.setProperty("--line-accent", "#22A352");

    humidityStatusEl.textContent = "Pretty safe";
    roomMoodTextEl.textContent =
      "This is the kind of room humidity that most filament can live with pretty comfortably.";
    moodSwingsTextEl.textContent = "calm days.";
    recommendationTitleEl.textContent =
      "This is a pretty comfortable range for most printing.";
    recommendationTextEl.textContent =
      "PLA should be totally fine, and even more sensitive materials are in a much better place here than in a damp room.";
  } else if (humidity <= 60) {
    root.style.setProperty("--humidity-accent", "#CCA23C");
    root.style.setProperty("--status-bg", "rgba(204, 162, 60, 0.16)");
    root.style.setProperty("--status-text", "#8D6B15");
    root.style.setProperty("--orb-accent", "#CCA23C");
    root.style.setProperty("--line-accent", "#CCA23C");

    humidityStatusEl.textContent = "Keep an eye on it";
    roomMoodTextEl.textContent =
      "This is still workable, but this is where exposed filament can slowly start becoming less happy over time.";
    moodSwingsTextEl.textContent = "questionable choices.";
    recommendationTitleEl.textContent =
      "This is still usable, but storage matters more now.";
    recommendationTextEl.textContent =
      "PLA is usually still okay, but PETG, TPU, and nylon are starting to become much more sensitive to being left out.";
  } else {
    root.style.setProperty("--humidity-accent", "#B63831");
    root.style.setProperty("--status-bg", "rgba(182, 56, 49, 0.16)");
    root.style.setProperty("--status-text", "#8E2C27");
    root.style.setProperty("--orb-accent", "#B63831");
    root.style.setProperty("--line-accent", "#B63831");

    humidityStatusEl.textContent = "Too humid";
    roomMoodTextEl.textContent =
      "Yeah, this is the point where your filament starts developing trust issues.";
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

function clearChart() {
  chartLineEl.setAttribute("points", "");
  chartPointsEl.innerHTML = "";
  chartLabelsEl.innerHTML = "";
  chartEmptyStateEl.innerHTML = "";
  hideTooltip();
}

function showEmptyChartMessage(message) {
  clearChart();

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", "500");
  text.setAttribute("y", "190");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("class", "chart-empty-text");
  text.textContent = message;

  chartEmptyStateEl.appendChild(text);
}

function showTooltip(x, y, label, value) {
  chartTooltipEl.innerHTML = `<strong>${value}%</strong><br>${label}`;
  chartTooltipEl.classList.remove("hidden");
  chartTooltipEl.style.left = `${x}px`;
  chartTooltipEl.style.top = `${y}px`;
}

function hideTooltip() {
  chartTooltipEl.classList.add("hidden");
}

function buildChart(labels, series, range, uniqueDays = 0) {
  clearChart();

  const notEnoughForLongRange =
    (range === "week" || range === "month") && uniqueDays < 2;

  if (
    !labels.length ||
    !series.length ||
    labels.length < 2 ||
    series.length < 2 ||
    notEnoughForLongRange
  ) {
    showEmptyChartMessage(
      "Not enough humidity history yet. Let the sensor work for a bit."
    );
    return;
  }

  const xMin = 80;
  const xMax = 920;
  const yMin = 60;
  const yMax = 300;

  const minVal = Math.min(...series, 20);
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
    return { x, y, value, label: labels[index] };
  });

  chartLineEl.setAttribute(
    "points",
    points.map((p) => `${p.x},${p.y}`).join(" ")
  );

  const chartSvg = document.querySelector(".chart");
  const svgRect = chartSvg.getBoundingClientRect();

  points.forEach((p) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", "6");

    circle.addEventListener("mouseenter", () => {
      const relativeX = (p.x / 1000) * svgRect.width;
      const relativeY = (p.y / 360) * svgRect.height;
      showTooltip(relativeX, relativeY, p.label, p.value);
    });

    circle.addEventListener("mouseleave", hideTooltip);

    chartPointsEl.appendChild(circle);
  });

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

async function fetchHumidity(range = "24h") {
  try {
    const res = await fetch(`/api/humidity?city=Sensor&range=${range}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch humidity");
    }

    updateLatestUI(data.latest);
    updateSummaryUI(data);

    buildChart(
      data.labels || [],
      data.series || [],
      range,
      data.uniqueDays || 0
    );
  } catch (error) {
    console.error("Humidity fetch error:", error);
    humidityStatusEl.textContent = "Something broke";
    lastUpdatedEl.textContent = "Could not load sensor data";
    showEmptyChartMessage(
      "Not enough humidity history yet. Let the sensor work for a bit."
    );
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
