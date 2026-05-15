chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'openTab') {
    chrome.tabs.create({ url: msg.url, active: false });
  }
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const numberMatch = text.match(/^(\d+)\s+([\s\S]+)$/);
  const letterMatch = text.match(/^([cgpom]+)\s+([\s\S]+)$/);
  let q, param;
  if (numberMatch) {
    q = numberMatch[2];
    param = '&n=' + numberMatch[1];
  } else if (letterMatch) {
    q = letterMatch[2];
    param = '&l=' + letterMatch[1];
  } else {
    q = text;
    param = '';
  }
  const url = chrome.runtime.getURL('newtab.html') + '?q=' + encodeURIComponent(q) + param;
  if (disposition === 'newForegroundTab' || disposition === 'newBackgroundTab') {
    chrome.tabs.create({ url, active: disposition === 'newForegroundTab' });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.update(tab.id, { url });
    });
  }
});
