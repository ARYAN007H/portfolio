/* ARYAN™ Press — interactions (quiet, paper-like) */
(function(){
  "use strict";

  const root = document.documentElement;
  const KEY = 'aryan-v2-theme';
  const btn = document.getElementById('themeBtn');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* theme: paper by default, ink on request. Only a deliberate click is persisted. */
  const stored = () => { try{ return localStorage.getItem(KEY); }catch(e){ return null; } };
  function apply(t, persist){
    root.dataset.theme = t;
    if(persist){ try{ localStorage.setItem(KEY, t); }catch(e){} }
    if(themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#1E1F33' : '#FBF7ED');
    if(btn){
      btn.setAttribute('aria-pressed', String(t === 'dark'));
      btn.textContent = t === 'dark' ? '☀ paper day' : '☾ lights off';
      btn.title = t === 'dark' ? 'Back to paper' : 'Lights off (ink mode)';
    }
  }
  apply(stored() === 'dark' ? 'dark' : 'light', false);
  if(btn) btn.addEventListener('click', () => apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true));

  /* one-shot class toggles when an element scrolls into view (reveal, stamp slam) */
  function watch(selector, cls, threshold){
    const els = document.querySelectorAll(selector);
    if(!('IntersectionObserver' in window)){ els.forEach(el => el.classList.add(cls)); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add(cls); io.unobserve(e.target); }
    }), {threshold});
    els.forEach(el => io.observe(el));
  }
  watch('.reveal', 'in', .1);
  watch('.stamp', 'slam', .6);

  /* catalogue filter */
  const tabs = [...document.querySelectorAll('.tab')];
  if(tabs.length){
    const rows = [...document.querySelectorAll('.card-row')];
    const pins = [...document.querySelectorAll('.pin')];
    const board = document.querySelector('.board');
    const boardTitle = document.querySelector('.board-title');
    const status = document.getElementById('filter-status');
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
      const lang = tab.dataset.filter;
      const match = el => lang === 'All' || el.dataset.lang === lang;
      let shown = 0, pinned = 0;
      rows.forEach(r => { const on = match(r); r.style.display = on ? '' : 'none'; if(on) shown++; });
      pins.forEach(p => { const on = match(p); p.style.display = on ? '' : 'none'; if(on) pinned++; });
      if(board) board.hidden = pinned === 0;
      if(boardTitle) boardTitle.hidden = pinned === 0;
      if(status) status.textContent = 'Showing ' + shown + ' of ' + rows.length + ' projects';
    }));
  }

  /* paper tilt on pins + card-rows (desktop pointer only, throttled to one frame) */
  if(matchMedia('(hover:hover) and (pointer:fine)').matches && !reduceMotion){
    document.querySelectorAll('.pin, .card-row').forEach(card => {
      let raf = 0;
      card.addEventListener('mousemove', e => {
        if(raf) return;
        const cx = e.clientX, cy = e.clientY;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = card.getBoundingClientRect();
          const x = ((cx - r.left) / r.width - .5) * 4;
          const y = ((cy - r.top) / r.height - .5) * -4;
          card.style.transform = 'perspective(900px) rotateX(' + y + 'deg) rotateY(' + x + 'deg) translateY(-3px)';
        });
      });
      card.addEventListener('mouseleave', () => {
        if(raf){ cancelAnimationFrame(raf); raf = 0; }
        card.style.transform = '';
      });
    });
  }

  /* nav: mark where you are */
  const links = [...document.querySelectorAll('.navbar a')];
  const linkFor = href => links.find(a => a.getAttribute('href') === href);
  if(document.querySelector('.hero') && document.getElementById('shelf') && 'IntersectionObserver' in window){
    const map = [['top', 'index.html'], ['shelf', 'index.html#shelf'], ['journal', 'index.html#journal'], ['on-shelf', 'index.html#on-shelf']];
    const spy = new IntersectionObserver(entries => entries.forEach(e => {
      if(!e.isIntersecting) return;
      links.forEach(a => a.removeAttribute('aria-current'));
      const hit = map.find(m => m[0] === e.target.id);
      const a = hit && linkFor(hit[1]);
      if(a) a.setAttribute('aria-current', 'true');
    }), {rootMargin: '-45% 0px -50% 0px'});
    map.forEach(m => { const el = document.getElementById(m[0]); if(el) spy.observe(el); });
  } else if(document.querySelector('.spec-hero')){
    const a = linkFor('../index.html#shelf');
    if(a) a.setAttribute('aria-current', 'page');
  }

  /* IST clock in masthead */
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-GB', {hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short'});
  const tickClock = () => { if(clock) clock.textContent = fmt.format(new Date()).toUpperCase() + ' IST'; };
  tickClock(); setInterval(tickClock, 30000);

  /* lightbox for prints: prev/next, arrow keys, swipe, focus kept inside */
  const lb = document.getElementById('lightbox');
  if(lb){
    const img = lb.querySelector('img');
    const cap = lb.querySelector('.lightbox-cap');
    const close = lb.querySelector('.lightbox-x');
    const prev = lb.querySelector('.prev');
    const next = lb.querySelector('.next');
    const items = [...document.querySelectorAll('.print button')].map(b => {
      const fig = b.closest('.print');
      const label = fig && fig.querySelector('figcaption span');
      return {trigger: b, label: label ? label.textContent : '', src: b.dataset.full || (b.querySelector('img') || {}).src};
    }).filter(it => it.src);
    let cur = 0, opener = null;

    const show = i => {
      cur = (i + items.length) % items.length;
      const it = items[cur];
      img.src = it.src;
      img.alt = it.label || 'Print enlarged';
      cap.textContent = items.length > 1 ? it.label + ' — ' + (cur + 1) + ' of ' + items.length : it.label;
    };
    const open = i => {
      lb.classList.toggle('single', items.length < 2);
      show(i);
      lb.classList.add('open');
      document.body.classList.add('lb-open');
      opener = document.activeElement;
      close.focus();
    };
    const shut = () => {
      lb.classList.remove('open');
      document.body.classList.remove('lb-open');
      img.removeAttribute('src');
      if(opener && opener.focus) opener.focus();
    };

    items.forEach((it, i) => it.trigger.addEventListener('click', () => open(i)));
    close.addEventListener('click', shut);
    if(prev) prev.addEventListener('click', () => show(cur - 1));
    if(next) next.addEventListener('click', () => show(cur + 1));
    lb.addEventListener('click', e => { if(e.target === lb) shut(); });

    let x0 = null;
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, {passive: true});
    lb.addEventListener('touchend', e => {
      if(x0 === null || items.length < 2) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if(Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });

    addEventListener('keydown', e => {
      if(!lb.classList.contains('open')) return;
      if(e.key === 'Escape') shut();
      else if(e.key === 'ArrowLeft' && items.length > 1) show(cur - 1);
      else if(e.key === 'ArrowRight' && items.length > 1) show(cur + 1);
      else if(e.key === 'Tab'){
        const f = [...lb.querySelectorAll('button')].filter(b => b.offsetParent !== null);
        if(!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
