# ASG-SARL — site + administration (asg-goudihama.com)

Site de l'Agence de Sécurité Goudihama, construit sur le même modèle que le site BPS Protection :
site public + administration (identifiant et mot de passe) + serveur Cloudflare.
Charte : blanc dominant, bleu du logo, jaune des étoiles et des tenues ASG.

## Tester sur votre ordinateur (sans internet ni Cloudflare)
1. Décompressez le ZIP dans un dossier.
2. Double-cliquez sur **TESTER-EN-LOCAL.bat** (ou sur **index.html**).
3. Lien « Administration » en bas de page (ou **admin.html**)
   identifiant : **asggoudihama** — mot de passe : **goudihama2040**
4. Modifiez, cliquez « Publier », puis rechargez index.html.

Un bandeau rouge « MODE TEST LOCAL » rappelle que rien n'est en ligne.
Pour repartir de zéro : console du navigateur (F12) → asgLocalReset()

## Mettre en ligne sur Cloudflare (première fois)
1. Cloudflare → Storage & Databases → KV → Create → nom : **asg-data**
2. Double-cliquez sur **METTRE-EN-LIGNE.bat** (Node.js LTS requis une seule fois).
   Si Wrangler demande de créer le projet « asg-goudihama », répondez oui (branche de production : main).
3. Cloudflare → Workers & Pages → asg-goudihama → Settings → Bindings → Add → KV namespace
   nom de variable : **ASG_KV** → espace : asg-data
4. Relancez METTRE-EN-LIGNE.bat pour activer la liaison.
5. Ouvrez https://asg-goudihama.pages.dev/admin → connectez-vous → cliquez une fois « Publier ».
6. **Changez tout de suite le mot de passe** : Administration → Mon compte.

## Brancher le nom de domaine asg-goudihama.com
- Projet asg-goudihama → Custom domains → Set up a custom domain → **asg-goudihama.com**
  (ajoutez aussi **www.asg-goudihama.com** : il redirige automatiquement vers asg-goudihama.com).
- Si le domaine est déjà chez Cloudflare, les enregistrements DNS se créent tout seuls.
  Sinon, Cloudflare indique l'enregistrement CNAME à ajouter chez votre registraire.

## Adresses email
Le site affiche contact@asg-goudihama.com et recrutement@asg-goudihama.com.
Pour qu'elles reçoivent du courrier : Cloudflare → asg-goudihama.com → Email → Email Routing,
puis faites suivre chaque adresse vers une boîte Gmail de la direction. Vous pouvez aussi les
changer dans Administration → Contact & infos légales.

## Ce que l'administration permet de modifier
- Accueil : textes, mot et photo du Directeur Général, chiffres clés, sections affichées
- À propos : présentation, mission/vision/valeurs, 5 valeurs, 7 raisons de choisir ASG
- Services (8), moyens et équipements, zones, PC radio
- **Organisation & méthode** : équipe (direction / encadrement, photos facultatives), critères de
  recrutement, 12 modules de formation, horaires, contrôles, registres, dotation des agents
- **Tarifs & offre** : grille tarifaire, conditions commerciales, offre de lancement −15 %
  (décochez « Bandeau de l'offre » dans Accueil & Direction quand elle expire)
- Actualités, médiathèque (photos, vidéos, PDF), espace presse, carrières, FAQ, textes légaux
- Devis, messages et candidatures reçus (avec numéro de référence)
- Photos du site (Photos & réseaux sociaux) : ajoutez de vraies photos des agents en tenue
  jaune ASG — sans photo, l'emblème ASG est affiché sur fond bleu
- Sauvegarde : téléchargement / import du contenu

Fichiers : index.html, style.css, public.js (site) · admin.html, admin.js (administration) ·
site-defaults.js (contenu d'origine, tiré de l'offre de services 2026) · local-api.js (mode test local) ·
_worker.js (serveur Cloudflare) · images/ (logos, emblème, favicon, image de partage)

## Application installable (PWA) et antizoom
- Le site public et l'administration peuvent s'installer sur l'écran d'accueil (Android : menu du navigateur → Installer ; iPhone : Partager → Sur l'écran d'accueil).
  L'administration propose un bandeau « Installer » sur Android/Chrome.
- Fichiers : manifest.json (site), manifest-admin.json (administration), sw.js (service worker), pwa.js (enregistrement, antizoom, installation),
  hors-ligne.htm (page affichée sans connexion), images/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png.
- Hors ligne : les pages déjà visitées restent lisibles ; /api et /admin ne sont jamais mis en cache.
- Antizoom : administration = zoom bloqué ; site public = pas de zoom au double-tap et champs à 16 px (pas de zoom automatique sur iPhone),
  le pincement n'est bloqué que dans l'application installée, pour garder l'accessibilité dans le navigateur.
- Après toute modification de sw.js, changer la constante VERSION en tête de fichier.
- Le service worker ne s'active qu'en https (asg-goudihama.com / pages.dev), pas en test local.
- Fonctions natives du site public : bouton « Partager » du téléphone sur les actualités (menu de partage natif, affiché seulement s'il existe)
  et barre « Appeler / WhatsApp » en bas de l'écran sur mobile (numéros pris dans l'administration → Contact et réseaux sociaux).

## Notifications push
- Les visiteurs touchent « Recevoir nos actualités » dans le pied de page du site ; le navigateur demande l'autorisation.
  Sur iPhone, cela ne marche que depuis l'application installée sur l'écran d'accueil (iOS 16.4 ou plus récent).
- Vous envoyez un message depuis Administration → Notifications (titre, message, page à ouvrir). Aucun abonné ne reçoit rien sans y avoir consenti.
- Aucune configuration supplémentaire : les clés d'envoi (VAPID) se créent toutes seules au premier usage et sont gardées dans le KV (clé « push:vapid »).
  Ne supprimez pas cette clé : les abonnés actuels ne recevraient plus rien et devraient se réabonner.
- L'envoi se fait par lots de 20 abonnés (limite de l'offre gratuite de Cloudflare) ; l'écran enchaîne les lots tout seul.
  Les abonnements expirés (appareil réinitialisé, notifications coupées) sont retirés automatiquement à l'envoi.
- Ne fonctionne qu'en ligne (https), pas en test local.

## Tarifs : montants masqués (« Sur devis »)
- Par défaut, aucun montant n'est affiché : chaque carte de la page Tarifs indique « Sur devis » avec le bouton « Demander un devis ».
  Les montants cités dans la FAQ, les pages services, le bandeau de l'accueil et la description de la page Tarifs sont masqués aussi.
- Pour réafficher les montants : Administration → Tarifs → cocher « Afficher les montants sur le site », puis Publier.
  Les montants saisis dans la grille tarifaire sont conservés dans tous les cas.
- Le capital social (mentions légales) et les textes des actualités ne sont pas touchés.

