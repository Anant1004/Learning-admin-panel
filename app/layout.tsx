import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from "react-hot-toast";
import './globals.css'

export const metadata: Metadata = {
  title: 'App App',
  description: 'Created with App',
  generator: 'App.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
           <Toaster position="top-right" reverseOrder={false} />
        <Analytics />
      </body>
    </html>
  )
}
