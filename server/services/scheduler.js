import cron from 'node-cron';
import { getLeads, markLeadSent, scanLinkedInHiringPosts } from './leadFinder.js';
import { sendApplicationEmail, getSettings } from './emailService.js';

let countdownTimer = null;
let countdownRemainingSeconds = 0;
let isProcessingBatch = false;
let lastScanTime = null;
let lastBatchResult = null;

// Sleep utility to space out automated emails
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getSchedulerState = () => {
  const settings = getSettings();
  const leads = getLeads();
  return {
    autoSendEnabled: settings.autoSendEnabled,
    countdownDurationMinutes: settings.countdownMinutes,
    countdownRemainingSeconds,
    isCountingDown: countdownTimer !== null && countdownRemainingSeconds > 0,
    isProcessingBatch,
    pendingLeadsCount: leads.length,
    lastScanTime,
    lastBatchResult
  };
};

export const startCountdown = (customMinutes = null) => {
  const settings = getSettings();
  const minutes = customMinutes || settings.countdownMinutes || 15;
  countdownRemainingSeconds = minutes * 60;

  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  console.log(`[Scheduler] ⏱️ Auto-send countdown started: ${minutes} minutes remaining.`);

  countdownTimer = setInterval(async () => {
    countdownRemainingSeconds -= 1;

    if (countdownRemainingSeconds <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      console.log('[Scheduler] 🚀 Countdown expired! Triggering automated batch dispatch...');
      await autoDispatchPendingLeads();
    }
  }, 1000);
};

export const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdownRemainingSeconds = 0;
  console.log('[Scheduler] ⏸️ Auto-send countdown paused/cancelled.');
};

export const resetCountdown = () => {
  const settings = getSettings();
  startCountdown(settings.countdownMinutes);
};

export const autoDispatchPendingLeads = async () => {
  const settings = getSettings();
  const leads = getLeads();

  if (!settings.smtpPass) {
    console.warn('[Scheduler] ⚠️ Cannot auto-dispatch: Gmail SMTP password not configured in Settings.');
    lastBatchResult = { success: false, error: 'SMTP password not configured', timestamp: new Date().toISOString() };
    return lastBatchResult;
  }

  if (leads.length === 0) {
    console.log('[Scheduler] ℹ️ No pending leads to auto-dispatch.');
    return { success: true, sentCount: 0 };
  }

  isProcessingBatch = true;
  let sentCount = 0;
  const errors = [];

  console.log(`[Scheduler] 📨 Starting auto-dispatch of ${leads.length} leads...`);

  for (const lead of [...leads]) {
    try {
      console.log(`[Scheduler] Sending to ${lead.email} (${lead.company || 'Company'})...`);
      await sendApplicationEmail({
        to: lead.email,
        recruiterName: lead.recruiterName,
        company: lead.company,
        role: lead.role,
        sourceSnippet: lead.snippet,
        sourceUrl: lead.sourceUrl
      });
      markLeadSent(lead.id);
      sentCount += 1;

      // Safe delay between emails (10 seconds) to avoid spam filters
      await delay(10000);
    } catch (err) {
      console.error(`[Scheduler] Failed to send to ${lead.email}:`, err.message);
      errors.push({ email: lead.email, error: err.message });
    }
  }

  isProcessingBatch = false;
  lastBatchResult = {
    success: true,
    sentCount,
    failedCount: errors.length,
    errors,
    timestamp: new Date().toISOString()
  };

  console.log(`[Scheduler] ✅ Batch dispatch finished. Sent: ${sentCount}, Failed: ${errors.length}`);
  return lastBatchResult;
};

// Initialize Recurring Cron (e.g. Weekdays at 9:30 AM & 2:30 PM IST)
export const initCronSchedule = () => {
  // Run at 09:30 and 14:30 everyday (IST / Server time)
  cron.schedule('30 9,14 * * 1-5', async () => {
    console.log('[Cron] 🔍 Running scheduled LinkedIn India recruiter scan...');
    lastScanTime = new Date().toISOString();
    
    const result = await scanLinkedInHiringPosts();
    console.log(`[Cron] Found ${result.newCount} fresh leads.`);

    const settings = getSettings();
    if (settings.autoSendEnabled && result.newCount > 0) {
      startCountdown(settings.countdownMinutes);
    }
  });

  console.log('[Scheduler] 📅 Cron scheduler initialized for automated weekday scans.');
};
