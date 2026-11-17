(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 document.querySelectorAll('[data-carousel]').forEach(carousel=>{
  const track=carousel.querySelector('.rail-track');
  const prev=carousel.querySelector('[data-prev]');
  const next=carousel.querySelector('[data-next]');
  function sync(){prev.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;}
  function move(direction){const first=track.firstElementChild;const gap=parseFloat(getComputedStyle(track).gap)||0;track.scrollBy({left:direction*(first.getBoundingClientRect().width+gap),behavior:reduced.matches?'instant':'smooth'});}
  prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  track.addEventListener('scroll',sync,{passive:true});
  track.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.target!==track)return;event.preventDefault();move(event.key==='ArrowRight'?1:-1);});
  new ResizeObserver(sync).observe(track);sync();
 });
 document.querySelectorAll('[data-collection]').forEach(root=>{
  const entries=[...root.querySelectorAll('[data-entry]')];
  const fields=[...root.querySelectorAll('[data-filter]')];
  const more=root.querySelector('[data-more]');
  const initial=Number(root.dataset.initial||6);
  let limit=initial;
  function update(){
   const matching=entries.filter(entry=>fields.every(field=>!field.value||entry.dataset[field.dataset.filter]===field.value));
   entries.forEach(entry=>entry.hidden=true);
   matching.slice(0,limit).forEach(entry=>entry.hidden=false);
   const output=root.querySelector('[data-count]');if(output)output.textContent=matching.length+' résultat'+(matching.length>1?'s':'');
   const empty=root.querySelector('[data-empty]');if(empty)empty.hidden=matching.length>0;
   if(more)more.hidden=limit>=matching.length;
  }
  fields.forEach(field=>field.addEventListener('change',()=>{limit=initial;update();}));
  root.querySelector('[data-reset]')?.addEventListener('click',()=>{fields.forEach(field=>field.value='');limit=initial;update();});
  more?.addEventListener('click',()=>{limit+=initial;update();});update();
 });
 const number=new URLSearchParams(location.search).get('n');
 const valid=/^(0[1-9]|1[0-2])$/.test(number||'')?number:'01';
 document.querySelectorAll('[data-demo-title]').forEach(element=>element.textContent=element.dataset.demoTitle.replace('{n}',valid));
 
})();
