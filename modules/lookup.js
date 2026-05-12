import { t } from "./i18n.js";

const READING_HINT = { ja: "readingHintJa", en: "readingHintEn" };

export function createLookup({
  languageSelect,
  input,
  apiStatus,
  selectedText,
  lookupWord,
  lookupReading,
  lookupTag,
  lookupMeaning,
  saveButton,
  onSave,
}) {
  let current = {
    word: selectedText.textContent,
    reading: lookupReading.textContent,
    tag: lookupTag.textContent,
    meaning: lookupMeaning.textContent,
  };
  let requestId = 0;

  function applyLanguage(language) {
    input.placeholder = t("dictationPlaceholder");
    if (!current.word) {
      lookupTag.textContent = t("lookupTagDefault");
      lookupReading.textContent = t(READING_HINT[language] ?? "readingHintEn");
    }
    localStorage.setItem("subdict_language", language);
  }

  function renderStatus(message, mode = "idle") {
    apiStatus.textContent = message;
    apiStatus.classList.toggle("is-loading", mode === "loading");
    apiStatus.classList.toggle("is-error", mode === "error");
  }

  function renderResult(result) {
    current = normalizeResult(result);
    selectedText.textContent = current.word;
    lookupWord.textContent = current.word;
    lookupReading.textContent = current.reading;
    lookupTag.textContent = current.tag;
    lookupMeaning.textContent = current.meaning;
  }

  async function lookup(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const language = languageSelect.value;
    const activeRequest = ++requestId;
    renderStatus(t("lookupStatusLoading"), "loading");

    try {
      const result = await fetchWorkerLookup(trimmed, language);
      if (activeRequest !== requestId) return;
      renderResult(result);
      renderStatus(t("lookupStatusDone"));
    } catch (error) {
      if (activeRequest !== requestId) return;
      renderStatus(error.message || t("lookupError", "?"), "error");
      renderResult({ word: trimmed, reading: "", tag: "", meaning: "" });
    }
  }

  function refresh() {
    applyLanguage(languageSelect.value);
    renderStatus(t("lookupStatusIdle"));
  }

  languageSelect.value = localStorage.getItem("subdict_language") || "ja";
  applyLanguage(languageSelect.value);

  languageSelect.addEventListener("change", () => {
    applyLanguage(languageSelect.value);
  });

  saveButton.addEventListener("click", () => {
    onSave({
      ...current,
      language: languageSelect.value,
      createdAt: Date.now(),
    });
  });

  renderStatus(t("lookupStatusIdle"));

  return {
    lookup,
    refresh,
    getCurrent: () => ({ ...current }),
  };
}

const WORKER_URL = "https://steep-fog-5094.mindyl123456.workers.dev";

async function fetchWorkerLookup(word, lang) {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, lang }),
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error(t("lookupNotFound", word));
    throw new Error(t("lookupError", response.status));
  }

  const data = await response.json();
  return normalizeResult(data);
}

function normalizeResult(result) {
  return {
    word: String(result.word || ""),
    reading: String(result.reading || ""),
    tag: String(result.tag || ""),
    meaning: String(result.meaning || ""),
  };
}
