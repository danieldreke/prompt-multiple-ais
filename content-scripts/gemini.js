const SELECTORS = {
  input: 'rich-textarea div[contenteditable="true"], div[contenteditable="true"][aria-label*="prompt"], div[contenteditable="true"][aria-label*="message"]',
  sendBtn: 'button[aria-label="Send message"], button.send-button, mat-icon[data-mat-icon-name="send"]',
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'RUN_PROMPT') {
    runPrompt(msg.prompt).catch(err => console.error('[gemini] runPrompt failed:', err));
    sendResponse({ ok: true });
  }
});

async function runPrompt(prompt) {
  const input = await waitForElement(SELECTORS.input, 12000);
  if (!input) throw new Error('Input field not found — are you logged in to Gemini?');

  setContentEditable(input, prompt);
  await sleep(500);

  const sendBtn = document.querySelector(SELECTORS.sendBtn);
  if (sendBtn) {
    (sendBtn.closest('button') || sendBtn).click();
  } else {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  }
}

function setContentEditable(el, text) {
  el.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('insertText', false, text);
}

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
