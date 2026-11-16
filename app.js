/* PromptVideo — pagina pulita: da immagine o da testo → prompt IT + EN, con arricchimimento extra */
(function () {
  "use strict";

  var state = {
    mode: "img",            // "img" | "txt"
    image: null,            // dataURL
    caption: "",
    idea: "",
    opts: { style: "cinematic", cam: "dolly", dur: "10", ratio: "9:16" },
    level: 0,               // 0 base, 1 arricchito, 2 massimo
    made: { it: false, en: false }
  };

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- testi delle opzioni (IT / EN) ---------- */
  var OPTS = {
    style: {
      cinematic: {
        it: "Stile cinematografico: luce dorata naturale, profondita' di campo ridotta con bokeh, color grading caldo, 24 fps.",
        en: "Cinematic style: warm golden natural light, shallow depth of field with bokeh, warm color grading, 24 fps.",
        gradeIt: "Color grading: toni caldi, ombre morbide, alte luci leggermente alte.",
        gradeEn: "Color grading: warm tones, soft shadows, slightly lifted highlights."
      },
      dynamic: {
        it: "Stile dinamico ed energico: luci al neon, contrasto alto, movimento accentuato, ritmo veloce.",
        en: "Dynamic energetic style: neon lights, high contrast, emphasized motion, fast pace.",
        gradeIt: "Color grading: contrastato, neri profondi, accenti al neon.",
        gradeEn: "Color grading: punchy contrast, deep blacks, neon accents."
      },
      minimal: {
        it: "Stile minimal: sfondo pulito, luci morbide e uniformi, palette pastello, composizione simmetrica.",
        en: "Minimal style: clean background, soft even lighting, pastel palette, symmetrical composition.",
        gradeIt: "Color grading: pulito e arioso, quasi desaturato.",
        gradeEn: "Color grading: clean and airy, slightly desaturated."
      },
      vintage: {
        it: "Stile vintage: grana di pellicola 16mm, colori sbiaditi, vignettatura, look analogico.",
        en: "Vintage style: 16mm film grain, faded colors, vignette, analog look.",
        gradeIt: "Color grading: toni sbiaditi da pellicola, léger velo caldo.",
        gradeEn: "Color grading: faded film tones, warm haze."
      }
    },
    cam: {
      dolly:  { it: "Dolly-in lento e continuo verso il soggetto.", en: "Slow continuous dolly-in toward the subject." },
      orbit:  { it: "Orbita lenta di 360 gradi attorno al soggetto.", en: "Slow 360-degree orbit around the subject." },
      pan:    { it: "Pan laterale fluido da sinistra a destra.", en: "Smooth lateral pan from left to right." },
      static: { it: "Inquadratura fissa con camera stabile.", en: "Locked-off shot with a stable camera." }
    },
    dur: {
      "5":  { it: "Durata totale: 5 secondi", en: "Total duration: 5 seconds" },
      "10": { it: "Durata totale: 10 secondi", en: "Total duration: 10 seconds" },
      "15": { it: "Durata totale: 15 secondi", en: "Total duration: 15 seconds" },
      "30": { it: "Durata totale: 30 secondi", en: "Total duration: 30 seconds" }
    },
    ratio: {
      "9:16": { it: "formato verticale 9:16, ideale per Reels e Shorts", en: "vertical 9:16 format, ideal for Reels and Shorts" },
      "16:9": { it: "formato panoramico 16:9", en: "widescreen 16:9 format" },
      "1:1":  { it: "formato quadrato 1:1", en: "square 1:1 format" }
    }
  };

  /* ---------- costruzione del prompt ---------- */
  function baseText(L) {
    if (state.mode === "img") {
      if (state.caption) {
        return L === "it"
          ? 'L\'immagine allegata mostra: "' + state.caption + '". L\'immagine e\' il riferimento visivo di tutta la scena.'
          : 'The attached image shows: "' + state.caption + '". The image is the visual reference for the whole scene.';
      }
      return L === "it"
        ? "L'immagine allegata e' il riferimento visivo di tutta la scena."
        : "The attached image is the visual reference for the whole scene.";
    }
    return L === "it"
      ? 'La scena da rappresentare: "' + state.idea + '".'
      : 'The scene to depict: "' + state.idea + '".';
  }

  function buildPrompt(lang, level) {
    var L = lang === "it" ? "it" : "en";
    var it = L === "it";
    var o = state.opts;
    var st = OPTS.style[o.style];
    var d = parseInt(o.dur, 10);
    var lines = [];

    lines.push(it ? "SCENA" : "SCENE");
    lines.push(baseText(L));
    lines.push(it
      ? "Il soggetto principale si muove in modo naturale, fluido e credibile, come nella realta'."
      : "The main subject moves naturally, smoothly and believably, as in real life.");

    lines.push("");
    lines.push(it ? "STILE" : "STYLE");
    lines.push(st[L]);

    lines.push("");
    lines.push(it ? "CAMERA" : "CAMERA");
    lines.push(OPTS.cam[o.cam][L]);
    if (level >= 2) {
      lines.push(it
        ? "Ottica: 35mm per le inquadrature ampie, 85mm per i dettagli ravvicinati."
        : "Lenses: 35mm for wide shots, 85mm for close-up details.");
    }

    lines.push("");
    lines.push(it ? "LUCE" : "LIGHTING");
    if (level >= 1) {
      lines.push(it
        ? "Set luci: key light morbida a 45 gradi, fill leggera, rim light per staccare il soggetto dallo sfondo."
        : "Lighting setup: soft key light at 45 degrees, gentle fill, rim light to separate the subject from the background.");
    } else {
      lines.push(it
        ? "Illuminazione morbida e naturale che segue l'azione della scena."
        : "Soft natural lighting that follows the action of the scene.");
    }

    lines.push("");
    lines.push(it ? "DURATA E FORMATO" : "DURATION & FORMAT");
    lines.push(OPTS.dur[o.dur][L] + ", " + OPTS.ratio[o.ratio][L] + ".");

    if (level >= 1) {
      var a = Math.max(1, Math.round(d / 3));
      var b = Math.max(a + 1, Math.round((2 * d) / 3));
      lines.push("");
      lines.push(it ? "STRUTTURA IN 3 TEMPI" : "3-ACT STRUCTURE");
      lines.push(it
        ? "0-" + a + "s: introduzione della scena e del soggetto; " + a + "-" + b + "s: sviluppo dell'azione principale; " + b + "-" + d + "s: chiusura con enfasi sul dettaglio chiave. Transizioni morbide, nessun taglio netto."
        : "0-" + a + "s: introduction of scene and subject; " + a + "-" + b + "s: development of the main action; " + b + "-" + d + "s: closing with emphasis on the key detail. Smooth transitions, no hard cuts.");
      lines.push("");
      lines.push(it ? "COLOR E AUDIO" : "COLOR & AUDIO");
      lines.push(st[it ? "gradeIt" : "gradeEn"]);
      lines.push(it
        ? "Audio suggerito: musica soft in sottofondo, nessun parlato."
        : "Suggested audio: soft background music, no voiceover.");
    }

    if (level >= 2) {
      lines.push("");
      lines.push(it ? "FOTOGRAMMI CHIAVE" : "KEY FRAMES");
      lines.push(it
        ? "Fotogramma di apertura: la scena parte calma, con il soggetto appena accennato."
        : "Opening frame: the scene starts calm, with the subject only hinted at.");
      lines.push(it
        ? "Fotogramma di chiusura: macchina da presa ferma sul dettaglio piu' importante della scena."
        : "Closing frame: camera locked on the most important detail of the scene.");
      lines.push(it
        ? "Dettagli sensoriali extra:/play di luci, particelle in sospensione nell'aria, micro-movimenti naturali (respiro, tissu che si muove)."
        : "Extra sensory details: play of light, particles floating in the air, natural micro-movements (breathing, moving fabric).");
    }

    lines.push("");
    lines.push(it ? "QUALITA'" : "QUALITY");
    lines.push(it
      ? "8K, ultra dettagliato, fotorealistico, ottica premium, movimento fluido."
      : "8K, ultra detailed, photorealistic, premium lens, smooth motion.");

    lines.push("");
    lines.push(it ? "NEGATIVO" : "NEGATIVE PROMPT");
    lines.push(it
      ? "Nessun testo a schermo, nessun watermark, nessuna deformita', nessun morphing, nessun cambio di vestiti, nessun flicker, mani perfette."
      : "No on-screen text, no watermark, no deformities, no morphing, no outfit change, no flicker, perfect hands.");

    return lines.join("\n");
  }

  /* ---------- UI ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }

  function currentInput() {
    if (state.mode === "img") {
      if (!state.image) return null;
      return state.caption || "(immagine senza descrizione)";
    }
    return state.idea.trim() || null;
  }

  function requireInput() {
    if (state.mode === "img" && !state.image) {
      toast("Carica prima un'immagine 🙂");
      $("#drop").classList.add("shake");
      setTimeout(function () { $("#drop").classList.remove("shake"); }, 350);
      return false;
    }
    if (state.mode === "txt" && !state.idea.trim()) {
      toast("Scrivi prima una frase con la tua idea ✏️");
      var f = $("#idea");
      f.classList.add("shake");
      f.focus();
      setTimeout(function () { f.classList.remove("shake"); }, 350);
      return false;
    }
    return true;
  }

  function generate(lang) {
    if (!requireInput()) return;
    state.level = 0;
    state.made[lang] = true;
    render(lang);
    $("#out").hidden = false;
    $("#btnMore").disabled = false;
    $("#btnMore").textContent = "＋ Arricchisci ulteriormente";
    if (state.mode === "img") $("#imgNote").hidden = false;
    toast(lang === "it" ? "Prompt in italiano pronto ✅" : "English prompt ready ✅");
  }

  function render(lang) {
    var el = lang === "it" ? $("#promptIT") : $("#promptEN");
    el.textContent = buildPrompt(lang, state.level);
  }

  function renderAll() {
    if (state.made.it) render("it");
    if (state.made.en) render("en");
  }

  function enrich() {
    if (!state.made.it && !state.made.en) {
      if (!requireInput()) return;
      state.made.it = true;
      state.made.en = true;
      $("#out").hidden = false;
      if (state.mode === "img") $("#imgNote").hidden = false;
    }
    if (state.level < 2) {
      state.level += 1;
      renderAll();
      if (state.level === 2) {
        $("#btnMore").disabled = true;
        $("#btnMore").textContent = "✓ Prompt al massimo dell'arricchimimento";
      }
      toast(state.level === 1 ? "Prompt arricchito (livello 1) ✨" : "Prompt arricchito al massimo (livello 2) ✨");
    }
  }

  /* ---------- eventi ---------- */
  $$(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      $$(".tab").forEach(function (t) { t.classList.remove("is-on"); });
      tab.classList.add("is-on");
      state.mode = tab.dataset.tab;
      $("#panel-img").classList.toggle("is-on", state.mode === "img");
      $("#panel-txt").classList.toggle("is-on", state.mode === "txt");
    });
  });

  $$(".chips").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      $$(".chip", group).forEach ? null : null;
      Array.prototype.slice.call(group.querySelectorAll(".chip")).forEach(function (c) { c.classList.remove("is-on"); });
      chip.classList.add("is-on");
      state.opts[group.dataset.group] = chip.dataset.val;
      if (state.made.it || state.made.en) { state.level = 0; $("#btnMore").disabled = false; $("#btnMore").textContent = "＋ Arricchisci ulteriormente"; renderAll(); }
    });
  });

  /* immagine: file / drag / incolla */
  var drop = $("#drop"), file = $("#file");
  drop.addEventListener("click", function (e) {
    if (e.target.closest(".x")) return;
    file.click();
  });
  file.addEventListener("change", function () { if (file.files[0]) loadFile(file.files[0]); });
  ["dragenter", "dragover"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); });
  });
  drop.addEventListener("drop", function (e) {
    var f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f && f.type.indexOf("image") === 0) loadFile(f);
  });
  document.addEventListener("paste", function (e) {
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) { loadFile(items[i].getAsFile()); break; }
    }
  });

  function loadFile(f) {
    var r = new FileReader();
    r.onload = function () {
      state.image = r.result;
      $("#previewImg").src = state.image;
      $("#preview").hidden = false;
      $("#dropInner").hidden = true;
    };
    r.readAsDataURL(f);
  }

  $("#removeImg").addEventListener("click", function (e) {
    e.stopPropagation();
    state.image = null;
    file.value = "";
    $("#preview").hidden = true;
    $("#dropInner").hidden = false;
  });

  $("#imgCaption").addEventListener("input", function (e) { state.caption = e.target.value.trim(); });
  $("#idea").addEventListener("input", function (e) { state.idea = e.target.value; });

  $("#btnIT").addEventListener("click", function () { generate("it"); });
  $("#btnEN").addEventListener("click", function () { generate("en"); });
  $("#btnMore").addEventListener("click", enrich);

  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.dataset.copy;
      var text = (lang === "it" ? $("#promptIT") : $("#promptEN")).textContent;
      function done() {
        var old = btn.textContent;
        btn.textContent = "Copiato ✓";
        setTimeout(function () { btn.textContent = old; }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      } else { fallbackCopy(text); done(); }
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
})();
