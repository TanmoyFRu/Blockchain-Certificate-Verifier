import React, { useState } from 'react';
import api from '../services/api';
import { ShieldCheck, Search, Activity, Clock, FileCheck, Database, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Verify = () => {
    const [hash, setHash] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const res = await api.get(`/certificates/verify/${hash}`);
            setData(res.data);
        } catch (err) {
            setError('Invalid hash or certificate not found');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ color: '#f8fafc' }}>
            {/* Hero Section */}
            <nav style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px' }}>
                    <ShieldCheck color="#6366f1" size={32} /> CertVerifier
                </div>
                <button onClick={() => window.location.href = '/login'} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>
                    Issuer Login
                </button>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
                <section style={{ textAlign: 'center', marginBottom: '100px' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '4rem', marginBottom: '24px', fontWeight: '900', lineHeight: '1.2' }}
                    >
                        Verify Authenticity <br />
                        <span style={{ color: '#6366f1' }}>On the Blockchain.</span>
                    </motion.h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                        Instant, tamper-proof verification for academic and professional certificates using SHA-256 hashing and Polygon Blockchain technology.
                    </p>

                    <div className="glass-card" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Enter 64-character Certificate Hash"
                                className="input-field"
                                value={hash}
                                onChange={(e) => setHash(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                                <Search size={18} /> {loading ? 'Verifying...' : 'Verify Certificate'}
                            </button>
                        </form>

                        {error && <p style={{ color: '#ef4444', marginTop: '20px' }}>{error}</p>}

                        {data && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '30px' }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                                    <div className="glass-card" style={{ padding: '20px' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Recipient</p>
                                        <p style={{ fontSize: '18px', fontWeight: '600' }}>{data.local_record.owner_name}</p>
                                    </div>
                                    <div className="glass-card" style={{ padding: '20px' }}>
                                        <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Credential Name</p>
                                        <p style={{ fontSize: '18px', fontWeight: '600' }}>{data.local_record.course_name}</p>
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '20px', marginTop: '20px', background: 'rgba(16, 185, 129, 0.08)', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <FileCheck color="#10b981" size={32} />
                                            <div>
                                                <p style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>Blockchain Verified</p>
                                                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Hash matched on immutable ledger</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Issue Date</p>
                                            <p style={{ fontSize: '14px' }}>{new Date(data.local_record.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* Features Section */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '100px' }}>
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <Database size={32} color="#6366f1" style={{ marginBottom: '20px' }} />
                        <h4 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Immutable Records</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Certificates are hashed and stored on the blockchain, making them forever tamper-proof.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <Zap size={32} color="#6366f1" style={{ marginBottom: '20px' }} />
                        <h4 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Instant Verification</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Zero wait time. Recalculate and compare hashes in milliseconds with global availability.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <Activity size={32} color="#6366f1" style={{ marginBottom: '20px' }} />
                        <h4 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>PDF Authenticity</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Verify actual PDF files or unique IDs against the original cryptographic signatures.</p>
                    </div>
                </section>

                <footer style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                    © 2026 CertVerifier Protocol. Powered by Polygon.
                </footer>
            </div>
        </div>
    );
};

export default Verify;
