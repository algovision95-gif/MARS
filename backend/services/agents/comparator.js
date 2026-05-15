// Import AI utility functions
import { callAI, parseJSON } from '../aiService.js';

// System instruction for AI behavior
const SYSTEM = `
You are an expert research comparator.
Create structured comparison analyses.
`;

/**
 * Comparator Agent
 * -----------------
 * This agent analyzes research content
 * and generates a structured comparison table.
 */
export async function runComparator(content) {

  // Prompt sent to AI model
  const prompt = `
Analyze the following research content and create a comprehensive structured comparison table.

CONTENT:
${content.slice(0, 6000)}

Return a JSON array:
[
  {
    "aspect": "Research Approach",
    "evaluation": "Description",
    "strength": "High",
    "evidence": "Specific detail"
  },
  {
    "aspect": "Methodology Rigor",
    "evaluation": "Description",
    "strength": "Medium",
    "evidence": "Detail"
  },
  {
    "aspect": "Dataset Quality",
    "evaluation": "Description",
    "strength": "High",
    "evidence": "Detail"
  },
  {
    "aspect": "Results Clarity",
    "evaluation": "Description",
    "strength": "Medium",
    "evidence": "Detail"
  },
  {
    "aspect": "Reproducibility",
    "evaluation": "Description",
    "strength": "Low",
    "evidence": "Detail"
  },
  {
    "aspect": "Innovation Level",
    "evaluation": "Description",
    "strength": "High",
    "evidence": "Detail"
  },
  {
    "aspect": "Practical Impact",
    "evaluation": "Description",
    "strength": "Medium",
    "evidence": "Detail"
  }
]

Strength must be one of:
"High", "Medium", "Low"
`;

  try {

    // Call AI service
    const raw = await callAI(prompt, {
      systemPrompt: SYSTEM,
      jsonMode: true,
    });

    // Convert AI response into JSON
    const result = parseJSON(raw);

    // If valid array return result
    if (Array.isArray(result)) {
      return result;
    }

    // Fallback response
    return [
      {
        aspect: 'Overview',
        evaluation: raw,
        strength: 'Medium',
        evidence: '',
      },
    ];

  } catch (err) {

    // Handle API or parsing errors
    return [
      {
        aspect: 'Methodology',
        evaluation: 'Analysis pending',
        strength: 'Medium',
        evidence: `API Error: ${err.message}`,
      },
      {
        aspect: 'Results',
        evaluation: 'Analysis pending',
        strength: 'Medium',
        evidence: 'Please check API keys',
      },
    ];
  }
}
