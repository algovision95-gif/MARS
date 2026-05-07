import { callAI, parseJSON } from '../aiService.js';

const SYSTEM = `You are an expert logical analyst specializing in detecting contradictions in research.`;

export async function runContradictionDetector(content) {
  const prompt = `Carefully analyze the following content for any conflicting claims, inconsistencies, or logical contradictions between different papers or sections.
  
  CONTENT:
  ${content.slice(0, 10000)}
  
  Return a JSON array. If no contradictions are found, return [].
  
  Format:
{
  "contradictions": [
    {
      "claim": "Summary of the primary claim",
      "conflict": "Explanation of the conflict",
      "severity": "High",
      "sources": ["Source A", "Source B"]
    }
  ],
  "evidenceMismatch": [
    {"point": "Point of mismatch", "detail": "Technical details"}
  ],
  "unsupportedClaims": ["Claim 1", "Claim 2"],
  "confidenceAnalysis": "Professional summary of the overall evidence reliability"
}`;

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
