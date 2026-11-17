(() => {
  'use strict';
  const root = document.querySelector('#contact-final');
  const dialog = root?.querySelector('#qi-contact-final-dialog');
  if (!dialog) return;
  let opener;
  let previousOverflow = '';
  root.querySelector('[data-qic-open]').addEventListener('click', event => {
    if (dialog.open) return;
    opener = event.currentTarget;
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
  root.querySelector('[data-qic-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
})();
