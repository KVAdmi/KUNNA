import { askGemini } from './geminiClient.js';

console.log('🚀 Probando cliente Gemini...');

async function test() {
  try {
    console.log('Enviando pregunta a Gemini...');
    const txt = await askGemini('Escribe un haiku sobre la programación');
    console.log('\nRespuesta de Gemini:');
    console.log('------------------');
    console.log(txt);
    console.log('------------------');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
