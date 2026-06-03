const SELECTORS = {
  input: 'textarea[placeholder], div[contenteditable="true"]',
  sendBtn: 'button[class*="send-button"], button.send-button',
};

async function waitForEnabled(selector, timeout = 6000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const el = document.querySelector(selector);
    if (el && !el.disabled) return el;
    await sleep(100);
  }
  return null;
}

async function runPrompt(prompt) {
  const input = await waitForElement(SELECTORS.input, 12000);
  if (!input) throw new Error('Input not found — are you logged in to Qwen?');

  const nativeInputValueSetter = input.tagName === 'TEXTAREA'
    ? Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
    : null;

  function setText() {
    input.focus();
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, prompt);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, prompt);
    }
  }

  // Qwen clears the textarea during SPA init — keep re-setting until stable
  setText();
  let stableCount = 0;
  for (let i = 0; i < 40 && stableCount < 2; i++) {
    await sleep(150);
    if (input.value === prompt) {
      stableCount++;
    } else {
      stableCount = 0;
      setText();
    }
  }

  const sendBtn = await waitForEnabled(SELECTORS.sendBtn, 6000);
  console.log('[qwen] sendBtn:', sendBtn, 'disabled:', sendBtn?.disabled, 'value:', input.value?.slice(0, 20));
  if (sendBtn) {
    sendBtn.focus();
    sendBtn.click();
  } else {
    console.log('[qwen] send button not found, falling back to Enter key');
    for (const type of ['keydown', 'keypress', 'keyup']) {
      input.dispatchEvent(new KeyboardEvent(type, {
        key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true,
      }));
    }
  }
}

listenForPrompt('qwen', runPrompt);
