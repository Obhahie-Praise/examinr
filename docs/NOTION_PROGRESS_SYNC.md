# Examinr → Notion Progress Sync

This integration sends meaningful Examinr development events to the **Progress Updates** data source in the Personal Operating System.

## Endpoint

`POST /api/integrations/notion/progress`

The endpoint is server-to-server. It is protected by a bearer secret and must never be called directly from browser code.

## Required configuration

The non-secret data-source and project IDs are already configured in `apps/api/wrangler.jsonc`.

Set these two Worker secrets:

- `NOTION_API_KEY`: internal Notion integration token.
- `EXAMINR_NOTION_SYNC_SECRET`: a high-entropy shared secret known only to trusted Examinr server code and this Worker.

Never commit either secret, put it in `.dev.vars.example`, or expose it to the web application.

## Notion integration setup

1. Create an internal integration in Notion.
2. Give it permission to insert content.
3. Share the **Progress Updates** database and **Projects** database with the integration. The project relation points to the Examinr project page.
4. Copy the integration token directly into the API Worker secret configuration. Never paste it into ChatGPT or source code.

## Cloudflare Worker secrets

From the repository root:

```powershell
pnpm --filter api exec wrangler secret put NOTION_API_KEY
pnpm --filter api exec wrangler secret put EXAMINR_NOTION_SYNC_SECRET
```

For local development, place the values in `apps/api/.dev.vars` (never commit this file):

```dotenv
NOTION_API_KEY=secret_xxx
EXAMINR_NOTION_SYNC_SECRET=replace-with-a-long-random-secret
```

## Event contract

```json
{
  "eventId": "stable-unique-event-id",
  "title": "Implemented topic-level practice history",
  "updateType": "Build log",
  "date": "2026-11-10",
  "summary": "Students can now review their recent topic practice.",
  "workCompleted": "Persisted completed attempts and connected the review screen.",
  "tests": "API integration tests passed; web type-check passed.",
  "blockers": "",
  "nextSteps": "Add topic-level performance aggregation.",
  "evidenceUrl": "https://example.com/evidence",
  "commitUrl": "https://github.com/owner/repo/commit/..."
}
```

Required fields: `eventId`, `title`, and `summary`. Optional text and URL fields may be omitted. Dates default to the Worker date. URLs must be HTTPS.

Supported `updateType` values: `Build log`, `Milestone`, `Decision`, `Bug / blocker`, `Release`, `Research`, and `Other`.

## Authentication and idempotency

Send `Authorization: Bearer <EXAMINR_NOTION_SYNC_SECRET>`. The API stores event state in D1 and queries Notion for the same external event ID before creating a page, so retries can recover after an ambiguous network timeout.

- Invalid/missing secret: 401.
- Invalid payload: 400.
- Same event currently processing: 409.
- Successful creation: 201.
- Already recorded event: 200 with `status: duplicate`.

## Migration and deployment

Apply both D1 migrations before deploying:

```powershell
pnpm --filter api drizzle:migrate:local
pnpm --filter api drizzle:migrate:remote
```

Deploy only after Notion sharing and secrets are configured.

## Verification checklist

- [ ] Notion integration can create a row in Progress Updates.
- [ ] Missing/invalid bearer secret returns 401.
- [ ] Invalid payload returns 400.
- [ ] First valid event creates one Examinr-linked row.
- [ ] Replaying the same event ID returns duplicate without creating another row.
- [ ] No Notion token is present in client bundles, logs, or committed files.
- [ ] A real Examinr development workflow emits an event after a meaningful milestone.

Until these checks pass, the integration must be described as prepared, not live/verified.
