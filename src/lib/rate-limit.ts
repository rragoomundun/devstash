import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

type RateLimitConfig = {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration string (e.g. "15 m", "1 h") */
  window: Parameters<typeof Ratelimit.slidingWindow>[1];
  /** Prefix for the rate limit key */
  prefix: string;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  /** Seconds until the limit resets */
  resetInSeconds: number;
};

const limiters = new Map<string, Ratelimit>();

function getLimiter(config: RateLimitConfig): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;

  const key = config.prefix;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(config.limit, config.window),
        prefix: `ratelimit:${config.prefix}`,
        analytics: false,
      })
    );
  }
  return limiters.get(key)!;
}

/**
 * Check rate limit for a given identifier.
 * Fails open — if Upstash is unavailable, the request is allowed.
 */
export async function rateLimit(
  config: RateLimitConfig,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getLimiter(config);

  // Fail open if Redis is not configured
  if (!limiter) {
    return { success: true, remaining: config.limit, resetInSeconds: 0 };
  }

  try {
    const result = await limiter.limit(identifier);
    const resetInSeconds = Math.ceil((result.reset - Date.now()) / 1000);

    return {
      success: result.success,
      remaining: result.remaining,
      resetInSeconds: Math.max(resetInSeconds, 0),
    };
  } catch {
    // Fail open on errors
    return { success: true, remaining: config.limit, resetInSeconds: 0 };
  }
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

/** Return a 429 JSON response with Retry-After header. */
export function rateLimitResponse(resetInSeconds: number): Response {
  const minutes = Math.ceil(resetInSeconds / 60);
  return Response.json(
    { error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
    {
      status: 429,
      headers: { "Retry-After": String(resetInSeconds) },
    }
  );
}

// ── Pre-configured rate limit configs ──

export const AUTH_LIMITS = {
  login: { limit: 5, window: "15 m", prefix: "auth:login" },
  register: { limit: 3, window: "1 h", prefix: "auth:register" },
  forgotPassword: { limit: 3, window: "1 h", prefix: "auth:forgot-password" },
  resetPassword: { limit: 5, window: "15 m", prefix: "auth:reset-password" },
  resendVerification: { limit: 3, window: "15 m", prefix: "auth:resend-verification" },
  changePassword: { limit: 5, window: "15 m", prefix: "auth:change-password" },
} as const satisfies Record<string, RateLimitConfig>;

export const AI_LIMITS = {
  autoTag: { limit: 20, window: "1 h", prefix: "ai:auto-tag" },
} as const satisfies Record<string, RateLimitConfig>;
