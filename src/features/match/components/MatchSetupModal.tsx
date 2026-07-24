import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Users,
  Swords,
  ArrowRight,
  ArrowLeft,
  Play,
  Check,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import { PlayerSelector } from "./PlayerSelector";
import { TeamBuilder } from "./TeamBuilder";
import { useAllPlayers, useCreateMatch, useStartMatch } from "../hooks/useMatch";
import type { MatchMode, PlayerCount, MatchPlayer } from "@/shared/types";

interface MatchSetupModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "players" | "mode" | "teams" | "confirm";

function getSteps(playerCount: PlayerCount): { key: Step; label: string }[] {
  const base: { key: Step; label: string }[] = [
    { key: "players", label: "Jogadores" },
  ];
  if (playerCount === 4) {
    base.push({ key: "mode", label: "Modo" });
  }
  return base;
}

export function MatchSetupModal({ open, onClose }: MatchSetupModalProps) {
  const [step, setStep] = useState<Step>("players");
  const [mode, setMode] = useState<MatchMode>("individual");
  const [playerCount, setPlayerCount] = useState<PlayerCount>(2);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [matchName, setMatchName] = useState("");
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");

  const { data: allPlayers, isLoading: loadingPlayers } = useAllPlayers();
  const createMatch = useCreateMatch();
  const startMatch = useStartMatch();

  const selectedPlayers: MatchPlayer[] = allPlayers?.filter((p: MatchPlayer) => selectedIds.includes(p.id)) ?? [];
  const steps = getSteps(playerCount);
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("players");
      setMode("individual");
      setPlayerCount(2);
      setSelectedIds([]);
      setMatchName("");
      setTeamAName("");
      setTeamBName("");
    }, 200);
  }

  function canNext(): boolean {
    switch (step) {
      case "players":
        return selectedIds.length === playerCount;
      case "mode":
        return true;
      case "teams":
        return teamAName.trim().length > 0 && teamBName.trim().length > 0;
      case "confirm":
        return true;
      default:
        return false;
    }
  }

  function nextStep() {
    const idx = steps.findIndex((s) => s.key === step);
    if (idx < steps.length - 1) {
      setStep(steps[idx + 1]!.key);
    }
  }

  function prevStep() {
    const idx = steps.findIndex((s) => s.key === step);
    if (idx > 0) {
      setStep(steps[idx - 1]!.key);
    }
  }

  async function handleStart() {
    const playerCountNum = parseInt(String(playerCount), 10) as 2 | 3 | 4;
    const teamAPlayers: MatchPlayer[] | undefined = mode === "doubles" ? selectedPlayers.slice(0, 2) : undefined;
    const teamBPlayers: MatchPlayer[] | undefined = mode === "doubles" ? selectedPlayers.slice(2, 4) : undefined;

    createMatch.mutate(
      {
        name: matchName,
        mode,
        playerCount: playerCountNum,
        players: selectedPlayers,
        teamA:
          mode === "doubles"
            ? { name: teamAName, playerIds: teamAPlayers?.map((p) => p.id) || [] }
            : undefined,
        teamB:
          mode === "doubles"
            ? { name: teamBName, playerIds: teamBPlayers?.map((p) => p.id) || [] }
            : undefined,
      },
      {
        onSuccess: (match) => {
          startMatch.mutate(match.id, {
            onSuccess: handleClose,
          });
        },
      }
    );
  }

  if (!open) return null;

  const totalSteps = steps.length;

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
          className="relative z-10 mx-4 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
                <Swords className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">Nova Partida</h3>
                <p className="text-xs text-text-muted">
                  Passo {currentStepIndex + 1} de {totalSteps}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-text-muted hover:bg-surface-muted hover:text-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex gap-1 px-6 pt-4">
            {steps.map((s, i) => (
              <div
                key={s.key}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= currentStepIndex ? "bg-primary-500" : "bg-surface-muted"
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {step === "players" && (
                <motion.div
                  key="players"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text">
                      Número de Jogadores
                    </label>
                    <div className="flex gap-2">
                      {([2, 3, 4] as const).map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            setPlayerCount(n);
                            setMode("individual");
                            setSelectedIds((prev) => prev.slice(0, n));
                          }}
                          className={cn(
                            "flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all",
                            playerCount === n
                              ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300"
                              : "border-surface-border text-text-muted hover:border-primary-300"
                          )}
                        >
                          {n} Jogadores
                        </button>
                      ))}
                    </div>
                    {playerCount === 4 && (
                      <p className="text-xs text-text-muted">
                        Com 4 jogadores você pode jogar individual ou em duplas
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text">
                      Nome da Partida{" "}
                      <span className="text-text-muted font-normal">(opcional)</span>
                    </label>
                    <Input
                      placeholder="Ex: Partida amigável"
                      value={matchName}
                      onChange={(e) => setMatchName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-text">
                      Selecione {playerCount} jogador{playerCount > 1 ? "es" : ""}
                    </h4>
                    <PlayerSelector
                      players={allPlayers ?? []}
                      selectedIds={selectedIds}
                      maxSelection={playerCount}
                      onSelectionChange={setSelectedIds}
                      isLoading={loadingPlayers}
                    />
                  </div>
                </motion.div>
              )}

              {step === "mode" && (
                <motion.div
                  key="mode"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h4 className="text-sm font-medium text-text">Como quer jogar?</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMode("individual")}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                        mode === "individual"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                          : "border-surface-border hover:border-primary-300"
                      )}
                    >
                      <User
                        className={cn(
                          "h-8 w-8",
                          mode === "individual"
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-text-muted"
                        )}
                      />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-text">Individual</p>
                        <p className="text-xs text-text-muted">Cada um por si</p>
                      </div>
                      {mode === "individual" && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setMode("doubles")}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                        mode === "doubles"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                          : "border-surface-border hover:border-primary-300"
                      )}
                    >
                      <Users
                        className={cn(
                          "h-8 w-8",
                          mode === "doubles"
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-text-muted"
                        )}
                      />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-text">Duplas</p>
                        <p className="text-xs text-text-muted">Equipes de 2</p>
                      </div>
                      {mode === "doubles" && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="rounded-lg border border-surface-border bg-surface-muted p-3">
                    <p className="text-xs text-text-muted">
                      <strong>{selectedPlayers.length} jogadores selecionados:</strong>{" "}
                      {selectedPlayers.map((p) => p.nickname).join(", ")}
                    </p>
                  </div>
                </motion.div>
              )}

              {step === "teams" && (
                <motion.div
                  key="teams"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <TeamBuilder
                    players={selectedPlayers}
                    teamAName={teamAName}
                    teamBName={teamBName}
                    onTeamANameChange={setTeamAName}
                    onTeamBNameChange={setTeamBName}
                  />
                </motion.div>
              )}

              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h4 className="text-sm font-medium text-text">Resumo da Partida</h4>

                  <div className="rounded-xl border border-surface-border bg-surface-muted p-4 space-y-3">
                    {matchName && (
                      <div>
                        <p className="text-xs text-text-muted">Nome</p>
                        <p className="text-sm font-semibold text-text">{matchName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-text-muted">Modo</p>
                      <p className="text-sm font-semibold text-text capitalize">
                        {mode === "individual" ? "Individual" : "Duplas"}
                      </p>
                    </div>

                    {mode === "doubles" && teamAName && teamBName && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {teamAName}
                          </p>
                          {selectedPlayers.slice(0, 2).map((p) => (
                            <p key={p.id} className="text-xs text-text-muted">
                              {p.nickname}
                            </p>
                          ))}
                        </div>
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
                          <p className="text-xs font-medium text-red-600 dark:text-red-400">
                            {teamBName}
                          </p>
                          {selectedPlayers.slice(2, 4).map((p) => (
                            <p key={p.id} className="text-xs text-text-muted">
                              {p.nickname}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {mode === "individual" && (
                      <div>
                        <p className="text-xs text-text-muted mb-1">Jogadores</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPlayers.map((p) => (
                            <span
                              key={p.id}
                              className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-text"
                            >
                              {p.nickname}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {(createMatch.isError || startMatch.isError) && (
                    <p className="text-sm text-red-500">
                      Erro ao criar partida. Tente novamente.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-surface-border px-6 py-4">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Voltar
              </Button>
            )}
            {step === "confirm" ? (
              <Button
                onClick={handleStart}
                disabled={createMatch.isPending || startMatch.isPending}
                className="flex-1 bg-primary-600 text-white hover:bg-primary-700"
              >
                {createMatch.isPending || startMatch.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Criando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Iniciar Partida
                  </span>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canNext()}
                className="flex-1 bg-primary-600 text-white hover:bg-primary-700"
              >
                Próximo
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
