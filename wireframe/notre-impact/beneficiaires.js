(() => {
  'use strict';
  function mount(section) {
    if(section.dataset.ibaReady) return;
    section.dataset.ibaReady='true';
    const cards=[...section.querySelectorAll('[data-iba-card]')];
    const dots=[...section.querySelectorAll('[data-iba-dot]')];
    const stage=section.querySelector('.iba-stage');
    const live=section.querySelector('[data-iba-live]');
    let active=0,touchStart=null;
    function show(position) {
      active=(position+cards.length)%cards.length;
      cards.forEach((card,i)=>{
        const offset=(i-active+cards.length)%cards.length;
        card.classList.remove('iba-active','iba-peek','iba-near-left','iba-near-right','iba-far-left','iba-far-right');
        if(offset===0) card.classList.add('iba-active');
        else card.classList.add('iba-peek',({1:'iba-near-right',2:'iba-far-right',3:'iba-far-left',4:'iba-near-left'})[offset]);
        card.inert=offset!==0;
        card.setAttribute('aria-hidden',String(offset!==0));
      });
      dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===active)));
      live.textContent=`Bénéficiaire ${active+1} sur ${cards.length}`;
    }
    section.querySelector('[data-iba-previous]').addEventListener('click',()=>show(active-1));
    section.querySelector('[data-iba-next]').addEventListener('click',()=>show(active+1));
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));
    stage.addEventListener('keydown',event=>{
      if(event.target!==stage || event.altKey || event.ctrlKey || event.metaKey) return;
      if(event.key==='ArrowRight') show(active+1);
      else if(event.key==='ArrowLeft') show(active-1);
      else if(event.key==='Home') show(0);
      else if(event.key==='End') show(cards.length-1);
      else return;
      event.preventDefault();
    });
    stage.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='touch' && event.pointerType!=='pen') return;
      touchStart={x:event.clientX,y:event.clientY};
    },{passive:true});
    stage.addEventListener('pointerup',event=>{
      if(!touchStart) return;
      const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;
      touchStart=null;
      if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.3) show(active+(dx<0?1:-1));
    },{passive:true});
    stage.addEventListener('pointercancel',()=>{touchStart=null;},{passive:true});
    show(0);
  }
  function init(){document.querySelectorAll('[data-iba-carousel]').forEach(mount);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
