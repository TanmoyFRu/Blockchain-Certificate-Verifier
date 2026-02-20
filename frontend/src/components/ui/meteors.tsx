import { cn } from "@/lib/utils";

export const Meteors = ({
    number,
    className,
}: {
    number?: number;
    className?: string;
}) => {
    const meteorCount = number || 20;
    const meteors = new Array(meteorCount).fill(true);

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            {meteors.map((_, idx) => (
                <span
                    key={"meteor" + idx}
                    className={cn(
                        "animate-meteor absolute top-0 h-0.5 w-0.5 rounded-[9999px]",
                        "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#94a3b8] before:to-transparent",
                        className
                    )}
                    style={{
                        backgroundColor: '#cbd5e1',
                        boxShadow: '0 0 0 1px #ffffff10',
                        transform: 'rotate(215deg)',
                        left: Math.floor(Math.random() * (100 - 0) + 0) + "%",
                        animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
                        animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
                    }}
                ></span>
            ))}
        </div>
    );
};
