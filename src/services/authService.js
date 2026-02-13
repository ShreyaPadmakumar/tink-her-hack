// auth stuff - login, signup, token mgmt

const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `http://${window.location.hostname}:5000/api`);

export const register = async (email, password, username) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
    }

    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('username', data.user?.username || username);
        localStorage.setItem('isAuthenticated', 'true');
    }

    return data;
};

export const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Login failed');

    // save session
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('username', data.user?.username || '');
        localStorage.setItem('isAuthenticated', 'true');
    }

    return data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('displayName');
};

export const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const getToken = () => localStorage.getItem('token');

export const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

// fetch wrapper that attaches auth header
export const authFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${url}`, { ...options, headers });
};
