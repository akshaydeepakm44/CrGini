import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import {
  sendTicketAssignedEmail,
  sendWorkStartedEmail,
  sendTicketProgressEmail,
  sendWorkSubmittedEmail,
  sendChangesRequestedEmail,
  sendWorkResubmittedEmail,
  sendWorkApprovedEmail,
  sendTicketCompletedEmail,
  isDuplicateEmail,
  clearEmailDedupeCache,
  getTicketUrl,
  formatServiceType,
} from './src/services/emailService.js';

async function runTests() {
  console.log('====================================================');
  console.log('CREATIVEGINI EMAIL NOTIFICATION SYSTEM TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const mockClient = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Acme Corp Client',
    email: 'client@acmecorp.com'
  };

  const mockSpecialist = {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Sarah Specialist',
    email: 'specialist@creativegini.com'
  };

  const mockTicket = {
    id: '33333333-3333-3333-3333-333333333333',
    ticketId: 'CG-1099',
    title: 'Landing Page Redesign & Conversion Sprint',
    serviceType: 'LANDING_PAGE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    price: 599,
    description: 'Optimize hero section, value proposition, and mobile CTA conversion.',
    userId: mockClient,
    companyId: { name: 'Acme Corp' },
    assignedTo: mockSpecialist,
    dueDate: new Date(Date.now() + 7 * 86400000)
  };

  const mockSubmissionV1 = {
    id: '44444444-4444-4444-4444-444444444444',
    version: 1,
    title: 'Initial Figma Prototypes & Copy Draft',
    description: 'Completed wireframes and high-fidelity mockups for desktop and mobile.',
    externalLink: 'https://figma.com/file/test-design-cg1099'
  };

  const mockSubmissionV2 = {
    id: '55555555-5555-5555-5555-555555555555',
    version: 2,
    title: 'Revised Design with Updated CTAs & Testimonial Carousel',
    description: 'Incorporated all feedback from revision round 1.',
    externalLink: 'https://figma.com/file/test-design-cg1099-v2'
  };

  // Test 1: Service Type Formatting & Deep-Link URL
  try {
    console.log('TEST 1: Service Type Formatting & Direct Deep Link URLs');
    const formattedBoost = formatServiceType('COMPANY_BOOST');
    const formattedLead = formatServiceType('COMPANY_LEAD');
    const formattedUI = formatServiceType('LANDING_PAGE');
    const url = getTicketUrl('CG-1099', 'review');

    if (formattedBoost === 'Company Boost' && formattedLead === 'Company Lead' && formattedUI === 'Landing Page Enhancement' && url.includes('/ticket/CG-1099?tab=review')) {
      console.log('  [PASS] Formatter and URL generator working correctly:', { formattedBoost, formattedLead, formattedUI, url });
      passed++;
    } else {
      throw new Error(`Unexpected formatting: ${JSON.stringify({ formattedBoost, formattedLead, formattedUI, url })}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 1:', err.message);
    failed++;
  }

  // Clear cache before event tests
  clearEmailDedupeCache();

  // Test 2: Event 1 - New Ticket Assigned Email
  try {
    console.log('\nTEST 2: Event 1 - New Ticket Assigned Email');
    const res = await sendTicketAssignedEmail({
      specialist: mockSpecialist,
      ticket: mockTicket,
      assignedBy: { name: 'Admin Lead' }
    });
    if (res.success && (res.simulated || res.messageId)) {
      console.log('  [PASS] sendTicketAssignedEmail succeeded:', res);
      passed++;
    } else {
      throw new Error(`Failed with: ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 2:', err.message);
    failed++;
  }

  // Test 3: Event 2 - Work Started Email
  try {
    console.log('\nTEST 3: Event 2 - Work Started Email');
    const res = await sendWorkStartedEmail({
      client: mockClient,
      ticket: mockTicket,
      specialist: mockSpecialist
    });
    if (res.success && (res.simulated || res.messageId)) {
      console.log('  [PASS] sendWorkStartedEmail succeeded:', res);
      passed++;
    } else {
      throw new Error(`Failed with: ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 3:', err.message);
    failed++;
  }

  // Test 4: Event 3 - Ticket Progress Email
  try {
    console.log('\nTEST 4: Event 3 - Ticket Progress / Meaningful Update Email');
    const res = await sendTicketProgressEmail({
      client: mockClient,
      ticket: mockTicket,
      specialist: mockSpecialist,
      updateText: '[UPDATE] Hero wireframes completed. Moving to interactive prototype.'
    });
    if (res.success && (res.simulated || res.messageId)) {
      console.log('  [PASS] sendTicketProgressEmail succeeded:', res);
      passed++;
    } else {
      throw new Error(`Failed with: ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 4:', err.message);
    failed++;
  }

  // Test 5: Event 4 - Work Submitted Email (V1)
  try {
    console.log('\nTEST 5: Event 4 - Work Submitted Email (V1)');
    const res = await sendWorkSubmittedEmail({
      client: mockClient,
      ticket: mockTicket,
      submission: mockSubmissionV1,
      specialist: mockSpecialist
    });
    if (res.success && (res.simulated || res.messageId)) {
      console.log('  [PASS] sendWorkSubmittedEmail succeeded:', res);
      passed++;
    } else {
      throw new Error(`Failed with: ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 5:', err.message);
    failed++;
  }

  // Test 6: Event 5 - Changes Requested Email
  try {
    console.log('\nTEST 6: Event 5 - Changes Requested Email');
    const res = await sendChangesRequestedEmail({
      specialist: mockSpecialist,
      ticket: mockTicket,
      feedback: 'Please make the primary CTA button neon cyan and increase testimonial text contrast.',
      client: mockClient
    });
    if (res.success && (res.simulated || res.messageId)) {
      console.log('  [PASS] sendChangesRequestedEmail succeeded:', res);
      passed++;
    } else {
      throw new Error(`Failed with: ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 6:', err.message);
    failed++;
  }

  // Test 7: Event 6 - Work Resubmitted Email (V > 1)
  try {
    console.log('\nTEST 7: Event 6 - Work Resubmitted Email (V2)');
    const res = await sendWorkResubmittedEmail({
      client: mockClient,
      ticket: mockTicket,
      submission: mockSubmissionV2,
      specialist: mockSpecialist
    });
    if (res.success && (res.simulated || res.messageId)) {
      console.log('  [PASS] sendWorkResubmittedEmail succeeded:', res);
      passed++;
    } else {
      throw new Error(`Failed with: ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 7:', err.message);
    failed++;
  }

  // Test 8: Event 7 - Work Approved Email
  try {
    console.log('\nTEST 8: Event 7 - Work Approved Email');
    const res = await sendWorkApprovedEmail({
      specialist: mockSpecialist,
      ticket: mockTicket,
      client: mockClient
    });
    if (res.success && (res.simulated || res.messageId)) {
      console.log('  [PASS] sendWorkApprovedEmail succeeded:', res);
      passed++;
    } else {
      throw new Error(`Failed with: ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 8:', err.message);
    failed++;
  }

  // Test 9: Event 8 - Ticket Completed Email
  try {
    console.log('\nTEST 9: Event 8 - Ticket Completed Email');
    const res = await sendTicketCompletedEmail({
      client: mockClient,
      ticket: mockTicket,
      completedBy: { name: 'Acme Corp Client' },
      reason: 'All deliverables verified and approved.'
    });
    if (res.success && (res.simulated || res.messageId)) {
      console.log('  [PASS] sendTicketCompletedEmail succeeded:', res);
      passed++;
    } else {
      throw new Error(`Failed with: ${JSON.stringify(res)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 9:', err.message);
    failed++;
  }

  // Test 10: Deduplication Cache Protection
  try {
    console.log('\nTEST 10: Deduplication Cache Protection');
    // Immediate second call with identical payload must return deduplicated: true
    const resDuplicate = await sendWorkApprovedEmail({
      specialist: mockSpecialist,
      ticket: mockTicket,
      client: mockClient
    });
    if (resDuplicate.success && resDuplicate.deduplicated === true) {
      console.log('  [PASS] Duplicate email successfully caught and suppressed:', resDuplicate);
      passed++;
    } else {
      throw new Error(`Expected deduplicated: true, got: ${JSON.stringify(resDuplicate)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 10:', err.message);
    failed++;
  }

  // Test 11: Error Isolation & Missing Recipient Handling
  try {
    console.log('\nTEST 11: Error Isolation & Missing Recipient Handling');
    const resMissingEmail = await sendWorkStartedEmail({
      client: { name: 'No Email User' },
      ticket: mockTicket,
      specialist: mockSpecialist
    });
    if (resMissingEmail.success === false && resMissingEmail.reason === 'invalid_payload') {
      console.log('  [PASS] Handled missing email gracefully without crashing:', resMissingEmail);
      passed++;
    } else {
      throw new Error(`Unexpected result: ${JSON.stringify(resMissingEmail)}`);
    }
  } catch (err) {
    console.error('  [FAIL] TEST 11:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error running email tests:', err);
  process.exit(1);
});
