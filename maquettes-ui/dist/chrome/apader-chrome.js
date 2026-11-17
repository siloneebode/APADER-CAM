(() => {
'use strict';

// Navigation APADER : mégamenu desktop, accordéon repliable mobile/tablette.
const navHeader=document.querySelector('#apader-header');
if(!navHeader)return;
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
navHeader.addEventListener('pointerleave', event => {
  const panelHasFocus = navPanels[activeMega]?.contains(document.activeElement);
  if (!compactNavigation.matches && event.pointerType === 'mouse' && !panelHasFocus) {
    setMega(-1);
  }
});
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

navHeader.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeNavigation));
const row=navHeader.querySelector('.header-row');
function measureHeader(){
 // Le panneau mobile partage la rangée du header. Seules les commandes
 // de la première ligne déterminent son décalage dans les autres sections.
 const rowStyle = getComputedStyle(row);
 const headerStyle = getComputedStyle(navHeader);
 const controlHeights = [
   row.querySelector('.brand-image'),
   row.querySelector('.header-actions'),
   mobileToggle,
 ].map(control => {
   const style = getComputedStyle(control);
   return control.getBoundingClientRect().height
     + (parseFloat(style.marginTop) || 0)
     + (parseFloat(style.marginBottom) || 0);
 });
 const rowHeight = compactNavigation.matches
   ? Math.max(parseFloat(rowStyle.minHeight) || 0, ...controlHeights)
   : row.getBoundingClientRect().height;
 const borderHeight = (parseFloat(headerStyle.borderTopWidth) || 0)
   + (parseFloat(headerStyle.borderBottomWidth) || 0);
 const height = Math.ceil(rowHeight + borderHeight);
 const top=parseFloat(headerStyle.top)||0;
 document.documentElement.style.setProperty('--apader-header-height', `${height}px`);
 document.documentElement.style.setProperty('--apader-header-offset', `${Math.ceil(height+top+16)}px`);
}
const sizeObserver=new ResizeObserver(measureHeader);
sizeObserver.observe(row);
window.addEventListener('resize',measureHeader,{passive:true});
document.fonts.ready.then(measureHeader);
measureHeader();
})();
(() => {
 'use strict';
 const root=document.querySelector('#footer.apader-footer');
 if(!root)return;
 const groups=[...root.querySelectorAll('.af-group')];
 const mobile=window.matchMedia('(max-width:600px)');
 function updateGroups(){groups.forEach(group=>{group.open=!mobile.matches;group.querySelector('summary').tabIndex=mobile.matches?0:-1;});}
 groups.forEach(group=>group.querySelector('summary').addEventListener('click',event=>{if(!mobile.matches&&!event.target.closest('a'))event.preventDefault();}));
 mobile.addEventListener('change',updateGroups);
 updateGroups();
})();
