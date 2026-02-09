const RIME_API = 'http://localhost:4000';

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'askRime',
    title: 'Ask RIME about this',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'askRime' && info.selectionText) {
    submitToRime(`explain: ${info.selectionText}`);
  }
});

// Submit intent to RIME
async function submitToRime(query) {
  try {
    const response = await fetch(`${RIME_API}/api/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    
    // Store result
    chrome.storage.local.set({ lastResult: data });
    
    // Notify popup if open
    chrome.runtime.sendMessage({ type: 'result', data });
  } catch (error) {
    console.error('Failed to contact RIME:', error);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'submitIntent') {
    submitToRime(message.query).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});
