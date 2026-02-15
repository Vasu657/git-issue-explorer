import { useMemo, useEffect } from "react";
import { useRepositoryLabels } from "./useRepositoryLabels";
import { useStorage } from "@/context/StorageContext";
import { AVAILABLE_LABELS } from "@/types/github";
import type { GitHubIssue, GitHubLabel } from "@/types/github";

const DEFAULT_COLOR = "cccccc";
// ... (COMMON_COLORS omitted for brevity, keeping them)
const COMMON_COLORS: Record<string, string> = {
    "bug": "d73a4a",
    "enhancement": "a2eeef",
    "question": "d876e3",
    "help wanted": "008672",
    "good first issue": "7057ff",
    "documentation": "0075ca",
    "duplicate": "cfd3d7",
    "wontfix": "ffffff",
    "beginner": "7057ff",
    "easy": "0e8a16",
    "medium": "fbca04",
    "hard": "d93f0b",
};

/**
 * Combines static baseline labels, real-time extracted labels, and deep repository sampling
 * to provide a comprehensive, sorted list of relevant labels.
 */
export function useDynamicLabels(issues: GitHubIssue[], query: string = "") {
    const { discoveredLabels: persistedLabels, addDiscoveredLabels } = useStorage();

    // 1. Get labels discovered from sampling repositories in current search
    const {
        labels: sampledLabels,
        isLoading: deepDiscoveryLoading
    } = useRepositoryLabels(issues, query);

    // Sync sampled labels to storage
    useEffect(() => {
        if (sampledLabels.length > 0) {
            addDiscoveredLabels(sampledLabels);
        }
    }, [sampledLabels, addDiscoveredLabels]);

    // 2. Extract and PERSIST labels directly from the issues
    useEffect(() => {
        if (issues.length > 0) {
            const extractedLabels: GitHubLabel[] = [];
            issues.forEach(issue => {
                issue.labels.forEach(label => {
                    extractedLabels.push(label);
                });
            });
            if (extractedLabels.length > 0) {
                addDiscoveredLabels(extractedLabels);
            }
        }
    }, [issues, addDiscoveredLabels]);

    // 3. Merge everything: Persisted -> Sampled -> Static
    const mergedLabels = useMemo(() => {
        const labelMap = new Map<string, Partial<GitHubLabel>>();

        const persistedGroup: Partial<GitHubLabel>[] = [];
        const sampledGroup: Partial<GitHubLabel>[] = [];
        const staticGroup: Partial<GitHubLabel>[] = [];

        // Helper to process and group
        const process = (labels: (GitHubLabel | string)[], target: Partial<GitHubLabel>[]) => {
            labels.forEach(l => {
                const name = typeof l === 'string' ? l : l.name;
                const lowerName = name.toLowerCase();

                if (!labelMap.has(lowerName)) {
                    const color = typeof l === 'string'
                        ? (COMMON_COLORS[lowerName] || DEFAULT_COLOR)
                        : l.color;

                    const labelObj = typeof l === 'string'
                        ? { name: l, color }
                        : l;

                    labelMap.set(lowerName, labelObj);
                    target.push(labelObj);
                }
            });
        };

        // 1. Process persisted labels (from storage) - highest preference
        process(persistedLabels, persistedGroup);

        // 2. Process sampled labels (from current search results/repos)
        process(sampledLabels, sampledGroup);

        // 3. Process static baseline Fallback
        process(AVAILABLE_LABELS, staticGroup);

        // Sort each group alphabetically
        const sortFn = (a: Partial<GitHubLabel>, b: Partial<GitHubLabel>) =>
            (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: 'base' });

        return [
            ...persistedGroup.sort(sortFn),
            ...sampledGroup.sort(sortFn),
            ...staticGroup.sort(sortFn)
        ];
    }, [persistedLabels, sampledLabels]);

    return {
        labels: mergedLabels,
        isLoading: deepDiscoveryLoading,
        isDiscovering: deepDiscoveryLoading && sampledLabels.length === 0,
        discoveredCount: sampledLabels.length,
        persistedCount: persistedLabels.length,
    };
}
