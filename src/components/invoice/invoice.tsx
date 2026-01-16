"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { EllipsisVertical, LucideTrash2, Plus } from "lucide-react";
import { Combobox } from "../ui/combo-box";
import { Label } from "../ui/label";
import Image from "next/image";

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
}

export function Invoice() {
  const form = useForm<InvoiceData>({
    defaultValues: {
      customer: "",
      invoiceNumber: "INV-000100",
      date: "2026-01-16",
      dueDate: "2026-01-16",
      rowEntries: [{ description: "", account: "", quantity: 1, price: 0, taxRate: 0 }],
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

  const onSubmit = (data: InvoiceData) => {
    console.log("Form submitted:", data);
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
                      options={[
                        { label: "Muhammad", value: "200113" },
                        { label: "Anwar", value: "200110" },
                      ]}
                      placeholder="select"
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

          {/* Logo Upload Section */}
          <div className=" flex flex-col order-1 lg:order-2 gap-2 text-center lg:text-right lg:justify-self-end justify-self-center">
            <Label className="justify-center">Company details</Label>
            <div className="border border-gray-200 shadow-xs flex items-center justify-center w-60 h-60 relative rounded-lg">
              <Image src="/logo.png" alt="logo" fill className="object-contain" />
            </div>

            <div className="text-sm">
              <p className="font-semibold text-gray-900">Freelance</p>
              <p className="text-gray-600">Bangladesh</p>
              <p className="text-gray-600">Tax registration number: —</p>
            </div>
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
                          <Combobox {...field} placeholder="select" options={[]} />
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

        {/* Summary Section */}
        <div className="flex justify-end mt-8">
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
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save Invoice
          </Button>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
