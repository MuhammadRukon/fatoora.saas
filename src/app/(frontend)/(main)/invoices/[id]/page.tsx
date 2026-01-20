import { InvoiceDisplay } from "@/components/invoices/InvoiceDisplay";
import { InvoiceActions } from "@/components/invoices/InvoiceActions";
import { getCurrentUser, getCurrentUserCompanyData } from "@/lib/server-functions";
import { payload } from "@/lib/payload";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  const [invoiceResult, userData] = await Promise.all([

    payload.findByID({
      collection: "invoices",
      id,
      depth: 1,
      overrideAccess: false,
      user: user,
      select: {
        id: true,
        invoiceNumber: true,
        customer: true,
        date: true,
        dueDate: true,
        rowEntries: true,
        pricesExcludeTax: true,
        discountTotal: true,
        subtotal: true,
        totalTax: true,
        total: true,
        qrCodeData: true,
      },
    }),

    getCurrentUserCompanyData(),
  ]);

  if (!invoiceResult) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Invoice not found</p>
          <Button asChild className="mt-4">
            <Link href="/invoices">Back to Invoices</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!userData) {
    notFound();
  }

  // Extract logo data if it exists
  const companyLogo =
    userData.companyLogo && typeof userData.companyLogo === "object"
      ? {
          url: userData.companyLogo.url || "",
          alt: userData.companyLogo.alt || "",
        }
      : null;

  return (
    <div className="space-y-6">
      <InvoiceActions invoiceId={id} />
      <InvoiceDisplay
        invoice={invoiceResult as any}
        userData={{
          companyName: userData.companyName || undefined,
          country: userData.country || undefined,
          taxRegNum: userData.taxRegNum || undefined,
          phone: userData.phone || undefined,
          companyLogo: companyLogo,
        }}
      />
    </div>
  );
}
