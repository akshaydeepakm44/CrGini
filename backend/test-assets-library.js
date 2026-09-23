import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { query, connectPostgres } from './src/config/postgres.js';
import { findUserByEmail } from './src/repositories/userRepository.js';

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...(options.headers || {}) };
  if (!headers['Content-Type'] && !options.noContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await res.text();
    } catch {
      data = null;
    }
  }

  return {
    status: res.status,
    ok: res.ok,
    headers: res.headers,
    data,
  };
}

async function runAssetsLibraryTestSuite() {
  console.log('====================================================');
  console.log('CREATIVEGINI USER ASSETS / MEDIA LIBRARY TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const clientAEmail = `client.a.${timestamp}@creativegini.test`;
  const clientBEmail = `client.b.${timestamp}@creativegini.test`;
  const tempPassword = 'TestPassword@123';

  let adminToken = null;
  let clientAToken = null;
  let clientBToken = null;
  let clientAUser = null;
  let clientBUser = null;
  let testTicketId = null;
  let testTicketCode = null;
  let v1SubmissionId = null;
  let v2SubmissionId = null;
  let imageAssetId = null;
  let videoAssetId = null;
  let docAssetId = null;
  let v2ImageAssetId = null;

  try {
    await connectPostgres();

    // 1. Setup Admin Authentication
    console.log('[Step 1]: Authenticating Admin user...');
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@creativegini.com', password: 'Admin@123' })
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data?.token, 'Admin logged in successfully');
    adminToken = adminLoginRes.data.token;

    // Create Client A (owns the ticket and deliverables)
    console.log('\n[Step 2]: Creating Client A and Client B for ownership isolation tests...');
    const clientACreateRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: clientAEmail,
        password: tempPassword,
        name: 'Client Alpha User',
        companyName: `Alpha Corp ${timestamp}`,
        role: 'USER',
        phone: '+1 555-0101'
      })
    }, adminToken);
    assert(clientACreateRes.status === 201, 'Client A created successfully');
    clientAUser = clientACreateRes.data.user;

    // Create Client B (unrelated company to verify strict authorization and no IDOR)
    const clientBCreateRes = await request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: clientBEmail,
        password: tempPassword,
        name: 'Client Beta User',
        companyName: `Beta Corp ${timestamp}`,
        role: 'USER',
        phone: '+1 555-0102'
      })
    }, adminToken);
    assert(clientBCreateRes.status === 201, 'Client B created successfully');
    clientBUser = clientBCreateRes.data.user;

    // Authenticate Client A and Client B
    const clientALoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: clientAEmail, password: tempPassword })
    });
    assert(clientALoginRes.status === 200 && clientALoginRes.data?.token, 'Client A logged in');
    clientAToken = clientALoginRes.data.token;

    const clientBLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: clientBEmail, password: tempPassword })
    });
    assert(clientBLoginRes.status === 200 && clientBLoginRes.data?.token, 'Client B logged in');
    clientBToken = clientBLoginRes.data.token;

    // Verify Empty State for Client A before any deliverables are submitted
    console.log('\n[Step 3]: Verifying empty state in Assets for new user...');
    const emptyAssetsRes = await request('/assets', { method: 'GET' }, clientAToken);
    assert(emptyAssetsRes.status === 200, 'GET /api/assets succeeds with empty state');
    assert(Array.isArray(emptyAssetsRes.data.assets) && emptyAssetsRes.data.assets.length === 0, 'No assets exist prior to work submission');
    assert(Array.isArray(emptyAssetsRes.data.groupedAssets) && emptyAssetsRes.data.groupedAssets.length === 0, 'Grouped assets array is empty');

    // 2. Create a test ticket for Client A
    console.log('\n[Step 4]: Creating a test service ticket for Client A...');
    const ticketRes = await request('/requests', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Q3 Brand Revamp & Motion Video',
        description: 'Design brand guidelines, promotional campaign image poster, and motion demo video.',
        serviceType: 'COMPANY_LEAD',
        priority: 'HIGH'
      })
    }, clientAToken);

    assert(ticketRes.status === 201 && ticketRes.data?.request, 'Ticket created for Client A');
    testTicketId = ticketRes.data.request._id;
    testTicketCode = ticketRes.data.request.ticketId;
    console.log(`    Created Ticket ID: ${testTicketId}, Code: ${testTicketCode}`);

    // Sample Base64 media data for testing
    // 1x1 Transparent PNG in base64:
    const samplePngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    // Sample small video payload: 500 bytes of mock MP4 binary in base64
    const sampleVideoDataUrl = 'data:video/mp4;base64,' + Buffer.from('TEST_MP4_VIDEO_STREAMING_BINARY_DATA_WITH_ENOUGH_BYTES_FOR_RANGE_TESTS_1234567890_ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz_0123456789_REPEAT_FOR_SEEKING_VERIFICATION_CHUNK_SIZE_PADDING_OK_TEST').toString('base64');
    // Sample PDF document data:
    const samplePdfDataUrl = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4 Mock Brand Guidelines Deliverable Document').toString('base64');

    // 3. Team submits V1 deliverables: image, video, document
    console.log('\n[Step 5]: Team submits Deliverables V1 (image, video, document)...');
    const v1SubmissionRes = await request(`/requests/${testTicketId}/submissions`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Brand Assets V1 Initial Delivery',
        description: 'First draft of the campaign poster, teaser motion video, and brand specs.',
        files: [
          {
            name: 'campaign-poster.png',
            url: samplePngDataUrl,
            size: '2.4 MB',
            type: 'image/png'
          },
          {
            name: 'campaign-video.mp4',
            url: sampleVideoDataUrl,
            size: '18.6 MB',
            type: 'video/mp4'
          },
          {
            name: 'brand-specs.pdf',
            url: samplePdfDataUrl,
            size: '1.2 MB',
            type: 'application/pdf'
          }
        ],
        notes: 'Ready for initial client feedback'
      })
    }, adminToken);

    assert(v1SubmissionRes.status === 201, 'Team successfully submitted Deliverables V1');
    v1SubmissionId = v1SubmissionRes.data?.submission?._id;

    // 4. Team submits V2 deliverables: revised poster image
    console.log('\n[Step 6]: Team submits Deliverables V2 (revised poster)...');
    const v2SubmissionRes = await request(`/requests/${testTicketId}/submissions`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Brand Assets V2 Final Deliverables',
        description: 'Updated poster with client requested typography and color grading changes.',
        files: [
          {
            name: 'campaign-poster-final.png',
            url: samplePngDataUrl,
            size: '2.8 MB',
            type: 'image/png'
          }
        ],
        notes: 'All client requested revisions integrated'
      })
    }, adminToken);

    assert(v2SubmissionRes.status === 201, 'Team successfully submitted Deliverables V2');
    v2SubmissionId = v2SubmissionRes.data?.submission?._id;

    // 5. Authenticate as Client A and fetch Assets
    console.log('\n[Step 7]: Client A queries GET /api/assets (Automatic Asset Availability)...');
    const clientAssetsRes = await request('/assets', { method: 'GET' }, clientAToken);
    assert(clientAssetsRes.status === 200, 'GET /api/assets returned status 200');
    assert(clientAssetsRes.data.count === 4, `All 4 submitted files automatically appear in Assets (got: ${clientAssetsRes.data.count})`);

    const assets = clientAssetsRes.data.assets;
    const grouped = clientAssetsRes.data.groupedAssets;

    assert(grouped.length === 1, 'Assets are grouped under exactly 1 ticket/request');
    const ticketGroup = grouped[0];
    assert(ticketGroup.ticketCode === testTicketCode, `Group ticketCode matches (${testTicketCode})`);
    assert(ticketGroup.submissions.length === 2, 'Group preserves both Submission V1 and Submission V2');

    const subV2 = ticketGroup.submissions.find(s => s.submissionVersion === 2);
    const subV1 = ticketGroup.submissions.find(s => s.submissionVersion === 1);
    assert(subV2 && subV2.files.length === 1, 'Submission V2 contains 1 deliverable file');
    assert(subV1 && subV1.files.length === 3, 'Submission V1 contains 3 deliverable files');

    // Extract individual asset IDs
    const imgAsset = assets.find(a => a.fileName === 'campaign-poster.png');
    const vidAsset = assets.find(a => a.fileName === 'campaign-video.mp4');
    const docAsset = assets.find(a => a.fileName === 'brand-specs.pdf');
    const v2ImgAsset = assets.find(a => a.fileName === 'campaign-poster-final.png');

    assert(imgAsset && imgAsset.mimeType === 'image/png', 'Image asset has correct mimeType (image/png)');
    assert(imgAsset.fileSize === '2.4 MB', 'Image asset has correct fileSize (2.4 MB)');
    assert(imgAsset.submissionVersion === 1, 'Image asset correctly traceable to Submission V1');

    assert(vidAsset && vidAsset.mimeType === 'video/mp4', 'Video asset has correct mimeType (video/mp4)');
    assert(vidAsset.fileSize === '18.6 MB', 'Video asset has correct fileSize (18.6 MB)');

    assert(docAsset && docAsset.mimeType === 'application/pdf', 'Doc asset has correct mimeType (application/pdf)');
    assert(v2ImgAsset && v2ImgAsset.submissionVersion === 2, 'V2 image asset correctly traceable to Submission V2');

    imageAssetId = imgAsset.id;
    videoAssetId = vidAsset.id;
    docAssetId = docAsset.id;
    v2ImageAssetId = v2ImgAsset.id;

    // 6. Test Filtering and Sorting
    console.log('\n[Step 8]: Testing Search, Filter by Type, and Sorting in Assets API...');
    const searchRes = await request(`/assets?search=campaign-video`, { method: 'GET' }, clientAToken);
    assert(searchRes.data.count === 1 && searchRes.data.assets[0].fileName === 'campaign-video.mp4', 'Search filter for "campaign-video" matches video asset');

    const imageFilterRes = await request(`/assets?type=images`, { method: 'GET' }, clientAToken);
    assert(imageFilterRes.data.count === 2, 'Filter by type "images" returns exactly 2 image deliverables');

    const videoFilterRes = await request(`/assets?type=videos`, { method: 'GET' }, clientAToken);
    assert(videoFilterRes.data.count === 1, 'Filter by type "videos" returns exactly 1 video deliverable');

    const docFilterRes = await request(`/assets?type=documents`, { method: 'GET' }, clientAToken);
    assert(docFilterRes.data.count === 1, 'Filter by type "documents" returns exactly 1 document deliverable');

    // 7. Test Image Streaming (Direct viewing / Lightbox)
    console.log('\n[Step 9]: Testing Direct Image Streaming GET /api/assets/:id/stream...');
    const imgStreamRes = await request(`/assets/${imageAssetId}/stream`, { method: 'GET' }, clientAToken);
    assert(imgStreamRes.status === 200, 'Image stream returns status 200');
    assert(imgStreamRes.headers.get('content-type') === 'image/png', 'Image stream Content-Type is image/png');
    assert(imgStreamRes.headers.get('accept-ranges') === 'bytes', 'Image stream includes Accept-Ranges: bytes');

    // Also test media stream via ?token query param
    const imgStreamWithQueryTokenRes = await request(`/assets/${imageAssetId}/stream?token=${encodeURIComponent(clientAToken)}`, {
      method: 'GET'
    });
    assert(imgStreamWithQueryTokenRes.status === 200, 'Image stream with query param ?token=... succeeds (for <img> and <video> elements)');

    // 8. Test Video Streaming and HTTP Range Requests (Seeking support)
    console.log('\n[Step 10]: Testing Native HTML5 Video Seeking with HTTP 206 Range requests...');
    // Initial request without range
    const videoFullRes = await request(`/assets/${videoAssetId}/stream`, { method: 'GET' }, clientAToken);
    assert(videoFullRes.status === 200, 'Full video stream returns status 200');
    assert(videoFullRes.headers.get('content-type') === 'video/mp4', 'Video Content-Type is video/mp4');
    assert(videoFullRes.headers.get('accept-ranges') === 'bytes', 'Video Accept-Ranges is bytes');

    // Range request: seek to bytes 10-50
    const rangeRes = await request(`/assets/${videoAssetId}/stream`, {
      method: 'GET',
      headers: {
        'Range': 'bytes=10-50'
      }
    }, clientAToken);

    assert(rangeRes.status === 206, 'Video Range request returns HTTP 206 Partial Content');
    const contentRange = rangeRes.headers.get('content-range');
    assert(contentRange && contentRange.startsWith('bytes 10-50/'), `Content-Range header present and correct (${contentRange})`);
    assert(rangeRes.headers.get('content-length') === '41', 'Content-Length for bytes 10-50 is 41 bytes');
    assert(rangeRes.headers.get('accept-ranges') === 'bytes', 'Accept-Ranges is bytes in 206 response');

    // 9. Test Authenticated Download
    console.log('\n[Step 11]: Testing Authenticated Download GET /api/assets/:id/download...');
    const downloadRes = await request(`/assets/${imageAssetId}/download`, { method: 'GET' }, clientAToken);
    assert(downloadRes.status === 200, 'Asset download returns status 200');
    const contentDisposition = downloadRes.headers.get('content-disposition');
    assert(contentDisposition && contentDisposition.includes('attachment; filename="campaign-poster.png"'),
      `Content-Disposition preserves original filename (${contentDisposition})`);

    // 10. Test Security & Authorization Isolation (IDOR Prevention)
    console.log('\n[Step 12]: Testing Security, IDOR prevention & Company Isolation...');

    // A. Unauthenticated request (no token)
    const unauthRes = await request(`/assets/${imageAssetId}/stream`, { method: 'GET' });
    assert(unauthRes.status === 401, 'Unauthenticated stream request returns 401 Unauthorized');

    const unauthDownloadRes = await request(`/assets/${imageAssetId}/download`, { method: 'GET' });
    assert(unauthDownloadRes.status === 401, 'Unauthenticated download request returns 401 Unauthorized');

    // B. Client B (different company) attempts to access Client A's asset
    const idorStreamRes = await request(`/assets/${imageAssetId}/stream`, { method: 'GET' }, clientBToken);
    assert(idorStreamRes.status === 403, 'Client B accessing Client A asset stream returns 403 Forbidden');

    const idorDownloadRes = await request(`/assets/${imageAssetId}/download`, { method: 'GET' }, clientBToken);
    assert(idorDownloadRes.status === 403, 'Client B downloading Client A asset returns 403 Forbidden');

    const idorMetaRes = await request(`/assets/${imageAssetId}`, { method: 'GET' }, clientBToken);
    assert(idorMetaRes.status === 403, 'Client B fetching Client A asset metadata returns 403 Forbidden');

    // C. Client B views their own assets list: must NOT see Client A's assets
    const clientBAssetsRes = await request('/assets', { method: 'GET' }, clientBToken);
    assert(clientBAssetsRes.status === 200, 'Client B gets their own assets list');
    assert(clientBAssetsRes.data.assets.length === 0, 'Client B has 0 assets (Client A assets strictly isolated)');

    // D. Admin accesses asset: allowed per role hierarchy
    const adminStreamRes = await request(`/assets/${imageAssetId}/stream`, { method: 'GET' }, adminToken);
    assert(adminStreamRes.status === 200, 'Admin role can access asset for management/inspection');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('[TestSuite Fatal Error]:', err);
    process.exit(1);
  }
}

runAssetsLibraryTestSuite();
