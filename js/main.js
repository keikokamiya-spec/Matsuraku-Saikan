'use strict';

/* ==========================================================
   松楽菜館 — main.js
   ========================================================== */

// ----------------------------------------------------------
// 1. Header: scroll class + page-top visibility
// ----------------------------------------------------------
const header  = document.getElementById('header');
const pageTop = document.getElementById('pageTop');

const handleScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 8);
  pageTop.classList.toggle('is-visible', y > 400);
};
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// ----------------------------------------------------------
// 2. Hamburger / SP navigation
// ----------------------------------------------------------
const hamburger = document.getElementById('hamburger');
const spNav     = document.getElementById('spNav');
const spLinks   = spNav.querySelectorAll('.sp-nav__link');

const setMenuOpen = (open) => {
  hamburger.classList.toggle('is-open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  spNav.classList.toggle('is-open', open);
  spNav.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  hamburger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
};

hamburger.addEventListener('click', () => {
  setMenuOpen(!spNav.classList.contains('is-open'));
});

spLinks.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));

// ----------------------------------------------------------
// 3. Smooth scroll (nav links → offset for fixed header)
// ----------------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ----------------------------------------------------------
// 4. Scroll Reveal (IntersectionObserver)
// ----------------------------------------------------------
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    // Stagger siblings within same parent
    const parent = entry.target.parentElement;
    const siblings = Array.from(parent.querySelectorAll(':scope > .reveal'));
    const idx = siblings.indexOf(entry.target);
    const delay = idx * 100; // 100ms per sibling

    setTimeout(() => {
      entry.target.classList.add('is-visible');
    }, delay);

    revealObserver.unobserve(entry.target);
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -48px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

// ----------------------------------------------------------
// 5. Gallery Carousel
// ----------------------------------------------------------
(function initGallery() {
  const track   = document.getElementById('galleryTrack');
  const dotsWrap = document.getElementById('galleryDots');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.gallery__slide'));
  let current  = 0;

  // How many slides visible at once
  const perView = () => window.innerWidth < 768 ? 1 : 3;

  // Total number of "pages"
  const pageCount = () => Math.ceil(slides.length / perView());

  // Build dot buttons
  const buildDots = () => {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pageCount(); i++) {
      const dot = document.createElement('button');
      dot.className = 'gallery__dot' + (i === current ? ' is-active' : '');
      dot.setAttribute('aria-label', `スライド ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  };

  const updateDots = () => {
    dotsWrap.querySelectorAll('.gallery__dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
    });
  };

  const goTo = (index) => {
    const max = pageCount() - 1;
    current = Math.max(0, Math.min(index, max));

    // Calculate pixel offset
    const gap       = 16; // matches CSS gap
    const slideW    = slides[0].getBoundingClientRect().width;
    const offset    = current * perView() * (slideW + gap);

    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  };

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 44) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      current = 0;
      buildDots();
      goTo(0);
    }, 200);
  });

  // Init
  buildDots();
  goTo(0);
})();
