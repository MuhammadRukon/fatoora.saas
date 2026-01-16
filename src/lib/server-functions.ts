"use server";

import { payload } from "./payload";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function login(email: string, password: string) {
  try {
    // Get current cookies from the request
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";

    // Use Payload's local API for login
    const result = await payload.login({
      collection: "users",
      data: { email, password },
      req: {
        headers: {
          cookie: cookieHeader,
        },
      } as any,
    });

    if (!result.token) {
      return { success: false, error: "Invalid credentials" };
    }
    const cookieStore = await cookies();
    cookieStore.set("payload-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message || "Login failed" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("payload-token");
  redirect("/login");
}

export async function getCurrentUser() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";

    const { user } = await payload.auth({
      headers: {
        cookie: cookieHeader,
      },
    } as any);

    return user || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
