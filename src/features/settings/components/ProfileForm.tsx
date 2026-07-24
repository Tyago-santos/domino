import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui";
import { Input, Select, Button } from "@/components/ui";
import { useSettings } from "../hooks/useSettings";

const stateOptions = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const categoryOptions = [
  { value: "Iniciante", label: "Iniciante" },
  { value: "Intermediário", label: "Intermediário" },
  { value: "Avançado", label: "Avançado" },
  { value: "Profissional", label: "Profissional" },
];

export function ProfileForm() {
  const { form, onSubmit, loadProfile } = useSettings();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardDescription>Atualize suas informações pessoais</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Nome" placeholder="Seu nome completo" error={errors.name?.message} {...register("name")} />
            <Input label="Apelido" placeholder="Como é chamado" error={errors.nickname?.message} {...register("nickname")} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Cidade" placeholder="Sua cidade" error={errors.city?.message} {...register("city")} />
            <Select label="Estado" options={stateOptions} placeholder="Selecione" error={errors.state?.message} {...register("state")} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Clube" placeholder="Seu clube" {...register("club")} />
            <Select label="Categoria" options={categoryOptions} placeholder="Selecione" {...register("category")} />
          </div>
          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-text dark:text-text">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              maxLength={500}
              placeholder="Conte um pouco sobre você..."
              className="flex w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 dark:border-surface-border dark:bg-surface dark:text-text"
              {...register("bio")}
            />
            {errors.bio && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.bio.message}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
