import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-muted"
        >
          <span className="text-5xl font-bold text-text-muted">404</span>
        </motion.div>

        <h1 className="mb-2 text-2xl font-bold text-text sm:text-3xl">
          Página não encontrada
        </h1>
        <p className="mb-8 max-w-md text-sm text-text-muted sm:text-base">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <Home className="mr-2 h-4 w-4" />
            Início
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
