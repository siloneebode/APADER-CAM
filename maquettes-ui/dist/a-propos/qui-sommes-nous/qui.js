(() => {
  'use strict';
  // Native details retain keyboard support; this also supports browsers that
  // have not implemented mutually exclusive details with the name attribute.
  const values = [...document.querySelectorAll('#valeurs details[name="vp-values"]')];
  values.forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) values.forEach(other => { if (other !== detail) other.open = false; });
  }));

  const approach = document.querySelector('#ap-b');
  if (!approach) return;
  const items = [...approach.querySelectorAll('.ap-b-item')];
  const tabs = items.map(item => item.querySelector('.ap-b-tab'));
  function select(index, focus = false) {
    const chosen = (index + items.length) % items.length;
    items.forEach((item, i) => {
      const open = i === chosen;
      item.classList.toggle('ap-open', open);
      tabs[i].setAttribute('aria-expanded', String(open));
      item.querySelector('.ap-b-panel').hidden = !open;
    });
    if (focus) tabs[chosen].focus({ preventScroll: true });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
        : i + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1);
      select(next, true);
    });
  });
  items.forEach((item, i) => item.querySelector('.ap-b-next').addEventListener('click', () => select(i + 1, true)));
})();
