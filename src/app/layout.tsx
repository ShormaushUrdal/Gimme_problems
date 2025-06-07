import type { Metadata } from "next";
import { Inter, Recursive } from "next/font/google";
import "./globals.css";

const inter = Recursive({ subsets: ["latin-ext"] });

export const metadata: Metadata = {
  title: "Gimme Problems",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
