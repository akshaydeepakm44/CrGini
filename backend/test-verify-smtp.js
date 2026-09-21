import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { getTransporter, verifySmtpConnection } from './src/services/emailService.js';

async function verify() {
  console.log('====================================================');
  console.log('CREATIVEGINI SMTP AUTHENTICATION & CONFIG CHECK');
  console.log('====================================================\n');

  console.log('Configuration status:');
  console.log('  EMAIL_HOST:    ', process.env.EMAIL_HOST || '(not set)');
  console.log('  EMAIL_PORT:    ', process.env.EMAIL_PORT || '587');
  console.log('  EMAIL_SECURE:  ', process.env.EMAIL_SECURE || 'false');
  console.log('  EMAIL_USER:    ', process.env.EMAIL_USER || '(not set)');
  console.log('  EMAIL_FROM:    ', process.env.EMAIL_FROM || '(not set)');
  console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '******** (configured)' : '(not set)');
  console.log('  PORTAL_BASE_URL:', process.env.PORTAL_BASE_URL || 'http://localhost:5174');

  console.log('\nTesting SMTP Connection...');
  const result = await verifySmtpConnection();

  if (!result.configured) {
    console.log('\n[INFO] SMTP credentials are not configured yet in backend/.env.');
    console.log('Status message:', result.error);
    return;
  }

  if (result.success) {
    console.log('\n[SUCCESS] SMTP Server Connection Verified!');
    console.log(result.message);

    // Controlled test email sending
    const recipient = process.env.TEST_EMAIL_RECIPIENT || process.env.EMAIL_USER;
    console.log(`\nSending controlled test email to: ${recipient}...`);
    try {
      const transporter = getTransporter();
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `CreativeGini <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: 'CreativeGini Portal Test Email',
        text: 'This is a test email verifying that CreativeGini can send emails from ' + process.env.EMAIL_USER,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0B1321; color: #FFFFFF; border-radius: 8px;">
            <h2 style="color: #00E5FF; margin-top: 0;">CreativeGini Email Verification</h2>
            <p>This is a verified test email sent from <strong>${process.env.EMAIL_USER}</strong>.</p>
            <p style="color: #94A3B8;">If you received this message, SMTP delivery and credentials are functioning properly.</p>
          </div>
        `
      });
      console.log('[SUCCESS] Test email dispatched successfully!');
      console.log('  Message ID: ', info.messageId);
      console.log('  From:       ', process.env.EMAIL_FROM || process.env.EMAIL_USER);
      console.log('  To:         ', recipient);
    } catch (sendErr) {
      console.error('[ERROR] Failed to dispatch test email:', sendErr.message);
    }
  } else {
    console.error('\n[FAILED] SMTP Verification failed:');
    console.error('  Error:', result.error);
  }
}

verify().catch(console.error);
