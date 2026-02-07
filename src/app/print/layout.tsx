import type { Metadata } from "next";
import { Noto_Naskh_Arabic, Noto_Sans_Arabic, Poppins } from "next/font/google";
import "./print-styles.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-arabic", // CSS variable name
});

const nakshArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-naksh-arabic", // CSS variable name
});

export const metadata: Metadata = {
  title: "Print Invoice - Fatoora",
  description: "Invoice Print View",
};

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} ${notoArabic.variable} ${nakshArabic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
