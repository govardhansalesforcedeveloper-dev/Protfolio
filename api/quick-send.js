import { sendApplicationEmail, sanitizeAndValidateEmail, isAlreadyEmailed, getHistory } from '../server/services/emailService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { rawEmails, recruiterName, company, role } = req.body || {};

  if (!rawEmails) {
    return res.status(400).json({ error: 'Please provide at least one recruiter email address.' });
  }

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
    return res.status(400).json({ error: 'No valid deliverable email addresses found.' });
  }

  let sentCount = 0;
  const errors = [];

  for (const email of validEmails) {
    try {
      await sendApplicationEmail({
        to: email,
        recruiterName: recruiterName || 'Hiring Team',
        company: company || 'Company',
        role: role || 'Salesforce Developer',
        sourceSnippet: 'Direct Application Dispatch',
        sourceUrl: 'Quick Dispatcher'
      });

      sentCount += 1;
      await new Promise(r => setTimeout(r, 4000));
    } catch (err) {
      console.error(`[QuickSend] Error sending to ${email}:`, err.message);
      errors.push({ email, error: err.message });
    }
  }

  res.status(200).json({
    success: true,
    sentCount,
    failedCount: errors.length,
    errors,
    history: getHistory()
  });
}
