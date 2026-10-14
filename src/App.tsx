import AuroraField from './components/Background/AuroraField'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import ProjectShowcase from './components/Work/ProjectShowcase'
import StackMarquee from './components/Stack/StackMarquee'
import Experience from './components/Experience/Experience'
import About from './components/About/About'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import Cursor from './components/ui/Cursor'
import { useLenis } from './hooks/useLenis'

function App() {
  useLenis()

  return (
    <div className="relative min-h-svh">
      <Cursor />
      <AuroraField />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <ProjectShowcase />
        <StackMarquee />
        <Experience />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App