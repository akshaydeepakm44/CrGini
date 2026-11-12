# DiziGini Integration API Specification

**Version:** 1.0.0  
**Target Audience:** DizitalGini Backend Engineering Team  
**Scope:** Server-to-Server REST Endpoints for Campaign Prospect Ingestion & Outreach Automation  
**Environment:** HTTPS Only in Production (`https://dizigini.com/api/integration/v1`)

---

## 1. Overview & Architecture

The DiziGini Integration API provides a secure, server-to-server gateway allowing DizitalGini to push finalized campaign prospects directly into DiziGini. 

For each ingested prospect, DiziGini:
1. Validates and stages binary assets (Company Studies, Pitch Decks, Lead Dossiers).
2. Generates an isolated `DRAFT` showcase in Object Storage and PostgreSQL.
3. Generates high-converting outreach email templates (Plain Text & HTML with deep links).
4. Tracks batch and event progress with full audit logging.
5. Emits in-app notifications for DiziGini review operators.

```
┌──────────────────────────┐                  ┌──────────────────────────────────────────┐
│   DizitalGini Platform   │                  │             DiziGini Platform            │
│                          │                  │                                          │
│  ┌────────────────────┐  │                  │  ┌────────────────────────────────────┐  │
│  │ Campaign Operator  │  │                  │  │ Express API Gateway                │  │
│  └─────────┬──────────┘  │                  │  │ • 2MB Body Limit                   │  │
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
                                              │  │ • Deterministic Mail Templates     │  │
                                              │  │ • PostgreSQL 16 / MinIO (S3)       │  │
                                              │  └────────────────────────────────────┘  │
                                              └──────────────────────────────────────────┘
```

---

## 2. Authentication & Security

### 2.1 API Key Headers
All integration endpoints require an authenticated API client key. You may provide the key via either of the following standard HTTP headers:

```http
X-API-Key: dzg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
*or*
```http
Authorization: Bearer dzg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> [!CAUTION]
> **Query String & Body Prohibition**  
> API keys provided via URL query strings (e.g., `?apiKey=...`, `?token=...`) or JSON request bodies (`apiKey`, `_token`) are **strictly prohibited** and will return HTTP `401 Unauthorized`. This prevents secrets from leaking into access logs, web proxies, or browser histories.

### 2.2 Storage & Hashing
DiziGini never stores or logs plaintext API keys. Keys are hashed using SHA-256 before verification against the `api_clients` registry. 

### 2.3 Key Rotation Procedure
To rotate an API key without service interruption:
1. **DiziGini Admin** issues a secondary key for your client:
   ```bash
   node backend/scripts/issue-api-key.js "DizitalGini Production" --allowed-senders "campaign@dizitalgini.com,operator@dizitalgini.com"
   ```
2. **DizitalGini Team** updates their backend environment variable (`DIZIGINI_API_KEY`) to the new key.
3. **Verify Connectivity** by calling `GET /api/integration/v1/health`.
4. **DiziGini Admin** revokes the old key securely via stdin:
   ```bash
   node backend/scripts/revoke-api-key.js
   ```

---

## 3. Operational Limits & Rate Limiting

| Policy | Limit | Behavior on Exceeded |
| :--- | :--- | :--- |
| **JSON Request Body Size** | **2 MB** | HTTP `413 Payload Too Large` (enforced before authentication) |
| **Asset Upload File Size** | **25 MB** per PDF | HTTP `413 Payload Too Large` |
| **Client Staged Asset Quota** | **500 MB** total active unexpired assets | HTTP `413 Staged Quota Exceeded` |
| **Standard Endpoints Rate** | **60 requests / minute** per client | HTTP `429 Too Many Requests` |
| **Asset Upload Rate** | **10 uploads / minute** per client | HTTP `429 Too Many Requests` |
| **Failed Auth IP Limiter** | **10 failed attempts / 15 minutes** per IP | HTTP `429 Too Many Requests` |
| **Batch Prospect Cap** | **20 prospects** per batch request | HTTP `400 Bad Request` |
| **Staged Asset Expiry** | **24 hours** from upload | Expired assets are pruned automatically |

---

## 4. Idempotency Specification

All mutating endpoints (`POST /api/integration/v1/prospects/batch` and `POST /api/integration/v1/prospects`) require an `Idempotency-Key` HTTP header.

### 4.1 Header Requirements
- **Header Name:** `Idempotency-Key` (or `X-Idempotency-Key`)
- **Format:** 1 to 128 characters consisting of `[A-Za-z0-9_-]`
- **Scope:** Scoped per API Client ID.

### 4.2 Behavior
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

## 5. API Endpoints Specification

### 5.1 System & Schema Endpoints

#### `GET /api/integration/v1/health`
Verifies API gateway health and authenticates client credentials.

- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "status": "UP",
  "clientId": "client_8f4a1b2c",
  "clientName": "DizitalGini Production",
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
    "jsonBodyLimitMb": 2
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
                "pdfAssetKey": { "type": "string" }
              }
            },
            "pitchDeck": {
              "type": "object",
              "properties": {
                "assetKey": { "type": "string" },
                "pdfAssetKey": { "type": "string" }
              }
            },
            "leads": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "title": { "type": "string" },
                  "email": { "type": "string" },
                  "company": { "type": "string" },
                  "whySuitsBest": { "type": "string" },
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
                "senderEmail": { "type": "string" },
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

### 5.2 Asset Management

#### `POST /api/integration/v1/assets`
Uploads a binary PDF asset (Company Study, Pitch Deck, Lead Dossier) into the temporary staging area.

- **Authentication:** Required
- **Headers:** `Content-Type: multipart/form-data`
- **Form Field:** `file` (Binary PDF file, max 25 MB)
- **Validation:** Must start with PDF magic bytes (`%PDF-`).
- **Response (201 Created):**
```json
{
  "success": true,
  "assetKey": "dzg_ast_9f8b7c6d-5e4a-3b2c-1a0f-9e8d7c6b5a4f",
  "fileName": "acme-corp-market-analysis.pdf",
  "fileSize": 1845200,
  "mimeType": "application/pdf",
  "expiresAt": "2026-11-13T10:30:00.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: `INVALID_FILE_TYPE` (File is not a valid PDF).
  - `413 Payload Too Large`: File exceeds 25MB or client staged quota (500MB) exceeded.
  - `429 Too Many Requests`: Upload rate exceeded (10 uploads/min).

---

### 5.3 Prospect Ingestion Endpoints

#### `POST /api/integration/v1/prospects/batch`
Ingests an array of up to 20 campaign prospects. Uses HTTP 207 Multi-Status to report per-item results while preventing all-or-nothing failures.

- **Authentication:** Required
- **Headers:**
  - `Idempotency-Key: <unique-string>`
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
        "pdfAssetKey": "dzg_ast_9f8b7c6d-5e4a-3b2c-1a0f-9e8d7c6b5a4f"
      },
      "leads": [
        {
          "name": "Jane Doe",
          "title": "VP of Revenue Operations",
          "email": "jane.doe@acmetechnologies.example.com",
          "company": "Acme Technologies",
          "whySuitsBest": "Leading operational modernization initiative in Q4.",
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
      "publicUrl": "/samples/acme-technologies-7a8f9c",
      "showcaseStatus": "DRAFT",
      "warnings": []
    }
  ]
}
```

- **Item Status Values:**
  - `CREATED`: Showcase successfully created as a new prospect record.
  - `EXISTING`: Identical prospect was already ingested under this campaign.
  - `FAILED`: Ingestion failed for this item (validation error, asset key not found, or conflicting duplicate payload).

---

#### `POST /api/integration/v1/prospects`
Convenience endpoint for ingesting a single prospect.

- **Authentication:** Required
- **Headers:** `Idempotency-Key`, `Content-Type: application/json`
- **Request Body:** Flat prospect object (same fields as batch item, with `externalCampaignId` at the root).
- **Response (201 Created):**
```json
{
  "success": true,
  "id": 142,
  "slug": "acme-technologies-7a8f9c",
  "publicUrl": "/samples/acme-technologies-7a8f9c",
  "status": "DRAFT",
  "campaignId": "camp_tech_q4_2026",
  "prospectId": "prosp_acme_001"
}
```

---

### 5.4 Polling & Prospect Inquiry Endpoints

#### `GET /api/integration/v1/batches/:batchId`
Polls the execution status, created showcases, and event history for a batch.

- **Authentication:** Required (Scoped strictly to the calling client's batches)
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
      "external_prospect_id": "prosp_acme_001",
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
- **Response (200 OK):**
```json
{
  "success": true,
  "id": 142,
  "slug": "acme-technologies-7a8f9c",
  "status": "DRAFT",
  "companyName": "Acme Technologies",
  "publicUrl": null,
  "viewCount": 0,
  "createdAt": "2026-11-12T10:31:01.000Z",
  "updatedAt": "2026-11-12T10:31:01.000Z"
}
```

---

#### `GET /api/integration/v1/prospects/:campaignId/:prospectId`
Inquires about a prospect by campaign and prospect external identifiers.

- **Authentication:** Required (Scoped to calling client)
- **Response (200 OK):** Same schema as `/prospects/:id`.

---

### 5.5 Outreach Mail Template Endpoints

#### `GET /api/integration/v1/prospects/:id/mail-template`
Retrieves the auto-generated outreach email template for an ingested prospect.

- **Authentication:** Required (Scoped to calling client)
- **Response (200 OK):**
```json
{
  "success": true,
  "id": 142,
  "slug": "acme-technologies-7a8f9c",
  "companyName": "Acme Technologies",
  "mailTemplate": {
    "subject": "Bespoke Market Intelligence & Growth Blueprint for Acme Technologies",
    "subjects": [
      "Bespoke Market Intelligence & Growth Blueprint for Acme Technologies",
      "Tailored Sales Intelligence & Lead Dossier for Acme Technologies",
      "Strategic Growth & Competitive Briefing: Acme Technologies"
    ],
    "recipientEmail": "jane.doe@acmetechnologies.example.com",
    "senderEmail": "campaign@dizitalgini.com",
    "showcaseUrl": "/samples/acme-technologies-7a8f9c",
    "bodyText": "Subject: Bespoke Market Intelligence & Growth Blueprint for Acme Technologies\n\nHi Jane Doe,\n\nOur research specialists at DiziGini have put together a dedicated intelligence showcase specifically for Acme Technologies...",
    "bodyHtml": "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;\">...</div>",
    "gmailComposeUrl": "https://mail.google.com/mail/?view=cm&fs=1&to=jane.doe%40acmetechnologies.example.com&su=...",
    "outlookComposeUrl": "https://outlook.office.com/mail/deeplink/compose?to=jane.doe%40acmetechnologies.example.com&subject=..."
  }
}
```

---

#### `POST /api/integration/v1/prospects/:id/mail-template`
Regenerates an outreach mail template with alternative sender parameters.

- **Authentication:** Required (Scoped to calling client)
- **Request Body:**
```json
{
  "senderName": "Sarah Jenkins",
  "senderTitle": "Strategic Account Executive",
  "senderEmail": "sarah.j@dizitalgini.com"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "id": 142,
  "slug": "acme-technologies-7a8f9c",
  "mailTemplate": {
    "subject": "Bespoke Market Intelligence & Growth Blueprint for Acme Technologies",
    "senderEmail": "sarah.j@dizitalgini.com",
    "showcaseUrl": "/samples/acme-technologies-7a8f9c",
    "bodyText": "...",
    "bodyHtml": "..."
  }
}
```

---

## 6. HTTP Status & Error Codes Reference

| HTTP Code | Error Code | Root Cause & Resolution |
| :--- | :--- | :--- |
| **`400 Bad Request`** | `MISSING_CAMPAIGN_ID` | `externalCampaignId` is missing or blank. |
| **`400 Bad Request`** | `EMPTY_PROSPECTS_ARRAY` | `prospects` array is empty or not provided. |
| **`400 Bad Request`** | `MAX_BATCH_SIZE_EXCEEDED` | `prospects` array contains more than 20 items. |
| **`400 Bad Request`** | `SENDER_EMAIL_NOT_ALLOWED` | Provided sender email is not in the client's `allowed_sender_emails` whitelist. |
| **`400 Bad Request`** | `INVALID_ASSET_KEY` | Asset key does not exist, belongs to another client, is expired, or is already claimed. |
| **`400 Bad Request`** | `SSRF_PRIVATE_IP_BLOCKED` | `logoUrl` resolves to private, loopback, or cloud metadata IP addresses. |
| **`400 Bad Request`** | `INVALID_FILE_TYPE` | Uploaded asset does not begin with `%PDF-` header. |
| **`401 Unauthorized`** | `UNAUTHORIZED` | API key is missing, invalid, or supplied via query parameter / body. |
| **`403 Forbidden`** | `FORBIDDEN` | API client record is marked inactive in the registry. |
| **`404 Not Found`** | `BATCH_NOT_FOUND` | Batch ID does not exist or belongs to another tenant. |
| **`404 Not Found`** | `PROSPECT_NOT_FOUND` | Prospect does not exist, belongs to another tenant, or is a manual showcase. |
| **`409 Conflict`** | `IDEMPOTENCY_KEY_PAYLOAD_MISMATCH` | Idempotency key was previously submitted with different payload data. |
| **`409 Conflict`** | `CONCURRENT_REQUEST_IN_PROGRESS` | Request with this idempotency key is currently executing. Retry shortly. |
| **`409 Conflict`** | `DUPLICATE_EXTERNAL_PROSPECT` | Prospect already exists under campaign with conflicting data. |
| **`409 Conflict`** | `SLUG_CONFLICT` | Explicit custom slug specified by client is already taken. |
| **`413 Payload Too Large`**| `PAYLOAD_TOO_LARGE` | JSON request body exceeds 2MB or asset file exceeds 25MB. |
| **`413 Payload Too Large`**| `STAGED_QUOTA_EXCEEDED` | Staged assets exceed the 500MB per-client limit. |
| **`429 Too Many Requests`**| `RATE_LIMIT_EXCEEDED` | Exceeded 60 req/min (standard) or 10 uploads/min (assets). |
| **`500 Internal Server Error`**| `DATABASE_ERROR` | Unexpected backend or database error. Lock is cleared for safe retry. |

---

## 7. Complete Worked End-to-End Example (`curl`)

Below is a complete, real-world flow illustrating how DizitalGini pushes a campaign.

### Step 1: Health & Authentication Check
```bash
curl -X GET "https://dizigini.com/api/integration/v1/health" \
  -H "X-API-Key: dzg_live_demo_key_secret_value"
```

### Step 2: Upload Staged Company Study PDF
```bash
curl -X POST "https://dizigini.com/api/integration/v1/assets" \
  -H "X-API-Key: dzg_live_demo_key_secret_value" \
  -F "file=@/path/to/Acme_Company_Study.pdf;type=application/pdf"
```
*Output returns `assetKey`: `dzg_ast_9f8b7c6d-5e4a-3b2c-1a0f-9e8d7c6b5a4f`.*

### Step 3: Ingest Campaign Prospects Batch
```bash
curl -X POST "https://dizigini.com/api/integration/v1/prospects/batch" \
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
          "pdfAssetKey": "dzg_ast_9f8b7c6d-5e4a-3b2c-1a0f-9e8d7c6b5a4f"
        },
        "leads": [
          {
            "name": "Jane Doe",
            "title": "VP of Revenue Operations",
            "email": "jane.doe@acmetechnologies.example.com",
            "company": "Acme Technologies",
            "whySuitsBest": "Leading operational modernization in Q4."
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
*Output returns HTTP 207 Multi-Status with `batchId` and showcase `id` (e.g. `142`).*

### Step 4: Poll Batch Execution Status
```bash
curl -X GET "https://dizigini.com/api/integration/v1/batches/b6a7c8d9-0e1f-2a3b-4c5d-6e7f8a9b0c1d" \
  -H "X-API-Key: dzg_live_demo_key_secret_value"
```

### Step 5: Fetch Outreach Email Template for Campaign Dispatch
```bash
curl -X GET "https://dizigini.com/api/integration/v1/prospects/142/mail-template" \
  -H "X-API-Key: dzg_live_demo_key_secret_value"
```

---

## 8. Requirements for DizitalGini Engineering Team

To complete this integration, DizitalGini must implement the following components within the DizitalGini codebase:

### 8.1 Backend-Enforced Permission Gate ("Service Provider" Module)
- **Role-Based Access Control (RBAC):** Create a backend permission check (e.g. `CAN_EXPORT_TO_DIZIGINI` or restricted to roles `SUPER_ADMIN`, `CAMPAIGN_MANAGER`).
- **Security Rule:** Do not rely on hardcoded email addresses or client-side UI flags. Access must be verified on DizitalGini backend endpoints prior to dispatch.

### 8.2 Campaign Picker & Selection UI
- Provide a UI allowing authorized operators to select a campaign that has passed QA and is ready for showcase generation.
- Display prospect counts, verified email counts, and asset readiness prior to export.

### 8.3 Lead Standardization Mapper
- Implement an adapter in DizitalGini backend that maps internal lead schema into the DiziGini Prospect contract:
  - Normalize company name and clean website URL.
  - Standardize lead arrays (`name`, `title`, `email`, `whySuitsBest`).
  - Stream PDFs to `POST /api/integration/v1/assets` to obtain `pdfAssetKey` prior to batch submission.

### 8.4 Secure Backend Integration Proxy
- **Strict Prohibition:** The DiziGini API key must **NEVER** be stored in client-side frontends (React/Vue/HTML) or exposed to the browser.
- DizitalGini backend must store the key in an environment variable (`DIZIGINI_API_KEY`) and provide internal server endpoints (e.g., `POST /api/campaigns/:id/export-dizigini`) that proxy to DiziGini.
- The backend proxy must generate and maintain unique `Idempotency-Key` UUIDs for all push requests.

### 8.5 Export Results & Status View
- Display the returned `batchId`, success/failure breakdown, and generated showcase links directly within the DizitalGini campaign dashboard.
- Display the generated outreach email templates or supply a one-click "Copy Outreach Email" button for SDRs.
