import type { Metadata } from "next";
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";

import { Navbar } from "@/components/ui/navbar";
import { cn } from "@/lib/cn";

import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400"],
});

const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "devroast",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(jetBrainsMono.variable, ibmPlexMono.variable)}
        suppressHydrationWarning
      >
        <div className="min-h-screen bg-bg-page text-text-primary">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
