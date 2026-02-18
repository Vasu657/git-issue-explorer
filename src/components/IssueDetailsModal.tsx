import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Calendar, User, CircleDot, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { formatDistanceToNow } from "date-fns";
import type { GitHubIssue } from "@/types/github";
import { getLabelStyles } from "@/lib/colors";
import { BookmarkToggle } from "./BookmarkToggle";

interface IssueDetailsModalProps {
    issue: GitHubIssue | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const IssueDetailsModal = ({
    issue,
    open,
    onOpenChange,
}: IssueDetailsModalProps) => {
    const { theme } = useTheme();
    if (!issue) return null;

    const timeAgo = formatDistanceToNow(new Date(issue.created_at), {
        addSuffix: true,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 bg-background border-border/50 shadow-2xl overflow-hidden">

                {/* Scrollable Container */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="p-6 sm:p-8">
                        {/* Header Section */}
                        <div className="mb-6 space-y-4 relative pr-14">
                            <div className="flex items-start justify-between gap-4">
                                <DialogTitle className="text-2xl sm:text-3xl leading-tight font-semibold text-foreground">
                                    {issue.title} <span className="text-muted-foreground font-light">#{issue.number}</span>
                                </DialogTitle>
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 right-0">
                                <BookmarkToggle issue={issue} className="h-11 w-11 shadow-sm" />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-border/40 text-sm text-foreground/80">
                                <Badge
                                    variant={issue.state === "open" ? "default" : "secondary"}
                                    className={`capitalize px-3 py-1 text-sm font-medium rounded-full ${issue.state === "open"
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                                        : "bg-purple-600 hover:bg-purple-700 text-white border-transparent"
                                        }`}
                                >
                                    {issue.state === "open" ? (
                                        <CircleDot className="mr-1.5 h-4 w-4" />
                                    ) : (
                                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    )}
                                    {issue.state}
                                </Badge>

                                <span className="font-semibold text-foreground">{issue.user.login}</span>
                                <span className="text-muted-foreground">opened this issue {timeAgo}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground">{issue.comments} comments</span>
                            </div>
                        </div>

                        {/* Main Content Layout */}
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Column: Avatar + Comment Body */}
                            <div className="flex-1 min-w-0 flex gap-4">
                                <div className="hidden sm:block shrink-0">
                                    <img
                                        src={issue.user.avatar_url}
                                        alt={issue.user.login}
                                        className="h-10 w-10 rounded-full border border-border"
                                    />
                                </div>

                                <div className="flex-1 min-w-0 border border-border rounded-lg bg-card overflow-hidden">
                                    {/* Comment Header */}
                                    <div className="bg-muted/40 px-4 py-2 border-b border-border flex items-center justify-between text-xs sm:text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{issue.user.login}</span>
                                            <span className="text-muted-foreground">commented {timeAgo}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] h-5 font-normal ml-auto">
                                                Author
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Comment Body */}
                                    <div className="p-4 sm:p-6 bg-card">
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:max-w-full prose-pre:bg-muted/50 prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:before:content-none prose-code:after:content-none break-words">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold border-b border-border pb-2 mb-4 mt-6 first:mt-0" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold border-b border-border pb-2 mb-4 mt-6" {...props} />,
                                                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-4 mt-6" {...props} />,
                                                    a: ({ node, ...props }) => (
                                                        <a target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all" {...props} />
                                                    ),
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-border pl-4 text-muted-foreground italic my-4" {...props} />,
                                                    img: ({ node, ...props }) => <img className="max-w-full rounded-lg my-4 border border-border" {...props} />,
                                                    code: ({ node, className, children, ...props }) => {
                                                        const match = /language-(\w+)/.exec(className || "");
                                                        const isInline = !match && !String(children).includes("\n");
                                                        return isInline ? (
                                                            <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm border border-border" {...props}>
                                                                {children}
                                                            </code>
                                                        ) : (
                                                            <code className="block bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto border border-border my-4" {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                    table: ({ node, ...props }) => <div className="my-4 w-full overflow-y-auto"><table className="w-full text-sm border-collapse" {...props} /></div>,
                                                    th: ({ node, ...props }) => <th className="border border-border px-4 py-2 text-left font-semibold bg-muted" {...props} />,
                                                    td: ({ node, ...props }) => <td className="border border-border px-4 py-2" {...props} />,
                                                }}
                                            >
                                                {issue.body || "*No description provided.*"}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="w-full lg:w-72 shrink-0 space-y-6">
                                {/* Labels */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-primary cursor-pointer flex items-center justify-between group">
                                        Labels
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {issue.labels.length > 0 ? (
                                            issue.labels.map((label) => {
                                                const styles = getLabelStyles(label.color, theme);
                                                return (
                                                    <span
                                                        key={label.id}
                                                        className="text-xs leading-none px-2 py-1 rounded-full font-medium"
                                                        style={{
                                                            backgroundColor: styles.backgroundColor,
                                                            color: styles.color,
                                                            border: styles.border,
                                                        }}
                                                    >
                                                        {label.name}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span className="text-sm text-muted-foreground">None yet</span>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Assignees (Placeholder) */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Assignees
                                    </h3>
                                    <span className="text-sm text-muted-foreground">No one assigned</span>
                                </div>

                                <Separator />

                                {/* Projects (Placeholder) */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Projects
                                    </h3>
                                    <span className="text-sm text-muted-foreground">None yet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-border/40 bg-muted/20 shrink-0 flex items-center justify-end">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.open(issue.html_url, "_blank", "noopener,noreferrer")}
                        className="gap-2"
                    >
                        Open in GitHub
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default IssueDetailsModal;
