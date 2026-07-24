import { Sun, Moon, Monitor } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui";
import { cn } from "@/shared/lib/utils";
import { useTheme } from "@/app/providers/ThemeProvider";

type ThemeOption = "light" | "dark";

interface ThemeCardProps {
  label: string;
  value: ThemeOption;
  icon: React.ReactNode;
  preview: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeCard({ label, icon, preview, isSelected, onSelect }: ThemeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all",
        isSelected
          ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
          : "border-surface-border bg-surface hover:border-primary-300 dark:border-surface-border dark:bg-surface"
      )}
    >
      {preview}
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-text dark:text-text">{label}</span>
      </div>
      {isSelected && (
        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Selecionado</span>
      )}
    </button>
  );
}

function LightPreview() {
  return (
    <div className="h-20 w-32 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
      <div className="mb-1 h-2 w-12 rounded bg-emerald-500" />
      <div className="mb-1 h-1.5 w-20 rounded bg-slate-200" />
      <div className="h-1.5 w-16 rounded bg-slate-100" />
    </div>
  );
}

function DarkPreview() {
  return (
    <div className="h-20 w-32 rounded-md border border-slate-700 bg-slate-900 p-2 shadow-sm">
      <div className="mb-1 h-2 w-12 rounded bg-emerald-400" />
      <div className="mb-1 h-1.5 w-20 rounded bg-slate-700" />
      <div className="h-1.5 w-16 rounded bg-slate-800" />
    </div>
  );
}

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>Escolha o tema da aplicação</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ThemeCard
            label="Claro"
            value="light"
            icon={<Sun className="h-4 w-4 text-amber-500" />}
            preview={<LightPreview />}
            isSelected={theme === "light"}
            onSelect={() => setTheme("light")}
          />
          <ThemeCard
            label="Escuro"
            value="dark"
            icon={<Moon className="h-4 w-4 text-blue-400" />}
            preview={<DarkPreview />}
            isSelected={theme === "dark"}
            onSelect={() => setTheme("dark")}
          />
          <ThemeCard
            label="Sistema"
            value="dark"
            icon={<Monitor className="h-4 w-4 text-text-muted" />}
            preview={
              <div className="flex h-20 w-32 overflow-hidden rounded-md border border-surface-border">
                <div className="w-1/2 bg-white" />
                <div className="w-1/2 bg-slate-900" />
              </div>
            }
            isSelected={false}
            onSelect={() => {}}
          />
        </div>
      </CardContent>
    </Card>
  );
}
