(() => {
 const root=document.querySelector('[data-sma-carousel]');
 if(!root)return;
 const cards=[...root.querySelectorAll('.impact-story')];
 const dots=[...root.querySelectorAll('.story-dot')];
 let current=0;
 function select(index){
  const moveFocus=cards.some(card=>card.contains(document.activeElement));
  current=(index+cards.length)%cards.length;
  cards.forEach((card,i)=>{
   const offset=(i-current+cards.length)%cards.length;
   // Même composition centrale et aperçus latéraux que l’accueil, adaptée à trois récits.
   const distance=Math.min(offset,cards.length-offset);
   const side=offset<=cards.length/2?'right':'left';
   const position=offset?(distance===1?'near-':'far-')+side:'current';
   card.className='impact-story '+position+(offset?' peek':'');
   const link=card.querySelector('.video-play');
   const peek=card.querySelector('.peek-target');
   link.tabIndex=offset?-1:0;
   peek.tabIndex=offset?0:-1;
   peek.setAttribute('aria-hidden',String(!offset));
  });
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
  root.querySelector('#sma-story-live').textContent='Témoignage '+(current+1)+' sur '+cards.length;
  if(moveFocus)cards[current].querySelector('.video-play').focus({preventScroll:true});
 }
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>select(i)));
 root.querySelectorAll('[data-select]').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.select))));
 root.querySelector('.carousel-stage').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  select(event.key==='Home'?0:event.key==='End'?cards.length-1:current+(event.key==='ArrowRight'?1:-1));
 });
 const dialog=root.querySelector('#sma-video-dialog');
 if(dialog){
  let opener=null;
  let previousOverflow='';
  root.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{
   if(dialog.open)return;
   const number=button.dataset.video;
   dialog.querySelector('#sma-video-title').textContent='Témoignage vidéo de l’espace '+number;
   dialog.querySelector('#sma-video-description').textContent='[Vidéo du témoignage de l’espace '+number+' à fournir]';
   opener=button;
   previousOverflow=document.body.style.overflow;
   dialog.showModal();
   document.body.style.overflow='hidden';
  }));
  dialog.querySelector('[data-close-video]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
   if(event.target!==dialog)return;
   const rect=dialog.getBoundingClientRect();
   if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  });
  dialog.addEventListener('close',()=>{
   document.body.style.overflow=previousOverflow;
   if(opener?.isConnected)opener.focus({preventScroll:true});
   opener=null;
  });
 }
 select(0);
})();
