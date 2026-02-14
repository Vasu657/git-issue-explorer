import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxDisplay?: number;
}

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  maxDisplay = 5,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 bg-muted/30 border-border/50 text-sm font-normal hover:bg-muted/50"
          >
            <span className="truncate text-muted-foreground">
              {selected.length > 0
                ? `${selected.length} label${selected.length > 1 ? "s" : ""} selected`
                : placeholder}
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
              Total Labels: {options.length}
            </span>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
            <Search className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 text-foreground"
            />
            {selected.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto scrollbar-thin p-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No labels found
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggle(opt)}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm rounded-md transition-colors text-left group",
                    selected.includes(opt)
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground/80 hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      selected.includes(opt)
                        ? "bg-primary border-primary"
                        : "border-border/80"
                    )}
                  >
                    {selected.includes(opt) && (
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

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.slice(0, maxDisplay).map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="text-[10px] h-5 px-1.5 gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer"
              onClick={() => toggle(item)}
            >
              {item}
              <X className="h-2.5 w-2.5" />
            </Badge>
          ))}
          {selected.length > maxDisplay && (
            <Badge
              variant="secondary"
              className="text-[10px] h-5 px-1.5 bg-muted/50 text-muted-foreground"
            >
              +{selected.length - maxDisplay} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
