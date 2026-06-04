const SUN_ICON  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>`;
const MOON_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

const themeToggle = document.getElementById('theme-toggle');

function updateThemeIcon() {
  themeToggle.innerHTML = document.body.classList.contains('light') ? MOON_ICON : SUN_ICON;
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  updateThemeIcon();
});

updateThemeIcon();

const CHATBOTS = [
  { key: 'c', url: 'https://claude.ai/new', inject: true },
  { key: 'g', url: q => 'https://grok.com/?q=' + q },
  { key: 'p', url: q => 'https://www.perplexity.ai/search?s=o&q=' + q },
  { key: 'm', url: 'https://gemini.google.com/app', inject: true },
  { key: 'o', url: q => 'https://chatgpt.com/?q=' + q },
  // { key: 'd', url: 'https://deep-seek.ai/chat', inject: true },
  { key: 'q', url: 'https://chat.qwen.ai/', inject: true },
];

const savedKeys = JSON.parse(localStorage.getItem('enabled') || 'null');
const enabled = new Set(savedKeys ?? CHATBOTS.map(b => b.key));

function saveEnabled() {
  localStorage.setItem('enabled', JSON.stringify([...enabled]));
}

function updateToggleAllBtn() {
  const btn = toggleAllBtn;
  const anyOn = enabled.size > 0;
  btn.querySelector('.pill-name').textContent = anyOn ? 'None' : 'All';
  btn.dataset.tooltip = anyOn ? 'Deselect all AIs' : 'Select all AIs';
  btn.classList.toggle('all-action', !anyOn);
}

function toggleAll() {
  if (enabled.size > 0) {
    enabled.clear();
  } else {
    CHATBOTS.forEach(b => enabled.add(b.key));
  }
  saveEnabled();
  document.querySelectorAll('.bot-pill').forEach(pill => {
    pill.classList.toggle('off', !enabled.has(pill.dataset.key));
  });
  updateToggleAllBtn();
}

document.querySelectorAll('.bot-pill').forEach(pill => {
  if (enabled.has(pill.dataset.key)) pill.classList.remove('off');

  pill.addEventListener('click', () => {
    const key = pill.dataset.key;
    if (enabled.has(key)) {
      enabled.delete(key);
      pill.classList.add('off');
    } else {
      enabled.add(key);
      pill.classList.remove('off');
    }
    saveEnabled();
    updateToggleAllBtn();
  });
});

const toggleAllBtn = document.getElementById('toggle-all');
toggleAllBtn.addEventListener('click', toggleAll);

// Lock width to the wider label ('None') so it never resizes on toggle
toggleAllBtn.querySelector('.pill-name').textContent = 'None';
toggleAllBtn.style.minWidth = toggleAllBtn.getBoundingClientRect().width + 'px';

updateToggleAllBtn();

function sendPrompt(query, selector = null) {
  document.title = query;
  const q = encodeURIComponent(query);
  let bots;
  if (selector === null) {
    bots = CHATBOTS.filter(b => enabled.has(b.key));
  } else if (typeof selector === 'number') {
    bots = CHATBOTS.slice(0, selector);
  } else {
    bots = CHATBOTS.filter(b => selector.includes(b.key));
  }
  bots.forEach(b => {
    if (b.inject) {
      chrome.runtime.sendMessage({ type: 'openInject', url: b.url, prompt: query });
    } else {
      chrome.runtime.sendMessage({ type: 'openTab', url: b.url(q) });
    }
  });
}

const textarea = document.getElementById('prompt');
const sendBtn = document.getElementById('send');

const textareaBorderHeight = parseFloat(getComputedStyle(textarea).borderTopWidth) + parseFloat(getComputedStyle(textarea).borderBottomWidth);

function autoResize() {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight + textareaBorderHeight) + 'px';
}

function updateSendBtn() {
  sendBtn.disabled = !textarea.value.trim();
}

textarea.addEventListener('input', () => { autoResize(); updateSendBtn(); });
updateSendBtn();

function triggerSend() {
  const query = textarea.value.trim();
  if (query) {
    sendPrompt(query);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) { triggerSend(); return; }
  if (e.ctrlKey && e.altKey && e.code.startsWith('Digit') && e.code !== 'Digit0') {
    const n = parseInt(e.code.replace('Digit', ''), 10);
    if (n >= 1 && n <= CHATBOTS.length) applyActivation(String(n));
  }
  if (e.ctrlKey && e.shiftKey && e.code.startsWith('Digit') && e.code !== 'Digit0') {
    const n = parseInt(e.code.replace('Digit', ''), 10);
    const bot = CHATBOTS[n - 1];
    if (!bot) return;
    const pill = document.querySelector(`.bot-pill[data-key="${bot.key}"]`);
    if (enabled.has(bot.key)) {
      enabled.delete(bot.key);
      pill.classList.add('off');
    } else {
      enabled.add(bot.key);
      pill.classList.remove('off');
    }
    saveEnabled();
    updateToggleAllBtn();
  }
  if ((e.ctrlKey && e.shiftKey && e.code === 'Digit0') || (e.ctrlKey && e.altKey && e.code === 'Digit0')) {
    toggleAll();
  }
});

document.getElementById('send').addEventListener('click', triggerSend);

function applyActivation(value) {
  const num = parseInt(value, 10);
  const newKeys = isNaN(num)
    ? CHATBOTS.filter(b => value.includes(b.key)).map(b => b.key)
    : CHATBOTS.slice(0, num).map(b => b.key);
  enabled.clear();
  newKeys.forEach(k => enabled.add(k));
  saveEnabled();
  document.querySelectorAll('.bot-pill').forEach(pill => {
    pill.classList.toggle('off', !enabled.has(pill.dataset.key));
  });
  updateToggleAllBtn();
}

const params = new URLSearchParams(location.search);
const activateParam = params.get('activate');
const initialQuery = params.get('q');
if (activateParam) {
  history.replaceState(null, '', location.pathname);
  applyActivation(activateParam);
  textarea.focus();
} else if (initialQuery) {
  history.replaceState(null, '', location.pathname);
  textarea.value = initialQuery;
  const n = params.get('n');
  const l = params.get('l');
  if (n) applyActivation(n);
  else if (l) applyActivation(l);
  sendPrompt(initialQuery);
}
