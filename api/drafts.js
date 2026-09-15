import { fetchGmailDrafts } from '../server/services/draftService.js';

export default async function handler(req, res) {
  try {
    const drafts = await fetchGmailDrafts();
    res.status(200).json({ success: true, count: drafts.length, drafts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
