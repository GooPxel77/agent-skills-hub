import { useCallback, useEffect, useRef, useState } from "react";
import { cacheGet, cacheSet } from "./useCache";

const FRESH_MS = 10 * 60 * 1000;
const STALE_MS = 24 * 60 * 60 * 1000;
const pending = new Map<string, Promise<unknown>>();

function sharedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = pending.get(key);
  if (existing) return existing as Promise<T>;
  const promise = Promise.resolve().then(fetcher).then((result) => {
    cacheSet(key, result, null);
    return result;
  }).finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
}

export function useCachedQuery<T>(cacheKey: string, fetcher: () => Promise<T>) {
  const initial = cacheGet<T>(cacheKey, STALE_MS);
  const [data, setData] = useState<T | null>(initial?.data ?? null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);

  const load = useCallback(async (force = false) => {
    const id = ++generation.current;
    const cached = cacheGet<T>(cacheKey, STALE_MS);
    if (cached) setData(cached.data);
    if (!force && cached && Date.now() - cached.cachedAt < FRESH_MS) {
      setLoading(false);
      setError(null);
      return;
    }
    if (!cached) setLoading(true);
    try {
      const result = await sharedFetch(cacheKey, fetcher);
      if (id === generation.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      // Keep usable cached data during an upstream outage.
      if (id === generation.current) setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      if (id === generation.current) setLoading(false);
    }
  }, [cacheKey, fetcher]);

  useEffect(() => {
    void load();
    const currentGeneration = generation;
    return () => { ++currentGeneration.current; };
  }, [load]);

  const refetch = useCallback(() => { void load(true); }, [load]);
  return { data, loading, error, refetch };
}
