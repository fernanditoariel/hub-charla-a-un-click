/* Hub Bahia Blanca · charla - interacciones minimas.
   1) reveal on scroll  2) count-up de cifras  3) lightbox de infografias.
   Todo degrada a estatico con prefers-reduced-motion o sin JS. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1 + 2 : reveal + count-up ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var counters = Array.prototype.slice.call(document.querySelectorAll(".stat__num[data-count]"));

  function formatNum(value, decimals, prefix, suffix) {
    var n = decimals ? value.toFixed(decimals) : String(Math.round(value));
    n = n.replace("-", "−").replace(".", ",");
    return (prefix || "") + n + (suffix || "");
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = formatNum(target, decimals, prefix, suffix); return; }
    var start = performance.now();
    var dur = 1100;
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatNum(target * eased, decimals, prefix, suffix);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target, decimals, prefix, suffix);
    }
    requestAnimationFrame(tick);
  }

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
    counters.forEach(runCounter);
  }

  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        if (entry.target.classList.contains("stat-grid")) counters.forEach(runCounter);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    // safety net: never leave content hidden if the observer misses (bg tabs, odd viewports)
    window.addEventListener("load", function () {
      setTimeout(function () {
        revealEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-in");
        });
      }, 1200);
    });
    setTimeout(showAll, 4000);
  } else {
    showAll();
  }

  /* ---------- 3 : lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbClose = lightbox.querySelector(".lightbox__close");
    var lastFocus = null;

    function openLightbox(src, alt) {
      lastFocus = document.activeElement;
      lbImg.setAttribute("src", src);
      lbImg.setAttribute("alt", alt || "");
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lbClose.focus();
    }
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      lbImg.setAttribute("src", "");
      if (lastFocus) lastFocus.focus();
    }

    document.querySelectorAll(".info-item__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = btn.querySelector("img");
        openLightbox(btn.getAttribute("data-full"), img ? img.getAttribute("alt") : "");
      });
    });
    lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  /* current year is fixed content on this page; nothing else to wire */
})();
