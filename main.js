const totalWeeks = bibleReadingPlan.length;
let currentWeek = 1;
const weekCompleted = document.getElementById("week-completed");

const nextBtn = document.getElementById("next-btn");
const previousBtn = document.getElementById("previous-btn");
const resetBtn = document.getElementById("reset-btn");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");
const importPreview = document.getElementById("import-preview");
const previewList = document.getElementById("preview-list");
const confirmImportBtn = document.getElementById("confirm-import-btn");
const cancelImportBtn = document.getElementById("cancel-import-btn");

let pendingImportData = null;

function getFirstIncompleteWeek() {
    for (let week = 1; week <=totalWeeks; week++) {
        const completed = localStorage.getItem(`week-${week}-complete`);
        if (completed !== "true") {
            return week;
        }
    }
    return totalWeeks;
}

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

function updateCheckbox() {
  const isChecked = localStorage.getItem(`week-${currentWeek}-complete`) === "true";
  document.getElementById("week-completed").checked = isChecked;
}

function updateProgressBar() {
  const totalWeeks = bibleReadingPlan.length;
  let completedCount = 0;

  for (let week = 1; week <= totalWeeks; week++) {
    if (localStorage.getItem(`week-${week}-complete`) === "true") {
      completedCount++;
    }
  }

  const progressBar = document.getElementById("progress-bar");
  progressBar.max = totalWeeks;
  progressBar.value = completedCount;

  // Optional: update a text label
  const percentComplete = Math.round((completedCount / totalWeeks) * 100);
  const progressLabel = document.getElementById("progress-label");
  if (progressLabel) {
    progressLabel.textContent = `${percentComplete}%`;
  }
}

function updateResetButtonState() {
  let hasProgress = false;

  for (let week = 1; week <= totalWeeks; week++) {
    if (localStorage.getItem(`week-${week}-complete`) === "true") {
      hasProgress = true;
      break;
    }
  }

  document.getElementById("reset-btn").disabled = !hasProgress;
}

function exportProgress() {
  const progress = {};

  for (let week = 1; week <= totalWeeks; week++) {
    const completed = localStorage.getItem(`week-${week}-complete`);
    if (completed) {
      progress[`week-${week}-complete`] = completed;
    }
  }

  const dataStr = JSON.stringify(progress, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "bible-study-progress.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseJSONFile(text) {
  try {
    return JSON.parse(text);
  } catch {
    alert("Failed to import: Invalid JSON file.");
    return null;
  }
}

function validateImportedData(data) {
  if (!data || typeof data !== "object") {
    alert("Invalid data structure.");
    return false;
  }
  for (const key in data) {
    if (
      !key.startsWith("week-") ||
      (data[key] !== "true" && data[key] !== "false")
    ) {
      alert("The file contains unexpected data.");
      return false;
    }
  }
  return true;
}

function renderImportPreview(data) {
  previewList.innerHTML = "";
  const entries = Object.entries(data);
  entries.sort((a, b) => parseInt(a[0].split("-")[1]) - parseInt(b[0].split("-")[1]));
  for (const [key, value] of entries) {
    const weekNumber = key.split("-")[1];
    const li = document.createElement("li");
    li.textContent = `Week ${weekNumber}: ${value === "true" ? "✅ Complete" : "❌ Incomplete"}`;
    previewList.appendChild(li);
  }
  importPreview.style.display = "block";
}


weekCompleted.addEventListener("change", (e) => {
  localStorage.setItem(`week-${currentWeek}-complete`, e.target.checked);
  updateProgressBar();
  updateResetButtonState();
});

nextBtn.addEventListener("click", () => {
  if (currentWeek < totalWeeks) {
    currentWeek++;
    displayWeek(currentWeek);
    updateCheckbox();
  }
});

previousBtn.addEventListener("click", () => {
  if (currentWeek > 1) {
    currentWeek--;
    displayWeek(currentWeek);
    updateCheckbox();
  }
});

resetBtn.addEventListener("click", () => {
    const confirmReset = confirm("Are you sure you want to reset all progress?");

  if (confirmReset) {
    for (let week = 1; week <= totalWeeks; week++) {
      localStorage.removeItem(`week-${week}-complete`);
    }

    currentWeek = 1;
    displayWeek(currentWeek);
    updateCheckbox();
    updateProgressBar();
    updateResetButtonState();
  }
});

exportBtn.addEventListener("click", exportProgress);

importFile.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const importedProgress = parseJSONFile(e.target.result);
    if (!importedProgress) return;

    if (!validateImportedData(importedProgress)) return;

    pendingImportData = importedProgress;
    renderImportPreview(importedProgress);
  };
  reader.readAsText(file);
});

confirmImportBtn.addEventListener("click", () => {
  if (!pendingImportData) return;

  for (const key in pendingImportData) {
    localStorage.setItem(key, pendingImportData[key]);
  }

  currentWeek = getFirstIncompleteWeek();
  displayWeek(currentWeek);
  updateCheckbox();
  updateProgressBar();
  updateResetButtonState();

  importPreview.style.display = "none";
  pendingImportData = null;

  alert("Progress imported successfully!");
});

cancelImportBtn.addEventListener("click", () => {
  importPreview.style.display = "none";
  pendingImportData = null;
  alert("Import canceled.");
});


window.addEventListener("DOMContentLoaded", () => {
  currentWeek = getFirstIncompleteWeek();
    displayWeek(currentWeek);
  updateCheckbox();
  updateProgressBar();
  updateResetButtonState();
});
