import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allLabel?: string;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  allLabel = "All",
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 bg-muted/30 border-border/50 text-sm font-normal hover:bg-muted/50"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border/80"
        align="start"
      >
        {/* Header with Total Count */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/20">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Total Languages: {options.length}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
          <Search className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 text-foreground"
          />
        </div>
        <div className="max-h-52 overflow-y-auto scrollbar-thin p-1">
          {/* All option */}
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={cn(
              "flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm rounded-md transition-colors text-left",
              !value
                ? "bg-primary/10 text-foreground"
                : "text-foreground/80 hover:bg-muted/50"
            )}
          >
            <div
              className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                !value ? "bg-primary border-primary" : "border-border/80"
              )}
            >
              {!value && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            {allLabel}
          </button>

          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No results found
            </p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm rounded-md transition-colors text-left group",
                  value === opt
                    ? "bg-primary/10 text-foreground"
                    : "text-foreground/80 hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                    value === opt
                      ? "bg-primary border-primary"
                      : "border-border/80"
                  )}
                >
                  {value === opt && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="truncate flex-1">{opt}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
