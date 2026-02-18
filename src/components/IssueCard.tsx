import { ExternalLink, MessageSquare, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "next-themes";
import type { GitHubIssue } from "@/types/github";
import { useBookmarks } from "@/hooks/useBookmarks";
import { BookmarkToggle } from "./BookmarkToggle";
import { useStorage } from "@/context/StorageContext";
import { getLabelStyles } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface IssueCardProps {
  issue: GitHubIssue;
  index: number;
  onClick?: (issue: GitHubIssue) => void;
}

const IssueCard = ({ issue, index, onClick }: IssueCardProps) => {
  const { theme } = useTheme();
  const { seenIssueIds } = useStorage();
  const isSeen = seenIssueIds.has(issue.id);

  const repoName = issue.repository_url.replace(
    "https://api.github.com/repos/",
    ""
  );

  const timeAgo = formatDistanceToNow(new Date(issue.created_at), {
    addSuffix: true,
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(issue)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(issue);
        }
      }}
      className={cn(
        "group relative flex items-start gap-3.5 p-4 sm:p-5 rounded-xl border border-border/50 bg-card/60 card-hover animate-fade-in cursor-pointer text-left w-full transition-all duration-300",
        isSeen ? "opacity-60 grayscale-[0.2]" : "opacity-0"
      )}
      style={{
        animationDelay: `${Math.min(index * 40, 400)}ms`,
        animationFillMode: "forwards",
      }}
      aria-label={`View details for issue: ${issue.title}`}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* User avatar */}
      {issue.user && (
        <img
          src={issue.user.avatar_url}
          alt={issue.user.login}
          className="h-8 w-8 rounded-full border border-border/50 shrink-0 mt-0.5"
          loading="lazy"
        />
      )}

      <div className="relative flex-1 min-w-0">
        {/* Bookmark button */}
        <div className="absolute top-0 right-0">
          <BookmarkToggle issue={issue} />
        </div>
        {/* Title + external link */}
        <div className="flex items-start justify-between gap-3 pr-10">
          <p className="group/title relative text-sm font-semibold text-foreground/90 group-hover:text-primary transition-colors leading-snug line-clamp-3 break-words">
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {issue.title}
              <ExternalLink className="h-3.5 w-3.5 text-primary opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0 inline-block mb-0.5" />
            </a>
          </p>
        </div>

        {/* Repo name */}
        <span className="block mt-1 text-xs text-muted-foreground font-mono truncate w-full">
          {repoName}
        </span>

        {/* Labels */}
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {issue.labels.slice(0, 5).map((label) => {
              const styles = getLabelStyles(label.color, theme);
              return (
                <span
                  key={label.id}
                  className="text-[10px] leading-none px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: styles.backgroundColor,
                    color: styles.color,
                    border: styles.border,
                  }}
                >
                  {label.name}
                </span>
              );
            })}
            {issue.labels.length > 5 && (
              <span className="text-[10px] leading-none px-2 py-1 rounded-full font-medium text-muted-foreground bg-muted/50">
                +{issue.labels.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Language badge: try to infer from labels or repo */}
        {issue.labels && issue.labels.length > 0 && (() => {
          // Try to find a language-like label (common patterns: single word, capitalized)
          const potentialLang = issue.labels
            .map(l => l.name)
            .find((n) => {
              // Simple heuristic: check if it's a single word capitalized name
              // or matches common programming language patterns
              const isCapitalized = /^[A-Z][a-z]+$/.test(n);
              const isAllCaps = /^[A-Z]+$/.test(n);
              const isProgrammingLang = /^(JavaScript|TypeScript|Python|Java|C\+\+|C#|Go|Rust|Ruby|PHP|Swift|Kotlin|Dart|Vue|React|Angular)$/i.test(n);
              return (isCapitalized || isAllCaps || isProgrammingLang) && n.length > 1 && n.length < 15;
            });
          if (potentialLang) return (
            <div className="inline-block mt-2">
              <Badge variant="secondary" className="text-[10px] px-2 py-1 font-medium">
                {potentialLang}
              </Badge>
            </div>
          );
          return null;
        })()}

        {/* Meta row */}
        <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            {!isSeen && <span>{timeAgo}</span>}
            {issue.comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {issue.comments}
              </span>
            )}
            <span
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                issue.state === "open"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  issue.state === "open" ? "bg-emerald-400" : "bg-red-400"
                )}
              />
              {issue.state}
            </span>
          </div>

          {isSeen && (
            <span className="flex items-center gap-1 text-primary/80 font-medium transition-all animate-in fade-in duration-300 ml-auto pt-1">
              <Check className="h-3 w-3" />
              Seen
            </span>
          )}
        </div>
      </div>
    </div >
  );
};

export default IssueCard;

