/**
 * Planner Agent — breaks down the research query into a structured plan
 */
import { callAI, parseJSON } from '../aiService.js';

const SYSTEM = `You are a research planning expert. Create structured research plans.`;

export async function runPlanner(query) {
  const prompt = `Create a research plan for: "${query}"

Return JSON:
{
  "objective": "Primary goal of this research mission",
  "roadmap": ["Phase 1: Literature Hunt", "Phase 2: Data Synthesis", "Phase 3: Gap Detection"],
  "methodology": "Step-by-step analytical approach (e.g. Meta-analysis, Qualitative comparison)",
  "subQuestions": ["Critical research question 1", "Critical research question 2"],
  "expectedOutcome": "Detailed insight into [Topic]",
  "researchFocus": ["Technical aspects", "Industry impact", "Theoretical limits"]
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
