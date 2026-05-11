const LOOKUP_COPY = {
  ja: {
    placeholder: "聞こえた内容を入力して Enter で記録...",
    tag: "语法 / 表达",
    reading: "读音会显示假名",
    grammarTitle: "日语语法分析",
    grammarMeaning: "会重点分析助词、接续、敬体/常体、终助词和语气。",
  },
  en: {
    placeholder: "Type what you heard, then press Enter...",
    tag: "phrase",
    reading: "Pronunciation appears as IPA",
    grammarTitle: "英语语法分析",
    grammarMeaning: "会重点分析时态、介词搭配、固定表达、语气和上下文用法。",
  },
};

export function createLookup({
  languageSelect,
  input,
  selectedText,
  lookupWord,
  lookupReading,
  lookupTag,
  lookupMeaning,
  grammarTitle,
  grammarMeaning,
  saveButton,
  onSave,
}) {
  let current = {
    word: selectedText.textContent,
    reading: lookupReading.textContent,
    tag: lookupTag.textContent,
    meaning: lookupMeaning.textContent,
    grammarTitle: grammarTitle.textContent,
    grammarMeaning: grammarMeaning.textContent,
  };

  function applyLanguage(language) {
    const copy = LOOKUP_COPY[language];
    input.placeholder = copy.placeholder;
    lookupTag.textContent = copy.tag;
    if (!current.word) {
      lookupReading.textContent = copy.reading;
      grammarTitle.textContent = copy.grammarTitle;
      grammarMeaning.textContent = copy.grammarMeaning;
    }
    localStorage.setItem("subly_language", language);
  }

  function lookup(text) {
    const language = languageSelect.value;
    const copy = LOOKUP_COPY[language];
    current = buildLocalResult(text, language, copy);

    selectedText.textContent = current.word;
    lookupWord.textContent = current.word;
    lookupReading.textContent = current.reading;
    lookupTag.textContent = current.tag;
    lookupMeaning.textContent = current.meaning;
    grammarTitle.textContent = current.grammarTitle;
    grammarMeaning.textContent = current.grammarMeaning;
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

  return {
    lookup,
    getCurrent: () => ({ ...current }),
  };
}

function buildLocalResult(text, language, copy) {
  const trimmed = text.trim();
  const isSentence = /[。.!?！？\s]/.test(trimmed) || trimmed.length > 12;

  if (language === "en") {
    return {
      word: trimmed,
      reading: copy.reading,
      tag: isSentence ? "sentence" : "word",
      meaning: "这里会显示 Groq 返回的中文释义。当前版本先保留本地预览，方便把界面和笔记流程跑通。",
      grammarTitle: "语法 / 用法",
      grammarMeaning: "接入 API 后会根据所选文本分析时态、搭配、固定表达和语气。",
    };
  }

  return {
    word: trimmed,
    reading: copy.reading,
    tag: isSentence ? "句子" : "词汇",
    meaning: "这里会显示 Groq 返回的中文释义。当前版本先保留本地预览，方便把界面和笔记流程跑通。",
    grammarTitle: "语法 / 用法",
    grammarMeaning: "接入 API 后会根据所选文本分析助词、接续、敬语、终助词和语气。",
  };
}
