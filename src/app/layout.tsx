import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather App",
  description: "Real-time weather application",
};

import { UnitProvider } from "@/components/unit-context";

import { StarsBackground } from "@/components/stars-background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased relative`} suppressHydrationWarning>
        <StarsBackground />
        <UnitProvider>
          {children}
        </UnitProvider>
      </body>
    </html>
  );
}
