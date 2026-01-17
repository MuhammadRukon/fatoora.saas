interface QRCodeData {
  sellerName: string;
  vatRegistrationNumber: string;
  timestamp: string; // ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ
  invoiceTotal: string; // Total including VAT
  vatTotal: string; // Total VAT amount
}

function getTLVForValue(tagNum: string, tagValue: string): Buffer {
  console.log(tagNum, tagValue);
  // Convert tag number to buffer (1 byte)
  const tagBuf = Buffer.from([parseInt(tagNum)]);

  // Convert value to UTF-8 buffer
  const tagValueBuf = Buffer.from(tagValue, "utf8");

  // Get length of value buffer (1 byte)
  const tagValueLenBuf = Buffer.from([tagValueBuf.length]);

  // Concatenate: Tag + Length + Value
  const bufsArray = [tagBuf, tagValueLenBuf, tagValueBuf];
  return Buffer.concat(bufsArray);
}

export function generateZATCAQRCode(data: QRCodeData): string {
  // Generate TLV for each of the 5 required fields
  const sellerNameTLV = getTLVForValue("1", data.sellerName);
  const vatRegTLV = getTLVForValue("2", data.vatRegistrationNumber);
  const timestampTLV = getTLVForValue("3", data.timestamp);
  const invoiceTotalTLV = getTLVForValue("4", data.invoiceTotal);
  const vatTotalTLV = getTLVForValue("5", data.vatTotal);

  // Concatenate all TLV buffers into single buffer
  // This creates the complete QR code data structure
  const bufsArray = [
    sellerNameTLV,
    vatRegTLV,
    timestampTLV,
    invoiceTotalTLV,
    vatTotalTLV,
  ];
  const qrCodeBuffer = Buffer.concat(bufsArray);

  // Encode to Base64 as required by ZATCA
  return qrCodeBuffer.toString("base64");
}

export function formatAmount(value: number): string {
  return value.toFixed(2);
}

export function formatTimestamp(date: Date): string {
  // ZATCA requires ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ (without milliseconds)
  return date.toISOString().split(".")[0] + "Z";
}

export function generateInvoiceQRCode(params: {
  companyName: string;
  vatNumber: string;
  invoiceDate: Date;
  totalWithVAT: number;
  vatAmount: number;
}): string {
  const qrData: QRCodeData = {
    sellerName: params.companyName,
    vatRegistrationNumber: params.vatNumber,
    timestamp: formatTimestamp(params.invoiceDate),
    invoiceTotal: formatAmount(params.totalWithVAT),
    vatTotal: formatAmount(params.vatAmount),
  };

  return generateZATCAQRCode(qrData);
}
