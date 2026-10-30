import { randomUUID } from 'node:crypto';

// Netlify applies this rule at the edge, before invoking the function.
export const config = {
  path: '/api/intake',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

const MAX_BYTES = 12 * 1024;
const SERVICES = new Set(['', 'AI consulting', 'Workflow automation', 'AI engineering', 'Team enablement']);
const FIELDS = new Set(['full_name', 'email', 'company', 'service', 'description', 'website']);
const limits = { full_name: 160, email: 254, company: 180, service: 80, description: 4000, website: 200 };
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (code, body) => new Response(JSON.stringify(body), { status: code, headers });
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function allowedOrigin(origin, request, context) {
  const allowed = new Set(['https://remedys.ai', 'https://www.remedys.ai']);
  // Runtime deploy identity is supplied by Netlify, never by the submitted payload.
  if (context.deploy?.context === 'deploy-preview' && /^[a-f0-9]{24}$/.test(context.deploy.id) && context.site?.name === 'remedys-ai') {
    allowed.add('https://' + context.deploy.id + '--remedys-ai.netlify.app');
  }
  if (process.env.NETLIFY_DEV === 'true') {
    const url = new URL(request.url);
    if (['localhost', '127.0.0.1'].includes(url.hostname)) allowed.add(url.origin);
  }
  return allowed.has(origin);
}

async function readLimited(request) {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) { await reader.cancel(); throw new RangeError('body'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function intake(request, context = {}) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'Use the inquiry form to send a request.' });
  if (!allowedOrigin(request.headers.get('origin'), request, context)) return json(403, { ok: false, error: 'Origin not allowed.' });
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return json(415, { ok: false, error: 'Use the inquiry form or email hello@remedys.ai.' });
  let payload;
  try { payload = JSON.parse(await readLimited(request)); }
  catch (error) { return json(error instanceof RangeError ? 413 : 400, { ok: false, error: 'Invalid request.' }); }
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') return json(400, { ok: false, error: 'Invalid request.' });
  for (const [key, value] of Object.entries(payload)) {
    if (!FIELDS.has(key) || typeof value !== 'string' || value.length > limits[key] || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) return json(400, { ok: false, error: 'Check the inquiry fields and try again.' });
  }
  if (payload.website?.trim()) return json(200, { ok: true });
  const name = payload.full_name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const company = payload.company?.trim();
  const description = payload.description?.trim();
  const service = payload.service || '';
  if (!name || !company || !description || description.length < 10 || !email || !/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(email) || !SERVICES.has(service) || /[\r\n]/.test(name + company)) return json(400, { ok: false, error: 'Please provide your name, email, organization, and a short description.' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return json(503, { ok: false, error: 'Please email hello@remedys.ai while the inquiry form is unavailable.' });
  const id = randomUUID();
  const row = {
    source: 'remedys_direct_request', submission_id: id,
    full_name: name, email, company,
    direct_request_path: service || 'Not sure yet / Help me choose the right path.',
    direct_request_description: description,
    newsletter_opt_in: false, page_path: '/get-started/',
    form_variant: 'direct-inquiry-2026-10', origin: request.headers.get('origin'),
    is_test: !(context.deploy?.context === 'production' && context.deploy?.published),
  };
  try {
    const response = await fetch(new URL('/rest/v1/remedys_diagnostic_submissions', supabaseUrl), {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: key, Authorization: 'Bearer ' + key, Prefer: 'return=minimal' },
      body: JSON.stringify(row), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('storage');
  } catch {
    // Provider response bodies and inquiry content must never enter logs or responses.
    console.error('Remedys inquiry storage unavailable');
    return json(502, { ok: false, error: 'We could not confirm delivery. Please email hello@remedys.ai.' });
  }

  // Only the configured team can receive an email. Never send to submitted addresses.
  const { RESEND_API_KEY, RESEND_FROM, LEAD_NOTIFY_TO } = process.env;
  if (context.deploy?.context === 'production' && context.deploy?.published && RESEND_API_KEY && RESEND_FROM && LEAD_NOTIFY_TO) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': 'inquiry/' + id },
        body: JSON.stringify({ from: RESEND_FROM, to: LEAD_NOTIFY_TO.split(',').map(v => v.trim()).filter(Boolean), reply_to: email,
          subject: 'Remedys inquiry: ' + company,
          html: '<h1>New Remedys inquiry</h1>' + [['Name',name],['Email',email],['Organization',company],['Service',service || 'Help choosing'],['Description',description],['Reference',id]].map(([label,value]) => '<p><strong>' + label + '</strong><br>' + escape(value).replace(/\n/g, '<br>') + '</p>').join(''),
        }), signal: AbortSignal.timeout(7000),
      });
      if (!response.ok) throw new Error('notification');
    } catch { console.error('Remedys inquiry stored; team notification unavailable'); }
  }
  return json(200, { ok: true, id });
}
