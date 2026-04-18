/**
 * AI Service — OpenRouter (primary) + Gemini (fallback)
 */
import { GoogleGenAI } from '@google/genai';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export async function callAI(prompt, { systemPrompt = '', model = 'openai/gpt-4o-mini', jsonMode = false } = {}) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  
  // --- OpenRouter primary ---
  if (openRouterKey && !openRouterKey.startsWith('YOUR_')) {
    try {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://mars-research.app',
          'X-Title': 'MARS Research Platform',
        },
        body: JSON.stringify({
          model,
          messages,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.choices?.[0]?.message?.content || '';
      }
    } catch (err) {
      console.warn('⚠️  OpenRouter failed, falling back to Gemini:', err.message);
    }
  }

  // --- Gemini fallback ---
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.startsWith('YOUR_')) {
    throw new Error('No valid AI API key configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY in .env');
  }
  const ai = new GoogleGenAI({ apiKey: geminiKey });
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: fullPrompt,
  });
  return response.text;
}

export function parseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}
