"use server";

import { cache } from "react";
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

// multiple components call it, so we need to cache it
export const getCurrentUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("payload-token");

    if (!token) return null;

    const headersList = await headers();

    const { user } = await payload.auth({
      headers: headersList,
    });

    return user || null;
  } catch (error) {
    console.error(error);
    return null;
  }
});

export async function getCustomers() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const customers = await payload.find({
      collection: "customers",
      where: {
        createdBy: {
          equals: user.id,
        },
      },
    });

    return { success: true, docs: customers.docs };
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return { success: false, error: error.message || "Failed to fetch customers" };
  }
}

export async function createCustomer(data: {
  name: string;
  taxRegNum?: string;
  country?: string;
  vatTreatment: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const customer = await payload.create({
      collection: "customers",
      data: {
        name: data.name,
        taxRegNum: data.taxRegNum,
        country: data.country,
        vatTreatment: data.vatTreatment,
        createdBy: user.id,
      } as any,
    });

    return { success: true, customer };
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return { success: false, error: error.message || "Failed to create customer" };
  }
}

export async function getAccounts() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const accounts = await payload.find({
      collection: "accounts",
      where: {
        createdBy: {
          equals: user.id,
        },
      },
    });

    return { success: true, docs: accounts.docs };
  } catch (error: any) {
    console.error("Error fetching accounts:", error);
    return { success: false, error: error.message || "Failed to fetch accounts" };
  }
}

export async function createAccount(name: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const account = await payload.create({
      collection: "accounts",
      data: {
        name,
        createdBy: user.id,
      },
    });

    return { success: true, account };
  } catch (error: any) {
    console.error("Error creating account:", error);
    return { success: false, error: error.message || "Failed to create account" };
  }
}

export async function updateCompanyInfo(data: {
  companyName?: string;
  country?: string;
  taxRegNum?: string;
  phone?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const updatedUser = await payload.update({
      collection: "users",
      id: user.id,
      data,
    });

    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error("Error updating company info:", error);
    return { success: false, error: error.message || "Failed to update company info" };
  }
}

export async function uploadCompanyLogo(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Convert File to Buffer for Payload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete previous logo if it exists
    if (user.companyLogo) {
      try {
        const previousLogoId =
          typeof user.companyLogo === "object" ? user.companyLogo.id : user.companyLogo;

        await payload.delete({
          collection: "media",
          id: previousLogoId,
        });
      } catch (deleteError) {
        console.warn("Failed to delete previous logo:", deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new logo to media collection
    const media = await payload.create({
      collection: "media",
      data: {
        alt: `${user.companyName || "Company"} logo`,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    });

    // Update user with new logo
    const updatedUser = await payload.update({
      collection: "users",
      id: user.id,
      data: {
        companyLogo: media.id,
      },
    });

    return { success: true, mediaId: media.id, media, user: updatedUser };
  } catch (error: any) {
    console.error("Error uploading company logo:", error);
    return { success: false, error: error.message || "Failed to upload logo" };
  }
}
