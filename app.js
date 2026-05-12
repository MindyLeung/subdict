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
  languageSelect: $("#languageSelect"),
  uiLangSelect: $("#uiLangSelect"),
  apiStatus: $("#apiStatus"),
  selectedText: $("#selectedText"),
  lookupWord: $("#lookupWord"),
  lookupReading: $("#lookupReading"),
  lookupTag: $("#lookupTag"),
  lookupMeaning: $("#lookupMeaning"),
  saveNoteBtn: $("#saveNoteBtn"),
  noteCount: $("#noteCount"),
  notebookList: $("#notebookList"),
  openNotebookBtn: $("#openNotebookBtn"),
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
  lookupTab: els.lookupTab,
  notebookTab: els.notebookTab,
  lookupView: els.lookupView,
  notebookView: els.notebookView,
});

const lookup = createLookup({
  languageSelect: els.languageSelect,
  input: els.dictationInput,
  apiStatus: els.apiStatus,
  selectedText: els.selectedText,
  lookupWord: els.lookupWord,
  lookupReading: els.lookupReading,
  lookupTag: els.lookupTag,
  lookupMeaning: els.lookupMeaning,
  saveButton: els.saveNoteBtn,
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
  onSelection: lookup.lookup,
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
