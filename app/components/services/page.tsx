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
        {/* Page hero strip */}
        <div style={{
          background: 'linear-gradient(135deg, #120600 0%, #1A0800 60%, #120600 100%)',
          padding: '3rem 0 2.5rem',
          borderBottom: '1px solid rgba(249,115,22,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:'-4rem', left:'-4rem', width:'20rem', height:'20rem', borderRadius:'50%', background:'radial-gradient(circle,rgba(220,38,38,0.07),transparent 70%)', pointerEvents:'none' }} />
          <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 clamp(1.125rem,3vw,2.5rem)' }}>
            <span style={{ display:'block', fontSize:'0.6875rem', fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'#F97316', marginBottom:'0.625rem' }}>
              What We Offer
            </span>
            <h1 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(1.875rem,4vw,2.875rem)', fontWeight:700, color:'#fff', lineHeight:1.15, marginBottom:'0.75rem' }}>
              Our <span style={{ background:'linear-gradient(135deg,#F97316,#FBBF24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Services</span>
            </h1>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.9375rem', maxWidth:'30rem', lineHeight:1.75 }}>
              Delivery, catering, bulk orders and gift boxes — all freshly made from our home kitchen.
            </p>
          </div>
        </div>
        <Services />
        <ReviewSystem />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </>
  )
}