import type { Metadata } from 'next'
import Navbar           from '@/app/components/Navbar'
import Menu             from '@/app/components/Menu'
import Footer           from '@/app/components/Footer'
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp'
import ScrollToTop      from '@/app/components/ScrollToTop'

export const metadata: Metadata = {
  title: 'Our Menu | Chizzychops & Grillz',
  description: 'Browse our full menu — soups, stews, rice, pasta, food boxes and more. Fresh Nigerian home-cooked meals delivered across Lagos.',
}

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>
        <Menu />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </>
  )
}