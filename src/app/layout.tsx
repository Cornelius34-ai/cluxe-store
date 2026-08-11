import type { Metadata } from "next";
import { Geist, Geist_Mono, Italiana } from "next/font/google";
import "./globals.css";

import { Nav } from "@/components/Nav";
import { ThemeProvider } from "@/components/theme-provider";
import { themeInitScript } from "@/lib/theme-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "cluxe",
  description: "cluxe - Modern clothing storefront",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${italiana.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <Nav />
          <div className="flex-1">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
