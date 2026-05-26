/* =========================================================
   VIP ПОДПИСКА 3X — main.js
   ========================================================= */

(function(){
  'use strict';

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
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
  /* Если акция уже завершилась, скрипт автоматически возьмёт
     следующий год — чтобы при повторном использовании страницы
     счётчик не показывал «прошедшее». */
  function getDeadline(){
    const now = new Date();
    let year = now.getFullYear();
    // Дедлайн: 3 июня 23:59:59 по времени Алматы (UTC+5)
    let dl = new Date(Date.UTC(year, 5, 3, 23 - 5, 59, 59)); // месяц 5 = июнь
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

})();
