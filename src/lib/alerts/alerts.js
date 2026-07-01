import './alerts.css';

/**
 * Sistema de alertas por "JOSE AROCHA" Alep Red.
 * Integrado al bundle de React.
 */
class ToastLibrary {
    constructor() {
        this.container = document.getElementById('toast-container');
    }

    getContainer() {
        if (!this.container || !document.body.contains(this.container)) {
            this.container = document.getElementById('toast-container');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                this.container.className = 'toast-container';
                document.body.prepend(this.container);
            }
        }
        return this.container;
    }

    /**
     * @param {string} message - Texto a mostrar
     * @param {Object} options - Configuración: { type: 'ios'|'android', status: 'success'|'error'..., duration: ms }
     */
    show(message, { type = 'ios', status = 'default', duration = 3500 } = {}) {
        const container = this.getContainer();
        const toast = document.createElement('div');
        
        // Clases base y de estilo
        toast.classList.add('toast');
        toast.classList.add(`toast-${type}`);
        toast.classList.add(status);
        
        toast.textContent = message;
        
        // Insertar al inicio para que las nuevas aparezcan arriba
        container.prepend(toast);

        // Lógica de borrado
        setTimeout(() => {
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    }
}

export const Toast = new ToastLibrary();
