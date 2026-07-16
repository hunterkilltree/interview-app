import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; details?: string[] } | null;
};

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

/** Server-side fetch against the Spring Boot API, with the JWT from cookies. */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiRequestError(res.status, "BAD_RESPONSE", "Invalid API response");
  }

  if (!res.ok || !envelope.success) {
    throw new ApiRequestError(
      res.status,
      envelope.error?.code ?? "UNKNOWN",
      envelope.error?.message ?? "Request failed"
    );
  }
  return envelope.data as T;
}

/** Direct (no-auth) call, used by auth flows. */
export async function apiFetchPublic<T>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const envelope = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !envelope.success) {
    throw new ApiRequestError(
      res.status,
      envelope.error?.code ?? "UNKNOWN",
      envelope.error?.message ?? "Request failed"
    );
  }
  return envelope.data as T;
}

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "MEMBER" | "ADMIN";
    createdAt: string;
  };
};

export async function setAuthCookies(auth: AuthPayload) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set("access_token", auth.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(auth.expiresIn / 1000),
  });
  cookieStore.set("refresh_token", auth.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
