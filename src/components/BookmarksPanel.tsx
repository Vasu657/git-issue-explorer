import { useMemo } from "react";
import { Bookmark as BookmarkIcon, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useBookmarks } from "@/hooks/useBookmarks";
import IssueCard from "./IssueCard";

const BookmarksPanel = () => {
  const { bookmarks, remove } = useBookmarks();

  const count = useMemo(() => bookmarks.length, [bookmarks]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 transition-all ${count > 0
              ? "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <BookmarkIcon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Bookmarks</span>
          {count > 0 && (
            <span className="ml-2 h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold animate-pulse">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96 bg-background border-border/50 overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="text-base text-foreground font-bold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            Saved Bookmarks
          </SheetTitle>
          <p className="text-xs text-muted-foreground mt-2">
            {count > 0
              ? `You have ${count} saved ${count === 1 ? "issue" : "issues"}. They're stored locally.`
              : "No bookmarks yet — click the bookmark icon on any issue to save it."}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {bookmarks.length === 0 && (
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 text-center space-y-2">
              <BookmarkIcon className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No bookmarks yet</p>
              <p className="text-xs text-muted-foreground/60">Save interesting issues to find them later</p>
            </div>
          )}

          {bookmarks.map((b, i) => (
            <div
              key={b.id}
              className="group relative animate-in fade-in slide-in-from-top-4 duration-300"
              style={{
                animationDelay: `${i * 30}ms`,
                animationFillMode: "both",
              }}
            >
              <IssueCard issue={b} index={i} />
              <button
                onClick={() => remove(b.id)}
                className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center bg-card border border-border/40 text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-all opacity-0 group-hover:opacity-100 z-10"
                title="Remove bookmark"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookmarksPanel;