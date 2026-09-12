/**
 * localStorage-based cache with sync-aware invalidation.
 *
 * Cache entries store: { data, lastSyncAt, cachedAt }
 * On subsequent loads, if `lastSyncAt` from the server changed, cache is refreshed.
 */

const PREFIX = "ash_v6_";

interface CacheEntry<T> {
  data: T;
  lastSyncAt: string | null;
  cachedAt: number;
}

const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function cacheGet<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.cachedAt && Date.now() - entry.cachedAt > ttlMs) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, lastSyncAt: string | null): void {
  try {
    const entry: CacheEntry<T> = { data, lastSyncAt, cachedAt: Date.now() };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full — silently ignore
  }
}

