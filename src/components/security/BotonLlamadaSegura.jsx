

import React, { useRef, useState } from 'react';
import supabase from '@/lib/customSupabaseClient';

export default function BotonLlamadaSegura() {
  const [llamando, setLlamando] = useState(false);
  const audioRef = useRef(null);

  const handleClick = async () => {
    try {
      setLlamando(true);
      // Obtener la URL pública del audio desde el bucket audios-seguridad
      const { data } = supabase.storage.from('audios-seguridad').getPublicUrl('Amiga Molesta.mp3');
      const audioUrl = data?.publicUrl;
      
      if (!audioUrl) {
        alert('Error: No se encontró el audio de seguridad');
        setLlamando(false);
        return;
      }
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        try {
          await audioRef.current.play();
        } catch (playError) {
          alert('Error al reproducir audio. Intenta de nuevo.');
          setLlamando(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error al cargar audio: ' + e.message);
      setLlamando(false);
    }
  };

  const handleAudioEnded = () => {
    setLlamando(false);
    window.location.href = 'tel:911';
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={{}}
        title={llamando ? 'Llamada en curso' : 'Simular llamada segura'}
      >
        {llamando ? '📞' : '📲'}
      </button>
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        autoPlay
        onEnded={handleAudioEnded}
      />
    </>
  );
}
