// xzn launcher — animações da página de download.
(() => {
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- bolhas subindo pelo fundo ----------
  const aquario = document.querySelector('.bolhas');
  function bolha() {
    if (document.hidden) return;
    const b = document.createElement('span');
    const tam = 6 + Math.random() * 22;
    b.className = 'bolha';
    b.style.width = b.style.height = `${tam}px`;
    b.style.left = `${Math.random() * 100}%`;
    b.style.animationDuration = `${9 + Math.random() * 10}s`;
    b.style.setProperty('--balanco', `${(Math.random() - 0.5) * 80}px`);
    b.addEventListener('animationend', () => b.remove());
    aquario.appendChild(b);
  }
  if (!calmo && aquario) {
    for (let i = 0; i < 10; i++) setTimeout(bolha, i * 350);
    setInterval(bolha, 900);
  }

  // ---------- topo ganha fundo ao rolar ----------
  const topo = document.querySelector('.topo');
  const aoRolar = () => topo.classList.toggle('rolou', window.scrollY > 10);
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  // ---------- blocos entram ao aparecer na tela (em cascata dentro de cada grupo) ----------
  const grupos = new Map();
  for (const el of $$('.revela')) {
    const pai = el.parentElement;
    const i = grupos.get(pai) ?? 0;
    grupos.set(pai, i + 1);
    el.style.setProperty('--atraso', `${Math.min(i, 6) * 0.08}s`);
  }
  if ('IntersectionObserver' in window && !calmo) {
    const io = new IntersectionObserver((itens) => {
      for (const it of itens) if (it.isIntersecting) { it.target.classList.add('visivel'); io.unobserve(it.target); }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('.revela').forEach((el) => io.observe(el));
  } else $$('.revela').forEach((el) => el.classList.add('visivel'));

  // ---------- números contando ----------
  function contar(el) {
    const alvo = Number(el.dataset.conta), suf = el.dataset.sufixo || '';
    if (calmo) { el.textContent = alvo + suf; return; }
    const ini = performance.now(), dur = 1400;
    const passo = (t) => {
      const k = Math.min(1, (t - ini) / dur);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3))) + suf;
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }
  const numeros = $$('[data-conta]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((itens) => {
      for (const it of itens) if (it.isIntersecting) { contar(it.target); io.unobserve(it.target); }
    }, { threshold: 0.6 });
    numeros.forEach((el) => io.observe(el));
  } else numeros.forEach(contar);

  // ---------- gota de água no clique do botão ----------
  for (const b of $$('.cta')) {
    b.addEventListener('pointerdown', (e) => {
      if (calmo) return;
      const r = b.getBoundingClientRect(), tam = Math.max(r.width, r.height) / 2;
      const g = document.createElement('span');
      g.className = 'gota';
      Object.assign(g.style, { width: `${tam}px`, height: `${tam}px`, left: `${e.clientX - r.left - tam / 2}px`, top: `${e.clientY - r.top - tam / 2}px` });
      g.addEventListener('animationend', () => g.remove());
      b.appendChild(g);
    });
  }

  // ---------- o aquário segue o mouse de leve ----------
  const arte = document.querySelector('.aquario');
  if (arte && !calmo && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10, y = (e.clientY / window.innerHeight - 0.5) * 10;
      arte.style.translate = `${x}px ${y}px`;
    }, { passive: true });
  }

  // ---------- Windows ou Mac: o botão principal é o do sistema de quem abre ----------
  const ehMac = /Mac|iPhone|iPad/.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);
  const so = ehMac ? 'mac' : 'win';
  const nomeSO = { win: 'Windows', mac: 'Mac' };
  for (const a of $$('[data-win]')) {
    if (a.classList.contains('outro-sistema')) { const outro = ehMac ? 'win' : 'mac'; a.href = a.dataset[outro]; a.textContent = `baixar para ${nomeSO[outro]}`; continue; }
    a.href = a.dataset[so];
    const t = a.querySelector('span');
    if (t) t.textContent = `Baixar para ${nomeSO[so]}`;
  }
  // as abas de "como instalar"
  const mostrar = (s) => {
    $$('.aba').forEach((b) => b.classList.toggle('on', b.dataset.so === s));
    $$('.so-win').forEach((e) => (e.hidden = s !== 'win'));
    $$('.so-mac').forEach((e) => { e.hidden = s !== 'mac'; if (s === 'mac') e.querySelectorAll('.revela').forEach((r) => r.classList.add('visivel')); if (s === 'mac' && e.classList.contains('revela')) e.classList.add('visivel'); });
  };
  $$('.aba').forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.so)));
  mostrar(so);

  // ---------- versão, data e tamanho do instalador mais novo ----------
  fetch('https://api.github.com/repos/devpassarelli/xzn-releases/releases/latest')
    .then((r) => (r.ok ? r.json() : null))
    .then((rel) => {
      if (!rel) return;
      const assets = rel.assets || [];
      const exe = ehMac ? assets.find((a) => /\.dmg$/.test(a.name)) : assets.find((a) => a.name === 'XzN-Launcher-Setup.exe') || assets.find((a) => /Setup.*\.exe$/.test(a.name));
      const mb = exe ? Math.round(exe.size / 1048576) : null;
      const data = rel.published_at ? new Date(rel.published_at).toLocaleDateString('pt-BR') : '';
      document.getElementById('meta').innerHTML = `<b>versão ${String(rel.tag_name).replace(/^v/, '')}</b>${data ? ` de ${data}` : ''}${mb ? ` · ${mb} MB` : ''} · se atualiza sozinho`;
      if (!ehMac && exe && exe.name !== 'XzN-Launcher-Setup.exe') $$('.baixar').forEach((a) => (a.href = exe.browser_download_url));
      // Mac ainda sem instalador publicado: o botão principal volta para o Windows
      if (ehMac && !exe) $$('[data-win]').forEach((a) => { if (!a.classList.contains('outro-sistema')) { a.href = a.dataset.win; const t = a.querySelector('span'); if (t) t.textContent = 'Baixar para Windows'; } });
    })
    .catch(() => {});
})();
