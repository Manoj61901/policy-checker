// assets/ai-mode.js

/**
 * AI Policy Analysis using DeepSeek AI
 * This script uses DeepSeek's API for analyzing legal policies.
 */ 

const DEEPSEEK_PROVIDER = {
  name: "DeepSeek",
  endpoint: "https://api.deepseek.com/v1/chat/completions",
  freeLimit: 1000,
  params: {
    model: "deepseek-chat",
    max_tokens: 1000,
    temperature: 0.7
  }
};

const SYSTEM_PROMPT = `You are a legal policy analyst with expertise in analyzing policies. Analyze the provided text and return:
{
  "pros": [/* positive aspects */],
  "cons": [/* potential risks */],
  "violations": [/* compliance issues */],
  "summary": "brief overview",
  "score": 0-100
}`;

/**
 * Main function to analyze policy text using DeepSeek AI.
 * @param {string} text - The policy text to analyze.
 * @returns {Promise<object>} - The analysis result.
 */
export async function analyzeWithAI(text) {
  try {
    console.log(`Using ${DEEPSEEK_PROVIDER.name}...`);
    const result = await callAIProvider(DEEPSEEK_PROVIDER, text);
    return result;
  } catch (error) {
    console.error(`${DEEPSEEK_PROVIDER.name} failed:`, error);
    throw new Error("DeepSeek AI service is unavailable");
  }
}

/**
 * Calls the DeepSeek API to analyze the policy text.
 * @param {object} provider - The AI provider configuration.
 * @param {string} text - The policy text to analyze.
 * @returns {Promise<object>} - The parsed response from the AI.
 */
async function callAIProvider(provider, text) {
  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Analyze this policy text:\n\n${text.substring(0, 8000)}`
        }
      ],
      ...provider.params
    })
  });

  if (!response.ok) {
    throw new Error(`${provider.name} API error: ${response.status}`);
  }

  const data = await response.json();
  return parseAIResponse(data);
}

/**
 * Parses the response from DeepSeek AI.
 * @param {object} data - The raw response from the AI API.
 * @returns {object} - The normalized analysis result.
 */
function parseAIResponse(data) {
  try {
    const content = data.choices?.[0]?.message?.content || data.result;
    const result = JSON.parse(content);

    return {
      mode: "ai",
      pros: result.pros || [],
      cons: result.cons || [],
      violations: result.violations || [],
      summary: result.summary || "AI analysis completed",
      score: Math.max(0, Math.min(100, result.score || 50)),
      sources: ["DeepSeek AI"]
    };
  } catch (error) {
    throw new Error("Failed to parse DeepSeek AI response");
  }
}

/**
 * Fallback function if DeepSeek AI is unavailable.
 * @param {string} text - The policy text to analyze.
 * @returns {object} - A fallback response.
 */
export function getLocalFallback(text) {
  return {
    mode: "ai-fallback",
    pros: ["AI service unavailable"],
    cons: ["Using local analysis"],
    violations: [],
    summary: "DeepSeek AI services are currently unavailable",
    score: 50,
    sources: ["Local Fallback"]
  };
}

// For Node.js compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    analyzeWithAI,
    getLocalFallback
  };
}

import { analyzeWithAI, getLocalFallback } from './ai-mode.js';

const policyText = "Your policy text here...";
analyzeWithAI(policyText)
  .then(result => console.log("Analysis Result:", result))
  .catch(error => console.error("Error:", error));

const fallbackResult = getLocalFallback(policyText);
console.log("Fallback Result:", fallbackResult);