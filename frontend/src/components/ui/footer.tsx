import { Link } from "react-router-dom";
import {
    Github,
    Twitter,
    Linkedin,
    Youtube,
    Instagram,
    ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "./card";
import { Input } from "./input";
import { Button } from "./button";

const footerConfig = {
    description:
        "CertVerifier empowers institutions with modern blockchain tools, scalable infrastructure, and a decentralized protocol to issue and verify immutable credentials. Providing the foundation for digital trust in the Web3 era.",
    socials: [
        { icon: Github, href: "#" },
        { icon: Twitter, href: "#" },
        { icon: Linkedin, href: "#" },
        { icon: Youtube, href: "#" },
        { icon: Instagram, href: "#" },
    ],
    columns: [
        {
            title: "Company",
            links: [
                { label: "About Us", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Press", href: "#" },
                { label: "Blog", href: "#" },
            ],
        },
        {
            title: "Platform",
            links: [
                { label: "Verification", href: "/verify" },
                { label: "Issuance", href: "/login" },
                { label: "API Reference", href: "#" },
                { label: "Infrastructure", href: "#" },
            ],
        },
        {
            title: "Resources",
            links: [
                { label: "Documentation", href: "#" },
                { label: "Help Center", href: "#" },
                { label: "System Status", href: "#" },
            ],
        },
        {
            title: "Legal",
            links: [
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Security", href: "#" },
            ],
        },
    ],
};

export default function Footer() {
    return (
        <footer style={{
            backgroundColor: '#020617',
            color: 'white',
            padding: '4rem 2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            width: '100%',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '24px', fontWeight: 900, marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)' }}>
                        <ShieldCheck size={32} color="#38bdf8" />
                        <span>CertVerifier</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.6, maxWidth: '600px' }}>
                        {footerConfig.description}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem', gridColumn: 'span 3' }}>
                        {footerConfig.columns.map((col, idx) => (
                            <div key={idx}>
                                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{col.title}</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {col.links.map((link, i) => (
                                        <li key={i}>
                                            <Link
                                                to={link.href}
                                                style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.color = '#38bdf8'}
                                                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div style={{ minWidth: '280px' }}>
                        <Card style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px' }}>
                            <CardContent style={{ padding: 0 }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>INSTITUTIONAL ACCESS</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <Input
                                        placeholder="university/corp email"
                                        style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                    <Button variant="ringHover" style={{ width: '100%', backgroundColor: '#38bdf8', color: 'black', fontWeight: 800 }}>
                                        Get In Touch
                                    </Button>
                                </div>
                                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '1rem' }}>Ecosystem</h4>
                                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                                        {footerConfig.socials.map(({ icon: Icon, href }, idx) => (
                                            <Link key={idx} to={href} style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.color = '#38bdf8'}
                                                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                            >
                                                <Icon size={18} />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                    <p>© {new Date().getFullYear()} CertVerifier Protocol. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <Link to="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
                        <Link to="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
                        <Link to="#" style={{ color: 'inherit', textDecoration: 'none' }}>Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
