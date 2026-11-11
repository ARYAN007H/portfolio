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

  /* latest releases: hydrate the download slips from GitHub so new builds appear on their own */
  const download = document.querySelector('#download[data-repo]');
  if(download){
    const repo = download.dataset.repo;
    const api = 'https://api.github.com/repos/' + repo + '/releases?per_page=100';
    const cacheKey = 'aryan-releases:v1:' + repo;

    /* show the last known release immediately, then refresh it in the background */
    const cached = (() => {
      try{
        const raw = JSON.parse(localStorage.getItem(cacheKey));
        if(raw && raw.latest) return raw;
      }catch(e){}
      return null;
    })();

    const fmtDate = iso => {
      const d = new Date(iso);
      return isNaN(d) ? '—' : d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
    };

    /* release asset name → platform label; null means "not a user download" */
    const label = name => {
      const n = name.toLowerCase();
      if(n === 'sha256sums.txt' || /\.(idsig|sig|sha256)$/.test(n)) return null;
      if(/\.app\.tar(\.(gz|bz2|xz))?$/.test(n)) return null;
      if(n.endsWith('.apk')){
        if(n.includes('native')) return 'Android · APK (native)';
        return n.includes('aarch64') ? 'Android · APK (aarch64)' : 'Android · APK';
      }
      if(n.endsWith('.appimage')) return 'Linux · AppImage';
      if(n.endsWith('.deb')) return 'Linux · Debian .deb';
      if(n.endsWith('.rpm')) return 'Linux · Fedora .rpm';
      if(n.endsWith('.flatpak')) return 'Linux · Flatpak';
      if(n.endsWith('.msi')) return 'Windows · MSI';
      if(n.endsWith('.exe')) return n.includes('setup') ? 'Windows · Installer .exe' : 'Windows · Portable .exe';
      if(n.endsWith('.dmg')){
        if(n.includes('universal')) return 'macOS · Universal .dmg';
        if(n.includes('aarch64') || n.includes('arm64')) return 'macOS · Apple Silicon .dmg';
        if(/(x64|x86_64|amd64|intel)/.test(n)) return 'macOS · Intel .dmg';
        return 'macOS · .dmg';
      }
      if(/\.(tar\.gz|tgz)$/.test(n)) return 'Linux · Portable .tar.gz';
      if(!n.includes('.')) return 'Linux · Standalone binary';
      return null;
    };

    const rank = name => {
      const n = name.toLowerCase();
      if(n.endsWith('.appimage')) return 10;
      if(n.endsWith('.deb')) return 20;
      if(n.endsWith('.rpm')) return 30;
      if(n.endsWith('.flatpak')) return 40;
      if(/\.(tar\.gz|tgz)$/.test(n) || !n.includes('.')) return 50;
      if(n.endsWith('.exe')) return 60;
      if(n.endsWith('.msi')) return 70;
      if(n.endsWith('.dmg')) return 80;
      if(n.endsWith('.apk')) return 90;
      return 100;
    };

    const render = state => {
      const fine = download.querySelector('.fine');
      const sub = download.querySelector('.sub');
      const latest = state.latest;
      const spec = [...document.querySelectorAll('.spec')].find(item => {
        const key = item.querySelector('.k');
        return key && key.textContent.trim() === 'Latest release';
      });
      const setSpec = tag => {
        const value = spec && spec.querySelector('.v');
        if(value) value.textContent = tag;
      };

      if(!latest){
        setSpec('—');
        if(fine){
          fine.textContent = '0 release(s) · latest — (—)';
          fine.append(document.createElement('br'), 'Source: https://github.com/' + repo);
        }
        return;
      }
      setSpec(latest.tag_name);

      const date = fmtDate(latest.published_at);
      const assets = (latest.assets || []).slice()
        .map(asset => ({asset, name: label(asset.name)}))
        .filter(x => x.name)
        .sort((a, b) => rank(a.asset.name) - rank(b.asset.name) || a.asset.name.localeCompare(b.asset.name));

      if(sub){
        sub.textContent = assets.length
          ? 'Latest: ' + latest.tag_name + ' · ' + date + '. Tear off what you need.'
          : 'Latest: ' + latest.tag_name + ' · ' + date + '. No packaged build — grab the source.';
      }

      let all = download.querySelector('.slip.all');
      if(!all){
        all = document.createElement('a');
        all.className = 'slip all';
        all.href = 'https://github.com/' + repo + '/releases';
        all.target = '_blank';
        all.rel = 'noopener';
        const title = document.createElement('span');
        title.textContent = 'All releases & notes';
        const dl = document.createElement('span');
        dl.className = 'dl';
        dl.textContent = '↗ GitHub';
        all.append(title, dl);
        download.insertBefore(all, fine);
      }

      if(assets.length){
        download.querySelectorAll('.slip:not(.all)').forEach(el => el.remove());
        assets.forEach(({asset, name}) => {
          const a = document.createElement('a');
          a.className = 'slip';
          a.href = asset.browser_download_url;
          a.setAttribute('download', '');
          const platform = document.createElement('span');
          platform.textContent = name;
          const take = document.createElement('span');
          take.className = 'dl';
          take.textContent = '↓ take';
          a.append(platform, take);
          download.insertBefore(a, all);
        });
      } else if(!download.querySelector('.slip.empty')){
        download.querySelectorAll('.slip:not(.all)').forEach(el => el.remove());
        const empty = document.createElement('div');
        empty.className = 'slip empty';
        empty.textContent = 'No packaged build for this release yet. ';
        const link = document.createElement('a');
        link.href = 'https://github.com/' + repo + '/releases';
        link.target = '_blank';
        link.rel = 'noopener';
        link.style.cssText = 'text-decoration:underline;font-weight:700';
        link.textContent = 'Check the release notes ↗';
        empty.append(link);
        download.insertBefore(empty, all);
      }

      if(fine){
        fine.textContent = state.count + ' release(s) · latest ' + latest.tag_name + ' (' + date + ')';
        fine.append(document.createElement('br'), 'Source: https://github.com/' + repo);
      }
    };

    if(cached) render(cached);

    fetch(api, {headers: {'Accept': 'application/vnd.github+json'}})
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        if(!Array.isArray(data)) return;
        const state = {t: Date.now(), count: data.length, latest: data[0] || null};
        try{ localStorage.setItem(cacheKey, JSON.stringify(state)); }catch(e){}
        render(state);
      })
      .catch(() => {});
  }

  /* pinned-card versions on the front page */
  document.querySelectorAll('[data-release-tag][data-repo]').forEach(el => {
    const repo = el.dataset.repo;
    const key = 'aryan-releases:v1:' + repo;
    const apply = state => { if(state && state.latest) el.textContent = '↓ ' + state.latest.tag_name; };
    try{ apply(JSON.parse(localStorage.getItem(key))); }catch(e){}
    fetch('https://api.github.com/repos/' + repo + '/releases?per_page=100', {headers: {'Accept': 'application/vnd.github+json'}})
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        if(!Array.isArray(data)) return;
        const state = {t: Date.now(), count: data.length, latest: data[0] || null};
        try{ localStorage.setItem(key, JSON.stringify(state)); }catch(e){}
        apply(state);
      })
      .catch(() => {});
  });

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
