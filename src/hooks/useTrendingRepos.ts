import { useState, useEffect } from "react";
import type { GitHubRepository, RepositorySearchResponse } from "@/types/github";

export const useTrendingRepos = (query: string = "") => {
    const [repos, setRepos] = useState<GitHubRepository[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrending = async () => {
            setLoading(true);
            setError(null);
            try {
                // Build query: if no search query, search for popular repos in the last 30 days
                // Otherwise, search for repos related to the query sorted by stars
                let q = "";
                if (query) {
                    q = `${query} is:public sort:stars-desc`;
                } else {
                    const date = new Date();
                    date.setDate(date.getDate() - 30);
                    const dateString = date.toISOString().split("T")[0];
                    q = `created:>${dateString} sort:stars-desc`;
                }

                const response = await fetch(
                    `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=6`
                );

                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error("Rate limit exceeded. Please try again later.");
                    }
                    throw new Error("Failed to fetch trending repositories");
                }

                const data: RepositorySearchResponse = await response.json();
                setRepos(data.items);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchTrending, 500);
        return () => clearTimeout(timer);
    }, [query]);

    return { repos, loading, error };
};
