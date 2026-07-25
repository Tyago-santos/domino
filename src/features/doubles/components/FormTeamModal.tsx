import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Users, UserPlus, Trophy, MapPin, Check } from "lucide-react";
import { Avatar, Button, Input, Skeleton } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import { useAvailablePlayers, useCreateTeam, useSendInvitation } from "../hooks/useDoubles";
import type { AvailablePlayer } from "@/shared/types";

interface FormTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export function FormTeamModal({ open, onClose }: FormTeamModalProps) {
  const [teamName, setTeamName] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<AvailablePlayer | null>(null);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  const { data: players, isLoading } = useAvailablePlayers(search);
  const createTeamMutation = useCreateTeam();
  const sendInvitationMutation = useSendInvitation();

  const availablePlayers = players?.filter((p) => !p.inTeam) ?? [];

  function handleCreateTeam() {
    if (!selectedPlayer || !teamName.trim()) return;

    createTeamMutation.mutate(
      { teamName: teamName.trim(), partnerId: selectedPlayer.id },
      {
        onSuccess: () => {
          setStep("success");
          setTimeout(() => {
            onClose();
            setStep("form");
            setTeamName("");
            setSelectedPlayer(null);
            setSearch("");
          }, 2000);
        },
      }
    );
  }

  function handleInvite() {
    if (!selectedPlayer || !teamName.trim()) return;

    sendInvitationMutation.mutate(
      { partnerId: selectedPlayer.id, teamName: teamName.trim() },
      {
        onSuccess: () => {
          setStep("success");
          setTimeout(() => {
            onClose();
            setStep("form");
            setTeamName("");
            setSelectedPlayer(null);
            setSearch("");
          }, 2000);
        },
      }
    );
  }

  function handleClose() {
    onClose();
    setStep("form");
    setTeamName("");
    setSelectedPlayer(null);
    setSearch("");
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 mx-0 flex h-full w-full flex-col overflow-hidden rounded-none border-0 border-surface-border bg-surface shadow-2xl sm:mx-4 sm:h-auto sm:max-w-lg sm:rounded-2xl sm:border"
        >
          {step === "success" ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center sm:gap-4 sm:p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 sm:h-16 sm:w-16"
              >
                <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400 sm:h-8 sm:w-8" />
              </motion.div>
              <h3 className="text-[12px] font-bold text-text sm:text-xl">Dupla Criada!</h3>
              <p className="text-[10px] text-text-muted sm:text-sm">
                Sua dupla <strong>{teamName}</strong> foi criada com sucesso.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-surface-border px-3 py-2.5 sm:px-6 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 sm:h-10 sm:w-10 sm:rounded-xl">
                    <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-text sm:text-lg">Formar Dupla</h3>
                    <p className="text-[9px] text-text-muted sm:text-xs">Escolha um parceiro e crie sua dupla</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-muted hover:text-text sm:p-2"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 p-3 sm:space-y-4 sm:p-6">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-text sm:mb-1.5 sm:text-sm">
                    Nome da Dupla
                  </label>
                  <Input
                    placeholder="Ex: Dupla Dourada"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="text-[10px] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-medium text-text sm:mb-1.5 sm:text-sm">
                    Escolha o Parceiro
                  </label>
                  <div className="relative mb-2 sm:mb-3">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted sm:left-3 sm:h-4 sm:w-4" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-lg border border-surface-border bg-surface-muted py-2 pl-8 pr-3 text-[10px] text-text placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-sm"
                    />
                  </div>

                  <div className="max-h-48 space-y-1.5 overflow-y-auto sm:max-h-64 sm:space-y-2">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border border-surface-border p-2 sm:gap-3 sm:p-3">
                          <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-3.5 w-20 sm:h-4 sm:w-24" />
                            <Skeleton className="h-2.5 w-12 sm:h-3 sm:w-16" />
                          </div>
                        </div>
                      ))
                    ) : availablePlayers.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-surface-border p-4 text-center sm:p-6">
                        <Users className="mx-auto mb-1.5 h-6 w-6 text-text-muted sm:mb-2 sm:h-8 sm:w-8" />
                        <p className="text-[10px] text-text-muted sm:text-sm">
                          Nenhum jogador disponível encontrado
                        </p>
                      </div>
                    ) : (
                      availablePlayers.map((player) => (
                        <motion.button
                          key={player.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedPlayer(player)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg border p-2 text-left transition-all sm:gap-3 sm:p-3",
                            selectedPlayer?.id === player.id
                              ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 dark:bg-emerald-950/30"
                              : "border-surface-border hover:border-emerald-300 hover:bg-surface-muted dark:hover:border-emerald-700"
                          )}
                        >
                          <Avatar size="sm" src={player.avatar} fallback={player.name} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[10px] font-semibold text-text sm:text-sm">
                              {player.name}
                            </p>
                            <p className="text-[9px] text-text-muted sm:text-xs">@{player.nickname}</p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-text-muted sm:mt-1 sm:gap-2 sm:text-[11px]">
                              <span className="flex items-center gap-0.5 sm:gap-1">
                                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                {player.city}
                              </span>
                              <span className="flex items-center gap-0.5 sm:gap-1">
                                <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                #{player.ranking}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 sm:text-sm">
                              {player.winRate.toFixed(1)}%
                            </p>
                            <p className="text-[8px] text-text-muted sm:text-[10px]">
                              {player.wins} vitórias
                            </p>
                          </div>
                          {selectedPlayer?.id === player.id && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 sm:h-6 sm:w-6">
                              <Check className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                            </div>
                          )}
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-surface-border px-3 py-2.5 sm:flex-row sm:gap-3 sm:px-6 sm:py-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 text-[10px] sm:text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!teamName.trim() || !selectedPlayer || createTeamMutation.isPending}
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] sm:text-sm"
                >
                  {createTeamMutation.isPending ? (
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-4 sm:w-4" />
                      Criando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      Criar Dupla
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleInvite}
                  disabled={!selectedPlayer || sendInvitationMutation.isPending}
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30 text-[10px] sm:text-sm"
                >
                  {sendInvitationMutation.isPending ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent sm:h-4 sm:w-4" />
                  ) : (
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                      Convidar
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
