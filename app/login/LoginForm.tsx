"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthResult } from "./actions";

export default function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loginState, loginAction, loginPending] = useActionState<AuthResult, FormData>(
    login,
    undefined
  );
  const [signupState, signupAction, signupPending] = useActionState<AuthResult, FormData>(
    signup,
    undefined
  );

  const error = mode === "signin" ? loginState?.error : signupState?.error;
  const pending = mode === "signin" ? loginPending : signupPending;

  return (
    <form
      action={mode === "signin" ? loginAction : signupAction}
      style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}
    >
      {mode === "signup" && (
        <input
          className="input"
          name="full_name"
          placeholder="Full name"
          autoComplete="name"
          required
        />
      )}
      <input
        className="input"
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
      />
      <input
        className="input"
        name="password"
        type="password"
        placeholder="Password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        minLength={6}
        required
      />
      {error && (
        <div style={{ color: "var(--conf-low)", fontSize: 13 }}>{error}</div>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={pending}
        style={{
          fontSize: 16,
          padding: "14px 26px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: pending ? 0.7 : 1,
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            background: "#fff",
            opacity: 0.85,
          }}
        />
        {pending
          ? "One moment…"
          : mode === "signin"
            ? "Sign in"
            : "Create account"}
      </button>
      <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>
        {mode === "signin" ? (
          <>
            New here?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              style={{
                background: "none",
                border: "none",
                color: "var(--brand)",
                cursor: "pointer",
                padding: 0,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              style={{
                background: "none",
                border: "none",
                color: "var(--brand)",
                cursor: "pointer",
                padding: 0,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </form>
  );
}
