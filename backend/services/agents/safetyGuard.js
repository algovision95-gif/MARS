/**
 * Safety Guard — detects harmful/suicidal/abusive queries
 */
import { callAI, parseJSON } from '../aiService.js';

const SAFETY_SYSTEM = `You are a content safety classifier. Analyze the user query and return a JSON object ONLY.`;

const HARMFUL_PATTERNS = [
  /\b(kill|murder|shoot|stab|bomb|explode|terrorist|attack)\b.*\b(people|person|human|someone)\b/i,
  /\b(how to|instructions? for|steps? to)\b.*\b(harm|hurt|injure|maim)\b/i,
  /\b(suicide|self.harm|cut myself|end my life|kill myself|want to die)\b/i,
  /\b(fuck you|piece of shit|go to hell|worthless)\b/i,
];

export async function safetyCheck(query) {
  // Fast local pattern check first
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(query)) {
      const type = /suicide|self.harm|kill myself|want to die/i.test(query) ? 'suicidal'
        : /fuck|shit|hell|worthless/i.test(query) ? 'abusive' : 'harmful';
      return { safe: false, type, severity: 'High', localDetect: true };
    }
  }

  // AI-based check for ambiguous cases
  try {
    const prompt = `Classify this query for safety: "${query.slice(0, 500)}"
Return JSON: {"safe": true/false, "type": "clean"|"harmful"|"suicidal"|"abusive", "severity": "Low"|"Medium"|"High", "reason": "brief reason"}`;
    
    const raw = await callAI(prompt, { systemPrompt: SAFETY_SYSTEM, jsonMode: true });
    const result = parseJSON(raw);
    if (result && typeof result.safe === 'boolean') return result;
  } catch (_) {}

  return { safe: true, type: 'clean', severity: 'Low' };
}
