(() => {
  'use strict';
  const recipient='shehronm@mail.com';
  const forms=[...document.querySelectorAll('[data-brief-form]')];
  if(!forms.length)return;
  const messages={
    en:{required:'Please complete the required fields before sending.',copied:'Brief copied. Paste it into email, Telegram or any messenger.',copyFail:'Could not copy automatically. Select the text fields and send the details by email or Telegram.',opening:'Opening your email app with the prepared brief…',subject:'MIRA — Project brief'},
    ru:{required:'Заполните обязательные поля перед отправкой.',copied:'Бриф скопирован. Вставьте его в email, Telegram или любой мессенджер.',copyFail:'Не удалось скопировать автоматически. Отправьте данные через email или Telegram.',opening:'Открываем почтовое приложение с подготовленным брифом…',subject:'MIRA — Бриф проекта'}
  };
  const line=(label,value)=>value?.trim()?`${label}: ${value.trim()}`:'';
  function build(form){
    const data=new FormData(form), lang=form.dataset.lang==='ru'?'ru':'en';
    const labels=lang==='ru'?{name:'Имя',company:'Компания / бренд',contact:'Email / Telegram',type:'Тип проекта',scope:'Что нужно создать / улучшить',goal:'Бизнес-цель',timing:'Сроки',references:'Референсы / ссылки',next:'Удобный следующий шаг'}:{name:'Name',company:'Company / brand',contact:'Email / Telegram',type:'Project type',scope:'What needs to be built / improved',goal:'Business goal',timing:'Target timing',references:'References / links',next:'Preferred next step'};
    return Object.entries(labels).map(([key,label])=>line(label,String(data.get(key)||''))).filter(Boolean).join('\n\n');
  }
  function validate(form){
    let ok=true, first=null;
    form.querySelectorAll('[required]').forEach(field=>{
      const valid=field.value.trim()!=='';
      field.setAttribute('aria-invalid',String(!valid));
      if(!valid){ok=false;first??=field;}
      field.addEventListener('input',()=>field.removeAttribute('aria-invalid'),{once:true});
    });
    if(!ok)first?.focus();
    return ok;
  }
  async function copy(text){
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true;}
    const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const success=document.execCommand('copy');area.remove();return success;
  }
  forms.forEach(form=>{
    const lang=form.dataset.lang==='ru'?'ru':'en',m=messages[lang],status=form.querySelector('[data-brief-status]');
    const setStatus=(text,type='')=>{status.textContent=text;status.className=`brief-status${type?` is-${type}`:''}`;};
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!validate(form)){setStatus(m.required,'error');return;}
      const body=build(form);setStatus(m.opening,'success');
      const url=`mailto:${recipient}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(body)}`;
      window.location.href=url;
    });
    form.querySelector('[data-copy-brief]')?.addEventListener('click',async()=>{
      if(!validate(form)){setStatus(m.required,'error');return;}
      try{const ok=await copy(build(form));setStatus(ok?m.copied:m.copyFail,ok?'success':'error');}catch{setStatus(m.copyFail,'error');}
    });
  });
})();
