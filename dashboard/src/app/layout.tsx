import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Government Dashboard",
  description: "Secure access to athlete data",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
