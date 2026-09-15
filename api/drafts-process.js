import { processAndSendAllDrafts } from '../server/services/draftService.js';

export const config = {
  maxDuration: 60 // Allow 60s execution window on Vercel Serverless
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const result = await processAndSendAllDrafts();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
