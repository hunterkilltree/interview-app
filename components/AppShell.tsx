"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Nav from "@/components/Nav";
import { useSession } from "@/lib/session";

/** Client-side guard for the mock login: no user in sessionStorage -> /login. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  const name = user.fullName || user.email.split("@")[0] || "Member";
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Nav name={name} role="Member" initials={initials} />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 28px 80px" }}>
        {children}
      </div>
    </div>
  );
}
