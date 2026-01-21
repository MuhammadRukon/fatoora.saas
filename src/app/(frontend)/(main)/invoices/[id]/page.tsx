import { InvoiceDisplay } from "@/components/invoices/InvoiceDisplay";
import { InvoiceActions } from "@/components/invoices/InvoiceActions";
import { getCurrentUser, getCurrentUserCompanyData, getNotesByInvoice } from "@/lib/server-functions";
import { payload } from "@/lib/payload";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserData } from "@/components/container/container";
import { formatDate } from "@/lib/utils";

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

  const [invoiceResult, userData, notesResult] = await Promise.all([
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
        invoiceType: true,
      },
    }),

   getCurrentUserCompanyData(),
   getNotesByInvoice(id),
  ]);

  const notes = notesResult.success ? notesResult.docs || [] : [];

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


  return (
    <div className="space-y-6">
      <InvoiceActions invoiceId={id} />
      <InvoiceDisplay
        invoice={invoiceResult as any}
        userData={userData as UserData}
      />
      
      {/* Related Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Related Notes</h2>
          <Button asChild>
            <Link href={`/notes/create?invoiceId=${id}`}>Create Note</Link>
          </Button>
        </div>
        
        {notes.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No credit or debit notes for this invoice</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map((note: any) => (
              <Card key={note.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Link href={`/notes/${note.id}`}>
                        <h3 className="text-lg font-semibold hover:underline">
                          {note.noteNumber}
                        </h3>
                      </Link>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          note.documentType === "credit"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {note.documentType === "credit" ? "Credit" : "Debit"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Date: {formatDate(note.date)} | Total: SAR {note.total?.toFixed(2) || "0.00"}
                    </p>
                    {note.reason && (
                      <p className="text-sm text-gray-500 mt-1">{note.reason}</p>
                    )}
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/notes/${note.id}`}>View</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}