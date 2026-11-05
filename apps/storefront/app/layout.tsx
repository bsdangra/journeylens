import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeCart | Modern Shopping",
  description: "A sleek e-commerce storefront with login and home shopping experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
