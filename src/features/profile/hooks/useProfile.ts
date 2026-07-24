import { useQuery } from "@tanstack/react-query";
import { getPlayer, getPlayerStats } from "@/shared/services/playerService";
import { useAuth } from "@/app/providers/AuthProvider";

export function usePlayer() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["player", user?.uid],
    queryFn: () => getPlayer(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlayerStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["playerStats", user?.uid],
    queryFn: () => getPlayerStats(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}
