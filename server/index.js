import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getSettings,
  saveSettings,
  getHistory,
  verifySmtpConnection,
  sendApplicationEmail,
  isAlreadyEmailed
} from './services/emailService.js';

import {
  sanitizeAndValidateEmail
} from './services/leadFinder.js';

import {
  fetchGmailDrafts,
  processAndSendAllDrafts
} from './services/draftService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// System Status Endpoint
app.get('/api/status', (req, res) => {
  const settings = getSettings();
  res.json({
    ok: true,
    isSmtpConfigured: Boolean(settings.smtpPass),
    smtpUser: settings.smtpUser,
    historyCount: getHistory().length
  });
});

// Fetch pending drafts directly from user's Gmail Drafts box
app.get('/api/drafts', async (req, res) => {
  try {
    const drafts = await fetchGmailDrafts();
    res.json({ success: true, count: drafts.length, drafts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Process and send all saved Gmail drafts
app.post('/api/drafts/process', async (req, res) => {
  try {
    const result = await processAndSendAllDrafts();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Quick-Send endpoint: Paste multiple recruiter email addresses at once
app.post('/api/quick-send', async (req, res) => {
  const { rawEmails, recruiterName, company, role } = req.body;

  if (!rawEmails) {
    return res.status(400).json({ error: 'Please provide at least one recruiter email address.' });
  }

  // Parse emails separated by commas, spaces, or new lines
  const rawList = Array.isArray(rawEmails) 
    ? rawEmails 
    : rawEmails.split(/[\s,\n;]+/);

  const validEmails = [];
  rawList.forEach(raw => {
    const cleaned = sanitizeAndValidateEmail(raw);
    if (cleaned && !validEmails.includes(cleaned)) {
      validEmails.push(cleaned);
    }
  });

  if (validEmails.length === 0) {
    return res.status(400).json({ error: 'No valid deliverable email addresses found in your input.' });
  }

  let sentCount = 0;
  const errors = [];

  for (const email of validEmails) {
    try {
      if (isAlreadyEmailed(email)) {
        console.log(`[QuickSend] Skipping ${email} (Already emailed previously).`);
        continue;
      }

      await sendApplicationEmail({
        to: email,
        recruiterName: recruiterName || 'Hiring Team',
        company: company || 'Company',
        role: role || 'Salesforce Developer',
        sourceSnippet: 'Direct Application Dispatch',
        sourceUrl: 'Quick Dispatcher'
      });

      sentCount += 1;
      // 10s delay between emails to protect sender reputation
      await new Promise(r => setTimeout(r, 10000));
    } catch (err) {
      console.error(`[QuickSend] Error sending to ${email}:`, err.message);
      errors.push({ email, error: err.message });
    }
  }

  res.json({
    success: true,
    sentCount,
    failedCount: errors.length,
    errors,
    history: getHistory()
  });
});

// History endpoint
app.get('/api/history', (req, res) => {
  res.json({
    history: getHistory()
  });
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  const settings = getSettings();
  res.json({
    ...settings,
    smtpPassMasked: settings.smtpPass ? '••••••••••••••••' : ''
  });
});

app.post('/api/settings', (req, res) => {
  const current = getSettings();
  const payload = req.body;

  // Don't overwrite password with masked value if user didn't change it
  if (payload.smtpPass && payload.smtpPass.includes('••••')) {
    delete payload.smtpPass;
  }

  const updated = saveSettings(payload);
  res.json({ success: true, settings: updated });
});

// Test SMTP connection & sample email with attached resume
app.post('/api/test-smtp', async (req, res) => {
  const { testRecipient, smtpUser, smtpPass } = req.body;
  const testConfig = smtpUser && smtpPass ? { smtpUser, smtpPass } : null;

  try {
    await verifySmtpConnection(testConfig);

    let emailSent = false;
    if (testRecipient) {
      const { generateEmailTemplate, createTransporter, getResumePath, getSettings } = await import('./services/emailService.js');
      const transporter = createTransporter(testConfig);
      const settings = getSettings();

      const { subject, html } = generateEmailTemplate({
        recruiterName: 'Govardhan (Test Lead)',
        company: 'Sample Tech Enterprise India',
        role: 'Senior Salesforce Developer',
        sourceSnippet: 'Test scan demonstration for LWC and Apex development.'
      });

      const attachments = [];
      const resumePath = getResumePath();
      if (resumePath) {
        attachments.push({
          filename: 'Govardhan_Reddy_Salesforce_Developer_Resume.pdf',
          path: resumePath,
          contentType: 'application/pdf'
        });
      }

      await transporter.sendMail({
        from: `"${settings.candidateName}" <${testConfig?.smtpUser || settings.smtpUser}>`,
        to: testRecipient,
        subject: `[SMTP TEST] ${subject}`,
        html,
        attachments
      });
      emailSent = true;
    }

    res.json({
      success: true,
      message: 'SMTP connection verified successfully!',
      testEmailSentTo: emailSent ? testRecipient : null
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to authenticate with Gmail SMTP'
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Quick Outreach Engine API] 🚀 Running on http://localhost:${PORT}`);
});
