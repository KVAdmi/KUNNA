import React, { useContext } from 'react';
import { SOSContext } from '../contexts/SOSContext';

const SOSButton = () => {
  const { isActive, startSOS, stopSOS } = useContext(SOSContext);

  const handleClick = () => {
    if (!isActive) {
      startSOS();
    }
  };

  const handleLongPress = async () => {
    if (isActive) {
      // Mostrar diálogo de PIN
      const pin = prompt('Ingresa tu PIN para detener el SOS:');
      if (pin) {
        const isRealPin = pin === '1234'; // TODO: Usar PIN real
        await stopSOS(isRealPin);
      }
    }
  };

  return (
    <button 
      className={`fixed bottom-20 right-4 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all ${
        isActive ? 'bg-red-600 animate-pulse' : 'bg-[#E63946]'
      }`}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
      onTouchStart={(e) => {
        if (isActive) {
          const timer = setTimeout(() => handleLongPress(), 2000);
          e.target.dataset.longPressTimer = timer;
        }
      }}
      onTouchEnd={(e) => {
        const timer = e.target.dataset.longPressTimer;
        if (timer) clearTimeout(timer);
      }}
    >
      <span className="text-white text-xl font-bold">SOS</span>
    </button>
  );
};

export default SOSButton;
