import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";

interface VictoryConfirmModalProps {
  open: boolean;
  playerName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export function VictoryConfirmModal({
  open,
  playerName,
  onConfirm,
  onCancel,
  isConfirming,
}: VictoryConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-2xl"
          >
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
                <img src="/logo.png" alt="Domino Vittas" className="h-10 w-10 rounded-lg object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">Confirmar Vitória</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Deseja confirmar sua vitória, <strong>{playerName}</strong>?
                </p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-surface-border px-6 py-4">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isConfirming}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isConfirming}
                className="flex-1 bg-primary-600 text-white hover:bg-primary-700"
              >
                {isConfirming ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Confirmando...
                  </span>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
