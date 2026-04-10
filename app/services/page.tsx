import type { Metadata } from 'next'
import Navbar           from '@/app/components/Navbar'
import Services         from '@/app/components/Sservices'
import ReviewSystem     from '@/app/components/ReviewSystem'
import Footer           from '@/app/components/Footer'
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp'
import ScrollToTop      from '@/app/components/ScrollToTop'

export const metadata: Metadata = {
  title: 'Services | Chizzychops & Grillz',
  description: 'Home delivery, takeaway, event catering, bulk orders and gift boxes — Chizzychops & Grillz delivers across Lagos.',
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>
        <Services />
        <ReviewSystem />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </>
  )
}