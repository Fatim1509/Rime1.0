const RIME_API = 'http://localhost:4000';
const statusEl = document.getElementById('status');

// Check RIME connection on popup open
async function checkConnection() {
  try {
    const response = await fetch(`${RIME_API}/health`);
    if (response.ok) {
      statusEl.className = 'status connected';
      statusEl.textContent = 'Status: Connected';
    } else {
      statusEl.className = 'status disconnected';
      statusEl.textContent = 'Status: Disconnected';
    }
  } catch (error) {
    statusEl.className = 'status disconnected';
    statusEl.textContent = 'Status: Disconnected';
  }
}

checkConnection();

// Analyze page button
document.getElementById('analyzePage').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { type: 'extractContent' }, async (content) => {
    if (content) {
      await chrome.runtime.sendMessage({
        type: 'submitIntent',
        query: `analyze this page: ${content.title}`
      });
      
      statusEl.className = 'status';
      statusEl.textContent = 'Analysis requested...';
    }
  });
});

// Open dashboard button
document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000' });
});

// Settings link
document.getElementById('settingsLink').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
