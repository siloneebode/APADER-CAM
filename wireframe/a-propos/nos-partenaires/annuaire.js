(() => {
  'use strict';
  const root = document.querySelector('#annuaire.np-directory');
  if (!root) return;

  const filters = [...root.querySelectorAll('[data-np-filter]')];
  const items = [...root.querySelectorAll('.np-directory-item[data-category]')];
  const status = root.querySelector('.np-directory-status');
  const categories = new Set(['tous', 'techniques', 'financiers', 'institutionnels']);
  const legacyHashes = {
    '#partenaires-techniques': 'techniques',
    '#partenaires-financiers': 'financiers',
    '#partenaires-institutionnels': 'institutionnels',
  };
  const adjectives = {
    techniques: ['technique', 'techniques'],
    financiers: ['financier', 'financiers'],
    institutionnels: ['institutionnel', 'institutionnels'],
  };
  let current = 'tous';

  function categoryFromLocation() {
    const legacy = legacyHashes[window.location.hash];
    if (legacy) return legacy;
    const value = new URLSearchParams(window.location.search).get('categorie');
    return categories.has(value) ? value : 'tous';
  }

  function updateUrl(category) {
    const url = new URL(window.location.href);
    if (category === 'tous') url.searchParams.delete('categorie');
    else url.searchParams.set('categorie', category);
    url.hash = 'annuaire';
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  }

  function select(category, writeUrl = false) {
    current = categories.has(category) ? category : 'tous';
    let count = 0;
    items.forEach(item => {
      const visible = current === 'tous' || item.dataset.category === current;
      item.hidden = !visible;
      if (visible) count += 1;
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.npFilter === current)));
    if (status) {
      const suffix = current === 'tous' ? '' : ' ' + adjectives[current][count === 1 ? 0 : 1];
      status.textContent = count + ' partenaire' + (count === 1 ? '' : 's') + suffix;
    }
    if (writeUrl) updateUrl(current);
  }

  filters.forEach(button => button.addEventListener('click', () => select(button.dataset.npFilter, true)));

  let legacyScrollToken = 0;
  function resolveLocation() {
    const legacy = !!legacyHashes[window.location.hash];
    select(categoryFromLocation());
    if (!legacy) return;
    updateUrl(current);
    const token = ++legacyScrollToken;
    const chosen = current;
    let interrupted = false;
    const stop = () => { interrupted = true; };
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    events.forEach(type => window.addEventListener(type, stop, { once: true, passive: true }));
    const loaded = document.readyState === 'complete' ? Promise.resolve()
      : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
    Promise.all([loaded, document.fonts ? document.fonts.ready : Promise.resolve()]).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        events.forEach(type => window.removeEventListener(type, stop));
        if (!interrupted && token === legacyScrollToken && current === chosen && window.location.hash === '#annuaire') {
          root.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
      }));
    });
  }
  window.addEventListener('popstate', resolveLocation);
  window.addEventListener('hashchange', resolveLocation);
  resolveLocation();

  const dialog = document.querySelector('#np-partner-dialog');
  const data = Array.isArray(window.APADER_PARTNERS) ? window.APADER_PARTNERS : [];
  const partners = new Map(data.map(partner => [partner.id, partner]));
  const title = dialog?.querySelector('#np-partner-dialog-title');
  const categoryLabel = dialog?.querySelector('#np-partner-dialog-category');
  const logo = dialog?.querySelector('[data-np-partner-logo]');
  const details = dialog?.querySelector('.np-partner-details');
  const close = dialog?.querySelector('[data-np-partner-close]');
  if (!dialog || !title || !categoryLabel || !logo || !details || !close) return;

  let opener = null;
  let previousOverflow = '';
  root.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest('[data-np-partner]') : null;
    if (!button || !root.contains(button) || document.querySelector('dialog[open]')) return;
    const partner = partners.get(button.dataset.npPartner);
    if (!partner) return;
    title.textContent = partner.name;
    categoryLabel.textContent = partner.categoryLabel;
    logo.textContent = partner.logoLabel;
    const fields = Array.isArray(partner.fields) ? partner.fields : [];
    details.replaceChildren(...fields.map(field => {
      const row = document.createElement('div');
      const label = document.createElement('dt');
      const value = document.createElement('dd');
      label.textContent = field.label;
      value.textContent = field.value;
      row.append(label, value);
      return row;
    }));
    opener = button;
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    const target = opener?.isConnected && !opener.closest('[hidden]') ? opener
      : filters.find(button => button.dataset.npFilter === current);
    target?.focus({ preventScroll: true });
    opener = null;
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
})();
