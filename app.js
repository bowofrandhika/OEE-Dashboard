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
     4. CLOCK & SHIFT
     --------------------------------------------------------- */

  // Shift 2 = 14:00–22:00 WIB
  const SHIFT2_START = 14 * 3600;
  const SHIFT2_END = 22 * 3600;

  function updateClock() {
    const wib = nowWIB();
    const clock = $("#header-clock");
    const dateEl = $("#header-date");
    if (clock) clock.textContent = formatClock(wib);
    if (dateEl) dateEl.textContent = formatDateID(wib);

    const secs = wib.getHours() * 3600 + wib.getMinutes() * 60 + wib.getSeconds();

    // Determine active shift window (24h rotation of three 8h shifts)
    let start, end, shiftNo;
    if (secs >= SHIFT2_START && secs < SHIFT2_END) {
      start = SHIFT2_START; end = SHIFT2_END; shiftNo = 2;
    } else if (secs >= SHIFT2_END || secs < 6 * 3600) {
      start = SHIFT2_END; end = 30 * 3600; shiftNo = 3;
    } else {
      start = 6 * 3600; end = SHIFT2_START; shiftNo = 1;
    }
    let elapsed = secs - start;
    if (elapsed < 0) elapsed += 86400;
    const remaining = Math.max(0, (end - start) - elapsed);
    const progress = Math.min(100, Math.max(0, (elapsed / (end - start)) * 100));

    const shiftEl = $("#hero-shift");
    if (shiftEl) shiftEl.textContent = "Shift " + shiftNo;

    const timer = $("#hero-timer");
    const cycle = $("#cycle-time");
    const formatted = formatDurasi(remaining);
    if (timer) timer.textContent = formatted;
    if (cycle) cycle.textContent = formatted;

    const rangeEl = $("#shift-range");
    if (rangeEl) {
      rangeEl.textContent = pad2(Math.floor(start / 3600) % 24) + ":00 — " + pad2(Math.floor(end / 3600) % 24) + ":00";
    }
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
    const rows = lossPeriods[state.lossPeriod];
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
        '<div class="ov-cell"><div class="ov-cell__label"><span class="micro-label">Output</span><span class="unit">target ' + d.targetOutput.toFixed(1) + ' t</span></div><p class="ov-cell__value">' + d.output.toFixed(1) + '<span class="unit"> t</span></p></div>' +
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

  function renderLedger() {
    const body = $("#ledger-body");
    if (!body) return;
    const rows = events.filter(function (e) {
      return state.eventFilter === "all" || e.division === state.eventFilter || e.division === "all";
    });

    body.innerHTML = rows.map(function (e, i) {
      const isNew = i === 0 && e.status === "aktif";
      const statusMap = {
        aktif: ['status-chip--active', 'Aktif'],
        selesai: ['status-chip--done', 'Selesai'],
        tahan: ['status-chip--hold', 'Tahan']
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
    const upd = $("#last-updated");
    if (upd) upd.textContent = "Diperbarui 0 dtk lalu";

    state.tick += 1;
    renderTrend(false);
  }

  let lastUpdateAt = Date.now();

  function updateLastUpdated() {
    const upd = $("#last-updated");
    if (!upd) return;
    const secs = Math.max(0, Math.floor((Date.now() - lastUpdateAt) / 1000));
    upd.textContent = "Diperbarui " + secs + " dtk lalu";
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
    lines.push("DRYLINE / OEE — Laporan Dashboard");
    lines.push("Waktu Ekspor," + formatDateID(nowWIB()) + " " + formatClock(nowWIB()) + " WIB");
    lines.push("");
    lines.push("RINGKASAN," + d.name);
    lines.push("OEE (%)," + d.oee.toFixed(1));
    lines.push("Ketersediaan (%)," + d.availability.toFixed(1));
    lines.push("Kinerja (%)," + d.performance.toFixed(1));
    lines.push("Kualitas (%)," + d.quality.toFixed(1));
    lines.push("Target OEE (%)," + TARGETS[state.division].toFixed(1));
    lines.push("Output (t)," + d.output.toFixed(1));
    lines.push("");
    lines.push("Unit Kerja,Id,OEE (%)");
    d.units.forEach(function (u) { lines.push(u.name + "," + u.id + "," + u.value.toFixed(1)); });
    lines.push("");
    lines.push("Penyebab Kehilangan,Menit");
    d.downtime.forEach(function (r) { lines.push(r.name + "," + r.value); });
    lines.push("");
    lines.push("Waktu,Divisi,Peralatan,Kode,Durasi,Status");
    events.forEach(function (e) {
      lines.push([e.time, e.divisionLabel, e.equipment, e.code, e.duration, e.status].join(","));
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
      formTarget.addEventListener("submit", function (e) {
        e.preventDefault();
        TARGETS.all = parseFloat($("#target-all").value) || TARGETS.all;
        TARGETS.wet = parseFloat($("#target-wet").value) || TARGETS.wet;
        TARGETS.dry = parseFloat($("#target-dry").value) || TARGETS.dry;
        if (heroTarget) heroTarget.textContent = fmtPct(TARGETS.all);
        renderMatrix();
        closeModal($("#modal-target"));
        showToast("Target berhasil disimpan");
      });
    }

    // Settings form
    const formSettings = $("#form-settings");
    if (formSettings) {
      formSettings.addEventListener("submit", function (e) {
        e.preventDefault();
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

    // Plant selector
    const plant = $("#plant-select");
    if (plant) {
      plant.addEventListener("change", function () {
        showToast("Plant diganti ke " + plant.options[plant.selectedIndex].text.replace("PLANT / ", ""));
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
