/* ============================================
   RHIZART — cms-loader.js  v2
   Lit projects.json via jsdelivr (zéro limite API)
   Génère les cartes avec le style card v2
   ============================================ */

var JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/nguiambakouma-pixel/rhizart-site@main/';
var JSON_URL      = JSDELIVR_BASE + 'projects.json';
var IMG_BASE      = JSDELIVR_BASE;

/* ==========================================
   UTILITAIRES
   ========================================== */
function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return IMG_BASE + path.replace(/^\//, '');
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatCat(cat) {
  var map = {
    'branding'     : 'Branding',
    'print'        : 'Print',
    'motion'       : 'Motion Design',
    'illustration' : 'Illustration',
    'social'       : 'Social Media',
    'packaging'    : 'Packaging'
  };
  return map[cat] || cat;
}

/* ==========================================
   STYLES INJECTÉS (loader, empty, spin)
   ========================================== */
(function injectStyles() {
  var style = document.createElement('style');
  style.textContent = [
    '.cms-loading{display:flex;flex-direction:column;align-items:center;gap:1rem;',
    'padding:4rem 2rem;color:rgba(255,255,255,.3);grid-column:1/-1;}',
    '.cms-loading p{font-size:.9rem;}',
    '.cms-empty{text-align:center;padding:3rem;color:rgba(255,255,255,.3);',
    'grid-column:1/-1;font-size:.9rem;}',
    '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '.spin{animation:spin .8s linear infinite;}',
    '@keyframes pfItemIn{from{opacity:0;transform:scale(.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}'
  ].join('');
  document.head.appendChild(style);
})();

/* ==========================================
   CHARGER projects.json via jsdelivr
   ========================================== */
function fetchProjects() {
  /* Cache-buster par heure pour jsdelivr (TTL 24h max) */
  var cacheBust = Math.floor(Date.now() / 3600000);
  return fetch(JSON_URL + '?t=' + cacheBust)
    .then(function (res) {
      if (!res.ok) throw new Error('projects.json introuvable (' + res.status + ')');
      return res.json();
    })
    .then(function (data) {
      return (data.projets || []).filter(function (p) {
        return p.publie !== false;
      });
    });
}

/* ==========================================
   CONSTRUIRE UNE CARTE PROJET (style card v2)
   Image en haut, texte toujours visible en bas
   ========================================== */
function buildCard(p, index) {
  var div = document.createElement('div');
  div.className = 'pf-item';
  div.setAttribute('data-cat',   p.categorie || 'print');
  div.setAttribute('data-title', (p.titre || '').toLowerCase());
  div.setAttribute('data-img',   imgUrl(p.image));
  div.setAttribute('data-slug',  p.slug || '');

  var src     = escHtml(imgUrl(p.image));
  var titre   = escHtml(p.titre       || 'Sans titre');
  var desc    = escHtml(p.description || '');
  var cat     = escHtml(formatCat(p.categorie || ''));
  var rawCat  = escHtml(p.categorie   || '');

  div.innerHTML =
    /* --- Zone image --- */
    '<div class="pf-img-wrap">' +
      '<img src="' + src + '" alt="' + titre + '" loading="lazy" />' +
      '<span class="pf-img-badge">' + cat + '</span>' +
      '<button class="pf-zoom-btn" aria-label="Agrandir">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="11" cy="11" r="8"/>' +
        '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
        '<line x1="11" y1="8" x2="11" y2="14"/>' +
        '<line x1="8" y1="11" x2="14" y2="11"/>' +
        '</svg>' +
      '</button>' +
    '</div>' +
    /* --- Zone texte toujours visible --- */
    '<div class="pf-card-body">' +
      '<h3>' + titre + '</h3>' +
      (desc ? '<p class="pf-card-desc">' + desc + '</p>' : '') +
      '<div class="pf-card-footer">' +
        '<span class="pf-tag">' + rawCat + '</span>' +
      '</div>' +
    '</div>';

  return div;
}

/* ==========================================
   RENDRE LA GRILLE PORTFOLIO (page portfolio)
   ========================================== */
function renderPortfolio(projets) {
  var grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (projets.length === 0) {
    grid.innerHTML = '<p class="cms-empty">Aucun projet publié pour l\'instant.</p>';
    return;
  }

  projets.forEach(function (p, i) {
    var card = buildCard(p, i);
    card.style.animation = 'pfItemIn 0.35s ease ' + (i * 0.04) + 's both';
    grid.appendChild(card);
  });

  updateCounts(projets);
  initPortfolioInteractions(projets);
}

/* ==========================================
   APERÇU ACCUEIL (6 projets sur index.html)
   ========================================== */
function renderHomeApercu(projets) {
  var grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  var top6 = projets.slice(0, 6);
  grid.innerHTML = '';

  top6.forEach(function (p, i) {
    var card = buildCard(p, i);
    card.style.animation = 'pfItemIn 0.35s ease ' + (i * 0.06) + 's both';
    grid.appendChild(card);
  });

  /* Interactions légères pour l'accueil (lightbox seulement) */
  initLightbox(projets, grid);
}

/* ==========================================
   METTRE À JOUR LES COMPTEURS FILTRES
   ========================================== */
function updateCounts(projets) {
  var cats = ['branding', 'print', 'motion', 'illustration', 'social', 'packaging'];

  var allEl = document.getElementById('cnt-all');
  if (allEl) allEl.textContent = projets.length;

  cats.forEach(function (cat) {
    var el = document.getElementById('cnt-' + cat);
    if (!el) return;
    el.textContent = projets.filter(function (p) {
      return p.categorie === cat;
    }).length;
  });
}

/* ==========================================
   INTERACTIONS PORTFOLIO : FILTRES + VUE + LIGHTBOX
   ========================================== */
function initPortfolioInteractions(projets) {
  var grid       = document.getElementById('portfolioGrid');
  var filterBtns = document.querySelectorAll('.pf-btn');
  var curFilter  = 'all';

  /* --- FILTRES --- */
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      curFilter = btn.getAttribute('data-filter');
      applyFilter();
    });
  });

  function applyFilter() {
    var items   = grid.querySelectorAll('.pf-item');
    var visible = 0;
    items.forEach(function (item) {
      var show = curFilter === 'all' || item.getAttribute('data-cat') === curFilter;
      item.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    var noRes = document.getElementById('noResults');
    if (noRes) noRes.style.display = visible === 0 ? 'flex' : 'none';
  }

  var resetBtn = document.getElementById('resetFilter');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      curFilter = 'all';
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      var allBtn = document.querySelector('.pf-btn[data-filter="all"]');
      if (allBtn) allBtn.classList.add('active');
      applyFilter();
    });
  }

  /* --- VUE GRILLE / LISTE --- */
  var btnGrid = document.getElementById('viewGrid');
  var btnList = document.getElementById('viewList');
  var isGrid  = true;

  if (btnGrid) {
    btnGrid.addEventListener('click', function () {
      if (isGrid) return;
      isGrid = true;
      grid.classList.remove('list-view');
      btnGrid.classList.add('active');
      if (btnList) btnList.classList.remove('active');
    });
  }
  if (btnList) {
    btnList.addEventListener('click', function () {
      if (!isGrid) return;
      isGrid = false;
      grid.classList.add('list-view');
      btnList.classList.add('active');
      if (btnGrid) btnGrid.classList.remove('active');
    });
  }

  /* --- LIGHTBOX --- */
  initLightbox(projets, grid);
}

/* ==========================================
   LIGHTBOX
   ========================================== */
function initLightbox(projets, grid) {
  var lightbox  = document.getElementById('lightbox');
  if (!lightbox) return;

  var lbOverlay = document.getElementById('lightboxOverlay');
  var lbClose   = document.getElementById('lightboxClose');
  var lbPrev    = document.getElementById('lightboxPrev');
  var lbNext    = document.getElementById('lightboxNext');
  var lbImg     = document.getElementById('lightboxImg');
  var lbLoader  = document.getElementById('lightboxLoader');
  var lbTag     = document.getElementById('lightboxTag');
  var lbTitle   = document.getElementById('lightboxTitle');
  var lbDesc    = document.getElementById('lightboxDesc');
  var lbLink    = document.getElementById('lightboxLink');
  var lbIndex   = 0;

  function getVisible() {
    return Array.from(grid.querySelectorAll('.pf-item:not(.hidden)'));
  }

  function openLb(index) {
    var visible = getVisible();
    if (!visible[index]) return;
    lbIndex = index;

    var item  = visible[index];
    var src   = item.getAttribute('data-img') || '';
    var slug  = item.getAttribute('data-slug') || '';
    var tag   = (item.querySelector('.pf-img-badge') || {}).textContent || '';
    var title = (item.querySelector('h3') || {}).textContent || '';

    /* Chercher résultat dans les données */
    var proj = projets.find(function (p) { return p.slug === slug; });
    var desc = proj ? (proj.resultat || proj.description || '') : '';

    if (lbLoader) lbLoader.style.display = 'block';
    if (lbImg)    lbImg.style.opacity    = '0';
    if (lbTag)    lbTag.textContent      = tag;
    if (lbTitle)  lbTitle.textContent    = title;
    if (lbDesc)   lbDesc.textContent     = desc;
    if (lbLink)   lbLink.style.display   = 'none';

    var img    = new Image();
    img.onload = function () {
      if (lbImg) {
        lbImg.src           = src;
        lbImg.alt           = title;
        lbImg.style.opacity = '1';
      }
      if (lbLoader) lbLoader.style.display = 'none';
    };
    img.onerror = function () {
      if (lbLoader) lbLoader.style.display = 'none';
    };
    img.src = src;

    if (lbPrev) lbPrev.style.opacity = index > 0 ? '1' : '0.3';
    if (lbNext) lbNext.style.opacity = index < visible.length - 1 ? '1' : '0.3';

    lightbox.style.display = 'flex';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lightbox.style.display = 'none';
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Boutons lightbox */
  if (lbClose)   lbClose.addEventListener('click', closeLb);
  if (lbOverlay) lbOverlay.addEventListener('click', closeLb);
  if (lbPrev)    lbPrev.addEventListener('click', function () {
    if (lbIndex > 0) openLb(lbIndex - 1);
  });
  if (lbNext)    lbNext.addEventListener('click', function () {
    var v = getVisible();
    if (lbIndex < v.length - 1) openLb(lbIndex + 1);
  });

  /* Délégation d'événements sur la grille (zoom + clic card) */
  grid.addEventListener('click', function (e) {
    var detailLink = e.target.closest('.pf-detail-btn');
    if (detailLink) return; /* laisser le lien naviguer */

    var item = e.target.closest('.pf-item');
    if (!item) return;

    var visible = getVisible();
    var index   = visible.indexOf(item);
    if (index !== -1) openLb(index);
  });

  /* Navigation clavier */
  document.addEventListener('keydown', function (e) {
    if (!lightbox || lightbox.style.display === 'none') return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  { if (lbIndex > 0) openLb(lbIndex - 1); }
    if (e.key === 'ArrowRight') {
      var v = getVisible();
      if (lbIndex < v.length - 1) openLb(lbIndex + 1);
    }
  });

  /* Swipe tactile */
  var touchX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    var diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      var v = getVisible();
      if (diff > 0 && lbIndex < v.length - 1) openLb(lbIndex + 1);
      if (diff < 0 && lbIndex > 0)             openLb(lbIndex - 1);
    }
  }, { passive: true });
}


/* ==========================================
   CHARGEMENT ÉQUIPE → about.html
   (Conservé, inchangé, lit toujours GitHub API
    car _equipe n'est pas dans projects.json)
   ========================================== */
function loadEquipe() {
  var grid = document.querySelector('.team-grid');
  if (!grid) return;

  var apiBase = 'https://api.github.com/repos/nguiambakouma-pixel/rhizart-site/contents/';

  function fetchRaw(path) {
    return fetch(apiBase + path + '?ref=main')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return null;
        var bin   = atob(d.content.replace(/\n/g, ''));
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder('utf-8').decode(bytes);
      });
  }

  function parseFM(content) {
    var result = {};
    var match  = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return result;
    var lines = match[1].split('\n');
    var curKey = null, listItems = null;
    lines.forEach(function (line) {
      if (/^\s+-\s+/.test(line)) {
        var v = line.replace(/^\s+-\s+/, '').trim().replace(/^['"]|['"]$/g, '');
        if (listItems !== null) listItems.push(v);
        return;
      }
      var kv = line.match(/^([a-zA-Z_]\w*):\s*(.*)/);
      if (kv) {
        if (curKey && listItems !== null) result[curKey] = listItems;
        listItems = null; curKey = kv[1];
        var val = kv[2].trim().replace(/^['"]|['"]$/g, '');
        if (val === '')           { listItems = []; }
        else if (val === 'true')  { result[curKey] = true;  curKey = null; }
        else if (val === 'false') { result[curKey] = false; curKey = null; }
        else if (!isNaN(val))     { result[curKey] = parseFloat(val); curKey = null; }
        else                      { result[curKey] = val;  curKey = null; }
      }
    });
    if (curKey && listItems !== null) result[curKey] = listItems;
    return result;
  }

  function rawImg(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return 'https://raw.githubusercontent.com/nguiambakouma-pixel/rhizart-site/main/' + path.replace(/^\//, '');
  }

  fetch(apiBase + '_equipe?ref=main')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (files) {
      var mds = files.filter(function (f) { return f.name.endsWith('.md'); });
      if (mds.length === 0) return null;
      return Promise.all(mds.map(function (f) {
        return fetchRaw('_equipe/' + f.name).then(parseFM);
      }));
    })
    .then(function (membres) {
      if (!membres) return;
      membres.sort(function (a, b) { return (a.ordre || 99) - (b.ordre || 99); });
      grid.innerHTML = '';
      membres.forEach(function (m) {
        var div = document.createElement('div');
        div.className = 'team-card' + (m.fondateur ? ' team-featured' : '');
        var comps = Array.isArray(m.competences) ? m.competences : [];
        var skills = comps.map(function (c) { return '<span>' + escHtml(c) + '</span>'; }).join('');
        var socials = '';
        if (m.linkedin)  socials += '<a href="' + m.linkedin  + '" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>';
        if (m.instagram) socials += '<a href="' + m.instagram + '" target="_blank" rel="noopener" aria-label="Instagram"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>';
        div.innerHTML =
          '<div class="team-img">' +
            (rawImg(m.photo) ? '<img src="' + rawImg(m.photo) + '" alt="' + escHtml(m.nom||'') + '" loading="lazy" />' : '') +
            (socials ? '<div class="team-socials">' + socials + '</div>' : '') +
          '</div>' +
          '<div class="team-info">' +
            (m.fondateur ? '<div class="team-role-badge">Fondateur</div>' : '') +
            '<h3>' + escHtml(m.nom||'') + '</h3>' +
            '<p class="team-role">' + escHtml(m.role||'') + '</p>' +
            '<p class="team-bio">'  + escHtml(m.bio||'')  + '</p>' +
            (skills ? '<div class="team-skills">' + skills + '</div>' : '') +
          '</div>';
        grid.appendChild(div);
      });
      /* Card recrutement */
      var joinCard = document.createElement('div');
      joinCard.className = 'team-join';
      joinCard.innerHTML =
        '<div class="team-join-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>' +
        '<div><h3>Vous voulez rejoindre l\'équipe ?</h3><p>On cherche toujours des talents passionnés. Envoyez-nous votre portfolio.</p></div>' +
        '<a href="mailto:contact@rhizart.cm?subject=Candidature RHIZART" class="btn btn-primary">Candidater</a>';
      grid.insertAdjacentElement('afterend', joinCard);
    })
    .catch(function (err) { console.error('Erreur équipe:', err); });
}


/* ==========================================
   CHARGEMENT TÉMOIGNAGES → index.html
   (Conservé, inchangé)
   ========================================== */
function loadTemoignages() {
  var grid = document.querySelector('.temoignages-grid');
  if (!grid) return;

  var apiBase = 'https://api.github.com/repos/nguiambakouma-pixel/rhizart-site/contents/';

  function fetchRaw(path) {
    return fetch(apiBase + path + '?ref=main')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return null;
        var bin   = atob(d.content.replace(/\n/g, ''));
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder('utf-8').decode(bytes);
      });
  }

  function parseFM(content) {
    var result = {}, match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return result;
    match[1].split('\n').forEach(function (line) {
      var kv = line.match(/^([a-zA-Z_]\w*):\s*(.*)/);
      if (!kv) return;
      var val = kv[2].trim().replace(/^['"]|['"]$/g, '');
      if (val === 'true')       result[kv[1]] = true;
      else if (val === 'false') result[kv[1]] = false;
      else if (!isNaN(val) && val !== '') result[kv[1]] = parseFloat(val);
      else result[kv[1]] = val;
    });
    return result;
  }

  fetch(apiBase + '_temoignages?ref=main')
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (files) {
      var mds = files.filter(function (f) { return f.name.endsWith('.md'); });
      if (mds.length === 0) return null;
      return Promise.all(mds.map(function (f) {
        return fetchRaw('_temoignages/' + f.name).then(parseFM);
      }));
    })
    .then(function (temos) {
      if (!temos) return;
      temos = temos.filter(function (t) { return t.publie !== false; });
      if (temos.length === 0) return;
      grid.innerHTML = '';
      temos.forEach(function (t) {
        var note     = parseInt(t.note) || 5;
        var stars    = '★'.repeat(note) + '☆'.repeat(5 - note);
        var initials = (t.nom || 'XX').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
        var div = document.createElement('div');
        div.className = 'temoignage-card' + (t.featured ? ' temoignage-featured' : '');
        div.innerHTML =
          '<div class="temo-stars">' + stars + '</div>' +
          '<p>' + escHtml(t.citation || '') + '</p>' +
          '<div class="temo-author">' +
            '<div class="temo-avatar">' + initials + '</div>' +
            '<div>' +
              '<p class="temo-name">' + escHtml(t.nom  || '') + '</p>' +
              '<p class="temo-role">' + escHtml(t.role || '') + '</p>' +
            '</div>' +
          '</div>';
        grid.appendChild(div);
      });
    })
    .catch(function (err) { console.error('Erreur témoignages:', err); });
}


/* ==========================================
   INIT — détecter la page et charger
   ========================================== */
document.addEventListener('DOMContentLoaded', function () {
  var path = window.location.pathname;

  var isPortfolio = path.includes('portfolio');
  var isAbout     = path.includes('about');
  var isHome      = !isPortfolio && !isAbout && (
    path === '/' ||
    path.includes('index') ||
    path.endsWith('.app/') ||
    path.endsWith('/')
  );

  /* ---- Page portfolio : charger tous les projets ---- */
  if (isPortfolio) {
    var grid = document.getElementById('portfolioGrid');
    if (grid) {
      grid.innerHTML =
        '<div class="cms-loading">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>' +
        '<p>Chargement des projets…</p></div>';
    }
    fetchProjects()
      .then(renderPortfolio)
      .catch(function (err) {
        console.error('Erreur projects.json :', err);
        if (grid) grid.innerHTML = '<p class="cms-empty">Impossible de charger les projets.<br>Vérifiez votre connexion.</p>';
      });
  }

  /* ---- Page about : charger l'équipe ---- */
  if (isAbout) {
    loadEquipe();
  }

  /* ---- Accueil : aperçu projets + témoignages ---- */
  if (isHome) {
    loadTemoignages();
    if (document.getElementById('portfolioGrid')) {
      fetchProjects()
        .then(renderHomeApercu)
        .catch(function (err) { console.error('Erreur projets accueil :', err); });
    }
  }
});