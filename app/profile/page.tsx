import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import { calcDailyTarget } from "@/lib/calculations";

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

  const { target: calculatedTarget } = calcDailyTarget({
    weight: profile.weight,
    goal_weight: profile.goal_weight,
    goal_date: profile.goal_date,
    height: profile.height,
    age: profile.age,
    gender: profile.gender,
    activity: profile.activity,
  });

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto relative w-full overflow-hidden" style={{ aspectRatio: "1983 / 793" }}>
        <img src="/profile-banner.png" alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-bg" />
        <Link
          href="/dashboard"
          aria-label="Zurück"
          className="absolute top-6 right-6 z-20 bg-white/80 w-10 h-10 rounded-md flex items-center justify-center overflow-hidden"
        >
          <img src="/pfeil-back.png" alt="" className="w-14 h-auto" />
        </Link>
      </div>

      <div className="px-6 relative z-10 pb-8">
      <div className="max-w-md mx-auto pt-6">
        <p className="text-muted text-xs uppercase tracking-widest mb-8">Mein Profil</p>

        <ProfileForm
          calculatedTarget={calculatedTarget}
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
            equipment: profile.equipment,
            go_to_store: profile.go_to_store,
          }}
        />
      </div>
      </div>
    </div>
  );
}