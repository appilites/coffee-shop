import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/context/cart-context"
import { AuthProvider } from "@/lib/context/auth-context"
import { LoyaltyProvider } from "@/lib/context/loyalty-context"
import { MobileNav } from "@/components/mobile-nav"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Druids Nutrition - Coffee, Tea & Protein Drive-Through",
  description:
    "Order premium coffee, refreshing teas, and power-packed protein drinks for quick drive-through pickup. Skip the line, fuel your day.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo.png",
        type: "image/png",
      },
    ],
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <CartProvider>
          <AuthProvider>
            <LoyaltyProvider>
              {children}
              <MobileNav />
              <Toaster />
            </LoyaltyProvider>
          </AuthProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
