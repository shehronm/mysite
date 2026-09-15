
(function(){
  const svg=document.getElementById('heroWave');
  if(!svg) return;
  const NS='http://www.w3.org/2000/svg';

  const defs=document.createElementNS(NS,'defs');
  const filter=document.createElementNS(NS,'filter');
  filter.setAttribute('id','heroGlow');
  filter.setAttribute('x','-20%');filter.setAttribute('y','-20%');filter.setAttribute('width','140%');filter.setAttribute('height','140%');
  const blur=document.createElementNS(NS,'feGaussianBlur');
  blur.setAttribute('stdDeviation','2.3');
  blur.setAttribute('result','b');
  const merge=document.createElementNS(NS,'feMerge');
  const n1=document.createElementNS(NS,'feMergeNode');n1.setAttribute('in','b');
  const n2=document.createElementNS(NS,'feMergeNode');n2.setAttribute('in','SourceGraphic');
  merge.append(n1,n2);filter.append(blur,merge);defs.append(filter);svg.append(defs);

  function group(name){const g=document.createElementNS(NS,'g');g.setAttribute('class',name);svg.append(g);return g}
  const horizontal=group('wave-horizontal');
  const vertical=group('wave-vertical');
  // A single filter surface replaces 27 independently blurred paths.
  vertical.setAttribute('filter','url(#heroGlow)');
  const dots=group('wave-dots');

  function addPath(d,stroke,width,opacity,parent){
    const p=document.createElementNS(NS,'path');
    p.setAttribute('d',d);p.setAttribute('fill','none');
    p.setAttribute('stroke',stroke);p.setAttribute('stroke-width',width);
    p.setAttribute('opacity',opacity);
    parent.appendChild(p);
    return p;
  }

  for(let i=0;i<38;i++){
    const t=i/37;
    const y0=420+i*4.0;
    const c1y=155+i*4.1;
    const c2y=795-i*5.0;
    const y1=515+(i-19)*7.2;
    const stroke=t<.42?'#dce4e8':t<.76?'#7890ba':'#174cff';
    addPath(`M 650 ${y0} C 920 ${c1y},1080 ${c2y},1560 ${y1}`,stroke,1,(.075+t*.42).toFixed(3),horizontal);
  }

  for(let i=0;i<27;i++){
    const t=i/26;
    const y0=-35+i*2.6;
    const c1y=155+i*1.2;
    const c2y=455+i*2.0;
    const y1=590+(i-13)*6.2;
    const stroke=t<.7?'#174cff':'#dfe5e7';
    addPath(`M 1080 ${y0} C 1120 ${c1y},1010 ${c2y},1260 ${y1}`,stroke,1.05,(.11+t*.46).toFixed(3),vertical);
  }

  for(let r=1;r<12;r++){
    const rr=r/11;
    for(let j=0;j<34;j++){
      const ang=(j/34)*Math.PI*2+r*.08;
      const c=document.createElementNS(NS,'circle');
      c.setAttribute('cx',1205+Math.cos(ang)*132*rr);
      c.setAttribute('cy',418+Math.sin(ang)*172*rr);
      c.setAttribute('r',Math.max(.45,1.5*(1-rr)+.25));
      c.setAttribute('fill','#315aff');
      c.setAttribute('opacity',(.055+rr*.43).toFixed(3));
      dots.appendChild(c);
    }
  }
  const signal=addPath('M 650 532 C 920 270,1080 655,1560 580','#a9bdff',1.7,1,horizontal);
  signal.setAttribute('class','hero-signal');signal.setAttribute('pathLength','1');
})();

(()=>{  const svgs=document.querySelectorAll('.offerSvg');
  const NS='http://www.w3.org/2000/svg';
  function line(svg,d,stroke,op=1,w=1){
    const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('fill','none');
    p.setAttribute('stroke',stroke);p.setAttribute('opacity',op);p.setAttribute('stroke-width',w);svg.appendChild(p)
  }
  svgs.forEach((svg,idx)=>{
    const st=svg.dataset.style;
    if(st==='web'){
      svg.innerHTML='<rect width="600" height="140" fill="#0a0f11"/><circle cx="390" cy="72" r="78" fill="none" stroke="#315aff" stroke-opacity=".45"/>';
      for(let i=0;i<12;i++) line(svg,`M ${30+i*23} 140 L ${270+i*8} 0`,'#aab7bf',.12+i*.025,.8);
    } else if(st==='ai'){
      for(let i=0;i<22;i++) line(svg,`M -20 ${120+i} C 160 ${-10+i*3}, 330 ${160-i*2}, 620 ${35+i*2}` ,i<11?'#ff5b3d':'#315aff',.22+i*.018,.8);
    } else if(st==='crm'){
      svg.innerHTML='<rect width="600" height="140" fill="#0a0e10"/>';
      for(let x=40;x<600;x+=70){ line(svg,`M ${x} 0 V 140`,'#6f7b82',.2,.8); }
      for(let y=20;y<140;y+=30){ line(svg,`M 0 ${y} H 600`,'#6f7b82',.16,.8); }
      line(svg,'M 40 116 C 160 30, 360 110, 560 25','#315aff',.9,1.2);
    } else if(st==='tg'){
      svg.innerHTML='<rect width="600" height="140" fill="#0b0f11"/><circle cx="420" cy="70" r="94" fill="none" stroke="#f0a7c3" stroke-opacity=".5"/>';
      line(svg,'M 0 105 C 180 0, 320 150, 600 22','#f0a7c3',.65,1);
      line(svg,'M 0 125 C 190 28, 370 120, 600 58','#315aff',.65,1);
    } else {
      svg.innerHTML='<rect width="600" height="140" fill="#0a0e10"/><rect x="325" y="18" width="180" height="105" fill="none" stroke="#315aff" stroke-opacity=".45"/><rect x="350" y="42" width="46" height="54" fill="#315aff" fill-opacity=".18"/><rect x="409" y="31" width="70" height="18" fill="#ff5b3d" fill-opacity=".5"/>';
    }
    const routes={web:'M 76 140 L 286 0',ai:'M -20 130 C 160 20,330 140,620 55',crm:'M 40 116 C 160 30,360 110,560 25',tg:'M 0 105 C 180 0,320 150,600 22'};
    if(routes[st]){
      const signal=document.createElementNS(NS,'path');
      signal.setAttribute('d',routes[st]);signal.setAttribute('fill','none');signal.setAttribute('stroke',st==='tg'?'#ffd9e8':'#c9d6ff');signal.setAttribute('stroke-width','2');signal.setAttribute('pathLength','1');signal.setAttribute('class','capability-signal');svg.append(signal);
    }else{
      const pane=document.createElementNS(NS,'rect');
      for(const [key,value] of Object.entries({x:409,y:61,width:70,height:35,fill:'#315aff',class:'system-window'}))pane.setAttribute(key,value);
      svg.append(pane);
    }
  });
})();
