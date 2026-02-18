import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent-accepted");
        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent-accepted", "true");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: 100, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 100, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-6 right-6 z-[100] w-[380px] group"
                >
                    {/* Glowing outer border effect */}
                    <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/50 via-primary/10 to-transparent rounded-[2rem] blur-[2px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                    <div className="relative overflow-hidden bg-background/40 backdrop-blur-2xl border border-white/10 rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6">
                        {/* Decorative background flare */}
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 blur-3xl rounded-full animate-pulse" />

                        <div className="space-y-5">
                            <div className="flex items-start justify-between">
                                <motion.div
                                    initial={{ rotate: -20, scale: 0.8 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner"
                                >
                                    <Cookie className="h-6 w-6 text-primary" />
                                </motion.div>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <motion.h3
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-xl font-semibold tracking-tight"
                                >
                                    Freshly Baked!
                                </motion.h3>
                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-[15px] leading-relaxed text-muted-foreground"
                                >
                                    We use cookies to ensure you get the best experience on our site. No raisins involved, we promise.
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex gap-3 pt-2"
                            >
                                <Button
                                    onClick={handleAccept}
                                    className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-300 shadow-lg shadow-primary/20"
                                >
                                    Got it!
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
