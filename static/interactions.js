/* ==========================================================================
   DUT-China · iGEM 2026 — interactions.js
   Self-hosted vanilla JS (no dependencies, no CDN).
   Progressive enhancement only:
   - without JS the page is fully readable (the inline <head> script adds
     "js" to <html>, and reveal hiding is gated on html.js);
   - prefers-reduced-motion disables motion (reveal/count-up snap to final).
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* 1. Reveal on scroll — [data-reveal] elements fade/rise into view */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion || !hasIO) {
      for (var i = 0; i < revealEls.length; i++) revealEls[i].classList.add('is-visible');
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* 2. TOC scrollspy — highlight the .page-toc chip of the visible section */
  var toc = document.querySelector('.page-toc');
  if (toc) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    var sections = links
      .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
      .filter(Boolean);
    var setActive = function (id) {
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    if (!reduceMotion && hasIO && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* 3. Navbar scrolled state — stronger shadow once the page scrolls */
  var nav = document.querySelector('.navbar');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* 4. Stat count-up — .stat-value[data-count] animates when visible
        (ready for future results/data pages) */
  var stats = document.querySelectorAll('.stat-value[data-count]');
  if (stats.length) {
    var animateStat = function (el) {
      var raw = el.getAttribute('data-count') || '0';
      var target = parseFloat(raw);
      var decimals = (raw.split('.')[1] || '').length;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var dur = 900;
      var start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!hasIO) {
      stats.forEach(animateStat);
    } else {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            sio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      stats.forEach(function (el) { sio.observe(el); });
    }
  }
})();
