'use client'

import Navbar          from '@/app/components/Navbar'
import Hero            from '@/app/components/Hero'
import About           from '@/app/components/About'
import ReviewSystem    from '@/app/components/ReviewSystem'
import Menu            from '@/app/components/Menu'
import Services        from '@/app/components/Sservices'
import Contact         from '@/app/components/Contact'
import Footer          from '@/app/components/Footer'
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp'
import ScrollToTop      from '@/app/components/ScrollToTop'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>
        <Hero />
        <About />
        <Menu />
        <Services />
        <ReviewSystem />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </>
  )
}