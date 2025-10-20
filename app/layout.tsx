import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "G+ | Grace's Project Manager",
  description: "Luxurious personal project management for Grace Cha",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
