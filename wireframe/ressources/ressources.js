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

    const title = document.querySelector('[data-document-title]');
    if (title) {
      const requestedType = params.get('type');
      const fallbackType = title.dataset.documentType || 'rapports-annuels';
      const type = Object.hasOwn(TYPES, requestedType) ? requestedType : (Object.hasOwn(TYPES, fallbackType) ? fallbackType : 'rapports-annuels');
      const number = /^0[1-6]$/.test(params.get('n') || '') ? params.get('n') : '01';
      const index = Number(number) - 1;
      const values = {
        title: '[' + TYPES[type].title + ' ' + number + ']',
        type: TYPES[type].label,
        year: '[' + String(2026 - (index % 3)) + ']',
        domain: '[' + DOMAINS[index % DOMAINS.length][1] + ']',
        project: '[Projet ' + String(1 + (index % 2)).padStart(2, '0') + ']'
      };
      Object.entries(values).forEach(([key, value]) => {
        document.querySelectorAll('[data-document-' + key + ']').forEach(element => { element.textContent = value; });
      });
      document.querySelectorAll('[data-document-back]').forEach(link => {
        link.href = '/ressources/' + type + '/';
        link.textContent = 'Retour aux ' + TYPES[type].label.toLocaleLowerCase('fr');
      });
    }

    // Les liens des rubriques encore absentes restent inactifs dans ce wireframe.
    document.querySelectorAll('a[href]').forEach(link => {
      if (link.matches('[aria-disabled="true"], [data-disabled], [download]')) return;
      const href = link.getAttribute('href');
      if (href.startsWith('#') && href !== '#') return;
      let url;
      try { url = new URL(href, location.href); } catch { return; }
      const available = url.origin === location.origin && (
        url.pathname === '/' ||
        url.pathname.startsWith('/actualites/') ||
        url.pathname.startsWith('/opportunites/') ||
        url.pathname.startsWith('/ressources/') ||
        url.pathname.startsWith('/nos-projets/') ||
        url.pathname.startsWith('/nos-actions/') ||
        url.pathname.startsWith('/notre-impact/') ||
        ["/contact/","/a-propos/nos-partenaires/","/revue/","/mentions-legales/","/politique-de-confidentialite/","/politique-de-cookies/","/conditions-generales-d-utilisation/","/a-propos/qui-sommes-nous/","/a-propos/equipe/","/a-propos/gouvernance-et-organisation/","/a-propos/notre-histoire/","/a-propos/nos-structures-operationnelles/","/a-propos/nos-structures-operationnelles/ciefad/","/a-propos/nos-structures-operationnelles/espace-jeunes-du-nde/"].includes(url.pathname)
      );
      if (!available || href === '#') link.addEventListener('click', event => event.preventDefault());
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
