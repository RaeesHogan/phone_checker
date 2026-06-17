import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

const sarabun = Sarabun({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"] 
});

export const metadata: Metadata = {
  title: "Reservation Lock System",
  description: "Customer Reservation Lock System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={sarabun.className}>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
