(() => {
  'use strict';
  const page = window.APADER_REVIEW;
  if (!page?.sections?.length) return;
  const params = new URLSearchParams(location.search);
  const panels = new Map();
  const selections = new Map();
  let userInteracted = false;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  page.sections.forEach(definition => {
    let section = document.querySelector(definition.selector || `#${definition.section}`);
    if (!section) return;
    const requested = params.get(definition.key);
    const selected = definition.variants.find(variant => variant.id === requested)
      || definition.variants.find(variant => variant.id === definition.default)
      || definition.variants[0];
    const sectionId = section.id || definition.section;
    if (selected.html) {
      const template = document.createElement('template');
      template.innerHTML = selected.html.trim();
      const replacement = template.content.firstElementChild;
      if (!replacement) return;
      replacement.id = sectionId;
      section.replaceWith(template.content);
      section = document.getElementById(sectionId);
    } else if (!section.id) section.id = sectionId;
    if (!section) return;
    section.dataset.apReviewSection = definition.section;
    section.dataset.apReviewVariant = selected.id;
    selections.set(definition.key, selected.id);

    const links = definition.variants.map(variant => {
      const url = new URL(location.href);
      url.searchParams.set(definition.key, variant.id);
      url.hash = sectionId;
      const current = variant.id === selected.id;
      return `<a class="ap-review-option" data-ap-review-select="${escape(definition.section)}" data-ap-review-choice="${escape(variant.id)}" href="${escape(url.pathname + url.search + url.hash)}"${current ? ' aria-current="true"' : ''}><span class="ap-review-letter">${escape(variant.id.toUpperCase())}</span><span class="ap-review-option-title">${escape(variant.title)}</span><span class="ap-review-option-state">${current ? 'Affichée' : 'Voir cette version ↗'}</span></a>`;
    }).join('');
    const notes = selected.reviewNotes || definition.reviewNotes;
    const descriptions = definition.variants.map(variant => `<div><dt>${escape(variant.id.toUpperCase())} · ${escape(variant.title)}</dt><dd>${escape(variant.description)}</dd></div>`).join('');
    const noteMarkup = `<details class="ap-review-notes"><summary>Détails des modèles</summary><dl class="ap-review-descriptions">${descriptions}</dl>${notes?.length ? `<ul>${notes.map(note => `<li>${escape(note)}</li>`).join('')}</ul>` : ''}<p class="ap-review-status">Les versions restent à choisir avec l’APADER. « Affichée » indique la version consultée.</p></details>`;
    const panel = document.createElement('aside');
    panel.id = `comparaison-${sectionId}`;
    panel.className = 'ap-review-panel';
    panel.setAttribute('aria-label', `Comparer : ${definition.label}`);
    panel.innerHTML = `<div class="ap-review-inner" style="--ap-review-count:${definition.variants.length}"><header class="ap-review-heading"><p class="ap-review-kicker">${escape(definition.label)} · Comparaison</p><h2>Comparer cette section</h2><p>La page reste complète. Seule cette section change.</p></header><nav class="ap-review-options" style="--ap-review-count:${definition.variants.length}" aria-label="Modèles de ${escape(definition.label)}">${links}</nav>${noteMarkup}</div>`;
    section.insertAdjacentElement(definition.placement === 'after' ? 'afterend' : 'beforebegin', panel);
    panels.set(sectionId, { panel, section, definition });
  });
  // Les navigations ancrées historiques laissent la comparaison gérer ce retour.
  page.ownsAnchor = id => {
    const entry = panels.get(id);
    return Boolean(entry && params.has(entry.definition.key));
  };
  const preserveLegacyChoices = () => {
    document.querySelectorAll('[data-version-link]').forEach(link => {
      const url = new URL(link.href, location.href);
      selections.forEach((value, key) => url.searchParams.set(key, value));
      link.href = url.pathname + url.search + url.hash;
    });
  };
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', preserveLegacyChoices, { once: true });
  else preserveLegacyChoices();
  document.body.classList.add('ap-review-page');
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => {
    window.addEventListener(type, () => { userInteracted = true; }, { once: true, passive: true });
  });
  const loaded = document.readyState === 'complete' ? Promise.resolve()
    : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
  Promise.all([loaded, document.fonts ? document.fonts.ready : Promise.resolve()]).then(() => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const entry = panels.get(id);
    if (!entry || !params.has(entry.definition.key)) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (userInteracted) return;
      const target = entry.definition.placement === 'after' ? entry.section : entry.panel;
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    }));
  });
})();
