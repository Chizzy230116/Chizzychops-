import type { Metadata } from 'next'
import { Playfair_Display, Nunito } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chizzychops & Grillz | Delicious Home-Made Meals & Grills in Lagos',
  description: 'Fresh, tasty African dishes, grills, and home-made meals delivered fast in Lagos. Order now via WhatsApp. 4.9-star rated restaurant in Akowonjo.',
  keywords: 'Nigerian food Lagos, African dishes delivery, grilled chicken Lagos, food delivery Akowonjo, Chizzychops, home made meals Lagos',
  icons: {
    icon: [
      { url: '/favicon.ico',    sizes: 'any',      type: 'image/x-icon' },
      { url: '/icon.png',       sizes: '32x32',    type: 'image/png'    },
      { url: '/logo-192.png',   sizes: '192x192',  type: 'image/png'    },
      { url: '/logo-512.png',   sizes: '512x512',  type: 'image/png'    },
    ],
    apple: { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Chizzychops & Grillz | Best Grills & African Dishes in Lagos',
    description: 'Deliciously made, lovingly served. Order fresh African meals & grills in Lagos.',
    type: 'website',
    images: [{ url: '/logo-512.png', width: 512, height: 512, alt: 'Chizzychops & Grillz Logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'Chizzychops & Grillz',
    description: 'Deliciously made, lovingly served.',
    images: ['/logo-512.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Force favicon for local dev — Next.js sometimes misses .ico without this */}
        <link rel="icon"             href="/favicon.ico"    sizes="any" />
        <link rel="icon"             href="/icon.png"       type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
        <link rel="manifest"         href="/site.webmanifest" />
        <meta name="theme-color" content="#F97316" />
      </head>
      <body className={`${playfair.variable} ${nunito.variable} font-body antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}