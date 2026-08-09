(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* =========================================================
     EMPRESAS PARCEIRAS — edite só esta lista para manter a seção.

     Só aparecem na esteira as empresas que tiverem o campo "logo" preenchido,
     apontando pra uma imagem dentro de assets/ (ex: assets/partners/aurora.png).
     Empresas sem "logo" ficam de fora automaticamente — assim não aparece
     nenhum selo vazio ou com texto no lugar da logo.

     Para ADICIONAR uma empresa: acrescente um objeto com name + logo.
     Para REMOVER: apague o objeto correspondente (ou só o campo "logo",
     se quiser guardar o nome pra usar depois).
     ========================================================= */
  const PARTNER_COMPANIES = [
    {name: 'Santander', logo: 'assets/partners/santander.webp'},
    {name: 'Montreal', logo: 'assets/partners/montreal.png'},
    {name: 'Supermecado MIX', logo: 'assets/partners/mix.png'},
    {name: 'Cushman & Wakefield', logo: 'assets/partners/cushman_wakefield.webp'},
    {name: 'Nasce', logo: 'assets/partners/nasce.png'},

    // { name: 'Edifício Aurora', logo: 'assets/partners/aurora.png' },
    // adicione novas empresas aqui, sempre com o campo "logo" preenchido
  ];

  const partnersTrack = document.getElementById('partnersTrack');
  if (partnersTrack) {
    const buildChip = (company) => {
      const chip = document.createElement('div');
      chip.className = 'partner-chip';
      chip.title = company.name;
      const img = document.createElement('img');
      img.src = company.logo;
      img.alt = company.name;
      chip.appendChild(img);
      return chip;
    };

    // só entram na esteira as empresas que já têm uma logo cadastrada
    const companiesWithLogo = PARTNER_COMPANIES.filter((c) => c.logo);

    if (companiesWithLogo.length) {
      const PIXELS_PER_SECOND = 40; // velocidade constante da esteira, não importa quantos parceiros existam

      // renderiza um conjunto único primeiro, só para medir a largura real (com fontes/imagens carregadas)
      companiesWithLogo.forEach((c) => partnersTrack.appendChild(buildChip(c)));

      const buildSeamlessLoop = () => {
        const viewport = partnersTrack.parentElement;
        const unitWidth = partnersTrack.scrollWidth;
        const viewportWidth = viewport ? viewport.offsetWidth : window.innerWidth;

        if (!unitWidth) return; // imagens ainda não carregaram — tenta de novo depois

        // quantas cópias do conjunto cabem (+1 de folga) para nunca sobrar buraco na tela
        const repeats = Math.max(2, Math.ceil(viewportWidth / unitWidth) + 1);

        partnersTrack.innerHTML = '';
        for (let i = 0; i < repeats * 2; i++) { // x2: um bloco "real" + um bloco duplicado para o loop sem costura
          companiesWithLogo.forEach((c) => partnersTrack.appendChild(buildChip(c)));
        }

        const halfWidth = partnersTrack.scrollWidth / 2;
        partnersTrack.style.setProperty('--partners-duration', `${halfWidth / PIXELS_PER_SECOND}s`);
      };

      // espera as imagens carregarem para medir a largura corretamente antes de montar o loop final
      const images = Array.from(partnersTrack.querySelectorAll('img'));
      Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((res) => {
        img.addEventListener('load', res, { once: true });
        img.addEventListener('error', res, { once: true });
      }))).then(() => requestAnimationFrame(buildSeamlessLoop));

      // recalcula se a janela for redimensionada (ex: virar o celular, maximizar a janela)
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(buildSeamlessLoop, 200);
      });
    }
  }

  /* ---------------- custom cursor ---------------- */
  if (!isTouch) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    let hasPosition = false;

    const activateCursor = (x, y) => {
      mouseX = x; mouseY = y;
      ringX = x; ringY = y; // evita o "voo" do anel a partir do canto (0,0) na primeira vez
      if (!hasPosition) {
        hasPosition = true;
        dot.classList.add('is-active');
        ring.classList.add('is-active');
        document.body.classList.add('cursor-ready'); // só esconde o cursor nativo aqui
      }
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    };

    window.addEventListener('mousemove', (e) => activateCursor(e.clientX, e.clientY));

    // se o mouse já estiver sobre a página no load (sem disparar mousemove),
    // isso garante que o cursor apareça na posição certa assim que possível
    window.addEventListener('pointerenter', (e) => activateCursor(e.clientX, e.clientY));

    function animateRing() {
      if (hasPosition) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      }
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('[data-cursor="link"]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-link'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-link'));
    });
    document.querySelectorAll('[data-cursor="card"]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-card'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-card'));
    });
  } else {
    document.getElementById('cursorDot')?.remove();
    document.getElementById('cursorRing')?.remove();
  }

  /* ---------------- header shrink on scroll ---------------- */
  const header = document.getElementById('siteHeader');
  const onScrollHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------------- scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.style.getPropertyValue('--d');
          if (delay) entry.target.style.transitionDelay = `${parseFloat(delay) * 0.08}s`;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------------- shaft guide-rail (scroll progress car) ---------------- */
  const rail = document.getElementById('rail');
  const railCar = document.getElementById('railCar');
  if (rail && railCar) {
    const updateRail = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      const railHeight = rail.offsetHeight;
      railCar.style.top = `${progress * railHeight}px`;
    };
    updateRail();
    window.addEventListener('scroll', updateRail, { passive: true });
    window.addEventListener('resize', updateRail);
  }

  /* ---------------- hero floor indicator animation ---------------- */
  const fdDigit = document.getElementById('fdDigit');
  const fdArrow = document.getElementById('fdArrow');
  if (fdDigit) {
    const floors = ['T', '1', '2', '3', '4', '5'];
    let i = 0;

    if (prefersReducedMotion) {
      fdDigit.textContent = '5';
    } else {
      const step = () => {
        i = (i + 1) % floors.length;
        fdDigit.textContent = floors[i];
        if (i !== floors.length - 1) {
          setTimeout(step, 650);
        } else {
          // hold on top floor briefly, then restart the ascent
          setTimeout(() => { i = -1; step(); }, 2200);
        }
      };
      setTimeout(step, 900);
    }
  }

  /* ---------------- contact form -> envia por e-mail via Web3Forms ---------------- */
  // 1) Crie uma chave grátis em https://web3forms.com (sem login, só informe o e-mail de destino)
  // 2) Cole a Access Key recebida abaixo, no lugar de 'COLE_SUA_ACCESS_KEY_AQUI'
  const WEB3FORMS_ACCESS_KEY = 'COLE_SUA_ACCESS_KEY_AQUI';

  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nome = form.nome.value.trim();
      const telefone = form.telefone.value.trim();
      const mensagem = form.mensagem.value.trim();

      if (!nome || !telefone || !mensagem) {
        note.textContent = 'Preencha nome, telefone e mensagem antes de enviar.';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      note.textContent = 'Enviando…';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: 'Novo contato pelo site — Dantas Elevadores',
            from_name: 'Site Dantas Elevadores',
            nome,
            telefone,
            mensagem
          })
        });

        const result = await response.json();

        if (result.success) {
          note.textContent = 'Mensagem enviada! Em breve entraremos em contato.';
          form.reset();
        } else {
          note.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
        }
      } catch (err) {
        note.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente de novo.';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ---------------- footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
