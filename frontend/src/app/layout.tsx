import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Digital Bank Core - Modern Digital Banking Platform",
  description: "Enterprise-grade omnichannel digital banking portal built with Next.js 15 & Spring Boot 3.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0D1527] text-slate-100 selection:bg-[#A3E635] selection:text-slate-950">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" closeButton theme="dark" />
        </QueryProvider>
      </body>
    </html>
  );
}
