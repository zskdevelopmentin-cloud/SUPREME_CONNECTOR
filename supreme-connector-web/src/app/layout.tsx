import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Supreme Connector",
  description: "Connect your local ERP systems to the cloud.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
