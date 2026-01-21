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

  // Extract logo data if it exists
  const companyLogo =
    user?.companyLogo && typeof user.companyLogo === "object"
      ? {
          url: user.companyLogo.url || "",
          alt: user.companyLogo.alt || "",
        }
      : null;

  return (
    <InvoicePrintView
      invoiceId={id}
      userData={{
        companyName: user?.companyName || undefined,
        country: user?.country || undefined,
        vatNumber: user?.vatNumber || undefined,
        phone: user?.phone || undefined,
        companyLogo: companyLogo,
      }}
    />
  );
}
