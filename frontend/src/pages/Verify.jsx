import React, { useState } from 'react';
import api from '../services/api';
import { ShieldCheck, Search, Activity, Clock } from 'lucide-react';

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
        <div style={{ maxWidth: '800px', margin: '100px auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                    <ShieldCheck size={48} color="#10b981" /> CertVerifier
                </h1>
                <p style={{ color: '#94a3b8' }}>Universal Blockchain Verification Portal</p>
            </div>

            <div className="glass-card" style={{ padding: '40px' }}>
                <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        placeholder="Paste Certificate SHA-256 Hash"
                        className="input-field"
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={18} /> {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                {error && <p style={{ color: '#ef4444', marginTop: '20px', textAlign: 'center' }}>{error}</p>}

                {data && (
                    <div style={{ marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '30px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="glass-card" style={{ padding: '20px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Student Name</p>
                                <p style={{ fontSize: '18px', fontWeight: '600' }}>{data.local_record.owner_name}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '20px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>Course</p>
                                <p style={{ fontSize: '18px', fontWeight: '600' }}>{data.local_record.course_name}</p>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '20px', marginTop: '20px', background: 'rgba(16, 185, 129, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Activity color="#10b981" />
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: '600' }}>Blockchain Status: Verified</p>
                                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Transaction Recorded on Immutable Ledger</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>Issued At</p>
                                    <p style={{ fontSize: '14px' }}>{new Date(data.local_record.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Verify;
