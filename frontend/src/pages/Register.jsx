import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, Building2 } from 'lucide-react';
import { Meteors } from '../components/ui/meteors';
import { Input } from '../components/ui/input';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!orgName.trim()) {
            setError('Organization name is required');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                email,
                password,
                organization_name: orgName.trim()
            });
            const loginRes = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', loginRes.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
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
                        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Create Account</h1>
                        <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '0.75rem', fontWeight: 500 }}>
                            Register your organization to start issuing credentials
                        </p>
                    </div>

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.02em' }}>ORGANIZATION NAME</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '0.85rem', color: 'hsl(var(--muted-foreground))' }} />
                                <Input
                                    type="text"
                                    placeholder="University of Technology"
                                    style={{ paddingLeft: '3rem', height: '48px', backgroundColor: 'hsl(var(--muted) / 0.5)', borderColor: 'hsl(var(--border))' }}
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
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
                            <label style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.02em' }}>PASSWORD</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '0.85rem', color: 'hsl(var(--muted-foreground))' }} />
                                <Input
                                    type="password"
                                    placeholder="Min 8 characters"
                                    style={{ paddingLeft: '3rem', height: '48px', backgroundColor: 'hsl(var(--muted) / 0.5)', borderColor: 'hsl(var(--border))' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.02em' }}>CONFIRM PASSWORD</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '0.85rem', color: 'hsl(var(--muted-foreground))' }} />
                                <Input
                                    type="password"
                                    placeholder="Re-enter password"
                                    style={{ paddingLeft: '3rem', height: '48px', backgroundColor: 'hsl(var(--muted) / 0.5)', borderColor: 'hsl(var(--border))' }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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

                        <button
                            type="submit"
                            disabled={loading}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translate(4px, 4px)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translate(0, 0)';
                                e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000';
                            }}
                            style={{
                                width: '100%',
                                height: '48px',
                                marginTop: '0.5rem',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '14px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                border: '2px solid #000000',
                                boxShadow: '4px 4px 0px 0px #000',
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                pointerEvents: loading ? 'none' : 'auto',
                            }}
                        >
                            {loading ? 'Creating Account...' : (
                                <>Create Organization <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '14px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
                        Already have an account? <span onClick={() => navigate('/login')} style={{ color: 'white', cursor: 'pointer', fontWeight: 700 }}>Sign In</span>
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
                <Meteors number={30} />

                <div style={{ maxWidth: '480px', position: 'relative', zIndex: 10 }}>
                    <h2 style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.04em' }}>
                        Issue Verifiable<br />
                        Credentials Today.
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            "Set up your organization in under a minute.",
                            "Issue blockchain-anchored certificates instantly.",
                            "Share verification links that anyone can check."
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
                                    marginTop: '0.2rem',
                                    fontSize: '13px',
                                    fontWeight: 800,
                                    color: 'black'
                                }}>
                                    {i + 1}
                                </div>
                                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '16.5px', lineHeight: 1.5, fontWeight: 500 }}>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
