document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);
  const inputEl = $("#inputContext");
  const outputEl = $("#outputContext");
  const inputTokensEl = $("#inputTokens");
  const outputTokensEl = $("#outputTokens");
  const compressionStatEl = $("#compressionStat");
  const statusEl = $("#status");
  const ratioEl = $("#ratio");

  function updateInputTokens() {
    const count = TokenEngine.estimateTokens(inputEl.value);
    inputTokensEl.textContent = `~${count.toLocaleString()} tokens`;
  }

  inputEl.addEventListener("input", updateInputTokens);

  $("#optimize").addEventListener("click", () => {
    const text = inputEl.value.trim();
    if (!text) {
      statusEl.textContent = "Nothing to optimize";
      return;
    }

    const options = {
      target: $("#targetTool").value,
      compressionLevel: parseInt($("#compressionLevel").value),
      maxTokens: parseInt($("#maxTokens").value),
      keepDecisions: $("#keepDecisions").checked,
      keepFiles: $("#keepFiles").checked,
      keepCode: $("#keepCode").checked,
      keepConstraints: $("#keepConstraints").checked,
      keepOpenItems: $("#keepOpenItems").checked,
    };

    const result = TokenEngine.optimize(text, options);

    outputEl.value = result.output;
    outputTokensEl.textContent = `~${result.outputTokens.toLocaleString()} tokens`;
    compressionStatEl.textContent = `${result.ratio}:1 compression`;
    ratioEl.textContent = `${result.inputTokens} → ${result.outputTokens} tokens (${result.ratio}x)`;
    statusEl.textContent = "Optimized";
  });

  $("#copyOutput").addEventListener("click", async () => {
    const text = outputEl.value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      statusEl.textContent = "Copied to clipboard";
    } catch {
      outputEl.select();
      document.execCommand("copy");
      statusEl.textContent = "Copied (fallback)";
    }
  });

  $("#downloadOutput").addEventListener("click", () => {
    const text = outputEl.value;
    if (!text) return;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `context-handoff-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    statusEl.textContent = "Downloaded";
  });

  $("#loadFile").addEventListener("click", () => {
    $("#fileInput").click();
  });

  $("#fileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      inputEl.value = ev.target.result;
      updateInputTokens();
      statusEl.textContent = `Loaded: ${file.name}`;
    };
    reader.readAsText(file);
  });

  $("#loadClipboard").addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputEl.value = text;
      updateInputTokens();
      statusEl.textContent = "Loaded from clipboard";
    } catch {
      statusEl.textContent = "Clipboard access denied";
    }
  });

  $("#clearAll").addEventListener("click", () => {
    inputEl.value = "";
    outputEl.value = "";
    inputTokensEl.textContent = "0 tokens";
    outputTokensEl.textContent = "0 tokens";
    compressionStatEl.textContent = "";
    ratioEl.textContent = "";
    statusEl.textContent = "Cleared";
  });

  $("#toggleTheme").addEventListener("click", () => {
    document.body.classList.toggle("light");
  });
});
