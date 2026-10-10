/* =========================================================
   DRYLINE / OEE — app.js
   Dashboard operasional OEE produksi karet kering
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. DATA MODEL
     --------------------------------------------------------- */

  const TARGETS = {
    all: 85.0,
    wet: 85.0,
    dry: 85.0
  };

  const divisions = {
    all: {
      key: "all",
      name: "Kedua Divisi",
      oee: 86.4, availability: 91.8, performance: 96.2, quality: 97.9,
      output: 24.6, targetOutput: 28.0,
      status: "berjalan",
      units: [
        { name: "Koagulasi", id: "KOA-01", value: 89.2 },
        { name: "Pencucian", id: "CLN-03", value: 86.4 },
        { name: "Pemerasan", id: "MIX-04", value: 88.1 },
        { name: "Pengeringan", id: "DRY-01", value: 87.6 },
        { name: "Penggilingan", id: "MILL-02", value: 82.4 },
        { name: "Penimbangan", id: "BAL-01", value: 88.0 }
      ],
      downtime: [
        { name: "Mesin berhenti tak terjadwal", value: 42 },
        { name: "Ganti format / pembersihan", value: 31 },
        { name: "Kecepatan mesin turun", value: 24 },
        { name: "Menunggu bahan baku", value: 18 },
        { name: "Produk tidak sesuai spesifikasi", value: 12 },
        { name: "Kegagalan startup", value: 9 }
      ]
    },
    wet: {
      key: "wet",
      name: "Produksi Basah",
      oee: 87.9, availability: 93.2, performance: 95.8, quality: 98.6,
      output: 12.1, targetOutput: 13.5,
      status: "berjalan",
      units: [
        { name: "Koagulasi", id: "KOA-01", value: 89.2 },
        { name: "Pencucian", id: "CLN-03", value: 86.4 },
        { name: "Pemerasan", id: "MIX-04", value: 88.1 }
      ],
      downtime: [
        { name: "Menunggu lateks", value: 14 },
        { name: "Pembersihan bak", value: 11 },
        { name: "Kegagalan startup", value: 6 },
        { name: "Produk tidak sesuai spesifikasi", value: 4 }
      ]
    },
    dry: {
      key: "dry",
      name: "Produksi Kering",
      oee: 85.2, availability: 90.6, performance: 96.5, quality: 97.4,
      output: 12.5, targetOutput: 14.5,
      status: "perhatian",
      units: [
        { name: "Pengeringan", id: "DRY-01", value: 87.6 },
        { name: "Penggilingan", id: "MILL-02", value: 82.4 },
        { name: "Penimbangan", id: "BAL-01", value: 88.0 }
      ],
      downtime: [
        { name: "Mesin berhenti tak terjadwal", value: 28 },
        { name: "Ganti format / pembersihan", value: 20 },
        { name: "Kecepatan mesin turun", value: 16 },
        { name: "Menunggu bahan baku", value: 8 }
      ]
    }
  };

  const lossPeriods = {
    current: [
      { name: "Mesin berhenti tak terjadwal", value: 42 },
      { name: "Ganti format / pembersihan", value: 31 },
      { name: "Kecepatan mesin turun", value: 24 },
      { name: "Menunggu bahan baku", value: 18 },
      { name: "Produk tidak sesuai spesifikasi", value: 12 },
      { name: "Kegagalan startup", value: 9 }
    ],
    prev: [
      { name: "Ganti format / pembersihan", value: 38 },
      { name: "Mesin berhenti tak terjadwal", value: 27 },
      { name: "Menunggu bahan baku", value: 22 },
      { name: "Kecepatan mesin turun", value: 17 },
      { name: "Produk tidak sesuai spesifikasi", value: 11 },
      { name: "Kegagalan startup", value: 7 }
    ]
  };

  const events = [
    { time: "10:58:12", division: "all", divisionLabel: "Kedua", equipment: "MILL-02", code: "E-104", duration: "6m 40d", status: "aktif" },
    { time: "10:44:03", division: "dry", divisionLabel: "Kering", equipment: "DRY-01", code: "E-087", duration: "12m 15d", status: "selesai" },
    { time: "10:21:47", division: "wet", divisionLabel: "Basah", equipment: "CLN-03", code: "E-062", duration: "9m 02d", status: "selesai" },
    { time: "09:58:30", division: "dry", divisionLabel: "Kering", equipment: "BAL-01", code: "E-041", duration: "4m 18d", status: "selesai" },
    { time: "09:31:12", division: "wet", divisionLabel: "Basah", equipment: "MIX-04", code: "E-018", duration: "15m 44d", status: "selesai" },
    { time: "09:02:55", division: "dry", divisionLabel: "Kering", equipment: "MILL-02", code: "E-006", duration: "8m 27d", status: "selesai" },
    { time: "08:41:20", division: "wet", divisionLabel: "Basah", equipment: "KOA-01", code: "E-002", duration: "5m 33d", status: "selesai" },
    { time: "08:12:06", division: "dry", divisionLabel: "Kering", equipment: "DRY-01", code: "E-121", duration: "21m 08d", status: "tahan" },
    { time: "07:55:41", division: "wet", divisionLabel: "Basah", equipment: "CLN-03", code: "E-077", duration: "3m 12d", status: "selesai" },
    { time: "07:30:00", division: "all", divisionLabel: "Kedua", equipment: "PLANT", code: "S-001", duration: "0m 00d", status: "selesai" }
  ];

  // Trend datasets — deterministic seeded values per range
  const trendData = {
    "8h": {
      labels: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
      actual: [82.1, 83.4, 84.9, 83.6, 85.2, 87.2, 86.1, 86.8, 86.4],
      target: [85, 85, 85, 85, 85, 85, 85, 85, 85],
      plan: [84, 84.5, 85, 85, 85.5, 85.5, 86, 86, 86],
      summary: "Grafik tren OEE 8 jam terakhir. Nilai aktual bergerak antara 82.1% hingga 87.2% dengan target 85.0%. Titik terbaru 86.4%."
    },
    "24h": {
      labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "24:00"],
      actual: [84.2, 83.1, 82.1, 83.6, 86.1, 85.4, 84.6, 85.9, 86.4],
      target: [85, 85, 85, 85, 85, 85, 85, 85, 85],
      plan: [84, 84, 84, 85, 85.5, 85.5, 86, 86, 86],
      summary: "Grafik tren OEE 24 jam terakhir. Nilai aktual bergerak antara 82.1% hingga 86.4% dengan target 85.0%. Titik terbaru 86.4%."
    },
    "7d": {
      labels: ["Kam", "Jum", "Sab", "Min", "Sen", "Sel", "Rab"],
      actual: [83.6, 84.8, 82.9, 81.4, 85.1, 86.7, 86.4],
      target: [85, 85, 85, 85, 85, 85, 85],
      plan: [84, 84, 84, 84, 85, 85, 86],
      summary: "Grafik tren OEE 7 hari terakhir. Nilai aktual bergerak antara 81.4% hingga 86.7% dengan target 85.0%. Titik terbaru 86.4%."
    }
  };

  /* ---------------------------------------------------------
     2. STATE
     --------------------------------------------------------- */

  const state = {
    division: "all",
    trendRange: "8h",
    lossPeriod: "current",
    eventFilter: "all",
    refreshMs: 15000,
    simulate: true,
    density: "normal",
    tick: 0
  };

  const reduceMotion = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---------------------------------------------------------
     3. DATA LOKAL (OFFLINE-FIRST)
     --------------------------------------------------------- */

  const STORAGE_KEYS = {
    events: "dryline.v1.manualEvents",
    tallies: "dryline.v1.tallies",
    equipment: "dryline.v1.equipment",
    targets: "dryline.v1.targets",
    seq: "dryline.v1.seq"
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage penuh/di-block */ }
  }

  const OUTPUT_BASE = { all: 24.6, wet: 12.1, dry: 12.5 };

  const EQUIPMENT_DEFAULT = [
    { code: "MIX-04", name: "Pemeras / Mixer", division: "wet", stage: "Produksi Basah", source: "manual" },
    { code: "CLN-03", name: "Unit Pencucian", division: "wet", stage: "Produksi Basah", source: "manual" },
    { code: "KOA-01", name: "Bak Koagulasi", division: "wet", stage: "Koagulasi", source: "manual" },
    { code: "DRY-01", name: "Pengering", division: "dry", stage: "Pengeringan", source: "manual" },
    { code: "MILL-02", name: "Penggiling", division: "dry", stage: "Pengeringan", source: "manual" },
    { code: "BAL-01", name: "Penimbang / Baling", division: "dry", stage: "Penimbangan", source: "manual" },
    { code: "WH-01", name: "Gudang Kering", division: "dry", stage: "Gudang Kering", source: "manual" }
  ];

  const STAGE_NAMES = {
    "1": "Produksi Basah",
    "2": "Koagulasi",
    "3": "Pengeringan",
    "4": "Penimbangan",
    "5": "Gudang Kering"
  };
  const STAGE_ALIASES = {
    "Pencucian": "Produksi Basah",
    "Pemerasan": "Produksi Basah",
    "Penggilingan": "Pengeringan",
    "Gudang": "Gudang Kering"
  };

  const REASONS = [
    "Mesin berhenti tak terjadwal",
    "Ganti format / pembersihan",
    "Kecepatan mesin turun",
    "Menunggu bahan baku",
    "Produk tidak sesuai spesifikasi",
    "Kegagalan startup"
  ];

  const SOURCE_LABELS = { manual: "Manual", semi: "Semi-otomatis", live: "Realtime" };

  let equipment = loadJSON(STORAGE_KEYS.equipment, null) || EQUIPMENT_DEFAULT.slice();
  // Normalisasi nama tahap lama agar cocok dengan 5 tahap alur proses
  equipment.forEach(function (e) {
    if (STAGE_ALIASES[e.stage]) e.stage = STAGE_ALIASES[e.stage];
  });
  let manualEvents = loadJSON(STORAGE_KEYS.events, []);
  let manualTallies = loadJSON(STORAGE_KEYS.tallies, []);
  let seqCounter = loadJSON(STORAGE_KEYS.seq, 1);

  const storedTargets = loadJSON(STORAGE_KEYS.targets, null);
  if (storedTargets) {
    TARGETS.all = typeof storedTargets.all === "number" ? storedTargets.all : TARGETS.all;
    TARGETS.wet = typeof storedTargets.wet === "number" ? storedTargets.wet : TARGETS.wet;
    TARGETS.dry = typeof storedTargets.dry === "number" ? storedTargets.dry : TARGETS.dry;
  }

  function nextManualCode() {
    const code = "M-" + String(seqCounter).padStart(3, "0");
    seqCounter += 1;
    saveJSON(STORAGE_KEYS.seq, seqCounter);
    return code;
  }

  function divisionLabel(key) {
    return key === "wet" ? "Basah" : key === "dry" ? "Kering" : "Kedua";
  }

  function getOutput(key) {
    const goodSum = manualTallies
      .filter(function (t) { return t.division === key; })
      .reduce(function (a, t) { return a + (t.good || 0); }, 0);
    return OUTPUT_BASE[key] + goodSum / 1000;
  }

  function manualLossByReason() {
    const map = {};
    manualEvents.forEach(function (e) {
      if (e.reason) map[e.reason] = (map[e.reason] || 0) + (e.minutes || 0);
    });
    return map;
  }

  function sourceLabel() {
    const hasManual = manualEvents.length > 0 || manualTallies.length > 0;
    if (state.simulate && hasManual) return "simulasi + manual";
    if (state.simulate) return "simulasi";
    return hasManual ? "input manual" : "belum ada data";
  }

  /* ---------------------------------------------------------
     3. HELPERS
     --------------------------------------------------------- */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  function fmtPct(n) {
    return n.toFixed(1) + "%";
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function nowWIB() {
    // WIB = UTC+7, independent of user's local timezone
    const d = new Date();
    const wib = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + (7 * 3600000));
    return wib;
  }

  function formatClock(d) {
    return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
  }

  function formatDateID(d) {
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return hari[d.getDay()] + ", " + pad2(d.getDate()) + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  function formatDurasi(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return pad2(h) + ":" + pad2(m) + ":" + pad2(s);
  }

  function showToast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function svgEl(name, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    }
    return el;
  }

  /* ---------------------------------------------------------
     4. CLOCK & SHIFT (satu shift — jam dapat diatur di Pengaturan)
     --------------------------------------------------------- */

  const DEFAULT_SHIFT = { start: "07:00", end: "15:00" };
  let shiftHours = loadJSON("dryline.v1.shiftHours", DEFAULT_SHIFT);

  function hhmmToSec(str) {
    const parts = String(str || "00:00").split(":");
    return (parseInt(parts[0], 10) || 0) * 3600 + (parseInt(parts[1], 10) || 0) * 60;
  }

  function updateClock() {
    const wib = nowWIB();
    const clock = $("#header-clock");
    const dateEl = $("#header-date");
    if (clock) clock.textContent = formatClock(wib);
    if (dateEl) dateEl.textContent = formatDateID(wib);

    const secs = wib.getHours() * 3600 + wib.getMinutes() * 60 + wib.getSeconds();
    const startSec = hhmmToSec(shiftHours.start);
    const endSec = Math.max(startSec + 3600, hhmmToSec(shiftHours.end));
    const total = endSec - startSec;

    let remaining, progress, timerLabel;
    if (secs >= startSec && secs < endSec) {
      // Dalam jam shift
      remaining = endSec - secs;
      progress = ((secs - startSec) / total) * 100;
      timerLabel = "Berakhir";
    } else if (secs < startSec) {
      // Sebelum shift dimulai
      remaining = startSec - secs;
      progress = 0;
      timerLabel = "Mulai Dalam";
    } else {
      // Setelah shift selesai (tunggu besok)
      remaining = (86400 - secs) + startSec;
      progress = 100;
      timerLabel = "Mulai Besok";
    }

    const shiftEl = $("#hero-shift");
    if (shiftEl) shiftEl.textContent = "Shift 1";

    const labelEl = $("#hero-timer-label");
    if (labelEl) labelEl.textContent = timerLabel;

    const timer = $("#hero-timer");
    const cycle = $("#cycle-time");
    const formatted = formatDurasi(remaining);
    if (timer) timer.textContent = formatted;
    if (cycle) cycle.textContent = formatted;

    const rangeEl = $("#shift-range");
    if (rangeEl) rangeEl.textContent = shiftHours.start + " — " + shiftHours.end;

    const progFill = $("#shift-progress-fill");
    const progNow = $("#shift-progress-now");
    const progLabel = $("#shift-progress-label");
    if (progFill) progFill.style.width = progress.toFixed(1) + "%";
    if (progNow) progNow.style.left = progress.toFixed(1) + "%";
    if (progLabel) progLabel.textContent = Math.round(progress) + "%";
  }

  /* ---------------------------------------------------------
     5. TREND CHART (hand-drawn SVG — the LIVE TRACE)
     --------------------------------------------------------- */

  let chartPoints = [];
  const trendStage = $("#trend-stage");
  const trendSvg = $("#trend-svg");

  function renderTrend(animate) {
    if (!trendSvg || !trendStage) return;
    const data = trendData[state.trendRange];
    const w = trendStage.clientWidth || 640;
    const h = trendStage.clientHeight || 320;
    const pad = { top: 16, right: 16, bottom: 28, left: 40 };
    const innerW = Math.max(80, w - pad.left - pad.right);
    const innerH = Math.max(80, h - pad.top - pad.bottom);

    const yMin = 78, yMax = 92;
    const xAt = function (i) { return pad.left + (innerW * i) / (data.labels.length - 1); };
    const yAt = function (v) { return pad.top + innerH * (1 - (v - yMin) / (yMax - yMin)); };

    trendSvg.setAttribute("viewBox", "0 0 " + w + " " + h);
    trendSvg.setAttribute("width", w);
    trendSvg.setAttribute("height", h);
    trendSvg.innerHTML = "";

    // Grid + Y labels
    for (let v = yMin; v <= yMax; v += 2) {
      const y = yAt(v);
      trendSvg.appendChild(svgEl("line", {
        x1: pad.left, y1: y, x2: w - pad.right, y2: y,
        class: "trend-grid"
      }));
      const t = svgEl("text", {
        x: pad.left - 8, y: y + 4, "text-anchor": "end", class: "trend-axis-text"
      });
      t.textContent = v + "%";
      trendSvg.appendChild(t);
    }

    // X labels
    data.labels.forEach(function (label, i) {
      const x = xAt(i);
      trendSvg.appendChild(svgEl("line", {
        x1: x, y1: pad.top, x2: x, y2: h - pad.bottom,
        class: "trend-grid"
      }));
      const t = svgEl("text", {
        x: x, y: h - pad.bottom + 18, "text-anchor": "middle", class: "trend-axis-text"
      });
      t.textContent = label;
      trendSvg.appendChild(t);
    });

    function buildPath(arr) {
      return arr.map(function (v, i) {
        return (i === 0 ? "M" : "L") + xAt(i).toFixed(1) + " " + yAt(v).toFixed(1);
      }).join(" ");
    }

    // Planned line
    const planPath = svgEl("path", {
      d: buildPath(data.plan), class: "trend-line trend-line--plan"
    });
    trendSvg.appendChild(planPath);

    // Target line (dashed)
    const targetPath = svgEl("path", {
      d: buildPath(data.target), class: "trend-line trend-line--target"
    });
    trendSvg.appendChild(targetPath);

    // Actual line — the LIVE TRACE
    const actualPath = svgEl("path", {
      d: buildPath(data.actual), class: "trend-line trend-line--actual"
    });
    trendSvg.appendChild(actualPath);

    if (animate && !reduceMotion && !document.body.classList.contains("no-motion")) {
      const len = actualPath.getTotalLength ? actualPath.getTotalLength() : 1000;
      actualPath.style.setProperty("--len", len);
      actualPath.classList.add("trend-line--draw");
    }

    // Points on actual
    chartPoints = [];
    data.actual.forEach(function (v, i) {
      const cx = xAt(i), cy = yAt(v);
      const isLast = i === data.actual.length - 1;
      if (isLast) {
        const pulse = svgEl("circle", {
          cx: cx, cy: cy, r: 8, class: "trend-pulse"
        });
        trendSvg.appendChild(pulse);
      }
      const c = svgEl("circle", {
        cx: cx, cy: cy, r: isLast ? 8 : 6,
        class: "trend-point" + (isLast ? " trend-point--last" : "")
      });
      trendSvg.appendChild(c);
      chartPoints.push({ x: cx, y: cy, i: i });
    });

    // Hover interaction layer
    const hoverLine = svgEl("line", {
      x1: 0, y1: pad.top, x2: 0, y2: h - pad.bottom, class: "trend-hover-line", opacity: 0
    });
    trendSvg.appendChild(hoverLine);

    const hitbox = svgEl("rect", {
      x: pad.left, y: pad.top, width: innerW, height: innerH, class: "trend-hitbox"
    });
    trendSvg.appendChild(hitbox);

    hitbox.addEventListener("mousemove", function (e) {
      const rect = trendSvg.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * w;
      let best = 0, bestDist = Infinity;
      chartPoints.forEach(function (p, idx) {
        const d = Math.abs(p.x - mx);
        if (d < bestDist) { bestDist = d; best = idx; }
      });
      const p = chartPoints[best];
      hoverLine.setAttribute("x1", p.x);
      hoverLine.setAttribute("x2", p.x);
      hoverLine.setAttribute("opacity", 1);
      showChartTooltip(e, data, best);
    });
    hitbox.addEventListener("mouseleave", function () {
      hoverLine.setAttribute("opacity", 0);
      hideChartTooltip();
    });

    // Accessible summary
    const summary = $("#trend-summary");
    if (summary) summary.textContent = data.summary;
    const ext = $("#trend-extremes");
    if (ext) {
      const hi = Math.max.apply(null, data.actual);
      const lo = Math.min.apply(null, data.actual);
      ext.textContent = "Tertinggi " + fmtPct(hi) + " · Terendah " + fmtPct(lo);
    }
  }

  let tooltipEl = null;
  function showChartTooltip(e, data, idx) {
    if (!trendStage) return;
    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "chart-tooltip";
      trendStage.appendChild(tooltipEl);
    }
    tooltipEl.innerHTML =
      '<div class="tt-label">OEE · ' + data.labels[idx] + " WIB</div>" +
      '<div class="tt-row"><span>Aktual</span><span>' + fmtPct(data.actual[idx]) + "</span></div>" +
      '<div class="tt-row"><span>Target</span><span>' + fmtPct(data.target[idx]) + "</span></div>" +
      '<div class="tt-row"><span>Rencana</span><span>' + fmtPct(data.plan[idx]) + "</span></div>";
    tooltipEl.hidden = false;
    const rect = trendStage.getBoundingClientRect();
    let left = e.clientX - rect.left + 16;
    let top = e.clientY - rect.top - 12;
    if (left + 170 > rect.width) left = e.clientX - rect.left - 170;
    tooltipEl.style.left = left + "px";
    tooltipEl.style.top = top + "px";
  }
  function hideChartTooltip() {
    if (tooltipEl) tooltipEl.hidden = true;
  }

  /* ---------------------------------------------------------
     6. LOSS RANKING
     --------------------------------------------------------- */

  function renderLoss() {
    const list = $("#loss-list");
    if (!list) return;
    let rows = lossPeriods[state.lossPeriod].map(function (r) {
      return { name: r.name, value: r.value };
    });
    if (state.lossPeriod === "current") {
      const manual = manualLossByReason();
      Object.keys(manual).forEach(function (name) {
        const found = rows.filter(function (r) { return r.name === name; })[0];
        if (found) found.value += manual[name];
        else rows.push({ name: name, value: manual[name] });
      });
    }
    rows.sort(function (a, b) { return b.value - a.value; });
    const max = Math.max.apply(null, rows.map(function (r) { return r.value; }));
    const total = rows.reduce(function (a, r) { return a + r.value; }, 0);

    list.innerHTML = rows.map(function (r, i) {
      const pct = (r.value / max) * 100;
      const barClass = "loss-bar" +
        (state.lossPeriod === "prev" ? " loss-bar--past" : "") +
        (i === 0 && state.lossPeriod === "current" ? " loss-bar--hot" : "");
      return (
        '<li class="loss-item">' +
        '<span class="loss-rank">' + pad2(i + 1) + "</span>" +
        "<div>" +
        '<p class="loss-name">' + r.name + "</p>" +
        '<div class="loss-bar-track"><span class="' + barClass + '" style="width:' + pct.toFixed(1) + '%"></span></div>' +
        "</div>" +
        '<p class="loss-val">' + r.value + '<span class="unit">mnt</span></p>' +
        "</li>"
      );
    }).join("");

    const totalEl = $("#loss-total");
    if (totalEl) totalEl.textContent = total + " menit";

    const sum = $("#loss-summary");
    if (sum) {
      sum.textContent = "Peringkat kehilangan " +
        (state.lossPeriod === "current" ? "shift ini" : "shift lalu") +
        ": " + rows.map(function (r, i) {
          return (i + 1) + ". " + r.name + " " + r.value + " menit";
        }).join("; ") + ". Total " + total + " menit.";
    }
  }

  /* ---------------------------------------------------------
     7. DIVISION MATRIX
     --------------------------------------------------------- */

  function renderMatrix() {
    const d = divisions[state.division];
    const overview = $("#matrix-overview");
    const unitsEl = $("#matrix-units");
    const downtimeEl = $("#matrix-downtime");
    const target = TARGETS[state.division];

    if (overview) {
      const statusClass = d.status === "berjalan" ? "state--run" : "state--warn";
      const statusText = d.status === "berjalan" ? "Berjalan" : "Perhatian";
      const delta = d.oee - target;
      const deltaClass = delta >= 0 ? "delta-pill--up" : "delta-pill--down";
      const deltaText = (delta >= 0 ? "+" : "−") + Math.abs(delta).toFixed(1) + " poin vs target";
      overview.innerHTML =
        '<div class="ov-cell ov-cell--hero">' +
        '<div class="ov-cell__label"><span class="micro-label">OEE · ' + d.name + '</span><span class="ov-status ' + statusClass + '"><span class="state__dot"></span>' + statusText + "</span></div>" +
        '<p class="ov-cell__value">' + fmtPct(d.oee) + "</p>" +
        '<span class="delta-pill ' + deltaClass + '" style="margin-top:10px;display:inline-flex">' + deltaText + "</span>" +
        "</div>" +
        '<div class="ov-cell"><div class="ov-cell__label"><span class="micro-label">Ketersediaan</span><span class="unit">target ≥ 90%</span></div><p class="ov-cell__value">' + fmtPct(d.availability) + "</p></div>" +
        '<div class="ov-cell"><div class="ov-cell__label"><span class="micro-label">Kinerja</span><span class="unit">target ≥ 95%</span></div><p class="ov-cell__value">' + fmtPct(d.performance) + "</p></div>" +
        '<div class="ov-cell"><div class="ov-cell__label"><span class="micro-label">Kualitas</span><span class="unit">target ≥ 98%</span></div><p class="ov-cell__value">' + fmtPct(d.quality) + "</p></div>" +
        '<div class="ov-cell"><div class="ov-cell__label"><span class="micro-label">Output</span><span class="unit">target ' + d.targetOutput.toFixed(1) + ' t</span></div><p class="ov-cell__value">' + getOutput(state.division).toFixed(1) + '<span class="unit"> t</span></p></div>' +
        '<div class="ov-cell"><div class="ov-cell__label"><span class="micro-label">Target OEE</span><span class="unit">operasional</span></div><p class="ov-cell__value">' + fmtPct(target) + "</p></div>";
    }

    const scope = $("#matrix-unit-scope");
    if (scope) scope.textContent = d.name;

    if (unitsEl) {
      unitsEl.innerHTML = d.units.map(function (u, i) {
        return (
          '<li class="bar-row">' +
          "<div>" +
          '<p class="bar-row__label">' + u.name + "</p>" +
          '<p class="bar-row__meta">' + u.id + "</p>" +
          '<div class="bar-row__track"><span class="bar-row__fill' + (i === 0 ? " bar-row__fill--live" : "") + '" style="width:' + u.value + '%"></span></div>' +
          "</div>" +
          '<p class="bar-row__val">' + fmtPct(u.value) + "</p>" +
          "</li>"
        );
      }).join("");
      const usum = $("#matrix-units-summary");
      if (usum) {
        usum.textContent = "OEE per unit kerja " + d.name + ": " +
          d.units.map(function (u) { return u.name + " " + fmtPct(u.value); }).join("; ") + ".";
      }
    }

    if (downtimeEl) {
      const max = Math.max.apply(null, d.downtime.map(function (r) { return r.value; }));
      downtimeEl.innerHTML = d.downtime.map(function (r, i) {
        const pct = (r.value / max) * 100;
        return (
          '<li class="bar-row">' +
          "<div>" +
          '<p class="bar-row__label">' + r.name + "</p>" +
          '<div class="bar-row__track"><span class="bar-row__fill' + (i === 0 ? " bar-row__fill--live" : " bar-row__fill--past") + '" style="width:' + pct.toFixed(1) + '%"></span></div>' +
          "</div>" +
          '<p class="bar-row__val">' + r.value + '<span class="unit">mnt</span></p>' +
          "</li>"
        );
      }).join("");
      const dsum = $("#matrix-downtime-summary");
      if (dsum) {
        dsum.textContent = "Waktu henti " + d.name + ": " +
          d.downtime.map(function (r) { return r.name + " " + r.value + " menit"; }).join("; ") + ".";
      }
    }
  }

  /* ---------------------------------------------------------
     8. EVENT LEDGER
     --------------------------------------------------------- */

  function allEvents() {
    return manualEvents.concat(events);
  }

  function renderLedger() {
    const body = $("#ledger-body");
    if (!body) return;
    const rows = allEvents().filter(function (e) {
      return state.eventFilter === "all" || e.division === state.eventFilter || e.division === "all";
    });

    body.innerHTML = rows.map(function (e, i) {
      const isNew = i === 0 && (e.status === "aktif" || e.source === "manual");
      const statusMap = {
        aktif: ['status-chip--active', 'Aktif'],
        selesai: ['status-chip--done', 'Selesai'],
        tahan: ['status-chip--hold', 'Tahan'],
        catat: ['status-chip--done', 'Tercatat']
      };
      const st = statusMap[e.status] || statusMap.selesai;
      return (
        '<tr class="' + (isNew ? "is-new" : "") + '">' +
        '<td>' + e.time + (isNew ? '<span class="tag-new">Baru</span>' : "") + "</td>" +
        '<td class="col-div">' + e.divisionLabel + "</td>" +
        "<td>" + e.equipment + "</td>" +
        "<td>" + e.code + "</td>" +
        "<td>" + e.duration + "</td>" +
        '<td><span class="status-chip ' + st[0] + '"><span class="state__dot"></span>' + st[1] + "</span></td>" +
        "</tr>"
      );
    }).join("");
  }

  /* ---------------------------------------------------------
     8b. INPUT SHIFT + KAMUS ALAT
     --------------------------------------------------------- */

  let selectedReason = null;

  function timeAgo(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    if (s < 60) return s + " dtk lalu";
    const m = Math.floor(s / 60);
    if (m < 60) return m + " mnt lalu";
    return Math.floor(m / 60) + " jam lalu";
  }

  const SOURCE_DISPLAY = {
    "simulasi": "Simulasi",
    "input manual": "Input Manual",
    "simulasi + manual": "Simulasi + Manual",
    "belum ada data": "Belum Ada Data"
  };

  function renderReasonChips() {
    const box = $("#dt-reasons");
    if (!box) return;
    box.innerHTML = REASONS.map(function (r) {
      return '<button type="button" class="chip' + (selectedReason === r ? " is-active" : "") +
        '" data-reason="' + r + '" role="radio" aria-checked="' + (selectedReason === r ? "true" : "false") + '">' + r + "</button>";
    }).join("");
    $$(".chip", box).forEach(function (chip) {
      chip.addEventListener("click", function () {
        selectedReason = chip.getAttribute("data-reason");
        renderReasonChips();
        const hint = $("#dt-hint");
        if (hint) hint.textContent = "Sebab dipilih: " + selectedReason;
      });
    });
  }

  function populateEquipmentSelect() {
    const sel = $("#dt-equipment");
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = equipment.map(function (e) {
      return '<option value="' + e.code + '">' + e.code + " — " + e.name + "</option>";
    }).join("");
    if (current && equipment.some(function (e) { return e.code === current; })) sel.value = current;
  }

  function renderRail() {
    const map = {};
    equipment.forEach(function (e) {
      if (!map[e.stage]) map[e.stage] = [];
      map[e.stage].push(e.code);
    });
    $$("#process-rail .rail__stage").forEach(function (li) {
      const stageName = STAGE_NAMES[li.getAttribute("data-stage")];
      const codes = map[stageName] || [];
      const eqEl = $(".rail__eq", li);
      if (eqEl) {
        if (codes.length) {
          eqEl.textContent = codes.slice(0, 2).join(" · ") + (codes.length > 2 ? " +" + (codes.length - 2) : "");
        } else {
          eqEl.textContent = "Belum ada alat";
        }
      }
    });
  }

  function renderEquipTable() {
    const body = $("#equip-body");
    if (!body) return;
    body.innerHTML = equipment.map(function (e, i) {
      return (
        '<tr data-equip-index="' + i + '">' +
        '<td>' + e.code + "</td>" +
        "<td>" + e.name + "</td>" +
        '<td class="col-div">' + divisionLabel(e.division) + "</td>" +
        "<td>" + e.stage + "</td>" +
        '<td><select class="source-select js-equip-source" aria-label="Sumber data ' + e.code + '">' +
        Object.keys(SOURCE_LABELS).map(function (k) {
          return '<option value="' + k + '"' + (e.source === k ? " selected" : "") + ">" + SOURCE_LABELS[k] + "</option>";
        }).join("") +
        "</select></td>" +
        '<td><button type="button" class="entry-item__del js-equip-del" aria-label="Hapus ' + e.code + '">' +
        '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        "</button></td>" +
        "</tr>"
      );
    }).join("");

    const count = $("#equip-count");
    if (count) count.textContent = equipment.length;
    renderRail();

    $$(".js-equip-source", body).forEach(function (sel) {
      sel.addEventListener("change", function () {
        const idx = parseInt(sel.closest("tr").getAttribute("data-equip-index"), 10);
        if (equipment[idx]) {
          equipment[idx].source = sel.value;
          saveJSON(STORAGE_KEYS.equipment, equipment);
          showToast("Sumber data " + equipment[idx].code + " diperbarui");
        }
      });
    });
    $$(".js-equip-del", body).forEach(function (btn) {
      btn.addEventListener("click", function () {
        const idx = parseInt(btn.closest("tr").getAttribute("data-equip-index"), 10);
        const removed = equipment.splice(idx, 1)[0];
        saveJSON(STORAGE_KEYS.equipment, equipment);
        renderEquipTable();
        populateEquipmentSelect();
        showToast("Alat " + (removed ? removed.code : "") + " dihapus");
      });
    });
  }

  function renderManualLists() {
    const evList = $("#manual-event-list");
    if (evList) {
      if (!manualEvents.length) {
        evList.innerHTML = '<li class="entry-empty">Belum ada kejadian manual. Catat lewat formulir di atas.</li>';
      } else {
        evList.innerHTML = manualEvents.map(function (e, i) {
          return (
            '<li class="entry-item">' +
            '<div class="entry-item__main">' +
            '<p class="entry-item__title">' + e.time + " · " + e.equipment + " · " + e.duration + "</p>" +
            '<p class="entry-item__meta">' + e.code + " · " + (e.reason || "-") + (e.note ? " · " + e.note : "") + "</p>" +
            "</div>" +
            '<button type="button" class="entry-item__del js-del-event" data-index="' + i + '" aria-label="Hapus kejadian ' + e.code + '">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
            "</button>" +
            "</li>"
          );
        }).join("");
      }
      const ec = $("#manual-event-count");
      if (ec) ec.textContent = manualEvents.length + " kejadian";
      $$(".js-del-event", evList).forEach(function (btn) {
        btn.addEventListener("click", function () {
          const idx = parseInt(btn.getAttribute("data-index"), 10);
          const removed = manualEvents.splice(idx, 1)[0];
          saveJSON(STORAGE_KEYS.events, manualEvents);
          renderManualLists();
          renderLedger();
          renderLoss();
          updateLastUpdated();
          showToast("Kejadian " + (removed ? removed.code : "") + " dihapus");
        });
      });
    }

    const tList = $("#manual-tally-list");
    if (tList) {
      if (!manualTallies.length) {
        tList.innerHTML = '<li class="entry-empty">Belum ada rekap timbangan. Isi lewat formulir di atas.</li>';
      } else {
        tList.innerHTML = manualTallies.map(function (t, i) {
          return (
            '<li class="entry-item">' +
            '<div class="entry-item__main">' +
            '<p class="entry-item__title">' + t.time + " · Shift " + t.shift + " · " + t.good + " kg</p>" +
            '<p class="entry-item__meta">' + divisionLabel(t.division) + " · reject " + t.reject + " kg · scrap " + t.scrap + " kg</p>" +
            "</div>" +
            '<button type="button" class="entry-item__del js-del-tally" data-index="' + i + '" aria-label="Hapus rekap">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
            "</button>" +
            "</li>"
          );
        }).join("");
      }
      const tc = $("#manual-tally-count");
      if (tc) tc.textContent = manualTallies.length + " rekap";
      $$(".js-del-tally", tList).forEach(function (btn) {
        btn.addEventListener("click", function () {
          const idx = parseInt(btn.getAttribute("data-index"), 10);
          manualTallies.splice(idx, 1);
          saveJSON(STORAGE_KEYS.tallies, manualTallies);
          renderManualLists();
          renderMatrix();
          updateLastUpdated();
          showToast("Rekap dihapus");
        });
      });
    }
  }

  function markInvalid(el, on) {
    if (!el) return;
    el.classList.toggle("is-invalid", !!on);
  }

  function bindInputForms() {
    const dtForm = $("#form-downtime");
    if (dtForm) {
      const timeInput = $("#dt-time");
      if (timeInput && !timeInput.value) {
        const wib = nowWIB();
        timeInput.value = pad2(wib.getHours()) + ":" + pad2(wib.getMinutes());
      }
      dtForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const eqCode = $("#dt-equipment").value;
        const duration = parseInt($("#dt-duration").value, 10);
        const note = ($("#dt-note").value || "").trim();
        const timeVal = $("#dt-time").value || formatClock(nowWIB()).slice(0, 5);

        const okEquip = !!eqCode;
        const okDur = duration >= 1 && duration <= 600;
        const okReason = !!selectedReason;
        markInvalid($("#dt-duration"), !okDur);
        if (!okEquip || !okDur || !okReason) {
          const hint = $("#dt-hint");
          if (hint) {
            hint.textContent = !okDur ? "Durasi harus 1–600 menit." :
              !okReason ? "Pilih satu sebab terlebih dahulu." : "Pilih peralatan terlebih dahulu.";
          }
          return;
        }

        const eq = equipment.filter(function (x) { return x.code === eqCode; })[0];
        const entry = {
          id: Date.now(),
          code: nextManualCode(),
          time: timeVal,
          division: eq ? eq.division : "all",
          divisionLabel: eq ? divisionLabel(eq.division) : "Kedua",
          equipment: eqCode,
          duration: pad2(duration) + "m 00d",
          minutes: duration,
          status: "catat",
          source: "manual",
          reason: selectedReason,
          note: note
        };
        manualEvents.unshift(entry);
        saveJSON(STORAGE_KEYS.events, manualEvents);

        lastUpdateAt = Date.now();
        renderManualLists();
        renderLedger();
        renderLoss();
        updateLastUpdated();

        $("#dt-duration").value = "";
        $("#dt-note").value = "";
        const hint = $("#dt-hint");
        if (hint) hint.textContent = "Tersimpan " + entry.code + ". Siap input kejadian berikutnya.";
        showToast("Kejadian " + entry.code + " tersimpan");
      });
    }

    const tForm = $("#form-tally");
    if (tForm) {
      tForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const good = parseInt($("#tally-good").value, 10);
        const reject = parseInt($("#tally-reject").value, 10);
        const scrap = parseInt($("#tally-scrap").value, 10);
        const ok = good >= 0 && reject >= 0 && scrap >= 0 &&
          !isNaN(good) && !isNaN(reject) && !isNaN(scrap) &&
          (good + reject + scrap) > 0;
        markInvalid($("#tally-good"), !(good >= 0));
        markInvalid($("#tally-reject"), !(reject >= 0));
        markInvalid($("#tally-scrap"), !(scrap >= 0));
        if (!ok) {
          const hint = $("#tally-hint");
          if (hint) hint.textContent = "Isi minimal satu angka timbangan yang lebih dari nol.";
          return;
        }
        const division = $("#tally-division").value;
        const entry = {
          id: Date.now(),
          division: division,
          divisionLabel: divisionLabel(division),
          shift: 1,
          good: good,
          reject: reject,
          scrap: scrap,
          time: formatClock(nowWIB()).slice(0, 5)
        };
        manualTallies.push(entry);
        saveJSON(STORAGE_KEYS.tallies, manualTallies);

        lastUpdateAt = Date.now();
        renderManualLists();
        renderMatrix();
        updateLastUpdated();

        $("#tally-good").value = "";
        $("#tally-reject").value = "";
        $("#tally-scrap").value = "";
        const hint = $("#tally-hint");
        if (hint) hint.textContent = "Rekap " + entry.divisionLabel + " tersimpan. Output ikut diperbarui.";
        showToast("Rekap timbangan tersimpan");
      });
    }

    const eqForm = $("#form-equip");
    if (eqForm) {
      eqForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const code = ($("#eq-code").value || "").trim().toUpperCase();
        const name = ($("#eq-name").value || "").trim();
        markInvalid($("#eq-code"), !code || equipment.some(function (x) { return x.code === code; }));
        markInvalid($("#eq-name"), !name);
        if (!code || !name) {
          showToast("Lengkapi kode dan nama alat");
          return;
        }
        if (equipment.some(function (x) { return x.code === code; })) {
          showToast("Kode " + code + " sudah terdaftar");
          return;
        }
        equipment.push({
          code: code,
          name: name,
          division: $("#eq-division").value,
          stage: $("#eq-stage").value,
          source: $("#eq-source").value
        });
        saveJSON(STORAGE_KEYS.equipment, equipment);
        renderEquipTable();
        populateEquipmentSelect();
        eqForm.reset();
        showToast("Alat " + code + " ditambahkan");
      });
    }
  }

  /* ---------------------------------------------------------
     9. LIVE SIMULATION
     --------------------------------------------------------- */

  function jitter(base, amplitude, seed) {
    // deterministic-ish drift, keeps values in plausible band
    const wave = Math.sin((state.tick + seed) * 0.7) * amplitude;
    return Math.round((base + wave) * 10) / 10;
  }

  function applyLiveValues() {
    const d = divisions.all;
    const oee = jitter(d.oee, 0.25, 1);
    const av = jitter(d.availability, 0.2, 2);
    const pe = jitter(d.performance, 0.18, 3);
    const qu = jitter(d.quality, 0.12, 4);

    divisions.all.oee = oee;
    divisions.all.availability = av;
    divisions.all.performance = pe;
    divisions.all.quality = qu;

    const oeeEl = $("#hero-oee");
    if (oeeEl) oeeEl.textContent = fmtPct(oee);

    const map = [
      ["#sub-availability", "#sub-availability-bar", av],
      ["#sub-performance", "#sub-performance-bar", pe],
      ["#sub-quality", "#sub-quality-bar", qu]
    ];
    map.forEach(function (m) {
      const v = $(m[0]);
      const b = $(m[1]);
      if (v) v.textContent = fmtPct(m[2]);
      if (b) b.style.width = m[2] + "%";
    });

    // Delta vs target
    const deltaEl = $("#hero-delta");
    if (deltaEl) {
      const delta = oee - TARGETS.all;
      deltaEl.textContent = (delta >= 0 ? "+" : "−") + Math.abs(delta).toFixed(1) + " poin vs target";
      deltaEl.className = "delta-pill " + (delta >= 0 ? "delta-pill--up" : "delta-pill--down");
      if (delta < 0 && deltaEl.classList) {
        deltaEl.classList.add("sweep");
        setTimeout(function () { deltaEl.classList.remove("sweep"); }, 500);
      }
    }

    // Feed the newest chart point
    const data = trendData[state.trendRange];
    if (data && data.actual.length) {
      data.actual[data.actual.length - 1] = oee;
    }

    // "Diperbarui" label
    lastUpdateAt = Date.now();
    updateLastUpdated();

    state.tick += 1;
    renderTrend(false);
  }

  let lastUpdateAt = Date.now();

  function updateLastUpdated() {
    const upd = $("#last-updated");
    if (upd) {
      upd.textContent = "Diperbarui " + timeAgo(Date.now() - lastUpdateAt) + " · sumber: " + sourceLabel();
    }
    const ds = $("#data-source-label");
    if (ds) ds.textContent = SOURCE_DISPLAY[sourceLabel()] || sourceLabel();
  }

  let refreshTimer = null;
  function startRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    if (!state.simulate) return;
    refreshTimer = setInterval(function () {
      applyLiveValues();
      if (state.division === "all") renderMatrix();
    }, state.refreshMs);
  }

  /* ---------------------------------------------------------
     10. EXPORT
     --------------------------------------------------------- */

  function exportCSV() {
    const d = divisions[state.division];
    const lines = [];
    lines.push("DRYLINE / OEE — PT. POTENSI BUMI SAKTI");
    lines.push("Laporan Dashboard OEE Produksi Karet Kering");
    lines.push("Waktu Ekspor," + formatDateID(nowWIB()) + " " + formatClock(nowWIB()) + " WIB");
    lines.push("");
    lines.push("RINGKASAN," + d.name);
    lines.push("OEE (%)," + d.oee.toFixed(1));
    lines.push("Ketersediaan (%)," + d.availability.toFixed(1));
    lines.push("Kinerja (%)," + d.performance.toFixed(1));
    lines.push("Kualitas (%)," + d.quality.toFixed(1));
    lines.push("Target OEE (%)," + TARGETS[state.division].toFixed(1));
    lines.push("Output (t)," + getOutput(state.division).toFixed(1));
    lines.push("");
    lines.push("Unit Kerja,Id,OEE (%)");
    d.units.forEach(function (u) { lines.push(u.name + "," + u.id + "," + u.value.toFixed(1)); });
    lines.push("");
    lines.push("Penyebab Kehilangan,Menit (termasuk input manual)");
    (function () {
      const rows = lossPeriods[state.lossPeriod].map(function (r) { return { name: r.name, value: r.value }; });
      if (state.lossPeriod === "current") {
        const manual = manualLossByReason();
        Object.keys(manual).forEach(function (name) {
          const found = rows.filter(function (r) { return r.name === name; })[0];
          if (found) found.value += manual[name];
          else rows.push({ name: name, value: manual[name] });
        });
      }
      rows.sort(function (a, b) { return b.value - a.value; });
      rows.forEach(function (r) { lines.push(r.name + "," + r.value); });
    })();
    lines.push("");
    lines.push("Waktu,Divisi,Peralatan,Kode,Durasi,Status,Sumber,Sebab");
    allEvents().forEach(function (e) {
      lines.push([e.time, e.divisionLabel, e.equipment, e.code, e.duration, e.status, e.source === "manual" ? "manual" : "sistem", e.reason || ""].join(","));
    });
    lines.push("");
    lines.push("Rekap Timbangan Manual");
    lines.push("Waktu,Divisi,Shift,Bagus (kg),Reject (kg),Scrap (kg)");
    manualTallies.forEach(function (t) {
      lines.push([t.time, divisionLabel(t.division), t.shift, t.good, t.reject, t.scrap].join(","));
    });
    lines.push("");
    lines.push("Kamus Alat");
    lines.push("Kode,Nama,Divisi,Tahap,Sumber Data");
    equipment.forEach(function (eq) {
      lines.push([eq.code, eq.name, divisionLabel(eq.division), eq.stage, SOURCE_LABELS[eq.source] || eq.source].join(","));
    });

    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = nowWIB();
    a.href = url;
    a.download = "dryline-oee-" + stamp.getFullYear() + pad2(stamp.getMonth() + 1) + pad2(stamp.getDate()) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast("Laporan berhasil dibuat");
  }

  function printReport() {
    showToast("Menyiapkan laporan shift…");
    setTimeout(function () { window.print(); }, 300);
  }

  /* ---------------------------------------------------------
     11. MODALS
     --------------------------------------------------------- */

  function openModal(id) {
    const m = $(id);
    if (!m) return;
    m.hidden = false;
    const focusable = m.querySelector("input, select, button");
    if (focusable) focusable.focus();
  }
  function closeModal(m) {
    if (m) m.hidden = true;
  }

  /* ---------------------------------------------------------
     12. TABS / SWITCHES
     --------------------------------------------------------- */

  function bindSwitch(container, attr, onChange) {
    $$(container + " [" + attr + "]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const group = btn.closest(".range-switch") || btn.parentElement;
        $$("[" + attr + "]", group).forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        onChange(btn.getAttribute(attr), btn);
      });
    });
  }

  /* ---------------------------------------------------------
     13. INIT
     --------------------------------------------------------- */

  function init() {
    // Boot animation
    requestAnimationFrame(function () {
      document.body.classList.add("is-booted");
    });

    if (reduceMotion) document.body.classList.add("no-motion");

    // Clock
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(updateLastUpdated, 5000);

    // Hero target
    const heroTarget = $("#hero-target");
    if (heroTarget) heroTarget.textContent = fmtPct(TARGETS.all);

    // Charts
    renderTrend(true);
    renderLoss();
    renderMatrix();
    renderLedger();

    // Input shift + kamus alat
    renderReasonChips();
    populateEquipmentSelect();
    renderEquipTable();
    renderManualLists();
    bindInputForms();
    updateLastUpdated();

    const gotoInput = $("#btn-goto-input");
    if (gotoInput) {
      gotoInput.addEventListener("click", function () {
        const sec = $("#input-shift");
        if (sec) {
          sec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          const sel = $("#dt-equipment");
          if (sel) sel.focus({ preventScroll: true });
        }
      });
    }

    let resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { renderTrend(false); }, 150);
    });

    // Trend range
    bindSwitch(".analysis", "data-range", function (val) {
      state.trendRange = val;
      renderTrend(true);
    });

    // Loss period
    bindSwitch(".analysis", "data-loss-period", function (val) {
      state.lossPeriod = val;
      renderLoss();
    });

    // Division
    bindSwitch(".matrix", "data-division", function (val) {
      state.division = val;
      renderMatrix();
    });

    // Event filter
    bindSwitch(".ledger", "data-event-filter", function (val) {
      state.eventFilter = val;
      renderLedger();
    });

    // Export / report buttons
    ["#btn-export-top", "#btn-export-ledger", "#btn-export-foot"].forEach(function (sel) {
      const b = $(sel);
      if (b) b.addEventListener("click", exportCSV);
    });
    const reportBtn = $("#btn-report");
    if (reportBtn) reportBtn.addEventListener("click", printReport);

    // Mobile menu → open settings quick actions
    const menuBtn = $("#btn-menu-mobile");
    if (menuBtn) {
      menuBtn.addEventListener("click", function () {
        openModal("#modal-settings");
      });
    }

    // Modals
    const targetBtn = $("#btn-target");
    if (targetBtn) targetBtn.addEventListener("click", function () { openModal("#modal-target"); });
    ["#btn-settings", "#btn-settings-foot"].forEach(function (sel) {
      const b = $(sel);
      if (b) b.addEventListener("click", function () { openModal("#modal-settings"); });
    });

    $$("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeModal(el.closest(".modal"));
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        $$(".modal").forEach(function (m) { if (!m.hidden) closeModal(m); });
      }
    });

    // Target form
    const formTarget = $("#form-target");
    if (formTarget) {
      const targetBtnOpen = $("#btn-target");
      if (targetBtnOpen) {
        targetBtnOpen.addEventListener("click", function () {
          $("#target-all").value = TARGETS.all.toFixed(1);
          $("#target-wet").value = TARGETS.wet.toFixed(1);
          $("#target-dry").value = TARGETS.dry.toFixed(1);
        });
      }
      formTarget.addEventListener("submit", function (e) {
        e.preventDefault();
        TARGETS.all = parseFloat($("#target-all").value) || TARGETS.all;
        TARGETS.wet = parseFloat($("#target-wet").value) || TARGETS.wet;
        TARGETS.dry = parseFloat($("#target-dry").value) || TARGETS.dry;
        saveJSON(STORAGE_KEYS.targets, { all: TARGETS.all, wet: TARGETS.wet, dry: TARGETS.dry });
        if (heroTarget) heroTarget.textContent = fmtPct(TARGETS.all);
        renderMatrix();
        applyLiveValues();
        closeModal($("#modal-target"));
        showToast("Target berhasil disimpan");
      });
    }

    // Settings form
    const formSettings = $("#form-settings");
    if (formSettings) {
      const settingsBtnOpen = $("#btn-settings");
      const settingsBtnFoot = $("#btn-settings-foot");
      const prefillShift = function () {
        const s = $("#set-shift-start");
        const e = $("#set-shift-end");
        if (s) s.value = shiftHours.start;
        if (e) e.value = shiftHours.end;
      };
      if (settingsBtnOpen) settingsBtnOpen.addEventListener("click", prefillShift);
      if (settingsBtnFoot) settingsBtnFoot.addEventListener("click", prefillShift);
      formSettings.addEventListener("submit", function (e) {
        e.preventDefault();
        const startVal = $("#set-shift-start") ? $("#set-shift-start").value : "";
        const endVal = $("#set-shift-end") ? $("#set-shift-end").value : "";
        if (startVal && endVal) {
          shiftHours = { start: startVal, end: endVal };
          saveJSON("dryline.v1.shiftHours", shiftHours);
          updateClock();
        }
        state.refreshMs = parseInt($("#set-refresh").value, 10) || 15000;
        state.density = $("#set-density").value;
        state.simulate = $("#set-simulasi").checked;
        document.body.classList.toggle("density-compact", state.density === "compact");
        const badge = $("#live-badge");
        if (badge) {
          badge.classList.toggle("is-paused", !state.simulate);
          badge.innerHTML = '<span class="live-badge__dot" aria-hidden="true"></span>' +
            (state.simulate ? "SISTEM AKTIF" : "SIMULASI JEDA");
        }
        startRefresh();
        closeModal($("#modal-settings"));
        showToast("Pengaturan berhasil disimpan");
      });
    }

    // Live refresh
    startRefresh();

    // First "updated" label
    const upd = $("#last-updated");
    if (upd) upd.textContent = "Diperbarui 0 dtk lalu";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
