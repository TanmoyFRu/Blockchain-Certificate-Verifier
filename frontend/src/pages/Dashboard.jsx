import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Layout, LogOut, PlusCircle, CheckCircle, Table as TableIcon, BarChart3, ExternalLink, Trash2, Search, User, Briefcase, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', issued: 4 },
    { name: 'Feb', issued: 12 },
    { name: 'Mar', issued: 8 },
    { name: 'Apr', issued: 15 },
    { name: 'May', issued: 21 },
    { name: 'Jun', issued: 18 },
    { name: 'Jul', issued: 25 },
];

const Dashboard = () => {
    const [ownerName, setOwnerName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [orgId, setOrgId] = useState('');
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
            setOwnerName('');
            setCourseName('');
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
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            {/* 21st.dev Sidebar Pattern */}
            <aside style={{ width: '260px', borderRight: '1px solid hsl(var(--border))', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: '0 0.5rem' }}>
                    <ShieldCheck size={20} style={{ color: 'hsl(var(--primary))' }} />
                    <span>CertVerifier</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', padding: '0.5rem', marginBottom: '0.25rem' }}>Main Menu</div>
                    <button className="shad-btn" style={{ justifyContent: 'flex-start', gap: '0.75rem', backgroundColor: 'hsl(var(--secondary))', width: '100%' }}>
                        <Layout size={18} /> Dashboard
                    </button>
                    <button className="shad-btn shad-btn-outline" style={{ justifyContent: 'flex-start', gap: '0.75rem', border: 'none', width: '100%' }}>
                        <TableIcon size={18} /> Certificates
                    </button>
                    <button className="shad-btn shad-btn-outline" style={{ justifyContent: 'flex-start', gap: '0.75rem', border: 'none', width: '100%' }}>
                        <BarChart3 size={18} /> Analytics
                    </button>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="shad-btn shad-btn-outline" style={{ width: '100%', gap: '0.5rem' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Overview</h1>
                        <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>Manage your organization's digital credentials</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Demo Mode:</span>
                        <input
                            type="number"
                            placeholder="Org ID"
                            className="shad-input"
                            style={{ width: '80px' }}
                            value={orgId}
                            onChange={(e) => setOrgId(e.target.value)}
                        />
                    </div>
                </header>

                {/* Analytics Cards with Recharts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="shad-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>Total Issued</span>
                            <User size={16} color="hsl(var(--muted-foreground))" />
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>{certs.length}</div>
                        <p style={{ fontSize: '12px', color: '#10b981', marginTop: '0.25rem' }}>+12% from last month</p>
                    </div>
                    <div className="shad-card" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>Issuance Trends</span>
                            <BarChart3 size={16} color="hsl(var(--muted-foreground))" />
                        </div>
                        <div style={{ height: '80px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="issued" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIssued)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* 21st.dev inspired Card for Form */}
                    <section className="shad-card">
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PlusCircle size={18} /> Issue Certificate
                        </h3>
                        <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <label style={{ fontSize: '13px', fontWeight: 500 }}>Recipient Name</label>
                                <input type="text" placeholder="e.g. John Doe" className="shad-input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <label style={{ fontSize: '13px', fontWeight: 500 }}>Credential Title</label>
                                <input type="text" placeholder="e.g. Blockchain Expert" className="shad-input" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
                            </div>
                            <button type="submit" className="shad-btn shad-btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading || !orgId}>
                                {loading ? 'Processing...' : 'Issue on Polygon'}
                            </button>
                        </form>

                        {status && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius)', backgroundColor: status.success ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: `1px solid ${status.success ? '#10b981' : '#ef4444'}`, fontSize: '13px' }}>
                                {status.success ? 'Success: Record added to chain.' : status.msg}
                            </div>
                        )}
                    </section>

                    {/* 21st.dev inspired Table Component */}
                    <section className="shad-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Activity</h3>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '0.6rem', color: 'hsl(var(--muted-foreground))' }} />
                                <input
                                    type="text"
                                    placeholder="Filter..."
                                    className="shad-input"
                                    style={{ paddingLeft: '2.25rem', width: '240px' }}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>Student</th>
                                        <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>Credential</th>
                                        <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>Date</th>
                                        <th style={{ padding: '0.75rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCerts.map((cert) => (
                                        <tr key={cert.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                                        {cert.owner_name[0]}
                                                    </div>
                                                    {cert.owner_name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{cert.course_name}</td>
                                            <td style={{ padding: '1rem 0.5rem', color: 'hsl(var(--muted-foreground))' }}>
                                                {new Date(cert.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button className="shad-btn shad-btn-outline" style={{ padding: '0.35rem' }} title="View Details">
                                                        <ExternalLink size={14} />
                                                    </button>
                                                    <button className="shad-btn shad-btn-outline" style={{ padding: '0.35rem', color: '#ef4444' }} title="Revoke">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredCerts.length === 0 && (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                    No certificates found.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

const ShieldCheck = ({ size, style }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
    </svg>
);

export default Dashboard;
