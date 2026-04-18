import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import './Hero.css';

const Hero = () => {
  const { personal } = portfolioData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      },
    },
  };

  return (
    <section id="hero" className="hero-section">
      <div className="container hero-container">
        <motion.div 
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="hero-greeting">
            Hello, I'm
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="hero-name">
            {personal.fullName}
          </motion.h1>
          
          <motion.h2 variants={itemVariants} className="hero-title text-gradient">
            {personal.tagline}
          </motion.h2>
          
          <motion.p variants={itemVariants} className="hero-bio">
            {personal.bio}
          </motion.p>
          
          <motion.div variants={itemVariants} className="hero-buttons">
            <a href={personal.resume} target="_blank" rel="noreferrer" className="btn btn-primary">
              View Resume <ArrowRight size={18} />
            </a>
            <a href={personal.resume} download className="btn btn-secondary">
              Download Resume <Download size={18} />
            </a>
            <a href="#projects" className="btn btn-secondary">
              View Projects
            </a>
          </motion.div>
        </motion.div>

        <motion.div 
          className="hero-image-container"
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="hero-image-wrapper glass">
            <img 
              src={personal.photo} 
              alt={personal.fullName} 
              className="hero-image"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/400x400?text=Your+Photo+Here';
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Background decoration */}
      <div className="hero-bg-glow glow-1"></div>
      <div className="hero-bg-glow glow-2"></div>
    </section>
  );
};

export default Hero;
