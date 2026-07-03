import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bulkaf.com"),
  title: "BulkAF",
  description: "Dreckig hoch. Kein Gemüse-Gerede.",
  openGraph: {
    title: "BulkAF",
    description: "Dreckig hoch. Kein Gemüse-Gerede.",
    url: "https://bulkaf.com",
    siteName: "BulkAF",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BulkAF",
    description: "Dreckig hoch. Kein Gemüse-Gerede.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/dist/tabler-icons.min.css"
        />
      </head>
      <body className={`${bebas.variable} ${inter.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
