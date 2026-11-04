/* ===================================================================
   p1_gens.js — Material del 1r Parcial que s'afegeix als mòduls L0–L7:
   1) «Derivades de 100 funcions» (PDF del professorat): la derivada
      correcta la calcula el mini-CAS.
   2) Generadors de l'altre projecte (p1/legacy/gens.js) adaptats al
      format de CalcMaster (mateixa llavor => mateix exercici).
   =================================================================== */
(function (global) {
  'use strict';
  const P = Calc.P;

  /* ------------------------ 1) Derivades de 100 funcions ------------------------ */
  // [expressió en sintaxi de la web, LaTeX opcional si el generat no coincideix amb el PDF]
  const D100 = [
    ['2'], ['2x-3'], ['-5x^2-2x+1'], ['-7x^3-2x^2+10x-2'], ['10x^2-3x^3-2'], ['(10x^2-3x)^5'], ['(x-1)^10'], ['(2x-2)^17+(5x^2+2)^3'], ['-7x^2-3x+3'], ['-3(x^2+2x+1)^4'],
    ['x/(x+1)'], ['-2/x'], ['x^2/(x-1)'], ['(2x+3)/(x^2-2x)'], ['(x^2-1)/x^3'], ['(2x-1)/((x-1)(x+1))'], ['1/x^5'], ['(x^2+x-3)/(x+1)'], ['6x^4/(7x^2-x+3)'], ['(x^2-4x)/(5x+2)'],
    ['e^x'], ['e^(3x-2)'], ['2^x'], ['2^(x^2-3x+1)'], ['e^(-x^2)+e^x'], ['(e^x+1)^2'], ['e^x/(x^2+1)'], ['x^2*e^x'], ['e^(-3x^2+2)'], ['e^(1/x)'],
    ['sqrt(x)'], ['sqrt(2x-2)'], ['sqrt(x^2-2e^x)'], ['x^(-1/3)', '\\dfrac{1}{\\sqrt[3]{x}}'], ['sqrt(1/x)'], ['sqrt(3x^2+e^(x^2))'], ['(5x^3-1)^(1/3)', '\\sqrt[3]{5x^3-1}'], ['e^(sqrt(x))/sqrt(x)'], ['sqrt(x^3-2x^2-x+1)'], ['sqrt(x)/x^2'],
    ['ln(x)'], ['ln(x)/ln(3)', '\\log_3(x)'], ['ln(x^2+1)'], ['ln(x^2+1)/ln(5)', '\\log_5(x^2+1)'], ['ln(3x^3-2x^2+5)'], ['ln(e^x-1)'], ['ln(sqrt(x^2-1))'], ['ln(5x-1)^2', '\\ln^2(5x-1)'], ['e^x*ln(2x)'], ['ln(ln(x^2-3x))'],
    ['sin(x)'], ['cos(x)'], ['tan(x)'], ['sin(3x^2-5x-7)'], ['cos(x^2+e^(x^2))'], ['tan(2x^2-3x+7)'], ['cos(ln(3x^2-1))'], ['sin(sqrt(ln(x)))'], ['sin(x)^7', '\\sin^7(x)'], ['tan(e^(-x^2-1))'],
    ['asin(x)'], ['acos(x)'], ['atan(x)'], ['asin(2x-1)'], ['acos(x^3-x^2)'], ['atan(e^x)'], ['asin(x)^3', '\\arcsin^3(x)'], ['atan(sqrt(x))'], ['acos(ln(x+1))'], null /* 70: asin(-x^2-1) només existeix a x=0 */,
    ['(3x^4-2x+1)^5'], ['ln(tan(x))'], ['ln(x^2-1)^4', '\\ln^4(x^2-1)'], ['tan(x^3-8)^2', '\\tan^2(x^3-8)'], ['(x^2/(x-1))^3'], ['e^(sin(2x))'], ['sqrt(cos(x))'], ['cos(sin(x))'], ['sin(cos(x))'], ['sin(x^2)^2', '\\sin^2(x^2)'],
    ['sin(sqrt(x^2+3x))'], ['cos((x-1)/x)'], ['ln(sin(x^2))^5', '\\ln^5(\\sin(x^2))'], ['e^(-x^2-x^3-ln(x))'], ['(sin(x)-cos(x))^5'], ['x/ln(x)'], ['(1-2e^(3x))^6'], ['((x^2-1)^(1/3))^5', '\\left(\\sqrt[3]{x^2-1}\\right)^5'], ['(x+1)*ln(x+1)'], ['(2x+1)^3*3^x'],
    ['3sin(x^2)+3sin(x)^2', '3\\sin(x^2)+3\\sin^2(x)'], ['10x^4-3x+ln(x^2)'], ['e^((sqrt(x)+1)^2)'], ['(ln(x^2-1))^(1/3)', '\\sqrt[3]{\\ln(x^2-1)}'], ['ln(sin(x)^2)', '\\ln(\\sin^2(x))'], ['(4x^2+5x-2)^3'], ['(ln(x))^(1/4)', '\\sqrt[4]{\\ln(x)}'], ['2^(3x^2-x+10)'], ['ln(sqrt(x)+e^(3x))'], ['x^x', null, 'x^x*(ln(x)+1)']
  ];
  
  /** Interval més llarg on f i la derivada són finites (per comparar respostes numèricament). */
  function autoRange(f, g) {
    const run = (from, to) => {
      let best = null, cur = null;
      for (let x = from; x <= to + 1e-9; x += 0.04) {
        const a = f(x), b = g(x);
        if (isFinite(a) && isFinite(b) && Math.abs(b) < 2e3 && Math.abs(a) < 2e3) { if (!cur) cur = [x, x]; cur[1] = x; if (!best || cur[1] - cur[0] > best[1] - best[0]) best = cur.slice(); } else cur = null;
      }
      return best;
    };
    let best = run(0.02, 8);                       // la majoria de funcions tenen sentit a la dreta
    if (!best || best[1] - best[0] < 0.5) { const b2 = run(-8, 8); if (b2 && (!best || b2[1] - b2[0] > best[1] - best[0])) best = b2; }
    if (!best) return null;
    const w = best[1] - best[0], lo = best[0] + 0.08 * w, hi = Math.min(best[1] - 0.08 * w, lo + 3);
    return hi - lo < 0.2 ? [best[0], best[1]] : [lo, hi];
  }
  const d100Cache = {};
  function d100Item(i) {
    if (d100Cache[i]) return d100Cache[i];
    const [src, texOverride, custom] = D100[i];
    const ast = M.parse(src), d = custom ? M.parse(custom) : M.diff(ast), ds = M.toStr(d);
    const f = M.compile(src), g = M.compile(ds);
    const range = autoRange(f, g);
    return (d100Cache[i] = { src, ast, d, ds, range, tex: texOverride || M.toTex(M.simplify(ast)) });
  }
  function d100Problem(i, group) {
    const it = d100Item(i);
    const steps = ['Identifica la estructura: ' + (group || 'quina és la funció exterior i quina la interior') + '.', '$y\'=' + M.toTex(it.d) + '$'];
    const p = P.fn('<span class="chip">Funció ' + (i + 1) + '/100</span> Deriva $y=' + it.tex + '$', it.ds, steps, { range: it.range || [0.3, 2.7] });
    p.check = () => { if (!it.range) return false; const f = M.compile(it.src), g = M.compile(it.ds); const pts = [0.2, 0.5, 0.8].map(t => it.range[0] + (it.range[1] - it.range[0]) * t); return pts.every(x => Math.abs(M.numDiff(f, x) - g(x)) < 1e-4 * Math.max(1, Math.abs(g(x)))); };
    p.d100 = i + 1;
    return p;
  }
  const d100Idx = D100.map((x, i) => (x ? i : -1)).filter(i => i >= 0);
  const d100Gens = [
    { id: 'd100', title: 'Derivades de 100 funcions (totes)', level: 2, make: r => d100Problem(r.pick(d100Idx)) }
  ];
  [[0, 10, 'polinomis i potències'], [10, 20, 'quocient de polinomis'], [20, 30, 'exponencials'], [30, 40, 'arrels (potència fraccionària)'], [40, 50, 'logaritmes'], [50, 70, 'trigonomètriques i inverses'], [70, 100, 'composades de diferents tipus']].forEach(([a, b, nm], k) => {
    const idx = d100Idx.filter(i => i >= a && i < b);
    d100Gens.push({ id: 'd100_' + k, title: 'Derivades 100: ' + nm + ' (' + (a + 1) + '–' + b + ')', level: k < 2 ? 1 : k < 5 ? 2 : 3, make: r => d100Problem(r.pick(idx), nm) });
  });

  /* ------------------------ 2) Generadors de l'altre projecte ------------------------ */
  const LEG = [
    ['derivBasic', 'l2', 'Derivades bàsiques (parcial)', 1], ['derivChain', 'l2', 'Derivada: regla de la cadena (parcial)', 2], ['derivProdQuot', 'l2', 'Derivada: producte i quocient (parcial)', 2],
    ['derivative', 'l2', 'Derivades mixtes (parcial)', 2], ['logDerivative', 'l2', 'Derivació logarítmica f^g (parcial)', 3], ['implicitDerivative', 'l2', 'Derivada implícita en un punt (parcial)', 3], ['rolleTvm', 'l2', 'Rolle / valor mitjà: troba c (parcial)', 2],
    ['tangent', 'l1', 'Recta tangent (parcial)', 2], ['limit', 'l1', 'Límits mixtos (parcial)', 2], ['limitDirect', 'l1', 'Límits directes (parcial)', 1], ['limitFactor', 'l1', 'Límits factoritzant (parcial)', 2], ['continuity', 'l1', 'Continuïtat: valor de k (parcial)', 2], ['bolzano', 'l1', 'Bolzano + monotonia: única arrel (parcial)', 3],
    ['domain', 'l0', 'Domini (parcial)', 1], ['equation', 'l0', 'Equacions exp/log (parcial)', 2], ['expQuadratic', 'l0', 'Equació exponencial quadràtica (parcial)', 2], ['inequality', 'l0', 'Inequació quadràtica (parcial)', 1],
    ['polyGrowth', 'l3', 'Creixement i extrems d\'un polinomi (parcial)', 2], ['absExtrema', 'l3', 'Extrems absoluts en [a,b] (parcial)', 2],
    ['asymptote', 'l4', 'Asímptota obliqua (parcial)', 2], ['functionStudy', 'l4', 'Estudi complet d\'una funció (parcial)', 3], ['powLimit', 'l4', 'Límits 1^∞, 0^0, ∞^0 (parcial)', 3],
    ['taylorValue', 'l5', 'Taylor: valor del polinomi (parcial)', 1], ['taylorError', 'l5', 'Taylor: error de l\'aproximació (parcial)', 2], ['taylorProblem', 'l5', 'Taylor + fita de l\'error, estil 2025 (parcial)', 3], ['taylorDegree', 'l5', 'Taylor: grau perquè error < 10⁻ᵏ (parcial)', 2],
    ['interpolation', 'l6', 'Interpolació de Newton (parcial)', 2], ['newton', 'l7', 'Mètode de Newton (parcial)', 2]
  ];
  const wrapTex = s => (String(s).indexOf('$') >= 0 ? s : '$$' + s + '$$');
  const escHtml = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function adapt(q) {
    const raw = q.fields || [{ label: '', checker: q.checker }];
    const fields = raw.map(f => ({
      label: f.label || '', kind: 'leg',
      check: s => { const r = f.checker(s); return r && typeof r === 'object' ? r : { ok: !!r }; },
      ansTex: f.checker && f.checker.value != null ? M.numTex(f.checker.value) : ''
    }));
    const p = { type: 'multi', fields, legacy: true, hint: q.hint, sol: [q.solutionHtml || ('$$' + q.solutionLatex + '$$')] };
    p.q = wrapTex(q.promptLatex) + (q.instructions ? '<div class="muted small">' + escHtml(q.instructions) + '</div>' : '');
    return p;
  }
  function legacyMake(name) {
    return function (r) {
      const old = Math.random; Math.random = () => r();
      try { return adapt(Gen[name]()); } finally { Math.random = old; }
    };
  }
  /** Veu si cal registrar el material (només si els mòduls i els fitxers heretats són aquí). */
  function register() {
    d100Gens.forEach(g => Calc.addGen('l2', Object.assign({}, g, { src: 'p1' })));
    if (typeof Gen !== 'undefined') LEG.forEach(([name, mod, title, level]) => { if (Gen[name] && Calc.byId[mod]) Calc.addGen(mod, { id: 'p1_' + name, title, level, src: 'p1', make: legacyMake(name) }); });
  }
  register();
  Calc.p1 = Calc.p1 || {};
  Calc.p1.D100 = D100; Calc.p1.d100Item = d100Item; Calc.p1.adapt = adapt;
  if (typeof module !== 'undefined') module.exports = Calc.p1;
})(typeof window !== 'undefined' ? window : globalThis);
