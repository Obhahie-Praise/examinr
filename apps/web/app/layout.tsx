import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

/**
 * DM Sans is Examinr's primary typeface.
 * Next.js downloads and self-hosts the font files at build time.
 * The browser does not make a request to Google Fonts at runtime.
 *
 * The CSS variable --font-dm-sans is referenced in globals.css @theme
 * to set --font-sans, which Tailwind's font-sans utility class resolves to.
 */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  // Include common weights used across the product.
  // Using an array pins specific weights for optimal font loading.
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Examinr",
  description:
    "AI-powered examination preparation and personalised learning platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
       * dmSans.variable injects --font-dm-sans onto the body element.
       * font-sans applies Tailwind's sans-serif font stack, which resolves
       * to --font-sans → --font-dm-sans (configured in globals.css @theme).
       * antialiased applies -webkit-font-smoothing for crisper rendering.
       */}
      <body className={`${dmSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
