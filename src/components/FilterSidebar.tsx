import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Tag,
  Code,
  GitPullRequest,
  ArrowUpDown,
  UserX,
} from "lucide-react";
import type { SearchFilters } from "@/types/github";
import {
  AVAILABLE_LABELS,
  DEFAULT_FILTERS,
  AVAILABLE_TYPES,
  AVAILABLE_PRIORITIES,
  AVAILABLE_STATUSES,
} from "@/types/github";
import MultiSelect from "./MultiSelect";
import SearchableSelect from "./SearchableSelect";

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  languages: string[];
  availableLabels: (string | { name: string; color?: string })[];
  isLoadingLabels?: boolean;
}

const FilterSidebar = ({
  filters,
  onChange,
  languages,
  availableLabels,
  isLoadingLabels
}: FilterSidebarProps) => {

  const hasActiveFilters =
    filters.labels.length > 0 ||
    filters.language !== "" ||
    filters.state !== "open" ||
    filters.sort !== "created" ||
    filters.order !== "desc" ||
    filters.unassigned;

  return (
    <div className="space-y-5">
      {/* Header + Reset */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
          Filters
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Type */}
      <FilterSection icon={<Tag className="h-3.5 w-3.5" />} title="Type">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-nowrap py-1">
          {AVAILABLE_TYPES.map((t) => (
            <Button
              key={t}
              variant={filters.issueType === t ? "default" : "outline"}
              size="sm"
              className={`h-8 px-3 text-xs whitespace-nowrap flex-none rounded-md ${filters.issueType === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              onClick={() => onChange({ ...filters, issueType: filters.issueType === t ? "" : t })}
            >
              {t}
            </Button>
          ))}
        </div>
      </FilterSection>

      <Separator className="bg-border/50" />

      {/* Priority */}
      <FilterSection icon={<ArrowUpDown className="h-3.5 w-3.5" />} title="Priority">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-nowrap py-1">
          {AVAILABLE_PRIORITIES.map((p) => (
            <Button
              key={p}
              variant={filters.priority === p ? "default" : "outline"}
              size="sm"
              className={`h-8 px-3 text-xs whitespace-nowrap flex-none rounded-md ${filters.priority === p
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              onClick={() => onChange({ ...filters, priority: filters.priority === p ? "" : p })}
            >
              {p}
            </Button>
          ))}
        </div>
      </FilterSection>

      <Separator className="bg-border/50" />

      {/* Status */}
      <FilterSection icon={<GitPullRequest className="h-3.5 w-3.5" />} title="Status">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-nowrap py-1">
          {AVAILABLE_STATUSES.map((s) => (
            <Button
              key={s}
              variant={filters.labelStatus === s ? "default" : "outline"}
              size="sm"
              className={`h-8 px-3 text-xs whitespace-nowrap flex-none rounded-md ${filters.labelStatus === s
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              onClick={() => onChange({ ...filters, labelStatus: filters.labelStatus === s ? "" : s })}
            >
              {s}
            </Button>
          ))}
        </div>
      </FilterSection>

      <Separator className="bg-border/50" />

      {/* Labels - Multi-select dropdown */}
      <FilterSection icon={<Tag className="h-3.5 w-3.5" />} title="Labels">
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
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <span className="text-[10px] text-muted-foreground/70 font-medium italic">
              Discovering more labels...
            </span>
          </div>
        )}
      </FilterSection>

      <Separator className="bg-border/50" />

      {/* Language - Searchable select */}
      <FilterSection icon={<Code className="h-3.5 w-3.5" />} title="Language">
        <SearchableSelect
          options={languages}
          value={filters.language}
          onChange={(language) => onChange({ ...filters, language })}
          placeholder="All languages"
          searchPlaceholder="Search languages..."
          allLabel="All languages"
        />
      </FilterSection>

      <Separator className="bg-border/50" />

      {/* State */}
      <FilterSection
        icon={<GitPullRequest className="h-3.5 w-3.5" />}
        title="State"
      >
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar flex-nowrap py-1">
          {(["open", "closed"] as const).map((state) => (
            <Button
              key={state}
              variant={filters.state === state ? "default" : "outline"}
              size="sm"
              className={`h-8 px-3 text-xs capitalize whitespace-nowrap flex-none ${filters.state === state
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              onClick={() => onChange({ ...filters, state })}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full mr-1.5 ${state === "open" ? "bg-emerald-400" : "bg-red-400"
                  }`}
              />
              {state}
            </Button>
          ))}
        </div>
      </FilterSection>

      <Separator className="bg-border/50" />

      {/* Sort */}
      <FilterSection
        icon={<ArrowUpDown className="h-3.5 w-3.5" />}
        title="Sort by"
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
          <SelectTrigger className="h-9 bg-muted/30 border-border/50 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border/80">
            <SelectItem value="created-desc">Newest first</SelectItem>
            <SelectItem value="created-asc">Oldest first</SelectItem>
            <SelectItem value="comments-desc">Most commented</SelectItem>
            <SelectItem value="updated-desc">Recently updated</SelectItem>
            <SelectItem value="updated-asc">Least recently updated</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <Separator className="bg-border/50" />

      {/* Unassigned */}
      <FilterSection
        icon={<UserX className="h-3.5 w-3.5" />}
        title="Availability"
      >
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-sm text-foreground/80">Unassigned only</span>
          <Switch
            checked={filters.unassigned}
            onCheckedChange={(checked) =>
              onChange({ ...filters, unassigned: checked })
            }
            className="data-[state=checked]:bg-primary"
          />
        </label>
      </FilterSection>
    </div>
  );
};

const FilterSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {icon}
      {title}
    </div>
    {children}
  </div>
);

export default FilterSidebar;
