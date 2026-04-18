import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import './About.css';

const About = () => {
  const { personal } = portfolioData;

  return (
    <section id="about" className="section">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Summary
        </motion.h2>

        <motion.div 
          className="about-content card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="about-icon">
            <User size={40} className="text-gradient" />
          </div>
          <div className="about-text">
            <h3 className="about-subtitle">Professional Summary</h3>
            <p className="about-description">
              {personal.bio}
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number text-gradient">4+</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="stat-item">
                <span className="stat-number text-gradient">4</span>
                <span className="stat-label">Salesforce Certifications</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
