"use client"

import * as React from "react"
import {
    ImageComparison,
    ImageComparisonImage,
    ImageComparisonSlider,
} from "./image-comparison"

export function BasicDemo() {
    return (
        <div style={{ width: '100%', position: 'relative', borderRadius: '8px', border: '1px solid hsl(var(--border))', overflow: 'hidden', aspectRatio: '16/10' }}>
            <ImageComparison className="h-full w-full">
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000"
                    alt="Mountain Landscape"
                    position="left"
                />
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
                    alt="Mountain Peaks"
                    position="right"
                />
                <ImageComparisonSlider className="bg-white" />
            </ImageComparison>
        </div>
    )
}

export function HoverDemo() {
    return (
        <div style={{ width: '100%', position: 'relative', borderRadius: '8px', border: '1px solid hsl(var(--border))', overflow: 'hidden', aspectRatio: '16/10' }}>
            <ImageComparison className="h-full w-full" enableHover>
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000"
                    alt="Lush Forest"
                    position="left"
                />
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2000"
                    alt="Lake Landscape"
                    position="right"
                />
                <ImageComparisonSlider className="bg-white" />
            </ImageComparison>
        </div>
    )
}

export function SpringDemo() {
    return (
        <div style={{ width: '100%', position: 'relative', borderRadius: '8px', border: '1px solid hsl(var(--border))', overflow: 'hidden', aspectRatio: '16/10' }}>
            <ImageComparison
                className="h-full w-full"
                enableHover
                springOptions={{
                    bounce: 0.3,
                }}
            >
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2000"
                    alt="Boat on Lake"
                    position="left"
                />
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1433838552652-f9a46b332c40?auto=format&fit=crop&q=80&w=2000"
                    alt="Waterfall"
                    position="right"
                />
                <ImageComparisonSlider className="w-0.5 bg-white/30 backdrop-blur-sm" />
            </ImageComparison>
        </div>
    )
}

export function CustomSliderDemo() {
    return (
        <div style={{ width: '100%', position: 'relative', borderRadius: '8px', border: '1px solid hsl(var(--border))', overflow: 'hidden', aspectRatio: '16/10' }}>
            <ImageComparison className="h-full w-full">
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2000"
                    alt="Autumn Woods"
                    position="left"
                />
                <ImageComparisonImage
                    src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=2000"
                    alt="Summer Field"
                    position="right"
                />
                <ImageComparisonSlider className="w-2 bg-white/50 backdrop-blur-sm transition-colors hover:bg-white/80">
                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '24px', height: '32px', backgroundColor: 'white', borderRadius: '4px' }} />
                </ImageComparisonSlider>
            </ImageComparison>
        </div>
    )
}

export const demos = [
    {
        name: "Basic",
        description: "Basic image comparison with default settings",
        component: BasicDemo,
    },
    {
        name: "Hover",
        description: "Image comparison with hover interaction enabled",
        component: HoverDemo,
    },
    {
        name: "Spring Animation",
        description: "Image comparison with spring animation effect",
        component: SpringDemo,
    },
    {
        name: "Custom Slider",
        description: "Image comparison with custom slider design",
        component: CustomSliderDemo,
    }
]
