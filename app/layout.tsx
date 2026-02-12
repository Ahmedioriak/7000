
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "Binaa Accountant - نظام بناء المحاسبي",
  description: "نظام محاسبي متكامل لشركات المقاولات بدعم الذكاء الاصطناعي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${tajawal.variable} font-sans bg-[#f8f9fc] text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
