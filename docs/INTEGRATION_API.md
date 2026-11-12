# DiziGini Integration API Specification

**Version:** 1.0.0  
**Target Audience:** DizitalGini Backend Engineering Team  
**Scope:** Server-to-Server REST Endpoints for Campaign Prospect Ingestion & Outreach Automation  
**Environment:** HTTPS is strictly required in production (`https://<domain>/api/integration/v1`). The server refuses to boot in production mode when `ENABLE_INTEGRATION_API=true` if `PORTAL_BASE_URL` is unset or does not begin with `https://`.

---

## 1. Overview & Architecture

The DiziGini Integration API provides a secure, server-to-server gateway allowing DizitalGini's backend to push finalized campaign prospects directly into DiziGini.

For each ingested prospect, DiziGini:
1. Validates and stages binary assets (Company Studies, Pitch Decks, Lead Dossiers).
2. Generates an isolated `DRAFT` showcase in storage and the PostgreSQL database.
3. Generates high-converting outreach email templates with embedded absolute links and strategic research highlights.
4. Tracks batch and event progress with full audit logging.
5. Emits in-app notifications for DiziGini review operators.

```
┌──────────────────────────┐                  ┌──────────────────────────────────────────┐
│   DizitalGini Platform   │                  │             DiziGini Platform            │
│                          │                  │                                          │
│  ┌────────────────────┐  │                  │  ┌────────────────────────────────────┐  │
│  │ Campaign Operator  │  │                  │  │ Express API Gateway                │  │
│  └─────────┬──────────┘  │                  │  │ • 2MB Non-Multipart Limit          │  │
│            │             │                  │  │ • IP Brute-Force Rate Limiter      │  │
│  ┌─────────▼──────────┐  │  HTTPS + API Key │  │ • Client Rate Limiter (60/min)     │  │
│  │ Secure Backend     ├────────────────────────► • API Client Auth (SHA-256 Hash)   │  │
│  │ Proxy              │  │  (Server-to-     │  │ • Idempotency Engine               │  │
│  │ (Holds API Key)    │  │   Server)        │  └─────────────────┬──────────────────┘  │
│  └────────────────────┘  │                  │                    │                     │
└──────────────────────────┘                  │  ┌─────────────────▼──────────────────┐  │
                                              │  │ Storage & DB Isolation             │  │
                                              │  │ • Staged Asset Relocation          │  │
                                              │  │ • Strict DRAFT Showcase Status     │  │
                                              │  │ • Pluggable Mail Template Engine   │  │
                                              │  │ • PostgreSQL & Storage Driver      │  │
                                              │  └────────────────────────────────────┘  │
                                              └──────────────────────────────────────────┘
```

---

## 2. Ingestion & Publishing Workflow (DRAFT -> Review -> Publish -> Poll)

All integration-created showcases follow a strict draft isolation and review lifecycle to prevent unverified links or incomplete dossiers from reaching clients.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               SHOWCASE LIFECYCLE                                       │
│                                                                                        │
│   1. PUSH (DizitalGini)          2. OPERATOR REVIEW (DiziGini)   3. DISPATCH (Outreach)│
│   ┌────────────────────┐         ┌─────────────────────────┐     ┌───────────────────┐ │
│   │ POST /prospects    │         │ Operator opens          │     │ Poll indicates    │ │
│   │ Status: DRAFT      │────────►│ previewUrl in Admin UI  │────►│ PUBLISHED.        │ │
│   │ publicUrl: null    │         │ (Admin JWT required)    │     │ readyToSend: true │ │
│   │ readyToSend: false │         │                         │     │ Links now active! │ │
│   └────────────────────┘         └────────────┬────────────┘     └───────────────────┘ │
│                                               │                                        │
│                                               ▼                                        │
│                                  Operator clicks "Publish"                             │
│                                  (Status -> PUBLISHED)                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Workflow Rules:
1. **Creation as DRAFT:** Ingested prospects are created in `DRAFT` status by default.
2. **`publicUrl` is `null` while in DRAFT:** In all API responses (`batch`, `single`, `GET /prospects/:id`, `GET /batches/:batchId`), `publicUrl` is strictly `null` while the showcase is a `DRAFT`.
3. **`previewUrl` is Admin-Only:** The returned `previewUrl` (`/api/samples/manage/preview/:slug`) is strictly protected and requires internal DiziGini Admin authentication (JWT session with `ADMIN` or `COMPANY_LEAD` role). Unauthenticated access or access by standard users returns HTTP 401/403. **Never send `previewUrl` to prospects.**
4. **Email Links Only Work After Publishing:** Public showcase links (`/samples/:slug`) return HTTP 404 until the showcase status is updated to `PUBLISHED`. 
5. **`readyToSend` Flag:** In `GET /api/integration/v1/prospects/:id/mail-template`, the template includes:
   - `readyToSend: false` while in `DRAFT` status, accompanied by a warning message.
   - `readyToSend: true` once the showcase is `PUBLISHED`.
6. **Polling:** DizitalGini backend should poll `GET /api/integration/v1/prospects/:id` or `GET /api/integration/v1/batches/:batchId`. Once `showcaseStatus === 'PUBLISHED'`, retrieve the final mail template and dispatch the outreach email.

---

## 3. Authentication & Security

### 3.1 API Key Headers
All integration endpoints require an authenticated API client key. Pass the key in either of the following HTTP headers:

```http
X-API-Key: dzg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
*or*
```http
Authorization: Bearer dzg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> [!CAUTION]
> **Query String & Body Prohibition**  
> API keys provided via URL query strings (e.g., `?apiKey=...`, `?token=...`) or JSON request bodies (`apiKey`, `_token`) are **strictly prohibited** and return HTTP `401 Unauthorized` (`CREDENTIALS_IN_URL_OR_BODY_FORBIDDEN`). This prevents secrets from leaking into access logs, web proxies, or browser histories.

### 3.2 Storage & Hashing
DiziGini never stores or logs plaintext API keys. Keys are hashed using SHA-256 before verification against the `api_clients` registry.

### 3.3 Key Rotation Procedure
API keys are tied to individual client records. To rotate a key without service downtime:

1. **Issue a new client record and API key:**
   ```bash
   node backend/scripts/issue-api-key.js --client-name "DizitalGini Production (Rotated)" --allowed-sender-emails "campaign@dizitalgini.com,operator@dizitalgini.com"
   ```
   *Output displays the new `Client ID` (e.g. `client_a1b2c3d4e5f60718`) and plain `API Key` (e.g. `dzg_live_...`).*

2. **Update the DizitalGini backend:** Update `DIZIGINI_API_KEY` in DizitalGini's environment configuration to the new key.

3. **Verify connectivity:**
   ```bash
   curl -X GET "https://<domain>/api/integration/v1/health" \
     -H "X-API-Key: dzg_live_new_key_value"
   ```

4. **Revoke the old key:**
   Revoke using the old Client ID:
   ```bash
   node backend/scripts/revoke-api-key.js --client-id client_old_id
   ```
   *or securely pipe the old API key through stdin:*
   ```bash
   echo "dzg_live_old_key_value" | node backend/scripts/revoke-api-key.js
   ```

---

## 4. Operational Limits & Rate Limiting

| Policy | Limit | Behavior on Exceeded |
| :--- | :--- | :--- |
| **Non-Multipart Request Body Size** | **2 MB** | HTTP `413 Payload Too Large` (enforced on both Content-Length and chunked stream bytes across JSON, urlencoded, text, and raw binary before authentication) |
| **Asset Upload File Size** | **25 MB** per PDF | HTTP `413 Payload Too Large` (enforced via streaming Busboy parser) |
| **Client Staged Asset Quota** | **500 MB** total active unexpired assets | HTTP `413 Staged Quota Exceeded` |
| **Standard Endpoints Rate** | **60 requests / minute** per client | HTTP `429 Too Many Requests` |
| **Asset Upload Rate** | **10 uploads / minute** per client | HTTP `429 Too Many Requests` |
| **Failed Auth IP Limiter** | **10 failed attempts / 15 minutes** per IP | HTTP `429 Too Many Requests` |
| **Batch Prospect Cap** | **20 prospects** per batch request | HTTP `400 Bad Request` |
| **Staged Asset Expiry** | **24 hours** from upload | Expired assets are pruned automatically |

---

## 5. Idempotency Specification

All mutating endpoints (`POST /api/integration/v1/prospects/batch` and `POST /api/integration/v1/prospects`) require an idempotency header.

### 5.1 Header Requirements
- **Primary Header Name:** `Idempotency-Key`
- **Accepted Alias:** `X-Idempotency-Key` (both headers are accepted interchangeably)
- **Format:** 1 to 128 characters consisting of `[A-Za-z0-9_-]`
- **Scope:** Scoped per API Client ID.

### 5.2 Behavior
1. **First Request:** The key is locked as `IN_PROGRESS` and the SHA-256 hash of the request body is recorded.
2. **Identical Replay (Success):** If the exact same body is submitted with the same key, DiziGini skips execution and replays the cached HTTP status code and response body with the response header:
   ```http
   Idempotent-Replay: true
   ```
3. **Payload Mismatch (Conflict):** If a key is reused with a different request body, the server rejects it with:
   ```json
   {
     "success": false,
     "error": "IDEMPOTENCY_KEY_PAYLOAD_MISMATCH",
     "message": "Idempotency key was previously executed with a different request payload."
   }
   ```
4. **Concurrent Requests:** If a second request arrives while the first is actively executing, the server returns HTTP `409 Conflict` (`CONCURRENT_REQUEST_IN_PROGRESS`).
5. **Server Error Recovery (5xx):** If the server fails to process the request (5xx status or unhandled error), the idempotency lock is cleared immediately, allowing DizitalGini to safely retry.
6. **Stale Lock Expiry:** `IN_PROGRESS` locks automatically expire after 2 minutes.

---

## 6. API Endpoints Specification

### 6.1 System & Schema Endpoints

#### `GET /api/integration/v1/health`
Verifies API gateway health and authenticates client credentials.

- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "status": "ok",
  "clientId": "client_8f4a1b2c3d4e5f60",
  "clientName": "DizitalGini Production",
  "scopes": ["prospects:write", "assets:write"],
  "timestamp": "2026-11-12T10:30:00.000Z"
}
```

---

#### `GET /api/integration/v1/schema`
Returns the complete JSON schema contract and accepted fields for prospect payloads.

- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "version": "1.0.0",
  "limits": {
    "maxBatchProspects": 20,
    "maxAssetSizeMb": 25,
    "clientQuotaMb": 500,
    "nonMultipartBodyLimitMb": 2
  },
  "allowedStatuses": ["DRAFT", "PUBLISHED"],
  "schema": {
    "type": "object",
    "required": ["externalCampaignId", "prospects"],
    "properties": {
      "externalCampaignId": { "type": "string" },
      "campaignName": { "type": "string" },
      "operatorEmail": { "type": "string", "format": "email" },
      "prospects": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["companyName", "externalProspectId"],
          "properties": {
            "companyName": { "type": "string" },
            "externalProspectId": { "type": "string" },
            "website": { "type": "string" },
            "industry": { "type": "string" },
            "category": { "type": "string" },
            "description": { "type": "string" },
            "slug": { "type": "string" },
            "status": { "type": "string", "enum": ["DRAFT", "PUBLISHED"] },
            "logoUrl": { "type": "string" },
            "logoAssetKey": { "type": "string" },
            "companyStudy": {
              "type": "object",
              "properties": {
                "company": { "type": "string" },
                "website": { "type": "string" },
                "linkedin": { "type": "string" },
                "industry": { "type": "string" },
                "businessOverview": { "type": "string" },
                "marketPosition": { "type": "string" },
                "keyObservations": { "type": "string" },
                "potentialOpportunity": { "type": "string" },
                "pdfAssetKey": { "type": "string" }
              }
            },
            "pitchDeck": {
              "type": "object",
              "properties": {
                "title": { "type": "string" },
                "summary": { "type": "string" },
                "pdfAssetKey": { "type": "string" }
              }
            },
            "leads": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["name"],
                "properties": {
                  "name": { "type": "string" },
                  "title": { "type": "string" },
                  "email": { "type": "string", "format": "email" },
                  "phone": { "type": "string" },
                  "company": { "type": "string" },
                  "companyLink": { "type": "string" },
                  "companyLinkedin": { "type": "string" },
                  "linkedin": { "type": "string" },
                  "aboutCompany": { "type": "string" },
                  "whySuitsBest": { "type": "string" },
                  "leadStudy": {
                    "type": "object",
                    "properties": {
                      "whyRelevant": { "type": "string" },
                      "observedContext": { "type": "string" },
                      "suggestedApproach": { "type": "string" }
                    }
                  },
                  "pitchDeckAssetKey": { "type": "string" },
                  "leadStudyPdfAssetKey": { "type": "string" }
                }
              }
            },
            "mailOptions": {
              "type": "object",
              "properties": {
                "senderName": { "type": "string" },
                "senderTitle": { "type": "string" },
                "senderEmail": { "type": "string", "format": "email" },
                "targetLeadIndex": { "type": "integer", "default": 0 }
              }
            }
          }
        }
      }
    }
  }
}
```

---

### 6.2 Binary Asset Staging Endpoints

#### `POST /api/integration/v1/assets`
Uploads a binary PDF file into temporary staging storage. Returns an ephemeral `assetKey` valid for 24 hours.

- **Authentication:** Required (`assets:write` scope)
- **Content-Type:** `multipart/form-data`
- **Field Name:** `file` (Single PDF file per upload)
- **Validation:** Enforces `%PDF-` magic byte inspection and maximum 25MB file size.
- **Response (201 Created):**
```json
{
  "success": true,
  "assetKey": "dzg_ast_9f8b7c6d-5e4a-3b2c-1a0f-9e8d7c6b5a4f",
  "fileName": "acme-corp-market-analysis.pdf",
  "sha256": "4cbb814f978922ebda91659795ec3117b8840abcb732553157de98e7d48c2751",
  "size": 1845200,
  "mimeType": "application/pdf",
  "expiresAt": "2026-11-13T10:30:00.000Z"
}
```

---

### 6.3 Prospect Ingestion Endpoints

#### `POST /api/integration/v1/prospects/batch`
Ingests an array of up to 20 campaign prospects. Uses HTTP 207 Multi-Status to report per-item results while preventing all-or-nothing failures.

- **Authentication:** Required (`prospects:write` scope)
- **Headers:**
  - `Idempotency-Key: <unique-string>` *(or `X-Idempotency-Key`)*
  - `Content-Type: application/json`
- **Request Body Example:**
```json
{
  "externalCampaignId": "camp_tech_q4_2026",
  "campaignName": "Q4 Tech Enterprise Outreach",
  "operatorEmail": "campaign@dizitalgini.com",
  "prospects": [
    {
      "externalProspectId": "prosp_acme_001",
      "companyName": "Acme Technologies",
      "website": "https://acmetechnologies.example.com",
      "industry": "Enterprise Software",
      "category": "SaaS",
      "description": "Enterprise cloud workflow automation provider.",
      "status": "DRAFT",
      "logoUrl": "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200",
      "companyStudy": {
        "keyObservations": "Rapidly growing engineering team. Scaling outbound sales across APAC.",
        "potentialOpportunity": "Cross-border outbound automation pipeline.",
        "pdfAssetKey": "dzg_ast_9f8b7c6d-5e4a-3b2c-1a0f-9e8d7c6b5a4f"
      },
      "leads": [
        {
          "name": "Jane Doe",
          "title": "VP of Revenue Operations",
          "email": "jane.doe@acmetechnologies.example.com",
          "company": "Acme Technologies",
          "whySuitsBest": "Leading operational modernization initiative in Q4.",
          "leadStudy": {
            "whyRelevant": "Owns sales operations stack modernization.",
            "observedContext": "Active hiring across sales enablement."
          },
          "pitchDeckAssetKey": "dzg_ast_8e7d6c5b-4a3b-2c1d-0e9f-8a7b6c5d4e3f"
        }
      ],
      "mailOptions": {
        "senderName": "Akshay Deepak",
        "senderTitle": "Lead Research Specialist",
        "senderEmail": "campaign@dizitalgini.com",
        "targetLeadIndex": 0
      }
    }
  ]
}
```

- **Response (207 Multi-Status):**
```json
{
  "success": true,
  "batchId": "b6a7c8d9-0e1f-2a3b-4c5d-6e7f8a9b0c1d",
  "status": "COMPLETED",
  "summary": {
    "total": 1,
    "created": 1,
    "existing": 0,
    "failed": 0
  },
  "results": [
    {
      "index": 0,
      "externalProspectId": "prosp_acme_001",
      "status": "CREATED",
      "id": 142,
      "slug": "acme-technologies-7a8f9c",
      "publicUrl": null,
      "previewUrl": "https://dizigini.com/api/samples/manage/preview/acme-technologies-7a8f9c",
      "showcaseStatus": "DRAFT",
      "warnings": []
    }
  ]
}
```

> [!NOTE]
> `publicUrl` is `null` because the showcase is created in `DRAFT` status. Once published, it resolves to `https://<domain>/samples/<slug>`. `previewUrl` requires DiziGini Admin authentication.

---

#### `POST /api/integration/v1/prospects`
Convenience endpoint for ingesting a single prospect.

- **Authentication:** Required (`prospects:write` scope)
- **Headers:** `Idempotency-Key` *(or `X-Idempotency-Key`)*, `Content-Type: application/json`
- **Request Body:** Flat prospect object (same fields as batch item, with `externalCampaignId` at root).
- **Response (201 Created):**
```json
{
  "success": true,
  "id": 142,
  "slug": "acme-technologies-7a8f9c",
  "publicUrl": null,
  "previewUrl": "https://dizigini.com/api/samples/manage/preview/acme-technologies-7a8f9c",
  "status": "DRAFT",
  "showcaseStatus": "DRAFT",
  "campaignId": "camp_tech_q4_2026",
  "prospectId": "prosp_acme_001"
}
```

---

### 6.4 Polling & Prospect Inquiry Endpoints

#### `GET /api/integration/v1/batches/:batchId`
Polls the execution status, created showcases, and event history for a batch.

- **Authentication:** Required (Scoped strictly to calling client's batches)
- **Response (200 OK):**
```json
{
  "success": true,
  "batch": {
    "id": "b6a7c8d9-0e1f-2a3b-4c5d-6e7f8a9b0c1d",
    "externalCampaignId": "camp_tech_q4_2026",
    "status": "COMPLETED",
    "counts": {
      "total": 1,
      "success": 1,
      "failed": 0
    },
    "createdAt": "2026-11-12T10:31:00.000Z",
    "completedAt": "2026-11-12T10:31:02.000Z"
  },
  "showcases": [
    {
      "id": 142,
      "slug": "acme-technologies-7a8f9c",
      "company_name": "Acme Technologies",
      "status": "DRAFT",
      "showcaseStatus": "DRAFT",
      "external_prospect_id": "prosp_acme_001",
      "publicUrl": null,
      "previewUrl": "https://dizigini.com/api/samples/manage/preview/acme-technologies-7a8f9c",
      "created_at": "2026-11-12T10:31:01.000Z"
    }
  ],
  "events": [
    {
      "event_type": "BATCH_RECEIVED",
      "payload": { "prospectCount": 1 },
      "created_at": "2026-11-12T10:31:00.000Z"
    },
    {
      "event_type": "PROSPECT_CREATED",
      "payload": { "showcaseId": 142, "slug": "acme-technologies-7a8f9c" },
      "created_at": "2026-11-12T10:31:01.000Z"
    },
    {
      "event_type": "BATCH_COMPLETED",
      "payload": { "status": "COMPLETED", "success": 1, "failed": 0 },
      "created_at": "2026-11-12T10:31:02.000Z"
    }
  ]
}
```

---

#### `GET /api/integration/v1/prospects/:id`
Inquires about a prospect showcase by integer ID or slug.

- **Authentication:** Required (Scoped to calling client; manual showcases return 404)
- **Response (200 OK - when DRAFT):**
```json
{
  "success": true,
  "id": 142,
  "slug": "acme-technologies-7a8f9c",
  "status": "DRAFT",
  "showcaseStatus": "DRAFT",
  "companyName": "Acme Technologies",
  "publicUrl": null,
  "previewUrl": "https://dizigini.com/api/samples/manage/preview/acme-technologies-7a8f9c",
  "viewCount": 0,
  "createdAt": "2026-11-12T10:31:01.000Z",
  "updatedAt": "2026-11-12T10:31:01.000Z"
}
```

- **Response (200 OK - when PUBLISHED):**
```json
{
  "success": true,
  "id": 142,
  "slug": "acme-technologies-7a8f9c",
  "status": "PUBLISHED",
  "showcaseStatus": "PUBLISHED",
  "companyName": "Acme Technologies",
  "publicUrl": "https://dizigini.com/samples/acme-technologies-7a8f9c",
  "previewUrl": "https://dizigini.com/api/samples/manage/preview/acme-technologies-7a8f9c",
  "viewCount": 0,
  "createdAt": "2026-11-12T10:31:01.000Z",
  "updatedAt": "2026-11-12T10:35:00.000Z"
}
```

---

#### `GET /api/integration/v1/prospects/:campaignId/:prospectId`
Inquires about a prospect by campaign and prospect external identifiers.

- **Authentication:** Required (Scoped to calling client)
- **Response (200 OK):** Same schema as `/prospects/:id`.

---

### 6.5 Outreach Mail Template Endpoints

#### `GET /api/integration/v1/prospects/:id/mail-template`
Retrieves the outreach email template for an ingested prospect.

- **Authentication:** Required (Scoped to calling client)
- **Response (200 OK - DRAFT Showcase):**
```json
{
  "success": true,
  "id": 142,
  "slug": "acme-technologies-7a8f9c",
  "companyName": "Acme Technologies",
  "showcaseStatus": "DRAFT",
  "readyToSend": false,
  "warning": "Showcase is currently in DRAFT status. Links will 404 for recipients until the showcase is reviewed and published in DiziGini.",
  "mailTemplate": {
    "subject": "Bespoke Market Intelligence & Growth Blueprint for Acme Technologies",
    "subjects": [
      "Bespoke Market Intelligence & Growth Blueprint for Acme Technologies",
      "Tailored Sales Intelligence & Lead Dossier for Acme Technologies",
      "Strategic Growth & Competitive Briefing: Acme Technologies"
    ],
    "recipientEmail": "jane.doe@acmetechnologies.example.com",
    "senderEmail": "campaign@dizitalgini.com",
    "showcaseUrl": "https://dizigini.com/samples/acme-technologies-7a8f9c",
    "bodyText": "Subject: Bespoke Market Intelligence & Growth Blueprint for Acme Technologies\n\nHi Jane Doe,\n\nOur research specialists at DiziGini have put together a dedicated intelligence showcase specifically for Acme Technologies.\n\nWe analyzed your current market position, prepared a deep-dive Company Study, mapped key high-fit prospect accounts with strategic fit analyses, and formulated an actionable outreach proposal:\n\nExecutive Research Highlights:\n• Key Strategic Observation: Rapidly growing engineering team. Scaling outbound sales across APAC.\n• Recommended Growth Focus: Cross-border outbound automation pipeline.\n• Strategic Alignment for Jane Doe: Owns sales operations stack modernization.\n\n👉 Explore Your Interactive Showcase: https://dizigini.com/samples/acme-technologies-7a8f9c\n\nKey deliverables included inside your showcase:\n• Company Study: Market positioning and strategic growth levers\n• High-Impact Leads: Vetted stakeholders with tailored \"Why Suits Best\" analysis\n• Lead Deep Dives: Individual trigger events and recommended approach angles\n• Pitch Deck: Turnkey presentation proposal tailored for your brand\n\nFeel free to inspect the sample data. Whenever you are ready to unlock direct contact details and scale with our specialist team, reply to this email or click \"More Leads\" on the dashboard.\n\nRegards,\nAkshay Deepak\nLead Research Manager\ncampaign@dizitalgini.com\nwww.dizigini.com\n\nThanks for your time. If you'd like to discuss this, just reply to this email.",
    "bodyHtml": "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;\">...</div>",
    "gmailComposeUrl": "https://mail.google.com/mail/?view=cm&fs=1&to=jane.doe%40acmetechnologies.example.com&su=...",
    "outlookComposeUrl": "https://outlook.office.com/mail/deeplink/compose?to=jane.doe%40acmetechnologies.example.com&subject=...",
    "showcaseStatus": "DRAFT",
    "readyToSend": false,
    "warning": "Showcase is currently in DRAFT status. Links will 404 for recipients until the showcase is reviewed and published in DiziGini."
  }
}
```

- **Response (200 OK - PUBLISHED Showcase):**
When the showcase is reviewed and published in DiziGini, `showcaseStatus` becomes `"PUBLISHED"`, `readyToSend` becomes `true`, and `warning` becomes `null`. The outreach email is ready for immediate dispatch.

---

#### `POST /api/integration/v1/prospects/:id/mail-template`
Regenerates an outreach mail template with alternative sender parameters.

- **Authentication:** Required (Scoped to calling client)
- **Request Body:**
```json
{
  "senderName": "Sarah Jenkins",
  "senderTitle": "Strategic Account Executive",
  "senderEmail": "campaign@dizitalgini.com"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "id": 142,
  "slug": "acme-technologies-7a8f9c",
  "companyName": "Acme Technologies",
  "showcaseStatus": "DRAFT",
  "readyToSend": false,
  "warning": "Showcase is currently in DRAFT status. Links will 404 for recipients until the showcase is reviewed and published in DiziGini.",
  "mailTemplate": {
    "subject": "Bespoke Market Intelligence & Growth Blueprint for Acme Technologies",
    "senderEmail": "campaign@dizitalgini.com",
    "showcaseUrl": "https://dizigini.com/samples/acme-technologies-7a8f9c",
    "bodyText": "...",
    "bodyHtml": "...",
    "showcaseStatus": "DRAFT",
    "readyToSend": false,
    "warning": "Showcase is currently in DRAFT status. Links will 404 for recipients until the showcase is reviewed and published in DiziGini."
  }
}
```

---

## 7. HTTP Status & Error Codes Reference (Verified Live)

All error codes, HTTP status codes, and JSON error bodies below have been verified against the live test suite:

| HTTP Code | Error Code (`error`) | Real JSON Error Response (`message`) | Root Cause & Resolution |
| :--- | :--- | :--- | :--- |
| **`400 Bad Request`** | `MISSING_IDEMPOTENCY_KEY` | `Idempotency-Key (or X-Idempotency-Key) header is required for mutating integration endpoints.` | Add `Idempotency-Key: <unique-id>` header to mutating POST requests. |
| **`400 Bad Request`** | `MISSING_CAMPAIGN_ID` | `externalCampaignId is required.` | Provide non-empty `externalCampaignId` in request payload. |
| **`400 Bad Request`** | `EMPTY_PROSPECTS_ARRAY` | `prospects must be a non-empty array of prospect objects.` | Provide at least one prospect item in `prospects` array. |
| **`400 Bad Request`** | `MAX_BATCH_SIZE_EXCEEDED` | `Batch size exceeds maximum limit of 20 prospects.` | Split payloads into chunks of 20 or fewer prospects. |
| **`400 Bad Request`** | `SENDER_EMAIL_NOT_ALLOWED` | `Sender email '<email>' is not in the allowed sender emails list for this API client.` | Use an authorized sender email configured in client registry. |
| **`400 Bad Request`** | `INVALID_FILE_TYPE` | `Uploaded file is not a valid PDF document (must start with %PDF- header).` | Upload binary documents with `%PDF-` magic header. |
| **`401 Unauthorized`** | `MISSING_API_KEY` | `API key is required in X-API-Key or Authorization: Bearer header.` | Supply valid API key in header. |
| **`401 Unauthorized`** | `CREDENTIALS_IN_URL_OR_BODY_FORBIDDEN` | `API credentials must not be passed in URL query parameters or request body. Provide via X-API-Key or Authorization header.` | Remove key/token from query string or request body. |
| **`401 Unauthorized`** | `INVALID_API_KEY` | `Invalid or revoked API key.` | Verify the API key is active and correctly formatted. |
| **`403 Forbidden`** | `CLIENT_REVOKED` | `API client has been revoked.` | Re-issue API key; this client was revoked. |
| **`403 Forbidden`** | `INSUFFICIENT_SCOPE` | `API key lacks required scope: '<scope>'.` | Re-issue API key with required scope (`prospects:write` or `assets:write`). |
| **`404 Not Found`** | `BATCH_NOT_FOUND` | `Batch '<batchId>' not found.` | Batch ID does not exist or belongs to another API client. |
| **`404 Not Found`** | `PROSPECT_NOT_FOUND` | `Prospect not found.` | Prospect does not exist, belongs to another API client, or is a manual showcase. |
| **`409 Conflict`** | `IDEMPOTENCY_KEY_PAYLOAD_MISMATCH` | `Idempotency key was previously executed with a different request payload.` | Use a new unique idempotency key when changing request body. |
| **`409 Conflict`** | `CONCURRENT_REQUEST_IN_PROGRESS` | `A request with this idempotency key is currently executing. Please retry shortly.` | Wait for the original in-flight request to finish. |
| **`409 Conflict`** | `DUPLICATE_EXTERNAL_PROSPECT` | `Prospect '<id>' already exists under campaign '<id>' with conflicting payload.` | Resending identical prospect returns status `EXISTING`. Changing payload on existing prospect returns 409 conflict. |
| **`409 Conflict`** | `SLUG_CONFLICT` | `Showcase slug '<slug>' already exists.` | Do not specify manual conflicting slug; omit slug to allow auto-generation. |
| **`413 Payload Too Large`**| `PAYLOAD_TOO_LARGE` | `Upload payload is too large. Please reduce the payload size and try again.` | Non-multipart body exceeds 2MB (Content-Length or chunked stream), or PDF exceeds 25MB. |
| **`413 Payload Too Large`**| `STAGED_QUOTA_EXCEEDED` | `Staged assets quota exceeded. Active staged assets cannot exceed 500MB.` | Claim staged assets or wait for 24-hour expiry. |
| **`429 Too Many Requests`**| `RATE_LIMIT_EXCEEDED` | `Too many integration requests, please try again after 1 minute.` | Standard endpoints capped at 60 req/min per client; upload capped at 10/min. |
| **`500 Internal Error`** | `DATABASE_ERROR` | `Failed to process integration request.` | Backend database failure. Idempotency lock is cleared automatically for safe retry. |

---

## 8. Complete Worked End-to-End Example (`curl`)

Below is a complete, real-world flow illustrating how DizitalGini pushes a campaign.

### Step 1: Health & Authentication Check
```bash
curl -X GET "https://<domain>/api/integration/v1/health" \
  -H "X-API-Key: dzg_live_demo_key_secret_value"
```

### Step 2: Upload Staged Company Study PDF
```bash
curl -X POST "https://<domain>/api/integration/v1/assets" \
  -H "X-API-Key: dzg_live_demo_key_secret_value" \
  -F "file=@/path/to/Acme_Company_Study.pdf;type=application/pdf"
```
*Output returns `assetKey`: `dzg_ast_9f8b7c6d-5e4a-3b2c-1a0f-9e8d7c6b5a4f`.*

### Step 3: Ingest Campaign Prospects Batch
```bash
curl -X POST "https://<domain>/api/integration/v1/prospects/batch" \
  -H "X-API-Key: dzg_live_demo_key_secret_value" \
  -H "Idempotency-Key: idemp_batch_camp_tech_q4_001" \
  -H "Content-Type: application/json" \
  -d '{
    "externalCampaignId": "camp_tech_q4_2026",
    "campaignName": "Q4 Tech Enterprise Outreach",
    "operatorEmail": "campaign@dizitalgini.com",
    "prospects": [
      {
        "externalProspectId": "prosp_acme_001",
        "companyName": "Acme Technologies",
        "website": "https://acmetechnologies.example.com",
        "industry": "Enterprise Software",
        "category": "SaaS",
        "description": "Enterprise cloud workflow automation.",
        "status": "DRAFT",
        "companyStudy": {
          "keyObservations": "Rapidly growing engineering team. Scaling outbound sales across APAC.",
          "potentialOpportunity": "Cross-border outbound automation pipeline.",
          "pdfAssetKey": "dzg_ast_9f8b7c6d-5e4a-3b2c-1a0f-9e8d7c6b5a4f"
        },
        "leads": [
          {
            "name": "Jane Doe",
            "title": "VP of Revenue Operations",
            "email": "jane.doe@acmetechnologies.example.com",
            "company": "Acme Technologies",
            "whySuitsBest": "Leading operational modernization in Q4.",
            "leadStudy": {
              "whyRelevant": "Owns sales operations stack modernization."
            }
          }
        ],
        "mailOptions": {
          "senderName": "Akshay Deepak",
          "senderTitle": "Lead Research Specialist",
          "senderEmail": "campaign@dizitalgini.com"
        }
      }
    ]
  }'
```
*Output returns HTTP 207 Multi-Status with `batchId`, showcase `id` (e.g. `142`), `showcaseStatus: "DRAFT"`, `publicUrl: null`, and admin-only `previewUrl`.*

### Step 4: Poll Batch Execution Status
```bash
curl -X GET "https://<domain>/api/integration/v1/batches/b6a7c8d9-0e1f-2a3b-4c5d-6e7f8a9b0c1d" \
  -H "X-API-Key: dzg_live_demo_key_secret_value"
```

### Step 5: Check Mail Template Ready Status
```bash
curl -X GET "https://<domain>/api/integration/v1/prospects/142/mail-template" \
  -H "X-API-Key: dzg_live_demo_key_secret_value"
```
*Once DiziGini operator reviews and publishes the showcase, `readyToSend` is `true`. Dispatch email to `jane.doe@acmetechnologies.example.com`.*

---

## 9. Requirements for DizitalGini Engineering Team

To complete this integration, DizitalGini must implement the following components within the DizitalGini codebase:

### 9.1 Backend-Enforced Permission Gate ("Service Provider" Module)
- **Role-Based Access Control (RBAC):** Create a backend permission check (e.g. `CAN_EXPORT_TO_DIZIGINI` or restricted to roles `SUPER_ADMIN`, `CAMPAIGN_MANAGER`).
- **Security Rule:** Do not rely on hardcoded email addresses or client-side UI flags. Access must be verified on DizitalGini backend endpoints prior to dispatch.

### 9.2 Campaign Picker & Selection UI
- Provide a UI allowing authorized operators to select a campaign that has passed QA and is ready for showcase generation.
- Display prospect counts, verified email counts, and asset readiness prior to export.

### 9.3 Lead Standardization Mapper
- Implement an adapter in DizitalGini backend that maps internal lead schema into the DiziGini Prospect contract:
  - Normalize company name and clean website URL.
  - Standardize lead arrays (`name`, `title`, `email`, `whySuitsBest`).
  - Stream PDFs to `POST /api/integration/v1/assets` to obtain `pdfAssetKey` prior to batch submission.

### 9.4 Secure Backend Integration Proxy
- **Strict Prohibition:** The DiziGini API key must **NEVER** be stored in client-side frontends (React/Vue/HTML) or exposed to the browser.
- DizitalGini backend must store the key in an environment variable (`DIZIGINI_API_KEY`) and provide internal server endpoints (e.g., `POST /api/campaigns/:id/export-dizigini`) that proxy to DiziGini.
- The backend proxy must generate and maintain unique `Idempotency-Key` UUIDs for all push requests.

### 9.5 Export Results & Status View
- Display the returned `batchId`, success/failure breakdown, and generated showcase links directly within the DizitalGini campaign dashboard.
- Display the generated outreach email templates or supply a one-click "Copy Outreach Email" button for SDRs when `readyToSend` is `true`.
