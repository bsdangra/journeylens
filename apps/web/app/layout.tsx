import type { Metadata } from "next";
import { AppShell } from "@/components/shell/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { CatalogProvider } from "@/lib/catalog/store";
import "./globals.css";
import "./workspace.css";

export const metadata: Metadata = {
  title: "JourneyLens | Website UX Evaluation",
  description:
    "AI-assisted website experience evaluation through simulated user journeys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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