// Extract page content
function extractPageContent() {
  const title = document.title;
  const url = window.location.href;
  
  // Get main content (try common selectors)
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '#content'
  ];
  
  let content = '';
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = element.innerText;
      break;
    }
  }
  
  if (!content) {
    content = document.body.innerText;
  }
  
  // Extract code blocks
  const codeBlocks = Array.from(document.querySelectorAll('pre code, pre')).map(
    el => el.innerText
  );
  
  return {
    title,
    url,
    content: content.substring(0, 5000), // Limit to 5000 chars
    codeBlocks,
    pageType: detectPageType(url)
  };
}

function detectPageType(url) {
  if (url.includes('github.com')) return 'github';
  if (url.includes('stackoverflow.com')) return 'stackoverflow';
  if (url.includes('docs.') || url.includes('/docs')) return 'documentation';
  return 'generic';
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'extractContent') {
    const content = extractPageContent();
    sendResponse(content);
  }
});
