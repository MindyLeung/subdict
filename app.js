import { createDictation } from "./modules/dictation.js";
import { applyStaticI18n, getUILang, setUILang, t } from "./modules/i18n.js";
import { createLookup } from "./modules/lookup.js";
import { createMask } from "./modules/mask.js";
import { createNotebook } from "./modules/notebook.js";
import { createPlayer } from "./modules/player.js";

const $ = (selector) => document.querySelector(selector);
let dictation;

const els = {
  video: $("#video"),
  videoInput: $("#videoInput"),
  fileName: $("#fileName"),
  playBtn: $("#playBtn"),
  backBtn: $("#backBtn"),
  forwardBtn: $("#forwardBtn"),
  seekBar: $("#seekBar"),
  timeReadout: $("#timeReadout"),
  speedBtn: $("#speedBtn"),
  emptyVideo: $("#emptyVideo"),
  videoStage: $("#videoStage"),
  subtitleMask: $("#subtitleMask"),
  maskHandle: $("#maskHandle"),
  maskToggle: $("#maskToggle"),
  dictationForm: $("#dictationForm"),
  dictationInput: $("#dictationInput"),
  recordsList: $("#recordsList"),
  recordCount: $("#recordCount"),
  exportDictationBtn: $("#exportDictationBtn"),
  dropOverlay: $("#dropOverlay"),
  toastEl: $("#toastEl"),
  lookupPopup: $("#lookupPopup"),
  lookupPopupBtn: $("#lookupPopupBtn"),
  languageSelect: $("#languageSelect"),
  uiLangSelect: $("#uiLangSelect"),
  apiStatus: $("#apiStatus"),
  lookupCard: $("#lookupCard"),
  selectedText: $("#selectedText"),
  lookupWord: $("#lookupWord"),
  lookupReading: $("#lookupReading"),
  lookupTag: $("#lookupTag"),
  lookupMeaning: $("#lookupMeaning"),
  saveNoteBtn: $("#saveNoteBtn"),
  grammarCard: $("#grammarCard"),
  grammarTitle: $("#grammarTitle"),
  grammarMeaning: $("#grammarMeaning"),
  saveGrammarBtn: $("#saveGrammarBtn"),
  noteCount: $("#noteCount"),
  notebookList: $("#notebookList"),
  openNotebookBtn: $("#openNotebookBtn"),
  exportNotebookBtn: $("#exportNotebookBtn"),
  lookupTab: $("#lookupTab"),
  notebookTab: $("#notebookTab"),
  lookupView: $("#lookupView"),
  notebookView: $("#notebookView"),
  themeToggle: $("#themeToggle"),
  themeLabel: $("#themeLabel"),
};

const player = createPlayer({
  video: els.video,
  videoInput: els.videoInput,
  fileName: els.fileName,
  playBtn: els.playBtn,
  backBtn: els.backBtn,
  forwardBtn: els.forwardBtn,
  seekBar: els.seekBar,
  timeReadout: els.timeReadout,
  speedBtn: els.speedBtn,
  emptyVideo: els.emptyVideo,
  dropOverlay: els.dropOverlay,
  toastEl: els.toastEl,
  onVideoLoaded: (videoSession) => {
    dictation?.setSession(videoSession);
  },
});

const mask = createMask({
  stage: els.videoStage,
  mask: els.subtitleMask,
  handle: els.maskHandle,
  toggle: els.maskToggle,
});

const notebook = createNotebook({
  noteCount: els.noteCount,
  notebookList: els.notebookList,
  openNotebookButton: els.openNotebookBtn,
  exportButton: els.exportNotebookBtn,
  showToast: player.showToast,
  lookupTab: els.lookupTab,
  notebookTab: els.notebookTab,
  lookupView: els.lookupView,
  notebookView: els.notebookView,
});

const lookup = createLookup({
  languageSelect: els.languageSelect,
  input: els.dictationInput,
  apiStatus: els.apiStatus,
  lookupCard: els.lookupCard,
  selectedText: els.selectedText,
  lookupWord: els.lookupWord,
  lookupReading: els.lookupReading,
  lookupTag: els.lookupTag,
  lookupMeaning: els.lookupMeaning,
  grammarCard: els.grammarCard,
  grammarTitle: els.grammarTitle,
  grammarMeaning: els.grammarMeaning,
  saveButton: els.saveNoteBtn,
  saveGrammarButton: els.saveGrammarBtn,
  onSave: (note) => {
    notebook.addNote({
      ...note,
      source: `${player.getVideoName()} · ${player.formatTime(player.getCurrentTime())}`,
    });
  },
});

dictation = createDictation({
  form: els.dictationForm,
  input: els.dictationInput,
  recordsList: els.recordsList,
  recordCount: els.recordCount,
  exportButton: els.exportDictationBtn,
  getCurrentTime: player.getCurrentTime,
  formatTime: player.formatTime,
  getVideoName: player.getVideoName,
  onEmpty: () => lookup.clearPanel(),
});

// ── Word selection popup ────────────────────────────
document.addEventListener("mouseup", (e) => {
  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : "";
  if (text.length > 0 && text.length <= 120 && els.recordsList.contains(selection.anchorNode)) {
    window._subdict_selected_word = text;
    // Position above the selected text using its bounding rect
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const popupW = 110;
    const x = Math.min(Math.max(rect.left + rect.width / 2 - popupW / 2, 4), window.innerWidth - popupW - 4);
    const y = Math.max(rect.top - 44, 4);
    els.lookupPopup.style.left = `${x}px`;
    els.lookupPopup.style.top = `${y}px`;
    els.lookupPopup.hidden = false;
  } else if (!els.lookupPopup.contains(e.target)) {
    els.lookupPopup.hidden = true;
  }
});

document.addEventListener("mousedown", (e) => {
  if (!els.lookupPopup.contains(e.target)) {
    els.lookupPopup.hidden = true;
  }
});

els.lookupPopupBtn.addEventListener("click", () => {
  const word = window._subdict_selected_word;
  console.log("LOOKUP WORD:", word);
  if (!word) return;
  els.lookupPopup.hidden = true;
  els.lookupPopupBtn.disabled = true;
  lookup.lookup(word).finally(() => {
    els.lookupPopupBtn.disabled = false;
  });
});

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  els.themeLabel.textContent = theme === "dark" ? t("themeDarkLabel") : t("themeLightLabel");
  localStorage.setItem("subdict_theme", theme);
}

function applyUILang(lang) {
  setUILang(lang);
  els.uiLangSelect.value = lang;
  applyStaticI18n();
  mask.refresh();
  lookup.refresh();
  dictation.refresh();
  notebook.refresh();
  applyTheme(document.body.dataset.theme || "light");
}

els.uiLangSelect.value = getUILang();
applyStaticI18n();

els.uiLangSelect.addEventListener("change", () => {
  applyUILang(els.uiLangSelect.value);
});

applyTheme(localStorage.getItem("subdict_theme") || "light");

els.themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});
