import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import AuthTokenPanel from "./AuthTokenPanel";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useToast } from "@/components/ui/use-toast";
import WelcomeOverlay from "./WelcomeOverlay";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { Button } from "./ui/button";

const Navbar = () => {
  const { user } = useAuthToken();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user) {
      const welcomedKey = `gf:welcomed:${user.id || user.login}`;
      const hasBeenWelcomed = localStorage.getItem(welcomedKey);

      if (!hasBeenWelcomed) {
        setShowWelcome(true);
        localStorage.setItem(welcomedKey, "true");
      }
    } else {
      setShowWelcome(false);
    }
  }, [user]);

  return (
    <>
      {showWelcome && user && (
        <WelcomeOverlay
          username={user.name || user.login}
          onComplete={() => setShowWelcome(false)}
        />
      )}
      <nav className="sticky top-0 z-50 border-b border-border/50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 flex items-center justify-center shrink-0">
              <img src="/logo.svg" alt="GitFinder Logo" className="h-8 w-8" />
            </div>
            <span className="font-bold text-foreground tracking-tight text-base sm:text-lg">
              Git<span className="text-primary">Finder</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-medium uppercase tracking-wider">
              <Sparkles className="h-2.5 w-2.5" />
              Beta
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300">
              <Link to="/info">
                <Info className="h-[18px] w-[18px]" />
              </Link>
            </Button>
            <AuthTokenPanel />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
