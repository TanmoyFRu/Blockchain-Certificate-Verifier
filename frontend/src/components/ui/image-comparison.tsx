'use client';
import { useState, createContext, useContext } from 'react';
import {
    motion,
    MotionValue,
    SpringOptions,
    useMotionValue,
    useSpring,
    useTransform,
} from 'framer-motion';

const ImageComparisonContext = createContext<
    | {
        sliderPosition: number;
        setSliderPosition: (pos: number) => void;
        motionSliderPosition: MotionValue<number>;
    }
    | undefined
>(undefined);

type ImageComparisonProps = {
    children: React.ReactNode;
    className?: string;
    enableHover?: boolean;
    springOptions?: SpringOptions;
    onChange?: (position: number) => void;
};

const DEFAULT_SPRING_OPTIONS = {
    bounce: 0,
    duration: 0,
};

function ImageComparison({
    children,
    className,
    enableHover,
    springOptions,
    onChange,
}: ImageComparisonProps) {
    const [isDragging, setIsDragging] = useState(false);
    const motionValue = useMotionValue(50);
    const motionSliderPosition = useSpring(
        motionValue,
        springOptions ?? DEFAULT_SPRING_OPTIONS
    );
    const [sliderPosition, setSliderPosition] = useState(50);

    const handleDrag = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging && !enableHover) return;

        const containerRect = (
            event.currentTarget as HTMLElement
        ).getBoundingClientRect();
        const x =
            'touches' in event
                ? event.touches[0].clientX - containerRect.left
                : (event as React.MouseEvent).clientX - containerRect.left;

        const percentage = Math.min(
            Math.max((x / containerRect.width) * 100, 0),
            100
        );
        motionValue.set(percentage);
        setSliderPosition(percentage);
        if (onChange) onChange(percentage);
    };

    return (
        <ImageComparisonContext.Provider
            value={{ sliderPosition, setSliderPosition, motionSliderPosition }}
        >
            <div
                style={{ position: 'relative', userSelect: 'none', overflow: 'hidden', width: '100%', height: '100%', cursor: enableHover ? 'ew-resize' : 'default' }}
                className={className}
                onMouseMove={handleDrag}
                onMouseDown={() => !enableHover && setIsDragging(true)}
                onMouseUp={() => !enableHover && setIsDragging(false)}
                onMouseLeave={() => !enableHover && setIsDragging(false)}
                onTouchMove={handleDrag}
                onTouchStart={() => !enableHover && setIsDragging(true)}
                onTouchEnd={() => !enableHover && setIsDragging(false)}
            >
                {children}
            </div>
        </ImageComparisonContext.Provider>
    );
}

const ImageComparisonImage = ({
    className,
    alt,
    src,
    side,
}: {
    className?: string;
    alt: string;
    src: string;
    side: 'left' | 'right';
}) => {
    const { motionSliderPosition } = useContext(ImageComparisonContext)!;

    // side="left" -> shows on the left of the slider (clips the right side)
    // side="right" -> shows on the right of the slider (clips the left side)
    const leftClipPath = useTransform(
        motionSliderPosition,
        (value) => `inset(0 ${100 - value}% 0 0)`
    );
    const rightClipPath = useTransform(
        motionSliderPosition,
        (value) => `inset(0 0 0 ${value}%)`
    );

    return (
        <motion.img
            src={src}
            alt={alt}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                clipPath: side === 'left' ? leftClipPath : rightClipPath,
            }}
            className={className}
        />
    );
};

const ImageComparisonSlider = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    const { motionSliderPosition } = useContext(ImageComparisonContext)!;

    const leftPosition = useTransform(motionSliderPosition, (value) => `${value}%`);

    return (
        <motion.div
            style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: 'white',
                cursor: 'ew-resize',
                left: leftPosition,
                transform: 'translateX(-50%)',
                zIndex: 10
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export { ImageComparison, ImageComparisonImage, ImageComparisonSlider };
