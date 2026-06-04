function waitForElement(selector, timeout = 8000) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) { resolve(el); return; }
    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) { observer.disconnect(); resolve(found); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForEnabled(selector, timeout = 6000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const el = document.querySelector(selector);
    if (el && !el.disabled) return el;
    await sleep(100);
  }
  return null;
}

async function runPromptInject(selectors, label, prompt) {
  const input = await waitForElement(selectors.input, 12000);
  if (!input) throw new Error(`Input not found — are you logged in to ${label}?`);
  input.focus();
  document.execCommand('insertText', false, prompt);
  const sendBtn = await waitForEnabled(selectors.sendBtn, 6000);
  sendBtn.focus();
  sendBtn.click();
}

function listenForPrompt(label, runPrompt) {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'RUN_PROMPT') {
      runPrompt(msg.prompt).catch(err => console.error(`[${label}] runPrompt failed:`, err));
      sendResponse({ ok: true });
    }
  });
}
