import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sanitizeAndValidateEmail } from './leadFinder.js';

export { sanitizeAndValidateEmail };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getResumePath = () => {
  const possiblePaths = [
    path.resolve(__dirname, '../../public/Govardhan_Resume.pdf'),
    path.resolve(process.cwd(), 'public/Govardhan_Resume.pdf'),
    path.resolve(process.cwd(), '../public/Govardhan_Resume.pdf'),
    '/Users/govardhanreddychigicherla/Documents/Antigravity Agent workspace/public/Govardhan_Resume.pdf',
    '/Users/govardhanreddychigicherla/personal site/public/Govardhan_Resume.pdf'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const HISTORY_FILE = path.resolve(__dirname, '../data/history.json');
const SETTINGS_FILE = path.resolve(__dirname, '../data/settings.json');

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const getSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading settings:', err);
  }
  return {
    smtpUser: process.env.SMTP_USER || 'govardhan.salesforcedeveloper@gmail.com',
    smtpPass: process.env.SMTP_PASS || '',
    autoSendEnabled: true,
    countdownMinutes: 15,
    locationFilter: 'India (Bangalore, Hyderabad, Pune, Remote)',
    dailyLimit: 30,
    candidateName: 'Govardhan Reddy Chigicherla',
    candidateTitle: 'Salesforce Developer (4+ Yrs | 4x Certified)',
    portfolioUrl: 'https://protfolio-blond-eta.vercel.app/',
    linkedinUrl: 'https://www.linkedin.com/in/govardhan-reddy-chigicherla-51b380221/',
    trailheadUrl: 'https://www.salesforce.com/trailblazer/greddy169',
    phone: '+91 6300610553'
  };
};

export const saveSettings = (newSettings) => {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
  return updated;
};

export const getHistory = () => {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading history:', err);
  }
  return [];
};

export const logSentEmail = (entry) => {
  const history = getHistory();
  history.unshift({
    id: entry.id || Date.now().toString(),
    to: entry.to,
    recruiterName: entry.recruiterName || 'Hiring Team',
    company: entry.company || 'Company',
    role: entry.role || 'Salesforce Developer',
    subject: entry.subject,
    sentAt: new Date().toISOString(),
    status: 'Delivered',
    sourceUrl: entry.sourceUrl || ''
  });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
};

export const isAlreadyEmailed = (email) => {
  if (!email) return false;
  const history = getHistory();
  return history.some(h => h.to && h.to.toLowerCase() === email.toLowerCase());
};

export const createTransporter = (customSettings = null) => {
  const settings = customSettings || getSettings();
  
  if (!settings.smtpPass) {
    throw new Error('Gmail SMTP App Password is not configured. Please set it in Settings.');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass ? settings.smtpPass.replace(/[^a-zA-Z0-9]/g, '') : '' // strip non-breaking spaces & symbols
    }
  });
};

export const verifySmtpConnection = async (customSettings = null) => {
  const transporter = createTransporter(customSettings);
  return await transporter.verify();
};

export const generateEmailTemplate = ({ recruiterName, company, role, sourceSnippet }) => {
  const settings = getSettings();
  const recipient = recruiterName && recruiterName !== 'Hiring Manager' ? recruiterName : 'Hiring Team';
  const targetCompany = company || 'your esteemed organization';
  const targetRole = role || 'Salesforce Developer';

  const subject = `Application for ${targetRole} | 4+ Yrs Exp | 4x Certified (PD1, PD2) - Govardhan Reddy`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px; }
    .header h2 { margin: 0; color: #0f172a; font-size: 22px; }
    .badge-container { margin: 12px 0; }
    .badge { display: inline-block; background: #eff6ff; color: #2563eb; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 6px; border: 1px solid #bfdbfe; margin-right: 6px; margin-bottom: 6px; }
    .highlight-box { background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 18px 0; border-radius: 0 8px 8px 0; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 10px 22px; border-radius: 8px; margin-top: 15px; }
    .footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
    ul { padding-left: 20px; margin: 10px 0; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Application: ${targetRole}</h2>
      <div class="badge-container">
        <span class="badge">4+ Years Exp</span>
        <span class="badge">Platform Developer II</span>
        <span class="badge">Platform Developer I</span>
        <span class="badge">Salesforce Certified Associate</span>
        <span class="badge">Copado Certified</span>
      </div>
    </div>

    <p>Hi <strong>${recipient}</strong>,</p>

    <p>I came across your hiring post regarding the <strong>${targetRole}</strong> opportunity at <strong>${targetCompany}</strong> and would love to be considered for the role.</p>

    <p>I am a <strong>4x Salesforce Certified Developer</strong> with over <strong>4+ years of hands-on experience</strong> architecting, developing, and deploying scalable CRM solutions across enterprise ecosystems (including <strong>Infosys</strong> and fast-paced agile consulting environments).</p>

    <div class="highlight-box">
      <strong>Core Technical Proficiencies:</strong>
      <ul>
        <li><strong>Apex & Automation:</strong> Apex Classes, Triggers, Batch & Scheduled Apex, SOQL/SOSL, Complex Flows.</li>
        <li><strong>Frontend:</strong> Lightning Web Components (LWC), Aura Components, JavaScript, Redux state management.</li>
        <li><strong>Integrations:</strong> REST/SOAP APIs, Google Maps API, Zoom API, JSON/XML parsing, robust error handling.</li>
        <li><strong>Cloud Expertise:</strong> Sales Cloud, Health Cloud, Experience Cloud.</li>
        <li><strong>DevOps & Tools:</strong> Git, Copado CI/CD, VS Code, Data Loader, Workbench.</li>
      </ul>
    </div>

    <p>In my recent projects, I have successfully reduced processing times by 15%, synchronized 10,000+ daily API records with zero downtime, and engineered high-performance reusable LWC component libraries.</p>

    <p>I have attached my updated resume for your review. You can also explore my live interactive portfolio and verified Trailhead profile below:</p>

    <p style="text-align: center; margin: 24px 0;">
      <a href="${settings.portfolioUrl}" class="cta-btn" target="_blank">View Live Portfolio & Projects</a>
    </p>

    <div class="footer">
      <p><strong>Govardhan Reddy Chigicherla</strong><br/>
      Salesforce Developer | Apex • LWC • Integrations • PD2 Certified<br/>
      📧 <a href="mailto:${settings.smtpUser}">${settings.smtpUser}</a> | 📱 ${settings.phone}<br/>
      🔗 <a href="${settings.linkedinUrl}">LinkedIn Profile</a> | ⚡ <a href="${settings.trailheadUrl}">Trailhead Profile</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
};

export const sendApplicationEmail = async ({ to, recruiterName, company, role, sourceSnippet, sourceUrl, customSubject, customHtml }) => {
  const settings = getSettings();
  const transporter = createTransporter(settings);

  // Strip trailing dots, spaces, or brackets that cause "Address Not Found" bounces
  const cleanTo = to ? to.trim().toLowerCase().replace(/[.,;:!\)\}'"\]\>]+$/, '').replace(/^[<\(\['"]+/, '') : '';

  if (!cleanTo || !cleanTo.includes('@') || cleanTo.includes('example.com') || cleanTo.includes('domain.com')) {
    throw new Error(`Invalid or non-deliverable email address: ${to}`);
  }

  // Note: duplicate check removed per user request to allow re-sending to any address

  const defaultTemplate = generateEmailTemplate({ recruiterName, company, role, sourceSnippet });
  const subject = customSubject && customSubject !== '(No Subject)' ? customSubject : defaultTemplate.subject;
  const html = customHtml || defaultTemplate.html;

  const attachments = [];
  const resumePath = getResumePath();
  if (resumePath) {
    attachments.push({
      filename: 'Govardhan_Reddy_Salesforce_Developer_Resume.pdf',
      path: resumePath,
      contentType: 'application/pdf'
    });
  }

  const mailOptions = {
    from: `"${settings.candidateName}" <${settings.smtpUser}>`,
    to,
    replyTo: settings.smtpUser,
    subject,
    html,
    attachments
  };

  const info = await transporter.sendMail(mailOptions);
  
  logSentEmail({
    to,
    recruiterName,
    company,
    role,
    subject,
    sourceUrl
  });

  return { success: true, messageId: info.messageId, to, attachedResume: Boolean(resumePath) };
};
