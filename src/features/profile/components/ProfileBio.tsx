import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X, Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/shared/lib/utils";

interface ProfileBioProps {
  bio?: string;
  isLoading?: boolean;
}

export function ProfileBio({ bio, isLoading }: ProfileBioProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(bio ?? "");
  const [savedText, setSavedText] = useState(bio ?? "");

  const handleSave = () => {
    setSavedText(text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(savedText);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Biografia</CardTitle>
            {!isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
              >
                {isEditing ? (
                  <>
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-surface-border" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-border" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface-border" />
            </div>
          ) : isEditing ? (
            <div className="space-y-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Escreva algo sobre você..."
                className={cn(
                  "w-full resize-none rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-text",
                  "placeholder:text-text-muted",
                  "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                  "dark:border-surface-border dark:bg-surface dark:text-text"
                )}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Salvar
                </Button>
              </div>
            </div>
          ) : savedText ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
              {savedText}
            </p>
          ) : (
            <p className="py-4 text-center text-sm text-text-muted">
              Nenhuma biografia adicionada.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
