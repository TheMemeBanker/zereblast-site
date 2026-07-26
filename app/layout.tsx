import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zereblast.org",
  description: "The arcade never closed. It evolved.",
  openGraph: {
    title: "zereblast.org",
    description: "The arcade never closed. It evolved.",
    siteName: "zereblast.org",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${pressStart.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
