import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Analitik Paneli",
  description: "Supabase destekli, tenant kapsamlı QR tarama analitik paneli."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
