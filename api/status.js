import { getSettings, getHistory } from '../server/services/emailService.js';

export default function handler(req, res) {
  const settings = getSettings();
  res.status(200).json({
    ok: true,
    isSmtpConfigured: Boolean(settings.smtpPass || process.env.SMTP_PASS),
    smtpUser: settings.smtpUser || process.env.SMTP_USER,
    historyCount: getHistory().length
  });
}
