"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

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
  qrCodeData?: string;
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
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const url = urlParams.get("return");
      const storedUrl = sessionStorage.getItem("invoiceReturnUrl");
      setReturnUrl(url ? decodeURIComponent(url) : storedUrl || `/invoices/${invoiceId}`);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

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
          } catch {
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

                html2pdf.default()
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
    const baseAmount = item.quantity * item.price;
    if (invoice?.pricesExcludeTax) {
      return baseAmount + (baseAmount * item.taxRate) / 100;
    }
    return baseAmount;
  };

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

  const handleRedirectBack = () => {
    const urlToReturn = returnUrl || `/invoices/${invoiceId}`;
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.location.href = urlToReturn;
        window.close();
      } else {
        window.location.href = urlToReturn || "";
      }
    } catch {
      window.location.href = urlToReturn || "";
    }
  };

  return (
    <>
      {/* Redirect Back Button - Hidden when printing */}
      <div className="no-print" style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
      }}>
        <button
          onClick={handleRedirectBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            backgroundColor: "#111827",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1f2937";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#111827";
          }}
        >
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
          Back to Invoice Details
        </button>
      </div>

      <div className="invoice-container" ref={printRef}>
        {/* Header Section */}
        <div className="invoice-header">
        {/* Invoice Title and Details */}
        <div>
          <h1 className="invoice-title">Invoice</h1>
          <div className="invoice-details-grid">
            <div>
              <div className="invoice-detail-label">Invoice Number</div>
              <div className="invoice-detail-value">{invoice.invoiceNumber}</div>
            </div>
            <div>
              <div className="invoice-detail-label">Date</div>
              <div className="invoice-detail-value">{formatDate(invoice.date)}</div>
            </div>
            <div>
              <div className="invoice-detail-label">Customer</div>
              <div className="invoice-detail-value">
                {typeof invoice.customer === "object"
                  ? invoice.customer.name
                  : "Unknown"}
              </div>
            </div>
            <div>
              <div className="invoice-detail-label">Due Date</div>
              <div className="invoice-detail-value">{formatDate(invoice.dueDate)}</div>
            </div>
          </div>
        </div>

        {/* Company Logo and Details */}
        <div className="company-info">
          <div className="company-logo">
            {userData.companyLogo?.url ? (
              <Image
                src={userData.companyLogo.url}
                alt={userData.companyLogo.alt || "Company logo"}
                width={120}
                height={120}
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
          <div>
            <p className="company-name">
              {userData.companyName || "Company Name"}
            </p>
            {userData.country && (
              <p className="company-detail">{userData.country}</p>
            )}
            {userData.taxRegNum && (
              <p className="company-detail">Tax Reg: {userData.taxRegNum}</p>
            )}
            {userData.phone && (
              <p className="company-detail">{userData.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="items-section">
        <div className="items-header">
          <h2 className="items-title">Items</h2>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Prices are{" "}
            <span style={{ fontWeight: "500", color: "#374151" }}>
              {invoice.pricesExcludeTax ? "excluding tax" : "including tax"}
            </span>
          </div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Account</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Tax Rate</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.rowEntries.map((item, index) => (
              <tr key={index}>
                <td style={{ color: "#111827" }}>{item.description}</td>
                <td className="text-gray-600">{item.account}</td>
                <td className="text-center" style={{ color: "#111827" }}>
                  {item.quantity}
                </td>
                <td className="text-right" style={{ color: "#111827" }}>
                  SAR {item.price.toFixed(2)}
                </td>
                <td className="text-right text-gray-600">{item.taxRate}%</td>
                <td className="text-right font-medium" style={{ color: "#111827" }}>
                  SAR {calculateLineTotal(item).toFixed(2)}
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
            <span className="summary-label">
              Subtotal {invoice.pricesExcludeTax ? "(excl. VAT)" : "(incl. VAT)"}
            </span>
            <span className="summary-value">SAR {invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">VAT Amount</span>
            <span className="summary-value">SAR {invoice.totalTax.toFixed(2)}</span>
          </div>
          {invoice.discountTotal > 0 && (
            <div className="summary-row">
              <span className="summary-label">Discount</span>
              <span className="summary-value" style={{ color: "#dc2626" }}>
                - SAR {invoice.discountTotal.toFixed(2)}
              </span>
            </div>
          )}
          <div className="summary-total">
            <span>Total {invoice.pricesExcludeTax ? "(excl. VAT)" : "(incl. VAT)"}</span>
            <span>SAR {invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

