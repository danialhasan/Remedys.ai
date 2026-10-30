import { test } from 'node:test';
import assert from 'node:assert/strict';
import intake, { config } from '../netlify/functions/intake.mjs';

const valid = { full_name: 'Test Person', email: 'test@example.com', company: 'Example', service: '', description: 'Review the manual intake workflow.', website: '' };
const production = { deploy: { context: 'production', published: true }, site: { name: 'remedys-ai' } };
const call = (req, context = production) => intake(req, context);
function request(body = valid, options = {}) {
  const { origin = 'https://remedys.ai', contentType = 'application/json', method = 'POST', raw = false } = options;
  return new Request('https://remedys.ai/api/intake', { method, headers: { ...(origin ? { origin } : {}), 'content-type': contentType }, ...(method === 'POST' ? { body: raw ? body : JSON.stringify(body) } : {}) });
}

test('intake boundary and side effects', async t => {
  const originalFetch = globalThis.fetch;
  const environment = { ...process.env };
  const calls = [];
  let providerStatus = 201;
  process.env.SUPABASE_URL = 'https://storage.example.test';
  process.env.SUPABASE_SECRET_KEY = 'test-only-key';
  process.env.RESEND_API_KEY = 'test-only-key';
  process.env.RESEND_FROM = 'test@example.test';
  process.env.LEAD_NOTIFY_TO = 'team@example.test';
  process.env.SEND_LEAD_CONFIRMATION = 'true'; // Must have no effect in replacement.
  process.env.CONTEXT = 'production';
  process.env.NETLIFY_DEV = 'false';
  globalThis.fetch = async (url, options) => { calls.push({ url: String(url), ...options }); return new Response('', { status: providerStatus }); };
  try {
    await t.test('edge rule has one explicit route and per-IP/domain limit', () => {
      assert.equal(config.path, '/api/intake');
      assert.deepEqual(config.rateLimit, { windowLimit: 5, windowSize: 60, aggregateBy: ['ip','domain'] });
    });
    const invalid = [
      [request(valid, { origin: '' }),403], [request(valid,{origin:'https://foreign.test'}),403],
      [request(valid,{origin:'http://localhost:4173'}),403], [request(valid,{method:'GET'}),405],
      [request(valid,{contentType:'application/x-www-form-urlencoded'}),415],
      [request('x'.repeat(13000),{raw:true}),413], [request('{',{raw:true}),400],
      [request(null),400], [request([]),400], [request({...valid,email:{value:'a@b.c'}}),400],
      [request({...valid,source:'remedys_ai_diagnostic'}),400], [request({...valid,is_test:true}),400],
      [request({...valid,company:'X\r\nBcc: victim@example.com'}),400],
      [request({...valid,service:'Unapproved offer'}),400], [request({...valid,description:''}),400],
      [request({...valid,email:'bad'}),400], [request({...valid,website:'bot'}),200],
    ];
    await t.test('invalid requests and honeypot have no provider side effects', async () => {
      for (const [req,code] of invalid) assert.equal((await call(req)).status,code);
      assert.equal(calls.length,0);
    });
    await t.test('valid inquiry persists minimal fields and notifies only the configured team', async () => {
      const result=await call(request({...valid,description:'An <img src=x onerror=alert(1)> example.'}));
      assert.equal(result.status,200);
      assert.equal((await result.json()).ok,true);
      assert.equal(calls.length,2);
      const stored=JSON.parse(calls[0].body); const sent=JSON.parse(calls[1].body);
      assert.equal(stored.source,'remedys_direct_request');
      assert.equal(stored.email,valid.email);
      assert.equal(stored.newsletter_opt_in,false);
      assert.equal(stored.raw_payload,undefined);
      assert.equal(stored.is_test,false);
      assert.deepEqual(sent.to,['team@example.test']);
      assert.equal(sent.reply_to,valid.email);
      assert.ok(sent.html.includes('&lt;img'));
      assert.ok(!sent.html.includes('<img'));
      assert.ok(calls.every(c=>c.signal instanceof AbortSignal));
    });
    await t.test('storage failure returns generic error and never triggers email', async () => {
      calls.length=0;providerStatus=500;
      const response=await call(request());
      assert.equal(response.status,502);assert.equal(calls.length,1);
      assert.ok(!(await response.text()).includes('test-only-key'));
    });
    await t.test('notification failure preserves stored success', async () => {
      calls.length=0;
      globalThis.fetch=async (url,options)=>{calls.push({url:String(url),...options});return new Response('',{status:String(url).includes('resend')?500:201})};
      assert.equal((await call(request())).status,200);assert.equal(calls.length,2);
    });
    await t.test('missing server configuration fails closed before calls', async () => {
      calls.length=0;delete process.env.SUPABASE_URL;
      assert.equal((await call(request())).status,503);assert.equal(calls.length,0);
    });
    await t.test('stream byte cap aggregates multibyte chunks and cancels without side effects', async () => {
      let cancelled=false;let count=0;calls.length=0;
      const body=new ReadableStream({pull(controller){count++;controller.enqueue(new TextEncoder().encode('界'.repeat(1800)));},cancel(){cancelled=true;}});
      const req=new Request('https://remedys.ai/api/intake',{method:'POST',headers:{origin:'https://remedys.ai','content-type':'application/json'},body,duplex:'half'});
      assert.equal((await call(req)).status,413);assert.equal(cancelled,true);assert.ok(count>=3);assert.equal(calls.length,0);
    });
    await t.test('preview identity is exact and cannot notify or become production via payload', async () => {
      process.env.SUPABASE_URL='https://storage.example.test';calls.length=0;
      const preview={deploy:{context:'deploy-preview',id:'abcdefabcdefabcdefabcdef',published:false},site:{name:'remedys-ai'}};
      const origin='https://abcdefabcdefabcdefabcdef--remedys-ai.netlify.app';
      assert.equal((await call(request(valid,{origin}),preview)).status,200);
      assert.equal(calls.length,1);assert.equal(JSON.parse(calls[0].body).is_test,true);
      calls.length=0;
      assert.equal((await call(request(),{...production,deploy:{context:'production',published:false}})).status,200);
      assert.equal(calls.length,1);assert.equal(JSON.parse(calls[0].body).is_test,true);
      calls.length=0;
      assert.equal((await call(request(valid,{origin}),production)).status,403);
      assert.equal((await call(request(valid,{origin:origin+'.evil.test'}),preview)).status,403);
      assert.equal(calls.length,0);
    });
  } finally { globalThis.fetch=originalFetch; process.env=environment; }
});
