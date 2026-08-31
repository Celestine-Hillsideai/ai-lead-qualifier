import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/subscription";
import { UserNav } from "@/components/UserNav";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts already redirected unauthenticated requests away from this
  // segment — this is a defensive re-check, not the primary gate.
  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile(supabase, user.id);

  return (
    <>
      <UserNav email={user.email ?? ""} plan={profile.plan} />
      {children}
    </>
  );
}
