import { motion } from 'framer-motion';
import { Code2, Server, Wrench, Globe, LayoutList } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import './Skills.css';

const getCategoryIcon = (category) => {
  switch (category) {
    case "Salesforce Core": return <Code2 className="skill-category-icon text-gradient" size={28} />;
    case "Salesforce Clouds": return <Server className="skill-category-icon text-gradient" size={28} />;
    case "Tools": return <Wrench className="skill-category-icon text-gradient" size={28} />;
    case "Web Technologies": return <Globe className="skill-category-icon text-gradient" size={28} />;
    case "Methodologies": return <LayoutList className="skill-category-icon text-gradient" size={28} />;
    default: return <Code2 className="skill-category-icon text-gradient" size={28} />;
  }
};

const Skills = () => {
  const { technicalExpertise } = portfolioData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="skills" className="section bg-secondary-wrap">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Technical Expertise
        </motion.h2>

        <motion.div 
          className="expertise-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {technicalExpertise.map((expertise, index) => (
            <motion.div 
              key={index} 
              className="expertise-category-card card"
              variants={itemVariants}
            >
              <div className="expertise-category-header">
                {getCategoryIcon(expertise.category)}
                <h3 className="expertise-category-title">{expertise.category}</h3>
              </div>
              <div className="expertise-items">
                {expertise.items.map((item, i) => (
                  <span key={i} className="expertise-tag">{item}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
