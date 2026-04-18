import { callAI, parseJSON } from '../aiService.js';

const SYSTEM = `You are an expert AI research analyst. Extract structured information from research content.`;

export async function runPaperReader(content) {
  const prompt = `Deeply analyze the following research content and extract key information.

CONTENT:
${content.slice(0, 8000)}

Return JSON:
{
  "methodology": "Detailed description of the research methodology used",
  "dataset": "Description of datasets, data sources, or input data used",
  "results": "Key findings, metrics, performance scores, and outcomes",
  "limitations": "Described or apparent limitations of the research",
  "summary": "A 2-3 sentence executive summary of the research",
  "keyContributions": ["Contribution 1", "Contribution 2"],
  "futureWork": "Suggested future research directions"
}`;

  try {
    const raw = await callAI(prompt, { systemPrompt: SYSTEM, jsonMode: true });
    const result = parseJSON(raw);
    if (result) return result;
    return { methodology: raw.slice(0, 300), dataset: '', results: '', limitations: '', summary: raw.slice(0, 200) };
  } catch (err) {
    return {
      methodology: `Analysis of: "${content.slice(0, 150)}..."`,
      dataset: 'Could not extract — check API key',
      results: 'Could not extract — check API key',
      limitations: `API Error: ${err.message}`,
      summary: 'Paper Reader agent encountered an error. Please verify your API keys.',
    };
  }
}
