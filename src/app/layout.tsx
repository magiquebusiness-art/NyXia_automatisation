import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "NyXia IA — Automatisation",
  description: "NyXia IA - Système d'automatisation intelligent. Marketing & Conversion.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Orbitron:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0A1628] text-[#D6D9F0]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
