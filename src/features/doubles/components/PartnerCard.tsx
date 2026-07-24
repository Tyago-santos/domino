import { motion } from "framer-motion";
import { TrendingUp, Users } from "lucide-react";
import { Card, Avatar, Progress } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import type { Partner } from "@/shared/types";

interface PartnerCardProps {
  partner: Partner;
}

function getSynergyColor(synergy: number): string {
  if (synergy > 70) return "text-emerald-600 dark:text-emerald-400";
  if (synergy >= 50) return "text-amber-500 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function getSynergyBg(synergy: number): string {
  if (synergy > 70) return "bg-emerald-50 dark:bg-emerald-950/20";
  if (synergy >= 50) return "bg-amber-50 dark:bg-amber-950/20";
  return "bg-red-50 dark:bg-red-950/20";
}

function CircularSynergy({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = getSynergyColor(value);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-surface-border dark:text-surface-border"
        />
        <motion.circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={color}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-lg font-bold", color)}>
          {value}%
        </span>
        <span className="text-[9px] text-text-muted dark:text-text-muted">
          Sinergia
        </span>
      </div>
    </div>
  );
}

export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden">
        <div className="p-5">
          <div className="mb-4 flex items-center gap-4">
            <Avatar size="lg" src={partner.avatar} fallback={partner.name} />
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-text dark:text-text">
                {partner.name}
              </p>
              <p className="text-sm text-text-muted dark:text-text-muted">
                @{partner.nickname}
              </p>
            </div>
            <CircularSynergy value={partner.synergy} />
          </div>

          <div className={cn("mb-4 rounded-lg p-3", getSynergyBg(partner.synergy))}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted dark:text-text-muted">
                Força da Parceria
              </span>
              <span className={cn("text-xs font-bold", getSynergyColor(partner.synergy))}>
                {partner.synergy > 70
                  ? "Excelente"
                  : partner.synergy >= 50
                    ? "Boa"
                    : "Precisa melhorar"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-text dark:text-text">
                <Users className="h-3.5 w-3.5 text-text-muted" />
                {partner.matchesPlayed}
              </p>
              <p className="text-[10px] text-text-muted dark:text-text-muted">
                Partidas
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {partner.wins}
              </p>
              <p className="text-[10px] text-text-muted dark:text-text-muted">
                Vitórias
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-500 dark:text-red-400">
                {partner.losses}
              </p>
              <p className="text-[10px] text-text-muted dark:text-text-muted">
                Derrotas
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-text-muted dark:text-text-muted" />
            <span className="text-xs text-text-muted dark:text-text-muted">
              Taxa de vitória:
            </span>
            <Progress
              value={partner.winRate}
              className="h-1.5 flex-1"
              indicatorClassName="bg-emerald-500 dark:bg-emerald-400"
            />
            <span className="text-xs font-semibold text-text dark:text-text">
              {partner.winRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
