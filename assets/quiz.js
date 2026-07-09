/* Quiz compartilhado do hub de cursos.
   Grava o desempenho no próprio aparelho (localStorage), por lição e por pergunta.
   Cada .quiz deve declarar: data-course, data-lesson, data-title.
   Cada .q deve declarar: data-correct (índice 0-based) e, opcional, data-note. */
(function () {
  var KEY = "learn.progress.v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { lessons: {} }; }
    catch (e) { return { lessons: {} }; }
  }
  function save(d) {
    d.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  }

  document.querySelectorAll(".quiz").forEach(function (quiz) {
    var course = quiz.dataset.course || "curso";
    var lesson = quiz.dataset.lesson || "0000";
    var title = quiz.dataset.title || document.title;
    var id = course + "/" + lesson;

    var qs = quiz.querySelectorAll(".q");
    var total = qs.length;
    var state = new Array(total).fill(null); // null = não respondida, true/false

    function record(qi, label, ok) {
      var d = load();
      var L = d.lessons[id] || { course: course, lesson: lesson, attempts: 0, questions: [] };
      L.title = title; L.total = total;
      L.questions[qi] = { n: qi + 1, label: label, lastCorrect: ok };
      d.lessons[id] = L; save(d);
    }

    function finalize() {
      var d = load(); var L = d.lessons[id]; if (!L) return;
      var correctCount = state.filter(Boolean).length;
      var at = new Date().toISOString();
      L.attempts = (L.attempts || 0) + 1;
      L.last = { correct: correctCount, at: at };
      if (!L.best || correctCount > L.best.correct) L.best = { correct: correctCount, at: at };
      d.lessons[id] = L; save(d);

      var tag = document.createElement("div");
      tag.style.cssText = "font-family:-apple-system,system-ui,sans-serif;font-size:.82rem;color:#15803d;margin-top:1rem;text-align:center;line-height:1.4";
      tag.innerHTML = "✓ Progresso salvo neste aparelho — <b>" + correctCount + "/" + total +
        "</b>.<br><a href=\"../../progresso/\" style=\"color:#15803d\">Ver “Meu progresso” →</a>";
      quiz.appendChild(tag);
    }

    qs.forEach(function (q, qi) {
      var correct = +q.dataset.correct;
      var note = q.dataset.note || "Fixado.";
      var pEl = q.querySelector("p");
      var label = (pEl ? pEl.textContent : "Pergunta " + (qi + 1)).trim();
      var opts = q.querySelectorAll(".opt");
      var fb = q.querySelector(".fb");

      opts.forEach(function (opt, i) {
        opt.addEventListener("click", function () {
          if (state[qi] !== null) return; // já respondida nesta sessão
          opts.forEach(function (o) { o.disabled = true; o.style.cursor = "default"; });
          var ok = (i === correct);
          state[qi] = ok;
          if (ok) {
            opt.classList.add("right");
            fb.textContent = "✓ Isso! " + note;
            fb.className = "fb ok";
          } else {
            opt.classList.add("wrong");
            opts[correct].classList.add("right");
            fb.textContent = "✗ A resposta certa está em verde. Releia a seção acima e entenda o porquê.";
            fb.className = "fb no";
          }
          record(qi, label, ok);
          if (state.every(function (s) { return s !== null; })) finalize();
        });
      });
    });
  });
})();
