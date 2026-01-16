"use server";

import { payload } from "./payload";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { RegisterData } from "@/interface/auth";

export async function login(email: string, password: string) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";

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

export async function register(data: RegisterData) {
  try {
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    // Remove confirmPassword and add role before sending to Payload
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: "user" as const,
    };

    const result = await payload.create({
      collection: "users",
      data: userData,
      draft: false,
    });

    if (!result) {
      return { success: false, error: "Registration failed" };
    }

    const loginResult = await login(data.email, data.password);

    return loginResult;
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error.message || "Registration failed. Please try again.",
    };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("payload-token");
  redirect("/login");
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("payload-token");

    if (!token) {
      return null;
    }

    const headersList = await headers();

    const { user } = await payload.auth({
      headers: headersList,
    });

    return user || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
