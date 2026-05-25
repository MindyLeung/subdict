import { t, getUILang } from "./i18n.js";

const NOTES_KEY = "subdict_notes";

export function createNotebook({
  noteCount,
  notebookList,
  openNotebookButton,
  lookupTab,
  notebookTab,
  lookupView,
  notebookView,
  exportButton,
  showToast,
  getSource,
}) {
  let notes = loadNotes();
  let activeFilter = "all";
  let filterBar = null;

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

  function buildFilterBar() {
    filterBar = document.createElement("div");
    filterBar.className = "tabs filter-tabs";
    filterBar.hidden = true;
    notebookView.insertBefore(filterBar, notebookList);
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      render();
    });
  }

  function render() {
    const jaCount = notes.filter((n) => n.language === "ja").length;
    const enCount = notes.filter((n) => n.language === "en").length;
    const hasMultipleLangs = jaCount > 0 && enCount > 0;

    noteCount.textContent = `(${notes.length})`;

    if (!hasMultipleLangs) activeFilter = "all";
    filterBar.hidden = !hasMultipleLangs;
    if (hasMultipleLangs) {
      filterBar.innerHTML = `
        <button class="tab${activeFilter === "all" ? " active" : ""}" data-filter="all">All (${notes.length})</button>
        <button class="tab${activeFilter === "ja" ? " active" : ""}" data-filter="ja">日本語 (${jaCount})</button>
        <button class="tab${activeFilter === "en" ? " active" : ""}" data-filter="en">English (${enCount})</button>
      `;
    }

    const filtered = activeFilter === "all" ? notes : notes.filter((n) => n.language === activeFilter);

    if (!filtered.length) {
      notebookList.innerHTML = `<div class="empty-state">${t("notebookEmpty")}</div>`;
      return;
    }

    notebookList.innerHTML = filtered
      .map((note) => {
        const displayWord = note.word.endsWith("_grammar")
          ? note.word.slice(0, -8)
          : note.word;
        return `
          <article class="note-card" data-id="${note.id}">
            <header>
              <h3 class="note-word">${escapeHtml(displayWord)}</h3>
              <button class="delete-note" type="button" title="Delete">×</button>
            </header>
            ${note.reading ? `<p class="note-reading">${escapeHtml(note.reading)}</p>` : ""}
            <p class="note-meaning">${escapeHtml(getNoteMeaning(note))}</p>
          </article>
        `;
      })
      .join("");
  }

  function addNote(note) {
    const isDuplicate = notes.some((n) => n.word === note.word);
    if (isDuplicate) {
      showToast?.(t("alreadySaved"));
      return;
    }
    notes.unshift({
      id: crypto.randomUUID(),
      source: getSource?.() || "",
      savedAt: new Date().toISOString(),
      ...note,
    });
    persist();
    render();
    setTab("notebook");
  }

  function exportNotes() {
    if (!notes.length) {
      showToast?.(t("notebookExportEmpty"));
      return;
    }
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10);
    const timeStr = date.toLocaleString();
    const lines = [
      "Subdict Notebook",
      `Exported: ${timeStr}`,
      `Total: ${notes.length} item${notes.length === 1 ? "" : "s"}`,
      "════════════════════════════════════════",
      "",
      ...notes.flatMap((note, i) => [
        `${i + 1}. ${note.word || ""}`,
        `   Reading: ${note.reading || "—"}`,
        `   Meaning: ${note.meaning || "—"}`,
        `   Source: ${note.source || "—"}`,
        `   Saved: ${note.savedAt ? new Date(note.savedAt).toLocaleString() : "—"}`,
        "",
      ]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subdict_notebook_${dateStr}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportButton?.addEventListener("click", exportNotes);

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

  buildFilterBar();
  render();

  return {
    addNote,
    refresh: render,
    setTab,
    getNotes: () => [...notes],
  };
}

function getNoteMeaning(note) {
  if (getUILang() === "zh") return note.meaning_zh || note.meaning || "";
  return note.meaning_en || note.meaning || "";
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
