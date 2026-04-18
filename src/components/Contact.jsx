import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import './Contact.css';

const Contact = () => {
  const { personal } = portfolioData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const formData = new FormData(e.target);
    // Web3Forms requires access_key
    formData.append("access_key", "ce7be6fc-98de-4ff3-9bc6-739e2f746367"); 

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitStatus('success');
        e.target.reset();
      } else {
        console.error("Form error", data);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error("Submit error", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section bg-secondary-wrap">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Get In Touch
        </motion.h2>

        <div className="contact-container">
          <motion.div 
            className="contact-info"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="contact-subtitle">Let's talk about everything!</h3>
            <p className="contact-text">
              Don't like forms? Send me an email. 👋
            </p>
            
            <div className="contact-details">
              <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${personal.email}`} target="_blank" rel="noreferrer" className="contact-item card">
                <Mail className="contact-icon text-gradient" size={24} />
                <div>
                  <span className="contact-label">Email</span>
                  <span className="contact-value">{personal.email}</span>
                </div>
              </a>
              
              <div className="contact-item card">
                <MapPin className="contact-icon text-gradient" size={24} />
                <div>
                  <span className="contact-label">Location</span>
                  <span className="contact-value">Global / Remote</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form 
            className="contact-form card"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input type="text" id="name" name="name" placeholder="John Doe" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="john@example.com" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" name="subject" placeholder="Project Inquiry" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" placeholder="Hello, I'd like to talk about..." required></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={18} />
            </button>

            {submitStatus === 'success' && (
              <div className="submit-message success">
                Thank you! Your message has been sent successfully.
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="submit-message error">
                Oops! Something went wrong. Please try again or email me directly.
              </div>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
