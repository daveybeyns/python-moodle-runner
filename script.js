let pyodideReadyPromise = loadPyodide();
let startingCode = `name = "Dave"
print(name)`;

const editor = document.getElementById("editor");
const output = document.getElementById("output");
const feedback = document.getElementById("feedback");
const statusBox = document.getElementById("status");

editor.value = startingCode;

async function initPyodide() {
  statusBox.textContent = "Loading Python...";
  window.pyodide = await pyodideReadyPromise;
  statusBox.textContent = "Python ready";
  output.textContent = "Ready.";
}

initPyodide();

async function runCode() {
  output.textContent = "Running...";
  feedback.textContent = "Running your code...";

  try {
    const pyodide = await pyodideReadyPromise;

    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = sys.stdout
`);

    await pyodide.runPythonAsync(editor.value);

    const result = pyodide.runPython("sys.stdout.getvalue()");
    output.textContent = result || "Code ran successfully. No output.";
    feedback.textContent = "Code ran successfully.";
  } catch (err) {
    output.textContent = err;
    feedback.textContent = "There is an error in your code.";
  }
}

async function checkAnswer() {
  await runCode();

  const code = editor.value;

  if (code.includes("name") && code.includes("print")) {
    feedback.textContent = "✅ Correct. You created a variable called name and printed it.";
  } else {
    feedback.textContent = "❌ Not quite. Make sure you create a variable called name and use print().";
  }
}

function resetCode() {
  editor.value = startingCode;
  output.textContent = "Ready.";
  feedback.textContent = "Feedback appears here.";
}

document.getElementById("runBtn").addEventListener("click", runCode);
document.getElementById("checkBtn").addEventListener("click", checkAnswer);
document.getElementById("resetBtn").addEventListener("click", resetCode);
