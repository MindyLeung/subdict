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
    localStorage.setItem("subly_language", language);
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
      const result =
        language === "en"
          ? await fetchEnglishLookup(trimmed)
          : await fetchJapaneseLookup(trimmed);
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

  languageSelect.value = localStorage.getItem("subly_language") || "ja";
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

async function fetchEnglishLookup(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) throw new Error(t("lookupNotFound", word));
    throw new Error(t("lookupError", response.status));
  }

  const data = await response.json();
  const entry = data[0];
  const meaning = entry.meanings?.[0];
  const definition = meaning?.definitions?.[0];

  let meaningText = definition?.definition || "";
  if (definition?.example) {
    meaningText += `\nE.g.: ${definition.example}`;
  }

  return {
    word: entry.word,
    reading:
      entry.phonetic ||
      entry.phonetics?.find((p) => p.text)?.text ||
      "",
    tag: meaning?.partOfSpeech || "word",
    meaning: meaningText,
  };
}

async function fetchJapaneseLookup(word) {
  const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error(t("lookupError", response.status));

  const data = await response.json();
  const entry = data?.data?.[0];

  if (!entry) throw new Error(t("lookupNotFound", word));

  const japanese = entry.japanese?.[0];
  const sense = entry.senses?.[0];

  return {
    word: japanese?.word || word,
    reading: japanese?.reading || "",
    tag: sense?.parts_of_speech?.[0] || "",
    meaning: sense?.english_definitions?.join("；") || "",
  };
}

function normalizeResult(result) {
  return {
    word: String(result.word || ""),
    reading: String(result.reading || ""),
    tag: String(result.tag || ""),
    meaning: String(result.meaning || ""),
  };
}
