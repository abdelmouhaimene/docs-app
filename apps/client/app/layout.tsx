import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/lib/redux/StoreProvider";
import ThemeProvider from "@/lib/theme/ThemeProvider";
import AuthGuard from "@/components/AuthGuard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import localFont from "next/font/local";

const geistSans = localFont({
  src: [
    {
      path: "../public/fonts/Geist-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Geist-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../public/fonts/Geist[wght].woff2",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "MCA Document Management System",
  description: "Document management system for MCA company",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <ThemeProvider>
            <AuthGuard>{children}</AuthGuard>
            <ToastContainer position="top-right" autoClose={3000} />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
