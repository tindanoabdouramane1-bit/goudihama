/* Contenu par défaut du site ASG-SARL (Agence de Sécurité Goudihama) — partagé par index.html et admin.html.
   Le contenu réel est celui publié depuis l'administration (stocké chez Cloudflare).
   Source : « Offre de Services ASG-SARL », édition 2026. */
'use strict';
window.ASG_DEFAULT_SITE = {
    logo: 'images/logo-or.png',
    hero: {
        title: 'Agence de Sécurité Goudihama',
        slogan: 'Votre sécurité, notre priorité',
        intro: "ASG-SARL protège les personnes et les biens au Burkina Faso : gardiennage, sécurité électronique, sécurité cynophile, protection rapprochée, escorte, audit et formation. Des agents formés, une supervision constante et une intervention sur site en moins de 10 minutes."
    },
    pdg: {
        name: 'Abdouramane TINDANO',
        title: 'Directeur Général & Chef des Opérations',
        quote: '« Notre ambition est claire : devenir votre partenaire de confiance en matière de sécurité, en alliant proximité, réactivité et excellence du service. »',
        mot: "Madame, Monsieur,\n\nDans un contexte sécuritaire en constante évolution, la protection des personnes et des biens n'est plus une option : c'est une exigence absolue. C'est dans cette conviction que nous avons fondé l'Agence de Sécurité Goudihama (ASG-SARL), une société burkinabè dédiée à offrir des prestations de sécurité fiables, professionnelles et adaptées aux réalités du terrain.\n\nForts d'une équipe encadrée par des professionnels expérimentés du métier — anciens agents, formateurs certifiés et consultants en sûreté — nous mettons à votre disposition une organisation rigoureuse, des agents formés selon les normes homologuées par le Ministère de la Sécurité, et une disponibilité opérationnelle 24 heures sur 24.\n\nNotre ambition est claire : devenir votre partenaire de confiance en matière de sécurité, en alliant proximité, réactivité et excellence du service. Nous serions honorés de mettre notre savoir-faire au service de la protection de votre patrimoine, de vos collaborateurs et de vos activités.",
        photo: '', photo2: ''
    },
    stats: [
        { number: '24h/24', label: 'Disponibilité opérationnelle' },
        { number: '10 min', label: "Délai d'intervention sur site" },
        { number: '45 km', label: 'Couverture radio VHF/UHF' },
        { number: '12', label: 'Modules de formation homologués' }
    ],
    services: [
        { title: 'Gardiennage statique', icon: 'fa-user-shield', image: '', link: '',
          description: 'Surveillance et protection de sites résidentiels, commerciaux, industriels, banques, ambassades, ONG, mines, écoles, hôtels, chantiers et entrepôts.',
          details: "Nos agents de surveillance et de protection (A.S.P.), encadrés par un chef de poste, assurent une présence dissuasive et une surveillance continue de votre site, de jour comme de nuit.\n\nSur chaque poste, ils tiennent les registres réglementaires :\n- Registre de mouvement du mobilier et du matériel (entrées et sorties)\n- Registre des visiteurs (identité, motif, horaires)\n- Registre des communications (appels reçus et émis)\n- Registre des anomalies (incidents constatés, signalements)\n- Cahier de consignes propres au site et procédures d'urgence\n\nAucun poste n'est laissé vacant : tout agent absent est immédiatement remplacé. Rondes radio toutes les 20 à 30 minutes et contrôles inopinés de jour comme de nuit." },
        { title: 'Sécurité électronique', icon: 'fa-video', image: '', link: '',
          description: "Vidéosurveillance (caméras CCTV/IP), contrôle d'accès électronique, télésurveillance, alarmes anti-intrusion et détection incendie.",
          details: "Nous étudions, installons et exploitons vos dispositifs électroniques de sécurité :\n- Vidéosurveillance par caméras CCTV et IP\n- Contrôle d'accès électronique\n- Télésurveillance\n- Alarmes anti-intrusion\n- Détection incendie\n\nCes équipements complètent la présence humaine : ils permettent de voir, d'enregistrer et d'alerter, tandis que nos agents et notre PC radio assurent la réaction." },
        { title: 'Sécurité cynophile', icon: 'fa-dog', image: '', link: '',
          description: "Surveillance et patrouille avec maîtres-chiens dressés pour la détection, la dissuasion et l'intervention sur sites sensibles.",
          details: "Le binôme maître-chien est l'un des moyens les plus dissuasifs pour la protection des grands espaces, des entrepôts et des sites sensibles.\n\nNos maîtres-chiens interviennent avec des chiens dressés pour la détection, la dissuasion et l'intervention, en rondes et en patrouilles, principalement de nuit.\n\nTarif sur devis, en régime de 12 heures par jour." },
        { title: 'Protection rapprochée', icon: 'fa-user-tie', image: '', link: '',
          description: 'Garde du corps pour personnalités, dirigeants, expatriés et VIP, assurée par des agents spécialement formés et discrets.',
          details: "Nos agents de protection rapprochée accompagnent personnalités, dirigeants, expatriés et VIP dans leurs déplacements et leurs activités.\n\nIls sont spécialement formés (module « Protection rapprochée et escorte ») et choisis pour leur discrétion, leur sang-froid et leur sens du protocole.\n\nTarif indicatif : à partir de 200 000 F CFA par agent et par mois, ou sur devis selon la mission." },
        { title: 'Escorte et protocole', icon: 'fa-car', image: '', link: '',
          description: 'Accompagnement sécurisé de personnes, de convois de valeurs ou de marchandises sensibles, en milieu urbain comme en zone rurale.',
          details: "Nous assurons l'accompagnement sécurisé de personnes, de convois de valeurs ou de marchandises sensibles, en ville comme en zone rurale.\n\nChaque mission fait l'objet d'une préparation : itinéraire, horaires, liaisons radio avec notre Poste de Commandement et plan de réaction en cas d'incident.\n\nTarif à la mission, sur devis." },
        { title: 'Audit et conseil en sûreté', icon: 'fa-clipboard-check', image: '', link: '',
          description: 'Évaluation des risques, diagnostic de vulnérabilité et plans de sécurité personnalisés pour vos sites.',
          details: "Avant de proposer un dispositif, nous comprenons votre site. Notre consultant-formateur réalise :\n- L'évaluation des risques propres à votre activité\n- Le diagnostic de vulnérabilité du site\n- L'établissement d'un plan de sécurité personnalisé et chiffré\n\nVisite de site gratuite et devis remis sous 48 heures." },
        { title: 'Formation', icon: 'fa-graduation-cap', image: '', link: '',
          description: "Formation initiale et perfectionnement pour agents de sécurité, personnel d'entreprise ou particuliers.",
          details: "Nous formons nos propres agents pendant trois (03) mois sur 12 modules homologués par le Ministère de la Sécurité. Ce savoir-faire est aussi proposé à vos équipes.\n\nSessions possibles :\n- Formation initiale d'agents de sécurité\n- Perfectionnement et recyclage\n- Secourisme de base, sécurité incendie et évacuation\n- Sensibilisation du personnel d'entreprise ou des particuliers" },
        { title: 'Vente de matériel', icon: 'fa-box-open', image: '', link: '',
          description: 'Fourniture de caméras, détecteurs, coffres-forts, tenues et matériel anti-effraction.',
          details: "Nous fournissons les équipements de sécurité dont vous avez besoin :\n- Caméras et enregistreurs\n- Détecteurs et alarmes\n- Coffres-forts\n- Tenues et équipements d'agents\n- Matériel anti-effraction\n\nConseil, fourniture et, si vous le souhaitez, installation par nos techniciens." }
    ],
    moyens: [
        { title: "Véhicules d'intervention rapide", description: 'Équipés de radios mobiles, positionnés pour une intervention en moins de 10 minutes.', icon: 'fa-car', categorie: 'mobilite' },
        { title: 'Motos équipées de radios VHF', description: "Pour les zones d'accès difficile.", icon: 'fa-motorcycle', categorie: 'mobilite' },
        { title: 'Camions de ramassage', description: 'Dépôt et relève des agents sur les sites.', icon: 'fa-truck', categorie: 'mobilite' },
        { title: 'Poste de Commandement radio', description: "PC d'écoute radio opérationnel 24h/24.", icon: 'fa-tower-broadcast', categorie: 'communication' },
        { title: 'Réseau radio VHF / UHF', description: 'Très grande portée : rayon de 45 km.', icon: 'fa-walkie-talkie', categorie: 'communication' },
        { title: 'Téléphone de flotte', description: 'Un par site, confié au chef de poste.', icon: 'fa-mobile-screen', categorie: 'communication' },
        { title: 'Tenue jaune ASG', description: 'Chemise + pantalon ou T-shirt, casquette écussonnée : 2 ensembles par an.', icon: 'fa-shirt', categorie: 'agent' },
        { title: 'Chaussures de sécurité', description: '2 paires par agent et par an.', icon: 'fa-shoe-prints', categorie: 'agent' },
        { title: "Badge d'identification", description: 'Chaque agent est identifiable.', icon: 'fa-id-badge', categorie: 'agent' },
        { title: 'Bâton de défense', description: 'Moyen de défense réglementaire.', icon: 'fa-grip-lines', categorie: 'agent' },
        { title: 'Torche et imperméable', description: 'Pour le service de nuit et la saison des pluies.', icon: 'fa-lightbulb', categorie: 'agent' },
        { title: 'Sifflet', description: "Pour l'alerte immédiate.", icon: 'fa-bullhorn', categorie: 'agent' },
        { title: 'Menottes', description: 'Dotation du chef de poste.', icon: 'fa-handcuffs', categorie: 'agent' },
        { title: 'Aérosol gazeux 250 ml', description: 'Dotation du chef de poste.', icon: 'fa-spray-can', categorie: 'agent' },
        { title: 'Vidéosurveillance', description: "Caméras CCTV/IP, contrôle d'accès, alarmes.", icon: 'fa-video', categorie: 'surveillance' }
    ],
    zones: [
        { title: 'Ouagadougou', description: 'Siège à Nioko 2, Secteur 41 : zone principale d’intervention.', icon: 'fa-city' },
        { title: 'Rayon radio de 45 km', description: 'Réseau VHF/UHF et PC radio 24h/24.', icon: 'fa-tower-broadcast' },
        { title: 'Tout le Burkina Faso', description: 'Activité autorisée sur l’ensemble du territoire national.', icon: 'fa-map' },
        { title: 'Milieu urbain et rural', description: 'Escortes et convois en ville comme en zone rurale.', icon: 'fa-road' }
    ],
    cso: "Notre Poste de Commandement (PC) d'écoute radio est opérationnel 24h/24 et 7j/7. Il suit en permanence la position des agents par des rondes radio toutes les 20 à 30 minutes, reçoit les alertes et coordonne les véhicules d'intervention rapide, positionnés pour être sur site en moins de 10 minutes.",
    references: [
        { label: 'SECTEUR', title: 'Banques, ambassades et ONG', description: 'Gardiennage statique, contrôle d’accès et protection rapprochée adaptés aux exigences de confidentialité des institutions.', image: '', link: '' },
        { label: 'SECTEUR', title: 'Mines, industries et entrepôts', description: 'Dispositifs humains, cynophiles et électroniques pour les grands sites et les stocks sensibles.', image: '', link: '' },
        { label: 'SECTEUR', title: 'Commerces, hôtels, écoles et résidences', description: 'Présence dissuasive, accueil, filtrage et rondes, de jour comme de nuit.', image: '', link: '' }
    ],
    actualites: [
        { date: '22 mai 2026', title: "ASG-SARL publie son offre de services 2026", description: "L'Agence de Sécurité Goudihama présente l'ensemble de ses prestations, son organisation, sa méthode et ses tarifs.", image: '', link: '',
          contenu: "L'Agence de Sécurité Goudihama (ASG-SARL) a publié le 22 mai 2026 son offre de services.\n\nLe document présente en onze chapitres l'ensemble des prestations de l'entreprise :\n- Gardiennage statique, sécurité électronique et sécurité cynophile\n- Protection rapprochée, escorte et protocole\n- Audit et conseil en sûreté, formation et vente de matériel\n\nIl détaille aussi l'organisation de l'entreprise, la formation des agents sur 12 modules homologués, le système de contrôle à deux niveaux et la grille tarifaire.\n\nPour recevoir l'offre complète ou demander une visite de site gratuite, contactez la Direction Générale au (+226) 76 52 52 94.",
          galerie: [] },
        { date: '12 mai 2026', title: "ASG-SARL autorisée à exercer le gardiennage", description: "Par arrêté n° 2026-0537/MSECU/CAB/DGSI/DRSP du Ministère de la Sécurité, ASG-SARL est autorisée à exercer le service de gardiennage.", image: '', link: '',
          contenu: "Par arrêté n° 2026-0537/MSECU/CAB/DGSI/DRSP du 12 mai 2026, le Ministère de la Sécurité a autorisé l'Agence de Sécurité Goudihama (ASG-SARL) à exercer le service de gardiennage.\n\nASG-SARL est une Société à Responsabilité Limitée de droit burkinabè, au capital de 1 000 000 F CFA, dont le siège est à Ouagadougou, Nioko 2, Secteur 41.\n\nL'entreprise est en règle vis-à-vis du Registre du Commerce (RCCM), de l'IFU et de la CNSS : aucun risque juridique pour ses clients.",
          galerie: [] },
        { date: '2026', title: 'Offre de lancement : premier mois à −15 %', description: 'Pour tout contrat signé avant le 31 décembre 2026, le premier mois de prestation est facturé avec 15 % de réduction.', image: '', link: '',
          contenu: "Pour accompagner son lancement, ASG-SARL propose une remise de 15 % sur le premier mois de prestation, pour tout contrat signé avant le 31 décembre 2026.\n\nConditions commerciales :\n- Devis personnalisé et gratuit sous 48 heures après visite du site\n- Remises dégressives à partir de 5 agents et selon la durée\n- Tarifs négociables pour les ONG, institutions humanitaires et collectivités publiques\n- Aucun frais d'installation pour les contrats de plus de 6 mois\n\nDemandez votre devis gratuit en ligne ou appelez le (+226) 76 52 52 94.",
          galerie: [] }
    ],
    mediatheque: [],
    contact: { phone1: '76 52 52 94', phone2: '79 52 52 94', phone3: '61 52 52 94', email: 'contact@asg-goudihama.com', emailRecrutement: 'recrutement@asg-goudihama.com', address: "Nioko 2, Secteur 41 — Ouagadougou (non loin de l'École Scientifique Billings Belemtiisee)" },
    admin: { rccm: 'BFZNR012026B1200003', ifu: '00300147J', cnss: '1500049G', agrement: 'N° 2026-0537/MSECU/CAB/DGSI/DRSP du 12 mai 2026', capital: '1 000 000 F CFA', forme: 'Société à Responsabilité Limitée (SARL)', regime: 'Régime Réel Simplifié' },
    legal: {
        mentions: "<h3>1. Éditeur du site</h3><p>AGENCE DE SÉCURITÉ GOUDIHAMA (ASG-SARL), Société à Responsabilité Limitée au capital de 1 000 000 F CFA.<br>Siège : Nioko 2, Secteur 41, Ouagadougou, Burkina Faso.<br>RCCM : BFZNR012026B1200003 — IFU : 00300147J — CNSS : 1500049G.<br>Autorisation d'exercice : arrêté n° 2026-0537/MSECU/CAB/DGSI/DRSP du 12 mai 2026.<br>Téléphone : (+226) 76 52 52 94.</p><h3>2. Directeur de la publication</h3><p>M. Abdouramane TINDANO, Directeur Général.</p><h3>3. Hébergement</h3><p>Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, États-Unis.</p>",
        cgu: "<h3>1. Objet</h3><p>Les présentes conditions encadrent l'utilisation du site asg-goudihama.com, édité par ASG-SARL.</p><h3>2. Contenu</h3><p>Les informations publiées, notamment les tarifs, sont fournies à titre indicatif et peuvent être modifiées à tout moment. Seul un devis signé engage ASG-SARL.</p>",
        privacy: "<h3>1. Données collectées</h3><p>Les formulaires (devis, contact, candidature) collectent uniquement les informations nécessaires au traitement de votre demande.</p><h3>2. Utilisation</h3><p>Ces données servent exclusivement à vous recontacter. Elles ne sont ni vendues ni cédées.</p><h3>3. Vos droits</h3><p>Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à l'adresse email de contact.</p>"
    },
    recrutement: {
        intro: "ASG-SARL recrute, forme et encadre ses agents de sécurité. Chaque agent recruté suit une formation initiale de trois mois sur 12 modules homologués, puis un renforcement propre aux risques de son site d'affectation.",
        avantages: ['Formation initiale de 3 mois sur 12 modules homologués', 'Dotation annuelle complète (tenues jaunes ASG, chaussures, équipements)', 'Encadrement par des chefs de poste et superviseurs expérimentés', 'Conditions conformes au Code du travail et déclaration à la CNSS', 'Évolution possible vers les postes de chef de poste et de contrôleur'],
        offres: []
    },
    faq: [
        { q: "Quel est votre délai d'intervention ?", r: "Nos véhicules d'intervention rapide sont positionnés pour être sur site en moins de 10 minutes en cas d'incident. Notre PC radio est joignable 24h/24 et 7j/7." },
        { q: 'Le devis est-il gratuit ?', r: 'Oui. Nous visitons votre site gratuitement et vous remettons un devis personnalisé sous 48 heures.' },
        { q: 'Combien coûte un vigile ?', r: "À titre indicatif : à partir de 100 000 F CFA par mois pour un vigile non armé et 120 000 F CFA pour un vigile armé, en service de 12 heures par jour. Le tarif final dépend du site, du niveau de risque, du nombre d'agents et de la durée du contrat." },
        { q: 'Êtes-vous autorisés à exercer ?', r: "Oui. ASG-SARL opère sous l'arrêté n° 2026-0537/MSECU/CAB/DGSI/DRSP du 12 mai 2026 du Ministère de la Sécurité et est en règle vis-à-vis du RCCM, de l'IFU et de la CNSS." },
        { q: 'Comment vos agents sont-ils formés ?', r: "Chaque agent suit une formation initiale de 3 mois sur 12 modules homologués par le Ministère de la Sécurité, après une enquête de moralité (casier judiciaire et enquête interne). Il reçoit ensuite un renforcement propre aux risques de son site." },
        { q: 'Que se passe-t-il si un agent est absent ?', r: "Aucun poste n'est laissé vacant : tout agent absent est immédiatement remplacé, pour garantir la continuité du service." },
        { q: 'Quels sont vos horaires ?', r: 'Service de jour de 06h30 à 18h30 (ou 07h00 à 19h00) et service de nuit de 18h30 à 06h30 (ou 19h00 à 07h00). Les horaires sont adaptables à vos besoins.' },
        { q: 'Comment se fait le paiement ?', r: 'Paiement mensuel à terme échu, par virement bancaire ou Mobile Money.' },
        { q: 'Proposez-vous des remises ?', r: 'Oui : remises dégressives à partir de 5 agents et selon la durée, tarifs négociables pour les ONG, institutions humanitaires et collectivités, et aucun frais d’installation pour les contrats de plus de 6 mois.' }
    ]
};

/* Mise en page « agence de sécurité » : bandeaux, À propos détaillé, réseaux sociaux */
Object.assign(window.ASG_DEFAULT_SITE, {
    images: { hero: '', banniere: '', apropos: 'images/visite/visite-01-agents-asg.jpg', cta: '', expertise: '' },
    social: { facebook: '', linkedin: '', youtube: '', tiktok: '', whatsapp: '' },
    apropos: {
        annees: '24h/24',
        badgeLabel: 'Disponibilité opérationnelle',
        intro1: "L'Agence de Sécurité Goudihama (ASG-SARL) est une Société à Responsabilité Limitée de droit burkinabè, au capital social de 1 000 000 F CFA, spécialisée dans la sécurité privée des personnes et des biens. Son siège social est situé à Ouagadougou, Nioko 2, Secteur 41.",
        intro2: "L'entreprise est régulièrement constituée et autorisée à exercer ses activités sur l'ensemble du territoire burkinabè, conformément à la réglementation en vigueur sur les sociétés privées de gardiennage. Elle s'appuie sur une équipe encadrée par des professionnels expérimentés : anciens agents, formateurs certifiés et consultants en sûreté.",
        pourquoi: ['Une entreprise jeune, une équipe expérimentée', 'Une conformité réglementaire totale', 'Une couverture 24h/24 et 7j/7, sans rupture', 'Des agents rigoureusement formés et contrôlés', 'Un interlocuteur unique pour tous vos besoins'],
        mission: "Répondre efficacement aux besoins de nos clients en leur assurant des prestations de qualité 24h/24.",
        vision: "Devenir, à l'horizon 2030, l'un des acteurs de référence en sécurité privée au Burkina Faso.",
        valeurs: "Professionnalisme, intégrité, réactivité, discrétion et engagement total.",
        objectifs: ['Aucun poste laissé vacant', 'Intervention sur site en moins de 10 minutes', 'Devis sous 48 heures après visite du site', 'Contrôle programmé et inopiné de chaque site', 'Formation continue des agents sur site']
    },
    expertise: {
        titre: 'Une entreprise jeune, une équipe expérimentée',
        texte: "Notre encadrement réunit des professionnels ayant cumulé plusieurs années d'expérience dans la sécurité privée et publique au Burkina Faso. Vous bénéficiez d'une expertise éprouvée avec l'agilité d'une structure nouvelle — et vous échangez directement avec la Direction Générale.",
        competences: []
    },
    bandeau247: { titre: 'Disponibles 24h/24 et 7j/7', texte: "Notre PC radio veille en permanence ; nos équipes d'intervention sont sur site en moins de 10 minutes." }
});

/* ===== Médiathèque, vidéo, affichage, presse ===== */
(function (S) {
    S.mediaCats = [
        { id: 'equipe', label: 'Équipes et agents', icon: 'fa-users', actif: true },
        { id: 'formation', label: 'Formations et exercices', icon: 'fa-person-chalkboard', actif: true },
        { id: 'equipement', label: 'Équipements et moyens', icon: 'fa-toolbox', actif: true },
        { id: 'evenement', label: 'Événements et cérémonies', icon: 'fa-calendar-check', actif: true },
        { id: 'reportage', label: 'Reportages et interviews', icon: 'fa-microphone', actif: true },
        { id: 'document', label: 'Documents institutionnels', icon: 'fa-file-lines', actif: true },
        { id: 'autre', label: 'Divers', icon: 'fa-folder', actif: false }
    ];
    S.video = { afficher: false, titre: 'ASG-SARL en vidéo', texte: 'Découvrez nos équipes, nos missions et nos engagements pour la protection des personnes et des biens.', url: '', poster: '', sousTitres: false };
    S.afficher = { stats: true, competences: false, mediaAccueil: true, raisons: true, offre: true };
    S.moyensIntro = 'Des moyens humains, matériels et radio pour intervenir vite et partout. Pour des raisons de sécurité, aucun détail sur l’implantation de nos dispositifs chez nos clients n’est publié.';
    S.moyens.forEach(m => { m.image = ''; m.actif = true; });
    S.presse = {
        intro: "Cet espace est destiné aux médias, partenaires et institutions. Vous y trouverez les éléments officiels d'ASG-SARL : présentation, logos et communiqués.",
        contactNom: 'Direction Générale', contactEmail: '', contactTel: '76 52 52 94',
        items: [
            { type: 'logo', titre: 'Logo officiel ASG-SARL', description: 'PNG, fond transparent (bleu, étoiles dorées).', image: 'images/logo-or.png', fichier: 'images/logo-or.png', lien: '', actif: true },
            { type: 'logo', titre: 'Logo ASG — version blanche', description: 'PNG, fond transparent, pour fonds bleus ou sombres.', image: 'images/logo-blanc.png', fichier: 'images/logo-blanc.png', lien: '', actif: true }
        ]
    };
    S.actualites.forEach((a, i) => Object.assign(a, { actif: true, une: i === 0, datePub: '', video: '', documents: [] }));
})(window.ASG_DEFAULT_SITE);

/* ===== Contenus propres à ASG : valeurs, raisons, organisation, formation, méthode, tarifs ===== */
Object.assign(window.ASG_DEFAULT_SITE, {
    valeurs: [
        { icon: 'fa-briefcase', titre: 'Professionnalisme', texte: "La rigueur dans l'exécution et le respect des procédures." },
        { icon: 'fa-scale-balanced', titre: 'Intégrité', texte: 'La transparence dans nos relations contractuelles et humaines.' },
        { icon: 'fa-bolt', titre: 'Réactivité', texte: 'Une disponibilité 24h/24 et une intervention rapide.' },
        { icon: 'fa-user-secret', titre: 'Discrétion', texte: 'La confidentialité absolue des informations confiées.' },
        { icon: 'fa-handshake', titre: 'Engagement', texte: 'Une implication totale dans la protection de nos clients.' }
    ],
    raisons: [
        { titre: 'Une entreprise jeune, une équipe expérimentée', texte: "Un encadrement qui a cumulé plusieurs années d'expérience dans la sécurité privée et publique au Burkina Faso : l'expertise éprouvée, avec l'agilité d'une structure nouvelle." },
        { titre: 'Une conformité réglementaire totale', texte: "Arrêté n° 2026-0537/MSECU/CAB/DGSI/DRSP du Ministère de la Sécurité, RCCM, IFU et CNSS en règle : aucun risque juridique pour votre entreprise." },
        { titre: 'Une couverture 24h/24, sans rupture', texte: 'Remplacement immédiat de tout agent absent, PC radio opérationnel en permanence, intervention garantie en moins de 10 minutes.' },
        { titre: 'Des agents formés et contrôlés', texte: 'Formation de 3 mois sur 12 modules homologués, enquête de moralité préalable, contrôle programmé et inopiné.' },
        { titre: 'Une offre globale et modulable', texte: 'Du gardiennage à la sécurité électronique, en passant par la protection rapprochée, le cynophile et l’audit : un interlocuteur unique.' },
        { titre: 'Des tarifs compétitifs et transparents', texte: "Des tarifs alignés sur le marché, des remises de volume, une offre de lancement. Pas de coûts cachés, pas de frais d'installation surprises." },
        { titre: 'Proximité et réactivité', texte: 'Vous échangez directement avec la Direction Générale : devis sous 48h, visite gratuite, contrat sur mesure et suivi personnalisé.' }
    ],
    organisation: {
        intro: "ASG-SARL s'appuie sur une équipe pluridisciplinaire structurée en trois niveaux : la direction administrative, l'encadrement technique et les agents opérationnels.",
        agents: ["Les Chefs de Poste (C.P.), choisis pour leur longue expérience et leurs aptitudes à encadrer, dirigent les équipes sur chaque site.", "Les Agents de Surveillance et de Protection (A.S.P.) sont rigoureusement sélectionnés selon leur niveau scolaire, leurs antécédents et les capacités démontrées au cours d'une formation de trois (03) mois.", "Chaque agent est spécifiquement formé en fonction des particularités et des risques propres à son site d'affectation."]
    },
    equipe: [
        { niveau: 'direction', nom: 'M. Abdouramane TINDANO', fonction: 'Directeur Général et Chef des Opérations', description: 'Affaires juridiques et administratives, suivi de la clientèle, politique de développement, formation continue des agents.', photo: '' },
        { niveau: 'direction', nom: 'Mme Aicha TINDANO', fonction: 'Secrétaire comptable', description: 'Gestion comptable, facturation et suivi administratif.', photo: '' },
        { niveau: 'direction', nom: 'M. Kévin NANGA', fonction: 'Assistant Ressources Humaines', description: 'Dossiers du personnel, suivi des contrats, qualité de la prestation, logistique et plannings.', photo: '' },
        { niveau: 'direction', nom: 'M. Mahamadi KOMI', fonction: 'Consultant / Formateur', description: 'Plans de sécurité, analyse des risques, formation initiale et continue du personnel.', photo: '' },
        { niveau: 'encadrement', nom: 'M. Moussa LANKOANDE', fonction: 'Superviseur général', description: 'Mise en place des dispositifs, contrôle terrain, interventions, formation continue sur site, respect des consignes.', photo: '' },
        { niveau: 'encadrement', nom: 'M. Zakaria TINDANO', fonction: 'Contrôleur principal', description: 'Appuie le superviseur dans les missions de contrôle inopiné et programmé.', photo: '' },
        { niveau: 'encadrement', nom: '05 contrôleurs adjoints', fonction: 'Contrôle des sites', description: 'En renfort du contrôleur principal, pour une couverture optimale de tous les sites.', photo: '' }
    ],
    formation: {
        intro: "Chaque agent recruté bénéficie d'une formation initiale de trois (03) mois portant sur les modules réglementaires homologués par le Ministère de la Sécurité, complétée par un renforcement de capacités spécifique aux menaces identifiées sur chaque site.",
        criteres: ['Niveau scolaire minimum : C.E.P. (Certificat d’Études Primaires)', 'Taille minimale : 1,70 m', 'Aptitude physique et bonne santé attestées par un certificat médical', 'Bonne moralité : casier judiciaire et enquête de moralité interne', 'Courage, patience, maîtrise de soi, discipline, disponibilité et esprit d’équipe'],
        modules: ["Contrôle d'accès et filtrage", 'Sécurité environnementale', 'Techniques de self-défense', 'Gestion de foule', 'Étude technique de site', "Gestion d'incident", 'Protection rapprochée et escorte', 'Sécurité électronique', "Maniement d'arme à feu civile", 'Secourisme de base', 'Sécurité incendie et évacuation', 'Éthique et relation client']
    },
    methode: {
        dispo: "ASG-SARL assure la formation et la disponibilité permanente de tous ses agents. Aucun poste n'est laissé vacant : tout agent absent est immédiatement remplacé, garantissant la continuité du service quelles que soient les circonstances.",
        horairesNote: 'Nos horaires sont adaptables aux besoins spécifiques de chaque client.',
        controleProgramme: 'Nos chefs de site et équipes de patrouille sont mobilisés aux heures de relève. Des rondes radio toutes les 20 à 30 minutes vérifient la position des agents et l’état des sites.',
        controleInopine: 'Réalisé deux fois le jour et deux fois la nuit, ce contrôle imprévisible surprend les agents en pleine activité et maintient un état de vigilance constant.',
        patrouille: "Des patrouilles inopinées de jour comme de nuit sont assurées par les superviseurs et les équipes d'intervention. Nos véhicules d'intervention rapide sont positionnés stratégiquement pour garantir une présence sur site en moins de 10 minutes en cas d'incident.",
        registres: ['Registre de mouvement du mobilier et du matériel (entrées et sorties)', 'Registre des visiteurs (identité, motif, horaires)', 'Registre des communications (appels reçus et émis)', 'Registre des anomalies (incidents constatés, signalements)', 'Cahier de consignes propres au site et procédures d’urgence']
    },
    horaires: [
        { service: 'Service de jour', standard: '06h30 — 18h30', alternatif: '07h00 — 19h00' },
        { service: 'Service de nuit', standard: '18h30 — 06h30', alternatif: '19h00 — 07h00' }
    ],
    dotation: [
        { designation: 'Chemise + pantalon ou T-shirt (couleur jaune ASG)', quantite: '02 ensembles' },
        { designation: 'Casquette écussonnée', quantite: '02' },
        { designation: 'Chaussures de sécurité', quantite: '02 paires' },
        { designation: 'Ceinturon', quantite: '01' },
        { designation: 'Ceinture', quantite: '01' },
        { designation: "Badge d'identification", quantite: '01' },
        { designation: 'Bâton de défense (matraque)', quantite: '01' },
        { designation: 'Imperméable', quantite: '01' },
        { designation: 'Torche avec piles ou rechargeable', quantite: '01' },
        { designation: 'Sifflet', quantite: '01' },
        { designation: 'Menottes', quantite: '01 (chef de poste)' },
        { designation: 'Aérosol gazeux 250 ml', quantite: '01 (chef de poste)' },
        { designation: 'Téléphone de flotte', quantite: '01 par site (chef de poste)' }
    ],
    tarifs: {
        intro: "Nos tarifs sont étudiés pour offrir le meilleur rapport qualité-prix sur le marché burkinabè. Ils sont indicatifs et peuvent être ajustés selon la nature du site, le niveau de risque, le volume du contrat et la durée d'engagement.",
        lignes: [
            { prestation: 'Vigile non armé (jour ou nuit)', tarif: 'à partir de 100 000 F CFA', regime: '12h / jour', icon: 'fa-user-shield' },
            { prestation: 'Vigile armé (jour ou nuit)', tarif: 'à partir de 120 000 F CFA', regime: '12h / jour', icon: 'fa-shield-halved' },
            { prestation: 'Garde du corps / protection rapprochée', tarif: 'à partir de 200 000 F CFA', regime: 'Sur devis', icon: 'fa-user-tie' },
            { prestation: 'Maître-chien avec chien dressé', tarif: 'Sur devis', regime: '12h / jour', icon: 'fa-dog' },
            { prestation: 'Audit de sécurité et plan de sûreté', tarif: 'Sur devis', regime: 'Forfait', icon: 'fa-clipboard-check' },
            { prestation: 'Installation de vidéosurveillance', tarif: 'Sur devis', regime: 'Forfait', icon: 'fa-video' },
            { prestation: 'Escorte / convoi sécurisé', tarif: 'Sur devis', regime: 'À la mission', icon: 'fa-car' }
        ],
        unite: 'Tarifs de base par agent et par mois',
        conditions: ['Devis personnalisé et gratuit sous 48 heures après visite du site', 'Remises dégressives en fonction du volume (à partir de 5 agents) et de la durée', 'Tarifs négociables pour les ONG, institutions humanitaires et collectivités publiques', 'Paiement mensuel à terme échu, par virement bancaire ou Mobile Money', "Aucun frais d'installation ni de mise en place pour les contrats supérieurs à 6 mois"],
        offre: { titre: 'Offre de lancement 2026', valeur: '−15 %', texte: 'sur le premier mois', echeance: 'Pour tout contrat signé avant le 31 décembre 2026' }
    }
});

/* Anciens médias d'exemple (sans photo) : reconnus pour être remplacés automatiquement */
window.ASG_LEGACY_MEDIA_TITLES = [];


/* ===== Reportage « Visite de terrain du responsable » (octobre 2026) =====
   Ajouté UNE seule fois au contenu existant (flag seeds.visite), même si le site a déjà
   du contenu publié. Ensuite tout se modifie ou se supprime depuis l'administration
   (Actualités et Médiathèque). Photos : dossier images/visite/. */
(function () {
    const V = 'images/visite/';
    const P = {
        agents: V + 'visite-01-agents-asg.jpg', terrasse: V + 'visite-02-agent-terrasse.jpg', poste: V + 'visite-03-agent-poste.jpg',
        ronde: V + 'visite-04-agent-ronde.jpg', resp: V + 'visite-05-responsable-agent.jpg', controle: V + 'visite-06-responsable-controle.jpg'
    };
    window.ASG_VISITE_SEED = {
        actualites: [
            { actif: true, une: true, datePub: '', date: '17 octobre 2026', slug: 'visite-terrain-responsable',
              title: 'Visite de terrain : le responsable à la rencontre des agents sur leurs postes',
              description: "Échanges avec les agents, contrôle de la tenue et de l'équipement, rappel des consignes : retour sur la visite de terrain du responsable d'ASG-SARL.",
              image: P.resp, galerie: [P.resp, P.controle, P.agents], video: '', link: '', documents: [],
              contenu: "Le responsable d'ASG-SARL s'est rendu sur le terrain pour rencontrer les agents directement à leurs postes. Une visite simple et directe, au portail comme à l'entrée des bâtiments, pour voir le service tel qu'il est réellement assuré au quotidien.\n\nAu programme de la visite :\n- Un échange avec chaque agent sur le déroulement de son service\n- Un contrôle de la tenue jaune ASG et de la dotation (ceinture, chaussures, équipement)\n- Un rappel des consignes du site et de la tenue des registres\n- Le recueil des remarques et des besoins des agents\n\nCes visites s'inscrivent dans notre système de contrôle : chaque site est suivi de façon programmée et inopinée, de jour comme de nuit. Elles permettent de garder un contact étroit avec les équipes, de corriger rapidement ce qui doit l'être et de garantir à nos clients un service constant, sans poste laissé vacant." },
            { actif: true, une: false, datePub: '', date: '17 octobre 2026', slug: 'visite-terrain-tenue-agents',
              title: 'Tenue jaune ASG et dotation complète : les agents passés en revue',
              description: 'Chemise jaune à poches noires, pantalon à bandes jaunes, casquette et chaussures montantes : des agents reconnaissables et bien présentés.',
              image: P.agents, galerie: [P.agents, P.terrasse, P.poste], video: '', link: '', documents: [],
              contenu: "La tenue ASG est pensée pour être vue et reconnue : chemise jaune à poches noires et épaulettes, pantalon noir à bandes jaunes, casquette, ceinture et chaussures montantes.\n\nLors de sa visite, le responsable a vérifié que chaque agent est en tenue complète et correcte à son poste. Une présentation soignée fait partie de la rigueur que nous demandons à nos équipes, et de la confiance que nous devons à nos clients.\n\nPonctualité, courtoisie, vigilance : ces trois consignes ont été rappelées à chaque prise de service." },
            { actif: true, une: false, datePub: '', date: '17 octobre 2026', slug: 'visite-terrain-ronde-vigilance',
              title: 'Rondes et vigilance : le point du responsable sur les consignes',
              description: 'Au poste ou en ronde, les agents ont fait le point avec le responsable sur le matériel, les consignes et la vigilance.',
              image: P.controle, galerie: [P.controle, P.ronde], video: '', link: '', documents: [],
              contenu: "Pendant sa tournée, le responsable a fait le point avec les agents sur la vigilance, les rondes et le matériel de service.\n\nLes agents ont pu faire remonter leurs besoins et leurs suggestions. Les consignes propres à chaque site ont été rappelées, ainsi que la conduite à tenir en cas d'incident : signaler sans attendre, consigner dans le registre des anomalies et alerter le PC radio.\n\nCette présence régulière sur le terrain fait partie de l'engagement d'ASG-SARL : un contrôle programmé et inopiné de chaque site." }
        ],
        mediatheque: [
            { actif: true, une: true, datePub: '', id: 'visite-terrain-responsable-2026', type: 'photo', category: 'equipe', date: '17 octobre 2026',
              title: 'Visite de terrain du responsable',
              description: "Les agents ASG sur leurs postes lors de la visite de terrain du responsable.",
              image: P.resp, photos: [P.resp, P.controle, P.agents, P.terrasse, P.poste, P.ronde], video: '', file: '', link: '' }
        ]
    };
    window.asgSeedVisite = function (S) {
        S.seeds = (S.seeds && typeof S.seeds === 'object') ? S.seeds : {};
        if (S.seeds.visite) return false;
        const c = o => JSON.parse(JSON.stringify(o));
        S.actualites = Array.isArray(S.actualites) ? S.actualites : [];
        S.mediatheque = Array.isArray(S.mediatheque) ? S.mediatheque : [];
        const slugs = new Set(S.actualites.map(a => a.slug).filter(Boolean)), ids = new Set(S.mediatheque.map(m => m.id).filter(Boolean));
        S.actualites = window.ASG_VISITE_SEED.actualites.filter(a => !slugs.has(a.slug)).map(c).concat(S.actualites);
        S.mediatheque = window.ASG_VISITE_SEED.mediatheque.filter(m => !ids.has(m.id)).map(c).concat(S.mediatheque);
        S.seeds.visite = true;
        return true;
    };
})();
