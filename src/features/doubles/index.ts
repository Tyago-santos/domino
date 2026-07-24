export { default as DoublesPage } from "./pages/DoublesPage";

export { TeamCard } from "./components/TeamCard";
export { TeamRanking } from "./components/TeamRanking";
export { PartnerCard } from "./components/PartnerCard";
export { DoublesKPICards } from "./components/DoublesKPICards";
export { DoublesMatchHistory } from "./components/DoublesMatchHistory";
export { DoublesCharts } from "./components/DoublesCharts";
export { MyTeamSection } from "./components/MyTeamSection";
export { FormTeamModal } from "./components/FormTeamModal";

export {
  useMyTeam,
  useTeams,
  useDoublesStats,
  useDoublesMatchHistory,
  usePartners,
  useDoublesChartData,
  useAvailablePlayers,
  useCreateTeam,
  useSendInvitation,
  useInvitations,
} from "./hooks/useDoubles";
