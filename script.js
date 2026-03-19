// ---------------------------
// HUMIDITY THEME SETUP
// ---------------------------
const humidity = 47;

const humidityValue = document.getElementById("humidityValue");
const humiditySentence = document.getElementById("humiditySentence");
const orbValue = document.getElementById("orbValue");
const humidityStatus = document.getElementById("humidityStatus");
const recommendationTitle = document.getElementById("recommendationTitle");
const recommendationText = document.getElementById("recommendationText");
const root = document.documentElement;

function applyHumidityTheme(value) {
  humidityValue.textContent = value;
  humiditySentence.textContent = `${value}% humidity.`;
  orbValue.textContent = `${value}%`;

  if (value <= 40) {
    root.style.setProperty("--humidity-accent", "#5cc7d8");
    root.style.setProperty("--mood-accent", "#22a352");
    root.style.setProperty("--orb-accent", "#5cc7d8");
    root.style.setProperty("--status-bg", "rgba(34, 163, 82, 0.14)");
    root.style.setProperty("--status-text", "#17733a");

    humidityStatus.textContent = "Very comfortable";
    recommendationTitle.textContent = "Honestly, your room is behaving itself.";
    recommendationText.textContent =
      "These conditions are pretty friendly for most casual printing and general filament storage. Still, sealed storage is never a bad habit.";
  } else if (value <= 55) {
    root.style.setProperty("--humidity-accent", "#5cc7d8");
    root.style.setProperty("--mood-accent", "#22a352");
    root.style.setProperty("--orb-accent", "#5cc7d8");
    root.style.setProperty("--status-bg", "rgba(34, 163, 82, 0.14)");
    root.style.setProperty("--status-text", "#17733a");

    humidityStatus.textContent = "Pretty reasonable";
    recommendationTitle.textContent = "Print if you want, just don’t get too comfortable.";
    recommendationText.textContent =
      "The room is workable right now, but if readings keep trending upward, storage and drying start becoming more important.";
  } else if (value <= 65) {
    root.style.setProperty("--humidity-accent", "#d89b3e");
    root.style.setProperty("--mood-accent", "#d89b3e");
    root.style.setProperty("--orb-accent", "#d89b3e");
    root.style.setProperty("--status-bg", "rgba(216, 155, 62, 0.18)");
    root.style.setProperty("--status-text", "#9f6213");

    humidityStatus.textContent = "Getting a bit damp";
    recommendationTitle.textContent = "Your filament is starting to side-eye you.";
    recommendationText.textContent =
      "You can still print, but more moisture-sensitive materials may benefit from drying, and exposed spools should probably not stay out for too long.";
  } else {
    root.style.setProperty("--humidity-accent", "#d96b6b");
    root.style.setProperty("--mood-accent", "#d96b6b");
    root.style.setProperty("--orb-accent", "#d96b6b");
    root.style.setProperty("--status-bg", "rgba(217, 107, 107, 0.18)");
    root.style.setProperty("--status-text", "#9c3535");

    humidityStatus.textContent = "Not loving this";
    recommendationTitle.textContent = "Yeah… this is dry-box territory.";
    recommendationText.textContent =
      "At this point, long exposure is not doing your filament any favors. Drying and sealed storage are strongly recommended, especially for PETG, TPU, and nylon.";
  }
}

applyHumidityTheme(humidity);

// ---------------------------
// BACKGROUND REVEALS
// ---------------------------
const revealElements = document.querySelectorAll(".reveal-bg");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealElements.forEach((el) => revealObserver.observe(el));

// ---------------------------
// PARALLAX
// ---------------------------
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