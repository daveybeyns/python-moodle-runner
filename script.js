const startingCode = `name = "Dave"
print(name)`;

const editor = document.getElementById("editor");
const output = document.getElementById("output");
const feedback = document.getElementById("feedback");
const statusBox = document.getElementById("status");

let pyodide = null;

editor.value = startingCode;

function setFeedback(message, type = "") {
  feedback.textContent = message;
  feedback.className = "feedback";
  if (type) {
    feedback.classList.add(type);
  }
}

async function startPython() {
  try {
    statusBox.textContent = "Loading Python...";
    pyodide = await loadPyodide();
    statusBox.textContent = "Python ready";
    output.textContent = "Ready.";
  } catch (error) {
    statusBox.textContent = "Python failed";
    output.textContent = error;
    setFeedback("Python could not load. Try refreshing the page.", "error");
  }
}

startPython();

async function runCode() {
  if (!pyodide) {
    output.textContent = "Python is still loading. Try again in a moment.";
    return;
  }

  output.textContent = "Running...";
  setFeedback("Running your code...");

  try {
    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = sys.stdout
`);

    await pyodide.runPythonAsync(editor.value);

    const result = pyodide.runPython("sys.stdout.getvalue()");
    output.textContent = result || "Code ran successfully. No output.";
    setFeedback("Code ran successfully.");
  } catch (error) {
    output.textContent = error;
    setFeedback("There is an error in your code.", "error");
  }
}

async function checkAnswer() {
  await runCode();

  const code = editor.value;

  if (code.includes("name") && code.includes("print")) {
    setFeedback("✅ Correct. You created a variable called name and printed it.", "correct");
  } else {
    setFeedback("❌ Not quite. Make sure you create a variable called name and use print().", "error");
  }
}

function resetCode() {
  editor.value = startingCode;
  output.textContent = "Ready.";
  setFeedback("Feedback appears here.");
}

document.getElementById("runBtn").addEventListener("click", runCode);
document.getElementById("checkBtn").addEventListener("click", checkAnswer);
document.getElementById("resetBtn").addEventListener("click", resetCode);
