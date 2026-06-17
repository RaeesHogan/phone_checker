import type { Metadata } from "next";
import { Sarabun, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="th" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={sarabun.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
