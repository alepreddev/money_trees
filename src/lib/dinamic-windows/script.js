import './style.css';

/**
 * Sistema de ventanas dinámicas (dinamic-windows) por Jose Arocha.
 * Adaptado para React SPA.
 * 
 * v3 — Animaciones direccionales simples (sin FLIP).
 * Direcciones disponibles: 'top' (default), 'bottom', 'left', 'right'
 * Se controla con la clase: win-from-top, win-from-bottom, win-from-left, win-from-right
 */
export class WindowSystem {
    constructor() {
        this.openDuration = 320; 
        this.closeDuration = 250;
        this.openEasing = 'cubic-bezier(0.16, 1, 0.3, 1)';
        this.closeEasing = 'cubic-bezier(0.32, 0, 0.67, 0)';
    }

    openWindow(overlayEl) {
        if (!overlayEl) return;

        const card = overlayEl.querySelector('.win-card');
        if (!card) return;

        // Limpiar animaciones anteriores
        card.getAnimations().forEach(a => a.cancel());

        // Preparar visibilidad
        card.style.visibility = 'visible';
        card.style.opacity = '';

        // Activar overlay (backdrop fade-in via CSS transition)
        overlayEl.classList.add('is-active');

        // Detectar dirección de la clase en la card
        const direction = this._getDirection(card);
        const from = this._getTranslateFrom(direction);

        card.animate([
            { transform: from, opacity: 0 },
            { transform: 'translate(0, 0) scale(1)', opacity: 1 }
        ], {
            duration: this.openDuration,
            easing: this.openEasing,
            fill: 'forwards'
        });
    }

    closeWindow(overlayEl, onFinish = null) {
        if (!overlayEl) {
            if (onFinish) onFinish();
            return;
        }

        const card = overlayEl.querySelector('.win-card');

        // Empezar a desvanecer el fondo inmediatamente
        overlayEl.classList.remove('is-active');

        if (!card) {
            setTimeout(() => {
                if (onFinish) onFinish();
            }, this.closeDuration);
            return;
        }

        card.getAnimations().forEach(a => a.cancel());

        const direction = this._getDirection(card);
        const to = this._getTranslateFrom(direction);

        const animation = card.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: to, opacity: 0 }
        ], {
            duration: this.closeDuration,
            easing: this.closeEasing,
            fill: 'forwards'
        });

        animation.onfinish = () => {
            card.style.visibility = 'hidden';
            if (onFinish) onFinish();
        };
    }

    /**
     * Detecta la dirección de aparición según la clase CSS de la card.
     */
    _getDirection(card) {
        if (card.classList.contains('win-from-bottom')) return 'bottom';
        if (card.classList.contains('win-from-left'))   return 'left';
        if (card.classList.contains('win-from-right'))  return 'right';
        return 'top'; // default
    }

    /**
     * Devuelve el transform de origen según la dirección.
     */
    _getTranslateFrom(direction) {
        switch (direction) {
            case 'top':    return 'translateY(-24px) scale(0.97)';
            case 'bottom': return 'translateY(24px) scale(0.97)';
            case 'left':   return 'translateX(-28px) scale(0.97)';
            case 'right':  return 'translateX(28px) scale(0.97)';
            default:       return 'translateY(-24px) scale(0.97)';
        }
    }
}

export const Window = new WindowSystem();
