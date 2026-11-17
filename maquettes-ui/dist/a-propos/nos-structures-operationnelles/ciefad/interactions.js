(() => {
  'use strict';

  function mount(root) {
    if (root.dataset.smReady) return;
    root.dataset.smReady = 'true';

    const activities = [...root.querySelectorAll('[data-sm-activity]')];
    const activityImage = root.querySelector('[data-sm-activity-image]');
    const activityVisual = root.querySelector('[data-sm-activity-visual]');
    function showActivity(detail) {
      if (!detail || !detail.open) return;
      activities.forEach(other => { if (other !== detail) other.open = false; });
      const caption = detail.dataset.smPhoto || '[Photo de l’activité]';
      if (activityImage) activityImage.textContent = caption; if (activityVisual && detail.dataset.smSrc) { const img=activityVisual.querySelector('img'); if(img){img.src=detail.dataset.smSrc;img.alt=caption;} }
      if (activityVisual) activityVisual.setAttribute('aria-label', caption);
    }
    activities.forEach(detail => detail.addEventListener('toggle', () => showActivity(detail)));
    showActivity(activities.find(detail => detail.open));

    const dialog = root.querySelector('#sm-media-dialog') || document.querySelector('#sm-media-dialog');
    if (dialog && typeof dialog.showModal === 'function') {
      const title = dialog.querySelector('[data-sm-media-title]');
      const label = dialog.querySelector('[data-sm-media-label]');
      const content = dialog.querySelector('[data-sm-media-content]');
      const caption = dialog.querySelector('[data-sm-media-caption]');
      let opener = null;
      root.querySelectorAll('[data-sm-gallery]').forEach(button => {
        button.addEventListener('click', () => {
          opener = button;
          const video = button.dataset.smGallery === 'video';
          if (title) title.textContent = 'Photographie APADER';
          if (label) label.textContent=''; if(content && button.dataset.smSrc){let img=content.querySelector('img');if(!img){img=document.createElement('img');content.append(img);} img.src=button.dataset.smSrc;img.alt=button.dataset.smCaption||'Photographie APADER';img.style.cssText='width:100%;height:100%;object-fit:contain';}
          if (caption) caption.textContent = button.dataset.smCaption || '';
          if (content) content.classList.toggle('sm-is-video', video);
          if (!dialog.open) dialog.showModal();
        });
      });
      dialog.querySelector('[data-sm-close-media]')?.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      });
      dialog.addEventListener('close', () => {
        if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      });
    }


  }

  function init() { document.querySelectorAll('[data-sm-structure]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
