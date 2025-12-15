import React, { useState } from 'react';

const TestInputPage = () => {
  const [text, setText] = useState('');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f0f0',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <input
        type="text"
        placeholder="Escribe algo aquí"
        value={text}
        onChange={(e) => setText(e.target.value)}
        inputMode="text"
        autoComplete="off"
        style={{
          padding: '1rem',
          fontSize: '18px',
          borderRadius: '12px',
          border: '1px solid #ccc',
          backgroundColor: 'white',
          color: 'black',
          width: '100%'
        }}
      />
    </div>
  );
};

export default TestInputPage;
