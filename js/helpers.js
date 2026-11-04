/* helpers.js — petites utilitats compartides pels generadors */
(function (global) {
  'use strict';
  const H = {};
  const T = M.numTex;
  /** Signe + terme: " + 3" / " - 3" (per a coeficients numèrics). */
  H.sg = v => (v < 0 ? ' - ' : ' + ') + T(Math.abs(v));
  /** a x + b en LaTeX */
  H.lin = (a, b, v) => M.polyTex([b, a], v || 'x');
  /** (x - p) en LaTeX: "x-3", "x+3", "x" */
  H.xm = (p, v) => { v = v || 'x'; return p === 0 ? v : (p > 0 ? v + ' - ' + T(p) : v + ' + ' + T(-p)); };
  H.xmP = (p, e) => (p === 0 ? (e ? 'x^{' + e + '}' : 'x') : '\\left(' + H.xm(p) + '\\right)' + (e && e !== 1 ? '^{' + e + '}' : ''));
  /** $...$ d'una expressió en cadena parsejable */
  H.t = (s, simp) => '$' + M.tex(s, simp) + '$';
  H.m = s => '$' + s + '$';
  /** Interval LaTeX */
  H.iv = (a, b, lo, hi) => (lo ? '[' : '(') + a + ',\\,' + b + (hi ? ']' : ')');
  H.INF = '+\\infty'; H.NINF = '-\\infty';
  /** Una llista d'enters distints dins [lo,hi] */
  H.distinct = (r, n, lo, hi, nz) => {
    const out = [];
    let guard = 0;
    while (out.length < n && guard++ < 500) { const v = nz ? r.nz(lo, hi) : r.int(lo, hi); if (!out.includes(v)) out.push(v); }
    return out;
  };
  H.sortNum = a => a.slice().sort((x, y) => x - y);
  H.signChar = v => (v < 0 ? '-' : '+');
  /** Problema de derivada genèric: statement 'Calcula f'(x)' amb solució resumida. */
  H.derivSteps = (src, rule, extra) => {
    const ast = M.parse(src);
    const d = M.diff(ast);
    const steps = [];
    if (rule) steps.push(rule);
    steps.push('$f\'(x) = ' + M.toTex(d) + '$');
    if (extra) steps.push(extra);
    return { d, steps };
  };
  global.H = H;
  if (typeof module !== 'undefined') module.exports = H;
})(typeof window !== 'undefined' ? window : globalThis);
