
// Navigation APADER : mégamenu desktop, accordéon repliable mobile/tablette.
const navHeader=document.querySelector('#site-navigation');
const primaryNav=navHeader.querySelector('.primary-nav');
const mobileToggle=navHeader.querySelector('.mobile-menu-toggle');
const navTriggers=[...navHeader.querySelectorAll('.nav-trigger')];
const navPanels=[...navHeader.querySelectorAll('.mega-panel')];
const compactNavigation=window.matchMedia('(max-width:1049px)');
let activeMega=-1;
let openedByHover=false;
let mobileOpen=false;
function setMega(index,fromHover=false){
  activeMega=index;
  openedByHover=fromHover;
  navHeader.classList.toggle('has-open-menu',index>=0||mobileOpen);
  navTriggers.forEach((button,i)=>button.setAttribute('aria-expanded',String(i===index)));
  navPanels.forEach((panel,i)=>{panel.hidden=i!==index;});
}
function setMobileOpen(open){
  mobileOpen=open&&compactNavigation.matches;
  navHeader.classList.toggle('is-mobile-open',mobileOpen);
  mobileToggle.setAttribute('aria-expanded',String(mobileOpen));
  mobileToggle.setAttribute('aria-label',mobileOpen?'Fermer le menu':'Ouvrir le menu');
  setMega(-1);
  primaryNav.scrollTop=0;
}
function syncNavigation(){
  const focusWasInMenu=navHeader.contains(document.activeElement);
  setMobileOpen(false);
  navPanels.forEach((panel,index)=>{
    if(compactNavigation.matches)navTriggers[index].after(panel);
    else navHeader.append(panel);
  });
  if(compactNavigation.matches)navHeader.querySelector('.header-row').append(primaryNav);
  else navHeader.querySelector('.header-actions').before(primaryNav);
  if(focusWasInMenu){
    if(compactNavigation.matches)mobileToggle.focus();
    else navTriggers[0].focus();
  }
}
mobileToggle.addEventListener('click',()=>setMobileOpen(!mobileOpen));
navTriggers.forEach((button,index)=>{
  button.addEventListener('click',()=>setMega(activeMega===index&&!openedByHover?-1:index));
  button.addEventListener('pointerenter',event=>{
    if(!compactNavigation.matches&&event.pointerType==='mouse'&&activeMega!==index)setMega(index,true);
  });
  button.addEventListener('keydown',event=>{
    if(event.key==='ArrowDown'){
      event.preventDefault();setMega(index);navPanels[index].querySelector('a')?.focus();
    }
  });
});
function closeNavigation(){if(compactNavigation.matches)setMobileOpen(false);else setMega(-1);}
navHeader.addEventListener('pointerleave',event=>{if(!compactNavigation.matches&&event.pointerType==='mouse')setMega(-1);});
document.addEventListener('click',event=>{if(!navHeader.contains(event.target))closeNavigation();});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&(activeMega>=0||mobileOpen)){
    const trigger=compactNavigation.matches?mobileToggle:navTriggers[activeMega];
    closeNavigation();trigger.focus();
  }
});
navHeader.addEventListener('focusout',event=>{if(event.relatedTarget&&!navHeader.contains(event.relatedTarget))closeNavigation();});
compactNavigation.addEventListener('change',syncNavigation);
syncNavigation();

// Un lien direct ne garde aucun mégamenu ouvert.
navHeader.querySelectorAll('.nav-direct-link').forEach(link=>{
 link.addEventListener('pointerenter',event=>{if(!compactNavigation.matches&&event.pointerType==='mouse')setMega(-1);});
 link.addEventListener('focus',()=>{if(!compactNavigation.matches)setMega(-1);});
 link.addEventListener('click',()=>closeNavigation());
});
