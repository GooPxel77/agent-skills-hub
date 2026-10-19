import { useLandingData } from "./useLandingData";

export function useStats() {
  const { data, refetch } = useLandingData();
  const stats = data?.stats ?? null;
  return { stats, categories: stats?.categories ?? [], refetchStats: refetch };
}
