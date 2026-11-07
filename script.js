/* ARYAN — V2 Paper Edition · interactions (quiet, paper-like) */
(function(){
  "use strict";

  /* theme: paper light default, optional ink dark. Persisted. */
  const root = document.documentElement;
  const KEY = 'aryan-v2-theme';
  const btn = document.getElementById('themeBtn');
  function stored(){
    try{ return localStorage.getItem(KEY); }catch(e){ return null; }
  }
  function apply(t){
    root.dataset.theme = t;
    try{ localStorage.setItem(KEY, t); }catch(e){}
    if(btn){
      btn.setAttribute('aria-pressed', String(t === 'dark'));
      btn.textContent = t === 'dark' ? '☀ paper day' : '☾ lights off';
      btn.title = t === 'dark' ? 'Back to paper' : 'Lights off (ink mode)';
    }
  }
  apply(stored() === 'dark' ? 'dark' : 'light');
  if(btn) btn.addEventListener('click', ()=> apply(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* reveal on scroll (gentle, like turning a page) */
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

  /* stamp slam when scrolled into view */
  const so = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('slam'); so.unobserve(e.target); }
    });
  }, {threshold:.6});
  document.querySelectorAll('.stamp').forEach(el=> so.observe(el));

  /* catalogue tabs filter */
  const tabs = document.querySelectorAll('.tab');
  const rows = document.querySelectorAll('.card-row');
  const pins = document.querySelectorAll('.pin');
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=> t.classList.remove('active'));
      tab.classList.add('active');
      const lang = tab.dataset.filter;
      [...rows, ...pins].forEach(item=>{
        item.style.display = (lang === 'All' || item.dataset.lang === lang) ? '' : 'none';
      });
    });
  });

  /* paper tilt on pins + card-rows (subtle, desktop only) */
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.pin, .card-row').forEach(card=>{
      card.addEventListener('mousemove', e=>{
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 4;
        const y = ((e.clientY - r.top) / r.height - .5) * -4;
        card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', ()=> card.style.transform = '');
    });
  }

  /* IST clock in masthead */
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata',day:'2-digit',month:'short'});
  const tickClock = ()=>{ if(clock) clock.textContent = fmt.format(new Date()).toUpperCase() + ' IST'; };
  tickClock(); setInterval(tickClock, 30000);

  /* lightbox for prints */
  const lb = document.getElementById('lightbox');
  if(lb){
    const img = lb.querySelector('img');
    const cap = lb.querySelector('.lightbox-cap');
    const close = lb.querySelector('.lightbox-x');
    let last = null;
    function open(src, label){
      img.src = src; img.alt = label || 'Print enlarged';
      cap.textContent = label || '';
      lb.classList.add('open'); document.body.classList.add('lb-open');
      last = document.activeElement; close && close.focus();
    }
    function shut(){
      lb.classList.remove('open'); document.body.classList.remove('lb-open');
      img.removeAttribute('src');
      if(last && last.focus) last.focus();
    }
    document.querySelectorAll('.print button').forEach(b=>{
      b.addEventListener('click', ()=>{
        const fig = b.closest('.print');
        const label = fig ? (fig.querySelector('figcaption span')||{}).textContent : '';
        const full = b.dataset.full || (b.querySelector('img')||{}).src;
        if(full) open(full, label);
      });
    });
    close && close.addEventListener('click', shut);
    lb.addEventListener('click', e=>{ if(e.target === lb) shut(); });
    addEventListener('keydown', e=>{ if(e.key === 'Escape' && lb.classList.contains('open')) shut(); });
  }

  document.querySelectorAll('[data-year]').forEach(el=> el.textContent = new Date().getFullYear());
})();
