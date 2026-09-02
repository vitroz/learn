/* Componente: cronômetro de timebox para sessões de modelagem.
   Uso: <div class="timebox" data-minutes="7"></div>  (+ assets/timebox.css)
   Presets 5/7/10/15 min, começar/pausar/zerar, bipe ao terminar. */
(function () {
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ":" + (r < 10 ? "0" : "") + r; }
  function beep() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.value = .15;
      o.start(); setTimeout(function () { o.stop(); ctx.close(); }, 600);
    } catch (e) {}
  }
  document.querySelectorAll(".timebox").forEach(function (el) {
    var total = (+el.dataset.minutes || 7) * 60, left = total, timer = null;
    var hint = el.dataset.hint || "Em silêncio, cada um escreve seus eventos. Ao bipe, parem e juntem.";
    el.innerHTML =
      '<div class="tb-presets"></div>' +
      '<div class="tb-clock">' + fmt(left) + '</div>' +
      '<div class="tb-ctl"><button class="tb-start">▶ Começar</button><button class="tb-reset" title="Zerar">↺</button></div>' +
      '<div class="tb-hint">' + hint + '</div>';
    var presets = el.querySelector(".tb-presets"), clock = el.querySelector(".tb-clock");
    var start = el.querySelector(".tb-start"), reset = el.querySelector(".tb-reset");
    [5, 7, 10, 15].forEach(function (m) {
      var b = document.createElement("button"); b.textContent = m + " min";
      if (m * 60 === total) b.className = "on";
      b.addEventListener("click", function () {
        total = m * 60; stop(); left = total; el.classList.remove("done"); clock.textContent = fmt(left);
        presets.querySelectorAll("button").forEach(function (x) { x.className = ""; }); b.className = "on";
      });
      presets.appendChild(b);
    });
    function stop() { if (timer) { clearInterval(timer); timer = null; } start.textContent = "▶ Começar"; el.classList.remove("running"); }
    function tick() {
      left -= 1; clock.textContent = fmt(Math.max(left, 0));
      if (left <= 0) { stop(); beep(); el.classList.add("done"); clock.textContent = "Tempo!"; }
    }
    start.addEventListener("click", function () {
      if (timer) { stop(); return; }
      if (left <= 0) left = total;
      el.classList.remove("done"); el.classList.add("running");
      start.textContent = "⏸ Pausar"; timer = setInterval(tick, 1000);
    });
    reset.addEventListener("click", function () { stop(); el.classList.remove("done"); left = total; clock.textContent = fmt(left); });
  });
})();
