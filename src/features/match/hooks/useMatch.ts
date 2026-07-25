import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/AuthProvider";
import * as matchService from "@/shared/services/matchService";
import { getMyTeam } from "@/shared/services/doublesService";
import type { MatchMode, PlayerCount, MatchPlayer } from "@/shared/types";

export function useAllPlayers() {
  return useQuery({
    queryKey: ["match", "players"],
    queryFn: matchService.getAllPlayers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: {
      name: string;
      mode: MatchMode;
      playerCount: PlayerCount;
      players: MatchPlayer[];
      teamA?: { name: string; playerIds: string[] };
      teamB?: { name: string; playerIds: string[] };
    }) =>
      matchService.createMatch({
        ...data,
        createdBy: user?.uid || "",
        createdByName: user?.nickname || "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", "active"] });
    },
  });
}

export function useStartMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => matchService.startMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", "active"] });
    },
  });
}

export function useActiveMatch(matchId: string | null) {
  return useQuery({
    queryKey: ["match", "active", matchId],
    queryFn: () => matchService.getActiveMatch(matchId!),
    enabled: !!matchId,
    refetchInterval: 1000,
  });
}

export function useActiveMatchForPlayer() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["match", "activeForPlayer", user?.uid],
    queryFn: () => matchService.getActiveMatchForPlayer(user!.uid),
    enabled: !!user?.uid,
    refetchInterval: 2000,
  });
}

export function useConfirmVictory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, playerId }: { matchId: string; playerId: string }) =>
      matchService.confirmVictory(matchId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", "active"] });
      queryClient.invalidateQueries({ queryKey: ["match", "activeForPlayer"] });
      queryClient.invalidateQueries({ queryKey: ["match", "history"] });
      queryClient.invalidateQueries({ queryKey: ["match", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
      queryClient.invalidateQueries({ queryKey: ["player"] });
      queryClient.invalidateQueries({ queryKey: ["playerStats"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      queryClient.invalidateQueries({ queryKey: ["doubles"] });
    },
  });
}

export function useMatchHistory(filters?: {
  mode?: MatchMode;
  period?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["match", "history", filters],
    queryFn: () =>
      matchService.getMatchHistory({
        mode: filters?.mode as MatchMode | undefined,
        period: filters?.period as any,
        page: filters?.page,
        pageSize: filters?.pageSize,
      }),
    staleTime: 60 * 1000,
  });
}

export function useRecentMatches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["match", "recent", user?.uid],
    queryFn: () => matchService.getRecentMatches(user!.uid),
    enabled: !!user?.uid,
    staleTime: 60 * 1000,
  });
}

export function useConfirmations(matchId: string | null) {
  return useQuery({
    queryKey: ["match", "confirmations", matchId],
    queryFn: () => matchService.getConfirmations(matchId!),
    enabled: !!matchId,
    refetchInterval: 1000,
  });
}

export function useMyTeam() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["match", "myTeam", user?.uid],
    queryFn: () => getMyTeam(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCancelMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => matchService.cancelMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", "active"] });
      queryClient.invalidateQueries({ queryKey: ["match", "activeForPlayer"] });
    },
  });
}
