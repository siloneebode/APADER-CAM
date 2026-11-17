(() => {
  'use strict';
  const dialog = document.querySelector('#beneficiary-dialog');
  if (!dialog) return;
  let opener;
  document.querySelectorAll('[data-beneficiary-open]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      dialog.querySelector('[data-profile-index]').textContent = String(button.dataset.beneficiaryOpen).padStart(2, '0');
      dialog.showModal();
    });
  });
  dialog.querySelector('[data-beneficiary-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect=dialog.getBoundingClientRect();
    if (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { if(opener && !opener.inert) opener.focus({preventScroll:true}); });
})();
