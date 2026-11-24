/* Task Tandav – PubScale Offerwall Coins (Cloudflare Worker)
   Settings (Cloudflare → Worker → Settings):
     Variable (Secret):  PUBSCALE_SECRET   = PubScale की Secret Key
     KV binding:         COINS             = एक KV namespace
   PubScale में Callback URL:  https://<आपका-worker>.workers.dev/cb?user_id={user_id}&value={value}&token={token}&signature={signature}
*/
const PROJECT = 'task-tandav';
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const reply = (body, status = 200, extra = {}) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': typeof body === 'string' ? 'text/plain' : 'application/json', ...extra } });

const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
async function md5hex(s) { return hex(await crypto.subtle.digest('MD5', new TextEncoder().encode(s))); }
const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), c => c.charCodeAt(0));

export async function verifyJwt(token) {
  const p = (token || '').split('.'); if (p.length !== 3) throw new Error('bad token');
  const head = JSON.parse(new TextDecoder().decode(b64u(p[0]))), pay = JSON.parse(new TextDecoder().decode(b64u(p[1])));
  if (head.alg !== 'RS256') throw new Error('alg');
  const jwks = await (await fetch(JWKS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } })).json();
  const jwk = (jwks.keys || []).find(k => k.kid === head.kid); if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(p[2]), new TextEncoder().encode(p[0] + '.' + p[1]));
  const now = Math.floor(Date.now() / 1000);
  if (!ok || pay.aud !== PROJECT || pay.iss !== 'https://securetoken.google.com/' + PROJECT || !pay.sub || pay.exp < now) throw new Error('invalid');
  return pay.sub;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), path = url.pathname;
    if (req.method === 'OPTIONS') return reply('', 204);

    if (path === '/cb') {   // PubScale callback
      const uid = url.searchParams.get('user_id') || '', value = url.searchParams.get('value') || '', token = url.searchParams.get('token') || '', sig = (url.searchParams.get('signature') || '').toLowerCase();
      if (!uid || !token || !sig || !(Number(value) > 0)) return reply('bad request', 400);
      const mine = await md5hex(`${env.PUBSCALE_SECRET}.${uid}.${Math.trunc(Number(value))}.${token}`);
      if (mine !== sig) return reply('invalid signature', 403);
      if (await env.COINS.get('t:' + token)) return reply('OK');           // दोबारा आया हुआ callback
      await env.COINS.put('c:' + uid + ':' + token, JSON.stringify({ v: Math.trunc(Number(value)), at: Date.now() }));
      await env.COINS.put('t:' + token, '1', { expirationTtl: 60 * 60 * 24 * 90 });
      return reply('OK');
    }

    if (path === '/pending' || path === '/ack') {   // ऐप से: यूज़र के Firebase token के साथ
      let uid; try { uid = await verifyJwt((req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')); } catch (e) { return reply('unauthorized', 401); }
      if (path === '/pending') {
        const list = await env.COINS.list({ prefix: 'c:' + uid + ':' }), out = [];
        for (const k of list.keys) { const v = await env.COINS.get(k.name); if (v) out.push({ token: k.name.split(':').slice(2).join(':'), value: JSON.parse(v).v }); }
        return reply({ items: out });
      }
      const body = await req.json().catch(() => ({}));
      for (const t of (body.tokens || []).slice(0, 100)) await env.COINS.delete('c:' + uid + ':' + String(t));
      return reply({ ok: true });
    }
    return reply('Task Tandav coins', 200);
  }
};
