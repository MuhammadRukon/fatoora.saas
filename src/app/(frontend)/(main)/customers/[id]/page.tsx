import { CustomerViewUpdate } from "@/components/customer/CustomerViewUpdate";
import { payload } from "@/lib/payload";
import { getCurrentUser } from "@/lib/server-functions";

import { notFound } from "next/navigation";

export default async function CustomerViewUpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const customer = await payload.findByID({
    collection: "customers",
    id,
    overrideAccess: false,
    user: user,
  });

  return <CustomerViewUpdate customer={customer} />;
}
