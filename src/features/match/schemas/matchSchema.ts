import { z } from "zod";

export const createMatchSchema = z.object({
  name: z.string().max(50, "Nome deve ter no máximo 50 caracteres").optional(),
  mode: z.enum(["individual", "doubles"]),
  playerCount: z.enum(["2", "3", "4"]),
  selectedPlayerIds: z.array(z.string()).min(2, "Selecione pelo menos 2 jogadores"),
  teamAName: z.string().min(1, "Nome da equipe A é obrigatório").optional(),
  teamBName: z.string().min(1, "Nome da equipe B é obrigatório").optional(),
  teamAPlayerIds: z.array(z.string()).optional(),
  teamBPlayerIds: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.mode === "doubles") {
      return data.playerCount === "4";
    }
    return true;
  },
  { message: "Partidas em dupla exigem 4 jogadores", path: ["playerCount"] }
).refine(
  (data) => {
    if (data.mode === "doubles") {
      return (data.teamAPlayerIds?.length === 2) && (data.teamBPlayerIds?.length === 2);
    }
    return true;
  },
  { message: "Cada equipe deve ter exatamente 2 jogadores", path: ["teamAPlayerIds"] }
);

export type CreateMatchFormData = z.infer<typeof createMatchSchema>;
