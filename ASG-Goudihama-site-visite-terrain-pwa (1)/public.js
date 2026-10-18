/* ASG-SARL (Agence de Sécurité Goudihama) — site public */
'use strict';
const API = '/api';
const DEFAULT_SITE = window.ASG_DEFAULT_SITE;
// En ligne : vraies adresses (/services, /actualites/…). En test local (fichier ouvert) : adresses en « # ».
const PATH_MODE = !window.ASG_LOCAL && /^https?:$/.test(location.protocol);
const PAGE_SLUG = { accueil: '', apropos: 'a-propos', services: 'services', moyens: 'moyens', methode: 'methode', tarifs: 'tarifs', references: 'references', actualites: 'actualites', mediatheque: 'mediatheque', presse: 'presse', recrutement: 'carrieres', faq: 'faq', devis: 'devis', contact: 'contact' };
const SLUG_PAGE = Object.fromEntries(Object.entries(PAGE_SLUG).map(([k, v]) => [v, k]));
const PAGES = Object.keys(PAGE_SLUG).concat(['service', 'article']);
const PAGE_DESC = {
    accueil: "ASG-SARL, Agence de Sécurité Goudihama : gardiennage, sécurité électronique, cynophile, protection rapprochée, escorte, audit et formation au Burkina Faso. Disponible 24h/24 et 7j/7.",
    moyens: 'Les moyens d’ASG-SARL : véhicules d’intervention rapide, PC radio 24h/24, réseau VHF/UHF de 45 km et dotation complète des agents.',
    methode: 'Organisation, recrutement, formation sur 12 modules homologués, contrôle programmé et inopiné : la méthode ASG-SARL.',
    tarifs: 'Tarifs ASG-SARL sur devis gratuit sous 48h : vigile non armé, vigile armé, protection rapprochée, maître-chien, audit, vidéosurveillance, escorte.',
    mediatheque: 'Photos, vidéos et documents d’ASG-SARL : équipes, formations, équipements et événements.',
    presse: 'Espace presse d’ASG-SARL : présentation officielle, logos et communiqués.',
    recrutement: 'Rejoignez ASG-SARL : offres d’emploi, critères de recrutement et candidature en ligne.',
    devis: 'Demandez gratuitement un devis de sécurité à ASG-SARL : visite de site offerte, réponse sous 48h.'
};
const MOYENS_CATS = [['agent', "Équipement de l'agent", 'fa-vest'], ['communication', 'Communication', 'fa-walkie-talkie'], ['controle', "Contrôle d'accès", 'fa-door-closed'], ['mobilite', 'Mobilité', 'fa-car'], ['surveillance', 'Surveillance électronique', 'fa-video'], ['autre', 'Autres moyens', 'fa-toolbox']];
const PRESS_TYPES = [['logo', 'Logos', 'fa-shapes'], ['photo', 'Photos institutionnelles', 'fa-camera'], ['communique', 'Communiqués', 'fa-bullhorn'], ['document', 'Documents', 'fa-file-pdf'], ['video', 'Vidéos', 'fa-circle-play']];
let SITE = clone(DEFAULT_SITE);

/* Montants masqués par défaut : « Sur devis » partout, tant que la case « Afficher les montants » n'est pas cochée dans l'administration */
const showPrices = () => !!(SITE.tarifs && SITE.tarifs.afficherPrix === true);
const PRICE_SENTENCE = /[^.!?]*\d[\d\s.\u00a0\u202f]*\s*(?:F\s*CFA|FCFA|XOF)[^.!?]*[.!?]?\s*/gi;
function noPrices(t) {
    t = String(t == null ? '' : t);
    if (showPrices() || !/\d[\d\s.\u00a0\u202f]*\s*(?:F\s*CFA|FCFA|XOF)/i.test(t)) return t;
    return t.split('\n').map(l => l.replace(PRICE_SENTENCE, '').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
function faqAnswer(r) {
    const c = noPrices(r);
    return c === String(r == null ? '' : r) ? c : (c ? c + ' ' : '') + 'Demandez un devis gratuit : il vous est remis sous 48 h après visite du site.';
}

/* ---------- outils ---------- */
const $ = id => document.getElementById(id);
const $$ = s => document.querySelectorAll(s);
// Grand écran : le site tient dans l'écran, seule la colonne de contenu défile
const appMode = () => window.matchMedia('(min-width: 1101px)').matches;
const scroller = () => appMode() ? $('mainCol') : null;
const scrollPos = () => { const s = scroller(); return s ? s.scrollTop : window.scrollY; };
const scrollBase = () => { const s = scroller(); return s ? s.getBoundingClientRect().top : 0; };
function scrollToY(y, smooth) { const s = scroller(), o = { top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' }; if (s) s.scrollTo(o); else window.scrollTo(o); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
function paras(s) {
    return String(s || '').split(/\n\s*\n/).filter(x => x.trim()).map(block => {
        const lines = block.trim().split('\n'), items = lines.filter(l => /^\s*[-•]\s+/.test(l));
        if (!items.length) return `<p>${nl2br(block.trim())}</p>`;
        const head = lines.filter(l => !/^\s*[-•]\s+/.test(l));
        return (head.length ? `<p class="list-head">${nl2br(head.join('\n'))}</p>` : '') + `<ul class="check">${items.map(l => `<li>${esc(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>`;
    }).join('');
}
function safeUrl(u) { u = String(u || '').trim(); if (!u) return ''; if (/^(images|img)\//.test(u) || u.startsWith('./')) return u; if (/^(javascript|vbscript|data):/i.test(u) && !/^data:(image\/|application\/pdf)/i.test(u)) return ''; if (/^(https?:|mailto:|tel:|data:)/i.test(u) || u.startsWith('/') || u.startsWith('#')) return u; return 'https://' + u; }
function cssUrl(u) { const s = safeUrl(u); return s ? `url("${s.replace(/["\\\n]/g, '')}")` : 'none'; }
function safeIcon(i) { return /^fa-[a-z0-9-]+$/.test(i || '') ? i : 'fa-shield-halved'; }
function getPath(o, p) { return p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o); }
function telHref(p) { let n = String(p).replace(/[^0-9+]/g, ''); if (/^\d{8}$/.test(n)) n = '+226' + n; return 'tel:' + n; }
function slugify(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'page'; }
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function isLive(x) { return !!x && x.actif !== false && (!x.datePub || x.datePub <= today()); }
function merge(def, val) {
    if (Array.isArray(def)) return Array.isArray(val) ? val : clone(def);
    if (def && typeof def === 'object') { const out = {}; const v = (val && typeof val === 'object') ? val : {}; for (const k of new Set([...Object.keys(def), ...Object.keys(v)])) out[k] = k in def ? merge(def[k], v[k]) : v[k]; return out; }
    return val === undefined || val === null ? def : val;
}
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3500); }
function img(src, alt, cls) { return `<img${cls ? ` class="${cls}"` : ''} src="${esc(safeUrl(src))}" alt="${esc(alt || '')}" loading="lazy" decoding="async" onerror="this.classList.add('img-err')">`; }

/* ---------- normalisation des contenus (compatibilité avec les anciennes données) ---------- */
function guessMoyenCat(t) {
    t = slugify(t);
    if (/radio|vhf|emetteur|talkie|gps|telephone|communication/.test(t)) return 'communication';
    if (/detecteur|miroir|portique|badge|acces|scanner/.test(t)) return 'controle';
    if (/video|camera|alarme|surveillance|capteur/.test(t)) return 'surveillance';
    if (/vehicule|moto|voiture|pick|mobilite|transport/.test(t)) return 'mobilite';
    if (/uniforme|tenue|protection|lampe|baton|menotte|aerosol|gilet/.test(t)) return 'agent';
    return 'autre';
}
function normalize(S) {
    if (window.asgSeedVisite) window.asgSeedVisite(S);
    const legacy = window.ASG_LEGACY_MEDIA_TITLES || [];
    const empty = m => !m.image && !(m.photos && m.photos.length) && !m.video && !m.link && !m.file;
    if (!S.mediatheque.length || S.mediatheque.every(m => empty(m) && legacy.includes(m.title))) S.mediatheque = clone(DEFAULT_SITE.mediatheque);
    S.mediatheque.forEach((m, i) => {
        m.id = m.id || (slugify(m.title) + '-' + i);
        m.photos = Array.isArray(m.photos) ? m.photos.filter(Boolean) : [];
        if (!m.video && m.type === 'video' && m.link) m.video = m.link;
        m.type = m.type || 'photo';
    });
    S.moyens.forEach(m => { if (!m.categorie) m.categorie = guessMoyenCat(m.title); });
    S.actualites.forEach(a => { a.galerie = Array.isArray(a.galerie) ? a.galerie : []; a.documents = Array.isArray(a.documents) ? a.documents : []; });
    S.logo = S.logo || DEFAULT_SITE.logo;
    const D = DEFAULT_SITE.images; S.images.hero = S.images.hero || D.hero; S.images.banniere = S.images.banniere || D.banniere; S.images.apropos = S.images.apropos || D.apropos;
    const DP = DEFAULT_SITE.pdg; S.pdg.photo = S.pdg.photo || DP.photo; S.pdg.photo2 = S.pdg.photo2 || DP.photo2 || S.pdg.photo;
    return S;
}
const liveNews = () => SITE.actualites.map((a, i) => ({ a, i })).filter(o => isLive(o.a));
const hasMedia = m => m.image || m.photos.length || m.video || m.file;
const liveMedia = () => SITE.mediatheque.filter(m => isLive(m) && hasMedia(m));
const catOf = id => SITE.mediaCats.find(c => c.id === id) || { id, label: 'Divers', icon: 'fa-folder', actif: true };
const artSlug = a => a.slug || slugify(a.title);

/* ---------- adresses ---------- */
function pageHref(p) { return PATH_MODE ? '/' + PAGE_SLUG[p] : '#' + p; }
function svcHref(i) { return PATH_MODE ? '/services/' + slugify(SITE.services[i].title) : '#service/' + i; }
function artHref(i) { return PATH_MODE ? '/actualites/' + artSlug(SITE.actualites[i]) : '#article/' + i; }
function mediaHref(id) { return PATH_MODE ? '/mediatheque/' + encodeURIComponent(id) : '#mediatheque/' + encodeURIComponent(id); }
function hrefFor(r) {
    if (r.page === 'service') return SITE.services[r.arg] ? svcHref(r.arg) : pageHref('services');
    if (r.page === 'article') return SITE.actualites[r.arg] ? artHref(r.arg) : pageHref('actualites');
    if (r.page === 'mediatheque' && r.arg) return mediaHref(r.arg);
    return pageHref(r.page);
}
function parseHash(h) {
    let [page, arg] = String(h || '').split('/');
    if (page === 'admin') return { page };
    if (page === 'service' || page === 'article') return { page, arg: Number(arg) };
    if (page === 'mediatheque') return { page, arg: arg ? decodeURIComponent(arg) : '' };
    return PAGES.includes(page) ? { page } : null;
}
function parsePath(p) {
    const s = p.replace(/^\/+|\/+$/g, '').split('/').map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } });
    if (s[0] === 'index.html') s[0] = '';
    if (s[0] === 'services' && s[1]) { const i = SITE.services.findIndex(x => slugify(x.title) === s[1]); return i >= 0 ? { page: 'service', arg: i } : { page: 'services' }; }
    if (s[0] === 'actualites' && s[1]) { const i = SITE.actualites.findIndex(a => isLive(a) && artSlug(a) === s[1]); return i >= 0 ? { page: 'article', arg: i } : { page: 'actualites' }; }
    if (s[0] === 'mediatheque') return { page: 'mediatheque', arg: s[1] || '' };
    return { page: SLUG_PAGE[s[0]] || 'accueil' };
}
function currentRoute() { return PATH_MODE ? parsePath(location.pathname) : (parseHash(decodeURIComponent(location.hash.slice(1))) || { page: 'accueil' }); }
function go(href, anchor) {
    if (anchor) sessionStorage.setItem('asg_anchor', anchor);
    if (PATH_MODE) { if (href !== location.pathname) history.pushState(null, '', href); route(); }
    else if (location.hash === href) route(); else location.hash = href.slice(1);
}

/* ---------- chargement ---------- */
async function init() {
    let site = window.ASG_SITE; // contenu injecté par le serveur (évite un aller-retour réseau)
    if (site === undefined) {
        try {
            const r = await fetch(API + '/site', { headers: { Accept: 'application/json' } });
            if (r.ok && (r.headers.get('content-type') || '').includes('application/json')) site = (await r.json()).site;
        } catch (e) { /* hors ligne : contenu par défaut */ }
    }
    SITE = normalize(merge(DEFAULT_SITE, site));
    render();
    if (PATH_MODE && location.hash.length > 1) { // anciennes adresses en « # » → nouvelles adresses
        const r = parseHash(decodeURIComponent(location.hash.slice(1)));
        if (r && r.page !== 'admin') history.replaceState(null, '', hrefFor(r));
    }
    route();
}

function render() {
    const s = SITE, root = document.documentElement.style;
    root.setProperty('--hero-img', cssUrl(s.images.hero));
    root.setProperty('--banner-img', cssUrl(s.images.banniere || s.images.hero));

    $$('[data-bind]').forEach(el => { const v = getPath(s, el.dataset.bind); el.textContent = (v == null || v === '') ? (el.dataset.empty || '') : v; });
    $$('[data-list]').forEach(el => { el.innerHTML = (getPath(s, el.dataset.list) || []).map(l => `<li>${esc(l)}</li>`).join(''); });
    if (PATH_MODE) $$('a[href^="#"]').forEach(a => { const r = parseHash(a.getAttribute('href').slice(1)); if (r && r.page !== 'admin') a.setAttribute('href', hrefFor(r)); });

    $('heroBg').classList.toggle('has-img', !!s.images.hero);

    // coordonnées
    const p1 = s.contact.phone1 || '', mail = s.contact.email || '';
    $$('[data-phone-link]').forEach(a => a.href = p1 ? telHref(p1) : pageHref('contact'));
    $('contactPhones').innerHTML = [s.contact.phone1, s.contact.phone2, s.contact.phone3].filter(Boolean).map(p => `<a href="${esc(telHref(p))}">${esc(p)}</a>`).join('');
    $('contactEmails').innerHTML = [s.contact.email, s.contact.emailRecrutement].filter(Boolean).map(m => `<a href="mailto:${esc(m)}">${esc(m)}</a>`).join('');
    $('footPhones').textContent = [s.contact.phone1, s.contact.phone2, s.contact.phone3].filter(Boolean).join(' / ');
    $('footMail').href = mail ? 'mailto:' + mail : pageHref('contact');
    const rm = s.contact.emailRecrutement || s.contact.email || '';
    $('recrutMail').textContent = rm; $('recrutMail').href = 'mailto:' + rm;

    // réseaux sociaux + WhatsApp
    const wa = String(s.social.whatsapp || '').replace(/[^0-9]/g, '');
    const nets = [['facebook', 'fab fa-facebook-f', 'Facebook'], ['linkedin', 'fab fa-linkedin-in', 'LinkedIn'], ['youtube', 'fab fa-youtube', 'YouTube'], ['tiktok', 'fab fa-tiktok', 'TikTok']]
        .filter(([k]) => s.social[k]).map(([k, ic, n]) => `<a href="${esc(safeUrl(s.social[k]))}" target="_blank" rel="noopener" aria-label="${n}"><i class="${ic}"></i></a>`);
    if (wa) nets.push(`<a href="https://wa.me/${wa}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>`);
    $('footSocials').innerHTML = nets.join('');
    $('footWa').style.display = wa ? '' : 'none'; if (wa) { $('footWa').href = 'https://wa.me/' + wa; $('footWaTxt').textContent = '+' + wa.replace(/^(226)(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5'); }
    if (wa) { $$('.wa-link').forEach(b => { b.href = 'https://wa.me/' + wa; b.style.display = 'inline-flex'; }); $$('[data-contact-btn]').forEach(b => { b.href = 'https://wa.me/' + wa; b.target = '_blank'; b.rel = 'noopener'; }); }

    // services
    const svcCard = (x, i) => `<a class="svc-card reveal" href="${svcHref(i)}">${x.image ? img(x.image, '', 'bg') : '<span class="bg"></span>'}<i class="fas ${safeIcon(x.icon)} svc-ico"></i><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><span class="more">En savoir plus</span></a>`;
    $('homeServices').innerHTML = s.services.map(svcCard).join('');
    $$('[data-svc-cards]').forEach(el => { el.innerHTML = (el.dataset.svcCards === 'all' ? s.services : s.services.slice(0, 3)).map(svcCard).join(''); });
    $('hnServices').innerHTML = `<a href="${pageHref('services')}">Tous nos services</a>` + s.services.map((x, i) => `<a href="${svcHref(i)}">${esc(x.title)}</a>`).join('');
    $('ddServices').innerHTML = `<a href="${pageHref('services')}">Tous nos services</a>` + s.services.map((x, i) => `<a href="${svcHref(i)}">${esc(x.title)}</a>`).join('');
    $('footServices').innerHTML = s.services.map((x, i) => `<a href="${svcHref(i)}">${esc(x.title)}</a>`).join('') + `<a href="${pageHref('moyens')}">Nos moyens et équipements</a>`;
    const besoin = $('besoinSelect'), cur = besoin.value;
    besoin.innerHTML = '<option value="">— Choisir —</option>' + s.services.map(x => `<option>${esc(x.title)}</option>`).join('') + '<option>Plusieurs services</option><option>Autre</option>';
    besoin.value = cur;

    // images encadrées et direction
    const framed = (el, src) => { el.style.backgroundImage = src ? cssUrl(src) : ''; el.querySelector('.ph')?.remove(); if (!src) el.insertAdjacentHTML('afterbegin', '<span class="ph"><img src="images/emblem-blanc.png" alt=""></span>'); };
    framed($('homeAboutImg'), s.images.apropos); framed($('aboutImg'), s.images.apropos);
    $$('.xp-badge').forEach(b => b.style.display = s.apropos.annees ? '' : 'none');
    const pdgImg = src => src ? img(src, s.pdg.name) : '<i class="fas fa-user-tie"></i>';
    $('homePdgPhoto').innerHTML = pdgImg(s.pdg.photo);
    $('pdgPhoto').innerHTML = pdgImg(s.pdg.photo2);

    // indicateurs et compétences (masquables)
    $('statsGrid').innerHTML = s.stats.map(st => `<div class="stat reveal"><b>${esc(st.number)}</b><span>${esc(st.label)}</span></div>`).join('');
    document.querySelector('.stats-band').hidden = !s.afficher.stats || !s.stats.length;
    $('valuesGrid').innerHTML = (s.valeurs || []).map(v => `<div class="value reveal"><i class="fas ${safeIcon(v.icon)}"></i><h3>${esc(v.titre)}</h3><p>${esc(v.texte)}</p></div>`).join('');
    renderAsg(s);
    $('skills').innerHTML = (s.expertise.competences || []).map(c => { const v = Math.max(0, Math.min(100, Number(c.pct) || 0)); return `<div class="skill"><div class="skill-head"><span>${esc(c.label)}</span><span>${v}%</span></div><div class="skill-bar"><span data-pct="${v}"></span></div></div>`; }).join('');
    $('skills').hidden = !s.afficher.competences;

    // vidéo institutionnelle
    $('homeVideo').hidden = !s.video.afficher;
    renderPlayer($('homeVideoPlayer'), { url: s.video.url, poster: s.video.poster || s.images.hero, title: s.video.titre, cc: s.video.sousTitres, soon: 'Vidéo de présentation bientôt disponible' });

    // actualités / références
    const none = t => `<p class="empty">${t}</p>`;
    const news = liveNews();
    $('actualitesGrid').innerHTML = news.length ? news.map(({ a, i }) => newsCard(a, 'fa-newspaper', a.date, artHref(i))).join('') : none('Aucune actualité pour le moment.');
    const homeNews = news.filter(o => o.a.une).concat(news.filter(o => !o.a.une)).slice(0, 3);
    $('homeNews').innerHTML = homeNews.length ? homeNews.map(({ a, i }) => newsCard(a, 'fa-newspaper', a.date, artHref(i))).join('') : none('Aucune actualité pour le moment.');
    $('referencesGrid').innerHTML = s.references.map(x => newsCard(x, 'fa-handshake', x.label)).join('') || none('Références bientôt disponibles.');

    // à la une : visite de terrain (accueil)
    const fa = SITE.actualites.findIndex(a => a.slug === 'visite-terrain-responsable' && isLive(a)), fx = fa >= 0 ? SITE.actualites[fa] : null;
    const fAlbum = SITE.mediatheque.find(m => m.id === 'visite-terrain-responsable-2026' && isLive(m) && hasMedia(m));
    const fPh = fx ? [...new Set([fx.image, ...fx.galerie].filter(Boolean))].slice(0, 3) : [];
    $('homeTerrain').hidden = !fx; $('heroUne').hidden = !fx;
    if (fx) {
        $('heroUne').href = artHref(fa);
        $('terrainBody').innerHTML = `<span class="eyebrow">À la une · Sur le terrain</span><h2 class="h-title">${esc(fx.title)}</h2><p>${nl2br(fx.description)}</p><p class="terrain-date"><i class="fas fa-calendar-day"></i> ${esc(fx.date)}</p>
            <div class="terrain-btns"><a class="btn btn-dark" href="${esc(artHref(fa))}"><i class="fas fa-book-open"></i> Lire le reportage</a>${fAlbum ? `<a class="btn btn-ghost" href="${esc(mediaHref(fAlbum.id))}"><i class="fas fa-images"></i> Voir l’album photos</a>` : ''}</div>`;
        $('terrainMosaic').innerHTML = fPh.map((src, k) => `<a class="terrain-ph" href="${esc(artHref(fa))}" aria-label="Lire le reportage">${img(src, fx.title)}</a>`).join('');
    }

    // médiathèque
    const media = liveMedia();
    const homeMedia = media.filter(m => m.une).concat(media.filter(m => !m.une)).slice(0, 6);
    $('homeMedia').hidden = !s.afficher.mediaAccueil || !homeMedia.length;
    $('homeMediaGrid').innerHTML = homeMedia.map(mediaTile).join('');
    renderMediaPage();

    // moyens : aperçu (page services) + page dédiée
    const moyens = s.moyens.filter(m => m.actif !== false);
    $('moyensGrid').innerHTML = moyens.slice(0, 8).map(m => `<div class="equip reveal"><i class="fas ${safeIcon(m.icon)}"></i><div><b>${esc(m.title)}</b><small>${esc(m.description)}</small></div></div>`).join('');
    renderMoyensPage();
    $('zonesGrid').innerHTML = s.zones.map(z => `<div class="zone reveal"><i class="fas ${safeIcon(z.icon)}"></i><h3>${esc(z.title)}</h3><p>${esc(z.description)}</p></div>`).join('');

    renderPresse();

    // FAQ
    $$('[data-faq]').forEach(el => { el.innerHTML = s.faq.map((f, i) => `<div class="faq-item${i === 0 ? ' open' : ''}"><button class="faq-q" aria-expanded="${i === 0}"><span>${esc(f.q)}</span><i class="fas fa-angles-right"></i></button><div class="faq-a"><p>${nl2br(faqAnswer(f.r))}</p></div></div>`).join(''); });

    // offres d'emploi + formulaire de candidature
    const offres = (s.recrutement.offres || []).filter(o => o.actif !== false);
    $('offresList').innerHTML = offres.length ? offres.map(o => `<div class="offre reveal"><h3>${esc(o.titre)}</h3><div class="tags">${o.lieu ? `<span><i class="fas fa-location-dot"></i> ${esc(o.lieu)}</span>` : ''}${o.contrat ? `<span><i class="fas fa-file-signature"></i> ${esc(o.contrat)}</span>` : ''}${o.dateLimite ? `<span><i class="fas fa-hourglass-half"></i> Jusqu'au ${esc(o.dateLimite)}</span>` : ''}</div><p>${nl2br(o.description)}</p><a href="#postuler" class="btn btn-accent btn-sm" data-poste="${esc(o.titre)}" style="margin-top: 1rem;"><i class="fas fa-paper-plane"></i> Postuler</a></div>`).join('') : none('Aucun poste ouvert pour le moment. Les candidatures spontanées sont les bienvenues.');
    const ps = $('posteSelect'), pv = ps.value;
    ps.innerHTML = '<option value="">— Choisir —</option>' + offres.map(o => `<option>${esc(o.titre)}</option>`).join('') + '<option>Candidature spontanée</option>';
    ps.value = pv;

    // bandeau 24/7
    $$('[data-band]').forEach(el => {
        el.innerHTML = `<div class="wrap"><div><h2>${esc(s.bandeau247.titre)}</h2><p>${esc(s.bandeau247.texte)}</p>${s.admin.agrement ? `<p class="b-agr"><i class="fas fa-stamp"></i> Autorisation ${esc(s.admin.agrement)}</p>` : ''}</div>
        <div class="b-meta">${p1 ? `<a class="b-phone" href="${esc(telHref(p1))}"><i class="fas fa-phone"></i><span><small>Service joignable 24h/24</small><br><b>${esc(p1)}</b></span></a>` : ''}${wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener" class="btn btn-whatsapp b-wa"><i class="fab fa-whatsapp"></i> WhatsApp</a>` : ''}<a href="${pageHref('contact')}" class="btn btn-accent">Contactez-nous</a></div></div>`;
    });
    observeReveal();
}

/* ---------- contenus propres à ASG ---------- */
function renderAsg(s) {
    // 7 raisons de choisir ASG
    $('raisonsGrid').innerHTML = (s.raisons || []).map((r, i) => `<div class="raison reveal"><span class="r-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(r.titre)}</h3><p>${esc(r.texte)}</p></div>`).join('');
    $('homeRaisons').hidden = s.afficher.raisons === false || !(s.raisons || []).length;
    const offreOn = s.afficher.offre !== false && !!(s.tarifs.offre && s.tarifs.offre.valeur);
    $('homeOffre').hidden = !offreOn; $('tarifsOffre').hidden = !offreOn;
    $('homeOffreTxt').textContent = showPrices() ? 'Vigile non armé à partir de 100 000 F CFA par mois. Devis gratuit sous 48h après visite du site.' : 'Devis gratuit et personnalisé sous 48h après visite du site.';
    $$('.offre-mini').forEach(el => el.hidden = !offreOn);
    // mot du Directeur Général
    $('pdgMot').innerHTML = paras(s.pdg.mot || s.pdg.quote);
    // identification légale
    const A = s.admin, rows = [['Dénomination', 'AGENCE DE SÉCURITÉ GOUDIHAMA (ASG-SARL)'], ['Forme juridique', A.forme], ['Capital social', A.capital], ['RCCM', A.rccm], ['IFU', A.ifu], ['CNSS', A.cnss], ["Arrêté d'autorisation", A.agrement], ['Régime fiscal', A.regime]].filter(r => r[1]);
    $('idTable').innerHTML = rows.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
    // équipe
    const member = m => `<div class="member reveal"><div class="m-av">${m.photo ? img(m.photo, m.nom) : `<span>${esc(initials(m.nom))}</span>`}</div><div><h3>${esc(m.nom)}</h3><p class="m-role">${esc(m.fonction)}</p>${m.description ? `<p>${esc(m.description)}</p>` : ''}</div></div>`;
    $('teamDirection').innerHTML = (s.equipe || []).filter(m => m.niveau !== 'encadrement').map(member).join('');
    $('teamEncadrement').innerHTML = (s.equipe || []).filter(m => m.niveau === 'encadrement').map(member).join('');
    // formation
    $('modulesGrid').innerHTML = (s.formation.modules || []).map((m, i) => `<li class="reveal"><span>${i + 1}</span>${esc(m)}</li>`).join('');
    // horaires + dotation
    $('horairesTbl').innerHTML = '<thead><tr><th>Service</th><th>Horaire standard</th><th>Horaire alternatif</th></tr></thead><tbody>' + (s.horaires || []).map(h => `<tr><td><b>${esc(h.service)}</b></td><td>${esc(h.standard)}</td><td>${esc(h.alternatif)}</td></tr>`).join('') + '</tbody>';
    $('dotationTbl').innerHTML = '<tbody>' + (s.dotation || []).map(d => `<tr><td>${esc(d.designation)}</td><td class="q">${esc(d.quantite)}</td></tr>`).join('') + '</tbody>';
    // tarifs
    const SP = showPrices(); $$('.tarif-unit').forEach(el => el.hidden = !SP);
    $('tarifsGrid').innerHTML = (s.tarifs.lignes || []).map(t => { const dev = !SP || /devis/i.test(t.tarif); const m = String(t.tarif).match(/^(.*?)(\d[\d\s.]*)\s*(F\s*CFA)?$/i);
        const price = dev ? '<b class="p-amt">Sur devis</b>' : m ? `<small>${esc(m[1])}</small><b class="p-amt">${esc(m[2].trim())}</b><small>${esc(m[3] || '')}${m[3] ? ' / mois' : ''}</small>` : `<b class="p-amt">${esc(t.tarif)}</b>`;
        return `<div class="price reveal${dev ? '' : ' hot'}"><i class="fas ${safeIcon(t.icon)}"></i><h3>${esc(t.prestation)}</h3><div class="p-val">${price}</div><span class="p-reg"><i class="far fa-clock"></i> ${esc(t.regime)}</span><a href="${pageHref('devis')}" class="btn ${SP && dev ? 'btn-outline' : 'btn-accent'} btn-sm">Demander un devis</a></div>`; }).join('')
        + `<div class="price price-cta reveal"><i class="fas fa-puzzle-piece"></i><h3>Un dispositif sur mesure ?</h3><p>Plusieurs sites, plusieurs services, une mission ponctuelle : nous composons l'offre adaptée, avec remise dès 5 agents.</p><a href="${pageHref('devis')}" class="btn btn-accent btn-sm">Visite gratuite</a></div>`;
}
function initials(n) { const num = String(n || '').match(/^\s*(\d+)/); if (num) return num[1]; const w = String(n || '').replace(/^(M\.|Mme|Mlle)\s+/i, '').split(/\s+/).filter(x => /^[A-Za-zÀ-ÿ]/.test(x)); return w.length ? (w[0][0] + (w[1] ? w[1][0] : '')).toUpperCase() : '•'; }

/* ---------- cartes ---------- */
function newsCard(x, ph, label, href) {
    const cover = x.image || (x.galerie && x.galerie[0]) || '';
    return `<article class="news reveal${href ? ' clickable' : ''}"${href ? ` data-href="${esc(href)}"` : ''}>
        <div class="news-img">${cover ? img(cover, x.title) : '<img class="ph-emb" src="images/emblem-blanc.png" alt="">'}${label ? `<span class="news-date">${esc(label)}</span>` : ''}${x.galerie && x.galerie.length > 1 ? `<span class="news-photos"><i class="fas fa-images"></i> ${x.galerie.length}</span>` : ''}${x.video ? '<span class="news-photos news-vid"><i class="fas fa-circle-play"></i> Vidéo</span>' : ''}</div>
        <div class="news-body"><h3>${href ? `<a href="${esc(href)}">${esc(x.title)}</a>` : esc(x.title)}</h3><p>${nl2br(x.description)}</p>${href ? `<a href="${esc(href)}">Lire la suite <i class="fas fa-arrow-right"></i></a>` : x.link ? `<a href="${esc(safeUrl(x.link))}" target="_blank" rel="noopener">En savoir plus <i class="fas fa-arrow-right"></i></a>` : ''}</div></article>`;
}
function mediaTile(m) {
    const vi = videoInfo(m.video);
    const cover = m.image || m.photos[0] || (vi && vi.thumb) || '';
    const cat = catOf(m.category);
    const typeLab = m.type === 'video' ? ['fa-circle-play', 'Vidéo'] : m.type === 'document' ? ['fa-file-pdf', 'Document'] : ['fa-image', m.photos.length > 1 ? m.photos.length + ' photos' : 'Photo'];
    const ext = m.type === 'document' ? safeUrl(m.file) : (m.type === 'video' && vi && vi.kind === 'link') ? vi.url : '';
    return `<a class="m-tile reveal" href="${esc(ext || mediaHref(m.id))}"${ext ? ' target="_blank" rel="noopener"' : ''} data-type="${esc(m.type)}" data-cat="${esc(m.category)}">
        <span class="m-img">${cover ? img(cover, m.title) : `<i class="fas ${safeIcon(cat.icon)}"></i>`}</span>
        ${m.type === 'video' ? '<span class="m-play" aria-hidden="true"><i class="fas fa-play"></i></span>' : ''}
        <span class="m-badge"><i class="fas ${typeLab[0]}"></i> ${typeLab[1]}</span>
        <span class="m-info"><small>${esc(cat.label)}${m.date ? ' · ' + esc(m.date) : ''}</small><b>${esc(m.title)}</b></span></a>`;
}

/* ---------- vidéos (chargées seulement au clic) ---------- */
function videoInfo(url) {
    url = String(url || '').trim(); if (!url) return null;
    const y = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (y) return { kind: 'yt', id: y[1], thumb: `https://i.ytimg.com/vi/${y[1]}/hqdefault.jpg` };
    if (/^https:\/\/(www\.|m\.)?facebook\.com\/.+\/videos?\//i.test(url) || /^https:\/\/(www\.)?facebook\.com\/watch/i.test(url) || /^https:\/\/fb\.watch\//i.test(url)) return { kind: 'fb', url };
    if (/\.(mp4|webm)(\?.*)?$/i.test(url) && /^(https:\/\/|\/|images\/)/.test(url)) return { kind: 'mp4', url };
    return { kind: 'link', url: safeUrl(url) };
}
function videoEmbed(vi, cc) {
    if (!vi) return '';
    const allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    if (vi.kind === 'yt') return `<iframe src="https://www.youtube-nocookie.com/embed/${vi.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1${cc ? '&cc_load_policy=1&cc_lang_pref=fr&hl=fr' : ''}" title="Lecteur vidéo" allow="${allow}" allowfullscreen></iframe>`;
    if (vi.kind === 'fb') return `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(vi.url)}&show_text=false&autoplay=true" title="Lecteur vidéo" allow="${allow}" allowfullscreen></iframe>`;
    if (vi.kind === 'mp4') return `<video src="${esc(safeUrl(vi.url))}" controls autoplay playsinline></video>`;
    return '';
}
function renderPlayer(el, o) {
    const vi = videoInfo(o.url), poster = o.poster || (vi && vi.thumb) || '';
    const pic = poster ? img(poster, o.title) : '<span class="vp-ph"><i class="fas fa-film"></i></span>';
    if (!vi) { el.innerHTML = `<div class="vp vp-soon">${pic}<span class="vp-note"><i class="fas fa-clapperboard"></i> ${esc(o.soon || 'Vidéo bientôt disponible')}</span></div>`; return; }
    if (vi.kind === 'link') { el.innerHTML = `<a class="vp" href="${esc(vi.url)}" target="_blank" rel="noopener">${pic}<span class="vp-play"><i class="fas fa-up-right-from-square"></i></span><span class="vp-note">Voir la vidéo</span></a>`; return; }
    el.innerHTML = `<button type="button" class="vp" aria-label="Lire la vidéo : ${esc(o.title || '')}">${pic}<span class="vp-play"><i class="fas fa-play"></i></span></button>`;
    el.querySelector('button').onclick = () => { el.innerHTML = `<div class="vp vp-live">${videoEmbed(vi, o.cc)}</div>`; };
}

/* ---------- page Médiathèque ---------- */
let mediaFilter = 'all', mediaShown = 12;
function renderMediaPage() {
    const media = liveMedia();
    const count = f => media.filter(m => mediaMatches(m, f)).length;
    const chips = [['all', 'Tout', 'fa-border-all'], ['t:photo', 'Photos', 'fa-image'], ['t:video', 'Vidéos', 'fa-circle-play'], ['t:document', 'Documents', 'fa-file-pdf']]
        .concat(SITE.mediaCats.filter(c => c.actif !== false).map(c => ['c:' + c.id, c.label, c.icon]))
        .filter(([f]) => f === 'all' || count(f) > 0);
    if (!chips.some(c => c[0] === mediaFilter)) mediaFilter = 'all';
    $('mediaFilters').innerHTML = chips.map(([f, l, ic]) => `<button type="button" data-mf="${esc(f)}" class="${f === mediaFilter ? 'on' : ''}" aria-pressed="${f === mediaFilter}"><i class="fas ${safeIcon(ic)}"></i> ${esc(l)} <span>${count(f)}</span></button>`).join('');
    const list = media.filter(m => mediaMatches(m, mediaFilter));
    $('mediaGrid').innerHTML = list.length ? list.slice(0, mediaShown).map(mediaTile).join('') : '<p class="empty">La médiathèque est en cours de constitution.</p>';
    $('mediaMore').hidden = list.length <= mediaShown;
    observeReveal();
}
function mediaMatches(m, f) {
    if (f === 'all') return true;
    const [k, v] = f.split(':');
    return k === 't' ? m.type === v : m.category === v;
}
function openMedia(id) {
    const m = liveMedia().find(x => x.id === id);
    if (!m) return false;
    const cap = `<b>${esc(m.title)}</b>${m.description ? ' — ' + esc(m.description) : ''}<small>${esc(catOf(m.category).label)}${m.date ? ' · ' + esc(m.date) : ''}</small>`;
    const opts = { title: m.title, url: location.href, onClose: () => history.replaceState(null, '', pageHref('mediatheque')) };
    if (m.type === 'video') openViewer([{ video: m.video, poster: m.image, caption: cap }], 0, opts);
    else if (m.type === 'document') openViewer([{ src: m.image || 'images/logo-or.png', caption: cap + (m.file ? `<a class="lb-doc" href="${esc(safeUrl(m.file))}" target="_blank" rel="noopener"><i class="fas fa-file-arrow-down"></i> Ouvrir le document</a>` : '') }], 0, opts);
    else openViewer((m.photos.length ? m.photos : [m.image]).map(src => ({ src, caption: cap })), 0, opts);
    return true;
}

/* ---------- visionneuse (photos, vidéos, partage) ---------- */
let LB = { items: [], i: 0, opts: {} };
function openViewer(items, i, opts) { LB = { items, i: 0, opts: opts || {} }; showViewer(i); $('lightbox').classList.add('show'); document.body.classList.add('lb-open'); $('lbClose').focus(); }
function showViewer(k) {
    const n = LB.items.length; if (!n) return;
    LB.i = (k + n) % n;
    const it = LB.items[LB.i], vi = videoInfo(it.video);
    $('lbVideo').innerHTML = '';
    if (vi) {
        $('lbImg').style.display = 'none';
        if (vi.kind === 'link') $('lbVideo').innerHTML = `<a class="btn btn-accent" href="${esc(vi.url)}" target="_blank" rel="noopener"><i class="fas fa-up-right-from-square"></i> Voir la vidéo</a>`;
        else $('lbVideo').innerHTML = videoEmbed(vi, false);
    } else { $('lbImg').style.display = ''; $('lbImg').src = safeUrl(it.src); $('lbImg').alt = LB.opts.title || ''; }
    $('lbCap').innerHTML = it.caption || '';
    $('lbCount').textContent = n > 1 ? (LB.i + 1) + ' / ' + n : '';
    $('lbPrev').hidden = $('lbNext').hidden = n < 2;
    const url = LB.opts.url || location.href, t = LB.opts.title || document.title;
    $('lbWa').href = 'https://wa.me/?text=' + encodeURIComponent(t + ' — ' + url);
    $('lbFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    $('lbLi').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
    // préchargement de la photo suivante
    const nx = LB.items[(LB.i + 1) % n]; if (nx && nx.src && n > 1) { const p = new Image(); p.src = safeUrl(nx.src); }
}
function closeViewer() {
    if (!$('lightbox').classList.contains('show')) return;
    $('lightbox').classList.remove('show'); document.body.classList.remove('lb-open'); $('lbVideo').innerHTML = '';
    const cb = LB.opts.onClose; LB.opts = {}; if (cb) cb();
}
$('lbClose').addEventListener('click', closeViewer);
$('lbPrev').addEventListener('click', () => showViewer(LB.i - 1));
$('lbNext').addEventListener('click', () => showViewer(LB.i + 1));
$('lightbox').addEventListener('click', e => { if (e.target === $('lightbox') || e.target === $('lbStage')) closeViewer(); });
document.addEventListener('keydown', e => { if (!$('lightbox').classList.contains('show')) return; if (e.key === 'ArrowRight') showViewer(LB.i + 1); if (e.key === 'ArrowLeft') showViewer(LB.i - 1); if (e.key === 'Escape') closeViewer(); });
(() => { let x0 = null; const lb = $('lightbox'); lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true }); lb.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) showViewer(LB.i + (dx < 0 ? 1 : -1)); x0 = null; }, { passive: true }); })();

/* ---------- page Moyens ---------- */
let moyFilter = 'all';
function renderMoyensPage() {
    const list = SITE.moyens.filter(m => m.actif !== false);
    const cats = MOYENS_CATS.filter(([c]) => list.some(m => m.categorie === c));
    if (moyFilter !== 'all' && !cats.some(c => c[0] === moyFilter)) moyFilter = 'all';
    $('moyensFilters').innerHTML = [['all', 'Tout', 'fa-border-all']].concat(cats).map(([c, l, ic]) => `<button type="button" data-moy="${c}" class="${c === moyFilter ? 'on' : ''}" aria-pressed="${c === moyFilter}"><i class="fas ${ic}"></i> ${esc(l)}</button>`).join('');
    const lab = c => (MOYENS_CATS.find(x => x[0] === c) || MOYENS_CATS[5])[1];
    const shown = list.filter(m => moyFilter === 'all' || m.categorie === moyFilter);
    $('kitGrid').innerHTML = shown.length ? shown.map(m => `<div class="kit reveal"><div class="kit-img">${m.image ? img(m.image, m.title) : `<i class="fas ${safeIcon(m.icon)}"></i>`}</div><div class="kit-body"><small>${esc(lab(m.categorie))}</small><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p></div></div>`).join('') : '<p class="empty">Aucun équipement dans cette catégorie.</p>';
    observeReveal();
}

/* ---------- Espace presse ---------- */
function renderPresse() {
    const P = SITE.presse, items = (P.items || []).filter(x => x.actif !== false);
    $('pressGroups').innerHTML = PRESS_TYPES.map(([t, l, ic]) => {
        const g = items.filter(x => (x.type || 'document') === t); if (!g.length) return '';
        return `<h3 class="h-sub"><i class="fas ${ic}"></i> ${l}</h3><div class="press-grid">${g.map(x => {
            const file = safeUrl(x.fichier), link = safeUrl(x.lien), prev = x.image || (/\.(png|jpe?g|webp|gif)$/i.test(x.fichier || '') ? x.fichier : '');
            return `<div class="press-card"><div class="press-prev${t === 'logo' ? ' logo' : ''}">${prev ? img(prev, x.titre) : `<i class="fas ${ic}"></i>`}</div><div class="press-body"><b>${esc(x.titre)}</b>${x.description ? `<p>${esc(x.description)}</p>` : ''}
                <div class="press-acts">${file ? `<a class="btn btn-accent btn-sm" href="${esc(file)}" download><i class="fas fa-download"></i> Télécharger</a>` : ''}${link ? `<a class="btn btn-dark btn-sm" href="${esc(link)}" target="_blank" rel="noopener"><i class="fas fa-up-right-from-square"></i> Voir</a>` : ''}</div></div></div>`;
        }).join('')}</div>`;
    }).join('') || '<p class="empty">Les ressources presse seront bientôt disponibles.</p>';
    const hasC = P.contactNom || P.contactEmail || P.contactTel;
    $('pressContact').innerHTML = `<h3>Contact presse</h3>` + (hasC
        ? `${P.contactNom ? `<p><b>${esc(P.contactNom)}</b></p>` : ''}${P.contactTel ? `<p><i class="fas fa-phone"></i> <a href="${esc(telHref(P.contactTel))}">${esc(P.contactTel)}</a></p>` : ''}${P.contactEmail ? `<p><i class="fas fa-envelope"></i> <a href="mailto:${esc(P.contactEmail)}">${esc(P.contactEmail)}</a></p>` : ''}`
        : `<p>Pour toute demande des médias, contactez-nous :</p>${SITE.contact.phone1 ? `<p><i class="fas fa-phone"></i> <a href="${esc(telHref(SITE.contact.phone1))}">${esc(SITE.contact.phone1)}</a></p>` : ''}${SITE.contact.email ? `<p><i class="fas fa-envelope"></i> <a href="mailto:${esc(SITE.contact.email)}">${esc(SITE.contact.email)}</a></p>` : ''}`);
    $('pressNews').innerHTML = liveNews().slice(0, 4).map(({ a, i }) => `<a class="side-link" href="${artHref(i)}">${esc(a.title)} <i class="fas fa-angle-right"></i></a>`).join('') || '<p>Aucun communiqué.</p>';
}

/* ---------- page d'un service ---------- */
function showService(i) {
    const s = SITE.services[i];
    if (!s) return false;
    $('svcTitle').textContent = s.title; $('svcCrumb').textContent = s.title; $('svcH2').textContent = s.title;
    $('svcDesc').textContent = noPrices(s.description);
    $('svcDetails').innerHTML = paras(noPrices(s.details));
    const box = $('svcImg'); box.style.backgroundImage = s.image ? cssUrl(s.image) : ''; box.innerHTML = s.image ? '' : `<i class="fas ${safeIcon(s.icon)}"></i>`;
    $('svcSideList').innerHTML = SITE.services.map((x, j) => `<a class="side-link${j === i ? ' on' : ''}" href="${svcHref(j)}">${esc(x.title)} <i class="fas fa-angle-right"></i></a>`).join('');
    const sel = $('besoinSelect'); if ([...sel.options].some(o => o.value === s.title)) sel.dataset.pref = s.title;
    return true;
}

/* ---------- article ---------- */
function showArticle(i) {
    const a = SITE.actualites[i];
    if (!a || !isLive(a)) return false;
    $('artCrumb').textContent = a.title; $('artTitle').textContent = a.title; $('artDate').innerHTML = a.date ? `<i class="far fa-calendar"></i> ${esc(a.date)}` : '';
    $('artCover').innerHTML = a.image ? `<img src="${esc(safeUrl(a.image))}" alt="${esc(a.title)}" decoding="async">` : '';
    $('artCover').style.display = a.image ? '' : 'none';
    $('artBody').innerHTML = paras(a.contenu || a.description);
    $('artVideoWrap').style.display = a.video ? '' : 'none';
    if (a.video) renderPlayer($('artVideo'), { url: a.video, poster: a.image, title: a.title });
    const gal = (a.galerie || []).filter(Boolean);
    $('artGalleryWrap').style.display = gal.length ? '' : 'none';
    $('artGallery').innerHTML = gal.map((g, k) => `<button type="button" class="art-thumb" data-gal="${k}" aria-label="Agrandir la photo ${k + 1}">${img(g, '')}</button>`).join('');
    const docs = (a.documents || []).filter(d => d && d.url);
    $('artDocsWrap').style.display = docs.length ? '' : 'none';
    $('artDocs').innerHTML = docs.map(d => `<a class="doc" href="${esc(safeUrl(d.url))}" target="_blank" rel="noopener"><i class="fas fa-file-pdf"></i><span>${esc(d.titre || 'Document')}</span><i class="fas fa-download"></i></a>`).join('');
    const others = liveNews().filter(o => o.i !== i);
    $('artSide').innerHTML = others.map(({ a: x, i: j }) => `<a class="side-link" href="${artHref(j)}">${esc(x.title)} <i class="fas fa-angle-right"></i></a>`).join('') || '<p>Aucune autre actualité.</p>';
    $('artSimilarWrap').hidden = !others.length;
    $('artSimilar').innerHTML = others.slice(0, 3).map(({ a: x, i: j }) => newsCard(x, 'fa-newspaper', x.date, artHref(j))).join('');
    const url = PATH_MODE ? location.origin + artHref(i) : location.href;
    $('shareWa').href = 'https://wa.me/?text=' + encodeURIComponent(a.title + ' — ' + url);
    SHARE_DATA = { title: a.title, url };
    $('shareFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    $('shareLi').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
    $('artGallery').onclick = e => { const b = e.target.closest('[data-gal]'); if (b) openViewer(gal.map(src => ({ src, caption: `<b>${esc(a.title)}</b>` })), Number(b.dataset.gal), { title: a.title, url }); };
    return true;
}
let SHARE_DATA = null;
if (navigator.share) {
    $('shareNative').hidden = false;
    $('shareNative').addEventListener('click', () => {
        const d = SHARE_DATA || { title: document.title, url: location.href };
        navigator.share({ title: d.title, text: d.title, url: d.url }).catch(() => {});
    });
}
$('shareCopy').addEventListener('click', () => { (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(() => toast('Lien copié'), () => prompt('Copiez ce lien :', location.href)); });

/* ---------- navigation ---------- */
let lastPage = null;
function route() {
    let { page, arg } = currentRoute();
    if (page === 'admin') { location.href = 'admin.html'; return; }
    if (page === 'service' && !showService(arg)) page = 'services';
    if (page === 'article' && !showArticle(arg)) page = 'actualites';
    if (page === 'devis' && $('besoinSelect').dataset.pref && !$('besoinSelect').value) $('besoinSelect').value = $('besoinSelect').dataset.pref;
    const samePage = page === lastPage && page === 'mediatheque';
    $$('.page').forEach(p => p.classList.toggle('active', p.id === 'p-' + page));
    const nav = page === 'service' ? 'services' : ['methode', 'references', 'faq'].includes(page) ? 'apropos' : ['article', 'presse', 'mediatheque'].includes(page) ? 'actualites' : page === 'devis' ? 'tarifs' : page;
    $$('#menu [data-page]').forEach(a => a.classList.toggle('current', a.dataset.page === nav));
    $$('#hnav [data-hpage]').forEach(a => a.classList.toggle('current', a.dataset.hpage === page || (a.dataset.hpage !== 'devis' && a.dataset.hpage === nav)));
    $$('[data-qtab]').forEach(a => a.classList.toggle('on', a.dataset.qtab === nav));
    $$('#menu .dd').forEach(d => d.classList.toggle('open', !!d.querySelector('.current')));
    $$('#menu .dd-panel a').forEach(a => a.classList.toggle('here', a.getAttribute('href') === location.pathname || a.getAttribute('href') === location.hash));
    const t = document.querySelector('#p-' + page).dataset.title;
    const title = page === 'service' ? SITE.services[arg].title : page === 'article' ? SITE.actualites[arg].title : t;
    document.title = (page === 'accueil' ? 'ASG-SARL – Agence de Sécurité Goudihama | Sécurité privée au Burkina Faso' : title + ' – ASG-SARL');
    const md = document.querySelector('meta[name="description"]');
    if (md) md.content = page === 'service' ? SITE.services[arg].description : page === 'article' ? SITE.actualites[arg].description : (PAGE_DESC[page] || PAGE_DESC.accueil);
    closeMenu();
    if (page === 'mediatheque' && arg) { if (!openMedia(arg)) history.replaceState(null, '', pageHref('mediatheque')); }
    else if (LB.opts && LB.opts.onClose) { LB.opts.onClose = null; closeViewer(); }
    lastPage = page;
    const anchor = sessionStorage.getItem('asg_anchor'); sessionStorage.removeItem('asg_anchor');
    if (anchor && $(anchor)) setTimeout(() => scrollToY($(anchor).getBoundingClientRect().top - scrollBase() + scrollPos() - 90, true), 60);
    else if (!samePage) scrollToY(0);
    requestAnimationFrame(observeReveal);
}
window.addEventListener('hashchange', () => { if (!PATH_MODE) route(); });
window.addEventListener('popstate', () => { if (PATH_MODE) route(); });

document.addEventListener('click', e => {
    // liens internes : navigation sans rechargement
    const a = e.target.closest('a[href]');
    if (a && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !a.target && !a.hasAttribute('download')) {
        const href = a.getAttribute('href');
        if (a.dataset.poste !== undefined) { e.preventDefault(); $('posteSelect').value = a.dataset.poste; $('postuler').scrollIntoView({ behavior: 'smooth' }); return; }
        if (href === '#top' || href === '#main') { e.preventDefault(); scrollToY(href === '#top' ? 0 : $('main').offsetTop - 70, true); if (href === '#main') $('main').focus({ preventScroll: true }); return; }
        if (href === '#postuler') { e.preventDefault(); $('postuler').scrollIntoView({ behavior: 'smooth' }); return; }
        if (href.startsWith('#')) {
            const r = parseHash(href.slice(1));
            if (r) { e.preventDefault(); go(hrefFor(r), a.dataset.anchor); }
        } else if (PATH_MODE && href.startsWith('/') && !href.startsWith('/api') && !href.startsWith('/admin') && !/\.[a-z0-9]{2,4}$/i.test(href)) {
            e.preventDefault(); go(href, a.dataset.anchor);
        }
    }
    const lg = e.target.closest('[data-legal]');
    if (lg) { e.preventDefault(); openLegal(lg.dataset.legal); }
    const q = e.target.closest('.faq-q');
    if (q) {
        const item = q.parentElement, box = item.parentElement, open = item.classList.contains('open');
        box.querySelectorAll('.faq-item').forEach(x => { x.classList.remove('open'); x.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
        if (!open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    }
    const card = e.target.closest('.news.clickable');
    if (card && !e.target.closest('a')) { go(card.dataset.href); return; }
    const tb = e.target.closest('.f-tabs button');
    if (tb) { $$('.f-tabs button').forEach(b => { const on = b === tb; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); }); $$('.f-panel').forEach(pn => pn.hidden = pn.dataset.panel !== tb.dataset.tab); }
    const mf = e.target.closest('[data-mf]');
    if (mf) { mediaFilter = mf.dataset.mf; mediaShown = 12; renderMediaPage(); }
    const mo = e.target.closest('[data-moy]');
    if (mo) { moyFilter = mo.dataset.moy; renderMoyensPage(); }
});
$('mediaMore').addEventListener('click', () => { mediaShown += 12; renderMediaPage(); });

// menu mobile
// menu vertical : tiroir sur mobile, sous-menus en accordéon
function closeMenu() { document.body.classList.remove('menu-open'); $('burger').innerHTML = '<i class="fas fa-bars"></i>'; $('burger').setAttribute('aria-expanded', 'false'); }
$('burger').addEventListener('click', () => { const o = document.body.classList.toggle('menu-open'); $('burger').innerHTML = o ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>'; $('burger').setAttribute('aria-expanded', String(o)); });
$('scrim').addEventListener('click', closeMenu);
$$('.dd > a').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    const d = a.parentElement, open = !d.classList.contains('open');
    $$('.dd.open').forEach(x => { if (x !== d) x.classList.remove('open'); });
    d.classList.toggle('open', open); a.setAttribute('aria-expanded', String(open));
}, true));

// en-tête collant + bouton haut de page
function onScroll() {
    const y = scrollPos();
    $('navBar').classList.toggle('stuck', y > 30);
    $('toTop').classList.toggle('show', y > 600);
}
window.addEventListener('scroll', onScroll, { passive: true });
$('mainCol').addEventListener('scroll', onScroll, { passive: true });

// apparitions + barres de compétences
let io = null;
function observeReveal() {
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(el => el.classList.add('in')); $$('.skill-bar span').forEach(b => b.style.width = b.dataset.pct + '%'); return; }
    io = io || new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.id === 'skills') en.target.querySelectorAll('.skill-bar span').forEach(b => b.style.width = b.dataset.pct + '%');
        io.unobserve(en.target);
    }), { threshold: 0.12 });
    $$('.page.active .reveal:not(.in), .page.active #skills').forEach(el => io.observe(el));
}

// textes légaux
function openLegal(key) {
    const titles = { mentions: 'Mentions légales', cgu: "Conditions générales d'utilisation", privacy: 'Politique de confidentialité' };
    $('legalTitle').textContent = titles[key];
    $('legalBody').innerHTML = SITE.legal[key] || '<p>Contenu bientôt disponible.</p>';
    $('legalModal').classList.add('show'); $('legalClose').focus();
}
function closeLegal() { $('legalModal').classList.remove('show'); }
$('legalClose').addEventListener('click', closeLegal);
$('legalModal').addEventListener('click', e => { if (e.target === $('legalModal')) closeLegal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLegal(); closeMenu(); } });

// formulaires (devis, message, candidature) : même envoi, référence renvoyée par le serveur
async function sendForm(e, type, msgId, btnId, okText) {
    e.preventDefault();
    const f = e.target, msg = $(msgId), btn = $(btnId);
    msg.className = 'form-msg';
    if (!f.checkValidity()) { msg.textContent = 'Merci de remplir tous les champs obligatoires (*) correctement.'; msg.className = 'form-msg err'; f.reportValidity(); return; }
    btn.disabled = true; const old = btn.innerHTML; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Envoi en cours…';
    try {
        const data = Object.fromEntries(new FormData(f).entries()); data.type = type; delete data.consent;
        const r = await fetch(API + '/devis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || 'service indisponible');
        f.reset();
        msg.innerHTML = `<i class="fas fa-circle-check"></i> ${okText}${d.reference ? `<br>Votre numéro de référence : <b class="ref">${esc(d.reference)}</b> — notez-le pour le suivi.` : ''}`;
        msg.className = 'form-msg ok';
    } catch (err) {
        msg.textContent = "L'envoi a échoué (" + err.message + '). Appelez-nous au ' + (SITE.contact.phone1 || '') + '.'; msg.className = 'form-msg err';
    } finally { btn.disabled = false; btn.innerHTML = old; msg.focus(); }
}
$('devisForm').addEventListener('submit', e => sendForm(e, 'devis', 'devisMsg', 'devisBtn', 'Demande de devis envoyée ! La Direction vous recontacte sous 48h.'));
$('msgForm').addEventListener('submit', e => sendForm(e, 'message', 'msgMsg', 'msgBtn', 'Message envoyé ! Nous vous répondons rapidement.'));
$('candForm').addEventListener('submit', e => sendForm(e, 'candidature', 'candMsg', 'candBtn', 'Candidature envoyée ! Notre service du personnel vous recontactera.'));

$('year').textContent = new Date().getFullYear();
init();
