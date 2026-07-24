import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ref, get, update } from "firebase/database";
import { toast } from "sonner";
import { db } from "@/shared/config/firestore";
import { useAuth } from "@/app/providers/AuthProvider";
import { profileSchema, type ProfileFormData } from "../schemas/settingsSchema";

export function useSettings() {
  const { user } = useAuth();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      nickname: "",
      city: "",
      state: "",
      club: "",
      category: "",
      bio: "",
    },
  });

  const loadProfile = async () => {
    if (!user?.uid) return;
    const snap = await get(ref(db, `players/${user.uid}`));
    if (snap.exists()) {
      const d = snap.val();
      form.reset({
        name: d.name || "",
        nickname: d.nickname || "",
        city: d.city || "",
        state: d.state || "",
        club: d.club || "",
        category: d.category || "",
        bio: d.bio || "",
      });
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.uid) return;
    await update(ref(db, `players/${user.uid}`), {
      name: data.name,
      nickname: data.nickname,
      city: data.city,
      state: data.state,
      club: data.club,
      category: data.category,
      bio: data.bio,
    });
    toast.success("Perfil atualizado com sucesso!", {
      description: `${data.name} (${data.nickname})`,
    });
  };

  return { form, onSubmit, loadProfile };
}
