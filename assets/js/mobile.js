(function(){
  'use strict';
  const mq=window.matchMedia('(max-width: 932px)');
  const root=document.documentElement;
  const isRu=(root.lang||'').toLowerCase().startsWith('ru');
  const body=document.body;
  if(!body) return;

  const esc=value=>String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const qs=(selector,host=document)=>host.querySelector(selector);
  const qsa=(selector,host=document)=>[...host.querySelectorAll(selector)];
  const plainText=el=>{if(!el)return'';const clone=el.cloneNode(true);qsa('br',clone).forEach(br=>br.replaceWith(' '));return (clone.textContent||'').replace(/\s+/g,' ').trim();};

  function linkFor(suffix,fallback){
    const a=qsa('a[href]').find(x=>x.getAttribute('href')?.endsWith(suffix));
    return a?.getAttribute('href')||fallback;
  }

  function projectFlow(project){
    const flows=isRu?{
      piptan:['Найти','Сравнить','Оставить заявку'],
      haar:['Выбрать услугу','Выбрать время','Записаться'],
      krema:['Найти продукт','Выбрать','Оформить заказ'],
      dust:['Подключить контекст','Настроить агента','Проверить действие'],
      twenty:['Получить лид','Назначить шаг','Связать инструменты'],
      telegram:['Получить запрос','Запустить сценарий','Подтвердить результат'],
      huly:['Организовать','Сохранить контекст','Довести до результата']
    }:{
      piptan:['Discover','Compare','Enquire'],
      haar:['Choose service','Pick a time','Book'],
      krema:['Discover','Choose','Checkout'],
      dust:['Connect context','Configure agent','Review action'],
      twenty:['Capture lead','Assign next step','Sync tools'],
      telegram:['Receive request','Run the flow','Confirm result'],
      huly:['Organise','Keep context','Deliver']
    };
    return flows[project]||[];
  }

  function flowStrip(project){
    return `<div class="mobile-flow-strip" aria-label="${isRu?'Логика сценария':'Workflow logic'}">${projectFlow(project).map((label,index)=>`<span><i>${String(index+1).padStart(2,'0')}</i>${esc(label)}</span>`).join('')}</div>`;
  }

  function visualFor(project){
    const flow=projectFlow(project);
    const commonHead=`<div class="mv-top"><span class="mv-dots"><i></i><i></i><i></i></span><b>${esc(project.toUpperCase())}</b><em>${isRu?'FLOW PREVIEW':'FLOW PREVIEW'}</em></div>`;
    if(project==='dust'){
      return `<div class="mobile-case-visual visual-ai">${commonHead}<div class="mv-ai-grid"><div class="mv-source"><span>${isRu?'ИСТОЧНИКИ':'SOURCES'}</span><b>Docs</b><b>CRM</b><b>API</b></div><div class="mv-agent"><span>AI</span><strong>${isRu?'Агент':'Agent'}</strong><small>${isRu?'контекст + правила':'context + rules'}</small></div><div class="mv-review"><span>${isRu?'ПРОВЕРКА':'REVIEW'}</span><b>✓ ${isRu?'Источники':'Sources'}</b><b>✓ ${isRu?'Действие':'Action'}</b><b>✓ ${isRu?'Контроль':'Control'}</b></div></div>${flowStrip(project)}</div>`;
    }
    if(project==='twenty'){
      return `<div class="mobile-case-visual visual-crm">${commonHead}<div class="mv-pipeline"><span><i>01</i><b>${isRu?'Новый лид':'New lead'}</b><small>Website</small></span><span><i>02</i><b>${isRu?'Квалификация':'Qualified'}</b><small>Owner + task</small></span><span><i>03</i><b>${isRu?'Следующий шаг':'Next step'}</b><small>Automation</small></span></div><div class="mv-connectors"><b>FORM</b><i>→</i><b>CRM</b><i>→</i><b>FOLLOW-UP</b></div>${flowStrip(project)}</div>`;
    }
    if(project==='telegram'){
      return `<div class="mobile-case-visual visual-tg">${commonHead}<div class="mv-phone"><div class="mv-chat"><span class="bot">MIRA BOT</span><p>${isRu?'Что нужно сделать?':'What do you need?'}</p><div class="mv-options"><b>${isRu?'Запись':'Booking'}</b><b>${isRu?'Заказ':'Order'}</b><b>${isRu?'Вопрос':'Ask'}</b></div><p class="user">${isRu?'Записаться завтра':'Book tomorrow'}</p><p class="ok">✓ ${isRu?'Готово — 14:30':'Done — 14:30'}</p></div></div><div class="mv-sideflow"><span>CRM</span><i>↕</i><span>CAL</span><i>↕</i><span>TEAM</span></div>${flowStrip(project)}</div>`;
    }
    if(project==='huly'){
      return `<div class="mobile-case-visual visual-team">${commonHead}<div class="mv-board"><section><span>PLAN</span><b>${isRu?'Требования':'Requirements'}</b><b>${isRu?'Приоритеты':'Priorities'}</b></section><section><span>BUILD</span><b>${isRu?'Задачи':'Tasks'}</b><b>${isRu?'Документы':'Docs'}</b></section><section><span>REVIEW</span><b>${isRu?'Проверка':'Review'}</b><b>${isRu?'Релиз':'Release'}</b></section></div><div class="mv-activity"><i></i><span>${isRu?'Контекст остаётся рядом с работой':'Context stays beside the work'}</span></div>${flowStrip(project)}</div>`;
    }
    return `<div class="mobile-case-visual">${commonHead}${flowStrip(project)}</div>`;
  }

  function addQuickbar(){
    if(body.classList.contains('page-contact')||body.classList.contains('page-work')||qs('.mobile-quickbar')) return;
    const rawWork=linkFor('work.html',isRu?'work.html':'work.html');
    const workHref=rawWork.split('#')[0]+'#projects';
    const contactHref=linkFor('contact.html',isRu?'contact.html':'contact.html');
    const bar=document.createElement('nav');
    bar.className='mobile-quickbar';
    bar.setAttribute('aria-label',isRu?'Быстрые действия':'Quick actions');
    bar.setAttribute('aria-hidden','true');
    bar.setAttribute('inert','');
    bar.innerHTML=`<a class="mq-work" href="${esc(workHref)}">${isRu?'Работы':'Work'}</a><a class="mq-start" href="${esc(contactHref)}">${isRu?'Начать проект':'Start a project'}</a>`;
    body.appendChild(bar);

    let lastY=scrollY, visible=false, ticking=false;
    const setVisible=next=>{
      if(visible===next)return;
      visible=next;bar.classList.toggle('is-visible',next);
      bar.setAttribute('aria-hidden',String(!next));
      if(next)bar.removeAttribute('inert');else bar.setAttribute('inert','');
    };
    const update=()=>{
      ticking=false;
      const y=Math.max(0,scrollY), delta=y-lastY;
      const nearBottom=(innerHeight+y)>=(document.documentElement.scrollHeight-140);
      const terminal=qs('.page-index .contact,.proof-cta,.trust-proof-cta');
      const terminalRect=terminal?.getBoundingClientRect();
      const terminalInView=!!terminalRect && terminalRect.top<innerHeight*.82 && terminalRect.bottom>innerHeight*.08;
      if(y<280||terminalInView)setVisible(false);
      else if(nearBottom)setVisible(true);
      else if(delta<-7)setVisible(true);
      else if(delta>7)setVisible(false);
      lastY=y;
    };
    addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
    addEventListener('pageshow',()=>{lastY=scrollY;update()});
  }

  function addHomeValueStrip(){
    if(!body.classList.contains('page-index')||qs('.mobile-value-strip')) return;
    const opening=qs('.opening');if(!opening)return;
    const items=isRu?[
      ['01','Понятно','Клиент быстро понимает предложение.'],
      ['02','Практично','Меньше ручной работы и лишних шагов.'],
      ['03','К действию','Один понятный следующий шаг.']
    ]:[
      ['01','Clear','The offer makes sense quickly.'],
      ['02','Useful','Less manual work and fewer dead ends.'],
      ['03','Actionable','One obvious next step.']
    ];
    const strip=document.createElement('section');
    strip.className='mobile-value-strip';
    strip.setAttribute('aria-label',isRu?'Что получает клиент':'What clients get');
    strip.innerHTML=`<div class="mobile-value-panel">${items.map(x=>`<article><b>${x[0]}</b><div><strong>${x[1]}</strong><p>${x[2]}</p></div></article>`).join('')}</div>`;
    opening.insertAdjacentElement('afterend',strip);
  }

  function addHomePrinciples(){
    if(!body.classList.contains('page-index')||qs('.mobile-principles'))return;
    const practice=qs('.practice');const title=qs('.practice-title',practice);if(!practice||!title)return;
    const rows=isRu?[
      ['01','Сделать предложение понятным','Пользователь понимает, что вы продаёте и зачем ему это.'],
      ['02','Убрать рутину','Повторяемые действия переходят в автоматизированный сценарий.'],
      ['03','Связать процесс','Сайт, CRM, AI и коммуникации работают как одна цепочка.'],
      ['04','Подвести к действию','Каждый экран помогает сделать следующий понятный шаг.']
    ]:[
      ['01','Clarify the offer','People understand what you sell and why it matters.'],
      ['02','Remove routine','Repeatable steps move into a reliable automated flow.'],
      ['03','Connect the process','Web, CRM, AI and messaging share one working context.'],
      ['04','Lead to action','Every screen makes the next useful step obvious.']
    ];
    const list=document.createElement('ol');
    list.className='mobile-principles';
    list.innerHTML=rows.map(row=>`<li><span>${row[0]}</span><div><strong>${row[1]}</strong><p>${row[2]}</p></div></li>`).join('');
    title.insertAdjacentElement('afterend',list);
  }

  function buildMobileWork(){
    if(!body.classList.contains('page-work')||qs('.mobile-work')) return;
    const main=qs('main'),shell=qs('.work-shell');if(!main||!shell)return;
    const scenes=qsa('.scene.scene-overview');if(!scenes.length)return;
    const contactHref=linkFor('contact.html',isRu?'contact.html':'contact.html');
    const wrap=document.createElement('section');
    wrap.className='mobile-work';wrap.id='mobileWork';
    wrap.setAttribute('aria-label',isRu?'Проекты MIRA':'MIRA projects');
    const shortName={piptan:'PIPTAN',haar:'HAAR',krema:'KREMA',dust:'AI',twenty:'CRM',telegram:'TG',huly:'TEAM'};
    wrap.innerHTML=`<header class="mobile-work-head"><div class="eyebrow">${isRu?'ИЗБРАННЫЕ РАБОТЫ / 07':'SELECTED WORK / 07'}</div><h1>${isRu?'ИЗБРАННЫЕ РАБОТЫ.':'SELECTED WORK.'}</h1><p>${isRu?'Сайты и системы: задача, логика, результат и следующий шаг.':'Sites and systems: the problem, the flow, the outcome and the next action.'}</p><nav class="mobile-work-nav" aria-label="${isRu?'Перейти к проекту':'Jump to project'}">${scenes.map((scene,i)=>{const p=scene.dataset.project||`project-${i+1}`;return `<a href="#m-${esc(p)}"><span>${String(i+1).padStart(2,'0')}</span>${esc(shortName[p]||p.toUpperCase())}</a>`}).join('')}</nav></header><div class="mobile-work-list" id="projects"></div>`;
    const list=qs('.mobile-work-list',wrap);
    scenes.forEach((scene,i)=>{
      const project=(scene.dataset.project||'project').toLowerCase();
      const projectLabel=(scene.dataset.project||'project').toUpperCase();
      const title=plainText(qs('.scene-title',scene))||projectLabel;
      const summary=plainText(qs('.scene-summary',scene));
      const image=qs('.scene-art img',scene);
      const live=qs('a.case-demo, .website-shot[href]',scene);
      const card=document.createElement('article');
      card.className=`mobile-case mobile-case-${project}`;card.id=`m-${project}`;
      const media=image?`<div class="mobile-case-media"><img src="${esc(image.getAttribute('src'))}" alt="${esc(image.getAttribute('alt')||projectLabel)}" width="${esc(image.getAttribute('width')||1200)}" height="${esc(image.getAttribute('height')||900)}" loading="${i>0?'lazy':'eager'}" decoding="async">${flowStrip(project)}</div>`:visualFor(project);
      const liveAction=live?`<a class="live" href="${esc(live.getAttribute('href'))}" target="_blank" rel="noopener noreferrer">${isRu?'Открыть живой проект ↗':'Open live project ↗'}</a>`:'';
      const conceptTag=!live?`<span class="mobile-case-trust">${isRu?'СИСТЕМНЫЙ СЦЕНАРИЙ':'SYSTEM FLOW'}</span>`:'';
      card.innerHTML=`${media}<div class="mobile-case-body"><div class="mobile-case-meta"><span>${String(i+1).padStart(2,'0')} / 07</span><span>${esc(shortName[project]||projectLabel)}</span></div><h2>${esc(title)}</h2><p>${esc(summary)}</p>${conceptTag}<div class="mobile-case-actions">${liveAction}<a class="discuss" href="${esc(contactHref)}">${isRu?'Обсудить похожую задачу →':'Discuss a similar project →'}</a></div></div>`;
      list.appendChild(card);
    });
    shell.insertAdjacentElement('beforebegin',wrap);

    if(location.hash==='#projects'||location.hash.startsWith('#m-')){
      requestAnimationFrame(()=>setTimeout(()=>qs(location.hash)?.scrollIntoView({block:'start'}),20));
    }
  }

  function patchWorkLinks(){
    const selectors=['.hero-primary[href]','.hero-secondary[href]','.trust-bridge-links a[href]','.proof-hero-actions a[href]'];
    qsa(selectors.join(',')).forEach(link=>{
      const href=link.getAttribute('href')||'';
      if(/work\.html(?:$|#)/.test(href))link.setAttribute('href',href.split('#')[0]+'#projects');
    });
    // Proof cards point to desktop scene hashes. Map them to the generated mobile cases.
    qsa('a[href*="work.html#"]').forEach(link=>{
      const href=link.getAttribute('href')||'';
      const [base,hash='']=href.split('#');
      if(hash && hash!=='projects' && !hash.startsWith('m-')) link.setAttribute('href',`${base}#m-${hash}`);
    });
    // On mobile, keep the user inside the guided contact flow instead of opening an email draft too early.
    if(body.classList.contains('page-index')){
      const routes=qsa('.contact-route');
      const contact=linkFor('contact.html',isRu?'contact.html':'contact.html').split('#')[0];
      if(routes[0]) routes[0].setAttribute('href',`${contact}#brief-form`);
      if(routes[1]) routes[1].setAttribute('href',`${contact}#call-route`);
    }
  }


  function enhanceMobileMenu(){
    const menu=qs('#mobileMenu');if(!menu)return;
    const relabel=(suffix,label)=>{
      const link=qsa('nav a[href]',menu).find(a=>(a.getAttribute('href')||'').split('#')[0].endsWith(suffix));
      if(!link)return;
      const first=qs('span:first-child',link)?.outerHTML||'';
      const last=qsa('span',link).at(-1)?.outerHTML||'<span aria-hidden="true">↗</span>';
      link.innerHTML=`${first}${esc(label)}${last}`;
      if(suffix==='work.html')link.setAttribute('href',(link.getAttribute('href')||'work.html').split('#')[0]+'#projects');
    };
    relabel('reviews.html',isRu?'Доказательства':'Proof');
    relabel('contact.html',isRu?'Старт':'Start');
    relabel('work.html',isRu?'Работы':'Work');
  }

  function addGlassCTA(){
    const footer=qs('.glass-footer');if(!footer||qs('.mobile-glass-cta',footer))return;
    const a=document.createElement('a');
    a.className='mobile-glass-cta';
    a.href=linkFor('contact.html',isRu?'contact.html':'contact.html');
    a.textContent=isRu?'Обсудить проект':'Start a project';
    footer.prepend(a);
  }

  function normalizeMobileText(){
    // Prevent diagonal arrows from becoming emoji glyphs in iOS Safari.
    qsa('a,button').forEach(el=>{
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      let node;
      while((node=walker.nextNode())) node.nodeValue=node.nodeValue.replace(/[↗↘]/g,'→');
    });
    const submit=qs('.brief-submit');
    if(submit) submit.textContent=isRu?'Подготовить письмо →':'Prepare email →';
    if(body.classList.contains('page-reviews')){
      qsa('.proof-links').forEach(group=>{
        const links=qsa('a',group);
        if(links[0]) links[0].textContent=isRu?'Открыть сайт →':'Live site →';
        if(links[1]) links[1].textContent='GitHub →';
        if(links[2]) links[2].textContent=isRu?'Смотреть кейс →':'View case →';
      });
    }
  }

  function setupGeneratedReveal(){
    if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const targets=qsa('.mobile-value-panel article,.mobile-principles li,.mobile-work-head>*,.mobile-case,.mobile-case-body>*,.mobile-case-visual>*,.offer-heading,.offer-head>p,.offer-row,.practice-top,.practice-title,.trust-bridge>*,.contact-top,.contact>h2,.contact-route,.trust-grid article,.process-intro>*,.process-list article,.fit-copy>*,.fit-grid>div,.trust-proof-cta>*,.proof-hero-inner>*,.proof-policy>*,.proof-project-head>*,.proof-card,.proof-checks-head>*,.check-grid article,.proof-cta>*,.contact-kicker,.contact-page>h2,.contact-intro,.contact-option,.contact-direct,.brief-heading>*');
    targets.forEach(el=>el.classList.add('reveal-ready'));
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('section-arrive');io.unobserve(entry.target)}
    }),{threshold:.08,rootMargin:'0px 0px -8% 0px'});
    targets.forEach((el,index)=>{el.style.setProperty('--m-delay',`${Math.min(index%4,3)*45}ms`);io.observe(el)});
  }

  function syncThemeColor(){
    const meta=qs('meta[name="theme-color"]');
    if(!meta)return;
    if(!meta.dataset.desktopColor)meta.dataset.desktopColor=meta.getAttribute('content')||'#0b0f10';
    meta.setAttribute('content',mq.matches?'#f7f4ee':meta.dataset.desktopColor);
  }

  function apply(){
    syncThemeColor();
    if(!mq.matches){root.classList.remove('mobile-experience');return;}
    root.classList.add('mobile-experience');
    addQuickbar();addHomeValueStrip();addHomePrinciples();buildMobileWork();patchWorkLinks();enhanceMobileMenu();addGlassCTA();normalizeMobileText();setupGeneratedReveal();
  }
  apply();mq.addEventListener?.('change',apply);
})();

/* Mobile v6: clearer calm scroll-driven background transitions. Desktop is intentionally untouched. */
(()=>{
  const mq=window.matchMedia('(max-width: 932px)');
  const body=document.body;
  if(!body)return;

  const C={
    warm:'#f7f4ee',
    cool:'#eef2f5',
    mist:'#e5ecf4',
    stone:'#f1e9e2',
    sage:'#e8efea'
  };
  let targets=[];
  let ticking=false;
  let activeColor='';

  function pairs(){
    if(body.classList.contains('page-index')) return [
      ['.opening',C.warm],['.offer',C.cool],['.practice',C.mist],['.trust-bridge',C.stone],['.contact',C.sage]
    ];
    if(body.classList.contains('page-about')) return [
      ['.trust-hero',C.warm],['.trust-signals',C.cool],['.trust-process',C.mist],['.fit-section',C.stone],['.trust-proof-cta',C.sage]
    ];
    if(body.classList.contains('page-reviews')) return [
      ['.proof-hero',C.warm],['.proof-policy',C.cool],['.proof-projects',C.mist],['.proof-checks',C.stone],['.proof-cta',C.sage]
    ];
    if(body.classList.contains('page-contact')) return [
      ['.page-hero',C.warm],['.contact-page',C.cool],['.brief-section',C.mist]
    ];
    if(body.classList.contains('page-work')){
      const list=[['.mobile-work-head',C.warm]];
      const sequence=[C.cool,C.mist,C.stone,C.sage,C.cool,C.mist,C.stone];
      document.querySelectorAll('.mobile-case').forEach((el,i)=>{
        el.dataset.mobileBg=sequence[i%sequence.length];
        list.push([el,sequence[i%sequence.length]]);
      });
      return list;
    }
    return [];
  }

  function build(){
    if(!mq.matches){
      targets=[];
      body.style.removeProperty('--m-scroll-bg');
      return;
    }
    targets=[];
    pairs().forEach(([selector,color])=>{
      const nodes=typeof selector==='string'?[...document.querySelectorAll(selector)]:[selector];
      nodes.forEach(el=>{
        if(!el)return;
        el.dataset.mobileBg=color;
        targets.push({el,color});
      });
    });
    update(true);
  }

  function update(force=false){
    ticking=false;
    if(!mq.matches||!targets.length)return;
    const anchor=Math.max(120,window.innerHeight*.42);
    let selected=targets[0];
    for(const item of targets){
      const rect=item.el.getBoundingClientRect();
      if(rect.top<=anchor) selected=item;
      else break;
    }
    if(force||selected.color!==activeColor){
      activeColor=selected.color;
      body.style.setProperty('--m-scroll-bg',activeColor);
      const meta=document.querySelector('meta[name="theme-color"]');
      if(meta)meta.setAttribute('content',activeColor);
    }
  }

  function onScroll(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',()=>{build();onScroll()},{passive:true});
  mq.addEventListener?.('change',build);
  window.addEventListener('load',()=>setTimeout(build,0),{once:true});
  requestAnimationFrame(()=>setTimeout(build,0));
})();
