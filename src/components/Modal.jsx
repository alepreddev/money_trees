import { useEffect, useRef, useState } from 'react';
import { Window } from '@/lib/dinamic-windows/script';

/**
 * Modal — Componente modal reutilizable potenciado por "dinamic-windows" de Jose Arocha.
 *
 * Props:
 * - isOpen: Boolean que controla visibilidad
 * - onClose: Callback para cerrar
 * - title: Título de la ventana
 * - children: Contenido
 * - sizeClass: Clase opcional para tamaño ('w-sm', 'w-lg', 'w-xl')
 * - animation: Dirección de aparición ('top' | 'bottom' | 'left' | 'right')
 */
export default function Modal({ isOpen, onClose, title, children, sizeClass = '', animation = 'top' }) {
  const overlayRef = useRef(null);
  const [mounted, setMounted] = useState(isOpen);
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isClosingRef.current = false;
      setMounted(true);
      const timer = requestAnimationFrame(() => {
        if (overlayRef.current) {
          Window.openWindow(overlayRef.current);
        }
      });
      return () => cancelAnimationFrame(timer);
    } else if (mounted && overlayRef.current && !isClosingRef.current) {
      isClosingRef.current = true;
      Window.closeWindow(overlayRef.current, () => {
        setMounted(false);
        isClosingRef.current = false;
      });
    }
  }, [isOpen]);

  function handleBackdropClick(e) {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  if (!mounted && !isOpen) return null;

  const animClass = `win-from-${animation}`;

  return (
    <div
      ref={overlayRef}
      className="win-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`win-card ${animClass} ${sizeClass}`}>
        <div className="win-header">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            className="win-close-btn"
            aria-label="Cerrar ventana"
          >
            &times;
          </button>
        </div>
        <div className="win-body">
          {children}
        </div>
      </div>
    </div>
  );
}
