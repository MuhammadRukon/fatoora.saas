import { InvoiceDetails } from "@/components/invoices/InvoiceDetails";
import { getCurrentUser } from "@/lib/server-functions";
import React from "react";

export default async function InvoiceDetailsPage({
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
    <InvoiceDetails
      invoiceId={id}
      userData={{
        companyName: user?.companyName || undefined,
        country: user?.country || undefined,
        taxRegNum: user?.taxRegNum || undefined,
        phone: user?.phone || undefined,
        companyLogo: companyLogo,
      }}
    />
  );
}
