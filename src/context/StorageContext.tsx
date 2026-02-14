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
    isHydrated: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const TOKEN_KEY = 'gf:auth_token:v1';
const USER_KEY = 'gf:user:v1';
const SCOPES_KEY = 'gf:scopes:v1';
const BOOKMARKS_KEY = 'gf:bookmarks:v1';

export function StorageProvider({ children }: { children: React.ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [scopes, setScopes] = useState<string[]>([]);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [bookmarks, setBookmarksState] = useState<GitHubIssue[]>([]);
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
