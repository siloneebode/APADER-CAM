(() => {
  'use strict';

  const form = document.getElementById('nc-contact-form');
  if (!form) return;

  const submit = form.querySelector('button[type="submit"]');
  const status = document.getElementById('nc-form-status');
  if (!submit || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    status.textContent = 'Votre formulaire est complet. Cet aperçu n’envoie aucun message.';
    status.hidden = false;
    status.focus();
  });

  form.addEventListener('input', () => {
    if (!status.hidden) {
      status.hidden = true;
      status.textContent = '';
    }
  });

  submit.disabled = false;
})();
