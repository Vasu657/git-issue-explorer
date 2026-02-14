import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "./useAuthToken";
import { AVAILABLE_LANGUAGES } from "@/types/github";

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

// Helper to sanitize language names for GraphQL aliases (must be alphanumeric)
const toAlias = (language: string) => `lang_${language.replace(/[^a-zA-Z0-9]/g, "_")}`;

export function useLanguageCounts() {
    const { token } = useAuthToken();

    const { data: counts, isLoading, error } = useQuery({
        queryKey: ["language-counts", token], // Re-fetch when token changes
        queryFn: async () => {
            if (!token) return {};

            // Build a dynamic query to fetch counts for all languages in one go
            // We use the 'search' query to count issues with specific languages
            const aliasQueries = AVAILABLE_LANGUAGES.map((language) => {
                const alias = toAlias(language);
                // Search for open issues with this language
                // Note: The search qualifier for language is 'language:Name'
                // Values with spaces or special chars need quotes
                const query = `is:issue is:open language:"${language}"`;
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
                throw new Error("Failed to fetch language counts");
            }

            // Map aliases back to language names
            const countMap: Record<string, number> = {};
            AVAILABLE_LANGUAGES.forEach((language) => {
                const alias = toAlias(language);
                if (result.data && result.data[alias]) {
                    countMap[language] = result.data[alias].issueCount;
                }
            });

            return countMap;
        },
        enabled: !!token, // Only run if we have a token
        staleTime: 1000 * 60 * 60, // Cache for 1 hour (languages change less often than labels potentially)
        retry: false,
    });

    return { counts, isLoading, error };
}
