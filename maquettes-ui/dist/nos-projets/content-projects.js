(() => {
  'use strict';

  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const catalogueNames = {
    '': 'Tous les projets',
    'en-cours': 'Projets en cours',
    realise: 'Projets réalisés'
  };

  document.querySelectorAll('[data-project-collection]').forEach(root => {
    const entries = [...root.querySelectorAll('[data-project-entry]')];
    const fields = [...root.querySelectorAll('[data-project-filter]')];
    const search = root.querySelector('[data-project-search]');
    const more = root.querySelector('[data-project-more]');
    const count = root.querySelector('[data-project-count]');
    const empty = root.querySelector('[data-project-empty]');
    const initial = Math.max(1, Number(root.dataset.initial) || 3);
    const aliases = { domain: 'domaine', year: 'annee' };
    let limit = initial;

    function readQuery() {
      const params = new URLSearchParams(location.search);
      fields.forEach(field => {
        const key = field.dataset.projectFilter;
        const value = params.get(key) ?? params.get(aliases[key]) ?? '';
        field.value = [...field.options].some(option => option.value === value) ? value : '';
      });
      if (search) search.value = params.get('q') || '';
    }

    function update(syncQuery = false) {
      const terms = normalize(search?.value).split(/\s+/).filter(Boolean);
      const matching = entries.filter(entry => {
        const text = normalize(entry.dataset.search || entry.textContent);
        return fields.every(field => !field.value || entry.dataset[field.dataset.projectFilter] === field.value)
          && terms.every(term => text.includes(term));
      });
      entries.forEach(entry => { entry.hidden = true; });
      matching.slice(0, limit).forEach(entry => { entry.hidden = false; });
      if (count) count.textContent = `${matching.length} projet${matching.length > 1 ? 's' : ''}`;
      if (empty) empty.hidden = matching.length > 0;
      if (more) more.hidden = limit >= matching.length;

      const status = fields.find(field => field.dataset.projectFilter === 'statut')?.value || '';
      const title = catalogueNames[status] || catalogueNames[''];
      document.querySelectorAll('[data-catalog-title], [data-catalog-breadcrumb]').forEach(element => { element.textContent = title; });

      if (syncQuery) {
        const url = new URL(location.href);
        fields.forEach(field => {
          const key = field.dataset.projectFilter;
          if (field.value) url.searchParams.set(key, field.value);
          else url.searchParams.delete(key);
          if (aliases[key]) url.searchParams.delete(aliases[key]);
        });
        if (search?.value.trim()) url.searchParams.set('q', search.value.trim());
        else url.searchParams.delete('q');
        history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      }
    }

    const filterChanged = () => { limit = initial; update(true); };
    fields.forEach(field => field.addEventListener('change', filterChanged));
    search?.addEventListener('input', filterChanged);
    root.querySelector('[data-project-search-form]')?.addEventListener('submit', event => { event.preventDefault(); filterChanged(); });
    root.querySelector('[data-project-reset]')?.addEventListener('click', event => {
      event.preventDefault();
      fields.forEach(field => { field.value = ''; });
      if (search) search.value = '';
      limit = initial;
      update(true);
    });
    more?.addEventListener('click', () => { limit += initial; update(); });
    window.addEventListener('popstate', () => { readQuery(); limit = initial; update(); });
    readQuery();
    update();
  });

  const jumpLinks = [...document.querySelectorAll('.project-jump-links a[href^="#"]')];
  const targets = jumpLinks.map(link => {
    const id = decodeURIComponent(link.hash.slice(1));
    return { link, target: document.getElementById(id) };
  }).filter(item => item.target);
  let currentProjectSection = '';
  function markCurrent(id) {
    if (id === currentProjectSection) return;
    currentProjectSection = id;
    targets.forEach(({ link, target }) => {
      if (target.id === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  const projectPage = document.querySelector('.projects-page');
  const projectHeader = document.getElementById('apader-header');
  const projectJump = document.querySelector('.project-jump');
  if (targets.length && projectPage && projectHeader && projectJump) {
    let menuBottom = 80;
    let closedHeaderHeight = 72;
    let anchorOffset = 143;
    let frame = 0;
    let measureRequested = true;
    let userInteracted = false;

    function syncHeader() {
      const scrolled = window.scrollY > 8;
      const changed = projectPage.classList.contains('project-nav-scrolled') !== scrolled;
      projectPage.classList.toggle('project-nav-scrolled', scrolled);
      return changed;
    }
    function measureNavigation() {
      syncHeader();
      const rect = projectHeader.getBoundingClientRect();
      if (!projectHeader.classList.contains('has-open-menu')) closedHeaderHeight = rect.height;
      menuBottom = Math.round(rect.top + closedHeaderHeight);
      anchorOffset = Math.ceil(menuBottom + projectJump.getBoundingClientRect().height - 1);
      projectPage.style.setProperty('--project-menu-bottom', `${menuBottom}px`);
      projectPage.style.setProperty('--project-bar-width', `${rect.width}px`);
      projectPage.style.setProperty('--project-anchor-offset', `${anchorOffset}px`);
    }
    function updateNavigation() {
      frame = 0;
      if (syncHeader()) measureRequested = true;
      if (measureRequested) {
        measureNavigation();
        measureRequested = false;
      }
      const docked = projectJump.getBoundingClientRect().top <= menuBottom + 1
        && !projectHeader.classList.contains('has-open-menu');
      projectPage.classList.toggle('project-nav-docked', docked);
      let active = targets[0];
      for (const item of targets) {
        if (item.target.getBoundingClientRect().top <= anchorOffset + 4) active = item;
        else break;
      }
      markCurrent(active.target.id);
    }
    function scheduleNavigation(needsMeasure = false) {
      measureRequested = measureRequested || needsMeasure;
      if (!frame) frame = requestAnimationFrame(updateNavigation);
    }

    targets.forEach(({ link, target }) => {
      link.addEventListener('click', () => {
        measureNavigation();
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        markCurrent(target.id);
        scheduleNavigation();
      });
    });
    window.addEventListener('scroll', () => scheduleNavigation(), { passive: true });
    window.addEventListener('resize', () => scheduleNavigation(true), { passive: true });
    window.addEventListener('hashchange', () => {
      markCurrent(location.hash.slice(1));
      scheduleNavigation(true);
    });
    if ('ResizeObserver' in window) {
      const resize = new ResizeObserver(() => scheduleNavigation(true));
      resize.observe(projectHeader);
      resize.observe(projectJump);
    }
    new MutationObserver(() => scheduleNavigation(true)).observe(projectHeader, {
      attributes: true,
      attributeFilter: ['class']
    });
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => {
      window.addEventListener(type, () => { userInteracted = true; }, { once: true, passive: true });
    });
    const loaded = document.readyState === 'complete' ? Promise.resolve()
      : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
    Promise.all([loaded, document.fonts ? document.fonts.ready : Promise.resolve()]).then(() => {
      measureNavigation();
      const target = document.getElementById(location.hash.slice(1));
      if (target && !window.APADER_REVIEW?.ownsAnchor?.(target.id)) requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!userInteracted) {
          measureNavigation();
          target.scrollIntoView({ block: 'start', behavior: 'instant' });
          scheduleNavigation(true);
        }
      }));
      scheduleNavigation(true);
    });
    scheduleNavigation(true);
  }

  const tabs = [...document.querySelectorAll('[data-media-tab]')];
  function activateTab(tab, focus = false) {
    const kind = tab.dataset.mediaTab;
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll('[data-media-panel]').forEach(panel => { panel.hidden = panel.dataset.mediaPanel !== kind; });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, position) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (position + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (position - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activateTab(tabs[next], true);
    });
  });
  if (tabs.length) activateTab(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0]);

  const dialog = document.getElementById('project-media-dialog');
  if (dialog) {
    const mediaButtons = [...document.querySelectorAll('[data-project-media]')];
    const previous = dialog.querySelector('[data-dialog-prev]');
    const next = dialog.querySelector('[data-dialog-next]');
    const close = dialog.querySelector('[data-dialog-close]');
    let group = [];
    let position = 0;
    let returnFocus = null;

    function renderMedia() {
      const trigger = group[position];
      if (!trigger) return;
      const kind = trigger.dataset.kind === 'video' ? 'video' : 'photo';
      const title = dialog.querySelector('[data-dialog-title]');
      const caption = dialog.querySelector('[data-dialog-caption]');
      const label = dialog.querySelector('[data-dialog-kind]');
      if (title) title.textContent = trigger.dataset.title || (kind === 'video' ? '[Titre de la vidéo]' : '[Titre de la photo]');
      if (caption) caption.textContent = trigger.dataset.caption || '[Légende du média — contenu provisoire]';
      if (label) label.textContent = kind === 'video' ? '[Vidéo du projet — emplacement du lecteur]' : '[Photo du projet — emplacement du visuel]';
      dialog.dataset.kind = kind;
      if (previous) previous.disabled = position === 0;
      if (next) next.disabled = position >= group.length - 1;
    }
    mediaButtons.forEach(trigger => {
      trigger.addEventListener('click', () => {
        returnFocus = trigger;
        const groupName = trigger.dataset.group || trigger.dataset.kind || 'photo';
        group = mediaButtons.filter(item => (item.dataset.group || item.dataset.kind || 'photo') === groupName);
        position = group.indexOf(trigger);
        renderMedia();
        if (!dialog.open) dialog.showModal();
        close?.focus();
      });
    });
    previous?.addEventListener('click', () => { if (position > 0) { position -= 1; renderMedia(); } });
    next?.addEventListener('click', () => { if (position < group.length - 1) { position += 1; renderMedia(); } });
    close?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => { if (returnFocus?.isConnected) returnFocus.focus(); });
  }

  // Les liens des rubriques disponibles restent navigables dans le wireframe.
  
})();
