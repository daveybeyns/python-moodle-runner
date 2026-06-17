const starterCode = `name = "Dave"
print(name)`;

const codeBox = document.getElementById("code");
const outputBox = document.getElementById("output");
const feedbackBox = document.getElementById("feedback");
const statusBadge = document.getElementById("status");
const runBtn = document.getElementById("runBtn");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");

let pyodide;

function setFeedback(message, type = "muted") {
  feedbackBox.textContent = message;
  feedbackBox.className = `feedback ${type}`;
}

function setOutput(message) {
  outputBox.textContent = message || "";
}

async function startPython() {
  try {
    pyodide = await loadPyodide();
    statusBadge.textContent = "Python ready";
    statusBadge.className = "badge ready";
    runBtn.disabled = false;
    checkBtn.disabled = false;
    setOutput("Ready. Type some Python and click Run code.");
  } catch (error) {
    statusBadge.textContent = "Python failed to load";
    statusBadge.className = "badge error";
    setOutput(error.message);
    setFeedback("Pyodide could not load. This may be blocked by the network or browser settings.", "bad");
  }
}

async function runStudentCode() {
  setOutput("Running...");
  setFeedback("Running your code...", "muted");

  const studentCode = codeBox.value;

  const wrappedCode = `
import sys, io, traceback
_stdout = io.StringIO()
_stderr = io.StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = _stdout
sys.stderr = _stderr
try:
${studentCode.split("\n").map(line => "    " + line).join("\n")}
except Exception:
    traceback.print_exc()
finally:
    sys.stdout = _old_stdout
    sys.stderr = _old_stderr
result = _stdout.getvalue() + _stderr.getvalue()
`;

  try {
    await pyodide.runPythonAsync(wrappedCode);
    const result = pyodide.globals.get("result");
    setOutput(result || "Code ran successfully with no output.");
    setFeedback("Code ran. Now click Check answer to test the task.", "muted");
  } catch (error) {
    setOutput(error.message);
    setFeedback("There is an error in your code. Read the output and try again.", "bad");
  }
}

async function checkAnswer() {
  setOutput("Checking...");
  setFeedback("Checking your answer...", "muted");

  const studentCode = codeBox.value;

  // This is the teacher-controlled test for this exercise.
  // Change this section for each task.
  const testCode = `
import sys, io, traceback
_test_output = io.StringIO()
_old_stdout = sys.stdout
sys.stdout = _test_output
check_message = ""
check_passed = False
try:
${studentCode.split("\n").map(line => "    " + line).join("\n")}
    sys.stdout = _old_stdout

    if "name" not in globals():
        check_message = "You need to create a variable called name."
    elif not isinstance(name, str):
        check_message = "The variable name should contain text, such as your name in quote marks."
    elif str(name) not in _test_output.getvalue():
        check_message = "You created name, but you also need to print it."
    else:
        check_passed = True
        check_message = "Correct — you created a variable called name and printed it."
except Exception:
    sys.stdout = _old_stdout
    check_message = traceback.format_exc()
`;

  try {
    await pyodide.runPythonAsync(testCode);
    const passed = pyodide.globals.get("check_passed");
    const message = pyodide.globals.get("check_message");
    setOutput(message);
    setFeedback(message, passed ? "ok" : "bad");
  } catch (error) {
    setOutput(error.message);
    setFeedback("The checker found an error. Try fixing your code and check again.", "bad");
  }
}

runBtn.addEventListener("click", runStudentCode);
checkBtn.addEventListener("click", checkAnswer);
resetBtn.addEventListener("click", () => {
  codeBox.value = starterCode;
  setOutput("Code reset.");
  setFeedback("Run or check your code to see feedback here.", "muted");
});

startPython();
