import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "./useAuthToken";
import type { GitHubIssue, GitHubLabel } from "@/types/github";
import { isRateLimited } from "@/lib/github-cache";

const GITHUB_API = "https://api.github.com";

interface LabelDiscoveryConfig {
    sampleSize: number; // Number of repos to sample
    maxConcurrentRequests: number; // Parallel API calls
}

const DEFAULT_CONFIG: LabelDiscoveryConfig = {
    sampleSize: 5, // Conservative sampling to avoid rate limits
    maxConcurrentRequests: 2,
};

/**
 * Extract unique repository identifiers from issues
 */
function extractRepositories(issues: GitHubIssue[]): string[] {
    const repoSet = new Set<string>();

    for (const issue of issues) {
        if (issue.repository_url) {
            const match = issue.repository_url.match(/repos\/([^/]+\/[^/]+)$/);
            if (match) {
                repoSet.add(match[1]);
            }
        }
    }

    return Array.from(repoSet);
}

/**
 * Fetch labels for a single repository
 */
async function fetchRepoLabels(
    repoFullName: string,
    token?: string
): Promise<GitHubLabel[]> {
    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
    };

    if (token) {
        headers.Authorization = `token ${token}`;
    }

    try {
        const response = await fetch(
            `${GITHUB_API}/repos/${repoFullName}/labels?per_page=100`,
            { headers }
        );

        if (!response.ok) {
            if (response.status !== 403 && response.status !== 429) {
                console.warn(`Failed to fetch labels for ${repoFullName}: ${response.status}`);
            }
            return [];
        }

        return await response.json();
    } catch (error) {
        console.warn(`Error fetching labels for ${repoFullName}:`, error);
        return [];
    }
}

/**
 * Fetch labels for multiple repositories in parallel with concurrency limit
 */
async function fetchLabelsInBatches(
    repositories: string[],
    token: string | undefined,
    config: LabelDiscoveryConfig
): Promise<Map<string, GitHubLabel>> {
    const labelMap = new Map<string, GitHubLabel>();
    const sampled = repositories.slice(0, config.sampleSize);

    for (let i = 0; i < sampled.length; i += config.maxConcurrentRequests) {
        const batch = sampled.slice(i, i + config.maxConcurrentRequests);
        const results = await Promise.all(
            batch.map(repo => fetchRepoLabels(repo, token))
        );

        for (const repoLabels of results) {
            for (const label of repoLabels) {
                // Use lowercase key for case-insensitive deduplication across repositories
                const lowerName = label.name.toLowerCase();
                if (!labelMap.has(lowerName)) {
                    labelMap.set(lowerName, label);
                }
            }
        }

        if (i + config.maxConcurrentRequests < sampled.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return labelMap;
}

/**
 * Search for top repositories matching a query
 */
async function fetchTopRepositories(
    query: string,
    token?: string
): Promise<string[]> {
    if (!query.trim()) return [];

    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
    };
    if (token) {
        headers.Authorization = `token ${token}`;
    }

    try {
        const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=3`;
        const response = await fetch(url, { headers });
        if (!response.ok) return [];

        const data = await response.json();
        return (data.items || []).map((repo: any) => repo.full_name);
    } catch {
        return [];
    }
}

/**
 * Discover labels from repositories associated with search results or query
 */
export function useRepositoryLabels(
    issues: GitHubIssue[],
    query: string = "",
    config: LabelDiscoveryConfig = DEFAULT_CONFIG
) {
    const { token } = useAuthToken();
    const extractedRepos = extractRepositories(issues);

    // Create a stable key: use the query if present, otherwise fallback to repos
    // This prevents the search repo discovery from being re-triggered just because
    // the issue search results (extractedRepos) are still loading in.
    const discoveryKey = query.trim() || extractedRepos.slice(0, 3).join(",");

    const { data, isLoading, error, isFetching } = useQuery({
        // queryKey: use discoveryKey to keep the fetch stable during result loading
        queryKey: ["repository-labels", discoveryKey],
        queryFn: async () => {
            const repositories = new Set(extractedRepos);

            if (isRateLimited()) {
                return { labels: [], labelMap: new Map() };
            }

            // Proactively search for top repos for the query to get labels faster
            // ONLY if the query is non-empty and we HAVE A TOKEN.
            // Broad discovery is too expensive for unauthenticated users.
            if (query.trim() && token) {
                const searchedRepos = await fetchTopRepositories(query, token);
                searchedRepos.forEach(repo => repositories.add(repo));
            }

            // Use extremely conservative sampling when unauthenticated
            const effectiveSampleSize = !token ? Math.min(config.sampleSize, 2) : config.sampleSize;
            const repoList = Array.from(repositories).slice(0, effectiveSampleSize);

            if (repoList.length === 0) {
                return { labels: [], labelMap: new Map() };
            }

            // Also force sequential requests when unauthenticated
            const effectiveConfig = !token ? { ...config, sampleSize: effectiveSampleSize, maxConcurrentRequests: 1 } : config;
            const labelMap = await fetchLabelsInBatches(repoList, token, effectiveConfig);
            const labels = Array.from(labelMap.values());

            return { labels, labelMap };
        },
        // Enable if we have a query (broad discovery) or found repos in issues (narrow discovery)
        enabled: query.trim().length > 2 || extractedRepos.length > 0,
        staleTime: 1000 * 60 * 15, // Cache for 15 minutes
        retry: false,
    });

    return {
        labels: data?.labels || [],
        labelMap: data?.labelMap || new Map(),
        isLoading: isLoading || (isFetching && query.trim().length > 0),
        error,
        repositoryCount: extractedRepos.length,
    };
}
