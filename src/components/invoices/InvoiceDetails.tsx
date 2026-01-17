"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ArrowLeft, Download, Printer } from "lucide-react";

interface RowEntry {
  description: string;
  account: string;
  quantity: number;
  price: number;
  taxRate: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
  };
  date: string;
  dueDate: string;
  rowEntries: RowEntry[];
  pricesExcludeTax: boolean;
  discountTotal: number;
  subtotal: number;
  totalTax: number;
  total: number;
}

interface UserData {
  companyName?: string;
  country?: string;
  taxRegNum?: string;
  phone?: string;
  companyLogo?: {
    url: string;
    alt: string;
  } | null;
}

interface InvoiceDetailsProps {
  invoiceId: string;
  userData: UserData;
}

export function InvoiceDetails({ invoiceId, userData }: InvoiceDetailsProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        console.error("Failed to fetch invoice");
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateLineTotal = (item: RowEntry) => {
    return item.quantity * item.price;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Invoice not found</p>
          <Button onClick={() => router.push("/invoices")} className="mt-4">
            Back to Invoices
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push("/invoices")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <Card className="p-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Invoice</h1>

          {/* Header with Company Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 gap-6 mb-8">
                <div>
                  <Label className="text-gray-600">Customer</Label>
                  <p className="text-lg font-medium text-gray-900">
                    {typeof invoice.customer === "object"
                      ? invoice.customer.name
                      : "Unknown"}
                  </p>
                </div>

                <div>
                  <Label className="text-gray-600">Invoice number</Label>
                  <p className="text-lg font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </p>
                </div>

                <div>
                  <Label className="text-gray-600">Date</Label>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(invoice.date)}
                  </p>
                </div>

                <div>
                  <Label className="text-gray-600">Due date</Label>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Logo and Details */}
            <div className="flex flex-col order-1 lg:order-2 gap-2 text-center lg:text-right lg:justify-self-end justify-self-center">
              <Label className="justify-center">Company details</Label>
              <div className="border border-gray-200 shadow-xs flex items-center justify-center w-60 h-60 relative rounded-lg">
                {userData.companyLogo?.url ? (
                  <Image
                    src={userData.companyLogo.url}
                    alt={userData.companyLogo.alt || "Company logo"}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <Image src="/logo.png" alt="logo" fill className="object-contain" />
                )}
              </div>

              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {userData.companyName || "Company Name"}
                </p>
                <p className="text-gray-600">{userData.country || "Country"}</p>
                <p className="text-gray-600">
                  Tax registration number: {userData.taxRegNum || "—"}
                </p>
                {userData.phone && <p className="text-gray-600">{userData.phone}</p>}
              </div>
            </div>
          </div>

          {/* Entries Section */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Entries</h2>
              <div className="text-sm text-gray-600">
                Prices are{" "}
                <span className="font-medium">
                  {invoice.pricesExcludeTax ? "exc. tax" : "inc. tax"}
                </span>
              </div>
            </div>

            {/* Entries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-gray-50 rounded-xl">
                <thead className="border-b border-gray-200">
                  <tr className="*:py-3 *:px-4 *:font-semibold text-gray-700">
                    <th className="text-left">Description</th>
                    <th className="text-left">Account</th>
                    <th className="text-center w-24">Qty</th>
                    <th className="text-right w-32">Price</th>
                    <th className="text-right w-24">Tax Rate</th>
                    <th className="text-right w-32">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.rowEntries.map((item, index) => (
                    <tr key={index} className="border-b *:px-4 *:py-4 border-gray-100">
                      <td className="text-gray-900">{item.description}</td>
                      <td className="text-gray-600">{item.account}</td>
                      <td className="text-center text-gray-900">{item.quantity}</td>
                      <td className="text-right text-gray-900">
                        ৳ {item.price.toFixed(2)}
                      </td>
                      <td className="text-right text-gray-600">{item.taxRate}%</td>
                      <td className="text-right font-medium text-gray-900">
                        ৳ {calculateLineTotal(item).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="flex justify-end mt-8">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">৳ {invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                <span className="text-gray-600">Total VAT</span>
                <span className="font-medium">৳ {invoice.totalTax.toFixed(2)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">
                    - ৳ {invoice.discountTotal.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg py-3">
                <span>Total</span>
                <span>৳ {invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

