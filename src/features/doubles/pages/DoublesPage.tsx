import { useState } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, Swords, TrendingUp, UserPlus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, Button } from "@/components/ui";
import { useMyTeam, useTeams, usePartners } from "../hooks/useDoubles";
import { MyTeamSection } from "../components/MyTeamSection";
import { TeamRanking } from "../components/TeamRanking";
import { PartnerCard } from "../components/PartnerCard";
import { DoublesMatchHistory } from "../components/DoublesMatchHistory";
import { DoublesKPICards } from "../components/DoublesKPICards";
import { DoublesCharts } from "../components/DoublesCharts";
import { FormTeamModal } from "../components/FormTeamModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function PartnersSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-surface-border bg-surface p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DoublesPage() {
  const [showFormModal, setShowFormModal] = useState(false);
  const { data: myTeam } = useMyTeam();
  const { data: teams, isLoading: loadingTeams } = useTeams();
  const { data: partners, isLoading: loadingPartners } = usePartners();

  return (
      <motion.div
        className="flex flex-col gap-4 sm:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 sm:h-11 sm:w-11">
            <Users className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text sm:text-2xl">Duplas</h1>
            <p className="text-[10px] text-text-muted sm:text-sm">Jogue em dupla e suba no ranking</p>
          </div>
        </div>

        <Button
          onClick={() => setShowFormModal(true)}
          className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] sm:text-sm"
        >
          <UserPlus className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
          Formar Dupla
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="team">
          <TabsList className="w-full overflow-x-auto sm:w-auto">
            <TabsTrigger value="team" className="gap-1 text-[10px] sm:gap-1.5 sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              Minha Dupla
            </TabsTrigger>
            <TabsTrigger value="ranking" className="gap-1 text-[10px] sm:gap-1.5 sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-1 text-[10px] sm:gap-1.5 sm:text-sm">
              <Swords className="h-3 w-3 sm:h-4 sm:w-4" />
              Partidas
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1 text-[10px] sm:gap-1.5 sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <MyTeamSection />

              <div>
                <h3 className="mb-4 text-lg font-bold text-text dark:text-text">
                  Parceiros
                </h3>
                {loadingPartners ? (
                  <PartnersSkeleton />
                ) : partners && partners.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {partners.map((partner) => (
                      <PartnerCard key={partner.id} partner={partner} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted dark:text-text-muted">
                    Nenhum parceiro encontrado.
                  </p>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="ranking">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TeamRanking
                teams={teams ?? []}
                myTeamId={myTeam?.id}
                isLoading={loadingTeams}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="matches">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DoublesMatchHistory />
            </motion.div>
          </TabsContent>

          <TabsContent value="stats">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <DoublesKPICards />
              <DoublesCharts />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <FormTeamModal open={showFormModal} onClose={() => setShowFormModal(false)} />
    </motion.div>
  );
}
