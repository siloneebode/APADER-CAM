(() => {
 const options=window.PUBLICS_OPTIONS;
 const tabs=[...document.querySelectorAll('[data-variant]')];
 const previews=[...document.querySelectorAll('[data-preview]')];
 function select(letter,update=true){
  if(!options[letter])letter='a';
  const o=options[letter];
  tabs.forEach(t=>{t.setAttribute('aria-selected',String(t.dataset.variant===letter));t.tabIndex=t.dataset.variant===letter?0:-1;});
  previews.forEach(p=>{p.hidden=p.dataset.preview!==letter;});
  document.getElementById('variant-panel').setAttribute('aria-labelledby','tab-'+letter);
  document.getElementById('variant-title').textContent=letter.toUpperCase()+' · '+o.title;
  document.getElementById('variant-description').textContent=o.description;
  document.getElementById('standalone').href=letter+'.html';
  document.getElementById('source-name').textContent=o.source_name+' ↗';
  document.getElementById('source-name').href=o.source_url;
  document.getElementById('reference-note').textContent=o.note;
  document.getElementById('reference-full').href='references/'+o.reference;
  document.getElementById('reference-image').src='references/'+o.reference;
  document.getElementById('preview-label').textContent='Wireframe · '+letter.toUpperCase();
  document.getElementById('preview').setAttribute('aria-label','Publics accompagnés — '+letter.toUpperCase());
  if(update)history.replaceState(null,'','#'+letter);
 }
 tabs.forEach((t,i)=>{
  t.addEventListener('click',()=>select(t.dataset.variant));
  t.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();
   const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   tabs[n].focus();select(tabs[n].dataset.variant);
  });
 });
 document.querySelectorAll('[data-width]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('[data-width]').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));
  document.getElementById('frame-wrap').dataset.device=b.dataset.width;
 }));
 window.addEventListener('hashchange',()=>select(location.hash.slice(1),false));
 select(location.hash.slice(1)||'a',false);
})();
