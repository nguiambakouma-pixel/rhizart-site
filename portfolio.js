/* ============================================
   RHIZART — portfolio.js
   Filtres · Vue grille/liste · Lightbox
   Navigation clavier · Swipe mobile
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ==========================================
     DONNÉES DES ITEMS (pour la lightbox)
     ========================================== */
  var items = Array.from(document.querySelectorAll('.pf-item'));

  function getItemData(item) {
    var img     = item.querySelector('img');
    var tag     = item.querySelector('.pf-tag');
    var title   = item.querySelector('h3');
    var desc    = item.querySelector('.pf-overlay-content > p');
    var link    = item.querySelector('.pf-detail-btn');
    return {
      img   : img   ? img.getAttribute('src') || img.getAttribute('data-src') || '' : '',
      alt   : img   ? img.getAttribute('alt') || '' : '',
      tag   : tag   ? tag.textContent : '',
      title : title ? title.textContent : '',
      desc  : desc  ? desc.textContent : '',
      link  : link  ? link.getAttribute('href') : '#'
    };
  }


  /* ==========================================
     1. LAZY LOAD IMAGES
     ========================================== */
  if ('IntersectionObserver' in window) {
    var imgObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target.querySelector('img');
        if (!img) return;
        if (img.dataset.src) img.src = img.dataset.src;
        img.addEventListener('load',  function () { img.classList.add('loaded'); });
        img.addEventListener('error', function () { img.classList.add('loaded'); });
        if (img.complete) img.classList.add('loaded');
        imgObs.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    items.forEach(function (item) {
      var img = item.querySelector('img');
      if (img && !img.dataset.src) {
        img.dataset.src = img.getAttribute('src');
        img.removeAttribute('src');
      }
      imgObs.observe(item);
    });
  } else {
    items.forEach(function (item) {
      var img = item.querySelector('img');
      if (img) { img.src = img.dataset.src || img.src; img.classList.add('loaded'); }
    });
  }


  /* ==========================================
     2. FILTRES
     ========================================== */
  var filterBtns = document.querySelectorAll('.pf-btn');
  var currentFilter = 'all';

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      applyFilter();
    });
  });

  function applyFilter() {
    var visibleCount = 0;
    items.forEach(function (item) {
      var cat = item.getAttribute('data-cat');
      var show = currentFilter === 'all' || cat === currentFilter;
      if (show) {
        item.classList.remove('hidden');
        item.style.animation = 'pfItemIn 0.35s ease forwards';
        visibleCount++;
      } else {
        item.classList.add('hidden');
      }
    });

    var noResults = document.getElementById('noResults');
    if (noResults) noResults.style.display = visibleCount === 0 ? 'flex' : 'none';
  }

  /* Animation CSS items */
  var styleTag = document.createElement('style');
  styleTag.textContent = '@keyframes pfItemIn { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }';
  document.head.appendChild(styleTag);

  /* Reset filtres */
  var resetBtn = document.getElementById('resetFilter');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      currentFilter = 'all';
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      var allBtn = document.querySelector('.pf-btn[data-filter="all"]');
      if (allBtn) allBtn.classList.add('active');
      applyFilter();
    });
  }


  /* ==========================================
     3. VUE GRILLE / LISTE
     ========================================== */
  var grid     = document.getElementById('portfolioGrid');
  var btnGrid  = document.getElementById('viewGrid');
  var btnList  = document.getElementById('viewList');
  var isGrid   = true;

  if (btnGrid) {
    btnGrid.addEventListener('click', function () {
      if (isGrid) return;
      isGrid = true;
      grid.classList.remove('list-view');
      btnGrid.classList.add('active');
      btnList.classList.remove('active');
    });
  }

  if (btnList) {
    btnList.addEventListener('click', function () {
      if (!isGrid) return;
      isGrid = false;
      grid.classList.add('list-view');
      btnList.classList.add('active');
      btnGrid.classList.remove('active');
    });
  }


  /* ==========================================
     4. LIGHTBOX
     ========================================== */
  var lightbox      = document.getElementById('lightbox');
  var lbOverlay     = document.getElementById('lightboxOverlay');
  var lbClose       = document.getElementById('lightboxClose');
  var lbPrev        = document.getElementById('lightboxPrev');
  var lbNext        = document.getElementById('lightboxNext');
  var lbImg         = document.getElementById('lightboxImg');
  var lbLoader      = document.getElementById('lightboxLoader');
  var lbTag         = document.getElementById('lightboxTag');
  var lbTitle       = document.getElementById('lightboxTitle');
  var lbDesc        = document.getElementById('lightboxDesc');
  var lbLink        = document.getElementById('lightboxLink');
  var currentLbIndex = 0;

  function getVisibleItems() {
    return items.filter(function (item) {
      return !item.classList.contains('hidden');
    });
  }

  function openLightbox(index) {
    var visible = getVisibleItems();
    if (!visible[index]) return;
    currentLbIndex = index;
    var data = getItemData(visible[index]);

    /* Loader */
    if (lbLoader) lbLoader.style.display = 'block';
    if (lbImg)    lbImg.style.opacity    = '0';

    /* Infos */
    if (lbTag)   lbTag.textContent   = data.tag;
    if (lbTitle) lbTitle.textContent = data.title;
    if (lbDesc)  lbDesc.textContent  = data.desc;
    if (lbLink)  lbLink.href         = data.link;

    /* Image */
    if (lbImg) {
      var newImg = new Image();
      newImg.onload = function () {
        lbImg.src = data.img;
        lbImg.alt = data.alt;
        lbImg.style.opacity = '1';
        if (lbLoader) lbLoader.style.display = 'none';
      };
      newImg.onerror = function () {
        if (lbLoader) lbLoader.style.display = 'none';
      };
      newImg.src = data.img;
    }

    /* Nav */
    if (lbPrev) lbPrev.style.opacity = index > 0 ? '1' : '0.3';
    if (lbNext) lbNext.style.opacity = index < visible.length - 1 ? '1' : '0.3';

    lightbox.style.display = 'flex';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prevItem() {
    var visible = getVisibleItems();
    if (currentLbIndex > 0) openLightbox(currentLbIndex - 1);
  }

  function nextItem() {
    var visible = getVisibleItems();
    if (currentLbIndex < visible.length - 1) openLightbox(currentLbIndex + 1);
  }

  /* Ouvrir via bouton zoom */
  document.querySelectorAll('.pf-zoom-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var item    = btn.closest('.pf-item');
      var visible = getVisibleItems();
      var index   = visible.indexOf(item);
      if (index !== -1) openLightbox(index);
    });
  });

  /* Ouvrir au clic sur l'image */
  items.forEach(function (item) {
    item.addEventListener('click', function (e) {
      if (e.target.closest('.pf-detail-btn') || e.target.closest('.pf-zoom-btn')) return;
      var visible = getVisibleItems();
      var index   = visible.indexOf(item);
      if (index !== -1) openLightbox(index);
    });
  });

  /* Fermer */
  if (lbClose)   lbClose.addEventListener('click', closeLightbox);
  if (lbOverlay) lbOverlay.addEventListener('click', closeLightbox);
  if (lbPrev)    lbPrev.addEventListener('click', prevItem);
  if (lbNext)    lbNext.addEventListener('click', nextItem);

  /* Navigation clavier */
  document.addEventListener('keydown', function (e) {
    if (lightbox.style.display === 'none') return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevItem();
    if (e.key === 'ArrowRight')  nextItem();
  });

  /* Swipe tactile lightbox */
  var lbTouchX = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', function (e) {
      lbTouchX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      var diff = lbTouchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextItem();
        else          prevItem();
      }
    }, { passive: true });
  }


  /* ==========================================
     5. MISE À JOUR COMPTEURS FILTRES
     ========================================== */
  function updateCounts() {
    var cats = ['branding', 'print', 'motion', 'illustration', 'social'];
    var allEl = document.getElementById('cnt-all');
    if (allEl) allEl.textContent = items.length;

    cats.forEach(function (cat) {
      var el = document.getElementById('cnt-' + cat);
      if (!el) return;
      var count = items.filter(function (item) {
        return item.getAttribute('data-cat') === cat;
      }).length;
      el.textContent = count;
    });
  }

  updateCounts();


  /* ==========================================
     6. INIT
     ========================================== */
  applyFilter();

}); /* fin DOMContentLoaded */