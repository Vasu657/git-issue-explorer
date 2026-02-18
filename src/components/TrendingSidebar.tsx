import { Star, GitFork, ExternalLink, Flame } from "lucide-react";
import { useTrendingRepos } from "../hooks/useTrendingRepos";
import { Skeleton } from "./ui/skeleton";

interface TrendingSidebarProps {
    searchQuery: string;
}

const TrendingSidebar = ({ searchQuery }: TrendingSidebarProps) => {
    const { repos, loading, error } = useTrendingRepos(searchQuery);

    if (error) return null;

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-6.5rem)]">
            <div className="flex items-center gap-2 px-1 pb-6 shrink-0 bg-background/50 backdrop-blur-sm z-10">
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Trending Repos
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 px-1 pb-10">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2 p-3 rounded-xl border border-border/40">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-3 w-10" />
                                <Skeleton className="h-3 w-10" />
                            </div>
                        </div>
                    ))
                ) : (
                    repos.map((repo) => (
                        <a
                            key={repo.id}
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group p-4 rounded-2xl hover:bg-muted/30 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {repo.name}
                                </span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                                {repo.description || "No description provided."}
                            </p>

                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
                                <div className="flex items-center gap-1 group-hover:text-orange-400 transition-colors">
                                    <Star className="h-3 w-3 fill-current" />
                                    {repo.stargazers_count.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                                    <GitFork className="h-3 w-3" />
                                    {repo.forks_count.toLocaleString()}
                                </div>
                                {repo.language && (
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        {repo.language}
                                    </div>
                                )}
                            </div>
                        </a>
                    ))
                )}

                {!loading && repos.length === 0 && (
                    <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-border/50">
                        <p className="text-xs text-muted-foreground">No trending repos found for this search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingSidebar;
