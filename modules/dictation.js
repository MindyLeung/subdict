import { t } from "./i18n.js";

const SESSION_KEY = "subly_active_session";
const LEGACY_RECORDS_KEY = "subly_dictation_records";
const DEFAULT_SESSION = {
  id: "subly_default_session",
  name: "未命名视频",
};

export function createDictation({
  form,
  input,
  recordsList,
  recordCount,
  exportButton,
  getCurrentTime,
  formatTime,
  getVideoName,
  onSelection,
}) {
  let session = loadActiveSession();
  let records = loadRecords(session.id);

  function storageKey(sessionId) {
    return `subly_dictation_records:${sessionId}`;
  }

  function loadActiveSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null") || DEFAULT_SESSION;
    } catch {
      return DEFAULT_SESSION;
    }
  }

  function saveActiveSession() {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function loadRecords(sessionId) {
    try {
      const sessionRecords = localStorage.getItem(storageKey(sessionId));
      if (sessionRecords) return sortBySeconds(JSON.parse(sessionRecords));

      const legacyRecords = localStorage.getItem(LEGACY_RECORDS_KEY);
      if (sessionId === DEFAULT_SESSION.id && legacyRecords) return sortBySeconds(JSON.parse(legacyRecords));
      return [];
    } catch {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(storageKey(session.id), JSON.stringify(records));
  }

  function render() {
    recordCount.textContent = t("recordCount", records.length);

    if (!records.length) {
      recordsList.innerHTML = `<div class="empty-state">${t("dictationEmpty")}</div>`;
      return;
    }

    recordsList.innerHTML = records
      .map(
        (record) => `
          <article class="record" data-id="${record.id}">
            <time>${record.timestamp}</time>
            <p contenteditable="true" spellcheck="false">${escapeHtml(record.text)}</p>
            <button class="delete-record" type="button" title="删除">×</button>
          </article>
        `,
      )
      .join("");
  }

  function addRecord(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const t = getCurrentTime();
    records.push({
      id: crypto.randomUUID(),
      text: trimmed,
      seconds: t,
      timestamp: formatTime(t),
      videoId: session.id,
      videoName: session.name,
      createdAt: Date.now(),
    });
    records = sortBySeconds(records);
    persist();
    render();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    addRecord(input.value);
    input.value = "";
  });

  let compositionJustEnded = false;

  input.addEventListener("compositionend", () => {
    compositionJustEnded = true;
    // Reset after current event loop so the Enter that confirmed IME is skipped
    // but the next real Enter is handled normally.
    setTimeout(() => { compositionJustEnded = false; }, 0);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.isComposing || compositionJustEnded) return;
    event.preventDefault();
    event.stopPropagation();
    addRecord(input.value);
    input.value = "";
  });

  recordsList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-record");
    if (!button) return;
    const recordEl = button.closest(".record");
    records = records.filter((record) => record.id !== recordEl.dataset.id);
    persist();
    render();
  });

  recordsList.addEventListener("focusout", (event) => {
    const textEl = event.target.closest(".record p");
    if (!textEl) return;
    const recordEl = textEl.closest(".record");
    const record = records.find((item) => item.id === recordEl.dataset.id);
    if (!record) return;
    record.text = textEl.textContent.trim();
    record.updatedAt = Date.now();
    records = sortBySeconds(records);
    persist();
    render();
  });

  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length <= 120) {
      onSelection(selection);
    }
  });

  exportButton.addEventListener("click", () => {
    const lines = records.map((record) => `[${record.timestamp}] ${record.text}`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const videoName = getVideoName().replace(/\.[^.]+$/, "") || "Subly";
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${videoName}_${t("exportSuffix")}_${date}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  });

  render();

  return {
    addRecord,
    refresh: render,
    setSession(nextSession) {
      session = nextSession || DEFAULT_SESSION;
      saveActiveSession();
      records = loadRecords(session.id);
      render();
    },
    getSession: () => ({ ...session }),
    getRecords: () => [...records],
  };
}

function sortBySeconds(list) {
  return list.slice().sort((a, b) => (a.seconds ?? 0) - (b.seconds ?? 0));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
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
