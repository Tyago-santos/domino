import { motion } from "framer-motion";
import { ArrowLeftRight, Users } from "lucide-react";
import { Avatar, Button, Input } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { MatchPlayer } from "@/shared/types";

interface TeamBuilderProps {
  players: MatchPlayer[];
  teamAName: string;
  teamBName: string;
  onTeamANameChange: (name: string) => void;
  onTeamBNameChange: (name: string) => void;
  teamAIds: string[];
  teamBIds: string[];
  onTeamAIdsChange: (ids: string[]) => void;
  onTeamBIdsChange: (ids: string[]) => void;
}

export function TeamBuilder({
  players,
  teamAName,
  teamBName,
  onTeamANameChange,
  onTeamBNameChange,
  teamAIds,
  teamBIds,
  onTeamAIdsChange,
  onTeamBIdsChange,
}: TeamBuilderProps) {

  const teamAPlayers = players.filter((p) => teamAIds.includes(p.id));
  const teamBPlayers = players.filter((p) => teamBIds.includes(p.id));
  const unassigned = players.filter(
    (p) => !teamAIds.includes(p.id) && !teamBIds.includes(p.id)
  );

  function moveToA(playerId: string) {
    if (teamAIds.length >= 2) return;
    onTeamBIdsChange(teamBIds.filter((id) => id !== playerId));
    onTeamAIdsChange([...teamAIds, playerId]);
  }

  function moveToB(playerId: string) {
    if (teamBIds.length >= 2) return;
    onTeamAIdsChange(teamAIds.filter((id) => id !== playerId));
    onTeamBIdsChange([...teamBIds, playerId]);
  }

  function swapTeams() {
    onTeamAIdsChange([...teamBIds]);
    onTeamBIdsChange([...teamAIds]);
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-medium text-text sm:text-sm">Montar Equipes</h4>
        <Button variant="outline" size="sm" onClick={swapTeams} className="text-[10px] sm:text-sm">
          <ArrowLeftRight className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
          Trocar equipes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/20 sm:p-4">
          <div className="mb-2 flex items-center gap-2 sm:mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 sm:h-3 sm:w-3" />
            <Input
              placeholder="Nome da equipe"
              value={teamAName}
              onChange={(e) => onTeamANameChange(e.target.value)}
              className="border-blue-200 bg-white text-[10px] font-semibold dark:border-blue-800 dark:bg-blue-950/50 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {teamAPlayers.map((player) => (
              <motion.div
                key={player.id}
                layout
                className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white p-2 dark:border-blue-800 dark:bg-blue-950/30 sm:gap-3 sm:p-2.5"
              >
                <Avatar size="sm" src={player.avatar} fallback={player.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[10px] font-medium text-text sm:text-sm">{player.nickname}</p>
                </div>
                {teamAIds.length > 2 && (
                  <button
                    onClick={() => moveToB(player.id)}
                    className="text-[9px] text-blue-600 hover:text-blue-800 dark:text-blue-400 sm:text-xs"
                  >
                    Mover
                  </button>
                )}
              </motion.div>
            ))}
            {teamAPlayers.length < 2 && (
              <div className="rounded-lg border-2 border-dashed border-blue-300 p-3 text-center dark:border-blue-700 sm:p-4">
                <Users className="mx-auto h-4 w-4 text-blue-400 sm:h-5 sm:w-5" />
                <p className="mt-1 text-[9px] text-blue-500 sm:text-xs">Arraste um jogador aqui</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-3 dark:border-red-800 dark:bg-red-950/20 sm:p-4">
          <div className="mb-2 flex items-center gap-2 sm:mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 sm:h-3 sm:w-3" />
            <Input
              placeholder="Nome da equipe"
              value={teamBName}
              onChange={(e) => onTeamBNameChange(e.target.value)}
              className="border-red-200 bg-white text-[10px] font-semibold dark:border-red-800 dark:bg-red-950/50 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {teamBPlayers.map((player) => (
              <motion.div
                key={player.id}
                layout
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white p-2 dark:border-red-800 dark:bg-red-950/30 sm:gap-3 sm:p-2.5"
              >
                <Avatar size="sm" src={player.avatar} fallback={player.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[10px] font-medium text-text sm:text-sm">{player.nickname}</p>
                </div>
                {teamBIds.length > 2 && (
                  <button
                    onClick={() => moveToA(player.id)}
                    className="text-[9px] text-red-600 hover:text-red-800 dark:text-red-400 sm:text-xs"
                  >
                    Mover
                  </button>
                )}
              </motion.div>
            ))}
            {teamBPlayers.length < 2 && (
              <div className="rounded-lg border-2 border-dashed border-red-300 p-3 text-center dark:border-red-700 sm:p-4">
                <Users className="mx-auto h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
                <p className="mt-1 text-[9px] text-red-500 sm:text-xs">Arraste um jogador aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {unassigned.length > 0 && (
        <div className="rounded-lg border border-surface-border bg-surface-muted p-2 sm:p-3">
          <p className="mb-1.5 text-[9px] font-medium text-text-muted sm:mb-2 sm:text-xs">Jogadores não atribuídos</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {unassigned.map((player) => (
              <button
                key={player.id}
                onClick={() => moveToA(player.id)}
                className="flex items-center gap-1 rounded-full border border-surface-border bg-surface px-2 py-0.5 text-[9px] text-text hover:border-primary-300 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs"
              >
                <Avatar size="xs" src={player.avatar} fallback={player.name} />
                {player.nickname}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[9px] text-text-muted sm:gap-2 sm:text-sm">
        <div
          className={cn(
            "flex items-center gap-1",
            teamAPlayers.length === 2 && "text-blue-600 dark:text-blue-400"
          )}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 sm:h-2 sm:w-2" />
          Equipe A: {teamAPlayers.length}/2
        </div>
        <span>vs</span>
        <div
          className={cn(
            "flex items-center gap-1",
            teamBPlayers.length === 2 && "text-red-600 dark:text-red-400"
          )}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 sm:h-2 sm:w-2" />
          Equipe B: {teamBPlayers.length}/2
        </div>
      </div>
    </div>
  );
}
