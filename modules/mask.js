import { t } from "./i18n.js";

const HEIGHT_KEY = "subly_mask_height";
const VISIBLE_KEY = "subly_mask_visible";

export function createMask({ stage, mask, handle, toggle }) {
  const savedHeight = localStorage.getItem(HEIGHT_KEY);
  const savedVisible = localStorage.getItem(VISIBLE_KEY);
  let visible = savedVisible !== "false";

  if (savedHeight) {
    mask.style.height = savedHeight;
  }

  function applyVisibility() {
    mask.classList.toggle("is-hidden", !visible);
    toggle.textContent = visible ? t("maskOn") : t("maskOff");
    localStorage.setItem(VISIBLE_KEY, String(visible));
  }

  function setHeightFromPointer(clientY) {
    const rect = stage.getBoundingClientRect();
    const distanceFromBottom = rect.bottom - clientY;
    const minHeight = 52;
    const maxHeight = rect.height * 0.55;
    const height = Math.min(maxHeight, Math.max(minHeight, distanceFromBottom));
    const percent = (height / rect.height) * 100;
    mask.style.height = `${percent.toFixed(2)}%`;
    localStorage.setItem(HEIGHT_KEY, mask.style.height);
  }

  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    setHeightFromPointer(event.clientY);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    setHeightFromPointer(event.clientY);
  });

  handle.addEventListener("pointerup", (event) => {
    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
  });

  toggle.addEventListener("click", () => {
    visible = !visible;
    applyVisibility();
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
    if (isTyping) return;

    if (event.key.toLowerCase() === "s") {
      visible = !visible;
      applyVisibility();
    }
  });

  applyVisibility();

  return { refresh: applyVisibility };
}
