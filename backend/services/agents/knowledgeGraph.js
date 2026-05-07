/**
 * Knowledge Graph Agent — Extracts entities and relationships for Neo4j storage
 */
import { callAI, parseJSON } from '../aiService.js';

export async function runKnowledgeGraphExtractor(content) {
  const prompt = `You are a knowledge graph extraction expert. Analyze the following research content and extract entities and relationships suitable for a knowledge graph database.

Research Content:
${content.slice(0, 5000)}

Extract and return as valid JSON with this structure:
{
  "papers": [
    { "title": "Paper name", "year": "2024", "method": "Method used", "accuracy": "Performance metric", "authors": "Author names" }
  ],
  "topics": ["Topic 1", "Topic 2"],
  "relationships": [
    { "from": "Paper A title", "to": "Paper B title", "type": "CITES|CONTRADICTS|EXTENDS|COMPARES_TO", "description": "Brief reason" }
  ],
  "entities": [
    { "name": "Entity name", "type": "Method|Dataset|Metric|Organization", "description": "Brief description" }
  ]
}

Be thorough. Extract real paper names, methods, and datasets mentioned. Return ONLY valid JSON.`;

  try {
    const raw = await callAI(prompt, {
      systemPrompt: 'You are a knowledge graph entity extractor. Always return valid JSON.',
      model: 'openai/gpt-4o-mini',
      jsonMode: true,
    });
    return parseJSON(raw) || { papers: [], topics: [], relationships: [], entities: [] };
  } catch (err) {
    console.error('KnowledgeGraph extractor error:', err.message);
    return { papers: [], topics: [], relationships: [], entities: [] };
  }
}
