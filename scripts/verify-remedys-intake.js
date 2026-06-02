process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-service-role-key";
process.env.LEAD_IP_HASH_SECRET = "test-ip-hash-secret";
process.env.ALLOWED_ORIGINS = "https://remedys.ai,https://www.remedys.ai";
process.env.INTRO_CALL_BOOKING_URL = "https://calendar.app.google/WHBdTUUuqEsjfdFN6";
delete process.env.RESEND_API_KEY;
delete process.env.RESEND_FROM;
delete process.env.LEAD_NOTIFY_TO;
delete process.env.SEND_LEAD_CONFIRMATION;

const { handler } = require("../netlify/functions/remedys-intake");

const fetchCalls = [];

global.fetch = async (url, options = {}) => {
  fetchCalls.push({ url: String(url), options });

  if (String(url).includes("/rest/v1/remedys_diagnostic_submissions")) {
    return {
      ok: true,
      status: 201,
      text: async () => JSON.stringify([JSON.parse(options.body)]),
    };
  }

  if (String(url) === "https://api.resend.com/emails") {
    return {
      ok: true,
      status: 202,
      text: async () => JSON.stringify({ id: "email_test" }),
    };
  }

  throw new Error(`Unexpected fetch URL: ${url}`);
};

function resetCalls() {
  fetchCalls.length = 0;
}

function requestEvent(body, overrides = {}) {
  return {
    httpMethod: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://remedys.ai",
      "x-forwarded-for": "203.0.113.10",
      ...overrides.headers,
    },
    body: JSON.stringify(body),
    ...overrides,
  };
}

function readJson(response) {
  return response.body ? JSON.parse(response.body) : {};
}

function insertedRows() {
  return fetchCalls
    .filter((call) => call.url.includes("/rest/v1/remedys_diagnostic_submissions"))
    .map((call) => JSON.parse(call.options.body));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run(name, test) {
  try {
    resetCalls();
    await test();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

const directRequest = {
  source: "remedys_direct_request",
  full_name: "Shafan Khan",
  email: "shafan@example.com",
  company: "Remedys",
  direct_request_path: "Not sure yet / Help me choose the right path.",
  direct_request_description: "We want to understand where AI can help.",
  direct_request_extra_notes: "Route this to the right next step.",
  page_path: "/get-started/",
  referrer: "direct",
  user_agent: "test-agent",
  posthog_distinct_id: "ph_test",
  posthog_session_id: "session_test",
  form_variant: "direct_request_v1",
  booking_url: "https://calendar.app.google/WHBdTUUuqEsjfdFN6",
  is_test: true,
};

const diagnosticRequest = {
  source: "remedys_ai_diagnostic",
  full_name: "Sam Operator",
  email: "sam@example.com",
  company: "Ops Co",
  readiness_score: 82,
  recommendation_key: "automation",
  recommendation_label: "AI Automation",
  company_description: "Legal ops firm",
  time_drain: "Manual intake routing",
  affected_group: "Operations",
  ai_usage: "Light ChatGPT usage",
  desired_outcome: "Faster intake",
  form_variant: "terminal_diagnostic_v1",
};

const diagnosticV3Request = {
  source: "remedys_ai_diagnostic",
  full_name: "Maya Operator",
  email: "maya@opsco.example",
  company: "Ops Co",
  diagnostic_version: "diagnostic_v3_plain_7",
  scoring_version: "scoring_v1_plain_7",
  readiness_score: 84,
  recommendation_key: "automation",
  recommendation_label: "AI Automation",
  recommendation_band: "There looks to be a real opportunity here.",
  expected_time_to_value: "4-8 weeks",
  business_description: "A 75-person services company serving commercial property teams.",
  improvement_target: "Reduce client kickoff time in the next six weeks.",
  workflow_slowdown: "Every kickoff requires three handoffs and spreadsheet updates.",
  affected_group: "One team",
  business_impact: "Ten hours a week plus inconsistent client experience.",
  systems_touched: "HubSpot, Google Sheets, Gmail, and shared drive folders.",
  ai_usage: "A few people use tools like ChatGPT",
  path_scores: {
    consulting: 58,
    automation: 86,
    enablement: 44,
    engineering: 63,
  },
  score_breakdown: {
    business_context_clarity: 10,
    near_term_improvement_clarity: 15,
    workflow_pain_specificity: 15,
    business_impact: 16,
    scope_and_adoption_surface: 8,
    systems_and_data_readiness: 12,
    ai_maturity_fit: 8,
  },
  recommendation_output: {
    primary_recommendation: "AI Automation",
    secondary_recommendation: "AI Engineering",
    why_this_fits: "The answers point to a repeated workflow with named systems and measurable drag.",
    estimated_time_to_value: "4-8 weeks",
    next_move: "Book a Call",
  },
  lead_key: "email:maya@opsco.example",
  booking_email: "maya@opsco.example",
  form_variant: "diagnostic_v3_plain_7",
  is_test: true,
};

const directCallRequest = {
  source: "remedys_direct_call",
  full_name: "Booked Lead",
  booking_email: "booked@example.com",
  company: "Booked Co",
  calendar_event_id: "event_123",
  booking_context: {
    path: "homepage_final_cta",
    previous_source: "remedys_ai_diagnostic",
  },
  page_path: "/",
  form_variant: "direct_call_v1",
  is_test: true,
};

(async () => {
  await run("stores a valid direct request with routing context", async () => {
    const response = await handler(requestEvent(directRequest));
    const body = readJson(response);
    const rows = insertedRows();

    assert(response.statusCode === 200, `expected 200, got ${response.statusCode}`);
    assert(body.ok === true, "expected ok response");
    assert(Boolean(body.id), "expected generated submission id");
    assert(rows.length === 1, "expected one Supabase insert");
    assert(rows[0].source === "remedys_direct_request", "expected direct request source");
    assert(rows[0].email === "shafan@example.com", "expected normalized email");
    assert(
      rows[0].direct_request_path === "Not sure yet / Help me choose the right path.",
      "expected direct request path"
    );
    assert(rows[0].posthog_distinct_id === "ph_test", "expected PostHog distinct id");
    assert(rows[0].posthog_session_id === "session_test", "expected PostHog session id");
    assert(rows[0].booking_url === directRequest.booking_url, "expected booking URL");
    assert(rows[0].is_test === true, "expected test flag");
    assert(Boolean(rows[0].ip_hash), "expected hashed IP");
  });

  await run("stores a terminal diagnostic and unlocks booking for high-fit score", async () => {
    const response = await handler(requestEvent(diagnosticRequest));
    const body = readJson(response);
    const rows = insertedRows();

    assert(response.statusCode === 200, `expected 200, got ${response.statusCode}`);
    assert(body.ok === true, "expected ok response");
    assert(body.canBook === true, "expected booking to unlock");
    assert(rows.length === 1, "expected one Supabase insert");
    assert(rows[0].source === "remedys_ai_diagnostic", "expected diagnostic source");
    assert(rows[0].readiness_score === 82, "expected stored score");
    assert(rows[0].recommendation_label === "AI Automation", "expected recommendation label");
  });

  await run("stores diagnostic v3 scoring, answers, and recommendation output", async () => {
    const response = await handler(requestEvent(diagnosticV3Request));
    const body = readJson(response);
    const rows = insertedRows();

    assert(response.statusCode === 200, `expected 200, got ${response.statusCode}`);
    assert(body.ok === true, "expected ok response");
    assert(rows.length === 1, "expected one Supabase insert");
    assert(rows[0].diagnostic_version === "diagnostic_v3_plain_7", "expected diagnostic version");
    assert(rows[0].scoring_version === "scoring_v1_plain_7", "expected scoring version");
    assert(
      rows[0].business_description.includes("75-person"),
      "expected business description"
    );
    assert(rows[0].improvement_target.includes("kickoff"), "expected improvement target");
    assert(rows[0].workflow_slowdown.includes("handoffs"), "expected workflow slowdown");
    assert(rows[0].business_impact.includes("Ten hours"), "expected business impact");
    assert(rows[0].systems_touched.includes("HubSpot"), "expected systems touched");
    assert(rows[0].path_scores.automation === 86, "expected automation path score");
    assert(
      rows[0].score_breakdown.business_impact === 16,
      "expected business impact score breakdown"
    );
    assert(
      rows[0].recommendation_output.primary_recommendation === "AI Automation",
      "expected primary recommendation"
    );
    assert(rows[0].lead_key === "email:maya@opsco.example", "expected lead key");
    assert(rows[0].booking_email === "maya@opsco.example", "expected booking email");
  });

  await run("stores direct call source with booking reconciliation", async () => {
    const response = await handler(requestEvent(directCallRequest));
    const body = readJson(response);
    const rows = insertedRows();

    assert(response.statusCode === 200, `expected 200, got ${response.statusCode}`);
    assert(body.ok === true, "expected ok response");
    assert(rows.length === 1, "expected one Supabase insert");
    assert(rows[0].source === "remedys_direct_call", "expected direct call source");
    assert(rows[0].email === "booked@example.com", "expected fallback email");
    assert(rows[0].booking_email === "booked@example.com", "expected booking email");
    assert(rows[0].calendar_event_id === "event_123", "expected calendar event id");
    assert(
      rows[0].booking_context.previous_source === "remedys_ai_diagnostic",
      "expected previous source"
    );
    assert(rows[0].lead_key === "email:booked@example.com", "expected lead key");
  });

  await run("blocks disallowed browser origins before storage", async () => {
    const response = await handler(
      requestEvent(directRequest, {
        headers: { origin: "https://evil.example" },
      })
    );
    const body = readJson(response);

    assert(response.statusCode === 403, `expected 403, got ${response.statusCode}`);
    assert(body.ok === false, "expected rejected response");
    assert(fetchCalls.length === 0, "expected no outgoing fetch calls");
  });

  await run("rejects non-json bodies before storage", async () => {
    const response = await handler(
      requestEvent(directRequest, {
        headers: { "content-type": "text/plain" },
      })
    );
    const body = readJson(response);

    assert(response.statusCode === 415, `expected 415, got ${response.statusCode}`);
    assert(body.ok === false, "expected rejected response");
    assert(fetchCalls.length === 0, "expected no outgoing fetch calls");
  });

  await run("accepts honeypot submissions without storing them", async () => {
    const response = await handler(requestEvent({ ...directRequest, website: "bot-filled" }));
    const body = readJson(response);

    assert(response.statusCode === 200, `expected 200, got ${response.statusCode}`);
    assert(body.ok === true, "expected quiet ok response");
    assert(fetchCalls.length === 0, "expected no outgoing fetch calls");
  });
})();
