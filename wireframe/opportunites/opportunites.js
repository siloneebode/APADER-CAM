(() => {
  document.querySelectorAll('[data-opportunity-collection]').forEach(root => {
    const entries = [...root.querySelectorAll('[data-entry]')];
    const fields = [...root.querySelectorAll('[data-filter]')];
    const initial = Number(root.dataset.initial || 6);
    const more = root.querySelector('[data-more]');
    let limit = initial;
    function update() {
      const matching = entries.filter(entry => fields.every(field => !field.value || entry.dataset[field.dataset.filter] === field.value));
      entries.forEach(entry => { entry.hidden = true; });
      matching.slice(0, limit).forEach(entry => { entry.hidden = false; });
      root.querySelector('[data-count]').textContent = matching.length + ' opportunité' + (matching.length > 1 ? 's' : '');
      root.querySelector('[data-empty]').hidden = matching.length > 0;
      if (more) more.hidden = limit >= matching.length;
    }
    fields.forEach(field => field.addEventListener('change', () => { limit = initial; update(); }));
    root.querySelector('[data-reset]').addEventListener('click', () => {
      fields.forEach(field => { field.value = ''; });
      limit = initial;
      update();
    });
    more?.addEventListener('click', () => { limit += initial; update(); });
    update();
  });
  const value = new URLSearchParams(location.search).get('n');
  const number = /^(0[1-9]|1[0-2])$/.test(value || '') ? value : '01';
  document.querySelectorAll('[data-opportunity-title]').forEach(title => {
    title.textContent = title.dataset.opportunityTitle.replace('{n}', number);
  });
  // Seules les rubriques déjà disponibles du portail sont navigables dans le prototype.
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '/' || href.startsWith('/actualites/') || href.startsWith('/opportunites/')||href.startsWith('/ressources/')||href.startsWith('/nos-projets/')||href.startsWith('/nos-actions/')||href.startsWith('/notre-impact/') || ["/contact/","/a-propos/nos-partenaires/","/revue/","/mentions-legales/","/politique-de-confidentialite/","/politique-de-cookies/","/conditions-generales-d-utilisation/","/a-propos/qui-sommes-nous/","/a-propos/equipe/","/a-propos/gouvernance-et-organisation/","/a-propos/notre-histoire/","/a-propos/nos-structures-operationnelles/","/a-propos/nos-structures-operationnelles/ciefad/","/a-propos/nos-structures-operationnelles/espace-jeunes-du-nde/"].includes(href) || (href.startsWith('#') && href !== '#')) return;
    link.addEventListener('click', event => event.preventDefault());
  });
})();
