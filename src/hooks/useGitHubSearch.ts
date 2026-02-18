import { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { GitHubIssue, SearchFilters, SearchResponse } from "@/types/github";
import {
  setRateLimitInfo,
  getRateLimitResetMs,
  isRateLimited,
} from "@/lib/github-cache";
import { useAuthToken } from "@/hooks/useAuthToken";

const GITHUB_API = "https://api.github.com/search/issues";
const PER_PAGE = 20;

function buildQuery(search: string, filters: SearchFilters): string {
  const parts: string[] = [];

  if (search.trim()) {
    parts.push(search.trim());
  }

  parts.push("is:issue");
  parts.push(`state:${filters.state}`);

  filters.labels.forEach((label) => {
    parts.push(`label:"${label}"`);
  });

  // Add priority
  if (filters.priority) {
    parts.push(`label:"priority: ${filters.priority.toLowerCase()}"`);
    parts.push(`label:"${filters.priority.toLowerCase()}"`);
  }


  if (filters.language) {
    parts.push(`language:${filters.language}`);
  }

  if (filters.unassigned) {
    parts.push("no:assignee");
  }

  if (filters.author) parts.push(`author:${filters.author}`);
  if (filters.assignee) parts.push(`assignee:${filters.assignee}`);
  if (filters.mentions) parts.push(`mentions:${filters.mentions}`);
  if (filters.involves) parts.push(`involves:${filters.involves}`);

  if (filters.since && filters.since !== "any") {
    const date = new Date();
    if (filters.since === "24h") date.setHours(date.getHours() - 24);
    else if (filters.since === "7d") date.setDate(date.getDate() - 7);
    else if (filters.since === "30d") date.setDate(date.getDate() - 30);
    else if (filters.since === "1y") date.setFullYear(date.getFullYear() - 1);

    if (filters.since !== "any") {
      parts.push(`created:>${date.toISOString()}`);
    }
  }

  if (filters.comments) {
    if (filters.comments === "0") parts.push("comments:0");
    else if (filters.comments === "1+") parts.push("comments:>0");
    else if (filters.comments === "10+") parts.push("comments:>10");
  }

  if (filters.isDraft !== undefined) {
    parts.push(`draft:${filters.isDraft}`);
  }

  return parts.join(" ");
}

export interface UseGitHubSearchResult {
  issues: GitHubIssue[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  rateLimited: boolean;
  rateLimitResetMs: number;
  hasMore: boolean;
  loadMore: () => void;
}

export function useGitHubSearch(
  query: string,
  filters: SearchFilters
): UseGitHubSearchResult {
  const { token } = useAuthToken();

  // Create a ref for filters to avoid deep dependency changes triggering re-fetches unnecessarily
  // mostly just relying on the query key structure
  const searchQuery = buildQuery(query, filters);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isPending,
    error,
  } = useInfiniteQuery({
    queryKey: ["github-issues", searchQuery, filters.sort, filters.order],
    queryFn: async ({ pageParam = 1 }) => {
      if (isRateLimited()) {
        const resetTime = getRateLimitResetMs();
        throw { status: 429, message: "Rate limit exceeded", resetTime };
      }

      const url = new URL(GITHUB_API);
      url.searchParams.set("q", searchQuery);
      url.searchParams.set("sort", filters.sort);
      url.searchParams.set("order", filters.order);
      url.searchParams.set("per_page", String(PER_PAGE));
      url.searchParams.set("page", String(pageParam));

      const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
      };
      if (token) {
        headers.Authorization = `token ${token}`;
      }

      const response = await fetch(url.toString(), { headers });

      const remaining = response.headers.get("X-RateLimit-Remaining");
      const resetAt = response.headers.get("X-RateLimit-Reset");
      if (remaining !== null && resetAt !== null) {
        setRateLimitInfo(parseInt(remaining), parseInt(resetAt));
      }

      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          // Update rate limit info if we hit it
          // The header check above might have already caught it if headers were present
          // but sometimes 403 comes with different body
          throw { status: response.status, message: "Rate limit exceeded" };
        }
        throw new Error(`GitHub API returned ${response.status}`);
      }

      return (await response.json()) as SearchResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((acc, page) => acc + page.items.length, 0);
      if (loadedCount < lastPage.total_count) {
        return allPages.length + 1;
      }
      return undefined;
    },
    retry: (failureCount, error: any) => {
      if (error?.status === 403 || error?.status === 429) return false;
      return failureCount < 2;
    },
    refetchInterval: (query) => {
      // Don't poll if rate limited
      if (query.state.error && (query.state.error as any)?.status === 429) return false;
      return 60000; // Poll every 60 seconds
    }
  });

  // Deduplicate issues by ID to prevent "duplicate key" warnings when pages overlap
  const allIssues = data?.pages.flatMap((page) => page.items) || [];
  const issues = Array.from(
    new Map(allIssues.map((issue) => [issue.id, issue])).values()
  );
  const totalCount = data?.pages[0]?.total_count || 0;

  // Handle rate limit error specifically if it bubbles up
  const isRateLimitError = (error as any)?.status === 403 || (error as any)?.status === 429;

  return {
    issues,
    totalCount,
    loading: isFetching || isPending, // 'loading' in UI often means any activity
    error: error instanceof Error ? error.message : (error as any)?.message || null,
    rateLimited: isRateLimitError || isRateLimited(),
    rateLimitResetMs: getRateLimitResetMs(),
    hasMore: !!hasNextPage,
    loadMore: () => fetchNextPage(),
  };
}
