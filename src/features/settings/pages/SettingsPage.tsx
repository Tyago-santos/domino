import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "@/components/ui";
import { ProfileForm } from "../components/ProfileForm";
import { ThemeSettings } from "../components/ThemeSettings";
import { NotificationSettings } from "../components/NotificationSettings";
import { AccountSettings } from "../components/AccountSettings";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white dark:bg-primary-500">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text">Configurações</h1>
          <p className="text-sm text-text-muted dark:text-text-muted">Gerencie seu perfil e preferências</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="profile">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="notifications">
              Notificações
              <Badge variant="default" className="ml-1.5 h-5 px-1.5 text-[10px]">
                4
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div variants={item}>
              <ProfileForm />
            </motion.div>
          </TabsContent>

          <TabsContent value="appearance">
            <motion.div variants={item}>
              <ThemeSettings />
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div variants={item}>
              <NotificationSettings />
            </motion.div>
          </TabsContent>

          <TabsContent value="account">
            <motion.div variants={item}>
              <AccountSettings />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
