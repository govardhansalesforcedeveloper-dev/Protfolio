import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Folder, ChevronDown } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { portfolioData } from '../data/portfolioData';
import './Projects.css';

const ProjectCard = ({ project, isExpanded, onToggle }) => {
  return (
    <motion.div 
      className={`project-card card ${isExpanded ? 'expanded' : ''}`}
      layout
      onClick={onToggle}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="project-header">
        <div className="project-icon-group">
          <Folder className="project-folder-icon text-gradient" size={40} />
          <h3 className="project-title">{project.name}</h3>
        </div>
        <div className="project-actions">
          <div className="project-links" onClick={(e) => e.stopPropagation()}>
            {project.links.github && (
              <a href={project.links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <FaGithub size={20} />
              </a>
            )}
            {project.links.live && (
              <a href={project.links.live} target="_blank" rel="noreferrer" aria-label="Live Demo">
                <ExternalLink size={20} />
              </a>
            )}
          </div>
          <motion.div 
            className="expand-icon"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={24} />
          </motion.div>
        </div>
      </div>
      
      <p className="project-description">{project.description}</p>
      
      <div className="project-tech-list">
        {project.technologies.map((tech, i) => (
          <span key={i} className="tech-tag">{tech}</span>
        ))}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="project-details"
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="project-details-content">
              <h4 className="details-heading">Measurable Impact:</h4>
              <ul className="impact-list">
                {project.impact.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Projects = () => {
  const { clientProjects, personalProjects } = portfolioData;
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="projects" className="section">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Featured Projects
        </motion.h2>

        {clientProjects && clientProjects.length > 0 && (
          <div className="project-category">
            <h3 className="category-title text-gradient">Client Projects</h3>
            <div className="projects-grid">
              {clientProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  isExpanded={expandedId === project.id}
                  onToggle={() => handleToggle(project.id)}
                />
              ))}
            </div>
          </div>
        )}

        {personalProjects && personalProjects.length > 0 && (
          <div className="project-category mt-12">
            <h3 className="category-title text-gradient">Personal Projects</h3>
            <div className="projects-grid">
              {personalProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  isExpanded={expandedId === project.id}
                  onToggle={() => handleToggle(project.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
