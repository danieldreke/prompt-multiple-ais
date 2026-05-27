const SELECTORS = {
  input: 'rich-textarea div[contenteditable="true"], div[contenteditable="true"][aria-label*="prompt"], div[contenteditable="true"][aria-label*="message"]',
  sendBtn: 'button[aria-label="Send message"], button.send-button, mat-icon[data-mat-icon-name="send"]',
};

async function runPrompt(prompt) {
  const input = await waitForElement(SELECTORS.input, 12000);
  if (!input) throw new Error('Input not found — are you logged in to Gemini?');
  input.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('insertText', false, prompt);
  await sleep(500);
  clickSendOrEnter(SELECTORS.sendBtn, input);
}

listenForPrompt('gemini', runPrompt);
