import { useState, useRef, useEffect } from "react";
import { Key, Info, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, LogOut, Shield, ExternalLink, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useToast } from "@/components/ui/use-toast";

const AuthTokenPanel = () => {
  const { token, setToken, user, scopes, isLoadingUser } = useAuthToken();
  const [value, setValue] = useState(token ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setValue(token ?? "");
  }, [token]);

  const handleSave = async () => {
    if (!value.trim()) {
      setToken(null);
      return;
    }
    await setToken(value);
    setOpen(false);
    toast({
      title: "Token saved",
      description: "Your GitHub token has been securely stored.",
    });
  };

  const handleClear = () => {
    setToken(null);
    setValue("");
    setOpen(false);
    toast({
      title: "Token removed",
      description: "Your GitHub token has been removed from storage.",
    });
  };

  const hasRepoScope = scopes.includes("repo") || scopes.includes("public_repo");
  const isFineGrained = token?.startsWith("github_pat_");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          ref={triggerRef}
          className={`h-9 transition-all gap-2 ${token
            ? "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {user ? (
            <>
              <img src={user.avatar_url} alt={user.login} className="h-5 w-5 rounded-full border border-primary/20" />
              <span className="max-w-[100px] truncate hidden sm:inline">{user.login}</span>
            </>
          ) : (
            <>
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Auth</span>
            </>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-background border-border/50 overflow-y-auto p-6">
        <SheetHeader className="pb-6 border-b border-border/40">
          <SheetTitle className="text-xl font-bold flex items-center gap-2.5">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${user ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {user ? <User className="h-5 w-5" /> : <Key className="h-5 w-5" />}
            </div>
            {user ? "Identity Verified" : "Authentication"}
          </SheetTitle>
          <SheetDescription>
            {user ? "Manage your active session and permissions." : "Connect your GitHub account to unlock higher rate limits."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* User Profile Section */}
          {user && (
            <div className="bg-card/50 rounded-xl border border-border/50 p-6 space-y-6">
              <div className="flex items-start gap-4">
                <img src={user.avatar_url} alt={user.login} className="h-16 w-16 rounded-full border-2 border-border" />
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{user.name || user.login}</h3>
                  <p className="text-muted-foreground">@{user.login}</p>
                  <a href={user.html_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    View Profile <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Scopes Analysis */}
              <div className="space-y-3 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Token Permissions
                  </span>
                  <span className="text-xs text-muted-foreground">{isFineGrained ? "Fine-grained token" : `${scopes.length} detected`}</span>
                </div>

                {!isFineGrained && (
                  <div className="flex flex-wrap gap-2">
                    {scopes.map(scope => (
                      <span key={scope} className="text-[10px] uppercase font-mono px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-muted-foreground">
                        {scope}
                      </span>
                    ))}
                    {scopes.length === 0 && <span className="text-xs text-muted-foreground italic">No scopes detected</span>}
                  </div>
                )}

                {isFineGrained ? (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold">Fine-grained Token Detected</p>
                      <p className="text-xs opacity-90">Scope validation is not available for fine-grained tokens via API headers. Please ensure you granted access to the repositories you need.</p>
                    </div>
                  </div>
                ) : !hasRepoScope ? (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold">Limited Access Warning</p>
                      <p className="text-xs opacity-90">Your token is missing the <code className="bg-black/10 dark:bg-white/10 px-1 rounded">repo</code> scope. You won't be able to see private issues.</p>
                    </div>
                  </div>
                ) : null}
              </div>

              <Button variant="destructive" onClick={handleClear} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}

          {/* Token Input Section */}
          {!user && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Personal Access Token
                </label>
                <div className="relative">
                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    type={showPassword ? "text" : "password"}
                    className="pr-10 font-mono"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    type="button"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 space-y-3">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-semibold mb-1">Why enable authentication?</p>
                    <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                      <li>Increase API rate limit (60 &rarr; 5,000 req/hr)</li>
                      <li>Access private repositories and issues</li>
                      <li>Verify your identity</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isLoadingUser || !value.trim()}
                className="w-full"
              >
                {isLoadingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying Identity...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Verify & Connect
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AuthTokenPanel;
