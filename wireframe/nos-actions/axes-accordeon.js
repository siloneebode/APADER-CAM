(() => {
 const root=document.querySelector('[data-axes-accordion]');
 if(!root)return;
 const steps=[...root.querySelectorAll('.aac-step')];
 const photos=[...root.querySelectorAll('.aac-photo')];
 const live=root.querySelector('.aac-live');
 const count=steps.length;
 function activate(index){
  if(index<0||index>=count)return;
  steps.forEach((step,i)=>{
   const active=i===index;
   step.classList.toggle('active',active);
   step.querySelector('.aac-trigger').setAttribute('aria-expanded',String(active));
   const panel=step.querySelector('.aac-content');
   panel.inert=!active;
   panel.setAttribute('aria-hidden',String(!active));
   if(photos[i]){
    photos[i].classList.toggle('active',active);
    photos[i].setAttribute('aria-hidden',String(!active));
   }
  });
  if(live)live.textContent='Axe '+(index+1)+' sur '+count+' : '+steps[index].querySelector('.aac-step-title').textContent;
 }
 steps.forEach((step,index)=>{
  const button=step.querySelector('.aac-trigger');
  button.addEventListener('click',()=>activate(index));
  button.addEventListener('keydown',event=>{
   if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
   event.preventDefault();
   const next=event.key==='Home'?0:event.key==='End'?count-1:(index+(event.key==='ArrowDown'?1:-1)+count)%count;
   steps[next].querySelector('.aac-trigger').focus();
  });
 });
 if(count)activate(0);
})();
