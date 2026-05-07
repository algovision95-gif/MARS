/**
 * Insight Generator Agent — Generates conclusions, trends, and key findings
 */
import { callAI, parseJSON } from '../aiService.js';

export async function runInsightGenerator(content, papers = []) {
  const prompt = `You are a visionary research analyst. Your goal is to identify unexplored research gaps and innovation opportunities.
  
  CONTENT:
  ${content.slice(0, 12000)}

${papers.length > 0 ? `Papers analyzed: ${JSON.stringify(papers.slice(0, 10))}` : ''}
  
  Return JSON:
  {
    "researchGaps": [
      {
        "title": "Clear name of the gap",
        "description": "Deep technical explanation of the opportunity"
      }
    ],
    "innovationOpportunities": [
      {
        "title": "Specific innovation idea",
        "description": "How to create something novel"
      }
    ],
    "missingDatasets": ["Dataset 1", "Dataset 2"],
    "futureDirections": ["Direction 1", "Direction 2"]
  }

Return ONLY valid JSON. Be thorough and analytical.`;

  try {
    const raw = await callAI(prompt, {
      systemPrompt: 'You are a research insight generator. Always return valid JSON.',
      model: 'openai/gpt-4o-mini',
      jsonMode: true,
    });
    return parseJSON(raw) || { keyFindings: [], trends: [], conclusions: [], recommendations: [] };
  } catch (err) {
    console.error('InsightGenerator error:', err.message);
    return { keyFindings: [], trends: [], conclusions: [], recommendations: [] };
  }
}
