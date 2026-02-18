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
import TrendingSidebar from "@/components/TrendingSidebar";
import { useDebounce } from "@/hooks/useDebounce";
import { useGitHubSearch } from "@/hooks/useGitHubSearch";
import { useDynamicLanguages } from "@/hooks/useDynamicLanguages";
import { useDynamicLabels } from "@/hooks/useDynamicLabels";
import CommandPalette from "@/components/CommandPalette";
import type { SearchFilters } from "@/types/github";
import { DEFAULT_FILTERS } from "@/types/github";
import { useStorage } from "@/context/StorageContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import SEO from "@/components/SEO";

const Index = () => {
  const { filters: persistedFilters, setFilters: setPersistedFilters, isHydrated, addToHistory, markAsSeen } = useStorage();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialSync = useRef(true);

  const [rawQuery, setRawQuery] = useState(() => searchParams.get("q") || "");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { bookmarks } = useBookmarks();
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

  // Command Palette Keyboard Shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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


  // Save successful search to history
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2 && issues.length > 0 && !loading) {
      addToHistory(debouncedQuery);
    }
  }, [debouncedQuery, issues.length, loading, addToHistory]);

  // Discover languages dynamically from search results
  const { languages, discoveredLanguages } = useDynamicLanguages(issues);

  // Discover labels dynamically from search results
  const { labels: dynamicLabels, isDiscovering: labelsLoading } = useDynamicLabels(issues, debouncedQuery);
  const availableLabelNames = dynamicLabels.map(l => l.name);


  const handleSuggestedSearch = useCallback((term: string) => {
    setRawQuery(term);
  }, []);

  const handleIssueClick = useCallback((issue: import("@/types/github").GitHubIssue) => {
    markAsSeen(issue.id);
    setSelectedIssue(issue);
  }, [markAsSeen]);

  const activeFilterCount =
    filters.labels.length +
    (filters.language ? 1 : 0) +
    (filters.state !== "open" ? 1 : 0) +
    (filters.unassigned ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Navbar />

      {/* Hero */}
      <HeroSection labelCount={dynamicLabels.length} />

      {/* Search bar */}
      <SearchBar
        value={rawQuery}
        onChange={(val) => {
          setRawQuery(val);
          if (showBookmarks) setShowBookmarks(false);
        }}
        loading={showBookmarks ? false : loading}
        totalCount={showBookmarks ? bookmarks.length : totalCount}
        hasResults={showBookmarks ? bookmarks.length > 0 : issues.length > 0}
        showBookmarks={showBookmarks}
        onToggleBookmarks={() => setShowBookmarks(!showBookmarks)}
        bookmarkCount={bookmarks.length}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pb-20">
        {/* Mobile filter button */}
        {!showBookmarks && (
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
                side="bottom"
                className="h-[60vh] bg-background border-border/50 overflow-y-auto overflow-x-hidden hide-scrollbar rounded-t-[2rem]"
              >
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 shrink-0" />
                <SheetHeader>
                  <SheetTitle className="text-sm text-foreground font-bold text-center">
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
                    hideTitle={true}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          {!showBookmarks && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20 min-w-0 pr-2">
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  languages={languages}
                  availableLabels={dynamicLabels as any}
                  isLoadingLabels={labelsLoading}
                />
              </div>
            </aside>
          )}

          {/* Results */}
          <main className="flex-1 min-w-0">
            <IssueList
              issues={showBookmarks ? bookmarks : issues}
              totalCount={showBookmarks ? bookmarks.length : totalCount}
              loading={showBookmarks ? false : loading}
              error={showBookmarks ? null : error}
              rateLimited={showBookmarks ? false : rateLimited}
              rateLimitResetMs={rateLimitResetMs}
              hasMore={showBookmarks ? false : hasMore}
              onLoadMore={loadMore}
              onSuggestedSearch={handleSuggestedSearch}
              onIssueClick={handleIssueClick}
            />
          </main>

          {/* Trending sidebar (desktop only) */}
          {!showBookmarks && (
            <aside className="hidden xl:block w-80 shrink-0">
              <div className="sticky top-20 min-w-0 pr-2">
                <TrendingSidebar searchQuery={debouncedQuery} />
              </div>
            </aside>
          )}
        </div>
      </div>

      <IssueDetailsModal
        issue={selectedIssue}
        open={!!selectedIssue}
        onOpenChange={(open) => !open && setSelectedIssue(null)}
      />

      <CommandPalette
        open={isCommandPaletteOpen}
        setOpen={setIsCommandPaletteOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onToggleBookmarks={() => setShowBookmarks(!showBookmarks)}
        showBookmarks={showBookmarks}
      />
    </div>
  );
};

export default Index;
