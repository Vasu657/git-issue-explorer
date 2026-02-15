import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import IssueList from "@/components/IssueList";
import IssueDetailsModal from "@/components/IssueDetailsModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useGitHubSearch } from "@/hooks/useGitHubSearch";
import { useDynamicLanguages } from "@/hooks/useDynamicLanguages";
import { useDynamicLabels } from "@/hooks/useDynamicLabels";
import type { SearchFilters } from "@/types/github";
import { DEFAULT_FILTERS } from "@/types/github";
import { useStorage } from "@/context/StorageContext";

const Index = () => {
  const { filters: persistedFilters, setFilters: setPersistedFilters, isHydrated } = useStorage();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialSync = useRef(true);

  const [rawQuery, setRawQuery] = useState(() => searchParams.get("q") || "");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const debouncedQuery = useDebounce(rawQuery, 450);

  // Initialize filters from URL or Storage
  useEffect(() => {
    if (!isHydrated) return;
    if (!isInitialSync.current) return;

    const urlFilters: Partial<SearchFilters> = {};
    const labels = searchParams.get("labels");
    if (labels) urlFilters.labels = labels.split(",");

    const lang = searchParams.get("lang");
    if (lang) urlFilters.language = lang;

    const state = searchParams.get("state");
    if (state === "open" || state === "closed") urlFilters.state = state;

    const sort = searchParams.get("sort");
    if (sort) urlFilters.sort = sort as SearchFilters["sort"];

    const order = searchParams.get("order");
    if (order === "asc" || order === "desc") urlFilters.order = order;

    const unassigned = searchParams.get("unassigned");
    if (unassigned !== null) urlFilters.unassigned = unassigned === "true";

    // Priority to URL, then Storage, then Default
    const mergedFilters = {
      ...DEFAULT_FILTERS,
      ...(persistedFilters || {}),
      ...urlFilters
    };

    setFilters(mergedFilters);
    isInitialSync.current = false;
  }, [isHydrated, searchParams, persistedFilters]);

  // Sync state to URL and Storage
  useEffect(() => {
    if (isInitialSync.current) return;

    // Update URL
    const params: Record<string, string> = {};
    if (debouncedQuery) params.q = debouncedQuery;
    if (filters.labels.length > 0) params.labels = filters.labels.join(",");
    if (filters.language) params.lang = filters.language;
    if (filters.state !== "open") params.state = filters.state;
    if (filters.sort !== "created") params.sort = filters.sort;
    if (filters.order !== "desc") params.order = filters.order;
    if (filters.unassigned) params.unassigned = "true";

    setSearchParams(params, { replace: true });

    // Update Storage
    setPersistedFilters(filters);
  }, [filters, debouncedQuery, setSearchParams, setPersistedFilters]);

  const [selectedIssue, setSelectedIssue] = useState<import("@/types/github").GitHubIssue | null>(null);

  const {
    issues,
    totalCount,
    loading,
    error,
    rateLimited,
    rateLimitResetMs,
    hasMore,
    loadMore,
  } = useGitHubSearch(debouncedQuery, filters);

  // Discover languages dynamically from search results
  const { languages, discoveredLanguages } = useDynamicLanguages(issues);

  // Discover labels dynamically from search results
  const { labels: dynamicLabels, isDiscovering: labelsLoading } = useDynamicLabels(issues, debouncedQuery);
  const availableLabelNames = dynamicLabels.map(l => l.name);


  const handleSuggestedSearch = useCallback((term: string) => {
    setRawQuery(term);
  }, []);

  const handleIssueClick = useCallback((issue: import("@/types/github").GitHubIssue) => {
    setSelectedIssue(issue);
  }, []);

  const activeFilterCount =
    filters.labels.length +
    (filters.language ? 1 : 0) +
    (filters.state !== "open" ? 1 : 0) +
    (filters.unassigned ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <HeroSection labelCount={dynamicLabels.length} />

      {/* Search bar */}
      <SearchBar
        value={rawQuery}
        onChange={setRawQuery}
        loading={loading}
        totalCount={totalCount}
        hasResults={issues.length > 0}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pb-20">
        {/* Mobile filter button */}
        <div className="lg:hidden mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 bg-card/50 border-border/50 text-muted-foreground hover:text-foreground rounded-xl"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 bg-background border-border/50 overflow-y-auto overflow-x-hidden hide-scrollbar"
            >
              <SheetHeader>
                <SheetTitle className="text-sm text-foreground font-bold">
                  Filter Issues
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  languages={languages}
                  availableLabels={dynamicLabels as any}
                  isLoadingLabels={labelsLoading}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20 p-5 rounded-2xl border border-border/50 bg-card/40 max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden hide-scrollbar pr-2 min-w-0">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                languages={languages}
                availableLabels={dynamicLabels as any}
                isLoadingLabels={labelsLoading}
              />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            <IssueList
              issues={issues}
              totalCount={totalCount}
              loading={loading}
              error={error}
              rateLimited={rateLimited}
              rateLimitResetMs={rateLimitResetMs}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onSuggestedSearch={handleSuggestedSearch}
              onIssueClick={handleIssueClick}
            />
          </main>
        </div>
      </div>

      <IssueDetailsModal
        issue={selectedIssue}
        open={!!selectedIssue}
        onOpenChange={(open) => !open && setSelectedIssue(null)}
      />
    </div>
  );
};

export default Index;
