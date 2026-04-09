'use client'

import Menu from './Menu'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import ScrollToTop from '@/app/components/ScrollToTop'
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp'

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px', background: 'var(--brand-surface)', minHeight: '100vh' }}>
        <Menu />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </>
  )
}