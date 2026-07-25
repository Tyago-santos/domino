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
            className="relative z-10 mx-0 flex h-full w-full flex-col overflow-hidden rounded-none border-0 border-surface-border bg-surface shadow-2xl sm:mx-4 sm:h-auto sm:max-w-sm sm:rounded-2xl sm:border"
          >
            <div className="flex flex-col items-center gap-3 p-4 text-center sm:gap-4 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40 sm:h-14 sm:w-14">
                <img src="/logo.png" alt="Domino Vittas" className="h-7 w-7 rounded-lg object-contain sm:h-10 sm:w-10" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-text sm:text-lg">Confirmar Vitória</h3>
                <p className="mt-1 text-[10px] text-text-muted sm:text-sm">
                  Deseja confirmar sua vitória, <strong>{playerName}</strong>?
                </p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-surface-border px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isConfirming}
                className="flex-1 text-[10px] sm:text-sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isConfirming}
                className="flex-1 bg-primary-600 text-white hover:bg-primary-700 text-[10px] sm:text-sm"
              >
                {isConfirming ? (
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-4 sm:w-4" />
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
