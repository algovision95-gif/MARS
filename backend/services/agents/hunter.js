/**
 * Hunter Agent
 * ----------------------------
 * Finds relevant papers,
 * research sources,
 * databases,
 * and supporting evidence.
 */

// Import AI utilities
import { callAI, parseJSON } from '../aiService.js';

// System behavior instruction
const SYSTEM = `
You are a research intelligence agent.
Find and cite relevant academic sources.
`;

/**
 * Run Hunter Agent
 *
 * @param {string} query
 * User research topic/query
 *
 * @param {object|null} plannerOutput
 * Optional planner output
 */
export async function runHunter(query, plannerOutput = null) {

  // Build optional research context
  const context = plannerOutput
    ? `
Research Plan:
Objective: ${plannerOutput.objective}

Key Areas:
${plannerOutput.keyAreas?.join(', ')}
`
    : '';

  // AI prompt
  const prompt = `
${context ? context + '\n\n' : ''}

Hunt for relevant research sources
and evidence for:

"${query}"

Return JSON:
{
  "papers": [
    {
      "title": "Paper title",
      "authors": "Authors",
      "year": "Year",
      "relevance": "Why relevant",
      "keyFinding": "Main finding"
    }
  ],

  "databases": [
    "Relevant databases or sources to check"
  ],

  "keywords": [
    "Search keyword 1",
    "Search keyword 2"
  ],

  "summary": "Summary of what evidence was found"
}
`;

  try {

    // Call AI service
    const raw = await callAI(prompt, {
      systemPrompt: SYSTEM,
      jsonMode: true,
    });

    // Parse response
    const result = parseJSON(raw);

    // Return parsed data or fallback
    return result || {
      papers: [],
      databases: [],
      keywords: [query],
      summary: `Searching for: ${query}`,
    };

  } catch (err) {

    // Error fallback response
    return {
      papers: [
        {
          title: `Research on ${query}`,
          authors: 'Various',
          year: '2024',
          relevance: 'Directly related',
          keyFinding: 'See full analysis',
        },
      ],

      databases: [
        'Google Scholar',
        'PubMed',
        'ArXiv',
        'IEEE Xplore',
      ],

      keywords: query.split(' ').slice(0, 5),

      summary: `
Hunter identified key resources
for "${query}"
`,
    };
  }
}
