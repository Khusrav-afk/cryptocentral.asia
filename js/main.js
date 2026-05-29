Нужно добавить клонирование слайдов для бесшовного зацикливания. Вот полный `main.js`:

```js
/* =========================================================
   VIP ПОДПИСКА 3X — main.js
   ========================================================= */
(function(){
  'use strict';

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  /* Герой — показываем сразу */
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

  /* ---------- Smooth scroll ---------- */
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

  /* ---------- Countdown ---------- */
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

  /* ---------- Page loaded ---------- */
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

  /* ---------- Gallery Slider — infinite loop ---------- */
  const gsTrack    = document.getElementById('gsTrack');
  const gsBtnPrev  = document.getElementById('gsPrev');
  const gsBtnNext  = document.getElementById('gsNext');
  const gsDotsWrap = document.getElementById('gsDots');

  if (gsTrack && gsBtnPrev && gsBtnNext && gsDotsWrap){

    /* Оригинальные слайды (только реальные, без клонов) */
    const gsOrigSlides = Array.from(gsTrack.querySelectorAll('.gs-slide'));
    const gsTotal = gsOrigSlides.length; /* 5 */
    let gsVis  = 3;   /* сколько слайдов видно */
    let gsPos  = 0;   /* текущий trackIndex */
    let gsLock = false;

    /* Сколько слайдов видно в зависимости от ширины */
    function gsGetVis(){
      if (window.innerWidth <= 700)  return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    /* Ширина одного слайда + gap */
    function gsSlideW(){
      const s = gsTrack.querySelector('.gs-slide');
      return s ? s.getBoundingClientRect().width + 20 : 0;
    }

    /* Удалить старые клоны, добавить новые */
    function gsSetupClones(){
      gsTrack.querySelectorAll('.gs-clone').forEach(c => c.remove());

      const vis = gsGetVis();

      /* Prepend: клоны последних vis слайдов */
      const pre = gsOrigSlides.slice(-vis).map(s => {
        const c = s.cloneNode(true);
        c.classList.add('gs-clone');
        return c;
      });
      pre.reverse().forEach(c => gsTrack.insertBefore(c, gsTrack.firstChild));

      /* Append: клоны первых vis слайдов */
      const app = gsOrigSlides.slice(0, vis).map(s => {
        const c = s.cloneNode(true);
        c.classList.add('gs-clone');
        return c;
      });
      app.forEach(c => gsTrack.appendChild(c));

      return vis;
    }

    /* Логический индекс (0–4) */
    function gsLogical(){
      return ((gsPos - gsVis) % gsTotal + gsTotal) % gsTotal;
    }

    /* Переместить трек */
    function gsMove(animate){
      gsTrack.style.transition = animate
        ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
        : 'none';
      gsTrack.style.transform  = 'translateX(-' + (gsPos * gsSlideW()) + 'px)';
    }

    /* Обновить точки */
    function gsUpdateDots(){
      const log = gsLogical();
      gsDotsWrap.querySelectorAll('.gs-dot').forEach((d, i) =>
        d.classList.toggle('active', i === log)
      );
    }

    /* Построить точки */
    function gsBuildDots(){
      gsDotsWrap.innerHTML = '';
      for (let i = 0; i < gsTotal; i++){
        const d = document.createElement('button');
        d.className = 'gs-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Слайд ' + (i + 1));
        d.addEventListener('click', () => {
          if (gsLock) return;
          gsPos = i + gsVis;
          gsMove(true);
          gsUpdateDots();
        });
        gsDotsWrap.appendChild(d);
      }
    }

    /* Переход на +1 или -1 */
    function gsGoTo(dir){
      if (gsLock) return;
      gsLock = true;
      gsPos += dir;
      gsMove(true);
      gsUpdateDots();
    }

    /* После анимации: если вышли за пределы — бесшовный прыжок */
    gsTrack.addEventListener('transitionend', () => {
      gsLock = false;
      if (gsPos < gsVis){
        /* Прошли назад за начало → прыгаем к концу */
        gsPos += gsTotal;
        gsMove(false);
      } else if (gsPos >= gsVis + gsTotal){
        /* Прошли вперёд за конец → прыгаем к началу */
        gsPos -= gsTotal;
        gsMove(false);
      }
    });

    /* Инициализация */
    function gsInit(){
      gsVis = gsSetupClones();
      gsPos = gsVis; /* начинаем с первого реального слайда */
      gsMove(false);
      gsBuildDots();
    }

    gsInit();

    gsBtnPrev.addEventListener('click', () => gsGoTo(-1));
    gsBtnNext.addEventListener('click', () => gsGoTo(1));

    /* Auto-play */
    let gsTimer = setInterval(() => gsGoTo(1), 4000);
    gsTrack.parentElement.addEventListener('mouseenter', () => clearInterval(gsTimer));
    gsTrack.parentElement.addEventListener('mouseleave', () => {
      gsTimer = setInterval(() => gsGoTo(1), 4000);
    });

    /* Touch swipe */
    let gsStartX = 0;
    gsTrack.addEventListener('touchstart', e => {
      gsStartX = e.touches[0].clientX;
    }, { passive: true });
    gsTrack.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - gsStartX;
      if (Math.abs(dx) > 40) gsGoTo(dx < 0 ? 1 : -1);
    });

    /* Resize */
    let gsResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(gsResizeTimer);
      gsResizeTimer = setTimeout(() => {
        const log = gsLogical();
        gsVis = gsSetupClones();
        gsPos = log + gsVis;
        gsMove(false);
        gsBuildDots();
        gsUpdateDots();
      }, 150);
    });
  }

})();
```
