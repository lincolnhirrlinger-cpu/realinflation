import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://realinflation.co'),
  title: {
    default: 'RealInflation — What Things Actually Cost in Your City',
    template: '%s | RealInflation',
  },
  description: 'Track real consumer prices for gas, rent, groceries, and fast food in your city vs. government CPI numbers. The government says inflation is 2.4%. Here is what you are actually paying.',
  keywords: ['inflation', 'cost of living', 'gas prices', 'rent prices', 'grocery prices', 'CPI'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://realinflation.co',
    siteName: 'RealInflation',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@realinflation',
  },
  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  )
}
