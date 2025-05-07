// script.js
// Typing effect
const typedText = document.getElementById("typed-text");
const messages = [
  "We build your imagination into code.",
  "100% working source code & explanations.",
  "Your one-stop solution for all project needs."
];
let msgIndex = 0, charIndex = 0;

function typeMessage() {
  if (charIndex < messages[msgIndex].length) {
    typedText.textContent += messages[msgIndex].charAt(charIndex);
    charIndex++;
    setTimeout(typeMessage, 100);
  } else {
    setTimeout(() => {
      typedText.textContent = "";
      charIndex = 0;
      msgIndex = (msgIndex + 1) % messages.length;
      typeMessage();
    }, 2000);
  }
}

// Project filter
document.getElementById("project-filter").addEventListener("change", function () {
  const value = this.value;
  document.querySelectorAll(".project-card").forEach(card => {
    card.style.display = value === "all" || card.dataset.type === value ? "block" : "none";
  });
});

// Dark mode toggle
const toggleBtn = document.getElementById("dark-mode-toggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  toggleBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Live Clock
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  document.getElementById("live-clock").textContent = ` | Time: ${timeString}`;
}
setInterval(updateClock, 1000);
updateClock();

typeMessage();