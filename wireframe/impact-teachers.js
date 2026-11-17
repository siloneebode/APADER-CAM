(() => {
 const root=document.querySelector('#impact #recits-impact');
 if(!root)return;
 const cards=[...root.querySelectorAll('.impact-story')];
 const dots=[...root.querySelectorAll('.story-dot')];
 const classes=['current','near-right','far-right','far-left','near-left'];
 let current=0;
 function select(index){
  const moveFocus=cards.some(card=>card.contains(document.activeElement));
  current=(index+cards.length)%cards.length;
  cards.forEach((card,i)=>{
   const offset=(i-current+cards.length)%cards.length;
   card.className='impact-story '+classes[offset]+(offset?' peek':'');
   const link=card.querySelector('.video-play');
   const peek=card.querySelector('.peek-target');
   link.tabIndex=offset?-1:0;
   peek.tabIndex=offset?0:-1;
   peek.setAttribute('aria-hidden',String(!offset));
  });
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
  root.querySelector('#story-live').textContent='Récit '+(current+1)+' sur '+cards.length;
  if(moveFocus)cards[current].querySelector('.video-play').focus({preventScroll:true});
 }
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>select(i)));
 root.querySelectorAll('[data-select]').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.select))));
 root.querySelector('.carousel-stage').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  select(event.key==='Home'?0:event.key==='End'?cards.length-1:current+(event.key==='ArrowRight'?1:-1));
 });
 const dialog=root.querySelector('#impact-video-dialog');
 if(dialog){
  let opener=null;
  let previousOverflow='';
  root.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{
   if(dialog.open)return;
   const number=button.dataset.video;
   dialog.querySelector('#impact-video-title').textContent='Témoignage vidéo '+number;
   dialog.querySelector('#impact-video-description').textContent='[Vidéo du témoignage '+number+' à fournir]';
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
 document.querySelectorAll('#impact [data-demo-link]').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));
 select(0);
})();
