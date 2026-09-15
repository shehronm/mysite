(() => {
  'use strict';
  const recipient='shehronm@mail.com';
  const forms=[...document.querySelectorAll('[data-brief-form]')];
  if(!forms.length)return;
  const messages={
    en:{required:'Please complete the required fields before sending.',contact:'Enter a valid email address or Telegram username (for example @username).',copied:'Brief copied. Paste it into email, Telegram or any messenger.',copyFail:'Could not copy automatically. Select the text fields and send the details by email or Telegram.',opening:'Opening your email app with the prepared brief…',subject:'MIRA — Project brief'},
    ru:{required:'Заполните обязательные поля перед отправкой.',contact:'Укажите корректный email или username Telegram (например @username).',copied:'Бриф скопирован. Вставьте его в email, Telegram или любой мессенджер.',copyFail:'Не удалось скопировать автоматически. Отправьте данные через email или Telegram.',opening:'Открываем почтовое приложение с подготовленным брифом…',subject:'MIRA — Бриф проекта'}
  };
  const line=(label,value)=>value?.trim()?`${label}: ${value.trim()}`:'';
  const track=(name,data)=>window.MiraAnalytics?.track?.(name,data);
  function build(form){
    const data=new FormData(form), lang=form.dataset.lang==='ru'?'ru':'en';
    const labels=lang==='ru'?{name:'Имя',company:'Компания / бренд',contact:'Email / Telegram',type:'Тип проекта',scope:'Что нужно создать / улучшить',goal:'Бизнес-цель',timing:'Сроки',references:'Референсы / ссылки',next:'Удобный следующий шаг'}:{name:'Name',company:'Company / brand',contact:'Email / Telegram',type:'Project type',scope:'What needs to be built / improved',goal:'Business goal',timing:'Target timing',references:'References / links',next:'Preferred next step'};
    return Object.entries(labels).map(([key,label])=>line(label,String(data.get(key)||''))).filter(Boolean).join('\n\n');
  }
  function validEmail(value){
    if(value.length>254 || /\s/.test(value) || value.includes('..'))return false;
    const parts=value.split('@');
    if(parts.length!==2)return false;
    const [local,domain]=parts;
    if(!local || local.length>64 || !domain || domain.length>253 || !domain.includes('.'))return false;
    if(local.startsWith('.') || local.endsWith('.'))return false;
    const labels=domain.split('.');
    if(labels.some(label=>!label || label.length>63 || label.startsWith('-') || label.endsWith('-') || !/^[A-Za-z0-9-]+$/.test(label)))return false;
    if(labels.at(-1).length<2)return false;
    return /^[^\s@]+$/.test(local);
  }
  function validTelegram(value){
    const handle=value.replace(/^https?:\/\/(?:www\.)?t\.me\//i,'@').replace(/\/$/,'');
    return /^@[A-Za-z0-9_]{5,32}$/.test(handle);
  }
  function validContact(value){
    const normalized=value.trim();
    return validEmail(normalized) || validTelegram(normalized);
  }
  function errorNode(field){
    const label=field.closest('label');
    if(!label)return null;
    let node=label.querySelector('.field-error');
    if(!node){
      node=document.createElement('span');
      node.className='field-error';
      node.id=`${field.name || 'field'}-error-${Math.random().toString(36).slice(2,8)}`;
      node.hidden=true;
      label.append(node);
    }
    return node;
  }
  function mark(field,valid,message=''){
    field.setAttribute('aria-invalid',String(!valid));
    const node=errorNode(field);
    if(node){
      node.textContent=valid?'':message;
      node.hidden=valid;
      if(valid)field.removeAttribute('aria-describedby');else field.setAttribute('aria-describedby',node.id);
    }
  }
  function validate(form){
    let ok=true, first=null, reason='required';
    const lang=form.dataset.lang==='ru'?'ru':'en',m=messages[lang];
    form.querySelectorAll('[required]').forEach(field=>{
      const empty=field.value.trim()==='';
      const contact=field.name==='contact';
      const valid=!empty && (!contact || validContact(field.value));
      mark(field,valid,contact && !empty?m.contact:m.required);
      if(!valid){ok=false;first??=field;if(contact&&!empty)reason='contact_format';}
      field.addEventListener('input',()=>{mark(field,true);},{once:true});
      field.addEventListener('change',()=>{mark(field,true);},{once:true});
    });
    if(!ok){first?.focus();track('Form Validation Error',{form:'brief',reason});}
    return ok;
  }
  async function copy(text){
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true;}
    const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const success=document.execCommand('copy');area.remove();return success;
  }
  forms.forEach(form=>{
    const lang=form.dataset.lang==='ru'?'ru':'en',m=messages[lang],status=form.querySelector('[data-brief-status]');
    const contact=form.elements.contact;
    if(contact){contact.setAttribute('autocapitalize','none');contact.setAttribute('spellcheck','false');contact.setAttribute('inputmode','email');}
    let started=false;
    form.addEventListener('focusin',()=>{if(!started){started=true;track('Form Start',{form:'brief',lang});}},{once:true});
    const setStatus=(text,type='')=>{status.textContent=text;status.className=`brief-status${type?` is-${type}`:''}`;};
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!validate(form)){setStatus(m.required,'error');return;}
      const body=build(form);setStatus(m.opening,'success');
      track('Brief Handoff',{method:'email',lang});
      const url=`mailto:${recipient}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(body)}`;
      window.location.href=url;
    });
    form.querySelector('[data-copy-brief]')?.addEventListener('click',async()=>{
      if(!validate(form)){setStatus(m.required,'error');return;}
      try{const ok=await copy(build(form));setStatus(ok?m.copied:m.copyFail,ok?'success':'error');if(ok)track('Brief Handoff',{method:'copy',lang});}catch{setStatus(m.copyFail,'error');}
    });
  });
})();
