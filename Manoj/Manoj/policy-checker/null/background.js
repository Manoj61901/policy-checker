const analyzeWithAlgorithms = (text) => {
  // Expanded list of terms for analysis
  const terms = [
    "cookies", "privacy policy", "data sharing", "GDPR", "account deletion", "third-party",
    "encryption", "data retention", "user consent", "tracking", "advertising", "opt-out",
    "data portability", "security breach", "personal data", "anonymization", "data collection",
    "user rights", "data deletion", "profiling", "behavioral tracking", "location data",
    "biometric data", "child privacy", "data minimization", "data accuracy", "policy updates",
    "data transfer", "cross-border data", "legal compliance", "user transparency", "data breaches",
    "AI usage", "targeted advertising", "data monetization", "user profiling", "data encryption"
  ];
 
  const prosCons = {
    pros: [
      "Transparent Data Practices", "Easy Account Deletion", "Strong Encryption",
      "User Consent Required", "Data Portability Options", "Clear Privacy Policy",
      "Regular Policy Updates", "Anonymized Data Collection", "Child Privacy Protection",
      "Fair Dispute Resolution", "Strict Data Retention Policies", "No Behavioral Tracking",
      "Opt-Out Options Available", "Secure Cross-Border Data Transfers", "User Rights Protection"
    ], 
    cons: [
      "Data Sharing with Third Parties", "Unilateral Policy Changes", "Behavioral Tracking",
      "Lack of Opt-Out Options", "Data Retention Without Consent", "Inadequate Security Measures",
      "Cross-Border Data Transfers", "Profiling of Users", "Location Data Collection",
      "Insufficient Transparency", "Data Monetization Practices", "Targeted Advertising",
      "Weak Encryption Standards", "Frequent Data Breaches", "Lack of Child Privacy Protections"
    ]
  };

  // Detect terms in the text
  const detected = terms.filter(term => text.toLowerCase().includes(term.toLowerCase()));

  // Filter out contradictory pros and cons
  const contradictoryPairs = [
    ["Strict Data Retention Policies", "Data Retention Without Consent"],
    ["No Behavioral Tracking", "Behavioral Tracking"],
    ["Strong Encryption", "Weak Encryption Standards"],
    ["Child Privacy Protection", "Lack of Child Privacy Protections"]
  ];

  const detectedPros = prosCons.pros.filter(p => text.toLowerCase().includes(p.split(' ')[0].toLowerCase()));
  const detectedCons = prosCons.cons.filter(c => text.toLowerCase().includes(c.split(' ')[0].toLowerCase()));

  // Remove contradictions
  contradictoryPairs.forEach(([pro, con]) => {
    if (detectedPros.includes(pro) && detectedCons.includes(con)) {
      // Remove the con if the pro is detected
      detectedCons.splice(detectedCons.indexOf(con), 1);
    } else if (detectedCons.includes(con) && detectedPros.includes(pro)) {
      // Remove the pro if the con is detected
      detectedPros.splice(detectedPros.indexOf(pro), 1);
    }
  });

  // Ensure at least 4 pros and 4 cons are displayed
  const pros = detectedPros.length >= 4 ? [...new Set(detectedPros)] : [...new Set([...detectedPros, ...prosCons.pros.slice(0, 4 - detectedPros.length)])];
  const cons = detectedCons.length >= 4 ? [...new Set(detectedCons)] : [...new Set([...detectedCons, ...prosCons.cons.slice(0, 4 - detectedCons.length)])];

  // Generate a dynamic summary message based on detected pros and cons
  const generateMessage = () => {
    const templates = [
      `This website has notable positives, such as ${pros.slice(0, 2).join(", ")}, but also concerning issues like ${cons.slice(0, 2).join(", ")}.`,
      `While this website demonstrates good practices like ${pros.slice(0, 2).join(", ")}, it also has drawbacks, including ${cons.slice(0, 2).join(", ")}.`,
      `Users should be aware that this website offers benefits such as ${pros.slice(0, 2).join(", ")}, but it also raises concerns like ${cons.slice(0, 2).join(", ")}.`,
      `This website balances positives like ${pros.slice(0, 2).join(", ")} with negatives such as ${cons.slice(0, 2).join(", ")}. Proceed with caution.`,
      `The website provides advantages like ${pros.slice(0, 2).join(", ")}, but users should note issues like ${cons.slice(0, 2).join(", ")}.`
    ];

    // Randomly select a template
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    return randomTemplate;
  };

  const summary = generateMessage();

  // Calculate a score based on detected terms
  const score = Math.min(100, 50 + (detected.length * 5));

  return {
    detectedTerms: detected,
    pros,
    cons,
    score,
    summary
  };
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeText") {
    chrome.storage.local.get(['mode'], ({ mode }) => {
      if (mode === 'ai') {
        fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{
              role: "system",
              content: "Return JSON with {pros:[], cons:[], summary:string, score:number}"
            }, {
              role: "user",
              content: request.text.substring(0, 8000)
            }]
          })
        })
        .then(r => r.json())
        .then(data => sendResponse(data.choices[0].message.content))
        .catch(() => sendResponse(analyzeWithAlgorithms(request.text)));
      } else {
        sendResponse(analyzeWithAlgorithms(request.text));
      }
    });
    return true;
  }
});

// Clear dark mode state from local storage
chrome.storage.local.remove('darkMode');