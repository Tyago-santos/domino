import { useState } from "react";
import { Settings, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button } from "@/components/ui";
import { Input } from "@/components/ui";

export function AccountSettings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conta</CardTitle>
        <CardDescription>Gerencie sua conta e segurança</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-text dark:text-text">
            <Settings className="h-4 w-4" />
            E-mail
          </h4>
          <Input label="E-mail" type="email" placeholder="seu@email.com" defaultValue="joao@email.com" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("E-mail atualizado com sucesso!")}
          >
            Atualizar E-mail
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-text dark:text-text">
            <Shield className="h-4 w-4" />
            Alterar Senha
          </h4>
          <Input label="Senha Atual" type="password" placeholder="Digite sua senha atual" />
          <Input label="Nova Senha" type="password" placeholder="Digite a nova senha" />
          <Input label="Confirmar Senha" type="password" placeholder="Confirme a nova senha" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Senha alterada com sucesso!")}
          >
            Alterar Senha
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-red-500 dark:text-red-400">
            <Trash2 className="h-4 w-4" />
            Zona de Perigo
          </h4>
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Excluir Conta
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-300 p-4 dark:border-red-800">
              <p className="text-sm text-text dark:text-text">
                Tem certeza? Esta ação é irreversível e todos os seus dados serão perdidos.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    toast.success("Conta excluída com sucesso.");
                    setShowDeleteConfirm(false);
                  }}
                >
                  Sim, excluir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
