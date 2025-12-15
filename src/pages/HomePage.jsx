import React from 'react';

export default function HomePage() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: `linear-gradient(135deg, #f5e6ff 0%, #c8a6a6 25%, #c1d43a 50%, #8d75838 75%, #382a3c 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos de fondo - Múltiples formas animadas */}
      {/* Círculos */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#c8a6a6',
        opacity: 0.3,
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#c1d43a',
        opacity: 0.4,
        animation: 'float 4s ease-in-out infinite reverse'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#8d7583',
        opacity: 0.2,
        animation: 'float 5s ease-in-out infinite'
      }}></div>

      {/* Nuevos círculos adicionales */}
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '25%',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#f5e6ff',
        opacity: 0.5,
        animation: 'float 7s ease-in-out infinite'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '40%',
        right: '5%',
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        backgroundColor: '#c8a6a6',
        opacity: 0.25,
        animation: 'float 5.5s ease-in-out infinite reverse'
      }}></div>

      <div style={{
        position: 'absolute',
        top: '80%',
        left: '5%',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#c1d43a',
        opacity: 0.35,
        animation: 'float 6.5s ease-in-out infinite'
      }}></div>

      {/* Cuadrados rotando */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '35%',
        width: '45px',
        height: '45px',
        backgroundColor: '#8d7583',
        opacity: 0.3,
        animation: 'float 4.5s ease-in-out infinite, rotate 8s linear infinite',
        borderRadius: '8px'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '60%',
        left: '35%',
        width: '35px',
        height: '35px',
        backgroundColor: '#382a3c',
        opacity: 0.2,
        animation: 'float 5.8s ease-in-out infinite reverse, rotate 10s linear infinite reverse',
        borderRadius: '6px'
      }}></div>

      {/* Triángulos */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '8%',
        width: '0',
        height: '0',
        borderLeft: '25px solid transparent',
        borderRight: '25px solid transparent',
        borderBottom: '45px solid #c8a6a6',
        opacity: 0.25,
        animation: 'float 6.2s ease-in-out infinite, rotate 12s linear infinite'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '30%',
        width: '0',
        height: '0',
        borderLeft: '20px solid transparent',
        borderRight: '20px solid transparent',
        borderBottom: '35px solid #c1d43a',
        opacity: 0.3,
        animation: 'float 7.5s ease-in-out infinite reverse, rotate 9s linear infinite reverse'
      }}></div>

      {/* Rombos */}
      <div style={{
        position: 'absolute',
        top: '70%',
        right: '45%',
        width: '30px',
        height: '30px',
        backgroundColor: '#f5e6ff',
        opacity: 0.4,
        transform: 'rotate(45deg)',
        animation: 'float 5.2s ease-in-out infinite, rotate 15s linear infinite'
      }}></div>

      <div style={{
        position: 'absolute',
        top: '25%',
        left: '45%',
        width: '25px',
        height: '25px',
        backgroundColor: '#8d7583',
        opacity: 0.3,
        transform: 'rotate(45deg)',
        animation: 'float 6.8s ease-in-out infinite reverse, rotate 11s linear infinite reverse'
      }}></div>

      {/* Óvalos */}
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '50%',
        width: '60px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#382a3c',
        opacity: 0.2,
        animation: 'float 4.8s ease-in-out infinite, rotate 20s linear infinite'
      }}></div>

      {/* Contenedor principal - Efecto cristal */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '30px',
        padding: '60px 40px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 80px rgba(56, 42, 60, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        position: 'relative',
        zIndex: 1,
        background: `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.25) 0%, 
            rgba(255, 255, 255, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%
          )
        `
      }}>
        <div style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Anillo de resplandor detrás del logo */}
          <div style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 102, 166, 0.2) 0%, rgba(255, 102, 166, 0.1) 50%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 4s ease-in-out infinite',
            zIndex: 0
          }}></div>
          
          <img 
            src="/images/logo_kunna.png" 
            alt="KUNNA Logo" 
            style={{
              width: '220px',
              height: 'auto',
              filter: 'drop-shadow(0 15px 30px rgba(56, 42, 60, 0.3)) drop-shadow(0 0 20px rgba(255, 102, 166, 0.2))',
              animation: 'glow 3s ease-in-out infinite alternate, float 6s ease-in-out infinite',
              position: 'relative',
              zIndex: 1,
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />
        </div>

        {/* Título de bienvenida */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#382a3c',
          marginBottom: '30px',
          letterSpacing: '-1px',
          lineHeight: '1.2',
          textShadow: '0 2px 4px rgba(255, 255, 255, 0.8)'
        }}>
          Bienvenida
        </h1>
        
        {/* Mensaje principal */}
        <p style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#382a3c',
          marginBottom: '20px',
          lineHeight: '1.4',
          textShadow: '0 1px 3px rgba(255, 255, 255, 0.7)'
        }}>
          Eres creadora, fuerza vital que transforma el mundo.
        </p>
        
        {/* Mensaje secundario */}
        <p style={{
          fontSize: '20px',
          color: '#8d7583',  
          fontWeight: '400',
          lineHeight: '1.5',
          marginBottom: '20px',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
        }}>
          KUNNA está aquí para protegerte, acompañarte y verte florecer.
        </p>

        {/* Mensaje de acción */}
        <p style={{
          fontSize: '18px',
          color: '#382a3c',
          fontWeight: '500',
          lineHeight: '1.4',
          marginBottom: '40px',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
        }}>
          Toca el menú y explora lo que KUNNA tiene para ti
        </p>

        {/* Elementos decorativos internos */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '30px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#c8a6a6',
            animation: 'pulse 2s infinite'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#c1d43a',
            animation: 'pulse 2s infinite 0.5s'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#8d7583',
            animation: 'pulse 2s infinite 1s'
          }}></div>
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes glow {
          from {
            filter: drop-shadow(0 10px 20px rgba(56, 42, 60, 0.1));
          }
          to {
            filter: drop-shadow(0 15px 30px rgba(193, 212, 58, 0.3));
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 36px !important;
          }
          p:first-of-type {
            font-size: 20px !important;
          }
          p:last-of-type {
            font-size: 18px !important;
          }
          img {
            width: 140px !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 28px !important;
          }
          p:first-of-type {
            font-size: 18px !important;
          }
          p:last-of-type {
            font-size: 16px !important;
          }
          img {
            width: 120px !important;
          }
        }
      `}</style>
    </div>
  );
}
