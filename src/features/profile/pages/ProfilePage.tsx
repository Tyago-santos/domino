import { motion, AnimatePresence } from "framer-motion";
import { User, BarChart3, Award, History } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { usePlayer, usePlayerStats } from "../hooks/useProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStats } from "../components/ProfileStats";
import { ProfileAchievements } from "../components/ProfileAchievements";
import { ProfileBio } from "../components/ProfileBio";

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

function MatchHistoryPlaceholder() {
  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Partidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                date: "22/07/2026",
                opponent: "Carlos Silva",
                result: "win" as const,
                score: "2 x 0",
              },
              {
                date: "21/07/2026",
                opponent: "Maria Oliveira",
                result: "loss" as const,
                score: "1 x 2",
              },
              {
                date: "20/07/2026",
                opponent: "João Pereira",
                result: "win" as const,
                score: "2 x 1",
              },
              {
                date: "19/07/2026",
                opponent: "Ana Santos",
                result: "win" as const,
                score: "2 x 0",
              },
              {
                date: "18/07/2026",
                opponent: "Pedro Lima",
                result: "loss" as const,
                score: "0 x 2",
              },
            ].map((match, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-surface-border p-4 transition-colors hover:bg-surface-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      match.result === "win" ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-text">
                      vs. {match.opponent}
                    </p>
                    <p className="text-xs text-text-muted">{match.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-text">
                    {match.score}
                  </span>
                  <Badge
                    variant={match.result === "win" ? "success" : "destructive"}
                    className="text-[10px]"
                  >
                    {match.result === "win" ? "Vitória" : "Derrota"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ProfilePage() {
  const { data: player, isLoading: playerLoading } = usePlayer();
  const { data: stats, isLoading: statsLoading } = usePlayerStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <ProfileHeader
        player={player}
        isLoading={playerLoading}
        onEdit={() => {}}
      />

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">
            <User className="mr-1.5 h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-1.5 h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="mr-1.5 h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-1.5 h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="overview">
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <ProfileBio bio={player?.bio} isLoading={playerLoading} />

              {stats && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Resumo Rápido
                      </CardTitle>
                      <Badge variant="secondary">
                        Ranking #{stats.ranking}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-text">
                          {stats.totalMatches}
                        </p>
                        <p className="text-xs text-text-muted">
                          Partidas
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {stats.wins}
                        </p>
                        <p className="text-xs text-text-muted">Vitórias</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {stats.losses}
                        </p>
                        <p className="text-xs text-text-muted">Derrotas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {stats.winRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-text-muted">
                          Taxa de Vitória
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <ProfileAchievements />
            </motion.div>
          </TabsContent>

          <TabsContent value="stats">
            <ProfileStats stats={stats} isLoading={statsLoading} />
          </TabsContent>

          <TabsContent value="achievements">
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
            >
              <ProfileAchievements />
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <MatchHistoryPlaceholder />
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}
