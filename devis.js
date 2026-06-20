/* ============================================
   RHIZART — devis.js
   Formulaire multi-étapes + EmailJS
   ============================================ */

/* ---- EmailJS Config ---- */
var EMAILJS_SERVICE_ID  = 'service_etw5yss';
var EMAILJS_TEMPLATE_ID = 'template_kj9tune';
var EMAILJS_PUBLIC_KEY  = 'D_abvtZDE2vjfqQ9m';

document.addEventListener('DOMContentLoaded', function () {

  /* -- Init EmailJS -- */
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  var currentStep = 1;
  var totalSteps  = 3;

  /* ---- DOM ---- */
  var form        = document.getElementById('devisForm');
  var progressBar = document.getElementById('progressBar');
  var progressLbl = document.getElementById('progressLabel');

  var stepEls = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3'),
    4: document.getElementById('step4')
  };

  var indicators = {
    1: document.getElementById('step-indicator-1'),
    2: document.getElementById('step-indicator-2'),
    3: document.getElementById('step-indicator-3')
  };

  var next1 = document.getElementById('next1');
  var next2 = document.getElementById('next2');
  var prev2 = document.getElementById('prev2');
  var prev3 = document.getElementById('prev3');

  /* ==========================================
     1. NAVIGATION ÉTAPES
     ========================================== */
  function showStep(n) {
    Object.values(stepEls).forEach(function (el) {
      if (el) el.classList.remove('active');
    });
    if (stepEls[n]) stepEls[n].classList.add('active');
    currentStep = n;

    /* Progress bar */
    var pct = n > totalSteps ? 100 : Math.round((n / totalSteps) * 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (progressLbl) {
      progressLbl.textContent = n <= totalSteps
        ? 'Étape ' + n + ' sur ' + totalSteps
        : 'Formulaire complété ✓';
    }

    /* Indicateurs aside */
    for (var i = 1; i <= totalSteps; i++) {
      var ind = indicators[i];
      if (!ind) continue;
      ind.classList.remove('active', 'done');
      if (i < n)       ind.classList.add('done');
      else if (i === n) ind.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (next1) next1.addEventListener('click', function () { if (validateStep1()) showStep(2); });
  if (next2) next2.addEventListener('click', function () { if (validateStep2()) showStep(3); });
  if (prev2) prev2.addEventListener('click', function () { showStep(1); });
  if (prev3) prev3.addEventListener('click', function () { showStep(2); });


  /* ==========================================
     2. SÉLECTION TYPE DE PROJET
     ========================================== */
  var typeCards  = document.querySelectorAll('.type-card');
  var hiddenType = document.getElementById('projectType');

  typeCards.forEach(function (card) {
    card.addEventListener('click', function () {
      typeCards.forEach(function (c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      if (hiddenType) hiddenType.value = card.getAttribute('data-value');
      clearError('err-type');
    });
  });


  /* ==========================================
     3. COMPTEUR CARACTÈRES
     ========================================== */
  var descField = document.getElementById('projectDesc');
  var descCount = document.getElementById('descCount');

  if (descField && descCount) {
    descField.addEventListener('input', function () {
      var len = descField.value.length;
      descCount.textContent = len + ' / 500';
      descCount.style.color = len > 450 ? 'var(--red)' : '';
    });
  }


  /* ==========================================
     4. VALIDATION
     ========================================== */
  function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearError(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  }
  function setInputError(inputId, hasError) {
    var el = document.getElementById(inputId);
    if (el) {
      if (hasError) el.classList.add('error');
      else          el.classList.remove('error');
    }
  }

  function validateStep1() {
    var valid = true;

    /* Type */
    if (!hiddenType || !hiddenType.value) {
      showError('err-type', '← Sélectionnez un type');
      valid = false;
    } else { clearError('err-type'); }

    /* Nom */
    var name = document.getElementById('projectName');
    if (!name || name.value.trim().length < 2) {
      showError('err-name', '← Requis (min. 2 car.)');
      setInputError('projectName', true); valid = false;
    } else { clearError('err-name'); setInputError('projectName', false); }

    /* Description */
    var desc = document.getElementById('projectDesc');
    if (!desc || desc.value.trim().length < 20) {
      showError('err-desc', '← Décrivez votre projet (min. 20 car.)');
      setInputError('projectDesc', true); valid = false;
    } else { clearError('err-desc'); setInputError('projectDesc', false); }

    return valid;
  }

  function validateStep2() {
    var valid = true;

    if (!document.querySelector('input[name="budget"]:checked')) {
      showError('err-budget', '← Sélectionnez une option');
      valid = false;
    } else { clearError('err-budget'); }

    if (!document.querySelector('input[name="delai"]:checked')) {
      showError('err-delai', '← Sélectionnez un délai');
      valid = false;
    } else { clearError('err-delai'); }

    return valid;
  }

  function validateStep3() {
    var valid = true;

    var fn = document.getElementById('firstName');
    if (!fn || fn.value.trim().length < 2) {
      showError('err-firstname', '← Requis');
      setInputError('firstName', true); valid = false;
    } else { clearError('err-firstname'); setInputError('firstName', false); }

    var ln = document.getElementById('lastName');
    if (!ln || ln.value.trim().length < 2) {
      showError('err-lastname', '← Requis');
      setInputError('lastName', true); valid = false;
    } else { clearError('err-lastname'); setInputError('lastName', false); }

    var em = document.getElementById('email');
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) {
      showError('err-email', '← Email invalide');
      setInputError('email', true); valid = false;
    } else { clearError('err-email'); setInputError('email', false); }

    var ph = document.getElementById('phone');
    if (!ph || ph.value.replace(/\s/g, '').length < 8) {
      showError('err-phone', '← Numéro invalide');
      setInputError('phone', true); valid = false;
    } else { clearError('err-phone'); setInputError('phone', false); }

    var consent = document.getElementById('consent');
    if (!consent || !consent.checked) {
      showError('err-consent', 'Veuillez accepter la politique de confidentialité');
      valid = false;
    } else { clearError('err-consent'); }

    return valid;
  }


  /* ==========================================
     5. SOUMISSION — EmailJS
     ========================================== */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep3()) return;

      /* UI chargement */
      var submitBtn = document.getElementById('submitBtn');
      var btnText   = submitBtn ? submitBtn.querySelector('.btn-text')   : null;
      var btnLoader = submitBtn ? submitBtn.querySelector('.btn-loader') : null;
      var btnArrow  = submitBtn ? submitBtn.querySelector('.btn-arrow')  : null;

      if (submitBtn) submitBtn.disabled = true;
      if (btnText)   btnText.textContent = 'Envoi en cours…';
      if (btnLoader) btnLoader.style.display = 'inline-flex';
      if (btnArrow)  btnArrow.style.display  = 'none';

      /* Collecte données */
      var firstName   = (document.getElementById('firstName')   || {}).value || '';
      var lastName    = (document.getElementById('lastName')    || {}).value || '';
      var email       = (document.getElementById('email')       || {}).value || '';
      var phone       = (document.getElementById('phone')       || {}).value || '';
      var company     = (document.getElementById('company')     || {}).value || '';
      var projectName = (document.getElementById('projectName') || {}).value || '';
      var projectDesc = (document.getElementById('projectDesc') || {}).value || '';
      var references  = (document.getElementById('references')  || {}).value || '';
      var couleurs    = (document.getElementById('couleurs')    || {}).value || '';
      var source      = (document.getElementById('source')      || {}).value || '';

      var budgetEl    = document.querySelector('input[name="budget"]:checked');
      var budgetLabel = budgetEl
        ? budgetEl.closest('.radio-card').querySelector('.radio-title').textContent.trim()
        : '—';

      var delaiEl    = document.querySelector('input[name="delai"]:checked');
      var delaiLabel = delaiEl
        ? delaiEl.closest('.radio-card').querySelector('.radio-title').textContent.trim()
        : '—';

      var styleEl    = document.querySelector('input[name="style"]:checked');
      var styleLabel = styleEl ? styleEl.value : '—';

      /* Livrables cochés */
      var livrables = [];
      document.querySelectorAll('input[name="livrables"]:checked').forEach(function (cb) {
        var label = cb.closest('.check-item').querySelector('span');
        if (label) livrables.push(label.textContent.trim());
      });
      var livrablesStr = livrables.length > 0 ? livrables.join(', ') : '—';

      /* Paramètres EmailJS */
      var templateParams = {
        from_name    : firstName + ' ' + lastName,
        from_email   : email,
        reply_to     : email,
        phone        : phone,
        company      : company  || '—',
        project_type : formatType(hiddenType ? hiddenType.value : ''),
        project_name : projectName,
        project_desc : projectDesc,
        budget       : budgetLabel,
        delai        : delaiLabel,
        has_maquette : styleLabel,   /* champ réutilisé pour le style */
        references   : references   || '—',
        features     : livrablesStr + (couleurs ? ' | Couleurs : ' + couleurs : ''),
        source       : source || '—'
      };

      /* Envoi EmailJS */
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function () {

          /* Écran de succès */
          var confirmNameEl = document.getElementById('confirmName');
          if (confirmNameEl) confirmNameEl.textContent = firstName;

          var successDetails = document.getElementById('successDetails');
          if (successDetails) {
            successDetails.innerHTML =
              '<p><strong>Projet :</strong> ' + escapeHtml(projectName) + '</p>' +
              '<p><strong>Type :</strong> '    + escapeHtml(formatType(hiddenType ? hiddenType.value : '')) + '</p>' +
              '<p><strong>Budget :</strong> '  + escapeHtml(budgetLabel) + '</p>' +
              '<p><strong>Email :</strong> '   + escapeHtml(email) + '</p>';
          }

          showStep(4);
        })
        .catch(function (error) {

          /* Réactiver le bouton */
          if (submitBtn) submitBtn.disabled = false;
          if (btnText)   btnText.textContent = 'Envoyer ma demande';
          if (btnLoader) btnLoader.style.display = 'none';
          if (btnArrow)  btnArrow.style.display  = '';

          /* Message erreur sous le bouton */
          var formNav = form.querySelector('#step3 .form-nav');
          var existing = document.getElementById('submit-error');
          if (existing) existing.remove();
          if (formNav) {
            var errEl = document.createElement('p');
            errEl.id  = 'submit-error';
            errEl.style.cssText = 'color:var(--red);font-size:0.82rem;margin-top:0.75rem;text-align:right;';
            errEl.textContent   = '❌ Échec de l\'envoi. Contactez-nous sur WhatsApp.';
            formNav.insertAdjacentElement('afterend', errEl);
          }

          console.error('EmailJS error:', error);
        });
    });
  }


  /* ==========================================
     6. UTILITAIRES
     ========================================== */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatType(val) {
    var map = {
      'identite-visuelle': 'Identité visuelle & Branding',
      'print':             'Print & supports',
      'motion':            'Motion design & Vidéo',
      'illustration':      'Illustration digitale',
      'social-media':      'Contenu réseaux sociaux',
      'packaging':         'Packaging',
      'autre':             'Autre / À définir'
    };
    return map[val] || val;
  }

  /* Effacer erreurs au focus */
  document.querySelectorAll('.form-input').forEach(function (input) {
    input.addEventListener('focus', function () {
      input.classList.remove('error');
    });
  });

}); /* fin DOMContentLoaded */