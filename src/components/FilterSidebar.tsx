import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  RotateCcw,
  Tag,
  Code,
  GitPullRequest,
  ArrowUpDown,
  UserX,
  SlidersHorizontal,
} from "lucide-react";
import type { SearchFilters } from "@/types/github";
import {
  DEFAULT_FILTERS,
  AVAILABLE_PRIORITIES,
} from "@/types/github";
import MultiSelect from "./MultiSelect";
import SearchableSelect from "./SearchableSelect";

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  languages: string[];
  availableLabels: (string | { name: string; color?: string })[];
  isLoadingLabels?: boolean;
  hideTitle?: boolean;
}

const FilterSidebar = ({
  filters,
  onChange,
  languages,
  availableLabels,
  isLoadingLabels,
  hideTitle
}: FilterSidebarProps) => {

  const hasActiveFilters =
    filters.labels.length > 0 ||
    filters.language !== "" ||
    filters.state !== "open" ||
    filters.sort !== "created" ||
    filters.order !== "desc" ||
    filters.unassigned;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6.5rem)]">
      {/* Header + Reset - Fixed at top */}
      <div className={cn(
        "flex items-center justify-between px-1 pb-6 shrink-0 bg-background/50 backdrop-blur-sm z-10",
        hideTitle && "justify-end pb-2"
      )}>
        {!hideTitle && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Filters
            </h2>
          </div>
        )}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-8 px-1 pb-10">
        {/* Priority */}
        <FilterSection
          icon={<ArrowUpDown className="h-3.5 w-3.5" />}
          title="Priority"
          color="text-purple-500"
          bgColor="bg-purple-500/10"
          borderColor="border-purple-500/20"
        >
          <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-nowrap py-1">
            {AVAILABLE_PRIORITIES.map((p) => (
              <Button
                key={p}
                variant={filters.priority === p ? "default" : "outline"}
                size="sm"
                className={`h-8 px-3 text-xs whitespace-nowrap flex-none rounded-xl transition-all ${filters.priority === p
                  ? "bg-purple-600 text-white shadow-sm hover:bg-purple-700"
                  : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                onClick={() => onChange({ ...filters, priority: filters.priority === p ? "" : p })}
              >
                {p}
              </Button>
            ))}
          </div>
        </FilterSection>

        {/* Labels - Multi-select dropdown */}
        <FilterSection
          icon={<Tag className="h-3.5 w-3.5" />}
          title="Labels"
          color="text-pink-500"
          bgColor="bg-pink-500/10"
          borderColor="border-pink-500/20"
        >
          <MultiSelect
            options={availableLabels}
            selected={filters.labels || []}
            onChange={(labels) => onChange({ ...filters, labels })}
            placeholder="Search labels..."
            searchPlaceholder="Filter labels..."
            maxDisplay={3}
          />
          {isLoadingLabels && (
            <div className="flex items-center gap-2 mt-2 px-1 animate-pulse">
              <div className="h-1.5 w-1.5 rounded-full bg-pink-400/40" />
              <span className="text-[10px] text-muted-foreground/70 font-medium italic">
                Discovering more labels...
              </span>
            </div>
          )}
        </FilterSection>

        {/* Language - Searchable select */}
        <FilterSection
          icon={<Code className="h-3.5 w-3.5" />}
          title="Language"
          color="text-blue-500"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/20"
        >
          <SearchableSelect
            options={languages}
            value={filters.language}
            onChange={(language) => onChange({ ...filters, language })}
            placeholder="All languages"
            searchPlaceholder="Search languages..."
            allLabel="All languages"
          />
        </FilterSection>

        {/* State */}
        <FilterSection
          icon={<GitPullRequest className="h-3.5 w-3.5" />}
          title="State"
          color="text-emerald-500"
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/20"
        >
          <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-nowrap py-1">
            {(["open", "closed"] as const).map((state) => (
              <Button
                key={state}
                variant={filters.state === state ? "default" : "outline"}
                size="sm"
                className={`h-8 px-4 text-xs capitalize whitespace-nowrap flex-none rounded-xl transition-all ${filters.state === state
                  ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                  : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                onClick={() => onChange({ ...filters, state })}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full mr-2 ${state === "open" ? "bg-emerald-400" : "bg-red-400"
                    }`}
                />
                {state}
              </Button>
            ))}
          </div>
        </FilterSection>

        {/* Sort */}
        <FilterSection
          icon={<ArrowUpDown className="h-3.5 w-3.5" />}
          title="Sort by"
          color="text-amber-500"
          bgColor="bg-amber-500/10"
          borderColor="border-amber-500/20"
        >
          <Select
            value={`${filters.sort}-${filters.order}`}
            onValueChange={(val) => {
              const [sort, order] = val.split("-") as [
                SearchFilters["sort"],
                SearchFilters["order"],
              ];
              onChange({ ...filters, sort, order });
            }}
          >
            <SelectTrigger className="h-10 bg-muted/20 border-border/40 text-sm rounded-xl focus:ring-amber-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/80 rounded-xl">
              <SelectItem value="created-desc">Newest first</SelectItem>
              <SelectItem value="created-asc">Oldest first</SelectItem>
              <SelectItem value="comments-desc">Most commented</SelectItem>
              <SelectItem value="updated-desc">Recently updated</SelectItem>
              <SelectItem value="updated-asc">Least recently updated</SelectItem>
            </SelectContent>
          </Select>
        </FilterSection>

        {/* Unassigned */}
        <FilterSection
          icon={<UserX className="h-3.5 w-3.5" />}
          title="Availability"
          color="text-indigo-500"
          bgColor="bg-indigo-500/10"
          borderColor="border-indigo-500/20"
        >
          <label className="flex items-center justify-between cursor-pointer p-1 transition-all">
            <span className="text-sm text-foreground/80 font-medium">Unassigned only</span>
            <Switch
              checked={filters.unassigned}
              onCheckedChange={(checked) =>
                onChange({ ...filters, unassigned: checked })
              }
              className="data-[state=checked]:bg-indigo-500"
            />
          </label>
        </FilterSection>
      </div>
    </div>
  );
};

const FilterSection = ({
  icon,
  title,
  children,
  color,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2.5 text-xs font-bold text-foreground uppercase tracking-wider">
      <div className={`h-7 w-7 rounded-lg ${bgColor} border ${borderColor} flex items-center justify-center shrink-0`}>
        <div className={color}>{icon}</div>
      </div>
      {title}
    </div>
    <div className="pl-0.5">
      {children}
    </div>
  </div>
);

export default FilterSidebar;
