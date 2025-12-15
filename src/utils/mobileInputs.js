import { useEffect } from 'react';

/**
 * SOLUCIÓN DEFINITIVA PARA INPUTS EN MÓVILES
 * Previene zoom automático y problemas de teclado en Android
 */

export const addMobileInputHandlers = (inputElement) => {
  if (!inputElement || window.innerWidth > 768) return;

  console.log('🔧 Aplicando handlers móviles al input:', inputElement.type);

  // Forzar estilos que previenen zoom automático
  inputElement.style.fontSize = '16px';
  inputElement.style.WebkitAppearance = 'none';
  inputElement.style.appearance = 'none';
  inputElement.style.transform = 'translateZ(0)';
  inputElement.style.webkitTransform = 'translateZ(0)';

  const handleFocus = (e) => {
    console.log('📱 Input FOCUS - tipo:', e.target.type);
    
    // Asegurar que no hay zoom
    e.target.style.fontSize = '16px';
    e.target.style.transform = 'translateZ(0)';
    
    // Scroll hacia el elemento con delay
    setTimeout(() => {
      e.target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }, 300);
  };

  const handleBlur = (e) => {
    console.log('📱 Input BLUR - tipo:', e.target.type);
    // Mantener fontSize para prevenir problemas
    e.target.style.fontSize = '16px';
  };

  const handleTouchStart = (e) => {
    console.log('📱 Input TOUCH - preparando para focus');
    e.target.style.pointerEvents = 'auto';
    e.target.style.fontSize = '16px';
  };

  // Agregar event listeners
  inputElement.addEventListener('focus', handleFocus, { passive: true });
  inputElement.addEventListener('blur', handleBlur, { passive: true });
  inputElement.addEventListener('touchstart', handleTouchStart, { passive: true });

  // Cleanup function
  return () => {
    inputElement.removeEventListener('focus', handleFocus);
    inputElement.removeEventListener('blur', handleBlur);
    inputElement.removeEventListener('touchstart', handleTouchStart);
  };
};

/**
 * Hook para aplicar automáticamente handlers a todos los inputs
 */
export const useMobileInputs = () => {
  useEffect(() => {
    if (window.innerWidth > 768) return;

    console.log('🔧 Inicializando sistema de inputs móviles');

    // Aplicar a todos los inputs existentes
    const applyToExistingInputs = () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      console.log(`📱 Encontrados ${inputs.length} inputs para aplicar handlers`);
      
      inputs.forEach(input => {
        addMobileInputHandlers(input);
      });
    };

    // Aplicar inmediatamente
    applyToExistingInputs();

    // Observer para inputs que se agregan dinámicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Si el nodo agregado es un input
            if (node.matches && node.matches('input, textarea, select')) {
              addMobileInputHandlers(node);
            }
            // Si el nodo contiene inputs
            const childInputs = node.querySelectorAll && node.querySelectorAll('input, textarea, select');
            if (childInputs) {
              childInputs.forEach(input => addMobileInputHandlers(input));
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
};

export default { addMobileInputHandlers, useMobileInputs };
