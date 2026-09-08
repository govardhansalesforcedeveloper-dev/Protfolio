import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import WhyHireMe from './components/WhyHireMe';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import OutreachDashboard from './components/Outreach/OutreachDashboard';
import { Sparkles } from 'lucide-react';

function App() {
  const [theme, setTheme] = useState('dark');
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);

  useEffect(() => {
    // Add dark class to html element based on theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Keyboard shortcut: Cmd/Ctrl + Shift + O to open Outreach Pipeline
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setIsOutreachOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app">
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onOpenOutreach={() => setIsOutreachOpen(true)} 
      />
      <main>
        <Hero />
        <About />
        <WhyHireMe />
        <Certifications />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />

      {/* Floating Recruiter Outreach Pipeline Trigger */}
      <button 
        className="floating-outreach-btn"
        onClick={() => setIsOutreachOpen(true)}
        title="Open LinkedIn Recruiter Auto-Outreach Engine (Shortcut: Ctrl+Shift+O)"
      >
        <Sparkles size={16} /> Recruiter Pipeline
      </button>

      {/* Outreach Dashboard Modal */}
      {isOutreachOpen && (
        <OutreachDashboard onClose={() => setIsOutreachOpen(false)} />
      )}
    </div>
  );
}

export default App;
