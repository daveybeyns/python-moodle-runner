# Python Crash Course – Pyodide Widget

Interactive Python exercises for embedding in Moodle, built with [Pyodide](https://pyodide.org) (Python in the browser — no server needed).

## File structure

```
/
├── index.html            ← Course homepage (list of lessons)
└── lessons/
    ├── lesson1.html      ← Lesson 1: Variables and Input
    └── lesson2.html      ← (add more lessons here)
```

## Setup on GitHub Pages

1. Push this folder to a **public** GitHub repository.
2. Go to **Settings → Pages** and set Source to `main` branch, `/ (root)`.
3. Your course will be live at:
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

## Embedding in Moodle

Add an **HTML block** or **Label** with an iFrame, e.g.:

```html
<iframe
  src="https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/lessons/lesson1.html"
  width="100%"
  height="520"
  style="border:none; border-radius:8px;"
  loading="lazy">
</iframe>
```

Adjust `height` depending on whether students will use the file tools section.

## Adding a new lesson

1. Copy `lessons/lesson1.html` → `lessons/lesson2.html`
2. Edit only the `LESSON` config block near the top of `<script>`:

```js
const LESSON = {
  title:   "Lesson 2: Loops",
  task:    `<strong>Task:</strong> Print the numbers 1 to 5 using a <code>for</code> loop.`,
  starter: `for i in range(1, 6):\n    print(i)`,
  check(outputLines) {
    const out = outputLines.join("\n");
    if (["1","2","3","4","5"].every(n => out.includes(n)))
      return { ok: true,  msg: "✓ All five numbers printed!" };
    return { ok: false, msg: "✗ Not all numbers were printed. Check your range." };
  }
};
```

3. Add a link for the new lesson in `index.html`.

## Features

| Feature | Details |
|---|---|
| `input()` support | An inline prompt appears whenever Python calls `input()` |
| File upload | Students can upload `.txt`/`.csv` files; Python reads them with `open("filename")` |
| File download | Python can write files; students click Download to save them |
| List files | Shows all files Python has created in the session |
| Check answer | Configurable per-lesson validation with coloured feedback |
| Reset | Restores the starter code |
| Tab key | Inserts 4 spaces in the editor |
| Compact UI | Designed to sit within a Moodle page without scrolling |

## Notes

- Pyodide loads from jsDelivr CDN (~10 MB, first visit only; cached after that).
- All Python runs **in the student's browser** — no backend, no data sent anywhere.
- The filesystem (`/work/`) is reset each page load.
