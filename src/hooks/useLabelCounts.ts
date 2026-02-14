import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "./useAuthToken";
import { AVAILABLE_LABELS } from "@/types/github";

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

// Helper to sanitize label names for GraphQL aliases (must be alphanumeric)
const toAlias = (label: string) => `label_${label.replace(/[^a-zA-Z0-9]/g, "_")}`;

export function useLabelCounts() {
    const { token } = useAuthToken();

    const { data: counts, isLoading, error } = useQuery({
        queryKey: ["label-counts", token], // Re-fetch when token changes
        queryFn: async () => {
            if (!token) return {};

            // Build a dynamic query to fetch counts for all labels in one go
            // We use the 'search' query to count issues with specific labels
            const aliasQueries = AVAILABLE_LABELS.map((label) => {
                const alias = toAlias(label);
                // Search for open issues with this label
                const query = `is:issue is:open label:"${label}"`;
                // JSON.stringify handles escaping quotes in the parameter value
                return `${alias}: search(query: ${JSON.stringify(query)}, type: ISSUE, first: 0) { issueCount }`;
            }).join("\n");

            const query = `
        query {
          ${aliasQueries}
        }
      `;

            const response = await fetch(GITHUB_GRAPHQL_API, {
                method: "POST",
                headers: {
                    Authorization: `bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error(`GitHub GraphQL API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.errors) {
                console.error("GraphQL errors:", JSON.stringify(result.errors, null, 2));
                throw new Error("Failed to fetch label counts");
            }

            // Map aliases back to label names
            const countMap: Record<string, number> = {};
            AVAILABLE_LABELS.forEach((label) => {
                const alias = toAlias(label);
                if (result.data && result.data[alias]) {
                    countMap[label] = result.data[alias].issueCount;
                }
            });

            return countMap;
        },
        enabled: !!token, // Only run if we have a token
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: false,
    });

    return { counts, isLoading, error };
}
