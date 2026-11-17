(() => {
const root=document.querySelector('#domaines.actions-panneaux');
if(!root)return;
const panels=[...root.querySelectorAll('.action-panel')];
function showPanel(index,focus=false){
  panels.forEach((panel,i)=>{
    const active=i===index;
    panel.classList.toggle('is-active',active);
    panel.querySelector('.panel-rail').setAttribute('aria-expanded',String(active));
    panel.querySelector('.panel-body').hidden=!active;
  });
  const active=panels[index];
  root.querySelector('#actions-panel-status').textContent=`Domaine ${index+1} sur ${panels.length} : ${active.querySelector('.rail-title').textContent}`;
  if(focus)active.querySelector('.panel-rail').focus({preventScroll:true});
}
panels.forEach((panel,i)=>{
  const button=panel.querySelector('.panel-rail');
  button.addEventListener('click',()=>showPanel(i));
  button.addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?panels.length-1:(i+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+panels.length)%panels.length;
    showPanel(next,true);
  });
  panel.querySelector('[data-next]').addEventListener('click',()=>showPanel((i+1)%panels.length,true));
});
root.querySelectorAll('[data-demo-link]').forEach(a=>a.addEventListener('click',event=>event.preventDefault()));

})();
