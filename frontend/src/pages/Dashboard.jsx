import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Layout, LogOut, PlusCircle, CheckCircle, Table, BarChart, ExternalLink, Trash2, Search } from 'lucide-react';

const Dashboard = () => {
    const [ownerName, setOwnerName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [orgId, setOrgId] = useState(''); // Note: In a real app, this would be tied to the user profile
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [certs, setCerts] = useState([]);
    const [search, setSearch] = useState('');

    const fetchCerts = async () => {
        if (!orgId) return;
        try {
            const res = await api.get(`/certificates/?org_id=${orgId}`);
            setCerts(res.data);
        } catch (err) {
            console.error('Failed to fetch certificates');
        }
    };

    useEffect(() => {
        fetchCerts();
    }, [orgId]);

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
            fetchCerts();
        } catch (err) {
            setStatus({ success: false, msg: err.response?.data?.detail || 'Issue failed' });
        } finally {
            setLoading(false);
        }
    };

    const filteredCerts = certs.filter(c =>
        c.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        c.course_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', color: 'white' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem' }}>
                    <Layout color="#6366f1" size={32} /> Issuer Dashboard
                </h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <input
                        type="number"
                        placeholder="Set Org ID (Demo)"
                        className="input-field"
                        style={{ width: '150px' }}
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                    />
                    <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="btn-primary" style={{ background: '#334155', display: 'flex', alignItems: 'center', padding: '10px' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Analytics Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Total Certificates Issued</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Table color="#6366f1" />
                        <h2 style={{ fontSize: '2rem' }}>{certs.length}</h2>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Blockchain Nodes</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity color="#10b981" />
                        <h2 style={{ fontSize: '2rem' }}>Active</h2>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Network Usage</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart color="#f59e0b" />
                        <h2 style={{ fontSize: '2rem' }}>99.9% Up</h2>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px' }}>
                {/* Issuance Form */}
                <section className="glass-card" style={{ padding: '32px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={20} color="#6366f1" /> Issue New Certificate
                    </h3>
                    <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input type="text" placeholder="Full Student Name" className="input-field" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                        <input type="text" placeholder="Course / Credential Title" className="input-field" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
                        <button type="submit" className="btn-primary" disabled={loading || !orgId}>
                            {loading ? 'Submitting to Blockchain...' : 'Issue on Polygon'}
                        </button>
                    </form>

                    {status && (
                        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: status.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${status.success ? '#10b981' : '#ef4444'}` }}>
                            {status.success ? (
                                <p style={{ color: '#10b981', fontSize: '14px' }}>Successfully issued on-chain!</p>
                            ) : (
                                <p style={{ color: '#ef4444', fontSize: '14px' }}>{status.msg}</p>
                            )}
                        </div>
                    )}
                </section>

                {/* Certificate Management Table */}
                <section className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Table size={20} color="#6366f1" /> Issued Certificates
                        </h3>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search certificates..."
                                className="input-field"
                                style={{ paddingLeft: '40px', width: '300px' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '500' }}>Student</th>
                                    <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '500' }}>Credential</th>
                                    <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '500' }}>Issued Date</th>
                                    <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '500' }}>Status</th>
                                    <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '500' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCerts.map((cert) => (
                                    <tr key={cert.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }}>
                                        <td style={{ padding: '16px', fontWeight: '600' }}>{cert.owner_name}</td>
                                        <td style={{ padding: '16px' }}>{cert.course_name}</td>
                                        <td style={{ padding: '16px', color: '#94a3b8', fontSize: '14px' }}>
                                            {new Date(cert.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981' }}>
                                                On-Chain
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', display: 'flex', gap: '10px' }}>
                                            <button title="View Detail" className="btn-primary" style={{ padding: '8px', background: '#334155' }}>
                                                <ExternalLink size={16} />
                                            </button>
                                            <button title="Revoke" className="btn-primary" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredCerts.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No certificates found for this organization.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
