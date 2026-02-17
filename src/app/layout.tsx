
import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import SmoothScrolling from "../components/SmoothScrolling";

import AuthProvider from "../components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "Virtual Try-On | Experience the Future of Fashion",
  description: "Try on clothes virtually with our advanced AR and 3D technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable}`}>
        <AuthProvider>
          <SmoothScrolling />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
