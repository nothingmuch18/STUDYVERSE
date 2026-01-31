import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import client from '../api/client';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('studyos_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await client.get('/auth/me');
                setUser(response.data.user);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('studyos_token');
                localStorage.removeItem('studyos_user');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await client.post('/auth/login', { email, password });
            const { user, token } = response.data;

            localStorage.setItem('studyos_token', token);
            localStorage.setItem('studyos_user', JSON.stringify(user));
            setUser(user);
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string) => {
        setIsLoading(true);
        try {
            const response = await client.post('/auth/register', { email, password, name });
            const { user, token } = response.data;

            localStorage.setItem('studyos_token', token);
            localStorage.setItem('studyos_user', JSON.stringify(user));
            setUser(user);
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // Optional: Call logout endpoint if backend supports it
            // await client.post('/auth/logout');
            setUser(null);
            localStorage.removeItem('studyos_token');
            localStorage.removeItem('studyos_user');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;
        try {
            const response = await client.put('/auth/profile', data);
            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('studyos_user', JSON.stringify(updatedUser));
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Profile update failed');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
