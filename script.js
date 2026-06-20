/* ============================================
   RHIZART — script.js
   Slider · Compteurs · Portfolio filtres
   AOS scroll · Burger · Navbar scroll
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ==========================================
     1. NAVBAR — scroll + burger mobile
     ========================================== */
  var navbar   = document.getElementById('navbar');
  var burger   = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  if (burger) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  document.addEventListener('click', function (e) {
    if (navLinks && navLinks.classList.contains('open')) {
      if (!navbar.contains(e.target)) {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
      }
    }
  });


  /* ==========================================
     2. HERO SLIDER
     ========================================== */
  var slides       = document.querySelectorAll('.slide');
  var dots         = document.querySelectorAll('.dot');
  var currentSlide = 0;
  var sliderTimer;

  function goToSlide(index) {
    slides.forEach(function (s) { s.classList.remove('active'); });
    dots.forEach(function (d)   { d.classList.remove('active'); });
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() { goToSlide((currentSlide + 1) % slides.length); }
  function startSlider() { sliderTimer = setInterval(nextSlide, 5500); }
  function stopSlider()  { clearInterval(sliderTimer); }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      stopSlider();
      goToSlide(parseInt(dot.getAttribute('data-index')));
      startSlider();
    });
  });

  var heroEl = document.querySelector('.hero');
  if (heroEl) {
    var touchX = 0;
    heroEl.addEventListener('touchstart', function (e) {
      touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    heroEl.addEventListener('touchend', function (e) {
      var diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        stopSlider();
        if (diff > 0) {
          goToSlide((currentSlide + 1) % slides.length);
        } else {
          goToSlide((currentSlide - 1 + slides.length) % slides.length);
        }
        startSlider();
      }
    }, { passive: true });
  }

  if (slides.length > 0) startSlider();


  /* ==========================================
     3. COMPTEURS ANIMÉS
     ========================================== */
  var statNums  = document.querySelectorAll('.stat-n[data-target]');
  var statsDone = false;

  function animateCounters() {
    if (statsDone) return;
    statsDone = true;
    statNums.forEach(function (el) {
      var target   = parseInt(el.getAttribute('data-target'), 10);
      var duration = 2000;
      var start    = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(step);
    });
  }

  if ('IntersectionObserver' in window && statNums.length > 0) {
    var statsBand = document.querySelector('.stats-band');
    if (statsBand) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCounters(); obs.disconnect(); }
        });
      }, { threshold: 0.4 }).observe(statsBand);
    }
  }


  /* ==========================================
     4. FILTRES PORTFOLIO
     ========================================== */
  var pfBtns  = document.querySelectorAll('.pf-btn');
  var pfItems = document.querySelectorAll('.pf-item');

  pfBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      pfBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      pfItems.forEach(function (item) {
        var cat = item.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'pfFadeIn 0.4s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  var styleTag = document.createElement('style');
  styleTag.textContent = '@keyframes pfFadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }';
  document.head.appendChild(styleTag);


  /* ==========================================
     5. AOS — animations au scroll
     ========================================== */
  var aosEls = document.querySelectorAll('[data-aos]');

  if ('IntersectionObserver' in window && aosEls.length > 0) {
    var aosObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('aos-visible');
          }, delay);
          aosObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    aosEls.forEach(function (el) { aosObs.observe(el); });
  } else {
    aosEls.forEach(function (el) { el.classList.add('aos-visible'); });
  }


  /* ==========================================
     6. SMOOTH SCROLL
     ========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        var offset = navbar ? navbar.offsetHeight + 20 : 80;
        var top    = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });


  /* ==========================================
     7. NAV ACTIVE au scroll
     ========================================== */
  var sections   = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveNav() {
    var pos = window.scrollY + (navbar ? navbar.offsetHeight : 0) + 80;
    sections.forEach(function (section) {
      var top    = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id     = section.getAttribute('id');
      var link   = document.querySelector('.nav-links a[href="#' + id + '"]');
      if (link) {
        if (pos >= top && pos < bottom) {
          navAnchors.forEach(function (a) {
            a.classList.remove('nav-active');
          });
          link.classList.add('nav-active');
        }
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });


  /* ==========================================
     8. LAZY LOAD images
     ========================================== */
  document.querySelectorAll('.pf-item img').forEach(function (img) {
    img.style.transition = 'opacity 0.4s ease';
    if (!img.complete) {
      img.style.opacity = '0';
      img.addEventListener('load', function () { img.style.opacity = '1'; });
    }
  });


  /* ==========================================
     9. CURSOR ROUGE — effet premium desktop
     ========================================== */
  if (window.matchMedia('(pointer: fine)').matches) {

    var cursor = document.createElement('div');
    cursor.style.cssText = [
      'position:fixed',
      'width:10px', 'height:10px',
      'background:#E31E24',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:9999',
      'transform:translate(-50%,-50%)',
      'transition:width 0.2s ease, height 0.2s ease, opacity 0.2s ease',
      'opacity:0',
      'mix-blend-mode:difference'
    ].join(';');
    document.body.appendChild(cursor);

    var ring = document.createElement('div');
    ring.style.cssText = [
      'position:fixed',
      'width:36px', 'height:36px',
      'border:1.5px solid rgba(227,30,36,0.5)',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:9998',
      'transform:translate(-50%,-50%)',
      'transition:left 0.08s ease, top 0.08s ease, width 0.25s ease, height 0.25s ease, opacity 0.2s ease',
      'opacity:0'
    ].join(';');
    document.body.appendChild(ring);

    document.addEventListener('mousemove', function (e) {
      cursor.style.left    = e.clientX + 'px';
      cursor.style.top     = e.clientY + 'px';
      cursor.style.opacity = '1';
      ring.style.left    = e.clientX + 'px';
      ring.style.top     = e.clientY + 'px';
      ring.style.opacity = '1';
    });

    document.querySelectorAll('a, button, .pf-item, .svc-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.style.width  = '16px';
        cursor.style.height = '16px';
        ring.style.width    = '52px';
        ring.style.height   = '52px';
      });
      el.addEventListener('mouseleave', function () {
        cursor.style.width  = '10px';
        cursor.style.height = '10px';
        ring.style.width    = '36px';
        ring.style.height   = '36px';
      });
    });

    document.addEventListener('mouseleave', function () {
      cursor.style.opacity = '0';
      ring.style.opacity   = '0';
    });
  }

}); /* fin DOMContentLoaded */