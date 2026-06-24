/* ============================================
   RHIZART — cms-loader.js
   Charge les données Decap CMS via GitHub API
   et met à jour le site dynamiquement
   ============================================ */

var CMS_CONFIG = {
  owner  : 'nguiambakouma-pixel',
  repo   : 'rhizart-site',
  branch : 'main',
  api    : 'https://api.github.com/repos'
};

/* ==========================================
   UTILITAIRES
   ========================================== */

/* Lire un fichier depuis GitHub */
function fetchFile(path) {
  var url = CMS_CONFIG.api + '/' + CMS_CONFIG.owner + '/' +
            CMS_CONFIG.repo + '/contents/' + path +
            '?ref=' + CMS_CONFIG.branch;
  return fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('Fichier introuvable : ' + path);
      return res.json();
    })
    .then(function (data) {
      return atob(data.content.replace(/\n/g, ''));
    });
}

/* Lister les fichiers d'un dossier */
function fetchFolder(folder) {
  var url = CMS_CONFIG.api + '/' + CMS_CONFIG.owner + '/' +
            CMS_CONFIG.repo + '/contents/' + folder +
            '?ref=' + CMS_CONFIG.branch;
  return fetch(url)
    .then(function (res) {
      if (!res.ok) return [];
      return res.json();
    })
    .catch(function () { return []; });
}

/* Parser le front-matter YAML d'un fichier Markdown */
function parseFrontMatter(content) {
  var result = {};
  var match  = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return result;

  var lines = match[1].split('\n');
  var currentKey = null;
  var listItems  = null;

  lines.forEach(function (line) {
    /* Ligne de liste : "  - valeur" */
    if (/^\s+-\s+/.test(line)) {
      var val = line.replace(/^\s+-\s+/, '').trim();
      /* Supprimer les guillemets éventuels */
      val = val.replace(/^['"]|['"]$/g, '');
      if (listItems !== null) listItems.push(val);
      return;
    }

    /* Clé: valeur */
    var kv = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)/);
    if (kv) {
      /* Sauvegarder la liste précédente */
      if (currentKey && listItems !== null) {
        result[currentKey] = listItems;
      }
      listItems  = null;
      currentKey = kv[1];
      var val    = kv[2].trim().replace(/^['"]|['"]$/g, '');

      if (val === '') {
        /* Valeur vide → probablement une liste suit */
        listItems = [];
      } else if (val === 'true') {
        result[currentKey] = true;
      } else if (val === 'false') {
        result[currentKey] = false;
      } else if (!isNaN(val) && val !== '') {
        result[currentKey] = parseFloat(val);
      } else {
        result[currentKey] = val;
        currentKey = null;
      }
    }
  });

  /* Sauvegarder dernière liste */
  if (currentKey && listItems !== null) {
    result[currentKey] = listItems;
  }

  return result;
}

/* Construire l'URL d'une image stockée dans le repo */
function imageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return 'https://raw.githubusercontent.com/' +
    CMS_CONFIG.owner + '/' + CMS_CONFIG.repo + '/' +
    CMS_CONFIG.branch + '/' + path.replace(/^\//, '');
}


/* ==========================================
   CHARGEMENT PROJETS → portfolio.html
   ========================================== */
function loadProjets() {
  var grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  /* Indicateur de chargement */
  grid.innerHTML = '<div class="cms-loading"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><p>Chargement des projets…</p></div>';

  fetchFolder('_projets')
    .then(function (files) {
      var mdFiles = files.filter(function (f) { return f.name.endsWith('.md'); });
      if (mdFiles.length === 0) {
        grid.innerHTML = '<p class="cms-empty">Aucun projet publié pour l\'instant.</p>';
        return;
      }

      /* Charger tous les fichiers en parallèle */
      var promises = mdFiles.map(function (f) {
        return fetchFile('_projets/' + f.name)
          .then(function (content) {
            var data = parseFrontMatter(content);
            data._slug = f.name.replace('.md', '');
            return data;
          });
      });

      return Promise.all(promises);
    })
    .then(function (projets) {
      if (!projets) return;

      /* Filtrer les non publiés */
      projets = projets.filter(function (p) { return p.publie !== false; });

      if (projets.length === 0) {
        grid.innerHTML = '<p class="cms-empty">Aucun projet publié.</p>';
        return;
      }

      /* Vider la grille et injecter les cartes */
      grid.innerHTML = '';

      projets.forEach(function (p, i) {
        var card = buildProjetCard(p, i);
        grid.appendChild(card);
      });

      /* Mettre à jour les compteurs de filtres */
      updateFilterCounts(projets);

      /* Ré-initialiser les filtres et lightbox */
      if (typeof initPortfolioInteractions === 'function') {
        initPortfolioInteractions();
      }
    })
    .catch(function (err) {
      console.error('Erreur chargement projets:', err);
      grid.innerHTML = '<p class="cms-empty">Erreur de chargement. Vérifiez votre connexion.</p>';
    });
}

/* Construire une carte projet */
function buildProjetCard(p, index) {
  var div = document.createElement('div');
  div.className = 'pf-item';
  div.setAttribute('data-cat',   p.categorie || 'branding');
  div.setAttribute('data-title', (p.titre || '').toLowerCase());
  div.setAttribute('data-img',   imageUrl(p.image));

  /* Grande carte pour les premiers projets */
  if (index === 0 || index === 5) div.classList.add('pf-large');
  if (index === 2 || index === 8) div.classList.add('pf-tall');

  var imgSrc   = imageUrl(p.image);
  var titre    = escHtml(p.titre    || 'Projet sans titre');
  var desc     = escHtml(p.description || '');
  var cat      = escHtml(p.categorie  || '');
  var slug     = p._slug || 'projet';
  var resultat = escHtml(p.resultat   || '');

  div.innerHTML =
    '<img src="' + imgSrc + '" alt="' + titre + '" loading="lazy" />' +
    '<div class="pf-overlay">' +
      '<div class="pf-overlay-content">' +
        '<span class="pf-tag">' + formatCat(cat) + '</span>' +
        '<h3>' + titre + '</h3>' +
        (desc ? '<p>' + desc + '</p>' : '') +
        '<div class="pf-actions">' +
          '<button class="pf-zoom-btn" aria-label="Agrandir">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>' +
          '</button>' +
          '<a href="projet-' + slug + '.html" class="pf-detail-btn">Voir le projet ' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</div>';

  return div;
}


/* ==========================================
   CHARGEMENT ÉQUIPE → about.html
   ========================================== */
function loadEquipe() {
  var grid = document.querySelector('.team-grid');
  if (!grid) return;

  fetchFolder('_equipe')
    .then(function (files) {
      var mdFiles = files.filter(function (f) { return f.name.endsWith('.md'); });
      if (mdFiles.length === 0) return null;

      var promises = mdFiles.map(function (f) {
        return fetchFile('_equipe/' + f.name)
          .then(function (content) { return parseFrontMatter(content); });
      });
      return Promise.all(promises);
    })
    .then(function (membres) {
      if (!membres) return;

      /* Trier par ordre */
      membres.sort(function (a, b) { return (a.ordre || 99) - (b.ordre || 99); });

      grid.innerHTML = '';
      membres.forEach(function (m) {
        var card = buildMembreCard(m);
        grid.appendChild(card);
      });

      /* Card recrutement à la fin */
      var joinCard = buildJoinCard();
      grid.parentElement.querySelector('.team-join') && null;
      grid.insertAdjacentElement('afterend', joinCard);
    })
    .catch(function (err) { console.error('Erreur équipe:', err); });
}

function buildMembreCard(m) {
  var div      = document.createElement('div');
  div.className = 'team-card' + (m.fondateur ? ' team-featured' : '');

  var photo = imageUrl(m.photo);
  var nom   = escHtml(m.nom  || '');
  var role  = escHtml(m.role || '');
  var bio   = escHtml(m.bio  || '');
  var comps = Array.isArray(m.competences) ? m.competences : [];

  var skillsHtml = comps.map(function (c) {
    return '<span>' + escHtml(c) + '</span>';
  }).join('');

  var socialsHtml = '';
  if (m.linkedin)  socialsHtml += '<a href="' + m.linkedin  + '" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>';
  if (m.instagram) socialsHtml += '<a href="' + m.instagram + '" target="_blank" rel="noopener" aria-label="Instagram"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>';

  div.innerHTML =
    '<div class="team-img">' +
      (photo ? '<img src="' + photo + '" alt="' + nom + '" loading="lazy" />' : '') +
      (socialsHtml ? '<div class="team-socials">' + socialsHtml + '</div>' : '') +
    '</div>' +
    '<div class="team-info">' +
      (m.fondateur ? '<div class="team-role-badge">Fondateur</div>' : '') +
      '<h3>' + nom + '</h3>' +
      '<p class="team-role">' + role + '</p>' +
      '<p class="team-bio">' + bio + '</p>' +
      (skillsHtml ? '<div class="team-skills">' + skillsHtml + '</div>' : '') +
    '</div>';

  return div;
}

function buildJoinCard() {
  var div = document.createElement('div');
  div.className = 'team-join';
  div.innerHTML =
    '<div class="team-join-icon">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
    '</div>' +
    '<div><h3>Vous voulez rejoindre l\'équipe ?</h3><p>On cherche toujours des talents passionnés. Envoyez-nous votre portfolio.</p></div>' +
    '<a href="mailto:contact@rhizart.cm?subject=Candidature RHIZART" class="btn btn-primary">Candidater</a>';
  return div;
}


/* ==========================================
   CHARGEMENT TÉMOIGNAGES → index.html
   ========================================== */
function loadTemoignages() {
  var grid = document.querySelector('.temoignages-grid');
  if (!grid) return;

  fetchFolder('_temoignages')
    .then(function (files) {
      var mdFiles = files.filter(function (f) { return f.name.endsWith('.md'); });
      if (mdFiles.length === 0) return null;

      var promises = mdFiles.map(function (f) {
        return fetchFile('_temoignages/' + f.name)
          .then(function (content) { return parseFrontMatter(content); });
      });
      return Promise.all(promises);
    })
    .then(function (temos) {
      if (!temos) return;
      temos = temos.filter(function (t) { return t.publie !== false; });
      if (temos.length === 0) return;

      grid.innerHTML = '';
      temos.forEach(function (t) {
        var card = buildTemoignageCard(t);
        grid.appendChild(card);
      });
    })
    .catch(function (err) { console.error('Erreur témoignages:', err); });
}

function buildTemoignageCard(t) {
  var div = document.createElement('div');
  div.className = 'temoignage-card' + (t.featured ? ' temoignage-featured' : '');

  var note    = parseInt(t.note) || 5;
  var stars   = '★'.repeat(note) + '☆'.repeat(5 - note);
  var initials = (t.nom || 'XX').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();

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

  return div;
}


/* ==========================================
   UTILITAIRES INTERNES
   ========================================== */
function escHtml(str) {
  return String(str)
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

function updateFilterCounts(projets) {
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
   INIT — détecter la page et charger
   ========================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* Ajouter le style du loader */
  var style = document.createElement('style');
  style.textContent = [
    '.cms-loading { display:flex; flex-direction:column; align-items:center; gap:1rem;',
    '  padding:4rem; color:rgba(255,255,255,0.3); grid-column:1/-1; }',
    '.cms-loading p { font-size:0.9rem; }',
    '.cms-empty { text-align:center; padding:3rem; color:rgba(255,255,255,0.3);',
    '  grid-column:1/-1; font-size:0.9rem; }',
    '@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }',
    '.spin { animation:spin 0.8s linear infinite; }'
  ].join('');
  document.head.appendChild(style);

  var path = window.location.pathname;

  /* Portfolio */
  if (path.includes('portfolio')) {
    loadProjets();
  }

  /* About — équipe */
  if (path.includes('about')) {
    loadEquipe();
  }

  /* Index — témoignages */
  if (path === '/' || path.includes('index') || path.endsWith('.app/') || path.endsWith('.netlify.app/')) {
    loadTemoignages();
    /* Aperçu portfolio sur l'accueil */
    if (document.getElementById('portfolioGrid')) {
      loadProjets();
    }
  }

});