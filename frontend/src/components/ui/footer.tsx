import React from "react";
import { ShieldCheck, Github, Twitter, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
    label: string;
    href: string;
}

interface SocialLink {
    icon: React.ReactNode;
    href: string;
    label: string;
}

interface FooterProps {
    brandName?: string;
    brandDescription?: string;
    socialLinks?: SocialLink[];
    navLinks?: FooterLink[];
    creatorName?: string;
    creatorUrl?: string;
    className?: string;
}

const Footer = ({
    brandName = "Cyphire",
    brandDescription = "Blockchain-powered certificate verification. Immutable, instant, and tamper-proof.",
    socialLinks = [
        { icon: <Github className="w-5 h-5" />, href: "https://github.com", label: "GitHub" },
        { icon: <Twitter className="w-5 h-5" />, href: "https://twitter.com", label: "Twitter" },
        { icon: <Mail className="w-5 h-5" />, href: "mailto:contact@cyphire.io", label: "Email" },
    ],
    navLinks = [
        { label: "Verify", href: "/verify" },
        { label: "Login", href: "/login" },
    ],
    creatorName,
    creatorUrl,
    className,
}: FooterProps) => {
    return (
        <footer className={cn("relative w-full border-t border-white/10 bg-background overflow-hidden", className)}>

            <div style={{ position: 'relative', width: '100%', padding: '4rem 1.5rem 0' }}>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={18} style={{ color: '#4ade80' }} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>{brandName}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6 }}>
                        {brandDescription}
                    </p>
                </div>

                {socialLinks.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
                        {socialLinks.map((link, i) => (
                            <a
                                key={i}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                                style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>
                )}

                {navLinks.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
                        {navLinks.map((link, i) => (
                            <a
                                key={i}
                                href={link.href}
                                style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}

                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '14rem',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'clamp(5rem, 18vw, 11rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 60%, transparent 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        {brandName.toUpperCase()}
                    </div>

                    <div style={{ position: 'relative', zIndex: 10, marginBottom: '1.5rem' }}>
                        <div style={{
                            backdropFilter: 'blur(8px)',
                            borderRadius: '16px',
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            padding: '10px',
                            transition: 'border-color 0.3s',
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.85))',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <ShieldCheck style={{ width: '22px', height: '22px', color: '#000' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)', marginBottom: '1rem' }} />

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '0.75rem 0 1.5rem', position: 'relative', zIndex: 10 }}>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
                        &copy;{new Date().getFullYear()} {brandName}. All rights reserved.
                    </p>
                    {creatorName && creatorUrl && (
                        <a
                            href={creatorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                        >
                            Crafted by {creatorName}
                        </a>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
