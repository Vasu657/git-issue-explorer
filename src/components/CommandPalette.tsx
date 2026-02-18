import * as React from "react";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Moon,
    Sun,
    RotateCcw,
    GitPullRequest,
    Tag,
    Code,
    ArrowUpDown,
    Flame,
    Bookmark,
    Search,
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useTheme } from "next-themes";
import type { SearchFilters } from "@/types/github";
import { DEFAULT_FILTERS, AVAILABLE_PRIORITIES } from "@/types/github";

interface CommandPaletteProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    onToggleBookmarks: () => void;
    showBookmarks: boolean;
}

export function CommandPalette({
    open,
    setOpen,
    filters,
    onFiltersChange,
    onToggleBookmarks,
    showBookmarks,
}: CommandPaletteProps) {
    const { setTheme } = useTheme();

    const runCommand = (command: () => void) => {
        command();
        setOpen(false);
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList className="max-h-[350px] overflow-y-auto hide-scrollbar">
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Actions">
                    <CommandItem onSelect={() => runCommand(() => onFiltersChange(DEFAULT_FILTERS))}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        <span>Reset All Filters</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => onToggleBookmarks())}>
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>{showBookmarks ? "Hide Bookmarks" : "Show Bookmarks"}</span>
                        <CommandShortcut className="text-[10px]">B</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Issue State">
                    <CommandItem onSelect={() => runCommand(() => onFiltersChange({ ...filters, state: "open" }))}>
                        <div className="mr-2 h-4 w-4 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                        <span>View Open Issues</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => onFiltersChange({ ...filters, state: "closed" }))}>
                        <div className="mr-2 h-4 w-4 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                        </div>
                        <span>View Closed Issues</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Sort Order">
                    <CommandItem onSelect={() => runCommand(() => onFiltersChange({ ...filters, sort: "created", order: "desc" }))}>
                        <ArrowUpDown className="mr-2 h-4 w-4 text-purple-500" />
                        <span>Sort by Newest</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => onFiltersChange({ ...filters, sort: "created", order: "asc" }))}>
                        <ArrowUpDown className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Sort by Oldest</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => onFiltersChange({ ...filters, sort: "comments", order: "desc" }))}>
                        <ArrowUpDown className="mr-2 h-4 w-4 text-pink-500" />
                        <span>Sort by Most Commented</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Priority">
                    {AVAILABLE_PRIORITIES.map((priority) => (
                        <CommandItem
                            key={priority}
                            onSelect={() => runCommand(() => onFiltersChange({ ...filters, priority: filters.priority === priority ? "" : priority }))}
                        >
                            <Tag className="mr-2 h-4 w-4" />
                            <span>Set Priority: {priority}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Appearance">
                    <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Switch to Light Mode</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Switch to Dark Mode</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}

export default CommandPalette;
