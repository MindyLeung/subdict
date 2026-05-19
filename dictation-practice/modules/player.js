import { t } from "./i18n.js";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];

export function createPlayer({
  video,
  videoInput,
  fileName,
  clearVideoBtn,
  playBtn,
  backBtn,
  forwardBtn,
  seekBar,
  timeReadout,
  speedBtn,
  emptyVideo,
  dropOverlay,
  toastEl,
  onVideoLoaded,
  onVideoCleared,
}) {
  let speedIndex = 2;
  let toastTimer;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function updateControls() {
    const duration = video.duration || 0;
    const current = video.currentTime || 0;
    seekBar.value = duration ? String((current / duration) * 100) : "0";
    timeReadout.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    playBtn.textContent = video.paused ? "▶" : "Ⅱ";
  }

  function showVideoError(message) {
    emptyVideo.hidden = false;
    emptyVideo.innerHTML = `
      <div class="play-mark">!</div>
      <strong>${message}</strong>
      <span>${t("videoFormatHint")}</span>
    `;
  }

  function togglePlay() {
    if (!video.src) return;
    if (video.paused) { video.play(); } else { video.pause(); }
  }

  function clearVideo() {
    if (video.src?.startsWith("blob:")) URL.revokeObjectURL(video.src);
    video.src = "";
    video.load();
    fileName.textContent = "";
    if (clearVideoBtn) clearVideoBtn.hidden = true;
    emptyVideo.hidden = false;
    seekBar.value = "0";
    timeReadout.textContent = "00:00 / 00:00";
    playBtn.textContent = "▶";
    onVideoCleared?.();
  }

  function loadFile(file) {
    const url = URL.createObjectURL(file);
    if (video.src?.startsWith("blob:")) {
      URL.revokeObjectURL(video.src);
    }
    video.src = url;
    video.load();
    fileName.textContent = file.name;
    if (clearVideoBtn) clearVideoBtn.hidden = false;
    emptyVideo.hidden = true;
    onVideoLoaded?.({
      id: createVideoId(file),
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
    });
    updateControls();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toastEl.hidden = true;
    // Force reflow so the animation replays on repeat toasts
    void toastEl.offsetWidth;
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3000);
  }

  // ── File input (existing button) ────────────────────
  videoInput.addEventListener("change", () => {
    const file = videoInput.files?.[0];
    if (!file) return;
    loadFile(file);
  });

  // ── Drag and drop ───────────────────────────────────
  document.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dropOverlay.hidden = false;
  });

  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  document.addEventListener("dragleave", (e) => {
    // relatedTarget is null only when the pointer leaves the browser window entirely
    if (e.relatedTarget === null) dropOverlay.hidden = true;
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    dropOverlay.hidden = true;
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      showToast(t("dropVideoOnly"));
      return;
    }
    loadFile(file);
  });

  // ── Playback controls ───────────────────────────────
  playBtn.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);
  video.addEventListener("loadedmetadata", updateControls);
  video.addEventListener("timeupdate", updateControls);
  video.addEventListener("play", updateControls);
  video.addEventListener("pause", updateControls);
  video.addEventListener("error", () => {
    showVideoError(t("videoFormatError"));
  });

  backBtn.addEventListener("click", () => {
    video.currentTime = Math.max(0, video.currentTime - 5);
  });

  forwardBtn.addEventListener("click", () => {
    video.currentTime = Math.min(video.duration || video.currentTime + 5, video.currentTime + 5);
  });

  seekBar.addEventListener("input", () => {
    if (!video.duration) return;
    video.currentTime = (Number(seekBar.value) / 100) * video.duration;
  });

  speedBtn.addEventListener("click", () => {
    speedIndex = (speedIndex + 1) % SPEEDS.length;
    video.playbackRate = SPEEDS[speedIndex];
    speedBtn.textContent = `${SPEEDS[speedIndex]}x`;
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
    if (isTyping) return;

    if (event.code === "Space") {
      event.preventDefault();
      togglePlay();
    }
    if (event.code === "ArrowLeft") {
      video.currentTime = Math.max(0, video.currentTime - 5);
    }
    if (event.code === "ArrowRight") {
      video.currentTime = Math.min(video.duration || video.currentTime + 5, video.currentTime + 5);
    }
  });

  // On init: ensure no stale file name is shown
  fileName.textContent = "";
  if (clearVideoBtn) {
    clearVideoBtn.hidden = true;
    clearVideoBtn.addEventListener("click", clearVideo);
  }

  updateControls();

  return {
    getCurrentTime: () => video.currentTime || 0,
    getVideoName: () => fileName.textContent,
    formatTime,
    showToast,
  };
}

function createVideoId(file) {
  return `${file.name}::${file.size}::${file.lastModified}`;
}
