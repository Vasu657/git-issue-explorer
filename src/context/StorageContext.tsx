import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { GitHubIssue, GitHubUser } from '@/types/github';
import { emitBookmarksUpdate, onBookmarksUpdate } from '@/lib/events';

interface StorageContextType {
    token: string | null;
    setToken: (token: string | null) => Promise<void>;
    user: GitHubUser | null;
    scopes: string[];
    isLoadingUser: boolean;
    bookmarks: GitHubIssue[];
    addBookmark: (issue: GitHubIssue) => void;
    removeBookmark: (id: number) => void;
    toggleBookmark: (issue: GitHubIssue) => void;
    filters: import('@/types/github').SearchFilters | null;
    setFilters: (filters: import('@/types/github').SearchFilters) => void;
    discoveredLabels: import('@/types/github').GitHubLabel[];
    addDiscoveredLabels: (labels: import('@/types/github').GitHubLabel[]) => void;
    isHydrated: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const TOKEN_KEY = 'gf:auth_token:v1';
const USER_KEY = 'gf:user:v1';
const SCOPES_KEY = 'gf:scopes:v1';
const BOOKMARKS_KEY = 'gf:bookmarks:v1';
const FILTERS_KEY = 'gf:filters:v1';
const LABELS_KEY = 'gf:labels:v1';

export function StorageProvider({ children }: { children: React.ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [scopes, setScopes] = useState<string[]>([]);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [bookmarks, setBookmarksState] = useState<GitHubIssue[]>([]);
    const [filters, setFiltersState] = useState<import('@/types/github').SearchFilters | null>(null);
    const [discoveredLabels, setDiscoveredLabels] = useState<import('@/types/github').GitHubLabel[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load initial state
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem(TOKEN_KEY);
            if (storedToken) setTokenState(storedToken);

            const storedUser = localStorage.getItem(USER_KEY);
            if (storedUser) setUser(JSON.parse(storedUser));

            const storedScopes = localStorage.getItem(SCOPES_KEY);
            if (storedScopes) setScopes(JSON.parse(storedScopes));

            const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
            if (storedBookmarks) setBookmarksState(JSON.parse(storedBookmarks));

            const storedFilters = localStorage.getItem(FILTERS_KEY);
            if (storedFilters) setFiltersState(JSON.parse(storedFilters));

            const storedLabels = localStorage.getItem(LABELS_KEY);
            if (storedLabels) setDiscoveredLabels(JSON.parse(storedLabels));
        } catch (e) {
            console.error('Failed to load storage:', e);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    // Fetch user logic
    const fetchUser = useCallback(async (accessToken: string) => {
        setIsLoadingUser(true);
        try {
            const res = await fetch("https://api.github.com/user", {
                headers: { Authorization: `token ${accessToken}` },
            });

            if (res.ok) {
                const userData: GitHubUser = await res.json();
                setUser(userData);
                localStorage.setItem(USER_KEY, JSON.stringify(userData));

                const scopesHeader = res.headers.get("x-oauth-scopes");
                const scopesList = scopesHeader ? scopesHeader.split(",").map(s => s.trim()) : [];
                setScopes(scopesList);
                localStorage.setItem(SCOPES_KEY, JSON.stringify(scopesList));
            } else {
                // Token might be invalid
                setUser(null);
                setScopes([]);
                localStorage.removeItem(USER_KEY);
                localStorage.removeItem(SCOPES_KEY);
            }
        } catch (e) {
            console.error("Failed to fetch user:", e);
        } finally {
            setIsLoadingUser(false);
        }
    }, []);

    // Token management
    const setToken = useCallback(async (newToken: string | null) => {
        try {
            if (newToken) {
                const trimmed = newToken.trim();
                localStorage.setItem(TOKEN_KEY, trimmed);
                setTokenState(trimmed);
                await fetchUser(trimmed);
            } else {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                localStorage.removeItem(SCOPES_KEY);
                setTokenState(null);
                setUser(null);
                setScopes([]);
            }
        } catch (e) {
            console.error('Failed to specific save token:', e);
        }
    }, [fetchUser]);

    // Bookmark management
    const saveBookmarks = useCallback((newBookmarks: GitHubIssue[]) => {
        try {
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
            setBookmarksState(newBookmarks);
            emitBookmarksUpdate();
        } catch (e) {
            console.error('Failed to save bookmarks:', e);
        }
    }, []);

    const addBookmark = useCallback((issue: GitHubIssue) => {
        setBookmarksState((prev) => {
            if (prev.find((b) => b.id === issue.id)) return prev;
            const next = [issue, ...prev];
            saveBookmarks(next);
            return next;
        });
    }, [saveBookmarks]);

    const removeBookmark = useCallback((id: number) => {
        setBookmarksState((prev) => {
            const next = prev.filter((b) => b.id !== id);
            saveBookmarks(next);
            return next;
        });
    }, [saveBookmarks]);

    const toggleBookmark = useCallback((issue: GitHubIssue) => {
        setBookmarksState((prev) => {
            const exists = prev.find((b) => b.id === issue.id);
            const next = exists
                ? prev.filter((b) => b.id !== issue.id)
                : [issue, ...prev];
            saveBookmarks(next);
            return next;
        });
    }, [saveBookmarks]);

    const setFilters = useCallback((newFilters: import('@/types/github').SearchFilters) => {
        try {
            localStorage.setItem(FILTERS_KEY, JSON.stringify(newFilters));
            setFiltersState(newFilters);
        } catch (e) {
            console.error('Failed to save filters:', e);
        }
    }, []);

    const addDiscoveredLabels = useCallback((newLabels: import('@/types/github').GitHubLabel[]) => {
        setDiscoveredLabels((prev) => {
            const labelMap = new Map(prev.map(l => [l.name.toLowerCase(), l]));
            let changed = false;

            newLabels.forEach(label => {
                const lowerName = label.name.toLowerCase();
                const existing = labelMap.get(lowerName);
                // Only add if new or update if color changed (casing preserved from first seen)
                if (!existing || existing.color !== label.color) {
                    labelMap.set(lowerName, label);
                    changed = true;
                }
            });

            if (!changed) return prev;

            const next = Array.from(labelMap.values());
            localStorage.setItem(LABELS_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    // Sync bookmarks across tabs/windows
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === BOOKMARKS_KEY && e.newValue) {
                setBookmarksState(JSON.parse(e.newValue));
            }
            if (e.key === TOKEN_KEY) {
                setTokenState(e.newValue);
            }
            if (e.key === USER_KEY) {
                setUser(e.newValue ? JSON.parse(e.newValue) : null);
            }
            if (e.key === SCOPES_KEY) {
                setScopes(e.newValue ? JSON.parse(e.newValue) : []);
            }
        };

        const handleCustomUpdate = () => {
            try {
                const stored = localStorage.getItem(BOOKMARKS_KEY);
                if (stored) setBookmarksState(JSON.parse(stored));
            } catch { }
        };

        window.addEventListener('storage', handleStorageChange);
        const unsubscribe = onBookmarksUpdate(handleCustomUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            unsubscribe();
        };
    }, []);

    return (
        <StorageContext.Provider
            value={{
                token,
                setToken,
                user,
                scopes,
                isLoadingUser,
                bookmarks,
                addBookmark,
                removeBookmark,
                toggleBookmark,
                filters,
                setFilters,
                discoveredLabels,
                addDiscoveredLabels,
                isHydrated,
            }}
        >
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    const context = useContext(StorageContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
}
