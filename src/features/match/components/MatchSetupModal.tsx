import { useState, useEffect } from "react";
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
import { useAllPlayers, useCreateMatch, useStartMatch, useMyTeam } from "../hooks/useMatch";
import type { MatchMode, PlayerCount, MatchPlayer } from "@/shared/types";

interface MatchSetupModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "players" | "mode" | "teams" | "confirm";

function getSteps(playerCount: PlayerCount, mode: MatchMode): { key: Step; label: string }[] {
  const steps: { key: Step; label: string }[] = [
    { key: "players", label: "Jogadores" },
  ];
  if (playerCount === 4) {
    steps.push({ key: "mode", label: "Modo" });
  }
  if (playerCount === 4 && mode === "doubles") {
    steps.push({ key: "teams", label: "Equipes" });
  }
  steps.push({ key: "confirm", label: "Confirmar" });
  return steps;
}

export function MatchSetupModal({ open, onClose }: MatchSetupModalProps) {
  const [step, setStep] = useState<Step>("players");
  const [mode, setMode] = useState<MatchMode>("individual");
  const [playerCount, setPlayerCount] = useState<PlayerCount>(2);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [matchName, setMatchName] = useState("");
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [teamAIds, setTeamAIds] = useState<string[]>([]);
  const [teamBIds, setTeamBIds] = useState<string[]>([]);

  const { data: allPlayers, isLoading: loadingPlayers } = useAllPlayers();
  const { data: myTeam } = useMyTeam();
  const createMatch = useCreateMatch();
  const startMatch = useStartMatch();

  const selectedPlayers: MatchPlayer[] = allPlayers?.filter((p: MatchPlayer) => selectedIds.includes(p.id)) ?? [];

  const steps = getSteps(playerCount, mode);
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  function initDoublesTeams() {
    const ids = selectedIds;
    if (ids.length !== 4) return;

    if (myTeam) {
      const teammateIds = [myTeam.player1.id, myTeam.player2.id];
      const myTeammatesSelected = ids.filter((id) => teammateIds.includes(id));
      if (myTeammatesSelected.length === 2) {
        setTeamAName(myTeam.name);
        setTeamBName("Equipe B");
        setTeamAIds(myTeammatesSelected);
        setTeamBIds(ids.filter((id) => !teammateIds.includes(id)));
        return;
      }
    }

    setTeamAIds(ids.slice(0, 2));
    setTeamBIds(ids.slice(2, 4));
    setTeamAName("");
    setTeamBName("");
  }

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
      setTeamAIds([]);
      setTeamBIds([]);
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
      const next = steps[idx + 1]!.key;
      if (next === "teams") initDoublesTeams();
      setStep(next);
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

    createMatch.mutate(
      {
        name: matchName,
        mode,
        playerCount: playerCountNum,
        players: selectedPlayers,
        teamA:
          mode === "doubles"
            ? { name: teamAName, playerIds: teamAIds }
            : undefined,
        teamB:
          mode === "doubles"
            ? { name: teamBName, playerIds: teamBIds }
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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const totalSteps = steps.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
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
          className="relative z-10 mx-0 flex h-full max-h-full w-full flex-col overflow-hidden rounded-none border-0 border-surface-border bg-surface shadow-2xl sm:mx-4 sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl sm:border md:max-w-2xl lg:max-w-3xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-border px-3 py-2 sm:px-6 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40 sm:h-10 sm:w-10 sm:rounded-xl">
                <Swords className="h-4 w-4 text-primary-600 dark:text-primary-400 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-text sm:text-lg">Nova Partida</h3>
                <p className="text-[9px] text-text-muted sm:text-xs">
                  Passo {currentStepIndex + 1} de {totalSteps}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-muted hover:text-text sm:p-2"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex gap-1 px-3 pt-2 sm:px-6 sm:pt-4">
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
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <AnimatePresence mode="wait">
              {step === "players" && (
                <motion.div
                  key="players"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-2 sm:space-y-4"
                >
                  {myTeam && (
                    <button
                      onClick={() => {
                        setPlayerCount(4);
                        setMode("doubles");
                        const teammateIds = [myTeam.player1.id, myTeam.player2.id];
                        const alreadySelected = selectedIds.filter(
                          (id) => !teammateIds.includes(id)
                        );
                        const newIds = [...teammateIds, ...alreadySelected].slice(0, 4);
                        setSelectedIds(newIds);
                      }}
                      className="w-full rounded-lg border-2 border-primary-200 bg-primary-50 p-2.5 text-left transition-all hover:border-primary-400 hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/30 dark:hover:border-primary-600 sm:rounded-xl sm:p-4"
                    >
                      <p className="text-[10px] font-bold text-primary-700 dark:text-primary-300 sm:text-sm">
                        Usar minha dupla: {myTeam.name}
                      </p>
                      <p className="mt-0.5 text-[9px] text-primary-600/70 dark:text-primary-400/70 sm:text-xs">
                        {myTeam.player1.nickname} & {myTeam.player2.nickname}
                      </p>
                    </button>
                  )}

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] font-medium text-text sm:text-sm">
                      Número de Jogadores
                    </label>
                    <div className="flex gap-1.5 sm:gap-2">
                      {([2, 3, 4] as const).map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            setPlayerCount(n);
                            setMode("individual");
                            setSelectedIds((prev) => prev.slice(0, n));
                          }}
                          className={cn(
                            "flex-1 rounded-lg border-2 py-1.5 text-[10px] font-medium transition-all sm:py-2.5 sm:text-sm",
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
                      <p className="text-[9px] text-text-muted sm:text-xs">
                        Com 4 jogadores você pode jogar individual ou em duplas
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-text sm:text-sm">
                      Nome da Partida{" "}
                      <span className="text-text-muted font-normal">(opcional)</span>
                    </label>
                    <Input
                      placeholder="Ex: Partida amigável"
                      value={matchName}
                      onChange={(e) => setMatchName(e.target.value)}
                      className="mt-1 text-[10px] sm:text-sm"
                    />
                  </div>

                  <div>
                    <h4 className="mb-1.5 text-[10px] font-medium text-text sm:mb-2 sm:text-sm">
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
                  <h4 className="text-[10px] font-medium text-text sm:text-sm">Como quer jogar?</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => setMode("individual")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all sm:rounded-xl sm:gap-3 sm:p-5",
                        mode === "individual"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                          : "border-surface-border hover:border-primary-300"
                      )}
                    >
                      <User
                        className={cn(
                          "h-6 w-6 sm:h-8 sm:w-8",
                          mode === "individual"
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-text-muted"
                        )}
                      />
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-text sm:text-sm">Individual</p>
                        <p className="text-[9px] text-text-muted sm:text-xs">Cada um por si</p>
                      </div>
                      {mode === "individual" && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 sm:h-5 sm:w-5">
                          <Check className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setMode("doubles")}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all sm:rounded-xl sm:gap-3 sm:p-5",
                        mode === "doubles"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                          : "border-surface-border hover:border-primary-300"
                      )}
                    >
                      <Users
                        className={cn(
                          "h-6 w-6 sm:h-8 sm:w-8",
                          mode === "doubles"
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-text-muted"
                        )}
                      />
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-text sm:text-sm">Duplas</p>
                        <p className="text-[9px] text-text-muted sm:text-xs">Equipes de 2</p>
                      </div>
                      {mode === "doubles" && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 sm:h-5 sm:w-5">
                          <Check className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="rounded-lg border border-surface-border bg-surface-muted p-2 sm:p-3">
                    <p className="text-[9px] text-text-muted sm:text-xs">
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
                    teamAIds={teamAIds}
                    teamBIds={teamBIds}
                    onTeamAIdsChange={setTeamAIds}
                    onTeamBIdsChange={setTeamBIds}
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
                  <h4 className="text-[10px] font-medium text-text sm:text-sm">Resumo da Partida</h4>

                  <div className="rounded-lg border border-surface-border bg-surface-muted p-2.5 space-y-2 sm:rounded-xl sm:p-4 sm:space-y-3">
                    {matchName && (
                      <div>
                        <p className="text-[9px] text-text-muted sm:text-xs">Nome</p>
                        <p className="text-[10px] font-semibold text-text sm:text-sm">{matchName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] text-text-muted sm:text-xs">Modo</p>
                      <p className="text-[10px] font-semibold text-text capitalize sm:text-sm">
                        {mode === "individual" ? "Individual" : "Duplas"}
                      </p>
                    </div>

                    {mode === "doubles" && teamAName && teamBName && (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-950/20 sm:p-3">
                          <p className="text-[9px] font-medium text-blue-600 dark:text-blue-400 sm:text-xs">
                            {teamAName}
                          </p>
                          {selectedPlayers.filter((p) => teamAIds.includes(p.id)).map((p) => (
                            <p key={p.id} className="text-[9px] text-text-muted sm:text-xs">
                              {p.nickname}
                            </p>
                          ))}
                        </div>
                        <div className="rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-950/20 sm:p-3">
                          <p className="text-[9px] font-medium text-red-600 dark:text-red-400 sm:text-xs">
                            {teamBName}
                          </p>
                          {selectedPlayers.filter((p) => teamBIds.includes(p.id)).map((p) => (
                            <p key={p.id} className="text-[9px] text-text-muted sm:text-xs">
                              {p.nickname}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {mode === "individual" && (
                      <div>
                        <p className="text-[9px] text-text-muted mb-1 sm:text-xs">Jogadores</p>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {selectedPlayers.map((p) => (
                            <span
                              key={p.id}
                              className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text sm:px-2.5 sm:text-xs"
                            >
                              {p.nickname}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {(createMatch.isError || startMatch.isError) && (
                    <p className="text-[10px] text-red-500 sm:text-sm">
                      Erro ao criar partida. Tente novamente.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex gap-2 border-t border-surface-border px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-4">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={prevStep} className="flex-1 text-[10px] sm:text-sm">
                <ArrowLeft className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
                Voltar
              </Button>
            )}
            {step === "confirm" ? (
              <Button
                onClick={handleStart}
                disabled={createMatch.isPending || startMatch.isPending}
                className="flex-1 bg-primary-600 text-white hover:bg-primary-700 text-[10px] sm:text-sm"
              >
                {createMatch.isPending || startMatch.isPending ? (
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-4 sm:w-4" />
                    Criando...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                    Iniciar Partida
                  </span>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canNext()}
                className="flex-1 bg-primary-600 text-white hover:bg-primary-700 text-[10px] sm:text-sm"
              >
                Próximo
                <ArrowRight className="ml-1 h-3 w-3 sm:ml-1.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
