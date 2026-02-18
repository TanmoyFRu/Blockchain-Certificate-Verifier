import React, { useState, useRef } from 'react';
import api from '../services/api';
import { ShieldCheck, Search, Activity, FileCheck, Database, Zap, Upload, ArrowRight, Check, Globe, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BasicDemo } from '../components/ui/image-comparison-demo';

const Verify = () => {
    const [hash, setHash] = useState('');
    const [file, setFile] = useState(null);
    const [verifyMode, setVerifyMode] = useState('hash');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setData(null);
        try {
            let res;
            if (verifyMode === 'hash') {
                res = await api.get(`/certificates/verify/${hash}`);
            } else {
                if (!file) throw new Error("Please select a file first");
                const formData = new FormData();
                formData.append('file', file);
                res = await api.post('/certificates/verify-file', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const onFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'hsl(var(--background))' }}>
            <nav style={{
                height: '64px',
                borderBottom: '1px solid hsl(var(--border))',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2rem',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                backgroundColor: 'hsla(var(--background), 0.8)',
                backdropFilter: 'blur(12px)',
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <ShieldCheck size={20} style={{ color: 'hsl(var(--primary))' }} />
                    <span>CertVerifier</span>
                </div>
                <button onClick={() => window.location.href = '/login'} className="shad-btn shad-btn-outline">
                    Issuer Login
                </button>
            </nav>

            <main style={{ flex: 1, paddingBottom: '8rem' }}>
                <section style={{ padding: '8rem 2rem 4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.35rem 1rem',
                        borderRadius: '9999px',
                        backgroundColor: 'hsl(var(--secondary))',
                        fontSize: '12px',
                        fontWeight: 500,
                        marginBottom: '2rem',
                        border: '1px solid hsl(var(--border))'
                    }}>
                        <Globe size={14} />
                        <span>Decentralized Verification Protocol</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        fontWeight: 800,
                        letterSpacing: '-0.04em',
                        marginBottom: '1.5rem',
                        lineHeight: 1
                    }}>
                        Instant Certificate <br />
                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>Verification.</span>
                    </h1>

                    <p style={{
                        color: 'hsl(var(--muted-foreground))',
                        fontSize: '1.125rem',
                        marginBottom: '4rem',
                        lineHeight: 1.6,
                        maxWidth: '600px',
                        margin: '0 auto 4rem'
                    }}>
                        Secure, open-source registry for accomplishments. Verify authenticity via cryptographic hashing and Polygon immutability.
                    </p>

                    <div className="shad-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '2rem',
                            backgroundColor: 'hsla(var(--muted), 0.3)',
                            padding: '0.25rem',
                            borderRadius: 'var(--radius)'
                        }}>
                            <button
                                onClick={() => { setVerifyMode('hash'); setData(null); setError(null); }}
                                style={{
                                    flex: 1,
                                    padding: '0.65rem',
                                    border: 'none',
                                    borderRadius: 'calc(var(--radius) - 2px)',
                                    background: verifyMode === 'hash' ? 'hsl(var(--primary))' : 'none',
                                    color: verifyMode === 'hash' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                Hash ID
                            </button>
                            <button
                                onClick={() => { setVerifyMode('file'); setData(null); setError(null); }}
                                style={{
                                    flex: 1,
                                    padding: '0.65rem',
                                    border: 'none',
                                    borderRadius: 'calc(var(--radius) - 2px)',
                                    background: verifyMode === 'file' ? 'hsl(var(--primary))' : 'none',
                                    color: verifyMode === 'file' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                PDF Upload
                            </button>
                        </div>

                        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {verifyMode === 'hash' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>CREDENTIAL HASH</label>
                                    <input
                                        type="text"
                                        placeholder="Enter 64-character hash..."
                                        className="shad-input"
                                        value={hash}
                                        onChange={(e) => setHash(e.target.value)}
                                        required
                                    />
                                </div>
                            ) : (
                                <div
                                    className="file-upload-area"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={onFileChange}
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                    />
                                    {file ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={40} style={{ color: 'hsl(var(--primary))' }} />
                                            <p style={{ fontSize: '14px', fontWeight: 700 }}>{file.name}</p>
                                            <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>Ready to verify</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                            <Upload size={40} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                            <p style={{ fontSize: '15px', fontWeight: 700 }}>Click to upload certificate</p>
                                            <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>Support for standard PDF format</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="shad-btn shad-btn-primary"
                                disabled={loading}
                                style={{ height: '48px', width: '100%' }}
                            >
                                {loading ? 'Verifying...' : 'Authenticate Credential'}
                            </button>
                        </form>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{
                                        marginTop: '1.5rem',
                                        padding: '1rem',
                                        backgroundColor: 'hsla(0, 70%, 50%, 0.1)',
                                        border: '1px solid hsla(0, 70%, 50%, 0.2)',
                                        borderRadius: 'var(--radius)',
                                        color: '#ff4444',
                                        fontSize: '13px'
                                    }}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {data && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid hsl(var(--border))' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'hsla(142, 70%, 50%, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(142, 70%, 50%, 0.2)' }}>
                                        <Check color="#22c55e" size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Record Verified</h3>
                                        <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>Cryptographically signed on Polygon</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ padding: '1.25rem', borderRadius: 'var(--radius)', backgroundColor: 'hsla(var(--secondary), 0.4)', border: '1px solid hsl(var(--border))' }}>
                                        <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 800 }}>Recipient</span>
                                        <p style={{ fontSize: '15px', fontWeight: 700, marginTop: '0.25rem' }}>{data.local_record?.owner_name}</p>
                                    </div>
                                    <div style={{ padding: '1.25rem', borderRadius: 'var(--radius)', backgroundColor: 'hsla(var(--secondary), 0.4)', border: '1px solid hsl(var(--border))' }}>
                                        <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 800 }}>Credential</span>
                                        <p style={{ fontSize: '15px', fontWeight: 700, marginTop: '0.25rem' }}>{data.local_record?.course_name}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* Improved Visual Comparison Section */}
                <section style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Integrity Lens</h3>
                            <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>Visual comparison of on-chain versus original data</p>
                        </div>
                    </div>
                    <BasicDemo />
                </section>

                <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: <Database />, title: 'Immutable Audit', desc: 'Tamper-proof record keeping powered by Polygon blockchain.' },
                            { icon: <Zap />, title: 'Instant Proof', desc: 'Near-zero latency verification using distributed node indexing.' },
                            { icon: <ShieldCheck />, title: 'Enterprise Secure', desc: 'Cryptographically signed certificates with SHA-256 standard.' }
                        ].map((feature, i) => (
                            <div key={i} className="shad-card" style={{ padding: '2.5rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'hsl(var(--primary))' }}>
                                    {feature.icon}
                                </div>
                                <h4 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '0.75rem' }}>{feature.title}</h4>
                                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14.5px', lineHeight: 1.6 }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer style={{ padding: '4rem 2rem', borderTop: '1px solid hsl(var(--border))', backgroundColor: 'hsla(var(--background), 0.5)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>
                        © 2026 CertVerifier Protocol.
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '14px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
                        <span>Terms</span>
                        <span>Privacy</span>
                        <span>Infrastructure</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Verify;
