(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------------- custom cursor ---------------- */
  if (!isTouch) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
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
  const WEB3FORMS_ACCESS_KEY = 'dcaa9ff8-84f2-4025-8874-40c07a0af324';

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
