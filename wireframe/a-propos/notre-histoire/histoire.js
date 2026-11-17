(() => {
  'use strict';
  const section=document.querySelector('[data-ah-history]');
  if(!section) return;
  const steps=[...section.querySelectorAll('[data-ah-step]')];
  const links=[...section.querySelectorAll('.ah-index-link')];
  let queued=false;
  function update(){
    queued=false;
    const threshold=Math.min(window.innerHeight*.34,280);
    let active=0;
    steps.forEach((step,index)=>{if(step.getBoundingClientRect().top<=threshold) active=index;});
    steps.forEach((step,index)=>step.classList.toggle('ah-is-active',index===active));
    links.forEach((link,index)=>{
      const current=index===active;
      link.classList.toggle('ah-is-active',current);
      if(current) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule(){if(!queued){queued=true;window.requestAnimationFrame(update);}}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('hashchange',schedule);
  if(document.fonts) document.fonts.ready.then(schedule);
  update();
})();
