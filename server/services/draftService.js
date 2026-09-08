import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { getSettings, sendApplicationEmail } from './emailService.js';
import { sanitizeAndValidateEmail } from './leadFinder.js';

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
  
  // Possible names for Gmail Drafts folder
  const possibleNames = ['[Gmail]/Drafts', 'Drafts', '[Google Mail]/Drafts', 'INBOX.Drafts'];

  for (const name of possibleNames) {
    try {
      await connection.openBox(name);
      console.log(`[DraftService] 📁 Opened Gmail Drafts folder: "${name}"`);
      return name;
    } catch (err) {
      // try next box name
    }
  }

  // Recursive search if standard names fail
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
 * Fetch all pending draft emails from Gmail
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

      // Extract valid deliverable recipient email addresses
      const emails = [];
      if (parsedMail?.to?.value) {
        parsedMail.to.value.forEach(addr => {
          const cleaned = sanitizeAndValidateEmail(addr.address);
          if (cleaned) emails.push(cleaned);
        });
      }

      // If no TO header, extract emails from body or subject
      if (emails.length === 0) {
        const extracted = rawTo ? rawTo.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi) || [] : [];
        extracted.forEach(raw => {
          const cleaned = sanitizeAndValidateEmail(raw);
          if (cleaned) emails.push(cleaned);
        });
      }

      // Determine if the draft has user-written custom content beyond empty signature
      const cleanBodyText = bodyText.replace(/Thanks & Regards[\s\S]*/i, '').trim();
      const hasRealCustomBody = cleanBodyText.length > 25;

      if (emails.length > 0) {
        emails.forEach(email => {
          drafts.push({
            uid,
            to: email,
            recruiterName: extractNameFromSubject(subject) || 'Hiring Team',
            company: extractCompanyFromSubject(subject) || 'Company',
            role: extractRoleFromSubject(subject) || 'Salesforce Developer',
            originalSubject: subject,
            customSubject: subject !== '(No Subject)' && subject.trim().length > 3 ? subject : null,
            customHtml: hasRealCustomBody ? bodyHtml : null, // Fallback to rich template if draft is blank
            snippet: cleanBodyText.substring(0, 150) || 'Salesforce Developer Application',
            date: item.attributes.date || new Date().toISOString()
          });
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
 * 1. Reads all recipient recruiter emails from your saved Gmail Drafts.
 * 2. Renders rich cover letter body + attaches Govardhan_Resume.pdf.
 * 3. Dispatches via Gmail SMTP.
 * 4. Moves draft to Trash & expunges so it is deleted from Gmail!
 */
export async function processAndSendAllDrafts() {
  const drafts = await fetchGmailDrafts();
  
  if (drafts.length === 0) {
    return { success: true, processedCount: 0, message: 'No drafts found in your Gmail account.' };
  }

  let connection = null;
  try {
    connection = await connectImap();
    await openDraftsFolder(connection);
  } catch (e) {
    console.warn('[DraftService] Could not open IMAP connection for deletion; emails will still send via SMTP.');
  }

  let processedCount = 0;
  const errors = [];
  const processedUids = new Set();

  for (const draft of drafts) {
    try {
      console.log(`[DraftService] 🚀 Processing draft for ${draft.to}...`);
      
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
      processedUids.add(draft.uid);

      // 8-second delay between emails to protect sender reputation
      await new Promise(r => setTimeout(r, 8000));
    } catch (err) {
      console.error(`[DraftService] Failed to send draft for ${draft.to}:`, err.message);
      errors.push({ email: draft.to, error: err.message });
    }
  }

  // Delete & expunge processed drafts from Gmail
  if (connection && processedUids.size > 0) {
    for (const uid of Array.from(processedUids)) {
      try {
        await connection.addFlags(uid, '\\Deleted');
      } catch (e) {}

      // Move draft to Gmail Trash so Gmail removes it from Drafts
      try {
        await connection.moveMessage(uid, '[Gmail]/Trash');
      } catch (e) {
        try {
          await connection.moveMessage(uid, 'Trash');
        } catch (e2) {}
      }
    }

    try {
      await connection.deleteAccumulatedFlags();
      if (connection.imap && typeof connection.imap.expunge === 'function') {
        await new Promise((resolve) => connection.imap.expunge(() => resolve()));
      }
      console.log(`[DraftService] 🧹 Successfully deleted & moved ${processedUids.size} drafts to Trash in Gmail.`);
    } catch (err) {
      console.warn('[DraftService] Warning expunging drafts:', err.message);
    }
  }

  if (connection) connection.end();

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
