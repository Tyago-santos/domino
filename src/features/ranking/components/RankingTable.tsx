import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Medal } from 'lucide-react';
import { Avatar, Progress, Card } from '@/components/ui';
import { cn } from '@/shared/lib/utils';
import type { RankingEntry } from '@/shared/types';

interface RankingTableProps {
  entries: RankingEntry[];
  currentUserId?: string;
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
        <Trophy className="h-5 w-5 text-amber-500" />
      </div>
    );
  }
  if (position === 2) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
        <Medal className="h-5 w-5 text-slate-400" />
      </div>
    );
  }
  if (position === 3) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
        <Medal className="h-5 w-5 text-orange-400" />
      </div>
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center text-sm font-semibold text-text-muted">
      {position}
    </span>
  );
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') {
    return (
      <div className="flex items-center gap-1 text-emerald-500">
        <TrendingUp className="h-4 w-4" />
      </div>
    );
  }
  if (trend === 'down') {
    return (
      <div className="flex items-center gap-1 text-red-500">
        <TrendingDown className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-text-muted">
      <Minus className="h-4 w-4" />
    </div>
  );
}

function WinRateBar({ rate }: { rate: number }) {
  const percentage = Math.round(rate * 100);
  return (
    <div className="flex items-center gap-2">
      <Progress value={percentage} className="h-2 w-16" />
      <span className="text-xs font-medium text-text-muted whitespace-nowrap">
        {percentage}%
      </span>
    </div>
  );
}

export function RankingTable({ entries, currentUserId }: RankingTableProps) {
  return (
    <Card className="overflow-hidden">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block md:overflow-visible">
        <div className="grid grid-cols-[3rem_1fr_1fr_1fr_3.5rem_8rem_2.5rem_2.5rem_1.5rem] items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          <span className="text-center">#</span>
          <span>Jogador</span>
          <span>Cidade</span>
          <span>Clube</span>
          <span className="text-right">Pts</span>
          <span>Aproveit.</span>
          <span className="text-center">Vit.</span>
          <span className="text-center">Der.</span>
          <span className="text-center">Trend</span>
        </div>
        <div className="divide-y divide-surface-border">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.playerId === currentUserId;
            return (
              <motion.div
                key={entry.playerId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className={cn(
                  'grid grid-cols-[3rem_1fr_1fr_1fr_3.5rem_8rem_2.5rem_2.5rem_1.5rem] items-center gap-3 px-4 py-3',
                  isCurrentUser
                    ? 'bg-emerald-50/70 dark:bg-emerald-900/20 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800'
                    : 'hover:bg-surface-muted/50'
                )}
              >
                <div className="flex justify-center">
                  <PositionBadge position={entry.position} />
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={entry.avatar} alt={entry.playerName} fallback={entry.playerName} size="sm" />
                  <div className="min-w-0">
                    <p className={cn('truncate text-sm font-medium', isCurrentUser ? 'text-emerald-700 dark:text-emerald-300' : 'text-text')}>
                      {entry.playerName}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-text-muted truncate">{entry.city}</span>
                <span className="text-sm text-text-muted truncate">{entry.club}</span>
                <span className="text-right text-sm font-bold tabular-nums text-text">{entry.wins}</span>
                <WinRateBar rate={entry.winRate} />
                <span className="text-center text-sm font-medium tabular-nums text-emerald-600 dark:text-emerald-400">{entry.wins}</span>
                <span className="text-center text-sm font-medium tabular-nums text-red-500">{entry.losses}</span>
                <div className="flex justify-center"><TrendIndicator trend={entry.trend} /></div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 p-3 sm:hidden">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.playerId === currentUserId;
          return (
            <motion.div
              key={entry.playerId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className={cn(
                'rounded-lg border border-surface-border p-3 dark:border-surface-border',
                isCurrentUser
                  ? 'bg-emerald-50/70 dark:bg-emerald-900/20 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800'
                  : 'bg-surface-muted/50 dark:bg-surface-muted/50'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PositionBadge position={entry.position} />
                  <Avatar src={entry.avatar} alt={entry.playerName} fallback={entry.playerName} size="sm" />
                  <div>
                    <p className={cn('text-sm font-medium', isCurrentUser ? 'text-emerald-700 dark:text-emerald-300' : 'text-text')}>
                      {entry.playerName}
                    </p>
                    <p className="text-xs text-text-muted">{entry.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums text-text">{entry.wins}</p>
                  <TrendIndicator trend={entry.trend} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <WinRateBar rate={entry.winRate} />
                <span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{entry.wins}V</span>
                  {' / '}
                  <span className="font-medium text-red-500">{entry.losses}D</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Trophy className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm">Nenhum jogador encontrado com os filtros selecionados.</p>
        </div>
      )}
    </Card>
  );
}
