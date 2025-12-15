import { useMemo, useState, useEffect, CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePinValidation from '../hooks/usePinValidation';
import JitsiMeetWrapper from '../components/JitsiMeetWrapper';

// --- Componente Modal (definido en el mismo archivo para simplicidad) ---
const PinModal = ({ isOpen, onClose, onValidate, isLoading, error }) => {
  const [pin, setPin] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onValidate(pin);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Ingresar PIN de Moderadora</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            style={inputStyle}
            disabled={isLoading}
          />
          <button type="submit" style={buttonStyle} disabled={isLoading}>
            {isLoading ? 'Validando...' : 'Validar'}
          </button>
        </form>
        {error && <p style={errorTextStyle}>{error}</p>}
        <button onClick={onClose} style={closeButtonStyle}>Cerrar</button>
      </div>
    </div>
  );
};


export default function ConferencePage() {
  const [sp] = useSearchParams();
  const room = useMemo(
    () => (sp.get('room') || 'zinha-sala-general').trim(),
    [sp]
  );

  // --- LÓGICA DE ESTADO CORREGIDA ---
  const [role, setRole] = useState<string | null>(null); // 1. Especificar el tipo del estado
  const [isPinModalOpen, setPinModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isModerator, setIsModerator] = useState(false);
  const [conferenceStarted, setConferenceStarted] = useState(false);
  
  const { validatePin, isLoading, error, isSuccess, reset } = usePinValidation();

  // Cuando la validación del PIN es exitosa
  useEffect(() => {
    if (isSuccess) {
      setIsModerator(true);
      setPinModalOpen(false);
      
      // Emitir evento global
      const event = new CustomEvent('jitsi:role', { detail: { moderator: true } });
      window.dispatchEvent(event);
      
      setConferenceStarted(true); // Iniciar la conferencia
    }
  }, [isSuccess]);


  // --- LÓGICA DE FUNCIÓN CORREGIDA ---
  // Se declara como una constante, no como una función de clase
  const handleRoleSelection = (selectedRole: string) => {
    setRole(selectedRole);
    if (selectedRole === 'moderator') {
      setPinModalOpen(true);
    } else {
      setConferenceStarted(true);
    }
  };
  
  const handlePinValidate = (pin: string) => { // Añadir tipo aquí también
    validatePin(pin, room);
  };

  const handleModalClose = () => {
    setPinModalOpen(false);
    reset(); // Limpiar estados del hook
  };
  

  if (conferenceStarted) {
    return (
      <JitsiMeetWrapper
        roomName={room}
        displayName={displayName || 'Invitado'}
        isModerator={isModerator}
        onApiReady={(api) => {
          // Puedes interactuar con la API de Jitsi aquí si es necesario
          console.log('Jitsi API is ready');
        }}
      />
    );
  }

  // --- Pantalla de selección de rol y nombre ---
  return (
    <div style={selectionContainerStyle}>
      <h2>Unirse a la conferencia</h2>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Tu nombre"
        style={inputStyle}
      />
      <div>
        <button style={buttonStyle} onClick={() => handleRoleSelection('guest')} disabled={!displayName}>
          Entrar como Invitada
        </button>
        <button style={buttonStyle} onClick={() => handleRoleSelection('moderator')} disabled={!displayName}>
          Entrar como Moderadora
        </button>
      </div>
       <PinModal
        isOpen={isPinModalOpen}
        onClose={handleModalClose}
        onValidate={handlePinValidate}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}


// --- Estilos para simplicidad (evitando tocar CSS globales) ---

const selectionContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  gap: '20px'
};

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle: CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '5px',
  textAlign: 'center',
  color: 'black'
};

const inputStyle: CSSProperties = {
  padding: '10px',
  width: '200px',
  marginBottom: '10px'
};

const buttonStyle: CSSProperties = {
  padding: '10px 20px',
  cursor: 'pointer',
  margin: '0 10px'
};

const closeButtonStyle: CSSProperties = {
  marginTop: '10px',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  color: 'gray'
};

const errorTextStyle: CSSProperties = {
  color: 'red',
  marginTop: '10px'
};

