import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { getSettings, sendApplicationEmail } from './emailService.js';
import { sanitizeAndValidateEmail, extractEmails } from './leadFinder.js';

/**
 * Connect to Gmail IMAP using configured App Password
 */
async function connectImap() {
  const settings = getSettings();
  if (!settings.smtpPass) {
    throw new Error('Gmail App Password is not configured in Settings.');
  }

  const config = {
    imap: {
      user: settings.smtpUser,
      password: settings.smtpPass ? settings.smtpPass.replace(/[^a-zA-Z0-9]/g, '') : '',
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000
    }
  };

  return await imaps.connect(config);
}

/**
 * Find the Gmail Drafts folder name across international/legacy Gmail folder structures
 */
async function openDraftsFolder(connection) {
  const boxes = await connection.getBoxes();
  const possibleNames = ['[Gmail]/Drafts', 'Drafts', '[Google Mail]/Drafts', 'INBOX.Drafts'];

  for (const name of possibleNames) {
    try {
      await connection.openBox(name);
      console.log(`[DraftService] 📁 Opened Gmail Drafts folder: "${name}"`);
      return name;
    } catch (err) {}
  }

  for (const rootKey in boxes) {
    if (rootKey.toLowerCase().includes('gmail') || rootKey.toLowerCase().includes('google')) {
      const children = boxes[rootKey].children || {};
      for (const childKey in children) {
        if (childKey.toLowerCase().includes('draft')) {
          const fullName = `${rootKey}/${childKey}`;
          try {
            await connection.openBox(fullName);
            return fullName;
          } catch (e) {}
        }
      }
    }
  }

  throw new Error('Could not locate Gmail Drafts folder in your account.');
}

/**
 * Fetch all draft emails from Gmail
 */
export async function fetchGmailDrafts() {
  let connection;
  try {
    connection = await connectImap();
    await openDraftsFolder(connection);

    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    const drafts = [];

    for (const item of messages) {
      const allParts = item.parts.find(p => p.which === '');
      const rawHeader = item.parts.find(p => p.which === 'HEADER');
      
      let parsedMail = null;
      if (allParts && allParts.body) {
        parsedMail = await simpleParser(allParts.body);
      }

      const uid = item.attributes.uid;
      const rawTo = parsedMail?.to?.text || rawHeader?.body?.to?.[0] || '';
      const subject = parsedMail?.subject || rawHeader?.body?.subject?.[0] || '(No Subject)';
      const bodyText = parsedMail?.text || '';
      const bodyHtml = parsedMail?.html || null;

      // Extract emails from TO, CC, Subject, and Body
      const detectedEmails = [];
      
      if (parsedMail?.to?.value) {
        parsedMail.to.value.forEach(addr => {
          const cleaned = sanitizeAndValidateEmail(addr.address);
          if (cleaned) detectedEmails.push(cleaned);
        });
      }

      const textToScan = `${rawTo} ${subject} ${bodyText}`;
      const extractedFromText = extractEmails(textToScan);
      extractedFromText.forEach(e => {
        if (!detectedEmails.includes(e)) detectedEmails.push(e);
      });

      const cleanBodyText = bodyText.replace(/Thanks & Regards[\s\S]*/i, '').trim();
      const hasRealCustomBody = cleanBodyText.length > 25;

      if (detectedEmails.length > 0) {
        detectedEmails.forEach(email => {
          drafts.push({
            uid,
            to: email,
            recruiterName: extractNameFromSubject(subject) || 'Hiring Team',
            company: extractCompanyFromSubject(subject) || 'Company',
            role: extractRoleFromSubject(subject) || 'Salesforce Developer',
            originalSubject: subject,
            customSubject: subject !== '(No Subject)' && subject.trim().length > 3 ? subject : null,
            customHtml: hasRealCustomBody ? bodyHtml : null,
            snippet: cleanBodyText.substring(0, 150) || 'Salesforce Developer Application Draft',
            date: item.attributes.date || new Date().toISOString()
          });
        });
      } else {
        drafts.push({
          uid,
          to: '',
          recruiterName: extractNameFromSubject(subject) || 'Hiring Team',
          company: extractCompanyFromSubject(subject) || 'Company',
          role: extractRoleFromSubject(subject) || 'Salesforce Developer',
          originalSubject: subject,
          customSubject: subject !== '(No Subject)' && subject.trim().length > 3 ? subject : null,
          customHtml: hasRealCustomBody ? bodyHtml : null,
          snippet: cleanBodyText.substring(0, 150) || 'Saved Gmail Draft',
          date: item.attributes.date || new Date().toISOString()
        });
      }
    }

    connection.end();
    return drafts;
  } catch (err) {
    if (connection) connection.end();
    console.error('[DraftService] Error fetching Gmail drafts:', err.message);
    throw err;
  }
}

/**
 * Process all saved Gmail drafts:
 * 1. Sends all emails via SMTP + attaches Govardhan_Resume.pdf.
 * 2. Connects a fresh dedicated IMAP session to delete & move sent drafts to Trash in Gmail!
 */
export async function processAndSendAllDrafts() {
  const drafts = await fetchGmailDrafts();
  
  if (drafts.length === 0) {
    return { success: true, processedCount: 0, message: 'No drafts found in your Gmail account.' };
  }

  let processedCount = 0;
  const errors = [];
  const processedUids = [];

  // Step 1: Dispatch application emails via SMTP
  for (const draft of drafts) {
    if (!draft.to) continue; // Skip drafts without recipient

    try {
      console.log(`[DraftService] 🚀 Sending email for draft UID ${draft.uid} to ${draft.to}...`);
      
      await sendApplicationEmail({
        to: draft.to,
        recruiterName: draft.recruiterName,
        company: draft.company,
        role: draft.role,
        sourceSnippet: draft.snippet,
        sourceUrl: 'Gmail Draft',
        customSubject: draft.customSubject,
        customHtml: draft.customHtml
      });

      processedCount += 1;
      processedUids.push(draft.uid);
    } catch (err) {
      console.error(`[DraftService] Failed to send email for draft UID ${draft.uid} (${draft.to}):`, err.message);
      errors.push({ email: draft.to, error: err.message });
    }
  }

  // Step 2: Open a fresh dedicated IMAP connection to delete processed drafts from Gmail
  if (processedUids.length > 0) {
    let cleanConnection = null;
    try {
      console.log(`[DraftService] 🧹 Connecting fresh IMAP to delete ${processedUids.length} draft(s)...`);
      cleanConnection = await connectImap();
      await openDraftsFolder(cleanConnection);

      for (const uid of processedUids) {
        try {
          // Remove \Draft flag
          await new Promise((r) => cleanConnection.imap.delFlags(uid, ['\\Draft'], () => r()));
        } catch (e) {}

        try {
          // Add \Deleted flag
          await new Promise((r) => cleanConnection.imap.addFlags(uid, ['\\Deleted'], () => r()));
        } catch (e) {}

        try {
          // Move message to Trash
          await new Promise((r) => cleanConnection.imap.move(uid, '[Gmail]/Trash', (err) => {
            if (err) {
              cleanConnection.imap.move(uid, 'Trash', () => r());
            } else {
              r();
            }
          }));
        } catch (e) {}
      }

      try {
        await new Promise((r) => cleanConnection.imap.expunge(() => r()));
      } catch (e) {}

      console.log(`[DraftService] 🧹 Successfully deleted & moved ${processedUids.length} draft(s) to Trash.`);
    } catch (err) {
      console.warn('[DraftService] Warning during IMAP draft deletion phase:', err.message);
    } finally {
      if (cleanConnection) {
        try { cleanConnection.end(); } catch (e) {}
      }
    }
  }

  return {
    success: true,
    processedCount,
    failedCount: errors.length,
    errors
  };
}

function extractNameFromSubject(sub) {
  const match = sub.match(/for ([A-Z][a-z]+ [A-Z][a-z]+)/i);
  return match ? match[1] : null;
}

function extractCompanyFromSubject(sub) {
  if (sub.includes(' at ')) {
    return sub.split(' at ')[1].split(/[-|]/)[0].trim();
  }
  return null;
}

function extractRoleFromSubject(sub) {
  if (/Salesforce Developer/i.test(sub)) return 'Salesforce Developer';
  if (/LWC/i.test(sub)) return 'Salesforce LWC Specialist';
  return 'Salesforce Developer';
}
