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
  var waves       = document.getElementById('waves');
  var wavesStatus = document.getElementById('wavesStatus');
  var wavesSprig  = document.getElementById('wavesSprig');
  var wavesNote   = document.getElementById('wavesNote');
  var progress  = document.getElementById('progress');
  var backBtn   = document.getElementById('back');
  var announcer = document.getElementById('announcer');

  var CIRCUMFERENCE = 245;          /* 2πr, r=39 — igual ao stroke-dasharray do CSS */

  /* Entre uma etapa e outra a tela não troca na hora: pede para soltarem,
     deixa a folha florescer no progresso e só então avança. Sem isso, o dedo
     dos dois fica cobrindo o texto que acabou de entrar. */
  var LEAF = 'M7 1.2C9.5 4.4 9.5 9.6 7 12.8 4.5 9.6 4.5 4.4 7 1.2Z';

  var CONFIRM_MS = 340;             /* beat com o disco cheio antes da onda partir */
  var WAVE_MS    = 680;             /* cada onda, do centro do círculo até o canto */
  var WAVE_GAP   = 170;             /* atraso entre as duas: separa as frentes */
  var GOLD_MIN   = 1000;            /* piso com a tela dourada: tempo de ler o rótulo */
  var GOLD_MAX   = 2000;            /* teto: se não soltarem, segue mesmo assim */
  var HANDOFF_MS = 380;             /* quanto o conteúdo novo entra antes de o papel sair */
  var PLAIN_MIN  = 1000;            /* mesma espera, quando o movimento é reduzido */
  var PLAIN_MAX  = 2800;

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
            '<path class="blade" d="' + LEAF + '"/>' +
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
        '<span class="pad__name">' + (person.short || person.name) + '</span>' +
        '<button class="pad" type="button" data-pad="' + i + '" ' +
                'aria-label="Segurar: ' + person.name + '">' +
          '<svg class="pad__ring" viewBox="0 0 84 84" aria-hidden="true">' +
            '<circle class="ring" cx="42" cy="42" r="39"/>' +
            '<circle class="fill" cx="42" cy="42" r="39"/>' +
          '</svg>' +
          FINGERPRINT +
        '</button>' +
      '</div>';
    }).join('');

    /* Um texto só, acima dos círculos. Na capa ele ensina a mecânica; nas
       etapas vira a escada de CTAs, que é o que cria a antecipação. O texto
       vem sempre do arquivo de conteúdo, então quem escreve o presente ajusta
       singular e plural conforme o número de destinatários. */
    return '<div class="cta rise ' + delay + '">' +
             '<p class="note">' + label + '</p>' +
             '<div class="pads">' + pads + '</div>' +
           '</div>';
  }

  function screen() {
    if (idx < 0) {
      var c = GIFT.cover;
      return '<p class="eyebrow rise d1">' + c.eyebrow + '</p>' +
             '<h1 class="rise d1">' + c.title + '</h1>' +
             '<div class="hair rise d2"></div>' +
             '<p class="desc rise d2">' + c.desc + '</p>' +
             artSlot(c.img, 'd3') +
             padsBlock(c.cta, 'd4');
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
        var ratio = img.naturalHeight ? (img.naturalWidth / img.naturalHeight) : 1;
        slot.className = 'art rise ' + slot.getAttribute('data-delay');
        slot.innerHTML = supportsMask
          ? '<div class="art__mask" style="--art-src:url(' + src + ');--art-ratio:' + ratio + '"></div>'
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
    card.classList.toggle('is-cover', idx < 0);
    card.innerHTML = screen();
    void card.offsetWidth;                     /* reinicia as animações */
    card.classList.add('is-entering');

    document.body.classList.toggle('has-controls', idx < lastStep());
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
        /* deixa o disco cheio à mostra por um instante antes de a onda cobrir */
        pads.forEach(function (p) { p.classList.add('is-sealed'); });
        global.setTimeout(beginTransition, CONFIRM_MS);
      },
      onRelease: function (stillHeld) {
        if (stillHeld === 0 && waiting) { var done = waiting; waiting = null; done(); }
      }
    });
  }

  function reducedMotion() {
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* Distância do ponto até o canto mais longe: o raio que a onda tem que cobrir. */
  function reach(x, y) {
    var w = global.innerWidth, h = global.innerHeight;
    return Math.max(
      Math.hypot(x, y),         Math.hypot(w - x, y),
      Math.hypot(x, h - y),     Math.hypot(w - x, h - y)
    );
  }

  function padCenters() {
    return Array.prototype.map.call(card.querySelectorAll('.pad'), function (pad) {
      var r = pad.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  }

  function spawnWaves(origins, color, plain) {
    origins.forEach(function (o, i) {
      var r  = reach(o.x, o.y);
      var el = document.createElement('div');
      el.className = 'wave' + (plain ? ' wave--plain' : '');
      el.style.cssText =
        'left:'   + (o.x - r) + 'px;top:' + (o.y - r) + 'px;' +
        'width:'  + (2 * r)   + 'px;height:' + (2 * r) + 'px;' +
        'background:' + color;
      waves.appendChild(el);

      el.animate(
        [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
        { duration: WAVE_MS, delay: i * WAVE_GAP,
          easing: 'cubic-bezier(.25,.6,.3,1)', fill: 'forwards' }
      );
    });
    return WAVE_MS + Math.max(0, origins.length - 1) * WAVE_GAP;
  }

  /* O mesmo raminho do topo, maior, com a folha recém-concluída enchendo.
     Saindo da capa nada foi vencido ainda: aparece vazio, como empty state.
     (Esconder não funcionaria: o display:flex do elemento vence o atributo
     hidden e sobrava a haste solta na tela.) */
  function buildWaveSprig(doneIdx) {
    var tag = 'w' + Date.now().toString(36);
    var html = '';
    for (var i = 0; i < GIFT.steps.length; i++) {
      var id = tag + i;
      html +=
        '<span class="wleaf' + (i < doneIdx ? ' is-done' : '') + '" data-i="' + i + '">' +
          '<svg viewBox="0 0 14 14" aria-hidden="true">' +
            '<clipPath id="' + id + '">' +
              '<rect class="wfill" x="-2" y="0" width="18" height="14"/>' +
            '</clipPath>' +
            '<path class="wblade" d="' + LEAF + '"/>' +
            '<path class="wblade-full" d="' + LEAF + '" clip-path="url(#' + id + ')"/>' +
            '<path class="wvein" d="M7 2.4V11.6"/>' +
          '</svg>' +
        '</span>';
    }
    wavesSprig.innerHTML = html;

    /* no frame seguinte, para a transição do preenchimento acontecer */
    if (doneIdx < 0) return;                /* capa: raminho vazio, nada a encher */

    var target = wavesSprig.querySelector('[data-i="' + doneIdx + '"]');
    if (target) requestAnimationFrame(function () {
      requestAnimationFrame(function () { target.classList.add('is-filling'); });
    });
  }

  function themeColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* Espera os dedos saírem, entre um piso e um teto, e então segue. */
  function awaitRelease(min, max, then) {
    var settled = false;
    function finish() {
      if (settled) return;
      settled = true;
      global.clearTimeout(ceiling);
      waiting = null;
      then();
    }
    var ceiling = global.setTimeout(finish, max);
    waiting = function () { global.setTimeout(finish, min); };
    if (hold && hold.heldCount() === 0) waiting();
  }

  /* A onda dourada vaza dos círculos e toma a tela; a de papel devolve o fundo.
     O conteúdo novo entra com o papel já cobrindo tudo, então a troca não aparece. */
  function beginTransition() {
    var target  = idx + 1;
    var origins = padCenters();

    if (reducedMotion() || !origins.length || !waves.animate && !Element.prototype.animate) {
      card.classList.add('is-leaving');
      awaitRelease(PLAIN_MIN, PLAIN_MAX, function () { go(target); });
      return;
    }

    waves.hidden = false;
    waves.innerHTML = '';
    var rising = spawnWaves(origins, themeColor('--gold-wave'), false);

    global.setTimeout(function () {
      /* O rótulo diz o que está acontecendo. Ninguém segura um botão enquanto
         lê que algo está em andamento — não precisa mandar soltar. */
      wavesNote.textContent = GIFT.unwrappingLabel || 'Desembrulhando…';
      buildWaveSprig(idx);            /* idx é a etapa que acabou de ser vencida */
      wavesStatus.classList.remove('is-off');
      wavesStatus.classList.add('is-on');

      awaitRelease(GOLD_MIN, GOLD_MAX, function () {
        wavesStatus.classList.remove('is-on');
        wavesStatus.classList.add('is-off');
        var falling = spawnWaves(origins, themeColor('--paper-wave'), true);

        /* O conteúdo já começa a entrar por baixo do papel: quando o overlay
           sai, ele aparece em movimento, sem o beat de tela vazia. */
        global.setTimeout(function () { go(target); },
                          Math.max(0, falling - HANDOFF_MS));

        global.setTimeout(function () {
          waves.innerHTML = '';
          waves.hidden = true;
        }, falling);
      });
    }, rising);
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
