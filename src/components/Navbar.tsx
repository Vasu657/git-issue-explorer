import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import BookmarksPanel from "./BookmarksPanel";
import AuthTokenPanel from "./AuthTokenPanel";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useToast } from "@/components/ui/use-toast";
import WelcomeOverlay from "./WelcomeOverlay";

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
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 flex items-center justify-center shrink-0">
              <img src="/logo.svg" alt="GitFinder Logo" className="h-8 w-8" />
            </div>
            <span className="font-bold text-foreground tracking-tight text-lg">
              Git<span className="text-primary">Finder</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-medium uppercase tracking-wider">
              <Sparkles className="h-2.5 w-2.5" />
              Beta
            </span>
          </div>
          <div className="flex items-center gap-3">
            <BookmarksPanel />
            <AuthTokenPanel />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
