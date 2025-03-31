document.addEventListener('DOMContentLoaded', () => {
  const normalBtn = document.getElementById('normalBtn');
  const aiBtn = document.getElementById('aiBtn');
  const scanBtn = document.querySelector('.scan-btn');
  const resultsDiv = document.querySelector('.results');
  const menuContainer = document.querySelector('.menu-container');
  const menuIcon = document.querySelector('.menu-icon');
  const body = document.body;

  // Set default mode
  chrome.storage.local.set({ mode: 'normal' });

  // Clear dark mode state from local storage
  chrome.storage.local.remove('darkMode');
  
  // Mode switching
  normalBtn.addEventListener('click', () => { 
    normalBtn.classList.add('active');
    aiBtn.classList.remove('active');
    chrome.storage.local.set({ mode: 'normal' });
  });
  
  aiBtn.addEventListener('click', () => {
    aiBtn.classList.add('active');
    normalBtn.classList.remove('active');
    chrome.storage.local.set({ mode: 'ai' });
  });
  
  // Function to dynamically update the score circle gradient
  function updateScoreCircle(score) {
    const scoreCircle = document.querySelector('.score-circle');
    if (!scoreCircle) return; // Ensure the element exists

    // Calculate the gradient based on the score
    let gradientColor;
    if (score > 70) {
      // Green for high scores
      gradientColor = `#2ecc71`;
    } else if (score >= 40) {
      // Orange for medium scores
      gradientColor = `#f39c12`;
    } else {
      // Red for low scores
      gradientColor = `#e74c3c`;
    }

    // Update the background gradient dynamically
    scoreCircle.style.background = `conic-gradient(${gradientColor} ${score}%, #e0e0e0 ${score}%)`;
    scoreCircle.textContent = `${score}%`; // Display the score inside the circle
  }

  // Function to display results
  function showResults(data) {
    const score = data.score || 0; // Default to 0 if no score is provided
    updateScoreCircle(score);

    const prosList = document.getElementById('prosList');
    const consList = document.getElementById('consList');
    const summary = document.getElementById('summary');

    if (prosList) {
      prosList.innerHTML = (data.pros || []).map(p => `<li>${p}</li>`).join('');
    }
    if (consList) {
      consList.innerHTML = (data.cons || []).map(c => `<li>${c}</li>`).join('');
    }
    if (summary) {
      summary.textContent = data.summary || 'Analysis complete';
    }

    resultsDiv.style.display = 'block';
  }

  // Event listener for the scan button
  scanBtn.addEventListener('click', () => {
    scanBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/></svg> Scanning...';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const restrictedPrefixes = ['chrome://', 'brave://', 'edge://', 'about:', 'file://'];

      // Check if the URL is restricted or inaccessible
      if (
        !activeTab ||
        !activeTab.url ||
        restrictedPrefixes.some(prefix => activeTab.url.startsWith(prefix)) ||
        activeTab.url === 'about:blank'
      ) {
        resultsDiv.style.display = 'block';
        showResults({
          score: 0,
          pros: [],
          cons: [],
          summary: 'Cannot analyze content on restricted pages like browser settings or new tabs.'
        });
        scanBtn.innerHTML = 'Scan Now';
        return;
      }

      // Execute script on valid pages
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: () => document.body.innerText
      }, (results) => {
        const text = results && results[0] && results[0].result ? results[0].result : '';
        chrome.runtime.sendMessage(
          { action: "analyzeText", text },
          (response) => {
            showResults(response);
            scanBtn.innerHTML = 'Scan Now';
          }
        );
      });
    });
  });

  // Toggle menu visibility
  menuIcon.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the click from propagating to the document
    menuContainer.classList.toggle('active');
  });

  // Close the menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!menuContainer.contains(event.target)) {
      menuContainer.classList.remove('active');
    }
  });

  // Menu option: User Manual
  document.getElementById('userManual').addEventListener('click', () => {
    alert(`User Manual:
1. Click on "Scan Now" to analyze the current webpage.
2. Use the "Mode" buttons to switch between Normal and AI modes.
3. Toggle "Dark Mode" for a better viewing experience.`);
    // Add logic to open the user manual (e.g., open a new tab or modal)
  });

  // Menu option: Save Image
  document.getElementById('saveImage').addEventListener('click', () => {
    alert('Save Image clicked!');
    // Add logic to save an image (e.g., capture a screenshot or download an image)
  });

  // Menu option: About
  document.getElementById('about').addEventListener('click', () => {
    alert(`About:
Team Coordinator: Mr. Rajesh A
Team Members: 
               Manoj B.
               Avinash S. 
               Muraliprasanth P.

College Name: Department of Computer Science and Business Systems,E.G.S Pillay Engineering College, Nagapattinam, Tamilnadu, India`);
    // Add logic to display an "About" modal or information if needed
  });
});