"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowLeftRight } from "lucide-react"
import {
    ImageComparison,
    ImageComparisonImage,
    ImageComparisonSlider,
} from "./image-comparison"

export function InteractivePreviewDemo() {
    const [position, setPosition] = React.useState(50)
    const [hasInteracted, setHasInteracted] = React.useState(false)

    const handlePositionChange = (pos: number) => {
        setPosition(pos)
        if (!hasInteracted) setHasInteracted(true)
    }

    return (
        <div style={{ width: '100%', position: 'relative', borderRadius: '16px', border: '1px solid hsl(var(--border))', overflow: 'hidden', aspectRatio: '16/10', backgroundColor: '#000', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}>
            <ImageComparison
                onChange={handlePositionChange}
                springOptions={{ bounce: 0.1, duration: 0.8 }}
            >
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000"
                    alt="Original Certificate"
                    side="left"
                />
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
                    alt="Blockchain Record"
                    side="right"
                />
                <ImageComparisonSlider />

                {/* Instructional Overlay */}
                <AnimatePresence>
                    {!hasInteracted && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 20,
                                pointerEvents: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '0.75rem 1.5rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <ArrowLeftRight size={18} color="white" className="animate-pulse" />
                                <span style={{ color: 'white', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Slide to Verify Integrity</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Contextual Pop-up Text: Left Side (Original) */}
                <AnimatePresence>
                    {position > 60 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            style={{
                                position: 'absolute',
                                left: '2rem',
                                top: '2rem',
                                zIndex: 15,
                                pointerEvents: 'none'
                            }}
                        >
                            <div style={{ backgroundColor: 'hsl(var(--primary) / 0.9)', color: 'black', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid white' }}>
                                <Sparkles size={14} /> On-Chain Identity
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Contextual Pop-up Text: Right Side (Submission) */}
                <AnimatePresence>
                    {position < 40 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            style={{
                                position: 'absolute',
                                right: '2rem',
                                top: '2rem',
                                zIndex: 15,
                                pointerEvents: 'none'
                            }}
                        >
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'black', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid black' }}>
                                Scanned Credential
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </ImageComparison>
        </div>
    )
}

export const demos = [
    {
        name: "Standard",
        component: InteractivePreviewDemo,
    }
]
