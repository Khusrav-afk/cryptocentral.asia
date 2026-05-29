/* =========================================================
   VIP ПОДПИСКА 3X — main.js
   ========================================================= */
(function(){
  'use strict';

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  function showVisible(){
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60){
        el.classList.add('in');
      }
    });
  }

  /* Показываем сразу всё что в viewport */
  showVisible();

  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => {
      if (!el.classList.contains('in')) io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  window.addEventListener('scroll', showVisible, { passive: true });

  /* ---------- Reviews carousel ---------- */
  const reviewsTrack = document.getElementById('reviewsTrack');
  const carBtns = document.querySelectorAll('.car-btn');
  if (reviewsTrack && carBtns.length){
    carBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = parseInt(btn.getAttribute('data-dir'), 10) || 1;
        const item = reviewsTrack.querySelector('.review-item');
        const step = item ? (item.getBoundingClientRect().width + 18) * 2 : 400;
        reviewsTrack.scrollBy({ left: dir * step, behavior: 'smooth' });
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
    let dl = new Date(Date.UTC(year, 5, 3, 18, 59, 59));
    if (dl.getTime() <= now.getTime()){
      dl = new Date(Date.UTC(year + 1, 5, 3, 18, 59, 59));
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
      cdEls.days.textContent  = pad(Math.floor(diff / 86400000));
      cdEls.hours.textContent = pad(Math.floor((diff / 3600000) % 24));
      cdEls.mins.textContent  = pad(Math.floor((diff / 60000) % 60));
      cdEls.secs.textContent  = pad(Math.floor((diff / 1000) % 60));
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Page loaded ---------- */
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    showVisible();
  });

  /* ---------- Gallery Slider — infinite loop ---------- */
  (function(){
    var gsTrack    = document.getElementById('gsTrack');
    var gsBtnPrev  = document.getElementById('gsPrev');
    var gsBtnNext  = document.getElementById('gsNext');
    var gsDotsWrap = document.getElementById('gsDots');

    if (!gsTrack || !gsBtnPrev || !gsBtnNext || !gsDotsWrap) return;

    /* Собираем оригинальные слайды */
    var origSlides = Array.from(gsTrack.querySelectorAll('.gs-slide'));
    var total = origSlides.length;
    if (total === 0) return;

    var current = 0; /* логический индекс 0..total-1 */
    var isAnimating = false;

    /* ---------- Клонирование для бесшовного цикла ---------- */
    /* Клонируем все слайды в конец и в начало */
    origSlides.forEach(function(s){
      var c = s.cloneNode(true);
      c.classList.add('gs-clone');
      gsTrack.appendChild(c);
    });
    origSlides.slice().reverse().forEach(function(s){
      var c = s.cloneNode(true);
      c.classList.add('gs-clone');
      gsTrack.insertBefore(c, gsTrack.firstChild);
    });

    /* Все слайды после клонирования: [клоны конца] [оригиналы] [клоны начала] */
    var allSlides = function(){ return gsTrack.querySelectorAll('.gs-slide'); };

    /* ---------- Ширина слайда ---------- */
    function slideW(){
      var s = allSlides()[0];
      if (!s) return 0;
      return s.getBoundingClientRect().width + 20;
    }

    /* ---------- Позиция трека ---------- */
    /* Реальный индекс в массиве allSlides = current + total (сдвиг на клоны) */
    function realIdx(){
      return current + total;
    }

    function moveTo(animate){
      gsTrack.style.transition = animate
        ? 'transform 0.55s cubic-bezier(0.22,1,0.36,1)'
        : 'none';
      gsTrack.style.transform = 'translateX(-' + (realIdx() * slideW()) + 'px)';
    }

    /* ---------- Dots ---------- */
    function buildDots(){
      gsDotsWrap.innerHTML = '';
      for (var i = 0; i < total; i++){
        (function(idx){
          var d = document.createElement('button');
          d.className = 'gs-dot' + (idx === 0 ? ' active' : '');
          d.setAttribute('aria-label', 'Слайд ' + (idx + 1));
          d.addEventListener('click', function(){
            if (isAnimating) return;
            current = idx;
            moveTo(true);
            updateDots();
          });
          gsDotsWrap.appendChild(d);
        })(i);
      }
    }

    function updateDots(){
      var dots = gsDotsWrap.querySelectorAll('.gs-dot');
      dots.forEach(function(d, i){
        d.classList.toggle('active', i === current);
      });
    }

    /* ---------- Переход ---------- */
    function goTo(dir){
      if (isAnimating) return;
      isAnimating = true;
      current += dir;
      moveTo(true);
      updateDots();
    }

    /* После анимации — бесшовный прыжок если вышли за пределы */
    gsTrack.addEventListener('transitionend', function(){
      isAnimating = false;
      if (current < 0){
        current = total - 1;
        moveTo(false);
        updateDots();
      } else if (current >= total){
        current = 0;
        moveTo(false);
        updateDots();
      }
    });

    /* ---------- Инициализация ---------- */
    buildDots();
    /* Ставим без анимации на первый реальный слайд */
    window.addEventListener('load', function(){
      moveTo(false);
    });
    /* Запасной вариант если load уже сработал */
    setTimeout(function(){ moveTo(false); }, 0);

    /* ---------- Кнопки ---------- */
    gsBtnPrev.addEventListener('click', function(){ goTo(-1); });
    gsBtnNext.addEventListener('click', function(){ goTo(1); });

    /* ---------- Auto-play ---------- */
    var timer = setInterval(function(){ goTo(1); }, 4000);
    gsTrack.parentElement.addEventListener('mouseenter', function(){ clearInterval(timer); });
    gsTrack.parentElement.addEventListener('mouseleave', function(){
      timer = setInterval(function(){ goTo(1); }, 4000);
    });

    /* ---------- Touch ---------- */
    var startX = 0;
    gsTrack.addEventListener('touchstart', function(e){
      startX = e.touches[0].clientX;
    }, { passive: true });
    gsTrack.addEventListener('touchend', function(e){
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? 1 : -1);
    });

    /* ---------- Resize ---------- */
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function(){ moveTo(false); }, 150);
    });

  })();

})();
