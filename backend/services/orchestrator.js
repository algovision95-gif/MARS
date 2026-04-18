/**
 * MARS Orchestrator — 5-Agent Pipeline
 * Planner → Hunter → Reader → Comparator → Detector
 */
import { runPlanner } from './agents/planner.js';
import { runHunter } from './agents/hunter.js';
import { runPaperReader } from './agents/paperReader.js';
import { runComparator } from './agents/comparator.js';
import { runContradictionDetector } from './agents/contradictionDetector.js';
import { safetyCheck } from './agents/safetyGuard.js';
import { callAI } from './aiService.js';
import Upload from '../models/Upload.js';

/**
 * Generate a ChatGPT-style comprehensive search response
 */
async function generateSearchResponse(query, content) {
  const systemPrompt = `You are MARS, an elite AI research assistant. Provide comprehensive, well-structured answers like a knowledgeable expert. Use markdown formatting with headers, bullet points, and emphasis. Be thorough yet readable.`;

  const prompt = `Answer this research question comprehensively: "${query}"

${content && content.length > 100 ? `\nContext from documents:\n${content.slice(0, 4000)}` : ''}

Provide:
1. A clear overview/definition
2. Key concepts and principles  
3. Current state of research/knowledge
4. Important findings or applications
5. Challenges and open questions

Format your response with markdown headers and bullet points for clarity.`;

  try {
    return await callAI(prompt, { systemPrompt, model: 'openai/gpt-4o-mini' });
  } catch (err) {
    return `## ${query}\n\nI encountered an issue generating a full response. Please check your AI API configuration.\n\n*Error: ${err.message}*`;
  }
}

/**
 * Calculate a confidence score based on output quality
 */
function calculateConfidence(paperReader, comparator, contradictions, searchResult) {
  let score = 60; // base

  if (paperReader?.summary && paperReader.summary.length > 50) score += 10;
  if (paperReader?.methodology && paperReader.methodology.length > 30) score += 5;
  if (paperReader?.results && paperReader.results.length > 30) score += 5;
  if (Array.isArray(comparator) && comparator.length >= 5) score += 10;
  if (Array.isArray(contradictions)) score += 5; // at least tried
  if (searchResult && searchResult.length > 200) score += 5;

  return Math.min(98, Math.max(40, score));
}

/**
 * Guest search — only AI search response, no agents
 */
export async function guestSearch({ query }) {
  const safety = await safetyCheck(query);
  if (!safety.safe) {
    return { safetyFlag: safety.type, safetyMessage: getSafetyMessage(safety.type), query };
  }

  const searchResult = await generateSearchResponse(query, '');
  const confidenceScore = 70;

  return {
    query,
    searchResult,
    confidenceScore,
    isGuestResult: true,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Full orchestration — all 5 agents (requires login + PRO/PREMIUM)
 */
export async function orchestrate({ query, fileIds = [], agents = ['all'] }) {
  // Safety check first
  const safety = await safetyCheck(query);
  if (!safety.safe) {
    return { safetyFlag: safety.type, safetyMessage: getSafetyMessage(safety.type), query };
  }

  // Build content from query + uploaded files
  let content = `Research Topic: ${query}`;
  if (fileIds.length > 0) {
    const uploads = await Upload.find({
      _id: { $in: fileIds },
      status: 'processed',
      extractedText: { $exists: true, $ne: '' },
    });
    if (uploads.length > 0) {
      const fileTexts = uploads
        .map((u) => `\n--- Document: ${u.originalName} ---\n${u.extractedText}`)
        .join('\n\n');
      content = `Research Query: ${query}\n\n${fileTexts}`;
    }
  }

  const runAll = agents.includes('all');

  // Step 1: Planner (always runs)
  const plannerOutput = await runPlanner(query);

  // Step 2: Hunter (always runs)
  const hunterOutput = await runHunter(query, plannerOutput);

  // Steps 3-5: Run concurrently
  const [paperReader, comparator, contradictions, searchResult] = await Promise.all([
    runAll || agents.includes('paperReader') ? runPaperReader(content) : Promise.resolve(null),
    runAll || agents.includes('comparator') ? runComparator(content) : Promise.resolve(null),
    runAll || agents.includes('contradictionDetector') ? runContradictionDetector(content) : Promise.resolve(null),
    generateSearchResponse(query, content),
  ]);

  const confidenceScore = calculateConfidence(paperReader, comparator, contradictions, searchResult);

  return {
    query,
    plannerOutput,
    hunterOutput,
    paperReader,
    comparator,
    contradictions,
    searchResult,
    confidenceScore,
    safetyFlag: 'clean',
    analyzedAt: new Date().toISOString(),
    contentLength: content.length,
  };
}

function getSafetyMessage(type) {
  const messages = {
    suicidal: '⚠️ We detected signs of distress in your query. If you\'re struggling, please reach out to iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345 (24/7). You are not alone.',
    harmful: '⚠️ This query contains potentially harmful content and cannot be processed. Please rephrase your question.',
    abusive: '⚠️ Abusive language detected. Please maintain respectful communication.',
  };
  return messages[type] || '⚠️ This query cannot be processed for safety reasons.';
}
