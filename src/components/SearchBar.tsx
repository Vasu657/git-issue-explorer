import { useRef, useEffect, useState } from "react";
import { Search, Loader2, Command, History, ArrowUpRight, Bookmark } from "lucide-react";
import { useStorage } from "@/context/StorageContext";
import { Button } from "./ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  totalCount: number;
  hasResults: boolean;
  showBookmarks?: boolean;
  onToggleBookmarks?: () => void;
  bookmarkCount?: number;
}

const SearchBar = ({
  value,
  onChange,
  loading,
  totalCount,
  hasResults,
  showBookmarks,
  onToggleBookmarks,
  bookmarkCount = 0,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { searchHistory, clearHistory } = useStorage();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-7 relative z-20" ref={containerRef}>
      <div className="relative search-glow rounded-2xl transition-all duration-300">
        {/* Subtle gradient border effect */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />

        {/* Search icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
          {loading ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground transition-colors" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search issues… e.g. 'react hooks bug'"
          className="relative w-full h-14 sm:h-16 pl-14 pr-44 rounded-2xl bg-card border border-border/80 text-foreground text-sm sm:text-base placeholder:text-muted-foreground/60 focus:outline-none transition-all"
          aria-label="Search GitHub issues"
        />

        {/* Right side */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {hasResults && !showBookmarks && (
            <span className="text-xs text-muted-foreground tabular-nums font-medium hidden sm:inline max-w-[9rem] truncate text-right">
              {totalCount.toLocaleString()} results
            </span>
          )}

          {onToggleBookmarks && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-xl transition-all ${showBookmarks
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmarks();
              }}
              title={showBookmarks ? "Hide bookmarks" : "Show bookmarks"}
            >
              <div className="relative">
                <Bookmark className={`h-4 w-4 ${showBookmarks ? "fill-current" : ""}`} />
                {bookmarkCount > 0 && !showBookmarks && (
                  <span className="absolute -top-2 -right-2 h-4 min-w-[1rem] px-1 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold">
                    {bookmarkCount}
                  </span>
                )}
              </div>
            </Button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 bg-muted/60 px-2 py-1.5 rounded-lg font-mono border border-border/50">
            <Command className="h-2.5 w-2.5" />
            K
          </kbd>
        </div>

        {/* History Dropdown */}
        {isFocused && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-card border border-border/80 rounded-2xl shadow-2xl animate-in fade-in zoom-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 mb-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <History className="h-3 w-3" />
                Recent Searches
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  clearHistory();
                }}
              >
                Clear
              </Button>
            </div>
            <div className="max-h-[280px] overflow-y-auto hide-scrollbar">
              {searchHistory.map((term) => (
                <button
                  key={term}
                  className="w-full flex items-center justify-between px-3 py-3 text-sm text-left text-foreground/80 hover:bg-muted/50 hover:text-primary rounded-xl transition-all group"
                  onClick={() => {
                    onChange(term);
                    setIsFocused(false);
                    inputRef.current?.blur();
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <History className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    <span className="truncate">{term}</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
