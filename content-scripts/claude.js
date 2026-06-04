const LABEL = 'Claude';
const SELECTORS = {
  input: 'div[data-testid="chat-input"]',
  sendBtn: 'button[aria-label*="Send" i], button[data-testid*="send" i], button[type="submit"]',
};

listenForPrompt('claude', prompt => runPromptInject(SELECTORS, LABEL, prompt));
