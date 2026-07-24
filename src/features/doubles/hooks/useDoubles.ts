import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyTeam,
  getTeams,
  getDoublesMatchHistory,
  getDoublesStats,
  getPartners,
  getDoublesChartData,
  getAvailablePlayers,
  createTeam,
  sendInvitation,
  getInvitations,
} from "@/shared/services/doublesService";
import { useAuth } from "@/app/providers/AuthProvider";
import type { PeriodFilter } from "@/shared/types";
import { toast } from "sonner";

export function useMyTeam() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doubles", "myTeam", user?.uid],
    queryFn: () => getMyTeam(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeams() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doubles", "teams", user?.uid],
    queryFn: () => getTeams(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDoublesStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doubles", "stats", user?.uid],
    queryFn: () => getDoublesStats(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDoublesMatchHistory(
  filters?: {
    result?: "win" | "loss" | "draw";
    period?: PeriodFilter;
    page?: number;
    pageSize?: number;
  }
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doubles", "matchHistory", user?.uid, filters],
    queryFn: () => getDoublesMatchHistory(user!.uid, filters),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePartners() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doubles", "partners", user?.uid],
    queryFn: () => getPartners(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDoublesChartData(period: PeriodFilter = "30days") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doubles", "chartData", user?.uid, period],
    queryFn: () => getDoublesChartData(user!.uid, period),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAvailablePlayers(search?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doubles", "availablePlayers", user?.uid, search],
    queryFn: () => getAvailablePlayers(user!.uid, search),
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ teamName, partnerId }: { teamName: string; partnerId: string }) =>
      createTeam(user!.uid, teamName, partnerId),
    onSuccess: (newTeam) => {
      queryClient.setQueryData(["doubles", "myTeam", user?.uid], newTeam);
      queryClient.invalidateQueries({ queryKey: ["doubles", "teams"] });
      toast.success(`Dupla "${newTeam.name}" criada com sucesso!`);
    },
    onError: () => {
      toast.error("Erro ao criar dupla. Tente novamente.");
    },
  });
}

export function useSendInvitation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ partnerId, teamName }: { partnerId: string; teamName: string }) =>
      sendInvitation(user!.uid, partnerId, teamName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doubles", "invitations"] });
      toast.success("Convite enviado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao enviar convite. Tente novamente.");
    },
  });
}

export function useInvitations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["doubles", "invitations", user?.uid],
    queryFn: () => getInvitations(user!.uid),
    enabled: !!user?.uid,
    staleTime: 30 * 1000,
  });
}
