/* ASG-SARL — administration du site */
'use strict';
const API = '/api';
const DEFAULT_SITE = window.ASG_DEFAULT_SITE;
const TOKEN_KEY = 'asg_admin_token';
let TOKEN = sessionStorage.getItem(TOKEN_KEY);
let USER = '';
let SITE = null;
let DIRTY = false;
let DEVIS = [];
let devisFilter = 'tous';

/* ---------- outils ---------- */
const $ = id => document.getElementById(id);
const clone = o => JSON.parse(JSON.stringify(o));
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
function getPath(o, p) { return p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o); }
function setPath(o, p, v) { const k = p.split('.'); let x = o; for (let i = 0; i < k.length - 1; i++) { if (x[k[i]] == null || typeof x[k[i]] !== 'object') x[k[i]] = isNaN(k[i + 1]) ? {} : []; x = x[k[i]]; } x[k[k.length - 1]] = v; }
function merge(def, val) {
    if (Array.isArray(def)) return Array.isArray(val) ? val : clone(def);
    if (def && typeof def === 'object') { const out = {}; const v = (val && typeof val === 'object') ? val : {}; for (const k of new Set([...Object.keys(def), ...Object.keys(v)])) out[k] = k in def ? merge(def[k], v[k]) : v[k]; return out; }
    return val === undefined || val === null ? def : val;
}
function slugify(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'page'; }
function todayIso() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function guessMoyenCat(t) {
    t = slugify(t);
    if (/radio|vhf|emetteur|talkie|gps|telephone|communication/.test(t)) return 'communication';
    if (/detecteur|miroir|portique|badge|acces|scanner/.test(t)) return 'controle';
    if (/video|camera|alarme|surveillance|capteur/.test(t)) return 'surveillance';
    if (/vehicule|moto|voiture|pick|mobilite|transport/.test(t)) return 'mobilite';
    if (/uniforme|tenue|protection|lampe|baton|menotte|aerosol|gilet/.test(t)) return 'agent';
    return 'autre';
}
function fmtDate(d) { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('fr-FR') + ' ' + x.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
function toast(msg, type) {
    const t = $('toast'); t.textContent = msg; t.className = 'toast show ' + (type || '');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 4000);
}
function togglePwd(id, btn) { const i = $(id); i.type = i.type === 'password' ? 'text' : 'password'; btn.innerHTML = `<i class="fas fa-eye${i.type === 'password' ? '' : '-slash'}"></i>`; }
function setDirty(v) { DIRTY = v; $('dirty').classList.toggle('show', v); }
window.addEventListener('beforeunload', e => { if (DIRTY) { e.preventDefault(); e.returnValue = ''; } });

async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (TOKEN) headers.Authorization = 'Bearer ' + TOKEN;
    let res;
    try { res = await fetch(API + path, { ...opts, headers }); }
    catch (e) { throw new Error('Pas de connexion internet.'); }
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : null;
    if (!data) throw new Error('Le serveur du site ne répond pas (le site est-il bien déployé sur Cloudflare ?).');
    if (res.status === 401 && path !== '/admin/login') { sessionExpired(); throw new Error(data.error); }
    if (!res.ok) throw new Error(data.error || 'Erreur ' + res.status);
    return data;
}

/* ---------- connexion ---------- */
async function boot() {
    // Logo sur l'écran de connexion
    if (TOKEN) {
        try { const me = await api('/admin/me'); USER = me.user; await openApp(); return; } catch (e) { /* jeton périmé */ }
    }
    showLogin();
}
function showLogin(msg) {
    $('loading').style.display = 'none';
    $('appView').classList.remove('show');
    $('loginView').style.display = 'flex';
    if (msg) { $('loginError').textContent = msg; $('loginError').style.display = 'block'; }
    setTimeout(() => ($('lgUser').value ? $('lgPass') : $('lgUser')).focus(), 50);
}
function sessionExpired() {
    TOKEN = null; sessionStorage.removeItem(TOKEN_KEY);
    showLogin('Votre session a expiré. Reconnectez-vous' + (DIRTY ? ' : vos modifications non publiées sont conservées dans cette page.' : '.'));
}
$('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('loginBtn'); btn.disabled = true; $('loginError').style.display = 'none';
    try {
        const r = await api('/admin/login', { method: 'POST', body: JSON.stringify({ username: $('lgUser').value.trim(), password: $('lgPass').value }) });
        TOKEN = r.token; USER = r.user; sessionStorage.setItem(TOKEN_KEY, TOKEN);
        $('lgPass').value = '';
        await openApp();
    } catch (err) { $('loginError').textContent = err.message; $('loginError').style.display = 'block'; }
    finally { btn.disabled = false; }
});
async function openApp() {
    if (!SITE) {
        const d = await api('/admin/site'); SITE = merge(DEFAULT_SITE, d.site);
        const migrated = migrate(SITE);
        if (!d.site) setTimeout(() => { setDirty(true); toast('Premier lancement : vérifiez le contenu puis cliquez « Publier » pour l’enregistrer en ligne.'); }, 300);
        else if (migrated) setTimeout(() => { setDirty(true); toast('Nouveautés ajoutées (médiathèque, vidéo, presse…). Vérifiez puis cliquez « Publier ».'); }, 300);
    }
    $('loading').style.display = 'none'; $('loginView').style.display = 'none'; $('appView').classList.add('show');
    $('userName').textContent = USER; $('acUser').value = USER;
    renderAll();
    loadDevis(true);
}
// Mise à niveau des anciennes données vers la nouvelle version du site
function migrate(S) {
    let changed = false;
    if (window.asgSeedVisite && window.asgSeedVisite(S)) changed = true; // reportage « visite de terrain »
    const legacy = window.ASG_LEGACY_MEDIA_TITLES || [];
    const empty = m => !m.image && !(m.photos && m.photos.length) && !m.video && !m.link && !m.file;
    if (S.mediatheque.length && S.mediatheque.every(m => empty(m) && legacy.includes(m.title))) { S.mediatheque = clone(DEFAULT_SITE.mediatheque); changed = true; }
    S.mediatheque.forEach((m, i) => {
        if (!m.id) { m.id = slugify(m.title) + '-' + i; changed = true; }
        if (!Array.isArray(m.photos)) { m.photos = []; changed = true; }
        if (!m.video && m.type === 'video' && m.link) { m.video = m.link; changed = true; }
        if (m.actif === undefined) { m.actif = true; changed = true; }
    });
    S.moyens.forEach(m => { if (!m.categorie) { m.categorie = guessMoyenCat(m.title); changed = true; } if (m.actif === undefined) m.actif = true; });
    S.actualites.forEach(a => { if (a.actif === undefined) { a.actif = true; changed = true; } if (!Array.isArray(a.documents)) a.documents = []; if (!Array.isArray(a.galerie)) a.galerie = []; });
    (S.presse.items || []).forEach(p => { if (p.actif === undefined) p.actif = true; });
    return changed;
}
function logout() {
    if (DIRTY && !confirm('Des modifications ne sont pas publiées. Se déconnecter quand même ?')) return;
    TOKEN = null; sessionStorage.removeItem(TOKEN_KEY); setDirty(false); SITE = null;
    location.href = 'index.html';
}

/* ---------- navigation ---------- */
const TITLES = { notifs: 'Notifications', presse: 'Espace presse', dashboard: 'Tableau de bord', apropos: 'À propos', visuels: 'Photos & réseaux sociaux', accueil: 'Accueil & Direction', services: 'Services', moyens: 'Moyens, zones & PC radio', methode: 'Organisation & méthode', tarifs: 'Tarifs & offre', references: 'Références', actualites: 'Actualités', mediatheque: 'Médiathèque', carrieres: 'Carrières', faq: 'FAQ', contact: 'Contact & infos légales', legal: 'Textes légaux', devis: 'Devis, messages & candidatures', compte: 'Mon compte', sauvegarde: 'Sauvegarde & contrôle' };
$('menu').addEventListener('click', e => { const a = e.target.closest('a[data-s]'); if (!a) return; e.preventDefault(); show(a.dataset.s); });
function show(s) {
    document.querySelectorAll('.section').forEach(x => x.classList.toggle('active', x.id === 's-' + s));
    document.querySelectorAll('#menu a[data-s]').forEach(a => a.classList.toggle('active', a.dataset.s === s));
    $('pageTitle').textContent = TITLES[s] || '';
    $('sidebar').classList.remove('open');
    if (s === 'dashboard') renderKpis();
    if (s === 'notifs') loadPush();
    window.scrollTo({ top: 0 });
}

/* ---------- champs simples ---------- */
function renderAll() {
    document.querySelectorAll('[data-path]').forEach(el => {
        const v = getPath(SITE, el.dataset.path);
        if (el.type === 'checkbox') el.checked = el.hasAttribute('data-off') ? v === true : v !== false;
        else el.value = el.dataset.lines ? (v || []).join('\n') : (v == null ? '' : v);
    });
    checkVideoUrl();
    document.querySelectorAll('.section [data-image]').forEach(el => { if (!el.closest('.item')) renderImage(el); });
    Object.keys(LISTS).forEach(renderList);
    renderKpis();
}
document.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.path) { setPath(SITE, el.dataset.path, el.type === 'checkbox' ? el.checked : el.dataset.lines ? el.value.split('\n').map(l => l.trim()).filter(Boolean) : el.value); setDirty(true); if (el.dataset.path === 'video.url') checkVideoUrl(); }
    else if (el.dataset.l) { listArr(el.dataset.l)[+el.dataset.i][el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value; setDirty(true); if (el.dataset.l === 'mediaCats') renderList('mediatheque'); }
});
function ytId(u) { const m = String(u || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : ''; }
function checkVideoUrl() {
    const el = $('videoCheck'); if (!el || !SITE) return;
    const u = (SITE.video.url || '').trim();
    el.innerHTML = !u ? 'Aucune vidéo : l\'image de remplacement est affichée.' : ytId(u) ? '<span style="color: var(--vert);"><i class="fas fa-circle-check"></i> Vidéo YouTube reconnue.</span>' : /facebook\.com|fb\.watch/.test(u) ? '<span style="color: var(--vert);"><i class="fas fa-circle-check"></i> Vidéo Facebook reconnue (elle doit être publique).</span>' : '<span style="color: var(--orange);"><i class="fas fa-triangle-exclamation"></i> Lien non reconnu : la vidéo s\'ouvrira dans un nouvel onglet.</span>';
}
document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.l && (el.tagName === 'SELECT' || el.type === 'checkbox')) {
        listArr(el.dataset.l)[+el.dataset.i][el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value; setDirty(true);
        if (['icon', 'actif', 'une', 'type', 'datePub'].includes(el.dataset.f)) renderList(el.dataset.l);
        if (el.dataset.l === 'mediaCats') renderList('mediatheque');
    }
});

/* ---------- images (réduites puis envoyées chez Cloudflare) ---------- */
function compressImage(file, max) {
    return new Promise((resolve, reject) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return reject(new Error('Choisissez une image JPEG, PNG, WebP ou GIF.'));
        if (file.type === 'image/gif') {
            if (file.size > 3 * 1024 * 1024) return reject(new Error('GIF trop lourd (3 Mo max).'));
            const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(new Error('Lecture impossible.')); r.readAsDataURL(file); return;
        }
        const img = new Image(), url = URL.createObjectURL(file);
        img.onload = () => {
            const ratio = Math.min(1, max / Math.max(img.width, img.height));
            const c = document.createElement('canvas'); c.width = Math.round(img.width * ratio); c.height = Math.round(img.height * ratio);
            const ctx = c.getContext('2d');
            const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
            if (!keepAlpha) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
            ctx.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            let out = c.toDataURL('image/webp', 0.82); // WebP : plus léger, idéal sur mobile
            if (!out.startsWith('data:image/webp')) out = keepAlpha ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.82);
            resolve(out);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible.')); };
        img.src = url;
    });
}
function renderGallery(el) {
    const path = el.dataset.gallery;
    let arr = getPath(SITE, path); if (!Array.isArray(arr)) { arr = []; setPath(SITE, path, arr); }
    el.innerHTML = `<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.4rem 0;">${arr.map((u, k) => `<div style="position: relative;"><img src="${esc(u)}" alt="" style="width: 92px; height: 92px; object-fit: cover; border-radius: 6px; border: 2px solid var(--ligne);"><button type="button" class="btn btn-rouge btn-xs" data-k="${k}" style="position: absolute; top: 3px; right: 3px; padding: 0.1rem 0.35rem;" title="Retirer"><i class="fas fa-xmark"></i></button></div>`).join('')}</div>
        <label class="upload"><i class="fas fa-images"></i> Ajouter des photos (plusieurs à la fois possible)<input type="file" accept="image/jpeg,image/png,image/webp" multiple></label>`;
    el.querySelectorAll('button[data-k]').forEach(b => b.onclick = () => { arr.splice(+b.dataset.k, 1); setDirty(true); renderGallery(el); });
    const lab = el.querySelector('.upload');
    el.querySelector('input').onchange = async ev => {
        const files = [...ev.target.files]; if (!files.length) return;
        lab.classList.add('busy');
        let ok = 0;
        for (const [n, f] of files.entries()) {
            lab.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Envoi ${n + 1} / ${files.length}…`;
            try { const r = await api('/admin/upload', { method: 'POST', body: JSON.stringify({ dataUrl: await compressImage(f, 1400) }) }); arr.push(r.url); ok++; }
            catch (x) { toast(f.name + ' : ' + x.message, 'error'); }
        }
        if (ok) { setDirty(true); toast('✓ ' + ok + ' photo(s) ajoutée(s) — cliquez « Publier ».'); }
        renderGallery(el);
    };
}
async function uploadDoc(file) {
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) throw new Error(file.name + ' : seuls les PDF sont acceptés.');
    if (file.size > 10 * 1024 * 1024) throw new Error(file.name + ' : 10 Mo maximum.');
    const headers = { 'Content-Type': 'application/pdf' }; if (TOKEN) headers.Authorization = 'Bearer ' + TOKEN;
    let res; try { res = await fetch(API + '/admin/upload-doc?name=' + encodeURIComponent(file.name), { method: 'POST', headers, body: file }); } catch (e) { throw new Error('Pas de connexion internet.'); }
    const data = await res.json().catch(() => null);
    if (!data) throw new Error('Le serveur du site ne répond pas.');
    if (res.status === 401) { sessionExpired(); throw new Error(data.error); }
    if (!res.ok) throw new Error(data.error || 'Erreur ' + res.status);
    return data;
}
function readDataUrl(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error('Lecture impossible.')); r.readAsDataURL(file); }); }
// Un fichier à télécharger (PDF, ou image d'origine sans compression : logo…)
function renderFile(el) {
    const path = el.dataset.file, v = getPath(SITE, path) || '';
    const name = v.startsWith('data:') ? 'Fichier (test local)' : v.split('/').pop();
    el.innerHTML = `${v ? `<div class="file-row"><i class="fas fa-file" style="color: var(--or-fonce);"></i><a href="${esc(v)}" target="_blank" rel="noopener">${esc(name)}</a><button type="button" class="btn btn-rouge btn-xs"><i class="fas fa-xmark"></i> Retirer</button></div>` : ''}
        <label class="upload"><i class="fas fa-file-arrow-up"></i> ${v ? 'Remplacer le fichier' : 'Envoyer un fichier (PDF 10 Mo, ou image PNG/JPEG 4 Mo)'}<input type="file" accept="application/pdf,image/png,image/jpeg,image/webp"></label>`;
    const lab = el.querySelector('.upload');
    el.querySelector('input').onchange = async ev => {
        const f = ev.target.files[0]; if (!f) return;
        lab.classList.add('busy'); lab.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Envoi en cours…';
        try {
            let url;
            if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) url = (await uploadDoc(f)).url;
            else { if (f.size > 4 * 1024 * 1024) throw new Error('Image trop lourde (4 Mo maximum).'); url = (await api('/admin/upload', { method: 'POST', body: JSON.stringify({ dataUrl: await readDataUrl(f) }) })).url; }
            setPath(SITE, path, url); setDirty(true); toast('✓ Fichier envoyé — cliquez « Publier ».');
        } catch (x) { toast(x.message, 'error'); }
        renderFile(el);
    };
    const del = el.querySelector('.file-row button');
    if (del) del.onclick = () => { if (!confirm('Retirer ce fichier ?')) return; setPath(SITE, path, ''); setDirty(true); renderFile(el); };
}
// Liste de documents joints (PDF) avec titre
function renderFiles(el) {
    const path = el.dataset.files;
    let arr = getPath(SITE, path); if (!Array.isArray(arr)) { arr = []; setPath(SITE, path, arr); }
    el.innerHTML = arr.map((d, k) => `<div class="file-row"><i class="fas fa-file-pdf" style="color: #c0392b;"></i><input value="${esc(d.titre)}" data-k="${k}" placeholder="Titre du document" style="flex: 1;"><a href="${esc(d.url)}" target="_blank" rel="noopener" title="Ouvrir"><i class="fas fa-up-right-from-square"></i></a><button type="button" class="btn btn-rouge btn-xs" data-del="${k}"><i class="fas fa-xmark"></i></button></div>`).join('')
        + `<label class="upload"><i class="fas fa-paperclip"></i> Joindre des PDF<input type="file" accept="application/pdf" multiple></label>`;
    el.querySelectorAll('input[data-k]').forEach(i => i.oninput = () => { arr[+i.dataset.k].titre = i.value; setDirty(true); });
    el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (!confirm('Retirer ce document ?')) return; arr.splice(+b.dataset.del, 1); setDirty(true); renderFiles(el); });
    const lab = el.querySelector('.upload');
    el.querySelector('input[type=file]').onchange = async ev => {
        const files = [...ev.target.files]; if (!files.length) return;
        lab.classList.add('busy'); let ok = 0;
        for (const [n, f] of files.entries()) {
            lab.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Envoi ${n + 1} / ${files.length}…`;
            try { const r = await uploadDoc(f); arr.push({ titre: f.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' '), url: r.url }); ok++; } catch (x) { toast(x.message, 'error'); }
        }
        if (ok) { setDirty(true); toast('✓ ' + ok + ' document(s) joint(s) — cliquez « Publier ».'); }
        renderFiles(el);
    };
}
function renderImage(el) {
    const path = el.dataset.image, v = getPath(SITE, path);
    el.innerHTML = `<label class="upload"><i class="fas fa-cloud-arrow-up"></i> ${v ? 'Remplacer l’image' : 'Choisir une image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label>
        ${v ? `<div class="preview"><img src="${esc(v)}" alt=""><button type="button" class="btn btn-rouge btn-xs"><i class="fas fa-trash"></i> Retirer</button></div>` : ''}`;
    const lab = el.querySelector('.upload');
    el.querySelector('input').onchange = async ev => {
        const f = ev.target.files[0]; if (!f) return;
        lab.classList.add('busy'); lab.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Envoi en cours…';
        try {
            const dataUrl = await compressImage(f, Number(el.dataset.max) || 1400);
            const r = await api('/admin/upload', { method: 'POST', body: JSON.stringify({ dataUrl }) });
            setPath(SITE, path, r.url); setDirty(true); toast('✓ Image envoyée — cliquez « Publier » pour la mettre en ligne.');
        } catch (x) { toast(x.message, 'error'); }
        renderImage(el);
    };
    const del = el.querySelector('.preview button');
    if (del) del.onclick = () => { setPath(SITE, path, ''); setDirty(true); renderImage(el); };
}

/* ---------- listes ---------- */
const ICONS = {
    services: ['fa-user-shield', 'fa-box-open', 'fa-video', 'fa-id-card', 'fa-eye', 'fa-calendar-check', 'fa-warehouse', 'fa-clipboard-check', 'fa-shield-alt', 'fa-bell', 'fa-video', 'fa-car', 'fa-money-bill-wave', 'fa-user-tie', 'fa-dog', 'fa-building', 'fa-graduation-cap'],
    moyens: ['fa-tower-broadcast', 'fa-mobile-screen', 'fa-shirt', 'fa-shoe-prints', 'fa-id-badge', 'fa-bullhorn', 'fa-broadcast-tower', 'fa-shield-alt', 'fa-lightbulb', 'fa-grip-lines', 'fa-handcuffs', 'fa-spray-can', 'fa-magnifying-glass', 'fa-car', 'fa-door-closed', 'fa-video', 'fa-bell', 'fa-satellite', 'fa-walkie-talkie', 'fa-vest', 'fa-motorcycle', 'fa-truck'],
    valeurs: ['fa-briefcase', 'fa-scale-balanced', 'fa-bolt', 'fa-user-secret', 'fa-handshake', 'fa-eye', 'fa-lock', 'fa-star', 'fa-heart', 'fa-award', 'fa-shield-halved'],
    tarifs: ['fa-user-shield', 'fa-shield-halved', 'fa-user-tie', 'fa-dog', 'fa-clipboard-check', 'fa-video', 'fa-car', 'fa-graduation-cap', 'fa-box-open', 'fa-bell'],
    zones: ['fa-city', 'fa-tower-broadcast', 'fa-road', 'fa-building', 'fa-map', 'fa-map-marker-alt', 'fa-exclamation-triangle', 'fa-globe-africa'],
    mediaCats: ['fa-users', 'fa-person-chalkboard', 'fa-toolbox', 'fa-calendar-check', 'fa-microphone', 'fa-file-lines', 'fa-shield-halved', 'fa-folder', 'fa-camera', 'fa-video', 'fa-graduation-cap', 'fa-handshake', 'fa-award', 'fa-car']
};
const MOYENS_CATS = ["agent:Équipement de l'agent", 'communication:Communication', "controle:Contrôle d'accès", 'mobilite:Mobilité', 'surveillance:Surveillance électronique', 'autre:Autres moyens'];
const PUB = [['actif', 'Publié (visible sur le site)', 'check'], ['une', "Mis en avant sur l'accueil", 'flag'], ['datePub', 'Publication programmée à partir du (facultatif)', 'date']];
// [champ, libellé, type] — type : text | textarea | icon | image | check | ['valeur:Libellé', …]
const LISTS = {
    stats: { path: 'stats', label: 'Chiffre', fields: [['number', 'Valeur', 'text'], ['label', 'Libellé', 'text']], blank: () => ({ number: '', label: '' }) },
    services: { path: 'services', label: 'Service', fields: [['title', 'Titre', 'text'], ['icon', 'Icône', 'icon'], ['description', 'Résumé (carte)', 'textarea'], ['details', 'Texte détaillé (page du service, paragraphes séparés par une ligne vide)', 'textarea'], ['image', 'Photo', 'image']], blank: () => ({ title: '', description: '', details: '', icon: 'fa-shield-alt', image: '' }) },
    competences: { path: 'expertise.competences', label: 'Barre', fields: [['label', 'Libellé', 'text'], ['pct', 'Pourcentage', 'text']], blank: () => ({ label: '', pct: 80 }) },
    moyens: { path: 'moyens', label: 'Équipement', fields: [['actif', 'Visible sur le site', 'check'], ['title', 'Titre', 'text'], ['categorie', 'Catégorie', MOYENS_CATS], ['icon', 'Icône (si pas de photo)', 'icon'], ['description', 'Description courte', 'textarea'], ['image', 'Photo (facultative)', 'image']], blank: () => ({ actif: true, title: '', categorie: 'agent', description: '', icon: 'fa-shield-alt', image: '' }) },
    mediaCats: { path: 'mediaCats', label: 'Catégorie', fields: [['actif', 'Visible dans les filtres', 'check'], ['label', 'Nom', 'text'], ['icon', 'Icône', 'icon']], blank: () => ({ id: 'cat-' + Date.now().toString(36), label: 'Nouvelle catégorie', icon: 'fa-folder', actif: true }) },
    presse: { path: 'presse.items', label: 'Ressource', top: true, fields: [['actif', 'Publié', 'check'], ['type', 'Type', ['logo:Logo', 'photo:Photo institutionnelle', 'communique:Communiqué', 'document:Document', 'video:Vidéo']], ['titre', 'Titre', 'text'], ['description', 'Description', 'textarea'], ['image', "Image d'aperçu (facultative)", 'image'], ['fichier', 'Fichier à télécharger', 'file'], ['lien', 'Lien (vidéo YouTube, page externe…)', 'text']], blank: () => ({ actif: true, type: 'communique', titre: '', description: '', image: '', fichier: '', lien: '' }) },
    zones: { path: 'zones', label: 'Zone', fields: [['title', 'Titre', 'text'], ['icon', 'Icône', 'icon'], ['description', 'Description', 'text']], blank: () => ({ title: '', description: '', icon: 'fa-map' }) },
    references: { path: 'references', label: 'Référence', fields: [['label', 'Étiquette (ex. MINI-CAS CLIENT)', 'text'], ['title', 'Titre', 'text'], ['description', 'Description', 'textarea'], ['link', 'Lien (facultatif)', 'text'], ['image', 'Image (facultative)', 'image']], blank: () => ({ label: '', title: '', description: '', image: '', link: '' }) },
    actualites: { path: 'actualites', label: 'Actualité', top: true, fields: PUB.concat([['date', 'Date affichée', 'text'], ['title', 'Titre', 'text'], ['description', 'Résumé (affiché sur la carte)', 'textarea'], ['contenu', 'Article complet (paragraphes séparés par une ligne vide ; une ligne commençant par « - » devient une liste)', 'longtext'], ['image', 'Photo principale', 'image'], ['galerie', 'Galerie photos de l’article', 'gallery'], ['video', 'Vidéo (lien YouTube ou Facebook, facultatif)', 'text'], ['documents', 'Documents joints (PDF)', 'files'], ['link', 'Lien externe (facultatif)', 'text']]), blank: () => ({ actif: true, une: false, datePub: '', date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }), title: '', description: '', contenu: '', image: '', galerie: [], video: '', documents: [], link: '' }) },
    mediatheque: { path: 'mediatheque', label: 'Média', top: true, fields: PUB.concat([['type', 'Type', ['photo:Photo ou album photo', 'video:Vidéo', 'document:Document (PDF)']], ['category', 'Catégorie', () => SITE.mediaCats.map(c => c.id + ':' + c.label + (c.actif === false ? ' (masquée)' : ''))], ['date', 'Date affichée', 'text'], ['title', 'Titre', 'text'], ['description', 'Légende / description', 'textarea'], ['image', 'Photo principale (ou miniature)', 'image'], ['photos', 'Album : toutes les photos à afficher', 'gallery', it => it.type === 'photo'], ['video', 'Lien de la vidéo (YouTube, Facebook ou fichier .mp4)', 'text', it => it.type === 'video'], ['file', 'Document PDF', 'file', it => it.type === 'document']]), blank: () => ({ id: 'm-' + Date.now().toString(36), type: 'photo', category: 'equipe', date: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), title: '', description: '', image: '', photos: [], video: '', file: '', actif: true, une: false, datePub: '' }) },
    offres: { path: 'recrutement.offres', label: 'Offre', top: true, fields: [['actif', 'En ligne', 'check'], ['titre', 'Intitulé du poste', 'text'], ['lieu', 'Lieu', 'text'], ['contrat', 'Type de contrat', 'text'], ['dateLimite', 'Date limite de candidature', 'text'], ['description', 'Description et profil recherché', 'textarea']], blank: () => ({ actif: true, titre: '', lieu: 'Ouagadougou', contrat: 'CDD', dateLimite: '', description: '' }) },
    valeurs: { path: 'valeurs', label: 'Valeur', fields: [['titre', 'Titre', 'text'], ['icon', 'Icône', 'icon'], ['texte', 'Texte', 'textarea']], blank: () => ({ titre: '', texte: '', icon: 'fa-star' }) },
    raisons: { path: 'raisons', label: 'Raison', fields: [['titre', 'Titre', 'text'], ['texte', 'Texte', 'textarea']], blank: () => ({ titre: '', texte: '' }) },
    equipe: { path: 'equipe', label: 'Personne', fields: [['niveau', 'Niveau', ['direction:Direction administrative', 'encadrement:Encadrement technique']], ['nom', 'Nom', 'text'], ['fonction', 'Fonction', 'text'], ['description', 'Missions', 'textarea'], ['photo', 'Photo (facultative)', 'image']], blank: () => ({ niveau: 'direction', nom: '', fonction: '', description: '', photo: '' }) },
    horaires: { path: 'horaires', label: 'Service', fields: [['service', 'Service', 'text'], ['standard', 'Horaire standard', 'text'], ['alternatif', 'Horaire alternatif', 'text']], blank: () => ({ service: '', standard: '', alternatif: '' }) },
    dotation: { path: 'dotation', label: 'Article', fields: [['designation', 'Désignation', 'text'], ['quantite', 'Quantité annuelle', 'text']], blank: () => ({ designation: '', quantite: '01' }) },
    tarifs: { path: 'tarifs.lignes', label: 'Prestation', fields: [['prestation', 'Prestation', 'text'], ['icon', 'Icône', 'icon'], ['tarif', 'Tarif mensuel (ex. « à partir de 100 000 F CFA » ou « Sur devis »)', 'text'], ['regime', 'Régime (ex. 12h / jour, Forfait)', 'text']], blank: () => ({ prestation: '', tarif: 'Sur devis', regime: '', icon: 'fa-shield-halved' }) },
    faq: { path: 'faq', label: 'Question', fields: [['q', 'Question', 'text'], ['r', 'Réponse', 'textarea']], blank: () => ({ q: '', r: '' }) }
};
function listArr(name) { let a = getPath(SITE, LISTS[name].path); if (!Array.isArray(a)) { a = []; setPath(SITE, LISTS[name].path, a); } return a; }
function renderList(name) {
    const box = $('l-' + name); if (!box) return;
    const L = LISTS[name], items = listArr(name);
    box.innerHTML = items.length ? items.map((it, i) => `<div class="item${it.actif === false ? ' off' : ''}">
        <div class="item-head"><strong>${L.label} ${i + 1}${(it.title || it.titre || it.q || it.label || it.nom || it.prestation || it.service || it.designation) ? ' · ' + esc(it.title || it.titre || it.q || it.label || it.nom || it.prestation || it.service || it.designation) : ''}${it.actif === false ? '<span class="badge off">Dépublié</span>' : ''}${it.datePub && it.datePub > todayIso() ? `<span class="badge prog">Programmé le ${esc(new Date(it.datePub).toLocaleDateString('fr-FR'))}</span>` : ''}${it.une ? '<span class="badge une">★ À la une</span>' : ''}</strong>
        <div class="tools">
            <button class="btn btn-gris btn-xs" title="Monter" ${i === 0 ? 'disabled' : ''} onclick="moveItem('${name}', ${i}, -1)"><i class="fas fa-arrow-up"></i></button>
            <button class="btn btn-gris btn-xs" title="Descendre" ${i === items.length - 1 ? 'disabled' : ''} onclick="moveItem('${name}', ${i}, 1)"><i class="fas fa-arrow-down"></i></button>
            <button class="btn btn-rouge btn-xs" title="Supprimer" onclick="removeItem('${name}', ${i})"><i class="fas fa-trash"></i></button>
        </div></div>
        ${L.fields.map(([f, lab, type, cond]) => {
            if (cond && !cond(it)) return '';
            if (typeof type === 'function') type = type();
            const v = it[f] == null ? '' : it[f], attrs = `data-l="${name}" data-i="${i}" data-f="${f}"`;
            if (type === 'flag') return `<label class="s" style="display: flex; gap: 0.5rem; align-items: center;"><input type="checkbox" style="width: auto;" ${attrs} ${v === true ? 'checked' : ''}> ${lab}</label>`;
            if (type === 'date') return `<label class="s">${lab}</label><input type="date" ${attrs} value="${esc(v)}" style="max-width: 220px;">`;
            if (type === 'file') return `<label class="s">${lab}</label><div data-file="${L.path}.${i}.${f}"></div>`;
            if (type === 'files') return `<label class="s">${lab}</label><div data-files="${L.path}.${i}.${f}"></div>`;
            if (type === 'textarea') return `<label class="s">${lab}</label><textarea ${attrs}>${esc(v)}</textarea>`;
            if (type === 'check') return `<label class="s" style="display: flex; gap: 0.5rem; align-items: center;"><input type="checkbox" style="width: auto;" ${attrs} ${v !== false ? 'checked' : ''}> ${lab}</label>`;
            if (type === 'image') return `<label class="s">${lab}</label><div data-image="${L.path}.${i}.${f}"></div>`;
            if (type === 'gallery') return `<label class="s">${lab}</label><div data-gallery="${L.path}.${i}.${f}"></div>`;
            if (type === 'longtext') return `<label class="s">${lab}</label><textarea ${attrs} rows="10" style="min-height: 200px;">${esc(v)}</textarea>`;
            if (type === 'icon') { const opts = ICONS[name] || ICONS.services; return `<label class="s">${lab} <i class="fas ${esc(v)}" style="color: var(--or-fonce); margin-left: 4px;"></i></label><select ${attrs}>${(opts.includes(v) || !v ? opts : [v, ...opts]).map(o => `<option value="${esc(o)}" ${o === v ? 'selected' : ''}>${esc(o.replace('fa-', '').replace(/-/g, ' '))}</option>`).join('')}</select>`; }
            if (Array.isArray(type)) return `<label class="s">${lab}</label><select ${attrs}>${type.map(o => { const k = o.indexOf(':'), val = o.slice(0, k), t = o.slice(k + 1); return `<option value="${esc(val)}" ${val === v ? 'selected' : ''}>${esc(t)}</option>`; }).join('')}</select>`;
            return `<label class="s">${lab}</label><input ${attrs} value="${esc(v)}">`;
        }).join('')}
    </div>`).join('') : '<p class="hint">Aucun élément pour le moment.</p>';
    box.querySelectorAll('[data-image]').forEach(renderImage);
    box.querySelectorAll('[data-gallery]').forEach(renderGallery);
    box.querySelectorAll('[data-file]').forEach(renderFile);
    box.querySelectorAll('[data-files]').forEach(renderFiles);
}
function addItem(name) {
    const a = listArr(name), L = LISTS[name];
    if (L.top) a.unshift(L.blank()); else a.push(L.blank());
    setDirty(true); renderList(name);
    const box = $('l-' + name), el = L.top ? box.firstElementChild : box.lastElementChild;
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); const f = el.querySelector('input:not([type=checkbox]), textarea'); if (f) setTimeout(() => f.focus(), 300); }
}
function removeItem(name, i) {
    const it = listArr(name)[i];
    if (name === 'mediaCats') { const n = SITE.mediatheque.filter(m => m.category === it.id).length; if (!confirm(n ? `La catégorie « ${it.label} » contient ${n} média(s). Ils resteront visibles dans « Tout ». Supprimer la catégorie ?` : 'Supprimer cette catégorie ?')) return; listArr(name).splice(i, 1); setDirty(true); renderList(name); renderList('mediatheque'); return; }
    if (!confirm('Supprimer définitivement cet élément ?' + (it && 'actif' in it ? '\n\nAstuce : décochez plutôt « Publié » pour simplement le masquer.' : ''))) return; listArr(name).splice(i, 1); setDirty(true); renderList(name); }
function moveItem(name, i, d) { const a = listArr(name), j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setDirty(true); renderList(name); }

/* ---------- publication ---------- */
async function save() {
    const btn = $('saveBtn'); btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Publication…';
    try {
        await api('/admin/site', { method: 'PUT', body: JSON.stringify({ site: SITE }) });
        setDirty(false); toast(window.ASG_LOCAL ? '✓ Enregistré (mode test local : visible seulement sur cet ordinateur).' : '✓ Site mis à jour : les modifications sont en ligne.');
    } catch (e) { toast('Publication impossible : ' + e.message, 'error'); }
    finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-cloud-arrow-up"></i> Publier'; }
}
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && SITE) { e.preventDefault(); save(); } });

/* ---------- tableau de bord ---------- */
function renderKpis() {
    if (!SITE) return;
    const nouveaux = DEVIS.filter(d => d.statut === 'nouveau').length;
    const k = [
        [nouveaux, 'Nouvelles demandes (devis + messages)', 'devis', nouveaux > 0],
        [DEVIS.filter(d => (d.type || 'devis') === 'devis').length, 'Demandes de devis reçues', 'devis'],
        [SITE.actualites.length, 'Actualités', 'actualites'],
        [SITE.mediatheque.length, 'Médias', 'mediatheque'],
        [DEVIS.filter(d => d.type === 'candidature').length, 'Candidatures reçues', 'devis'],
        [(SITE.recrutement.offres || []).filter(o => o.actif !== false).length, "Offres d'emploi en ligne", 'carrieres'],
        [SITE.services.length, 'Services', 'services']
    ];
    $('kpis').innerHTML = k.map(([n, l, s, a]) => `<div class="kpi${a ? ' alert' : ''}" onclick="show('${s}')"><b>${n}</b><span>${l}</span></div>`).join('');
    $('pillDevis').textContent = nouveaux; $('pillDevis').style.display = nouveaux ? '' : 'none';
}

/* ---------- devis ---------- */
async function loadDevis(silent) {
    if (!silent) $('devisList').innerHTML = '<p class="hint"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</p>';
    try { DEVIS = (await api('/admin/devis')).devis; renderDevis(); renderKpis(); }
    catch (e) { $('devisList').innerHTML = '<p class="hint" style="color: var(--rouge);">' + esc(e.message) + '</p>'; }
}
$('devisFilters').addEventListener('click', e => { const b = e.target.closest('button[data-f]'), t = e.target.closest('button[data-t]'); if (b) { devisFilter = b.dataset.f; document.querySelectorAll('#devisFilters button[data-f]').forEach(x => x.classList.toggle('on', x === b)); } if (t) { devisType = t.dataset.t; document.querySelectorAll('#devisFilters button[data-t]').forEach(x => x.classList.toggle('on', x === t)); } if (b || t) renderDevis(); });
let devisType = 'tous';
function renderDevis() {
    const list = DEVIS.filter(d => (devisFilter === 'tous' || d.statut === devisFilter) && (devisType === 'tous' || (d.type || 'devis') === devisType));
    const info = (ic, label, v) => v ? `<span title="${label}"><i class="fas ${ic}"></i> ${esc(v)}</span>` : '';
    $('devisList').innerHTML = list.length ? list.map(d => {
        const isMsg = d.type === 'message', isCan = d.type === 'candidature';
        const tel = String(d.telephone || '').replace(/[^0-9+]/g, '');
        const waNum = tel.length === 8 ? '226' + tel : tel.replace('+', '');
        return `<div class="devis ${esc(d.statut)}">
        <div class="row"><div><span class="type-badge ${isMsg ? 'msg' : isCan ? 'can' : ''}">${isMsg ? 'Message' : isCan ? 'Candidature' : 'Devis'}</span> ${d.reference ? `<code class="ref">${esc(d.reference)}</code>` : ''}<br>
            <strong style="color: var(--bleu-fonce);">${isCan ? esc(d.contact) + ' — ' + esc(d.poste) : isMsg ? esc(d.contact) + (d.objet ? ' — ' + esc(d.objet) : '') : esc(d.entreprise) + ' — ' + esc(d.contact)}</strong></div>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
                <select onchange="setDevisStatut('${esc(d.id)}', this.value)" aria-label="Statut">${['nouveau', 'en cours', 'traité'].map(s => `<option ${s === d.statut ? 'selected' : ''}>${s}</option>`).join('')}</select>
                <button class="btn btn-rouge btn-xs" onclick="deleteDevis('${esc(d.id)}')" title="Supprimer"><i class="fas fa-trash"></i></button>
            </div></div>
        <div class="tags"><span><i class="fas fa-calendar"></i> ${fmtDate(d.date)}</span>${info('fa-briefcase', 'Secteur', d.secteur)}${info('fa-shield-halved', 'Service', d.besoin)}${info('fa-location-dot', 'Ville', d.ville)}${info('fa-building', 'Type de site', d.typeSite)}${info('fa-users', 'Agents', d.nbAgents && d.nbAgents + ' agent(s)')}${info('fa-clock', 'Horaires', d.horaires)}${info('fa-calendar-day', 'Début', d.debut && new Date(d.debut).toLocaleDateString('fr-FR'))}${info('fa-hourglass-half', 'Durée', d.duree)}${info('fa-user-clock', 'Expérience', d.experience)}</div>
        <div style="font-size: 0.9rem; display: flex; gap: 1rem; flex-wrap: wrap;">${d.email ? `<span><i class="fas fa-envelope" style="color: var(--or-fonce);"></i> <a href="mailto:${esc(d.email)}?subject=${encodeURIComponent((d.reference ? d.reference + ' — ' : '') + (isCan ? 'Votre candidature' : isMsg ? 'Votre message' : 'Votre demande de devis') + ' — ASG-SARL')}">${esc(d.email)}</a></span>` : ''}${tel ? `<span><i class="fas fa-phone" style="color: var(--or-fonce);"></i> <a href="tel:${esc(tel)}">${esc(d.telephone)}</a></span><span><i class="fab fa-whatsapp" style="color: #25d366;"></i> <a href="https://wa.me/${esc(waNum)}" target="_blank" rel="noopener">WhatsApp</a></span>` : ''}</div>
        ${(d.message || d.description) ? `<p style="margin-top: 0.5rem; color: var(--gris-fonce); font-size: 0.92rem;">${nl2br(d.message || d.description)}</p>` : ''}
    </div>`; }).join('') : '<p class="hint">Aucune demande dans cette catégorie.</p>';
}
async function setDevisStatut(id, statut) {
    try { await api('/admin/devis/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify({ statut }) }); const d = DEVIS.find(x => x.id === id); if (d) d.statut = statut; renderDevis(); renderKpis(); }
    catch (e) { toast(e.message, 'error'); }
}
async function deleteDevis(id) {
    if (!confirm('Supprimer définitivement cette demande ?')) return;
    try { await api('/admin/devis/' + encodeURIComponent(id), { method: 'DELETE' }); DEVIS = DEVIS.filter(x => x.id !== id); renderDevis(); renderKpis(); }
    catch (e) { toast(e.message, 'error'); }
}

/* ---------- vérification des médias ---------- */
async function checkMedia() {
    const btn = $('checkBtn'), out = $('checkResult'); btn.disabled = true;
    const found = new Map();
    (function walk(o, p) {
        if (typeof o === 'string') { if (/^(images\/|\/api\/(img|doc)\/|data:(image|application\/pdf)|https?:\/\/.+\.(jpe?g|png|webp|gif|pdf)(\?|$))/i.test(o)) { if (!found.has(o)) found.set(o, []); found.get(o).push(p); } return; }
        if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], p ? p + ' › ' + k : k);
    })(SITE, '');
    const vids = [];
    (function walk(o, p) { if (o && typeof o === 'object') for (const k of Object.keys(o)) { if ((k === 'video' || (k === 'url' && /^video\b/.test(p))) && typeof o[k] === 'string' && o[k]) vids.push([o[k], p + ' › ' + k]); else walk(o[k], p ? p + ' › ' + k : k); } })(SITE, '');
    const urls = [...found.keys()]; let done = 0;
    out.innerHTML = `<p class="hint"><i class="fas fa-circle-notch fa-spin"></i> Vérification de ${urls.length} fichier(s)…</p>`;
    const test = u => new Promise(res => {
        if (u.startsWith('data:')) return res(true);
        if (/\/api\/doc\/|\.pdf(\?|$)/i.test(u)) return fetch(u, { method: 'HEAD' }).then(r => res(r.ok), () => res(false));
        const im = new Image(); const t = setTimeout(() => res(false), 20000);
        im.onload = () => { clearTimeout(t); res(true); }; im.onerror = () => { clearTimeout(t); res(false); }; im.src = u;
    });
    const bad = [];
    await Promise.all(urls.map(async u => { if (!await test(u)) bad.push(u); done++; }));
    const badVid = vids.filter(([u]) => !ytId(u) && !/facebook\.com|fb\.watch|\.(mp4|webm)(\?|$)/i.test(u) && !/^data:/.test(u));
    const where = u => (found.get(u) || []).map(p => `<code>${esc(p.replace(/\b(\d+)\b/g, n => '#' + (+n + 1)))}</code>`).join(' ');
    out.innerHTML = (bad.length ? `<p style="color: var(--rouge); font-weight: 600;"><i class="fas fa-triangle-exclamation"></i> ${bad.length} fichier(s) ne s'affichent pas :</p><ul class="chk-list">${bad.map(u => `<li><i class="fas fa-xmark" style="color: var(--rouge);"></i><div>${esc(u.slice(0, 90))}<br>${where(u)}</div></li>`).join('')}</ul>` : `<p style="color: var(--vert); font-weight: 600;"><i class="fas fa-circle-check"></i> Les ${urls.length} images et documents s'affichent correctement.</p>`)
        + (badVid.length ? `<p style="color: var(--orange); margin-top: 0.8rem;"><i class="fas fa-circle-info"></i> ${badVid.length} lien(s) vidéo non reconnus (ils s'ouvriront dans un nouvel onglet) :</p><ul class="chk-list">${badVid.map(([u, p]) => `<li>${esc(u.slice(0, 90))}<br><code>${esc(p)}</code></li>`).join('')}</ul>` : '');
    btn.disabled = false;
}

/* ---------- compte ---------- */
async function changeAccount(e) {
    e.preventDefault();
    if ($('acNew').value !== $('acConfirm').value) { toast('Les deux nouveaux mots de passe ne correspondent pas.', 'error'); return; }
    const btn = $('acBtn'); btn.disabled = true;
    try {
        const r = await api('/admin/account', { method: 'POST', body: JSON.stringify({ username: $('acUser').value.trim(), current: $('acCurrent').value, password: $('acNew').value }) });
        TOKEN = r.token; USER = r.user; sessionStorage.setItem(TOKEN_KEY, TOKEN);
        $('userName').textContent = USER; ['acCurrent', 'acNew', 'acConfirm'].forEach(id => $(id).value = '');
        toast('✓ Identifiants mis à jour. Notez-les en lieu sûr.');
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; }
}

/* ---------- sauvegarde ---------- */
function exportJson() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), site: SITE }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'asg-goudihama-site-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importJson(input) {
    const f = input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        try {
            const d = JSON.parse(r.result);
            if (!d.site || typeof d.site !== 'object') throw new Error('fichier non reconnu');
            if (!confirm('Remplacer le contenu actuel par cette sauvegarde ?')) return;
            SITE = merge(DEFAULT_SITE, d.site); renderAll(); setDirty(true);
            toast('Sauvegarde chargée — cliquez « Publier » pour la mettre en ligne.');
        } catch (e) { toast('Import impossible : ' + e.message, 'error'); }
        input.value = '';
    };
    r.readAsText(f);
}
function resetDefaults() {
    if (!confirm('Remplacer tout le contenu par le contenu d’origine ? (Les demandes de devis ne sont pas touchées.)')) return;
    SITE = clone(DEFAULT_SITE); renderAll(); setDirty(true);
    toast('Contenu d’origine rechargé — cliquez « Publier » pour confirmer.');
}

boot();


/* ---------- notifications push ---------- */
async function loadPush() {
    try {
        const r = await api('/admin/push');
        $('pushCount').textContent = r.local ? 'Mode test local : l\u2019envoi ne fonctionne qu\u2019en ligne.' : (r.count === 0 ? 'Aucun abonné pour le moment.' : r.count + ' abonné' + (r.count > 1 ? 's' : '') + ' actuellement.');
    } catch (e) { $('pushCount').textContent = ''; }
}
async function sendPush(ev) {
    ev.preventDefault();
    if (!confirm('Envoyer cette notification à tous les abonnés ?')) return;
    const btn = $('pushSendBtn'), st = $('pushStatus');
    const msg = { title: $('pushTitle').value.trim(), body: $('pushBody').value.trim(), url: $('pushUrl').value };
    let sent = 0, removed = 0, failed = 0, cursor = null;
    btn.disabled = true;
    try {
        do {
            st.textContent = 'Envoi en cours… ' + sent + ' envoyé(s)';
            const r = await api('/admin/push/send', { method: 'POST', body: JSON.stringify({ ...msg, cursor }) });
            sent += r.sent; removed += r.removed; failed += r.failed; cursor = r.next;
        } while (cursor);
        st.textContent = sent + ' notification(s) envoyée(s)' + (failed ? ', ' + failed + ' en échec' : '') + (removed ? ', ' + removed + ' abonnement(s) expiré(s) retiré(s)' : '') + '.';
        toast(sent ? 'Notification envoyée à ' + sent + ' abonné(s).' : 'Aucun abonné à notifier.', sent ? '' : 'error');
        if (sent) { $('pushTitle').value = ''; $('pushBody').value = ''; }
        loadPush();
    } catch (e) { st.textContent = ''; toast(e.message, 'error'); }
    finally { btn.disabled = false; }
}
