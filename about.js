/* ============================================
   RHIZART — about.js
   Compteurs animés + lazy load équipe
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ==========================================
     1. COMPTEURS ANIMÉS — section chiffres
     ========================================== */
  var numEls  = document.querySelectorAll('.number-n[data-target]');
  var numDone = false;

  function animateNumbers() {
    if (numDone) return;
    numDone = true;

    numEls.forEach(function (el) {
      var target   = parseInt(el.getAttribute('data-target'), 10);
      var duration = 2200;
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

  if ('IntersectionObserver' in window && numEls.length > 0) {
    var numSection = document.querySelector('.numbers-section');
    if (numSection) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateNumbers();
            obs.disconnect();
          }
        });
      }, { threshold: 0.4 }).observe(numSection);
    }
  }


  /* ==========================================
     2. LAZY LOAD — images équipe & histoire
     ========================================== */
  var lazyImgs = document.querySelectorAll(
    '.team-img img, .story-img-main img, .story-img-accent img, .about-hero-bg'
  );

  if ('IntersectionObserver' in window) {
    var imgObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;

        if (el.tagName === 'IMG') {
          if (el.dataset.src) {
            el.src = el.dataset.src;
            el.addEventListener('load', function () {
              el.style.opacity = '1';
            });
          } else {
            el.style.opacity = '1';
          }
        }
        imgObs.unobserve(el);
      });
    }, { threshold: 0.1 });

    lazyImgs.forEach(function (img) {
      if (img.tagName === 'IMG') {
        img.style.opacity    = '0';
        img.style.transition = 'opacity 0.5s ease';
        if (img.src && !img.dataset.src) {
          img.dataset.src = img.getAttribute('src');
        }
      }
      imgObs.observe(img);
    });
  } else {
    /* Fallback */
    lazyImgs.forEach(function (img) {
      if (img.tagName === 'IMG' && img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  }


  /* ==========================================
     3. AOS — animations au scroll
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    aosEls.forEach(function (el) { aosObs.observe(el); });
  } else {
    aosEls.forEach(function (el) { el.classList.add('aos-visible'); });
  }

}); /* fin DOMContentLoaded */