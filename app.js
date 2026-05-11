import { createDictation } from "./modules/dictation.js";
import { createLookup } from "./modules/lookup.js";
import { createMask } from "./modules/mask.js";
import { createNotebook } from "./modules/notebook.js";
import { createPlayer } from "./modules/player.js";

const $ = (selector) => document.querySelector(selector);

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
  languageSelect: $("#languageSelect"),
  selectedText: $("#selectedText"),
  lookupWord: $("#lookupWord"),
  lookupReading: $("#lookupReading"),
  lookupTag: $("#lookupTag"),
  lookupMeaning: $("#lookupMeaning"),
  grammarTitle: $("#grammarTitle"),
  grammarMeaning: $("#grammarMeaning"),
  saveNoteBtn: $("#saveNoteBtn"),
  noteCount: $("#noteCount"),
  notebookList: $("#notebookList"),
  openNotebookBtn: $("#openNotebookBtn"),
  lookupTab: $("#lookupTab"),
  notebookTab: $("#notebookTab"),
  lookupView: $("#lookupView"),
  notebookView: $("#notebookView"),
  themeToggle: $("#themeToggle"),
  themeIcon: $("#themeIcon"),
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
});

createMask({
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
  selectedText: els.selectedText,
  lookupWord: els.lookupWord,
  lookupReading: els.lookupReading,
  lookupTag: els.lookupTag,
  lookupMeaning: els.lookupMeaning,
  grammarTitle: els.grammarTitle,
  grammarMeaning: els.grammarMeaning,
  saveButton: els.saveNoteBtn,
  onSave: notebook.addNote,
});

createDictation({
  form: els.dictationForm,
  input: els.dictationInput,
  recordsList: els.recordsList,
  recordCount: els.recordCount,
  exportButton: els.exportDictationBtn,
  getCurrentTime: player.getCurrentTime,
  formatTime: player.formatTime,
  getVideoName: () => els.fileName.textContent,
  onSelection: lookup.lookup,
});

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  els.themeIcon.textContent = theme === "dark" ? "☀" : "☾";
  els.themeLabel.textContent = theme === "dark" ? "薄荷 Light" : "深青绿";
  localStorage.setItem("subly_theme", theme);
}

applyTheme(localStorage.getItem("subly_theme") || "light");

els.themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
});
