import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Layout, LogOut, PlusCircle, CheckCircle, Table as TableIcon, BarChart3, ExternalLink, Trash2, Search, User, Briefcase, Calendar, ShieldCheck, Activity, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';

const Dashboard = () => {
    const navigate = useNavigate();
    const [ownerName, setOwnerName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [orgId, setOrgId] = useState('1');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [certs, setCerts] = useState([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Overview');
    const [orgDetails, setOrgDetails] = useState(null);
    const [domain, setDomain] = useState('');

    const fetchOrg = async () => {
        if (!orgId) return;
        try {
            const res = await api.get(`/organizations/${orgId}`);
            setOrgDetails(res.data);
            if (res.data.domain) setDomain(res.data.domain);
        } catch (err) {
            console.error('Failed to fetch org details');
        }
    };

    const handleUpdateDomain = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/organizations/${orgId}`, { domain });
            alert("Domain updated successfully!");
        } catch (err) {
            alert("Failed to update domain");
        }
    };

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
        fetchOrg();
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

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this certificate?")) return;
        try {
            await api.delete(`/certificates/${id}`);
            setCerts(certs.filter(c => c.id !== id));
        } catch (err) {
            console.error("Failed to delete certificate");
        }
    };

    const filteredCerts = certs.filter(c =>
        c.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        c.course_name.toLowerCase().includes(search.toLowerCase())
    );

    const chartData = React.useMemo(() => {
        const months = {};
        certs.forEach(c => {
            const date = new Date(c.created_at);
            const key = date.toLocaleString('default', { month: 'short' });
            months[key] = (months[key] || 0) + 1;
        });
        return Object.entries(months).map(([name, issued]) => ({ name, issued }));
    }, [certs]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            <aside style={{
                width: '280px',
                borderRight: '1px solid hsl(var(--border))',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem',
                backgroundColor: 'hsla(var(--card), 0.3)',
                backdropFilter: 'blur(8px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, padding: '0 0.5rem', letterSpacing: '-0.02em' }}>
                    <ShieldCheck size={24} style={{ color: 'white' }} />
                    <span style={{ fontSize: '20px' }}>Veridion</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', padding: '0 0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</div>
                    {[
                        { icon: <Layout size={18} />, label: 'Overview' },
                        { icon: <TableIcon size={18} />, label: 'Certificates' },
                        { icon: <BarChart3 size={18} />, label: 'Analytics' },
                        { icon: <Globe size={18} />, label: 'Domain' }
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(item.label)}
                            className="shad-btn"
                            style={{
                                justifyContent: 'flex-start',
                                gap: '0.85rem',
                                backgroundColor: activeTab === item.label ? 'hsla(var(--foreground), 0.1)' : 'transparent',
                                width: '100%',
                                color: activeTab === item.label ? 'white' : 'hsl(var(--muted-foreground))'
                            }}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid hsl(var(--border))' }}>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="shad-btn" style={{ width: '100%', gap: '0.75rem', justifyContent: 'flex-start', color: '#ff4444' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em' }}>Issuer Dashboard</h1>
                        <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>Manage credentials and view blockchain metrics</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'hsla(var(--muted), 0.3)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>ORG ID</span>
                        <input
                            type="number"
                            placeholder="ID"
                            className="shad-input"
                            style={{ width: '60px', height: '32px', padding: '0 0.5rem', textAlign: 'center' }}
                            value={orgId}
                            onChange={(e) => setOrgId(e.target.value)}
                        />
                    </div>
                </header>

                {(activeTab === 'Overview' || activeTab === 'Analytics') && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {[
                            { label: 'Total Issued', value: certs.length, change: '+12%', icon: <User size={16} /> },
                            { label: 'Network Uptime', value: '99.9%', change: 'Stable', icon: <Activity size={16} /> },
                            { label: 'Gas Usage', value: '0.002 MATIC', change: '-4%', icon: <Zap size={16} /> }
                        ].map((stat, i) => (
                            <div key={i} className="shad-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{stat.label}</span>
                                    <div style={{ color: 'hsl(var(--muted-foreground))' }}>{stat.icon}</div>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 800 }}>{stat.value}</div>
                                <p style={{ fontSize: '12px', color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>{stat.change} <span style={{ fontWeight: 400, color: 'hsl(var(--muted-foreground))' }}>from last period</span></p>
                            </div>
                        ))}
                    </div>
                )}

                {(activeTab === 'Overview' || activeTab === 'Analytics') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                        <section className="shad-card" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Certificates Distribution</h3>
                                <div style={{ height: '8px', width: '100px', backgroundColor: 'hsla(var(--primary), 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: '70%', backgroundColor: 'white' }}></div>
                                </div>
                            </div>
                            <div style={{ height: '200px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="white" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="white" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                            itemStyle={{ color: 'white' }}
                                        />
                                        <Area type="monotone" dataKey="issued" stroke="white" strokeWidth={2} fillOpacity={1} fill="url(#colorIssued)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'Overview' ? '400px 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
                    {activeTab === 'Overview' && (
                        <section className="shad-card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <PlusCircle size={20} /> New Attestation
                            </h3>
                            <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>STUDENT NAME</label>
                                    <input type="text" placeholder="Full legal name" className="shad-input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>CREDENTIAL TITLE</label>
                                    <input type="text" placeholder="Course or award title" className="shad-input" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
                                </div>
                                <Button
                                    type="submit"
                                    variant="expandIcon"
                                    Icon={PlusCircle}
                                    iconPlacement="right"
                                    style={{ marginTop: '1rem', height: '48px', width: '100%', borderRadius: '12px', fontWeight: 800 }}
                                    disabled={loading || !orgId}
                                >
                                    {loading ? 'Processing Attestation...' : 'Confirm Issuance'}
                                </Button>
                            </form>

                            {status && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius)',
                                    backgroundColor: status.success ? 'hsla(142, 70%, 50%, 0.1)' : 'hsla(0, 70%, 50%, 0.1)',
                                    border: `1px solid ${status.success ? 'hsla(142, 70%, 50%, 0.2)' : 'hsla(0, 70%, 50%, 0.2)'}`,
                                    fontSize: '13px',
                                    fontWeight: 500
                                }}>
                                    {status.success ? 'Success: Credential recorded on blockchain.' : status.msg}
                                </div>
                            )}
                        </section>
                    )}

                    {(activeTab === 'Overview' || activeTab === 'Certificates') && (
                        <section className="shad-card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Credential Audit Log</h3>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '0.75rem', color: 'hsl(var(--muted-foreground))' }} />
                                    <input
                                        type="text"
                                        placeholder="Filter records..."
                                        className="shad-input"
                                        style={{ paddingLeft: '2.75rem', width: '280px', height: '40px' }}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ color: 'hsl(var(--muted-foreground))', textAlign: 'left', borderBottom: '1px solid hsl(var(--border))' }}>
                                            <th style={{ padding: '1rem', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Recipient</th>
                                            <th style={{ padding: '1rem', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Course</th>
                                            <th style={{ padding: '1rem', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Issued Date</th>
                                            <th style={{ padding: '1rem', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Management</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCerts.slice(0, activeTab === 'Overview' ? 5 : undefined).map((cert) => (
                                            <tr
                                                key={cert.id}
                                                style={{ borderBottom: '1px solid hsl(var(--border))', transition: 'background 0.2s', cursor: 'pointer' }}
                                                onClick={() => navigate(`/verify?hash=${cert.cert_hash}`)}
                                                className="hover:bg-muted/50"
                                            >
                                                <td style={{ padding: '1.25rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            backgroundColor: 'hsla(var(--foreground), 0.05)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: 800,
                                                            border: '1px solid hsl(var(--border))'
                                                        }}>
                                                            {cert.owner_name[0]}
                                                        </div>
                                                        <span style={{ fontWeight: 600 }}>{cert.owner_name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem', color: 'hsl(var(--muted-foreground))' }}>{cert.course_name}</td>
                                                <td style={{ padding: '1.25rem 1rem', color: 'hsl(var(--muted-foreground))' }}>
                                                    {new Date(cert.created_at).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/verify?hash=${cert.cert_hash}`); }}
                                                            className="shad-btn shad-btn-outline"
                                                            style={{ padding: '0.5rem', width: '36px', height: '36px' }}
                                                        >
                                                            <ExternalLink size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(cert.id, e)}
                                                            className="shad-btn shad-btn-outline"
                                                            style={{ padding: '0.5rem', width: '36px', height: '36px', color: '#ff4444' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredCerts.length === 0 && (
                                    <div style={{ padding: '5rem 0', textAlign: 'center' }}>
                                        <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', fontWeight: 500 }}>No cryptographic records found.</div>
                                    </div>
                                )}
                            </div>
                            {activeTab === 'Overview' && filteredCerts.length > 5 && (
                                <button className="shad-btn w-full mt-4 text-xs text-muted-foreground" onClick={() => setActiveTab('Certificates')}>
                                    View All Certificates
                                </button>
                            )}
                        </section>
                    )}

                    {activeTab === 'Domain' && (
                        <section className="shad-card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Globe size={20} /> Domain Verification
                            </h3>
                            <form onSubmit={handleUpdateDomain} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                                <p className="text-sm text-muted-foreground">
                                    Configure a custom domain for your verification page.
                                    Add a CNAME record pointing to <code>verify.certverifier.com</code>.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>CUSTOM DOMAIN</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. verify.university.edu"
                                        className="shad-input"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    style={{ marginTop: '1rem', height: '48px', width: '100%', borderRadius: '12px', fontWeight: 800 }}
                                    disabled={!orgId}
                                >
                                    Save Domain Configuration
                                </Button>
                            </form>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

const Zap = ({ size, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

export default Dashboard;
