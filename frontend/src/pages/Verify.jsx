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
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                backgroundColor: 'hsla(var(--background), 0.8)',
                backdropFilter: 'blur(12px)',
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <ShieldCheck size={20} style={{ color: 'hsl(var(--primary))' }} />
                    <span>Veridion</span>
                </div>
                <Button onClick={() => window.location.href = '/login'} variant="outline" size="sm" className="ring-hover-effect">
                    Issuer Login
                </Button>
            </nav>

            <main style={{ flex: 1, paddingBottom: '8rem', position: 'relative', zIndex: 1 }}>
                <section style={{ padding: '8rem 2rem 4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.35rem 1rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginBottom: '2rem',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#ffffff'
                    }}>
                        <Globe size={14} />
                        <span>Decentralized Verification Protocol</span>
                    </div>

                    <ScrambledTitle
                        className="text-4xl font-extrabold tracking-tight text-white mb-8 sm:text-5xl md:text-6xl text-center w-full"
                        items={['Instant Certificate Verification', 'Secure Blockchain Registry', 'Immutable & Trusted']}
                    />

                    <p style={{
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: '1.125rem',
                        marginBottom: '4rem',
                        lineHeight: 1.6,
                        maxWidth: '600px',
                        margin: '0 auto 4rem'
                    }}>
                        Secure, open-source registry for accomplishments. Verify authenticity via cryptographic hashing and Polygon immutability.
                    </p>

                    <div className="shad-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                        <div className="mb-8 grid w-full grid-cols-2 gap-2 rounded-xl border border-white/5 bg-muted/50 p-1.5">
                            <button
                                onClick={() => { setVerifyMode('hash'); setData(null); setError(null); }}
                                className={cn(
                                    "rounded-lg px-4 py-4 text-base font-bold transition-all",
                                    verifyMode === 'hash'
                                        ? "bg-background text-foreground shadow-sm ring-1 ring-white/10"
                                        : "text-muted-foreground hover:bg-white/5"
                                )}
                            >
                                Hash ID
                            </button>
                            <button
                                onClick={() => { setVerifyMode('file'); setData(null); setError(null); }}
                                className={cn(
                                    "rounded-lg px-4 py-4 text-base font-bold transition-all",
                                    verifyMode === 'file'
                                        ? "bg-background text-foreground shadow-sm ring-1 ring-white/10"
                                        : "text-muted-foreground hover:bg-white/5"
                                )}
                            >
                                PDF Upload
                            </button>
                        </div>

                        <form onSubmit={handleVerify} className="flex flex-col gap-6">
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
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
                                        <Check className="text-green-500" size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-extrabold text-foreground">Record Verified</h3>
                                        <p className="text-xs font-medium text-muted-foreground">Cryptographically signed on Polygon</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-border bg-muted/40 p-5 transition-colors hover:bg-muted/60">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Recipient</span>
                                        <p className="mt-1 text-base font-bold text-foreground">{data.local_record?.owner_name}</p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-muted/40 p-5 transition-colors hover:bg-muted/60">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Credential</span>
                                        <p className="mt-1 text-base font-bold text-foreground">{data.local_record?.course_name}</p>
                                    </div>
                                </div>
                                {data.pdf_url && (
                                    <div className="mt-6 text-center">
                                        <a href={data.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary underline underline-offset-4 ring-offset-background transition-colors hover:text-primary/80">
                                            <FileText size={16} /> View Original Certificate
                                        </a>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </section>


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
                                    <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
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
            </main>

            <Footer />
        </div>
    );
};

export default Verify;
