import { SECTIONS } from "@/lib/sections";
import LoginForm from "./LoginForm";

const TILES: { accent: string; left: number; top: number; rotate: number }[] = [
  { accent: "var(--accent-coding)", left: 40, top: 30, rotate: -10 },
  { accent: "var(--accent-sysdesign)", left: 200, top: 30, rotate: 7 },
  { accent: "var(--accent-microservices)", left: 360, top: 30, rotate: 4 },
  { accent: "var(--accent-k8s)", left: 40, top: 190, rotate: 1 },
  { accent: "var(--accent-aws)", left: 200, top: 190, rotate: -2 },
  { accent: "var(--accent-java)", left: 360, top: 190, rotate: -5 },
  { accent: "var(--accent-spring)", left: 40, top: 350, rotate: -8 },
  { accent: "var(--accent-frontend)", left: 200, top: 350, rotate: 9 },
];

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          padding: "64px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--ink)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
            }}
          >
            {"</>"}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            software-engineer-life
          </div>
        </div>
        <div style={{ maxWidth: 460 }}>
          <h1
            style={{
              fontSize: 52,
              lineHeight: 1.02,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
            }}
          >
            Your interview prep,
            <br />
            all in one place.
          </h1>
          <p
            style={{
              color: "var(--ink-soft)",
              fontSize: 17,
              marginTop: 18,
              lineHeight: 1.5,
            }}
          >
            Coding reps, system design, infra, and your own notes on real
            interviews — tracked in one dashboard instead of six tabs.
          </p>
          <LoginForm />
          <div style={{ marginTop: 14, fontSize: 13, color: "var(--ink-faint)" }}>
            Your data is private to your account.
          </div>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>
          © 2026 software-engineer-life
        </div>
      </div>
      <div
        style={{
          position: "relative",
          background: "var(--ink)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.9 }}>
          {TILES.map((t, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 170,
                height: 170,
                borderRadius: 32,
                background: t.accent,
                opacity: 0.9,
                left: t.left,
                top: t.top,
                transform: `rotate(${t.rotate}deg)`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "relative",
            background: "rgba(22,18,37,.55)",
            backdropFilter: "blur(18px)",
            borderRadius: 22,
            padding: "28px 32px",
            color: "#fff",
            maxWidth: 340,
            border: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            {SECTIONS.length} tracks, 1 login
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              opacity: 0.8,
              lineHeight: 1.5,
            }}
          >
            {SECTIONS.map((s) => s.name).join(", ")} — all tracked against your
            real confidence level.
          </div>
        </div>
      </div>
    </div>
  );
}
