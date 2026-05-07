/**
 * AI Service — Gemini Flash (FREE primary) + OpenRouter (secondary)
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// Try Gemini first (free tier), then OpenRouter as secondary
export async function callAI(prompt, options = {}) {
  const { systemPrompt = '', model = 'openai/gpt-4o-mini' } = options;

  // PRIMARY: Gemini 1.5 Flash (free tier, generous limits)
  try {
    const result = await callGemini(prompt, systemPrompt, options);
    if (result && result.length > 50) return result;
    throw new Error('Empty Gemini response');
  } catch (geminiErr) {
    console.warn('⚠️  Gemini failed, trying OpenRouter:', geminiErr.message?.slice(0, 80));
  }

  // SECONDARY: OpenRouter
  try {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://algovision.ai',
        'X-Title': 'AlgoVision Research OS'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });

    const json = await response.json();
    if (json.choices?.[0]?.message?.content) {
      return json.choices[0].message.content;
    }
    throw new Error(json.error?.message || 'OpenRouter empty response');
  } catch (err) {
    console.error('[AI Error] Both AI services failed:', err.message?.slice(0, 80));
    return null;
  }
}

async function callGemini(prompt, systemPrompt, options) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try flash first, then pro as fallback
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-pro'];
  
  for (const modelName of models) {
    try {
      const modelInstance = genAI.getGenerativeModel({ model: modelName });
      const fullPrompt = systemPrompt 
        ? `${systemPrompt}\n\n${prompt}` 
        : prompt;
      
      const result = await modelInstance.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      if (text && text.length > 20) return text;
    } catch (e) {
      // try next model
      continue;
    }
  }
  throw new Error('All Gemini models failed');
}

export function parseJSON(text) {
  if (!text) return null;
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}
