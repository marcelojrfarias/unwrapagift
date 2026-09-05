/* ============================================================
   engine.js — o motor do desembrulho.

   Não sabe nada sobre casamento, lava-louças ou Bruna e Alexandre.
   Lê window.GIFT e desenha três tipos de tela: capa, etapa e revelação.

   O estado inteiro é um número:
     idx === -1              capa
     0 <= idx < steps.length etapa
     idx === steps.length    revelação
   ============================================================ */

(function (global) {
  'use strict';

  var GIFT = global.GIFT;

  var card      = document.getElementById('card');
  var progress  = document.getElementById('progress');
  var backBtn   = document.getElementById('back');
  var announcer = document.getElementById('announcer');

  var CIRCUMFERENCE = 245;          /* 2πr, r=39 — igual ao stroke-dasharray do CSS */

  /* Entre uma etapa e outra a tela não troca na hora: pede para soltarem,
     deixa a folha florescer no progresso e só então avança. Sem isso, o dedo
     dos dois fica cobrindo o texto que acabou de entrar. */
  var TRANSITION_MIN = 1000;        /* piso: tempo da animação de saída */
  var TRANSITION_MAX = 2800;        /* teto: se não soltarem, vai assim mesmo */

  var idx      = -1;
  var hold     = null;
  var waiting  = null;              /* callback esperando os dedos saírem */
  var artState = {};                /* src -> true (existe) | false (não existe) */

  var supportsMask = !!(global.CSS && CSS.supports && (
    CSS.supports('mask-image', 'url(a.png)') ||
    CSS.supports('-webkit-mask-image', 'url(a.png)')
  ));

  var lastStep = function () { return GIFT.steps.length; };
  var onStep   = function () { return idx >= 0 && idx < GIFT.steps.length; };
  var onReveal = function () { return idx === lastStep(); };

  /* ---------- montagem única ---------- */

  function buildProgress() {
    var html = '';
    for (var i = 0; i < GIFT.steps.length; i++) {
      html +=
        '<button class="leaf" type="button" data-i="' + i + '" disabled ' +
                'aria-label="Voltar para a etapa ' + (i + 1) + '">' +
          '<svg viewBox="0 0 14 14" aria-hidden="true">' +
            '<path class="blade" d="M7 1.2C9.5 4.4 9.5 9.6 7 12.8 4.5 9.6 4.5 4.4 7 1.2Z"/>' +
            '<path class="vein" d="M7 2.4V11.6"/>' +
          '</svg>' +
        '</button>';
    }
    progress.innerHTML = html;
    progress.addEventListener('click', function (e) {
      var leaf = e.target.closest('.leaf');
      if (!leaf || leaf.disabled) return;
      go(parseInt(leaf.dataset.i, 10));
    });
  }

  /* ---------- pedaços de tela ---------- */

  function artSlot(src, delay) {
    if (!src || artState[src] === false) return '';
    return '<div data-art="' + src + '" data-delay="' + delay + '"></div>';
  }

  /* Impressão digital: arcos concêntricos, mesmo traço fino do resto do site. */
  var FINGERPRINT =
    '<svg class="pad__print" viewBox="0 0 32 36" aria-hidden="true">' +
      '<path d="M3.6 30.2V25.6a12.4 13.4 0 0 1 24.8 0v4.6"/>' +
      '<path d="M7.2 32.2V26a8.8 10.2 0 0 1 17.6 0v6.2"/>' +
      '<path d="M10.8 33.8V26.4a5.2 7 0 0 1 10.4 0v7.4"/>' +
      '<path d="M14.4 34.6V27a1.6 3.6 0 0 1 3.2 0v7.6"/>' +
    '</svg>';

  function padsBlock(label, delay) {
    var people = GIFT.recipients;

    var pads = people.map(function (person, i) {
      return '<div class="pad-slot">' +
        '<button class="pad" type="button" data-pad="' + i + '" ' +
                'aria-label="Segurar: ' + person.name + '">' +
          '<svg class="pad__ring" viewBox="0 0 84 84" aria-hidden="true">' +
            '<circle class="ring" cx="42" cy="42" r="39"/>' +
            '<circle class="fill" cx="42" cy="42" r="39"/>' +
          '</svg>' +
          FINGERPRINT +
        '</button>' +
        '<span class="pad__name">' + (person.short || person.name) + '</span>' +
      '</div>';
    }).join('');

    var note = people.length > 1
      ? 'Os dois ao mesmo tempo. Encostem e segurem.'
      : 'Encoste e segure.';

    return '<div class="cta rise ' + delay + '">' +
             '<p class="cta__label">' + label + '</p>' +
             '<div class="pads">' + pads + '</div>' +
             '<p class="note">' + note + '</p>' +
           '</div>';
  }

  function screen() {
    if (idx < 0) {
      var c = GIFT.cover;
      return '<p class="eyebrow rise d1">' + c.eyebrow + '</p>' +
             '<h1 class="rise d1">' + c.title + '</h1>' +
             '<div class="hair rise d2"></div>' +
             '<p class="desc rise d2">' + c.desc + '</p>' +
             padsBlock(c.cta, 'd3');
    }

    if (onStep()) {
      var s = GIFT.steps[idx];
      return '<h2 class="rise d1">' + s.title + '</h2>' +
             (s.desc ? '<p class="desc rise d2">' + s.desc + '</p>' : '') +
             artSlot(s.img, 'd3') +
             padsBlock(s.cta, 'd4');
    }

    var r = GIFT.reveal;
    return '<p class="gift__kind rise d1">' + r.kind + '</p>' +
           '<h2 class="gift__name rise d1">' + r.name + '</h2>' +
           artSlot(r.img, 'd2') +
           '<p class="gift__msg rise d2">' + r.msg + '</p>' +
           (r.signoff ? '<p class="signoff rise d3">' + r.signoff + '</p>' : '') +
           '<p class="signature rise d3">' + r.signature + '</p>';
  }

  /* ---------- ilustrações ----------
     A imagem só entra no DOM depois de carregar. Se o arquivo não
     existir, a tela fica só com o texto e o layout não abre buraco —
     assim o site pode ir ao ar antes das ilustrações ficarem prontas. */

  function loadArt() {
    Array.prototype.forEach.call(card.querySelectorAll('[data-art]'), function (slot) {
      var src = slot.getAttribute('data-art');
      var img = new Image();

      img.onload = function () {
        artState[src] = true;
        if (!slot.parentNode) return;
        slot.className = 'art rise ' + slot.getAttribute('data-delay');
        slot.innerHTML = supportsMask
          ? '<div class="art__mask" style="--art-src:url(' + src + ')"></div>'
          : '<img src="' + src + '" alt="">';
      };
      img.onerror = function () {
        artState[src] = false;
        if (slot.parentNode) slot.parentNode.removeChild(slot);
      };
      img.src = src;
    });
  }

  /* ---------- render ---------- */

  function render() {
    if (hold) { hold.destroy(); hold = null; }
    waiting = null;

    card.classList.remove('is-entering', 'is-leaving');
    card.classList.toggle('is-reveal', onReveal());
    card.innerHTML = screen();
    void card.offsetWidth;                     /* reinicia as animações */
    card.classList.add('is-entering');

    syncChrome();
    loadArt();

    if (idx < lastStep()) mountHold();      /* capa e etapas; a revelação não tem pads */
    if (onReveal()) global.setTimeout(celebrate, 600);

    global.scrollTo(0, 0);
    announce();
  }

  function syncChrome() {
    progress.classList.toggle('is-visible', onStep());
    progress.setAttribute('aria-hidden', onStep() ? 'false' : 'true');
    backBtn.classList.toggle('is-visible', idx >= 0);

    Array.prototype.forEach.call(progress.children, function (leaf) {
      var i = parseInt(leaf.dataset.i, 10);
      leaf.classList.toggle('is-done', i < idx);
      leaf.classList.toggle('is-current', i === idx);
      leaf.disabled = i >= idx;                /* só volta, nunca pula */
    });
  }

  function mountHold() {
    var pads  = Array.prototype.slice.call(card.querySelectorAll('.pad'));
    var fills = pads.map(function (pad) { return pad.querySelector('.fill'); });

    hold = global.createHoldGroup(pads, {
      holdMs: GIFT.holdMs,
      onProgress: function (pct) {
        var offset = CIRCUMFERENCE - CIRCUMFERENCE * pct;
        fills.forEach(function (fill) { fill.style.strokeDashoffset = offset; });
      },
      onComplete: function () {
        if (global.navigator.vibrate) global.navigator.vibrate(18);
        beginTransition();
      },
      onRelease: function (stillHeld) {
        if (stillHeld === 0 && waiting) { var done = waiting; waiting = null; done(); }
      }
    });
  }

  /* Sai da tela atual, pede para soltarem, avança quando soltarem — ou no teto. */
  function beginTransition() {
    var target  = idx + 1;
    var startedAt = performance.now();
    var settled = false;

    card.classList.add('is-leaving');

    var note = card.querySelector('.note');
    if (note) {
      note.textContent = GIFT.recipients.length > 1 ? 'Podem soltar.' : 'Pode soltar.';
    }

    /* a folha desta etapa floresce enquanto a tela sai */
    var leaf = idx >= 0 ? progress.children[idx] : null;
    if (leaf) leaf.classList.add('is-done', 'is-blooming');

    function finish() {
      if (settled) return;
      settled = true;
      global.clearTimeout(ceiling);
      waiting = null;
      go(target);
    }

    var ceiling = global.setTimeout(finish, TRANSITION_MAX);

    waiting = function () {
      var elapsed = performance.now() - startedAt;
      global.setTimeout(finish, Math.max(0, TRANSITION_MIN - elapsed));
    };

    /* se já estavam com os dedos fora (teclado, por exemplo), não espera */
    if (hold && hold.heldCount() === 0) waiting();
  }

  function announce() {
    if (!announcer) return;
    var text = idx < 0 ? GIFT.cover.eyebrow
             : onStep() ? GIFT.steps[idx].title
             : GIFT.reveal.name;
    announcer.textContent = text.replace(/<[^>]*>/g, ' ');
  }

  function go(next) {
    idx = Math.max(-1, Math.min(lastStep(), next));
    render();
  }

  /* ---------- confetes ---------- */

  function celebrate() {
    if (global.navigator.vibrate) global.navigator.vibrate([16, 60, 16]);

    var reduced = global.matchMedia
      && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    var canvas = document.getElementById('confetti');
    var ctx    = canvas.getContext('2d');
    var dpr    = Math.min(global.devicePixelRatio || 1, 2);

    var colors = getComputedStyle(document.documentElement)
      .getPropertyValue('--confetti')
      .split(',')
      .map(function (c) { return c.trim(); })
      .filter(Boolean);

    var w, h;
    function size() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    global.addEventListener('resize', size);

    var pieces = [];
    for (var i = 0; i < 90; i++) {
      pieces.push({
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.6,
        w: 3 + Math.random() * 5,
        h: 6 + Math.random() * 8,
        vy: 1.3 + Math.random() * 2.2,
        vx: -0.6 + Math.random() * 1.2,
        angle: Math.random() * Math.PI * 2,
        spin: -0.05 + Math.random() * 0.1,
        color: colors[(Math.random() * colors.length) | 0]
      });
    }

    var LIFE = 4600, FADE_AT = 3200, t0 = performance.now();

    (function loop(now) {
      var elapsed = now - t0;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = elapsed > FADE_AT
        ? Math.max(0, 1 - (elapsed - FADE_AT) / (LIFE - FADE_AT))
        : 1;

      pieces.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < LIFE) requestAnimationFrame(loop);
      else {
        ctx.clearRect(0, 0, w, h);
        global.removeEventListener('resize', size);
      }
    })(t0);
  }

  /* ---------- início ---------- */

  document.documentElement.dataset.theme = GIFT.theme || 'default';
  document.title = 'Um presente para ' + GIFT.recipients.map(function (p) {
    return p.name;
  }).join(' e ');

  backBtn.addEventListener('click', function () { go(idx - 1); });

  buildProgress();
  render();
})(window);
