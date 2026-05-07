import { callAI, parseJSON } from '../aiService.js';

const SYSTEM = `You are an expert research comparator. Create structured comparison analyses.`;

export async function runComparator(content) {
  const prompt = `Analyze the following research content and create a comprehensive structured comparison table.

CONTENT:
${content.slice(0, 6000)}

{
  "comparisonTable": [
    {"feature": "Feature name", "paperA": "Value A", "paperB": "Value B", "consensus": "Consensus text"}
  ],
  "evaluationMatrix": [
    {"aspect": "Aspect Name", "score": 9, "rationale": "Reasoning"}
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"]
}`;

  try {
    const raw = await callAI(prompt, { systemPrompt: SYSTEM, jsonMode: true });
    const result = parseJSON(raw);
    if (Array.isArray(result)) return result;
    return [{ aspect: 'Overview', evaluation: raw, strength: 'Medium', evidence: '' }];
  } catch (err) {
    return [
      { aspect: 'Methodology', evaluation: 'Analysis pending', strength: 'Medium', evidence: `API Error: ${err.message}` },
      { aspect: 'Results', evaluation: 'Analysis pending', strength: 'Medium', evidence: 'Please check API keys' },
    ];
  }
}
