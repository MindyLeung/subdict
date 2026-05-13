import { t, getUILang } from "./i18n.js";

const READING_HINT = { ja: "readingHintJa", en: "readingHintEn" };

export function createLookup({
  languageSelect,
  input,
  apiStatus,
  lookupCard,
  selectedText,
  lookupWord,
  lookupReading,
  lookupTag,
  lookupMeaning,
  grammarCard,
  grammarTitle,
  grammarMeaning,
  saveButton,
  saveGrammarButton,
  onSave,
}) {
  let current = {
    word: selectedText.textContent,
    reading: lookupReading.textContent,
    tag: lookupTag.textContent,
    meaning: lookupMeaning.textContent,
    meaning_en: "",
    meaning_zh: "",
    grammar: null,
  };
  let currentLookupWord = "";
  let abortController = null;
  let isLookingUp = false;

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

  function getDisplayMeaning() {
    return current.meaning_en || current.meaning || current.meaning_zh;
  }

  function clearPanel() {
    lookupCard.hidden = true;
    grammarCard.hidden = true;
    selectedText.closest(".selected-card").hidden = true;
    renderStatus(t("lookupStatusIdle"));
    window._subdict_selected_word = null;
    currentLookupWord = "";
  }

  function renderResult(result, selectedWord) {
    current = normalizeResult(result);
    // Card title always shows what the user selected, not the API's normalized form
    lookupWord.textContent = selectedWord;
    lookupReading.textContent = current.reading;
    lookupTag.textContent = current.tag;
    lookupMeaning.textContent = getDisplayMeaning();
    if (current.grammar) {
      grammarTitle.textContent = t("grammarLabel");
      grammarMeaning.textContent = current.grammar;
      grammarCard.hidden = false;
    } else {
      grammarCard.hidden = true;
    }
  }

  async function lookup(text) {
    const word = text.trim();
    if (!word) return;
    if (isLookingUp) return;
    isLookingUp = true;

    abortController?.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    currentLookupWord = word;
    selectedText.textContent = word;
    selectedText.closest(".selected-card").hidden = false;
    lookupCard.hidden = false;
    grammarCard.hidden = true;
    renderStatus(t("lookupStatusLoading", word), "loading");

    const language = languageSelect.value;

    try {
      const result = await fetchWorkerLookup(word, language, signal);
      renderResult(result, currentLookupWord);
      renderStatus(t("lookupStatusDone"));
    } catch (error) {
      if (error.name === "AbortError") {
        isLookingUp = false;
        return;
      }
      renderStatus(error.message || t("lookupError", "?"), "error");
      renderResult({ word, reading: "", tag: "", meaning: "" }, currentLookupWord);
    } finally {
      isLookingUp = false;
    }
  }

  function refresh() {
    applyLanguage(languageSelect.value);
    renderStatus(t("lookupStatusIdle"));
    if (currentLookupWord) {
      lookupWord.textContent = currentLookupWord;
      lookupMeaning.textContent = getDisplayMeaning();
      if (!grammarCard.hidden) grammarTitle.textContent = t("grammarLabel");
    }
  }

  languageSelect.value = localStorage.getItem("subdict_language") || "ja";
  applyLanguage(languageSelect.value);

  languageSelect.addEventListener("change", () => {
    applyLanguage(languageSelect.value);
  });

  saveButton.addEventListener("click", () => {
    const selectedWord = window._subdict_selected_word || currentLookupWord;
    onSave({
      ...current,
      word: selectedWord,
      meaning: current.meaning_en || current.meaning,
      language: languageSelect.value,
      uiLang: getUILang(),
      createdAt: Date.now(),
    });
  });

  saveGrammarButton.addEventListener("click", () => {
    if (!current.grammar) return;
    const selectedWord = window._subdict_selected_word || currentLookupWord;
    onSave({
      word: `${selectedWord}_grammar`,
      reading: "",
      meaning: current.grammar,
      meaning_en: current.grammar,
      meaning_zh: current.grammar,
      tag: t("grammarLabel"),
      language: languageSelect.value,
      uiLang: getUILang(),
      createdAt: Date.now(),
    });
  });

  renderStatus(t("lookupStatusIdle"));

  return {
    lookup,
    refresh,
    clearPanel,
    getCurrent: () => ({ ...current }),
  };
}

const WORKER_URL = "https://steep-fog-5094.mindyl123456.workers.dev";

async function fetchWorkerLookup(word, lang, signal) {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, lang }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error(t("lookupNotFound", word));
    throw new Error(t("lookupError", response.status));
  }

  const data = await response.json();
  return normalizeResult(data);
}

function normalizeResult(result) {
  const meaning = String(result.meaning || result.meaning_en || "");
  return {
    word: String(result.word || ""),
    reading: String(result.reading || ""),
    tag: String(result.pos || result.tag || ""),
    meaning,
    meaning_en: String(result.meaning_en || meaning),
    meaning_zh: String(result.meaning_zh || meaning),
    grammar: result.grammar || null,
  };
}
