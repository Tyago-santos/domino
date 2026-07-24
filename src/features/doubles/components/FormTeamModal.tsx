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
          className="relative z-10 mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-2xl"
        >
          {step === "success" ? (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40"
              >
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-text">Dupla Criada!</h3>
              <p className="text-sm text-text-muted">
                Sua dupla <strong>{teamName}</strong> foi criada com sucesso.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                    <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text">Formar Dupla</h3>
                    <p className="text-xs text-text-muted">Escolha um parceiro e crie sua dupla</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-2 text-text-muted hover:bg-surface-muted hover:text-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text">
                    Nome da Dupla
                  </label>
                  <Input
                    placeholder="Ex: Dupla Dourada"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text">
                    Escolha o Parceiro
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, apelido ou cidade..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-lg border border-surface-border bg-surface-muted py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-surface-border p-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      ))
                    ) : availablePlayers.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-surface-border p-6 text-center">
                        <Users className="mx-auto mb-2 h-8 w-8 text-text-muted" />
                        <p className="text-sm text-text-muted">
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
                            "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                            selectedPlayer?.id === player.id
                              ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 dark:bg-emerald-950/30"
                              : "border-surface-border hover:border-emerald-300 hover:bg-surface-muted dark:hover:border-emerald-700"
                          )}
                        >
                          <Avatar size="default" src={player.avatar} fallback={player.name} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold text-text">
                              {player.name}
                            </p>
                            <p className="text-xs text-text-muted">@{player.nickname}</p>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {player.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                #{player.ranking}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              {player.winRate.toFixed(1)}%
                            </p>
                            <p className="text-[10px] text-text-muted">
                              {player.score.toLocaleString("pt-BR")} pts
                            </p>
                          </div>
                          {selectedPlayer?.id === player.id && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-surface-border px-6 py-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!teamName.trim() || !selectedPlayer || createTeamMutation.isPending}
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {createTeamMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Criando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Criar Dupla
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleInvite}
                  disabled={!selectedPlayer || sendInvitationMutation.isPending}
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                >
                  {sendInvitationMutation.isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
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
