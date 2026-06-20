/* ============================================
   RHIZART — contact.js
   Formulaire contact EmailJS + badge statut
   ============================================ */

var CONTACT_SERVICE_ID  = 'service_etw5yss';
var CONTACT_TEMPLATE_ID = 'template_kj9tune';
var CONTACT_PUBLIC_KEY  = 'D_abvtZDE2vjfqQ9m';

document.addEventListener('DOMContentLoaded', function () {

  if (typeof emailjs !== 'undefined') {
    emailjs.init(CONTACT_PUBLIC_KEY);
  }

  /* ==========================================
     1. BADGE STATUT TEMPS RÉEL
     ========================================== */
  function updateStatus() {
    var badge = document.getElementById('statusBadge');
    if (!badge) return;

    var now   = new Date();
    var day   = now.getDay();
    var hour  = now.getHours();
    var min   = now.getMinutes();
    var time  = hour + min / 60;

    var isOpen = day >= 1 && day <= 6 && time >= 8 && time < 18;

    if (isOpen) {
      badge.className = 'status-badge open';
      var remaining = 18 - time;
      var rh = Math.floor(remaining);
      var rm = Math.round((remaining - rh) * 60);
      var msg = rh > 0
        ? 'Ferme dans ' + rh + 'h' + (rm > 0 ? rm : '')
        : 'Ferme dans ' + rm + ' min';
      badge.textContent = 'Ouvert · ' + msg;
    } else {
      badge.className = 'status-badge closed';
      var next = day === 0 ? 'Lundi à 8h'
        : time >= 18 ? (day === 6 ? 'Lundi à 8h' : 'demain à 8h')
        : 'aujourd\'hui à 8h';
      badge.textContent = 'Fermé · Ouvre ' + next;
    }
  }

  updateStatus();
  setInterval(updateStatus, 60000);


  /* ==========================================
     2. FORMULAIRE CONTACT
     ========================================== */
  var form      = document.getElementById('contactForm');
  var submitBtn = document.getElementById('cSubmitBtn');

  /* Compteur message */
  var msgField = document.getElementById('cMessage');
  var msgCount = document.getElementById('cMsgCount');
  if (msgField && msgCount) {
    msgField.addEventListener('input', function () {
      var len = msgField.value.length;
      msgCount.textContent = len + ' / 800';
      msgCount.style.color = len > 700 ? 'var(--red)' : '';
    });
  }

  /* Validation */
  function showErr(id, msg) { var el = document.getElementById(id); if (el) el.textContent = msg; }
  function clearErr(id)     { var el = document.getElementById(id); if (el) el.textContent = ''; }
  function setErr(id, has)  {
    var el = document.getElementById(id);
    if (el) { if (has) el.classList.add('error'); else el.classList.remove('error'); }
  }

  function validate() {
    var valid = true;

    var fn = document.getElementById('cFirstName');
    if (!fn || fn.value.trim().length < 2) {
      showErr('cerr-fn', '← Requis'); setErr('cFirstName', true); valid = false;
    } else { clearErr('cerr-fn'); setErr('cFirstName', false); }

    var ln = document.getElementById('cLastName');
    if (!ln || ln.value.trim().length < 2) {
      showErr('cerr-ln', '← Requis'); setErr('cLastName', true); valid = false;
    } else { clearErr('cerr-ln'); setErr('cLastName', false); }

    var em = document.getElementById('cEmail');
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) {
      showErr('cerr-email', '← Email invalide'); setErr('cEmail', true); valid = false;
    } else { clearErr('cerr-email'); setErr('cEmail', false); }

    var sub = document.getElementById('cSubject');
    if (!sub || !sub.value) {
      showErr('cerr-subject', '← Requis'); setErr('cSubject', true); valid = false;
    } else { clearErr('cerr-subject'); setErr('cSubject', false); }

    var msg = document.getElementById('cMessage');
    if (!msg || msg.value.trim().length < 10) {
      showErr('cerr-msg', '← Min. 10 caractères'); setErr('cMessage', true); valid = false;
    } else { clearErr('cerr-msg'); setErr('cMessage', false); }

    return valid;
  }

  document.querySelectorAll('#contactForm .form-input').forEach(function (input) {
    input.addEventListener('focus', function () { input.classList.remove('error'); });
  });

  /* Soumission */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      var btnText   = submitBtn ? submitBtn.querySelector('.btn-text')  : null;
      var btnLoader = submitBtn ? submitBtn.querySelector('.btn-loader') : null;
      var btnSend   = submitBtn ? submitBtn.querySelector('.btn-send')   : null;

      if (submitBtn) submitBtn.disabled = true;
      if (btnText)   btnText.textContent = 'Envoi en cours…';
      if (btnLoader) btnLoader.style.display = 'inline-flex';
      if (btnSend)   btnSend.style.display   = 'none';

      var firstName = (document.getElementById('cFirstName') || {}).value || '';
      var lastName  = (document.getElementById('cLastName')  || {}).value || '';
      var email     = (document.getElementById('cEmail')     || {}).value || '';
      var subject   = (document.getElementById('cSubject')   || {}).value || '';
      var message   = (document.getElementById('cMessage')   || {}).value || '';

      var templateParams = {
        from_name    : firstName + ' ' + lastName,
        from_email   : email,
        reply_to     : email,
        phone        : '—',
        company      : '—',
        project_type : 'Message de contact',
        project_name : subject,
        project_desc : message,
        budget       : '—',
        delai        : '—',
        has_maquette : '—',
        references   : '—',
        features     : '—',
        source       : '—'
      };

      emailjs.send(CONTACT_SERVICE_ID, CONTACT_TEMPLATE_ID, templateParams)
        .then(function () {
          form.reset();
          if (msgCount) msgCount.textContent = '0 / 800';

          var successEl = document.getElementById('contactSuccess');
          if (successEl) successEl.style.display = 'flex';

          if (submitBtn) submitBtn.disabled = false;
          if (btnText)   btnText.textContent = 'Envoyer le message';
          if (btnLoader) btnLoader.style.display = 'none';
          if (btnSend)   btnSend.style.display   = '';

          setTimeout(function () {
            if (successEl) successEl.style.display = 'none';
          }, 7000);
        })
        .catch(function (error) {
          if (submitBtn) submitBtn.disabled = false;
          if (btnText)   btnText.textContent = 'Envoyer le message';
          if (btnLoader) btnLoader.style.display = 'none';
          if (btnSend)   btnSend.style.display   = '';
          alert('❌ Échec de l\'envoi. Contactez-nous sur WhatsApp.');
          console.error('EmailJS error:', error);
        });
    });
  }

}); /* fin DOMContentLoaded */