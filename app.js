/* PromptVideo — da immagine / da testo / storia lunga → prompt IT + EN, con arricchimento */
(function () {
  "use strict";

  var state = {
    mode: "txt",            // "img" | "txt" | "story"
    image: null,
    caption: "",
    idea: "",
    story: "",
    storyDur: "30",
    opts: { style: "cinematic", cam: "dolly", dur: "10", ratio: "9:16" },
    level: 0,
    made: { it: false, en: false }
  };

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

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

  /* ---------- storia lunga ---------- */
  function splitStory(text, n) {
    var t = text.trim();
    if (!t) return [];
    // split in frasi
    var sentences = t.split(/(?<=[.!?])\s+/);
    // se meno frasi che scene, spezza anche su virgole o distribuisci
    if (sentences.length >= n) {
      var chunks = [];
      var per = Math.ceil(sentences.length / n);
      for (var i = 0; i < n; i++) {
        var slice = sentences.slice(i * per, (i + 1) * per);
        chunks.push(slice.join(" "));
      }
      return chunks.map(function(c){ return c.trim(); }).filter(Boolean);
    } else {
      // poche frasi: crea progressione narrativa inventando beats
      var base = sentences.join(" ");
      var beatsIt = [
        "Introduzione della storia e del luogo",
        "Sviluppo dell'azione e dei personaggi",
        "Momento centrale / scoperta",
        "Svolta / tensione crescente",
        "Avvicinamento alla conclusione",
        "Chiusura / epilogo"
      ];
      var out = [];
      for (var k = 0; k < n; k++) {
        if (k < sentences.length) out.push(sentences[k]);
        else out.push(beatsIt[k % beatsIt.length] + ": " + base);
      }
      return out;
    }
  }

  function camForScene(idx) {
    var cams = ["dolly", "orbit", "pan", "static"];
    // varia per scena per dare dinamismo, ma rispetta scelta base come principale
    if (idx === 0) return state.opts.cam;
    return cams[idx % cams.length];
  }

  function buildStoryPrompt(lang, level, idx, total, chunk, fullStory) {
    var it = lang === "it";
    var L = it ? "it" : "en";
    var o = state.opts;
    var st = OPTS.style[o.style];
    var camKey = camForScene(idx);
    var camTxt = OPTS.cam[camKey][L];
    var start = idx * 10;
    var end = start + 10;
    var lines = [];

    lines.push((it ? "SCENA " : "SCENE ") + (idx + 1) + "/" + total + "  [" + start + "s → " + end + "s]");
    lines.push(it
      ? 'Storia completa: "' + fullStory.slice(0, 220) + (fullStory.length > 220 ? "…" : "") + '"'
      : 'Full story: "' + fullStory.slice(0, 220) + (fullStory.length > 220 ? "…" : "") + '"');
    lines.push(it
      ? 'Questo segmento racconta: "' + chunk + '"'
      : 'This segment tells: "' + chunk + '"');
    lines.push(it
      ? "Continuità: stesso protagonista, stesso luogo e stesso stile della scena precedente, per un montaggio fluido."
      : "Continuity: same protagonist, same location and same style as the previous scene, for a smooth edit.");

    lines.push("");
    lines.push(it ? "STILE" : "STYLE");
    lines.push(st[L]);

    lines.push("");
    lines.push(it ? "CAMERA" : "CAMERA");
    lines.push(camTxt);
    if (level >= 2) {
      lines.push(it
        ? "Ottica: 35mm per ampi, 85mm per dettagli."
        : "Lenses: 35mm for wide, 85mm for close-up.");
    }

    lines.push("");
    lines.push(it ? "LUCE" : "LIGHTING");
    if (level >= 1) {
      lines.push(it
        ? "Set luci: key morbida a 45°, fill leggera, rim light per staccare il soggetto."
        : "Lighting: soft key at 45°, gentle fill, rim light to separate subject.");
    } else {
      lines.push(it
        ? "Luce morbida e naturale che segue l'azione."
        : "Soft natural light following the action.");
    }

    lines.push("");
    lines.push(it ? "DURATA E FORMATO" : "DURATION & FORMAT");
    lines.push((it ? "Durata di questo prompt: 10 secondi" : "Duration of this prompt: 10 seconds") + ", " + OPTS.ratio[o.ratio][L] + ".");

    if (level >= 1) {
      lines.push("");
      lines.push(it ? "COLOR E AUDIO" : "COLOR & AUDIO");
      lines.push(st[it ? "gradeIt" : "gradeEn"]);
    }

    if (level >= 2) {
      lines.push("");
      lines.push(it ? "DETTAGLI EXTRA" : "EXTRA DETAILS");
      lines.push(it
        ? "Particelle in aria, micro-movimenti naturali, respiro e tessuti in movimento."
        : "Particles in the air, natural micro-movements, breathing and fabric motion.");
    }

    lines.push("");
    lines.push(it ? "QUALITA'" : "QUALITY");
    lines.push(it
      ? "8K, fotorealistico, movimento fluido, coerenza tra scene."
      : "8K, photorealistic, smooth motion, consistency between scenes.");

    lines.push("");
    lines.push(it ? "NEGATIVO" : "NEGATIVE");
    lines.push(it
      ? "Nessun testo a schermo, watermark, deformità, morphing, cambio vestiti, flicker."
      : "No on-screen text, watermark, deformities, morphing, outfit change, flicker.");

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
    if (state.mode === "story") return state.story.trim() || null;
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
    if (state.mode === "story" && !state.story.trim()) {
      toast("Incolla prima la tua storia 📖");
      var s = $("#story");
      s.classList.add("shake");
      s.focus();
      setTimeout(function () { s.classList.remove("shake"); }, 350);
      return false;
    }
    return true;
  }

  function updateSceneCount() {
    var total = parseInt(state.storyDur, 10);
    var n = Math.max(1, Math.round(total / 10));
    var el = $("#sceneCount");
    if (el) el.textContent = n + " prompt";
  }

  function generate(lang) {
    if (state.mode === "story") { generateStory(lang); return; }
    if (!requireInput()) return;
    state.level = 0;
    state.made[lang] = true;
    render(lang);
    $("#out").hidden = false;
    $("#outStory").hidden = true;
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
    if (state.mode === "story") { renderStoryAll(); return; }
    if (state.made.it) render("it");
    if (state.made.en) render("en");
  }

  function generateStory(lang) {
    if (!requireInput()) return;
    state.level = 0;
    state.made[lang] = true;
    state.made.it = true;
    state.made.en = true;
    renderStoryAll();
    $("#out").hidden = true;
    $("#outStory").hidden = false;
    $("#imgNote").hidden = true;
    $("#btnMore").disabled = false;
    $("#btnMore").textContent = "＋ Arricchisci ulteriormente";
    var n = Math.max(1, Math.round(parseInt(state.storyDur, 10) / 10));
    toast("Storia divisa in " + n + " scene da 10s ✅");
  }

  function renderStoryAll() {
    var total = Math.max(1, Math.round(parseInt(state.storyDur, 10) / 10));
    var story = state.story.trim();
    var chunks = splitStory(story, total);
    var list = $("#storyList");
    list.innerHTML = "";
    var title = $("#storyTitle");
    if (title) title.textContent = "La tua storia — " + total + " scene da 10s = " + (total*10) + "s totali";

    for (var i = 0; i < total; i++) {
      var chunk = chunks[i] || story;
      var div = document.createElement("div");
      div.className = "scene";

      var langIt = state.made.it ? buildStoryPrompt("it", state.level, i, total, chunk, story) : "";
      var langEn = state.made.en ? buildStoryPrompt("en", state.level, i, total, chunk, story) : "";

      // if only one language prepared, show only that; but we prepare both
      var html = ''
        + '<div class="scene-top"><span class="scene-title">Scena ' + (i+1) + '/' + total + ' — ' + (i*10) + 's → ' + ((i+1)*10) + 's</span><span class="scene-time">10s</span></div>'
        + '<div class="scene-grid">'
        +   '<div class="card" style="margin:0"><div class="card-head"><span class="flag">🇮🇹 Italiano</span><button class="btn mini" data-copy-story-it="' + i + '">Copia</button></div><pre class="prompt">' + esc(langIt) + '</pre></div>'
        +   '<div class="card" style="margin:0"><div class="card-head"><span class="flag">🇬🇧 English</span><button class="btn mini" data-copy-story-en="' + i + '">Copia</button></div><pre class="prompt">' + esc(langEn) + '</pre></div>'
        + '</div>';
      div.innerHTML = html;
      // store texts for copy
      div.dataset.it = langIt;
      div.dataset.en = langEn;
      list.appendChild(div);
    }

    // add copy handlers for new buttons
    list.querySelectorAll("[data-copy-story-it]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var t = btn.closest(".scene").dataset.it;
        copyText(t, btn);
      });
    });
    list.querySelectorAll("[data-copy-story-en]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var t = btn.closest(".scene").dataset.en;
        copyText(t, btn);
      });
    });
  }

  function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function copyText(text, btn){
    function done(){
      var old = btn.textContent;
      btn.textContent = "Copiato ✓";
      setTimeout(function(){ btn.textContent = old; }, 1400);
      toast("Copiato ✅");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }

  function enrich() {
    if (!state.made.it && !state.made.en) {
      if (!requireInput()) return;
      state.made.it = true;
      state.made.en = true;
      if (state.mode === "story") {
        $("#outStory").hidden = false;
        $("#out").hidden = true;
      } else {
        $("#out").hidden = false;
        $("#outStory").hidden = true;
        if (state.mode === "img") $("#imgNote").hidden = false;
      }
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
      var ps = $("#panel-story");
      if (ps) ps.classList.toggle("is-on", state.mode === "story");
      // mostra/nascondi opzioni durata singola vs storia
      var opts = document.querySelector(".opts");
      if (opts) opts.style.display = (state.mode === "story") ? "none" : "flex";
    });
  });

  $$(".chips").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      Array.prototype.slice.call(group.querySelectorAll(".chip")).forEach(function (c) { c.classList.remove("is-on"); });
      chip.classList.add("is-on");
      if (group.dataset.group === "storyDur") {
        state.storyDur = chip.dataset.val;
        var inp = $("#customDur");
        if (inp) inp.value = "";
        updateSceneCount();
        if (state.made.it || state.made.en) { state.level = 0; $("#btnMore").disabled = false; $("#btnMore").textContent = "＋ Arricchisci ulteriormente"; renderAll(); }
      } else {
        state.opts[group.dataset.group] = chip.dataset.val;
        if (state.made.it || state.made.en) { state.level = 0; $("#btnMore").disabled = false; $("#btnMore").textContent = "＋ Arricchisci ulteriormente"; renderAll(); }
      }
    });
  });

  var customDur = $("#customDur");
  if (customDur) {
    customDur.addEventListener("input", function(){
      var v = parseInt(customDur.value,10);
      if (!isNaN(v) && v >= 10) {
        state.storyDur = String(Math.round(v/10)*10);
        $$('[data-group="storyDur"] .chip').forEach(function(c){ c.classList.remove("is-on"); });
        updateSceneCount();
        if (state.made.it || state.made.en) renderAll();
      }
    });
  }

  /* immagine: file / drag / incolla */
  var drop = $("#drop"), file = $("#file");
  if (drop && file) {
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
      if (state.mode !== "img") return;
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
  }

  var ideaEl = $("#idea");
  if (ideaEl) ideaEl.addEventListener("input", function (e) { state.idea = e.target.value; });
  var storyEl = $("#story");
  if (storyEl) storyEl.addEventListener("input", function (e) { state.story = e.target.value; });

  $("#btnIT").addEventListener("click", function () { generate("it"); });
  $("#btnEN").addEventListener("click", function () { generate("en"); });
  $("#btnMore").addEventListener("click", enrich);

  // copy per out normale
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.dataset.copy;
      var text = (lang === "it" ? $("#promptIT") : $("#promptEN")).textContent;
      copyText(text, btn);
    });
  });

  var copyAllBtn = $("#copyAllStory");
  if (copyAllBtn) {
    copyAllBtn.addEventListener("click", function(){
      var scenes = document.querySelectorAll("#storyList .scene");
      var all = "";
      scenes.forEach(function(s, i){
        all += "— SCENA " + (i+1) + " —\n" + s.dataset.it + "\n\n--- EN ---\n" + s.dataset.en + "\n\n====================\n\n";
      });
      copyText(all.trim(), copyAllBtn);
    });
  }

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

  updateSceneCount();
})();