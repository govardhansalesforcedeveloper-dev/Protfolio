import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Mail,
  ShieldCheck,
  Building2,
  FileText,
  Sparkles,
  Inbox,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import './OutreachDashboard.css';

// Dynamic host determination so API calls work on local desktop & Vercel cloud deployment
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return '/api';
    }
    const hostname = window.location.hostname;
    return `http://${hostname}:5001/api`;
  }
  return 'http://localhost:5001/api';
};

const API_BASE = getApiBase();

export default function OutreachDashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('drafts');
  const [drafts, setDrafts] = useState([]);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({
    smtpUser: 'govardhan.salesforcedeveloper@gmail.com',
    smtpPass: '',
    portfolioUrl: 'https://protfolio-blond-eta.vercel.app/'
  });
  const [isSmtpConfigured, setIsSmtpConfigured] = useState(false);
  const [isFetchingDrafts, setIsFetchingDrafts] = useState(false);
  const [isProcessingDrafts, setIsProcessingDrafts] = useState(false);
  const [quickEmailsText, setQuickEmailsText] = useState('');
  const [quickCompany, setQuickCompany] = useState('');
  const [quickRole, setQuickRole] = useState('Salesforce Developer');
  const [isQuickSending, setIsQuickSending] = useState(false);
  const [quickSendResult, setQuickSendResult] = useState(null);
  const [testEmailStatus, setTestEmailStatus] = useState(null);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [saveSettingsStatus, setSaveSettingsStatus] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [draftStatus, setDraftStatus] = useState(null);
  const [customEmails, setCustomEmails] = useState({});

  useEffect(() => {
    fetchStatus();
    fetchHistory();
    fetchSettings();
    fetchDrafts();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const data = await res.json();
        setIsSmtpConfigured(data.isSmtpConfigured);
      }
    } catch (err) {}
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {}
  };

  const fetchDrafts = async () => {
    setIsFetchingDrafts(true);
    try {
      const res = await fetch(`${API_BASE}/drafts`);
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.drafts || []);
      }
    } catch (err) {
      console.warn('Error fetching drafts:', err);
    } finally {
      setIsFetchingDrafts(false);
    }
  };

  const handleProcessDrafts = async () => {
    if (!isSmtpConfigured) {
      setActiveTab('settings');
      return;
    }

    setIsProcessingDrafts(true);
    setDraftStatus(null);
    try {
      const res = await fetch(`${API_BASE}/drafts/process`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDraftStatus({
          success: true,
          message: `Dispatched ${data.processedCount} email(s) with your resume attached!`
        });
        fetchDrafts();
        fetchHistory();
      } else {
        setDraftStatus({ success: false, message: data.error || 'Failed to process drafts' });
      }
    } catch (err) {
      setDraftStatus({ success: false, message: err.message });
    } finally {
      setIsProcessingDrafts(false);
    }
  };

  const handleQuickSend = async (e) => {
    e.preventDefault();
    if (!isSmtpConfigured) {
      setActiveTab('settings');
      return;
    }

    setIsQuickSending(true);
    setQuickSendResult(null);

    try {
      const res = await fetch(`${API_BASE}/quick-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawEmails: quickEmailsText,
          company: quickCompany,
          role: quickRole
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuickSendResult({
          success: true,
          message: `Dispatched ${data.sentCount} application email(s) with resume attached!`
        });
        setQuickEmailsText('');
        fetchHistory();
      } else {
        setQuickSendResult({ success: false, message: data.error || 'Failed to send' });
      }
    } catch (err) {
      setQuickSendResult({ success: false, message: err.message });
    } finally {
      setIsQuickSending(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveSettingsStatus('saving');
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaveSettingsStatus('success');
        fetchStatus();
        setTimeout(() => setSaveSettingsStatus(null), 3000);
      } else {
        setSaveSettingsStatus('error');
      }
    } catch (err) {
      setSaveSettingsStatus('error');
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    setTestEmailStatus(null);
    try {
      const res = await fetch(`${API_BASE}/test-smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testRecipient: settings.smtpUser,
          smtpUser: settings.smtpUser,
          smtpPass: settings.smtpPass
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailStatus({ success: true, message: `Verified! Sample email with Govardhan_Resume.pdf sent to ${settings.smtpUser}` });
        setIsSmtpConfigured(true);
      } else {
        setTestEmailStatus({ success: false, message: data.error || 'SMTP Authentication failed' });
      }
    } catch (err) {
      setTestEmailStatus({ success: false, message: err.message });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const generateGmailComposeLink = (targetEmail, roleTitle) => {
    const email = targetEmail || '';
    const subject = encodeURIComponent(`Application for ${roleTitle || 'Salesforce Developer'} | 4+ Yrs Exp | 4x Certified (PD1, PD2) - Govardhan Reddy`);
    const body = encodeURIComponent(
      `Hi Hiring Team,\n\nI am applying for the ${roleTitle || 'Salesforce Developer'} position. I am a 4x Certified Salesforce Developer with over 4+ years of hands-on experience in Apex, LWC, REST/SOAP APIs, Health Cloud, and Sales Cloud.\n\nYou can explore my live interactive portfolio here:\n${settings.portfolioUrl || 'https://protfolio-blond-eta.vercel.app/'}\n\nI look forward to discussing how my experience aligns with your team!\n\nBest regards,\nGovardhan Reddy Chigicherla\n+91 6300610553`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
  };

  return (
    <div className="outreach-dashboard-overlay">
      <motion.div
        className="outreach-dashboard-container glass"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
      >
        {/* Header */}
        <div className="outreach-header">
          <div className="outreach-title-group">
            <div className="outreach-badge">
              <Sparkles size={13} /> Outreach Engine
            </div>
            <h2>1-Click Recruiter Dispatcher</h2>
            <p className="outreach-subtitle">
              Format, attach resume, and dispatch applications via Gmail.
            </p>
          </div>

          <div className="outreach-header-actions">
            {isSmtpConfigured ? (
              <span className="status-badge success"><CheckCircle2 size={13} /> SMTP Ready</span>
            ) : (
              <span className="status-badge warning"><AlertTriangle size={13} /> Password Required</span>
            )}
            {onClose && (
              <button className="outreach-close-btn" onClick={onClose} aria-label="Close">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="outreach-tabs">
          <button
            className={`outreach-tab ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('drafts'); fetchDrafts(); }}
          >
            <Inbox size={15} /> Gmail Drafts ({drafts.length})
          </button>

          <button
            className={`outreach-tab ${activeTab === 'quick' ? 'active' : ''}`}
            onClick={() => setActiveTab('quick')}
          >
            <Send size={15} /> Quick Paste List
          </button>

          <button
            className={`outreach-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <UserCheck size={15} /> History ({history.length})
          </button>

          <button
            className={`outreach-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={15} /> Settings
          </button>
        </div>

        {/* TAB 1: GMAIL DRAFTS */}
        {activeTab === 'drafts' && (
          <div className="tab-content">
            <div className="drafts-action-banner card">
              <div>
                <h3 className="banner-title">
                  <Inbox size={18} className="text-gradient" /> Gmail Drafts Auto-Dispatch
                </h3>
                <p className="banner-desc">
                  Create a draft in Gmail with the recruiter's email in the <strong>To:</strong> field. Click <strong>Process & Send All Drafts</strong> to send with resume attached & clean up draft!
                </p>
              </div>

              <div className="banner-buttons">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={fetchDrafts}
                  disabled={isFetchingDrafts}
                >
                  <RefreshCw size={14} className={isFetchingDrafts ? 'spinning' : ''} />
                  {isFetchingDrafts ? 'Checking...' : 'Refresh'}
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleProcessDrafts}
                  disabled={isProcessingDrafts || drafts.length === 0 || !isSmtpConfigured}
                >
                  <Send size={15} />
                  {isProcessingDrafts ? 'Sending...' : `Process & Send (${drafts.length})`}
                </button>
              </div>
            </div>

            {draftStatus && (
              <div className={`alert-box ${draftStatus.success ? 'success' : 'error'}`} style={{ marginBottom: '1.25rem' }}>
                {draftStatus.message}
              </div>
            )}

            {drafts.length === 0 ? (
              <div className="empty-state card">
                <Inbox size={44} className="text-gradient" />
                <h3>No Saved Drafts Detected</h3>
                <p>Save a draft in Gmail with the recruiter's email address and click refresh!</p>
                <button className="btn btn-secondary btn-sm" onClick={fetchDrafts} disabled={isFetchingDrafts}>
                  <RefreshCw size={15} className={isFetchingDrafts ? 'spinning' : ''} />
                  Check Gmail Drafts
                </button>
              </div>
            ) : (
              <div className="leads-grid">
                {drafts.map((draft, idx) => {
                  const targetEmail = customEmails[draft.uid] || draft.to;
                  return (
                    <motion.div
                      key={draft.uid || idx}
                      className="lead-card card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="lead-card-header">
                        <div>
                          <h4 className="lead-role">{draft.role}</h4>
                          <div className="lead-company">
                            <Building2 size={13} /> {draft.company}
                          </div>
                        </div>
                      </div>

                      {draft.to ? (
                        <div className="lead-email-badge">
                          <Mail size={13} /> {draft.to}
                        </div>
                      ) : (
                        <div className="custom-email-input">
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recruiter Email:</label>
                          <input
                            type="email"
                            placeholder="Enter recruiter@company.com"
                            value={customEmails[draft.uid] || ''}
                            onChange={(e) => setCustomEmails({ ...customEmails, [draft.uid]: e.target.value })}
                          />
                        </div>
                      )}

                      <p className="lead-snippet">
                        Subject: "{draft.originalSubject}"
                      </p>

                      <div className="lead-card-footer">
                        <button
                          className="link-btn"
                          onClick={() => setPreviewItem({ ...draft, to: targetEmail })}
                        >
                          <FileText size={13} /> Preview Pitch
                        </button>

                        <a
                          href={generateGmailComposeLink(targetEmail, draft.role)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-xs"
                          style={{ textDecoration: 'none' }}
                        >
                          <ExternalLink size={12} /> Open Gmail
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUICK PASTE LIST */}
        {activeTab === 'quick' && (
          <div className="tab-content">
            <div className="settings-grid">
              <div className="settings-card card">
                <h3><Send size={18} className="text-gradient" /> Quick Email Paste Dispatcher</h3>
                <p className="settings-desc">
                  Paste recruiter emails below. Each recruiter receives your application with <code>Govardhan_Resume.pdf</code> attached.
                </p>

                <form onSubmit={handleQuickSend} className="settings-form">
                  <div className="form-group">
                    <label>Recruiter Email Addresses</label>
                    <textarea
                      rows="4"
                      placeholder="hr@company1.com, recruiter@company2.com"
                      value={quickEmailsText}
                      onChange={(e) => setQuickEmailsText(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Company Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise CRM Solutions"
                      value={quickCompany}
                      onChange={(e) => setQuickCompany(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Role</label>
                    <input
                      type="text"
                      placeholder="Salesforce Developer"
                      value={quickRole}
                      onChange={(e) => setQuickRole(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isQuickSending || !isSmtpConfigured || !quickEmailsText.trim()}
                  >
                    <Send size={15} />
                    {isQuickSending ? 'Sending...' : '🚀 Send Applications Now'}
                  </button>

                  {quickSendResult && (
                    <div className={`alert-box ${quickSendResult.success ? 'success' : 'error'}`}>
                      {quickSendResult.message}
                    </div>
                  )}
                </form>
              </div>

              <div className="settings-guide card">
                <h3>Every recruiter receives:</h3>
                <ul className="guide-steps">
                  <li><strong>Subject:</strong> Application for Salesforce Developer | 4+ Yrs Exp | 4x Certified (PD1, PD2) - Govardhan Reddy</li>
                  <li><strong>Attachment:</strong> <code>Govardhan_Reddy_Salesforce_Developer_Resume.pdf</code></li>
                  <li><strong>Experience:</strong> 4+ Years (Infosys, Lean Agilenautics), Apex, LWC, REST APIs.</li>
                  <li><strong>Links:</strong> Portfolio URL & Verified Trailhead Profile.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SENT HISTORY */}
        {activeTab === 'history' && (
          <div className="tab-content">
            {history.length === 0 ? (
              <div className="empty-state card">
                <Mail size={44} className="text-gradient" />
                <h3>No Sent History Yet</h3>
                <p>Emails sent via Gmail SMTP will be tracked here.</p>
              </div>
            ) : (
              <div className="history-table-container card">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Recruiter / Email</th>
                      <th>Company & Role</th>
                      <th>Subject</th>
                      <th>Sent Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>
                          <strong>{item.recruiterName}</strong>
                          <div className="sub-text">{item.to}</div>
                        </td>
                        <td>
                          <div>{item.company}</div>
                          <div className="sub-text">{item.role}</div>
                        </td>
                        <td>
                          <div className="subject-cell" title={item.subject}>
                            {item.subject}
                          </div>
                        </td>
                        <td>{new Date(item.sentAt).toLocaleString()}</td>
                        <td>
                          <span className="badge-delivered">
                            <CheckCircle2 size={12} /> Delivered
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="settings-grid">
              <div className="settings-card card">
                <h3><ShieldCheck size={18} className="text-gradient" /> Gmail SMTP Setup</h3>
                <p className="settings-desc">
                  Emails are sent directly from your Gmail address with your resume attached.
                </p>

                <form onSubmit={handleSaveSettings} className="settings-form">
                  <div className="form-group">
                    <label>Gmail Address</label>
                    <input
                      type="email"
                      value={settings.smtpUser}
                      onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Gmail App Password (16-character code)</label>
                    <input
                      type="password"
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={settings.smtpPass}
                      onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                    />
                    <small className="help-text">
                      Generate in Google Account → Security → 2-Step Verification → App Passwords.
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Live Portfolio URL</label>
                    <input
                      type="url"
                      placeholder="https://your-portfolio.vercel.app/"
                      value={settings.portfolioUrl || ''}
                      onChange={(e) => setSettings({ ...settings, portfolioUrl: e.target.value })}
                    />
                  </div>

                  <div className="settings-buttons">
                    <button type="submit" className="btn btn-primary">
                      {saveSettingsStatus === 'saving' ? 'Saving...' : 'Save Settings'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleTestSmtp}
                      disabled={isTestingSmtp}
                    >
                      <Mail size={15} />
                      {isTestingSmtp ? 'Verifying...' : 'Test Connection'}
                    </button>
                  </div>

                  {saveSettingsStatus === 'success' && (
                    <div className="alert-box success">Settings saved successfully!</div>
                  )}
                  {testEmailStatus && (
                    <div className={`alert-box ${testEmailStatus.success ? 'success' : 'error'}`}>
                      {testEmailStatus.message}
                    </div>
                  )}
                </form>
              </div>

              <div className="settings-guide card">
                <h3>Generate Gmail App Password:</h3>
                <ol className="guide-steps">
                  <li>Go to <strong>myaccount.google.com/security</strong></li>
                  <li>Ensure <strong>2-Step Verification</strong> is ON</li>
                  <li>Go to <strong>myaccount.google.com/apppasswords</strong></li>
                  <li>Type <code>Portfolio Outreach</code> and click Create</li>
                  <li>Copy the 16-letter code and paste on the left!</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Pitch Preview */}
        <AnimatePresence>
          {previewItem && (
            <div className="preview-modal-backdrop" onClick={() => setPreviewItem(null)}>
              <motion.div
                className="preview-modal-content card"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <div className="preview-modal-header">
                  <h3>Application Email Preview</h3>
                  <button onClick={() => setPreviewItem(null)}>✕</button>
                </div>
                <div className="preview-modal-body">
                  <p><strong>To:</strong> {previewItem.to || 'Recruiter'}</p>
                  <p><strong>Subject:</strong> Application for {previewItem.role || 'Salesforce Developer'} | 4+ Yrs Exp | 4x Certified (PD1, PD2) - Govardhan Reddy</p>
                  <p><strong>Attachment:</strong> Govardhan_Reddy_Salesforce_Developer_Resume.pdf</p>
                  <hr />
                  <div className="email-preview-text">
                    <p>Hi <strong>{previewItem.recruiterName || 'Hiring Team'}</strong>,</p>
                    <p>I came across your hiring post regarding the <strong>{previewItem.role || 'Salesforce Developer'}</strong> opportunity at <strong>{previewItem.company || 'your organization'}</strong> and would love to be considered for the role.</p>
                    <p>I am a <strong>4x Salesforce Certified Developer</strong> with over <strong>4+ years of hands-on experience</strong> architecting, developing, and deploying scalable CRM solutions across enterprise ecosystems (including <strong>Infosys</strong> and fast-paced agile consulting environments).</p>
                    <p><strong>Core Technical Proficiencies:</strong></p>
                    <ul>
                      <li>Apex Classes, Triggers, Batch & Scheduled Apex, SOQL/SOSL, Complex Flows</li>
                      <li>Lightning Web Components (LWC), JavaScript, Redux state management</li>
                      <li>REST/SOAP API Integrations (Zoom, Google Maps API)</li>
                      <li>Sales Cloud, Health Cloud, Experience Cloud</li>
                    </ul>
                    <p>I have attached my updated resume for your review and you can explore my live portfolio below.</p>
                  </div>
                </div>
                <div className="preview-modal-footer">
                  <button className="btn btn-secondary" onClick={() => setPreviewItem(null)}>
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
