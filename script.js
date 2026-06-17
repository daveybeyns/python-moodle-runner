const startingCode = `name = input("Enter your name: ")
print("Hello " + name)`;

const editor = document.getElementById("editor");
const output = document.getElementById("output");
const feedback = document.getElementById("feedback");
const statusBox = document.getElementById("status");
const fileUpload = document.getElementById("fileUpload");
const downloadName = document.getElementById("downloadName");

let pyodide = null;
const pythonWorkingDirectory = "/home/pyodide";

editor.value = startingCode;

function appendOutput(text) {
  if (output.textContent === "Ready." || output.textContent === "Running...") {
    output.textContent = "";
  }
  output.textContent += text;
}

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

    pyodide.runPython(`
import os
os.chdir("${pythonWorkingDirectory}")
`);

    pyodide.setStdout({
      batched: (text) => {
        appendOutput(text + "\n");
      }
    });

    pyodide.setStderr({
      batched: (text) => {
        appendOutput(text + "\n");
      }
    });

    pyodide.setStdin({
      stdin: () => {
        const value = window.prompt("Python input:");
        const finalValue = value === null ? "" : value;
        appendOutput(finalValue + "\n");
        return finalValue;
      }
    });

    statusBox.textContent = "Python ready";
    output.textContent = "Ready.";
  } catch (error) {
    statusBox.textContent = "Python failed";
    output.textContent = String(error);
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
    await pyodide.runPythonAsync(editor.value);

    if (output.textContent.trim() === "" || output.textContent === "Running...") {
      output.textContent = "Code ran successfully. No output.";
    }

    setFeedback("Code ran successfully.");
  } catch (error) {
    output.textContent = String(error);
    setFeedback("There is an error in your code.", "error");
  }
}

async function checkAnswer() {
  await runCode();

  const code = editor.value;

  if (code.includes("input") && code.includes("print")) {
    setFeedback("✅ Correct. You used input() and printed a result.", "correct");
  } else {
    setFeedback("❌ Not quite. Use input() to get a value, then use print().", "error");
  }
}

function resetCode() {
  editor.value = startingCode;
  output.textContent = "Ready.";
  setFeedback("Feedback appears here.");
}

async function uploadTextFile(event) {
  if (!pyodide) {
    setFeedback("Python is still loading. Try again in a moment.", "error");
    return;
  }

  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    pyodide.FS.writeFile(`${pythonWorkingDirectory}/${safeName}`, text, { encoding: "utf8" });
    setFeedback(`Uploaded ${safeName}. Python can read it using open("${safeName}").`, "correct");
  } catch (error) {
    setFeedback("Could not upload the file into Python.", "error");
    output.textContent = String(error);
  }
}

function downloadPythonFile() {
  if (!pyodide) {
    setFeedback("Python is still loading. Try again in a moment.", "error");
    return;
  }

  const name = downloadName.value.trim();
  if (!name) {
    setFeedback("Type a filename to download, for example output.txt.", "error");
    return;
  }

  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${pythonWorkingDirectory}/${safeName}`;

  try {
    const content = pyodide.FS.readFile(path, { encoding: "utf8" });
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    setFeedback(`Downloaded ${safeName}.`, "correct");
  } catch (error) {
    setFeedback(`Could not find ${safeName}. Make sure Python has created it first.`, "error");
  }
}

function listPythonFiles() {
  if (!pyodide) {
    setFeedback("Python is still loading. Try again in a moment.", "error");
    return;
  }

  try {
    const files = pyodide.FS.readdir(pythonWorkingDirectory)
      .filter(name => ![".", ".."].includes(name));

    output.textContent = files.length
      ? "Files available to Python:\n" + files.join("\n")
      : "No files found yet.";

    setFeedback("Listed files currently available to Python.");
  } catch (error) {
    output.textContent = String(error);
    setFeedback("Could not list files.", "error");
  }
}

document.getElementById("runBtn").addEventListener("click", runCode);
document.getElementById("checkBtn").addEventListener("click", checkAnswer);
document.getElementById("resetBtn").addEventListener("click", resetCode);
document.getElementById("downloadBtn").addEventListener("click", downloadPythonFile);
document.getElementById("listBtn").addEventListener("click", listPythonFiles);
fileUpload.addEventListener("change", uploadTextFile);
