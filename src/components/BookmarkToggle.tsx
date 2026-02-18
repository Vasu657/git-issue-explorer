import { Bookmark } from "lucide-react";
import type { GitHubIssue } from "@/types/github";
import { useBookmarks } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface BookmarkToggleProps {
    issue: GitHubIssue;
    className?: string;
}

export function BookmarkToggle({ issue, className }: BookmarkToggleProps) {
    const { bookmarks, toggle } = useBookmarks();
    const isBookmarked = bookmarks.some((b) => b.id === issue.id);

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggle(issue);
            }}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center bg-card border border-border/40 text-muted-foreground hover:text-primary transition-all",
                className
            )}
        >
            <Bookmark className={cn("h-4 w-4 transition-all", isBookmarked ? "text-primary fill-primary scale-110" : "text-muted-foreground")} />
        </button>
    );
}

export default BookmarkToggle;
