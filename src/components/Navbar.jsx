import { Moon, Sun, Menu, X } from 'lucide-react';
import { FaLinkedin, FaSalesforce, FaEnvelope } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { personal } = portfolioData;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Certifications', href: '#certifications' },
    { name: 'Experience', href: '#experience' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled glass' : ''}`}>
      <div className="container nav-container">
        <a href="#" className="logo">
          <span className="text-gradient">GR.</span>
        </a>

        {/* Desktop Nav */}
        <div className="nav-links desktop-nav">
          <div className="nav-items">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="nav-link">
                {link.name}
              </a>
            ))}
          </div>
          
          <div className="nav-socials">
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${personal.email}`} target="_blank" rel="noreferrer" aria-label="Email" className="nav-social-icon">
              <FaEnvelope size={18} />
            </a>
            {personal.linkedin && (
              <a href={personal.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="nav-social-icon">
                <FaLinkedin size={18} />
              </a>
            )}
            {personal.trailhead && (
              <a href={personal.trailhead} target="_blank" rel="noreferrer" aria-label="Trailhead" className="nav-social-icon">
                <FaSalesforce size={18} />
              </a>
            )}
          </div>

          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="mobile-toggle-container">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu glass ${isMobileMenuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <a 
            key={link.name} 
            href={link.href} 
            className="mobile-nav-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.name}
          </a>
        ))}
        
        <div className="mobile-socials">
          <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${personal.email}`} target="_blank" rel="noreferrer" aria-label="Email">
            <FaEnvelope size={24} />
          </a>
          {personal.linkedin && (
            <a href={personal.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <FaLinkedin size={24} />
            </a>
          )}
          {personal.trailhead && (
            <a href={personal.trailhead} target="_blank" rel="noreferrer" aria-label="Trailhead">
              <FaSalesforce size={24} />
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
