import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

type RefreshPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login");

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Access token still valid.
  if (accessToken) {
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Try a refresh when the access token expired but the refresh token exists.
  if (refreshToken) {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const auth = json.data as RefreshPayload;
        const response = isAuthRoute
          ? NextResponse.redirect(new URL("/", request.url))
          : NextResponse.next();
        const secure = process.env.NODE_ENV === "production";
        response.cookies.set("access_token", auth.accessToken, {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: Math.floor(auth.expiresIn / 1000),
        });
        response.cookies.set("refresh_token", auth.refreshToken, {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }
    } catch {
      // fall through to redirect
    }
  }

  if (!isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)",
  ],
};
