import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Shield, Lock, Cookie, Info as InfoIcon, ChevronRight, Scale, Users, Heart, Zap, ExternalLink, Mail, Github, List, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { useToast } from "@/components/ui/use-toast";
import SEO from "@/components/SEO";

const Info = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeSection, setActiveSection] = useState("about");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSendEmail = () => {
        window.location.href = "mailto:support@gitfinder.com";
    };

    const handleCopyEmail = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const email = "support@gitfinder.com";
        navigator.clipboard.writeText(email);
        setCopied(true);
        toast({
            title: "Email Copied",
            description: "support@gitfinder.com has been copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const sections = [
        {
            id: "about",
            title: "About GitFinder",
            icon: <InfoIcon className="h-5 w-5 text-blue-400" />,
            content: (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-400" /> The Mission
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Our mission is to bridge the gap between talented developers and impactful open-source projects. We believe that every developer, regardless of their current skill level, has something valuable to contribute to the global software ecosystem.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Scale className="h-5 w-5 text-primary" /> The Why
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            GitHub is the world's largest repository of code, but its native interface for finding issues can be overwhelming. Label fragmentation, lack of uniform categorization, and the sheer volume of repositories make discovery a manual hurdle.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We created GitFinder to centralize discovery. By leveraging advanced filtering and a premium user interface, we reduce the "time-to-contribution" from hours to seconds. We want you to spend less time searching and more time coding.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" /> For Developers
                            </h4>
                            <p className="text-sm text-muted-foreground">Find issues that match your tech stack and experience level instantly.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Heart className="h-4 w-4 text-red-400" /> For Maintainers
                            </h4>
                            <p className="text-sm text-muted-foreground">We help your "good first issues" find the right contributors, faster.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "privacy",
            title: "Privacy Policy",
            icon: <Shield className="h-5 w-5 text-green-400" />,
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        At GitFinder, we take a "Privacy by Design" approach. We operate under the principle of data minimization—if we don't need it, we don't collect it.
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">1. Data Storage</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            GitFinder does not own or maintain any database for user information. All interaction data, including your bookmarks, search history, and personalization settings, are stored exclusively within your browser's <strong>Local Storage</strong> and <strong>Session Storage</strong>.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">2. Authentication Tokens</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            If you provide a GitHub Personal Access Token to increase your rate limits, this token is stored only on your machine. It is never transmitted to us or any third party except for the direct API calls to <code>api.github.com</code>.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-xs text-muted-foreground italic">
                        GitFinder is fully compliant with GDPR and CCPA principles by virtue of not collecting or processing personal identifying information (PII) on its backend.
                    </div>
                </div>
            )
        },
        {
            id: "terms",
            title: "Terms of Service",
            icon: <Lock className="h-5 w-5 text-purple-400" />,
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        By using the GitFinder application, you agree to abide by the following terms.
                    </p>

                    <div className="space-y-4 text-sm text-muted-foreground">
                        <h4 className="font-medium text-foreground">Acceptable Use</h4>
                        <p>You agree to use GitFinder and the GitHub API in a manner that does not violate the GitHub Acceptable Use Policy. Any abuse of the GitHub API through this interface is your sole responsibility.</p>

                        <h4 className="font-medium text-foreground">Disclaimer of Warranty</h4>
                        <p>THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.</p>

                        <h4 className="font-medium text-foreground">Limitation of Liability</h4>
                        <p>IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE.</p>
                    </div>
                </div>
            )
        },
        {
            id: "cookies",
            title: "Cookie & Storage",
            icon: <Cookie className="h-5 w-5 text-amber-400" />,
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        GitFinder uses strictly functional storage mechanisms to provide its service. We prioritize your privacy by keeping everything local.
                    </p>

                    {/* Desktop View: Elegant Table */}
                    <div className="hidden md:block overflow-hidden rounded-2xl border border-border/50 bg-card/30">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 text-left text-muted-foreground">
                                    <th className="px-6 py-4 font-semibold">Storage Type</th>
                                    <th className="px-6 py-4 font-semibold">Purpose</th>
                                    <th className="px-6 py-4 font-semibold text-right">Policy</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                <tr className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4"><code className="bg-muted px-2 py-0.5 rounded text-primary font-mono text-xs">localStorage</code></td>
                                    <td className="px-6 py-4 text-muted-foreground">Preferences, Bookmarks, Theme settings</td>
                                    <td className="px-6 py-4 text-right font-medium text-emerald-400">Functional</td>
                                </tr>
                                <tr className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4"><code className="bg-muted px-2 py-0.5 rounded text-primary font-mono text-xs">sessionStorage</code></td>
                                    <td className="px-6 py-4 text-muted-foreground">Search results and API caching</td>
                                    <td className="px-6 py-4 text-right font-medium text-emerald-400">Functional</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View: Dynamic Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {[
                            { name: "localStorage", purpose: "Preferences, Bookmarks, Theme", policy: "Functional" },
                            { name: "sessionStorage", purpose: "Search results caching", policy: "Functional" }
                        ].map((item) => (
                            <div key={item.name} className="p-5 rounded-2xl bg-card border border-border/50 space-y-3">
                                <div className="flex justify-between items-center">
                                    <code className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-xs">{item.name}</code>
                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">{item.policy}</span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-snug">{item.purpose}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-4">
                        <div className="p-1.5 rounded-lg bg-orange-500/20">
                            <Shield className="h-4 w-4 text-orange-400" />
                        </div>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                            We do not use tracking pixels, marketing cookies, or cross-site analytics. Your search behavior stays between you and GitHub.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "contact",
            title: "Contact Us",
            icon: <Mail className="h-5 w-5 text-pink-400" />,
            content: (
                <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        Have questions, feedback, or need support? We'd love to hear from you.
                    </p>
                    <div className="flex flex-col gap-4">
                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-6 group hover:bg-primary/10 transition-colors duration-300">
                            <div className="h-14 w-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1 text-center md:text-left flex-1">
                                <h4 className="font-semibold text-lg">Email Support</h4>
                                <p className="text-sm text-muted-foreground">General inquiries and technical support.</p>
                            </div>
                            <div className="flex items-center bg-primary rounded-xl overflow-hidden shadow-lg shadow-primary/20">
                                <Button
                                    variant="ghost"
                                    className="rounded-none px-6 h-11 hover:bg-white/10 text-primary-foreground border-none transition-colors"
                                    onClick={handleSendEmail}
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                </Button>
                                <div className="h-4 w-[1px] bg-white/30 self-center" aria-hidden="true" />
                                <Button
                                    variant="ghost"
                                    className="rounded-none px-3 h-11 hover:bg-white/10 text-primary-foreground border-none transition-colors"
                                    onClick={handleCopyEmail}
                                    title="Copy email address"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-card border border-border/50 flex flex-col md:flex-row items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center shrink-0">
                                <Github className="h-6 w-6 text-foreground" />
                            </div>
                            <div className="space-y-1 text-center md:text-left flex-1">
                                <h4 className="font-semibold text-lg">GitHub Issues</h4>
                                <p className="text-sm text-muted-foreground">Report bugs or request features on our repository.</p>
                            </div>
                            <Button variant="outline" asChild className="rounded-xl px-6 border-border/50">
                                <a href="https://github.com/Vasu657/git-issue-explorer/issues" target="_blank" rel="noopener noreferrer">
                                    Github Link
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;
            sections.forEach((section) => {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                    }
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80,
                behavior: "smooth"
            });
            setIsSheetOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <SEO title="About GitFinder - Privacy, Terms, and Mission" />
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Desktop Sidebar Navigation */}
                    <aside className="hidden lg:block lg:w-64 shrink-0">
                        <div className="lg:sticky lg:top-24 space-y-8">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight mb-2">Info</h1>
                            </div>

                            <nav className="flex flex-col gap-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${activeSection === section.id
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:bg-card/50 hover:text-foreground border border-transparent"
                                            }`}
                                    >
                                        <span className={`transition-colors ${activeSection === section.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                                            {section.icon}
                                        </span>
                                        {section.title}
                                    </button>
                                ))}
                            </nav>

                            <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-3">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Open Source</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    GitFinder is built with ❤️ by the community. Join us in making OSS discovery better.
                                </p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-primary text-xs hover:no-underline flex items-center gap-1"
                                    onClick={() => window.open("https://github.com/Vasu657/git-issue-explorer", "_blank")}
                                >
                                    View Repository <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Floating Action Button & Table of Contents */}
                    <div className="lg:hidden fixed bottom-6 right-6 z-[60]">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        size="icon"
                                        className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 bg-primary text-primary-foreground border-4 border-background/20 backdrop-blur-sm"
                                    >
                                        <List className="h-6 w-6" />
                                    </Button>
                                </motion.div>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="rounded-t-[2.5rem] p-6 bg-background/95 backdrop-blur-xl border-t border-border/50">
                                <SheetHeader className="mb-6">
                                    <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                                    <SheetTitle className="text-xl font-bold flex items-center justify-center gap-2">
                                        <InfoIcon className="h-5 w-5 text-primary" /> Table of Contents
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="grid gap-2">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={`flex items-center justify-between px-6 py-4 rounded-2xl text-base font-medium transition-all duration-300 ${activeSection === section.id
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "bg-card/50 text-muted-foreground hover:bg-card border border-transparent"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`${activeSection === section.id ? "text-primary" : "text-muted-foreground"}`}>
                                                    {section.icon}
                                                </span>
                                                {section.title}
                                            </div>
                                            {activeSection === section.id && (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-border/50 text-center">
                                    <p className="text-xs text-muted-foreground italic">GitFinder Info & Policies</p>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Content Section */}
                    <main className="flex-1 max-w-3xl pb-32">
                        {/* Mobile Header */}
                        <div className="lg:hidden mb-12 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                                <InfoIcon className="h-3 w-3" /> Documentation
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Info & Policies</h1>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Everything you need to know about GitFinder's mission, terms, and privacy.</p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-24"
                        >
                            {sections.map((section) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-24 lg:scroll-mt-32"
                                >
                                    <div className="flex items-center gap-4 mb-6 sm:mb-8">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                            {section.icon}
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{section.title}</h2>
                                    </div>
                                    <div className="prose prose-invert max-w-none">
                                        {section.content}
                                    </div>
                                </section>
                            ))}
                        </motion.div>

                        {/* Footer Call to Action */}
                        <div className="mt-24 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-card/80 to-background border border-border/50 flex flex-col items-center text-center gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-2xl font-bold tracking-tight">Ready to find your next project?</h3>
                                <p className="text-muted-foreground">The best issues on GitHub are just a few clicks away.</p>
                            </div>
                            <Button
                                size="lg"
                                onClick={() => navigate("/")}
                                className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold group z-10 w-full md:w-auto"
                            >
                                Start Searching
                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Info;
