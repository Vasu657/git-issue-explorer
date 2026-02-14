import { useRef, useEffect } from "react";
import { Search, Loader2, Command } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  totalCount: number;
  hasResults: boolean;
}

const SearchBar = ({
  value,
  onChange,
  loading,
  totalCount,
  hasResults,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-7 relative z-10">
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
          placeholder="Search issues… e.g. 'react hooks bug', 'python async'"
          className="relative w-full h-14 sm:h-16 pl-14 pr-44 rounded-2xl bg-card border border-border/80 text-foreground text-sm sm:text-base placeholder:text-muted-foreground/60 focus:outline-none transition-all"
          aria-label="Search GitHub issues"
        />

        {/* Right side */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {hasResults && (
            <span className="text-xs text-muted-foreground tabular-nums font-medium hidden sm:inline max-w-[9rem] truncate text-right">
              {totalCount.toLocaleString()} results
            </span>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 bg-muted/60 px-2 py-1.5 rounded-lg font-mono border border-border/50">
            <Command className="h-2.5 w-2.5" />
            K
          </kbd>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
