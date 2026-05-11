const UI_LANG_KEY = "subly_ui_lang";

const PACKS = {
  en: {
    // topbar
    uiLangToggleTitle: "Interface language",
    studyLangAriaLabel: "Study language",
    themeToggleTitle: "Toggle theme",
    themeDarkLabel: "Dark Teal",
    themeLightLabel: "Mint Light",
    exportBtn: "Export",
    notebookBtnLabel: "Notebook",
    importBtn: "Import Video",

    // video area
    emptyVideoTitle: "Video Area",
    emptyVideoHint: "Import a video to start dictation",
    maskLabel: "Subtitle Mask",
    maskTip: "↕ Drag to adjust mask height",
    backBtnTitle: "Rewind 5s",
    playBtnTitle: "Play / Pause",
    forwardBtnTitle: "Forward 5s",
    maskOn: "Mask On",
    maskOff: "Mask Off",
    videoFormatError: "This browser may not support this video format.",
    videoFormatHint: "Try converting to MP4, or use a different browser.",

    // dictation
    dictationTitle: "Dictation",
    dictationHint: "Select text to look up",
    dictationPlaceholder: "Type what you heard, then press Enter…",
    dictationEmpty: "No records yet. Type the first line to begin.",
    recordCount: (n) => `${n} record${n === 1 ? "" : "s"}`,
    exportSuffix: "dictation",

    // lookup / side panel
    lookupTabLabel: "Lookup",
    notebookTabLabel: "Notebook",
    selectedLabel: "Selected:",
    lookupTagDefault: "word",
    readingHintJa: "Reading shown as kana",
    readingHintEn: "Pronunciation shown as IPA",
    lookupStatusIdle: "Select text in your dictation to look up.",
    lookupStatusLoading: "Looking up…",
    lookupStatusDone: "Done.",
    lookupNotFound: (word) => `No entry found for "${word}".`,
    lookupError: (code) => `Lookup failed (${code}).`,
    saveNoteBtn: "♡ Save to Notebook",

    // notebook
    notebookEmpty: "No saved notes yet. Look up a word and save it here.",

    // desktop guard
    desktopGuardMsg: "Subly is designed for desktop. Please use a wider screen.",
  },

  zh: {
    // topbar
    uiLangToggleTitle: "界面语言",
    studyLangAriaLabel: "学习语言",
    themeToggleTitle: "切换明暗主题",
    themeDarkLabel: "深青绿",
    themeLightLabel: "薄荷 Light",
    exportBtn: "导出听写",
    notebookBtnLabel: "笔记本",
    importBtn: "导入视频",

    // video area
    emptyVideoTitle: "视频画面区域",
    emptyVideoHint: "导入本地视频后开始听写",
    maskLabel: "字幕遮罩",
    maskTip: "↕ 拖动调节遮罩高度",
    backBtnTitle: "快退 5 秒",
    playBtnTitle: "播放/暂停",
    forwardBtnTitle: "快进 5 秒",
    maskOn: "遮罩开",
    maskOff: "遮罩关",
    videoFormatError: "当前浏览器可能不支持这个视频格式",
    videoFormatHint: "建议先转成 MP4，或换一个浏览器测试。",

    // dictation
    dictationTitle: "听写记录",
    dictationHint: "选中文字可查词",
    dictationPlaceholder: "听到了什么，输入后按 Enter 记录…",
    dictationEmpty: "还没有听写记录，输入第一句开始。",
    recordCount: (n) => `已记录 ${n} 条`,
    exportSuffix: "听写",

    // lookup / side panel
    lookupTabLabel: "查词",
    notebookTabLabel: "笔记本",
    selectedLabel: "选中的词：",
    lookupTagDefault: "词汇",
    readingHintJa: "读音会显示假名",
    readingHintEn: "读音会显示 IPA",
    lookupStatusIdle: "选中听写记录中的文字，自动查词。",
    lookupStatusLoading: "正在查询…",
    lookupStatusDone: "查词完成。",
    lookupNotFound: (word) => `未找到"${word}"的词典释义。`,
    lookupError: (code) => `查词失败（${code}）。`,
    saveNoteBtn: "♡ 收藏到笔记本",

    // notebook
    notebookEmpty: "还没有收藏。选中文字查词后可以保存到这里。",

    // desktop guard
    desktopGuardMsg: "Subly MVP 目前专为桌面端设计。请在更宽的屏幕上打开。",
  },
};

let currentLang = localStorage.getItem(UI_LANG_KEY) || "en";

export function getUILang() {
  return currentLang;
}

export function setUILang(lang) {
  currentLang = lang;
  localStorage.setItem(UI_LANG_KEY, lang);
}

export function t(key, arg) {
  const val = PACKS[currentLang]?.[key];
  if (typeof val === "function") return val(arg);
  return val ?? key;
}

export function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });
}
