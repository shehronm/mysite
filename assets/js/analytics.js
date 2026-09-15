(() => {
  'use strict';
  if(window.MiroAnalytics)return;
  window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
  const safePath=href=>{
    try{const url=new URL(href,location.href);return url.origin===location.origin?url.pathname:'external';}catch{return 'unknown';}
  };
  const track=(name,data={})=>{
    const safe={};
    Object.entries(data).slice(0,2).forEach(([key,value])=>{
      if(['string','number','boolean'].includes(typeof value) || value===null)safe[key]=String(value).slice(0,80);
    });
    window.va('event',{name,data:safe});
    document.dispatchEvent(new CustomEvent('miro:analytics',{detail:{name,data:safe}}));
  };
  window.MiroAnalytics={track};
  if(!document.querySelector('script[data-miro-analytics]')){
    const script=document.createElement('script');
    script.defer=true;script.src='/_vercel/insights/script.js';script.dataset.miroAnalytics='vercel';
    document.head.append(script);
  }
  document.addEventListener('click',event=>{
    const caseButton=event.target.closest('[data-case]');
    if(caseButton){track('Case Open',{project:caseButton.dataset.case||'unknown',lang:document.documentElement.lang||'en'});return;}
    const link=event.target.closest('a[href]');if(!link)return;
    const href=link.getAttribute('href')||'';
    const locationKey=link.closest('header')?'header':link.closest('footer,.page-bottom')?'footer':link.closest('form')?'form':'content';
    if(/^https?:\/\/(?:www\.)?t\.me\//i.test(href)){track('Contact Click',{kind:'telegram',location:locationKey});return;}
    if(/^mailto:/i.test(href)){track('Contact Click',{kind:'email',location:locationKey});return;}
    if(/contact\.html(?:#|$)|\/contact(?:#|$)/i.test(href) || href==='#brief-form'){track('Contact Click',{kind:'contact',location:locationKey});return;}
    if(link.matches('.case-demo,.website-shot')){track('Portfolio Click',{target:safePath(href),location:locationKey});return;}
    if(link.matches('.text-cta,.primary-cta,.hero-primary,.hero-secondary,.cta-row a,.proof-cta a,.proof-hero-actions a'))track('CTA Click',{target:safePath(href),location:locationKey});
  },{passive:true});
})();
