import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  const name =
    profile?.full_name ||
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Member";
  const initials = name
    .split(/\s+/)
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const role = profile?.role === "admin" ? "Admin" : "Member";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav
        name={name}
        role={role}
        initials={initials}
        isAdmin={profile?.role === "admin"}
      />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 28px 80px" }}>
        {children}
      </div>
    </div>
  );
}
