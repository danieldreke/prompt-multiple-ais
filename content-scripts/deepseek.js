const SELECTORS = {
  input: 'textarea[placeholder], div[contenteditable="true"]',
  sendBtn: 'button[type="submit"], button[aria-label*="Send"], button[aria-label*="send"]',
};

async function runPrompt(prompt) {
  const input = await waitForElement(SELECTORS.input, 12000);
  if (!input) throw new Error('Input not found — are you logged in to DeepSeek?');
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
  clickSendOrEnter(SELECTORS.sendBtn, input);
}

listenForPrompt('deepseek', runPrompt);
