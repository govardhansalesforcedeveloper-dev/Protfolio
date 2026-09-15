import { getSettings, saveSettings } from '../server/services/emailService.js';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const settings = getSettings();
    return res.status(200).json({
      ...settings,
      smtpPassMasked: settings.smtpPass ? '••••••••••••••••' : ''
    });
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    if (payload.smtpPass && payload.smtpPass.includes('••••')) {
      delete payload.smtpPass;
    }
    const updated = saveSettings(payload);
    return res.status(200).json({ success: true, settings: updated });
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
