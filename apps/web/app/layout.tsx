import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import Link from "next/link";
import { Google_Sans, Google_Sans_Code, Figtree } from "next/font/google";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const googleSansCode = Google_Sans_Code({
  variable: "--font-google-sans-code",
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: "examinr ai",
  description: "prepare for every exam completely for freee",
  icons: {
    icon: "/favicon.svg"
  },
  openGraph: {
    type: "website",
    siteName: "openrep",
    locale: "en_US",
    url: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <body className={`${googleSans.variable} ${googleSansCode.variable} bg-neutral-50 dark:bg-neutral-950 lowercase tracking-tight`}>
      <NextTopLoader
          color="#3b82f6"
          height={2}
          showSpinner={false}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
        />
        {children}
      </body>
    </html>
  );
}
