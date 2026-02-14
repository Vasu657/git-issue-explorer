import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";

interface WelcomeOverlayProps {
    username: string;
    onComplete: () => void;
}

const WelcomeOverlay = ({ username, onComplete }: WelcomeOverlayProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Fire confetti immediately
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#22c55e', '#ffffff', '#fbbf24'] // Primary, white, amber
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#22c55e', '#ffffff', '#fbbf24']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();

        // Center burst for extra "grandness"
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#ffffff', '#fbbf24']
            });
        }, 500);


        // Fade out timer (starts fading before unmount)
        const fadeTimer = setTimeout(() => {
            setIsVisible(false);
        }, 4500); // Start fade at 4.5s

        // Unmount timer
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 5000); // Complete at 5s

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div className="relative text-center space-y-6 animate-in zoom-in-50 duration-700 slide-in-from-bottom-10">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mx-auto relative backdrop-blur-sm shadow-2xl shadow-primary/10">
                        <Sparkles className="h-12 w-12 text-primary animate-bounce" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] animate-gradient">
                        Welcome Back!
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-muted-foreground">
                        It's great to see you, <span className="text-foreground font-bold">{username}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeOverlay;
