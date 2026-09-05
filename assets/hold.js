/* ============================================================
   hold.js — segurar para avançar.

   Não sabe o que é uma etapa nem o que está sendo desembrulhado.
   Recebe uma lista de elementos, avisa o progresso, avisa quando
   todos foram segurados pelo tempo pedido. Soltar um zera todos.

   Usa Pointer Events de propósito. Misturar handlers touch* e mouse*
   quebra no iOS, que dispara um mousedown sintético depois do
   touchstart — dá para soltar o dedo e a barra continuar enchendo.
   E setPointerCapture mantém os eventos chegando quando o dedo
   escorrega para fora do círculo, que é o normal num gesto de segurar.
   ============================================================ */

(function (global) {
  'use strict';

  function createHoldGroup(pads, options) {
    var holdMs     = options.holdMs || 2200;
    var onProgress = options.onProgress || function () {};
    var onComplete = options.onComplete || function () {};

    var reduced = global.matchMedia
      && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var held     = pads.map(function () { return false; });
    var pointers = pads.map(function () { return null; });
    var startedAt = null;
    var rafId     = null;
    var finished  = false;
    var bound     = [];

    function on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      bound.push([target, type, fn, opts]);
    }

    function everyHeld() {
      for (var i = 0; i < held.length; i++) if (!held[i]) return false;
      return true;
    }

    function setHeld(i, value) {
      if (finished || held[i] === value) return;
      held[i] = value;
      pads[i].classList.toggle('is-held', value);
      if (everyHeld()) start(); else stop();
    }

    function start() {
      if (rafId !== null) return;
      startedAt = null;                      // fixado no primeiro frame
      rafId = requestAnimationFrame(frame);
    }

    function frame(now) {
      rafId = null;
      if (!everyHeld()) { stop(); return; }
      if (startedAt === null) startedAt = now;

      var pct = Math.min(1, (now - startedAt) / holdMs);

      /* Com movimento reduzido o preenchimento anda em degraus:
         o feedback continua (é essencial saber que está funcionando),
         mas sem animação contínua. */
      onProgress(reduced ? Math.round(pct * 8) / 8 : pct);

      if (pct >= 1) {
        finished = true;
        onProgress(1);
        onComplete();
        return;
      }
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      startedAt = null;
      if (!finished) onProgress(0);
    }

    pads.forEach(function (pad, i) {
      on(pad, 'pointerdown', function (e) {
        if (finished || pointers[i] !== null) return;
        e.preventDefault();
        pointers[i] = e.pointerId;
        try { pad.setPointerCapture(e.pointerId); } catch (err) { /* sem captura, tudo bem */ }
        setHeld(i, true);
      });

      function release(e) {
        if (pointers[i] !== e.pointerId) return;
        pointers[i] = null;
        setHeld(i, false);
      }
      on(pad, 'pointerup', release);
      on(pad, 'pointercancel', release);
      on(pad, 'lostpointercapture', release);

      /* Teclado: dá para desembrulhar a quatro mãos num notebook. */
      on(pad, 'keydown', function (e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();                  // evita o click sintético do <button>
        if (e.repeat) return;
        setHeld(i, true);
      });
      on(pad, 'keyup', function (e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        setHeld(i, false);
      });
      on(pad, 'blur', function () { setHeld(i, false); });
    });

    return {
      destroy: function () {
        stop();
        finished = true;
        bound.forEach(function (b) { b[0].removeEventListener(b[1], b[2], b[3]); });
        bound = [];
      }
    };
  }

  global.createHoldGroup = createHoldGroup;
})(window);
