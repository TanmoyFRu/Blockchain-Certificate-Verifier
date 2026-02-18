import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            {/* 21st.dev Style Split Login Layout */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '350px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'hsl(var(--secondary))', marginBottom: '1rem' }}>
                            <ShieldCheck style={{ color: 'hsl(var(--primary))' }} />
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em' }}>Welcome back</h1>
                        <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                            Log in to your issuer account to manage credentials
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '13px', fontWeight: 500 }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '0.65rem', color: 'hsl(var(--muted-foreground))' }} />
                                <input
                                    type="email"
                                    placeholder="name@organization.com"
                                    className="shad-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', fontWeight: 500 }}>Password</label>
                                <span style={{ fontSize: '12px', color: 'hsl(var(--primary))', cursor: 'pointer' }}>Forgot?</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '0.65rem', color: 'hsl(var(--muted-foreground))' }} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="shad-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{ fontSize: '12px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="shad-btn shad-btn-primary" disabled={loading} style={{ width: '100%', height: '40px', gap: '0.5rem' }}>
                            {loading ? 'Logging in...' : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                        Don't have an account? <span style={{ color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 500 }}>Request Access</span>
                    </p>
                </div>
            </div>

            {/* 21st.dev Style Decorative Side Panel */}
            <div style={{ flex: 1.2, backgroundColor: 'hsl(var(--secondary))', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderLeft: '1px solid hsl(var(--border))' }}>
                <div style={{ maxWidth: '440px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 0 20px hsla(var(--primary), 0.3)' }}>
                        <ShieldCheck color="white" />
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem' }}>
                        The Global Gold Standard for Digital Credentials.
                    </h2>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '16px', lineHeight: 1.6 }}>
                        Over 2,500 institutions use CertVerifier to issue tamper-proof diplomas, certificates, and professional licenses on the blockchain.
                    </p>
                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'hsl(var(--muted))', border: '2px solid hsl(var(--secondary))', marginLeft: i > 1 ? '-12px' : 0 }}></div>
                            ))}
                        </div>
                        <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center' }}>
                            Joined by 50+ new issuers this week
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
