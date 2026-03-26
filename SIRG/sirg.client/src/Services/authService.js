// src/services/authService.js

const API_URL = '/api/auth'; // Ruta relativa que el proxy de Vite redirigirá al backend

const authService = {
    /**
     * Inicia sesión con las credenciales proporcionadas.
     * @param {Object} credentials - Objeto con userName y password.
     * @returns {Promise<Object>} Datos del usuario autenticado.
     */
    async login(credentials) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Importante para enviar/recibir cookies
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0] || 'Error en login');
        }

        const data = await response.json();
        // No guardamos token en localStorage porque usamos cookies de autenticación
        return data;
    },

    /**
     * Cierra la sesión del usuario actual.
     * @returns {Promise<Object>}
     */
    async logout() {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0] || 'Error al cerrar sesión');
        }

        return response.json();
    },

    /**
     * Registra un nuevo usuario.
     * @param {Object} userData - Datos del usuario a registrar.
     * @returns {Promise<Object>}
     */
    async register(userData) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0] || 'Error en registro');
        }

        return response.json();
    },

    /**
     * Solicita restablecimiento de contraseña.
     * @param {string} userName - Nombre de usuario o email.
     * @returns {Promise<Object>}
     */
    async forgotPassword(userName) {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userName })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0] || 'Error en solicitud de restablecimiento');
        }

        return response.json();
    },

    /**
     * Restablece la contraseña con el token recibido.
     * @param {Object} data - Objeto con Id, Token y Password.
     * @returns {Promise<Object>}
     */
    async resetPassword(data) {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0] || 'Error al restablecer contraseña');
        }

        return response.json();
    },

    /**
     * Obtiene los datos del usuario actualmente autenticado.
     * @returns {Promise<Object|null>} Datos del usuario o null si no está autenticado.
     */
    async getCurrentUser() {
        const response = await fetch(`${API_URL}/current-user`, {
            credentials: 'include'
        });

        if (!response.ok) {
            return null; // No autenticado o error
        }

        return response.json();
    }
};

export default authService;