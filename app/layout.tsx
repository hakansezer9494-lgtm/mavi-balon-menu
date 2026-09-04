import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Mavi Balloon | Dijital Menü",
  description:
    "Mavi Balloon dijital menü: Antakya döner, burger ve sokak lezzetleri.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
