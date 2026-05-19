import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'


export default function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080d1a' }}>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <FAQ />
        <Contact />

      </main>
      <Footer />
    </div>
  )
}
