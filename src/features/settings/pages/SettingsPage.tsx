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
      <motion.div variants={item} className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white dark:bg-primary-500 sm:h-10 sm:w-10">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text dark:text-text sm:text-2xl">Configurações</h1>
          <p className="text-[10px] text-text-muted dark:text-text-muted sm:text-sm">Gerencie seu perfil e preferências</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="profile">
          <TabsList className="w-full overflow-x-auto justify-start sm:w-auto">
            <TabsTrigger value="profile" className="text-[10px] sm:text-sm">Perfil</TabsTrigger>
            <TabsTrigger value="appearance" className="text-[10px] sm:text-sm">Aparência</TabsTrigger>
            <TabsTrigger value="notifications" className="text-[10px] sm:text-sm">
              Notificações
              <Badge variant="default" className="ml-1 h-4 px-1 text-[8px] sm:ml-1.5 sm:h-5 sm:px-1.5 sm:text-[10px]">
                4
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="account" className="text-[10px] sm:text-sm">Conta</TabsTrigger>
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
