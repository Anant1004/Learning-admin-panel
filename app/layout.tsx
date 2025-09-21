import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import AuthWrapper from "@/components/AuthWrapper"; // naya wrapper import

export const metadata: Metadata = {
  title: "App App",
  description: "Created with App",
  generator: "App.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthWrapper>{children}</AuthWrapper>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
