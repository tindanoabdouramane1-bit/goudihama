/**
 * ASG-SARL (Agence de Sécurité Goudihama) — Worker Cloudflare Pages (mode avancé)
 * Compatible glisser-déposer dans le tableau de bord ET Wrangler.
 *
 * Liaison obligatoire : espace KV nommé « ASG_KV »
 *   (Pages > projet > Paramètres > Liaisons > Espace de noms KV)
 *
 * Identifiants par défaut de l'administration (modifiables depuis l'admin) :
 *   identifiant : asggoudihama
 *   mot de passe : défini à la livraison (seule son empreinte figure ici)
 */

const DEFAULT_USER_SHA256 = '7a68717faf9483b60ea2b9c0ba7dab3ebce20cd146962bb080f49a1938da9bf3';
const DEFAULT_PASS_SHA256 = '2c24ebe0e7e84f4ce0722df36b15ff43c14ba1d93f58431b7998ea17d94395c1';

const SESSION_HOURS = 12;
const MAX_FAILS = 8;            // essais ratés autorisés…
const FAIL_WINDOW = 15 * 60;    // …par tranche de 15 minutes et par adresse IP
const MAX_SITE_BYTES = 5 * 1024 * 1024;
const MAX_IMG_BYTES = 4 * 1024 * 1024;
const MAX_DOC_BYTES = 10 * 1024 * 1024;

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
const fail = (msg, status = 400) => json({ error: msg }, status);
const enc = new TextEncoder();

/* ---------- outils crypto ---------- */
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const b64u = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
async function sha256(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
function safeEqual(a, b) {
  a = String(a); b = String(b);
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
async function pbkdf2(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = Uint8Array.from(saltHex.match(/../g).map(h => parseInt(h, 16)));
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256));
}
const randHex = n => hex(crypto.getRandomValues(new Uint8Array(n)));

async function getSecret(kv) {
  let s = await kv.get('secret');
  if (!s) { s = randHex(32); await kv.put('secret', s); }
  return s;
}
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data))));
}
async function makeToken(kv, user, version) {
  const payload = b64u(enc.encode(JSON.stringify({ u: user, v: version, exp: Date.now() + SESSION_HOURS * 3600e3 })));
  return payload + '.' + await hmac(await getSecret(kv), payload);
}
async function checkToken(kv, request) {
  const h = request.headers.get('Authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  if (!safeEqual(sig, await hmac(await getSecret(kv), payload))) return null;
  let data; try { data = JSON.parse(new TextDecoder().decode(unb64u(payload))); } catch { return null; }
  if (!data.exp || data.exp < Date.now()) return null;
  const auth = await kv.get('auth', 'json');
  if ((auth ? auth.version : 0) !== data.v) return null; // mot de passe changé → sessions révoquées
  return data;
}
async function verifyCredentials(kv, user, password) {
  const auth = await kv.get('auth', 'json');
  if (auth) {
    const okUser = safeEqual(String(user).trim().toLowerCase(), auth.user);
    const okPass = safeEqual(await pbkdf2(String(password), auth.salt), auth.hash);
    return okUser && okPass ? { user: auth.user, version: auth.version } : null;
  }
  const okUser = safeEqual(await sha256(String(user).trim().toLowerCase()), DEFAULT_USER_SHA256);
  const okPass = safeEqual(await sha256(String(password)), DEFAULT_PASS_SHA256);
  return okUser && okPass ? { user: 'asggoudihama', version: 0 } : null;
}

/* ---------- divers ---------- */
async function readJson(request, max) {
  const text = await request.text();
  if (text.length > max) throw Object.assign(new Error('Données trop volumineuses.'), { status: 413 });
  try { return JSON.parse(text || '{}'); } catch { throw Object.assign(new Error('Requête invalide.'), { status: 400 }); }
}
async function listAll(kv, prefix) {
  const out = []; let cursor;
  do { const r = await kv.list({ prefix, cursor }); out.push(...r.keys); cursor = r.list_complete ? null : r.cursor; } while (cursor);
  return out;
}
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const ipOf = req => req.headers.get('CF-Connecting-IP') || 'local';


/* ---------- Notifications push (Web Push : RFC 8291 + VAPID RFC 8292), sans bibliothèque ---------- */
// PUSH-LIB-START
const pb64 = {
  enc: (buf) => { const b = new Uint8Array(buf); let s = ''; for (const x of b) s += String.fromCharCode(x); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec: (str) => { str = String(str).replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const s = atob(str); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; },
};
const concatBytes = (...a) => { const out = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let o = 0; for (const x of a) { out.set(x, o); o += x.length; } return out; };
async function hkdf(salt, ikm, info, bytes) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, bytes * 8));
}
// Chiffre un message pour un abonné (p256dh : clé publique du navigateur, auth : secret d'authentification). Corps « aes128gcm ».
async function pushEncrypt(p256dh, auth, plaintext, test) {
  const ua = pb64.dec(p256dh), authSecret = pb64.dec(auth);
  if (ua.length !== 65 || ua[0] !== 4 || authSecret.length !== 16) throw new Error('Abonnement invalide');
  let asPub, asPriv;
  if (test) { asPub = pb64.dec(test.asPublic); asPriv = await crypto.subtle.importKey('jwk', test.asJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']); }
  else {
    const kp = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    asPub = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey)); asPriv = kp.privateKey;
  }
  const uaKey = await crypto.subtle.importKey('raw', ua, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, asPriv, 256));
  const salt = test ? pb64.dec(test.salt) : crypto.getRandomValues(new Uint8Array(16));
  const te = new TextEncoder();
  const prk = await hkdf(authSecret, ecdh, concatBytes(te.encode('WebPush: info\0'), ua, asPub), 32);
  const cek = await hkdf(salt, prk, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, prk, te.encode('Content-Encoding: nonce\0'), 12);
  const data = concatBytes(plaintext, new Uint8Array([2])); // 0x02 = dernier (et seul) bloc
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, data));
  const header = concatBytes(salt, new Uint8Array([0, 0, 0x10, 0]), new Uint8Array([asPub.length]), asPub); // rs = 4096
  return concatBytes(header, cipher);
}
async function getVapid(kv) {
  let v = await kv.get('push:vapid', 'json');
  if (!v) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    v = { pub: pb64.enc(await crypto.subtle.exportKey('raw', kp.publicKey)), jwk: await crypto.subtle.exportKey('jwk', kp.privateKey) };
    await kv.put('push:vapid', JSON.stringify(v));
  }
  return v;
}
async function vapidHeader(vapid, endpoint, subject) {
  const key = await crypto.subtle.importKey('jwk', vapid.jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const te = new TextEncoder();
  const head = pb64.enc(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = pb64.enc(te.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, te.encode(head + '.' + claims));
  return 'vapid t=' + head + '.' + claims + '.' + pb64.enc(sig) + ', k=' + vapid.pub;
}
// Envoie un message ; renvoie le code HTTP du service de notification (404/410 = abonnement expiré)
async function pushSend(sub, payload, vapid, subject) {
  const body = await pushEncrypt(sub.p, sub.a, new TextEncoder().encode(JSON.stringify(payload)));
  const res = await fetch(sub.e, {
    method: 'POST',
    headers: { Authorization: await vapidHeader(vapid, sub.e, subject), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '86400', Urgency: 'normal' },
    body, signal: AbortSignal.timeout(8000),
  });
  return res.status;
}
// PUSH-LIB-END
const PUSH_PREFIX = 'push:sub:';
const PUSH_BATCH = 20; // limite de sous-requêtes par appel sur l'offre gratuite de Cloudflare
const PUSH_HOSTS = /^https:\/\/([a-z0-9-]+\.)*(googleapis\.com|push\.apple\.com|mozilla\.com|windows\.com|notify\.windows\.com|push\.services\.mozilla\.com)\//i;

/* ---------- API ---------- */
async function handleApi(request, env, url) {
  const kv = env.ASG_KV;
  if (!kv) return fail('Stockage non configuré : liez un espace KV nommé « ASG_KV » au projet Pages, puis redéployez.', 503);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const m = request.method;

  // ---- public ----
  if (path === '/site' && m === 'GET') return json({ site: await kv.get('site', 'json') });


  // ---- notifications : abonnement des visiteurs ----
  if (path === '/push/key' && m === 'GET') return json({ key: (await getVapid(kv)).pub });
  if (path === '/push/subscribe' && m === 'POST') {
    const b = await readJson(request, 3000), sub = b.subscription || {};
    const e = String(sub.endpoint || ''), k = sub.keys || {};
    let okKeys = false; try { okKeys = pb64.dec(k.p256dh).length === 65 && pb64.dec(k.auth).length === 16; } catch {}
    if (e.length > 700 || !PUSH_HOSTS.test(e) || !okKeys) return fail('Abonnement invalide.');
    const rl = 'rlp:' + ipOf(request), n = Number(await kv.get(rl)) || 0;
    if (n >= 20) return fail('Trop de tentatives. Réessayez plus tard.', 429);
    await kv.put(PUSH_PREFIX + (await sha256(e)).slice(0, 40), JSON.stringify({ e, p: k.p256dh, a: k.auth, t: Date.now() }));
    await kv.put(rl, String(n + 1), { expirationTtl: 3600 });
    return json({ ok: true });
  }
  if (path === '/push/unsubscribe' && m === 'POST') {
    const b = await readJson(request, 1500), e = String(b.endpoint || '');
    if (e && e.length <= 700) await kv.delete(PUSH_PREFIX + (await sha256(e)).slice(0, 40));
    return json({ ok: true });
  }

  if (path.startsWith('/img/') && m === 'GET') {
    const id = path.slice(5);
    if (!/^[a-f0-9]{24}$/.test(id)) return fail('Image introuvable.', 404);
    const { value, metadata } = await kv.getWithMetadata('img:' + id, 'arrayBuffer');
    if (!value) return fail('Image introuvable.', 404);
    return new Response(value, { headers: { 'Content-Type': (metadata && metadata.type) || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  }

  if (path.startsWith('/doc/') && m === 'GET') {
    const id = path.slice(5);
    if (!/^[a-f0-9]{24}$/.test(id)) return fail('Document introuvable.', 404);
    const { value, metadata } = await kv.getWithMetadata('doc:' + id, 'arrayBuffer');
    if (!value) return fail('Document introuvable.', 404);
    const name = String((metadata && metadata.name) || 'document.pdf').replace(/[^\w.\- ]+/g, '_');
    return new Response(value, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="' + name + '"', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "sandbox; default-src 'none'" } });
  }

  if (path === '/devis' && m === 'POST') {
    const b = await readJson(request, 20000);
    if (b.website) return json({ ok: true }); // piège à robots
    const rl = 'rld:' + ipOf(request), n = Number(await kv.get(rl)) || 0;
    if (n >= 10) return fail('Trop de demandes envoyées. Réessayez plus tard ou appelez-nous.', 429);
    const type = ['message', 'candidature'].includes(b.type) ? b.type : 'devis';
    const d = {
      type, entreprise: clip(b.entreprise, 200), contact: clip(b.contact, 200), email: clip(b.email, 200),
      telephone: clip(b.telephone, 50), secteur: clip(b.secteur, 100), besoin: clip(b.besoin, 100),
      ville: clip(b.ville, 150), typeSite: clip(b.typeSite, 100), nbAgents: clip(b.nbAgents, 50), horaires: clip(b.horaires, 100),
      debut: clip(b.debut, 20), duree: clip(b.duree, 100), objet: clip(b.objet, 100), message: clip(b.message, 4000),
      poste: clip(b.poste, 150), experience: clip(b.experience, 60),
      description: clip(b.description, 4000), date: new Date().toISOString(), statut: 'nouveau'
    };
    if (type === 'devis' && (!d.entreprise || !d.contact || !d.email || !d.telephone || !d.besoin)) return fail('Champs obligatoires manquants.');
    if (type === 'message' && (!d.contact || !d.telephone || !d.message)) return fail('Champs obligatoires manquants.');
    if (type === 'candidature' && (!d.contact || !d.telephone || !d.poste)) return fail('Champs obligatoires manquants.');
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return fail('Adresse email invalide.');
    const now = new Date(), ymd = now.toISOString().slice(2, 10).replace(/-/g, '');
    d.reference = ({ devis: 'DEV-', message: 'MSG-', candidature: 'CAN-' })[type] + ymd + '-' + randHex(2).toUpperCase();
    await kv.put('devis:' + Date.now() + ':' + randHex(3), JSON.stringify(d));
    await kv.put(rl, String(n + 1), { expirationTtl: 3600 });
    return json({ ok: true, reference: d.reference });
  }

  // ---- connexion admin ----
  if (path === '/admin/login' && m === 'POST') {
    const rl = 'rl:' + ipOf(request), fails = Number(await kv.get(rl)) || 0;
    if (fails >= MAX_FAILS) return fail('Trop de tentatives. Réessayez dans 15 minutes.', 429);
    const b = await readJson(request, 2000);
    const ok = await verifyCredentials(kv, b.username || '', b.password || '');
    if (!ok) {
      await kv.put(rl, String(fails + 1), { expirationTtl: FAIL_WINDOW });
      await new Promise(r => setTimeout(r, 500));
      return fail('Identifiant ou mot de passe incorrect.', 401);
    }
    if (fails) await kv.delete(rl);
    return json({ token: await makeToken(kv, ok.user, ok.version), user: ok.user, expiresIn: SESSION_HOURS * 3600 });
  }

  // ---- routes protégées ----
  if (!path.startsWith('/admin/')) return fail('Route inconnue.', 404);
  const session = await checkToken(kv, request);
  if (!session) return fail('Session expirée. Reconnectez-vous.', 401);

  if (path === '/admin/me' && m === 'GET') return json({ user: session.u });

  if (path === '/admin/site' && m === 'GET') return json({ site: await kv.get('site', 'json') });

  if (path === '/admin/site' && m === 'PUT') {
    const b = await readJson(request, MAX_SITE_BYTES);
    if (!b.site || typeof b.site !== 'object' || Array.isArray(b.site)) return fail('Contenu invalide.');
    const text = JSON.stringify(b.site);
    await kv.put('site', text);
    // Nettoyage des images qui ne sont plus utilisées (après 1 h, pour ne pas toucher un envoi en cours)
    const imgs = await listAll(kv, 'img:');
    const old = imgs.filter(k => !text.includes('/api/img/' + k.name.slice(4)) && (!k.metadata || Date.now() - (k.metadata.ts || 0) > 3600e3));
    const docs = await listAll(kv, 'doc:');
    const oldDocs = docs.filter(k => !text.includes('/api/doc/' + k.name.slice(4)) && (!k.metadata || Date.now() - (k.metadata.ts || 0) > 3600e3));
    await Promise.all(old.concat(oldDocs).map(k => kv.delete(k.name)));
    return json({ ok: true, savedAt: new Date().toISOString(), imagesSupprimees: old.length, documentsSupprimes: oldDocs.length });
  }

  if (path === '/admin/upload' && m === 'POST') {
    const b = await readJson(request, Math.ceil(MAX_IMG_BYTES * 1.4));
    const mm = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(b.dataUrl || '');
    if (!mm) return fail('Format d’image non accepté (JPEG, PNG, WebP ou GIF).');
    const bytes = Uint8Array.from(atob(mm[2]), c => c.charCodeAt(0));
    if (bytes.length > MAX_IMG_BYTES) return fail('Image trop lourde (4 Mo maximum).', 413);
    const id = randHex(12);
    await kv.put('img:' + id, bytes, { metadata: { type: mm[1], ts: Date.now(), size: bytes.length } });
    return json({ url: '/api/img/' + id });
  }

  if (path === '/admin/upload-doc' && m === 'POST') {
    const len = Number(request.headers.get('Content-Length') || 0);
    if (len > MAX_DOC_BYTES) return fail('Document trop lourd (10 Mo maximum).', 413);
    const buf = await request.arrayBuffer();
    if (buf.byteLength > MAX_DOC_BYTES) return fail('Document trop lourd (10 Mo maximum).', 413);
    const head = new Uint8Array(buf.slice(0, 5));
    if (String.fromCharCode(...head) !== '%PDF-') return fail('Seuls les fichiers PDF sont acceptés.');
    const name = clip(url.searchParams.get('name') || 'document.pdf', 120);
    const id = randHex(12);
    await kv.put('doc:' + id, buf, { metadata: { name, ts: Date.now(), size: buf.byteLength } });
    return json({ url: '/api/doc/' + id, name });
  }

  if (path === '/admin/devis' && m === 'GET') {
    const keys = await listAll(kv, 'devis:');
    const vals = await Promise.all(keys.map(k => kv.get(k.name, 'json')));
    const devis = keys.map((k, i) => ({ id: k.name, statut: 'nouveau', ...(vals[i] || {}) }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return json({ devis });
  }

  if (path.startsWith('/admin/devis/')) {
    const id = decodeURIComponent(path.slice(13));
    if (!/^devis:\d+:[a-f0-9]+$/.test(id)) return fail('Identifiant invalide.');
    if (m === 'DELETE') { await kv.delete(id); return json({ ok: true }); }
    if (m === 'PATCH') {
      const b = await readJson(request, 2000);
      const d = await kv.get(id, 'json');
      if (!d) return fail('Demande introuvable.', 404);
      d.statut = ['nouveau', 'en cours', 'traité'].includes(b.statut) ? b.statut : d.statut;
      if (typeof b.note === 'string') d.note = clip(b.note, 2000);
      await kv.put(id, JSON.stringify(d));
      return json({ ok: true });
    }
  }


  if (path === '/admin/push' && m === 'GET') {
    const keys = await listAll(kv, PUSH_PREFIX);
    return json({ count: keys.length });
  }
  if (path === '/admin/push/send' && m === 'POST') {
    const b = await readJson(request, 3000);
    const title = clip(b.title, 80), text = clip(b.body, 200);
    let link = clip(b.url, 200) || '/';
    if (!title || !text) return fail('Le titre et le message sont obligatoires.');
    if (!/^\/[^\s]*$/.test(link) || link.startsWith('//')) link = '/';
    const vapid = await getVapid(kv);
    const subject = 'mailto:' + (((await kv.get('site', 'json')) || {}).contact || {}).email || 'mailto:contact@asg-goudihama.com';
    const page = await kv.list({ prefix: PUSH_PREFIX, limit: PUSH_BATCH, cursor: b.cursor || undefined });
    const payload = { title, body: text, url: link, tag: 'asg-' + Date.now() };
    let sent = 0, removed = 0, failed = 0;
    await Promise.all(page.keys.map(async (k) => {
      try {
        const sub = await kv.get(k.name, 'json');
        if (!sub) return;
        const st = await pushSend(sub, payload, vapid, subject);
        if (st >= 200 && st < 300) sent++;
        else if (st === 404 || st === 410 || st === 401 || st === 403) { await kv.delete(k.name); removed++; }
        else failed++;
      } catch { failed++; }
    }));
    return json({ sent, removed, failed, next: page.list_complete ? null : page.cursor });
  }

  if (path === '/admin/account' && m === 'POST') {
    const b = await readJson(request, 2000);
    if (!await verifyCredentials(kv, session.u, b.current || '')) return fail('Mot de passe actuel incorrect.', 403);
    const user = clip(b.username || session.u, 60).toLowerCase();
    const pwd = String(b.password || '');
    if (!/^[a-z0-9._-]{4,60}$/.test(user)) return fail('Identifiant : 4 caractères minimum (lettres, chiffres, . _ -).');
    if (pwd.length < 10) return fail('Le nouveau mot de passe doit faire au moins 10 caractères.');
    const old = await kv.get('auth', 'json');
    const salt = randHex(16);
    const auth = { user, salt, hash: await pbkdf2(pwd, salt), version: ((old && old.version) || 0) + 1, updatedAt: new Date().toISOString() };
    await kv.put('auth', JSON.stringify(auth));
    return json({ ok: true, token: await makeToken(kv, auth.user, auth.version), user: auth.user });
  }

  return fail('Route inconnue.', 404);
}

/* ---------- pages publiques : vraies adresses, balises de partage, référencement ---------- */
const PAGE_SLUGS = ['', 'a-propos', 'services', 'moyens', 'methode', 'tarifs', 'references', 'actualites', 'mediatheque', 'presse', 'carrieres', 'faq', 'devis', 'contact'];
const HASH_TO_PATH = { accueil: '/', apropos: '/a-propos', services: '/services', moyens: '/moyens', methode: '/methode', tarifs: '/tarifs', references: '/references', actualites: '/actualites', mediatheque: '/mediatheque', presse: '/presse', recrutement: '/carrieres', faq: '/faq', devis: '/devis', contact: '/contact' };
const SITE_NAME = 'ASG-SARL – Agence de Sécurité Goudihama';
const DEF_DESC = "ASG-SARL, Agence de Sécurité Goudihama : gardiennage, sécurité électronique, cynophile, protection rapprochée, escorte, audit et formation à Ouagadougou et au Burkina Faso. Disponible 24h/24 et 7j/7.";
const PAGE_META = {
  '': ['ASG-SARL – Agence de Sécurité Goudihama | Sécurité privée au Burkina Faso', DEF_DESC],
  'a-propos': ['À propos d’ASG-SARL', 'Qui sommes-nous : mot du Directeur Général, vision, mission, valeurs et cadre légal d’ASG-SARL, Agence de Sécurité Goudihama.'],
  services: ['Nos services de sécurité', 'Gardiennage statique, sécurité électronique, sécurité cynophile, protection rapprochée, escorte, audit, formation et vente de matériel de sécurité.'],
  moyens: ['Nos moyens et équipements', 'Véhicules d’intervention, PC radio 24h/24, réseau VHF/UHF de 45 km et dotation complète des agents ASG.'],
  methode: ['Organisation & méthode', 'Organisation, recrutement, formation sur 12 modules homologués, contrôle programmé et inopiné : la méthode ASG-SARL.'],
  tarifs: ['Nos tarifs', 'Tarifs indicatifs ASG-SARL : vigile non armé, vigile armé, protection rapprochée, maître-chien, audit, vidéosurveillance, escorte.'],
  references: ['Ils nous font confiance', 'Références et réalisations d’ASG-SARL.'],
  actualites: ['Actualités', 'Les dernières actualités et communiqués d’ASG-SARL.'],
  mediatheque: ['Médiathèque', 'Photos, vidéos et documents d’ASG-SARL : équipes, formations, équipements et événements.'],
  presse: ['Espace presse', 'Espace presse d’ASG-SARL : présentation officielle, logos, photos institutionnelles et communiqués.'],
  carrieres: ['Carrières – Rejoignez ASG-SARL', 'Offres d’emploi et candidature en ligne chez ASG-SARL, Agence de Sécurité Goudihama.'],
  faq: ['Questions fréquentes', 'Réponses aux questions fréquentes sur les services d’ASG-SARL.'],
  devis: ['Demande de devis gratuit', 'Demandez gratuitement un devis de sécurité à ASG-SARL : visite de site offerte, réponse sous 48h.'],
  contact: ['Contact', 'Contactez ASG-SARL : (+226) 76 52 52 94, WhatsApp, email et formulaire. Nioko 2, Secteur 41, Ouagadougou.']
};
const slugify = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'page';
const todayIso = () => new Date().toISOString().slice(0, 10);
const isLive = x => !!x && x.actif !== false && (!x.datePub || x.datePub <= todayIso());
const escAttr = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MOIS = { janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12 };
function frDate(s) {
  const m = slugify(s).match(/^(\d{1,2})-([a-z]+)-(\d{4})$/);
  if (!m || !MOIS[m[2]]) return null;
  return m[3] + '-' + String(MOIS[m[2]]).padStart(2, '0') + '-' + m[1].padStart(2, '0');
}

async function getSite(env) { try { return env.ASG_KV ? await env.ASG_KV.get('site', 'json') : null; } catch { return null; } }

function resolvePage(pathname, site) {
  const seg = pathname.replace(/^\/+|\/+$/g, '').split('/').map(x => { try { return decodeURIComponent(x); } catch { return x; } });
  if (seg.length > 2 || !PAGE_SLUGS.includes(seg[0])) return null;
  const [title, desc] = PAGE_META[seg[0]];
  const meta = { title: seg[0] ? title + ' – ' + SITE_NAME : title, desc, image: null, type: 'website', path: '/' + seg[0] };
  if (seg.length === 1) return meta;
  if (!site) return { ...meta, path: pathname.replace(/\/+$/, '') }; // contenu pas encore publié : la page s'affiche avec le contenu par défaut
  const S = site;
  if (seg[0] === 'services') {
    const s = (S.services || []).find(x => slugify(x.title) === seg[1]);
    if (!s) return null;
    return { ...meta, title: s.title + ' – ' + SITE_NAME, desc: s.description || desc, image: s.image || null, path: '/services/' + seg[1] };
  }
  if (seg[0] === 'actualites') {
    const a = (S.actualites || []).find(x => isLive(x) && (x.slug || slugify(x.title)) === seg[1]);
    if (!a) return null;
    return { ...meta, title: a.title + ' – ' + SITE_NAME, desc: a.description || desc, image: a.image || (a.galerie || [])[0] || null, type: 'article', article: a, path: '/actualites/' + seg[1] };
  }
  if (seg[0] === 'mediatheque') {
    const md = (S.mediatheque || []).find(x => isLive(x) && x.id === seg[1]);
    if (!md) return meta;
    const yt = String(md.video || md.link || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return { ...meta, title: md.title + ' – Médiathèque ' + SITE_NAME, desc: md.description || desc, image: md.image || (md.photos || [])[0] || (yt ? 'https://i.ytimg.com/vi/' + yt[1] + '/hqdefault.jpg' : null), path: '/mediatheque/' + seg[1] };
  }
  return null;
}

function absUrl(origin, u) { u = String(u || ''); if (!u) return ''; if (/^https?:\/\//.test(u)) return u; return origin + '/' + u.replace(/^\/+/, ''); }

function jsonLd(origin, site, meta) {
  const S = site || {}, C = S.contact || {}, so = S.social || {};
  const tel = String(C.phone1 || '76 52 52 94').replace(/[^0-9+]/g, '');
  const org = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': origin + '/#entreprise',
    name: SITE_NAME, alternateName: ['ASG-SARL', 'Agence de Sécurité Goudihama'],
    url: origin + '/', logo: absUrl(origin, S.logo || 'images/logo.png'), image: absUrl(origin, (S.images && S.images.hero) || 'images/og-asg.jpg'),
    description: DEF_DESC, telephone: /^\d{8}$/.test(tel) ? '+226' + tel : tel,
    address: { '@type': 'PostalAddress', streetAddress: C.address || 'Nioko 2, Secteur 41', addressLocality: 'Ouagadougou', addressCountry: 'BF' },
    areaServed: { '@type': 'Country', name: 'Burkina Faso' },
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
    sameAs: ['facebook', 'linkedin', 'youtube', 'tiktok'].map(k => so[k]).filter(Boolean)
  };
  if (C.email) org.email = C.email;
  const out = [org];
  if (meta.article) {
    const a = meta.article, d = frDate(a.date);
    const art = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: a.title.slice(0, 110), description: a.description || '', mainEntityOfPage: origin + meta.path, author: { '@id': origin + '/#entreprise' }, publisher: { '@id': origin + '/#entreprise' } };
    if (meta.image) art.image = [absUrl(origin, meta.image)];
    if (d) art.datePublished = d;
    out.push(art);
  }
  return JSON.stringify(out).replace(/</g, '\\u003c');
}

async function servePage(request, env, url) {
  const site = await getSite(env);
  let meta = resolvePage(url.pathname, site), status = 200;
  if (!meta) { meta = { title: 'Page introuvable – ' + SITE_NAME, desc: DEF_DESC, type: 'website', path: '/', notFound: true }; status = 404; }
  const origin = url.origin;
  const res = await env.ASSETS.fetch(new Request(origin + '/'));
  if (!res.ok) return res;
  const image = absUrl(origin, meta.image || (site && site.images && site.images.hero) || 'images/og-asg.jpg');
  const canonical = origin + (meta.path === '/' ? '/' : meta.path);
  const hero = site && site.images && site.images.hero ? site.images.hero : '';
  const siteJson = JSON.stringify(site).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const headExtra = [
    '<link rel="canonical" href="' + escAttr(canonical) + '">',
    '<meta property="og:type" content="' + meta.type + '">',
    '<meta property="og:title" content="' + escAttr(meta.title) + '">',
    '<meta property="og:description" content="' + escAttr(meta.desc) + '">',
    '<meta property="og:url" content="' + escAttr(canonical) + '">',
    '<meta property="og:image" content="' + escAttr(image) + '">',
    '<meta name="twitter:card" content="summary_large_image">',
    meta.path === '/' && hero ? '<link rel="preload" as="image" href="' + escAttr(absUrl(origin, hero)) + '">' : '',
    meta.notFound ? '<meta name="robots" content="noindex">' : '',
    '<script type="application/ld+json">' + jsonLd(origin, site, meta) + '</script>',
    '<script>window.ASG_SITE=' + siteJson + ';</script>'
  ].join('');
  const rewritten = new HTMLRewriter()
    .on('head', { element(e) { e.prepend('<base href="/">', { html: true }); e.append(headExtra, { html: true }); } })
    .on('title', { element(e) { e.setInnerContent(meta.title); } })
    .on('meta[name="description"]', { element(e) { e.setAttribute('content', meta.desc); } })
    .on('a[href^="#"]', { element(e) { const h = (e.getAttribute('href') || '').slice(1); if (HASH_TO_PATH[h]) e.setAttribute('href', HASH_TO_PATH[h]); } })
    .transform(res);
  const headers = new Headers(rewritten.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-cache');
  headers.delete('ETag'); headers.delete('Last-Modified'); headers.delete('Content-Length');
  return new Response(rewritten.body, { status, headers });
}

async function sitemap(env, origin) {
  const site = await getSite(env) || {};
  const urls = PAGE_SLUGS.map(s => ({ loc: origin + '/' + s }));
  (site.services || []).forEach(s => urls.push({ loc: origin + '/services/' + slugify(s.title) }));
  (site.actualites || []).filter(isLive).forEach(a => urls.push({ loc: origin + '/actualites/' + (a.slug || slugify(a.title)), lastmod: frDate(a.date) }));
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => '  <url><loc>' + escAttr(u.loc) + '</loc>' + (u.lastmod ? '<lastmod>' + u.lastmod + '</lastmod>' : '') + '</url>').join('\n') + '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.startsWith('www.')) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      try { return await handleApi(request, env, url); }
      catch (e) { return fail(e.message || 'Erreur serveur.', e.status || 500); }
    }
    if (url.pathname === '/robots.txt') return new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ' + url.origin + '/sitemap.xml\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    if (url.pathname === '/sitemap.xml') return sitemap(env, url.origin);
    const isPage = (request.method === 'GET' || request.method === 'HEAD') && !/\.[a-z0-9]{2,5}$/i.test(url.pathname) && !/^\/admin(\/|$)/.test(url.pathname);
    if (isPage || url.pathname === '/index.html') {
      if (url.pathname === '/index.html') return Response.redirect(url.origin + '/', 301);
      try { return await servePage(request, env, url); } catch (e) { return env.ASSETS.fetch(request); }
    }
    return env.ASSETS.fetch(request);
  }
};
