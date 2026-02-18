import React, { useState } from 'react';
import api from '../services/api';
import { Layout, LogOut, PlusCircle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
    const [ownerName, setOwnerName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [orgId, setOrgId] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleIssue = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            const res = await api.post('/certificates/issue', {
                owner_name: ownerName,
                course_name: courseName,
                organization_id: parseInt(orgId)
            });
            setStatus({ success: true, hash: res.data.cert_hash, tx: res.data.tx_hash });
        } catch (err) {
            setStatus({ success: false, msg: err.response?.data?.detail || 'Issue failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Layout color="#6366f1" /> Admin Dashboard
                </h1>
                <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="btn-primary" style={{ background: '#334155' }}>
                    <LogOut size={18} />
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <section className="glass-card" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={20} /> Issue New Certificate
                    </h3>
                    <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input type="text" placeholder="Student Name" className="input-field" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                        <input type="text" placeholder="Course Name" className="input-field" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
                        <input type="number" placeholder="Organization ID" className="input-field" value={orgId} onChange={(e) => setOrgId(e.target.value)} required />
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Issue on Blockchain'}
                        </button>
                    </form>
                </section>

                <section>
                    {status && (
                        <div className={`glass-card`} style={{ padding: '32px', borderLeft: `4px solid ${status.success ? '#10b981' : '#ef4444'}` }}>
                            {status.success ? (
                                <>
                                    <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <CheckCircle /> Certificate Issued!
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Certificate Hash:</p>
                                    <code style={{ display: 'block', background: '#000', padding: '10px', borderRadius: '4px', wordBreak: 'break-all' }}>{status.hash}</code>
                                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '16px', marginBottom: '8px' }}>Blockchain Transaction:</p>
                                    <code style={{ display: 'block', background: '#000', padding: '10px', borderRadius: '4px', wordBreak: 'break-all' }}>{status.tx}</code>
                                </>
                            ) : (
                                <p style={{ color: '#ef4444' }}>{status.msg}</p>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
