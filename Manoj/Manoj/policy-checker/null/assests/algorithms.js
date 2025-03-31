// assets/algorithms.js

// Policy terms to detect (simplified for zero-cost implementation)
const POLICY_TERMS = [
    "cookies", "privacy policy", "terms of service", 
    "data collection", "GDPR", "CCPA", "HIPAA",
    "data retention", "third-party sharing", "account deletion",
    "arbitration", "dispute resolution", "governing law"
  ]; 
   
  // Term weights for scoring (positive = good, negative = bad)
  const TERM_WEIGHTS = {
    "GDPR": 5,
    "CCPA": 4,
    "HIPAA": 4,
    "account deletion": 3,
    "dispute resolution": 2,
    "privacy policy": 1,
    "data retention": -2,
    "third-party sharing": -3,
    "arbitration": -2,
    "governing law": -1
  };
  
  // Pros/cons mappings
  const TERM_MAPPINGS = {
    "GDPR": { 
      pros: ["GDPR Compliance"], 
      cons: [] 
    },
    "account deletion": { 
      pros: ["Easy Account Deletion"], 
      cons: [] 
    },
    "third-party sharing": { 
      pros: [], 
      cons: ["Third-Party Data Sharing"] 
    },
    "arbitration": { 
      pros: [], 
      cons: ["Mandatory Arbitration"] 
    }
  };
  
  // Algorithm 1: Simple Term Matching
  function simpleTermMatching(text) {
    const detectedTerms = POLICY_TERMS.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );
  
    const pros = [];
    const cons = [];
  
    detectedTerms.forEach(term => {
      if (TERM_MAPPINGS[term]) {
        pros.push(...TERM_MAPPINGS[term].pros);
        cons.push(...TERM_MAPPINGS[term].cons);
      }
    });
  
    return {
      detectedTerms,
      pros: [...new Set(pros)],
      cons: [...new Set(cons)]
    };
  }
  
  // Algorithm 2: Weighted Scoring
  function weightedTermAnalysis(text) {
    let score = 50; // Neutral baseline
    const detectedTerms = [];
    const pros = [];
    const cons = [];
  
    Object.entries(TERM_WEIGHTS).forEach(([term, weight]) => {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        detectedTerms.push(term);
        score += weight;
  
        if (TERM_MAPPINGS[term]) {
          pros.push(...TERM_MAPPINGS[term].pros);
          cons.push(...TERM_MAPPINGS[term].cons);
        }
      }
    });
  
    // Cap score between 0-100
    score = Math.max(0, Math.min(100, score));
  
    return {
      detectedTerms,
      pros: [...new Set(pros)],
      cons: [...new Set(cons)],
      score: Math.round(score)
    };
  }
  
  // Algorithm 3: Contextual Analysis (Combines both approaches)
  function contextualAnalysis(text) {
    const simpleResults = simpleTermMatching(text);
    const weightedResults = weightedTermAnalysis(text);
  
    // Combine results
    const allTerms = [...new Set([
      ...simpleResults.detectedTerms,
      ...weightedResults.detectedTerms
    ])];
  
    const allPros = [...new Set([
      ...simpleResults.pros,
      ...weightedResults.pros
    ])];
  
    const allCons = [...new Set([
      ...simpleResults.cons,
      ...weightedResults.cons
    ])];
  
    // Generate summary
    let summary;
    if (allPros.length > 0 && allCons.length > 0) {
      summary = `This policy has positive aspects like ${allPros.slice(0, 2).join(', ')} ` +
                `but also includes ${allCons.slice(0, 2).join(', ')}.`;
    } else if (allPros.length > 0) {
      summary = `Generally positive policies including ${allPros.slice(0, 3).join(', ')}.`;
    } else if (allCons.length > 0) {
      summary = `Several concerns found including ${allCons.slice(0, 3).join(', ')}.`;
    } else {
      summary = "No significant policy terms detected.";
    }
  
    return {
      detectedTerms: allTerms,
      pros: allPros,
      cons: allCons,
      score: weightedResults.score,
      summary
    };
  }
  
  // Main exported function
  export function analyzeWithAlgorithms(text) {
    return contextualAnalysis(text);
  }
  
  // For Node.js compatibility
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      simpleTermMatching,
      weightedTermAnalysis,
      contextualAnalysis,
      analyzeWithAlgorithms
    };
  }