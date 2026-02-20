import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { InteractivePreviewDemo } from '../components/ui/image-comparison-demo';

import { MeshGradient } from '../components/ui/background-paper-shaders';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import Footer from '../components/ui/footer';

const LandingPreview = () => {
    const navigate = useNavigate();

    const handleContinue = () => {
        localStorage.setItem('hasSeenPreview', 'true');
        navigate('/verify'); // Go to the main tool
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-8 relative">
            {/* Interactive Background */}
            <MeshGradient
                className="absolute inset-0 z-0 h-full w-full opacity-90"
                colors={['#1a0533', '#0d1f4f']}
                speed={0.6}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-12"
            >
                <div className="text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/5 bg-muted/50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <ShieldCheck size={14} />
                        Next-Gen Verification
                    </div>

                    <h1 className="mb-8 text-5xl font-black leading-none tracking-tighter text-foreground md:text-7xl">
                        Verify the <span className="text-muted-foreground">Unseen.</span>
                    </h1>
                </div>

                <div className="w-full max-w-[850px]">
                    <InteractivePreviewDemo />
                </div>

                <Button
                    variant="expandIcon"
                    size="lg"
                    Icon={ArrowRight}
                    iconPlacement="right"
                    onClick={handleContinue}
                    style={{
                        padding: '1.5rem 3rem',
                        fontSize: '18px',
                        fontWeight: 800,
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        borderRadius: '12px',
                        boxShadow: '0 0 40px rgba(255,255,255,0.4)',
                        border: 'none',
                        outline: 'none'
                    }}
                >
                    Proceed to Portal
                </Button>
            </motion.div>

            <div className="relative mt-auto w-full">
                <Footer />
            </div>
        </div>
    );


};

export default LandingPreview;
