const crypto = require("crypto");

const MAX_BODY_BYTES = 32 * 1024;
const DEFAULT_BOOKING_URL = "https://calendar.app.google/WHBdTUUuqEsjfdFN6";
const ALLOWED_SOURCES = new Set([
  "remedys_ai_diagnostic",
  "remedys_direct_request",
  "remedys_direct_call",
]);
const ALLOWED_DIRECT_REQUEST_PATHS = new Set([
  "AI Consulting",
  "AI Automation",
  "AI Enablement",
  "AI Engineering",
  "Not sure yet / Help me choose the right path.",
]);

function parseAllowedOrigins() {
  return new Set(
    String(process.env.ALLOWED_ORIGINS || "https://remedys.ai,https://www.remedys.ai")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
}

function isLocalOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch (error) {
    return false;
  }
}

function isAllowedOrigin(origin) {
  return parseAllowedOrigins().has(origin) || isLocalOrigin(origin);
}

function corsHeaders(origin) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function json(statusCode, body, origin) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify(body),
  };
}

function cleanText(value, maxLength = 2000) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function cleanEmail(value) {
  return cleanText(value, 320).toLowerCase();
}

function cleanJsonObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getHeader(headers, key) {
  const lowerKey = key.toLowerCase();
  const match = Object.keys(headers || {}).find((name) => name.toLowerCase() === lowerKey);
  return match ? headers[match] : "";
}

function getClientIp(event) {
  const forwarded = getHeader(event.headers, "x-forwarded-for");
  return (
    getHeader(event.headers, "x-nf-client-connection-ip") ||
    getHeader(event.headers, "client-ip") ||
    (forwarded ? forwarded.split(",")[0].trim() : "")
  );
}

function hashIp(ip) {
  if (!ip || !process.env.LEAD_IP_HASH_SECRET) return "";
  return crypto.createHmac("sha256", process.env.LEAD_IP_HASH_SECRET).update(ip).digest("hex");
}

function buildLeadKey(payload) {
  const email = cleanEmail(payload.email || payload.booking_email);
  const posthogDistinctId = cleanText(payload.posthog_distinct_id, 200);
  const posthogSessionId = cleanText(payload.posthog_session_id, 200);
  const company = cleanText(payload.company, 180).toLowerCase();

  if (email) return `email:${email}`;
  if (posthogDistinctId) return `posthog:${posthogDistinctId}`;
  if (posthogSessionId) return `session:${posthogSessionId}`;
  if (company) return `company:${company}`;
  return "";
}

function normalizeScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function bool(value) {
  return value === true || value === "true" || value === "yes" || value === "1";
}

function buildRow(payload, event, submissionId) {
  const origin = getHeader(event.headers, "origin");
  const bookingUrl = process.env.INTRO_CALL_BOOKING_URL || DEFAULT_BOOKING_URL;

  return {
    source: cleanText(payload.source, 80),
    submission_id: submissionId,
    full_name: cleanText(payload.full_name, 160),
    email: cleanEmail(payload.email),
    company: cleanText(payload.company, 180),
    newsletter_opt_in: bool(payload.newsletter_opt_in),
    readiness_score: normalizeScore(payload.readiness_score),
    recommendation_key: cleanText(payload.recommendation_key, 80),
    recommendation_label: cleanText(payload.recommendation_label, 160),
    recommendation_band: cleanText(payload.recommendation_band, 220),
    expected_time_to_value: cleanText(payload.expected_time_to_value, 160),
    prefill_service: cleanText(payload.prefill_service, 160),
    company_description: cleanText(payload.company_description),
    time_drain: cleanText(payload.time_drain),
    affected_group: cleanText(payload.affected_group, 1000),
    ai_usage: cleanText(payload.ai_usage, 1000),
    desired_outcome: cleanText(payload.desired_outcome),
    direct_request_path: cleanText(payload.direct_request_path, 160),
    direct_request_description: cleanText(payload.direct_request_description),
    direct_request_extra_notes: cleanText(payload.direct_request_extra_notes),
    page_path: cleanText(payload.page_path, 500),
    referrer: cleanText(payload.referrer, 1000),
    user_agent: cleanText(payload.user_agent, 500),
    origin: cleanText(origin, 500),
    ip_hash: hashIp(getClientIp(event)),
    utm_source: cleanText(payload.utm_source, 200),
    utm_medium: cleanText(payload.utm_medium, 200),
    utm_campaign: cleanText(payload.utm_campaign, 200),
    utm_term: cleanText(payload.utm_term, 200),
    utm_content: cleanText(payload.utm_content, 200),
    posthog_distinct_id: cleanText(payload.posthog_distinct_id, 200),
    posthog_session_id: cleanText(payload.posthog_session_id, 200),
    form_variant: cleanText(payload.form_variant, 120),
    booking_url: cleanText(payload.booking_url || bookingUrl, 1000),
    is_test: bool(payload.is_test),
    diagnostic_version: cleanText(payload.diagnostic_version, 80),
    scoring_version: cleanText(payload.scoring_version, 80),
    lead_key: cleanText(payload.lead_key || buildLeadKey(payload), 260),
    booking_email: cleanEmail(payload.booking_email || payload.email),
    calendar_event_id: cleanText(payload.calendar_event_id, 260),
    booking_context: cleanJsonObject(payload.booking_context),
    path_scores: cleanJsonObject(payload.path_scores),
    score_breakdown: cleanJsonObject(payload.score_breakdown),
    recommendation_output: cleanJsonObject(payload.recommendation_output),
    business_description: cleanText(payload.business_description || payload.company_description),
    improvement_target: cleanText(payload.improvement_target || payload.desired_outcome),
    workflow_slowdown: cleanText(payload.workflow_slowdown || payload.time_drain),
    business_impact: cleanText(payload.business_impact),
    systems_touched: cleanText(payload.systems_touched),
    raw_payload: payload.raw_payload && typeof payload.raw_payload === "object" ? payload.raw_payload : {},
  };
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Submit the request again with the required details.";
  }

  const source = cleanText(payload.source, 80);
  if (!ALLOWED_SOURCES.has(source)) return "Unknown request type.";

  if (source === "remedys_direct_call") {
    const bookingEmail = cleanEmail(payload.booking_email);
    const calendarEventId = cleanText(payload.calendar_event_id, 260);
    if (bookingEmail && !isValidEmail(bookingEmail)) return "A valid booking email is required.";
    if (!bookingEmail && !calendarEventId) {
      return "A booking email or calendar event id is required.";
    }
    return "";
  }

  const email = cleanEmail(payload.email);
  const fullName = cleanText(payload.full_name, 160);
  const company = cleanText(payload.company, 180);

  if (!fullName) return "Full name is required.";
  if (!company) return "Company name is required.";
  if (!isValidEmail(email)) return "A valid work email is required.";

  if (source === "remedys_direct_request") {
    const directDescription = cleanText(payload.direct_request_description || payload.company_description);
    const directPath = cleanText(payload.direct_request_path, 160);
    if (!directDescription) return "Tell us what you want help with.";
    if (directPath && !ALLOWED_DIRECT_REQUEST_PATHS.has(directPath)) {
      return "Choose the closest path or select Not sure yet / Help me choose the right path.";
    }
  }

  if (source === "remedys_ai_diagnostic") {
    const hasDiagnosticAnswer = [
      payload.business_description,
      payload.company_description,
      payload.improvement_target,
      payload.desired_outcome,
      payload.workflow_slowdown,
      payload.time_drain,
      payload.affected_group,
      payload.business_impact,
      payload.systems_touched,
      payload.ai_usage,
    ].some((value) => cleanText(value, 20).length > 0);
    if (!hasDiagnosticAnswer) return "Answer at least one diagnostic question.";
  }

  return "";
}

async function insertIntoSupabase(row) {
  const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const error = new Error("Server intake is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/remedys_diagnostic_submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify(row),
  });

  const responseText = await response.text();
  if (!response.ok) {
    const error = new Error(responseText || "Supabase insert failed.");
    error.statusCode = 502;
    throw error;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    return [];
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderLeadHtml(row, bookingUrl) {
  const heading =
    row.source === "remedys_direct_request"
      ? "New Remedys direct request"
      : "New Remedys diagnostic submission";
  const lines = [
    ["Name", row.full_name],
    ["Email", row.email],
    ["Company", row.company],
    ["Source", row.source],
    ["Score", row.readiness_score],
    ["Recommendation", row.recommendation_label],
    ["Diagnostic version", row.diagnostic_version],
    ["Scoring version", row.scoring_version],
    ["Lead key", row.lead_key],
    ["Primary path scores", JSON.stringify(row.path_scores || {})],
    ["Recommendation output", JSON.stringify(row.recommendation_output || {})],
    ["Path", row.direct_request_path || row.prefill_service],
    ["Company", row.company_description],
    ["Time drain", row.time_drain],
    ["Desired outcome", row.desired_outcome],
    ["Workflow slowdown", row.workflow_slowdown],
    ["Business impact", row.business_impact],
    ["Systems touched", row.systems_touched],
    ["Direct request", row.direct_request_description],
    ["Extra notes", row.direct_request_extra_notes],
    ["Form variant", row.form_variant],
    ["PostHog distinct ID", row.posthog_distinct_id],
    ["PostHog session ID", row.posthog_session_id],
    ["Booking URL", row.booking_url],
    ["Test submission", row.is_test ? "Yes" : ""],
    ["Page", row.page_path],
    ["Referrer", row.referrer],
  ];

  return `
    <h2>${escapeHtml(heading)}</h2>
    <p><strong>Booking URL:</strong> <a href="${escapeHtml(bookingUrl)}">${escapeHtml(bookingUrl)}</a></p>
    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;">
      ${lines
        .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
        .map(
          ([label, value]) =>
            `<tr><td style="border:1px solid #ddd;font-weight:bold;width:180px;">${escapeHtml(label)}</td><td style="border:1px solid #ddd;">${escapeHtml(value)}</td></tr>`
        )
        .join("")}
    </table>
  `;
}

async function sendResendEmail(row, bookingUrl) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const notifyTo = process.env.LEAD_NOTIFY_TO;

  if (!apiKey || !from || !notifyTo) return;

  const subjectPrefix = row.source === "remedys_direct_request" ? "Direct request" : "Diagnostic";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: notifyTo.split(",").map((email) => email.trim()).filter(Boolean),
      reply_to: row.email,
      subject: `${subjectPrefix}: ${row.company || row.email}`,
      html: renderLeadHtml(row, bookingUrl),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Resend notification failed.");
  }

  if (process.env.SEND_LEAD_CONFIRMATION === "true") {
    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: row.email,
        subject: "We received your Remedys request",
        html: `<p>Thanks, ${escapeHtml(row.full_name)}. We received your request and will review it for the clearest next step.</p>`,
      }),
    });

    if (!confirmationResponse.ok) {
      const body = await confirmationResponse.text();
      throw new Error(body || "Resend confirmation failed.");
    }
  }
}

exports.handler = async function handler(event) {
  const origin = getHeader(event.headers, "origin");

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(origin), body: "" };
  }

  if (origin && !isAllowedOrigin(origin)) {
    return json(403, { ok: false, error: "Origin not allowed." }, origin);
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed." }, origin);
  }

  const contentType = getHeader(event.headers, "content-type");
  if (!contentType.toLowerCase().includes("application/json")) {
    return json(415, { ok: false, error: "Content-Type must be application/json." }, origin);
  }

  if (Buffer.byteLength(event.body || "", "utf8") > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: "Request is too large." }, origin);
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { ok: false, error: "Invalid JSON." }, origin);
  }

  if (cleanText(payload.website, 200)) {
    return json(200, { ok: true }, origin);
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return json(400, { ok: false, error: validationError }, origin);
  }

  const submissionId = crypto.randomUUID();
  const row = buildRow(payload, event, submissionId);
  const bookingUrl = process.env.INTRO_CALL_BOOKING_URL || DEFAULT_BOOKING_URL;

  try {
    await insertIntoSupabase(row);
  } catch (error) {
    console.error("Remedys intake insert failed", error.message);
    return json(error.statusCode || 500, { ok: false, error: "We could not store this request yet." }, origin);
  }

  try {
    await sendResendEmail(row, bookingUrl);
  } catch (error) {
    console.error("Remedys intake notification failed", error.message);
  }

  return json(
    200,
    {
      ok: true,
      id: submissionId,
      canBook: Number(row.readiness_score || 0) >= 68,
      bookingUrl,
    },
    origin
  );
};
