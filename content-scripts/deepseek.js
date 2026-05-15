const SELECTORS = {
  input: 'textarea[placeholder], div[contenteditable="true"]',
  sendBtn: 'button[type="submit"], button[aria-label*="Send"], button[aria-label*="send"]',
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'RUN_PROMPT') {
    runPrompt(msg.prompt).catch(err => console.error('[deepseek] runPrompt failed:', err));
    sendResponse({ ok: true });
  }
});

async function runPrompt(prompt) {
  const input = await waitForElement(SELECTORS.input, 12000);
  if (!input) throw new Error('Input field not found — are you logged in to DeepSeek?');

  input.focus();
  if (input.tagName === 'TEXTAREA') {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, prompt);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, prompt);
  }
  await sleep(500);

  const sendBtn = document.querySelector(SELECTORS.sendBtn);
  if (sendBtn) {
    (sendBtn.closest('button') || sendBtn).click();
  } else {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  }
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
