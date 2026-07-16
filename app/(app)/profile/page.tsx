import { redirect } from "next/navigation";
import { logout } from "@/app/login/actions";
import {
  effectiveConfidence,
  getProfile,
  getQuestions,
  getQuestionState,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, questions, state] = await Promise.all([
    getProfile(),
    getQuestions(),
    getQuestionState(),
  ]);

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

  const tally = { Low: 0, Medium: 0, High: 0 };
  for (const q of questions) tally[effectiveConfidence(q, state)]++;

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const card: React.CSSProperties = {
    background: "var(--surface)",
    borderRadius: 22,
    border: "1px solid var(--line)",
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div
        style={{
          ...card,
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--brand-soft)",
            color: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 22,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
            }}
          >
            {name}
          </div>
          <div style={{ color: "var(--ink-faint)", fontSize: 13.5 }}>
            {user.email}
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="btn btn-ghost"
            style={{ fontSize: 13 }}
          >
            Sign out
          </button>
        </form>
      </div>
      <div style={{ ...card, padding: "24px 32px", marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Confidence breakdown
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {(
            [
              ["Low", tally.Low, "var(--conf-low)"],
              ["Medium", tally.Medium, "var(--conf-med)"],
              ["High", tally.High, "var(--conf-high)"],
            ] as const
          ).map(([label, count, color]) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 700,
                  color,
                }}
              >
                {count}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...card, padding: "24px 32px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Account
        </div>
        <div style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 2 }}>
          Identity provider: Supabase Auth
          <br />
          Role: {profile?.role === "admin" ? "Admin" : "Member"}
          <br />
          Member since: {memberSince}
        </div>
      </div>
    </div>
  );
}
