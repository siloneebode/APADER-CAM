(() => {
  'use strict';
  const items=[...document.querySelectorAll('[data-sm-faq]')];
  items.forEach(item=>item.addEventListener('toggle',()=>{if(item.open) items.forEach(other=>{if(other!==item)other.open=false;});}));
  const dialog=document.querySelector('#sm-contact-dialog');
  if(!dialog)return;
  let opener;
  document.querySelectorAll('[data-sm-contact-open]').forEach(button=>button.addEventListener('click',()=>{opener=button;dialog.showModal();}));
  dialog.querySelector('[data-sm-contact-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(opener)opener.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
})();
