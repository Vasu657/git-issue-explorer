import { useMemo } from "react";
import { useGitHubLanguages } from "./useGitHubLanguages";
import { useRepositoryLanguages } from "./useRepositoryLanguages";
import type { GitHubIssue } from "@/types/github";

/**
 * Combines GitHub Linguist API (comprehensive) with repository sampling (accurate)
 * to provide a complete, dynamic language list
 */
export function useDynamicLanguages(issues: GitHubIssue[]) {
    // Get complete list from GitHub Linguist
    const { languages: allLanguages, isLoading: linguistLoading } = useGitHubLanguages();

    // Get languages discovered from current search results
    const {
        languages: discoveredLanguages,
        languageMap,
        isLoading: repoLoading,
        repositoryCount
    } = useRepositoryLanguages(issues);

    // Merge both sources: prioritize discovered languages, then add remaining from Linguist
    const mergedLanguages = useMemo(() => {
        const languageSet = new Set<string>();

        // First, add discovered languages (from actual repos in search)
        discoveredLanguages.forEach(lang => languageSet.add(lang));

        // Then add all languages from Linguist
        allLanguages.forEach(lang => languageSet.add(lang));

        // Convert to sorted array
        // Discovered languages first (sorted by usage), then alphabetically sorted remaining
        const discovered = discoveredLanguages.filter(lang => languageMap.has(lang));
        const remaining = allLanguages
            .filter(lang => !languageMap.has(lang))
            .sort();

        return [...discovered, ...remaining];
    }, [allLanguages, discoveredLanguages, languageMap]);

    return {
        languages: mergedLanguages,
        discoveredLanguages, // Languages from current search results
        allLanguages, // Complete list from GitHub Linguist
        isLoading: linguistLoading || repoLoading,
        repositoryCount,
        languageMap, // Map of discovered languages to byte counts
    };
}
