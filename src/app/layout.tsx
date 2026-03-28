import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  metadataBase: new URL('https://realinflation.co'),
  title: {
    default: 'RealInflation — What Things Actually Cost in Your City',
    template: '%s | RealInflation',
  },
  description: 'Track real consumer prices for gas, rent, groceries, and fast food in your city vs. government CPI numbers. The government says inflation is 2.4%. Here is what you are actually paying.',
  keywords: ['inflation', 'cost of living', 'gas prices', 'rent prices', 'grocery prices', 'CPI', 'real inflation', 'consumer prices', 'price tracker'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://realinflation.co',
    siteName: 'RealInflation',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'RealInflation — What Things Actually Cost' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@realinflationco',
    creator: '@realinflationco',
  },
  alternates: {
    canonical: 'https://realinflation.co',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* GA4 placeholder */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script> */}
      </head>
      <body className="min-h-screen flex flex-col bg-cream">
        <Nav />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
