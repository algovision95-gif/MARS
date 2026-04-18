import { callAI, parseJSON } from '../aiService.js';

const SYSTEM = `You are an expert logical analyst specializing in detecting contradictions in research.`;

export async function runContradictionDetector(content) {
  const prompt = `Carefully analyze the following content for any conflicting claims, inconsistencies, or logical contradictions.

CONTENT:
${content.slice(0, 8000)}

Return a JSON array. If no contradictions found, return []:
[
  {
    "claim1": "First statement or claim (with context)",
    "claim2": "Contradicting statement or claim (with context)",
    "severity": "High",
    "type": "Factual Contradiction",
    "explanation": "Why these two claims are in conflict and the implications"
  }
]

Severity: "High" | "Medium" | "Low"
Type: "Factual Contradiction" | "Methodological Inconsistency" | "Statistical Conflict" | "Logical Fallacy" | "Scope Mismatch"

Be thorough — look for subtle contradictions, not just obvious ones.`;

  try {
    const raw = await callAI(prompt, { systemPrompt: SYSTEM, jsonMode: true });
    const result = parseJSON(raw);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    return [{
      claim1: 'API unavailable',
      claim2: 'N/A',
      severity: 'Low',
      type: 'System Error',
      explanation: `API error: ${err.message}. Please check your API keys.`,
    }];
  }
}
