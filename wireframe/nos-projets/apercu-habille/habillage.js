(() => {
  'use strict';

  const requestedNumber = new URLSearchParams(location.search).get('n');
  const projectNumber = /^0[1-8]$/.test(requestedNumber || '') ? requestedNumber : '01';
  const previewBase = '/nos-projets/apercu-habille/';
  const metadata = {
    title: 'Cultiver des communautés plus résilientes',
    domain: 'Agriculture durable et agroforesterie',
    statut: 'En cours',
    start: 'À renseigner',
    end: 'À renseigner',
    zone: 'Zone à préciser',
    beneficiaries: 'Producteurs et communautés rurales'
  };

  Object.entries(metadata).forEach(([key, value]) => {
    document.querySelectorAll(`[data-project-${key}]`).forEach(element => {
      element.textContent = value;
    });
  });
  document.querySelectorAll('.project-hero-copy > p').forEach(paragraph => {
    if (paragraph.matches('[data-project-domain], .project-domain, .eyebrow, .design-demo-note')) return;
    paragraph.textContent = 'Des pratiques agricoles durables, construites avec les communautés.';
  });
  document.querySelectorAll('[data-project-featured-image]').forEach(image => {
    image.alt = 'Photo d’illustration : groupe devant le CIEFAD à Feutap';
  });
  document.querySelectorAll('[data-version-link]').forEach(link => {
    const version = link.dataset.versionLink;
    if (/^[abc]$/.test(version || '')) link.href = `${previewBase}${version}.html?n=${projectNumber}#activites`;
  });
  document.querySelectorAll('[data-compare-link]').forEach(link => {
    link.textContent = 'Comparer les wireframes';
  });
  // Conserver les crédits consultables malgré le garde-fou des liens du wireframe.
  document.querySelectorAll('.design-review-bar a[href^="https://"]').forEach(link => {
    const creditLink = link.cloneNode(true);
    creditLink.target = '_blank';
    creditLink.rel = 'noopener noreferrer';
    link.replaceWith(creditLink);
  });

  const activities = [
    {
      title: 'Se rencontrer et identifier les besoins',
      category: 'Mobilisation',
      summary: 'Un temps d’échange avec les communautés pour comprendre leurs priorités et construire les prochaines étapes ensemble.'
    },
    {
      title: 'Apprendre et partager les bonnes pratiques',
      category: 'Formation',
      summary: 'Des échanges et des démonstrations autour des pratiques agricoles durables, en associant les expériences et les savoir-faire.'
    },
    {
      title: 'Accompagner la mise en pratique',
      category: 'Terrain',
      summary: 'Un accompagnement collectif pour expérimenter les pratiques, partager les observations et préparer la suite.'
    }
  ];
  const updateText = (parent, selector, text) => {
    parent.querySelectorAll(selector).forEach(element => { element.textContent = text; });
  };

  document.querySelectorAll('#activites .editorial-card').forEach((card, index) => {
    const activity = activities[index % activities.length];
    updateText(card, 'h3', activity.title);
    updateText(card, '.editorial-category', activity.category);
    updateText(card, '.editorial-summary', activity.summary);
    updateText(card, '.editorial-date span', 'Date à renseigner');
  });
  document.querySelectorAll('#activites .ec-event-compact').forEach((card, index) => {
    const activity = activities[index % activities.length];
    updateText(card, '.ec-compact-title', activity.title);
    updateText(card, '.ec-compact-meta', 'Date à renseigner');
    updateText(card, '.ec-compact-place', `${activity.category} · Lieu à préciser`);
    updateText(card, '.ec-compact-excerpt', activity.summary);
  });
  document.querySelectorAll('#activites .activity-editorial-row').forEach((row, index) => {
    const activity = activities[index % activities.length];
    updateText(row, '.activity-row-copy h3', activity.title);
    updateText(row, '.activity-loop-meta', `${activity.category} · Lieu à préciser`);
    updateText(row, '.activity-row-summary', activity.summary);
    updateText(row, '.activity-row-date', 'Date à renseigner');
  });

  const mediaButtons = [...document.querySelectorAll('[data-project-media]')];
  const photoTitles = ['Regards sur le terrain', 'Échanges et formations', 'Ensemble, sur le terrain'];
  const caption = 'Photographie d’illustration · contenu du projet à compléter';
  mediaButtons.forEach((button, index) => {
    const isVideo = button.dataset.kind === 'video';
    button.dataset.title = isVideo ? 'La parole aux communautés' : photoTitles[index % photoTitles.length];
    button.dataset.caption = caption;
    updateText(button, '.media-label', isVideo ? 'Voir le témoignage' : 'Voir la photo');
    const figureCaption = button.closest('figure')?.querySelector('figcaption');
    if (figureCaption) figureCaption.textContent = caption;
  });

  const dialog = document.getElementById('project-media-dialog');
  const visual = dialog?.querySelector('.dialog-visual');
  if (!dialog || !visual) return;

  let activeGroup = [];
  let activeIndex = 0;
  let dialogImage = visual.querySelector('.design-dialog-photo');
  if (!dialogImage) {
    dialogImage = document.createElement('img');
    dialogImage.className = 'design-dialog-photo';
    visual.prepend(dialogImage);
  }
  let videoPrompt = visual.querySelector('.design-dialog-video-prompt');
  if (!videoPrompt) {
    videoPrompt = document.createElement('span');
    videoPrompt.className = 'design-dialog-video-prompt';
    videoPrompt.textContent = 'Emplacement du lecteur vidéo';
    videoPrompt.hidden = true;
    visual.append(videoPrompt);
  }

  const groupName = button => button.dataset.group || button.dataset.kind || 'photo';
  const renderImage = () => {
    const trigger = activeGroup[activeIndex];
    if (!trigger) return;
    const thumbnail = trigger.querySelector('img');
    const isVideo = trigger.dataset.kind === 'video';
    dialogImage.src = thumbnail?.currentSrc || thumbnail?.getAttribute('src') || `${previewBase}assets/apader-gadd-visite-feutap.jpg`;
    dialogImage.alt = thumbnail?.alt || 'Photographie d’illustration du projet';
    videoPrompt.hidden = !isVideo;
    visual.classList.toggle('design-dialog-is-video', isVideo);
    const kindLabel = visual.querySelector('[data-dialog-kind]');
    if (kindLabel) {
      kindLabel.textContent = isVideo ? 'Emplacement du lecteur vidéo' : 'Photographie d’illustration';
      kindLabel.hidden = isVideo;
    }
  };

  // Les gestionnaires de projets.js ouvrent la popup et gèrent ses contrôles.
  // Ces listeners, chargés ensuite, ajoutent uniquement le visuel illustratif.
  mediaButtons.forEach(trigger => {
    trigger.addEventListener('click', () => {
      activeGroup = mediaButtons.filter(button => groupName(button) === groupName(trigger));
      activeIndex = activeGroup.indexOf(trigger);
      renderImage();
    });
  });
  dialog.querySelector('[data-dialog-prev]')?.addEventListener('click', () => {
    if (activeIndex > 0) activeIndex -= 1;
    renderImage();
  });
  dialog.querySelector('[data-dialog-next]')?.addEventListener('click', () => {
    if (activeIndex < activeGroup.length - 1) activeIndex += 1;
    renderImage();
  });
})();
