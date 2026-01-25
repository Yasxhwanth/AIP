import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, AuthResult } from './AuthService';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: { id: string; email?: string; displayName?: string; tenantId: string } | null;
    login: (email: string, password: string, tenantId?: string) => Promise<AuthResult>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<{ id: string; email?: string; displayName?: string; tenantId: string } | null>(null);

    useEffect(() => {
        // Try to restore session on mount
        const result = AuthService.restoreSession();
        setIsAuthenticated(result.success);
        if (result.success) {
            setUser(AuthService.getCurrentUser());
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, tenantId?: string): Promise<AuthResult> => {
        const result = await AuthService.login({ email, password, tenantId });
        setIsAuthenticated(result.success);
        if (result.success) {
            setUser(AuthService.getCurrentUser());
        }
        return result;
    };

    const logout = () => {
        AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

