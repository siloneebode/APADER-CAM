(() => {
 const root=document.querySelector('[data-axes-accordion]');
 if(!root)return;
 const steps=[...root.querySelectorAll('.aac-step')];
 const photos=[...root.querySelectorAll('.aac-photo')];
 const countButtons=[...document.querySelectorAll('button[data-count]')];
 const live=root.querySelector('.aac-live');
 let count=3,selected=0;
 function activate(index){
  if(index<0||index>=count)return;
  selected=index;
  steps.forEach((step,i)=>{
   const active=i===index;
   step.classList.toggle('active',active);
   step.querySelector('button').setAttribute('aria-expanded',String(active));
   const panel=step.querySelector('.aac-content');
   panel.inert=!active;panel.setAttribute('aria-hidden',String(!active));
   photos[i].classList.toggle('active',active);
   photos[i].setAttribute('aria-hidden',String(!active));
  });
  live.textContent='Axe '+(index+1)+' sur '+count+' : '+steps[index].querySelector('.aac-step-title').textContent;
 }
 function setCount(value,update=true){
  count=[3,4,5].includes(value)?value:3;
  root.dataset.count=String(count);
  steps.forEach((step,i)=>step.hidden=i>=count);
  countButtons.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.count)===count)));
  activate(selected<count?selected:0);
  if(update)history.replaceState(null,'','#axes-'+count);
 }
 steps.forEach((step,index)=>{
  const button=step.querySelector('button');
  button.addEventListener('click',()=>activate(index));
  button.addEventListener('keydown',event=>{
   if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
   event.preventDefault();
   const next=event.key==='Home'?0:event.key==='End'?count-1:(index+(event.key==='ArrowDown'?1:-1)+count)%count;
   steps[next].querySelector('button').focus();
  });
 });
 countButtons.forEach(button=>button.addEventListener('click',()=>setCount(Number(button.dataset.count))));
 const readHash=()=>setCount(Number(location.hash.match(/^#axes-([345])$/)?.[1]||3),false);
 window.addEventListener('hashchange',readHash);
 readHash();
})();
