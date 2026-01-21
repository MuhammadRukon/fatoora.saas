import { UserData } from "@/components/container/container";
import { Invoice } from "@/components/invoices/invoice";
import { getCurrentUser } from "@/lib/server-functions";
import React from "react";

export default async function CreateInvoicePage() {
  const user = await getCurrentUser();
 
  return (
    <Invoice
      user={user as unknown as UserData}
    />
  );
}
