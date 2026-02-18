import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SEO title="404 - Page Not Found" />
      <div className="flex flex-col items-center gap-2 animate-fade-in">
        <div className="text-7xl font-bold tracking-widest text-muted-foreground animate-pulse">
          404
        </div>
        <div className="text-sm uppercase tracking-[0.3em] text-muted-foreground/70">
          Not Found
        </div>
      </div>
    </div>
  );
};

export default NotFound;
