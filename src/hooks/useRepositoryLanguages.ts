import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "./useAuthToken";
import type { GitHubIssue } from "@/types/github";
import { isRateLimited } from "@/lib/github-cache";

const GITHUB_API = "https://api.github.com";

interface RepositoryLanguages {
    [language: string]: number; // language name -> bytes of code
}

interface LanguageDiscoveryConfig {
    sampleSize: number; // Number of repos to sample
    maxConcurrentRequests: number; // Parallel API calls
}

const DEFAULT_CONFIG: LanguageDiscoveryConfig = {
    sampleSize: 10, // Reduced from 30 to avoid rate limits
    maxConcurrentRequests: 3, // Reduced from 5 for more conservative rate limiting
};

/**
 * Extract unique repository identifiers from issues
 */
function extractRepositories(issues: GitHubIssue[]): string[] {
    const repoSet = new Set<string>();

    for (const issue of issues) {
        if (issue.repository_url) {
            // repository_url format: "https://api.github.com/repos/owner/repo"
            const match = issue.repository_url.match(/repos\/([^/]+\/[^/]+)$/);
            if (match) {
                repoSet.add(match[1]);
            }
        }
    }

    return Array.from(repoSet);
}

/**
 * Fetch languages for a single repository
 */
async function fetchRepoLanguages(
    repoFullName: string,
    token?: string
): Promise<RepositoryLanguages> {
    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
    };

    if (token) {
        headers.Authorization = `token ${token}`;
    }

    try {
        const response = await fetch(
            `${GITHUB_API}/repos/${repoFullName}/languages`,
            { headers }
        );

        if (!response.ok) {
            if (response.status !== 403 && response.status !== 429) {
                console.warn(`Failed to fetch languages for ${repoFullName}: ${response.status}`);
            }
            return {};
        }

        return await response.json();
    } catch (error) {
        console.warn(`Error fetching languages for ${repoFullName}:`, error);
        return {};
    }
}

/**
 * Fetch languages for multiple repositories in parallel with concurrency limit
 */
async function fetchLanguagesInBatches(
    repositories: string[],
    token: string | undefined,
    config: LanguageDiscoveryConfig
): Promise<Map<string, number>> {
    const languageMap = new Map<string, number>();

    // Sample repositories to respect rate limits
    const sampled = repositories.slice(0, config.sampleSize);

    // Process in batches to limit concurrent requests
    for (let i = 0; i < sampled.length; i += config.maxConcurrentRequests) {
        const batch = sampled.slice(i, i + config.maxConcurrentRequests);
        const results = await Promise.all(
            batch.map(repo => fetchRepoLanguages(repo, token))
        );

        // Aggregate language bytes
        for (const repoLanguages of results) {
            for (const [language, bytes] of Object.entries(repoLanguages)) {
                languageMap.set(
                    language,
                    (languageMap.get(language) || 0) + bytes
                );
            }
        }

        // Small delay between batches to avoid rate limiting
        if (i + config.maxConcurrentRequests < sampled.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return languageMap;
}

/**
 * Discover languages from repositories associated with search results
 * This provides accurate, search-specific language discovery
 */
export function useRepositoryLanguages(
    issues: GitHubIssue[],
    config: LanguageDiscoveryConfig = DEFAULT_CONFIG
) {
    const { token } = useAuthToken();

    // Create a stable key based on repository URLs
    const repositories = extractRepositories(issues);
    const repoKey = repositories.slice(0, config.sampleSize).join(",");

    const { data, isLoading, error } = useQuery({
        queryKey: ["repository-languages", repoKey, config.sampleSize],
        queryFn: async () => {
            if (repositories.length === 0 || isRateLimited()) {
                return { languages: [], languageMap: new Map() };
            }

            // Adjust config if unauthenticated to be more conservative
            const effectiveConfig = !token ? {
                ...config,
                sampleSize: Math.min(config.sampleSize, 3), // Very low sample size when unauthenticated
                maxConcurrentRequests: 1 // Sequential requests when unauthenticated
            } : config;

            const languageMap = await fetchLanguagesInBatches(repositories, token, effectiveConfig);

            // Sort languages by total bytes (most used first)
            const languages = Array.from(languageMap.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([language]) => language);

            return { languages, languageMap };
        },
        enabled: issues.length > 0,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: false,
    });

    return {
        languages: data?.languages || [],
        languageMap: data?.languageMap || new Map(),
        isLoading,
        error,
        repositoryCount: repositories.length,
    };
}
