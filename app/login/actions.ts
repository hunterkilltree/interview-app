"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ApiRequestError,
  apiFetchPublic,
  clearAuthCookies,
  setAuthCookies,
  type AuthPayload,
} from "@/lib/api";

export type AuthResult = { error: string } | undefined;

export async function login(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  try {
    const auth = await apiFetchPublic<AuthPayload>("/api/v1/auth/login", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    await setAuthCookies(auth);
  } catch (e) {
    return { error: e instanceof ApiRequestError ? e.message : "Could not reach the API" };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  try {
    const auth = await apiFetchPublic<AuthPayload>("/api/v1/auth/register", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      fullName: String(formData.get("full_name") ?? "").trim(),
    });
    await setAuthCookies(auth);
  } catch (e) {
    return { error: e instanceof ApiRequestError ? e.message : "Could not reach the API" };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  await clearAuthCookies();
  revalidatePath("/", "layout");
  redirect("/login");
}
