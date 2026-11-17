(() => {
 const root=document.querySelector('.apj-projects-pinpoint');
 if(root){
  const slides=[...root.querySelectorAll('.apj-project-slide')];
  const dots=[...root.querySelectorAll('.apj-project-dot')];
  const prev=root.querySelector('.apj-project-prev'),next=root.querySelector('.apj-project-next');
  let index=0;
  function select(value){
   index=Math.max(0,Math.min(slides.length-1,value));
   const focusLeavesSlide=slides.some((slide,i)=>i!==index&&slide.contains(document.activeElement));
   root.querySelector('.apj-project-strip').style.setProperty('--project-index',index);
   slides.forEach((slide,i)=>{slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
   dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
   prev.disabled=index===0;next.disabled=index===slides.length-1;
   root.querySelector('.apj-project-counter').textContent=`Projet ${index+1} sur ${slides.length}`;
   if(focusLeavesSlide)root.querySelector('.apj-project-window').focus({preventScroll:true});
  }
  prev.addEventListener('click',()=>select(index-1));next.addEventListener('click',()=>select(index+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>select(i)));
  root.querySelector('.apj-project-window').addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();select(index+(event.key==='ArrowRight'?1:-1));}});
  select(0);
 }
 document.querySelectorAll('[data-demo-link]').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));
})();
