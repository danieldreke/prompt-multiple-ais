const LABEL = 'Gemini';
const SELECTORS = {
  input: 'rich-textarea div[contenteditable="true"], div[contenteditable="true"][aria-label*="prompt"], div[contenteditable="true"][aria-label*="message"]',
  sendBtn: 'button[aria-label="Send message"], button.send-button',
};

listenForPrompt('gemini', prompt => runPromptInject(SELECTORS, LABEL, prompt));
