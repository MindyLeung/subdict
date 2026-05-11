const RECORDS_KEY = "subly_dictation_records";

export function createDictation({
  form,
  input,
  recordsList,
  recordCount,
  exportButton,
  getCurrentTime,
  formatTime,
  getVideoName,
  onSelection,
}) {
  let records = loadRecords();

  function loadRecords() {
    try {
      return JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }

  function render() {
    recordCount.textContent = `已记录 ${records.length} 条`;

    if (!records.length) {
      recordsList.innerHTML = '<div class="empty-state">还没有听写记录，输入第一句开始。</div>';
      return;
    }

    recordsList.innerHTML = records
      .map(
        (record) => `
          <article class="record" data-id="${record.id}">
            <time>${record.timestamp}</time>
            <p>${escapeHtml(record.text)}</p>
            <button class="delete-record" type="button" title="删除">×</button>
          </article>
        `,
      )
      .join("");
  }

  function addRecord(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    records.push({
      id: crypto.randomUUID(),
      text: trimmed,
      seconds: getCurrentTime(),
      timestamp: formatTime(getCurrentTime()),
      createdAt: Date.now(),
    });
    persist();
    render();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    addRecord(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    addRecord(input.value);
    input.value = "";
  });

  recordsList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-record");
    if (!button) return;
    const recordEl = button.closest(".record");
    records = records.filter((record) => record.id !== recordEl.dataset.id);
    persist();
    render();
  });

  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length <= 120) {
      onSelection(selection);
    }
  });

  exportButton.addEventListener("click", () => {
    const lines = records.map((record) => `[${record.timestamp}] ${record.text}`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const videoName = getVideoName().replace(/\.[^.]+$/, "") || "Subly";
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${videoName}_听写_${date}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  });

  render();

  return {
    addRecord,
    getRecords: () => [...records],
  };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });
}
