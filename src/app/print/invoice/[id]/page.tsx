import { UserData } from "@/components/container/container";
import { InvoicePrintView } from "@/components/invoices/InvoicePrintView";
import { getCurrentUser } from "@/lib/server-functions";
import React from "react";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  return (
    <InvoicePrintView
      invoiceId={id}
      userData={user as UserData}
    />
  );
}
