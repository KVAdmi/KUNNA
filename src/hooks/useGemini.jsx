import { useState } from 'react';

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askGemini = async (prompt) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al comunicarse con Gemini');
      }
      
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (err) {
      setError(err.message);
      return '';
    } finally {
      setLoading(false);
    }
  };

  return { askGemini, loading, error };
};
