(() => {
  'use strict';
  document.addEventListener('click', event => {
    const button=event.target.closest('[data-journey-step]');
    if(!button)return;
    const panel=button.closest('.journey-console');
    if(!panel)return;
    panel.querySelectorAll('[data-journey-step]').forEach((item,index)=>{
      const active=item===button;
      item.classList.toggle('is-active',active);
      item.setAttribute('aria-pressed',String(active));
      if(active){
        const count=panel.querySelector('.journey-count');
        if(count)count.textContent=`${String(index+1).padStart(2,'0')} / ${String(panel.querySelectorAll('[data-journey-step]').length).padStart(2,'0')}`;
      }
    });
    const set=(sel,value)=>{const node=panel.querySelector(sel);if(node)node.textContent=value||''};
    set('[data-journey-tag]',button.dataset.tag);
    set('[data-journey-title]',button.dataset.title);
    set('[data-journey-copy]',button.dataset.copy);
    set('[data-journey-point-a]',button.dataset.pointA);
    set('[data-journey-point-b]',button.dataset.pointB);
    set('[data-journey-outcome]',button.dataset.outcome);
  });
})();
