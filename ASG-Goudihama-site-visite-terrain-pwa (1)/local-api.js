/*
 * ASG-SARL — mode TEST LOCAL
 *
 * Quand vous ouvrez index.html ou admin.html en double-cliquant dessus (adresse « file:// »),
 * il n'y a pas de serveur Cloudflare. Ce fichier simule alors le serveur dans le navigateur :
 * contenu du site, administration, envoi d'images, demandes de devis, changement de mot de passe.
 * Les données sont gardées dans le stockage du navigateur (uniquement sur cet ordinateur).
 *
 * En ligne (Cloudflare), ce fichier ne fait rien : c'est le vrai serveur (_worker.js) qui répond.
 * Pour forcer le mode test sur un serveur local (ex. Live Server de VS Code), ajoutez ?local=1 à l'adresse.
 */
(function () {
    'use strict';
    var forced = /[?&]local=1\b/.test(location.search);
    try { if (forced) sessionStorage.setItem('asg_force_local', '1'); } catch (e) {}
    var stickForced = false;
    try { stickForced = sessionStorage.getItem('asg_force_local') === '1'; } catch (e) {}
    var LOCAL = !/^https?:$/.test(location.protocol) || forced || stickForced; // file://, content:// (WhatsApp, Fichiers)…
    window.ASG_LOCAL = LOCAL;
    if (!LOCAL) return;

    var KEY = 'asg_local_test_v1';
    // Empreintes SHA-256 des identifiants par défaut (les mêmes qu'en ligne)
    var DEFAULT_USER_SHA256 = '7a68717faf9483b60ea2b9c0ba7dab3ebce20cd146962bb080f49a1938da9bf3';
    var DEFAULT_PASS_SHA256 = '2c24ebe0e7e84f4ce0722df36b15ff43c14ba1d93f58431b7998ea17d94395c1';

    function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
    function save(db) {
        try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
        catch (e) { return false; }
    }
    async function sha256(s) {
        if (window.crypto && crypto.subtle) {
            var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
            return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
        }
        return null;
    }
    async function checkCreds(db, user, pass) {
        user = String(user || '').trim().toLowerCase();
        if (db.auth) return user === db.auth.user && (await sha256(pass)) === db.auth.hash;
        return (await sha256(user)) === DEFAULT_USER_SHA256 && (await sha256(pass)) === DEFAULT_PASS_SHA256;
    }
    function reply(data, status) {
        return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }
    function fail(msg, status) { return reply({ error: msg }, status || 400); }
    function body(opts) { try { return JSON.parse((opts && opts.body) || '{}'); } catch (e) { return {}; } }
    var FULL = 'Stockage local du navigateur plein (environ 5 Mo) : utilisez des images plus légères ou retirez-en. En ligne, cette limite n’existe pas.';

    async function handle(url, opts) {
        var u = new URL(url, 'http://local');
        var path = u.pathname.replace(/^\/api/, '');
        var m = ((opts && opts.method) || 'GET').toUpperCase();
        var db = load();
        var token = ((opts && opts.headers && (opts.headers.Authorization || opts.headers.authorization)) || '').replace('Bearer ', '');

        // --- public ---
        if (path === '/site' && m === 'GET') return reply({ site: db.site || null });
        if (path === '/devis' && m === 'POST') {
            var b = body(opts), type = ['message', 'candidature'].indexOf(b.type) >= 0 ? b.type : 'devis';
            if (type === 'devis' && (!b.entreprise || !b.contact || !b.email || !b.telephone || !b.besoin)) return fail('Champs obligatoires manquants.');
            if (type === 'message' && (!b.contact || !b.telephone || !b.message)) return fail('Champs obligatoires manquants.');
            if (type === 'candidature' && (!b.contact || !b.telephone || !b.poste)) return fail('Champs obligatoires manquants.');
            var ref = ({ devis: 'DEV-', message: 'MSG-', candidature: 'CAN-' })[type] + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(16).slice(2, 6).toUpperCase();
            var rec = { id: 'devis:' + Date.now() + ':' + Math.random().toString(16).slice(2, 8), date: new Date().toISOString(), statut: 'nouveau', type: type, reference: ref };
            ['entreprise', 'contact', 'email', 'telephone', 'secteur', 'besoin', 'ville', 'typeSite', 'nbAgents', 'horaires', 'debut', 'duree', 'objet', 'message', 'description', 'poste', 'experience'].forEach(function (k) { rec[k] = String(b[k] || '').slice(0, 4000); });
            db.devis = db.devis || []; db.devis.unshift(rec);
            return save(db) ? reply({ ok: true, reference: ref }) : fail(FULL, 413);
        }
        // --- connexion ---
        if (path === '/admin/login' && m === 'POST') {
            var c = body(opts);
            if (!(await checkCreds(db, c.username, c.password))) return fail('Identifiant ou mot de passe incorrect.', 401);
            db.token = 'local-' + Math.random().toString(36).slice(2); save(db);
            return reply({ token: db.token, user: db.auth ? db.auth.user : 'asggoudihama' });
        }
        if (!path.startsWith('/admin/')) return fail('Route inconnue.', 404);
        if (!token || token !== db.token) return fail('Session expirée. Reconnectez-vous.', 401);
        var user = db.auth ? db.auth.user : 'asggoudihama';

        if (path === '/admin/me') return reply({ user: user });
        if (path === '/admin/site' && m === 'GET') return reply({ site: db.site || null });
        if (path === '/admin/site' && m === 'PUT') {
            db.site = body(opts).site;
            return save(db) ? reply({ ok: true, savedAt: new Date().toISOString() }) : fail(FULL, 413);
        }
        if (path === '/admin/upload-doc' && m === 'POST') {
            var blob = opts.body;
            if (!(blob instanceof Blob)) return fail('Fichier manquant.');
            if (blob.size > 1.5 * 1024 * 1024) return fail('Document trop lourd pour le mode test local (1,5 Mo max). En ligne, la limite est de 10 Mo.', 413);
            var head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
            if (String.fromCharCode.apply(null, head) !== '%PDF-') return fail('Seuls les fichiers PDF sont acceptés.');
            var dataUrl = await new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.readAsDataURL(blob); });
            return reply({ url: String(dataUrl).replace(/^data:[^;]*;/, 'data:application/pdf;'), name: u.searchParams.get('name') || 'document.pdf' });
        }
        if (path === '/admin/upload' && m === 'POST') {
            var d = body(opts).dataUrl || '';
            if (!/^data:image\/(jpeg|png|webp|gif);base64,/.test(d)) return fail('Format d’image non accepté.');
            if (d.length > 1.5 * 1024 * 1024) return fail('Image trop lourde pour le mode test local (1 Mo max après réduction).', 413);
            return reply({ url: d }); // en local, l'image est gardée directement dans le contenu
        }
        if (path === '/admin/push' && m === 'GET') return reply({ count: 0, local: true });
        if (path === '/admin/push/send' && m === 'POST') return fail('Les notifications ne fonctionnent que sur le site en ligne (pas en mode test local).', 400);
        if (path === '/admin/devis' && m === 'GET') return reply({ devis: db.devis || [] });
        if (path.indexOf('/admin/devis/') === 0) {
            var id = decodeURIComponent(path.slice(13));
            db.devis = db.devis || [];
            if (m === 'DELETE') { db.devis = db.devis.filter(function (x) { return x.id !== id; }); save(db); return reply({ ok: true }); }
            if (m === 'PATCH') { var s = body(opts).statut; db.devis.forEach(function (x) { if (x.id === id) x.statut = s; }); save(db); return reply({ ok: true }); }
        }
        if (path === '/admin/account' && m === 'POST') {
            var a = body(opts);
            if (!(await checkCreds(db, user, a.current))) return fail('Mot de passe actuel incorrect.', 403);
            var nu = String(a.username || user).trim().toLowerCase();
            if (!/^[a-z0-9._-]{4,60}$/.test(nu)) return fail('Identifiant : 4 caractères minimum (lettres, chiffres, . _ -).');
            if (String(a.password || '').length < 10) return fail('Le nouveau mot de passe doit faire au moins 10 caractères.');
            db.auth = { user: nu, hash: await sha256(a.password) };
            db.token = 'local-' + Math.random().toString(36).slice(2); save(db);
            return reply({ ok: true, token: db.token, user: nu });
        }
        return fail('Route inconnue.', 404);
    }

    var realFetch = window.fetch ? window.fetch.bind(window) : null;
    window.fetch = function (input, opts) {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/api') === 0) return handle(url, opts || {});
        return realFetch(input, opts);
    };

    // Outil : tout effacer (console du navigateur → asgLocalReset())
    window.asgLocalReset = function () { localStorage.removeItem(KEY); location.reload(); };

    // Bandeau d'information
    document.addEventListener('DOMContentLoaded', function () {
        var bar = document.createElement('div');
        bar.setAttribute('role', 'note');
        bar.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:5000;background:#7a1f1f;color:#fff;font:600 12px/1.3 system-ui,sans-serif;padding:7px 11px;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.3);max-width:calc(100vw - 90px);cursor:pointer';
        bar.title = 'Cliquer pour masquer';
        bar.innerHTML = '🧪 MODE TEST LOCAL — données gardées dans ce navigateur uniquement, rien n’est en ligne';
        bar.onclick = function () { bar.remove(); };
        document.body.appendChild(bar);
    });
})();
