import React, { useState } from 'react';
import api from '../services/api';
import { ShieldCheck, Search, Activity, FileCheck, Database, Zap, Upload, ArrowRight, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Verify = () => {
    const [hash, setHash] = useState('');
    const [file, setFile] = useState(null);
    const [verifyMode, setVerifyMode] = useState('hash');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                const formData = new FormData();
                formData.append('file', file);
                res = await api.post('/certificates/verify-file', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 21st.dev Style Navbar */}
            <nav style={{ height: '64px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', padding: '0 2rem', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'hsla(var(--background), 0.8)', backdropFilter: 'blur(8px)', zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <ShieldCheck size={20} className="text-primary" style={{ color: 'hsl(var(--primary))' }} />
                    <span>CertVerifier</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => window.location.href = '/login'} className="shad-btn shad-btn-outline">
                        Issuer Login
                    </button>
                </div>
            </nav>

            {/* Hero Section - Inspired by 21st.dev Marketing Blocks */}
            <main style={{ flex: 1 }}>
                <section style={{ padding: '8rem 2rem 4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: 'hsl(var(--secondary))', fontSize: '12px', fontWeight: 500, marginBottom: '2rem', border: '1px solid hsl(var(--border))' }}
                    >
                        <Globe size={14} />
                        <span>Now live on Polygon Mainnet</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1.5rem', lineHeight: 1.1 }}
                    >
                        Trust, Decentralized. <br />
                        Verify certificates instantly.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.125rem', marginBottom: '3rem', lineHeight: 1.6 }}
                    >
                        A secure, open-source registry for academic and professional accomplishments. Powered by cryptographic hashing and blockchain immutability.
                    </motion.p>

                    {/* Verification UI - 21st.dev Functional Component Pattern */}
                    <div className="shad-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', marginBottom: '1.5rem', marginTop: '-0.5rem', marginLeft: '-1.5rem', marginRight: '-1.5rem' }}>
                            <button
                                onClick={() => setVerifyMode('hash')}
                                style={{ flex: 1, padding: '1rem', border: 'none', background: 'none', color: verifyMode === 'hash' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', borderBottom: verifyMode === 'hash' ? '2px solid hsl(var(--primary))' : 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                            >
                                Hash ID
                            </button>
                            <button
                                onClick={() => setVerifyMode('file')}
                                style={{ flex: 1, padding: '1rem', border: 'none', background: 'none', color: verifyMode === 'file' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', borderBottom: verifyMode === 'file' ? '2px solid hsl(var(--primary))' : 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                            >
                                PDF Upload
                            </button>
                        </div>

                        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {verifyMode === 'hash' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 500 }}>Certificate URL or Hash</label>
                                    <input
                                        type="text"
                                        placeholder="Enter 64-character SHA-256 hash..."
                                        className="shad-input"
                                        value={hash}
                                        onChange={(e) => setHash(e.target.value)}
                                        required
                                    />
                                </div>
                            ) : (
                                <div style={{ border: '1px dashed hsl(var(--border))', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', backgroundColor: 'hsla(var(--muted), 0.3)' }}>
                                    <Upload size={24} style={{ margin: '0 auto 1rem', color: 'hsl(var(--muted-foreground))' }} />
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        style={{ fontSize: '12px' }}
                                        required
                                    />
                                </div>
                            )}
                            <button type="submit" className="shad-btn shad-btn-primary" disabled={loading} style={{ width: '100%', gap: '0.5rem' }}>
                                {loading ? 'Processing...' : (
                                    <>Verifying Certificate <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid hsl(var(--destructive))', borderRadius: 'calc(var(--radius) - 4px)', color: '#ef4444', fontSize: '13px' }}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {data && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Check color="#10b981" size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Authenticity Verified</h3>
                                        <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>Cryptographically confirmed via Polygon</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>
                                        <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 600 }}>Recipient</span>
                                        <p style={{ fontSize: '14px', fontWeight: 500, marginTop: '0.25rem' }}>{data.local_record?.owner_name || 'Verified Link'}</p>
                                    </div>
                                    <div style={{ padding: '1rem', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>
                                        <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 600 }}>Course</span>
                                        <p style={{ fontSize: '14px', fontWeight: 500, marginTop: '0.25rem' }}>{data.local_record?.course_name || 'Authentic Record'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* 21st.dev Feature Section Pattern */}
                <section style={{ padding: '4rem 2rem 8rem', maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <div className="shad-card" style={{ padding: '2rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <Database size={20} className="text-primary" />
                            </div>
                            <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Immutable History</h4>
                            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', lineHeight: 1.6 }}>Record-keeping that cannot be altered or deleted. Every certificate hash lives permanently on-chain.</p>
                        </div>
                        <div className="shad-card" style={{ padding: '2rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <Zap size={20} className="text-primary" />
                            </div>
                            <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Near-Zero Gas</h4>
                            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', lineHeight: 1.6 }}>Built on the Polygon network to ensure high throughput and minimal transaction costs for issuers.</p>
                        </div>
                        <div className="shad-card" style={{ padding: '2rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <FileCheck size={20} className="text-primary" />
                            </div>
                            <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Enterprise Ready</h4>
                            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', lineHeight: 1.6 }}>Comprehensive API support and admin tools for universities, bootcamps, and professional bodies.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer style={{ padding: '4rem 2rem', borderTop: '1px solid hsl(var(--border))' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
                        © 2026 CertVerifier Protocol. Open Source.
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
                        <span>Terms</span>
                        <span>Privacy</span>
                        <span>API Docs</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Verify;
