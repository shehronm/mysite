/* A chapter has horizontal screens; crossing a chapter boundary is vertical. */
(() => {
  'use strict';
  if (matchMedia('(max-width: 932px)').matches) return;
  const t=window.MiraI18n?.t??((text,values={})=>text.replace(/\{(\w+)\}/g,(_,key)=>values[key]??''));
  const root=document.documentElement;
  const viewport=document.querySelector('.work-viewport');
  if (!viewport) return;
  const host=viewport.querySelector('.work-scenes');
  const originals=[...host.children].map(scene=>scene.cloneNode(true));
  const ids=[...new Set(originals.map(scene=>scene.dataset.project))];
  const links=[...document.querySelectorAll('[data-project-link]')];
  const previous=document.querySelector('#prev'),next=document.querySelector('#next');
  const current=document.querySelector('#current'),total=document.querySelector('#total');
  const projectName=document.querySelector('#currentProject'),direction=document.querySelector('#direction');
  const announcement=document.querySelector('#workAnnouncement'),progress=document.querySelector('#progress');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const motion=()=>!reduced.matches && root.dataset.motionPreference!=='paused';
  let pages=[],active=0,transition=null,animations=[],overlay=false,layoutFrame=0;
  let lastSize='',fallbackSize='',lastAnnouncement='',gesture=null,multiTouch=false,clickSuppressed=false;
  const pointers=new Set();
  const wheel={last:0,claimed:false};
  const resetWheel=()=>{wheel.last=0;wheel.claimed=false};
  const destination=()=>transition?.target ?? active;
  const name=id=>links.find(link=>link.dataset.projectLink===id)?.querySelector('.project-name').textContent || id;
  const clamp=index=>Math.max(0,Math.min(pages.length-1,index));
  const enabled=()=>root.classList.contains('work-enhanced');

  function fits(scene) {
    const card=scene.querySelector('.scene-card');
    const bounds=card.getBoundingClientRect(),css=getComputedStyle(card);
    const box={left:bounds.left+parseFloat(css.paddingLeft),right:bounds.right-parseFloat(css.paddingRight),top:bounds.top+parseFloat(css.paddingTop),bottom:bounds.bottom-parseFloat(css.paddingBottom)};
    return [...card.querySelectorAll('[data-unit]')].every(unit=>{
      const r=unit.getBoundingClientRect();
      if(r.left<box.left-1 || r.right>box.right+1 || r.top<box.top-1 || r.bottom>box.bottom+1)return false;
      if(unit.classList.contains('scene-art'))return true;
      const range=document.createRange();range.selectNodeContents(unit);
      return [...range.getClientRects()].every(rect=>!rect.width || (rect.left>=box.left-1 && rect.right<=box.right+1 && rect.top>=box.top-1 && rect.bottom<=box.bottom+1));
    });
  }
  function pageFor(source) {
    const page=source.cloneNode(false);
    page.classList.add('paged','is-measuring');
    page.innerHTML='<div class="scene-card"></div>';
    host.append(page);
    return page;
  }
  function paginate(source) {
    const full=source.cloneNode(true);
    full.classList.add('is-measuring');host.append(full);
    // Preserve the three-screen project structure on narrow devices and short laptop viewports.
    // When a slide needs more vertical room, the slide itself scrolls instead of becoming a fourth/fifth carousel screen.
    const scrollableMode=innerWidth<=480 || innerHeight<=740;
    if(scrollableMode){full.classList.add('scrollable-slide');return [full];}
    if(fits(full))return [full];
    full.remove();
    let page=pageFor(source),card=page.firstElementChild;
    const result=[];
    const finish=()=>{if(card.children.length)result.push(page);else page.remove();page=pageFor(source);card=page.firstElementChild};
    function add(unit) {
      card.append(unit);
      if(fits(page))return;
      unit.remove();
      if(card.children.length)finish();
      card.append(unit);
      if(fits(page))return;
      unit.remove();
      // A long block can become several horizontal screens, at the user's font size.
      if(unit.classList.contains('scene-step')) {
        const blocks=[...unit.querySelectorAll('h3,p')];
        blocks.forEach((block,i)=>{const piece=block.cloneNode(true);piece.dataset.unit=unit.dataset.unit+'-'+i;add(piece)});
        return;
      }
      if(unit.classList.contains('scene-art') || unit.querySelector('button,a'))throw new Error('Insufficient space for content');
      const words=unit.textContent.trim().split(/\s+/);
      let offset=0;
      while(offset<words.length) {
        const fragment=unit.cloneNode(false);fragment.dataset.unit=unit.dataset.unit;fragment.dataset.part=String(offset);
        card.append(fragment);
        let low=1,high=words.length-offset,best=0;
        while(low<=high) {
          const middle=Math.floor((low+high)/2);
          fragment.textContent=words.slice(offset,offset+middle).join(' ');
          if(fits(page)){best=middle;low=middle+1}else high=middle-1;
        }
        if(!best){fragment.remove();throw new Error('Insufficient space for readable text');}
        fragment.textContent=words.slice(offset,offset+best).join(' ');
        offset+=best;
        if(offset<words.length)finish();
      }
    }
    [...source.querySelectorAll('[data-unit]')].forEach(unit=>add(unit.cloneNode(true)));
    if(card.children.length)result.push(page);else page.remove();
    return result;
  }
  function cancel() {
    const pending=transition;transition=null;
    animations.forEach(animation=>animation.cancel());animations=[];
    host.querySelectorAll('.is-entering,.is-leaving').forEach(el=>el.classList.remove('is-entering','is-leaving'));
    viewport.classList.remove('is-transitioning');
    return pending;
  }
  function update(index,announce=true) {
    const page=pages[index];if(!page)return;
    const project=page.dataset.project;
    const chapter=pages.filter(p=>p.dataset.project===project),step=chapter.indexOf(page);
    projectName.textContent=name(project);
    current.textContent=String(step+1).padStart(2,'0');total.textContent=String(chapter.length).padStart(2,'0');
    previous.disabled=index===0;next.disabled=index===pages.length-1;
    const boundary=pages[index+1] && pages[index+1].dataset.project!==project;
    const reverse=pages[index-1] && pages[index-1].dataset.project!==project;
    next.textContent=boundary?'↓':'→';previous.textContent=reverse?'↑':'←';
    next.setAttribute('aria-label',boundary?t('Next project: {name}',{name:name(pages[index+1].dataset.project)}):t('Next screen'));
    previous.setAttribute('aria-label',reverse?t('Previous project: {name}',{name:name(pages[index-1].dataset.project)}):t('Previous screen'));
    direction.textContent=index===pages.length-1?t('All projects explored'):boundary?t('Next: {name} ↓',{name:name(pages[index+1].dataset.project)}):t('Continue the story →');
    progress.style.transform=`scaleX(${(index+1)/pages.length})`;
    links.forEach(link=>{
      const selected=link.dataset.projectLink===project;
      if(selected)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');
      link.style.setProperty('--project-progress',selected?(step+1)/chapter.length:0);
    });
    if(announce){
      const text=t('{name}. {stage}. Screen {screen} of {screens}. Project {project} of {projects}.',{name:name(project),stage:page.dataset.stage,screen:step+1,screens:chapter.length,project:ids.indexOf(project)+1,projects:ids.length});
      if(text!==lastAnnouncement){announcement.textContent=text;lastAnnouncement=text;}
    }
  }
  function remember(index) {
    const page=pages[index];if(!page)return;
    const chapter=pages.filter(p=>p.dataset.project===page.dataset.project);
    const fragment=page.dataset.project+(chapter.indexOf(page)?'/'+(chapter.indexOf(page)+1):'');
    if(location.hash.slice(1)!==fragment)history.replaceState(null,'','#'+fragment);
  }
  function finish(index,{url=true,announce=true}={}) {
    cancel();active=clamp(index);
    pages.forEach((page,i)=>{
      const selected=i===active;
      if(!selected && page.contains(document.activeElement))viewport.focus({preventScroll:true});
      page.classList.toggle('is-active',selected);page.inert=!selected;
      page.setAttribute('aria-hidden',String(!selected));
    });
    update(active,announce);if(url)remember(active);
  }
  function animate(el,frames,duration,delay=0) {
    const animation=el.animate(frames,{duration,delay,easing:'cubic-bezier(.22,.78,.15,1)',fill:'both'});
    animations.push(animation);return animation;
  }
  function reveal(page,delay=60) {
    if(!motion())return;
    [...page.querySelectorAll('[data-unit]:not(.scene-art)')].forEach((unit,i)=>{
      animate(unit,[{opacity:0,translate:'0 18px',clipPath:'inset(0 0 100% 0)'},{opacity:1,translate:'0 0',clipPath:'inset(-8% -3% -8% -3%)'}],480,delay+Math.min(i*30,120));
    });
  }
  function go(index,source='control') {
    if(overlay || !pages.length)return;
    const target=clamp(index);
    if(!enabled()){pages[target].scrollIntoView({behavior:motion()?'smooth':'instant',block:'start'});active=target;update(target);return;}
    if(source!=='wheel')resetWheel();
    if(transition)finish(transition.target);
    if(target===active)return;
    const from=active;
    if(!motion()){finish(target);return;}
    cancel();
    const outgoing=pages[from],incoming=pages[target];
    const vertical=outgoing.dataset.project!==incoming.dataset.project;
    const sign=vertical?Math.sign(ids.indexOf(incoming.dataset.project)-ids.indexOf(outgoing.dataset.project)):Math.sign(target-from);
    const offset=vertical?`0 ${sign*100}%`:`${sign*100}% 0`;
    const departure=vertical?`0 ${-sign*100}%`:`${-sign*100}% 0`;
    const record={target};transition=record;
    viewport.classList.add('is-transitioning');
    outgoing.classList.remove('is-active');outgoing.classList.add('is-leaving');incoming.classList.add('is-entering');
    if(outgoing.contains(document.activeElement))viewport.focus({preventScroll:true});
    outgoing.inert=incoming.inert=true;outgoing.setAttribute('aria-hidden','true');incoming.setAttribute('aria-hidden','true');
    const duration=vertical?800:720;
    animate(outgoing,[{translate:'0 0'},{translate:departure}],duration);
    const arrival=animate(incoming,[{translate:offset},{translate:'0 0'}],duration);
    reveal(incoming,110);
    update(target,false);
    arrival.finished.then(()=>{if(transition===record)finish(target)}).catch(()=>{});
  }
  function hashIndex() {
    const [oldId,number]=location.hash.slice(1).split('/');
    const id=({pact:'piptan',forma:'piptan',line:'haar',ember:'krema',relay:'twenty',common:'dust',open:'telegram',still:'huly'})[oldId]||oldId;
    const first=pages.findIndex(p=>p.dataset.project===id);
    if(first<0)return 0;
    const chapter=pages.filter(p=>p.dataset.project===id);
    return first+Math.max(0,Math.min(chapter.length-1,(Number(number)||1)-1));
  }
  function layout(initial=false) {
    layoutFrame=0;
    if(overlay)return;
    const inputSize=`${innerWidth}/${innerHeight}/${getComputedStyle(root).fontSize}`;
    if(!initial && fallbackSize===inputSize)return;
    root.style.setProperty('--work-header',`${document.querySelector('.site-header').getBoundingClientRect().height}px`);
    root.classList.add('work-enhanced');
    const size=`${viewport.clientWidth}/${viewport.clientHeight}/${getComputedStyle(root).fontSize}`;
    if(!initial && size===lastSize && pages.length)return;
    const old=pages[destination()],anchor=old?.querySelector('[data-unit]')?.dataset.unit,oldProject=old?.dataset.project;
    cancel();resetWheel();gesture=null;
    lastSize=size;
    if(host.contains(document.activeElement))viewport.focus({preventScroll:true});
    host.replaceChildren();
    try {
      pages=originals.flatMap(paginate);
    } catch {
      // Extremely magnified or tiny viewports keep the complete readable document.
      root.classList.remove('work-enhanced');
      fallbackSize=inputSize;
      host.replaceChildren(...originals.map(scene=>scene.cloneNode(true)));pages=[...host.children];
      pages.forEach(page=>{page.inert=false;page.removeAttribute('aria-hidden')});
      update(0);return;
    }
    fallbackSize='';
    pages.forEach((page,i)=>{
      page.classList.remove('is-measuring');page.dataset.screen=String(i);
      page.setAttribute('role','group');page.setAttribute('aria-roledescription','slide');
      page.setAttribute('aria-label',`${name(page.dataset.project)} — ${page.dataset.stage}`);
    });
    let index=initial?hashIndex():pages.findIndex(page=>page.dataset.project===oldProject && [...page.querySelectorAll('[data-unit]')].some(unit=>unit.dataset.unit===anchor));
    if(index<0)index=pages.findIndex(page=>page.dataset.project===oldProject);
    finish(Math.max(0,index),{url:!initial,announce:initial});
    if(initial && motion()){
      reveal(pages[active],60);
      Promise.allSettled(animations.map(animation=>animation.finished)).then(()=>{if(!transition)cancel()});
    }
  }
  function scheduleLayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>layout())}
  viewport.addEventListener('wheel',event=>{
    if(overlay || !enabled() || event.ctrlKey || event.metaKey || event.altKey || (visualViewport?.scale||1)>1.01)return;
    const vertical=Math.abs(event.deltaY)>=Math.abs(event.deltaX);
    const delta=vertical?event.deltaY:event.deltaX;
    if(!delta)return;
    const page=pages[destination()];
    if(vertical && page?.classList.contains('scrollable-slide') && page.scrollHeight>page.clientHeight+2){
      const atTop=page.scrollTop<=1;
      const atBottom=page.scrollTop+page.clientHeight>=page.scrollHeight-1;
      if((delta>0&&!atBottom)||(delta<0&&!atTop))return;
    }
    event.preventDefault();
    const now=performance.now();
    if(now-wheel.last>220 && !transition)wheel.claimed=false;
    wheel.last=now;
    if(wheel.claimed || transition){wheel.claimed=true;return;}
    wheel.claimed=true;
    go(active+Math.sign(delta),'wheel');
  },{passive:false});
  viewport.addEventListener('pointerdown',event=>{
    if(overlay || !enabled() || event.button!==0)return;
    pointers.add(event.pointerId);
    if(pointers.size>1){multiTouch=true;gesture=null;return;}
    if((visualViewport?.scale||1)>1.01 || event.target.closest('a,button') || transition)return;
    multiTouch=false;gesture={id:event.pointerId,x:event.clientX,y:event.clientY,active};resetWheel();
    if(event.pointerType==='mouse')viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove',event=>{
    if(!gesture || gesture.id!==event.pointerId || multiTouch)return;
    const distance=Math.max(Math.abs(event.clientX-gesture.x),Math.abs(event.clientY-gesture.y));
    if(distance>8 && event.pointerType==='mouse'){event.preventDefault();getSelection()?.removeAllRanges();}
  });
  const release=event=>{
    pointers.delete(event.pointerId);
    if(!gesture || gesture.id!==event.pointerId){if(!pointers.size)multiTouch=false;return;}
    const saved=gesture;gesture=null;
    if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
    if(event.type==='pointercancel' || multiTouch || (visualViewport?.scale||1)>1.01)return;
    const dx=saved.x-event.clientX,dy=saved.y-event.clientY;
    const delta=Math.abs(dx)>Math.abs(dy)?dx:dy;
    if(Math.abs(delta)>Math.min(64,viewport.clientWidth*.12)){
      clickSuppressed=true;setTimeout(()=>clickSuppressed=false,0);go(saved.active+Math.sign(delta));
    }
  };
  addEventListener('pointerup',release);addEventListener('pointercancel',release);
  viewport.addEventListener('click',event=>{if(clickSuppressed){event.preventDefault();event.stopImmediatePropagation()}},true);
  next.addEventListener('click',()=>go(destination()+1));previous.addEventListener('click',()=>go(destination()-1));
  links.forEach(link=>link.addEventListener('click',()=>go(pages.findIndex(page=>page.dataset.project===link.dataset.projectLink))));
  document.addEventListener('keydown',event=>{
    if(overlay || !enabled() || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    const index=destination();
    const keys={ArrowRight:index+1,ArrowDown:index+1,PageDown:index+1,ArrowLeft:index-1,ArrowUp:index-1,PageUp:index-1,Home:0,End:pages.length-1};
    if(event.key in keys){event.preventDefault();go(keys[event.key]);}
  });
  document.addEventListener('mira:overlay',event=>{
    overlay=event.detail;resetWheel();gesture=null;
    if(transition)finish(destination());
    if(!overlay)scheduleLayout();
  });
  const stop=()=>{if(!motion()){if(transition)finish(destination());else cancel();}};
  reduced.addEventListener('change',stop);document.addEventListener('mira:motion',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(transition)finish(destination());resetWheel();gesture=null;}});
  addEventListener('hashchange',()=>go(hashIndex()));
  addEventListener('pageshow',event=>{if(pages.length && location.hash && (event.persisted || hashIndex()!==active))finish(hashIndex(),{url:false})});
  const zoom=()=>viewport.classList.toggle('is-zoomed',(visualViewport?.scale||1)>1.01);
  visualViewport?.addEventListener('resize',zoom);zoom();
  layout(true);
  const resize=new ResizeObserver(scheduleLayout);
  resize.observe(document.querySelector('.site-header'));resize.observe(viewport);resize.observe(document.querySelector('.work-dock'));resize.observe(document.querySelector('.project-rail'));
  document.fonts?.ready.then(scheduleLayout);
})();
