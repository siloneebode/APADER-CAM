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
  
})();
