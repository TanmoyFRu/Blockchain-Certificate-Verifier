import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Meteors } from '../components/ui/meteors';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: 'hsl(var(--background) / 0.5)' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            backgroundColor: 'hsl(var(--foreground) / 0.05)',
                            marginBottom: '1.5rem',
                            border: '1px solid hsl(var(--foreground) / 0.1)'
                        }}>
                            <ShieldCheck style={{ color: 'white' }} size={24} />
                        </div>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Sign In</h1>
                        <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '0.75rem', fontWeight: 500 }}>
                            Enter your credentials to access the issuance portal
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.02em' }}>EMAIL ADDRESS</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '0.85rem', color: 'hsl(var(--muted-foreground))' }} />
                                <Input
                                    type="email"
                                    placeholder="admin@organization.com"
                                    style={{ paddingLeft: '3rem', height: '48px', backgroundColor: 'hsl(var(--muted) / 0.5)', borderColor: 'hsl(var(--border))' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.02em' }}>PASSWORD</label>
                                <span style={{ fontSize: '12px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Recovery</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '0.85rem', color: 'hsl(var(--muted-foreground))' }} />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    style={{ paddingLeft: '3rem', height: '48px', backgroundColor: 'hsl(var(--muted) / 0.5)', borderColor: 'hsl(var(--border))' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                fontSize: '13px',
                                color: '#ff4444',
                                backgroundColor: 'hsl(0 100% 50% / 0.05)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid hsl(0 100% 50% / 0.1)',
                                fontWeight: 500
                            }}>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="shine"
                            disabled={loading}
                            style={{ width: '100%', height: '48px', gap: '0.75rem', marginTop: '0.5rem', borderRadius: '12px', fontWeight: 700 }}
                        >
                            {loading ? 'Authenticating...' : (
                                <>Enter Portal <ArrowRight size={18} /></>
                            )}
                        </Button>
                    </form>

                    <p style={{ marginTop: '3rem', textAlign: 'center', fontSize: '14px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
                        Restricted Access Center. <span style={{ color: 'white', cursor: 'pointer', fontWeight: 700 }}>Request Credentials</span>
                    </p>
                </div>
            </div>

            <div style={{
                flex: 1,
                backgroundColor: 'hsl(var(--foreground) / 0.02)',
                borderLeft: '1px solid hsl(var(--border))',
                padding: '4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Dynamic Meteor Effect */}
                <Meteors number={30} />

                <div style={{ maxWidth: '480px', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.35rem 1rem',
                        borderRadius: '9999px',
                        backgroundColor: 'hsl(var(--foreground) / 0.05)',
                        fontSize: '12px',
                        fontWeight: 700,
                        marginBottom: '2rem',
                        border: '1px solid hsl(var(--foreground) / 0.1)',
                        color: 'hsl(var(--muted-foreground))',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        <Globe size={14} />
                        <span>Infrastructure Core</span>
                    </div>

                    <h2 style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.04em' }}>
                        Built for Institutions. <br />
                        Hardened for Trust.
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            "Multi-layer cryptographic signing for every record.",
                            "Seamless integration with Polygon Mainnet.",
                            "Immutable data standard for global recognition."
                        ].map((text, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '0.2rem'
                                }}>
                                    <Check size={14} color="black" strokeWidth={3} />
                                </div>
                                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '16.5px', lineHeight: 1.5, fontWeight: 500 }}>{text}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '4rem',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius)',
                        backgroundColor: 'hsl(var(--foreground) / 0.03)',
                        border: '1px solid hsl(var(--foreground) / 0.05)'
                    }}>
                        <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                            "CertVerifier has revolutionized how we issue professional development credits, providing our members with instant, verifiable proof of their achievements."
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'hsl(var(--foreground) / 0.1)' }}></div>
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: 700 }}>Dr. Aris Thorne</p>
                                <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 600, textTransform: 'uppercase' }}>Director of Digital Credentials</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
