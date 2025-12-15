// gemini-rest-test.cjs
require("dotenv").config();

const url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=" +
  process.env.GEMINI_API_KEY;

const body = {
  contents: [{ parts: [{ text: "Di solo: OK" }] }],
};

(async () => {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  console.log(
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? data
  );
})();
