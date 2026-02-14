const SkeletonCard = ({ index = 0 }: { index?: number }) => (
  <div
    className="flex items-start gap-3.5 p-4 sm:p-5 rounded-xl border border-border/30 bg-card/30 opacity-0 animate-fade-in"
    style={{ animationDelay: `${index * 60}ms`, animationFillMode: "forwards" }}
  >
    {/* Avatar skeleton */}
    <div className="h-8 w-8 rounded-full bg-muted/60 animate-pulse-soft shrink-0" />

    <div className="flex-1 space-y-3">
      <div className="h-4 bg-muted/50 rounded-lg w-4/5 animate-pulse-soft" />
      <div className="h-3 bg-muted/30 rounded-lg w-2/5 animate-pulse-soft stagger-1" />
      <div className="flex gap-2">
        <div className="h-4 bg-muted/25 rounded-full w-16 animate-pulse-soft stagger-2" />
        <div className="h-4 bg-muted/25 rounded-full w-20 animate-pulse-soft stagger-3" />
        <div className="h-4 bg-muted/25 rounded-full w-14 animate-pulse-soft stagger-4" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 bg-muted/20 rounded w-12 animate-pulse-soft stagger-4" />
        <div className="h-3 bg-muted/20 rounded w-8 animate-pulse-soft stagger-5" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
