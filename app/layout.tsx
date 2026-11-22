import type { Metadata, Viewport } from "next";
import { Bungee, Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const bungee = Bungee({ variable: "--font-bungee", weight: "400", subsets: ["latin"] });
const pressStart = Press_Start_2P({ variable: "--font-press-start", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZEREBLAST",
  description: "A pocket arcade cartridge. Blast the glitch, clear the daily missions, climb the ranks.",
  openGraph: {
    title: "ZEREBLAST",
    description: "A pocket arcade cartridge. Blast the glitch, clear the daily missions, climb the ranks.",
    siteName: "ZEREBLAST",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#F3EDE0" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${bungee.variable} ${pressStart.variable}`}>
      <body>{children}</body>
    </html>
  );
}
