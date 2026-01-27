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



interface InvoicePrintViewProps {
  invoiceId: string;
  userData: UserData;
}

export function InvoicePrintView({ invoiceId, userData }: InvoicePrintViewProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [actionTriggered, setActionTriggered] = useState(false);

  const fetchInvoice = useCallback(async () => {
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
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  // Wait for images to load
  useEffect(() => {
    if (!isLoading && invoice && printRef.current) {
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
            // Additional delay to ensure rendering is complete
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
            img.onerror = checkComplete; // Continue even if image fails to load
          }
        });
      };

      // Wait for DOM to be ready
      setTimeout(() => {
        checkImagesLoaded();
      }, 100);
    }
  }, [isLoading, invoice]);

  // Trigger print/PDF after everything is ready
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isReady || !invoice || actionTriggered) return;

    const urlParams = new URLSearchParams(window.location.search);
    const autoPrint = urlParams.get("print") === "true";
    const downloadPDF = urlParams.get("pdf") === "true";
    const returnUrl = urlParams.get("return");

    if (autoPrint || downloadPDF) {
      setActionTriggered(true);

      const redirectBack = () => {
        const urlToReturn = returnUrl
          ? decodeURIComponent(returnUrl)
          : sessionStorage.getItem("invoiceReturnUrl")
            ? sessionStorage.getItem("invoiceReturnUrl")
            : `/invoices/${invoiceId}`;

        setTimeout(() => {
          try {
            if (window.opener && !window.opener.closed) {
              // If opened from parent window, redirect parent and close this window
              window.opener.location.href = urlToReturn;
              window.close();
            } else {
              // If same window or opener blocked, redirect this window
              window.location.href = urlToReturn || "";
            }
          } catch (error) {
            console.error("Error redirecting back:", error);
            // If cross-origin or blocked, just close the window
            // User will remain on their original page
            window.close();
          }
        }, 1500);
      };

      if (autoPrint) {
        // Wait a bit more to ensure everything is rendered
        setTimeout(() => {
          window.print();

          // Handle print dialog close/cancel
          const handleAfterPrint = () => {
            redirectBack();
            window.removeEventListener("afterprint", handleAfterPrint);
          };

          // Modern browsers
          window.addEventListener("afterprint", handleAfterPrint);

          // Fallback for older browsers - check if print dialog is still open
          // This is a workaround since afterprint might not fire in all cases
          setTimeout(() => {
            redirectBack();
          }, 500);
        }, 500);
      } else if (downloadPDF) {
        // Generate PDF using html2pdf
        setTimeout(() => {
          import("html2pdf.js")
            .then((html2pdf) => {
              const element = printRef.current;
              if (element) {
                const opt = {
                  margin: [5, 5, 5, 5],
                  filename: `invoice-${invoice.invoiceNumber}.pdf`,
                  image: { type: "jpeg", quality: 0.98 },
                  html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight,
                  },
                  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                };

                html2pdf
                  .default()
                  .set(opt as any)
                  .from(element)
                  .save()
                  .then(() => {
                    // Redirect after PDF is saved
                    redirectBack();
                  })
                  .catch((error) => {
                    console.error("Error generating PDF:", error);
                    alert("Failed to generate PDF. Please try again.");
                    redirectBack();
                  });
              }
            })
            .catch((error) => {
              console.error("Error loading PDF library:", error);
              alert("Failed to generate PDF. Please try again.");
              redirectBack();
            });
        }, 500);
      }
    }
  }, [isReady, invoice, actionTriggered, invoiceId]);

  const calculateLineTotal = (item: RowEntry) => {
    const baseAmount = item.quantity * item.price;
    if (invoice?.pricesExcludeTax) {
      return baseAmount + (baseAmount * item.taxRate) / 100;
    }
    return baseAmount;
  };

  const formatAddress = (address?: {
    buildingNumber?: string;
    streetName?: string;
    streetNameArabic?: string;
    districtArabic?: string;
    cityArabic?: string;
    countryArabic?: string;
    district?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }, language: 'arabic' | 'english' = 'english') => {
    if (!address) return "N/A";

    let parts = [];
    if(language === 'arabic') {
      parts = [
        address.buildingNumber,
        address.streetNameArabic,
        address.districtArabic,
        address.cityArabic,
        address.postalCode,
        address.countryArabic,
      ].filter(Boolean);
    }
    else {
      parts = [
      address.buildingNumber,
      address.streetName,
      address.district,
      address.city,
      address.postalCode,
      address.country,
    ].filter(Boolean);

  };
  return parts.length > 0 ? parts.join(", ") : "N/A";
}

  if (isLoading) {
    return (
      <div className="invoice-container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#6b7280" }}>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#6b7280", fontSize: "18px" }}>Invoice not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-container" ref={printRef}>
      {/* Header Section */}
      <div className="invoice-header">
        <div className="company-details">
          <p className="company-name">{userData.companyName || "Company Name"}</p>
          {userData.address && (
            <p className="company-detail">{formatAddress(userData.address)}</p>
          )}
          {userData.vatNumber && (
            <p className="company-detail">
              <span> Vat Number: </span> {userData.vatNumber}
            </p>
          )}
          {userData.phone && <p className="company-detail"><span> Phone Number: </span>{userData.phone}</p>}
        </div>
        <div className="company-logo">
          {userData.companyLogo?.url ? (
            <Image
              src={userData.companyLogo.url}
              alt={userData.companyLogo.alt || "Company logo"}
              fill
              style={{ objectFit: "contain" }}
            />
          ) : (
            <Image
              src="/logo.png"
              alt="logo"
              width={120}
              height={120}
              style={{ objectFit: "contain" }}
            />
          )}
        </div>
        {/* arabic */}
        <div style={{ textAlign: "right" }} className="company-details">
          <p className="company-name">{userData.companyNameArabic || ""}</p>
          {userData.address && (
            <p className="company-detail">{formatAddress(userData.address , 'arabic')}</p>
          )}
          {userData.vatNumber && (
            <p className="company-detail">
              <span> رقم ضريبة القيمة المضافة: </span> {userData.vatNumber}
            </p>
          )}
          {userData.phone && <p className="company-detail">
            <span>رقم التليفون: </span> {userData.phone}
            </p>}
        </div>
      </div>

      {/* Invoice Title and Details */}
      <div className="invoice-details">
        <h1 className="invoice-title">
          {invoice.invoiceType === "standard" ? "Tax Invoice" : "Simplified Tax Invoice"}{" "}
          <span>
            {invoice.invoiceType === "standard" ? "فاتورة ضريبية" : "فاتورة ضريبية مبسطة"}
          </span>
        </h1>
        <div>
          <div className="invoice-detail-row">
            <div className="invoice-detail-label" style={{ textAlign: "left" }}>
              Invoice Number
            </div>
            <div className="invoice-detail-value">{invoice.invoiceNumber}</div>
            <div className="invoice-detail-label" style={{ textAlign: "right" }}>
              رقم الفاتورة
            </div>
          </div>

          <div className="invoice-detail-row">
            <div className="invoice-detail-label" style={{ textAlign: "left" }}>
              Date
            </div>
            <div className="invoice-detail-value">{formatDate(invoice.date)}</div>
            <div className="invoice-detail-label" style={{ textAlign: "right" }}>
              تاريخ
            </div>
          </div>

          <div className="invoice-detail-row">
            <div className="invoice-detail-label" style={{ textAlign: "left" }}>
              Due Date
            </div>
            <div className="invoice-detail-value">{formatDate(invoice.dueDate)}</div>
            <div className="invoice-detail-label" style={{ textAlign: "right" }}>
              تاريخ الاستحقاق
            </div>
          </div>

          <div className="invoice-detail-row">
            <div className="invoice-detail-label" style={{ textAlign: "left" }}>
              Customer
            </div>
            <div className="invoice-detail-value">{invoice.customer.name}</div>
            <div className="invoice-detail-label" style={{ textAlign: "right" }}>
              العميل
            </div>
          </div>

          <div className="invoice-detail-row">
            <div className="invoice-detail-label" style={{ textAlign: "left" }}>
              Address
            </div>
            <div className="invoice-detail-value">
              {formatAddress(invoice.customer.address)}
            </div>
            <div className="invoice-detail-label" style={{ textAlign: "right" }}>
              العنوان
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="items-section">
        <table className="items-table">
          <thead>
            <tr>
              <th>
                No. <span style={{ display: "block" }}>الرقم</span>
              </th>
              <th>
                Description <span style={{ display: "block" }}>الوصف</span>
              </th>
              <th>
                Account <span style={{ display: "block" }}>الحساب</span>
              </th>
              <th className="text-center">
                Qty <span style={{ display: "block" }}>الكمية</span>
              </th>
              <th className="text-right">
                Price <span style={{ display: "block" }}>السعر</span>
              </th>
              <th className="text-right">
                Tax Rate <span style={{ display: "block" }}> القيمة المضافة</span>
              </th>
              <th className="text-right">
                Total <span style={{ display: "block" }}>المجموع</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.rowEntries.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>{item.account}</td>
                <td>{item.quantity}</td>
                <td>{item.price.toFixed(2)}</td>
                <td className="text-center">{item.taxRate}%</td>
                <td className="text-right font-medium" style={{ color: "#111827" }}>
                  {calculateLineTotal(item).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section with QR Code */}
      <div className="summary-section">
        {/* QR Code Section */}
        {invoice.qrCodeData && (
          <div className="qr-code-container">
            <div>
              <Image
                src={invoice.qrCodeData}
                alt="Invoice QR Code"
                width={150}
                height={150}
                style={{ borderRadius: "4px" }}
              />
              <p className="qr-code-label">ZATCA E-Invoice QR Code</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="summary-box">
          <div className="summary-row">
            <p className="summary-label">
              Subtotal <span style={{ display: "block" }}>المجموع الفرعي</span>
            </p>
            <p className="summary-value">SAR {invoice.subtotal.toFixed(2)}</p>
          </div>
          <div className="summary-row">
            <p className="summary-label">
              Total VAT{" "}
              <span style={{ display: "block" }}>إجمالي ضريبة القيمة المضافة</span>
            </p>
            <p className="summary-value">SAR {invoice.totalTax.toFixed(2)}</p>
          </div>
          <div className="summary-row">
            <p style={{ marginRight: "10px" }}>
              Total including VAT{" "}
              <span style={{ display: "block" }}>
                الإجمالي شاملاً ضريبة القيمة المضافة
              </span>
            </p>
            <p>SAR {invoice.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
