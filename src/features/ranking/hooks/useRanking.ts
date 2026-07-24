import { useQuery } from "@tanstack/react-query";
import { getRanking } from "@/shared/services/playerService";

const RANKING_KEY = ["ranking"] as const;

export function useRanking() {
  return useQuery({
    queryKey: RANKING_KEY,
    queryFn: getRanking,
    staleTime: 5 * 60 * 1000,
  });
}
