import { callAI, parseJSON } from '../aiService.js';

const SYSTEM = `You are an expert AI research analyst. Extract structured information from research content.`;

export async function runPaperReader(content) {
  const prompt = `Deeply analyze the following research content. Your goal is to provide a peer-review level analysis.
  
  CONTENT:
  ${content.slice(0, 15000)}
  
  Return JSON:
  {
    "methodology": "Technical deep dive into the research design, variables, and framework",
    "datasets": ["Specific dataset A", "Specific dataset B"],
    "findings": ["Finding 1", "Finding 2"],
    "limitations": "Critical analysis of research constraints or potential biases",
    "innovationScore": 8.5, 
    "innovationRationale": "Explanation of why this score was given",
    "futureWork": ["Research question 1", "Research question 2"]
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
