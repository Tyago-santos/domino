import { motion } from "framer-motion";
import { MapPin, Building2, Trophy, Calendar, Pencil } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/shared/lib/utils";
import type { Player } from "@/shared/types";

interface ProfileHeaderProps {
  player: Player | undefined;
  isLoading: boolean;
  onEdit?: () => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ProfileHeaderSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <Skeleton className="mx-auto h-7 w-48 sm:mx-0" />
            <Skeleton className="mx-auto h-5 w-32 sm:mx-0" />
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileHeader({ player, isLoading, onEdit }: ProfileHeaderProps) {
  if (isLoading) return <ProfileHeaderSkeleton />;
  if (!player) return null;

  const rankLabel =
    player.ranking <= 3
      ? "Top 3"
      : player.ranking <= 10
        ? "Top 10"
        : `#${player.ranking}`;

  const rankVariant =
    player.ranking <= 3
      ? "default"
      : player.ranking <= 10
        ? "success"
        : "secondary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Avatar
                src={player.avatar}
                alt={player.name}
                fallback={player.name}
                size="xl"
                className="h-24 w-24 border-4 border-primary-100 dark:border-primary-900"
              />
            </motion.div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-text">
                    {player.name}
                  </h1>
                  {player.nickname && (
                    <p className="text-base text-text-muted">
                      &ldquo;{player.nickname}&rdquo;
                    </p>
                  )}
                </div>
                <Badge variant={rankVariant as "default" | "secondary" | "success"} className="w-fit">
                  <Trophy className="mr-1 h-3 w-3" />
                  {rankLabel}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {player.city}, {player.state}
                </span>
                <span className="text-text-muted">·</span>
                <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                  <Building2 className="h-3.5 w-3.5" />
                  {player.club}
                </span>
                <span className="text-text-muted">·</span>
                <Badge variant="outline" className="text-xs">
                  {player.category}
                </Badge>
              </div>

              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-text-muted sm:justify-start">
                <Calendar className="h-3 w-3" />
                Membro desde {formatDate(player.registrationDate)}
              </div>
            </div>

            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className={cn(
                  "shrink-0",
                  "self-center sm:self-start"
                )}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
