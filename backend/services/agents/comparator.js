import { callAI, parseJSON } from '../aiService.js';

const SYSTEM = `You are an expert research comparator. Create structured comparison analyses.`;

export async function runComparator(content) {
  const prompt = `Analyze the following research content and create a comprehensive structured comparison table.

CONTENT:
${content.slice(0, 6000)}

Return a JSON array:
[
  {"aspect": "Research Approach", "evaluation": "Description", "strength": "High", "evidence": "Specific detail"},
  {"aspect": "Methodology Rigor", "evaluation": "Description", "strength": "Medium", "evidence": "Detail"},
  {"aspect": "Dataset Quality", "evaluation": "Description", "strength": "High", "evidence": "Detail"},
  {"aspect": "Results Clarity", "evaluation": "Description", "strength": "Medium", "evidence": "Detail"},
  {"aspect": "Reproducibility", "evaluation": "Description", "strength": "Low", "evidence": "Detail"},
  {"aspect": "Innovation Level", "evaluation": "Description", "strength": "High", "evidence": "Detail"},
  {"aspect": "Practical Impact", "evaluation": "Description", "strength": "Medium", "evidence": "Detail"}
]

Strength must be one of: "High", "Medium", "Low"`;

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
