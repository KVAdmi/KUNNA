require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;

async function run() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hola Gemini desde Node.js 🚀" }] }]
      })
    }
  );

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

run().catch(console.error);
