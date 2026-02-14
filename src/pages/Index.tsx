import { useState, useCallback } from "react";
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
import type { SearchFilters } from "@/types/github";
import { DEFAULT_FILTERS } from "@/types/github";

const Index = () => {
  const [rawQuery, setRawQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const debouncedQuery = useDebounce(rawQuery, 450);

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
      <HeroSection />

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
                <FilterSidebar filters={filters} onChange={setFilters} languages={languages} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20 p-5 rounded-2xl border border-border/50 bg-card/40 max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden hide-scrollbar pr-2 min-w-0">
              <FilterSidebar filters={filters} onChange={setFilters} languages={languages} />
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
