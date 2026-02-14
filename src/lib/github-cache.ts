const RATE_LIMIT_KEY = "ghf_ratelimit";

interface RateLimitInfo {
  remaining: number;
  resetAt: number;
}

export function getRateLimitInfo(): RateLimitInfo {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { remaining: 10, resetAt: 0 };
}

export function setRateLimitInfo(remaining: number, resetAt: number): void {
  localStorage.setItem(
    RATE_LIMIT_KEY,
    JSON.stringify({ remaining, resetAt })
  );
}

export function isRateLimited(): boolean {
  const info = getRateLimitInfo();
  return info.remaining <= 0 && Date.now() < info.resetAt * 1000;
}

export function getRateLimitResetMs(): number {
  const info = getRateLimitInfo();
  return Math.max(0, info.resetAt * 1000 - Date.now());
}
