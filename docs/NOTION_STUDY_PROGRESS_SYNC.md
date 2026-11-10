# Examinr → Notion Study Progress Sync

This integration records completed learner activity in the **Study Sessions** database. It is separate from the Examinr software-development log.

## Endpoint

`POST /api/integrations/notion/study-progress`

Server-to-server only. It uses the same bearer secret as the development progress integration.

## Worker configuration

| Variable | Type | Value |
|---|---|---|
| `NOTION_API_KEY` | Secret | Internal Notion integration token |
| `EXAMINR_NOTION_SYNC_SECRET` | Secret | High-entropy shared secret |
| `NOTION_STUDY_DATA_SOURCE_ID` | Variable | `70876bdf-8be6-493e-a80e-f8a837520a5b` |

Share **Study Sessions**, **Learning Tracker**, and **Goals** with the internal Notion integration. Topic and goal relations are optional; when sent, page IDs must be valid Notion UUIDs.

## Event contract

```json
{
  "eventId": "stable-unique-session-event-id",
  "title": "JAMB Mathematics practice — Indices",
  "date": "2026-11-10",
  "subject": "Mathematics",
  "sessionType": "Practice",
  "durationMinutes": 35,
  "questionsAttempted": 20,
  "correctAnswers": 17,
  "score": 17,
  "maximumScore": 20,
  "topicPageId": "optional-learning-tracker-page-uuid",
  "goalPageId": "optional-academic-goal-page-uuid",
  "summary": "Completed a timed practice set on indices.",
  "reflection": "Most errors came from negative indices.",
  "nextAction": "Revise negative and fractional indices."
}
```

Required: `eventId`, `title`, `durationMinutes`. Subject defaults to `Other`, session type defaults to `Study`, and date defaults to the Worker date. Questions and scores are optional and validated.

Supported subjects: Mathematics, Physics, Chemistry, English, Biology, Other.

Supported session types: Study, Practice, Revision, Mock, AI Tutor, Other.

## Security and idempotency

Send `Authorization: Bearer <EXAMINR_NOTION_SYNC_SECRET>`. Never expose the Notion integration token to the browser. Only send completed sessions or meaningful progress events, not keystrokes or sensitive student content.

The API stores event IDs in D1 and checks the Notion data source before creating a row. Retrying the same event ID will not intentionally create a second session record.

## Migration

```powershell
pnpm --filter api drizzle:migrate:local
pnpm --filter api drizzle:migrate:remote
```

The integration is not live until Notion sharing, secrets and vars are configured, a test event succeeds, and a duplicate replay is confirmed.
