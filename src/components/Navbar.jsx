import { Moon, Sun } from 'lucide-react';
import { FaLinkedin, FaSalesforce, FaEnvelope } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
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

      </div>
    </nav>
  );
};

export default Navbar;
