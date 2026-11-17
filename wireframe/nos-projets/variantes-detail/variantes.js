(() => {
  const params = new URLSearchParams(location.search);
  const project = /^0[1-8]$/.test(params.get('n') || '') ? params.get('n') : '01';
  const activity = /^0[1-6]$/.test(params.get('activite') || '') ? params.get('activite') : '01';
  const selected = /^[abc]$/.test(params.get('variante') || '') ? params.get('variante') : 'a';
  const previewBase = '/nos-projets/variantes-detail/';
  document.querySelectorAll('[data-activity-link]').forEach(link => {
    const variant = link.dataset.activityVariant || selected;
    link.href = `/nos-projets/activite-exemple.html?n=${project}&activite=${link.dataset.activityLink}&variante=${variant}`;
  });
  document.querySelectorAll('[data-version-link]').forEach(link => {
    link.href = `${previewBase}${link.dataset.versionLink}.html?n=${project}#activites`;
  });
  document.querySelectorAll('[data-compare-link]').forEach(link => {
    link.href = `${previewBase}?n=${project}#variante-${link.dataset.compareLink || selected}`;
  });
  document.querySelectorAll('[data-activities-link]').forEach(link => {
    link.href = `/nos-projets/activites/?n=${project}&variante=${link.dataset.activitiesLink || selected}`;
  });
  document.querySelectorAll('[data-activity-back]').forEach(link => {
    link.href = `${previewBase}${selected}.html?n=${project}#activites`;
  });
  document.querySelectorAll('[data-projet-parent]').forEach(link => {
    link.href = `/nos-projets/projet-exemple.html?n=${project}`;
  });
  document.querySelectorAll('[data-activity-name]').forEach(element => {
    element.textContent = `[Titre de l’activité ${activity}]`;
  });
  document.querySelectorAll('[data-collection-variant]').forEach(group => {
    group.hidden = group.dataset.collectionVariant !== selected;
  });
})();
