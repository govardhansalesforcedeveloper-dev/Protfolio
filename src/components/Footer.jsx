import { portfolioData } from '../data/portfolioData';
import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const { personal } = portfolioData;
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo text-gradient">GR.</span>
            <p className="footer-tagline">{personal.title}</p>
          </div>
          
          <div className="footer-links">
            {personal.github && (
              <a href={personal.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <FaGithub size={20} />
              </a>
            )}
            {personal.linkedin && (
              <a href={personal.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
            )}
            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${personal.email}`} target="_blank" rel="noreferrer" aria-label="Email">
              <Mail size={20} />
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {year} {personal.fullName}. All rights reserved.</p>
          <p>Built with React & Vite</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
