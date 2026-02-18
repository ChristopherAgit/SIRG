const API_URL = 'https://localhost:61767/api/auth'; // Cambia por tu URL

const authService = {
    async login(credentials) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0] || 'Error en login');
        }
        const data = await response.json();
        // Guardar token en localStorage
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
        }
        return data;
    },

    logout() {
        return fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).finally(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    },

    async register(userData) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0] || 'Error en registro');
        }
        return response.json();
    },

    async forgotPassword(userName) {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0] || 'Error');
        }
        return response.json();
    },

    async resetPassword(data) {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0] || 'Error');
        }
        return response.json();
    },

    async getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const response = await fetch(`${API_URL}/current-user`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return null;
        return response.json();
    }
};

export default authService;