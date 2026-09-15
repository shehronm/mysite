(function(){
  'use strict';
  const mq=window.matchMedia('(max-width: 767px)');
  const root=document.documentElement;
  const isRu=root.lang && root.lang.toLowerCase().startsWith('ru');
  const body=document.body;
  if(!body) return;

  function linkFor(suffix, fallback){
    const a=[...document.querySelectorAll('a[href]')].find(x=>x.getAttribute('href') && x.getAttribute('href').endsWith(suffix));
    return a ? a.getAttribute('href') : fallback;
  }

  function addQuickbar(){
    if(body.classList.contains('page-contact') || document.querySelector('.mobile-quickbar')) return;
    const workHref=linkFor('work.html',isRu?'work.html':'work.html');
    const contactHref=linkFor('contact.html',isRu?'contact.html':'contact.html');
    const bar=document.createElement('nav');
    bar.className='mobile-quickbar';
    bar.setAttribute('aria-label',isRu?'Быстрые действия':'Quick actions');
    bar.innerHTML=`<a class="mq-work" href="${workHref}">${isRu?'Работы':'Work'}</a><a class="mq-start" href="${contactHref}">${isRu?'Начать проект':'Start a project'}</a>`;
    body.appendChild(bar);
  }

  function addHomeValueStrip(){
    if(!body.classList.contains('page-index') || document.querySelector('.mobile-value-strip')) return;
    const opening=document.querySelector('.opening');
    if(!opening) return;
    const items=isRu?[
      ['01','Понятное предложение','Сначала смысл и выгода для клиента — потом визуальные эффекты.'],
      ['02','Меньше ручной работы','Сайты, AI и автоматизация соединяются вокруг реального процесса.'],
      ['03','Прямой следующий шаг','Без лишних экранов: увидеть работу, выбрать услугу, связаться.']
    ]:[
      ['01','A clearer offer','Business value first. Visual polish supports the message instead of hiding it.'],
      ['02','Less manual work','Web, AI and automation connect around the process people actually use.'],
      ['03','One clear next step','See the work, choose the route and start a conversation without friction.']
    ];
    const strip=document.createElement('section');
    strip.className='mobile-value-strip';
    strip.setAttribute('aria-label',isRu?'Что получает клиент':'What clients get');
    strip.innerHTML=items.map(x=>`<article><b>${x[0]}</b><div><strong>${x[1]}</strong><p>${x[2]}</p></div></article>`).join('');
    opening.insertAdjacentElement('afterend',strip);
  }

  function buildMobileWork(){
    if(!body.classList.contains('page-work') || document.querySelector('.mobile-work')) return;
    const main=document.querySelector('main');
    const shell=document.querySelector('.work-shell');
    if(!main || !shell) return;
    const scenes=[...document.querySelectorAll('.scene.scene-overview')];
    if(!scenes.length) return;
    const contactHref=linkFor('contact.html',isRu?'contact.html':'contact.html');
    const wrap=document.createElement('section');
    wrap.className='mobile-work';
    wrap.setAttribute('aria-label',isRu?'Проекты MIRA':'MIRA projects');
    wrap.innerHTML=`<header class="mobile-work-head"><div class="eyebrow">${isRu?'Избранные проекты / 07':'Selected work / 07'}</div><h1>${isRu?'РАБОТЫ. БЕЗ ЛИШНЕГО.':'WORK. WITHOUT THE FRICTION.'}</h1><p>${isRu?'Коротко о задаче, результате и продукте. Откройте живой проект или напишите, если нужен похожий результат.':'The problem, the product and the outcome — without learning a carousel. Open a live project or start a conversation about something similar.'}</p></header><div class="mobile-work-list"></div>`;
    const list=wrap.querySelector('.mobile-work-list');
    scenes.forEach((scene,i)=>{
      const title=(scene.querySelector('.scene-title')?.textContent||scene.dataset.project||'Project').replace(/\s+/g,' ').trim();
      const summary=(scene.querySelector('.scene-summary')?.textContent||'').replace(/\s+/g,' ').trim();
      const kicker=scene.querySelector('.scene-kicker');
      const meta=(kicker?.textContent||'').replace(/\s+/g,' ').trim();
      const image=scene.querySelector('.scene-art img');
      const live=scene.querySelector('a.case-demo, .website-shot[href]');
      const project=(scene.dataset.project||'project').toUpperCase();
      const card=document.createElement('article');
      card.className='mobile-case';
      const media=image ? `<div class="mobile-case-media"><img src="${image.getAttribute('src')}" alt="${(image.getAttribute('alt')||project).replace(/"/g,'&quot;')}" width="${image.getAttribute('width')||1200}" height="${image.getAttribute('height')||900}" loading="${i>0?'lazy':'eager'}" decoding="async"></div>` : `<div class="mobile-case-placeholder" aria-hidden="true">${project}</div>`;
      const liveAction=live ? `<a class="live" href="${live.getAttribute('href')}" target="_blank" rel="noopener noreferrer">${isRu?'Открыть живой проект ↗':'Open live project ↗'}</a>` : '';
      card.innerHTML=`${media}<div class="mobile-case-body"><div class="mobile-case-meta"><span>${String(i+1).padStart(2,'0')}</span><span>${project}</span></div><h2>${title}</h2><p>${summary}</p><div class="mobile-case-actions">${liveAction}<a class="discuss" href="${contactHref}">${isRu?'Обсудить похожий проект →':'Discuss a similar project →'}</a></div></div>`;
      list.appendChild(card);
    });
    shell.insertAdjacentElement('beforebegin',wrap);
  }

  function apply(){
    if(mq.matches){
      root.classList.add('mobile-experience');
      addQuickbar();
      addHomeValueStrip();
      buildMobileWork();
    }else{
      root.classList.remove('mobile-experience');
    }
  }

  apply();
  mq.addEventListener?.('change',apply);
})();
