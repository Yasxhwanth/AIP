import React, { useState } from 'react';
import { LogIn, Lock, Mail, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

/**
 * Login Component
 * 
 * Production-grade login UI.
 * 
 * INVARIANTS:
 * - No hardcoded business logic
 * - Works with any tenant structure
 * - Clean, accessible UI
 */
export const Login: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantId, setTenantId] = useState('tenant-default');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await login(email, password, tenantId);
            if (!result.success) {
                setError(result.error || 'Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--background)',
            backgroundImage: 'linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(138, 43, 226, 0.05) 100%)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                padding: '40px',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        marginBottom: '16px'
                    }}>
                        <LogIn size={32} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                        marginBottom: '8px'
                    }}>
                        Enterprise Ontology Platform
                    </h1>
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        margin: 0
                    }}>
                        Sign in to access the system
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                        marginBottom: '20px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#EF4444'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <Mail size={14} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            placeholder="user@example.com"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: 'var(--bg-base)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <Lock size={14} />
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            placeholder="Enter your password"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: 'var(--bg-base)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* Tenant ID (Optional) */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <Building2 size={14} />
                            Tenant ID (Optional)
                        </label>
                        <input
                            type="text"
                            value={tenantId}
                            onChange={(e) => setTenantId(e.target.value)}
                            disabled={isLoading}
                            placeholder="tenant-default"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: 'var(--bg-base)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: isLoading ? 'var(--surface-2)' : 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s',
                            opacity: isLoading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin" style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%'
                                }} />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <LogIn size={16} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                {/* Demo Note */}
                <div style={{
                    marginTop: '24px',
                    padding: '12px',
                    backgroundColor: 'rgba(0, 122, 255, 0.05)',
                    border: '1px solid rgba(0, 122, 255, 0.1)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                }}>
                    <strong>Demo Mode:</strong> Any email/password combination will work.
                </div>
            </div>
        </div>
    );
};

