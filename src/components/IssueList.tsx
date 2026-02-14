import { Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { GitHubIssue } from "@/types/github";
import IssueCard from "./IssueCard";
import SkeletonCard from "./SkeletonCard";
import EmptyState from "./EmptyState";

interface IssueListProps {
  issues: GitHubIssue[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  rateLimited: boolean;
  rateLimitResetMs: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onSuggestedSearch: (query: string) => void;
  onIssueClick: (issue: GitHubIssue) => void;
}

const IssueList = ({
  issues,
  totalCount,
  loading,
  error,
  rateLimited,
  rateLimitResetMs,
  hasMore,
  onLoadMore,
  onIssueClick,
}: IssueListProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loadingRef.current) {
            onLoadMore();
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, onLoadMore]);
  // Rate limited
  if (rateLimited) {
    return <EmptyState type="rate-limited" resetMs={rateLimitResetMs} />;
  }

  // Error
  if (error && issues.length === 0) {
    return <EmptyState type="error" message={error} />;
  }

  // Loading (first page)
  if (loading && issues.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  // No results
  if (!loading && issues.length === 0) {
    return <EmptyState type="no-results" />;
  }

  return (
    <div>
      {/* Results header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="text-foreground font-semibold tabular-nums">
            {issues.length}
          </span>{" "}
          of{" "}
          <span className="text-foreground font-semibold tabular-nums">
            {totalCount.toLocaleString()}
          </span>{" "}
          issues
        </p>
        {loading && (
          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
        )}
      </div>

      {/* Issue cards */}
      <div className="space-y-3">
        {issues.map((issue, i) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            index={i}
            onClick={onIssueClick}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel + fallback load button for keyboard users */}
      {hasMore && (
        <div className="mt-10">
          <div ref={sentinelRef} aria-hidden="true" className="h-2" />
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={onLoadMore}
              disabled={loading}
              className="h-11 px-8 bg-card/50 border-border/50 text-foreground/80 hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all rounded-xl font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading…
                </>
              ) : (
                "Load more issues"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueList;
