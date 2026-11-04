/* ===================================================================
   core.js — Registre de mòduls, constructors d'exercicis, correcció,
   progrés (localStorage) i gràfics.
   =================================================================== */
(function (global) {
  'use strict';
  const M = global.M;
  const Calc = { modules: [], byId: {} };

  /** Registra un mòdul: {id,num,llista,title,short,desc,theory,gens:[],bank:[]} */
  Calc.add = function (mod) {
    mod.gens = mod.gens || []; mod.bank = mod.bank || [];
    mod.gens.forEach(g => { g.mod = mod.id; g.key = mod.id + '.' + g.id; g.level = g.level || 1; });
    Calc.modules.push(mod); Calc.byId[mod.id] = mod;
  };
  /** Afegeix un generador a un mòdul ja registrat (p.ex. els de l'altre projecte). */
  Calc.addGen = function (modId, g) {
    const m = Calc.byId[modId]; if (!m) throw new Error('mòdul desconegut ' + modId);
    g.mod = m.id; g.key = m.id + '.' + g.id; g.level = g.level || 1; m.gens.push(g); return g;
  };
  Calc.allGens = () => Calc.modules.flatMap(m => m.gens);
  Calc.genByKey = key => Calc.allGens().find(g => g.key === key);

  /* ----------------------- Constructors de problemes ----------------------- */
  const P = {};
  P.num = (q, ans, sol, o) => Object.assign({ type: 'num', q, ans, sol: sol || [], ansTex: M.numTex(ans) }, o);
  P.fn = (q, ans, sol, o) => {
    o = o || {};
    let at = o.ansTex;
    if (!at) { try { at = M.tex(ans); } catch (e) { at = ans; } }
    return Object.assign({ type: 'fn', q, ans, sol: sol || [], ansTex: at }, o);
  };
  P.multi = (q, fields, sol, o) => Object.assign({ type: 'multi', q, fields, sol: sol || [] }, o);
  /** Opció múltiple: correct i wrongs són cadenes HTML/LaTeX. Barreja amb r. */
  P.mc = (r, q, correct, wrongs, sol, o) => {
    const all = [correct].concat(wrongs.filter((w, i) => w !== correct && wrongs.indexOf(w) === i));
    const order = r.shuffle(all.map((_, i) => i));
    const choices = order.map(i => all[i]);
    return Object.assign({ type: 'mc', q, choices, correct: order.indexOf(0), sol: sol || [] }, o);
  };
  /** Opció múltiple amb ordre fix (p.ex. Vertader/Fals). */
  P.mcFixed = (q, choices, correct, sol, o) => Object.assign({ type: 'mc', q, choices, correct, sol: sol || [] }, o);
  Calc.P = P;

  /** Converteix un problema numèric en test (opció múltiple). */
  Calc.toMC = function (r, p) {
    if (p.type === 'mc') return p;
    if (p.type === 'num') {
      const d = M.numDistractors(p.ans, r, 3);
      return P.mc(r, p.q, '$' + M.numTex(p.ans) + '$', d.map(v => '$' + M.numTex(v) + '$'), p.sol);
    }
    return null;
  };

  /* ------------------------------ Correcció ------------------------------ */
  /** user: string (num/fn), array de strings (multi) o índex (mc). */
  Calc.grade = function (p, user) {
    if (p.type === 'mc') return { ok: user === p.correct };
    if (p.type === 'num') {
      if (p.accept && p.accept.length) {
        for (const a of p.accept) { const g = M.checkNum(user, a, p.tol); if (g.ok) return g; }
      }
      return M.checkNum(user, p.ans, p.tol);
    }
    if (p.type === 'fn') return M.checkFn(user, p.ans, { range: p.range, upToConst: p.utc, v: p.v });
    if (p.type === 'multi') {
      const res = p.fields.map((f, i) => {
        const u = user[i] == null ? '' : user[i];
        if (f.kind === 'fn') return M.checkFn(u, f.ans, { range: f.range || p.range, upToConst: f.utc, v: f.v });
        if (f.kind === 'text') return { ok: String(u).trim().toLowerCase() === String(f.ans).toLowerCase() };
        if (f.check) { if (!String(u).trim()) return { ok: false }; try { const g = f.check(String(u).trim()); return { ok: !!(g && g.ok), msg: g && g.error }; } catch (e) { return { ok: false, parseError: true }; } }
        return M.checkNum(u, f.ans, f.tol != null ? f.tol : p.tol);
      });
      return { ok: res.every(r => r.ok), parts: res.map(r => r.ok), parseError: res.some(r => r.parseError) };
    }
    return { ok: false };
  };
  /** Text de la resposta correcta (LaTeX). */
  Calc.answerTex = function (p) {
    if (p.type === 'mc') return p.choices[p.correct];
    if (p.type === 'num' || p.type === 'fn') return '$' + (p.ansTex || '') + '$' + (p.utc ? ' $+C$' : '');
    if (p.type === 'multi' && p.legacy) return '';
    if (p.type === 'multi') return p.fields.map(f => (f.label ? f.label + ' ' : '') + '$' + (f.ansTex || (f.kind === 'fn' ? M.tex(f.ans) : M.numTex(f.ans))) + '$').join(' &nbsp;·&nbsp; ');
    return '';
  };

  /** Genera un problema reproduïble a partir d'un generador i una llavor. */
  Calc.make = function (gen, seed) {
    const r = M.rng(seed);
    let p, tries = 0;
    for (;;) {
      try { p = gen.make(r); if (p) break; } catch (e) { if (tries > 50) throw e; }
      if (++tries > 60) throw new Error('No es pot generar ' + gen.key);
    }
    p.gkey = gen.key; p.seed = seed; p.title = gen.title; p.level = gen.level;
    return p;
  };
  Calc.newSeed = () => (Math.random() * 4294967295) >>> 0;

  /* ------------------------------ Progrés ------------------------------ */
  /* Mestria per habilitat (cada tipus d'exercici). Dominar = entrenar molt, en dies diferents, i aguantar els repassos.
     Punts: +1 si l'encertes a la primera sense pista · 0 amb pista o mirant la solució · −1 si falles.
     Cada rang demana punts + dies diferents amb algun encert + repassos superats (encertar-la quan li tocava repàs).
     El rang és el màxim assolit: MAI baixa. El que sí caduca és la «forma»: cada rang té un interval de repàs. */
  const RANKS = ['Nou', 'Iniciat', 'Aprenent', 'Practicant', 'Competent', 'Dominat', 'Mestre'];
  const RANK_PTS = [0, 1, 5, 12, 25, 45, 80];
  const RANK_DAYS = [0, 0, 0, 2, 4, 7, 12];
  const RANK_REVS = [0, 0, 0, 0, 1, 3, 6];
  const RANK_VAL = [0, 0.2, 0.4, 0.6, 0.75, 1, 1]; // valor 0..1 que fan servir anells, mapa i camí (verd = Dominat)
  const REVIEW_DAYS = [0, 1, 1, 2, 4, 8, 21];
  const DAY = 864e5;
  const meets = (g, r) => (g.pts || 0) >= RANK_PTS[r] && (g.days || 0) >= RANK_DAYS[r] && (g.revs || 0) >= RANK_REVS[r];
  const rankOfG = g => { let r = 0; while (r < 6 && meets(g, r + 1)) r++; return Math.max(r, g.floor || 0); };
  const rankOf = pts => rankOfG({ pts, days: 99, revs: 99 }); // només pels punts (compatibilitat)
  /** Què falta per al rang següent: [{have, need, label}] (només els requisits que encara no compleix). */
  const nextReq = g => {
    const r = Math.min(6, (g.best || 0) + 1);
    return [[g.pts || 0, RANK_PTS[r], 'punts'], [g.days || 0, RANK_DAYS[r], 'dies'], [g.revs || 0, RANK_REVS[r], 'repassos']].filter(x => x[1] > 0).map(([have, need, label]) => ({ have, need, label, done: have >= need }));
  };
  const dayStr = dt => { dt = dt || new Date(); return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); };
  Calc.RANKS = RANKS; Calc.RANK_VAL = RANK_VAL; Calc.RANK_PTS = RANK_PTS; Calc.RANK_DAYS = RANK_DAYS; Calc.RANK_REVS = RANK_REVS; Calc.rankOf = rankOf; Calc.rankOfG = rankOfG; Calc.nextReq = nextReq; Calc.dayStr = dayStr;

  const XP_PTS = [0, 1, 2, 3, 4, 6, 9], XP_DAYS = [0, 0, 0, 2, 3, 4, 6], XP_REVIEW = [1, 1, 2, 4, 7, 14, 30];
  Calc.XP_PTS = XP_PTS; Calc.XP_DAYS = XP_DAYS;
  Calc.partRankOf = x => { let r = 0; while (r < 6 && x.pts >= XP_PTS[r + 1] && x.days >= XP_DAYS[r + 1]) r++; return r; };
  Calc.partNext = x => { const r = Math.min(6, (x ? x.best : 0) + 1); x = x || { pts: 0, days: 0 }; return [[x.pts, XP_PTS[r], 'resolucions netes'], [x.days, XP_DAYS[r], 'dies']].filter(a => a[1] > 0).map(([have, need, label]) => ({ have, need, label, done: have >= need })); };

  const KEY = 'calcmaster.v1';
  let mem = null;
  const fresh = () => ({ gens: {}, errors: [], exams: [], xp: 0, days: {}, dayx: {}, cert: {}, ach: {}, row: 0, bestRow: 0, ms: 0, lastT: 0, goal: 15, xparts: {} });
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { mem = null; }
    if (!mem) mem = fresh();
    const f = fresh(); Object.keys(f).forEach(k => { if (mem[k] == null) mem[k] = f[k]; });
    // Dades d'abans de la mestria: punts = encerts − errors (mai negatius).
    Object.values(mem.gens).forEach(g => { if (g.pts == null) { g.pts = Math.max(0, g.ok - (g.att - g.ok)); g.due = Date.now(); } });
    // v2 (mestria exigent): cal també dies diferents i repassos. Els rangs es recalculen amb els requisits nous.
    if ((mem.mv || 1) < 2) {
      Object.values(mem.gens).forEach(g => { g.days = g.days || (g.ok > 0 ? 1 : 0); g.revs = g.revs || 0; g.ms = g.ms || 0; g.best = rankOfG(g); });
      mem.mv = 2;
    }
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* sense emmagatzematge */ } }
  const listeners = [];
  const today = () => { const d = load(), k = dayStr(new Date(Date.now())); return d.dayx[k] || (d.dayx[k] = { n: 0, ok: 0, xp: 0, ms: 0, ups: 0, row: 0, bestRow: 0, gens: {}, p2: 0, rev: 0 }); };
  function addXp(n) { const d = load(); d.xp += n; today().xp += n; }
  Calc.store = {
    data: load, save, today, addXp,
    on(f) { listeners.push(f); },
    /** kind: 'ok' (a la primera sense ajuda) · 'assist' (amb pista) · 'seen' (ha mirat la solució) · 'fail'. Retorna què ha canviat. */
    record(key, ok, p, kind) {
      kind = kind || (ok ? 'ok' : 'fail');
      const d = load(), now = Date.now(), t = today(), dk = dayStr(new Date(now));
      const g = d.gens[key] || (d.gens[key] = { att: 0, ok: 0, hist: [], pts: 0, best: 0, due: now, days: 0, revs: 0, ms: 0 });
      const gen = Calc.genByKey && Calc.genByKey(key), lvl = (gen && gen.level) || 1;
      const wasDue = g.best >= 2 && g.due <= now, from = g.best, ptsFrom = g.pts;
      g.att++; if (kind === 'ok') g.ok++;
      g.hist.push(kind === 'ok' ? 1 : kind === 'assist' ? 0.5 : 0); if (g.hist.length > 12) g.hist.shift();
      if (kind === 'ok') g.pts += 1; else if (kind === 'fail') g.pts = Math.max(0, g.pts - 1);
      if (kind === 'ok' && g.okDay !== dk) { g.days = (g.days || 0) + 1; g.okDay = dk; }
      const revOk = wasDue && g.sched && kind === 'ok'; if (revOk) g.revs = (g.revs || 0) + 1;
      g.best = Math.max(g.best, rankOfG(g));
      g.due = kind === 'ok' ? now + REVIEW_DAYS[g.best] * DAY : now; g.sched = kind === 'ok';
      g.last = now;
      const xp = kind === 'ok' ? 8 + 4 * lvl : kind === 'assist' ? 4 : 2; // l'esforç també compta
      addXp(xp);
      // temps actiu: el que passa entre respostes (si és menys de 5 min)
      const gap = d.lastT ? now - d.lastT : 0, ms = gap > 0 && gap < 3e5 ? gap : 45e3;
      d.ms += ms; t.ms += ms; d.lastT = now; g.ms = (g.ms || 0) + ms;
      d.days[dk] = (d.days[dk] || 0) + 1;
      t.n++; if (kind === 'ok') t.ok++; t.gens[key] = 1; if (wasDue) t.rev++;
      if (gen && Calc.P2_IDS && Calc.P2_IDS.includes(gen.mod)) t.p2++;
      if (kind === 'ok') { d.row++; t.row++; d.bestRow = Math.max(d.bestRow, d.row); t.bestRow = Math.max(t.bestRow, t.row); } else { d.row = 0; t.row = 0; }
      if (g.best > from) t.ups++;
      if (kind !== 'ok' && p && p.seed != null) {
        d.errors = d.errors.filter(e => !(e.gkey === key && e.seed === p.seed));
        d.errors.push({ gkey: key, seed: p.seed, t: now });
        if (d.errors.length > 150) d.errors.shift();
      }
      if (kind === 'ok' && p) d.errors = d.errors.filter(e => !(e.gkey === key && e.seed === p.seed));
      const info = { key, kind, xp, from, to: g.best, pts: g.pts, ptsFrom, wasDue, revOk };
      listeners.forEach(f => { try { f(info); } catch (e) { /* res */ } });
      save();
      return info;
    },
    /** Prova de mestria superada: la habilitat queda com a mínim a `rank` (els rangs alts s'han de guanyar entrenant). */
    boost(key, rank) {
      const d = load(), g = d.gens[key] || (d.gens[key] = { att: 0, ok: 0, hist: [], pts: 0, best: 0, due: Date.now(), days: 0, revs: 0, ms: 0 });
      g.floor = Math.max(g.floor || 0, rank); g.best = Math.max(g.best, rankOfG(g)); g.due = Date.now() + REVIEW_DAYS[g.best] * DAY; g.sched = true; save();
    },
    /* ---- Apartats d'exàmens reals: també tenen rang (es resolen en paper i t'autoavalues) ----
       ✅ resolt sol +1 · 🤔 a mitges 0 · ❌ no −1. Compta una nota per dia i apartat (si la canvies el mateix dia, es corregeix).
       Rangs: punts + dies diferents (un examen es domina si el tornes a treure setmanes després). */
    part(key) { return load().xparts[key] || null; },
    partRank(key) { const x = load().xparts[key]; return x ? x.best : 0; },
    partDue(key) { const x = load().xparts[key]; return !!x && x.due <= Date.now(); },
    markPart(key, v) {
      const d = load(), now = Date.now(), dk = dayStr(new Date(now));
      const x = d.xparts[key] || (d.xparts[key] = { pts: 0, best: 0, days: 0, n: 0, due: now, okDay: null, day: null, mark: null });
      const firstToday = x.day !== dk, from = x.best;
      if (firstToday) { x.n++; x.snap = { pts: x.pts, days: x.days, okDay: x.okDay, best: x.best }; }
      else Object.assign(x, x.snap); // canvi de nota el mateix dia: es parteix d'abans de la d'avui
      if (v === 2) { x.pts++; if (x.okDay !== dk) { x.days++; x.okDay = dk; } }
      else if (v === 0) x.pts = Math.max(0, x.pts - 1);
      x.mark = v; x.day = dk; x.last = now;
      x.best = Math.max(x.best, Calc.partRankOf(x));
      x.due = now + (v === 2 ? XP_REVIEW[x.best] : 1) * DAY;
      let xp = 0;
      if (firstToday) { xp = v === 2 ? 15 : v === 1 ? 6 : 3; addXp(xp); const t = today(); t.xpart = (t.xpart || 0) + 1; d.days[dk] = (d.days[dk] || 0) + 1; }
      save();
      return { key, v, xp, from, to: x.best, firstToday };
    },
    clearError(key, seed) { const d = load(); d.errors = d.errors.filter(e => !(e.gkey === key && e.seed === seed)); save(); },
    addExam(e) { const d = load(); d.exams.push(e); if (d.exams.length > 40) d.exams.shift(); save(); },
    reset() { mem = fresh(); save(); },
    rank(key) { const g = load().gens[key]; return g ? g.best : 0; },
    /** Habilitat «per repassar»: ja l'havies après (Aprenent o més) i li toca el repàs. */
    isDue(key) { const g = load().gens[key]; return !!g && g.best >= 2 && g.due <= Date.now(); },
    /** Domini 0..1 d'un generador segons el rang (verd a partir de Dominat). null si no l'has provat mai. */
    genMastery(key) {
      const g = load().gens[key];
      if (!g || (!g.att && !g.best)) return null;
      return RANK_VAL[g.best];
    },
    /** Encert recent 0..1 (pesa més el més nou): per saber si una cosa «costa». */
    genAccuracy(key) {
      const g = load().gens[key];
      if (!g || !g.hist.length) return null;
      const h = g.hist; let w = 0, s = 0;
      h.forEach((v, i) => { const wi = 1 + i / h.length; w += wi; s += wi * v; });
      return s / w;
    },
    modMastery(mod) {
      let tot = 0, n = 0, att = 0, acc = 0, na = 0;
      mod.gens.forEach(g => {
        const m = Calc.store.genMastery(g.key), gd = load().gens[g.key], a = Calc.store.genAccuracy(g.key);
        if (gd) att += gd.att; if (m != null) { tot += m; n++; } if (a != null) { acc += a; na++; }
      });
      return { value: n ? tot / mod.gens.length : 0, covered: n, total: mod.gens.length, att, acc: na ? acc / na : null };
    },
    streakDays() {
      const d = load().days; let s = 0; const dt = new Date();
      if (!d[dayStr(dt)]) dt.setDate(dt.getDate() - 1); // avui encara hi ets a temps
      while (d[dayStr(dt)]) { s++; dt.setDate(dt.getDate() - 1); }
      return s;
    },
    bestStreak() {
      const ks = Object.keys(load().days).sort(); let best = 0, cur = 0, prev = null;
      ks.forEach(k => { const t = new Date(k + 'T12:00:00').getTime(); cur = prev != null && Math.round((t - prev) / DAY) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = t; });
      return best;
    }
  };

  /* ------------------------------- Gràfics ------------------------------- */
  /** spec: {fns:[{f:'x^2',color,label}], xr:[a,b], yr?:[c,d], shade?:{top,bottom,a,b}, points?:[[x,y,label]]} */
  Calc.plot = function (canvas, spec) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || 420, H = canvas.clientHeight || 260;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const c = canvas.getContext('2d'); c.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const col = n => css.getPropertyValue(n).trim() || '#888';
    const fns = spec.fns.map(o => Object.assign({}, o, { fc: M.compile(o.f) }));
    const [x0, x1] = spec.xr;
    let y0, y1;
    if (spec.yr) [y0, y1] = spec.yr; else {
      let lo = Infinity, hi = -Infinity;
      fns.forEach(o => { for (let i = 0; i <= 200; i++) { const y = o.fc(x0 + (x1 - x0) * i / 200); if (isFinite(y) && Math.abs(y) < 1e4) { lo = Math.min(lo, y); hi = Math.max(hi, y); } } });
      if (!isFinite(lo)) { lo = -1; hi = 1; }
      const pad = (hi - lo) * 0.12 || 1; y0 = Math.min(lo, 0) - pad; y1 = Math.max(hi, 0) + pad;
    }
    const sx = x => (x - x0) / (x1 - x0) * W, sy = y => H - (y - y0) / (y1 - y0) * H;
    c.clearRect(0, 0, W, H);
    // graella
    c.strokeStyle = col('--grid'); c.lineWidth = 1; c.fillStyle = col('--muted'); c.font = '11px sans-serif';
    const step = (a, b) => { const raw = (b - a) / 8; const p = Math.pow(10, Math.floor(Math.log10(raw))); const m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; };
    const dx = step(x0, x1), dy = step(y0, y1);
    for (let x = Math.ceil(x0 / dx) * dx; x <= x1 + 1e-9; x += dx) { c.beginPath(); c.moveTo(sx(x), 0); c.lineTo(sx(x), H); c.stroke(); if (Math.abs(x) > 1e-9) c.fillText(+x.toFixed(2), sx(x) + 2, Math.min(H - 3, Math.max(11, sy(0) - 3))); }
    for (let y = Math.ceil(y0 / dy) * dy; y <= y1 + 1e-9; y += dy) { c.beginPath(); c.moveTo(0, sy(y)); c.lineTo(W, sy(y)); c.stroke(); if (Math.abs(y) > 1e-9) c.fillText(+y.toFixed(2), Math.min(W - 24, Math.max(2, sx(0) + 3)), sy(y) - 2); }
    c.strokeStyle = col('--text'); c.lineWidth = 1.3;
    if (y0 < 0 && y1 > 0) { c.beginPath(); c.moveTo(0, sy(0)); c.lineTo(W, sy(0)); c.stroke(); }
    if (x0 < 0 && x1 > 0) { c.beginPath(); c.moveTo(sx(0), 0); c.lineTo(sx(0), H); c.stroke(); }
    // regió ombrejada
    if (spec.shade) {
      const sh = spec.shade, top = M.compile(sh.top), bot = M.compile(sh.bottom || '0');
      c.fillStyle = col('--accent-soft'); c.beginPath();
      const n = 120;
      for (let i = 0; i <= n; i++) { const x = sh.a + (sh.b - sh.a) * i / n; const y = top(x); i ? c.lineTo(sx(x), sy(y)) : c.moveTo(sx(x), sy(y)); }
      for (let i = n; i >= 0; i--) { const x = sh.a + (sh.b - sh.a) * i / n; c.lineTo(sx(x), sy(bot(x))); }
      c.closePath(); c.fill();
    }
    const palette = [col('--accent'), col('--warn'), col('--ok'), col('--bad')];
    fns.forEach((o, k) => {
      c.strokeStyle = o.color || palette[k % palette.length]; c.lineWidth = 2.2; c.beginPath();
      let pen = false, prev = null;
      for (let i = 0; i <= 600; i++) {
        const x = x0 + (x1 - x0) * i / 600, y = o.fc(x);
        if (!isFinite(y) || y > y1 + (y1 - y0) * 3 || y < y0 - (y1 - y0) * 3 || (prev !== null && Math.abs(y - prev) > (y1 - y0) * 1.5)) { pen = false; prev = isFinite(y) ? y : null; continue; }
        prev = y;
        if (!pen) { c.moveTo(sx(x), sy(y)); pen = true; } else c.lineTo(sx(x), sy(y));
      }
      c.stroke();
      if (o.label) { c.fillStyle = c.strokeStyle; c.font = 'bold 12px sans-serif'; c.fillText(o.label, 8, 16 + 14 * k); }
    });
    (spec.points || []).forEach(p => {
      c.fillStyle = col('--bad'); c.beginPath(); c.arc(sx(p[0]), sy(p[1]), 4, 0, 7); c.fill();
      if (p[2]) { c.fillStyle = col('--text'); c.font = '12px sans-serif'; c.fillText(p[2], sx(p[0]) + 6, sy(p[1]) - 6); }
    });
  };

  /** Helper per als generadors: dibuixa una gràfica dins del problema. */
  Calc.withPlot = (p, spec) => { p.plot = spec; return p; };

  global.Calc = Calc;
  if (typeof module !== 'undefined') module.exports = Calc;
})(typeof window !== 'undefined' ? window : globalThis);
