"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

interface Note {
  id: string;
  noteNumber: string;
  documentType: "credit" | "debit";
  originalInvoice: {
    id: string;
    invoiceNumber: string;
    invoiceType: "standard" | "simplified";
  };
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
  reason: string;
  rowEntries: RowEntry[];
  pricesExcludeTax: boolean;
  discountTotal: number;
  subtotal: number;
  totalTax: number;
  total: number;
  qrCodeData?: string;
}

interface NotePrintViewProps {
  noteId: string;
  userData: UserData;
}

export function NotePrintView({ noteId, userData }: NotePrintViewProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [actionTriggered, setActionTriggered] = useState(false);

  const fetchNote = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}`);
      if (response.ok) {
        const data = await response.json();
        setNote(data);
      } else {
        console.error("Failed to fetch note");
      }
    } catch (error) {
      console.error("Error fetching note:", error);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  // Wait for images to load
  useEffect(() => {
    if (!isLoading && note && printRef.current) {
      const checkImagesLoaded = () => {
        const images = printRef.current?.querySelectorAll("img");
        if (!images || images.length === 0) {
          setIsReady(true);
          return;
        }

        let loadedCount = 0;
        const totalImages = images.length;

        const checkComplete = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setTimeout(() => {
              setIsReady(true);
            }, 300);
          }
        };

        images.forEach((img) => {
          if (img.complete) {
            checkComplete();
          } else {
            img.onload = checkComplete;
            img.onerror = checkComplete;
          }
        });
      };

      checkImagesLoaded();
    }
  }, [isLoading, note]);

  // Auto-print when ready
  useEffect(() => {
    if (isReady && !actionTriggered) {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldPrint = urlParams.get("print") === "true";
      const shouldPDF = urlParams.get("pdf") === "true";

      if (shouldPrint || shouldPDF) {
        setActionTriggered(true);
        setTimeout(() => {
          if (shouldPrint) {
            window.print();
          }
        }, 500);
      }
    }
  }, [isReady, actionTriggered]);

  const calculateLineTotal = (item: RowEntry) => {
    const baseAmount = item.quantity * item.price;
    if (note?.pricesExcludeTax) {
      return baseAmount + (baseAmount * item.taxRate) / 100;
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading note...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Note not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8" ref={printRef}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-gray-200">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {note.documentType === "credit" ? "Credit Note" : "Debit Note"}
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
              {typeof note.originalInvoice === "object" && note.originalInvoice.invoiceType === "standard"
                ? "Standard Tax Invoice Note (B2B/B2G)"
                : "Simplified Tax Invoice Note (B2C)"}
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Note Number</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {note.noteNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Date</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(note.date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Original Invoice</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {typeof note.originalInvoice === "object"
                    ? note.originalInvoice.invoiceNumber
                    : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Due Date</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(note.dueDate)}
                </p>
              </div>
            </div>
            {note.reason && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 uppercase">Reason</p>
                <p className="text-sm text-gray-700 mt-1">{note.reason}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center justify-center w-32 h-32 relative">
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
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="*:py-3 *:px-4 *:font-semibold text-gray-700">
                <th className="text-left">Description</th>
                <th className="text-left">Account</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Tax Rate</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {note.rowEntries.map((item, index) => (
                <tr key={index} className="border-b *:px-4 *:py-4">
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

        {/* Summary Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-4">
          {note.qrCodeData && (
            <div className="flex flex-col items-center md:items-start">
              <div className="rounded-lg p-3">
                <Image
                  src={note.qrCodeData}
                  alt="Note QR Code"
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

          <div
            className={`w-full ${note.qrCodeData ? "md:w-auto md:min-w-[280px]" : "md:max-w-xs md:ml-auto"} space-y-2`}
          >
            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
              <span className="text-gray-600">
                Subtotal {note.pricesExcludeTax ? "(excl. VAT)" : "(incl. VAT)"}
              </span>
              <span className="font-medium text-gray-900">
                SAR {note.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
              <span className="text-gray-600">VAT Amount</span>
              <span className="font-medium text-gray-900">
                SAR {note.totalTax.toFixed(2)}
              </span>
            </div>
            {note.discountTotal > 0 && (
              <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">
                  - SAR {note.discountTotal.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg py-1 mt-2">
              <span className="text-gray-900">Total (incl. VAT)</span>
              <span className="text-gray-900">SAR {note.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



