import { Invoice } from "@/components/invoices/invoice";
import { getCurrentUser } from "@/lib/server-functions";
import React from "react";

export default async function CreateInvoicePage() {
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
    <Invoice
      userData={{
        companyName: user?.companyName,
        country: user?.country,
        taxRegNum: user?.taxRegNum,
        phone: user?.phone,
        companyLogo: companyLogo,
      }}
    />
  );
}

