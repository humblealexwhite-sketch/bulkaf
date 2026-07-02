import type { Metadata } from "next";
import { Oswald, Work_Sans } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-worksans",
});

export const metadata: Metadata = {
  title: "BulkAF",
  description: "Dreckig hoch. Kein Gemüse-Gerede.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${oswald.variable} ${workSans.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
