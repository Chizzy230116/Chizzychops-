'use client'

import Hero    from '@/app/components/Hero'
import About   from '@/app/components/About'
import Contact from '@/app/components/Contact'
import Footer  from '@/app/components/Footer'
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp'
import ScrollToTop      from '@/app/components/ScrollToTop'
import ReviewSystem     from '@/app/components/ReviewSystem'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <ReviewSystem />
      <Contact />
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </>
  )
}