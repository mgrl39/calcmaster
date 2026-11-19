/* =====================================================================
   sem3_lib.js — motor del Seminari 3 (derivades, cadena, límits, L'Hôpital,
   extrems, quocients a l'infinit), portat dins de CalcMaster.
   Tot queda dins d'aquesta funció (no xoca amb el M de CalcMaster) i
   s'exposa com a window.SEM3 = { M, Plot, G, SK, THEORY, LESSONS }.
   ===================================================================== */
(function () {
/* ---------- mathx.js ---------- */
/* ===========================================================
   MathX: parser d'expressions, avaluació numèrica, TeX, comparadors
   =========================================================== */
const M = (() => {
  const FN_NAMES = ['arcsin', 'arccos', 'arctan', 'sqrt', 'arrel', 'sin', 'sen', 'cos', 'tan', 'tg', 'exp', 'ln', 'log', 'abs'];
  const FN_ALIAS = { sen: 'sin', tg: 'tan', log: 'ln', arrel: 'sqrt' };
  const WORDS = [...FN_NAMES, 'pi', 'x', 'h', 'e'];

  function tokenize(src) {
    const s = src
      .replace(/[·×]/g, '*').replace(/[−–]/g, '-').replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt').replace(/²/g, '^2').replace(/³/g, '^3').replace(/\*\*/g, '^')
      .replace(/[\[{]/g, '(').replace(/[\]}]/g, ')');
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const str = s.slice(i, j);
        if (str === '.' || (str.match(/\./g) || []).length > 1) throw new Error('Número mal escrit: ' + str);
        toks.push({ t: 'num', v: parseFloat(str) });
        i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        let j = i;
        while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
        const w = s.slice(i, j).toLowerCase();
        let k = 0;
        while (k < w.length) {
          let m = null;
          for (const n of WORDS) if (w.startsWith(n, k) && (!m || n.length > m.length)) m = n;
          if (!m) throw new Error(`No reconec «${w.slice(k)}». Usa x, sin, cos, tan, exp, ln, sqrt, pi, e`);
          if (FN_NAMES.includes(m)) toks.push({ t: 'fn', v: FN_ALIAS[m] || m });
          else if (m === 'x' || m === 'h') toks.push({ t: 'var' });
          else toks.push({ t: 'const', v: m });
          k += m.length;
        }
        i = j; continue;
      }
      if ('+-*/^()'.includes(c)) { toks.push({ t: 'op', v: c }); i++; continue; }
      throw new Error(`Caràcter no vàlid: «${c}»`);
    }
    return toks;
  }

  function parse(src) {
    if (!src || !src.trim()) throw new Error('Escriu alguna cosa');
    const toks = tokenize(src);
    let p = 0;
    const isOp = v => p < toks.length && toks[p].t === 'op' && toks[p].v === v;
    const expect = v => {
      if (!isOp(v)) throw new Error(v === ')' ? 'Falta tancar un parèntesi «)»' : "S'esperava " + v);
      p++;
    };
    const starts = () => {
      const t = toks[p];
      return t && (t.t === 'num' || t.t === 'var' || t.t === 'const' || t.t === 'fn' || (t.t === 'op' && t.v === '('));
    };
    function expr() {
      let a = term();
      while (isOp('+') || isOp('-')) {
        const o = toks[p++].v;
        const b = term();
        a = { t: o === '+' ? 'add' : 'sub', a, b };
      }
      return a;
    }
    function term() {
      let a = unary();
      for (;;) {
        if (isOp('*') || isOp('/')) {
          const o = toks[p++].v;
          const b = unary();
          a = { t: o === '*' ? 'mul' : 'div', a, b };
        } else if (starts()) {
          const b = power();
          a = { t: 'mul', a, b };
        } else break;
      }
      return a;
    }
    function unary() {
      if (isOp('-')) { p++; return { t: 'neg', a: unary() }; }
      if (isOp('+')) { p++; return unary(); }
      return power();
    }
    function power() {
      const b = primary();
      if (isOp('^')) { p++; const e = unary(); return { t: 'pow', a: b, b: e }; }
      return b;
    }
    function primary() {
      const t = toks[p];
      if (!t) throw new Error('Expressió incompleta');
      if (t.t === 'num') { p++; return { t: 'num', v: t.v }; }
      if (t.t === 'var') { p++; return { t: 'var' }; }
      if (t.t === 'const') { p++; return { t: 'const', v: t.v }; }
      if (t.t === 'fn') {
        p++;
        let ex = null;
        if (isOp('^')) {
          p++;
          if (isOp('-')) { p++; ex = { t: 'neg', a: primary() }; } else ex = primary();
        }
        if (p >= toks.length) throw new Error(`Falta l'argument de ${t.v}`);
        let arg;
        if (isOp('(')) { p++; arg = expr(); expect(')'); } else arg = power();
        let node = { t: 'fn', v: t.v, a: arg };
        if (ex) node = { t: 'pow', a: node, b: ex };
        return node;
      }
      if (isOp('(')) { p++; const e = expr(); expect(')'); return e; }
      throw new Error(`Símbol inesperat: «${t.v}»`);
    }
    const ast = expr();
    if (p < toks.length) throw new Error(isOp(')') ? 'Sobra un parèntesi «)»' : 'Expressió mal formada');
    return ast;
  }

  const FN = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp,
    ln: x => (x > 0 ? Math.log(x) : NaN), sqrt: x => (x >= 0 ? Math.sqrt(x) : NaN),
    abs: Math.abs, arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  };
  function powR(b, e) {
    if (b >= 0 || Number.isInteger(e)) return Math.pow(b, e);
    for (const q of [3, 5, 7, 9]) {
      const pp = e * q;
      if (Math.abs(pp - Math.round(pp)) < 1e-9) return (Math.round(pp) % 2 ? -1 : 1) * Math.pow(-b, e);
    }
    return NaN;
  }
  function ev(n, x) {
    switch (n.t) {
      case 'num': return n.v;
      case 'var': return x;
      case 'const': return n.v === 'pi' ? Math.PI : Math.E;
      case 'add': return ev(n.a, x) + ev(n.b, x);
      case 'sub': return ev(n.a, x) - ev(n.b, x);
      case 'mul': return ev(n.a, x) * ev(n.b, x);
      case 'div': return ev(n.a, x) / ev(n.b, x);
      case 'neg': return -ev(n.a, x);
      case 'pow': return powR(ev(n.a, x), ev(n.b, x));
      case 'fn': return FN[n.v](ev(n.a, x));
    }
    return NaN;
  }
  function hasVar(n) {
    if (!n) return false;
    if (n.t === 'var') return true;
    return hasVar(n.a) || hasVar(n.b);
  }

  /* ---------- TeX ---------- */
  const PREC = { add: 1, sub: 1, mul: 2, div: 2, neg: 3, pow: 4 };
  const prec = n => PREC[n.t] || 5;
  const wrap = s => `\\left(${s}\\right)`;
  const FNTEX = { sin: '\\sin', cos: '\\cos', tan: '\\tan', ln: '\\ln', arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\arctan' };
  function leftmost(n) { while (n.a && ['add', 'sub', 'mul', 'div', 'pow'].includes(n.t)) n = n.a; return n; }
  function fnTeX(name, a) {
    if (name === 'sqrt') return `\\sqrt{${a}}`;
    if (name === 'abs') return `\\left|${a}\\right|`;
    if (name === 'exp') return `e^{${a}}`;
    return `${FNTEX[name]}\\left(${a}\\right)`;
  }
  function tex(n) {
    switch (n.t) {
      case 'num': return fmt(n.v);
      case 'var': return 'x';
      case 'const': return n.v === 'pi' ? '\\pi' : 'e';
      case 'add': return `${tex(n.a)} + ${n.b.t === 'neg' ? wrap(tex(n.b)) : tex(n.b)}`;
      case 'sub': return `${tex(n.a)} - ${prec(n.b) <= 1 || n.b.t === 'neg' ? wrap(tex(n.b)) : tex(n.b)}`;
      case 'mul': {
        const l = prec(n.a) < 2 ? wrap(tex(n.a)) : tex(n.a);
        const r = prec(n.b) < 2 || n.b.t === 'neg' ? wrap(tex(n.b)) : tex(n.b);
        const dot = leftmost(n.b).t === 'num' || n.b.t === 'neg' || prec(n.b) < 2;
        return dot && !(prec(n.b) < 2) ? `${l} \\cdot ${r}` : `${l}\\,${r}`;
      }
      case 'div': return `\\frac{${tex(n.a)}}{${tex(n.b)}}`;
      case 'neg': {
        const s = tex(n.a);
        return prec(n.a) < 2 || n.a.t === 'neg' ? `-${wrap(s)}` : `-${s}`;
      }
      case 'pow': {
        if (n.a.t === 'fn' && FNTEX[n.a.v]) return `${FNTEX[n.a.v]}^{${tex(n.b)}}\\left(${tex(n.a.a)}\\right)`;
        const base = prec(n.a) < 5 || n.a.t === 'fn' ? wrap(tex(n.a)) : tex(n.a);
        return `${base}^{${tex(n.b)}}`;
      }
      case 'fn': return fnTeX(n.v, tex(n.a));
    }
    return '?';
  }
  function fmt(v) {
    if (!isFinite(v)) return v > 0 ? '+\\infty' : v < 0 ? '-\\infty' : '\\text{?}';
    if (Number.isInteger(v)) return String(v);
    return String(+v.toFixed(6));
  }
  // número -> TeX intentant fracció
  function numTeX(v) {
    if (!isFinite(v)) return fmt(v);
    for (let q = 1; q <= 60; q++) {
      const p = Math.round(v * q);
      if (Math.abs(p / q - v) < 1e-9) return fracTeX(p, q);
    }
    return fmt(v);
  }

  /* ---------- comparadors ---------- */
  function close(a, b, tol = 1e-6) {
    if (!isFinite(a) || !isFinite(b)) return a === b;
    return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
  }
  const SAMPLE = [-1.93, -1.37, -1.08, -0.83, -0.61, -0.41, -0.27, 0.19, 0.33, 0.52, 0.74, 0.97, 1.21, 1.46, 1.72, 2.03];
  function equivFn(ast, trueF, pts = SAMPLE) {
    let ok = 0, bad = 0;
    for (const x of pts) {
      const t = trueF(x);
      if (!isFinite(t) || Math.abs(t) > 1e7) continue;
      const u = ev(ast, x);
      if (!isFinite(u)) { bad++; continue; }
      if (close(u, t, 1e-6)) ok++; else return false;
    }
    return ok >= 3 && bad <= ok / 3;
  }

  function parseValue(s) {
    const a = parse(s);
    if (hasVar(a)) throw new Error("Aquí ha de ser un número, sense x");
    const v = ev(a, 0);
    if (!isFinite(v)) throw new Error('Aquest valor no és un número real');
    return { v, tex: tex(a) };
  }

  const EMPTY_RE = /^(∅|ø|cap|buit|ningun|ninguno|none|\{\}|no hi ha|no n'hi ha|cap punt)$/i;
  const DNE = ['noexisteix', 'ne', 'no', '∄', 'dne', 'noexiste', 'nohiha', 'noexist'];
  const INF_RE = /^([+-]?)(∞|inf|infty|infinit|infinity|infinito|oo)$/;

  function parseLimit(s) {
    const t = s.trim().toLowerCase().replace(/\s+/g, '').replace(/[−–]/g, '-');
    if (!t) throw new Error('Escriu alguna cosa');
    if (DNE.includes(t)) return { k: 'dne', tex: '\\nexists' };
    const m = t.match(INF_RE);
    if (m) return { k: 'inf', s: m[1] === '-' ? -1 : 1, tex: m[1] === '-' ? '-\\infty' : '+\\infty' };
    const pv = parseValue(s);
    return { k: 'num', v: pv.v, tex: pv.tex };
  }
  function sameLimit(a, b) {
    if (a.k !== b.k) return false;
    if (a.k === 'inf') return a.s === b.s;
    if (a.k === 'num') return close(a.v, b.v);
    return true;
  }
  function limitTeX(l) {
    if (l.k === 'dne') return '\\nexists \\;(\\text{no existeix})';
    if (l.k === 'inf') return l.s > 0 ? '+\\infty' : '-\\infty';
    return l.tex || numTeX(l.v);
  }

  function parseList(s) {
    const t = s.trim();
    if (!t) throw new Error('Escriu alguna cosa (o «cap» si no n\'hi ha)');
    if (EMPTY_RE.test(t)) return [];
    const out = [];
    for (let raw of t.split(/[;,]/)) {
      raw = raw.trim().replace(/^x\s*=\s*/i, '');
      if (!raw) continue;
      const pm = raw.match(/^(±|\+-|\+\/-)\s*(.+)$/);
      if (pm) {
        const pv = parseValue(pm[2]);
        out.push({ v: pv.v, tex: pv.tex }, { v: -pv.v, tex: '-' + (/^[\d\\a-z]/i.test(pv.tex) ? pv.tex : wrap(pv.tex)) });
      } else out.push(parseValue(raw));
    }
    // elimina duplicats
    const uniq = [];
    for (const it of out) if (!uniq.some(u => close(u.v, it.v))) uniq.push(it);
    return uniq;
  }
  function sameList(user, target) {
    if (user.length !== target.length) return false;
    const a = user.map(o => o.v).sort((x, y) => x - y);
    const b = target.map(o => o.v).sort((x, y) => x - y);
    return a.every((v, i) => close(v, b[i], 1e-5));
  }
  function listTeX(list) {
    if (!list.length) return '\\varnothing \\;(\\text{cap})';
    return list.map(o => o.tex).join(',\\; ');
  }

  function parseEnd(s) {
    const t = s.trim().toLowerCase().replace(/\s+/g, '').replace(/[−–]/g, '-');
    const m = t.match(INF_RE);
    if (m) return m[1] === '-' ? { v: -Infinity, tex: '-\\infty' } : { v: Infinity, tex: '+\\infty' };
    return parseValue(s);
  }
  function parseIntervals(s) {
    const t = s.trim();
    if (!t) throw new Error("Escriu alguna cosa (o «cap» si no n'hi ha)");
    if (EMPTY_RE.test(t)) return [];
    if (/^(r|ℝ|totr|totar)$/i.test(t.replace(/\s/g, ''))) return [{ a: { v: -Infinity, tex: '-\\infty' }, b: { v: Infinity, tex: '+\\infty' } }];
    const pieces = t.split(/\s*(?:∪|U|\bu\b)\s*/);
    const out = [];
    for (const pc0 of pieces) {
      const pc = pc0.trim();
      if (!pc) continue;
      const m = pc.match(/^([\(\[\]])(.*)([\)\]\[])$/);
      if (!m) throw new Error(`No entenc «${pc}». Format: (a, b) U (c, d)`);
      const parts = m[2].split(/[,;]/);
      if (parts.length !== 2) throw new Error(`Cada interval necessita dos extrems separats per coma: «${pc}»`);
      const a = parseEnd(parts[0]), b = parseEnd(parts[1]);
      if (!(a.v < b.v)) throw new Error(`L'extrem esquerre ha de ser menor que el dret: «${pc}»`);
      out.push({ a, b });
    }
    out.sort((x, y) => x.a.v - y.a.v);
    const merged = [];
    for (const iv of out) {
      const last = merged[merged.length - 1];
      if (last && iv.a.v <= last.b.v + 1e-9) { if (iv.b.v > last.b.v) last.b = iv.b; }
      else merged.push({ a: iv.a, b: iv.b });
    }
    return merged;
  }
  function sameIntervals(u, t) {
    if (u.length !== t.length) return false;
    return u.every((iv, i) => close(iv.a.v, t[i].a.v, 1e-5) && close(iv.b.v, t[i].b.v, 1e-5));
  }
  function intervalsTeX(list) {
    if (!list.length) return '\\varnothing \\;(\\text{cap})';
    return list.map(iv => `\\left(${iv.a.tex},\\, ${iv.b.tex}\\right)`).join(' \\cup ');
  }

  /* ---------- aritmètica exacta senzilla ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
  function fracTeX(p, q) {
    if (q < 0) { p = -p; q = -q; }
    const g = gcd(p, q); p /= g; q /= g;
    if (q === 1) return String(p);
    return (p < 0 ? '-' : '') + `\\frac{${Math.abs(p)}}{${q}}`;
  }
  function sqrtSplit(n) {
    let out = 1, inn = n;
    for (let k = 2; k * k <= inn; k++) while (inn % (k * k) === 0) { inn /= k * k; out *= k; }
    return [out, inn];
  }
  // (a + b·√n) / d
  function surdTeX(a, b, n, d) {
    const [o, i] = sqrtSplit(n);
    b *= o; n = i;
    if (n === 1 || b === 0) return fracTeX(a + (n === 1 ? b : 0), d);
    const g = gcd(gcd(a, b), d);
    a /= g; b /= g; d /= g;
    if (d < 0) { a = -a; b = -b; d = -d; }
    const bs = (Math.abs(b) === 1 ? '' : Math.abs(b)) + `\\sqrt{${n}}`;
    if (a === 0) return d === 1 ? (b < 0 ? '-' : '') + bs : (b < 0 ? '-' : '') + `\\frac{${bs}}{${d}}`;
    const num = `${a} ${b < 0 ? '-' : '+'} ${bs}`;
    return d === 1 ? num : `\\frac{${num}}{${d}}`;
  }
  const surd = (a, b, n, d) => ({ v: (a + b * Math.sqrt(n)) / d, tex: surdTeX(a, b, n, d) });
  const int = v => ({ v, tex: String(v) });
  const frac = (p, q) => ({ v: p / q, tex: fracTeX(p, q) });

  /* ---------- polinomis (coeficients de grau baix a alt) ---------- */
  function polyEval(c, x) { let r = 0; for (let i = c.length - 1; i >= 0; i--) r = r * x + c[i]; return r; }
  function polyDer(c) { return c.slice(1).map((v, i) => v * (i + 1)); }
  function polyMul(a, b) {
    const r = new Array(a.length + b.length - 1).fill(0);
    a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; }));
    return r;
  }
  function polyPow(a, k) { let r = [1]; for (let i = 0; i < k; i++) r = polyMul(r, a); return r; }
  function trim(c) { c = c.slice(); while (c.length > 1 && c[c.length - 1] === 0) c.pop(); return c; }
  const xpow = (k, v = 'x') => (k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`);
  function termsTeX(terms) {
    let s = '';
    for (const { c, body } of terms) {
      if (c === 0) continue;
      const neg = c < 0, a = Math.abs(c);
      const core = body ? (a === 1 ? body : `${numTeX(a)}${body}`) : numTeX(a);
      if (!s) s = (neg ? '-' : '') + core;
      else s += ` ${neg ? '-' : '+'} ${core}`;
    }
    return s || '0';
  }
  function polyTeX(c, v = 'x') {
    c = trim(c);
    const terms = [];
    for (let i = c.length - 1; i >= 0; i--) terms.push({ c: c[i], body: xpow(i, v) });
    return termsTeX(terms);
  }
  const polyIsSum = c => trim(c).filter(x => x !== 0).length > 1;

  return {
    parse, ev, tex, hasVar, fmt, numTeX, close, equivFn, parseValue,
    parseLimit, sameLimit, limitTeX, parseList, sameList, listTeX,
    parseIntervals, sameIntervals, intervalsTeX,
    gcd, fracTeX, surdTeX, surd, int, frac, sqrtSplit,
    polyEval, polyDer, polyMul, polyPow, polyTeX, polyIsSum, termsTeX, xpow, trim, wrap,
  };
})();
/* ---------- plot.js ---------- */
/* Gràfiques SVG senzilles i nítides */
const Plot = (() => {
  let uid = 0;
  function niceStep(range) {
    const raw = range / 8;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  const fmt = v => String(+v.toFixed(4));

  function svg({ f, xmin, xmax, ymin, ymax, pts = [], extra = [], samples = 700, w = 600, h = 360, reveal = false }) {
    const id = 'clip' + (++uid);
    const xs = [], ys = [];
    for (let i = 0; i <= samples; i++) {
      const x = xmin + (xmax - xmin) * i / samples;
      xs.push(x); ys.push(f(x));
    }
    if (ymin === undefined || ymax === undefined) {
      const fin = ys.filter(isFinite).sort((a, b) => a - b);
      let lo = fin[Math.floor(fin.length * 0.02)], hi = fin[Math.ceil(fin.length * 0.98) - 1];
      for (const p of pts) { lo = Math.min(lo, p.y); hi = Math.max(hi, p.y); }
      if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
      const pad = (hi - lo) * 0.15;
      ymin = lo - pad; ymax = hi + pad;
    }
    const L = 46, R = 14, T = 14, B = 30;
    const X = x => L + (x - xmin) / (xmax - xmin) * (w - L - R);
    const Y = y => T + (ymax - y) / (ymax - ymin) * (h - T - B);
    let g = '';
    const sx = niceStep(xmax - xmin), sy = niceStep(ymax - ymin);
    for (let x = Math.ceil(xmin / sx) * sx; x <= xmax + 1e-9; x += sx) {
      g += `<line x1="${X(x)}" y1="${T}" x2="${X(x)}" y2="${h - B}" class="pg"/>`;
      g += `<text x="${X(x)}" y="${h - B + 18}" class="pt" text-anchor="middle">${fmt(x)}</text>`;
    }
    for (let y = Math.ceil(ymin / sy) * sy; y <= ymax + 1e-9; y += sy) {
      g += `<line x1="${L}" y1="${Y(y)}" x2="${w - R}" y2="${Y(y)}" class="pg"/>`;
      g += `<text x="${L - 6}" y="${Y(y) + 4}" class="pt" text-anchor="end">${fmt(y)}</text>`;
    }
    if (xmin < 0 && xmax > 0) g += `<line x1="${X(0)}" y1="${T}" x2="${X(0)}" y2="${h - B}" class="pa"/>`;
    if (ymin < 0 && ymax > 0) g += `<line x1="${L}" y1="${Y(0)}" x2="${w - R}" y2="${Y(0)}" class="pa"/>`;

    const path = (fn, cls) => {
      let d = '', pen = false;
      const span = ymax - ymin;
      for (let i = 0; i <= samples; i++) {
        const x = xmin + (xmax - xmin) * i / samples;
        const y = fn(x);
        if (!isFinite(y) || y > ymax + span * 3 || y < ymin - span * 3) { pen = false; continue; }
        d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`;
        pen = true;
      }
      return `<path d="${d}" class="${cls}" clip-path="url(#${id})"/>`;
    };
    for (const e of extra) g += path(e.f, e.cls || 'penv');
    if (reveal) g += '<g class="reveal">';
    g += path(f, 'pc');
    for (const p of pts) {
      if (p.x < xmin || p.x > xmax) continue;
      g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5" class="pp ${p.cls || ''}"><title>${p.label || ''}</title></circle>`;
    }
    if (reveal) g += '</g>';
    return `<svg viewBox="0 0 ${w} ${h}" class="plot" role="img" aria-label="Gràfica">
      <defs><clipPath id="${id}"><rect x="${L}" y="${T}" width="${w - L - R}" height="${h - T - B}"/></clipPath></defs>${g}</svg>`;
  }
  return { svg };
})();
/* ---------- gen.js ---------- */
/* ===========================================================
   Generadors d'exercicis (format Seminari 3 de Càlcul)
   Cada exercici: { topic, diff, statement, parts[], solution }
   Tipus de part: expr | value | limit | list | intervals | mcq
   =========================================================== */
const G = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const nz = (a, b) => { let v; do v = ri(a, b); while (v === 0); return v; };
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const W = M.wrap;

  /* ---------------------------------------------------------
     1. REGLA DE LA CADENA
     --------------------------------------------------------- */
  const LAYERS = {
    sin: { lab: '\\sin', trig: '\\sin', tex: u => `\\sin\\left(${u}\\right)`, d: u => `\\cos\\left(${u}\\right)`, rule: "(\\sin u)' = \\cos u\\cdot u'", f: Math.sin, df: Math.cos, pos: false },
    cos: { lab: '\\cos', trig: '\\cos', tex: u => `\\cos\\left(${u}\\right)`, d: u => `-\\sin\\left(${u}\\right)`, rule: "(\\cos u)' = -\\sin u\\cdot u'", f: Math.cos, df: u => -Math.sin(u), pos: false },
    tan: { lab: '\\tan', trig: '\\tan', tex: u => `\\tan\\left(${u}\\right)`, d: u => `\\frac{1}{\\cos^{2}\\left(${u}\\right)}`, rule: "(\\tan u)' = \\frac{1}{\\cos^2 u}\\cdot u'", f: Math.tan, df: u => 1 / Math.cos(u) ** 2, pos: false },
    exp: { lab: 'e^{\\square}', tex: u => `e^{${u}}`, d: u => `e^{${u}}`, rule: "(e^{u})' = e^{u}\\cdot u'", f: Math.exp, df: Math.exp, pos: true },
    ln: { lab: '\\ln', tex: u => `\\ln\\left(${u}\\right)`, d: u => `\\frac{1}{${u}}`, rule: "(\\ln u)' = \\frac{1}{u}\\cdot u'", f: u => (u > 0 ? Math.log(u) : NaN), df: u => 1 / u, pos: false },
    sqrt: { lab: '\\sqrt{\\square}', tex: u => `\\sqrt{${u}}`, d: u => `\\frac{1}{2\\sqrt{${u}}}`, rule: "(\\sqrt{u})' = \\frac{1}{2\\sqrt{u}}\\cdot u'", f: u => (u >= 0 ? Math.sqrt(u) : NaN), df: u => 1 / (2 * Math.sqrt(u)), pos: true },
    sq1: { lab: '1+\\square^{2}', tex: u => `1+\\left(${u}\\right)^{2}`, d: u => `2\\left(${u}\\right)`, rule: "(1+u^2)' = 2u\\cdot u'", f: u => 1 + u * u, df: u => 2 * u, pos: true },
  };
  for (const n of [2, 3, 4]) {
    LAYERS['p' + n] = {
      n, lab: `\\square^{${n}}`,
      tex: u => `\\left(${u}\\right)^{${n}}`,
      d: u => (n === 2 ? `2\\left(${u}\\right)` : `${n}\\left(${u}\\right)^{${n - 1}}`),
      rule: `(u^{${n}})' = ${n}u${n - 1 === 1 ? '' : `^{${n - 1}}`}\\cdot u'`,
      f: u => u ** n, df: u => n * u ** (n - 1), pos: n % 2 === 0 ? true : 'keep',
    };
  }
  const CHAIN_INNERS = [
    { c: [0, 0, 1] }, { c: [0, 0, 0, 1] }, { c: [1, 0, 1], pos: true }, { c: [1, 3] }, { c: [0, -1, 0, 1] },
    { c: [0, 2] }, { c: [3, 0, 2], pos: true }, { c: [1, 0, 0, 0, 1], pos: true }, { c: [0, 1, 1] },
    { c: [2, -1] }, { c: [0, 0, 3] }, { c: [0, 5] }, { c: [1, 0, -1] },
  ];
  function badPair(prev, k) {
    if (prev === k && !['sin', 'cos'].includes(k)) return true;
    if ((prev === 'exp' && k === 'ln') || (prev === 'ln' && k === 'exp')) return true;
    if (prev[0] === 'p' && (k[0] === 'p' || k === 'sqrt' || k === 'sq1')) return true;
    if ((prev === 'sqrt' || prev === 'sq1') && k[0] === 'p') return true;
    return false;
  }
  const needWrap = s => /^-/.test(s);

  function genChain(diff) {
    const nL = [0, 2, 3, 4][diff];
    for (let attempt = 0; attempt < 400; attempt++) {
      const inner = pick(CHAIN_INNERS);
      const seq = [];
      let pos = !!inner.pos;
      for (let i = 0; i < nL; i++) {
        const prev = seq[i - 1];
        const cands = [];
        for (const [k, w] of [['sin', 5], ['cos', 5], ['tan', 1], ['exp', 2], ['ln', 3], ['sqrt', 2], ['p2', 3], ['p3', 2], ['p4', 1], ['sq1', 1]]) {
          if ((k === 'ln' || k === 'sqrt') && !pos) continue;
          if (prev && badPair(prev, k)) continue;
          if (['tan', 'exp', 'ln', 'sqrt', 'sq1'].includes(k) && seq.includes(k)) continue;
          for (let j = 0; j < w; j++) cands.push(k);
        }
        const k = pick(cands);
        seq.push(k);
        const P = LAYERS[k].pos;
        pos = P === 'keep' ? pos : !!P;
      }
      // construcció de dins cap a fora
      const lv = [{ tex: M.polyTeX(inner.c), trig: null }];
      for (const k of seq) {
        const L = LAYERS[k], cur = lv[lv.length - 1];
        let tex, dtex;
        if ((L.n || k === 'sq1') && cur.trig) {
          const n = L.n || 2;
          if (k === 'sq1') { tex = `1+${cur.trig}^{2}\\left(${cur.arg}\\right)`; dtex = `2${cur.trig}\\left(${cur.arg}\\right)`; }
          else {
            tex = `${cur.trig}^{${n}}\\left(${cur.arg}\\right)`;
            dtex = n - 1 === 1 ? `${n}${cur.trig}\\left(${cur.arg}\\right)` : `${n}${cur.trig}^{${n - 1}}\\left(${cur.arg}\\right)`;
          }
        } else { tex = L.tex(cur.tex); dtex = L.d(cur.tex); }
        lv.push({ tex, dtex, trig: L.trig || null, arg: L.trig ? cur.tex : null, key: k });
      }
      const innerVal = x => M.polyEval(inner.c, x);
      const dInner = M.polyDer(inner.c);
      const vals = x => { const v = [innerVal(x)]; for (const k of seq) v.push(LAYERS[k].f(v[v.length - 1])); return v; };
      const dF = x => {
        const v = vals(x);
        let r = M.polyEval(dInner, x);
        seq.forEach((k, i) => { r *= LAYERS[k].df(v[i]); });
        return r;
      };
      const outerFactor = x => { const v = vals(x); return LAYERS[seq[nL - 1]].df(v[nL - 1]); };
      // validesa numèrica
      let good = 0;
      for (const x of [-1.93, -1.37, -1.08, -0.83, -0.61, -0.41, -0.27, 0.19, 0.33, 0.52, 0.74, 0.97, 1.21, 1.46, 1.72, 2.03]) {
        const y = dF(x);
        if (isFinite(y) && Math.abs(y) < 1e6) good++;
      }
      if (good < 9) continue;

      const factors = [];
      for (let i = nL; i >= 1; i--) factors.push(needWrap(lv[i].dtex) ? W(lv[i].dtex) : lv[i].dtex);
      const dInTeX = M.polyTeX(dInner);
      factors.push(M.polyIsSum(dInner) || needWrap(dInTeX) ? W(dInTeX) : dInTeX);
      const dTeX = factors.join(' \\cdot ');
      const fTeX = lv[nL].tex;

      // opcions de descomposició
      const labels = [...seq.slice().reverse().map(k => LAYERS[k].lab), lv[0].tex];
      const fmtChain = arr => arr.join('\\;\\to\\;');
      const correct = fmtChain(labels);
      const opts = new Set([correct]);
      const rev = fmtChain([...labels.slice(0, -1).reverse(), labels[labels.length - 1]]);
      if (rev !== correct) opts.add(rev);
      for (let t = 0; t < 80 && opts.size < 4; t++) opts.add(fmtChain(shuffle(labels)));
      const options = shuffle([...opts]).map(s => ({ tex: s, ok: s === correct }));

      const outerL = LAYERS[seq[nL - 1]];
      const uNames = lv.map((_, i) => `u_{${i + 1}}`);
      const steps = [`u_{1} = ${lv[0].tex}`];
      seq.forEach((k, i) => { steps.push(`u_{${i + 2}} = ${LAYERS[k].tex(uNames[i]).replace(/\\left\(u_\{(\d+)\}\\right\)/g, '(u_{$1})')}`); });
      let table = '<table class="tbl"><tr><th>Capa</th><th>Regla</th><th>Factor de f\'(x)</th></tr>';
      for (let i = nL; i >= 1; i--) {
        const L = LAYERS[seq[i - 1]];
        table += `<tr><td>$${L.lab}$</td><td>$${L.rule}$</td><td>$${lv[i].dtex}$</td></tr>`;
      }
      table += `<tr><td>$${lv[0].tex}$</td><td>derivada d'un polinomi</td><td>$${dInTeX}$</td></tr></table>`;

      return {
        topic: 'chain', diff,
        statement: `Aplicant la regla de la cadena les vegades que calgui, calcula la derivada de la funció:
          $$f(x) = ${fTeX}$$
          <p class="note"><b>Nota:</b> no cal simplificar el resultat. L'important és aplicar la regla de la cadena en l'ordre correcte.</p>`,
        parts: [
          {
            type: 'mcq', label: "Descomposició: quin és l'ordre de les funcions, <b>de la més exterior a la més interior</b>?",
            options, hint: "La capa <b>exterior</b> és l'última operació que faries si calculessis $f(x)$ amb la calculadora per a un valor concret de $x$.",
          },
          {
            type: 'expr', label: `Primer factor: escriu la derivada de la capa exterior <b>avaluada en tot el seu argument</b> (sense multiplicar per res més).`,
            f: outerFactor, answerTeX: lv[nL].dtex,
            hint: `La capa exterior és $${outerL.lab}$ i $${outerL.rule}$. Deixa l'argument tal com està, intacte.`,
          },
          {
            type: 'expr', label: "Calcula $f'(x)$ completa.", f: dF, answerTeX: `f'(x) = ${dTeX}`,
            hint: `Hi ha d'haver <b>${nL + 1} factors</b> multiplicats: la derivada de cada capa avaluada en el que té a dins, de fora cap a dins, i al final la derivada de $${lv[0].tex}$.`,
          },
        ],
        solution: `<p><b>1. Descomposició</b> (de dins cap a fora):</p>
          <p>$$${steps.join(',\\qquad ')}$$</p>
          <p>Així $f = u_{${nL + 1}}$ i l'ordre de fora cap a dins és $${correct}$.</p>
          <p><b>2. Regla de la cadena:</b> derivem cada capa avaluada en el seu argument i multipliquem:</p>
          ${table}
          <p><b>3. Resultat:</b></p>
          $$f'(x) = ${dTeX}$$`,
      };
    }
    throw new Error('No s\'ha pogut generar');
  }

  /* ---------------------------------------------------------
     2. DERIVADA EN UN PUNT VIA LÍMIT:  f(x) = c x^k T(1/x) + a x
     --------------------------------------------------------- */
  function genLimDer(diff) {
    let k, T, c, a;
    if (diff === 1) { k = pick([3, 4]); T = 'sin'; c = 1; a = 0; }
    else if (diff === 2) { k = pick([3, 3, 4, 5]); T = pick(['sin', 'cos']); c = pick([1, 1, 2, -1, 3]); a = pick([0, 0, 1, -1, 2, -3]); }
    else { k = pick([1, 2, 2, 3, 3, 4]); T = pick(['sin', 'cos']); c = pick([1, 1, 2, -1, -2]); a = pick([0, 1, -1, 2, 3, -2]); }
    const Tt = T === 'sin' ? '\\sin' : '\\cos', Ut = T === 'sin' ? '\\cos' : '\\sin';
    const inv = '\\left(\\frac{1}{x}\\right)';
    const Tf = T === 'sin' ? Math.sin : Math.cos;
    const fTeX = M.termsTeX([{ c, body: M.xpow(k) + Tt + inv }, { c: a, body: 'x' }]);
    const body = (j, fn) => (j === 0 ? fn + inv : j === 1 ? 'x' + fn + inv : j > 0 ? `x^{${j}}${fn}${inv}` : `\\frac{${fn}${inv}}{${j === -1 ? 'x' : `x^{${-j}}`}}`);
    const t2c = T === 'sin' ? -c : c;
    const dTeX = M.termsTeX([{ c: c * k, body: body(k - 1, Tt) }, { c: t2c, body: body(k - 2, Ut) }, { c: a, body: '' }]);
    const f = x => (x === 0 ? 0 : c * x ** k * Tf(1 / x) + a * x);
    const df = x => c * k * x ** (k - 1) * Tf(1 / x) + (T === 'sin' ? -c * x ** (k - 2) * Math.cos(1 / x) : c * x ** (k - 2) * Math.sin(1 / x)) + a;
    const limDer = k >= 3 ? { k: 'num', v: a, tex: String(a) } : { k: 'dne' };
    const fp0 = k >= 2 ? { k: 'num', v: a, tex: String(a) } : { k: 'dne' };
    const concl = k >= 3 ? 0 : k === 2 ? 1 : 2;
    const OPTS = [
      "$f$ és derivable en $0$ i $f'$ és contínua en $0$",
      "$f$ és derivable en $0$, però $f'$ <b>no</b> és contínua en $0$",
      "$f$ <b>no</b> és derivable en $0$",
      "$f$ no és ni tan sols contínua en $0$",
    ];
    const cases = `f(x) = \\begin{cases} ${fTeX} & \\text{si } x \\neq 0,\\\\[4pt] 0 & \\text{si } x = 0. \\end{cases}`;

    // anàlisi de termes per a la solució
    const termAnalysis = (j, fn, coefTeX) => {
      if (j >= 1) return `<li>$${coefTeX}${j === 1 ? 'x' : `x^{${j}}`}${fn}${inv}$: és (una cosa que tendeix a $0$) × (una cosa acotada, $|${fn}(\\cdot)|\\le 1$) $\\Rightarrow$ tendeix a $0$.</li>`;
      if (j === 0) return `<li>$${coefTeX}${fn}${inv}$: quan $x\\to0$, $\\frac1x\\to\\pm\\infty$ i $${fn}$ oscil·la entre $-1$ i $1$ infinites vegades $\\Rightarrow$ <b>no té límit</b>.</li>`;
      return `<li>$${coefTeX}\\frac{${fn}${inv}}{x}$: oscil·la i a més no està acotat (les oscil·lacions creixen com $\\frac1{|x|}$) $\\Rightarrow$ <b>no té límit</b>.</li>`;
    };
    const cTeX = v => (v === 1 ? '' : v === -1 ? '-' : String(v));
    const limSentence = k >= 3
      ? `Tots els termes oscil·lants tendeixen a $0$, per tant $$\\lim_{x\\to0} f'(x) = ${a}.$$`
      : `Hi ha un terme que no té límit (i la resta sí), per tant <b>$\\lim_{x\\to0} f'(x)$ no existeix</b>.`;
    const defSentence = k >= 2
      ? `$$\\frac{f(h)-f(0)}{h} = \\frac{${M.termsTeX([{ c, body: M.xpow(k, 'h') + Tt + '\\left(\\frac1h\\right)' }, { c: a, body: 'h' }])}}{h} = ${M.termsTeX([{ c, body: M.xpow(k - 1, 'h') + Tt + '\\left(\\frac1h\\right)' }, { c: a, body: '' }])} \\xrightarrow[h\\to0]{} ${a}$$
         perquè $h^{${k - 1}}\\to0$ i $${Tt}(1/h)$ està acotat. Per tant $f'(0) = ${a}$.`
      : `$$\\frac{f(h)-f(0)}{h} = ${M.termsTeX([{ c, body: Tt + '\\left(\\frac1h\\right)' }, { c: a, body: '' }])},$$
         que oscil·la quan $h\\to0$: <b>no existeix</b> el límit, i $f$ no és derivable en $0$.`;
    const warn = k === 2
      ? `<p class="callout warn"><b>Compte!</b> Aquí $\\lim_{x\\to0}f'(x)$ no existeix però $f$ <b>sí</b> és derivable en $0$ (amb $f'(0)=${a}$). El truc de l'enunciat ($f'(0)=\\lim f'(x)$) només serveix quan aquest límit <b>existeix</b>; si no, cal anar a la definició.</p>`
      : '';
    const env = x => Math.abs(c) * Math.abs(x) ** k;
    const plot = Plot.svg({
      f, xmin: k === 1 ? -0.35 : -0.6, xmax: k === 1 ? 0.35 : 0.6, samples: 2400,
      extra: [{ f: x => env(x) + a * x }, { f: x => -env(x) + a * x }],
      pts: [{ x: 0, y: 0, label: '(0, 0)' }],
    });

    return {
      topic: 'limder', diff,
      statement: `A vegades cal calcular la derivada en un punt fent un límit. Considera la funció
        $$${cases}$$
        És fàcil veure que $f$ és contínua a tot $\\mathbb{R}$ (perquè $|x^{${k}}${Tt}(1/x)| \\le |x|^{${k}} \\to 0$). Calcula $f'(x)$ per a $x\\neq0$ i estudia què passa en $x=0$.
        <p class="note"><b>Pista:</b> el sinus i el cosinus sempre estan acotats. Una cosa que tendeix a $0$ multiplicada per una cosa acotada tendeix a $0$.</p>`,
      parts: [
        {
          type: 'expr', label: "Calcula $f'(x)$ per a $x \\neq 0$.", f: df, answerTeX: `f'(x) = ${dTeX}`,
          pts: [-1.93, -1.37, -1.08, -0.83, -0.61, -0.41, -0.27, 0.27, 0.33, 0.52, 0.74, 0.97, 1.21, 1.46, 1.72, 2.03],
          hint: `Regla del producte i de la cadena: $\\big(x^{${k}}\\big)'=${k === 1 ? '1' : `${k}x^{${k - 1}}`}$ i $\\left(${Tt}\\frac1x\\right)' = ${T === 'sin' ? '\\cos' : '-\\sin'}\\left(\\frac1x\\right)\\cdot\\left(-\\frac{1}{x^2}\\right)$.`,
        },
        {
          type: 'limit', label: "Calcula $\\displaystyle\\lim_{x\\to0} f'(x)$. (Si no existeix, escriu «no existeix».)", lim: limDer,
          hint: 'Mira cada terme de $f\'(x)$: una potència <b>positiva</b> de $x$ per un sinus/cosinus tendeix a $0$. Si queda un $\\cos(1/x)$ o $\\sin(1/x)$ sol (o dividit per $x$), oscil·la i no té límit.',
        },
        {
          type: 'limit', label: "Calcula $f'(0)$ <b>per definició</b>: $\\displaystyle f'(0)=\\lim_{h\\to0}\\frac{f(h)-f(0)}{h}$. (Si no existeix, escriu «no existeix».)", lim: fp0,
          hint: `Simplifica: $\\frac{f(h)-0}{h} = ${M.termsTeX([{ c, body: M.xpow(k - 1, 'h') + Tt + '\\left(\\frac1h\\right)' }, { c: a, body: '' }])}$. Aplica l'argument d'«acotada per una cosa que tendeix a 0».`,
        },
        {
          type: 'mcq', label: 'Conclusió sobre el comportament en $x=0$:',
          options: OPTS.map((t, i) => ({ html: t, ok: i === concl })),
          hint: "Derivable en $0$ ⇔ existeix el límit de la definició. $f'$ contínua en $0$ ⇔ $\\lim_{x\\to0}f'(x)$ existeix i val $f'(0)$.",
        },
      ],
      solution: `<p><b>1. Derivada per a $x\\neq0$</b> (producte + cadena):</p>
        $$f'(x) = ${dTeX}$$
        <p>on hem fet servir $\\left(${Tt}\\tfrac1x\\right)' = ${T === 'sin' ? '\\cos' : '-\\sin'}\\left(\\tfrac1x\\right)\\cdot\\left(-\\tfrac{1}{x^2}\\right)$.</p>
        <p><b>2. Límit de $f'(x)$ quan $x\\to0$</b>, terme a terme:</p>
        <ul>${termAnalysis(k - 1, Tt, cTeX(c * k))}${termAnalysis(k - 2, Ut, cTeX(t2c))}${a ? `<li>$${a}$: constant.</li>` : ''}</ul>
        <p>${limSentence}</p>
        <p><b>3. Derivada en $0$ per definició:</b></p>
        <p>${defSentence}</p>
        ${warn}
        <p><b>4. Conclusió:</b> ${OPTS[concl]}.</p>
        <div class="plotwrap">${plot}<p class="cap">Gràfica de $f$ prop de $0$. Les corbes discontínues són $\\pm${Math.abs(c) === 1 ? '' : Math.abs(c)}|x|^{${k}}${a ? ' + ' + (a === 1 ? '' : a === -1 ? '(-1)' : a) + 'x' : ''}$: la funció hi queda «atrapada» entre elles.</p></div>`,
    };
  }

  /* ---------------------------------------------------------
     3. ESTUDI D'UNA FUNCIÓ POLINÒMICA
     --------------------------------------------------------- */
  const { int, surd, frac } = M;
  const fams = {
    A(s, k) { // s(x^3 - kx)
      return {
        c: [0, -s * k, 0, s], zeros: [int(0), surd(0, 1, k, 1), surd(0, -1, k, 1)],
        crit: [surd(0, 1, 3 * k, 3), surd(0, -1, 3 * k, 3)], infl: [int(0)],
        zhint: `Treu factor comú $x$: $f(x) = ${s < 0 ? '-' : ''}x\\,(x^2 - ${k})$.`,
      };
    },
    B(s, r) { // s(x-r1)(x-r2)(x-r3)
      let c = [s];
      for (const ri_ of r) c = M.polyMul(c, [-ri_, 1]);
      const s1 = r[0] + r[1] + r[2], s2 = r[0] * r[1] + r[0] * r[2] + r[1] * r[2], D = s1 * s1 - 3 * s2;
      return {
        c, zeros: r.map(int), crit: [surd(s1, 1, D, 3), surd(s1, -1, D, 3)], infl: [frac(s1, 3)],
        zhint: r.includes(0)
          ? 'Treu factor comú $x$ i resol l\'equació de segon grau que queda.'
          : 'Busca una arrel entera entre els divisors del terme independent (Ruffini) i després resol el polinomi de segon grau.',
      };
    },
    D(s, k) { // s(x^3 + kx)
      return {
        c: [0, s * k, 0, s], zeros: [int(0)], crit: [], infl: [int(0)],
        zhint: `$f(x) = ${s < 0 ? '-' : ''}x\\,(x^2 + ${k})$ i $x^2+${k}>0$ sempre.`,
      };
    },
    C(s, k) { // s(x^4 - 2k^2 x^2)
      return {
        c: [0, 0, -2 * k * k * s, 0, s], zeros: [int(0), surd(0, k, 2, 1), surd(0, -k, 2, 1)],
        crit: [int(0), int(k), int(-k)], infl: [surd(0, k, 3, 3), surd(0, -k, 3, 3)],
        zhint: `Treu factor comú $x^2$: $f(x) = ${s < 0 ? '-' : ''}x^2(x^2 - ${2 * k * k})$.`,
      };
    },
    E(s, p) { // s(x^4 - 4p x^3)
      return {
        c: [0, 0, 0, -4 * p * s, s], zeros: [int(0), int(4 * p)], crit: [int(0), int(3 * p)], infl: [int(0), int(2 * p)],
        zhint: `Treu factor comú $x^3$: $f(x) = ${s < 0 ? '-' : ''}x^3(x ${p > 0 ? '-' : '+'} ${4 * Math.abs(p)})$.`,
      };
    },
  };
  function distinctRoots() {
    const pool = shuffle([-3, -2, -1, 0, 1, 2, 3]);
    return pool.slice(0, 3);
  }
  const sortV = arr => arr.slice().sort((a, b) => a.v - b.v);
  function signIntervals(points, g) {
    const ends = [{ v: -Infinity, tex: '-\\infty' }, ...points, { v: Infinity, tex: '+\\infty' }];
    const ivs = [];
    for (let i = 0; i < ends.length - 1; i++) {
      const a = ends[i], b = ends[i + 1];
      const t = !isFinite(a.v) && !isFinite(b.v) ? 0.123 : !isFinite(a.v) ? b.v - 1 : !isFinite(b.v) ? a.v + 1 : (a.v + b.v) / 2;
      ivs.push({ a, b, s: Math.sign(g(t)) });
    }
    return ivs;
  }
  function mergeBy(ivs, sign) {
    const out = [];
    for (const iv of ivs) {
      if (iv.s !== sign) continue;
      const last = out[out.length - 1];
      if (last && last.b.v === iv.a.v) last.b = iv.b; else out.push({ a: iv.a, b: iv.b });
    }
    return out;
  }
  function signTable(ivs, dName, fName, up, down) {
    let h = `<div class="tblwrap"><table class="tbl signs"><tr><th>$x$</th>`;
    for (const iv of ivs) h += `<td>$\\left(${iv.a.tex}, ${iv.b.tex}\\right)$</td>`;
    h += `</tr><tr><th>$${dName}$</th>`;
    for (const iv of ivs) h += `<td class="${iv.s > 0 ? 'pos' : 'neg'}">${iv.s > 0 ? '+' : '−'}</td>`;
    h += `</tr><tr><th>$${fName}$</th>`;
    for (const iv of ivs) h += `<td>${iv.s > 0 ? up : down}</td>`;
    return h + '</tr></table></div>';
  }

  function genStudy(diff) {
    let F, fam;
    if (diff === 1) { fam = 'A'; F = fams.A(1, pick([1, 3, 12, 2, 4])); }
    else if (diff === 2) {
      fam = pick(['A', 'B', 'B', 'D']);
      F = fam === 'A' ? fams.A(pick([1, -1]), pick([1, 2, 3, 4, 12])) : fam === 'B' ? fams.B(pick([1, -1]), distinctRoots()) : fams.D(pick([1, -1]), pick([1, 3, 6]));
    } else {
      fam = pick(['B', 'C', 'E', 'A', 'C', 'E']);
      F = fam === 'A' ? fams.A(-1, pick([1, 3, 12])) : fam === 'B' ? fams.B(pick([1, -1]), distinctRoots())
        : fam === 'C' ? fams.C(pick([1, -1]), pick([1, 2])) : fams.E(pick([1, -1]), pick([1, -1]));
    }
    const c = F.c, d1 = M.polyDer(c), d2 = M.polyDer(d1);
    const f = x => M.polyEval(c, x);
    const crit = sortV(F.crit), inflCand = sortV(F.infl), zeros = sortV(F.zeros);
    const iv1 = signIntervals(crit, x => M.polyEval(d1, x));
    const iv2 = signIntervals(inflCand, x => M.polyEval(d2, x));
    const incr = mergeBy(iv1, 1), decr = mergeBy(iv1, -1);
    const convex = mergeBy(iv2, 1), concave = mergeBy(iv2, -1);
    const maxs = [], mins = [], neither = [];
    crit.forEach((p, i) => {
      const L = iv1[i].s, R = iv1[i + 1].s;
      if (L > 0 && R < 0) maxs.push(p); else if (L < 0 && R > 0) mins.push(p); else neither.push(p);
    });
    const infl = inflCand.filter((p, i) => iv2[i].s !== iv2[i + 1].s);
    const deg = c.length - 1, lead = c[deg];
    const limP = { k: 'inf', s: Math.sign(lead) };
    const limM = { k: 'inf', s: Math.sign(lead) * (deg % 2 ? -1 : 1) };
    const absIdx = deg % 2 ? 0 : lead > 0 ? 1 : 2;
    const ABS = ['No té ni màxim ni mínim absoluts', 'Té mínim absolut però no màxim absolut', 'Té màxim absolut però no mínim absolut', 'Té màxim i mínim absoluts'];
    const fTeX = M.polyTeX(c);
    const L = M.listTeX, I = M.intervalsTeX;

    const special = [...zeros, ...crit, ...inflCand].map(p => p.v);
    let lo = Math.min(...special), hi = Math.max(...special);
    if (hi - lo < 2) { lo -= 1; hi += 1; }
    const padX = (hi - lo) * 0.22 + 0.5;
    const ptsPlot = [
      ...zeros.map(p => ({ x: p.v, y: 0, label: 'zero', cls: 'pz' })),
      ...maxs.map(p => ({ x: p.v, y: f(p.v), label: 'màxim local', cls: 'pmax' })),
      ...mins.map(p => ({ x: p.v, y: f(p.v), label: 'mínim local', cls: 'pmin' })),
      ...infl.map(p => ({ x: p.v, y: f(p.v), label: 'inflexió', cls: 'pinf' })),
    ];
    const ys = ptsPlot.map(p => p.y);
    let ylo = Math.min(...ys), yhi = Math.max(...ys);
    const ypad = Math.max(1.5, (yhi - ylo) * 0.6);
    const plot = Plot.svg({ f, xmin: lo - padX, xmax: hi + padX, ymin: ylo - ypad, ymax: yhi + ypad, pts: ptsPlot });
    const sketch = { f, xmin: lo - padX, xmax: hi + padX, ymin: ylo - ypad, ymax: yhi + ypad, pts: ptsPlot };
    const fmtPt = p => `\\left(${p.tex},\\ ${M.numTeX(+f(p.v).toFixed(4)).replace(/^(-?\d+\.\d+)$/, '\\approx $1')}\\right)`;
    const isPoly2 = d1.length === 3;

    const parts = [
      { type: 'list', label: 'Zeros de $f$ (solucions de $f(x)=0$):', list: zeros, answerTeX: L(zeros), hint: F.zhint },
      { type: 'list', label: "Punts crítics (solucions de $f'(x)=0$):", list: crit, answerTeX: L(crit), hint: `$f'(x) = ${M.polyTeX(d1)}$. ${isPoly2 ? 'És de segon grau: fórmula de l\'equació de segon grau.' : 'Treu factor comú.'}` },
      { type: 'list', label: 'Abscisses ($x$) dels <b>màxims locals</b>:', list: maxs, answerTeX: L(maxs), hint: "Un punt crític és màxim local si $f'$ passa de $+$ a $-$ (o $f''<0$ en el punt). Si $f'$ no canvia de signe, no és extrem." },
      { type: 'list', label: 'Abscisses ($x$) dels <b>mínims locals</b>:', list: mins, answerTeX: L(mins), hint: "Mínim local si $f'$ passa de $-$ a $+$ (o $f''>0$ en el punt)." },
      { type: 'intervals', label: 'Intervals de <b>creixement</b> ($f\'>0$):', intervals: incr, answerTeX: I(incr), hint: "Estudia el signe de $f'$ als intervals que delimiten els punts crítics. Dona un valor de prova a cada interval." },
      { type: 'intervals', label: 'Intervals de <b>decreixement</b> ($f\'<0$):', intervals: decr, answerTeX: I(decr), hint: "On $f'(x) < 0$." },
      { type: 'list', label: "Punts d'inflexió (abscisses $x$):", list: infl, answerTeX: L(infl), hint: `$f''(x) = ${M.polyTeX(d2)}$. Inflexió on $f''$ <b>canvia de signe</b>.` },
      { type: 'intervals', label: 'Intervals de <b>convexitat</b> ($f\'\'>0$, forma $\\cup$):', intervals: convex, answerTeX: I(convex), hint: "On $f''(x) > 0$." },
      { type: 'intervals', label: 'Intervals de <b>concavitat</b> ($f\'\'<0$, forma $\\cap$):', intervals: concave, answerTeX: I(concave), hint: "On $f''(x) < 0$." },
      { type: 'limit', label: '$\\displaystyle\\lim_{x\\to+\\infty} f(x)$', lim: limP, hint: `Mana el terme de grau més alt: $${M.polyTeX([...new Array(deg).fill(0), lead])}$.` },
      { type: 'limit', label: '$\\displaystyle\\lim_{x\\to-\\infty} f(x)$', lim: limM, hint: `Mana $${M.polyTeX([...new Array(deg).fill(0), lead])}$; recorda que $(-\\infty)^{${deg}}$ ${deg % 2 ? 'és negatiu' : 'és positiu'}.` },
      { type: 'mcq', label: 'Extrems <b>absoluts</b> de $f$ a $\\mathbb{R}$:', options: ABS.map((t, i) => ({ html: t, ok: i === absIdx })), hint: 'Mira els límits a $\\pm\\infty$: si $f\\to+\\infty$ no pot tenir màxim absolut; si $f\\to-\\infty$ no pot tenir mínim absolut.' },
    ];

    const absExpl = deg % 2
      ? `Com que $\\lim_{x\\to+\\infty}f = ${M.limitTeX(limP)}$ i $\\lim_{x\\to-\\infty}f = ${M.limitTeX(limM)}$, la funció pren valors tan grans i tan petits com vulguem: <b>no té ni màxim ni mínim absoluts</b> (els extrems locals no són globals).`
      : lead > 0
        ? `Els dos límits són $+\\infty$: no té màxim absolut. Com que és contínua i tendeix a $+\\infty$ pels dos costats, té <b>mínim absolut</b>, que s'assoleix al mínim local més baix${mins.length ? ` ($x = ${mins.map(p => p.tex).join(', ')}$, amb $f = ${M.numTeX(+Math.min(...mins.map(p => f(p.v))).toFixed(4))}$)` : ''}.`
        : `Els dos límits són $-\\infty$: no té mínim absolut, però té <b>màxim absolut</b> al màxim local més alt${maxs.length ? ` ($x = ${maxs.map(p => p.tex).join(', ')}$, amb $f = ${M.numTeX(+Math.max(...maxs.map(p => f(p.v))).toFixed(4))}$)` : ''}.`;

    return {
      topic: 'study', diff, sketch,
      statement: `Considera la funció $$f(x) = ${fTeX}.$$ Calcula'n els zeros, els punts crítics (i digues si són màxims o mínims locals), els intervals de creixement i decreixement, els punts d'inflexió i els intervals de concavitat i convexitat. Amb tota aquesta informació, fes un esbós de la gràfica de $f$. Estudia també si $f$ té màxim o mínim absoluts.
        <p class="note"><b>Formats:</b> llista → <code>0, -1, sqrt(3)/3</code> o <code>±sqrt(2)</code> · intervals → <code>(-inf, -1) U (1, inf)</code> · si no n'hi ha → <code>cap</code>. Convenció: <b>convexa</b> = $\\cup$ ($f''>0$), <b>còncava</b> = $\\cap$ ($f''<0$).</p>`,
      parts,
      solution: `<p><b>1. Zeros:</b> ${F.zhint} Zeros: $x = ${L(zeros)}$.</p>
        <p><b>2. Primera derivada:</b> $f'(x) = ${M.polyTeX(d1)}$. Punts crítics: $x = ${L(crit)}$.</p>
        ${signTable(iv1, "f'(x)", 'f(x)', '↗ creix', '↘ decreix')}
        <p>Creixent a $${I(incr)}$; decreixent a $${I(decr)}$.</p>
        <p>Màxims locals: ${maxs.length ? maxs.map(p => `$${fmtPt(p)}$`).join(', ') : 'cap'}. Mínims locals: ${mins.length ? mins.map(p => `$${fmtPt(p)}$`).join(', ') : 'cap'}.
        ${neither.length ? `<br><span class="callout warn">Compte: $x=${neither.map(p => p.tex).join(', ')}$ és punt crític però <b>no és extrem</b> ($f'$ no canvia de signe).</span>` : ''}</p>
        <p><b>3. Segona derivada:</b> $f''(x) = ${M.polyTeX(d2)}$, que s'anul·la a $x = ${L(inflCand)}$.</p>
        ${signTable(iv2, "f''(x)", 'f(x)', '∪ convexa', '∩ còncava')}
        <p>Convexa a $${I(convex)}$; còncava a $${I(concave)}$. Punts d'inflexió: ${infl.length ? infl.map(p => `$${fmtPt(p)}$`).join(', ') : 'cap'}.</p>
        <p><b>4. Límits:</b> $\\lim_{x\\to+\\infty} f(x) = ${M.limitTeX(limP)}$, $\\quad\\lim_{x\\to-\\infty} f(x) = ${M.limitTeX(limM)}$.</p>
        <p><b>5. Extrems absoluts:</b> ${absExpl}</p>
        <div class="plotwrap">${plot}<p class="cap">Esbós: <span class="lg pz"></span> zeros · <span class="lg pmax"></span> màxims · <span class="lg pmin"></span> mínims · <span class="lg pinf"></span> inflexió</p></div>`,
    };
  }

  /* ---------------------------------------------------------
     4. LÍMITS DE QUOCIENTS DE POLINOMIS A L'INFINIT
     --------------------------------------------------------- */
  function rPoly(deg, lead) {
    const c = [];
    for (let i = 0; i < deg; i++) c.push(Math.random() < 0.3 ? 0 : ri(-7, 7));
    c.push(lead);
    if (deg > 0 && c.slice(0, deg).every(v => v === 0)) c[0] = nz(-5, 5);
    return c;
  }
  function shufTeX(c) {
    const terms = [];
    c.forEach((v, i) => { if (v) terms.push({ c: v, body: M.xpow(i) }); });
    let t = shuffle(terms);
    if (t.length > 1 && t[0].body === M.xpow(c.length - 1)) t = [...t.slice(1), t[0]];
    return M.termsTeX(t);
  }
  function factPoly(deg) {
    const p = nz(-3, 3), q = nz(-4, 4);
    if (deg === 1) return { c: [q, p], tex: M.polyTeX([q, p]) };
    const e1 = ri(1, deg - 1), e2 = deg - e1;
    const r = nz(-3, 3), s = nz(-5, 5);
    const p2 = [s, ...new Array(e2 - 1).fill(0), r];
    const c = M.polyMul(M.polyPow([q, p], e1), p2);
    return { c, tex: `\\left(${M.polyTeX([q, p])}\\right)${e1 > 1 ? `^{${e1}}` : ''}\\left(${M.polyTeX(p2)}\\right)` };
  }
  function makeLimit(dir, kase, form) {
    let n, m;
    if (kase === 'lt') { n = ri(1, 4); m = ri(n + 1, 5); }
    else if (kase === 'eq') { n = m = ri(1, 4); }
    else { m = ri(1, 4); n = ri(m + 1, 5); }
    let P, Q, Ptex, Qtex;
    if (form === 'fact' && n >= 2) { const fp = factPoly(n); P = fp.c; Ptex = fp.tex; }
    else { P = rPoly(n, nz(-7, 7)); Ptex = form === 'std' ? M.polyTeX(P) : shufTeX(P); }
    Q = rPoly(m, nz(-7, 7)); Qtex = form === 'std' ? M.polyTeX(Q) : shufTeX(Q);
    const an = P[n], bm = Q[m];
    let lim;
    if (n < m) lim = { k: 'num', v: 0, tex: '0' };
    else if (n === m) lim = { k: 'num', v: an / bm, tex: M.fracTeX(an, bm) };
    else lim = { k: 'inf', s: Math.sign(an * bm) * (dir < 0 && (n - m) % 2 ? -1 : 1) };
    const D = dir > 0 ? '+\\infty' : '-\\infty';
    const limTeX = `\\lim_{x\\to${D}} \\frac{${Ptex}}{${Qtex}}`;
    const ratio = M.fracTeX(an, bm);
    let why;
    if (n < m) why = `Com que $n\\lt m$, $\\frac{${ratio}}{x^{${m - n}}}\\to 0$.`;
    else if (n === m) why = `Com que $n=m$, les potències de $x$ es cancel·len i queda el quocient dels coeficients principals.`;
    else {
      const pw = n - m;
      const xp = dir > 0 ? '+\\infty' : pw % 2 ? '-\\infty' : '+\\infty';
      why = `Com que $n>m$, $x^{${pw}} \\to ${xp}$${dir < 0 ? ` (exponent ${pw % 2 ? 'senar' : 'parell'})` : ''} i es multiplica per $${ratio}$ (${an / bm > 0 ? 'positiu' : 'negatiu'}).`;
    }
    const mid = n === m ? ratio : n < m ? `\\frac{${ratio}}{x^{${m - n}}}` : `${ratio === '1' ? '' : ratio === '-1' ? '-' : ratio}\\,x^{${n - m}}`;
    const sol = `$$${limTeX} = \\lim_{x\\to${D}} \\frac{${M.termsTeX([{ c: an, body: M.xpow(n) }])}}{${M.termsTeX([{ c: bm, body: M.xpow(m) }])}} = \\lim_{x\\to${D}} ${mid} = ${M.limitTeX(lim)}$$
      <p>Grau del numerador $n=${n}$ (coef. principal $a_n=${an}$), grau del denominador $m=${m}$ ($b_m=${bm}$). ${why}</p>`;
    return {
      part: {
        type: 'limit', label: `$$${limTeX}$$`, lim,
        hint: form === 'fact' ? 'Si el numerador està factoritzat, el seu terme principal és el producte dels termes principals de cada factor (amb les potències).'
          : form === 'shuf' ? 'Compte: els termes no estan ordenats! Identifica el terme de <b>grau més alt</b> de dalt i de baix.'
            : 'Divideix numerador i denominador per la potència més gran de $x$, o directament: només compten els termes de grau més alt.',
      },
      sol,
    };
  }
  const TH = [
    { dir: '+', cond: 'n < m', ans: 0 },
    { dir: '+', cond: 'n = m', ans: 1 },
    { dir: '+', cond: 'n > m \\text{ i } \\frac{a_n}{b_m} > 0', ans: 2 },
    { dir: '+', cond: 'n > m \\text{ i } \\frac{a_n}{b_m} < 0', ans: 3 },
    { dir: '-', cond: 'n = m', ans: 1 },
    { dir: '-', cond: 'n > m,\\ n-m \\text{ parell i } \\frac{a_n}{b_m} > 0', ans: 2 },
    { dir: '-', cond: 'n > m,\\ n-m \\text{ senar i } \\frac{a_n}{b_m} > 0', ans: 3 },
    { dir: '-', cond: 'n > m,\\ n-m \\text{ senar i } \\frac{a_n}{b_m} < 0', ans: 2 },
    { dir: '-', cond: 'n < m', ans: 0 },
  ];
  const TH_OPTS = ['0', '\\dfrac{a_n}{b_m}', '+\\infty', '-\\infty', '\\dfrac{a_0}{b_0}'];
  const PROOF_RATLIM = [
    String.raw`Traiem factor comú $x^n$ al numerador i $x^m$ al denominador.`,
    String.raw`Escrivim el quocient com $x^{n-m}\cdot\frac{A(x)}{B(x)}$, amb $A(x)=a_n+\frac{a_{n-1}}{x}+\dots$ i $B(x)=b_m+\frac{b_{m-1}}{x}+\dots$`,
    String.raw`Com que cada $\frac{a_j}{x^k}\to0$, tenim $A(x)\to a_n$ i $B(x)\to b_m\neq0$.`,
    String.raw`Separem casos segons $n-m$: si $n\lt m$, $x^{n-m}\to0$; si $n=m$, $x^{n-m}=1$; si $n>m$, $x^{n-m}\to+\infty$.`,
    String.raw`Conclusió: $0$, $\frac{a_n}{b_m}$ o $\pm\infty$ (segons el signe de $\frac{a_n}{b_m}$), respectivament.`,
  ];

  function genRatlim(diff) {
    const cases = shuffle(['lt', 'eq', 'gt']);
    let plan;
    if (diff === 1) plan = [[1, 'std'], [1, 'std']];
    else if (diff === 2) plan = [[1, 'std'], [-1, 'std'], [1, 'shuf']];
    else plan = [[1, 'shuf'], [-1, 'fact'], [-1, 'shuf']];
    const parts = [], sols = [];
    plan.forEach(([dir, form], i) => {
      const kase = i < 3 ? cases[i % 3] : pick(['lt', 'eq', 'gt']);
      const r = makeLimit(dir, dir < 0 && diff === 3 && i === 2 ? 'gt' : kase, form);
      parts.push(r.part); sols.push(r.sol);
    });
    const th = pick(diff === 3 ? TH : TH.filter(t => t.dir === '+'));
    parts.push({
      type: 'mcq',
      label: `<b>Cas general.</b> Siguin $n,m$ enters positius, $P(x)=a_nx^n+\\dots+a_1x+a_0$ i $Q(x)=b_mx^m+\\dots+b_1x+b_0$ amb $a_n\\neq0$, $b_m\\neq0$. Si $${th.cond}$, quant val $\\displaystyle\\lim_{x\\to${th.dir}\\infty}\\frac{P(x)}{Q(x)}$?`,
      options: TH_OPTS.map((t, i) => ({ tex: t, ok: i === th.ans })),
      hint: `$\\dfrac{P(x)}{Q(x)} \\approx \\dfrac{a_n}{b_m}x^{n-m}$ quan $|x|$ és gran. El límit només depèn de $n$, $m$, $a_n$ i $b_m$.`,
    });
    if (diff >= 2) parts.push({ type: 'order', label: '<b>Demostració del cas general.</b> Ordena els passos tal com els escriuries a l\'examen:', items: PROOF_RATLIM, hint: 'Primer factor comú, després què passa amb cada tros, després casos.' });
    return {
      topic: 'ratlim', diff,
      statement: `Calcula els límits següents. <p class="note"><b>Pista:</b> només cal usar l'Hôpital uns quants cops, o bé treure factor comú convenientment. El límit només depèn dels graus i dels coeficients principals. Respostes: un número (<code>3/2</code>, <code>0</code>…), <code>inf</code> o <code>-inf</code>.</p>`,
      parts,
      solution: sols.map((s, i) => `<p><b>(${String.fromCharCode(97 + i)})</b></p>${s}`).join('') +
        `<p><b>Cas general:</b> traient factor comú $x^n$ a dalt i $x^m$ a baix,
         $$\\frac{P(x)}{Q(x)} = \\frac{x^n\\left(a_n + \\frac{a_{n-1}}{x}+\\dots+\\frac{a_0}{x^n}\\right)}{x^m\\left(b_m + \\frac{b_{m-1}}{x}+\\dots+\\frac{b_0}{x^m}\\right)} \\;\\sim\\; \\frac{a_n}{b_m}\\,x^{n-m},$$
         per tant a $+\\infty$: $0$ si $n\\lt m$; $\\frac{a_n}{b_m}$ si $n=m$; $\\operatorname{sign}\\!\\left(\\frac{a_n}{b_m}\\right)\\infty$ si $n>m$. A $-\\infty$, si $n>m$ el signe canvia quan $n-m$ és senar.</p>`,
    };
  }

  const TOPIC_GEN = { chain: genChain, limder: genLimDer, study: genStudy, ratlim: genRatlim, hopital: d => SK.exHopital(d), extrem: d => SK.exExtrem(d) };
  function generate(topic, diff) { return TOPIC_GEN[topic](diff); }
  return { generate, LAYERS, PROOF_RATLIM };
})();
/* ---------- skills.js ---------- */
/* ===========================================================
   Graf de coneixement: habilitats petites + generadors d'ítems
   ràpids (mode Entrena) + exercicis complets de l'Hôpital i
   d'extrems relatius.
   Cada ítem és una "part" compatible amb el motor d'exercicis:
   { type, label, ..., why }   (why = explicació curta)
   =========================================================== */
const SK = (() => {
  const R = String.raw;
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const nz = (a, b) => { let v; do v = ri(a, b); while (v === 0); return v; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const P = s => M.parse(s);
  const isN = (n, v) => n.t === 'num' && n.v === v;
  const negOf = n => (n.t === 'neg' ? n.a : n.t === 'num' && n.v < 0 ? { t: 'num', v: -n.v } : n.t === 'mul' && negOf(n.a) ? { t: 'mul', a: negOf(n.a), b: n.b } : n.t === 'div' && negOf(n.a) ? { t: 'div', a: negOf(n.a), b: n.b } : null);
  // simplificacions només per mostrar (1·x → x, a + (−b) → a − b, x^1 → x)
  function simp(n) {
    if (!n || typeof n !== 'object') return n;
    const a = simp(n.a), b = simp(n.b);
    const m = { ...n, a, b };
    if (n.t === 'mul') { if (isN(a, 1)) return b; if (isN(b, 1)) return a; if (isN(a, -1)) return { t: 'neg', a: b }; if (a.t === 'neg' && isN(a.a, 1)) return { t: 'neg', a: b }; }
    if (n.t === 'pow' && isN(b, 1)) return a;
    if (n.t === 'div') { const na = negOf(a); if (na) return { t: 'neg', a: { t: 'div', a: na, b } }; }
    if (n.t === 'add') { const nb = negOf(b); if (nb) return { t: 'sub', a, b: nb }; }
    if (n.t === 'sub') { const nb = negOf(b); if (nb) return { t: 'add', a, b: nb }; }
    return m;
  }
  const TX = a => M.tex(simp(a));
  const T = s => TX(P(s));
  const F = M.fracTeX, NT = M.numTeX;
  const N = (v, tex) => ({ k: 'num', v, tex: tex ?? NT(v) }), INF = { k: 'inf', s: 1 }, NINF = { k: 'inf', s: -1 }, DNE = { k: 'dne' };
  const POS = [0.19, 0.33, 0.52, 0.74, 0.97, 1.21, 1.46, 1.72, 2.03, 2.4, 2.9, 3.6];
  const I = Infinity;

  /* ---------- constructors d'ítems ---------- */
  function EX(label, ans, why, o = {}) {
    const a = P(ans);
    return { type: 'expr', label, ans, f: x => M.ev(a, x), answerTeX: o.tex || TX(a), why, pts: o.pts, src: o.src };
  }
  const VAL = (label, v, tex, why, o = {}) => ({ type: 'value', label, v, answerTeX: tex ?? NT(v), why, ...o });
  const LIM = (label, lim, why, o = {}) => ({ type: 'limit', label, lim, why, ...o });
  const LST = (label, pairs, why, o = {}) => {
    const list = pairs.map(p => (Array.isArray(p) ? { v: p[0], tex: p[1] ?? NT(p[0]) } : p)).sort((a, b) => a.v - b.v);
    return { type: 'list', label, list, answerTeX: M.listTeX(list), why, ...o };
  };
  const end = (v, tex) => ({ v, tex: tex ?? (v === -I ? '-\\infty' : v === I ? '+\\infty' : NT(v)) });
  function mergeTouch(ivs) {
    const out = [];
    for (const iv of ivs) { const l = out[out.length - 1]; if (l && Math.abs(l.b.v - iv.a.v) < 1e-12) l.b = iv.b; else out.push({ a: iv.a, b: iv.b }); }
    return out;
  }
  // ivs: [{a:{v,tex}, b:{v,tex}}]; la resposta es compara fusionada (com fa el lector)
  const IVL = (label, ivs, why, o = {}) => ({ type: 'intervals', label, intervals: mergeTouch(ivs), answerTeX: M.intervalsTeX(ivs), why, ...o });
  const MC = (label, opts, ok, why) => ({ type: 'mcq', label, options: shuffle(opts.map((h, i) => ({ html: h, ok: i === ok }))), why });

  /* ---------- cadenes d'expressions ---------- */
  const mono = (c, b) => (b === '' ? String(c) : c === 1 ? b : c === -1 ? `-${b}` : `${c}*${b}`);
  const sum = terms => terms.filter(Boolean).join(' + ').replace(/\+ -/g, '- ') || '0';
  const xp = i => (i === 0 ? '' : i === 1 ? 'x' : `x^${i}`);
  const polyS = c => sum(c.map((v, i) => (v === 0 ? null : mono(v, xp(i)))).reverse());
  function isCall(s) {
    const m = s.match(/^[a-z]+\(/);
    if (!m) return false;
    let d = 0;
    for (let i = m[0].length - 1; i < s.length; i++) { if (s[i] === '(') d++; else if (s[i] === ')') { d--; if (d === 0) return i === s.length - 1; } }
    return false;
  }
  const isAtom = s => /^x$|^\d+$/.test(s) || isCall(s);
  const pw = (u, n) => (isAtom(u) && u !== 'x' ? `${u}^${n}` : u === 'x' ? `x^${n}` : `(${u})^${n}`);
  const mul = (a, b) => (a === '1' ? b : b === '1' ? a : a.startsWith('1/') ? `${b}/${a.slice(2)}` : b.startsWith('1/') ? `${a}/${b.slice(2)}` : `${a}*${b}`);
  const wrapP = s => (isAtom(s) ? s : `(${s})`);
  const sq = s => (isAtom(s) ? `${s}^2` : `(${s})^2`);
  // a + b, on b pot començar per "-"
  const plus = (a, b) => (b.startsWith('-') ? `${a} - ${b.slice(1)}` : `${a} + ${b}`);
  // a·b on b pot començar per "-"
  const times = (a, b) => (b.startsWith('-') ? `-${mul(a, b.slice(1))}` : mul(a, b));
  const lnTeX = n => (n === 1 ? 'e' : n === 2 ? '\\sqrt{e}' : `e^{1/${n}}`);

  /* ---------- capes per a la regla de la cadena ---------- */
  const OUT = {
    sin: { w: u => `sin(${u})`, lab: '\\sin', r: R`(\sin u)'=\cos u\cdot u'` },
    cos: { w: u => `cos(${u})`, lab: '\\cos', r: R`(\cos u)'=-\sin u\cdot u'` },
    tan: { w: u => `tan(${u})`, lab: '\\tan', r: R`(\tan u)'=\frac{u'}{\cos^2u}` },
    exp: { w: u => `e^(${u})`, lab: 'e^{\\square}', r: R`(e^u)'=e^u\cdot u'`, pos: true },
    ln: { w: u => `ln(${u})`, lab: '\\ln', r: R`(\ln u)'=\frac{u'}{u}`, need: true },
    sqrt: { w: u => `sqrt(${u})`, lab: '\\sqrt{\\square}', r: R`(\sqrt u)'=\frac{u'}{2\sqrt u}`, need: true, pos: true },
  };
  for (const n of [2, 3, 4, 5]) OUT['p' + n] = { n, w: u => pw(u, n), lab: `\\square^{${n}}`, r: `(u^{${n}})'=${n}u${n - 1 === 1 ? '' : `^{${n - 1}}`}\\cdot u'`, pos: n % 2 === 0 ? true : 'keep' };
  function chainD(k, u, du) {
    if (du === '0') return '0';
    if (k === 'ln') return `${wrapP(du)}/${wrapP(u)}`;
    if (k === 'sqrt') return `${wrapP(du)}/(2*sqrt(${u}))`;
    if (k === 'tan') return `${wrapP(du)}/cos(${u})^2`;
    let neg = false, core, coef = 1;
    if (k === 'sin') core = `cos(${u})`;
    else if (k === 'cos') { neg = true; core = `sin(${u})`; }
    else if (k === 'exp') core = `e^(${u})`;
    else { coef = OUT[k].n; core = coef - 1 === 1 ? wrapP(u) : pw(u, coef - 1); }
    let dneg = false, d = du;
    if (d.startsWith('-') && isAtom(d.slice(1))) { dneg = true; d = d.slice(1); }
    if (dneg) neg = !neg;
    if (/^\d+$/.test(d)) { coef *= +d; d = '1'; }
    const c = neg ? -coef : coef;
    const head = mono(c, core);
    return d === '1' ? head : `${head}*${wrapP(d)}`;
  }
  // base: {s, d}; keys de dins cap a fora
  function compose(base, keys) {
    let cur = { s: base.s, d: base.d };
    for (const k of keys) cur = { s: OUT[k].w(cur.s), d: chainD(k, cur.s, cur.d) };
    return cur;
  }

  /* =========================================================
     A. DERIVADES
     ========================================================= */
  const ELEM = [
    { s: 'sin(x)', d: c => mono(c, 'cos(x)'), r: R`(\sin x)'=\cos x` },
    { s: 'cos(x)', d: c => mono(-c, 'sin(x)'), r: R`(\cos x)'=-\sin x` },
    { s: 'e^x', d: c => mono(c, 'e^x'), r: R`(e^x)'=e^x` },
    { s: 'ln(x)', d: c => `${c}/x`, r: R`(\ln x)'=\frac1x`, pos: true },
    { s: 'tan(x)', d: c => `${c}/cos(x)^2`, r: R`(\tan x)'=\frac{1}{\cos^2x}` },
    { s: 'sqrt(x)', d: c => (c % 2 === 0 ? `${c / 2}/sqrt(x)` : `${c}/(2*sqrt(x))`), r: R`(\sqrt x)'=\frac{1}{2\sqrt x}`, pos: true },
  ];
  function dPow(t) {
    if (t === 1) {
      const a = nz(-9, 9), n = ri(2, 7), src = mono(a, `x^${n}`);
      return EX(`Deriva $f(x)=${T(src)}$`, mono(a * n, xp(n - 1)), R`$(x^n)'=n\,x^{n-1}$: l'exponent baixa multiplicant i es resta 1. Aquí $${a}\cdot${n}=${a * n}$.`, { src });
    }
    if (t === 2) {
      const deg = ri(3, 5);
      const c = Array.from({ length: deg + 1 }, (_, i) => (i === deg ? nz(-6, 6) : Math.random() < 0.65 ? ri(-9, 9) : 0));
      const d = M.polyDer(c);
      return EX(`Deriva $f(x)=${M.polyTeX(c)}$`, polyS(d), R`Terme a terme amb $(x^n)'=nx^{n-1}$. La constant es fa $0$.`, { src: polyS(c), tex: M.polyTeX(d) });
    }
    const gens = [
      () => { const a = nz(-6, 6), n = ri(1, 3); return { s: n === 1 ? `${a}/x` : `${a}/x^${n}`, d: `${-a * n}/x^${n + 1}`, w: R`$${T(n === 1 ? `${a}/x` : `${a}/x^${n}`)}=${T(mono(a, `x^(-${n})`))}$, i $(x^{-${n}})'=-${n}x^{-${n + 1}}$` }; },
      () => { const a = nz(-6, 6); return { s: mono(a, 'sqrt(x)'), d: a % 2 === 0 ? `${a / 2}/sqrt(x)` : `${a}/(2*sqrt(x))`, w: R`$\sqrt x=x^{1/2}$, i $(x^{1/2})'=\frac12x^{-1/2}=\frac{1}{2\sqrt x}$` }; },
      () => { const a = pick([2, 4, -2, 6]); return { s: mono(a, 'x*sqrt(x)'), d: mono(a * 3 / 2, 'sqrt(x)'), w: R`$x\sqrt x=x^{3/2}$, i $(x^{3/2})'=\frac32x^{1/2}$` }; },
      () => { const a = nz(-5, 5), n = ri(2, 4); return { s: mono(a, `x^${n}`), d: mono(a * n, xp(n - 1)), w: R`$(x^{${n}})'=${n}x^{${n - 1}}$` }; },
    ];
    const [g1, g2] = shuffle(gens).slice(0, 2).map(g => g());
    const src = sum([g1.s, g2.s]);
    return EX(`Deriva $f(x)=${T(src)}$ (per a $x>0$)`, sum([g1.d, g2.d]), `${g1.w}; ${g2.w}.`, { src, pts: POS });
  }
  function dElem(t) {
    const k = t === 1 ? 1 : t === 2 ? 2 : 3;
    const pool = t === 1 ? ELEM.slice(0, 4) : ELEM;
    const terms = shuffle(pool).slice(0, k).map(e => ({ e, c: nz(-6, 6) }));
    if (t >= 2 && Math.random() < 0.5) terms.push({ e: { s: 'x^3', d: c => mono(3 * c, 'x^2'), r: R`(x^3)'=3x^2` }, c: nz(-4, 4) });
    const src = sum(terms.map(o => mono(o.c, o.e.s)));
    const ans = sum(terms.map(o => o.e.d(o.c)));
    return EX(`Deriva $f(x)=${T(src)}$`, ans, terms.map(o => `$${o.e.r}$`).join(', ') + '. Les constants que multipliquen es queden.', { src, pts: terms.some(o => o.e.pos) ? POS : undefined });
  }
  const UP = [{ s: 'x', d: '1' }, { s: 'x^2', d: '2*x' }, { s: 'x^3', d: '3*x^2' }];
  const UP2 = [{ s: '(x^2+1)', d: '2*x' }, { s: '(x+1)', d: '1' }, { s: '(2*x-3)', d: '2' }, { s: 'x^4', d: '4*x^3' }, { s: '3*x^2', d: '6*x' }, { s: '(x^2-x)', d: '(2*x-1)' }];
  const VF = [{ s: 'sin(x)', d: 'cos(x)' }, { s: 'cos(x)', d: '-sin(x)' }, { s: 'e^x', d: 'e^x' }, { s: 'ln(x)', d: '1/x', pos: true }];
  const prodAns = (u, v) => plus(mul(u.d, v.s), times(u.s, v.d));
  function dProd(t) {
    let u, v;
    if (t === 1) { u = pick(UP); v = pick(VF); }
    else if (t === 2) { u = pick(UP2); v = pick(VF); }
    else { [u, v] = shuffle(VF).slice(0, 2); if (Math.random() < 0.3) { u = pick(UP2); v = pick(VF); } }
    const src = `${u.s}*${v.s}`;
    return EX(`Deriva $f(x)=${T(src)}$`, prodAns(u, v), R`Regla del producte $(u\,v)'=u'v+u\,v'$ amb $u=${T(u.s)}$ ($u'=${T(u.d)}$) i $v=${T(v.s)}$ ($v'=${T(v.d)}$).`, { src, pts: u.pos || v.pos ? POS : undefined });
  }
  function dQuot(t) {
    const NUM = t === 1 ? [{ s: '1', d: '0' }, { s: 'x', d: '1' }] : t === 2 ? [{ s: 'x', d: '1' }, { s: 'x^2', d: '2*x' }, { s: '(x+1)', d: '1' }, { s: '1', d: '0' }]
      : [{ s: 'sin(x)', d: 'cos(x)' }, { s: 'e^x', d: 'e^x' }, { s: 'ln(x)', d: '1/x', pos: true }, { s: 'x^2', d: '2*x' }];
    const DEN = t === 1 ? [{ s: '(x+2)', d: '1' }, { s: '(x^2+1)', d: '2*x' }, { s: 'x', d: '1' }] : t === 2 ? [{ s: '(x^2+1)', d: '2*x' }, { s: '(x+2)', d: '1' }, { s: '(x-3)', d: '1' }, { s: 'x^2', d: '2*x' }]
      : [{ s: 'x', d: '1' }, { s: 'e^x', d: 'e^x' }, { s: '(x^2+1)', d: '2*x' }, { s: 'cos(x)', d: '-sin(x)' }];
    let u, v;
    do { u = pick(NUM); v = pick(DEN); } while (u.s === v.s || (u.s === 'x' && v.s === 'x'));
    const src = `${u.s}/${v.s}`;
    const uv = times(u.s, v.d);
    const numer = u.d === '0' ? (uv.startsWith('-') ? uv.slice(1) : `-${uv}`) : (uv.startsWith('-') ? `${mul(u.d, v.s)} + ${uv.slice(1)}` : `${mul(u.d, v.s)} - ${uv}`);
    const ans = `(${numer})/${sq(v.s)}`;
    return EX(`Deriva $f(x)=${T(src)}$`, ans, R`Regla del quocient $\left(\frac uv\right)'=\frac{u'v-u\,v'}{v^2}$ amb $u=${T(u.s)}$, $v=${T(v.s)}$. Compte: el signe menys va al davant de $u\,v'$.`, { src, pts: u.pos ? POS : undefined });
  }
  function dVal(t) {
    if (t === 1) {
      const c = [ri(-5, 5), ri(-6, 6), nz(-4, 4), Math.random() < 0.5 ? nz(-3, 3) : 0];
      const a = ri(-2, 2), d = M.polyDer(c);
      return VAL(`Si $f(x)=${M.polyTeX(c)}$, quant val $f'(${a})$?`, M.polyEval(d, a), null, R`$f'(x)=${M.polyTeX(d)}$ i substituïm $x=${a}$.`);
    }
    const opts = [
      () => { const a = nz(-4, 4), b = nz(-4, 4), c = nz(-3, 3); const src = `(${polyS([b, a])})*e^(${mono(c, 'x')})`; return { src, at: 0, v: a + b * c, w: R`$f'(x)=${a}e^{${c}x}+(${M.polyTeX([b, a])})\cdot${c}e^{${c}x}$; a $x=0$: $${a}+${b}\cdot${c}=${a + b * c}$.` }; },
      () => { const a = nz(-4, 4), b = nz(-4, 4), c = nz(-3, 3); const src = `(${polyS([b, a])})*sin(${mono(c, 'x')})`; return { src, at: 0, v: b * c, w: R`$f'(x)=${a}\sin(${c}x)+(${M.polyTeX([b, a])})\cdot${c}\cos(${c}x)$; a $x=0$: $0+${b}\cdot${c}=${b * c}$.` }; },
      () => { const a = nz(-4, 4), b = nz(-4, 4); const src = `e^(${mono(a, 'x')})*cos(${mono(b, 'x')})`; return { src, at: 0, v: a, w: R`$f'(x)=${a}e^{${a}x}\cos(${b}x)-${b}e^{${a}x}\sin(${b}x)$; a $x=0$: $${a}$.` }; },
      () => ({ src: 'x^2*ln(x)', at: 1, v: 1, w: R`$f'(x)=2x\ln x+x$; a $x=1$: $0+1=1$.` }),
      () => ({ src: 'ln(x)/x', at: 1, v: 1, w: R`$f'(x)=\frac{1-\ln x}{x^2}$; a $x=1$: $1$.` }),
      () => { const n = ri(2, 4); return { src: `(x^2+1)^${n}`, at: 1, v: n * 2 ** (n - 1) * 2, w: R`Cadena: $f'(x)=${n}(x^2+1)^{${n - 1}}\cdot2x$; a $x=1$: $${n}\cdot2^{${n - 1}}\cdot2=${n * 2 ** n}$.` }; },
    ];
    const o = (t === 2 ? pick(opts.slice(0, 3)) : pick(opts))();
    return VAL(`Si $f(x)=${T(o.src)}$, quant val $f'(${o.at})$?`, o.v, null, o.w, { src: o.src, at: o.at });
  }

  /* =========================================================
     B. REGLA DE LA CADENA
     ========================================================= */
  const seqTeX = (keys, base) => keys.slice().reverse().map(k => OUT[k].lab).concat([T(base)]).join(R` \to `);
  function bad(prev, k, used) {
    if (!prev) return false;
    if (prev === k && !['sin', 'cos'].includes(k)) return true;
    if ((prev === 'exp' && k === 'ln') || (prev === 'ln' && k === 'exp')) return true;
    if (prev[0] === 'p' && (k[0] === 'p' || k === 'sqrt')) return true;
    if (prev === 'sqrt' && k[0] === 'p') return true;
    if (prev === 'exp' && k[0] === 'p') return true;
    if (['exp', 'ln', 'sqrt', 'tan'].includes(k) && used.includes(k)) return true;
    return false;
  }
  function randKeys(n, base, allowed = ['sin', 'cos', 'exp', 'ln', 'sqrt', 'p2', 'p3']) {
    for (let tries = 0; tries < 200; tries++) {
      const keys = [];
      let pos = !!base.pos;
      for (let i = 0; i < n; i++) {
        const c = allowed.filter(k => (!OUT[k].need || pos) && !bad(keys[i - 1], k, keys) && !(i === 0 && k[0] === 'p' && /^\d*\*?x(\^\d)?$/.test(base.s))
          && !(k === 'exp' && !(i === 0 ? base.s !== 'x^3' : ['sin', 'cos'].includes(keys[i - 1]))));
        if (!c.length) break;
        const k = pick(c);
        keys.push(k);
        const p = OUT[k].pos;
        pos = p === 'keep' ? pos : !!p;
      }
      if (keys.length === n) return keys;
    }
    return ['sin', 'p2'].slice(0, n);
  }
  const BASES = [{ s: 'x^2', d: '2*x' }, { s: 'x^3', d: '3*x^2' }, { s: '3*x', d: '3' }, { s: '2*x+1', d: '2' }, { s: 'x^2+1', d: '2*x', pos: true }];
  function cLayers(t) {
    const base = pick(BASES);
    const n = t === 1 ? 2 : 3;
    const allowed = t === 3 ? ['sin', 'cos', 'p2', 'p3', 'exp'] : ['sin', 'cos', 'exp', 'ln', 'sqrt', 'p2', 'p3'];
    let keys = randKeys(n, base, allowed);
    for (let g = 0; g < 30 && new Set(keys.map(k => OUT[k].lab)).size < n; g++) keys = randKeys(n, base, allowed);
    if (t === 3 && !keys.some(k => k[0] === 'p')) keys = ['sin', 'p2', 'cos'].slice(0, n);
    const f = compose(base, keys);
    const correct = seqTeX(keys, base.s);
    if (t === 1 || t === 3) {
      const ext = keys[keys.length - 1];
      const others = shuffle(Object.keys(OUT).filter(k => OUT[k].lab !== OUT[ext].lab && !['p4', 'p5', 'tan'].includes(k))).slice(0, 2).map(k => `$${OUT[k].lab}$`);
      const innerLab = `$${OUT[keys[0]].lab === OUT[ext].lab ? T(base.s) : OUT[keys[0]].lab}$`;
      const opts = [...new Set([`$${OUT[ext].lab}$`, innerLab, ...others])].slice(0, 4);
      return MC(`Quina és la <b>capa exterior</b> (l'última operació) de $f(x)=${T(f.s)}$?`, opts, 0,
        R`Capes de fora cap a dins: $${correct}$. La capa exterior és l'última operació que faries amb la calculadora.`);
    }
    const perms = new Set([correct]);
    let guard = 0;
    while (perms.size < 4 && guard++ < 50) perms.add(seqTeX(shuffle(keys), base.s));
    const opts = [...perms].map(s => `$${s}$`);
    return MC(`Ordena les capes de <b>fora cap a dins</b> de $f(x)=${T(f.s)}$:`, opts, 0, R`De fora cap a dins: $${correct}$.`);
  }
  function lin() { const a = nz(-5, 5), b = ri(-5, 5); return { s: polyS([b, a]), d: String(a) }; }
  function cOne(t) {
    let base;
    if (t === 1) base = lin();
    else if (t === 2) base = pick([{ s: `${ri(1, 3) === 1 ? '' : ri(2, 3) + '*'}x^2+${ri(1, 4)}`, pos: true }, { s: 'x^3', d: '3*x^2' }, { s: `x^2-${ri(1, 4)}*x`, pd: true }]);
    else base = pick([{ s: 'sin(x)', d: 'cos(x)' }, { s: 'cos(x)', d: '-sin(x)' }, { s: 'e^x', d: 'e^x', pos: true }, { s: 'ln(x)', d: '1/x', dom: POS }, { s: '1+e^x', d: 'e^x', pos: true }, { s: 'x^2+4', d: '2*x', pos: true }]);
    if (!base.d) { const ast = base.s.replace(/\s/g, ''); const c = polyFrom(ast); base.d = polyS(M.polyDer(c)); }
    const ks = ['sin', 'cos', 'exp', 'p2', 'p3', 'p4', 'p5', ...(base.pos ? ['ln', 'sqrt'] : []), ...(t >= 2 ? ['tan'] : [])].filter(k => !(base.s.startsWith('e^') && k === 'ln') && !(base.s.startsWith('ln') && k === 'exp'));
    const k = pick(ks);
    const f = compose(base, [k]);
    return EX(`Deriva $f(x)=${T(f.s)}$`, f.d, R`Exterior: $${OUT[k].lab}$, interior $u=${T(base.s)}$ amb $u'=${T(base.d)}$. Regla: $${OUT[k].r}$.`, { src: f.s, pts: base.dom || (base.s.includes('ln') ? POS : undefined) });
  }
  // coeficients d'un polinomi senzill escrit com "a*x^2+b" (per a cOne)
  function polyFrom(s) {
    const c = [0, 0, 0, 0, 0, 0];
    for (const term of s.replace(/-/g, '+-').split('+').filter(Boolean)) {
      const m = term.match(/^(-?\d*)\*?(x(?:\^(\d))?)?$/);
      if (!m) continue;
      const coef = m[1] === '' ? 1 : m[1] === '-' ? -1 : +m[1];
      const p = m[2] ? (m[3] ? +m[3] : 1) : 0;
      c[p] += coef;
    }
    return M.trim(c);
  }
  function cPowTrig(t) {
    const trig = pick(['sin', 'cos']);
    let base, keys;
    if (t === 1) { base = pick([{ s: 'x', d: '1' }, { s: `${ri(2, 5)}*x`, d: null }]); keys = Math.random() < 0.6 ? [trig, pick(['p2', 'p3'])] : null; if (!keys) { base = { s: `x^${ri(2, 4)}` }; keys = [trig]; } }
    else if (t === 2) { const n = ri(2, 4); base = Math.random() < 0.5 ? { s: `${ri(2, 4)}*x` } : { s: `x^${ri(2, 3)}` }; keys = [trig, 'p' + n]; }
    else {
      const other = trig === 'sin' ? 'cos' : 'sin', pn = pick(['p2', 'p3']);
      base = { s: `x^${ri(2, 3)}` };
      keys = pick([[trig, pn, 'exp'], [trig, other, pn], [other, trig, pn]]);
      if (keys[2] === 'exp') base = { s: 'x^2' };
    }
    if (!base.d) base.d = polyS(M.polyDer(polyFrom(base.s)));
    const f = compose(base, keys);
    return EX(`Deriva $f(x)=${T(f.s)}$`, f.d, R`Capes de fora cap a dins: $${seqTeX(keys, base.s)}$. Recorda: $\sin^n(u)$ vol dir $(\sin u)^n$, i la potència és la capa de <b>fora</b>.`, { src: f.s });
  }
  function cMulti(t) {
    const base = pick(BASES);
    const n = t === 1 ? 2 : t === 2 ? 3 : pick([3, 4]);
    const keys = randKeys(n, base);
    const f = compose(base, keys);
    return EX(`Deriva $f(x)=${T(f.s)}$`, f.d, R`Capes: $${seqTeX(keys, base.s)}$. Un factor per capa, cada capa derivada amb el seu argument intacte.`, { src: f.s });
  }
  function cMixed(t) {
    let u, v;
    if (t === 1) { u = pick(UP); v = compose(lin(), [pick(['sin', 'cos', 'exp'])]); }
    else if (t === 2) { u = pick([...UP, ...UP2.slice(0, 3)]); v = compose(pick([{ s: 'x^2', d: '2*x' }, lin()]), [pick(['sin', 'cos', 'exp', 'p3'])]); }
    else {
      const a = nz(-3, 3);
      u = compose({ s: mono(a, 'x'), d: String(a) }, ['exp']);
      const kk = ri(2, 4);
      v = compose(pick([{ s: `${kk}*x`, d: String(kk) }, { s: 'x', d: '1' }]), [pick(['sin', 'cos'])]);
      if (Math.random() < 0.4) { u = pick(UP); v = compose({ s: 'x^2+1', d: '2*x', pos: true }, [pick(['ln', 'sqrt'])]); }
    }
    const src = `${wrapP(u.s)}*${wrapP(v.s)}`;
    return EX(`Deriva $f(x)=${T(src)}$`, plus(mul(u.d, wrapP(v.s)), times(wrapP(u.s), v.d)), R`Producte: $(u\,v)'=u'v+u\,v'$ amb $u=${T(u.s)}$, $v=${T(v.s)}$. Per derivar $v$ cal la cadena: $v'=${T(v.d)}$.`, { src });
  }

  /* =========================================================
     C. LÍMITS I ACOTACIÓ
     ========================================================= */
  const limL = (at, tex, extra = '') => R`Calcula $\displaystyle\lim_{x\to ${at}} ${tex}$${extra}`;
  function lSub(t) {
    if (t === 1) {
      const c = [ri(-5, 5), ri(-5, 5), nz(-3, 3)], a = ri(-3, 3);
      return LIM(limL(a, M.polyTeX(c)), N(M.polyEval(c, a)), R`Un polinomi és continu: substitueix $x=${a}$.`, { src: polyS(c), at: a });
    }
    if (t === 2) {
      let p, q, r, s, a;
      do { p = nz(-4, 4); q = ri(-5, 5); r = nz(-3, 3); s = ri(-5, 5); a = ri(-3, 3); } while (r * a + s === 0 || p * s === q * r);
      const src = `(${polyS([q, p])})/(${polyS([s, r])})`;
      return LIM(limL(a, T(src)), N((p * a + q) / (r * a + s), F(p * a + q, r * a + s)), R`El denominador no s'anul·la a $x=${a}$ (val $${r * a + s}$), per tant no hi ha cap indeterminació: substitueix. Resultat $\frac{${p * a + q}}{${r * a + s}}$.`, { src, at: a });
    }
    const opts = [
      () => { const a = nz(-3, 3); return { src: `e^(${mono(a, 'x')})*cos(x)`, at: 0, v: 1, w: R`Contínua: $e^0\cos0=1$.` }; },
      () => { const a = nz(1, 4); return { src: `(x^2-${a * a})/(x+${a})`, at: a, v: 0, w: R`A $x=${a}$ el denominador val $${2 * a}\neq0$ i el numerador $0$: el límit és $\frac{0}{${2 * a}}=0$ (no és cap indeterminació).` }; },
      () => { const a = nz(1, 4); return { src: `(x+${a})/(x^2+1)`, at: 0, v: a, w: R`Substitueix $x=0$: $\frac{${a}}{1}=${a}$.` }; },
      () => { const a = ri(2, 5); return { src: `sqrt(x+${a * a - 1})`, at: 1, v: a, w: R`$\sqrt{1+${a * a - 1}}=\sqrt{${a * a}}=${a}$.` }; },
    ];
    const o = pick(opts)();
    return LIM(limL(o.at, T(o.src)), N(o.v), o.w, { src: o.src, at: o.at });
  }
  const TRIG = ['sin', 'cos'];
  const osc = (c, k, tr) => mono(c, (k === 0 ? '' : k === 1 ? 'x*' : `x^${k}*`) + `${tr}(1/x)`);
  function lBounded(t) {
    if (t === 3 && Math.random() < 0.5) {
      const c = nz(-5, 5), b = ri(-4, 4), tr = pick(TRIG);
      const src = sum([`${mono(c, `${tr}(x)`)}/x`, b ? String(b) : null]);
      return LIM(limL(R`+\infty`, T(src)), N(b), R`$\left|\frac{${tr === 'sin' ? '\\sin' : '\\cos'} x}{x}\right|\le\frac1x\to0$ (acotada entre una cosa que va a infinit), i queda $${b}$.`, { src, at: I });
    }
    const k = ri(1, 3), c = nz(-5, 5), tr = pick(TRIG);
    const b = t === 1 ? 0 : nz(-5, 5);
    const src = sum([osc(c, k, tr), b ? String(b) : null, t === 3 ? mono(nz(-3, 3), 'x') : null]);
    return LIM(limL(0, T(src)), N(b), R`$\left|${T(osc(c, k, tr))}\right|\le ${Math.abs(c) === 1 ? '' : Math.abs(c)}|x|^{${k}}\to0$: <b>zero per acotada</b> ($|\sin|,|\cos|\le1$). La resta és contínua i val $${b}$ a $x=0$.`, { src, at: 0 });
  }
  function lOsc(t) {
    const nTerms = t === 1 ? 1 : 2;
    const ks = [];
    for (let i = 0; i < nTerms; i++) ks.push(t === 3 ? ri(-1, 3) : ri(0, 2));
    if (t === 3 && Math.random() < 0.5) ks[0] = ri(1, 3);
    const terms = ks.map(k => ({ k, c: nz(-4, 4), tr: pick(TRIG) }));
    const minK = Math.min(...ks);
    const str = o => (o.k === -1 ? mono(o.c, `${o.tr}(1/x)/x`) : osc(o.c, o.k, o.tr));
    const src = sum(terms.map(str));
    const dne = minK <= 0;
    return LIM(limL(0, T(src), ' (o escriu «no existeix»)'), dne ? DNE : N(0),
      dne ? R`El terme $${T(str(terms.find(o => o.k === minK)))}$ ${minK === 0 ? 'oscil·la sense parar entre dos valors' : 'oscil·la amb amplitud que creix'} quan $x\to0$: <b>no té límit</b>. Sumar-li termes que tendeixen a $0$ no ho arregla.`
        : R`Tots els termes són $x^k\cdot(\text{acotada})$ amb $k\ge1$: tots tendeixen a $0$.`, { src, at: 0 });
  }
  function lDefDer(t) {
    if (t === 1) {
      const c = [ri(-4, 4), ri(-5, 5), nz(-3, 3)], a = ri(-2, 2), d = M.polyDer(c);
      return LIM(R`Sigui $f(x)=${M.polyTeX(c)}$. Calcula $\displaystyle\lim_{h\to0}\frac{f(${a}+h)-f(${a})}{h}$.`, N(M.polyEval(d, a)), R`Aquest límit és la definició de $f'(${a})$. Amb les regles: $f'(x)=${M.polyTeX(d)}$, $f'(${a})=${M.polyEval(d, a)}$.`);
    }
    const k = ri(1, 3), c = nz(-4, 4), tr = pick(TRIG), a = t === 3 ? nz(-4, 4) : 0;
    const src = sum([osc(c, k, tr), a ? mono(a, 'x') : null]);
    const q = sum([osc(c, k - 1, tr), a ? String(a) : null]);
    return LIM(R`Sigui $f(x)=${T(src)}$ si $x\neq0$ i $f(0)=0$. Calcula $f'(0)=\displaystyle\lim_{h\to0}\frac{f(h)-f(0)}{h}$ (o «no existeix»).`, k >= 2 ? N(a) : DNE,
      R`$\frac{f(h)-0}{h}=${T(q).replace(/x/g, 'h')}$. ${k >= 2 ? R`Com que $h^{${k - 1}}\cdot(\text{acotada})\to0$, el límit és $${a}$.` : R`El terme $${tr === 'sin' ? '\\sin' : '\\cos'}(1/h)$ oscil·la: el límit no existeix, i $f$ no és derivable a $0$.`}`);
  }
  const CLASS = ['No és contínua a $0$', 'Contínua però no derivable a $0$', "Derivable a $0$, però $f'$ no és contínua a $0$", "Derivable i amb $f'$ contínua a $0$ (de classe $C^1$)"];
  function lClass(t) {
    const k = t === 1 ? ri(1, 2) : t === 2 ? ri(0, 3) : ri(0, 4);
    const c = nz(-3, 3), tr = pick(TRIG);
    const src = sum([osc(c, k, tr), t === 3 && Math.random() < 0.5 ? mono(nz(-3, 3), 'x') : null]);
    const ans = Math.min(k, 3);
    const W = [
      R`$f(x)$ oscil·la i no tendeix a $f(0)=0$: no és contínua.`,
      R`$|f(x)|\le C|x|\to0$: contínua. Però $\frac{f(h)}{h}$ conté $${tr}(1/h)$, que oscil·la: no derivable.`,
      R`$\frac{f(h)}{h}=h\cdot(\text{acotada})\to0$: derivable amb $f'(0)=0$ (o el que valgui el terme lineal). Però $f'(x)$ conté un terme $\pm\cos(1/x)$ o $\pm\sin(1/x)$ sense $x$ davant, que oscil·la: $f'$ no és contínua.`,
      R`Derivable a $0$ i tots els termes de $f'(x)$ porten com a mínim una $x$ multiplicant: $f'(x)\to f'(0)$. És $C^1$.`,
    ];
    return MC(`Sigui $f(x)=${T(src)}$ si $x\neq0$, i $f(0)=0$. Quina afirmació és correcta?`, CLASS, ans, W[ans]);
  }

  /* =========================================================
     D. REGLA DE L'HÔPITAL
     ========================================================= */
  const FORMS = { '00': R`$\frac{0}{0}$`, ii: R`$\frac{\infty}{\infty}$`, '0i': R`$0\cdot\infty$`, 'i-i': R`$\infty-\infty$`, '1i': R`$1^{\infty}$`, '0^0': R`$0^{0}$`, 'i^0': R`$\infty^{0}$`, no: 'No és cap indeterminació' };
  const atTeX = at => (at === I ? '+\\infty' : at === '0+' ? '0^{+}' : String(at));
  const atNum = at => (at === '0+' ? 0 : at);
  function hForm(t) {
    const a = ri(2, 5);
    const L1 = [
      { s: `sin(${a}*x)/x`, at: 0, f: '00', w: R`$\sin(${a}\cdot0)=0$ i el denominador també $0$.` },
      { s: `(e^(${a}*x)-1)/x`, at: 0, f: '00', w: R`$e^0-1=0$ a dalt i $0$ a baix.` },
      { s: `ln(x)/x^${a}`, at: I, f: 'ii', w: R`$\ln x\to\infty$ i $x^{${a}}\to\infty$.` },
      { s: `x^${a}/e^x`, at: I, f: 'ii', w: R`Els dos van a $\infty$.` },
      { s: `(x+${a})/(x+1)`, at: 0, f: 'no', w: R`Substituint dona $\frac{${a}}{1}=${a}$: és un número, no hi ha res a resoldre (i <b>no</b> es pot aplicar l'Hôpital).` },
      { s: `(x^2+${a})/(x+1)`, at: 0, f: 'no', w: R`Substituint dona $${a}$. No és indeterminació.` },
    ];
    const L2 = [
      { s: `x*ln(x)`, at: '0+', f: '0i', w: R`$x\to0$ i $\ln x\to-\infty$.` },
      { s: `x^${a}*e^(-x)`, at: I, f: '0i', w: R`$x^{${a}}\to\infty$ i $e^{-x}\to0$.` },
      { s: `1/x-1/sin(x)`, at: '0+', f: 'i-i', w: R`Els dos termes van a $+\infty$ i es resten.` },
      { s: `sqrt(x^2+${a}*x)-x`, at: I, f: 'i-i', w: R`$\sqrt{x^2+${a}x}\to\infty$ i $x\to\infty$.` },
      { s: `cos(x)/x`, at: '0+', f: 'no', w: R`$\cos 0=1$ a dalt, $0^+$ a baix: dona $+\infty$ directament, no és indeterminació.` },
    ];
    const L3 = [
      { s: `(1+${a}/x)^x`, at: I, f: '1i', w: R`La base tendeix a $1$ i l'exponent a $\infty$.` },
      { s: `x^x`, at: '0+', f: '0^0', w: R`Base $\to0$ i exponent $\to0$.` },
      { s: `x^(1/x)`, at: I, f: 'i^0', w: R`Base $\to\infty$ i exponent $\frac1x\to0$.` },
      { s: `(1+${a}*x)^(1/x)`, at: 0, f: '1i', w: R`Base $\to1$, exponent $\frac1x\to\infty$.` },
      { s: `x^(sin(x))`, at: '0+', f: '0^0', w: R`Base $\to0$, exponent $\sin x\to0$.` },
      { s: `(2+x)^(1/x)`, at: '0+', f: 'no', w: R`La base tendeix a $2$ (no a $1$): $2^{+\infty}=+\infty$. No és indeterminació.` },
    ];
    const pool = t === 1 ? L1 : t === 2 ? [...L1, ...L2, ...L2] : [...L2, ...L3, ...L3];
    const o = pick(pool);
    const keys = t === 1 ? ['00', 'ii', '0i', 'no'] : t === 2 ? ['00', 'ii', '0i', 'i-i', 'no'] : Object.keys(FORMS);
    const others = shuffle(keys.filter(k => k !== o.f)).slice(0, 3);
    return MC(`Quin tipus de límit és $\\displaystyle\\lim_{x\\to ${atTeX(o.at)}} ${T(o.s)}$?`, [FORMS[o.f], ...others.map(k => FORMS[k])], 0, o.w);
  }
  // plantilles 0/0 (una aplicació)
  function H00(t) {
    const a = ri(1, 5), b = ri(2, 5), n = ri(2, 5);
    let c = ri(1, 4); while (c === a) c = ri(1, 4);
    const L = [
      { t: 1, N: `sin(${a}*x)`, D: `${b}*x`, dN: `${a}*cos(${a}*x)`, dD: `${b}`, at: 0, v: a / b, vt: F(a, b) },
      { t: 1, N: `e^(${a}*x)-1`, D: `${b}*x`, dN: `${a}*e^(${a}*x)`, dD: `${b}`, at: 0, v: a / b, vt: F(a, b) },
      { t: 1, N: `x^2-${a * a}`, D: `x-${a}`, dN: '2*x', dD: '1', at: a, v: 2 * a },
      { t: 1, N: `x^${n}-1`, D: 'x-1', dN: `${n}*x^${n - 1}`, dD: '1', at: 1, v: n },
      { t: 2, N: `ln(1+${a}*x)`, D: `${b}*x`, dN: `${a}/(1+${a}*x)`, dD: `${b}`, at: 0, v: a / b, vt: F(a, b) },
      { t: 2, N: `x^3-${a ** 3}`, D: `x-${a}`, dN: '3*x^2', dD: '1', at: a, v: 3 * a * a },
      { t: 2, N: `tan(${a}*x)`, D: `${b}*x`, dN: `${a}/cos(${a}*x)^2`, dD: `${b}`, at: 0, v: a / b, vt: F(a, b) },
      { t: 2, N: `sin(${a}*x)`, D: `sin(${b}*x)`, dN: `${a}*cos(${a}*x)`, dD: `${b}*cos(${b}*x)`, at: 0, v: a / b, vt: F(a, b) },
      { t: 2, N: 'ln(x)', D: 'x-1', dN: '1/x', dD: '1', at: 1, v: 1 },
      { t: 2, N: `x^2-${a + c}*x+${a * c}`, D: `x-${a}`, dN: `2*x-${a + c}`, dD: '1', at: a, v: a - c },
      { t: 3, N: `e^(${a}*x)-e^(${c}*x)`, D: 'x', dN: `${a}*e^(${a}*x)-${c}*e^(${c}*x)`, dD: '1', at: 0, v: a - c },
      { t: 3, N: `sqrt(1+${a}*x)-1`, D: 'x', dN: `${a}/(2*sqrt(1+${a}*x))`, dD: '1', at: 0, v: a / 2, vt: F(a, 2) },
      { t: 3, N: `1-e^(${a}*x)`, D: `sin(${b}*x)`, dN: `-${a}*e^(${a}*x)`, dD: `${b}*cos(${b}*x)`, at: 0, v: -a / b, vt: F(-a, b) },
      { t: 3, N: `${a}*x-sin(${a}*x)`, D: `x^2`, dN: `${a}-${a}*cos(${a}*x)`, dD: '2*x', at: 0, v: 0, twice: true },
    ];
    return pick(L.filter(o => (t === 3 ? true : o.t <= t) && !o.twice));
  }
  const fracS = (N, D) => `(${N})/(${D})`;
  function h00(t) {
    const o = H00(t);
    const src = fracS(o.N, o.D);
    return LIM(limL(o.at, T(src)), N(o.v, o.vt), R`Substituint surt $\frac00$. Per l'Hôpital: $\displaystyle\lim_{x\to${o.at}}\frac{${T(o.dN)}}{${T(o.dD)}}$, i ara substituint $x=${o.at}$ surt $${o.vt ?? NT(o.v)}$.`, { src, at: o.at });
  }
  function hStep(t) {
    const o = pick([H00(t), H00(t), HINF(t)].filter(x => x.dN));
    const src = fracS(o.N, o.D);
    const ans = fracS(o.dN, o.dD);
    return EX(R`Aplica l'Hôpital <b>una vegada</b> a $\displaystyle\lim_{x\to ${atTeX(o.at)}} ${T(src)}$: escriu el quocient $\frac{f'(x)}{g'(x)}$ (sense calcular el límit).`, ans,
      R`Es deriven <b>per separat</b> numerador i denominador (no és la regla del quocient!): $f'=${T(o.dN)}$, $g'=${T(o.dD)}$.`, { pts: POS, testN: o.N, testD: o.D });
  }
  function hTwice(t) {
    const a = ri(1, 4), b = ri(2, 5);
    const L = [
      { t: 1, s: `(1-cos(${a}*x))/x^2`, at: 0, v: a * a / 2, st: [R`\frac{${a}\sin(${a}x)}{2x}`, R`\frac{${a * a}\cos(${a}x)}{2}`] },
      { t: 1, s: `(e^(${a}*x)-1-${a}*x)/x^2`, at: 0, v: a * a / 2, st: [R`\frac{${a}e^{${a}x}-${a}}{2x}`, R`\frac{${a * a}e^{${a}x}}{2}`] },
      { t: 2, s: `(cos(${a}*x)-1)/(${b}*x^2)`, at: 0, v: -a * a / (2 * b), st: [R`\frac{-${a}\sin(${a}x)}{${2 * b}x}`, R`\frac{-${a * a}\cos(${a}x)}{${2 * b}}`] },
      { t: 2, s: '(ln(1+x)-x)/x^2', at: 0, v: -1 / 2, st: [R`\frac{\frac{1}{1+x}-1}{2x}`, R`\frac{-\frac{1}{(1+x)^2}}{2}`] },
      { t: 2, s: '(e^x+e^(-x)-2)/x^2', at: 0, v: 1, st: [R`\frac{e^x-e^{-x}}{2x}`, R`\frac{e^x+e^{-x}}{2}`] },
      { t: 3, s: '(x-sin(x))/x^3', at: 0, v: 1 / 6, st: [R`\frac{1-\cos x}{3x^2}`, R`\frac{\sin x}{6x}`, R`\frac{\cos x}{6}`] },
      { t: 3, s: '(tan(x)-x)/x^3', at: 0, v: 1 / 3, st: [R`\frac{\frac{1}{\cos^2x}-1}{3x^2}=\frac{\tan^2x}{3x^2}=\frac13\left(\frac{\tan x}{x}\right)^2`, R`\frac13\cdot1^2`] },
      { t: 3, s: `(e^(${a}*x)-1-sin(${a}*x))/x^2`, at: 0, v: a * a / 2, st: [R`\frac{${a}e^{${a}x}-${a}\cos(${a}x)}{2x}`, R`\frac{${a * a}e^{${a}x}+${a * a}\sin(${a}x)}{2}`] },
      { t: 3, s: 'x*sin(x)/(1-cos(x))', at: 0, v: 2, st: [R`\frac{\sin x+x\cos x}{\sin x}`, R`\frac{2\cos x-x\sin x}{\cos x}`] },
      { t: 3, s: `(${a}*x-sin(${a}*x))/x^3`, at: 0, v: a ** 3 / 6, st: [R`\frac{${a}-${a}\cos(${a}x)}{3x^2}`, R`\frac{${a * a}\sin(${a}x)}{6x}`, R`\frac{${a ** 3}\cos(${a}x)}{6}`] },
    ];
    const o = pick(L.filter(x => x.t === t || (t === 3 && x.t === 2 && Math.random() < 0.3)).concat(L.filter(x => x.t === t)));
    const steps = o.st.map((s, i) => `${i + 1}a aplicació: $${s}$${i < o.st.length - 1 ? ' (encara $\\frac00$)' : ''}`).join('<br>');
    return LIM(limL(o.at, T(o.s)), N(o.v), `És $\\frac00$.<br>${steps}<br>Substituint $x=0$: $${NT(o.v)}$.`, { src: o.s, at: o.at });
  }
  function HINF(t) {
    const a = ri(1, 3), b = ri(2, 6), n = ri(1, 3);
    const L = [
      { t: 1, N: 'ln(x)', D: n === 1 ? 'x' : `x^${n}`, dN: '1/x', dD: n === 1 ? '1' : `${n}*x^${n - 1}`, lim: N(0), w: R`Queda $\frac{1/x}{${n === 1 ? '1' : `${n}x^{${n - 1}}`}}=\frac{1}{${n === 1 ? '' : n}x^{${n}}}\to0$. El logaritme creix més lent que qualsevol potència.` },
      { t: 1, N: n === 1 ? 'x' : `x^${n}`, D: `e^(${a}*x)`, dN: n === 1 ? '1' : `${n}*x^${n - 1}`, dD: `${a}*e^(${a}*x)`, lim: N(0), w: R`Aplicant l'Hôpital ${n} cop${n > 1 ? 's' : ''} el numerador es fa constant i a baix queda una exponencial $\to\infty$: límit $0$. L'exponencial guanya a qualsevol potència.` },
      { t: 1, N: `e^(${a}*x)`, D: n === 1 ? 'x' : `x^${n}`, dN: `${a}*e^(${a}*x)`, dD: n === 1 ? '1' : `${n}*x^${n - 1}`, lim: INF, w: R`Després de ${n} aplicació${n > 1 ? 'ns' : ''} a dalt hi ha $e^{${a}x}\to\infty$ i a baix una constant: $+\infty$.` },
      { t: 2, N: 'x', D: 'ln(x)', dN: '1', dD: '1/x', lim: INF, w: R`$\frac{1}{1/x}=x\to+\infty$.` },
      { t: 2, N: 'ln(x)^2', D: 'x', dN: '2*ln(x)/x', dD: '1', lim: N(0), w: R`$\frac{2\ln x}{x}$, que torna a ser $\frac\infty\infty$; una altra vegada: $\frac{2/x}{1}\to0$.` },
      { t: 2, N: `ln(${b}*x)`, D: 'ln(x)', dN: '1/x', dD: '1/x', lim: N(1), w: R`$(\ln(${b}x))'=\frac{${b}}{${b}x}=\frac1x$: el quocient de derivades és $1$.` },
      { t: 3, N: 'e^x+x', D: 'e^x+1', dN: 'e^x+1', dD: 'e^x', lim: N(1), w: R`$\frac{e^x+1}{e^x}=1+e^{-x}\to1$.` },
      { t: 3, N: `-e^(${a}*x)`, D: `x^${n + 1}`, dN: `-${a}*e^(${a}*x)`, dD: `${n + 1}*x^${n}`, lim: NINF, w: R`L'exponencial guanya i el signe és negatiu: $-\infty$.` },
      { t: 3, N: `x^${n}*ln(x)`, D: `x^${n + 1}`, dN: n === 1 ? 'ln(x)+1' : `${xp(n - 1)}*(${n}*ln(x)+1)`, dD: `${n + 1}*x^${n}`, lim: N(0), w: R`Simplificant és $\frac{\ln x}{x}\to0$.` },
    ];
    const o = pick(L.filter(x => x.t <= t));
    return { ...o, at: I };
  }
  function hInf(t) {
    const o = HINF(t);
    const src = fracS(o.N, o.D);
    return LIM(limL('+\\infty', T(src)), o.lim, `És $\\frac{\\infty}{\\infty}$. L'Hôpital: $\\frac{${T(o.dN)}}{${T(o.dD)}}$. ${o.w}`, { src, at: I });
  }
  function hProd(t) {
    const a = ri(2, 5), n = ri(1, 3);
    const L = [
      { t: 1, s: 'x*ln(x)', at: '0+', lim: N(0), w: R`$x\ln x=\frac{\ln x}{1/x}$ ($\frac{\infty}{\infty}$). L'Hôpital: $\frac{1/x}{-1/x^2}=-x\to0$.` },
      { t: 1, s: `x^${n}*e^(-x)`, at: I, lim: N(0), w: R`$x^{${n}}e^{-x}=\frac{x^{${n}}}{e^x}$ ($\frac\infty\infty$): l'exponencial guanya, $0$.` },
      { t: 2, s: `x^${n + 1}*ln(x)`, at: '0+', lim: N(0), w: R`$\frac{\ln x}{x^{-${n + 1}}}$; L'Hôpital: $\frac{1/x}{-${n + 1}x^{-${n + 2}}}=-\frac{x^{${n + 1}}}{${n + 1}}\to0$.` },
      { t: 2, s: `x*sin(${a}/x)`, at: I, lim: N(a), w: R`$x\sin(${a}/x)=\frac{\sin(${a}/x)}{1/x}$ ($\frac00$). L'Hôpital: $\frac{\cos(${a}/x)\cdot(-${a}/x^2)}{-1/x^2}=${a}\cos(${a}/x)\to${a}$.` },
      { t: 2, s: `x*(e^(${a}/x)-1)`, at: I, lim: N(a), w: R`$\frac{e^{${a}/x}-1}{1/x}$ ($\frac00$). L'Hôpital: $\frac{e^{${a}/x}\cdot(-${a}/x^2)}{-1/x^2}=${a}e^{${a}/x}\to${a}$.` },
      { t: 3, s: `x*ln(1+${a}/x)`, at: I, lim: N(a), w: R`$\frac{\ln(1+${a}/x)}{1/x}$ ($\frac00$). L'Hôpital: $\frac{\frac{-${a}/x^2}{1+${a}/x}}{-1/x^2}=\frac{${a}}{1+${a}/x}\to${a}$.` },
      { t: 3, s: 'sqrt(x)*ln(x)', at: '0+', lim: N(0), w: R`$\frac{\ln x}{x^{-1/2}}$; L'Hôpital: $\frac{1/x}{-\frac12x^{-3/2}}=-2\sqrt x\to0$.` },
      { t: 3, s: `sin(${a}*x)*ln(x)`, at: '0+', lim: N(0), w: R`$\sin(${a}x)\sim ${a}x$, i $x\ln x\to0$. (Amb l'Hôpital: $\frac{\ln x}{1/\sin(${a}x)}$.)` },
    ];
    const o = pick(L.filter(x => x.t <= t));
    return LIM(limL(atTeX(o.at), T(o.s)), o.lim, `És $0\\cdot\\infty$: es passa a quocient. ${o.w}`, { src: o.s, at: atNum(o.at), side: o.at === '0+' ? 1 : 0 });
  }
  function hDiff(t) {
    const a = ri(1, 6), b = ri(1, 6);
    const L = [
      { t: 1, s: '1/x-1/(e^x-1)', at: 0, lim: N(1 / 2), w: R`Denominador comú: $\frac{e^x-1-x}{x(e^x-1)}$ ($\frac00$). L'Hôpital: $\frac{e^x-1}{e^x-1+xe^x}$ (encara $\frac00$). Un altre cop: $\frac{e^x}{2e^x+xe^x}\to\frac12$.` },
      { t: 1, s: `sqrt(x^2+${a}*x)-x`, at: I, lim: N(a / 2, F(a, 2)), w: R`Multiplicant pel conjugat: $\frac{${a}x}{\sqrt{x^2+${a}x}+x}=\frac{${a}}{\sqrt{1+${a}/x}+1}\to\frac{${a}}{2}$.` },
      { t: 2, s: '1/x-1/sin(x)', at: 0, lim: N(0), w: R`$\frac{\sin x-x}{x\sin x}$ ($\frac00$). L'Hôpital: $\frac{\cos x-1}{\sin x+x\cos x}$ ($\frac00$). Un altre cop: $\frac{-\sin x}{2\cos x-x\sin x}\to\frac02=0$.` },
      { t: 2, s: '1/ln(x)-1/(x-1)', at: 1, lim: N(1 / 2), w: R`$\frac{x-1-\ln x}{(x-1)\ln x}$ ($\frac00$). L'Hôpital: $\frac{1-1/x}{\ln x+1-1/x}=\frac{x-1}{x\ln x+x-1}$ ($\frac00$). Un altre cop: $\frac{1}{\ln x+2}\to\frac12$.` },
      { t: 3, s: `sqrt(x^2+${a}*x)-sqrt(x^2+${b}*x)`, at: I, lim: N((a - b) / 2, F(a - b, 2)), w: R`Conjugat: $\frac{(${a}-${b})x}{\sqrt{x^2+${a}x}+\sqrt{x^2+${b}x}}\to\frac{${a - b}}{2}$.` },
      { t: 3, s: '1/sin(x)-1/tan(x)', at: 0, lim: N(0), w: R`$\frac{1-\cos x}{\sin x}$ ($\frac00$). L'Hôpital: $\frac{\sin x}{\cos x}\to0$.` },
      { t: 3, s: 'x-ln(x)', at: I, lim: INF, w: R`Factor comú: $x\left(1-\frac{\ln x}{x}\right)$, i $\frac{\ln x}{x}\to0$: queda $\infty\cdot1=+\infty$.` },
      { t: 3, s: '1/(e^x-1)-1/x', at: 0, lim: N(-1 / 2), w: R`És el contrari de $\frac1x-\frac1{e^x-1}$, que val $\frac12$: el límit és $-\frac12$.` },
    ];
    const o = pick(L.filter(x => x.t <= t));
    return LIM(limL(atTeX(o.at), T(o.s)), o.lim, `És $\\infty-\\infty$: cal ajuntar-ho en una fracció (o multiplicar pel conjugat). ${o.w}`, { src: o.s, at: o.at });
  }
  function hExp(t) {
    const a = ri(1, 4), b = ri(2, 3);
    const eT = k => (k === 1 ? 'e' : k === 0 ? '1' : Number.isInteger(k) ? `e^{${k}}` : `e^{${NT(k)}}`);
    const L = [
      { t: 1, s: `(1+${a}/x)^x`, at: I, k: a, w: R`$\ln L=\lim x\ln(1+${a}/x)=${a}$ (és el $0\cdot\infty$ d'abans).` },
      { t: 1, s: `(1+${a}*x)^(1/x)`, at: 0, k: a, w: R`$\ln L=\lim\frac{\ln(1+${a}x)}{x}$ ($\frac00$), L'Hôpital: $\frac{${a}/(1+${a}x)}{1}\to${a}$.` },
      { t: 1, s: 'x^x', at: '0+', k: 0, w: R`$\ln L=\lim x\ln x=0$.` },
      { t: 2, s: 'x^(1/x)', at: I, k: 0, w: R`$\ln L=\lim\frac{\ln x}{x}=0$.` },
      { t: 2, s: `(1+${a}/x)^(${b}*x)`, at: I, k: a * b, w: R`$\ln L=\lim ${b}x\ln(1+${a}/x)=${b}\cdot${a}=${a * b}$.` },
      { t: 2, s: `(1-${a}/x)^x`, at: I, k: -a, w: R`$\ln L=\lim x\ln(1-${a}/x)=-${a}$.` },
      { t: 3, s: `cos(${a}*x)^(1/x^2)`, tex: R`\left(\cos ${a === 1 ? '' : a}x\right)^{1/x^2}`, at: 0, k: -a * a / 2, w: R`$\ln L=\lim\frac{\ln\cos(${a}x)}{x^2}$ ($\frac00$). L'Hôpital: $\frac{-${a}\tan(${a}x)}{2x}\to-\frac{${a * a}}{2}$.` },
      { t: 3, s: 'x^(sin(x))', at: '0+', k: 0, w: R`$\ln L=\lim\sin x\ln x=\lim\frac{\ln x}{1/\sin x}$; com que $\sin x\sim x$, és com $x\ln x\to0$.` },
      { t: 3, s: `(1+sin(${a}*x))^(1/x)`, at: 0, k: a, w: R`$\ln L=\lim\frac{\ln(1+\sin(${a}x))}{x}$ ($\frac00$). L'Hôpital: $\frac{${a}\cos(${a}x)}{1+\sin(${a}x)}\to${a}$.` },
    ];
    const o = pick(L.filter(x => x.t <= t));
    return LIM(limL(atTeX(o.at), o.tex || T(o.s), R`. Pots escriure potències de $e$ com <code>e^2</code> o <code>e^(-1/2)</code>.`), N(Math.exp(o.k), eT(o.k)),
      R`Indeterminació exponencial: escriu $L=e^{\lim g\ln f}$ (o pren logaritmes). ${o.w} Per tant $L=${eT(o.k)}$.`, { src: o.s, at: atNum(o.at), side: o.at === '0+' ? 1 : 0 });
  }

  /* =========================================================
     E. EQUACIONS I SIGNES
     ========================================================= */
  const R3 = () => shuffle([-3, -2, -1, 1, 2, 3, 0, 4]);
  function eRoots(t) {
    if (t === 1) {
      const k = pick([0, 1, 2]);
      if (k === 0) { const a = nz(-4, 4), b = nz(-6, 6); return LST(`Resol $${M.polyTeX([0, b, a])}=0$`, [[0, '0'], [-b / a, F(-b, a)]], R`Factor comú: $x(${M.polyTeX([b, a])})=0$, per tant $x=0$ o $x=${F(-b, a)}$.`); }
      if (k === 1) { const r = ri(1, 6); return LST(`Resol $${M.polyTeX([-r * r, 0, 1])}=0$`, [[r], [-r]], R`$x^2=${r * r}\Rightarrow x=\pm${r}$.`); }
      const [r, s] = R3();
      return LST(`Resol $${M.polyTeX(M.polyMul([-r, 1], [-s, 1]))}=0$`, r === s ? [[r]] : [[r], [s]], R`Fórmula de segon grau (o busca dos números que sumin $${r + s}$ i multipliquin $${r * s}$): $x=${r}$, $x=${s}$.`);
    }
    if (t === 2) {
      const k = pick([0, 1, 2]);
      if (k === 0) { const a = nz(-3, 3); const [r, s] = R3(); const c = M.polyMul([-r, 1], [-s, 1]).map(v => v * a); return LST(`Resol $${M.polyTeX(c)}=0$`, r === s ? [[r]] : [[r], [s]], R`Divideix per $${a}$ i aplica la fórmula: $x=${r}$, $x=${s}$.`); }
      if (k === 1) { const r = ri(1, 2), s = r + ri(1, 2); const c = [r * r * s * s, 0, -(r * r + s * s), 0, 1]; return LST(`Resol $${M.polyTeX(c)}=0$`, [[r], [-r], [s], [-s]], R`Biquadrada: amb $t=x^2$ queda $t^2-${r * r + s * s}t+${r * r * s * s}=0$, $t=${r * r}$ o $t=${s * s}$, i $x=\pm${r}$, $x=\pm${s}$.`); }
      const kk = pick([2, 3, 5, 6, 7]); const a = nz(-3, 3);
      return LST(`Resol $${M.polyTeX([0, -kk * a, 0, a])}=0$`, [[0, '0'], [Math.sqrt(kk), `\\sqrt{${kk}}`], [-Math.sqrt(kk), `-\\sqrt{${kk}}`]], R`Factor comú: $${a === 1 ? '' : a === -1 ? '-' : a}x(x^2-${kk})=0$, per tant $x=0$ o $x=\pm\sqrt{${kk}}$.`);
    }
    const k = pick([0, 1, 2]);
    if (k === 0) { const [r, s, u] = R3(); const c = M.polyMul(M.polyMul([-r, 1], [-s, 1]), [-u, 1]); const roots = [...new Set([r, s, u])].map(v => [v]); return LST(`Resol $${M.polyTeX(c)}=0$`, roots, R`Ruffini: prova divisors del terme independent. Arrels: $${[r, s, u].join(',\\,')}$.`); }
    if (k === 1) { const p = nz(-3, 3), m = pick([2, 3, 5]); return LST(`Resol $${M.polyTeX([p * p - m, -2 * p, 1])}=0$`, [M.surd(p, 1, m, 1), M.surd(p, -1, m, 1)], R`$x=\frac{${2 * p}\pm\sqrt{${4 * p * p}-${4 * (p * p - m)}}}{2}=${p}\pm\sqrt{${m}}$.`); }
    const p = ri(-2, 2), q = ri(1, 4); return LST(`Resol $${M.polyTeX([p * p + q, -2 * p, 1])}=0$ (escriu «cap» si no té solucions reals)`, [], R`El discriminant és $${4 * p * p}-${4 * (p * p + q)}=${-4 * q}\lt 0$: no hi ha solucions reals.`);
  }
  function signIvs(points, g, lo = -I) {
    const ends = [end(lo), ...points, end(I)];
    const out = [];
    for (let i = 0; i < ends.length - 1; i++) {
      const a = ends[i], b = ends[i + 1];
      const tt = !isFinite(a.v) && !isFinite(b.v) ? 0.123 : !isFinite(a.v) ? b.v - 1 : !isFinite(b.v) ? a.v + 1 : (a.v + b.v) / 2;
      out.push({ a, b, s: Math.sign(g(tt)) });
    }
    return out;
  }
  const facTeX = (r, m = 1) => { const b = r === 0 ? 'x' : r > 0 ? `(x-${r})` : `(x+${-r})`; return m === 1 ? b : r === 0 ? `x^{${m}}` : `${b}^{${m}}`; };
  function eSign(t) {
    const roots = shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, t === 1 ? 2 : 3).sort((a, b) => a - b);
    const mult = roots.map(() => 1);
    if (t === 3) mult[ri(0, roots.length - 1)] = 2;
    const s = pick([1, -1]);
    const extra = t === 3 && Math.random() < 0.4 ? '(x^2+1)' : '';
    const g = x => s * roots.reduce((p, r, i) => p * (x - r) ** mult[i], 1);
    const tex = (s < 0 ? '-' : '') + roots.map((r, i) => facTeX(r, mult[i])).join('') + extra;
    const want = pick([1, -1]);
    const ivs = signIvs(roots.map(r => end(r)), g).filter(iv => iv.s === want).map(({ a, b }) => ({ a, b }));
    return IVL(`On és $P(x)${want > 0 ? '>' : '\\lt'}0$, si $P(x)=${tex}$?`, ivs,
      R`Arrels: $${roots.join(',\\,')}$. Fes la taula de signes${mult.includes(2) ? ' (al factor al quadrat el signe <b>no</b> canvia)' : ''}${extra ? ' ($x^2+1>0$ sempre)' : ''}, començant per la dreta amb el signe del coeficient principal.`);
  }

  /* =========================================================
     F. EXTREMS RELATIUS I ESTUDI
     ========================================================= */
  // Famílies de funcions amb tota la informació d'extrems
  const sgnS = (a) => (a < 0 ? '-' : '');
  function FAM(name, t) {
    const pos = { v: 0, tex: '0' };
    switch (name) {
      case 'xexp': { // x e^{ax}
        const a = pick(t === 1 ? [1, -1] : [1, -1, 2, -2, 3, -3]);
        const c = -1 / a, A = Math.abs(a);
        return { f: `x*e^(${a}*x)`.replace('(1*x)', '(x)').replace('(-1*x)', '(-x)'), df: `(1+${a}*x)*e^(${a}*x)`, dfTeX: R`(1${a > 0 ? '+' : '-'}${A === 1 ? '' : A}x)\,e^{${a === 1 ? '' : a === -1 ? '-' : a}x}`,
          crit: [{ v: c, tex: F(-1, a) }], y: { [c]: R`${a > 0 ? '-' : ''}\frac{1}{${A === 1 ? '' : A}e}` }, dom: 'R', lims: { '-inf': a > 0 ? N(0) : NINF, inf: a > 0 ? INF : N(0) } };
      }
      case 'x2exp': { // x^2 e^{ax}
        const a = pick([1, -1, 2, -2]);
        const c = -2 / a, g = M.gcd(4, a * a);
        const yt = `\\frac{${4 / g}}{${a * a / g === 1 ? '' : a * a / g}e^{2}}`;
        return { f: `x^2*e^(${a}*x)`.replace('(1*x)', '(x)').replace('(-1*x)', '(-x)'), df: `x*(2+${a}*x)*e^(${a}*x)`, dfTeX: R`x\,(2${a > 0 ? '+' : '-'}${Math.abs(a) === 1 ? '' : Math.abs(a)}x)\,e^{${a === 1 ? '' : a === -1 ? '-' : a}x}`,
          crit: [{ v: 0, tex: '0' }, { v: c, tex: F(-2, a) }], y: { 0: '0', [c]: yt }, dom: 'R', lims: { '-inf': a > 0 ? N(0) : INF, inf: a > 0 ? INF : N(0) } };
      }
      case 'lnx': { // ln x / x^n
        const n = pick([1, 2]);
        return { f: n === 1 ? 'ln(x)/x' : 'ln(x)/x^2', df: `(1-${n}*ln(x))/x^${n + 1}`, dfTeX: R`\frac{1-${n === 1 ? '' : n}\ln x}{x^{${n + 1}}}`,
          crit: [{ v: Math.exp(1 / n), tex: lnTeX(n) }], y: { [Math.exp(1 / n)]: n === 1 ? '\\frac{1}{e}' : '\\frac{1}{2e}' }, dom: 'pos', lims: { '0+': NINF, inf: N(0) } };
      }
      case 'rat': { // x/(x^2+a^2)
        const a = ri(1, 3);
        return { f: `x/(x^2+${a * a})`, df: `(${a * a}-x^2)/(x^2+${a * a})^2`, dfTeX: R`\frac{${a * a}-x^2}{(x^2+${a * a})^2}`,
          crit: [{ v: -a, tex: String(-a) }, { v: a, tex: String(a) }], y: { [-a]: F(-1, 2 * a), [a]: F(1, 2 * a) }, dom: 'R', lims: { '-inf': N(0), inf: N(0) } };
      }
      case 'xlnx': { // x^n ln x
        const n = pick([1, 2]);
        const c = Math.exp(-1 / n);
        return { f: n === 1 ? 'x*ln(x)' : 'x^2*ln(x)', df: n === 1 ? 'ln(x)+1' : 'x*(2*ln(x)+1)', dfTeX: n === 1 ? R`\ln x+1` : R`x\,(2\ln x+1)`,
          crit: [{ v: c, tex: n === 1 ? '\\frac{1}{e}' : '\\frac{1}{\\sqrt{e}}' }], y: { [c]: n === 1 ? '-\\frac{1}{e}' : '-\\frac{1}{2e}' }, dom: 'pos', lims: { '0+': N(0), inf: INF } };
      }
      case 'xinv': { // x + a^2/x
        const a = ri(1, 3);
        return { f: `x+${a * a}/x`, df: `1-${a * a}/x^2`, dfTeX: R`1-\frac{${a * a}}{x^2}=\frac{x^2-${a * a}}{x^2}`,
          crit: [{ v: -a, tex: String(-a) }, { v: a, tex: String(a) }], y: { [-a]: String(-2 * a), [a]: String(2 * a) }, dom: 'nz', lims: { '-inf': NINF, inf: INF, '0+': INF } };
      }
      case 'gauss': { // x e^{-x^2/2}
        return { f: 'x*e^(-x^2/2)', df: '(1-x^2)*e^(-x^2/2)', dfTeX: R`(1-x^2)\,e^{-x^2/2}`,
          crit: [{ v: -1, tex: '-1' }, { v: 1, tex: '1' }], y: { '-1': '-\\frac{1}{\\sqrt{e}}', 1: '\\frac{1}{\\sqrt{e}}' }, dom: 'R', lims: { '-inf': N(0), inf: N(0) } };
      }
      case 'bell': { // e^{-a x^2}
        const a = ri(1, 3);
        return { f: `e^(-${a}*x^2)`.replace('-1*', '-'), df: `-${2 * a}*x*e^(-${a}*x^2)`.replace('-1*x^2', '-x^2'), dfTeX: R`-${2 * a}x\,e^{-${a === 1 ? '' : a}x^2}`,
          crit: [pos], y: { 0: '1' }, dom: 'R', lims: { '-inf': N(0), inf: N(0) } };
      }
      case 'cubic': { // 2x^3 - 3(r+s)x^2 + 6rs x + d   (f' = 6(x-r)(x-s))
        let r, s; do { r = ri(-3, 2); s = ri(r + 1, 3); } while (s === r);
        const sg = pick([1, -1]), d = ri(-3, 3);
        const c = [d, 6 * r * s * sg, -3 * (r + s) * sg, 2 * sg];
        const dc = M.polyDer(c);
        return { f: polyS(c), fTeX: M.polyTeX(c), df: polyS(dc), dfTeX: R`${sg * 6 === 6 ? '6' : '-6'}${facTeX(r)}${facTeX(s)}`, poly: c,
          crit: [{ v: r, tex: String(r) }, { v: s, tex: String(s) }], y: { [r]: String(M.polyEval(c, r)), [s]: String(M.polyEval(c, s)) }, dom: 'R',
          lims: { '-inf': sg > 0 ? NINF : INF, inf: sg > 0 ? INF : NINF } };
      }
      case 'quartic': { // 3x^4 - 4(r+s)x^3 + 6rs x^2   (f' = 12x(x-r)(x-s))
        let r, s; do { r = nz(-2, 2); s = nz(-2, 3); } while (s === r);
        if (r > s) [r, s] = [s, r];
        const c = [0, 0, 6 * r * s, -4 * (r + s), 3];
        const roots = [0, r, s].sort((p, q) => p - q);
        return { f: polyS(c), fTeX: M.polyTeX(c), df: polyS(M.polyDer(c)), dfTeX: R`12${facTeX(0)}${facTeX(r)}${facTeX(s)}`, poly: c,
          crit: roots.map(v => ({ v, tex: String(v) })), y: Object.fromEntries(roots.map(v => [v, String(M.polyEval(c, v))])), dom: 'R', lims: { '-inf': INF, inf: INF } };
      }
    }
  }
  const FAMS = { 1: ['xexp', 'rat', 'bell', 'cubic'], 2: ['x2exp', 'lnx', 'xinv', 'cubic', 'xexp'], 3: ['xlnx', 'gauss', 'x2exp', 'lnx', 'quartic', 'xinv'] };
  function analyse(fm) {
    const dfA = P(fm.df), df = x => M.ev(dfA, x), fA = P(fm.f), f = x => M.ev(fA, x);
    const pts = fm.crit.slice().sort((a, b) => a.v - b.v);
    const bps = pts.map(p => end(p.v, p.tex));
    if (fm.dom === 'nz') { bps.push(end(0, '0')); bps.sort((a, b) => a.v - b.v); }
    const ivs = signIvs(bps, df, fm.dom === 'pos' ? 0 : -I);
    const inc = ivs.filter(iv => iv.s > 0).map(({ a, b }) => ({ a, b }));
    const dec = ivs.filter(iv => iv.s < 0).map(({ a, b }) => ({ a, b }));
    const max = [], min = [];
    for (const p of pts) {
      const l = Math.sign(df(p.v - 1e-4)), r = Math.sign(df(p.v + 1e-4));
      const e = { ...p, y: f(p.v), ytex: fm.y[p.v] ?? NT(f(p.v)) };
      if (l > 0 && r < 0) max.push(e); else if (l < 0 && r > 0) min.push(e);
    }
    const d2 = x => (df(x + 1e-5) - df(x - 1e-5)) / 2e-5;
    return { f, df, d2, ivs, inc, dec, max, min, pts };
  }
  const famLabel = fm => `$f(x)=${fm.fTeX || T(fm.f)}$${fm.dom === 'pos' ? ' (definida per a $x>0$)' : fm.dom === 'nz' ? ' (definida per a $x\\neq0$)' : ''}`;
  const famPts = fm => (fm.dom === 'pos' ? POS : undefined);
  function xCrit(t) {
    const fm = FAM(pick(FAMS[t]), t);
    return LST(`Troba els punts crítics ($f'(x)=0$) de ${famLabel(fm)}`, fm.crit.map(c => [c.v, c.tex]), R`$f'(x)=${fm.dfTeX}$. ${fm.dfTeX.includes('e^') ? R`Com que $e^{(\dots)}>0$ sempre, només cal anul·lar l'altre factor.` : ''} Solucions: $${fm.crit.map(c => c.tex).join(',\\;')}$.`);
  }
  function xMono(t) {
    const fm = FAM(pick(FAMS[t]), t), A = analyse(fm);
    const up = Math.random() < 0.5;
    return IVL(`On és <b>${up ? 'creixent' : 'decreixent'}</b> ${famLabel(fm)}?`, up ? A.inc : A.dec,
      R`$f'(x)=${fm.dfTeX}$. Signe de $f'$ als intervals: ${A.ivs.map(iv => `$(${iv.a.tex},${iv.b.tex})$: ${iv.s > 0 ? '+' : '−'}`).join('; ')}. ${up ? 'Creix on $f\'>0$' : 'Decreix on $f\'\\lt 0$'}.`);
  }
  const KIND = ['Màxim relatiu', 'Mínim relatiu', 'Ni màxim ni mínim'];
  function xFirst(t) {
    const roots = shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, t === 1 ? 2 : 3).sort((a, b) => a - b);
    const mult = roots.map(() => 1);
    if (t >= 2) mult[ri(0, roots.length - 1)] = t === 3 ? pick([2, 3]) : 2;
    const s = pick([1, -1]);
    const extra = t === 3 ? pick(['e^x', '(x^2+1)', '']) : '';
    const g = x => s * roots.reduce((p, r, i) => p * (x - r) ** mult[i], 1);
    const i = ri(0, roots.length - 1), c = roots[i];
    const l = Math.sign(g(c - 0.01)), r = Math.sign(g(c + 0.01));
    const ans = l > 0 && r < 0 ? 0 : l < 0 && r > 0 ? 1 : 2;
    const tex = (s < 0 ? '-' : '') + roots.map((rr, j) => facTeX(rr, mult[j])).join('') + (extra === 'e^x' ? 'e^{x}' : extra);
    return MC(`La derivada d'una funció és $f'(x)=${tex}$. Què té $f$ a $x=${c}$?`, KIND, ans,
      R`Signe de $f'$ just a l'esquerra de $${c}$: ${l > 0 ? '+' : '−'}; just a la dreta: ${r > 0 ? '+' : '−'}. ${ans === 0 ? 'Passa de créixer a decréixer: màxim.' : ans === 1 ? 'Passa de decréixer a créixer: mínim.' : 'No canvia de signe (factor amb exponent parell): ni màxim ni mínim.'}`);
  }
  const SECOND = [R`Mínim relatiu, perquè $f''(c)>0$`, R`Màxim relatiu, perquè $f''(c)\lt 0$`, R`El criteri no decideix, perquè $f''(c)=0$`];
  function xSecond(t) {
    if (t === 3 && Math.random() < 0.3) {
      const k = pick([3, 4]), a = nz(-3, 3);
      return MC(`$f(x)=${M.polyTeX([0, 0, 0, 0, 0].map((_, i) => (i === k ? a : 0)))}$ té $f'(0)=0$. Què diu el criteri de la <b>segona derivada</b> a $c=0$?`, SECOND, 2,
        R`$f''(x)=${a * k * (k - 1)}x^{${k - 2}}$, i $f''(0)=0$: el criteri no diu res. (Caldria mirar el signe de $f'$.)`);
    }
    const fm = FAM(pick(FAMS[t]), t), A = analyse(fm);
    const p = pick(A.pts);
    const v = A.d2(p.v);
    const ans = Math.abs(v) < 1e-6 ? 2 : v > 0 ? 0 : 1;
    return MC(`${famLabel(fm)} té un punt crític a $c=${p.tex}$. Què diu el criteri de la <b>segona derivada</b>?`, SECOND, ans,
      R`$f'(x)=${fm.dfTeX}$. Derivant un altre cop i substituint, $f''(${p.tex})\approx${+v.toFixed(3)}$ ${ans === 0 ? '> 0: mínim (forma de vall).' : ans === 1 ? '< 0: màxim (forma de muntanya).' : '= 0.'}`);
  }
  function xValue(t) {
    let fm, A;
    do { fm = FAM(pick(FAMS[t]), t); A = analyse(fm); } while (!A.max.length && !A.min.length);
    const isMax = A.max.length && (!A.min.length || Math.random() < 0.5);
    const list = isMax ? A.max : A.min;
    const e = t === 1 ? pick(list) : list[list.length - 1];
    const where = t === 1 ? ` a $x=${e.tex}$` : list.length > 1 ? " (si n'hi ha més d'un, el de més a la dreta)" : '';
    return VAL(`${famLabel(fm)} té un <b>${isMax ? 'màxim' : 'mínim'} relatiu</b>${where}. Quant val $f$ en aquest punt?`, e.y, e.ytex,
      R`$f'(x)=${fm.dfTeX}$, punts crítics $${fm.crit.map(c => c.tex).join(',\,')}$. ${isMax ? 'Màxim' : 'Mínim'} a $x=${e.tex}$, i $f(${e.tex})=${e.ytex}$.`);
  }
  function xInfl(t) {
    const opts = {
      1: [() => { const a = pick([1, -1, 2]), p = ri(-2, 2); const c = [ri(-3, 3), ri(-5, 5), -3 * a * p, a]; return { c, pts: [[p]], w: R`$f''(x)=${M.polyTeX(M.polyDer(M.polyDer(c)))}$, s'anul·la a $x=${p}$ i hi canvia de signe.` }; }],
      2: [() => { const k = ri(1, 3), a = pick([1, -1]); const c = [0, 0, -6 * k * k * a, 0, a]; return { c, pts: [[k], [-k]], w: R`$f''(x)=${M.polyTeX(M.polyDer(M.polyDer(c)))}=${12 * a}(x^2-${k * k})$: zeros $\pm${k}$ i canvia de signe.` }; },
        () => { const a = pick([1, -1, 2]); const c = [ri(-2, 2), 0, 0, 0, a]; return { c, pts: [], w: R`$f''(x)=${12 * a}x^2$ s'anul·la a $0$ però <b>no canvia de signe</b>: no hi ha inflexió.` }; }],
      3: [() => ({ s: 'x*e^x', pts: [[-2]], w: R`$f''(x)=(x+2)e^x$: canvia de signe a $x=-2$.` }),
        () => ({ s: 'x*e^(-x)', pts: [[2]], w: R`$f''(x)=(x-2)e^{-x}$: canvia de signe a $x=2$.` }),
        () => ({ s: 'e^(-x^2/2)', pts: [[-1], [1]], w: R`$f''(x)=(x^2-1)e^{-x^2/2}$: zeros $\pm1$.` }),
        () => ({ s: 'x^2*ln(x)', pts: [[Math.exp(-1.5), 'e^{-3/2}']], w: R`$f'(x)=2x\ln x+x$, $f''(x)=2\ln x+3=0\iff x=e^{-3/2}$.`, pos: true })],
    };
    const o = pick(opts[t])();
    const lab = o.c ? M.polyTeX(o.c) : T(o.s);
    return LST(`Troba els punts d'inflexió (les $x$) de $f(x)=${lab}$${o.pos ? ' ($x>0$)' : ''} (o «cap»)`, o.pts, `Inflexió on $f''$ canvia de signe. ${o.w}`);
  }
  function xAbs(t) {
    if (t === 3 && Math.random() < 0.5) {
      const o = pick([
        { s: 'x*e^(-x)', a: 0, b: 3, max: [1 / Math.E, '\\frac1e'], min: [0, '0'], w: R`$f'=(1-x)e^{-x}$, crític $x=1$. Candidats: $f(0)=0$, $f(1)=\frac1e\approx0.37$, $f(3)=\frac3{e^3}\approx0.15$.` },
        { s: 'x^2*e^(-x)', a: -1, b: 3, max: [Math.E, 'e'], min: [0, '0'], w: R`$f'=x(2-x)e^{-x}$, crítics $0,2$. Candidats: $f(-1)=e\approx2.72$, $f(0)=0$, $f(2)=\frac4{e^2}\approx0.54$, $f(3)=\frac9{e^3}\approx0.45$.` },
        { s: 'ln(x)/x', a: 1, b: 9, max: [1 / Math.E, '\\frac1e'], min: [0, '0'], w: R`$f'=\frac{1-\ln x}{x^2}$, crític $x=e$. Candidats: $f(1)=0$, $f(e)=\frac1e\approx0.37$, $f(9)=\frac{\ln9}{9}\approx0.24$.` },
      ]);
      const isMax = Math.random() < 0.5, ans = isMax ? o.max : o.min;
      return VAL(`Quin és el valor <b>${isMax ? 'màxim' : 'mínim'} absolut</b> de $f(x)=${T(o.s)}$ a l'interval $[${o.a},${o.b}]$?`, ans[0], ans[1], `Interval tancat: els extrems absoluts estan als punts crítics de dins o als extrems de l'interval. ${o.w}`);
    }
    const fm = FAM('cubic', t);
    const c = fm.poly, cr = fm.crit.map(p => p.v);
    let a, b;
    do { a = ri(-4, 1); b = ri(a + 2, 4); } while (!cr.some(v => v > a && v < b));
    const cands = [a, ...cr.filter(v => v > a && v < b), b];
    const vals = cands.map(x => M.polyEval(c, x));
    const isMax = Math.random() < 0.5;
    const best = isMax ? Math.max(...vals) : Math.min(...vals);
    return VAL(`Quin és el valor <b>${isMax ? 'màxim' : 'mínim'} absolut</b> de $f(x)=${M.polyTeX(c)}$ a l'interval $[${a},${b}]$?`, best, null,
      R`$f'(x)=${fm.dfTeX}$. Candidats: extrems de l'interval i punts crítics de dins: ${cands.map((x, i) => `$f(${x})=${vals[i]}$`).join(', ')}. El ${isMax ? 'més gran' : 'més petit'} és $${best}$.`);
  }
  function xLimits(t) {
    if (t === 1) {
      const deg = ri(2, 5), a = nz(-4, 4), c = Array.from({ length: deg + 1 }, (_, i) => (i === deg ? a : ri(-5, 5)));
      const toNeg = Math.random() < 0.5;
      const s = Math.sign(a) * (toNeg && deg % 2 ? -1 : 1);
      return LIM(limL(toNeg ? '-\\infty' : '+\\infty', M.polyTeX(c)), s > 0 ? INF : NINF, R`Mana el terme de grau més alt, $${M.polyTeX([0, 0, 0, 0, 0, 0].map((_, i) => (i === deg ? a : 0)))}$${toNeg ? ` (grau ${deg % 2 ? 'senar: canvia el signe' : 'parell: signe positiu'})` : ''}.`);
    }
    const names = t === 2 ? ['xexp', 'x2exp'] : ['lnx', 'xlnx', 'rat', 'xinv', 'x2exp'];
    const fm = FAM(pick(names), t);
    const k = pick(Object.keys(fm.lims));
    const at = k === 'inf' ? '+\\infty' : k === '-inf' ? '-\\infty' : '0^{+}';
    const lim = fm.lims[k];
    return LIM(limL(at, fm.fTeX || T(fm.f)), lim, R`${k === '0+' ? 'Prop de $0$ per la dreta' : 'A l\'infinit'}: ${fm.f.includes('e^') ? 'l\'exponencial mana sobre la potència.' : fm.f.includes('ln') ? 'qualsevol potència de $x$ mana sobre el logaritme.' : 'compara els termes dominants.'} Resultat: $${M.limitTeX(lim)}$.`, { src: fm.f, at: k === 'inf' ? I : k === '-inf' ? -I : 0, side: k === '0+' ? 1 : 0 });
  }

  /* =========================================================
     G. LÍMITS DE QUOCIENTS A L'INFINIT
     ========================================================= */
  function rp(deg, lead) { const c = Array.from({ length: deg + 1 }, () => ri(-6, 6)); c[deg] = lead; return c; }
  function ratItem(t, neg) {
    const n = ri(1, 4), m = ri(1, 4), a = nz(-6, 6), b = nz(-6, 6);
    const pc = rp(n, a), qc = rp(m, b);
    let num = M.polyTeX(pc), den = M.polyTeX(qc);
    if (t === 3) {
      const order = c => shuffle(c.map((v, i) => ({ v, i })).filter(o => o.v)).map(o => ({ c: o.v, body: M.xpow(o.i) }));
      num = M.termsTeX(order(pc)); den = M.termsTeX(order(qc));
    }
    let lim;
    if (n < m) lim = N(0);
    else if (n === m) lim = N(a / b, F(a, b));
    else { const s = Math.sign(a / b) * (neg && (n - m) % 2 ? -1 : 1); lim = s > 0 ? INF : NINF; }
    const dir = neg ? '-\\infty' : '+\\infty';
    return LIM(limL(dir, R`\frac{${num}}{${den}}`), lim,
      R`Grau de dalt $n=${n}$ (coef. $${a}$), grau de baix $m=${m}$ (coef. $${b}$). ${n < m ? 'Baix guanya: $0$.' : n === m ? R`Mateix grau: $\frac{${a}}{${b}}$.` : R`Dalt guanya: $\sim\frac{${a}}{${b}}x^{${n - m}}$${neg ? R` i a $-\infty$ ${(n - m) % 2 ? 'la potència senar canvia el signe' : 'la potència parella no canvia el signe'}` : ''}.`}`,
      { src: `(${polyS(pc)})/(${polyS(qc)})`, at: neg ? -I : I });
  }
  const rDeg = t => ratItem(t, false);
  const rNeg = t => ratItem(t, true);
  const GEN_OPTS = [R`$0$`, R`$\frac{a_n}{b_m}$`, R`$+\infty$`, R`$-\infty$`];
  function rGeneral(t) {
    const cases = [
      { c: R`n\lt m`, d: '+', a: 0 }, { c: R`n=m`, d: '+', a: 1 }, { c: R`n>m\text{ i }\frac{a_n}{b_m}>0`, d: '+', a: 2 }, { c: R`n>m\text{ i }\frac{a_n}{b_m}\lt 0`, d: '+', a: 3 },
      { c: R`n>m,\ n-m\text{ parell i }\frac{a_n}{b_m}>0`, d: '-', a: 2, t: 2 }, { c: R`n>m,\ n-m\text{ senar i }\frac{a_n}{b_m}>0`, d: '-', a: 3, t: 2 }, { c: R`n>m,\ n-m\text{ senar i }\frac{a_n}{b_m}\lt 0`, d: '-', a: 2, t: 3 },
      { c: R`n\lt m`, d: '-', a: 0, t: 2 },
    ];
    const o = pick(cases.filter(x => (x.t || 1) <= t));
    return MC(R`Siguin $P(x)=a_nx^n+\dots$ i $Q(x)=b_mx^m+\dots$ ($a_n,b_m\neq0$). Si $${o.c}$, quant val $\displaystyle\lim_{x\to${o.d}\infty}\frac{P(x)}{Q(x)}$?`, GEN_OPTS, o.a,
      R`$\frac{P(x)}{Q(x)}\sim\frac{a_n}{b_m}x^{n-m}$. ${o.d === '-' ? R`A $-\infty$, $x^{n-m}$ té el signe de $(-1)^{n-m}$.` : ''}`);
  }

  /* =========================================================
     GRAF: àrees i habilitats
     ========================================================= */
  const AREAS = [
    { id: 'A', name: 'Derivades', icon: '∂', req: [] },
    { id: 'B', name: 'Regla de la cadena', icon: '⛓️', req: ['A'] },
    { id: 'C', name: 'Límits i acotació', icon: '🎯', req: [] },
    { id: 'E', name: 'Equacions i signes', icon: '🧮', req: [] },
    { id: 'D', name: "Regla de l'Hôpital", icon: '🏥', req: ['A', 'B', 'C'] },
    { id: 'F', name: 'Extrems relatius', icon: '⛰️', req: ['B', 'E', 'D'] },
    { id: 'G', name: "Quocients a l'infinit", icon: '∞', req: ['C'] },
  ];
  const S_ = (id, area, name, req, gen, th) => ({ id, area, name, req, gen, th });
  const SKILLS = [
    S_('d-pow', 'A', 'Potències i polinomis', [], dPow, R`$(x^n)'=n\,x^{n-1}$ per a qualsevol exponent: $\frac1{x^k}=x^{-k}$, $\sqrt x=x^{1/2}$. Constants multiplicant es queden; constants sumant desapareixen.`),
    S_('d-elem', 'A', 'Taula de derivades', [], dElem, R`$(\sin x)'=\cos x$, $(\cos x)'=-\sin x$, $(\tan x)'=\frac1{\cos^2x}$, $(e^x)'=e^x$, $(\ln x)'=\frac1x$, $(\sqrt x)'=\frac1{2\sqrt x}$.`),
    S_('d-prod', 'A', 'Regla del producte', ['d-pow', 'd-elem'], dProd, R`$(u\,v)'=u'\,v+u\,v'$. <b>No</b> és $u'v'$.`),
    S_('d-quot', 'A', 'Regla del quocient', ['d-prod'], dQuot, R`$\left(\frac uv\right)'=\frac{u'v-uv'}{v^2}$. L'ordre importa: primer $u'v$, després resta $uv'$.`),
    S_('d-val', 'A', 'Derivada en un punt', ['d-prod'], dVal, R`Primer deriva i <b>després</b> substitueix. Mai al revés (la derivada d'un número és 0).`),
    S_('c-layers', 'B', 'Identificar capes', ['d-elem'], cLayers, R`La capa <b>exterior</b> és l'última operació que faries amb la calculadora. $\sin^2(x^3)=\big(\sin(x^3)\big)^2$: exterior $\square^2$, després $\sin$, després $x^3$.`),
    S_('c-one', 'B', 'Cadena: una capa', ['d-pow', 'd-elem', 'c-layers'], cOne, R`$\big(g(u)\big)'=g'(u)\cdot u'$. Deriva la de fora deixant l'argument intacte, i multiplica per la derivada de l'argument.`),
    S_('c-powtrig', 'B', '$\\sin^n$ vs $\\sin(x^n)$', ['c-one'], cPowTrig, R`$(\sin^n u)'=n\sin^{n-1}u\cdot\cos u\cdot u'$, però $(\sin(x^n))'=\cos(x^n)\cdot nx^{n-1}$.`),
    S_('c-multi', 'B', 'Cadena: 2–4 capes', ['c-powtrig'], cMulti, R`Un factor per capa, de fora cap a dins: $\big(f(g(h(x)))\big)'=f'(g(h))\cdot g'(h)\cdot h'(x)$.`),
    S_('c-mixed', 'B', 'Producte + cadena', ['c-one', 'd-prod'], cMixed, R`Primer la regla del producte; quan derivis cada factor, si és una composició aplica-hi la cadena.`),
    S_('l-sub', 'C', 'Substitució directa', [], lSub, R`Si la funció és contínua al punt (polinomis, $\sin$, $e^x$, quocients amb denominador $\neq0$…), el límit és el valor: <b>substitueix</b>.`),
    S_('l-bounded', 'C', 'Zero per acotada', ['l-sub'], lBounded, R`Si $g\to0$ i $|h|\le C$, llavors $g\cdot h\to0$. Ex.: $|x^2\sin(1/x)|\le x^2\to0$.`),
    S_('l-osc', 'C', 'Quan no existeix', ['l-bounded'], lOsc, R`$\sin(1/x)$ i $\cos(1/x)$ oscil·len entre $-1$ i $1$ quan $x\to0$: <b>no tenen límit</b>. Amb $x^k$ ($k\ge1$) davant sí: $0$.`),
    S_('l-defder', 'C', 'Derivada per definició', ['l-bounded', 'd-pow'], lDefDer, R`$f'(0)=\lim_{h\to0}\frac{f(h)-f(0)}{h}$. Per a $x^k\sin(1/x)$: queda $h^{k-1}\sin(1/h)$, que va a $0$ si $k\ge2$ i no existeix si $k=1$.`),
    S_('l-class', 'C', 'Contínua, derivable, $C^1$', ['l-osc', 'l-defder'], lClass, R`Per a $x^k\sin(1/x)$ amb $f(0)=0$: $k=0$ no contínua; $k=1$ contínua però no derivable; $k=2$ derivable però $f'$ no contínua; $k\ge3$ de classe $C^1$.`),
    S_('h-form', 'D', 'Tipus d\'indeterminació', ['l-sub'], hForm, R`Substitueix primer. L'Hôpital només serveix directament per a $\frac00$ i $\frac\infty\infty$. Les altres ($0\cdot\infty$, $\infty-\infty$, $1^\infty$, $0^0$, $\infty^0$) s'han de transformar abans.`),
    S_('h-step', 'D', 'Aplicar la regla', ['h-form', 'c-one', 'd-quot'], hStep, R`Si és $\frac00$ o $\frac\infty\infty$: $\lim\frac{f}{g}=\lim\frac{f'}{g'}$. Es deriven <b>per separat</b>, no amb la regla del quocient.`),
    S_('h-00', 'D', '$\\frac00$ (un cop)', ['h-step'], h00, R`Comprova $\frac00$, deriva dalt i baix, substitueix. Ex.: $\lim_{x\to0}\frac{\sin 3x}{2x}=\lim\frac{3\cos3x}{2}=\frac32$.`),
    S_('h-twice', 'D', 'Diversos cops', ['h-00'], hTwice, R`Si després d'aplicar-la torna a sortir $\frac00$, aplica-la una altra vegada. Comprova la indeterminació <b>a cada pas</b>.`),
    S_('h-inf', 'D', '$\\frac\\infty\\infty$ i jerarquia', ['h-00'], hInf, R`A $+\infty$: $\ln x\ll x^n\ll e^{ax}$ ($a>0$). Qui creix més ràpid mana: $\frac{x^5}{e^x}\to0$, $\frac{\ln x}{x}\to0$.`),
    S_('h-prod', 'D', '$0\\cdot\\infty$', ['h-inf'], hProd, R`Escriu $f\cdot g=\frac{f}{1/g}$ per obtenir $\frac00$ o $\frac\infty\infty$. Ex.: $x\ln x=\frac{\ln x}{1/x}$.`),
    S_('h-diff', 'D', '$\\infty-\\infty$', ['h-twice'], hDiff, R`Fes denominador comú (o multiplica pel conjugat si hi ha arrels) fins arribar a $\frac00$.`),
    S_('h-exp', 'D', '$1^\\infty$, $0^0$, $\\infty^0$', ['h-prod'], hExp, R`$f^g=e^{g\ln f}$. Calcula $\lim g\ln f$ (sol ser $0\cdot\infty$) i el resultat és $e^{\text{aquest límit}}$. Ex.: $(1+\frac ax)^x\to e^a$.`),
    S_('e-roots', 'E', 'Resoldre equacions', [], eRoots, R`Factor comú → segon grau $x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$ → biquadrada ($t=x^2$) → Ruffini (prova divisors del terme independent).`),
    S_('e-sign', 'E', 'Taula de signes', ['e-roots'], eSign, R`Ordena les arrels, i a cada interval el signe és el producte dels signes dels factors. Un factor al quadrat no canvia el signe.`),
    S_('x-crit', 'F', 'Punts crítics', ['e-roots', 'c-mixed'], xCrit, R`Punts crítics: on $f'(x)=0$ (dins el domini). $e^{(\dots)}$ mai és $0$; un quocient és $0$ quan ho és el numerador.`),
    S_('x-mono', 'F', 'Creixement', ['x-crit', 'e-sign'], xMono, R`$f'>0\Rightarrow f$ creix; $f'\lt 0\Rightarrow f$ decreix. Fes la taula de signes de $f'$ amb els punts crítics (i els punts fora del domini).`),
    S_('x-first', 'F', 'Criteri 1a derivada', ['x-mono'], xFirst, R`Si $f'$ passa de $+$ a $-$: màxim. De $-$ a $+$: mínim. Si no canvia de signe: ni una cosa ni l'altra.`),
    S_('x-second', 'F', 'Criteri 2a derivada', ['x-crit', 'd-val'], xSecond, R`Si $f'(c)=0$: $f''(c)>0\Rightarrow$ mínim (vall), $f''(c)\lt 0\Rightarrow$ màxim (muntanya), $f''(c)=0\Rightarrow$ no decideix.`),
    S_('x-value', 'F', 'Valor de l\'extrem', ['x-first'], xValue, R`Un cop trobat el punt $c$, el valor de l'extrem és $f(c)$ (substitueix a $f$, <b>no</b> a $f'$).`),
    S_('x-infl', 'F', 'Inflexió', ['x-second'], xInfl, R`Punt d'inflexió: on $f''$ <b>canvia de signe</b>. Que $f''(c)=0$ no n'hi ha prou (ex. $x^4$).`),
    S_('x-abs', 'F', 'Extrems absoluts en $[a,b]$', ['x-value'], xAbs, R`Weierstrass: en un interval tancat $[a,b]$ sempre hi són. Candidats: punts crítics de dins i els extrems $a$, $b$. Avalua $f$ a tots i compara.`),
    S_('x-limits', 'F', 'Límits als extrems', ['h-inf'], xLimits, R`Per a l'esbós i els extrems absoluts a $\mathbb R$: límits a $\pm\infty$ (i on la funció no està definida).`),
    S_('r-deg', 'G', 'Graus a $+\\infty$', ['l-sub'], rDeg, R`$\frac{P}{Q}\sim\frac{a_n}{b_m}x^{n-m}$: $n\lt m\to0$; $n=m\to\frac{a_n}{b_m}$; $n>m\to\pm\infty$ amb el signe de $\frac{a_n}{b_m}$.`),
    S_('r-neg', 'G', 'Cap a $-\\infty$', ['r-deg'], rNeg, R`Igual que a $+\infty$, però si $n>m$ el signe es multiplica per $(-1)^{n-m}$.`),
    S_('r-general', 'G', 'Cas general', ['r-neg'], rGeneral, R`Taula: $n\lt m$: $0$ · $n=m$: $\frac{a_n}{b_m}$ · $n>m$: $\pm\infty$ (a $-\infty$, compte amb la paritat de $n-m$).`),
  ];
  const byId = Object.fromEntries(SKILLS.map(s => [s.id, s]));
  function gen(id, tier) {
    const s = byId[id];
    for (let k = 0; k < 20; k++) {
      try { const it = s.gen(tier); it.skill = id; it.tier = tier; return it; }
      catch (e) { if (k === 19) throw e; }
    }
  }

  /* =========================================================
     EXERCICIS COMPLETS (Practica / Simulacre)
     ========================================================= */
  const lab = (it, i) => it.label;
  function exHopital(diff) {
    const plan = diff === 1 ? [['h-form', 1], ['h-00', 1], ['h-inf', 1], ['h-00', 2]]
      : diff === 2 ? [['h-00', 2], ['h-twice', 2], ['h-inf', 2], ['h-prod', 2], ['h-diff', 1]]
        : [['h-twice', 3], ['h-prod', 3], ['h-diff', 3], ['h-exp', 3], ['h-inf', 3]];
    const parts = plan.map(([id, t]) => gen(id, t));
    if (diff >= 2) parts.push(MC(R`Quina d'aquestes afirmacions sobre la regla de l'Hôpital és <b>correcta</b>?`, [
      R`Si $\lim\frac fg$ és $\frac00$ o $\frac\infty\infty$ i existeix $\lim\frac{f'}{g'}$, llavors $\lim\frac fg=\lim\frac{f'}{g'}$.`,
      R`Funciona perquè $\left(\frac fg\right)'=\frac{f'}{g'}$.`,
      R`Es pot aplicar a qualsevol límit, encara que no sigui indeterminat.`,
      R`Si $\lim\frac{f'}{g'}$ no existeix, llavors $\lim\frac fg$ tampoc no existeix.`,
    ], 0, R`Les hipòtesis són: indeterminació $\frac00$ o $\frac\infty\infty$, $f,g$ derivables a prop del punt amb $g'\neq0$, i que existeixi $\lim f'/g'$. Si aquest últim no existeix, la regla no diu res (ex.: $\frac{x+\sin x}{x}$ a $+\infty$).`));
    parts.forEach(p => { p.hint = p.hint || undefined; });
    return {
      topic: 'hopital', diff,
      statement: R`Calcula els límits següents. Abans d'aplicar la <b>regla de l'Hôpital</b> comprova (i escriu) que és una indeterminació $\frac00$ o $\frac\infty\infty$; les altres indeterminacions s'han de transformar primer. <p class="note">Respostes: un número (<code>3/2</code>, <code>e^2</code>…), <code>inf</code>, <code>-inf</code> o <code>no existeix</code>.</p>`,
      parts: parts.map(p => ({ ...p, label: lab(p) })),
      solution: parts.map((p, i) => `<p><b>(${String.fromCharCode(97 + i)})</b> ${p.why}</p>`).join(''),
    };
  }
  function signTableHTML(ivs, fm) {
    let h = `<div class="tblwrap"><table class="tbl signs"><tr><th>$x$</th>`;
    for (const iv of ivs) h += `<td>$\\left(${iv.a.tex}, ${iv.b.tex}\\right)$</td>`;
    h += `</tr><tr><th>$f'(x)$</th>`;
    for (const iv of ivs) h += `<td class="${iv.s > 0 ? 'pos' : 'neg'}">${iv.s > 0 ? '+' : '−'}</td>`;
    h += `</tr><tr><th>$f(x)$</th>`;
    for (const iv of ivs) h += `<td>${iv.s > 0 ? '↗' : '↘'}</td>`;
    return h + '</tr></table></div>';
  }
  function exExtrem(diff) {
    const fm = FAM(pick(FAMS[diff]), diff), A = analyse(fm);
    const pts = famPts(fm);
    const parts = [
      EX(`Calcula $f'(x)$.`, fm.df, R`$f'(x)=${fm.dfTeX}$.`, { pts, tex: fm.dfTeX }),
      LST(`Punts crítics (les $x$ amb $f'(x)=0$).`, fm.crit.map(c => [c.v, c.tex]), ''),
      IVL(`Intervals on $f$ és <b>creixent</b>.`, A.inc, ''),
      IVL(`Intervals on $f$ és <b>decreixent</b>.`, A.dec, ''),
      LST(`On té <b>màxims relatius</b>? (les $x$, o «cap»)`, A.max.map(e => [e.v, e.tex]), ''),
      LST(`On té <b>mínims relatius</b>? (les $x$, o «cap»)`, A.min.map(e => [e.v, e.tex]), ''),
    ];
    const e = (A.max.length && A.min.length ? pick([A.max, A.min]) : A.max.length ? A.max : A.min).slice(-1)[0];
    if (e) parts.push(VAL(`Quant val $f$ a l'extrem relatiu de $x=${e.tex}$?`, e.y, e.ytex, ''));
    if (diff >= 2) {
      const p = pick(A.pts), v = A.d2(p.v);
      parts.push(MC(`Aplica el criteri de la <b>segona derivada</b> al punt crític $x=${p.tex}$:`, SECOND, Math.abs(v) < 1e-6 ? 2 : v > 0 ? 0 : 1, ''));
    }
    if (diff === 3) {
      const k = pick(Object.keys(fm.lims));
      const at = k === 'inf' ? '+\\infty' : k === '-inf' ? '-\\infty' : '0^{+}';
      parts.push(LIM(`Calcula $\\displaystyle\\lim_{x\\to${at}}f(x)$.`, fm.lims[k], ''));
    }
    const xs = A.pts.map(p => p.v);
    let xmin = Math.min(...xs) - 2.2, xmax = Math.max(...xs) + 2.2;
    if (fm.dom === 'pos') { xmin = 0.02; xmax = Math.max(4, Math.max(...xs) * 2.5); }
    const ys = A.pts.map(p => A.f(p.v));
    const ylo = Math.min(...ys), yhi = Math.max(...ys), pad = Math.max(1, (yhi - ylo) * 0.6);
    const plot = Plot.svg({ f: A.f, xmin, xmax, ymin: ylo - pad, ymax: yhi + pad,
      pts: [...A.max.map(p => ({ x: p.v, y: p.y, cls: 'pmax' })), ...A.min.map(p => ({ x: p.v, y: p.y, cls: 'pmin' }))] });
    const solution = R`<p><b>Derivada:</b> $f'(x)=${fm.dfTeX}$.</p>
      <p><b>Punts crítics:</b> $f'(x)=0\iff x\in\{${fm.crit.map(c => c.tex).join(',\\,')}\}$.${fm.dfTeX.includes('e^') ? R` (L'exponencial no s'anul·la mai.)` : ''}${fm.dom === 'nz' ? R` Compte: $x=0$ no és del domini, però també separa intervals.` : ''}</p>
      ${signTableHTML(A.ivs, fm)}
      <p><b>Creixent:</b> $${M.intervalsTeX(A.inc)}$. <b>Decreixent:</b> $${M.intervalsTeX(A.dec)}$.</p>
      <p><b>Màxims relatius:</b> ${A.max.length ? A.max.map(p => `$x=${p.tex}$, $f=${p.ytex}$`).join('; ') : 'cap'}. <b>Mínims relatius:</b> ${A.min.length ? A.min.map(p => `$x=${p.tex}$, $f=${p.ytex}$`).join('; ') : 'cap'}.</p>
      <p><b>Criteri de la 2a derivada</b> (alternativa): $f''(c)>0$ mínim, $f''(c)\lt 0$ màxim.</p>
      <p><b>Límits:</b> ${Object.entries(fm.lims).map(([k, l]) => `$\\lim_{x\\to${k === 'inf' ? '+\\infty' : k === '-inf' ? '-\\infty' : '0^+'}}f=${M.limitTeX(l)}$`).join(', ')}.</p>
      <div class="plotwrap">${plot}</div>`;
    return {
      topic: 'extrem', diff,
      statement: `Estudia la monotonia i els <b>extrems relatius</b> de ${famLabel(fm)}.`,
      parts, solution,
      sketch: { f: A.f, xmin, xmax, ymin: ylo - pad, ymax: yhi + pad, pts: [...A.max.map(p => ({ x: p.v, y: p.y, cls: 'pmax' })), ...A.min.map(p => ({ x: p.v, y: p.y, cls: 'pmin' }))] },
    };
  }

  return { AREAS, SKILLS, byId, gen, exHopital, exExtrem };
})();
/* ---------- theory.js ---------- */
/* Contingut teòric (HTML amb $TeX$) */
const THEORY = {
  chain: String.raw`
  <h3>La regla</h3>
  <div class="formula">$$\big(f(g(x))\big)' = f'\big(g(x)\big)\cdot g'(x)$$</div>
  <p>Amb més capes simplement es repeteix: $\big(f(g(h(x)))\big)' = f'\big(g(h(x))\big)\cdot g'\big(h(x)\big)\cdot h'(x)$.</p>
  <h3>Mètode infal·lible (3 passos)</h3>
  <ol class="steps">
    <li><b>Pela la ceba.</b> Identifica les capes de <b>fora cap a dins</b>. La capa exterior és l'<b>última operació</b> que faries si calculessis $f(x)$ amb la calculadora.</li>
    <li><b>Deriva la capa exterior i deixa-li l'argument intacte.</b> No toquis el que hi ha a dins.</li>
    <li><b>Multiplica per la derivada de l'argument</b> i torna al pas 2 amb aquest argument. Acabes quan arribes a la $x$.</li>
  </ol>
  <p>Resultat: <b>tants factors com capes</b> (comptant el polinomi interior).</p>
  <h3>Exemple de l'examen</h3>
  <p>$f(x) = \cos\big(\sin(\sin^2(x^2))\big)$. Ordre de fora cap a dins: $\cos \to \sin \to \square^2 \to \sin \to x^2$.</p>
  $$f'(x) = \underbrace{-\sin\big(\sin(\sin^2(x^2))\big)}_{\cos'} \cdot \underbrace{\cos\big(\sin^2(x^2)\big)}_{\sin'} \cdot \underbrace{2\sin(x^2)}_{(\square^2)'} \cdot \underbrace{\cos(x^2)}_{\sin'} \cdot \underbrace{2x}_{(x^2)'}$$
  <h3>Errors típics</h3>
  <ul>
    <li>$\sin^2(x^2)$ vol dir $\big(\sin(x^2)\big)^2$: <b>el quadrat és una capa per fora del sinus</b>.</li>
    <li>Oblidar l'últim factor (la derivada de l'interior, per exemple $2x$).</li>
    <li>Canviar l'argument en derivar: $(\cos u)' = -\sin u \cdot u'$, l'argument continua sent $u$.</li>
    <li>El signe menys de la derivada del cosinus.</li>
  </ul>
  <h3>Taula de derivades (amb cadena)</h3>
  <div class="tblwrap"><table class="tbl">
    <tr><th>Funció</th><th>Derivada</th><th>Funció</th><th>Derivada</th></tr>
    <tr><td>$u^n$</td><td>$n\,u^{n-1}\,u'$</td><td>$\sin u$</td><td>$\cos u\cdot u'$</td></tr>
    <tr><td>$\sqrt{u}$</td><td>$\dfrac{u'}{2\sqrt u}$</td><td>$\cos u$</td><td>$-\sin u\cdot u'$</td></tr>
    <tr><td>$e^u$</td><td>$e^u\,u'$</td><td>$\tan u$</td><td>$\dfrac{u'}{\cos^2 u} = (1+\tan^2u)\,u'$</td></tr>
    <tr><td>$\ln u$</td><td>$\dfrac{u'}{u}$</td><td>$\dfrac{1}{u}$</td><td>$-\dfrac{u'}{u^2}$</td></tr>
  </table></div>`,

  limder: String.raw`
  <h3>Definició de derivada</h3>
  <div class="formula">$$f'(a) = \lim_{h\to0}\frac{f(a+h)-f(a)}{h}$$</div>
  <p>Quan $f$ es defineix «a trossos» (una fórmula per a $x\neq0$ i un valor a $x=0$), les regles de derivació només valen per a $x\neq 0$. En $x=0$ cal fer servir la <b>definició</b> (o un límit).</p>
  <h3>El lema clau: «zero per acotada és zero»</h3>
  <div class="formula">Si $g(x)\to0$ i $|b(x)|\le K$, aleshores $g(x)\,b(x)\to 0$.</div>
  <p>Com que $|\sin(\cdot)|\le1$ i $|\cos(\cdot)|\le1$: $\;x^{k}\sin(1/x)\to0$ si $k>0$. Però $\sin(1/x)$ i $\cos(1/x)$ <b>sols no tenen límit</b> quan $x\to0$ (oscil·len), i $\frac{1}{x}\cos(1/x)$ ni tan sols està acotat.</p>
  <h3>Mètode per a $f(x) = x^k\sin(1/x)$, $f(0)=0$</h3>
  <ol class="steps">
    <li><b>Deriva per a $x\neq0$</b> (producte + cadena): $\left(\sin\tfrac1x\right)' = \cos\tfrac1x\cdot\left(-\tfrac1{x^2}\right)$.
      $$f'(x) = k\,x^{k-1}\sin\tfrac1x - x^{k-2}\cos\tfrac1x$$</li>
    <li><b>Límit de $f'(x)$</b>: analitza terme a terme. Potència positiva de $x$ × acotada $\to 0$. Si l'exponent és $0$ o negatiu: no té límit.</li>
    <li><b>Derivada en 0 per definició</b>: $\dfrac{f(h)-0}{h} = h^{k-1}\sin\tfrac1h \to 0$ si $k\ge2$.</li>
    <li><b>Conclou</b>: derivable en $0$? $f'$ contínua en $0$?</li>
  </ol>
  <h3>Taula resum (memoritza-la!)</h3>
  <div class="tblwrap"><table class="tbl">
    <tr><th>$k$</th><th>Contínua en 0</th><th>Derivable en 0</th><th>$\lim_{x\to0} f'(x)$</th><th>$f'$ contínua en 0</th></tr>
    <tr><td>$0$</td><td>✗</td><td>✗</td><td>—</td><td>✗</td></tr>
    <tr><td>$1$</td><td>✓</td><td>✗</td><td>no existeix</td><td>✗</td></tr>
    <tr><td>$2$</td><td>✓</td><td>✓ ($f'(0)=0$)</td><td><b>no existeix</b></td><td>✗</td></tr>
    <tr><td>$\ge3$</td><td>✓</td><td>✓ ($f'(0)=0$)</td><td>$0$</td><td>✓</td></tr>
  </table></div>
  <p class="callout warn"><b>Trampa del cas $k=2$:</b> si $\lim_{x\to0}f'(x)$ existeix, aleshores $f'(0)$ val això. Però si <b>no</b> existeix, no pots concloure res: cal anar a la definició (i pot ser que $f$ sí que sigui derivable!).</p>
  <p>Si s'afegeix un terme $a\,x$, totes les derivades en $0$ i el límit es desplacen en $a$.</p>`,

  study: String.raw`
  <h3>Checklist de l'estudi complet</h3>
  <ol class="steps">
    <li><b>Zeros</b>: resol $f(x)=0$. Treu factor comú; si no, Ruffini amb divisors del terme independent; després equació de segon grau.</li>
    <li><b>Primera derivada</b> $f'(x)$ i <b>punts crítics</b>: $f'(x)=0$.</li>
    <li><b>Taula de signes de $f'$</b>: els punts crítics parteixen la recta; tria un valor de prova a cada interval. $f'>0$ ⇒ creix ↗, $f'<0$ ⇒ decreix ↘.</li>
    <li><b>Classifica</b>: ↗ després ↘ ⇒ <b>màxim local</b>; ↘ després ↗ ⇒ <b>mínim local</b>; si no canvia ⇒ no és extrem. (Alternativa: $f''(c)<0$ màxim, $f''(c)>0$ mínim.)</li>
    <li><b>Segona derivada</b> $f''(x)$, resol $f''(x)=0$ i fes la taula de signes: $f''>0$ ⇒ <b>convexa</b> $\cup$, $f''<0$ ⇒ <b>còncava</b> $\cap$. On canvia de signe ⇒ <b>punt d'inflexió</b>.</li>
    <li><b>Límits a $\pm\infty$</b>: mana el terme de grau més alt.</li>
    <li><b>Extrems absoluts</b>: si algun límit és $+\infty$ no hi ha màxim absolut; si algun és $-\infty$ no hi ha mínim absolut.</li>
    <li><b>Esbós</b>: marca zeros, extrems i inflexions i uneix-los respectant creixement i curvatura.</li>
  </ol>
  <h3>Exemple de l'examen: $f(x)=x^3-x$</h3>
  <ul>
    <li>Zeros: $x(x^2-1)=0 \Rightarrow x = -1,\,0,\,1$.</li>
    <li>$f'(x)=3x^2-1=0 \Rightarrow x=\pm\frac{1}{\sqrt3}=\pm\frac{\sqrt3}{3}$.</li>
    <li>$f'>0$ a $\left(-\infty,-\frac{\sqrt3}{3}\right)\cup\left(\frac{\sqrt3}{3},+\infty\right)$ (creix), $f'<0$ a $\left(-\frac{\sqrt3}{3},\frac{\sqrt3}{3}\right)$ (decreix).</li>
    <li>Màxim local a $x=-\frac{\sqrt3}{3}$, mínim local a $x=\frac{\sqrt3}{3}$.</li>
    <li>$f''(x)=6x$: còncava a $(-\infty,0)$, convexa a $(0,+\infty)$, inflexió a $x=0$.</li>
    <li>$\lim_{x\to+\infty}f=+\infty$, $\lim_{x\to-\infty}f=-\infty$ ⇒ <b>no té ni màxim ni mínim absoluts</b>.</li>
  </ul>
  <h3>Fets que estalvien temps</h3>
  <ul>
    <li>Un polinomi de <b>grau senar</b> mai té extrems absoluts.</li>
    <li>Grau parell amb coeficient principal $>0$: té mínim absolut i no màxim (al revés si és $<0$).</li>
    <li>Equació de segon grau: $x=\dfrac{-b\pm\sqrt{b^2-4ac}}{2a}$.</li>
    <li>Racionalitza: $\frac{1}{\sqrt3}=\frac{\sqrt3}{3}$ (a la web pots escriure qualsevol de les dues).</li>
    <li>Un punt crític on $f'$ no canvia de signe (p.ex. $x=0$ a $x^4-4x^3$) <b>no</b> és extrem.</li>
  </ul>
  <p class="callout"><b>Convenció</b>: aquí <b>convexa</b> = forma $\cup$ ($f''>0$) i <b>còncava</b> = forma $\cap$ ($f''<0$). Si el teu professor fa servir la convenció contrària, a l'examen indica sempre el signe de $f''$ o dibuixa $\cup$ / $\cap$.</p>`,

  ratlim: String.raw`
  <h3>La idea</h3>
  <p>Quan $|x|$ és molt gran, en un polinomi <b>només importa el terme de grau més alt</b>. Traient factor comú:</p>
  <div class="formula">$$\frac{a_nx^n+\dots+a_0}{b_mx^m+\dots+b_0} = \frac{x^n\left(a_n+\frac{a_{n-1}}{x}+\dots\right)}{x^m\left(b_m+\frac{b_{m-1}}{x}+\dots\right)} \;\sim\; \frac{a_n}{b_m}\,x^{\,n-m}$$</div>
  <p>Alternativa: aplicar l'Hôpital $\min(n,m)$ vegades fins que un dels dos polinomis sigui constant.</p>
  <h3>Taula de casos</h3>
  <div class="tblwrap"><table class="tbl">
    <tr><th>Cas</th><th>$x\to+\infty$</th><th>$x\to-\infty$</th></tr>
    <tr><td>$n\lt m$</td><td>$0$</td><td>$0$</td></tr>
    <tr><td>$n=m$</td><td>$\dfrac{a_n}{b_m}$</td><td>$\dfrac{a_n}{b_m}$</td></tr>
    <tr><td>$n>m$, $\frac{a_n}{b_m}>0$</td><td>$+\infty$</td><td>$+\infty$ si $n-m$ parell; $-\infty$ si senar</td></tr>
    <tr><td>$n>m$, $\frac{a_n}{b_m}<0$</td><td>$-\infty$</td><td>$-\infty$ si $n-m$ parell; $+\infty$ si senar</td></tr>
  </table></div>
  <h3>Trampes típiques</h3>
  <ul>
    <li><b>Termes desordenats</b>: $\frac{3 - x + 2x^4}{x^2 - 5x^4}$ té $a_n=2$, $b_m=-5$, i el límit és $-\frac25$.</li>
    <li><b>Polinomis factoritzats</b>: el terme principal de $(2x-1)^3(x^2+4)$ és $2^3\cdot1\cdot x^{5}=8x^5$.</li>
    <li><b>$x\to-\infty$</b>: $x^{n-m}$ amb exponent senar és negatiu!</li>
    <li>El terme independent $a_0/b_0$ <b>no</b> hi pinta res (això seria el límit quan $x\to0$).</li>
  </ul>`,

  hopital: String.raw`
  <h3>La regla</h3>
  <p>Si $\displaystyle\lim_{x\to a}\frac{f(x)}{g(x)}$ és una indeterminació $\frac00$ o $\frac{\infty}{\infty}$, $f$ i $g$ són derivables a prop de $a$ (amb $g'\neq0$) i existeix $\displaystyle\lim_{x\to a}\frac{f'(x)}{g'(x)}$, llavors</p>
  <div class="formula">$$\lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)}.$$</div>
  <p>Val igual per a $a=\pm\infty$ i per a límits laterals.</p>
  <h3>Mètode (4 passos)</h3>
  <ol class="steps">
    <li><b>Substitueix.</b> Si surt un número (o $\frac{k}{0}$ amb $k\neq0$), ja està: <b>no</b> hi ha indeterminació i l'Hôpital <b>no</b> es pot aplicar.</li>
    <li><b>Classifica.</b> $\frac00$ o $\frac\infty\infty$: directe. Les altres s'han de transformar (taula de sota).</li>
    <li><b>Deriva dalt i baix per separat</b> (no és la regla del quocient!) i torna a substituir.</li>
    <li>Si torna a sortir $\frac00$ o $\frac\infty\infty$, repeteix. <b>Escriu</b> a cada pas quina indeterminació tens.</li>
  </ol>
  <h3>Transformar les altres indeterminacions</h3>
  <div class="tblwrap"><table class="tbl">
    <tr><th>Tipus</th><th>Truc</th><th>Exemple</th></tr>
    <tr><td>$0\cdot\infty$</td><td>$f\cdot g=\dfrac{f}{1/g}$</td><td>$x\ln x=\dfrac{\ln x}{1/x}\to0$</td></tr>
    <tr><td>$\infty-\infty$</td><td>Denominador comú o conjugat</td><td>$\frac1x-\frac1{\sin x}=\frac{\sin x-x}{x\sin x}$</td></tr>
    <tr><td>$1^\infty,\ 0^0,\ \infty^0$</td><td>$f^g=e^{g\ln f}$</td><td>$\left(1+\frac ax\right)^x\to e^{a}$</td></tr>
  </table></div>
  <h3>Límits que surten sempre (val la pena saber-los)</h3>
  <ul>
    <li>$\displaystyle\lim_{x\to0}\frac{\sin(ax)}{bx}=\frac ab$, $\displaystyle\lim_{x\to0}\frac{e^{ax}-1}{bx}=\frac ab$, $\displaystyle\lim_{x\to0}\frac{\ln(1+ax)}{bx}=\frac ab$.</li>
    <li>$\displaystyle\lim_{x\to0}\frac{1-\cos x}{x^2}=\frac12$ (dues aplicacions).</li>
    <li><b>Jerarquia a $+\infty$:</b> $\ln x\ll x^n\ll e^{ax}$ ($a>0$). Per exemple $\frac{x^{10}}{e^x}\to0$ i $\frac{\ln x}{\sqrt x}\to0$.</li>
  </ul>
  <h3>Errors típics</h3>
  <ul>
    <li>Aplicar-la sense indeterminació: $\lim_{x\to0}\frac{x+1}{x+2}=\frac12$, però «derivant» sortiria $1$.</li>
    <li>Fer la derivada del quocient $\left(\frac fg\right)'$ en lloc de $\frac{f'}{g'}$.</li>
    <li>Pensar que si $\lim\frac{f'}{g'}$ no existeix, tampoc existeix $\lim\frac fg$. Ex.: $\frac{x+\sin x}{x}\to1$ a $+\infty$, però $\frac{1+\cos x}{1}$ oscil·la.</li>
  </ul>`,
  extrem: String.raw`
  <h3>Definicions</h3>
  <p>$f$ té un <b>màxim relatiu</b> a $c$ si $f(c)\ge f(x)$ per a tots els $x$ a prop de $c$ (i un <b>mínim relatiu</b> si $f(c)\le f(x)$). Si $f$ és derivable a $c$ i hi té un extrem relatiu, llavors $f'(c)=0$ (teorema de Fermat). Al revés no és cert: $x^3$ té $f'(0)=0$ i no té cap extrem.</p>
  <h3>Mètode</h3>
  <ol class="steps">
    <li><b>Domini.</b> On està definida $f$? ($\ln x$ demana $x>0$, un quocient demana denominador $\neq0$.)</li>
    <li><b>Deriva i factoritza</b> $f'$. Truc: $e^{(\dots)}>0$ sempre, i un quocient s'anul·la quan s'anul·la el numerador.</li>
    <li><b>Punts crítics:</b> resol $f'(x)=0$.</li>
    <li><b>Taula de signes de $f'$</b> amb els punts crítics <b>i</b> els punts fora del domini. $f'>0$: creix ↗; $f'\lt 0$: decreix ↘.</li>
    <li><b>Classifica</b> (criteri de la 1a derivada): ↗ després ↘ és màxim; ↘ després ↗ és mínim; si no canvia, cap dels dos.</li>
    <li><b>Valor</b> de l'extrem: $f(c)$, substituint a $f$ (no a $f'$).</li>
  </ol>
  <h3>Criteri de la segona derivada</h3>
  <p>Si $f'(c)=0$: $f''(c)>0\Rightarrow$ mínim (vall ∪); $f''(c)\lt 0\Rightarrow$ màxim (muntanya ∩); $f''(c)=0\Rightarrow$ <b>no decideix</b> (ex.: $x^4$ té mínim a $0$ i $x^3$ no en té, i en tots dos $f''(0)=0$).</p>
  <h3>Extrems absoluts</h3>
  <ul>
    <li><b>En un interval tancat $[a,b]$</b> (Weierstrass: sempre n'hi ha si $f$ és contínua): avalua $f$ als punts crítics de dins i als extrems $a$, $b$, i compara.</li>
    <li><b>A tot $\mathbb R$</b>: cal mirar els límits a $\pm\infty$. Si $f\to+\infty$ no hi ha màxim absolut; si $f\to-\infty$ no hi ha mínim absolut.</li>
  </ul>
  <h3>Exemple</h3>
  <p>$f(x)=x\,e^{-x}$. $f'(x)=e^{-x}-xe^{-x}=(1-x)e^{-x}$. Com que $e^{-x}>0$, $f'=0\iff x=1$. Signe: $f'>0$ a $(-\infty,1)$ i $f'\lt 0$ a $(1,+\infty)$. Màxim relatiu a $x=1$, amb $f(1)=\frac1e$. A més $f\to0$ a $+\infty$ i $f\to-\infty$ a $-\infty$: és màxim absolut i no hi ha mínim absolut.</p>`,
  syntax: String.raw`
  <div class="tblwrap"><table class="tbl">
    <tr><th>Vols escriure</th><th>Escriu</th></tr>
    <tr><td>$2x\cos(x^2)$</td><td><code>2x*cos(x^2)</code> o <code>2x cos(x^2)</code></td></tr>
    <tr><td>$\sin^2(x)$</td><td><code>sin(x)^2</code> o <code>sin^2(x)</code></td></tr>
    <tr><td>$e^{x^2}$</td><td><code>e^(x^2)</code> o <code>exp(x^2)</code></td></tr>
    <tr><td>$\sqrt{3}/3$</td><td><code>sqrt(3)/3</code></td></tr>
    <tr><td>$\frac{1}{\cos^2(x)}$</td><td><code>1/cos(x)^2</code></td></tr>
    <tr><td>$\ln(x)$, $\tan(x)$, $\pi$</td><td><code>ln(x)</code>, <code>tan(x)</code>, <code>pi</code></td></tr>
    <tr><td>$+\infty$, $-\infty$</td><td><code>inf</code>, <code>-inf</code></td></tr>
    <tr><td>No existeix</td><td><code>no existeix</code></td></tr>
    <tr><td>Llista $\{0, \pm\sqrt2\}$</td><td><code>0, sqrt(2), -sqrt(2)</code> o <code>0, ±sqrt(2)</code></td></tr>
    <tr><td>$(-\infty,-1)\cup(1,+\infty)$</td><td><code>(-inf, -1) U (1, inf)</code></td></tr>
    <tr><td>Conjunt buit</td><td><code>cap</code></td></tr>
  </table></div>
  <p>Les derivades es comproven <b>numèricament</b>: qualsevol expressió equivalent és correcta, simplificada o no. Mentre escrius veuràs una vista prèvia de com s'interpreta.</p>`,
};
/* ---------- lessons.js ---------- */
/* ===========================================================
   Camí d'aprenentatge: lliçons des de zero amb comprovacions
   =========================================================== */
const LESSONS = (() => {
  const R = String.raw;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const N = (v, tex) => ({ k: 'num', v, tex: tex ?? String(v) }), INF = { k: 'inf', s: 1 }, NINF = { k: 'inf', s: -1 }, DNE = { k: 'dne' };
  const E = (label, f, ans, hint, pts) => ({ type: 'expr', label, f, answerTeX: ans, hint, pts });
  const V = (label, v, ans, hint) => ({ type: 'value', label, v, answerTeX: ans ?? M.numTeX(v), hint });
  const L = (label, lim, hint) => ({ type: 'limit', label, lim, hint });
  const LS = (label, pairs, hint) => { const list = pairs.map(([v, tex]) => ({ v, tex })); return { type: 'list', label, list, answerTeX: M.listTeX(list), hint }; };
  const IV = (label, ivs, hint) => { const iv = ivs.map(([a, at, b, bt]) => ({ a: { v: a, tex: at }, b: { v: b, tex: bt } })); return { type: 'intervals', label, intervals: iv, answerTeX: M.intervalsTeX(iv), hint }; };
  const Q = (label, opts, ok, hint) => ({ type: 'mcq', label, options: shuffle(opts.map((h, i) => ({ html: h, ok: i === ok }))), hint });
  const O = (label, items, hint) => ({ type: 'order', label, items, hint });
  const I = Infinity, s3 = Math.sqrt(3), s2 = Math.sqrt(2);
  const POS = [0.19, 0.33, 0.52, 0.74, 0.97, 1.21, 1.46, 1.72, 2.03, 2.4];

  const PROOF_LEMMA = [
    R`Sabem que $|\sin(1/x)|\le 1$ per a tot $x\neq0$.`,
    R`Multiplicant per $x^2\ge0$: $\;|x^2\sin(1/x)|\le x^2$.`,
    R`És a dir: $\;-x^2\le x^2\sin(1/x)\le x^2$.`,
    R`Com que $-x^2\to0$ i $x^2\to0$, pel criteri del sandvitx $x^2\sin(1/x)\to0$.`,
  ];
  const PROOF_TVM = [
    R`$f$ és contínua a $[0,h]$ i derivable a $(0,h)$.`,
    R`Pel teorema del valor mitjà existeix $c_h$ entre $0$ i $h$ amb $\frac{f(h)-f(0)}{h}=f'(c_h)$.`,
    R`Quan $h\to0$, també $c_h\to0$ (perquè està entre $0$ i $h$).`,
    R`Com que $\lim_{x\to0}f'(x)=L$, tenim $f'(c_h)\to L$.`,
    R`Per tant $f'(0)=\lim_{h\to0}\frac{f(h)-f(0)}{h}=L$.`,
  ];

  /* ---------- el seminari original, redactat ---------- */
  const f3 = x => x ** 3 - x;
  const plotOrig = Plot.svg({ f: f3, xmin: -1.9, xmax: 1.9, ymin: -1.6, ymax: 1.6, pts: [
    { x: -1, y: 0, cls: 'pz' }, { x: 0, y: 0, cls: 'pinf' }, { x: 1, y: 0, cls: 'pz' },
    { x: -1 / s3, y: f3(-1 / s3), cls: 'pmax' }, { x: 1 / s3, y: f3(1 / s3), cls: 'pmin' }] });
  const ORIGINAL = R`
  <p class="callout">Així és com s'haurien d'escriure les respostes del full del seminari: <b>cada pas justificat</b>, sense saltar-se res important.</p>
  <h3>Exercici 1 · $f(x)=\cos\big(\sin(\sin^2(x^2))\big)$</h3>
  <div class="model">
  <p>Capes de fora cap a dins: $\cos \to \sin \to (\cdot)^2 \to \sin \to x^2$. Apliquem la regla de la cadena capa per capa:</p>
  $$\begin{aligned}
  f'(x) &= -\sin\big(\sin(\sin^2(x^2))\big)\cdot\big[\sin(\sin^2(x^2))\big]'\\
  &= -\sin\big(\sin(\sin^2(x^2))\big)\cdot\cos\big(\sin^2(x^2)\big)\cdot\big[\sin^2(x^2)\big]'\\
  &= -\sin\big(\sin(\sin^2(x^2))\big)\cdot\cos\big(\sin^2(x^2)\big)\cdot 2\sin(x^2)\cdot\big[\sin(x^2)\big]'\\
  &= -\sin\big(\sin(\sin^2(x^2))\big)\cdot\cos\big(\sin^2(x^2)\big)\cdot 2\sin(x^2)\cdot\cos(x^2)\cdot 2x.
  \end{aligned}$$
  </div>
  <h3>Exercici 2 · $f(x)=x^3\sin(1/x)$, $f(0)=0$</h3>
  <div class="model">
  <p><b>Derivada per a $x\neq0$.</b> Aquí $f$ és producte i composició de funcions derivables, per tant:</p>
  $$f'(x)=3x^2\sin\left(\tfrac1x\right)+x^3\cos\left(\tfrac1x\right)\cdot\left(-\tfrac{1}{x^2}\right)=3x^2\sin\left(\tfrac1x\right)-x\cos\left(\tfrac1x\right).$$
  <p><b>Límit.</b> Com que $|\sin(\cdot)|\le1$ i $|\cos(\cdot)|\le1$:</p>
  $$\left|3x^2\sin\left(\tfrac1x\right)\right|\le3x^2\xrightarrow[x\to0]{}0,\qquad\left|x\cos\left(\tfrac1x\right)\right|\le|x|\xrightarrow[x\to0]{}0.$$
  <p>Per tant $\displaystyle\lim_{x\to0}f'(x)=0-0=0$.</p>
  <p><b>Per què això dona $f'(0)$</b> (justificació completa). $f$ és contínua en $0$ perquè $|x^3\sin(1/x)|\le|x|^3\to0=f(0)$. Pel teorema del valor mitjà, per a cada $h\neq0$ existeix $c_h$ entre $0$ i $h$ amb $\frac{f(h)-f(0)}{h}=f'(c_h)$. Quan $h\to0$, $c_h\to0$ i $f'(c_h)\to0$. Així $f'(0)=0$.</p>
  <p><i>Comprovació directa:</i> $\frac{f(h)-f(0)}{h}=h^2\sin(1/h)\to0$, perquè $|h^2\sin(1/h)|\le h^2$.</p>
  </div>
  <h3>Exercici 3 · $f(x)=x^3-x$</h3>
  <div class="model">
  <p><b>Zeros.</b> $x^3-x=x(x^2-1)=x(x-1)(x+1)=0\iff x\in\{-1,0,1\}$.</p>
  <p><b>Punts crítics.</b> $f'(x)=3x^2-1=0\iff x=\pm\frac{1}{\sqrt3}=\pm\frac{\sqrt3}{3}$.</p>
  <div class="tblwrap"><table class="tbl signs"><tr><th>$x$</th><td>$(-\infty,-\frac{\sqrt3}3)$</td><td>$(-\frac{\sqrt3}3,\frac{\sqrt3}3)$</td><td>$(\frac{\sqrt3}3,+\infty)$</td></tr>
  <tr><th>$f'$</th><td class="pos">+</td><td class="neg">−</td><td class="pos">+</td></tr><tr><th>$f$</th><td>↗</td><td>↘</td><td>↗</td></tr></table></div>
  <p>$f$ creix a $(-\infty,-\frac{\sqrt3}3)\cup(\frac{\sqrt3}3,+\infty)$ i decreix a $(-\frac{\sqrt3}3,\frac{\sqrt3}3)$. Hi ha un <b>màxim local</b> a $x=-\frac{\sqrt3}{3}$ (valor $\frac{2\sqrt3}{9}\approx0.385$) i un <b>mínim local</b> a $x=\frac{\sqrt3}{3}$ (valor $-\frac{2\sqrt3}{9}$).</p>
  <p><b>Inflexió.</b> $f''(x)=6x$: $f''\lt 0$ a $(-\infty,0)$ (còncava, $\cap$) i $f''>0$ a $(0,+\infty)$ (convexa, $\cup$). Canvia de signe a $x=0$: punt d'inflexió $(0,0)$.</p>
  <p><b>Extrems absoluts.</b> $\lim_{x\to+\infty}(x^3-x)=\lim x^3\left(1-\frac{1}{x^2}\right)=+\infty$, i de la mateixa manera $\lim_{x\to-\infty}f(x)=-\infty$. Per tant, per a qualsevol $M$ hi ha punts amb $f(x)>M$ (no hi ha màxim absolut) i punts amb $f(x)\lt -M$ (no hi ha mínim absolut).</p>
  ${plotOrig}
  </div>
  <h3>Exercici 4 · Límit general de $\frac{P(x)}{Q(x)}$</h3>
  <div class="model">
  <p>Per a $x\neq0$ traiem factor comú $x^n$ al numerador i $x^m$ al denominador:</p>
  $$\frac{a_nx^n+\dots+a_0}{b_mx^m+\dots+b_0}=\frac{x^n\left(a_n+\frac{a_{n-1}}{x}+\dots+\frac{a_0}{x^n}\right)}{x^m\left(b_m+\frac{b_{m-1}}{x}+\dots+\frac{b_0}{x^m}\right)}=x^{n-m}\cdot\frac{A(x)}{B(x)}.$$
  <p>Cada terme $\frac{a_j}{x^k}$ (amb $k\ge1$) tendeix a $0$, per tant $A(x)\to a_n$ i $B(x)\to b_m\neq0$, i $\frac{A(x)}{B(x)}\to\frac{a_n}{b_m}$. Ara separem casos:</p>
  <ul>
    <li>$n\lt m$: $x^{n-m}=\frac{1}{x^{m-n}}\to0$, i el límit és $0\cdot\frac{a_n}{b_m}=0$.</li>
    <li>$n=m$: $x^{0}=1$, i el límit és $\frac{a_n}{b_m}$.</li>
    <li>$n>m$: $x^{n-m}\to+\infty$, i el límit és $+\infty$ si $\frac{a_n}{b_m}>0$ i $-\infty$ si $\frac{a_n}{b_m}\lt 0$.</li>
  </ul>
  </div>`;

  const L_ = [
    /* ---------------- BLOC 0 ---------------- */
    {
      id: 'der-intro', block: 'Fonaments', title: 'Què és una derivada?',
      body: R`
      <p>La <b>derivada</b> $f'(a)$ mesura <b>com de ràpid canvia</b> $f$ al punt $a$: és el <b>pendent</b> de la recta tangent a la gràfica en aquell punt.</p>
      <p>Es defineix amb un límit: agafem dos punts de la gràfica, $a$ i $a+h$, calculem el pendent de la recta que els uneix i fem que s'ajuntin ($h\to0$):</p>
      <div class="formula">$$f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h}$$</div>
      <p><b>Exemple:</b> $f(x)=x^2$. Llavors
      $$\frac{f(a+h)-f(a)}{h}=\frac{(a+h)^2-a^2}{h}=\frac{a^2+2ah+h^2-a^2}{h}=\frac{2ah+h^2}{h}=2a+h\xrightarrow[h\to0]{}2a.$$
      Per tant la derivada de $x^2$ és $2x$.</p>
      <p><b>Què ens diu el signe de la derivada?</b></p>
      <ul><li>$f'(a)>0$: la funció <b>creix</b> a prop de $a$.</li><li>$f'(a)\lt 0$: la funció <b>decreix</b>.</li><li>$f'(a)=0$: tangent horitzontal (pot ser un màxim, un mínim… o cap dels dos).</li></ul>`,
      parts: [
        V(R`Si $f(x)=x^2$, quant val $f'(3)$?`, 6, '6', R`Hem vist que $f'(x)=2x$.`),
        V(R`Si $f(x)=x^3$, calcula $f'(1)=\lim_{h\to0}\frac{(1+h)^3-1}{h}$.`, 3, '3', R`$(1+h)^3=1+3h+3h^2+h^3$. Resta 1, divideix per $h$ i fes $h\to0$.`),
        Q(R`Si $f'(2)=-3$, què fa $f$ a prop de $x=2$?`, ['Decreix', 'Creix', 'Té un màxim', 'És constant'], 0, 'Derivada negativa vol dir pendent negatiu.'),
      ],
    },
    {
      id: 'der-rules', block: 'Fonaments', title: 'Derivades bàsiques',
      body: R`
      <p>No cal fer el límit cada vegada: aquestes derivades ja estan calculades i les has de saber de memòria.</p>
      <div class="tblwrap"><table class="tbl">
      <tr><th>$f(x)$</th><th>$f'(x)$</th><th>$f(x)$</th><th>$f'(x)$</th></tr>
      <tr><td>$c$ (constant)</td><td>$0$</td><td>$\sin x$</td><td>$\cos x$</td></tr>
      <tr><td>$x^n$</td><td>$n\,x^{n-1}$</td><td>$\cos x$</td><td>$-\sin x$</td></tr>
      <tr><td>$e^x$</td><td>$e^x$</td><td>$\tan x$</td><td>$\frac{1}{\cos^2x}$</td></tr>
      <tr><td>$\ln x$</td><td>$\frac1x$</td><td>$\sqrt x$</td><td>$\frac{1}{2\sqrt x}$</td></tr>
      </table></div>
      <p><b>Regles:</b> la derivada d'una suma és la suma de derivades, i les constants que multipliquen es queden: $(c\,f)'=c\,f'$.</p>
      <p><b>Exemple:</b> $(3x^4-2x+7)'=3\cdot4x^3-2\cdot1+0=12x^3-2$.</p>
      <p><b>Truc:</b> $x^n$ funciona també amb exponents negatius o fraccionaris: $\left(\frac1x\right)'=(x^{-1})'=-x^{-2}=-\frac1{x^2}$.</p>`,
      parts: [
        E(R`Deriva $f(x)=3x^4-2x+7$.`, x => 12 * x ** 3 - 2, '12x^3-2', R`Terme a terme: $(x^n)'=nx^{n-1}$.`),
        E(R`Deriva $f(x)=5x^2+4\cos x$.`, x => 10 * x - 4 * Math.sin(x), '10x-4\\sin x', R`$(\cos x)'=-\sin x$.`),
        E(R`Deriva $f(x)=\sqrt{x}+\ln x$ (per a $x>0$).`, x => 1 / (2 * Math.sqrt(x)) + 1 / x, '\\frac{1}{2\\sqrt x}+\\frac1x', 'Mira la taula.', POS),
        E(R`Deriva $f(x)=\frac{1}{x}$.`, x => -1 / x ** 2, '-\\frac{1}{x^2}', R`Escriu-ho com $x^{-1}$.`),
      ],
    },
    {
      id: 'der-prod', block: 'Fonaments', title: 'Regla del producte i del quocient',
      body: R`
      <div class="formula">$$(f\cdot g)'=f'\cdot g+f\cdot g'\qquad\qquad\left(\frac fg\right)'=\frac{f'g-fg'}{g^2}$$</div>
      <p class="callout warn"><b>Error típic:</b> $(f\cdot g)'\neq f'\cdot g'$. Per exemple $(x\cdot x)'=(x^2)'=2x$, però $1\cdot1=1$.</p>
      <p><b>Exemple:</b> $(x^2\sin x)'=\underbrace{2x}_{f'}\cdot\underbrace{\sin x}_{g}+\underbrace{x^2}_{f}\cdot\underbrace{\cos x}_{g'}$.</p>
      <p>Aquesta regla és la que necessitaràs a l'exercici 2 del seminari: $x^3\sin(1/x)$ és un producte.</p>`,
      parts: [
        E(R`Deriva $x^2\sin x$.`, x => 2 * x * Math.sin(x) + x * x * Math.cos(x), '2x\\sin x+x^2\\cos x', R`$f=x^2$, $g=\sin x$.`),
        E(R`Deriva $x\,e^x$.`, x => Math.exp(x) * (1 + x), 'e^x+xe^x', R`$f=x$, $g=e^x$.`),
        E(R`Deriva $x^3\cos x$.`, x => 3 * x * x * Math.cos(x) - x ** 3 * Math.sin(x), '3x^2\\cos x-x^3\\sin x', R`Compte amb el signe: $(\cos x)'=-\sin x$.`),
        E(R`Deriva $\dfrac{\sin x}{x}$.`, x => (x * Math.cos(x) - Math.sin(x)) / x ** 2, '\\frac{x\\cos x-\\sin x}{x^2}', R`$\frac{f'g-fg'}{g^2}$ amb $f=\sin x$, $g=x$.`),
      ],
    },
    /* ---------------- BLOC 1 ---------------- */
    {
      id: 'chain-comp', block: 'Regla de la cadena', title: 'Funcions dins de funcions',
      body: R`
      <p>Una <b>composició</b> $f(g(x))$ vol dir: primer calcules $g(x)$ i al resultat li apliques $f$. Per exemple, a $\sin(x^2)$:</p>
      <ul><li>$x^2$ és la funció <b>interior</b> (es calcula primer),</li><li>$\sin$ és la funció <b>exterior</b> (es calcula l'última).</li></ul>
      <p><b>Truc de la calculadora:</b> imagina que calcules $f(1)$ tecla a tecla. L'<b>última</b> tecla que prems és la capa <b>exterior</b>.</p>
      <p><b>Exemple de l'examen:</b> $\cos\big(\sin(\sin^2(x^2))\big)$ amb $x=1$:</p>
      <ol><li>$x^2=1$</li><li>$\sin(1)\approx0.841$</li><li>al quadrat: $0.708$</li><li>$\sin(0.708)\approx0.650$</li><li>$\cos(0.650)\approx0.796$</li></ol>
      <p>Ordre de dins cap a fora: $x^2\to\sin\to(\cdot)^2\to\sin\to\cos$. Per derivar ho llegirem <b>al revés</b>: $\cos\to\sin\to(\cdot)^2\to\sin\to x^2$.</p>
      <p class="callout warn"><b>Notació important:</b> $\sin^2(x)$ vol dir $\big(\sin x\big)^2$. Primer el sinus, després el quadrat. En canvi $\sin(x^2)$ és primer el quadrat i després el sinus.</p>`,
      parts: [
        Q(R`Quina és la capa <b>exterior</b> de $(x^2+1)^5$?`, [R`La potència $(\cdot)^5$`, R`$x^2+1$`, R`$x^2$`], 0, 'Què calcularies l\'últim?'),
        Q(R`Quina és la capa <b>exterior</b> de $\sin^2(x)$?`, [R`El quadrat $(\cdot)^2$`, R`El sinus`], 0, R`$\sin^2 x=(\sin x)^2$.`),
        V(R`Si $f(u)=u^3$ i $g(x)=x+1$, quant val $f(g(1))$?`, 8, '8', R`Primer $g(1)$, després $f$ del resultat.`),
        Q(R`Ordre de les capes de $e^{\cos(3x)}$, de fora cap a dins:`, [R`$e^{\square}\to\cos\to3x$`, R`$\cos\to e^{\square}\to3x$`, R`$3x\to\cos\to e^{\square}$`], 0, 'L\'exponencial és el que es calcula l\'últim.'),
      ],
    },
    {
      id: 'chain-one', block: 'Regla de la cadena', title: 'La regla de la cadena (una capa)',
      body: R`
      <div class="formula">$$\big(f(g(x))\big)'=f'\big(g(x)\big)\cdot g'(x)$$</div>
      <p>En paraules: <b>deriva la de fora deixant-li l'interior intacte, i multiplica per la derivada de l'interior.</b></p>
      <div class="tblwrap"><table class="tbl">
      <tr><th>Funció</th><th>Exterior derivada (interior intacte)</th><th>× derivada interior</th><th>Resultat</th></tr>
      <tr><td>$\sin(x^2)$</td><td>$\cos(x^2)$</td><td>$2x$</td><td>$\cos(x^2)\cdot2x$</td></tr>
      <tr><td>$(3x+1)^5$</td><td>$5(3x+1)^4$</td><td>$3$</td><td>$15(3x+1)^4$</td></tr>
      <tr><td>$e^{x^2}$</td><td>$e^{x^2}$</td><td>$2x$</td><td>$2x\,e^{x^2}$</td></tr>
      <tr><td>$\ln(x^2+1)$</td><td>$\frac{1}{x^2+1}$</td><td>$2x$</td><td>$\frac{2x}{x^2+1}$</td></tr>
      </table></div>
      <p class="callout warn"><b>Errors típics:</b> escriure $\cos(2x)$ en comptes de $\cos(x^2)\cdot 2x$ (has canviat l'interior!), o oblidar el factor final.</p>`,
      parts: [
        E(R`Deriva $\sin(x^2)$.`, x => Math.cos(x * x) * 2 * x, '\\cos(x^2)\\cdot2x', R`Exterior $\sin$, interior $x^2$.`),
        E(R`Deriva $(3x+1)^5$.`, x => 15 * (3 * x + 1) ** 4, '5(3x+1)^4\\cdot3', R`Exterior $u^5$, interior $3x+1$.`),
        E(R`Deriva $e^{x^2}$.`, x => 2 * x * Math.exp(x * x), 'e^{x^2}\\cdot2x', R`$(e^u)'=e^u\cdot u'$.`),
        E(R`Deriva $\ln(x^2+1)$.`, x => 2 * x / (x * x + 1), '\\frac{2x}{x^2+1}', R`$(\ln u)'=\frac{u'}{u}$.`),
        E(R`Deriva $\cos(5x)$.`, x => -5 * Math.sin(5 * x), '-5\\sin(5x)', R`$(\cos u)'=-\sin u\cdot u'$.`),
      ],
    },
    {
      id: 'chain-multi', block: 'Regla de la cadena', title: 'Diverses capes',
      body: R`
      <p>Amb més capes simplement repetim: <b>cada capa aporta un factor</b>. Si $f=A(B(C(x)))$:</p>
      <div class="formula">$$f'(x)=A'\big(B(C(x))\big)\cdot B'\big(C(x)\big)\cdot C'(x)$$</div>
      <p><b>Exemple 1:</b> $(\sin^2x)'=\big((\sin x)^2\big)'=2\sin x\cdot\cos x$.</p>
      <p><b>Exemple 2:</b> $\big(\cos(\sin x)\big)'=-\sin(\sin x)\cdot\cos x$.</p>
      <p><b>Exemple 3:</b> $\big(e^{\sin(x^2)}\big)'=e^{\sin(x^2)}\cdot\cos(x^2)\cdot2x$ (tres capes, tres factors).</p>
      <p><b>Mètode segur:</b> escriu primer la llista de capes de fora cap a dins i després escriu un factor per cada una, d'esquerra a dreta.</p>`,
      parts: [
        E(R`Deriva $\sin^2(x)$.`, x => 2 * Math.sin(x) * Math.cos(x), '2\\sin x\\cos x', R`Capes: $(\cdot)^2\to\sin\to x$.`),
        E(R`Deriva $\cos(\sin x)$.`, x => -Math.sin(Math.sin(x)) * Math.cos(x), '-\\sin(\\sin x)\\cos x', R`Capes: $\cos\to\sin\to x$.`),
        E(R`Deriva $e^{\sin(x^2)}$.`, x => Math.exp(Math.sin(x * x)) * Math.cos(x * x) * 2 * x, 'e^{\\sin(x^2)}\\cos(x^2)\\,2x', R`Tres capes: $e^{\square}\to\sin\to x^2$.`),
        V(R`Quants factors té la derivada de $\cos\big(\sin(\sin^2(x^2))\big)$?`, 5, '5', 'Un per capa: cos, sin, quadrat, sin, x².'),
        E(R`<b>L'exercici de l'examen:</b> deriva $\cos\big(\sin(\sin^2(x^2))\big)$.`, x => -Math.sin(Math.sin(Math.sin(x * x) ** 2)) * Math.cos(Math.sin(x * x) ** 2) * 2 * Math.sin(x * x) * Math.cos(x * x) * 2 * x,
          '-\\sin(\\sin(\\sin^2(x^2)))\\cdot\\cos(\\sin^2(x^2))\\cdot2\\sin(x^2)\\cdot\\cos(x^2)\\cdot2x', 'Cinc factors, de fora cap a dins.'),
      ],
    },
    /* ---------------- BLOC 2 ---------------- */
    {
      id: 'lim-basic', block: 'Límits', title: 'Límits: la idea',
      body: R`
      <p>$\lim_{x\to a}f(x)=L$ vol dir: quan $x$ s'acosta a $a$, els valors $f(x)$ s'acosten a $L$.</p>
      <p><b>Límits a l'infinit</b> (quan $x$ es fa enorme):</p>
      <ul>
        <li>$\frac{1}{x}\to0$, $\frac{5}{x^3}\to0$: dividir per una cosa enorme dona gairebé zero.</li>
        <li>$x^2\to+\infty$, $x^3\to+\infty$ quan $x\to+\infty$.</li>
        <li>Quan $x\to-\infty$: $x^2\to+\infty$ (exponent parell), però $x^3\to-\infty$ (exponent senar).</li>
      </ul>
      <p><b>Un límit pot no existir</b>, per exemple si la funció <b>oscil·la</b> sense parar. Quan $x\to0$, $\frac1x$ es fa enorme i $\sin\left(\frac1x\right)$ va donant voltes entre $-1$ i $1$ cada cop més ràpid: $\lim_{x\to0}\sin(1/x)$ <b>no existeix</b>.</p>`,
      parts: [
        L(R`$\displaystyle\lim_{x\to+\infty}\frac{1}{x^2}$`, N(0), 'Dividir per una cosa enorme.'),
        L(R`$\displaystyle\lim_{x\to-\infty}x^3$`, NINF, R`Un número negatiu gran elevat a una potència senar.`),
        L(R`$\displaystyle\lim_{x\to+\infty}\left(3+\frac{2}{x}\right)$`, N(3), R`$\frac2x\to0$.`),
        L(R`$\displaystyle\lim_{x\to-\infty}(-2x^4)$`, NINF, R`$x^4\to+\infty$ i després el $-2$.`),
        L(R`$\displaystyle\lim_{x\to0}\sin\left(\frac1x\right)$`, DNE, 'Oscil·la.'),
      ],
    },
    {
      id: 'lim-bounded', block: 'Límits', title: '«Zero per acotada és zero»',
      body: R`
      <p>Aquest és <b>el</b> resultat clau de l'exercici 2 del seminari.</p>
      <p>Una funció és <b>acotada</b> si no se n'escapa d'un interval. Sempre $|\sin(\text{lo que sigui})|\le1$ i $|\cos(\text{lo que sigui})|\le1$.</p>
      <div class="formula"><b>Lema.</b> Si $g(x)\to0$ i $|b(x)|\le K$, aleshores $g(x)\cdot b(x)\to0$.</div>
      <p><b>Per què:</b> $|g(x)\,b(x)|\le K\,|g(x)|\to0$, i una cosa atrapada entre $-K|g|$ i $K|g|$ ha d'anar a $0$ (criteri del <b>sandvitx</b>).</p>
      <p><b>Com s'escriu a l'examen:</b> «Com que $|\sin(1/x)|\le1$, tenim $|x^2\sin(1/x)|\le x^2\to0$, i per tant $x^2\sin(1/x)\to0$.»</p>
      <div class="tblwrap"><table class="tbl">
      <tr><th>Expressió quan $x\to0$</th><th>Límit</th><th>Per què</th></tr>
      <tr><td>$x^k\sin(1/x)$, $k>0$</td><td>$0$</td><td>tendeix a 0 × acotada</td></tr>
      <tr><td>$\sin(1/x)$, $\cos(1/x)$</td><td>no existeix</td><td>oscil·la</td></tr>
      <tr><td>$\frac1x\cos(1/x)$</td><td>no existeix</td><td>oscil·la i explota</td></tr>
      </table></div>
      <p class="callout warn">Si sumes una cosa que té límit i una que no en té, el resultat <b>no té límit</b>. Ex: $2x\sin(1/x)-\cos(1/x)$ no té límit quan $x\to0$.</p>`,
      parts: [
        L(R`$\displaystyle\lim_{x\to0}x\sin\left(\frac1x\right)$`, N(0), R`$|x\sin(1/x)|\le|x|$.`),
        L(R`$\displaystyle\lim_{x\to0}x^3\cos\left(\frac1x\right)$`, N(0), 'Tendeix a 0 × acotada.'),
        L(R`$\displaystyle\lim_{x\to0}\cos\left(\frac1x\right)$`, DNE, 'Oscil·la.'),
        L(R`$\displaystyle\lim_{x\to0}\frac{1}{x}\sin\left(\frac1x\right)$`, DNE, R`$\frac1x$ no tendeix a 0.`),
        L(R`$\displaystyle\lim_{x\to0}\left(2x\sin\tfrac1x-\cos\tfrac1x\right)$`, DNE, 'El primer terme va a 0, el segon no té límit.'),
        O(R`Ordena els passos per demostrar que $x^2\sin(1/x)\to0$ quan $x\to0$:`, PROOF_LEMMA, 'Comença per la cota del sinus.'),
      ],
    },
    {
      id: 'lim-der', block: 'Límits', title: 'Derivada en un punt amb un límit',
      body: R`
      <p>Considera $f(x)=x^2\sin(1/x)$ per a $x\neq0$ i $f(0)=0$. Les regles de derivació serveixen per a $x\neq0$, però <b>no a $x=0$</b> (la fórmula hi té $1/0$). A $x=0$ cal fer servir la <b>definició</b>:</p>
      $$f'(0)=\lim_{h\to0}\frac{f(h)-f(0)}{h}=\lim_{h\to0}\frac{h^2\sin(1/h)}{h}=\lim_{h\to0}h\sin(1/h)=0.$$
      <p>Per a $x\neq0$: $f'(x)=2x\sin(1/x)+x^2\cos(1/x)\cdot\left(-\frac{1}{x^2}\right)=2x\sin(1/x)-\cos(1/x)$, i aquest <b>no té límit</b> quan $x\to0$. Per tant $f$ és derivable a $0$, però $f'$ no és contínua a $0$.</p>
      <h3>El teorema que fa servir l'enunciat</h3>
      <div class="formula"><b>Teorema.</b> Si $f$ és contínua en $0$, derivable per a $x\neq0$, i existeix $L=\lim_{x\to0}f'(x)$, aleshores $f$ és derivable en $0$ i $f'(0)=L$.</div>
      <p><b>Demostració</b> (amb el teorema del valor mitjà, TVM): $\frac{f(h)-f(0)}{h}=f'(c_h)$ per a algun $c_h$ entre $0$ i $h$. Quan $h\to0$, $c_h\to0$ i $f'(c_h)\to L$.</p>
      <p class="callout warn">Si $\lim f'(x)$ <b>no</b> existeix, el teorema no diu res: $f$ pot ser derivable igualment (com $x^2\sin(1/x)$).</p>`,
      parts: [
        E(R`Sigui $f(x)=x^3\sin(1/x)$. Calcula $f'(x)$ per a $x\neq0$.`, x => 3 * x * x * Math.sin(1 / x) - x * Math.cos(1 / x), '3x^2\\sin(1/x)-x\\cos(1/x)', R`Producte: $(x^3)'\sin(1/x)+x^3\cdot\cos(1/x)\cdot(-1/x^2)$.`),
        L(R`Per a la mateixa $f$, calcula $\displaystyle\lim_{x\to0}f'(x)$.`, N(0), 'Els dos termes són «tendeix a 0 × acotada».'),
        L(R`Calcula $f'(0)$ per definició: $\displaystyle\lim_{h\to0}\frac{h^3\sin(1/h)}{h}$.`, N(0), R`Simplifica: $h^2\sin(1/h)$.`),
        Q(R`Si $\lim_{x\to0}f'(x)$ <b>no</b> existeix, què podem concloure de la derivabilitat de $f$ en $0$?`, ['Res: cal calcular-la per definició', 'Que no és derivable', 'Que és derivable amb derivada 0'], 0, R`Recorda $x^2\sin(1/x)$.`),
        O('Ordena la demostració del teorema:', PROOF_TVM, 'Comença per les hipòtesis.'),
      ],
    },
    /* ---------------- BLOC 3 ---------------- */
    {
      id: 'roots', block: 'Estudi de funcions', title: 'Resoldre equacions polinòmiques',
      body: R`
      <p>Per trobar zeros i punts crítics hauràs de resoldre $p(x)=0$. Tres eines, per aquest ordre:</p>
      <ol class="steps">
        <li><b>Treure factor comú.</b> $x^3-4x=x(x^2-4)=x(x-2)(x+2)$ ⇒ $x=0,\pm2$.</li>
        <li><b>Segon grau.</b> $ax^2+bx+c=0\Rightarrow x=\dfrac{-b\pm\sqrt{b^2-4ac}}{2a}$. Si $b^2-4ac\lt 0$ no hi ha solucions.</li>
        <li><b>Ruffini.</b> Les arrels enteres divideixen el terme independent. Ex: $x^3-6x^2+11x-6$: provem $x=1$: $1-6+11-6=0$ ✓. Dividint, $x^2-5x+6=(x-2)(x-3)$ ⇒ $x=1,2,3$.</li>
      </ol>
      <p><b>Simplificar arrels:</b> $\frac{1}{\sqrt3}=\frac{\sqrt3}{3}$, $\sqrt{12}=2\sqrt3$, $\sqrt{8}=2\sqrt2$. A la web pots escriure-ho de qualsevol manera (<code>1/sqrt(3)</code>).</p>`,
      parts: [
        LS(R`Zeros de $x^3-4x$:`, [[0, '0'], [2, '2'], [-2, '-2']], 'Factor comú x.'),
        LS(R`Solucions de $x^2-5x+6=0$:`, [[2, '2'], [3, '3']], 'Fórmula de segon grau o busca dos números que sumin 5 i multipliquin 6.'),
        LS(R`Solucions de $3x^2-1=0$:`, [[1 / s3, '\\frac{\\sqrt3}{3}'], [-1 / s3, '-\\frac{\\sqrt3}{3}']], R`$x^2=\frac13$.`),
        LS(R`Zeros de $x^3-6x^2+11x-6$:`, [[1, '1'], [2, '2'], [3, '3']], 'Ruffini amb x = 1.'),
        LS(R`Zeros de $x^2+1$:`, [], R`$x^2\ge0$ sempre. Escriu <code>cap</code>.`),
        LS(R`Zeros de $x^4-2x^2$:`, [[0, '0'], [s2, '\\sqrt2'], [-s2, '-\\sqrt2']], R`Factor comú $x^2$.`),
      ],
    },
    {
      id: 'mono', block: 'Estudi de funcions', title: 'Creixement i extrems: la taula de signes',
      body: R`
      <p>$f'>0$ ⇒ $f$ creix. $f'\lt 0$ ⇒ $f$ decreix. Per saber on passa cada cosa:</p>
      <ol class="steps"><li>Resol $f'(x)=0$ (punts crítics).</li><li>Aquests punts divideixen la recta en intervals.</li><li>A cada interval tria un <b>valor de prova</b> i mira el signe de $f'$.</li></ol>
      <p><b>Exemple:</b> $f(x)=x^3-3x$, $f'(x)=3x^2-3=3(x-1)(x+1)$, crítics $x=\pm1$.</p>
      <div class="tblwrap"><table class="tbl signs"><tr><th>$x$</th><td>$(-\infty,-1)$</td><td>$(-1,1)$</td><td>$(1,+\infty)$</td></tr>
      <tr><th>prova</th><td>$f'(-2)=9$</td><td>$f'(0)=-3$</td><td>$f'(2)=9$</td></tr>
      <tr><th>$f'$</th><td class="pos">+</td><td class="neg">−</td><td class="pos">+</td></tr><tr><th>$f$</th><td>↗</td><td>↘</td><td>↗</td></tr></table></div>
      <p>↗ després ↘ ⇒ <b>màxim local</b> ($x=-1$). ↘ després ↗ ⇒ <b>mínim local</b> ($x=1$).</p>
      <p class="callout warn"><b>Compte:</b> $f'(c)=0$ no vol dir sempre extrem. $f(x)=x^3$: $f'(0)=0$ però $f$ creix a banda i banda ⇒ <b>no</b> és extrem.</p>
      <p><b>Alternativa ràpida</b> (criteri de la 2a derivada): si $f'(c)=0$ i $f''(c)\lt 0$ ⇒ màxim; $f''(c)>0$ ⇒ mínim.</p>`,
      parts: [
        LS(R`Punts crítics de $f(x)=x^3-12x$:`, [[2, '2'], [-2, '-2']], R`$f'(x)=3x^2-12$.`),
        IV(R`Intervals de creixement de $x^3-12x$:`, [[-I, '-\\infty', -2, '-2'], [2, '2', I, '+\\infty']], R`Prova $f'(-3)$, $f'(0)$, $f'(3)$.`),
        IV(R`Intervals de decreixement de $x^3-12x$:`, [[-2, '-2', 2, '2']], R`On $f'\lt 0$.`),
        LS(R`Màxims locals de $x^3-12x$ (abscisses):`, [[-2, '-2']], '↗ i després ↘.'),
        LS(R`Mínims locals de $x^3-12x$ (abscisses):`, [[2, '2']], '↘ i després ↗.'),
        Q(R`$f(x)=x^3$ té un punt crític a $x=0$. Què és?`, ['No és ni màxim ni mínim', 'Un mínim', 'Un màxim'], 0, R`Mira el signe de $3x^2$ a banda i banda.`),
      ],
    },
    {
      id: 'curv', block: 'Estudi de funcions', title: 'Concavitat, convexitat i inflexió',
      body: R`
      <p>La <b>segona derivada</b> diu cap on es corba la gràfica:</p>
      <ul><li>$f''>0$ ⇒ <b>convexa</b>, forma $\cup$ (com un got que reté aigua).</li><li>$f''\lt 0$ ⇒ <b>còncava</b>, forma $\cap$.</li></ul>
      <p>Un <b>punt d'inflexió</b> és on $f''$ <b>canvia de signe</b> (la curvatura canvia).</p>
      <p><b>Exemple:</b> $f(x)=x^3-3x$: $f''(x)=6x$. Còncava a $(-\infty,0)$, convexa a $(0,+\infty)$, inflexió a $x=0$.</p>
      <p class="callout warn">$f''(c)=0$ no garanteix inflexió: $f(x)=x^4$ té $f''(0)=0$ però $f''=12x^2\ge0$ a banda i banda ⇒ no hi ha inflexió.</p>
      <p class="callout">Convenció de la web: <b>convexa = $\cup$</b>. A l'examen, per evitar confusions, escriu també el signe de $f''$ o dibuixa $\cup$ / $\cap$.</p>`,
      parts: [
        LS(R`Punts d'inflexió de $f(x)=x^3-3x^2$:`, [[1, '1']], R`$f''(x)=6x-6$.`),
        IV(R`On és convexa ($\cup$) $f(x)=x^3-3x^2$?`, [[1, '1', I, '+\\infty']], R`On $6x-6>0$.`),
        IV(R`On és còncava ($\cap$) $f(x)=x^3-3x^2$?`, [[-I, '-\\infty', 1, '1']], R`On $6x-6\lt 0$.`),
        LS(R`Punts d'inflexió de $f(x)=x^4-6x^2$:`, [[1, '1'], [-1, '-1']], R`$f''(x)=12x^2-12$.`),
        Q(R`$f(x)=x^4$ té $f''(0)=0$. Té un punt d'inflexió a $x=0$?`, ['No, perquè $f\'\'$ no canvia de signe', 'Sí, perquè $f\'\'(0)=0$'], 0, 'Inflexió = canvi de signe de f\'\'.'),
      ],
    },
    {
      id: 'abs', block: 'Estudi de funcions', title: 'Límits a l\'infinit i extrems absoluts',
      body: R`
      <p>En un polinomi, quan $x\to\pm\infty$ <b>només compta el terme de grau més alt</b>: $x^3-x=x^3\left(1-\frac1{x^2}\right)$ i el parèntesi tendeix a $1$.</p>
      <p><b>Extrem absolut</b> = el valor més gran (o més petit) de tota la funció, no només a prop d'un punt.</p>
      <ul>
        <li>Si $\lim f=+\infty$ (en algun costat) ⇒ <b>no hi ha màxim absolut</b>: sempre hi ha valors més grans.</li>
        <li>Si $\lim f=-\infty$ ⇒ <b>no hi ha mínim absolut</b>.</li>
        <li>Grau senar: un costat va a $+\infty$ i l'altre a $-\infty$ ⇒ cap extrem absolut.</li>
        <li>Grau parell i coeficient principal $>0$ ⇒ té mínim absolut (el mínim local més baix) i no màxim.</li>
      </ul>
      <p><b>Com s'escriu:</b> «Com que $\lim_{x\to+\infty}f(x)=+\infty$, per a tot $M$ existeix $x$ amb $f(x)>M$; per tant $f$ no té màxim absolut.»</p>`,
      parts: [
        L(R`$\displaystyle\lim_{x\to+\infty}(x^3-x)$`, INF, 'Mana x³.'),
        L(R`$\displaystyle\lim_{x\to-\infty}(x^3-x)$`, NINF, 'Mana x³, exponent senar.'),
        L(R`$\displaystyle\lim_{x\to-\infty}(-2x^4+x)$`, NINF, R`Mana $-2x^4$.`),
        Q(R`Extrems absoluts de $x^3-x$:`, ['Ni màxim ni mínim absoluts', 'Només mínim', 'Només màxim', 'Tots dos'], 0, 'Grau senar.'),
        Q(R`Extrems absoluts de $x^4-2x^2$:`, ['Només mínim absolut', 'Ni màxim ni mínim absoluts', 'Només màxim', 'Tots dos'], 0, 'Grau parell, coeficient positiu.'),
      ],
    },
    /* ---------------- BLOC 4 ---------------- */
    {
      id: 'ratlim-dom', block: 'Límits de quocients', title: 'El terme dominant',
      body: R`
      <p>Per calcular $\lim_{x\to\pm\infty}\frac{P(x)}{Q(x)}$ traiem factor comú la potència més gran de dalt i de baix:</p>
      $$\lim_{x\to+\infty}\frac{2x^2+3x}{5x^2-1}=\lim\frac{x^2\left(2+\frac3x\right)}{x^2\left(5-\frac{1}{x^2}\right)}=\frac{2+0}{5-0}=\frac25.$$
      <p>Només sobreviuen els <b>termes de grau més alt</b>: $\frac{P(x)}{Q(x)}\approx\frac{a_nx^n}{b_mx^m}=\frac{a_n}{b_m}x^{n-m}$.</p>
      <div class="tblwrap"><table class="tbl"><tr><th></th><th>$x\to+\infty$</th></tr>
      <tr><td>grau dalt $\lt$ grau baix</td><td>$0$</td></tr><tr><td>graus iguals</td><td>$\frac{a_n}{b_m}$ (quocient de coeficients principals)</td></tr><tr><td>grau dalt $>$ grau baix</td><td>$\pm\infty$ segons el signe de $\frac{a_n}{b_m}$</td></tr></table></div>
      <p>Si $x\to-\infty$ i $n>m$, compte amb $x^{n-m}$: si $n-m$ és senar, és negatiu.</p>`,
      parts: [
        L(R`$\displaystyle\lim_{x\to+\infty}\frac{2x^2+3x}{5x^2-1}$`, N(0.4, '\\frac25'), 'Graus iguals.'),
        L(R`$\displaystyle\lim_{x\to+\infty}\frac{x+7}{x^3-2}$`, N(0), 'Grau de dalt més petit.'),
        L(R`$\displaystyle\lim_{x\to+\infty}\frac{-3x^4+x}{x^2+1}$`, NINF, R`$\approx-3x^2$.`),
        L(R`$\displaystyle\lim_{x\to-\infty}\frac{2x^3}{x^2+5}$`, NINF, R`$\approx2x$, i $x\to-\infty$.`),
        L(R`$\displaystyle\lim_{x\to+\infty}\frac{4-x+6x^3}{2x^3+x^2}$`, N(3, '3'), R`Desordenat! Dalt mana $6x^3$.`),
      ],
    },
    {
      id: 'ratlim-proof', block: 'Límits de quocients', title: 'El cas general (demostració)',
      body: R`
      <p>L'exercici 4 del seminari demana el límit <b>en general</b>, amb lletres. S'ha de redactar així:</p>
      <div class="model">
      $$\frac{a_nx^n+\dots+a_0}{b_mx^m+\dots+b_0}=\frac{x^n\left(a_n+\frac{a_{n-1}}{x}+\dots+\frac{a_0}{x^n}\right)}{x^m\left(b_m+\frac{b_{m-1}}{x}+\dots+\frac{b_0}{x^m}\right)}=x^{n-m}\cdot\frac{A(x)}{B(x)}$$
      <p>Com que $\frac{a_j}{x^k}\to0$, tenim $A(x)\to a_n$ i $B(x)\to b_m\neq0$. Per tant:</p>
      <ul><li>$n\lt m$: $x^{n-m}\to0$ ⇒ límit $0$.</li><li>$n=m$: $x^{0}=1$ ⇒ límit $\frac{a_n}{b_m}$.</li><li>$n>m$: $x^{n-m}\to+\infty$ ⇒ límit $+\infty$ si $\frac{a_n}{b_m}>0$, $-\infty$ si $\frac{a_n}{b_m}\lt 0$.</li></ul>
      </div>
      <p><b>Amb l'Hôpital</b> (l'altra via que suggereix la pista): derivar dalt i baix $\min(n,m)$ vegades fins que un dels dos sigui constant. Per exemple, si $n=m$, després de $n$ derivades queda $\frac{n!\,a_n}{n!\,b_n}=\frac{a_n}{b_n}$.</p>`,
      parts: [
        O('Ordena els passos de la demostració general:', null, 'Primer es treu factor comú.'),
        Q(R`Si $n=m$, el límit quan $x\to+\infty$ és:`, [R`$\frac{a_n}{b_m}$`, '$0$', R`$+\infty$`, R`$\frac{a_0}{b_0}$`], 0, 'Les potències es cancel·len.'),
        Q(R`Si $n>m$ i $\frac{a_n}{b_m}\lt 0$, el límit quan $x\to+\infty$ és:`, [R`$-\infty$`, R`$+\infty$`, '$0$', R`$\frac{a_n}{b_m}$`], 0, R`$x^{n-m}\to+\infty$ multiplicat per un negatiu.`),
        Q(R`Per què $A(x)=a_n+\frac{a_{n-1}}{x}+\dots+\frac{a_0}{x^n}\to a_n$?`, [R`Perquè cada $\frac{a_j}{x^k}\to0$ quan $x\to+\infty$`, R`Perquè $a_n$ és el més gran`, 'Per l\'Hôpital'], 0, 'Constant dividit per una cosa enorme.'),
      ],
    },
    /* ---------------- BLOC 4b: aplicacions de la derivada ---------------- */
    {
      id: 'hop', block: 'Aplicacions de la derivada', title: "La regla de l'Hôpital",
      body: R`
      <p>Quan en un límit de quocient substitueixes i surt $\frac00$ o $\frac{\infty}{\infty}$, no saps quant val: depèn de <b>qui va més ràpid</b>. La regla de l'Hôpital ho resol comparant les velocitats, és a dir, les derivades:</p>
      <div class="formula">$$\lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)}\qquad\text{si és }\tfrac00\text{ o }\tfrac\infty\infty.$$</div>
      <p><b>Exemple:</b> $\displaystyle\lim_{x\to0}\frac{\sin 3x}{2x}$. Substituint: $\frac{0}{0}$. Derivant dalt i baix: $\displaystyle\lim_{x\to0}\frac{3\cos 3x}{2}=\frac32$.</p>
      <p class="callout warn"><b>Abans de derivar, substitueix.</b> Si no és indeterminació, la regla dona resultats falsos. I es deriva <b>per separat</b>: no és la regla del quocient.</p>
      <p><b>Altres indeterminacions</b> es converteixen en quocient: $0\cdot\infty$ amb $f\cdot g=\frac{f}{1/g}$; $\infty-\infty$ fent denominador comú; $1^\infty$, $0^0$, $\infty^0$ amb $f^g=e^{g\ln f}$.</p>
      <p><b>Jerarquia</b> a $+\infty$: $\ln x\ll x^n\ll e^x$.</p>`,
      parts: [SK.gen('h-form', 1), SK.gen('h-00', 1), SK.gen('h-step', 1), SK.gen('h-inf', 1), SK.gen('h-prod', 1), SK.gen('h-exp', 1)],
    },
    {
      id: 'ext', block: 'Aplicacions de la derivada', title: 'Extrems relatius: els dos criteris',
      body: R`
      <p>Un <b>màxim relatiu</b> és un cim: el punt més alt <i>del seu voltant</i>. Un <b>mínim relatiu</b>, una vall. Als cims i a les valls la tangent és horitzontal: $f'(c)=0$. Aquests punts s'anomenen <b>punts crítics</b>.</p>
      <p><b>Criteri de la 1a derivada:</b> mira el signe de $f'$ a banda i banda. $+\to-$: màxim. $-\to+$: mínim. Si no canvia: ni una cosa ni l'altra.</p>
      <p><b>Criteri de la 2a derivada:</b> $f''(c)>0$ vall (mínim), $f''(c)\lt 0$ muntanya (màxim), $f''(c)=0$ no decideix.</p>
      <p><b>Exemple:</b> $f(x)=x^2e^{-x}$. $f'(x)=2xe^{-x}-x^2e^{-x}=x(2-x)e^{-x}$. Crítics: $x=0$ i $x=2$. Signes: $-$ a $(-\infty,0)$, $+$ a $(0,2)$, $-$ a $(2,\infty)$. Mínim a $0$ ($f=0$) i màxim a $2$ ($f=\frac{4}{e^2}$).</p>
      <p><b>Extrems absoluts en $[a,b]$:</b> compara $f$ als crítics de dins i als extrems de l'interval.</p>`,
      parts: [SK.gen('x-crit', 1), SK.gen('x-mono', 1), SK.gen('x-first', 1), SK.gen('x-second', 1), SK.gen('x-value', 1), SK.gen('x-abs', 1)],
    },
    /* ---------------- BLOC 5 ---------------- */
    {
      id: 'original', block: 'El seminari', title: 'El seminari original, resolt i redactat',
      body: ORIGINAL, parts: [],
    },
  ];
  // la demostració general la comparteix amb el generador
  const proofPart = L_.find(l => l.id === 'ratlim-proof').parts[0];
  proofPart.items = G.PROOF_RATLIM;
  return { list: L_, ORIGINAL };
})();
  (typeof window !== 'undefined' ? window : globalThis).SEM3 = { M, Plot, G, SK, THEORY, LESSONS };
})();
