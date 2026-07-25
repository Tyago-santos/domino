import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Loader2, AlertCircle } from 'lucide-react';
import { Card, Button, StatCard } from '@/components/ui';
import { useRanking } from '../hooks/useRanking';
import { RankingFilters } from '../components/RankingFilters';
import { RankingTable } from '../components/RankingTable';
import { useAuth } from '@/app/providers/AuthProvider';

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

export default function RankingPage() {
  const { user } = useAuth();
  const { data: ranking, isLoading, error, refetch, isFetching } = useRanking();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [club, setClub] = useState('');

  const cities = useMemo(() => {
    if (!ranking) return [];
    return [...new Set(ranking.map((e) => e.city))].sort();
  }, [ranking]);

  const clubs = useMemo(() => {
    if (!ranking) return [];
    return [...new Set(ranking.map((e) => e.club))].sort();
  }, [ranking]);

  const filtered = useMemo(() => {
    if (!ranking) return [];
    return ranking.filter((entry) => {
      const matchSearch =
        !search ||
        entry.playerName.toLowerCase().includes(search.toLowerCase());
      const matchCity = !city || entry.city === city;
      const matchClub = !club || entry.club === club;
      return matchSearch && matchCity && matchClub;
    });
  }, [ranking, search, city, club]);

  const top3 = useMemo(() => {
    if (!ranking) return [];
    return ranking.slice(0, 3);
  }, [ranking]);

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
            <Trophy className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Top Farmadores de Auréa</h1>
            <p className="text-sm text-text-muted">Classificação dos jogadores por pontuação</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Atualizar
        </Button>
      </motion.div>

      {top3.length >= 3 && (
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="1º Lugar"
            value={top3[0]!.playerName}
            trend="up"
            trendValue={`${top3[0]!.wins} pts`}
          />
          <StatCard
            label="2º Lugar"
            value={top3[1]!.playerName}
            trend="up"
            trendValue={`${top3[1]!.wins} pts`}
          />
          <StatCard
            label="3º Lugar"
            value={top3[2]!.playerName}
            trend="neutral"
            trendValue={`${top3[2]!.wins} pts`}
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <RankingFilters
          search={search}
          onSearchChange={setSearch}
          city={city}
          onCityChange={setCity}
          club={club}
          onClubChange={setClub}
          cities={cities}
          clubs={clubs}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading ? (
          <Card className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary-500" />
            <p className="text-sm text-text-muted">Carregando ranking...</p>
          </Card>
        ) : error ? (
          <Card className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
            <p className="text-sm text-text-muted mb-3">
              Erro ao carregar o ranking.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </Card>
        ) : (
          <RankingTable entries={filtered} currentUserId={user?.uid} />
        )}
      </motion.div>
    </motion.div>
  );
}
