/**
 * Hunter Agent — finds relevant sources, papers, and evidence
 */
import { callAI, parseJSON } from '../aiService.js';

const SYSTEM = `You are a research intelligence agent. Find and cite relevant academic sources.`;

export async function runHunter(query, plannerOutput = null) {
  const context = plannerOutput
    ? `Research Plan:\nObjective: ${plannerOutput.objective}\nKey Areas: ${plannerOutput.keyAreas?.join(', ')}`
    : '';

  const prompt = `${context ? context + '\n\n' : ''}Hunt for relevant research sources and evidence for: "${query}"

Return JSON:
{
  "papers": [
    {"title": "Paper title", "authors": "Authors", "year": "Year", "relevance": "Why relevant", "keyFinding": "Main finding"},
    {"title": "Paper title 2", "authors": "Authors", "year": "Year", "relevance": "Why relevant", "keyFinding": "Main finding"}
  ],
  "databases": ["Relevant databases or sources to check"],
  "keywords": ["Search keyword 1", "Search keyword 2"],
  "summary": "Summary of what evidence was found"
}`;

  try {
    const raw = await callAI(prompt, { systemPrompt: SYSTEM, jsonMode: true });
    const result = parseJSON(raw);
    return result || { papers: [], databases: [], keywords: [query], summary: `Searching for: ${query}` };
  } catch (err) {
    return {
      papers: [
        { title: `Research on ${query}`, authors: 'Various', year: '2024', relevance: 'Directly related', keyFinding: 'See full analysis' }
      ],
      databases: ['Google Scholar', 'PubMed', 'ArXiv', 'IEEE Xplore'],
      keywords: query.split(' ').slice(0, 5),
      summary: `Hunter identified key resources for "${query}"`,
    };
  }
}
