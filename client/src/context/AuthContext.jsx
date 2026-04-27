import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('bizconnect_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.user);
                } catch (err) {
                    console.error('Auth check failed:', err);
                    localStorage.removeItem('bizconnect_token');
                    localStorage.removeItem('bizconnect_user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('bizconnect_token', newToken);
        localStorage.setItem('bizconnect_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (name, email, password, role) => {
        const res = await api.post('/auth/register', { name, email, password, role });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('bizconnect_token', newToken);
        localStorage.setItem('bizconnect_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('bizconnect_token');
        localStorage.removeItem('bizconnect_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
