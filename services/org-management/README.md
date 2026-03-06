# Organization Management Service

Backend service that automates tenant onboarding by orchestrating **Auth0 Organization** provisioning and **AWS infrastructure** setup (DynamoDB, KMS, S3).

## Architecture

```
Sign-up / Payment Webhook
        │
        ▼
  ┌─────────────┐     ┌──────────────────┐
  │  POST       │────▶│  Organization    │
  │  /onboard   │     │  Service         │
  └─────────────┘     │  (Orchestrator)  │
                      └──┬──────┬────────┘
                         │      │
              ┌──────────┘      └──────────┐
              ▼                            ▼
    ┌──────────────────┐        ┌──────────────────┐
    │  Auth0 Mgmt API  │        │  AWS (LocalStack) │
    │  • Create Org    │        │  • KMS Key        │
    │  • Enable Conn   │        │  • S3 Access Point│
    │  • Invite Admin  │        │  • DynamoDB Record│
    └──────────────────┘        └──────────────────┘
```

## Quick Start

### 1. Configure Environment

Copy the example env and fill in your Auth0 M2M credentials:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `AUTH0_M2M_CLIENT_ID` | Auth0 Machine-to-Machine application Client ID |
| `AUTH0_M2M_CLIENT_SECRET` | Auth0 M2M application Client Secret |
| `AUTH0_PORTAL_CLIENT_ID` | Customer Portal SPA Client ID (for invitations) |
| `AUTH0_CONNECTION_NAME` | Auth0 database connection name (default: `Username-Password-Authentication`) |
| `AWS_ENDPOINT` | LocalStack endpoint (default: `http://localhost:4566`) |

### 2. Install Dependencies

```bash
npm install
```

### 3. Bootstrap LocalStack Resources

Ensure LocalStack is running with `dynamodb`, `kms`, `s3`, and `s3control` services enabled, then:

```bash
npm run bootstrap
```

This creates the `Tenants` DynamoDB table and `tenant-data` S3 bucket.

### 4. Run the Service

```bash
npm run dev     # Development (hot-reload via tsx)
npm run build   # Compile TypeScript
npm start       # Production (runs compiled JS)
```

The service starts on **port 3001** by default.

## API Reference

### `POST /onboard`

Provision a new tenant end-to-end.

```json
{
  "email": "admin@acme.com",
  "companyName": "Acme Corporation",
  "displayName": "Acme Corp",
  "metadata": { "subscription_plan": "enterprise" }
}
```

**Response** `201 Created`:

```json
{
  "tenantId": "org_abc123",
  "orgId": "org_abc123",
  "orgName": "acme-corporation",
  "status": "ACTIVE",
  "kmsKeyArn": "arn:aws:kms:...",
  "s3AccessPointArn": "arn:aws:s3:..."
}
```

### `POST /resend-invite`

Resend an admin invitation for an existing organization.

```json
{ "orgId": "org_abc123", "email": "admin@acme.com" }
```

### `GET /tenants/:tenantId`

Retrieve a tenant record from DynamoDB.

### `GET /health`

Health check endpoint.

## Provisioning Sequence

1. **Validate** input (email, company name)
2. **Generate** URL-safe slug; append 4-digit suffix on conflict
3. **Create** Auth0 Organization
4. **Enable** database connection on the org
5. **Send** admin invitation via Auth0
6. **Create** KMS encryption key (aliased to `alias/tenant/{orgId}`)
7. **Create** S3 access point (`tenant-{orgId}`)
8. **Record** tenant mapping in DynamoDB with status `ACTIVE`

### Error Handling

| Scenario | Behavior |
|---|---|
| Slug conflict | Appends random 4-digit suffix and retries |
| Auth0 API 429/5xx | Exponential backoff (3 attempts, 500ms base) |
| Auth0 API 4xx (non-429) | Fails immediately, no retry |
| AWS provisioning failure | Tenant recorded as `ERROR_PROVISIONING` in DynamoDB |
| Auth0 succeeds, AWS fails | Partial state preserved for manual intervention |

## Testing

```bash
npm test               # Unit tests (30 tests)
npm run test:integration  # Integration tests (requires LocalStack)
npm run test:coverage  # Unit tests with coverage
```

## Auth0 Required Scopes

The M2M application must have:

- `create:organizations`
- `create:organization_connections`
- `create:organization_invitations`
- `read:organizations`

## Tech Stack

- **Runtime:** Node.js + TypeScript (ES2022)
- **Framework:** Express
- **Auth0:** `auth0` Node SDK (ManagementClient)
- **AWS:** `@aws-sdk/client-dynamodb`, `@aws-sdk/client-kms`, `@aws-sdk/client-s3-control`
- **Logging:** Winston (structured JSON)
- **Testing:** Vitest
