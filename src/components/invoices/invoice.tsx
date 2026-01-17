"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { EllipsisVertical, LucideTrash2, Plus } from "lucide-react";
import { Combobox } from "../ui/combo-box";
import { Label } from "../ui/label";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CustomerCreateModal } from "../modal/CustomerCreateModal";
import { getCustomers } from "@/lib/server-functions";
import { generateInvoiceQRCode } from "@/lib/qr-code-generator";
import QRCode from "qrcode";

interface RowEntry {
  description: string;
  account: string;
  quantity: number;
  price: number;
  taxRate: number;
}

interface InvoiceData {
  customer: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  rowEntries: RowEntry[];
  pricesExcludeTax: boolean;
  discountTotal: number;
  includeQRCode?: boolean;
}

interface Customer {
  id: string;
  name: string;
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

interface InvoiceProps {
  userData?: UserData;
}

export function Invoice({ userData }: InvoiceProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [includeQRCode, setIncludeQRCode] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);

  const form = useForm<InvoiceData>({
    defaultValues: {
      customer: "",
      invoiceNumber: "INV-000100",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      rowEntries: [{ description: "", account: "", quantity: 1, price: 0, taxRate: 0 }],
      pricesExcludeTax: true,
      discountTotal: 0,
      includeQRCode: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rowEntries",
  });

  const rowEntries = form.watch("rowEntries");
  const discountTotal = form.watch("discountTotal");
  const invoiceDate = form.watch("date");

  // Fetch customers function
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const result = await getCustomers();
      if (result.success && result.docs) {
        setCustomers(
          result.docs.map((customer: any) => ({
            id: customer.id,
            name: customer.name,
          }))
        );
      } else {
        console.error("Error fetching customers:", result.error);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const calculateLineTotal = (item: RowEntry) => {
    return item.quantity * item.price;
  };

  const calculateSubtotal = () => {
    return rowEntries.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  };

  const calculateTax = () => {
    return rowEntries.reduce((sum, item) => {
      const lineTotal = calculateLineTotal(item);
      return sum + (lineTotal * item.taxRate) / 100;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = subtotal + tax - discountTotal;

  // Memoize company data to prevent useEffect dependency issues
  const companyData = useMemo(
    () => ({
      companyName: userData?.companyName,
      taxRegNum: userData?.taxRegNum,
      country: userData?.country,
    }),
    [userData?.companyName, userData?.taxRegNum, userData?.country]
  );

  // Generate QR code when includeQRCode is toggled
  useEffect(() => {
    if (includeQRCode && companyData) {
      // Validate required fields for QR code generation
      const missingFields: string[] = [];

      if (!companyData.companyName) missingFields.push("Company Name");
      if (!companyData.taxRegNum) missingFields.push("Tax Registration Number");
      if (!companyData.country) missingFields.push("Country");
      if (total <= 0) missingFields.push("Invoice Total (must be greater than 0)");

      if (missingFields.length > 0) {
        alert(
          `Cannot generate QR code. The following required information is missing:\n\n` +
            missingFields.map((field) => `• ${field}`).join("\n") +
            `\n\nPlease click on "Company details" section to add this information.`
        );
        setIncludeQRCode(false);
        setQrCodeDataURL(null);
        return;
      }

      const generateQR = async () => {
        try {
          const qrData = generateInvoiceQRCode({
            companyName: companyData.companyName!,
            vatNumber: companyData.taxRegNum!,
            invoiceDate: new Date(invoiceDate),
            totalWithVAT: total,
            vatAmount: tax,
          });

          // Generate QR code image from the base64 data
          const qrCodeURL = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 1,
          });
          setQrCodeDataURL(qrCodeURL);
        } catch (error) {
          console.error("Error generating QR code:", error);
          alert("Failed to generate QR code. Please try again.");
          setIncludeQRCode(false);
          setQrCodeDataURL(null);
        }
      };

      generateQR();
    } else {
      setQrCodeDataURL(null);
    }
  }, [includeQRCode, total, tax, invoiceDate, companyData]);

  const onSubmit = async (data: InvoiceData) => {
    setIsSaving(true);
    try {
      const invoiceData = {
        ...data,
        includeQRCode,
        qrCodeData: includeQRCode && qrCodeDataURL ? qrCodeDataURL : undefined,
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Invoice created:", result);

        // Reset the form to default values
        form.reset({
          customer: "",
          invoiceNumber: "INV-000100",
          date: new Date().toISOString().split("T")[0],
          dueDate: new Date().toISOString().split("T")[0],
          rowEntries: [
            { description: "", account: "", quantity: 1, price: 0, taxRate: 0 },
          ],
          pricesExcludeTax: true,
          discountTotal: 0,
        });

        alert("Invoice saved successfully!");
        // Optionally navigate to invoices list
        // router.push("/invoices");
      } else {
        const error = await response.json();
        console.error("Error saving invoice:", error);
        alert("Failed to save invoice. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting invoice:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Invoice</h1>
        {/* Header with Logo Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className=" order-2 lg:order-1">
            <div className="grid grid-cols-1 gap-6 mb-8">
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer*</FormLabel>
                    <Combobox
                      {...field}
                      placeholder={isLoading ? "Loading customers..." : "Select customer"}
                      options={customers.map((customer) => ({
                        label: customer.name,
                        value: customer.id,
                      }))}
                      handleCreate={() => {
                        setOpenCustomerModal(true);
                      }}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice number*</FormLabel>
                    <Input {...field} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date*</FormLabel>
                    <Input type="date" {...field} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date*</FormLabel>
                    <Input type="date" {...field} />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Company Details Section */}
          <div
            className="flex flex-col order-1 lg:order-2 gap-2 text-center lg:text-right lg:justify-self-end justify-self-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push("/company-info")}
            title="Click to edit company information"
          >
            <Label className="justify-center">Company details</Label>
            <div className="border border-gray-200 shadow-xs flex items-center justify-center w-60 h-60 relative rounded-lg overflow-hidden bg-gray-50">
              {userData?.companyLogo?.url ? (
                <Image
                  src={userData.companyLogo.url}
                  alt={userData.companyLogo.alt || "Company logo"}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Image
                    src="/logo.png"
                    alt="logo"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                  <p className="text-xs">Click to add logo</p>
                </div>
              )}
            </div>

            <div className="text-sm">
              <p className="font-semibold text-gray-900">
                {userData?.companyName || "Company Name"}
              </p>
              <p className="text-gray-600">{userData?.country || "Country"}</p>
              <p className="text-gray-600">
                Tax registration number: {userData?.taxRegNum || "—"}
              </p>
              {userData?.phone && <p className="text-gray-600">{userData.phone}</p>}
            </div>
            <p className="text-xs text-blue-600 mt-1">Click to edit company info</p>
          </div>
        </div>

        {/* Entries Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Entries</h2>
            <div className="text-sm text-gray-600">
              Prices are
              <button type="button" className="text-blue-600 hover:underline ml-1">
                exc. tax
              </button>
            </div>
          </div>

          {/* Entries Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-gray-50 rounded-xl">
              <thead className="border-b border-gray-200">
                <tr className="*:py-2 *:px-3 *:font-semibold text-gray-700">
                  <th className="text-left">Description*</th>
                  <th className="text-left">Account*</th>
                  <th className="text-center w-24">Qty*</th>
                  <th className="text-right w-24">Price*</th>
                  <th className="text-right w-24">Total</th>
                  <th className="text-right w-10">
                    <EllipsisVertical size={12} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="border-b *:px-3 *:py-3 *:align-top border-gray-100"
                  >
                    <td>
                      <FormField
                        control={form.control}
                        name={`rowEntries.${index}.description`}
                        render={({ field }) => (
                          <Input placeholder="Required" {...field} className="text-sm" />
                        )}
                      />
                      <p className="text-xs text-blue-600 mt-1">+ Product or service</p>
                    </td>
                    <td>
                      <FormField
                        control={form.control}
                        name={`rowEntries.${index}.account`}
                        render={({ field }) => (
                          <Combobox
                            {...field}
                            handleCreate={() => {
                              alert("create account");
                            }}
                            placeholder="select"
                            options={[{ label: "Sales", value: "sales" }]}
                          />
                        )}
                      />
                      <p className="text-xs text-blue-600 mt-1">+ Cost center</p>
                    </td>
                    <td className="text-center">
                      <FormField
                        control={form.control}
                        name={`rowEntries.${index}.quantity`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="text-sm text-center"
                          />
                        )}
                      />
                    </td>
                    <td>
                      <FormField
                        control={form.control}
                        name={`rowEntries.${index}.price`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="text-sm text-center"
                            placeholder="Required"
                          />
                        )}
                      />
                      <p className="text-xs text-blue-600 mt-1">+ Tax rate</p>
                    </td>
                    <td className="text-right align-middle! font-medium text-gray-900">
                      SR {calculateLineTotal(rowEntries[index]).toFixed(2)}
                    </td>
                    <td
                      className={`text-right align-middle! text-red-500 ${fields.length <= 1 ? "cursor-not-allowed opacity-50" : " cursor-pointer"}`}
                      onClick={fields.length > 1 ? () => remove(index) : undefined}
                    >
                      <LucideTrash2 size={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add/Clear Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  description: "",
                  account: "",
                  quantity: 1,
                  price: 0,
                  taxRate: 0,
                })
              }
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add line
            </Button>
          </div>
        </div>

        {/* Summary Section with QR Code */}
        <div className="flex justify-between items-start mt-8">
          {/* QR Code Section - Bottom Left */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeQRCode"
                checked={includeQRCode}
                onChange={(e) => setIncludeQRCode(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="includeQRCode"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Include QR Code (ZATCA compliant)
              </label>
            </div>

            {includeQRCode && qrCodeDataURL && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <Image
                  src={qrCodeDataURL}
                  alt="Invoice QR Code"
                  width={200}
                  height={200}
                  className="rounded"
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  ZATCA E-Invoice QR Code
                </p>
              </div>
            )}
          </div>

          {/* Summary - Right Side */}
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">৳ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
              <span className="text-gray-600">Total VAT</span>
              <span className="font-medium">৳ {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold py-3">
              <span>Total</span>
              <span>৳ {total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              className="text-blue-600 text-sm hover:underline w-full text-right"
            >
              + Discount on total
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 mt-8">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Invoice"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/invoices")}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
        <CustomerCreateModal
          open={openCustomerModal}
          setOpen={setOpenCustomerModal}
          onCustomerCreated={fetchCustomers}
        />
      </form>
    </Form>
  );
}
