import { useState } from 'react';
import { useGemini } from '../hooks/useGemini';

export function GeminiChat() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const { askGemini, loading, error } = useGemini();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const result = await askGemini(prompt);
    setResponse(result);
    setPrompt('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe tu pregunta..."
          className="w-full p-2 border rounded"
          rows={4}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Pensando...' : 'Enviar'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}
