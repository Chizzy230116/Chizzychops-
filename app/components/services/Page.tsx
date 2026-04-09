import Navbar           from '@/app/components/Navbar'
import Services         from '@/app/components/services/layout'
import Footer           from '@/app/components/Footer'
import ScrollToTop      from '@/app/components/ScrollToTop'
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp'

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '68px' }}>
        <Services />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </>
  )
}