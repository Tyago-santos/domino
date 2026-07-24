import { useState } from "react";
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
}

export function TeamBuilder({
  players,
  teamAName,
  teamBName,
  onTeamANameChange,
  onTeamBNameChange,
}: TeamBuilderProps) {
  const [teamAIds, setTeamAIds] = useState<string[]>(players.slice(0, 2).map((p) => p.id));
  const [teamBIds, setTeamBIds] = useState<string[]>(players.slice(2, 4).map((p) => p.id));

  const teamAPlayers = players.filter((p) => teamAIds.includes(p.id));
  const teamBPlayers = players.filter((p) => teamBIds.includes(p.id));
  const unassigned = players.filter(
    (p) => !teamAIds.includes(p.id) && !teamBIds.includes(p.id)
  );

  function moveToA(playerId: string) {
    if (teamAIds.length >= 2) return;
    setTeamBIds((prev) => prev.filter((id) => id !== playerId));
    setTeamAIds((prev) => [...prev, playerId]);
  }

  function moveToB(playerId: string) {
    if (teamBIds.length >= 2) return;
    setTeamAIds((prev) => prev.filter((id) => id !== playerId));
    setTeamBIds((prev) => [...prev, playerId]);
  }

  function swapTeams() {
    const tempA = [...teamAIds];
    const tempB = [...teamBIds];
    setTeamAIds(tempB);
    setTeamBIds(tempA);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-text">Montar Equipes</h4>
        <Button variant="outline" size="sm" onClick={swapTeams}>
          <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
          Trocar equipes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <Input
              placeholder="Nome da equipe"
              value={teamAName}
              onChange={(e) => onTeamANameChange(e.target.value)}
              className="border-blue-200 bg-white text-sm font-semibold dark:border-blue-800 dark:bg-blue-950/50"
            />
          </div>
          <div className="space-y-2">
            {teamAPlayers.map((player) => (
              <motion.div
                key={player.id}
                layout
                className="flex items-center gap-3 rounded-lg border border-blue-200 bg-white p-2.5 dark:border-blue-800 dark:bg-blue-950/30"
              >
                <Avatar size="sm" src={player.avatar} fallback={player.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-text">{player.nickname}</p>
                </div>
                {teamAIds.length > 2 && (
                  <button
                    onClick={() => moveToB(player.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Mover
                  </button>
                )}
              </motion.div>
            ))}
            {teamAPlayers.length < 2 && (
              <div className="rounded-lg border-2 border-dashed border-blue-300 p-4 text-center dark:border-blue-700">
                <Users className="mx-auto h-5 w-5 text-blue-400" />
                <p className="mt-1 text-xs text-blue-500">Arraste um jogador aqui</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <Input
              placeholder="Nome da equipe"
              value={teamBName}
              onChange={(e) => onTeamBNameChange(e.target.value)}
              className="border-red-200 bg-white text-sm font-semibold dark:border-red-800 dark:bg-red-950/50"
            />
          </div>
          <div className="space-y-2">
            {teamBPlayers.map((player) => (
              <motion.div
                key={player.id}
                layout
                className="flex items-center gap-3 rounded-lg border border-red-200 bg-white p-2.5 dark:border-red-800 dark:bg-red-950/30"
              >
                <Avatar size="sm" src={player.avatar} fallback={player.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-text">{player.nickname}</p>
                </div>
                {teamBIds.length > 2 && (
                  <button
                    onClick={() => moveToA(player.id)}
                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    Mover
                  </button>
                )}
              </motion.div>
            ))}
            {teamBPlayers.length < 2 && (
              <div className="rounded-lg border-2 border-dashed border-red-300 p-4 text-center dark:border-red-700">
                <Users className="mx-auto h-5 w-5 text-red-400" />
                <p className="mt-1 text-xs text-red-500">Arraste um jogador aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {unassigned.length > 0 && (
        <div className="rounded-lg border border-surface-border bg-surface-muted p-3">
          <p className="mb-2 text-xs font-medium text-text-muted">Jogadores não atribuídos</p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((player) => (
              <button
                key={player.id}
                onClick={() => moveToA(player.id)}
                className="flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-2.5 py-1 text-xs text-text hover:border-primary-300"
              >
                <Avatar size="xs" src={player.avatar} fallback={player.name} />
                {player.nickname}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-text-muted">
        <div
          className={cn(
            "flex items-center gap-1",
            teamAPlayers.length === 2 && "text-blue-600 dark:text-blue-400"
          )}
        >
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          Equipe A: {teamAPlayers.length}/2
        </div>
        <span>vs</span>
        <div
          className={cn(
            "flex items-center gap-1",
            teamBPlayers.length === 2 && "text-red-600 dark:text-red-400"
          )}
        >
          <div className="h-2 w-2 rounded-full bg-red-500" />
          Equipe B: {teamBPlayers.length}/2
        </div>
      </div>
    </div>
  );
}
