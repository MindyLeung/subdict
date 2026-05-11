import { t } from "./i18n.js";

const NOTES_KEY = "subly_notes";

export function createNotebook({
  noteCount,
  notebookList,
  openNotebookButton,
  lookupTab,
  notebookTab,
  lookupView,
  notebookView,
  getSource,
}) {
  let notes = loadNotes();

  function loadNotes() {
    try {
      return JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }

  function setTab(name) {
    const isNotebook = name === "notebook";
    notebookTab.classList.toggle("active", isNotebook);
    lookupTab.classList.toggle("active", !isNotebook);
    notebookView.classList.toggle("active", isNotebook);
    lookupView.classList.toggle("active", !isNotebook);
  }

  function render() {
    noteCount.textContent = `(${notes.length})`;
    if (!notes.length) {
      notebookList.innerHTML = `<div class="empty-state">${t("notebookEmpty")}</div>`;
      return;
    }

    notebookList.innerHTML = notes
      .map(
        (note) => `
          <article class="note-card" data-id="${note.id}">
            <header>
              <h3>${escapeHtml(note.word)}</h3>
              <button class="delete-note" type="button">删除</button>
            </header>
            <p>${escapeHtml(note.reading || "")}</p>
            <p>${escapeHtml(note.meaning || "")}</p>
            ${note.source ? `<p class="note-source">${escapeHtml(note.source)}</p>` : ""}
            <span class="tag">${note.language === "en" ? "English" : "日本語"}</span>
          </article>
        `,
      )
      .join("");
  }

  function addNote(note) {
    notes.unshift({
      id: crypto.randomUUID(),
      source: getSource?.() || "",
      ...note,
    });
    persist();
    render();
    setTab("notebook");
  }

  notebookList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-note");
    if (!button) return;
    const noteEl = button.closest(".note-card");
    notes = notes.filter((note) => note.id !== noteEl.dataset.id);
    persist();
    render();
  });

  lookupTab.addEventListener("click", () => setTab("lookup"));
  notebookTab.addEventListener("click", () => setTab("notebook"));
  openNotebookButton.addEventListener("click", () => setTab("notebook"));

  render();

  return {
    addNote,
    refresh: render,
    setTab,
    getNotes: () => [...notes],
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });
}
