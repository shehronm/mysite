(() => {
  'use strict';
  const t=window.MiraI18n?.t??(text=>text);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('#mobileMenu');
  const toggle = document.querySelector('.menu-toggle');
  const glass = document.querySelector('#glassLayer');
  let returnFocus = null;
  let scrollState = null;
  let openedDialog = null;
  const closeTimers = new WeakMap();

  function openDialog(dialog, trigger) {
    if (!dialog || dialog.open) return;
    clearTimeout(closeTimers.get(dialog));
    dialog.classList.remove('is-closing');
    returnFocus = trigger || document.activeElement;
    openedDialog = dialog;
    const body = document.body;
    scrollState = {overflow:body.style.overflow,padding:body.style.paddingRight};
    const gap = innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    dialog.showModal();
    if (trigger && dialog === glass) {
      const origin = trigger.getBoundingClientRect();
      const surface = dialog.getBoundingClientRect();
      dialog.style.setProperty('--dialog-origin-x', `${Math.max(15,Math.min(85,(origin.left + origin.width/2 - surface.left)/surface.width*100))}%`);
      dialog.style.setProperty('--dialog-origin-y', `${Math.max(10,Math.min(90,(origin.top + origin.height/2 - surface.top)/surface.height*100))}%`);
    }
    document.documentElement.dataset.motion = 'paused';
    document.dispatchEvent(new CustomEvent('mira:overlay', {detail:true}));
  }
  function closeDialog(dialog, immediately = false) {
    if (!dialog?.open || dialog.classList.contains('is-closing')) return;
    const finish = () => {
      dialog.close();
      dialog.classList.remove('is-closing');
      restoreDialog(dialog);
    };
    if (reduced.matches || document.documentElement.dataset.motionPreference === 'paused' || immediately) finish();
    else {
      dialog.classList.add('is-closing');
      closeTimers.set(dialog,setTimeout(finish,180));
    }
  }
  function restoreDialog(dialog) {
      if(openedDialog!==dialog)return;
      openedDialog=null;
      if (scrollState) {
        document.body.style.overflow = scrollState.overflow;
        document.body.style.paddingRight = scrollState.padding;
        scrollState = null;
      }
      delete document.documentElement.dataset.motion;
      toggle?.setAttribute('aria-expanded','false');
      if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
      returnFocus = null;
      document.dispatchEvent(new CustomEvent('mira:overlay', {detail:false}));
  }
  [menu,glass].filter(Boolean).forEach(dialog => {
    dialog.addEventListener('cancel', e => {e.preventDefault();closeDialog(dialog)});
    dialog.addEventListener('close', () => restoreDialog(dialog));
    // A drag that starts inside a dialog must not count as a backdrop click.
    let backdropDown = false;
    const outside = event => {
      const r = dialog.getBoundingClientRect();
      return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
    };
    dialog.addEventListener('pointerdown',e=>{backdropDown=e.target===dialog && outside(e)});
    dialog.addEventListener('click',e=>{if(backdropDown && e.target===dialog && outside(e))closeDialog(dialog);backdropDown=false});
  });
  toggle?.addEventListener('click', () => {
    openDialog(menu,toggle);
    toggle.setAttribute('aria-expanded','true');
    menu.querySelector('[aria-current="page"]')?.focus();
  });
  menu?.querySelector('.menu-close').addEventListener('click',()=>closeDialog(menu));
  matchMedia('(min-width:933px)').addEventListener('change',e=>{if(e.matches)closeDialog(menu,true)});

  if (glass && window.MiraContent) {
    const fields = {
      meta:glass.querySelector('#glassMeta'),title:glass.querySelector('#glassTitle'),
      text:glass.querySelector('#glassText'),role:glass.querySelector('#glassRole')
    };
    const next = glass.querySelector('.glass-next');
    const readingArea=glass.querySelector('.glass-scroll');
    const sample = glass.querySelector('#glassSample');
    const details=document.createElement('div');details.className='glass-details';
    const preview=document.createElement('figure');preview.className='glass-preview';preview.hidden=true;
    const resources=document.createElement('div');resources.className='glass-resources';
    fields.text.after(resources);
    readingArea.append(preview,details);
    const footer=document.createElement('div');footer.className='glass-footer';footer.append(next);readingArea.append(footer);
    let active = null;
    function populate(id,kind) {
      const item = window.MiraContent[kind]?.[id];
      if (!item) return false;
      active = {id,kind};
      fields.meta.textContent = item.meta ?? item.m;
      fields.title.textContent = item.title ?? item.t;
      fields.text.textContent = item.text ?? item.x;
      fields.role.textContent = item.role ?? item.r;
      next.querySelector('span').textContent = t(kind==='services'?'Next service':'Next project');
      sample.hidden = !item.sample && kind==='services';
      sample.textContent=item.sample || t('Independent concept / Proposed experience');
      preview.replaceChildren();preview.hidden=!item.preview;
      if(item.preview){
        const shot=document.createElement('img');
        const iconHref=document.querySelector('link[rel="icon"]')?.href;
        const rawPreview=String(item.preview.src||'');
        if(/^\/assets\/media\//.test(rawPreview) && iconHref){
          const mediaBase=new URL('.',iconHref);
          shot.src=new URL(rawPreview.replace(/^\/assets\/media\//,''),mediaBase).href;
        }else{
          shot.src=rawPreview;
        }
        shot.alt=item.preview.alt;
        shot.width=item.preview.width;shot.height=item.preview.height;shot.decoding='async';
        shot.addEventListener('error',()=>{preview.hidden=true;preview.replaceChildren();},{once:true});
        const caption=document.createElement('figcaption');caption.textContent=item.preview.caption;
        if(item.preview.href){
          const url=new URL(item.preview.href,location.href);
          if(['http:','https:'].includes(url.protocol)){
            const link=document.createElement('a');link.className='glass-preview-link';link.href=url.href;
            link.target='_blank';link.rel='noopener noreferrer';
            const matchingLink=(item.links||[]).find(resource=>resource.href===item.preview.href);
            const previewLabel=matchingLink?.label || t('Open website ↗');
            link.dataset.label=previewLabel;link.setAttribute('aria-label',`${item.m || item.title || 'Project'} — ${previewLabel}`);
            link.append(shot);preview.append(link,caption);
          }else preview.append(shot,caption);
        }else preview.append(shot,caption);
      }
      details.replaceChildren();
      (item.sections||[]).forEach(section=>{
        const block=document.createElement('section');
        const heading=document.createElement('h3');heading.textContent=section.title;block.append(heading);
        if(section.text){const p=document.createElement('p');p.textContent=section.text;block.append(p);}
        if(section.items?.length){const list=document.createElement('ul');section.items.forEach(value=>{const li=document.createElement('li');li.textContent=value;list.append(li)});block.append(list);}
        details.append(block);
      });
      details.hidden=!details.childElementCount;
      resources.replaceChildren();
      (item.links||[]).forEach(link=>{
        const url=new URL(link.href,location.href);
        if(!['http:','https:'].includes(url.protocol))return;
        if(url.origin===location.origin&&url.pathname.startsWith('/demos/'))url.searchParams.set('lang',window.MiraI18n?.lang||'en');
        const a=document.createElement('a');a.href=url.href;a.textContent=link.label;
        if(url.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}
        resources.append(a);
      });
      readingArea.scrollTop = 0;
      return true;
    }
    document.querySelectorAll('[data-service],[data-case]').forEach(button => {
      button.setAttribute('aria-haspopup','dialog');
      button.setAttribute('aria-controls','glassLayer');
    });
    // Work repaginates on resize; delegation also covers the new screen's controls.
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-service],[data-case]');
      if(!button)return;
      const kind=button.dataset.service?'services':'cases';
      if(populate(button.dataset.service || button.dataset.case,kind)) {
        openDialog(glass,button);
        glass.querySelector('.glass-close').focus({preventScroll:true});
      }
    });
    next.addEventListener('click',()=>{
      if (!active) return;
      const ids = active.kind==='cases'
        ? [...new Set([...document.querySelectorAll('[data-case]')].map(el=>el.dataset.case).filter(Boolean))]
        : Object.keys(window.MiraContent[active.kind]);
      if(!ids.length)return;
      populate(ids[(ids.indexOf(active.id)+1)%ids.length],active.kind);
      fields.title.focus({preventScroll:true});
      if (!reduced.matches && document.documentElement.dataset.motionPreference !== 'paused') {
        [fields.title,fields.text,fields.role,details].forEach(field => {
          field.getAnimations().forEach(animation=>animation.cancel());
          field.animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'});
        });
      }
    });
    glass.querySelector('.glass-close').addEventListener('click',()=>closeDialog(glass));
  }

  // Two identical groups, each at least one viewport wide, guarantee a seamless loop.
  const tickerData = [...document.querySelectorAll('.ticker')].map(ticker=>{
    const run = ticker.querySelector('.ticker-run');
    const children = [...run.children];
    const half = children.length / 2;
    return {ticker,run,original:children.slice(0,half).map(el=>el.cloneNode(true)),last:0};
  });
  const sizeTickers = () => tickerData.forEach(data=>{
    const width = Math.round(data.ticker.clientWidth);
    if (!width || width===data.last) return;
    data.last = width;
    const group = document.createElement('div');group.className='ticker-set';
    data.original.forEach(el=>group.append(el.cloneNode(true)));
    data.run.replaceChildren(group);
    const unit = group.getBoundingClientRect().width;
    const copies = Math.max(1,Math.ceil(width / Math.max(1,unit)));
    for(let i=1;i<copies;i++)data.original.forEach(el=>group.append(el.cloneNode(true)));
    data.run.append(group.cloneNode(true));
  });
  sizeTickers();
  let resizeFrame = 0;
  addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(sizeTickers)},{passive:true});
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
      const run=entry.target.querySelector('.ticker-run');
      run.style.animationPlayState=entry.isIntersecting?'':'paused';
    }));
    tickerData.forEach(({ticker})=>observer.observe(ticker));
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)document.documentElement.dataset.motion='paused';
    else if(!document.querySelector('dialog[open]'))delete document.documentElement.dataset.motion;
  });
})();
