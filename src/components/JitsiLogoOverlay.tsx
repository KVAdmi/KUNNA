interface JitsiLogoOverlayProps {
  visible?: boolean;
}

const JitsiLogoOverlay = ({ visible = true }: JitsiLogoOverlayProps) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 9999,
        display: visible ? 'block' : 'none',
        pointerEvents: 'auto',  // <- CLAVE: captura el click para que NO pase al iframe
        width: 150, 
        height: 60, // área que cubre donde sale el watermark de Jitsi
      }}
      onClick={(e) => e.preventDefault()} // no hace nada si se toca
    >
      <img
        src="/images/Logo para sala video.png"
        alt=""
        style={{ 
          width: 120, 
          height: 'auto', 
          opacity: 0.95, 
          pointerEvents: 'none' // la imagen no intercepta eventos, solo el contenedor
        }}
      />
    </div>
  );
};

export default JitsiLogoOverlay;
