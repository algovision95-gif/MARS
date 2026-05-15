// Import AI helper functions
import { callAI, parseJSON } from '../aiService.js';

// System role for contradiction detection
const SYSTEM = `
You are an expert logical analyst
specializing in detecting contradictions in research.
`;

/**
 * Contradiction Detector Agent
 * ----------------------------
 * Detects conflicting claims,
 * inconsistencies, and logical issues
 * inside research content.
 */
export async function runContradictionDetector(content) {

  // AI prompt
  const prompt = `
Carefully analyze the following content for any conflicting claims,
inconsistencies, or logical contradictions.

CONTENT:
${content.slice(0, 8000)}

Return a JSON array.
If no contradictions found, return []:

[
  {
    "claim1": "First statement or claim (with context)",
    "claim2": "Contradicting statement or claim (with context)",
    "severity": "High",
    "type": "Factual Contradiction",
    "explanation": "Why these two claims are in conflict"
  }
]

Severity:
"High" | "Medium" | "Low"

Type:
"Factual Contradiction"
"Methodological Inconsistency"
"Statistical Conflict"
"Logical Fallacy"
"Scope Mismatch"

Be thorough — look for subtle contradictions.
`;

  try {

    // Call AI model
    const raw = await callAI(prompt, {
      systemPrompt: SYSTEM,
      jsonMode: true,
    });

    // Parse AI response
    const result = parseJSON(raw);

    // Return parsed array
    return Array.isArray(result)
      ? result
      : [];

  } catch (err) {

    // Fallback error response
    return [
      {
        claim1: 'API unavailable',
        claim2: 'N/A',
        severity: 'Low',
        type: 'System Error',
        explanation: `
API error: ${err.message}.
Please check your API keys.
`,
      },
    ];
  }
}
