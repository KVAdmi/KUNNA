import 'dotenv/config';

const API_KEY = process.env.GOOGLE_API_KEY;
const URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export async function askGemini(prompt) {
  const r = await fetch(`${URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] })
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Gemini ${r.status}: ${err}`);
  }
  const data = await r.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
