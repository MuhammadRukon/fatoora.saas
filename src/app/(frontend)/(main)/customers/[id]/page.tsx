import { getCurrentUser } from "@/lib/server-functions";

import { notFound } from "next/navigation";

export default async function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  return <div className="space-y-6">Details Page for Customer {id}</div>;
}
