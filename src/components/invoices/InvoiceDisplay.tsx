import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { UserData } from "../container/container";

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
  invoiceType: "standard" | "simplified";
  customer: {
    id: string;
    name: string;
    address?: {
      buildingNumber?: string;
      streetName?: string;
      district?: string;
      city?: string;
      postalCode?: string;
      additionalNumber?: string;
    };
  };
  date: string;
  dueDate: string;
  rowEntries: RowEntry[];
  pricesExcludeTax: boolean;
  discountTotal: number;
  subtotal: number;
  totalTax: number;
  total: number;
  qrCodeData?: string;
}


interface InvoiceDisplayProps {
  invoice: Invoice;
  userData: UserData;
}

export function InvoiceDisplay({ invoice, userData }: InvoiceDisplayProps) {
  const calculateLineTotal = (item: RowEntry) => {
    const baseAmount = item.quantity * item.price;
    // If prices exclude tax, add VAT to get total
    if (invoice.pricesExcludeTax) {
      return baseAmount + (baseAmount * item.taxRate) / 100;
    }
    // If prices include tax, the price already includes VAT
    return baseAmount;
  };

  const formatAddress = (address?: {
    buildingNumber?: string;
    streetName?: string;
    district?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    additionalNumber?: string;
  }) => {
    if (!address) return "N/A";

    const parts = [
      address.buildingNumber,
      address.streetName,
      address.district,
      address.city,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-gray-200">
          {/* Invoice Title and Details */}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invoice</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
              {invoice.invoiceType === "standard"
                ? "Standard Tax Invoice (B2B/B2G)"
                : "Simplified Tax Invoice (B2C)"}
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">
                  Invoice Number
                </Label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">
                  Date
                </Label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(invoice.date)}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">
                  Customer
                </Label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {typeof invoice.customer === "object"
                    ? invoice.customer.name
                    : "Unknown"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">
                  Due Date
                </Label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Company Logo and Details */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center justify-center w-32 h-32 md:w-36 md:h-36 relative rounded-lg">
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
            <div className="text-sm text-center md:text-right mt-8">
              <p className="font-semibold text-gray-900">
                {userData.companyName || "Company Name"}
              </p>
              {userData.address && (
                <p className="text-gray-600 text-xs mt-1">
                  {formatAddress(userData.address)}
                </p>
              )}
              {userData.vatNumber && (
                <p className="text-gray-600 text-xs mt-1">
                  Tax Reg: {userData.vatNumber}
                </p>
              )}
              {userData.phone && (
                <p className="text-gray-600 text-xs">{userData.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Entries Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <div className="text-xs text-gray-500">
              Prices are{" "}
              <span className="font-medium text-gray-700">
                {invoice.pricesExcludeTax ? "excluding tax" : "including tax"}
              </span>
            </div>
          </div>

          {/* Entries Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm rounded-xl">
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
                      SAR {item.price.toFixed(2)}
                    </td>
                    <td className="text-right text-gray-600">{item.taxRate}%</td>
                    <td className="text-right font-medium text-gray-900">
                      SAR {calculateLineTotal(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section with QR Code */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-4 border-gray-200">
          {/* QR Code Section */}
          {invoice.qrCodeData && (
            <div className="flex flex-col items-center md:items-start">
              <div className="rounded-lg p-3">
                <Image
                  src={invoice.qrCodeData}
                  alt="Invoice QR Code"
                  width={150}
                  height={150}
                  className="rounded"
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  ZATCA E-Invoice QR Code
                </p>
              </div>
            </div>
          )}

          {/* Summary - Right Side */}
          <div
            className={`w-full ${invoice.qrCodeData ? "md:w-auto md:min-w-[280px]" : "md:max-w-xs md:ml-auto"} space-y-2`}
          >
            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
              <span className="text-gray-600">
                Subtotal {invoice.pricesExcludeTax ? "(excl. VAT)" : "(incl. VAT)"}
              </span>
              <span className="font-medium text-gray-900">
                SAR {invoice.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
              <span className="text-gray-600">VAT Amount</span>
              <span className="font-medium text-gray-900">
                SAR {invoice.totalTax.toFixed(2)}
              </span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">
                  - SAR {invoice.discountTotal.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg py-1 mt-2">
              <span className="text-gray-900">Total (incl. VAT)</span>
              <span className="text-gray-900">SAR {invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
