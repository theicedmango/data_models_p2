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

const actionItem1El = document.getElementById("actionItem1");
const actionItem2El = document.getElementById("actionItem2");
const actionItem3El = document.getElementById("actionItem3");
const actionItem4El = document.getElementById("actionItem4");

const chartSvgEl = document.querySelector(".chart");
const chartLineEl = document.getElementById("chartLine");
const chartPointsEl = document.getElementById("chartPoints");
const chartLabelsEl = document.getElementById("chartLabels");
const chartEmptyStateEl = document.getElementById("chartEmptyState");
const chartTooltipEl = document.getElementById("chartTooltip");

const rangeButtons = document.querySelectorAll(".range-switch button");
const parallaxElements = document.querySelectorAll(".parallax");
const revealElements = document.querySelectorAll(".reveal-bg");
const heroCard = document.querySelector(".hero-stat-card");

const miniTag1El = document.getElementById("miniTag1");
const miniTag2El = document.getElementById("miniTag2");
const miniTag3El = document.getElementById("miniTag3");

const recommendationPillEl = document.getElementById("recommendationPill");

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

// ---------- Theme / content updates ----------
function setThemeByHumidity(humidity) {
  const fillPercent = `${clamp(humidity, 0, 100)}%`;
  root.style.setProperty("--fill-percent", fillPercent);

  // reset recommendation pill state
  if (recommendationPillEl) {
    recommendationPillEl.classList.remove("good", "warn", "bad");
  }

  // reset hero pill state
  if (humidityStatusEl) {
    humidityStatusEl.classList.remove("good", "warn", "bad");
  }

  if (humidity <= 45) {
    root.style.setProperty("--humidity-accent", "#22A352");
    root.style.setProperty("--status-bg", "rgba(34, 163, 82, 0.14)");
    root.style.setProperty("--status-text", "#17733A");
    root.style.setProperty("--orb-accent", "#22A352");
    root.style.setProperty("--line-accent", "#22A352");

    if (humidityStatusEl) {
      humidityStatusEl.textContent = "Pretty safe";
      humidityStatusEl.classList.add("good");
    }

    if (roomMoodTextEl) {
      roomMoodTextEl.textContent =
        "This is the kind of room humidity that most filament can live with pretty comfortably.";
    }

    if (moodSwingsTextEl) moodSwingsTextEl.textContent = "calm days.";

    if (recommendationTitleEl) {
      recommendationTitleEl.textContent =
        "This is a pretty comfortable range for most printing.";
    }

    if (recommendationTextEl) {
      recommendationTextEl.textContent =
        "PLA should be totally fine, and even more sensitive materials are in a much better place here than in a damp room.";
    }

    if (miniTag1El) miniTag1El.textContent = "PLA should be totally fine";
    if (miniTag2El) miniTag2El.textContent = "PETG is still comfortable";
    if (miniTag3El) miniTag3El.textContent = "Nylon still prefers dry storage";

    if (actionItem1El) actionItem1El.textContent = "Good time for a casual PLA print";
    if (actionItem2El) actionItem2El.textContent = "Store filament normally";
    if (actionItem3El) actionItem3El.textContent = "No urgent drying needed";
    if (actionItem4El) actionItem4El.textContent = "Check again before overnight jobs";

    if (recommendationPillEl) {
      recommendationPillEl.classList.add("good");
      recommendationPillEl.textContent = "Ideal conditions";
    }
  } else if (humidity <= 60) {
    root.style.setProperty("--humidity-accent", "#CCA23C");
    root.style.setProperty("--status-bg", "rgba(204, 162, 60, 0.16)");
    root.style.setProperty("--status-text", "#8D6B15");
    root.style.setProperty("--orb-accent", "#CCA23C");
    root.style.setProperty("--line-accent", "#CCA23C");

    if (humidityStatusEl) {
      humidityStatusEl.textContent = "Keep an eye on it";
      humidityStatusEl.classList.add("warn");
    }

    if (roomMoodTextEl) {
      roomMoodTextEl.textContent =
        "This is still workable, but this is where exposed filament can slowly start becoming less happy over time.";
    }

    if (moodSwingsTextEl) moodSwingsTextEl.textContent = "questionable days.";

    if (recommendationTitleEl) {
      recommendationTitleEl.textContent =
        "This is still usable, but storage matters more now.";
    }

    if (recommendationTextEl) {
      recommendationTextEl.textContent =
        "PLA is usually still okay, but PETG, TPU, and nylon are starting to become much more sensitive to being left out.";
    }

    if (miniTag1El) miniTag1El.textContent = "PLA is still usually okay";
    if (miniTag2El) miniTag2El.textContent = "PETG should be watched";
    if (miniTag3El) miniTag3El.textContent = "Nylon should stay sealed";

    if (actionItem1El) actionItem1El.textContent = "PLA is still usually okay";
    if (actionItem2El) actionItem2El.textContent = "Store exposed filament";
    if (actionItem3El) actionItem3El.textContent = "Dry PETG or nylon before long prints";
    if (actionItem4El) actionItem4El.textContent = "Monitor the room through the day";

    if (recommendationPillEl) {
      recommendationPillEl.classList.add("warn");
      recommendationPillEl.textContent = "Monitor conditions";
    }
  } else {
    root.style.setProperty("--humidity-accent", "#B63831");
    root.style.setProperty("--status-bg", "rgba(182, 56, 49, 0.16)");
    root.style.setProperty("--status-text", "#8E2C27");
    root.style.setProperty("--orb-accent", "#B63831");
    root.style.setProperty("--line-accent", "#B63831");

    if (humidityStatusEl) {
      humidityStatusEl.textContent = "Too humid";
      humidityStatusEl.classList.add("bad");
    }

    if (roomMoodTextEl) {
      roomMoodTextEl.textContent =
        "Yeah, this is the point where your filament starts developing trust issues.";
    }

    if (moodSwingsTextEl) moodSwingsTextEl.textContent = "risky spikes.";

    if (recommendationTitleEl) {
      recommendationTitleEl.textContent = "This is dry-box territory.";
    }

    if (recommendationTextEl) {
      recommendationTextEl.textContent =
        "At this point, long exposure is not doing your filament any favors. Drying and sealed storage are strongly recommended.";
    }

    if (miniTag1El) miniTag1El.textContent = "PLA should not stay out too long";
    if (miniTag2El) miniTag2El.textContent = "PETG should be stored now";
    if (miniTag3El) miniTag3El.textContent = "Nylon needs a dry box";

    if (actionItem1El) actionItem1El.textContent = "Avoid leaving filament exposed";
    if (actionItem2El) actionItem2El.textContent = "Store all active spools now";
    if (actionItem3El) actionItem3El.textContent = "Dry PETG, TPU, or nylon before printing";
    if (actionItem4El) actionItem4El.textContent = "Delay sensitive or long prints if possible";

    if (recommendationPillEl) {
      recommendationPillEl.classList.add("bad");
      recommendationPillEl.textContent = "High humidity warning";
    }
  }
}

function updateLatestUI(latest) {
  if (!latest || latest.humidity == null) {
    if (humidityValueEl) humidityValueEl.textContent = "--";
    if (humiditySentenceEl) humiditySentenceEl.textContent = "--% humidity.";
    if (orbValueEl) orbValueEl.textContent = "--%";
    if (humidityStatusEl) humidityStatusEl.textContent = "No data yet";
    if (lastUpdatedEl) lastUpdatedEl.textContent = "Waiting for sensor data";
    return;
  }

  const humidity = Math.round(latest.humidity * 10) / 10;

  if (humidityValueEl) humidityValueEl.textContent = humidity;
  if (humiditySentenceEl) humiditySentenceEl.textContent = `${humidity}% humidity.`;
  if (orbValueEl) orbValueEl.textContent = `${humidity}%`;
  if (lastUpdatedEl) {
    lastUpdatedEl.textContent = `Last updated ${formatTime(latest.createdAt)}`;
  }

  setThemeByHumidity(humidity);
}

function updateSummaryUI(data) {
  if (avgValueEl) avgValueEl.textContent = `${data.avg ?? 0}%`;
  if (highValueEl) highValueEl.textContent = `${data.high ?? 0}%`;
  if (lowValueEl) lowValueEl.textContent = `${data.low ?? 0}%`;

  const riskHours = Number(data.riskHours ?? 0).toFixed(1);
  if (riskHoursTextEl) riskHoursTextEl.textContent = `${riskHours} hours`;
  if (riskHoursValueEl) riskHoursValueEl.textContent = `${riskHours}h`;
}

// ---------- Chart helpers ----------
function hideTooltip() {
  if (!chartTooltipEl) return;
  chartTooltipEl.classList.add("hidden");
}

function clearChart() {
  if (chartSvgEl) chartSvgEl.classList.remove("empty");
  if (chartLineEl) chartLineEl.setAttribute("points", "");
  if (chartPointsEl) chartPointsEl.innerHTML = "";
  if (chartLabelsEl) chartLabelsEl.innerHTML = "";
  if (chartEmptyStateEl) chartEmptyStateEl.innerHTML = "";
  hideTooltip();
}

function showEmptyChartMessage(message) {
  if (!chartSvgEl || !chartEmptyStateEl) return;

  clearChart();
  chartSvgEl.classList.add("empty");

  const mainText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  mainText.setAttribute("x", "500");
  mainText.setAttribute("y", "176");
  mainText.setAttribute("text-anchor", "middle");
  mainText.setAttribute("class", "chart-empty-text");
  mainText.textContent = message;

  const subText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  subText.setAttribute("x", "500");
  subText.setAttribute("y", "206");
  subText.setAttribute("text-anchor", "middle");
  subText.setAttribute("class", "chart-empty-subtext");
  subText.textContent = "Try again once the sensor has gathered more readings across time.";

  chartEmptyStateEl.appendChild(mainText);
  chartEmptyStateEl.appendChild(subText);
}

function showTooltip(x, y, label, value) {
  if (!chartTooltipEl) return;

  chartTooltipEl.innerHTML = `<strong>${value}%</strong><br>${label}`;
  chartTooltipEl.classList.remove("hidden");
  chartTooltipEl.style.left = `${x}px`;
  chartTooltipEl.style.top = `${y}px`;
}

function buildChart(labels, series, range, uniqueDays = 0) {
  if (!chartSvgEl || !chartLineEl || !chartPointsEl || !chartLabelsEl) {
    console.warn("Chart elements missing.");
    return;
  }

  clearChart();

  const notEnoughForLongRange =
    (range === "week" && uniqueDays < 6) ||
    (range === "month" && uniqueDays < 29);

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

    return {
      x,
      y,
      value,
      label: labels[index],
    };
  });

  chartLineEl.setAttribute(
    "points",
    points.map((p) => `${p.x},${p.y}`).join(" ")
  );

  const svgRect = chartSvgEl.getBoundingClientRect();

  points.forEach((p) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
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

// ---------- Fetch ----------
async function fetchHumidity(range = "24h") {
  try {
    const res = await fetch(`/api/humidity?city=Sensor&range=${range}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch humidity");
    }

    // Sensor/UI values should still update even if chart fails
    updateLatestUI(data.latest);
    updateSummaryUI(data);

    try {
      buildChart(
        data.labels || [],
        data.series || [],
        range,
        data.uniqueDays || 0
      );
    } catch (chartError) {
      console.error("Chart build error:", chartError);
      showEmptyChartMessage("Chart could not load right now.");
    }
  } catch (error) {
    console.error("Humidity fetch error:", error);

    // Only show sensor error if the fetch itself failed
    if (humidityStatusEl) humidityStatusEl.textContent = "Something broke";
    if (lastUpdatedEl) lastUpdatedEl.textContent = "Could not load sensor data";

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

// ---------- Hero card tilt ----------
if (heroCard) {
  heroCard.addEventListener("mousemove", (event) => {
    const rect = heroCard.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 7;
    const rotateX = ((centerY - y) / centerY) * 7;

    heroCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  heroCard.addEventListener("mouseleave", () => {
    heroCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  });
}

// ---------- Initial load ----------
fetchHumidity(currentRange);

// ---------- Refresh ----------
setInterval(() => {
  fetchHumidity(currentRange);
}, 60000);
