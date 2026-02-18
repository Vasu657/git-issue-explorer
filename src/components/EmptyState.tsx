import { useEffect, useState } from "react";
import { AlertCircle, Clock, Inbox } from "lucide-react";

type EmptyStateType = "no-results" | "rate-limited" | "error";

interface EmptyStateProps {
  type: EmptyStateType;
  message?: string;
  resetMs?: number;
}

const EmptyState = ({
  type,
  message,
  resetMs = 0,
}: EmptyStateProps) => {
  const [countdown, setCountdown] = useState(Math.ceil(resetMs / 1000));

  useEffect(() => {
    if (type !== "rate-limited" || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [type, countdown]);

  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="h-14 w-14 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-5">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          No issues found
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adjusting your search query or filters to broaden the results.
        </p>
      </div>
    );
  }

  if (type === "rate-limited") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
          <Clock className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          Rate limit reached
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          GitHub's API limits unauthenticated requests.
          {countdown > 0 && (
            <span className="block mt-2 font-mono text-sm font-semibold text-destructive">
              Try again in {countdown}s
            </span>
          )}
        </p>
        <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary max-w-xs transition-all animate-in slide-in-from-bottom-2 duration-500">
          <p className="font-bold mb-1 uppercase tracking-wider">Pro Tip</p>
          <p className="opacity-90">Add a GitHub Personal Access Token via the <span className="font-bold">Auth</span> button to increase your limit to 5,000 requests per hour.</p>
        </div>
      </div>
    );
  }

  // Error
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="h-14 w-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {message || "An unexpected error occurred. Please try again."}
      </p>
    </div>
  );
};

export default EmptyState;
