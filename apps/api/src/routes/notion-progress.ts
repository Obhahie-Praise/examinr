import { Hono } from "hono";

type NotionProgressBindings = {
  DB: D1Database;
  NOTION_API_KEY?: string;
  NOTION_PROGRESS_DATA_SOURCE_ID?: string;
  NOTION_EXAMINR_PROJECT_PAGE_ID?: string;
  EXAMINR_NOTION_SYNC_SECRET?: string;
};

type UpdateType =
  | "Build log"
  | "Milestone"
  | "Decision"
  | "Bug / blocker"
  | "Release"
  | "Research"
  | "Other";

type ProgressEvent = {
  eventId: string;
  title: string;
  updateType: UpdateType;
  date: string;
  summary: string;
  workCompleted: string;
  tests: string;
  blockers: string;
  nextSteps: string;
  evidenceUrl: string;
  commitUrl: string;
};

const updateTypes: UpdateType[] = [
  "Build log",
  "Milestone",
  "Decision",
  "Bug / blocker",
  "Release",
  "Research",
  "Other",
];

const notionVersion = "2026-03-11";
const notionPagesUrl = "https://api.notion.com/v1/pages";

const notionProgress = new Hono<{ Bindings: NotionProgressBindings }>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(
  value: unknown,
  field: string,
  maxLength: number,
  required = false,
): string {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} is required.`);
    return "";
  }

  if (typeof value !== "string") {
    throw new Error(`${field} must be a string.`);
  }

  const result = value.trim();
  if (result.length > maxLength) {
    throw new Error(`${field} must be ${maxLength} characters or fewer.`);
  }
  if (required && result.length === 0) {
    throw new Error(`${field} is required.`);
  }
  return result;
}

function readHttpsUrl(value: unknown, field: string): string {
  const input = readText(value, field, 2000);
  if (!input) return "";

  try {
    const url = new URL(input);
    if (url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${field} must be a valid HTTPS URL.`);
  }
}

function parseDate(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return new Date().toISOString().slice(0, 10);
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("date must use YYYY-MM-DD format.");
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error("date must be a valid calendar date.");
  }
  return value;
}

function parseEvent(value: unknown): ProgressEvent {
  if (!isRecord(value)) throw new Error("Request body must be a JSON object.");

  const updateTypeValue = value.updateType ?? "Build log";
  if (
    typeof updateTypeValue !== "string" ||
    !updateTypes.includes(updateTypeValue as UpdateType)
  ) {
    throw new Error("updateType is not supported.");
  }

  return {
    eventId: readText(value.eventId, "eventId", 200, true),
    title: readText(value.title, "title", 200, true),
    updateType: updateTypeValue as UpdateType,
    date: parseDate(value.date),
    summary: readText(value.summary, "summary", 2000, true),
    workCompleted: readText(value.workCompleted, "workCompleted", 2000),
    tests: readText(value.tests, "tests", 2000),
    blockers: readText(value.blockers, "blockers", 2000),
    nextSteps: readText(value.nextSteps, "nextSteps", 2000),
    evidenceUrl: readHttpsUrl(value.evidenceUrl, "evidenceUrl"),
    commitUrl: readHttpsUrl(value.commitUrl, "commitUrl"),
  };
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function richText(value: string) {
  return {
    rich_text: value
      ? [{ type: "text", text: { content: value } }]
      : [],
  };
}

notionProgress.post("/", async (c) => {
  const expectedSecret = c.env.EXAMINR_NOTION_SYNC_SECRET;
  const authorization = c.req.header("Authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!expectedSecret || !suppliedSecret || !safeEqual(suppliedSecret, expectedSecret)) {
    return c.json({ error: "Unauthorized." }, 401);
  }

  if (
    !c.env.NOTION_API_KEY ||
    !c.env.NOTION_PROGRESS_DATA_SOURCE_ID ||
    !c.env.NOTION_EXAMINR_PROJECT_PAGE_ID
  ) {
    return c.json({ error: "Notion progress integration is not configured." }, 503);
  }

  const rawBody = await c.req.text();
  if (rawBody.length > 32_000) {
    return c.json({ error: "Request body is too large." }, 413);
  }

  let event: ProgressEvent;
  try {
    event = parseEvent(JSON.parse(rawBody) as unknown);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Invalid request body." },
      400,
    );
  }

  try {
    const claim = await c.env.DB.prepare(
      `INSERT OR IGNORE INTO notion_progress_events (event_id, status)
       VALUES (?, 'processing')`,
    )
      .bind(event.eventId)
      .run();

    if (claim.meta.changes === 0) {
      const existing = await c.env.DB.prepare(
        "SELECT status, notion_page_id FROM notion_progress_events WHERE event_id = ?",
      )
        .bind(event.eventId)
        .first<{ status: string; notion_page_id: string | null }>();

      if (existing?.status === "sent") {
        return c.json(
          { status: "duplicate", notionPageId: existing.notion_page_id },
          200,
        );
      }

      if (existing?.status === "processing") {
        return c.json({ error: "This event is already being processed." }, 409);
      }

      const retry = await c.env.DB.prepare(
        `UPDATE notion_progress_events
         SET status = 'processing', last_error = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ? AND status = 'failed'`,
      )
        .bind(event.eventId)
        .run();

      if (retry.meta.changes !== 1) {
        return c.json({ error: "Unable to claim this event for processing." }, 409);
      }
    }

    const properties = {
      Update: {
        title: [{ type: "text", text: { content: event.title } }],
      },
      Project: {
        relation: [{ id: c.env.NOTION_EXAMINR_PROJECT_PAGE_ID }],
      },
      "Update type": {
        select: { name: event.updateType },
      },
      Date: {
        date: { start: event.date },
      },
      Summary: richText(event.summary),
      "Work completed": richText(event.workCompleted),
      "Tests / validation": richText(event.tests),
      Blockers: richText(event.blockers),
      "Next steps": richText(event.nextSteps),
      "Evidence URL": { url: event.evidenceUrl || null },
      "Commit / PR URL": { url: event.commitUrl || null },
      Source: {
        select: { name: "Examinr AI" },
      },
      "External event ID": richText(event.eventId),
    };

    const notionResponse = await fetch(notionPagesUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.NOTION_API_KEY}`,
        "Notion-Version": notionVersion,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { data_source_id: c.env.NOTION_PROGRESS_DATA_SOURCE_ID },
        properties,
      }),
    });

    const notionPayload: unknown = await notionResponse.json();
    if (!notionResponse.ok || !isRecord(notionPayload) || typeof notionPayload.id !== "string") {
      await c.env.DB.prepare(
        `UPDATE notion_progress_events
         SET status = 'failed', last_error = ?, updated_at = CURRENT_TIMESTAMP
         WHERE event_id = ?`,
      )
        .bind(`Notion API returned HTTP ${notionResponse.status}.`, event.eventId)
        .run();

      console.error("Notion progress write failed", {
        status: notionResponse.status,
        eventId: event.eventId,
      });
      return c.json({ error: "Unable to save the progress update to Notion." }, 502);
    }

    await c.env.DB.prepare(
      `UPDATE notion_progress_events
       SET status = 'sent', notion_page_id = ?, last_error = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE event_id = ?`,
    )
      .bind(notionPayload.id, event.eventId)
      .run();

    return c.json(
      { status: "created", notionPageId: notionPayload.id },
      201,
    );
  } catch (error) {
    await c.env.DB.prepare(
      `UPDATE notion_progress_events
       SET status = 'failed', last_error = ?, updated_at = CURRENT_TIMESTAMP
       WHERE event_id = ?`,
    )
      .bind("Progress sync failed before confirmation.", event.eventId)
      .run()
      .catch(() => undefined);

    console.error("Examinr progress sync failed", {
      eventId: event.eventId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return c.json({ error: "Progress sync failed. The event can be retried." }, 502);
  }
});

export { notionProgress };
