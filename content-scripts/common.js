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

function clickSendOrEnter(sendBtnSelector, input) {
  const sendBtn = document.querySelector(sendBtnSelector);
  if (sendBtn) {
    (sendBtn.closest('button') || sendBtn).click();
  } else {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  }
}

function listenForPrompt(label, runPrompt) {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'RUN_PROMPT') {
      runPrompt(msg.prompt).catch(err => console.error(`[${label}] runPrompt failed:`, err));
      sendResponse({ ok: true });
    }
  });
}
