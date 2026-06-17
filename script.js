const startingCode = `name = "Dave"
print(name)`;

const editor = document.getElementById("editor");
const output = document.getElementById("output");
const feedback = document.getElementById("feedback");
const statusBox = document.getElementById("status");
const runBtn = document.getElementById("runBtn");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");

let pyodide = null;
let isReady = false;

function setFeedback(message, type = "") {
  feedback.textContent = message;
  feedback.className = "feedback" + (type ? ` ${type}` : "");
}

function setButtons(enabled) {
  runBtn.disabled = !enabled;
  checkBtn.disabled = !enabled;
  resetBtn.disabled = false;
}

async function startPython() {
  try {
    setButtons(false);
    statusBox.textContent = "Loading Python...";
    statusBox.className = "status-pill loading";
    output.textContent = "Loading Python. This can take a few seconds the first time...";

    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
    });

    isReady = true;
    statusBox.textContent = "Python ready";
    statusBox.className = "status-pill";
    output.textContent = "Ready.";
    setFeedback("Python is ready. Try running the code.");
    setButtons(true);
  } catch (err) {
    statusBox.textContent = "Python failed";
    statusBox.className = "status-pill error";
    output.textContent = String(err);
    setFeedback("Python failed to load. Check the internet connection or refresh the page.", "error");
    setButtons(false);
  }
}

async function runCode() {
  if (!isReady || !pyodide) {
    setFeedback("Python is still loading. Please wait a few seconds.", "error");
    return;
  }

  setButtons(false);
  output.textContent = "Running...";
  setFeedback("Running your code...");

  try {
    // Run the user's code inside a small wrapper so stdout and errors are captured cleanly.
    pyodide.globals.set("user_code", editor.value);

    const result = await pyodide.runPythonAsync(`
import sys, traceback
from io import StringIO

_stdout = StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = _stdout
sys.stderr = _stdout

try:
    exec(user_code, globals())
except Exception:
    traceback.print_exc()
finally:
    sys.stdout = _old_stdout
    sys.stderr = _old_stderr

_stdout.getvalue()
`);

    output.textContent = result.trim() || "Code ran successfully. No output was printed.";

    if (result.includes("Traceback")) {
      setFeedback("There is an error in your code. Read the output message to find the problem.", "error");
    } else {
      setFeedback("Code ran successfully.", "success");
    }
  } catch (err) {
    output.textContent = String(err);
    setFeedback("Something went wrong while running the code.", "error");
  } finally {
    setButtons(true);
  }
}

async function checkAnswer() {
  if (!isReady || !pyodide) {
    setFeedback("Python is still loading. Please wait a few seconds.", "error");
    return;
  }

  await runCode();

  const code = editor.value;
  const hasNameVariable = /(^|\n)\s*name\s*=/.test(code);
  const hasPrint = /print\s*\(/.test(code);

  if (hasNameVariable && hasPrint) {
    setFeedback("✅ Correct. You created a variable called name and used print().", "success");
  } else {
    setFeedback("❌ Not quite. Create a variable called name and then use print(name).", "error");
  }
}

function resetCode() {
  editor.value = startingCode;
  output.textContent = isReady ? "Ready." : "Python is loading...";
  setFeedback(isReady ? "Python is ready. Try running the code." : "Wait for Python to load, then run your code.");
}

editor.value = startingCode;
setButtons(false);
runBtn.addEventListener("click", runCode);
checkBtn.addEventListener("click", checkAnswer);
resetBtn.addEventListener("click", resetCode);
startPython();
