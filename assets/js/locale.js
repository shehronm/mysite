/* Small shared vocabulary for dynamic controls. Page copy is translated at build time. */
(() => {
  'use strict';
  const lang=document.documentElement.lang==='ru'?'ru':'en';
  const words={
    'Independent concept / Proposed experience':'Авторский концепт / Сценарий работы',
    'Next service':'Следующая услуга', 'Next project':'Следующий проект',
    'Next project: {name}':'Следующий проект: {name}',
    'Previous project: {name}':'Предыдущий проект: {name}',
    'Next screen':'Следующий экран','Previous screen':'Предыдущий экран',
    'All projects explored':'Все проекты просмотрены',
    'Next: {name} ↓':'Далее: {name} ↓', 'Continue the story →':'Продолжить →',
    '{name}. {stage}. Screen {screen} of {screens}. Project {project} of {projects}.':'{name}. {stage}. Экран {screen} из {screens}. Проект {project} из {projects}.',
    'Pause animations':'Остановить анимацию','Resume animations':'Включить анимацию'
  };
  window.MiroI18n={lang,t(key,values={}){return (lang==='ru'?(words[key]??key):key).replace(/\{(\w+)\}/g,(_,id)=>String(values[id]??''));}};
  // Only the generic homepage follows a saved preference. Explicit page links
  // retain their own language; the switch works even when storage is unavailable.
  try{
    const requested=new URLSearchParams(location.search).get('lang');
    if(requested===lang||lang==='ru')localStorage.setItem('miro-language',lang);
    else if(lang==='en'&&/^\/(?:index\.html)?$/.test(location.pathname)&&localStorage.getItem('miro-language')==='ru'){
      location.replace('ru/index.html'+location.search+location.hash);
    }
  }catch{}
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('[data-language]').forEach(link=>{
      const url=new URL(link.href,location.href);
      url.searchParams.set('lang',link.dataset.language);
      // Work chapter and in-page anchors remain selected after switching language.
      url.hash=location.hash;
      link.href=url.pathname+url.search+url.hash;
      link.addEventListener('click',()=>{
        const target=new URL(link.href,location.href);target.hash=location.hash;
        link.href=target.pathname+target.search+target.hash;
        try{localStorage.setItem('miro-language',link.dataset.language);}catch{}
      });
    });
  });
})();
