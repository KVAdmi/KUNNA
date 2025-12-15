import React, { useState } from 'react';
import supabase from '../lib/customSupabaseClient.js';

const EmailConfirmationHelper = () => {
  const [email, setEmail] = useState('pattogaribayg@gmail.com');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const resendConfirmation = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('✅ Email de confirmación reenviado. Revisa tu bandeja de entrada.');
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">🔗 Confirmar Email</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={resendConfirmation}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Enviando...' : 'Reenviar confirmación'}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Alternativamente:</strong></p>
        <p>Ve a Supabase → Authentication → Users → Marca tu email como confirmado</p>
      </div>
    </div>
  );
};

export default EmailConfirmationHelper;