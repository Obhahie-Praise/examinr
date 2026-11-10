import { Hono } from "hono";

export type NotionStudyBindings = {
  DB: D1Database;
  NOTION_API_KEY?: string;
  NOTION_STUDY_DATA_SOURCE_ID?: string;
  EXAMINR_NOTION_SYNC_SECRET?: string;
};

type Subject = "Mathematics" | "Physics" | "Chemistry" | "English" | "Biology" | "Other";
type SessionType = "Study" | "Practice" | "Revision" | "Mock" | "AI Tutor" | "Other";
type Event = {
  eventId: string; title: string; date: string; subject: Subject; sessionType: SessionType;
  durationMinutes: number; questionsAttempted: number; correctAnswers: number;
  score: number | null; maximumScore: number | null; topicPageId: string; goalPageId: string;
  summary: string; reflection: string; nextAction: string;
};

const subjects: Subject[] = ["Mathematics", "Physics", "Chemistry", "English", "Biology", "Other"];
const types: SessionType[] = ["Study", "Practice", "Revision", "Mock", "AI Tutor", "Other"];
const notionBase = "https://api.notion.com/v1";
const notionVersion = "2025-09-03";
const app = new Hono<{ Bindings: NotionStudyBindings }>();

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function textValue(value: unknown, key: string, max: number, required = false): string {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(key + " is required.");
    return "";
  }
  if (typeof value !== "string") throw new Error(key + " must be a string.");
  const result = value.trim();
  if (result.length > max) throw new Error(key + " is too long.");
  if (required && !result) throw new Error(key + " is required.");
  return result;
}
function numberValue(value: unknown, key: string, required = false): number | null {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(key + " is required.");
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(key + " must be a non-negative number.");
  }
  return value;
}
function pageId(value: unknown, key: string): string {
  const id = textValue(value, key, 36);
  if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error(key + " must be a Notion page UUID.");
  }
  return id;
}
function dateValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return new Date().toISOString().slice(0, 10);
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("date must use YYYY-MM-DD.");
  }
  const date = new Date(value + "T00:00:00.000Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("date is not a valid calendar date.");
  }
  return value;
}
function parseEvent(value: unknown): Event {
  if (!record(value)) throw new Error("Body must be a JSON object.");
  const subject = value.subject ?? "Other";
  const sessionType = value.sessionType ?? "Study";
  if (typeof subject !== "string" || !subjects.includes(subject as Subject)) throw new Error("Unsupported subject.");
  if (typeof sessionType !== "string" || !types.includes(sessionType as SessionType)) throw new Error("Unsupported sessionType.");
  const questionsAttempted = numberValue(value.questionsAttempted, "questionsAttempted") ?? 0;
  const correctAnswers = numberValue(value.correctAnswers, "correctAnswers") ?? 0;
  const score = numberValue(value.score, "score");
  const maximumScore = numberValue(value.maximumScore, "maximumScore");
  if (correctAnswers > questionsAttempted) throw new Error("correctAnswers cannot exceed questionsAttempted.");
  if (score !== null && maximumScore !== null && score > maximumScore) throw new Error("score cannot exceed maximumScore.");
  return {
    eventId: textValue(value.eventId, "eventId", 200, true),
    title: textValue(value.title, "title", 200, true),
    date: dateValue(value.date),
    subject: subject as Subject,
    sessionType: sessionType as SessionType,
    durationMinutes: numberValue(value.durationMinutes, "durationMinutes", true) ?? 0,
    questionsAttempted, correctAnswers, score, maximumScore,
    topicPageId: pageId(value.topicPageId, "topicPageId"),
    goalPageId: pageId(value.goalPageId, "goalPageId"),
    summary: textValue(value.summary, "summary", 2000),
    reflection: textValue(value.reflection, "reflection", 2000),
    nextAction: textValue(value.nextAction, "nextAction", 2000),
  };
}
function equalSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function headers(key: string): HeadersInit {
  return { Authorization: "Bearer " + key, "Notion-Version": notionVersion, "Content-Type": "application/json" };
}
function rich(value: string) {
  return { rich_text: value ? [{ type: "text", text: { content: value } }] : [] };
}
async function findExisting(key: string, source: string, eventId: string): Promise<string | null> {
  const response = await fetch(notionBase + "/data_sources/" + source + "/query", {
    method: "POST", headers: headers(key),
    body: JSON.stringify({ filter: { property: "External event ID", rich_text: { equals: eventId } }, page_size: 1 }),
  });
  const result: unknown = await response.json();
  if (!response.ok || !record(result) || !Array.isArray(result.results)) {
    throw new Error("Notion idempotency lookup failed with HTTP " + response.status + ".");
  }
  const page = result.results[0];
  return record(page) && typeof page.id === "string" ? page.id : null;
}

app.post("/", async (c) => {
  const expected = c.env.EXAMINR_NOTION_SYNC_SECRET ?? "";
  const auth = c.req.header("Authorization") ?? "";
  const supplied = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!expected || !supplied || !equalSecret(expected, supplied)) return c.json({ error: "Unauthorized." }, 401);
  const key = c.env.NOTION_API_KEY;
  const source = c.env.NOTION_STUDY_DATA_SOURCE_ID;
  if (!key || !source) return c.json({ error: "Notion study sync is not configured." }, 503);

  const raw = await c.req.text();
  if (raw.length > 32000) return c.json({ error: "Request body is too large." }, 413);
  let event: Event;
  try { event = parseEvent(JSON.parse(raw) as unknown); }
  catch (error) { return c.json({ error: error instanceof Error ? error.message : "Invalid body." }, 400); }

  try {
    const claim = await c.env.DB.prepare(
      "INSERT OR IGNORE INTO notion_study_events (event_id, status) VALUES (?, 'processing')",
    ).bind(event.eventId).run();
    if (claim.meta.changes === 0) {
      const old = await c.env.DB.prepare(
        "SELECT status, notion_page_id FROM notion_study_events WHERE event_id = ?",
      ).bind(event.eventId).first<{ status: string; notion_page_id: string | null }>();
      if (old?.status === "sent") return c.json({ status: "duplicate", notionPageId: old.notion_page_id }, 200);
      if (old?.status === "processing") return c.json({ error: "Event is already processing." }, 409);
      const retry = await c.env.DB.prepare(
        "UPDATE notion_study_events SET status = 'processing', last_error = NULL, updated_at = CURRENT_TIMESTAMP WHERE event_id = ? AND status = 'failed'",
      ).bind(event.eventId).run();
      if (retry.meta.changes !== 1) return c.json({ error: "Unable to claim event." }, 409);
    }

    const existingId = await findExisting(key, source, event.eventId);
    if (existingId) {
      await c.env.DB.prepare(
        "UPDATE notion_study_events SET status = 'sent', notion_page_id = ?, last_error = NULL, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?",
      ).bind(existingId, event.eventId).run();
      return c.json({ status: "duplicate", notionPageId: existingId }, 200);
    }

    const properties: Record<string, unknown> = {
      Session: { title: [{ type: "text", text: { content: event.title } }] },
      Date: { date: { start: event.date } },
      Subject: { select: { name: event.subject } },
      "Session type": { select: { name: event.sessionType } },
      "Duration (minutes)": { number: event.durationMinutes },
      "Questions attempted": { number: event.questionsAttempted },
      "Correct answers": { number: event.correctAnswers },
      Summary: rich(event.summary),
      Reflection: rich(event.reflection),
      "Next action": rich(event.nextAction),
      Source: { select: { name: "Examinr AI" } },
      "External event ID": rich(event.eventId),
    };
    if (event.score !== null) properties.Score = { number: event.score };
    if (event.maximumScore !== null) properties["Maximum score"] = { number: event.maximumScore };
    if (event.topicPageId) properties.Topic = { relation: [{ id: event.topicPageId }] };
    if (event.goalPageId) properties.Goal = { relation: [{ id: event.goalPageId }] };

    const response = await fetch(notionBase + "/pages", {
      method: "POST", headers: headers(key),
      body: JSON.stringify({ parent: { data_source_id: source }, properties }),
    });
    const payload: unknown = await response.json();
    if (!response.ok || !record(payload) || typeof payload.id !== "string") {
      await c.env.DB.prepare(
        "UPDATE notion_study_events SET status = 'failed', last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?",
      ).bind("Notion API returned HTTP " + response.status + ".", event.eventId).run();
      console.error("Notion study sync write failed", { status: response.status, eventId: event.eventId });
      return c.json({ error: "Unable to save the study session to Notion." }, 502);
    }
    await c.env.DB.prepare(
      "UPDATE notion_study_events SET status = 'sent', notion_page_id = ?, last_error = NULL, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?",
    ).bind(payload.id, event.eventId).run();
    return c.json({ status: "created", notionPageId: payload.id }, 201);
  } catch (error) {
    await c.env.DB.prepare(
      "UPDATE notion_study_events SET status = 'failed', last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?",
    ).bind("Study progress sync failed before confirmation.", event.eventId).run().catch(() => undefined);
    console.error("Examinr study sync failed", { eventId: event.eventId, error: error instanceof Error ? error.message : "Unknown error" });
    return c.json({ error: "Study progress sync failed. Retry with the same eventId." }, 502);
  }
});

export { app as notionStudyProgress };