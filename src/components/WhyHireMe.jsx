import { motion } from 'framer-motion';
import { Award, Zap, CheckCircle, Target } from 'lucide-react';
import './WhyHireMe.css';

const WhyHireMe = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const reasons = [
    {
      icon: <Award size={32} className="text-gradient" />,
      title: "4x Certified Salesforce Expert",
      description: "Proven deep platform mastery with PD1, PD2, and Associate certifications. Ready to tackle complex APEX and LWC challenges from day one."
    },
    {
      icon: <Zap size={32} className="text-gradient" />,
      title: "Enterprise Integrations",
      description: "Extensive experience integrating third-party systems (Zoom, Google Maps APIs) into Salesforce using REST/JSON and robust Apex logic."
    },
    {
      icon: <Target size={32} className="text-gradient" />,
      title: "Impact & Optimization Driven",
      description: "Focused on measurable results: reduced processing times by 15%, maintained 75%+ code coverage, and optimized massive data entry workflows."
    },
    {
      icon: <CheckCircle size={32} className="text-gradient" />,
      title: "Full-Stack CRM Capabilities",
      description: "Equally comfortable architecting complex backend Batch Jobs as building beautiful, highly-responsive frontend Lightning Web Components."
    }
  ];

  return (
    <section id="why-hire-me" className="section bg-secondary-wrap">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Why Hire Me?
        </motion.h2>
        
        <p className="why-subtitle">What I bring to your engineering team.</p>

        <motion.div 
          className="why-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {reasons.map((reason, index) => (
            <motion.div key={index} className="why-card card" variants={itemVariants}>
              <div className="why-icon-container">
                {reason.icon}
              </div>
              <h3 className="why-card-title">{reason.title}</h3>
              <p className="why-card-description">{reason.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyHireMe;
