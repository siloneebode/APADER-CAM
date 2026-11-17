(() => {
  'use strict';

  function populateExamples() {
    const data = window.APADER_DEMO;
    const main = document.querySelector('main');
    if (!data || !main) return;
    const params = new URLSearchParams(location.search);
    const number = params.get('n') || '01';
    const path = location.pathname;
    const categories = {
      formations: 'Formations',
      'appels-a-candidatures': 'Appels à candidatures',
      recrutements: 'Recrutements',
      'stages-et-volontariat': 'Stages et volontariat',
      'appels-a-partenariat': 'Appels à partenariat',
    };
    const types = {
      'rapports-annuels': 'Rapports annuels',
      'rapports-de-projets': 'Rapports de projets',
      'publications-et-etudes': 'Publications et études',
      'manuels-et-guides-techniques': 'Manuels et guides techniques',
      'supports-de-formation': 'Supports de formation',
      'documents-institutionnels': 'Documents institutionnels',
    };
    const imageDescriptions = {
      agriculture: 'Travail dans une parcelle agricole',
      women: 'Agricultrice dans un champ',
      youth: 'Échanges autour d’un ordinateur',
      community: 'Rencontre dans une salle de classe',
      learning: 'Élèves dans une salle de classe',
      forest: 'Vue aérienne d’une forêt tropicale',
    };

    function text(root, selector, value) {
      if (value === undefined) return;
      root.querySelectorAll(selector).forEach(element => { element.textContent = value; });
    }

    function sequence(root, selector, values) {
      root.querySelectorAll(selector).forEach((element, index) => {
        if (values[index] !== undefined) element.textContent = values[index];
      });
    }

    function eventMetadata(card, items) {
      const container = card.querySelector('.ec-meta');
      if (!container) return;
      const paths = {
        calendar: ['M8 2v4M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z'],
        clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
        pin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z', 'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
      };
      container.replaceChildren();
      items.filter(item => item.value).forEach((item, index) => {
        const row = document.createElement('span');
        row.className = 'ec-meta-item' + (item.icon === 'pin' ? ' ec-meta-place' : '');
        if (index > 0 && card.closest('.ui-news')) {
          const separator = document.createElement('span');
          separator.className = 'ec-meta-separator';
          separator.setAttribute('aria-hidden', 'true');
          separator.textContent = ' · ';
          row.append(separator);
        }
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('aria-hidden', 'true');
        icon.setAttribute('focusable', 'false');
        paths[item.icon].forEach(d => {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', d);
          icon.append(path);
        });
        const label = document.createElement('span');
        label.textContent = item.value;
        row.append(icon, label);
        container.append(row);
      });
    }

    function definitions(root, values) {
      root.querySelectorAll('dt').forEach(term => {
        const description = term.nextElementSibling;
        if (description?.tagName === 'DD' && values[term.textContent.trim()] !== undefined) {
          description.textContent = values[term.textContent.trim()];
        }
      });
    }

    function photo(slot, key = 'community') {
      if (!slot) return;
      const description = 'Photographie d’illustration — ' + imageDescriptions[key];
      if (slot.tagName === 'IMG') {
        slot.src = '/assets/demo/' + key + '.jpg';
        slot.alt = description;
        return;
      }
      const image = document.createElement('img');
      image.src = '/assets/demo/' + key + '.jpg';
      image.alt = description;
      image.loading = 'lazy';
      image.decoding = 'async';
      // Remplir le cadre déjà défini dans la maquette, sans en changer les dimensions.
      image.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
      if (getComputedStyle(slot).position === 'static') slot.style.position = 'relative';
      slot.replaceChildren(image);
      slot.setAttribute('aria-label', description);
    }

    function linkNumber(link) {
      return new URL(link.href, location.href).searchParams.get('n') || '01';
    }

    function resourceImage(item) {
      if (item.type === 'supports-de-formation') return 'learning';
      if (item.type === 'publications-et-etudes') return 'forest';
      return data.projects[Number(item.project.slice(-2)) - 1]?.image || 'agriculture';
    }

    main.querySelectorAll('.project-entry').forEach(card => {
      const item = data.projects.find(project => project.id === linkNumber(card)) || data.projects[0];
      text(card, '.catalog-copy h2', item.title);
      text(card, '.catalog-summary', item.summary);
      text(card, '.project-domain', item.domainLabel);
      text(card, '.project-status', item.statut === 'en-cours' ? 'En cours' : 'Réalisé');
      sequence(card, '.catalog-facts dd', [item.zoneLabel, item.start + ' — ' + item.end]);
      photo(card.querySelector('.catalog-visual'), item.image);
      const entry = card.closest('[data-project-entry]');
      if (entry) entry.dataset.search = [entry.dataset.search, item.title, item.summary, item.zoneLabel, item.domainLabel, item.year].join(' ');
    });
    main.querySelectorAll('[data-project-filter="zone"] option').forEach(option => {
      const item = data.projects.find(project => project.zone === option.value);
      if (item) option.textContent = item.zoneLabel;
    });

    main.querySelectorAll('.editorial-card').forEach(card => {
      const link = card.querySelector('a[href*="exemple"]');
      if (!link) return;
      const url = new URL(link.href, location.href);
      const activity = url.pathname.includes('activite-exemple');
      const items = activity ? data.activities : data.news;
      const id = activity ? url.searchParams.get('activite') : url.searchParams.get('n');
      const item = items.find(record => record.id === id) || items[0];
      text(card, 'h3', item.title);
      text(card, '.editorial-category', activity ? item.type : 'Actualité');
      text(card, '.editorial-summary', item.summary || item.excerpt);
      sequence(card, '.editorial-date span', [item.date, item.place]);
      photo(card.querySelector('.editorial-visual'), item.image);
    });

    main.querySelectorAll('.success-card').forEach(card => {
      const link = card.querySelector('a[href*="recit-exemple"]') || card;
      const item = data.stories.find(story => story.id === linkNumber(link)) || data.stories[0];
      text(card, 'h2', item.title);
      text(card, 'blockquote', item.summary);
      text(card, '.apader-kicker > span', item.person + ' · personnage fictif');
      photo(card.querySelector('.success-visual'), item.image);
    });

    main.querySelectorAll('.opportunity-row').forEach(row => {
      const link = row.querySelector('a[href*="fiche-exemple"]');
      if (!link) return;
      const item = data.opportunities.find(record => record.category === row.dataset.category && record.id === linkNumber(link));
      if (!item) return;
      text(row, 'h2, h3', item.title);
      link.setAttribute('aria-label', 'Consulter : ' + item.title);
      sequence(row, '.opportunity-meta > span', [item.place, 'Clôture le ' + item.deadline, item.status === 'open' ? 'Ouverte' : 'Clôturée']);
      text(row, '.opportunity-status', item.status === 'open' ? 'Ouverte' : 'Clôturée');
    });

    main.querySelectorAll('.ec-event').forEach((event, index) => {
      const link = event.querySelector('a[href*="exemple"]');
      if (!link) return;
      const formation = path.startsWith('/opportunites/');
      const item = formation
        ? data.opportunities.find(record => record.category === 'formations' && record.id === linkNumber(link))
        : data.events.find(record => record.id === linkNumber(link)) || data.events[index % data.events.length];
      if (!item) return;
      text(event, '.ec-event-title', item.title);
      text(event, '.ec-event-excerpt', item.excerpt || item.summary);
      eventMetadata(event, formation ? [
        { icon: 'calendar', value: 'Inscriptions jusqu’au ' + item.deadline },
        { icon: 'clock', value: '2 journées' },
        { icon: 'pin', value: item.place.replace('Présentiel · ', '') },
      ] : [
        { icon: 'calendar', value: item.date },
        { icon: 'clock', value: item.time },
        { icon: 'pin', value: item.place },
      ]);
      const eventType = event.querySelector('.ec-event-type');
      const eventStatus = eventType?.querySelector('.opportunity-status');
      if (formation && eventStatus) {
        eventType.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) node.textContent = 'Formation ';
        });
        eventStatus.textContent = item.status === 'open' ? 'Ouverte' : 'Clôturée';
      } else {
        text(event, '.ec-event-type', formation ? 'Formation' : 'Rencontre et échanges');
      }
      if (!formation && event.hasAttribute('data-year')) event.dataset.year = item.year;
      photo(event.querySelector('.ec-poster'), item.image);
    });
    main.querySelectorAll('.ec-event-compact').forEach((event, index) => {
      const item = data.events[index % data.events.length];
      text(event, '.ec-compact-title', item.title);
      text(event, '.ec-compact-excerpt', item.excerpt);
      text(event, '.ec-compact-meta', [item.date, item.time].filter(Boolean).join(' · '));
      text(event, '.ec-compact-place', item.place);
      photo(event.querySelector('.ec-compact-poster'), item.image);
    });

    main.querySelectorAll('.document-card').forEach(card => {
      const link = card.matches('a') ? card : card.querySelector('a');
      if (!link) return;
      const url = new URL(link.href, location.href);
      const item = data.resources.find(record => record.type === url.searchParams.get('type') && record.id === (url.searchParams.get('n') || '01'));
      if (!item) return;
      text(card, '.document-copy h2, .document-copy h3', item.title);
      text(card, '.document-summary', item.summary);
      sequence(card, '.resource-meta > span', [item.year, item.format]);
      const entry = card.closest('li[data-resource]');
      if (entry) entry.dataset.search = [entry.dataset.search, item.title, item.summary, types[item.type], item.year, data.projects[Number(item.project.slice(-2)) - 1]?.title].join(' ');
    });
    main.querySelectorAll('select[data-filter="project"] option').forEach(option => {
      const item = data.projects.find(project => 'projet-' + project.id === option.value);
      if (item) option.textContent = item.title;
    });

    main.querySelectorAll('.featured').forEach(feature => {
      const item = data.news[0];
      text(feature, 'h2', item.title);
      const summary = feature.querySelector('p:not(.eyebrow)');
      if (summary) summary.textContent = item.excerpt;
      photo(feature.querySelector('.wf-visual'), item.image);
    });
    main.querySelectorAll('.comm-row, .comm-featured, .comm-card').forEach((row, index) => {
      const link = row.querySelector('a[href*="communique-exemple"]');
      const item = data.communiques.find(record => record.id === (link ? linkNumber(link) : '01')) || data.communiques[index % data.communiques.length];
      text(row, 'h2, h3', item.title);
      text(row, 'p:not(.eyebrow)', item.excerpt);
      sequence(row, '.comm-date > *', [item.date.split(' ')[0], item.date.split(' ').slice(1).join(' ')]);
      text(row, '.reference-tag', 'DEMO-COM-' + item.id);
      sequence(row, '.meta > span', [row.matches('.comm-row') ? 'Communiqué' : item.date, 'Équipe du programme']);
    });

    const project = data.projects.find(item => item.id === number) || data.projects[0];
    if (path.includes('projet-exemple.html')) {
      const values = { title: project.title, domain: project.domainLabel, statut: project.statut === 'en-cours' ? 'En cours' : 'Réalisé', start: project.start, end: project.end, zone: project.zoneLabel, beneficiaries: project.beneficiaries };
      Object.entries(values).forEach(([key, value]) => text(main, '[data-project-' + key + ']', value));
      text(main, '.project-hero-copy > p:not(.eyebrow):not(.project-domain)', project.summary);
      sequence(main, '#presentation .project-context p', [project.context, 'Les groupes définissent ensemble leurs priorités et testent des solutions adaptées à leur territoire.']);
      text(main, '.objective-panel > p', project.objective);
      sequence(main, '.objective-panel li', ['Expérimenter des pratiques accessibles avec les groupes locaux.', 'Renforcer les échanges entre participants.', 'Partager les apprentissages au fil des activités.']);
      text(main, '.results-text p', project.resultsText);
      main.querySelectorAll('.result-tile').forEach((tile, index) => {
        text(tile, '.result-value', project.metrics[index]?.value);
        text(tile, '.result-label', project.metrics[index]?.label);
      });
      text(main, '.result-notes', 'Chiffres fictifs utilisés pour illustrer la maquette.');
      photo(main.querySelector('[data-project-featured-image]'), project.image);
      text(main, '[data-project-featured-label]', 'Photographie d’illustration');
    }

    if (path.includes('activite-exemple.html')) {
      const activity = data.activities.find(item => item.id === params.get('activite')) || data.activities[0];
      text(main, '[data-activity-name]', activity.title);
      text(main, '[data-project-title]', project.title);
      text(main, '.lead', activity.summary);
      sequence(main, '.article-intro .meta > span', [activity.date, activity.place]);
      sequence(main, '.activity-detail-copy > p', [activity.body, activity.participants + ' ont mis en pratique les gestes présentés et partagé leurs retours avec le groupe.']);
      definitions(main, {'Projet associé': project.title, Date: activity.date, Lieu: activity.place, Participants: activity.participants});
      photo(main.querySelector('.activity-detail-photo'), activity.image);
    }

    if (path.includes('recit-exemple.html')) {
      const story = data.stories.find(item => item.id === number) || data.stories[0];
      text(main, '[data-story-title]', story.title);
      text(main, '.lead', story.summary);
      sequence(main, '.article-intro .meta > span', [story.person + ' · personnage fictif', story.role]);
      text(main, '.success-blockquote', '« Nous avons commencé à petite échelle, puis nous avons appris à mieux nous organiser ensemble. » — témoignage fictif.');
      sequence(main, '.success-body > p', [story.body, 'Des ateliers réguliers permettent au groupe de comparer ses expériences et de tester de nouvelles pratiques.', 'Le collectif poursuit ses essais et prépare la prochaine étape de son parcours.']);
      text(main, '.objective-panel p', data.projects.find(item => item.id === story.project)?.summary || project.summary);
      photo(main.querySelector('.success-hero .wf-visual'), story.image);
    }

    if (path.includes('/opportunites/') && path.includes('fiche-exemple.html')) {
      const category = path.split('/')[2] in categories ? path.split('/')[2] : 'formations';
      const item = data.opportunities.find(record => record.category === category && record.id === number) || data.opportunities.find(record => record.category === category);
      text(main, '[data-opportunity-title]', item.title);
      text(main, '.lead', item.summary);
      sequence(main, '.article-intro .meta > span', [item.status === 'open' ? 'Ouverte' : 'Clôturée', '12 novembre 2026', 'DEMO-' + item.id]);
      text(main, '.opportunity-article > p', item.body);
      sequence(main, '.opportunity-article section > p', [item.body, item.conditions, item.application]);
      definitions(main, {
        'Lieu / format': item.place,
        Lieu: item.place,
        'Dates / durée': 'Deux journées de travail',
        'Date limite': item.deadline,
        'Public concerné': 'Personnes et organisations intéressées par cette thématique',
        'Contrat / durée': 'Mission de six mois',
        'Prise de fonction': 'Janvier 2027',
        'Zone concernée': 'Communes du Ndé',
        'Public éligible': 'Organisations locales et collectifs de terrain',
        Référence: 'DEMO-' + item.category.slice(0, 3).toUpperCase() + '-' + item.id,
        Type: categories[item.category],
        'Période / durée': 'Six semaines',
        'Organisations concernées': 'Associations, coopératives et collectifs locaux',
        Contact: 'Équipe de coordination · coordonnées à confirmer',
      });
      text(main, '.opportunity-document p', 'Le programme détaillé et les pièces utiles seront ajoutés à cette fiche.');
    }

    if (path.includes('document-exemple.html')) {
      const type = params.get('type') || 'rapports-annuels';
      const item = data.resources.find(record => record.type === type && record.id === number) || data.resources[0];
      const associatedProject = data.projects[Number(item.project.slice(-2)) - 1];
      const values = {title: item.title, type: types[item.type], year: item.year, domain: associatedProject.domainLabel, project: associatedProject.title};
      Object.entries(values).forEach(([key, value]) => text(main, '[data-document-' + key + ']', value));
      text(main, '.lead', item.summary);
      text(main, '.resource-description > p', item.summary + ' Le document rassemble des repères pratiques et des pistes de réflexion pour préparer les activités et partager les apprentissages.');
      text(main, '.resource-file-placeholder', 'Document d’exemple · ' + item.pages + ' pages · PDF');
      photo(main.querySelector('.document-preview'), resourceImage(item));
    }

    if (path.includes('/actualites/') && path.includes('-exemple.html')) {
      const event = path.includes('evenement-exemple');
      const communique = path.includes('communique-exemple');
      const records = event ? data.events : communique ? data.communiques : data.news;
      const item = records.find(record => record.id === number) || records[0];
      text(main, '[data-demo-title]', item.title);
      text(main, '.lead', item.excerpt);
      sequence(main, '.article-intro .meta > span', [item.date, 'Équipe du programme de démonstration']);
      sequence(main, '.article-body > p:not(.eyebrow), .article-content > p:not(.eyebrow)', [item.body, item.excerpt, 'Les échanges et les retours des participants alimenteront les prochaines activités.']);
      main.querySelectorAll('.article-body > .wf-visual, .article-content > .wf-visual').forEach(slot => photo(slot, item.image || 'community'));
      main.querySelectorAll('.article-body h2').forEach((heading, index) => {
        if (heading.textContent.includes('[')) heading.textContent = index === 0 ? 'Des apprentissages à partager' : 'Les prochaines étapes';
      });
      if (event) {
        definitions(main, {'Date et heure': [item.date, item.time].filter(Boolean).join(' · '), 'Lieu / format': item.place, 'Public concerné': 'Personnes, collectifs et organisations intéressés', Participation: 'Participation sur inscription', Contact: 'Équipe du programme de démonstration'});
        photo(main.querySelector('.ec-poster'), item.image);
        const article = main.querySelector('article');
        if (article) sequence(article, 'p:not(.eyebrow)', [item.body, 'La journée alterne échanges en petits groupes, présentations courtes et découverte d’initiatives locales.', 'Les interventions seront animées par l’équipe du programme et des représentants des collectifs participants.']);
      }
      if (communique) {
        text(main, '.article-body .apader-kicker > span', 'DEMO-COM-' + item.id + ' · Bangangté');
      }
    }

    main.querySelectorAll('.media-button').forEach((button, index) => {
      const key = data.activities[index % data.activities.length].image;
      const playIcon = button.querySelector('.play-icon');
      const label = button.querySelector('.media-label');
      photo(button, key);
      if (label) {
        label.textContent = button.dataset.kind === 'video' ? 'Vidéo d’illustration' : 'Photographie d’illustration';
        button.append(label);
      }
      if (playIcon) button.append(playIcon);
      button.dataset.title = 'Séquence d’illustration — ' + imageDescriptions[key];
      button.dataset.caption = 'Photographie d’illustration provisoire. Le média définitif sera fourni par l’APADER.';
    });
    main.querySelectorAll('.ui-demo-note').forEach(note => {
      note.textContent = 'Contenus fictifs et photographies d’illustration provisoires · Maquette à compléter avec l’APADER.';
    });

    if (path.startsWith('/actualites/')) {
      const records = path.endsWith('evenements.html') ? data.events : path.endsWith('communiques.html') ? data.communiques : data.news;
      main.querySelectorAll('[data-entry][data-year]').forEach(entry => {
        const link = entry.querySelector('a[href*="exemple"]');
        const item = link && records.find(record => record.id === linkNumber(link));
        if (item) entry.dataset.year = item.year;
      });
      main.querySelectorAll('select[data-filter="year"]').forEach(field => {
        const years = [...new Set(records.map(record => record.year))].sort().reverse();
        const first = field.options[0];
        field.replaceChildren(first);
        years.forEach(year => field.add(new Option(year, year)));
      });
    }

    // Compléter les libellés génériques encore présents dans les textes de lecture.
    const replacements = [
      [/date de début/i, '15 mars 2026'], [/date de fin/i, '28 février 2027'],
      [/période|date de publication|date de l’activité/i, '18 mars 2026'],
      [/lieu|région|communes|localités|zone/i, 'Bangangté et les communes du Ndé'],
      [/titre du projet/i, project.title], [/titre de l’activité|intitulé de l’activité/i, data.activities[0].title],
      [/bénéficiaire|public|participant|communauté/i, 'Familles, jeunes et collectifs locaux'],
      [/nom du partenaire/i, 'Partenaire d’illustration'], [/logo partenaire/i, 'Partenaire fictif'],
      [/rôle et contribution/i, 'Appui aux activités et partage d’expériences'],
      [/pays|territoire/i, 'Cameroun'], [/référence/i, 'DEMO-2026-01'],
      [/émetteur|auteur|signataire/i, 'Équipe du programme de démonstration'],
      [/nom|fonction/i, 'Une participante — personnage fictif'],
      [/témoignage|extrait/i, '« Les échanges du groupe nous aident à progresser et à préparer la suite. » — récit fictif.'],
      [/objectif|réalisation|changement/i, 'Renforcer les compétences locales et partager des pratiques accessibles.'],
      [/description|présentation|positionnement|récit|développement|suite|texte|situation|accompagnement|introduction|formule/i, 'Les participants échangent leurs expériences et mettent en pratique des solutions adaptées à leurs besoins. Les rencontres permettent de préparer collectivement les prochaines étapes.'],
      [/description|résumé|aperçu/i, 'Des repères et des expériences pour accompagner les initiatives locales.'],
      [/prévue|en cours|réalisée/i, 'Réalisée'], [/livrable/i, 'Un guide de pratiques partagé avec le groupe'],
      [/type d’activité/i, 'Atelier pratique'], [/photo|image|visuel|carte|lecteur|vidéo/i, 'Illustration provisoire'],
      [/pièce|document|fichier|pdf/i, 'Document d’illustration'], [/contact|téléphone|email/i, 'Coordonnées à confirmer'],
      [/^XX$/i, '80'],
    ];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      node.textContent = node.textContent.replace(/\[([^\]]+)\]/g, (match, value) => {
        if (/^\d{4}$/.test(value)) return value;
        const replacement = replacements.find(([pattern]) => pattern.test(value));
        return replacement ? replacement[1] : value;
      });
    });

    // Les contrôleurs des collections relisent les textes de recherche désormais remplis.
    main.querySelectorAll('[data-project-collection], [data-resource-collection]').forEach(collection => {
      const search = collection.querySelector('input[type=search]');
      const field = search || collection.querySelector('select');
      field?.dispatchEvent(new Event(search ? 'input' : 'change', {bubbles: true}));
    });
    main.querySelectorAll('[data-collection] select').forEach(field => {
      field.dispatchEvent(new Event('change', {bubbles: true}));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', populateExamples, {once: true});
  else populateExamples();
})();
