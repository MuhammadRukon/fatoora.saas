import { UserData } from "@/components/container/container";
import { Note } from "@/components/notes/note";
import { getCurrentUser, getCurrentUserCompanyData } from "@/lib/server-functions";
import React from "react";

export default async function CreateNotePage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string }>;
}) {
  const user = await getCurrentUser();
  const userData = await getCurrentUserCompanyData();
  const params = await searchParams;
  const invoiceId = params?.invoiceId;

  if (!user || !userData) {
    return null;
  }

  return <Note user={userData as unknown as UserData} invoiceId={invoiceId} />;
}

