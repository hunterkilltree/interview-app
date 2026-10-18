"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Confidence, Question } from "./types";

export type SessionUser = { email: string; fullName: string; createdAt: string };
export type QState = { confidence?: Confidence; notes?: string };
type StateMap = Record<string, QState>;

// Mock auth + progress: everything lives in this browser tab's sessionStorage.
const USER_KEY = "prep.user";
const STATE_KEY = "prep.state";

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable; state stays in memory only
  }
}

type Ctx = {
  ready: boolean;
  user: SessionUser | null;
  state: StateMap;
  signIn: (email: string, fullName?: string) => void;
  signOut: () => void;
  setConfidence: (id: string, level: Confidence) => void;
  setNotes: (id: string, notes: string) => void;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [state, setState] = useState<StateMap>({});

  useEffect(() => {
    setUser(read<SessionUser>(USER_KEY));
    setState(read<StateMap>(STATE_KEY) ?? {});
    setReady(true);
  }, []);

  const signIn = useCallback((email: string, fullName?: string) => {
    const u: SessionUser = {
      email,
      fullName: fullName?.trim() || email.split("@")[0],
      createdAt: new Date().toISOString(),
    };
    write(USER_KEY, u);
    setUser(u);
  }, []);

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(STATE_KEY);
    } catch {}
    setUser(null);
    setState({});
  }, []);

  const patch = useCallback((id: string, p: QState) => {
    setState((prev) => {
      const next = { ...prev, [id]: { ...prev[id], ...p } };
      write(STATE_KEY, next);
      return next;
    });
  }, []);

  const setConfidence = useCallback((id: string, c: Confidence) => patch(id, { confidence: c }), [patch]);
  const setNotes = useCallback((id: string, n: string) => patch(id, { notes: n }), [patch]);

  return (
    <SessionContext.Provider
      value={{ ready, user, state, signIn, signOut, setConfidence, setNotes }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): Ctx {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

export function effectiveConfidence(q: Question, state: StateMap): Confidence {
  return state[q.id]?.confidence ?? q.default_confidence;
}

export function effectiveNotes(q: Question, state: StateMap): string {
  return state[q.id]?.notes ?? q.default_notes ?? "";
}
