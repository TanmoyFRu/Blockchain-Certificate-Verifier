import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, Database, Zap, Upload, ArrowRight, Check, Globe, FileText, Lock, Cpu, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { GlowingEffect } from '../components/ui/glowing-effect';
import { cn } from '../lib/utils';
import Footer from '../components/ui/footer';
import { MeshGradient } from '../components/ui/background-paper-shaders';
import { ScrambledTitle } from '../components/ui/modern-animated-hero-section';

const Verify = () => {
    const [hash, setHash] = useState('');
    const [file, setFile] = useState(null);
    const [verifyMode, setVerifyMode] = useState('hash');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlHash = params.get('hash');
        if (urlHash) {
            setHash(urlHash);
            setVerifyMode('hash');
        }
    }, [location]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setData(null);
        try {
            let res;
            if (verifyMode === 'hash') {
                res = await api.get(`/certificates/verify/${hash.trim()}`);
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', backgroundColor: 'hsl(var(--background))' }}>
            <MeshGradient
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
                colors={['#1a0533', '#0d1f4f']}
                speed={0.6}
            />
            <nav style={{
                height: '64px',
                borderBottom: '1px solid hsl(var(--border))',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2rem',
                justifyContent: 'flex-end',
                position: 'sticky',
                top: 0,
                backgroundColor: 'hsl(var(--background) / 0.85)',
                backdropFilter: 'blur(12px)',
                zIndex: 50
            }}>
                <button
                    onClick={() => window.location.href = '/login'}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.25), 0 0 16px rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.12)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 1.1rem',
                        borderRadius: '9999px',
                        background: 'rgba(255,255,255,0.06)',
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.12)',
                        border: 'none',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '13px',
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.2s ease',
                    }}
                >
                    Issuer Login
                </button>
            </nav>

            <main style={{ height: 'calc(100vh - 64px)', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <section style={{ width: '100%', maxWidth: '700px', padding: '0 2rem', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.3rem 0.9rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        fontSize: '11px',
                        fontWeight: 600,
                        marginBottom: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#ffffff'
                    }}>
                        <Globe size={12} />
                        <span>Decentralized Verification Protocol</span>
                    </div>

                    <div style={{ minHeight: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                        <ScrambledTitle
                            className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl text-center w-full"
                            items={['Instant Certificate Verification', 'Secure Blockchain Registry', 'Immutable & Trusted']}
                        />
                    </div>

                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.82rem',
                        lineHeight: 1.5,
                        maxWidth: '500px',
                        margin: '0 auto 1.25rem'
                    }}>
                        Secure, open-source registry for accomplishments. Verify authenticity via cryptographic hashing and Polygon immutability.
                    </p>

                    <div className="shad-card" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'left' }}>
                        <div className="mb-4 grid w-full grid-cols-2 gap-3">
                            <button
                                onClick={() => { setVerifyMode('hash'); setData(null); setError(null); }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.9rem 1rem',
                                    borderRadius: '12px',
                                    border: verifyMode === 'hash' ? '1.5px solid rgba(74,222,128,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
                                    background: verifyMode === 'hash' ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.03)',
                                    boxShadow: verifyMode === 'hash' ? '0 0 20px rgba(74,222,128,0.1)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ShieldCheck size={18} style={{ color: verifyMode === 'hash' ? '#4ade80' : 'rgba(255,255,255,0.35)' }} />
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: verifyMode === 'hash' ? '#ffffff' : 'rgba(255,255,255,0.4)',
                                    letterSpacing: '0.02em'
                                }}>Hash ID</span>
                            </button>
                            <button
                                onClick={() => { setVerifyMode('file'); setData(null); setError(null); }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.9rem 1rem',
                                    borderRadius: '12px',
                                    border: verifyMode === 'file' ? '1.5px solid rgba(74,222,128,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
                                    background: verifyMode === 'file' ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.03)',
                                    boxShadow: verifyMode === 'file' ? '0 0 20px rgba(74,222,128,0.1)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Upload size={18} style={{ color: verifyMode === 'file' ? '#4ade80' : 'rgba(255,255,255,0.35)' }} />
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: verifyMode === 'file' ? '#ffffff' : 'rgba(255,255,255,0.4)',
                                    letterSpacing: '0.02em'
                                }}>PDF Upload</span>
                            </button>
                        </div>

                        <form onSubmit={handleVerify} className="flex flex-col gap-4">
                            {verifyMode === 'hash' ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold tracking-wide text-muted-foreground">CREDENTIAL HASH</label>
                                    <input
                                        type="text"
                                        placeholder="Enter 64-character hash..."
                                        className="shad-input"
                                        style={{ height: '56px', backgroundColor: 'hsl(var(--muted) / 0.5)', borderColor: 'hsl(var(--border))', fontSize: '15px' }}
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
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText size={40} className="text-foreground" />
                                            <p className="text-sm font-bold">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">Ready to verify</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <Upload size={40} className="text-muted-foreground" />
                                            <p className="text-[15px] font-bold">Click to upload certificate</p>
                                            <p className="text-xs text-muted-foreground">Support for standard PDF format</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <Button
                                type="submit"
                                variant="shine"
                                disabled={loading}
                                className="h-14 w-full rounded-xl text-base font-bold"
                            >
                                {loading ? 'Verifying...' : (
                                    <>Verify Credential <ArrowRight size={20} /></>
                                )}
                            </Button>
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
                                <div className="mb-8 flex items-center gap-4">
                                    {data.on_chain?.revoked ? (
                                        <>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                                                <AlertTriangle className="text-red-500" size={24} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-extrabold text-[#ff4444]">CERTIFICATE REVOKED</h3>
                                                <p className="text-xs font-medium text-muted-foreground">This credential has been invalidated on-chain</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
                                                <Check className="text-green-500" size={24} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-extrabold text-foreground">Record Verified</h3>
                                                <p className="text-xs font-medium text-muted-foreground">Cryptographically signed on Polygon</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-border bg-muted/40 p-5 transition-colors hover:bg-muted/60">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Recipient</span>
                                        <p className="mt-1 text-base font-bold text-foreground">{data.local_record?.owner_name || "Unknown"}</p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-muted/40 p-5 transition-colors hover:bg-muted/60">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Credential</span>
                                        <p className="mt-1 text-base font-bold text-foreground">{data.local_record?.course_name || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Proof of Authenticity</h4>
                                    <div className="space-y-3 rounded-xl border border-border/50 bg-foreground/5 p-5">
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-muted-foreground font-medium">Issuer Address</span>
                                            <span className="font-mono text-foreground font-bold">{data.on_chain?.issuer?.slice(0, 10)}...{data.on_chain?.issuer?.slice(-8)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-muted-foreground font-medium">Issuance Time</span>
                                            <span className="text-foreground font-bold">
                                                {data.on_chain?.timestamp ? new Date(data.on_chain.timestamp * 1000).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-muted-foreground font-medium">Status</span>
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${data.on_chain?.revoked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {data.on_chain?.revoked ? 'Revoked' : 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {data.pdf_url && (
                                    <div className="mt-8 text-center pt-2">
                                        <a href={data.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary underline underline-offset-4 ring-offset-background transition-colors hover:text-primary/80">
                                            <FileText size={16} /> View Original Document
                                        </a>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </section>
            </main>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: <Database />, title: 'Immutable Audit', desc: 'Tamper-proof record keeping powered by Polygon blockchain.' },
                            { icon: <Zap />, title: 'Instant Proof', desc: 'Near-zero latency verification using distributed node indexing.' },
                            { icon: <ShieldCheck />, title: 'Enterprise Secure', desc: 'Cryptographically signed certificates with SHA-256 standard.' },
                            { icon: <Lock />, title: 'Privacy Preserved', desc: 'Zero-knowledge proofs ensure data privacy while maintaining verifiable authenticity.' },
                            { icon: <Cpu />, title: 'Smart Contracts', desc: 'Automated logic execution ensures compliance and removes manual verification bottlenecks.' },
                            { icon: <Network />, title: 'Global Consensus', desc: 'Distributed ledger technology ensures your data is available and verifiable 24/7 globally.' }
                        ].map((feature, i) => (
                            <div key={i} className="min-h-[14rem] relative h-full rounded-2xl p-[1px]">
                                <GlowingEffect
                                    spread={40}
                                    glow={true}
                                    disabled={false}
                                    proximity={64}
                                    inactiveZone={0.01}
                                    borderWidth={3}
                                />
                                <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-xl bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
                                    <div className="w-fit rounded-lg border-[0.75px] border-white/10 bg-white/5 p-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        {feature.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <Footer />
            </div>
        </div>
    );
};

export default Verify;
