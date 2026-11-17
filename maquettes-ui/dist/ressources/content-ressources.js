(() => {
  const TYPES = {
    'rapports-annuels': { label: 'Rapports annuels', title: 'Rapport annuel' },
    'rapports-de-projets': { label: 'Rapports de projets', title: 'Rapport de projet' },
    'publications-et-etudes': { label: 'Publications et études', title: 'Publication ou étude' },
    'manuels-et-guides-techniques': { label: 'Manuels et guides techniques', title: 'Manuel ou guide technique' },
    'supports-de-formation': { label: 'Supports de formation', title: 'Support de formation' },
    'documents-institutionnels': { label: 'Documents institutionnels', title: 'Document institutionnel' }
  };
  const DOMAINS = [
    ['agriculture-durable-et-agroforesterie', 'Agriculture durable et agroforesterie'],
    ['autonomisation-des-femmes', 'Autonomisation des femmes'],
    ['jeunesse-leadership-et-citoyennete', 'Jeunesse, leadership et citoyenneté'],
    ['paix-cohesion-sociale-et-gouvernance', 'Paix, cohésion sociale et gouvernance']
  ];
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim();
  const params = new URLSearchParams(location.search);

  function initialize() {
    document.querySelectorAll('[data-resource-collection]').forEach(root => {
      const entries = [...root.querySelectorAll('li[data-resource]')];
      const fields = [...root.querySelectorAll('select[data-filter]')];
      const search = root.querySelector('[data-search-input]');
      const more = root.querySelector('[data-more]');
      const count = root.querySelector('[data-count]');
      const empty = root.querySelector('[data-empty]');
      const initial = Math.max(1, Number(root.dataset.initial) || 6);
      let limit = initial;

      fields.forEach(field => {
        const value = params.get(field.dataset.filter);
        if (value !== null && [...field.options].some(option => option.value === value)) field.value = value;
      });
      if (search && params.has('q')) search.value = params.get('q');

      function update() {
        const terms = normalize(search?.value).split(/\s+/).filter(Boolean);
        const matching = entries.filter(entry => {
          const matchesFields = fields.every(field => !field.value || entry.dataset[field.dataset.filter] === field.value);
          const text = normalize(entry.dataset.search || entry.textContent);
          return matchesFields && terms.every(term => text.includes(term));
        });
        entries.forEach(entry => { entry.hidden = true; });
        matching.slice(0, limit).forEach(entry => { entry.hidden = false; });
        if (count) count.textContent = matching.length + ' ressource' + (matching.length > 1 ? 's' : '');
        if (empty) empty.hidden = matching.length > 0;
        if (more) more.hidden = matching.length <= limit;
      }

      const refilter = () => { limit = initial; update(); };
      fields.forEach(field => field.addEventListener('change', refilter));
      search?.addEventListener('input', refilter);
      root.querySelector('[data-search-form]')?.addEventListener('submit', event => {
        event.preventDefault();
        refilter();
      });
      root.querySelector('[data-reset]')?.addEventListener('click', event => {
        event.preventDefault();
        fields.forEach(field => { field.value = ''; });
        if (search) search.value = '';
        refilter();
      });
      more?.addEventListener('click', event => {
        event.preventDefault();
        limit += initial;
        update();
      });
      update();
    });

  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initialize,{once:true}); else initialize();
})();
