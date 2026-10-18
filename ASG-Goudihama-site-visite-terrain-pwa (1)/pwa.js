/* ASG-SARL – fonctions « application » : service worker, antizoom, installation */
(function () {
  'use strict';
  var ADMIN = /^\/admin(\/|\.|$)/.test(location.pathname) || document.documentElement.hasAttribute('data-admin');

  // 1. Service worker (uniquement en https ou localhost ; ignoré en test local file://)
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  // 2. Antizoom. Site public dans le navigateur : seulement touch-action (CSS), pour garder le zoom d'accessibilité.
  //    Administration ou appli installée : blocage du pincement (iOS ignore user-scalable=no).
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (ADMIN || standalone) {
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (t) {
      document.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false });
    });
    document.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    }, { passive: false });
  }

  // 3. Installation de l'application
  //    - site public (téléphone/tablette) : bannière en haut de page dès l'arrivée (Android : bouton « Installer » ; iPhone : mode d'emploi)
  //    - administration : petit bandeau en bas
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  var deferred = null;
  var KEY = ADMIN ? 'asg-install-ignore' : 'asg-pub-install';
  var DAYS = 7;
  function ignored() {
    try { var t = Number(localStorage.getItem(KEY)); if (!t) return false; if (KEY === 'asg-install-ignore' || Date.now() - t < DAYS * 864e5) return true; localStorage.removeItem(KEY); } catch (x) {}
    return false;
  }
  function ignore() { try { localStorage.setItem(KEY, String(Date.now())); } catch (x) {} }
  function mobileView() { return window.matchMedia('(max-width: 900px)').matches; }
  var shown = false;
  function banner(ios) {
    if (shown || standalone || ignored() || (!ADMIN && !mobileView())) return;
    shown = true;
    var bar = document.createElement('div');
    bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'Installer l\u2019application');
    var btn = 'border:0;border-radius:9px;padding:9px 13px;font:700 13px system-ui,sans-serif;cursor:pointer;';
    if (ADMIN) {
      bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;display:flex;gap:10px;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:12px;background:#062f5f;color:#fff;font:600 14px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.3)';
      bar.innerHTML = '<span>Installer l\u2019administration sur cet appareil ?</span><span style="display:flex;gap:8px"><button type="button" data-a="no" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);' + btn + '">Non</button><button type="button" data-a="yes" style="background:#ffc20e;color:#062f5f;' + btn + '">Installer</button></span>';
    } else {
      bar.style.cssText = 'position:relative;z-index:950;display:flex;align-items:center;gap:11px;padding:10px 12px;background:linear-gradient(90deg,#0a5fae,#062f5f);color:#fff;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 2px 10px rgba(6,47,95,.25)';
      bar.innerHTML = '<img src="/images/icon-192.png" alt="" width="42" height="42" style="border-radius:10px;flex:none;background:#fff">'
        + '<span style="flex:1;min-width:0;line-height:1.25"><b style="display:block;font-size:13px">Installer l\u2019application</b>'
        + '<span style="font-size:11.5px;opacity:.9">' + (ios ? 'Touchez <i class="fas fa-arrow-up-from-bracket"></i> Partager, puis \u00ab\u00a0Sur l\u2019\u00e9cran d\u2019accueil\u00a0\u00bb' : 'ASG-SARL sur votre écran d\u2019accueil') + '</span></span>'
        + (ios ? '' : '<button type="button" data-a="yes" style="background:#ffc20e;color:#062f5f;flex:none;' + btn + '">Installer</button>')
        + '<button type="button" data-a="no" aria-label="Fermer" style="background:transparent;color:#fff;font-size:22px;line-height:1;padding:4px 6px;border:0;cursor:pointer;flex:none">\u00d7</button>';
    }
    bar.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[data-a]') : null, a = t && t.getAttribute('data-a');
      if (!a) return;
      if (a === 'yes' && deferred) { deferred.prompt(); deferred = null; } else { ignore(); }
      bar.remove();
    });
    if (ADMIN) document.body.appendChild(bar);
    else document.body.insertBefore(bar, document.querySelector('.app') || document.body.firstChild);
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; banner(false); });
  // iPhone / iPad (Safari) : pas d'événement d'installation, on affiche le mode d'emploi
  var iosSafari = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
  if (!ADMIN && iosSafari && !standalone && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { setTimeout(function () { banner(true); }, 2300); });   // après l'écran d'ouverture
  }
  window.addEventListener('appinstalled', function () { deferred = null; });

  // 4. Notifications push : bouton « Recevoir les notifications » (pied de page du site public)
  (function () {
    if (ADMIN) return;
    var btn = document.getElementById('pushOptIn');
    if (!btn) return;
    var secure = location.protocol === 'https:' || location.hostname === 'localhost';
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    var supported = secure && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!supported && !(secure && ios && !standalone)) return;   // iPhone hors application installée : on explique quoi faire
    var say = function (m) { if (typeof window.toast === 'function') window.toast(m); else alert(m); };
    var reg = null;
    function label(on) { btn.innerHTML = on ? '<i class="fas fa-bell-slash"></i> Désactiver les notifications' : '<i class="fas fa-bell"></i> Recevoir nos actualités'; btn.dataset.on = on ? '1' : ''; }
    function key(b64) { var p = '='.repeat((4 - b64.length % 4) % 4), s = atob((b64 + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, function (c) { return c.charCodeAt(0); }); }
    function post(path, data) { return fetch('/api' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Erreur'); return j; }); }); }
    btn.hidden = false; label(false);
    if (supported) {
      navigator.serviceWorker.ready.then(function (r) { reg = r; return r.pushManager.getSubscription(); }).then(function (sub) { if (sub && Notification.permission === 'granted') label(true); }).catch(function () {});
    }
    btn.addEventListener('click', function () {
      if (!supported) { say('Sur iPhone : touchez Partager, puis « Sur l\u2019écran d\u2019accueil », ouvrez l\u2019application et réactivez ce bouton.'); return; }
      btn.disabled = true;
      var done = function () { btn.disabled = false; };
      navigator.serviceWorker.ready.then(function (r) {
        reg = r;
        return r.pushManager.getSubscription().then(function (sub) {
          if (sub) {   // désabonnement
            return post('/push/unsubscribe', { endpoint: sub.endpoint }).catch(function () {}).then(function () { return sub.unsubscribe(); }).then(function () { label(false); say('Notifications désactivées.'); });
          }
          return Notification.requestPermission().then(function (perm) {
            if (perm !== 'granted') { say('Notifications refusées : autorisez-les dans les réglages du navigateur pour ce site.'); return; }
            return fetch('/api/push/key').then(function (x) { return x.json(); }).then(function (k) {
              return r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key(k.key) });
            }).then(function (s2) { return post('/push/subscribe', { subscription: s2.toJSON() }); })
              .then(function () { label(true); say('Notifications activées. Merci !'); });
          });
        });
      }).catch(function (e) { say('Activation impossible : ' + (e && e.message ? e.message : 'réessayez.')); }).then(done, done);
    });
  })();
})();
