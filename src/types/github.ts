export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
  html_url: string;
  blog: string | null;
  bio: string | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  labels: GitHubLabel[];
  repository_url: string;
  created_at: string;
  comments: number;
  state: string;
  assignee: unknown | null;
  user: GitHubUser;
  body: string | null;
}

export interface SearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubIssue[];
}

export interface SearchFilters {
  labels: string[];
  language: string;
  state: "open" | "closed";
  issueType: string; // e.g. Bug, Feature
  priority: string; // e.g. critical, high
  labelStatus: string; // e.g. In Progress, Ready
  sort: "created" | "updated" | "comments";
  order: "desc" | "asc";
  unassigned: boolean;
  author?: string;
  assignee?: string;
  mentions?: string;
  involves?: string;
  since?: string; // "24h", "7d", "30d", etc.
  comments?: string; // "0", "1+", "10+"
  isDraft?: boolean; // for PRs
}

export const DEFAULT_FILTERS: SearchFilters = {
  labels: [],
  language: "",
  state: "open",
  issueType: "",
  priority: "",
  labelStatus: "",
  sort: "created",
  order: "desc",
  unassigned: false,
};

// Keep a compact, de-duplicated list of common labels for the UI. Specific
// type/status/priority filters are broken out separately in the sidebar.
export const AVAILABLE_LABELS = [
  "good first issue",
  "help wanted",
  "bug",
  "enhancement",
  "documentation",
  "feature request",
  "beginner",
  "easy",
  "medium",
  "hard",
  "wontfix",
  "duplicate",
  "question",
  "security",
  "performance",
  "testing",
  "accessibility",
  "design",
  "ui/ux",
  "refactoring",
  "technical debt",
  "breaking change",
  "needs review",
  "dependencies",
  "devops",
  "infrastructure",
  "mobile",
  "api",
  "frontend",
  "backend",
  "first-timers-only",
  "up-for-grabs",
  "starter",
  "low-hanging-fruit",
  "blocked",
  "stale",
];

export const AVAILABLE_TYPES = ["Bug", "Feature", "Enhancement", "Question"];
export const AVAILABLE_PRIORITIES = ["Critical", "High", "Medium", "Low"];
export const AVAILABLE_STATUSES = ["In Progress", "Ready", "Needs Review", "Backlog"];
