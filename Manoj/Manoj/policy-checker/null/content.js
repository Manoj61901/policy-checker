// Highlight policy terms on page
const terms = [
  "cookie", "privacy", "GDPR", 
  "data", "retention", "policy"
];

function highlightTerms() {
  terms.forEach(term => {
    document.body.innerHTML = document.body.innerHTML.replace(
      new RegExp(term, 'gi'),
      match => `<span class="policy-highlight">${match}</span>`
    );
  });
} 

// Listen for scan requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageText") {
    highlightTerms();
    sendResponse({ text: document.body.innerText });
  }
}); 