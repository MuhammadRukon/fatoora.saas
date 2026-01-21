"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { EllipsisVertical, Eye, LucideTrash2, Plus } from "lucide-react";
import { Combobox } from "../ui/combo-box";
import { Label } from "../ui/label";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccountCreateModal } from "../modal/AccountCreateModal";
import { getAccounts, getInvoice } from "@/lib/server-functions";
import { generateInvoiceQRCode } from "@/lib/qr-code-generator";
import QRCode from "qrcode";
import { UserData } from "../container/container";
import { payload } from "@/lib/payload";

interface RowEntry {
  description: string;
  account: string;
  quantity: number;
  price: number;
  taxRate: number;
}

interface NoteData {
  documentType: "credit" | "debit";
  originalInvoice: string;
  customer: string;
  date: string;
  dueDate: string;
  reason: string;
  rowEntries: RowEntry[];
  pricesExcludeTax: boolean;
  discountTotal: number;
}

interface Account {
  id: string;
  name: string;
}

interface NoteFormProps {
  user: UserData;
  invoiceId?: string;
}

export function Note({ user, invoiceId }: NoteFormProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openAccountModal, setOpenAccountModal] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [originalInvoice, setOriginalInvoice] = useState<any>(null);
  const [invoiceType, setInvoiceType] = useState<"standard" | "simplified">("simplified");

  const form = useForm<NoteData>({
    defaultValues: {
      documentType: "credit",
      originalInvoice: invoiceId || "",
      customer: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      reason: "",
      rowEntries: [
        { description: "", account: "", quantity: 1, price: 0, taxRate: 15 },
      ],
      pricesExcludeTax: true,
      discountTotal: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rowEntries",
  });

  const rowEntries = form.watch("rowEntries");
  const discountTotal = form.watch("discountTotal");
  const noteDate = form.watch("date");
  const selectedInvoiceId = form.watch("originalInvoice");
  const documentType = form.watch("documentType");

  // Fetch accounts function
  const fetchAccounts = async () => {
    try {
      const result = await getAccounts();
      if (result.success && result.docs) {
        setAccounts(
          result.docs.map((account: any) => ({
            id: account.id,
            name: account.name,
          }))
        );
      } else {
        console.error("Error fetching accounts:", result.error);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  // Fetch invoice when selected
  useEffect(() => {
    if (selectedInvoiceId) {
      const fetchInvoice = async () => {
        try {
          const result = await getInvoice(selectedInvoiceId);
          if (result.success && result.invoice) {
            const inv = result.invoice as any;
            setOriginalInvoice(inv);
            setInvoiceType(inv.invoiceType || "simplified");
            
            // Pre-fill form with invoice data
            form.setValue("customer", typeof inv.customer === "object" ? inv.customer.id : inv.customer);
            form.setValue("date", inv.date || new Date().toISOString().split("T")[0]);
            form.setValue("dueDate", inv.dueDate || new Date().toISOString().split("T")[0]);
            
            // Pre-fill row entries from invoice (for reference, user can modify)
            if (inv.rowEntries && inv.rowEntries.length > 0) {
              form.setValue("rowEntries", inv.rowEntries.map((entry: any) => ({
                description: entry.description || "",
                account: entry.account || "",
                quantity: entry.quantity || 1,
                price: entry.price || 0,
                taxRate: entry.taxRate || 15,
              })));
            }
          }
        } catch (error) {
          console.error("Error fetching invoice:", error);
        }
      };
      fetchInvoice();
    }
  }, [selectedInvoiceId, form]);

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const pricesExcludeTax = form.watch("pricesExcludeTax");

  const calculateLineTotal = (item: RowEntry) => {
    const baseAmount = item.quantity * item.price;
    if (pricesExcludeTax) {
      return baseAmount + (baseAmount * item.taxRate) / 100;
    }
    return baseAmount;
  };

  const calculateSubtotal = () => {
    return rowEntries.reduce((sum, item) => {
      const baseAmount = item.quantity * item.price;
      if (pricesExcludeTax) {
        return sum + baseAmount;
      } else {
        const baseWithoutVAT = baseAmount / (1 + item.taxRate / 100);
        return sum + baseWithoutVAT;
      }
    }, 0);
  };

  const calculateTax = () => {
    return rowEntries.reduce((sum, item) => {
      const baseAmount = item.quantity * item.price;
      if (pricesExcludeTax) {
        return sum + (baseAmount * item.taxRate) / 100;
      } else {
        const vatAmount = baseAmount - baseAmount / (1 + item.taxRate / 100);
        return sum + vatAmount;
      }
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = subtotal + tax - discountTotal;

  // Manual QR code generation
  const handleGenerateQRCode = async () => {
    const missingFields: string[] = [];

    if (!user.companyName) missingFields.push("Company Name");
    if (!user.vatNumber) missingFields.push("Tax Registration Number");
    if (!selectedInvoiceId) missingFields.push("Original Invoice");
    if (!noteDate) missingFields.push("Note Date");
    if (total <= 0) missingFields.push("Note Total (must be greater than 0)");

    if (missingFields.length > 0) {
      alert(
        `Cannot generate QR code. The following required fields are missing:\n\n` +
          missingFields.map((field) => `• ${field}`).join("\n") +
          `\n\nPlease fill in all required fields.`
      );
      return;
    }

    try {
      const qrData = generateInvoiceQRCode({
        companyName: user.companyName || "",
        vatNumber: user.vatNumber || "",
        invoiceDate: new Date(noteDate),
        totalWithVAT: total,
        vatAmount: tax,
      });

      const qrCodeImage = await QRCode.toDataURL(qrData);
      setQrCodeDataURL(qrCodeImage);
      form.setValue("qrCodeData" as any, qrCodeImage);
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code. Please try again.");
    }
  };

  const onSubmit = async (data: NoteData) => {
    setIsSaving(true);
    try {
      // Validate QR code for simplified invoices
      if (invoiceType === "simplified" && !qrCodeDataURL) {
        alert("QR Code is mandatory for notes associated with Simplified Tax Invoices (B2C). Please generate QR code first.");
        setIsSaving(false);
        return;
      }

      const noteData = {
        documentType: data.documentType,
        originalInvoice: data.originalInvoice,
        customer: data.customer,
        date: data.date,
        dueDate: data.dueDate,
        reason: data.reason,
        rowEntries: data.rowEntries.map((entry) => ({
          description: entry.description,
          account: entry.account,
          quantity: entry.quantity,
          price: entry.price,
          taxRate: entry.taxRate,
        })),
        pricesExcludeTax: data.pricesExcludeTax,
        discountTotal: data.discountTotal,
        qrCodeData: qrCodeDataURL || "",
        subtotal,
        totalTax: tax,
        total,
      };

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create note");
      }

      const result = await response.json();
      router.push(`/notes/${result.id || result.doc?.id}`);
    } catch (error: any) {
      console.error("Error creating note:", error);
      alert(error.message || "Failed to create note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch invoices for selection
  const [invoices, setInvoices] = useState<any[]>([]);
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("/api/invoices?limit=1000");
        if (response.ok) {
          const data = await response.json();
          setInvoices(data.docs || []);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Create {documentType === "credit" ? "Credit" : "Debit"} Note
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type *</FormLabel>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="credit">Credit Note</option>
                    <option value="debit">Debit Note</option>
                  </select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="originalInvoice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Invoice *</FormLabel>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select Invoice</option>
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {typeof inv.customer === "object" ? inv.customer.name : "Customer"}
                      </option>
                    ))}
                  </select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Date *</FormLabel>
                  <Input type="date" {...field} required />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date *</FormLabel>
                  <Input type="date" {...field} required />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Note *</FormLabel>
                <Textarea
                  {...field}
                  placeholder="e.g., Return of goods, Additional charges, etc."
                  required
                />
              </FormItem>
            )}
          />

          {originalInvoice && (
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Original Invoice:</strong> {originalInvoice.invoiceNumber} 
                {" - "}
                {originalInvoice.invoiceType === "standard" ? "Standard Tax Invoice (B2B/B2G)" : "Simplified Tax Invoice (B2C)"}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ description: "", account: "", quantity: 1, price: 0, taxRate: 15 })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Description</th>
                    <th className="border p-2 text-left">Account</th>
                    <th className="border p-2 text-left">Qty</th>
                    <th className="border p-2 text-left">Price</th>
                    <th className="border p-2 text-left">VAT %</th>
                    <th className="border p-2 text-left">Total</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="border p-2">
                        <Input
                          {...form.register(`rowEntries.${index}.description`)}
                          placeholder="Item description"
                        />
                      </td>
                      <td className="border p-2">
                        <Combobox
                          options={accounts.map((acc) => ({
                            label: acc.name,
                            value: acc.id,
                          }))}
                          value={form.watch(`rowEntries.${index}.account`)}
                          onChange={(value) =>
                            form.setValue(`rowEntries.${index}.account`, value)
                          }
                          placeholder="Select account"
                          showCreateButton={true}
                          handleCreate={() => setOpenAccountModal(true)}
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min="1"
                          {...form.register(`rowEntries.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register(`rowEntries.${index}.price`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="border p-2">
                        <Combobox
                          options={[
                            { label: "15% VAT", value: "15" },
                            { label: "10% VAT", value: "10" },
                            { label: "0% VAT", value: "0" },
                          ]}
                          value={String(form.watch(`rowEntries.${index}.taxRate`) || "15")}
                          onChange={(value) =>
                            form.setValue(`rowEntries.${index}.taxRate`, parseFloat(value))
                          }
                          placeholder="VAT %"
                          showCreateButton={false}
                        />
                      </td>
                      <td className="border p-2">
                        {calculateLineTotal(rowEntries[index]).toFixed(2)} SAR
                      </td>
                      <td className="border p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <LucideTrash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                <input
                  type="checkbox"
                  checked={pricesExcludeTax}
                  onChange={(e) => form.setValue("pricesExcludeTax", e.target.checked)}
                />
                <span className="ml-2">Prices exclude tax</span>
              </Label>
            </div>

            <FormField
              control={form.control}
              name="discountTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Total</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    value={field.value || 0}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{subtotal.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span>{tax.toFixed(2)} SAR</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-{discountTotal.toFixed(2)} SAR</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{total.toFixed(2)} SAR</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-semibold">QR Code</Label>
                <p className="text-sm text-gray-500">
                  {invoiceType === "simplified"
                    ? "Required for Simplified Tax Invoice notes (B2C)"
                    : "Optional for Standard Tax Invoice notes (B2B)"}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={handleGenerateQRCode}>
                Generate QR Code
              </Button>
            </div>

            {qrCodeDataURL && (
              <div className="flex items-center gap-4">
                <Image
                  src={qrCodeDataURL}
                  alt="QR Code"
                  width={150}
                  height={150}
                  className="border rounded"
                />
                <div className="text-sm text-gray-600">
                  <p>QR Code generated successfully</p>
                  {invoiceType === "simplified" && (
                    <p className="text-green-600 mt-1">✓ Required field completed</p>
                  )}
                </div>
              </div>
            )}

            {invoiceType === "simplified" && !qrCodeDataURL && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ QR Code is mandatory for notes associated with Simplified Tax Invoices (B2C)
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Note"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      {/* <AccountCreateModal
        open={openAccountModal}
        setOpen={setOpenAccountModal}
        onSuccess={fetchAccounts}
      /> */}
    </div>
  );
}

