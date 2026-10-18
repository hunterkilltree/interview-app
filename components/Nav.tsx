"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Dashboard" },
  { href: "/coding", label: "Coding Practice" },
  { href: "/knowledge", label: "Knowledge Base" },
];

export default function Nav({
  name,
  role,
  initials,
}: {
  name: string;
  role: string;
  initials: string;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const profileActive = pathname.startsWith("/profile");

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--surface)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            textDecoration: "none",
            color: "var(--ink)",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "var(--ink)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {"</>"}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            software-engineer-life
          </div>
        </Link>
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                border: "none",
                borderRadius: 999,
                padding: "9px 16px",
                fontSize: 14,
                cursor: "pointer",
                textDecoration: "none",
                background: isActive(t.href) ? "var(--ink)" : "transparent",
                color: isActive(t.href) ? "#fff" : "var(--ink-soft)",
              }}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <Link
          href="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 4,
            borderRadius: 999,
            textDecoration: "none",
            color: "var(--ink)",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{role}</div>
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--brand-soft)",
              color: "var(--brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              border: profileActive ? "2px solid var(--brand)" : "2px solid transparent",
            }}
          >
            {initials}
          </div>
        </Link>
      </div>
    </div>
  );
}
