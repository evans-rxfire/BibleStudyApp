let currentWeek = 1;
const totalWeeks = bibleReadingPlan.length;

function displayWeek(weekNumber) {
  const week = bibleReadingPlan.find(w => Number(w["Week"]) === weekNumber);

  document.getElementById("nav-week-number").textContent = weekNumber;
  document.getElementById("reading-week-number").textContent = weekNumber;

  document.getElementById("OT-reading").textContent =
    `${week["OT Book"]} ${week["OT Ch."]}`;

  document.getElementById("NT-reading").textContent =
    `${week["NT Book"]} ${week["NT Ch."]}`;

  document.getElementById("psalms-reading").textContent =
    `${week["Psalms"]} ${week["Ps Ch."]}`;

  const provBook = week["Proverbs"];
  const provCh = week["Prov Ch."];

  document.getElementById("proverbs-reading").textContent =
    provBook && provCh ? `${provBook} ${provCh}` : "—";
}

document.getElementById("next-btn").addEventListener("click", () => {
  if (currentWeek < totalWeeks) {
    currentWeek++;
    displayWeek(currentWeek);
    updateCheckbox();
  }
});

document.getElementById("previous-btn").addEventListener("click", () => {
  if (currentWeek > 1) {
    currentWeek--;
    displayWeek(currentWeek);
    updateCheckbox();
  }
});

function updateCheckbox() {
  const isChecked = localStorage.getItem(`week-${currentWeek}-complete`) === "true";
  document.getElementById("week-completed").checked = isChecked;
}

document.getElementById("week-completed").addEventListener("change", (e) => {
  localStorage.setItem(`week-${currentWeek}-complete`, e.target.checked);
});

window.addEventListener("DOMContentLoaded", () => {
  displayWeek(currentWeek);
  updateCheckbox();
});

