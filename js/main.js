/* =========================================================
   VIP ПОДПИСКА 3X — main.js
   ========================================================= */
(function(){
  'use strict';

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  /* Герой — показываем сразу, не ждём скролл */
  document.querySelectorAll('.hero .reveal').forEach(el => {
    setTimeout(() => el.classList.add('in'), 80);
  });

  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => {
      /* Героевские уже обработаны выше */
      if (!el.closest('.hero')) io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Reviews carousel ---------- */
  const track = document.getElementById('reviewsTrack');
  const carBtns = document.querySelectorAll('.car-btn');
  if (track && carBtns.length){
    carBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = parseInt(btn.getAttribute('data-dir'), 10) || 1;
        const item = track.querySelector('.review-item');
        const step = item ? (item.getBoundingClientRect().width + 18) * 2 : 400;
        track.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- Countdown to June 3 (promo deadline) ---------- */
  function getDeadline(){
    const now = new Date();
    let year = now.getFullYear();
    let dl = new Date(Date.UTC(year, 5, 3, 23 - 5, 59, 59));
    if (dl.getTime() <= now.getTime()){
      dl = new Date(Date.UTC(year + 1, 5, 3, 23 - 5, 59, 59));
    }
    return dl;
  }
  const cdEls = {
    days:  document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    mins:  document.querySelector('[data-cd="mins"]'),
    secs:  document.querySelector('[data-cd="secs"]')
  };
  if (cdEls.days){
    const deadline = getDeadline();
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      let diff = deadline.getTime() - Date.now();
      if (diff < 0) diff = 0;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      cdEls.days.textContent  = pad(d);
      cdEls.hours.textContent = pad(h);
      cdEls.mins.textContent  = pad(m);
      cdEls.secs.textContent  = pad(s);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Add page-loaded class for first-paint animation ---------- */
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

  /* ---------- Gallery Slider ---------- */
  const gsTrack    = document.getElementById('gsTrack');
  const gsBtnPrev  = document.getElementById('gsPrev');
  const gsBtnNext  = document.getElementById('gsNext');
  const gsDotsWrap = document.getElementById('gsDots');

  if (gsTrack && gsBtnPrev && gsBtnNext && gsDotsWrap){
    const gsSlides = gsTrack.querySelectorAll('.gs-slide');
    const gsTotal  = gsSlides.length;
    let gsCurrent  = 0;

    /* Всегда ровно gsTotal позиций — одна на каждый слайд */
    function gsMaxIdx(){
      return gsTotal - 1;
    }

    /* Ширина одного слайда + gap */
    function gsGetSlideWidth(){
      return gsSlides[0].getBoundingClientRect().width + 20;
    }

    /* Создаём dots — ровно по числу слайдов */
    function gsBuildDots(){
      gsDotsWrap.innerHTML = '';
      for (let i = 0; i < gsTotal; i++){
        const d = document.createElement('button');
        d.className = 'gs-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Слайд ' + (i + 1));
        d.addEventListener('click', () => gsGoTo(i));
        gsDotsWrap.appendChild(d);
      }
    }

    function gsGoTo(idx){
      const max = gsMaxIdx();
      /* Зацикливание: после последнего — в начало, и наоборот */
      if (idx > max) idx = 0;
      if (idx < 0)   idx = max;
      gsCurrent = idx;
      gsTrack.style.transform = 'translateX(-' + (gsCurrent * gsGetSlideWidth()) + 'px)';
      gsDotsWrap.querySelectorAll('.gs-dot').forEach((d, i) =>
        d.classList.toggle('active', i === gsCurrent)
      );
    }

    gsBuildDots();

    gsBtnPrev.addEventListener('click', () => gsGoTo(gsCurrent - 1));
    gsBtnNext.addEventListener('click', () => gsGoTo(gsCurrent + 1));

    /* Auto-play */
    let gsTimer = setInterval(() => gsGoTo(gsCurrent + 1), 4000);
    gsTrack.parentElement.addEventListener('mouseenter', () => clearInterval(gsTimer));
    gsTrack.parentElement.addEventListener('mouseleave', () => {
      gsTimer = setInterval(() => gsGoTo(gsCurrent + 1), 4000);
    });

    /* Touch swipe */
    let gsStartX = 0;
    gsTrack.addEventListener('touchstart', e => { gsStartX = e.touches[0].clientX; }, { passive: true });
    gsTrack.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - gsStartX;
      if (Math.abs(dx) > 40) gsGoTo(gsCurrent + (dx < 0 ? 1 : -1));
    });

    /* Пересчёт при ресайзе */
    window.addEventListener('resize', () => {
      gsBuildDots();
      gsGoTo(0);
    });
  }

})();
