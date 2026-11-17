(() => {
  'use strict';
  function mount(root){
    if(root.dataset.smgReady)return;root.dataset.smgReady='true';
    const viewport=root.querySelector('.smg-window'),track=root.querySelector('.smg-track'),group=root.querySelector('[data-smg-group]');
    const originals=[...group.querySelectorAll('[data-smg-original]')],previous=root.querySelector('[data-smg-previous]'),next=root.querySelector('[data-smg-next]'),pause=root.querySelector('[data-smg-pause]'),live=root.querySelector('[data-smg-live]');
    const clone=group.cloneNode(true);clone.removeAttribute('data-smg-group');clone.setAttribute('aria-hidden','true');clone.inert=true;clone.classList.add('smg-clone');
    clone.querySelectorAll('button').forEach((button,index)=>{button.removeAttribute('data-sm-gallery');button.removeAttribute('data-smg-original');button.removeAttribute('aria-controls');button.removeAttribute('aria-haspopup');button.tabIndex=-1;button.dataset.smgCloneIndex=String(index);});
    track.append(clone);
    const reduce=matchMedia('(prefers-reduced-motion:reduce)'),compact=matchMedia('(max-width:760px)');
    let manualPaused=false,hover=false,focused=false,visible=true,loop=false,cycle=0,last=0,frame=0,x=0;
    const mod=(n,d)=>d?((n%d)+d)%d:0;
    function controls(){const end=viewport.scrollWidth-viewport.clientWidth;previous.disabled=!loop&&viewport.scrollLeft<=1;next.disabled=!loop&&viewport.scrollLeft>=end-1;}
    function paused(){return manualPaused||hover||focused||!visible||document.hidden;}
    function renderPause(){pause.disabled=!loop;pause.setAttribute('aria-pressed',String(manualPaused));pause.innerHTML=!loop?'Défilement manuel':manualPaused?'Reprendre le défilement <span aria-hidden="true">▶</span>':'Mettre en pause <span aria-hidden="true">Ⅱ</span>';}
    function measure(){
      const wasLoop=loop;loop=!reduce.matches&&!compact.matches;
      clone.hidden=!loop;cycle=group.getBoundingClientRect().width;
      if(wasLoop&&!loop)viewport.scrollLeft=Math.min(mod(x,cycle),Math.max(0,group.offsetWidth-viewport.clientWidth));
      x=viewport.scrollLeft;renderPause();controls();last=0;
    }
    function tick(time){
      frame=0;const elapsed=last?Math.min(64,time-last):0;last=time;
      if(loop&&!paused()&&cycle>0){x=mod(viewport.scrollLeft+elapsed*.038,cycle);viewport.scrollLeft=x;}
      frame=requestAnimationFrame(tick);
    }
    function move(direction){
      if(!cycle)return;
      const current=loop?mod(viewport.scrollLeft,cycle):viewport.scrollLeft;
      const stops=originals.map(item=>item.offsetLeft);
      let target;
      if(direction>0){target=stops.find(stop=>stop>current+4);if(target===undefined)target=loop?cycle:viewport.scrollWidth-viewport.clientWidth;}
      else{target=stops.slice().reverse().find(stop=>stop<current-4);if(target===undefined&&loop){viewport.scrollLeft=Math.max(0,cycle-1);target=stops[stops.length-1];}else if(target===undefined)target=0;}
      viewport.scrollTo({left:target,behavior:reduce.matches?'auto':'smooth'});
      live.textContent=direction>0?'Images suivantes':'Images précédentes';
    }
    previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
    pause.addEventListener('click',()=>{manualPaused=!manualPaused;renderPause();});
    root.addEventListener('pointerenter',()=>{hover=true;});root.addEventListener('pointerleave',()=>{hover=false;});
    root.addEventListener('focusin',()=>{focused=true;});root.addEventListener('focusout',event=>{focused=Boolean(event.relatedTarget&&root.contains(event.relatedTarget));});
    viewport.addEventListener('scroll',()=>{if(loop&&cycle&&viewport.scrollLeft>=cycle){viewport.scrollLeft=mod(viewport.scrollLeft,cycle);}x=viewport.scrollLeft;controls();},{passive:true});
    viewport.addEventListener('keydown',event=>{if(event.target!==viewport||event.altKey||event.ctrlKey||event.metaKey)return;if(event.key==='ArrowLeft')move(-1);else if(event.key==='ArrowRight')move(1);else return;event.preventDefault();});
    // Les copies sont inertes. Un clic sur leur surface visible ouvre le média original correspondant.
    viewport.addEventListener('click',event=>{if(event.target.closest('[data-smg-original]'))return;const copy=[...clone.querySelectorAll('[data-smg-clone-index]')].find(item=>{const r=item.getBoundingClientRect();return event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;});if(copy)originals[Number(copy.dataset.smgCloneIndex)].click();});
    document.addEventListener('visibilitychange',()=>{last=0;});
    window.addEventListener('resize',measure,{passive:true});reduce.addEventListener('change',measure);compact.addEventListener('change',measure);
    if(window.IntersectionObserver)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;},{rootMargin:'100px'}).observe(root);
    if(document.fonts)document.fonts.ready.then(measure);
    measure();frame=requestAnimationFrame(tick);
  }
  function init(){document.querySelectorAll('[data-smg-gallery]').forEach(mount);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
