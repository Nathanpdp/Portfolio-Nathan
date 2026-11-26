/* Portfolio Nathan Pondepeyre — scripts communs à toutes les pages */

/* Ancre automatique de chaque fiche projet, d'après son titre :
   « Titre de mon projet » -> id="projet-titre-de-mon-projet" (-2, -3… en cas de doublon).
   Aucun id à écrire à la main. Sert pour la page affichée et pour les pages chargées
   par la fenêtre de détail (même règle que .claude/verifier-liens.py). */
function idsProjets(doc) {
  var vus = {};
  [].forEach.call(doc.querySelectorAll('main article.projet'), function (carte) {
    var h = carte.querySelector('h3');
    if (!h) return;
    var id = carte.id || 'projet-' + h.textContent.trim().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (vus[id]) { vus[id]++; id += '-' + vus[id]; } else { vus[id] = 1; }
    carte.id = id;
  });
}

(function () {
  // Les animations restent actives même si l'appareil demande moins d'animations (choix voulu, 22/11/2026).
  var reduit = false;
  // Mode « capture » (?capture dans l'adresse) : page affichée d'un coup, sans fenêtre d'accueil,
  // pour réaliser les captures d'écran du portfolio.
  var capture = /[?&]capture\b/.test(location.search);
  if (capture) {
    reduit = true;
    // &cible=.selecteur : amène cette section juste sous l'en-tête (le navigateur de capture ne défile pas)
    var cibleCapture = (location.search.match(/[?&]cible=([^&]+)/) || [])[1];
    if (cibleCapture) window.addEventListener('load', function () {
      var el = document.querySelector(decodeURIComponent(cibleCapture));
      var main = document.querySelector('main');
      if (el && main) main.style.transform = 'translateY(' + (-(el.getBoundingClientRect().top - 110)) + 'px)';
    });
  }

  /* ---- Liens externes et documents : ouverture dans un nouvel onglet ----
     Concerne les sites extérieurs (LinkedIn…) et les fichiers (PDF, Excel…),
     y compris les liens ajoutés plus tard : aucune modification du HTML n'est nécessaire. */
  var estExterne = function (a) {
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return false;
    if (/\.(pdf|xlsx?|docx?|pptx?|zip)(\?|#|$)/i.test(a.pathname) || /(^|\/)documents\//.test(href)) return true;
    return a.hostname !== '' && a.hostname !== location.hostname;
  };
  var preparerLien = function (a) {
    if (!estExterne(a)) return;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  };
  [].forEach.call(document.querySelectorAll('a[href]'), preparerLien);
  // Liens créés après le chargement : vérifiés au moment du clic
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a) preparerLien(a);
  }, true);

  /* ---- « Me contacter » : défilement vers la section + animation ---- */
  var contact = document.getElementById('contact');
  if (contact) {
    var flash = function () {
      // la section doit être visible tout de suite (pas de fondu d'apparition)
      [contact].concat([].slice.call(contact.querySelectorAll('.reveal'))).forEach(function (el) {
        el.classList.remove('reveal');
        el.style.transitionDelay = '';
      });
      contact.classList.remove('flash');
      void contact.offsetWidth; // relance l'animation
      contact.classList.add('flash');
      setTimeout(function () { contact.classList.remove('flash'); }, 2900);
    };
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href$="#contact"]');
      if (!a) return;
      e.preventDefault();
      contact.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#contact');
      setTimeout(flash, reduit ? 0 : 450);
    });
    // Arrivée depuis une autre page (index.html#contact)
    if (location.hash === '#contact') {
      window.addEventListener('load', function () {
        contact.scrollIntoView({ behavior: 'auto' });
        setTimeout(flash, 250);
      });
    }
  }

  /* ---- Bouton soleil / lune (thème clair / sombre) ---- */
  var racine = document.documentElement;
  var sombreSysteme = window.matchMedia('(prefers-color-scheme: dark)');
  var themeActuel = function () {
    return racine.getAttribute('data-theme') || (sombreSysteme.matches ? 'dark' : 'light');
  };
  var headerWrap = document.querySelector('header.site > .wrap');
  var nav = headerWrap && headerWrap.querySelector('nav');
  if (headerWrap && nav) {
    var actions = document.createElement('div');
    actions.className = 'header-actions';
    headerWrap.insertBefore(actions, nav);
    actions.appendChild(nav);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'theme-toggle';
    toggle.innerHTML =
      '<svg class="soleil" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>' +
      '<svg class="lune" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>';
    /* ---- Bouton « Me contacter » (juste avant le bouton soleil / lune) ---- */
    // Lien vers la section contact de l'accueil : même défilement + même animation que les autres liens.
    var contactBtn = document.createElement('a');
    contactBtn.className = 'contact-toggle';
    contactBtn.href = (contact ? '' : 'index.html') + '#contact';
    contactBtn.setAttribute('aria-label', 'Me contacter');
    contactBtn.title = 'Me contacter';
    contactBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
    actions.appendChild(contactBtn);

    actions.appendChild(toggle);

    var majLibelle = function () {
      var l = themeActuel() === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';
      toggle.setAttribute('aria-label', l);
      toggle.title = l;
    };
    majLibelle();

    var appliquerTheme = function (nouveau) {
      if (!reduit) {
        racine.classList.add('theme-anim');
        setTimeout(function () { racine.classList.remove('theme-anim'); }, 450);
      }
      racine.setAttribute('data-theme', nouveau);
      try { localStorage.setItem('theme', nouveau); } catch (e) {}
      majLibelle();
    };
    toggle.addEventListener('click', function () {
      appliquerTheme(themeActuel() === 'dark' ? 'light' : 'dark');
    });
    // Si aucun choix manuel, suivre le réglage du système en direct
    sombreSysteme.addEventListener('change', majLibelle);

    /* ---- Menu mobile (bouton hamburger) ---- */
    var header = headerWrap.parentElement;
    var menuBtn = document.createElement('button');
    menuBtn.type = 'button';
    menuBtn.className = 'menu-toggle';
    menuBtn.setAttribute('aria-label', 'Ouvrir le menu');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.innerHTML =
      '<svg class="ouvrir" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '<svg class="fermer" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    actions.appendChild(menuBtn);
    var fermerMenu = function () {
      header.classList.remove('menu-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Ouvrir le menu');
    };
    menuBtn.addEventListener('click', function () {
      var ouvert = header.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target) || e.target.closest('nav a')) fermerMenu();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermerMenu(); });
  }

  /* ---- Sommaire de la page, dans la marge gauche (affiché seulement sur grand écran, voir style.css) ----
     Une entrée par section principale ; la section en cours de lecture est marquée en rouge. */
  var sectionsPage = Array.prototype.filter.call(
    document.querySelectorAll('main section:not(section section)'),
    function (s) { return s.querySelector(':scope > h2'); }
  );
  if (sectionsPage.length >= 2) {
    var sommaire = document.createElement('nav');
    sommaire.className = 'sommaire';
    sommaire.setAttribute('aria-label', 'Sommaire de la page');
    var titreSommaire = document.createElement('p');
    titreSommaire.textContent = 'Sur cette page';
    var listeSommaire = document.createElement('ol');
    var liensSommaire = sectionsPage.map(function (s, i) {
      var h2 = s.querySelector(':scope > h2');
      if (!s.id) s.id = 'section-' + (i + 1);
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.textContent = h2.textContent.replace(/\s+/g, ' ').trim();
      li.appendChild(a);
      listeSommaire.appendChild(li);
      return a;
    });
    sommaire.appendChild(titreSommaire);
    sommaire.appendChild(listeSommaire);
    document.body.appendChild(sommaire);
    var majSommaire = function () {
      var seuil = window.innerHeight * 0.35, courant = 0;
      sectionsPage.forEach(function (s, i) { if (s.getBoundingClientRect().top <= seuil) courant = i; });
      // en bas de page, la dernière section est la section en cours
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) courant = sectionsPage.length - 1;
      liensSommaire.forEach(function (a, i) {
        if (i === courant) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    var attenteSommaire = false;
    window.addEventListener('scroll', function () {
      if (attenteSommaire) return;
      attenteSommaire = true;
      requestAnimationFrame(function () { attenteSommaire = false; majSommaire(); });
    }, { passive: true });
    window.addEventListener('resize', majSommaire);
    majSommaire();
  }

  /* ---- Bande verticale dans la marge droite, comme la tranche d'un dossier
     (décorative, affichée seulement sur grand écran, voir style.css) ---- */
  var tranche = document.createElement('div');
  tranche.className = 'tranche';
  tranche.setAttribute('aria-hidden', 'true');
  tranche.innerHTML = '<p><b>Nathan Pondepeyre</b><span>BTS SIO option SISR · 2025–2027</span></p>';
  document.body.appendChild(tranche);

  /* ---- Apparition des blocs au défilement ---- */
  if (!reduit && 'IntersectionObserver' in window) {
    var cibles = document.querySelectorAll(
      'main section, .page-title, .projet, .panel, .comp-carte, .timeline li, .contact-card, .facts li, .entreprise-carte, .stage-infos, .table-scroll, .epv, .stage-carte, .resume-bloc, .etape, .chiffres, .besoins > div, .capture-hero'
    );
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    [].forEach.call(cibles, function (el) {
      // décalage léger entre les cartes d'une même grille
      var rang = [].indexOf.call(el.parentElement.children, el);
      if (rang > 0 && rang < 6 && !el.matches('main section')) el.style.transitionDelay = (rang * 70) + 'ms';
      el.classList.add('reveal');
      obs.observe(el);
    });
  }

  /* ---- Réseau animé autour de la photo (accueil) ---- */
  var canvas = document.querySelector('.reseau');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var noeuds = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var souris = { x: -999, y: -999 };
    var couleur = function (nom) { return getComputedStyle(racine).getPropertyValue(nom).trim() || '120,100,255'; };
    var taille = function () {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var creer = function () {
      noeuds = [];
      var n = Math.round(Math.min(70, Math.max(34, w / 8)));
      for (var i = 0; i < n; i++) {
        var ang = Math.random() * Math.PI * 2;
        var rayon = (0.22 + Math.random() * 0.28) * Math.min(w, h);
        noeuds.push({
          x: w / 2 + Math.cos(ang) * rayon, y: h / 2 + Math.sin(ang) * rayon,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: 1.2 + Math.random() * 2, t: Math.random() < 0.3
        });
      }
    };
    var dessiner = function () {
      var c1 = couleur('--node'), c2 = couleur('--node2');
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2, max = Math.min(w, h) * 0.5, lien = Math.min(w, h) * 0.2;
      for (var i = 0; i < noeuds.length; i++) {
        var a = noeuds[i];
        if (!reduit) {
          a.x += a.vx; a.y += a.vy;
          // reste dans un anneau autour de la photo
          var dx = a.x - cx, dy = a.y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d > max * 0.98 || d < max * 0.42) { a.vx -= dx / d * 0.04 * (d > max * 0.98 ? 1 : -1); a.vy -= dy / d * 0.04 * (d > max * 0.98 ? 1 : -1); }
          // légère répulsion de la souris
          var mx = a.x - souris.x, my = a.y - souris.y, md = Math.sqrt(mx * mx + my * my);
          if (md < 70) { a.x += mx / md * 1.2; a.y += my / md * 1.2; }
          a.vx *= 0.995; a.vy *= 0.995;
          if (Math.abs(a.vx) < 0.05) a.vx += (Math.random() - 0.5) * 0.08;
          if (Math.abs(a.vy) < 0.05) a.vy += (Math.random() - 0.5) * 0.08;
        }
        for (var j = i + 1; j < noeuds.length; j++) {
          var b = noeuds[j], ex = a.x - b.x, ey = a.y - b.y, ed = Math.sqrt(ex * ex + ey * ey);
          if (ed < lien) {
            ctx.strokeStyle = 'rgba(' + c1 + ',' + (0.32 * (1 - ed / lien)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < noeuds.length; k++) {
        var p = noeuds[k];
        ctx.fillStyle = 'rgba(' + (p.t ? c2 : c1) + ',.9)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    };
    // boucle d'animation, mise en pause quand la photo sort de l'écran (économie de batterie)
    var horsEcran = false, tourne = false;
    var image = function () { tourne = false; dessiner(); lancer(); };
    var lancer = function () {
      if (!reduit && !horsEcran && !tourne) { tourne = true; requestAnimationFrame(image); }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { horsEcran = !e[e.length - 1].isIntersecting; lancer(); }).observe(canvas);
    }
    canvas.parentElement.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      souris.x = e.clientX - r.left; souris.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener('pointerleave', function () { souris.x = souris.y = -999; });
    taille(); creer(); dessiner(); lancer();
    window.addEventListener('resize', function () {
      // sur téléphone, la barre d'adresse déclenche « resize » au défilement sans changer la taille de la toile :
      // les points ne sont recréés que si la toile a vraiment changé de taille
      var aw = w, ah = h;
      taille();
      if (w !== aw || h !== ah) creer();
      dessiner();
    });
  }

  /* ---- Menu E5 / E6 du bouton « Voir mes projets » ---- */
  [].forEach.call(document.querySelectorAll('.btn-menu'), function (menu) {
    var bouton = menu.querySelector('.btn');
    var maj = function (ouvert) {
      menu.classList.toggle('open', ouvert);
      bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    };
    menu.addEventListener('mouseenter', function () { bouton.setAttribute('aria-expanded', 'true'); });
    menu.addEventListener('mouseleave', function () { maj(false); });
    // Au clavier, la liste s'affiche dès que le focus entre dans le menu (CSS :focus-within) :
    // l'état annoncé aux lecteurs d'écran suit.
    menu.addEventListener('focusin', function () { bouton.setAttribute('aria-expanded', 'true'); });
    menu.addEventListener('focusout', function (e) { if (!menu.contains(e.relatedTarget)) maj(false); });
    // Sur écran tactile (pas de survol), le premier appui ouvre le menu au lieu de suivre le lien
    bouton.addEventListener('click', function (e) {
      if (!window.matchMedia('(hover: hover)').matches && !menu.classList.contains('open')) {
        e.preventDefault();
        maj(true);
      }
    });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) maj(false); });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { maj(false); bouton.blur(); }
    });
  });

  /* ---- Projets : ancre automatique sur chaque fiche (voir idsProjets en haut du fichier) ---- */
  idsProjets(document);

  // Arrivée sur une fiche depuis le menu : défilement + mise en évidence
  var cible = location.hash && document.getElementById(location.hash.slice(1));
  if (cible && cible.classList.contains('projet')) {
    // mission ouverte depuis une autre page (« Voir la mission en détail ») : son détail est déplié
    var detailCible = cible.querySelector('.detail-mission');
    if (detailCible) detailCible.open = true;
    window.addEventListener('load', function () {
      [cible, cible.closest('section')].forEach(function (el) {
        if (el) { el.classList.remove('reveal'); el.style.transitionDelay = ''; }
      });
      cible.scrollIntoView({ block: 'center' });
      setTimeout(function () { cible.classList.add('cible'); }, 200);
      setTimeout(function () { cible.classList.remove('cible'); }, 2800);
    });
  }

  // impression : tous les détails de missions sont dépliés
  window.addEventListener('beforeprint', function () {
    [].forEach.call(document.querySelectorAll('.detail-mission'), function (d) { d.open = true; });
  });

  /* ---- Haut des pages de stage et de projet : copie des onglets de la sous-barre ----
     Même barre que celle qui apparaît au défilement (page courante surlignée) :
     pour une nouvelle page, il suffit d'ajouter son onglet dans la sous-barre. */
  var autres = document.querySelector('.stage-autres');
  var onglets = document.querySelector('header.site .subbar .onglets');
  if (autres && onglets) {
    autres.classList.add('stage-autres-groupes');
    autres.appendChild(onglets.cloneNode(true));
  }

  /* ---- Sous-barre des stages : visible seulement après un peu de défilement ---- */
  var subbar = document.querySelector('header.site .subbar');
  if (subbar) {
    var enTete = subbar.closest('header.site');
    var majSubbar = function () {
      enTete.classList.toggle('subbar-visible', window.scrollY > 160);
    };
    window.addEventListener('scroll', majSubbar, { passive: true });
    majSubbar();
  }

  /* ---- Bouton « retour en haut » ---- */
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'to-top';
  btn.setAttribute('aria-label', 'Remonter en haut de la page');
  btn.title = 'Remonter en haut de la page';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var maj = function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', maj, { passive: true });
  maj();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' });
  });
})();

/* ---------- Visionneuse plein écran avec zoom (éléments [data-zoom]) ----------
   Molette ou boutons +/− pour zoomer, glisser pour se déplacer, pincement à deux doigts
   sur mobile, double-clic pour zoomer ou revenir à la vue d'ensemble, Échap pour fermer. */
(function () {
  var declencheurs = document.querySelectorAll('[data-zoom]');
  if (!declencheurs.length) return;

  var v = document.createElement('div');
  v.className = 'visionneuse';
  v.setAttribute('role', 'dialog');
  v.setAttribute('aria-modal', 'true');
  v.hidden = true;
  v.innerHTML =
    '<div class="visionneuse-barre">' +
      '<span class="visionneuse-titre"></span>' +
      '<div class="visionneuse-outils">' +
        '<button type="button" data-act="moins" aria-label="Dézoomer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></button>' +
        '<span class="visionneuse-niveau" aria-live="polite">100 %</span>' +
        '<button type="button" data-act="plus" aria-label="Zoomer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></button>' +
        '<button type="button" data-act="ajuster" aria-label="Vue d’ensemble"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>' +
        '<button type="button" data-act="fermer" class="visionneuse-fermer" aria-label="Fermer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '</div>' +
    '</div>' +
    '<div class="visionneuse-zone"><img alt="" draggable="false"></div>' +
    '<p class="visionneuse-aide">Molette, pincement ou touches + et − pour zoomer · glisser ou flèches pour se déplacer · double-clic pour agrandir</p>';
  document.body.appendChild(v);
  // couche supérieure (popover) : la visionneuse passe aussi au-dessus d'une fenêtre ouverte (fiche, détail)
  var enPopover = 'popover' in HTMLElement.prototype;
  if (enPopover) v.setAttribute('popover', 'manual');

  var zone = v.querySelector('.visionneuse-zone');
  var img = v.querySelector('img');
  var niveau = v.querySelector('.visionneuse-niveau');
  var titre = v.querySelector('.visionneuse-titre');
  var s = 1, tx = 0, ty = 0, sMin = 1, sMax = 2, retour = null;

  function appliquer(anime) {
    var W = zone.clientWidth, H = zone.clientHeight;
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    // l'image reste centrée si elle est plus petite que l'écran, sinon on borne le déplacement
    tx = w <= W ? (W - w) / 2 : Math.min(0, Math.max(W - w, tx));
    ty = h <= H ? (H - h) / 2 : Math.min(0, Math.max(H - h, ty));
    img.style.transition = anime ? 'transform .25s ease' : 'none';
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
    niveau.textContent = Math.round(s / sMin * 100) + ' %';
  }
  function ajuster(anime) {
    var W = zone.clientWidth, H = zone.clientHeight;
    sMin = Math.min(W / img.naturalWidth, H / img.naturalHeight);
    sMax = Math.max(sMin * 6, 1.5);
    s = sMin; appliquer(anime);
  }
  // zoom autour d'un point (coordonnées dans la zone)
  function zoomer(nouveau, px, py, anime) {
    nouveau = Math.min(sMax, Math.max(sMin, nouveau));
    if (px === undefined) { px = zone.clientWidth / 2; py = zone.clientHeight / 2; }
    tx = px - (px - tx) * (nouveau / s);
    ty = py - (py - ty) * (nouveau / s);
    s = nouveau; appliquer(anime);
  }

  function ouvrir(src, t, depuis) {
    retour = depuis;
    titre.textContent = t || '';
    v.setAttribute('aria-label', t || 'Image agrandie');
    // dans une fenêtre modale ouverte, la visionneuse doit en faire partie pour rester utilisable
    var hote = null;
    try { hote = document.querySelector('dialog:modal'); } catch (err) {}
    (hote || document.body).appendChild(v);
    v.hidden = false;
    if (enPopover) { try { v.showPopover(); } catch (err) {} }
    document.documentElement.classList.add('visionneuse-ouverte');
    requestAnimationFrame(function () { v.classList.add('ouverte'); });
    var pret = function () { ajuster(false); };
    if (img.getAttribute('src') !== src) { img.onload = pret; img.src = src; } else if (img.complete) { pret(); }
    v.querySelector('.visionneuse-fermer').focus();
  }
  function fermer() {
    v.classList.remove('ouverte');
    document.documentElement.classList.remove('visionneuse-ouverte');
    setTimeout(function () {
      v.hidden = true;
      if (enPopover) { try { v.hidePopover(); } catch (err) {} }
    }, 200);
    if (retour) retour.focus();
  }

  // délégation : marche aussi pour les images copiées dans une fenêtre après le chargement
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-zoom]');
    if (!el || v.contains(el)) return;
    e.preventDefault();
    ouvrir(el.getAttribute('data-zoom'), el.getAttribute('data-zoom-titre'), el);
  });

  v.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var a = b.getAttribute('data-act');
    if (a === 'fermer') fermer();
    else if (a === 'plus') zoomer(s * 1.5, undefined, undefined, true);
    else if (a === 'moins') zoomer(s / 1.5, undefined, undefined, true);
    else if (a === 'ajuster') ajuster(true);
  });
  // clic sur le fond (hors image) : fermeture
  zone.addEventListener('click', function (e) { if (e.target === zone && !aBouge) fermer(); });

  document.addEventListener('keydown', function (e) {
    if (v.hidden) return;
    // Échap ferme seulement la visionneuse, pas la fenêtre ouverte en dessous
    if (e.key === 'Escape') { e.preventDefault(); fermer(); }
    else if (e.key === '+' || e.key === '=') zoomer(s * 1.5, undefined, undefined, true);
    else if (e.key === '-') zoomer(s / 1.5, undefined, undefined, true);
    else if (e.key === '0') ajuster(true);
    else if (/^Arrow(Left|Right|Up|Down)$/.test(e.key)) {
      // flèches : déplacer l'image agrandie (équivalent clavier du glisser)
      e.preventDefault();
      var pasX = zone.clientWidth * 0.15, pasY = zone.clientHeight * 0.15;
      if (e.key === 'ArrowLeft') tx += pasX;
      else if (e.key === 'ArrowRight') tx -= pasX;
      else if (e.key === 'ArrowUp') ty += pasY;
      else ty -= pasY;
      appliquer(true);
    }
    else if (e.key === 'Tab') {
      // garde le focus dans la visionneuse
      var f = v.querySelectorAll('button'), p = f[0], d = f[f.length - 1];
      if (e.shiftKey && document.activeElement === p) { e.preventDefault(); d.focus(); }
      else if (!e.shiftKey && document.activeElement === d) { e.preventDefault(); p.focus(); }
    }
  });

  zone.addEventListener('wheel', function (e) {
    e.preventDefault();
    var r = zone.getBoundingClientRect();
    zoomer(s * Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top, false);
  }, { passive: false });

  // glisser (souris ou doigt) et pincement à deux doigts
  var pointeurs = {}, depart = null, aBouge = false, dernierTap = 0;
  function liste() { return Object.keys(pointeurs).map(function (k) { return pointeurs[k]; }); }
  zone.addEventListener('pointerdown', function (e) {
    zone.setPointerCapture(e.pointerId);
    pointeurs[e.pointerId] = { x: e.clientX, y: e.clientY };
    aBouge = false;
    var p = liste();
    if (p.length === 1) depart = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
    if (p.length === 2) {
      depart = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s: s, tx: tx, ty: ty,
                 cx: (p[0].x + p[1].x) / 2, cy: (p[0].y + p[1].y) / 2 };
    }
    zone.classList.add('glisse');
  });
  zone.addEventListener('pointermove', function (e) {
    if (!pointeurs[e.pointerId] || !depart) return;
    pointeurs[e.pointerId] = { x: e.clientX, y: e.clientY };
    var p = liste(), r = zone.getBoundingClientRect();
    if (p.length === 1 && depart.d === undefined) {
      var dx = e.clientX - depart.x, dy = e.clientY - depart.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) aBouge = true;
      tx = depart.tx + dx; ty = depart.ty + dy; appliquer(false);
    } else if (p.length === 2) {
      aBouge = true;
      var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      var cx = (p[0].x + p[1].x) / 2 - r.left, cy = (p[0].y + p[1].y) / 2 - r.top;
      var ns = Math.min(sMax, Math.max(sMin, depart.s * d / depart.d));
      tx = cx - (depart.cx - r.left - depart.tx) * (ns / depart.s);
      ty = cy - (depart.cy - r.top - depart.ty) * (ns / depart.s);
      s = ns; appliquer(false);
    }
  });
  function relacher(e) {
    if (!pointeurs[e.pointerId]) return;
    delete pointeurs[e.pointerId];
    var p = liste();
    if (p.length === 1) depart = { x: p[0].x, y: p[0].y, tx: tx, ty: ty };
    else if (!p.length) {
      depart = null; zone.classList.remove('glisse');
      // double tap (tactile) : zoom / vue d'ensemble
      if (!aBouge && e.pointerType !== 'mouse') {
        var now = Date.now();
        if (now - dernierTap < 300) basculer(e);
        dernierTap = now;
      }
    }
  }
  zone.addEventListener('pointerup', relacher);
  zone.addEventListener('pointercancel', relacher);
  function basculer(e) {
    var r = zone.getBoundingClientRect();
    if (s > sMin * 1.05) ajuster(true);
    else zoomer(sMin * 3, e.clientX - r.left, e.clientY - r.top, true);
  }
  zone.addEventListener('dblclick', basculer);

  window.addEventListener('resize', function () { if (!v.hidden) ajuster(false); });
})();

/* ---------- Bouton « Revenir » après un lien vers une autre page du portfolio ----------
   Quand on clique sur un lien du contenu (compétences, cartes, frise…) qui mène à une autre
   page du site, on mémorise la page et la position de départ. Sur la page d'arrivée, un bouton
   en bas à gauche permet d'y revenir exactement au même endroit. Les menus de navigation
   (en-tête, sous-barre, navigation entre stages) ne déclenchent rien. */
(function () {
  var CLE = 'portfolio-retour', CLE_Y = 'portfolio-retour-y';
  var lire = function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  var ecrire = function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} };
  var effacer = function (k) { try { sessionStorage.removeItem(k); } catch (e) {} };

  // 1) Retour demandé sans historique (lien ouvert directement) : on restaure la position
  var y = lire(CLE_Y);
  if (y !== null) {
    effacer(CLE_Y);
    window.addEventListener('load', function () {
      var html = document.documentElement, ancien = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, parseInt(y, 10) || 0);
      html.style.scrollBehavior = ancien;
    });
  }

  // 2) Mémoriser le point de départ au clic sur un lien interne du contenu
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('main a[href]');
    if (!a || a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    if (a.closest('.stage-nav, .subbar, .retour-flottant')) return;
    if (a.hostname !== location.hostname || a.pathname === location.pathname) return;
    if (!/\.html$|\/$/.test(a.pathname)) return;
    var section = a.closest('section');
    var h2 = section && section.querySelector('h2');
    // Libellé de la page de départ : début du titre de l'onglet (« Stage de Terminale… – Nathan Pondepeyre »).
    // Le titre de l'accueil commence par le nom : on affiche simplement « Accueil ».
    var accueil = /(^|\/)(index\.html)?$/.test(location.pathname);
    var page = accueil ? 'Accueil' : (document.title.split('–')[0] || '').trim();
    ecrire(CLE, JSON.stringify({
      depuis: location.pathname + location.search,
      vers: a.pathname,
      y: Math.round(window.scrollY),
      libelle: page + (h2 ? ' · ' + h2.textContent.trim() : ''),
      t: Date.now()
    }));
  });

  // 3) Sur la page d'arrivée : afficher le bouton
  var brut = lire(CLE);
  if (!brut) return;
  var info;
  try { info = JSON.parse(brut); } catch (e) { effacer(CLE); return; }
  if (!info || info.vers !== location.pathname || Date.now() - info.t > 30 * 60 * 1000) {
    if (info && info.vers !== location.pathname) effacer(CLE);
    return;
  }

  var b = document.createElement('a');
  b.className = 'retour-flottant';
  b.href = info.depuis;
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>' +
    '<span class="retour-texte"><span class="retour-mini">Revenir à</span><span class="retour-lieu"></span></span>';
  b.querySelector('.retour-lieu').textContent = info.libelle || 'la page précédente';
  b.setAttribute('aria-label', 'Revenir à ' + (info.libelle || 'la page précédente'));
  document.body.appendChild(b);
  requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.add('visible'); }); });

  b.addEventListener('click', function (e) {
    e.preventDefault();
    effacer(CLE);
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).pathname : ''; } catch (err) {}
    // Si on vient bien de cette page, le retour arrière du navigateur restaure tout (position comprise)
    if (ref && ref === info.depuis.split('?')[0] && history.length > 1) { history.back(); return; }
    ecrire(CLE_Y, String(info.y || 0));
    location.href = info.depuis;
  });
})();

/* ---------- Plan du site dans le pied de page ----------
   Une colonne par page ; sous chaque page, les titres de ses sections.
   Une section qui contient des projets ou des missions affiche une petite flèche :
   au survol (ou au clic sur la flèche, sur téléphone), un menu montre son contenu.
   Pour ajouter une page ou un projet, il suffit de compléter la liste ci-dessous. */
(function () {
  var footer = document.querySelector('footer.site .wrap');
  if (!footer || document.querySelector('.plan-site')) return;
  var action; // posé plus bas, au-dessus du plan du site
  // Fin de page : contact, sauf sur l'accueil qui se termine déjà par la section contact
  if (!document.getElementById('contact')) {
    action = document.createElement('div');
    action.className = 'pied-action';
    action.innerHTML =
      '<p>Pour une question, un stage ou une alternance, écrivez-moi.</p>' +
      '<div><a class="btn" href="index.html#contact">Me contacter</a></div>';
  }
  var plan = [
    ['Accueil', 'index.html', [
      ['À propos de moi', 'index.html#a-propos'],
      ['Parcours', 'index.html#parcours'],
      ['Certifications', 'index.html#certifications'],
      ['Compétences', 'index.html#competences'],
      ['Me contacter', 'index.html#contact']
    ]],
    ['Épreuve E5', 'e5.html', [
      ['Tableau de synthèse', 'e5.html#tableau-synthese'],
      ['Première année', 'e5.html#projets', [
        ['Audit d’infrastructure (Lumivia)', 'projet-lumivia.html#etat-des-lieux'],
        ['Environnement virtualisé (Lumivia)', 'projet-lumivia.html#mise-en-oeuvre'],
        ['Étude critique de SNCF Connect', 'projet-audit.html'],
        ['Boutique PrestaShop NathPhone', 'projet-nathphone.html']
      ]],
      ['Deuxième année', 'e5.html#deuxieme-annee', [
        ['Filtrage par ACL IPv4', 'projet-acl.html'],
        ['Réseau VLAN de StadiumCompany', 'projet-stadium.html'],
        ['StadiumCompany : services réseau (E6)', 'projet-infrastructure.html#mise-en-oeuvre'],
        ['StadiumCompany : dépannages (E6)', 'projet-infrastructure.html#depannage']
      ]],
      ['Sur les deux années', 'e5.html#deux-annees', [
        ['Création de mon portfolio', 'projet-portfolio.html'],
        ['Veille et certification', 'veille.html']
      ]],
      ['En milieu professionnel', 'e5.html#milieu-pro', [
        ['Masterisation de postes', 'stage1.html#projet-masterisation-de-postes'],
        ['Installation de postes', 'stage1.html#projet-installation-et-remplacement-de-postes'],
        ['Bandes de sauvegarde', 'stage1.html#projet-rotation-des-bandes-de-sauvegarde'],
        ['Support technique', 'stage1.html#projet-support-technique-vpn-et-double-authentification'],
        ['Inventaire du parc', 'stage1.html#projet-inventaire-du-parc-dans-simply-desk']
      ]]
    ]],
    ['Épreuve E6', 'e6.html', [
      ['Première année', 'e6.html#projets', [
        ['Modernisation du SI de Lumivia', 'projet-lumivia.html']
      ]],
      ['Deuxième année', 'e6.html#deuxieme-annee', [
        ['StadiumCompany : environnement virtualisé', 'projet-infrastructure.html']
      ]]
    ]],
    ['Stages', 'entreprise.html', [
      ['Mon parcours', 'entreprise.html#parcours-entreprise'],
      ['Stages de BTS SIO', 'entreprise.html#stages-bts', [
        ['Stage de 1re année', 'stage1.html'],
        ['Stage de 2e année', 'stage2.html']
      ]],
      ['Stages du lycée', 'entreprise.html#stages-lycee', [
        ['Terminale', 'stage-terminale.html'],
        ['Première (2e stage)', 'stage-premiere-2.html'],
        ['Première (1er stage)', 'stage-premiere-1.html'],
        ['Seconde (2e stage)', 'stage-seconde-2.html'],
        ['Seconde (1er stage)', 'stage-seconde-1.html']
      ]]
    ]],
    ['Veille technologique', 'veille.html', [
      ['Le sujet', 'veille.html#sujet', [
        ['Le phishing face à l’IA', 'veille.html#sujet'],
        ['En chiffres', 'veille.html#chiffres']
      ]],
      ['Mon dispositif', 'veille.html#dispositif', [
        ['Mes sources', 'veille.html#dispositif'],
        ['Mes outils', 'veille.html#dispositif']
      ]],
      ['Les articles', 'veille.html#synthese', [
        ['Exemple d’e-mail annoté', 'veille.html#exemple'],
        ['Synthèse des articles', 'veille.html#synthese']
      ]],
      ['Mon analyse', 'veille.html#analyse', [
        ['Comment s’en protéger', 'veille.html#protection'],
        ['Mon analyse', 'veille.html#analyse']
      ]]
    ]]
  ];
  var ici = location.pathname.split('/').pop() || 'index.html';
  var lien = function (texte, href) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = texte;
    if (href === ici) a.setAttribute('aria-current', 'page');
    return a;
  };
  var n = 0;
  var nav = document.createElement('nav');
  nav.className = 'plan-site';
  nav.setAttribute('aria-label', 'Plan du site');
  plan.forEach(function (page) {
    var col = document.createElement('div');
    var titre = document.createElement('p');
    titre.className = 'plan-titre';
    titre.appendChild(lien(page[0], page[1]));
    col.appendChild(titre);
    var ul = document.createElement('ul');
    page[2].forEach(function (s) {
      var li = document.createElement('li');
      li.appendChild(lien(s[0], s[1]));
      if (s[2] && s[2].length) {
        n++;
        li.className = 'plan-deroulant';
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'plan-fleche';
        b.setAttribute('aria-expanded', 'false');
        b.setAttribute('aria-controls', 'plan-menu-' + n);
        b.setAttribute('aria-label', 'Voir le contenu de « ' + s[0] + ' »');
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
        li.appendChild(b);
        var menu = document.createElement('ul');
        menu.className = 'plan-menu';
        menu.id = 'plan-menu-' + n;
        s[2].forEach(function (p) {
          var sli = document.createElement('li');
          sli.appendChild(lien(p[0], p[1]));
          menu.appendChild(sli);
        });
        li.appendChild(menu);
      }
      ul.appendChild(li);
    });
    col.appendChild(ul);
    nav.appendChild(col);
  });
  var bas = document.createElement('p');
  bas.className = 'plan-bas';
  while (footer.firstChild) bas.appendChild(footer.firstChild);
  if (action) footer.appendChild(action);
  footer.appendChild(nav);
  footer.appendChild(bas);

  // Ouverture : au survol sur ordinateur (CSS), au clic sur la flèche partout
  var fermer = function (sauf) {
    [].forEach.call(nav.querySelectorAll('.plan-deroulant.ouvert'), function (li) {
      if (li === sauf) return;
      li.classList.remove('ouvert');
      li.querySelector('.plan-fleche').setAttribute('aria-expanded', 'false');
    });
  };
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('.plan-fleche');
    if (!b) return;
    var li = b.parentNode, ouvert = !li.classList.contains('ouvert');
    fermer(li);
    li.classList.toggle('ouvert', ouvert);
    b.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) fermer(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermer(); });
})();

/* ---------- Fenêtre de détail d'une mission ----------
   Un lien vers une mission de stage (page.html#projet-…), ou n'importe quelle preuve de la
   section Compétences (projet E5/E6, veille, certification), ouvre un récapitulatif dans une
   petite fenêtre, sans quitter la page. Ctrl/Cmd + clic garde le comportement normal.
   Les flèches parcourent les autres missions du même groupe (même compétence, même liste). */
(function () {
  if (!window.fetch || !window.DOMParser || typeof HTMLDialogElement !== 'function') return;
  var selecteur = 'a[href*=".html#projet-"], .comp-preuves a';
  var pages = {};
  var charger = function (page) {
    if (!pages[page]) {
      pages[page] = fetch(page).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        idsProjets(doc);
        return doc;
      });
    }
    return pages[page];
  };
  var categorie = function (doc) {
    var h1 = doc.querySelector('main h1');
    var t = h1 ? h1.textContent.trim().replace(/^Mon\s+/i, '') : 'Mission';
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  var icones = {
    stages: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    projet: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    veille: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>'
  };
  var d = document.createElement('dialog');
  d.className = 'fiche fiche-mission';
  d.setAttribute('aria-labelledby', 'fiche-titre');
  d.innerHTML =
    '<button class="fiche-fermer" type="button" aria-label="Fermer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '<div class="fiche-tete"><span class="fiche-icone" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg></span>' +
    '<div><span class="fiche-cat"></span><h2 id="fiche-titre" class="fiche-titre"></h2></div></div>' +
    '<div class="fiche-corps"></div>' +
    '<div class="fiche-pied"><div class="fiche-nav"><button type="button" data-sens="-1" aria-label="Mission précédente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
    '<span class="fiche-compte"></span><button type="button" data-sens="1" aria-label="Mission suivante"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>' +
    '<a class="fiche-lien" href="#">Voir la mission en détail <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>';
  document.body.appendChild(d);
  var corps = d.querySelector('.fiche-corps');
  var liste = [], pos = 0;

  // Récupère le contenu de la fiche selon le type de preuve
  var texte = function (el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; };
  var resoudre = function (href, domaine) {
    var i = href.indexOf('#'), page = i < 0 ? href : href.slice(0, i), id = i < 0 ? '' : href.slice(i + 1);
    // mission de stage
    if (/^stage/.test(page) && /^projet-/.test(id)) {
      return charger(page).then(function (doc) {
        var a = doc.getElementById(id);
        if (!a) throw new Error('introuvable');
        var p = a.querySelector(':scope > p');
        return { type: 'stages', cat: categorie(doc), titre: texte(a.querySelector('h3')),
          resume: a.getAttribute('data-resume') || texte(p), tags: a.querySelector('ul.tags'),
          lien: href, libelle: 'Voir la mission en détail',
          note: 'Pour le détail de cette mission (étapes, outils, contexte), cliquez sur « Voir la mission en détail » : la page du stage s’ouvre directement dessus.' };
      });
    }
    // certification (carte de la section Certifications de l'accueil)
    if (id === 'certifications') {
      var surAccueil = document.getElementById('certifications');
      return (surAccueil ? Promise.resolve(document) : charger('index.html')).then(function (doc) {
        var c = doc.querySelector('#certifications .certif');
        if (!c) throw new Error('introuvable');
        var pdf = c.querySelector('a.lien-rapport');
        return { type: 'veille', cat: texte(c.querySelector('.certif-org')), titre: texte(c.querySelector('h3')),
          resume: texte(c.querySelector('.certif-desc')), etiquettes: [texte(c.querySelector('.certif-date'))],
          lien: pdf ? pdf.getAttribute('href') : 'index.html#certifications', libelle: 'Voir le certificat', note: '' };
      });
    }
    // projet E5 ou E6 : on lit sa carte sur la page de l'épreuve
    if (domaine === 'e5' || domaine === 'e6') {
      return charger(domaine + '.html').then(function (doc) {
        var a = null;
        [].some.call(doc.querySelectorAll('a[href="' + href + '"]'), function (l) { a = l.closest('article.projet'); return a; });
        if (!a) throw new Error('introuvable');
        var sec = a.closest('section'), h2 = sec && sec.querySelector('h2');
        var p = a.querySelector(':scope > p:not(.meta)');
        var apercu = a.querySelector('.projet-apercu img'); // image de la carte, reprise en tête de la fiche
        return { type: 'projet', cat: 'Épreuve ' + domaine.toUpperCase() + (h2 ? ' · ' + texte(h2) : ''),
          titre: texte(a.querySelector('h3')), resume: a.getAttribute('data-resume') || texte(p),
          tags: a.querySelector('ul.tags'), lien: href, libelle: 'Voir le projet en détail',
          image: apercu ? apercu.getAttribute('src') : null, logo: !!(apercu && apercu.closest('.apercu-logo')),
          note: 'Pour le détail de ce projet (étapes, outils, bilan), cliquez sur « Voir le projet en détail ».' };
      });
    }
    // autre page (veille) : titre et introduction de la page
    return charger(page).then(function (doc) {
      var h1 = doc.querySelector('main h1'), intro = doc.querySelector('.page-title p');
      var sec = doc.querySelector('main section'), h2 = sec && sec.querySelector('h2');
      return { type: 'veille', cat: texte(h1), titre: texte(h2) || texte(h1), resume: texte(intro),
        tags: sec && sec.querySelector('ul.tags'), lien: href, libelle: 'Voir la veille en détail',
        note: 'Pour le dispositif de veille, les articles et mon analyse, cliquez sur « Voir la veille en détail ».' };
    });
  };

  var dernier = 0;
  var afficher = function () {
    var el = liste[pos], href = el.href, domaine = el.domaine, jeton = ++dernier;
    d.querySelector('.fiche-compte').textContent = (pos + 1) + ' / ' + liste.length;
    d.querySelector('.fiche-nav').hidden = liste.length < 2;
    d.classList.add('fiche-charge');
    return resoudre(href, domaine).then(function (f) {
      // flèches pressées vite : seule la dernière mission demandée est affichée
      if (jeton !== dernier) return;
      d.setAttribute('data-d', domaine || (f.type === 'stages' ? 'stages' : ''));
      d.querySelector('.fiche-icone svg').innerHTML = icones[f.type];
      var lienFiche = d.querySelector('.fiche-lien');
      lienFiche.href = f.lien;
      lienFiche.firstChild.nodeValue = f.libelle + ' ';
      if (/\.pdf($|[?#])/i.test(f.lien)) { lienFiche.target = '_blank'; lienFiche.rel = 'noopener'; }
      else { lienFiche.removeAttribute('target'); lienFiche.removeAttribute('rel'); }
      d.querySelector('.fiche-cat').textContent = f.cat;
      d.querySelector('.fiche-titre').textContent = f.titre;
      corps.innerHTML = '';
      if (f.image) {
        var vignette = document.createElement('img');
        vignette.className = 'fiche-image' + (f.logo ? ' fiche-image-logo' : '');
        vignette.src = f.image; vignette.alt = '';
        corps.appendChild(vignette);
      }
      var bloc = document.createElement('div'); bloc.className = 'fiche-pratique';
      bloc.innerHTML = '<p class="fiche-sous">En bref</p><p class="fiche-resume"></p>';
      bloc.querySelector('.fiche-resume').textContent = f.resume;
      corps.appendChild(bloc);
      if (f.tags || f.etiquettes) {
        var t = document.createElement('ul'); t.className = 'fiche-tags';
        if (f.tags) t.innerHTML = f.tags.innerHTML;
        else f.etiquettes.forEach(function (x) { var li = document.createElement('li'); li.textContent = x; t.appendChild(li); });
        corps.appendChild(t);
      }
      if (f.note) { var note = document.createElement('p'); note.className = 'fiche-note'; note.textContent = f.note; corps.appendChild(note); }
      d.classList.remove('fiche-charge');
    }, function (err) {
      if (jeton === dernier) throw err; // une erreur sur une demande dépassée est ignorée
    });
  };
  // flèches : si la mission ne peut pas être chargée, on ouvre directement sa page
  var naviguer = function (sens) {
    pos = (pos + sens + liste.length) % liste.length;
    afficher().catch(function () { location.href = liste[pos].href; });
  };

  var ouvrir = function (lien) {
    var groupe = lien.closest('.preuves, .projets-pro, .plan-menu, section') || document.body;
    liste = [];
    var vus = [];
    var ajouter = function (h, dom) {
      var cle = h + '|' + dom;
      if (vus.indexOf(cle) < 0) { vus.push(cle); liste.push({ href: h, domaine: dom }); }
    };
    // data-fiches="page.html#projet-a page.html#projet-b" : le lien ouvre ces fiches, dans cet ordre
    if (lien.dataset.fiches) lien.dataset.fiches.split(/\s+/).forEach(function (h) { ajouter(h, ''); });
    else [].forEach.call(groupe.querySelectorAll(selecteur), function (a) { ajouter(a.getAttribute('href'), a.dataset.d || ''); });
    pos = Math.max(0, vus.indexOf(lien.getAttribute('href') + '|' + (lien.dataset.d || '')));
    return afficher().then(function () {
      if (!d.open) d.showModal();
      document.documentElement.classList.add('fiche-ouverte');
    });
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest(selecteur);
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0 || d.contains(a) || a.classList.contains('lien-direct')) return;
    e.preventDefault();
    ouvrir(a).catch(function () { location.href = a.href; });
  });
  d.addEventListener('click', function (e) {
    if (e.target === d || e.target.closest('.fiche-fermer')) d.close();
    var b = e.target.closest('.fiche-nav button');
    if (b) naviguer(Number(b.dataset.sens));
  });
  d.addEventListener('keydown', function (e) {
    if (liste.length < 2) return;
    if (e.key === 'ArrowRight') naviguer(1);
    if (e.key === 'ArrowLeft') naviguer(-1);
  });
  d.addEventListener('close', function () { document.documentElement.classList.remove('fiche-ouverte'); });
})();

/* ---------- Veille : fiches des articles ----------
   Les fiches défilent seules, lentement, même au survol. Le défilement s'arrête quelques
   secondes après une action (flèches, molette, doigt), quand une fiche est ouverte,
   et avec le bouton pause. Un clic sur une fiche l'ouvre dans une fenêtre. */
(function () {
  var liste = document.querySelector('.fiches-articles');
  if (!liste) return;
  var nav = liste.nextElementSibling;
  var fiches = [].slice.call(liste.querySelectorAll('.fiche-article'));
  var pos = 0, enPause = false, fin = false, repriseA = 0;
  var attendre = function (ms) { repriseA = Date.now() + ms; };
  var pas = function () { return fiches[0].offsetWidth + 16; };

  // bouton pause / lecture
  var bPause = document.createElement('button');
  bPause.type = 'button';
  bPause.className = 'fiches-pause';
  var majPause = function () {
    bPause.setAttribute('aria-label', enPause ? 'Lancer le défilement automatique' : 'Mettre en pause le défilement automatique');
    bPause.innerHTML = enPause
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';
  };
  majPause();
  nav.insertBefore(bPause, nav.children[1]); // entre les deux flèches

  // fenêtre de lecture
  var d = document.createElement('dialog');
  d.className = 'fiche fiche-veille';
  d.setAttribute('aria-labelledby', 'fa-titre');
  d.innerHTML =
    '<button class="fiche-fermer" type="button" aria-label="Fermer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '<div class="fiche-tete"><div><span class="fiche-cat"></span><h2 id="fa-titre" class="fiche-titre"></h2></div></div>' +
    '<div class="fiche-pratique"><p class="fiche-sous">Ce que j’en retiens</p><p class="fiche-resume"></p></div>' +
    '<p class="fiche-note"></p>' +
    '<div class="fiche-pied"><div class="fiche-nav"><button type="button" data-sens="-1" aria-label="Article précédent"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
    '<span class="fiche-compte"></span><button type="button" data-sens="1" aria-label="Article suivant"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>' +
    '<a class="fiche-lien" href="#">Lire l’article <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>';
  document.body.appendChild(d);
  var courant = 0;
  var afficher = function (i) {
    courant = (i + fiches.length) % fiches.length;
    var f = fiches[courant], lien = f.querySelector('h3 a'), ref = f.querySelector('.ref-page');
    d.querySelector('.fiche-cat').textContent = [].map.call(f.querySelectorAll('.fa-meta span'), function (s) { return s.textContent; }).join(' · ');
    d.querySelector('.fiche-titre').textContent = lien.textContent;
    d.querySelector('.fiche-resume').textContent = f.querySelector(':scope > p:not(.fa-meta)').textContent;
    d.querySelector('.fiche-note').textContent = ref ? 'Pages citées : ' + ref.textContent : '';
    d.querySelector('.fiche-note').hidden = !ref;
    d.querySelector('.fiche-lien').href = lien.href;
    d.querySelector('.fiche-compte').textContent = (courant + 1) + ' / ' + fiches.length;
  };
  fiches.forEach(function (f, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'fa-ouvrir';
    b.textContent = 'Lire la fiche';
    f.appendChild(b);
    f.addEventListener('click', function (e) {
      if (e.target.closest('a')) return; // le titre garde son lien vers l'article
      afficher(i);
      d.showModal();
      document.documentElement.classList.add('fiche-ouverte');
    });
  });
  d.addEventListener('click', function (e) {
    if (e.target === d || e.target.closest('.fiche-fermer')) d.close();
    var b = e.target.closest('.fiche-nav button');
    if (b) afficher(courant + Number(b.dataset.sens));
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') afficher(courant + 1);
    if (e.key === 'ArrowLeft') afficher(courant - 1);
  });
  // fiche refermée : le défilement reprend peu après
  d.addEventListener('close', function () { document.documentElement.classList.remove('fiche-ouverte'); attendre(1500); });

  // commandes
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b === bPause) { enPause = !enPause; majPause(); return; }
    attendre(5000);
    liste.scrollBy({ left: Number(b.dataset.sens) * pas(), behavior: 'smooth' });
  });
  ['wheel', 'touchstart', 'pointerdown'].forEach(function (t) {
    liste.addEventListener(t, function () { attendre(4000); }, { passive: true });
  });

  // défilement : environ 20 px par seconde, puis retour au début après une pause.
  // La boucle s'arrête quand les fiches sortent de l'écran ou que l'onglet est caché (aucun calcul inutile),
  // et le défilement attend tant que le focus clavier est sur une fiche (la fiche lue ne s'échappe pas).
  // Seul le focus visible (navigation au clavier) compte : après un clic, le focus rendu au bouton
  // « Lire la fiche » à la fermeture n'empêche pas la reprise.
  var avant = 0, visible = true, tourne = false;
  var relancer = function () {
    if (tourne || !visible || document.hidden) return;
    tourne = true; avant = 0;
    requestAnimationFrame(boucle);
  };
  var boucle = function (t) {
    if (!visible || document.hidden) { tourne = false; return; }
    var dt = Math.min(100, t - (avant || t)); avant = t; // en ms, borné si l'onglet a été mis de côté
    var max = liste.scrollWidth - liste.clientWidth;
    var actif = !enPause && !d.open && Date.now() > repriseA && max > 0 && !liste.matches(':focus-visible') && !liste.querySelector(':focus-visible');
    liste.classList.toggle('fiches-auto', actif);
    if (!actif) pos = liste.scrollLeft;
    else if (pos >= max - 1) {
      if (fin) { fin = false; liste.scrollTo({ left: 0, behavior: 'smooth' }); attendre(1500); }
      else { fin = true; attendre(2500); }
    } else {
      pos = Math.min(max, pos + dt * 0.02);
      liste.scrollLeft = pos;
    }
    requestAnimationFrame(boucle);
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      visible = e[e.length - 1].isIntersecting;
      relancer();
    }).observe(liste);
  }
  document.addEventListener('visibilitychange', relancer);
  relancer();
})();

/* ---- Fond animé discret : pistes de circuit imprimé parcourues par de petits paquets de données ----
   Toile fixe derrière tout le contenu ; très peu contrastée et estompée au centre pour ne pas gêner la lecture. */
(function () {
  var toile = document.createElement('canvas');
  if (!toile.getContext) return;
  toile.className = 'fond-circuit';
  toile.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(toile, document.body.firstChild);
  var ctx = toile.getContext('2d');
  var fixe = /[?&]capture\b/.test(location.search); // captures : pistes sans paquets
  var racine = document.documentElement;
  var G = 24;                                         // pas de la grille, aligné sur la grille de points
  var w = 0, h = 0, dpr = 1, pistes = [], paquets = [], calque = null, c1 = '', c2 = '';

  var lireCouleurs = function () {
    var s = getComputedStyle(racine);
    c1 = s.getPropertyValue('--node').trim() || '59,130,246';
    c2 = s.getPropertyValue('--node2').trim() || '99,102,241';
  };
  var hasard = function (a, b) { return a + Math.random() * (b - a); };

  // une piste : segments horizontaux / verticaux sur la grille, avec un petit chanfrein à 45° à chaque virage
  var creerPiste = function () {
    var x = Math.round(hasard(0, w) / G) * G, y = Math.round(hasard(0, h) / G) * G;
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    var d = dirs[Math.floor(Math.random() * 4)];
    var pts = [[x, y]], n = Math.floor(hasard(2, 5));
    for (var i = 0; i < n; i++) {
      var pas = Math.floor(hasard(3, 9)) * G;
      var nx = x + d[0] * pas, ny = y + d[1] * pas;
      if (nx < -G || nx > w + G || ny < -G || ny > h + G) break;
      x = nx; y = ny; pts.push([x, y]);
      var tour = Math.random() < 0.5 ? 1 : -1;
      var nd = d[0] ? [0, tour] : [tour, 0];
      x += (d[0] + nd[0]) * G / 2; y += (d[1] + nd[1]) * G / 2;
      pts.push([x, y]);
      d = nd;
    }
    if (pts.length < 3) return null;
    pts.pop(); // finit sur un segment droit
    var lg = [0];
    for (var j = 1; j < pts.length; j++) lg.push(lg[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
    return { pts: pts, lg: lg, total: lg[lg.length - 1], eclat: 0, bout: null, teinte: Math.random() < 0.35 ? 2 : 1 };
  };

  var point = function (p, s) {
    s = Math.max(0, Math.min(p.total, s));
    for (var i = 1; i < p.lg.length; i++) if (s <= p.lg[i]) {
      var t = (s - p.lg[i - 1]) / ((p.lg[i] - p.lg[i - 1]) || 1);
      return [p.pts[i - 1][0] + (p.pts[i][0] - p.pts[i - 1][0]) * t, p.pts[i - 1][1] + (p.pts[i][1] - p.pts[i - 1][1]) * t];
    }
    return p.pts[p.pts.length - 1];
  };

  // les pistes sont dessinées une fois dans un calque, recopié à chaque image
  var dessinerCalque = function () {
    calque = document.createElement('canvas');
    calque.width = w * dpr; calque.height = h * dpr;
    var c = calque.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.lineWidth = 1.2; c.lineJoin = 'round'; c.lineCap = 'round';
    pistes.forEach(function (p) {
      var col = p.teinte === 2 ? c2 : c1;
      c.strokeStyle = 'rgba(' + col + ',.13)';
      c.beginPath();
      p.pts.forEach(function (q, i) { if (i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); });
      c.stroke();
      // pastilles de soudure aux deux bouts
      [p.pts[0], p.pts[p.pts.length - 1]].forEach(function (q) {
        c.beginPath(); c.arc(q[0], q[1], 2.6, 0, Math.PI * 2);
        c.fillStyle = 'rgba(' + col + ',.10)'; c.fill();
        c.strokeStyle = 'rgba(' + col + ',.22)'; c.stroke();
      });
    });
  };

  var preparer = function () {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    toile.width = w * dpr; toile.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lireCouleurs();
    pistes = [];
    var voulu = Math.round(Math.min(42, Math.max(10, w * h / 34000)));
    for (var essais = 0; pistes.length < voulu && essais < voulu * 4; essais++) {
      var p = creerPiste(); if (p) pistes.push(p);
    }
    paquets = [];
    var nb = Math.max(3, Math.round(pistes.length / 4));
    for (var i = 0; i < nb; i++) paquets.push({ p: null, s: 0, v: 0, sens: true, attente: hasard(0, 4000) });
    dessinerCalque();
  };

  var avant = 0, enCours = false;
  var image = function (t) {
    enCours = false;
    var dt = Math.min(64, t - (avant || t)); avant = t;
    ctx.clearRect(0, 0, w, h);
    if (calque && calque.width && calque.height) ctx.drawImage(calque, 0, 0, w, h);
    if (fixe) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    paquets.forEach(function (k) {
      if (!k.p) {
        k.attente -= dt;
        if (k.attente <= 0 && pistes.length) {
          k.p = pistes[Math.floor(Math.random() * pistes.length)];
          k.s = 0; k.sens = Math.random() < 0.5; k.v = hasard(0.045, 0.09); // px par ms
        }
        return;
      }
      k.s += k.v * dt;
      var p = k.p, col = p.teinte === 2 ? c2 : c1;
      var pos = function (s) { return point(p, k.sens ? s : p.total - s); };
      // traînée de 34 px qui suit les coudes
      ctx.beginPath();
      var debut = Math.max(0, k.s - 34), fin = Math.min(k.s, p.total), q = pos(debut);
      ctx.moveTo(q[0], q[1]);
      for (var s = debut + 3; s < fin; s += 3) { q = pos(s); ctx.lineTo(q[0], q[1]); }
      q = pos(fin); ctx.lineTo(q[0], q[1]);
      ctx.strokeStyle = 'rgba(' + col + ',.38)'; ctx.lineWidth = 1.6; ctx.stroke();
      if (k.s <= p.total) {
        ctx.beginPath(); ctx.arc(q[0], q[1], 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + col + ',.75)'; ctx.fill();
      }
      if (k.s >= p.total + 34) { p.eclat = 1; p.bout = pos(p.total); k.p = null; k.attente = hasard(800, 4500); }
    });
    // la pastille d'arrivée s'allume brièvement
    pistes.forEach(function (p) {
      if (p.eclat <= 0 || !p.bout) return;
      p.eclat -= dt / 700;
      ctx.beginPath(); ctx.arc(p.bout[0], p.bout[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + (p.teinte === 2 ? c2 : c1) + ',' + (Math.max(0, p.eclat) * 0.45).toFixed(3) + ')'; ctx.fill();
    });
    lancer();
  };
  var lancer = function () {
    if (document.hidden) { avant = 0; return; }
    if (!enCours) { enCours = true; requestAnimationFrame(image); }
  };

  preparer();
  lancer();
  document.addEventListener('visibilitychange', lancer);
  var minuterie;
  window.addEventListener('resize', function () {
    // sur téléphone, la barre d'adresse fait varier la hauteur : on ne régénère que pour un vrai changement de taille
    clearTimeout(minuterie);
    minuterie = setTimeout(function () {
      if (Math.abs(window.innerWidth - w) > 40 || Math.abs(window.innerHeight - h) > 120) { preparer(); if (fixe) image(0); }
    }, 200);
  });
  // changement de thème : nouvelles couleurs
  var majTheme = function () { lireCouleurs(); dessinerCalque(); if (fixe) image(0); };
  new MutationObserver(majTheme).observe(racine, { attributes: true, attributeFilter: ['data-theme'] });
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', majTheme); } catch (e) {}
})();

/* ---- Compétences : filtre des preuves par domaine (Stages, E5, E6, Veille) ---- */
(function () {
  var section = document.getElementById('competences');
  var boutons = section ? section.querySelectorAll('.comp-filtres button') : [];
  if (!boutons.length) return;
  [].forEach.call(boutons, function (b) {
    b.addEventListener('click', function () {
      // un second clic sur le filtre actif revient à « Tout »
      var f = b.getAttribute('aria-pressed') === 'true' && b.dataset.filtre !== 'tout' ? 'tout' : b.dataset.filtre;
      section.setAttribute('data-filtre', f);
      [].forEach.call(boutons, function (x) { x.setAttribute('aria-pressed', x.dataset.filtre === f ? 'true' : 'false'); });
    });
  });
})();

/* ---------- Détail d'une mission de stage, dans une fenêtre ----------
   « Voir le détail » ouvre le contexte, les étapes et les captures dans une fenêtre au-dessus
   de la page, sans déplacer les autres missions. Les flèches passent d'une mission à l'autre.
   Sans <dialog>, le détail se déplie dans la carte (comportement natif de <details>). */
(function () {
  var details = [].slice.call(document.querySelectorAll('.detail-mission'));
  if (!details.length || typeof HTMLDialogElement !== 'function') return;
  var racine = document.documentElement;
  var d = document.createElement('dialog');
  d.className = 'fiche fiche-detail';
  d.setAttribute('aria-labelledby', 'detail-titre');
  d.innerHTML =
    '<button class="fiche-fermer" type="button" aria-label="Fermer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '<div class="fiche-tete"><div><span class="fiche-cat"></span><h2 id="detail-titre" class="fiche-titre"></h2></div></div>' +
    '<div class="detail-fenetre"></div>' +
    '<div class="fiche-pied"><div class="fiche-nav"><button type="button" data-sens="-1" aria-label="Mission précédente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
    '<span class="fiche-compte"></span><button type="button" data-sens="1" aria-label="Mission suivante"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div></div>';
  document.body.appendChild(d);
  var corps = d.querySelector('.detail-fenetre');
  var h1 = document.querySelector('main h1');
  var page = h1 ? h1.textContent.trim() : '';
  var pos = 0;

  var afficher = function (i) {
    pos = (i + details.length) % details.length;
    var carte = details[pos].closest('article');
    d.querySelector('.fiche-cat').textContent = page;
    d.querySelector('.fiche-titre').textContent = carte.querySelector('h3').textContent;
    corps.innerHTML = '';
    var resume = carte.querySelector(':scope > p');
    if (resume) { var p = document.createElement('p'); p.className = 'detail-resume'; p.textContent = resume.textContent; corps.appendChild(p); }
    var tags = carte.querySelector(':scope > ul.tags');
    if (tags) corps.appendChild(tags.cloneNode(true));
    corps.appendChild(details[pos].querySelector('.detail-corps').cloneNode(true));
    d.querySelector('.fiche-compte').textContent = (pos + 1) + ' / ' + details.length;
    d.querySelector('.fiche-nav').hidden = details.length < 2;
    d.scrollTop = 0;
  };
  var ouvrir = function (i) {
    afficher(i);
    if (!d.open) d.showModal();
    racine.classList.add('fiche-ouverte');
  };

  details.forEach(function (det, i) {
    det.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault(); // le détail ne se déplie plus dans la carte
      ouvrir(i);
    });
  });
  d.addEventListener('click', function (e) {
    if (e.target === d || e.target.closest('.fiche-fermer')) { d.close(); return; }
    var b = e.target.closest('.fiche-nav button');
    if (b) afficher(pos + Number(b.dataset.sens));
  });
  d.addEventListener('keydown', function (e) {
    if (racine.classList.contains('visionneuse-ouverte') || details.length < 2) return;
    if (e.key === 'ArrowRight') afficher(pos + 1);
    if (e.key === 'ArrowLeft') afficher(pos - 1);
  });
  d.addEventListener('close', function () { racine.classList.remove('fiche-ouverte'); });

  // arrivée sur une mission depuis une autre page (« Voir la mission en détail ») : sa fenêtre s'ouvre
  var cible = location.hash && document.getElementById(location.hash.slice(1));
  var i = cible ? details.indexOf(cible.querySelector('.detail-mission')) : -1;
  if (i >= 0) {
    details[i].open = false;
    window.addEventListener('load', function () { setTimeout(function () { ouvrir(i); }, 700); });
  }
})();
