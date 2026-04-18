import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import Modal from './Modal';
import './Certifications.css';

const Certifications = () => {
  const { certifications } = portfolioData;
  const [selectedCert, setSelectedCert] = useState(null);

  if (!certifications || certifications.length === 0) return null;

  return (
    <section id="certifications" className="section bg-secondary-wrap">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Certifications
        </motion.h2>

        <div className="certifications-grid">
          {certifications.map((cert, index) => (
            <motion.div 
              key={cert.id} 
              className="cert-card card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCert(cert)}
              whileHover={{ y: -5, cursor: 'pointer' }}
            >
              <Award className="cert-icon text-gradient" size={40} />
              <div className="cert-info">
                <h3 className="cert-name">{cert.name}</h3>
                <p className="cert-date">{cert.date}</p>
              </div>
              <span className="view-cert-text">Click to view</span>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={!!selectedCert} 
        onClose={() => setSelectedCert(null)}
        title={selectedCert?.name}
      >
        <div className="cert-modal-content">
          <p className="cert-modal-date">Issued: {selectedCert?.date}</p>
          <div className="cert-image-container">
            {selectedCert?.image ? (
              selectedCert.image.toLowerCase().endsWith('.pdf') ? (
                <iframe 
                  src={selectedCert.image} 
                  title={`${selectedCert.name} Certificate`}
                  className="cert-pdf"
                />
              ) : (
                <img 
                  src={selectedCert.image} 
                  alt={`${selectedCert.name} Certificate`} 
                  className="cert-image"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/800x600?text=Certificate+Placeholder';
                  }}
                />
              )
            ) : (
              <div className="cert-placeholder">No File Available</div>
            )}
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default Certifications;
