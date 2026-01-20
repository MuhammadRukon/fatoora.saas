"use client";

import { Button } from "@/components/ui/button";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface InvoiceActionsProps {
  invoiceId: string;
}

export function InvoiceActions({ invoiceId }: InvoiceActionsProps) {
  const handlePrint = () => {
    // Store return URL in sessionStorage for the print page
    if (typeof window !== "undefined") {
      sessionStorage.setItem("invoiceReturnUrl", `/invoices/${invoiceId}`);
    }

    // Open print page in new window
    const printUrl = `/print/invoice/${invoiceId}?print=true&return=${encodeURIComponent(`/invoices/${invoiceId}`)}`;
    window.open(printUrl, "_blank");
  };

  const handleDownloadPDF = () => {
    // Store return URL in sessionStorage for the print page
    if (typeof window !== "undefined") {
      sessionStorage.setItem("invoiceReturnUrl", `/invoices/${invoiceId}`);
    }

    // Open PDF download page in new window
    const pdfUrl = `/print/invoice/${invoiceId}?pdf=true&return=${encodeURIComponent(`/invoices/${invoiceId}`)}`;
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Button variant="outline" asChild>
        <Link href="/invoices">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
