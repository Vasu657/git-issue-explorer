import { GitBranch, Globe, Zap } from "lucide-react";
import { useGitHubLanguages } from "@/hooks/useGitHubLanguages";
import { AVAILABLE_LABELS } from "@/types/github";

interface HeroSectionProps {
  labelCount?: number;
}

const HeroSection = ({ labelCount }: HeroSectionProps) => {
  const { languages } = useGitHubLanguages();
  const languageCount = languages.length;

  // Use provided count, or fallback to our static baseline if 0 or undefined
  const displayLabelCount = (labelCount && labelCount > 0)
    ? labelCount
    : AVAILABLE_LABELS.length;

  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/8 rounded-full blur-[100px] animate-float" />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-float"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px] animate-glow"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-24 sm:pt-20 sm:pb-28 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-8 animate-fade-in">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Open Source Discovery Engine
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 animate-fade-in stagger-1">
          Discover issues.
          <br />
          <span className="gradient-text">Start contributing.</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in stagger-2">
          Search millions of GitHub issues by label, language, and more.
          Find the perfect issue for your first — or next — open source contribution.
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mt-12 animate-fade-in stagger-3">
          <StatCard
            icon={<GitBranch className="h-4 w-4" />}
            value={`${displayLabelCount}+`}
            label="Labels"
          />
          <div className="h-10 w-px bg-border/50" />
          <StatCard
            icon={<Globe className="h-4 w-4" />}
            value={languageCount > 0 ? `${languageCount}+` : "---"}
            label="Languages"
          />
          <div className="h-10 w-px bg-border/50" />
          <StatCard icon={<Zap className="h-4 w-4" />} value="Live" label="Real-time" />
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>
  );
};

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <div className="text-center group">
    <div className="flex items-center justify-center gap-1.5 text-base font-bold text-foreground">
      <span className="text-primary">{icon}</span>
      {value}
    </div>
    <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">
      {label}
    </div>
  </div>
);

export default HeroSection;
