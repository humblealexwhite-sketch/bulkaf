import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/setup");

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-3xl font-bold">
            BULK<span className="text-accent">AF</span>
          </h1>
          <Link href="/dashboard" className="text-muted text-[11px] uppercase tracking-wide underline underline-offset-2">
            Zurück
          </Link>
        </div>
        <p className="text-muted text-xs uppercase tracking-widest mb-8">Mein Profil</p>

        <ProfileForm
          profile={{
            name: profile.name,
            weight: profile.weight,
            goal_weight: profile.goal_weight,
            goal_date: profile.goal_date,
            start_date: profile.start_date,
            manual_calorie_target: profile.manual_calorie_target,
            pct_fruehstueck: profile.pct_fruehstueck,
            pct_mittag: profile.pct_mittag,
            pct_nachmittag: profile.pct_nachmittag,
            pct_abend: profile.pct_abend,
          }}
        />
      </div>
    </div>
  );
}