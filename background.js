const NEWTAB_URL = chrome.runtime.getURL('newtab.html');

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'open-newtab',
    title: 'Open Prompt Multiple AIs',
    contexts: ['action'],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'open-newtab') {
    chrome.tabs.create({ url: NEWTAB_URL, active: true });
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: NEWTAB_URL, active: true });
});

chrome.tabs.onCreated.addListener((tab) => {
  const url = tab.pendingUrl || tab.url;
  if (url !== '' && url !== 'about:newtab') return;
  chrome.storage.local.get('openNewTab', ({ openNewTab }) => {
    if (openNewTab === false) return;
    chrome.tabs.update(tab.id, { url: NEWTAB_URL });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'openTab') {
    chrome.tabs.create({ url: msg.url, active: false });
  } else if (msg.type === 'openInject') {
    const prompt = msg.prompt;
    chrome.tabs.create({ url: msg.url, active: false }, (tab) => {
      const tabId = tab.id;
      chrome.tabs.onUpdated.addListener(function listener(id, info) {
        if (id === tabId && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(tabId, { type: 'RUN_PROMPT', prompt });
        }
      });
    });
  }
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const numberMatch = text.match(/^(\d+)\s+([\s\S]+)$/);
  const letterMatch = text.match(/^([cgpomdq]+)\s+([\s\S]+)$/);
  const activateMatch = text.match(/^(\d+|[cgpomdq]+)$/);
  let url;
  if (numberMatch) {
    url = chrome.runtime.getURL('newtab.html') + '?q=' + encodeURIComponent(numberMatch[2]) + '&n=' + numberMatch[1];
  } else if (letterMatch) {
    url = chrome.runtime.getURL('newtab.html') + '?q=' + encodeURIComponent(letterMatch[2]) + '&l=' + letterMatch[1];
  } else if (activateMatch) {
    url = chrome.runtime.getURL('newtab.html') + '?activate=' + activateMatch[1];
  } else {
    url = chrome.runtime.getURL('newtab.html') + '?q=' + encodeURIComponent(text);
  }
  if (disposition === 'newForegroundTab' || disposition === 'newBackgroundTab') {
    chrome.tabs.create({ url, active: disposition === 'newForegroundTab' });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.update(tab.id, { url });
    });
  }
});
