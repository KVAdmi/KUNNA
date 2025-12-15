import { askGemini } from './geminiClient.js';

(async () => {
  const answer = await askGemini("Escribe un saludo bonito para Zinha");
  console.log(answer);
})();
