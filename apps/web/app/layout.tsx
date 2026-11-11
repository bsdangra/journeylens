import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { CatalogProvider } from "@/lib/catalog/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JourneyLens",
    template: "%s · JourneyLens",
  },
  description:
    "Evaluate website user journeys through simulated personas, with evidence for every finding.",
};

export const viewport: Viewport = {
  themeColor: "#0c111d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <CatalogProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
