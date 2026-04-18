/**
 * Planner Agent — breaks down the research query into a structured plan
 */
import { callAI, parseJSON } from '../aiService.js';

const SYSTEM = `You are a research planning expert. Create structured research plans.`;

export async function runPlanner(query) {
  const prompt = `Create a research plan for: "${query}"

Return JSON:
{
  "objective": "Clear statement of the research objective",
  "subQuestions": ["Question 1", "Question 2", "Question 3"],
  "approach": "Research methodology and approach",
  "keyAreas": ["Area 1", "Area 2", "Area 3"],
  "expectedOutcome": "What we expect to find"
}`;

  try {
    const raw = await callAI(prompt, { systemPrompt: SYSTEM, jsonMode: true });
    const result = parseJSON(raw);
    return result || { objective: query, subQuestions: [], approach: 'Analysis', keyAreas: [], expectedOutcome: '' };
  } catch (err) {
    return {
      objective: query,
      subQuestions: [`What is ${query}?`, `Key findings in ${query}`, `Applications of ${query}`],
      approach: 'Literature review and analysis',
      keyAreas: ['Background', 'Methodology', 'Findings'],
      expectedOutcome: 'Comprehensive understanding of the topic',
    };
  }
}
