import { useEffect, useState } from 'react';

/**
 * Hook personalizado para detectar cuando el teclado virtual está visible
 * y aplicar correcciones automáticas para mejorar la UX en móviles
 */
export const useVirtualKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [initialViewportHeight, setInitialViewportHeight] = useState(0);

  useEffect(() => {
    // Solo ejecutar en dispositivos móviles
    if (window.innerWidth > 768) return;

    // Guardar altura inicial del viewport
    setInitialViewportHeight(window.innerHeight);

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Si la altura se redujo más de 150px, probablemente el teclado está visible
      const keyboardIsVisible = heightDifference > 150;
      
      if (keyboardIsVisible !== isKeyboardVisible) {
        setIsKeyboardVisible(keyboardIsVisible);
        
        // Aplicar clases CSS según el estado del teclado
        const mainContent = document.querySelector('.mobile-main-content');
        const bottomNav = document.querySelector('.mobile-bottom-nav');
        
        if (keyboardIsVisible) {
          mainContent?.classList.add('keyboard-visible');
          bottomNav?.classList.add('keyboard-hidden');
          // Scroll suave al elemento activo
          setTimeout(() => {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
              activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }
          }, 300);
        } else {
          mainContent?.classList.remove('keyboard-visible');
          bottomNav?.classList.remove('keyboard-hidden');
        }
      }
    };

    // Escuchar cambios en el tamaño del viewport
    window.addEventListener('resize', handleResize);
    
    // Visual Viewport API (mejor soporte para teclados virtuales)
    if (window.visualViewport) {
      const handleViewportChange = () => {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const heightDifference = windowHeight - viewportHeight;
        
        const keyboardIsVisible = heightDifference > 100;
        
        if (keyboardIsVisible !== isKeyboardVisible) {
          setIsKeyboardVisible(keyboardIsVisible);
          
          const mainContent = document.querySelector('.mobile-main-content');
          const bottomNav = document.querySelector('.mobile-bottom-nav');
          
          if (keyboardIsVisible) {
            mainContent?.classList.add('keyboard-visible');
            bottomNav?.classList.add('keyboard-hidden');
          } else {
            mainContent?.classList.remove('keyboard-visible');
            bottomNav?.classList.remove('keyboard-hidden');
          }
        }
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isKeyboardVisible, initialViewportHeight]);

  return {
    isKeyboardVisible,
    initialViewportHeight
  };
};

export default useVirtualKeyboard;
