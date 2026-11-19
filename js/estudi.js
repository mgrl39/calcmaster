/* =====================================================================
   estudi.js — Estudi de funcions (el problema de 3 punts del parcial i l'exercici 3 del seminari)
   1) Calc.estudi.full: estudi complet guiat, amb apartats com al parcial:
        (a) domini, simetria, asímptotes · (b) creixement i extrems · (c) convexitat i inflexió
      5 famílies (x³/(x²−c), x²/(x−a), x/(x²+c), (x²+c)/x, x⁴−2cx², x³−3cx). Les respostes
      són llistes de punts i unions d'intervals; tot es calcula a partir de f' i f'' (taula de signes).
      merge.js l'afegeix com a VARIANT de l4.p1_functionStudy (mateixa mestria que l'exercici de parcial).
   2) Conceptes per escrit (tipus nous de L3/L4): completar definicions i criteris amb la paraula
      o el símbol just (≤, f'(c)=0, convexa, f'/g'…). Corregeix amb sinònims i sense accents.
   ===================================================================== */
(function () {
  'use strict';
  const G = typeof window !== 'undefined' ? window : globalThis;
  const Calc = G.Calc, M = G.M;
  if (!Calc || !Calc.byId || !Calc.byId.l3 || !Calc.byId.l4) return;
  const P = Calc.P;
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* ---------------- text: normalitzar respostes ---------------- */
  const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’`´]/g, "'").replace(/−/g, '-').replace(/\s+/g, ' ').trim().replace(/[.!]+$/, '').trim();
  const CAP = /^(cap|no|no n'hi ha|no hi ha|res|cap punt|ninguna?|ninguno|none|-|∅|\{\}|buit)$/;
  const isCap = s => CAP.test(norm(s));

  /* ---------------- nombres exactes ---------------- */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  // √(p/q) simplificat: { v, t (TeX), s (com s'escriu a CalcMaster) }
  function sqrtQ(p, q) {
    q = q || 1;
    const n = p * q; let a = 1, b = n;
    for (let k = Math.floor(Math.sqrt(n)); k >= 2; k--) if (n % (k * k) === 0) { a = k; b = n / (k * k); break; }
    let den = q; const g = gcd(a, den); a /= g; den /= g;
    const coreT = b === 1 ? String(a) : (a === 1 ? '' : a) + '\\sqrt{' + b + '}';
    const coreS = b === 1 ? String(a) : (a === 1 ? '' : a + '*') + 'sqrt(' + b + ')';
    return { v: Math.sqrt(p / q), t: den === 1 ? coreT : '\\frac{' + coreT + '}{' + den + '}', s: den === 1 ? coreS : coreS + '/' + den };
  }
  const num = n => ({ v: n, t: M.numTex(n), s: String(n) });
  const neg = o => (o.v === 0 ? o : o.v < 0 ? { v: -o.v, t: o.t.replace(/^-/, ''), s: o.s.replace(/^-/, '') } : { v: -o.v, t: '-' + o.t, s: '-' + o.s });
  const NINF = { v: -Infinity, t: '-\\infty', s: '-inf' }, PINF = { v: Infinity, t: '+\\infty', s: 'inf' };
  const sg = n => (n >= 0 ? '+' + n : String(n));
  const approx = v => (Number.isInteger(Math.round(v * 1e9) / 1e9) ? String(Math.round(v)) : '\\approx ' + String(M.round(v, 3)).replace('.', '{,}'));

  /* ---------------- famílies de funcions ---------------- */
  // cada família: tex, fs (per a la gràfica), f, d1, d2, d1Tex, d2Tex, holes, crit (zeros de f'), z2 (zeros de f''), parity, asym
  const FAM = {
    cubrat(r) { // x³/(x²−c)  ← el del parcial (c=1)
      const c = r.pick([1, 1, 2, 3, 4]), s = sqrtQ(c), s3 = sqrtQ(3 * c);
      return { name: 'cubrat', tex: `\\dfrac{x^3}{x^2-${c}}`, fs: `x^3/(x^2-${c})`, f: x => x ** 3 / (x * x - c),
        d1: x => x * x * (x * x - 3 * c) / (x * x - c) ** 2, d2: x => 2 * c * x * (x * x + 3 * c) / (x * x - c) ** 3,
        d1Tex: `\\dfrac{x^2(x^2-${3 * c})}{(x^2-${c})^2}`, d2Tex: `\\dfrac{${2 * c}x(x^2+${3 * c})}{(x^2-${c})^3}`,
        holes: [neg(s), s], crit: [neg(s3), num(0), s3], z2: [num(0)], parity: 'senar',
        asym: { s: 'x', t: 'y=x', kind: 'obliqua', why: `Fent la divisió: $f(x)=x+\\dfrac{${c}x}{x^2-${c}}$, i la fracció tendeix a $0$ a $\\pm\\infty$: $m=\\lim\\frac{f(x)}{x}=1$, $n=\\lim(f(x)-x)=0$.` },
        yr: [-4 * s3.v - 2, 4 * s3.v + 2], xr: [-3 * s3.v, 3 * s3.v] };
    },
    sqlin(r) { // x²/(x−a)
      const a = r.pick([-3, -2, -1, 1, 2, 3]), lo = Math.min(0, 2 * a), hi = Math.max(0, 2 * a);
      return { name: 'sqlin', tex: `\\dfrac{x^2}{x${sg(-a)}}`, fs: `x^2/(x-(${a}))`, f: x => x * x / (x - a),
        d1: x => x * (x - 2 * a) / (x - a) ** 2, d2: x => 2 * a * a / (x - a) ** 3,
        d1Tex: `\\dfrac{x(x${sg(-2 * a)})}{(x${sg(-a)})^2}`, d2Tex: `\\dfrac{${2 * a * a}}{(x${sg(-a)})^3}`,
        holes: [num(a)], crit: [num(lo), num(hi)], z2: [], parity: 'cap',
        asym: { s: `x+(${a})`, t: `y=x${sg(a)}`, kind: 'obliqua', why: `Fent la divisió: $f(x)=x${sg(a)}+\\dfrac{${a * a}}{x${sg(-a)}}$, i la fracció tendeix a $0$: $y=x${sg(a)}$.` },
        yr: [Math.min(lo, hi) - 10, Math.max(lo, hi) + 10], xr: [a - 7, a + 7] };
    },
    bell(r) { // x/(x²+c)
      const c = r.pick([1, 3, 4]), s = sqrtQ(c), s3 = sqrtQ(3 * c);
      return { name: 'bell', tex: `\\dfrac{x}{x^2+${c}}`, fs: `x/(x^2+${c})`, f: x => x / (x * x + c),
        d1: x => (c - x * x) / (x * x + c) ** 2, d2: x => 2 * x * (x * x - 3 * c) / (x * x + c) ** 3,
        d1Tex: `\\dfrac{${c}-x^2}{(x^2+${c})^2}`, d2Tex: `\\dfrac{2x(x^2-${3 * c})}{(x^2+${c})^3}`,
        holes: [], crit: [neg(s), s], z2: [neg(s3), num(0), s3], parity: 'senar',
        asym: { s: '0', t: 'y=0', kind: 'horitzontal', why: 'Grau de dalt (1) < grau de baix (2): $\\lim_{x\\to\\pm\\infty}f(x)=0$. Asímptota horitzontal $y=0$.' },
        xr: [-3 * s3.v, 3 * s3.v] };
    },
    hyper(r) { // (x²+c)/x = x + c/x
      const c = r.pick([1, 2, 4, 9]), s = sqrtQ(c);
      return { name: 'hyper', tex: `\\dfrac{x^2+${c}}{x}`, fs: `(x^2+${c})/x`, f: x => (x * x + c) / x,
        d1: x => (x * x - c) / (x * x), d2: x => 2 * c / x ** 3,
        d1Tex: `\\dfrac{x^2-${c}}{x^2}`, d2Tex: `\\dfrac{${2 * c}}{x^3}`,
        holes: [num(0)], crit: [neg(s), s], z2: [], parity: 'senar',
        asym: { s: 'x', t: 'y=x', kind: 'obliqua', why: `$f(x)=x+\\dfrac{${c}}{x}$ i $\\frac{${c}}{x}\\to0$: asímptota obliqua $y=x$.` },
        yr: [-6 * s.v - 2, 6 * s.v + 2], xr: [-4 * s.v, 4 * s.v] };
    },
    quart(r) { // x⁴ − 2c x²
      const c = r.pick([1, 2, 3, 4]), k = sqrtQ(c), kk = sqrtQ(c, 3);
      return { name: 'quart', tex: `x^4-${2 * c}x^2`, fs: `x^4-${2 * c}*x^2`, f: x => x ** 4 - 2 * c * x * x,
        d1: x => 4 * x * (x * x - c), d2: x => 12 * x * x - 4 * c,
        d1Tex: `4x^3-${4 * c}x=4x(x^2-${c})`, d2Tex: `12x^2-${4 * c}`,
        holes: [], crit: [neg(k), num(0), k], z2: [neg(kk), kk], parity: 'parell', asym: null,
        xr: [-1.8 * k.v, 1.8 * k.v] };
    },
    cubic(r) { // x³ − 3c x (+ d)
      const c = r.pick([1, 2, 3, 4]), d = r.pick([0, 0, -2, 1, 3]), k = sqrtQ(c);
      return { name: 'cubic', tex: M.polyTex([d, -3 * c, 0, 1]), fs: M.polyStr([d, -3 * c, 0, 1]), f: x => x ** 3 - 3 * c * x + d,
        d1: x => 3 * (x * x - c), d2: x => 6 * x,
        d1Tex: `3x^2-${3 * c}=3(x^2-${c})`, d2Tex: '6x',
        holes: [], crit: [neg(k), k], z2: [num(0)], parity: d === 0 ? 'senar' : 'cap', asym: null,
        xr: [-2.2 * k.v, 2.2 * k.v] };
    },
  };
  const FAM_W = ['cubrat', 'cubrat', 'sqlin', 'bell', 'hyper', 'quart', 'cubic'];

  /* ---------------- anàlisi automàtica: taula de signes ---------------- */
  const uniqSort = arr => arr.slice().sort((a, b) => a.v - b.v).filter((o, i, A) => !i || Math.abs(o.v - A[i - 1].v) > 1e-9);
  const isHole = (F, o) => F.holes.some(h => Math.abs(h.v - o.v) < 1e-9);
  // intervals entre punts de tall, amb el signe de g al mig
  function signIntervals(F, g, zeros) {
    const bps = uniqSort(F.holes.concat(zeros)), ends = [NINF].concat(bps, [PINF]), out = [];
    for (let i = 0; i < ends.length - 1; i++) {
      const a = ends[i], b = ends[i + 1];
      const m = !isFinite(a.v) && !isFinite(b.v) ? 0 : !isFinite(a.v) ? b.v - 1 : !isFinite(b.v) ? a.v + 1 : (a.v + b.v) / 2;
      out.push({ a, b, s: Math.sign(g(m)) });
    }
    return { bps, ivs: out };
  }
  // ajunta intervals contigus amb el mateix signe si el punt del mig és del domini (per mostrar la resposta)
  function mergeIv(F, ivs) {
    const out = [];
    ivs.forEach(I => { const L = out[out.length - 1]; if (L && Math.abs(L.b.v - I.a.v) < 1e-9 && !isHole(F, I.a)) L.b = I.b; else out.push({ a: I.a, b: I.b }); });
    return out;
  }
  function analyse(F) {
    const T1 = signIntervals(F, F.d1, F.crit), T2 = signIntervals(F, F.d2, F.z2);
    const side = (T, o) => { const i = T.ivs.findIndex(I => Math.abs(I.b.v - o.v) < 1e-9); return [T.ivs[i].s, T.ivs[i + 1].s]; };
    const max = [], min = [], flat = [], infl = [], noinfl = [];
    F.crit.forEach(o => { const [l, rr] = side(T1, o); if (l > 0 && rr < 0) max.push(o); else if (l < 0 && rr > 0) min.push(o); else flat.push(o); });
    F.z2.forEach(o => { const [l, rr] = side(T2, o); if (l !== rr) infl.push(o); else noinfl.push(o); });
    const pick = (T, s) => mergeIv(F, T.ivs.filter(I => I.s === s));
    return { T1, T2, inc: pick(T1, 1), dec: pick(T1, -1), conv: pick(T2, 1), conc: pick(T2, -1), max, min, flat, infl, noinfl };
  }

  /* ---------------- lectura de respostes: llistes i intervals ---------------- */
  function val(s) {
    const t = norm(s).replace(/^x\s*=\s*/, '').replace(/∞|infinit|infinito|infty/g, 'inf').replace(/\s+/g, '');
    if (/^\+?inf$/.test(t)) return Infinity;
    if (/^-inf$/.test(t)) return -Infinity;
    const v = M.parseConst(t); if (!isFinite(v)) throw new Error('valor'); return v;
  }
  function parseList(s) {
    if (isCap(s)) return [];
    const parts = norm(s).replace(/^x\s*=\s*/, '').split(/\s*(?:;|,|\bi\b|\by\b|\band\b)\s*/).filter(Boolean), out = [];
    parts.forEach(p => { const m = p.match(/^(?:±|\+-|\+\/-)\s*(.+)$/); if (m) { const v = val(m[1]); out.push(-v, v); } else out.push(val(p)); });
    if (!out.length) throw new Error('buit');
    return out.sort((a, b) => a - b);
  }
  const close = (a, b) => (!isFinite(a) || !isFinite(b) ? a === b : Math.abs(a - b) <= 2e-3 * Math.max(1, Math.abs(b)));
  const checkList = exp => s => { const u = parseList(s); return { ok: u.length === exp.length && u.every((v, i) => close(v, exp[i].v)) }; };
  // «(-inf,-1)U(2,inf)», «(−√3, −1) ∪ (1, √3)», «R», «cap». Els extrems poden portar parèntesis (sqrt(3)).
  function parseIv(s) {
    const t = norm(s).replace(/∪/g, ' u ');
    if (isCap(t)) return [];
    if (/^(r|ℝ|tot r|tots els reals|\(-inf,\s*\+?inf\))$/.test(t.replace(/∞/g, 'inf'))) return [[-Infinity, Infinity]];
    const out = []; let i = 0;
    while (i < t.length) {
      const ch = t[i];
      if (ch !== '(' && ch !== '[' && ch !== ']') { if (!/[\su,;i]/.test(ch)) throw new Error('format'); i++; continue; }
      i++; let depth = 0, buf = '', left = null;
      for (; i < t.length; i++) {
        const c = t[i];
        if (c === '(') { depth++; buf += c; continue; }
        if ((c === ')' || c === ']' || c === '[') && depth === 0) break;
        if (c === ')') { depth--; buf += c; continue; }
        if ((c === ',' || c === ';') && depth === 0 && left === null) { left = buf; buf = ''; continue; }
        buf += c;
      }
      if (i >= t.length || left === null) throw new Error('format');
      i++;
      const a = val(left), b = val(buf);
      if (!(a < b)) throw new Error('ordre');
      out.push(Object.assign([a, b], { ra: left, rb: buf }));
    }
    if (!out.length) throw new Error('format');
    return out;
  }
  const checkIv = (exp, holes) => s => {
    let U = parseIv(s);
    const keys = exp.flatMap(I => [I.a.v, I.b.v]).concat(holes.map(h => h.v)).filter(isFinite);
    const snap = v => { const k = keys.find(x => close(v, x)); return k == null ? v : k; };
    U = U.map(([a, b]) => [snap(a), snap(b)]);
    for (const h of holes) if (U.some(([a, b]) => a < h.v - 1e-9 && h.v + 1e-9 < b)) return { ok: false, error: 'Un interval conté x=' + M.round(h.v, 3) + ', que no és del domini: s\'ha de partir allà.' };
    const bps = [...new Set(U.flat().concat(keys).filter(isFinite))].sort((a, b) => a - b);
    const pts = bps.length ? [bps[0] - 1].concat(bps.slice(1).map((b, i) => (b + bps[i]) / 2), [bps[bps.length - 1] + 1]) : [0];
    const inU = x => U.some(([a, b]) => a < x && x < b), inE = x => exp.some(I => I.a.v < x && x < I.b.v);
    return { ok: pts.every(x => inU(x) === inE(x)) };
  };
  const ivTex = ivs => (ivs.length ? ivs.map(I => `(${I.a.t},\\,${I.b.t})`).join('\\cup ') : '\\text{cap}');
  const ivStr = ivs => (ivs.length ? ivs.map(I => `(${I.a.s},${I.b.s})`).join('U') : 'cap');
  const listTex = os => (os.length ? os.map(o => o.t).join(',\\ ') : '\\text{cap}');
  const listStr = os => (os.length ? os.map(o => o.s).join('; ') : 'cap');
  // vista prèvia: el que ha escrit l'estudiant (√3, no 1,732), si es pot; si no, el valor
  const texOf = (raw, v) => { if (!isFinite(v)) return v > 0 ? '+\\infty' : '-\\infty'; try { return M.tex(norm(raw).replace(/^x\s*=\s*/, '')); } catch (e) { return M.numTex(v); } };
  const prevIv = s => { const U = parseIv(s); return U.length ? U.map(I => `(${texOf(I.ra, I[0])},\\,${texOf(I.rb, I[1])})`).join('\\cup ') : '\\text{cap}'; };
  const prevList = s => {
    if (isCap(s)) return '\\text{cap}';
    parseList(s); // llança si no s'entén
    const parts = norm(s).replace(/^x\s*=\s*/, '').split(/\s*(?:;|,|\bi\b|\by\b|\band\b)\s*/).filter(Boolean);
    return 'x=' + parts.map(q => { const m = q.match(/^(?:±|\+-|\+\/-)\s*(.+)$/); return m ? '\\pm' + texOf(m[1], val(m[1])) : texOf(q, val(q)); }).join(',\\ ');
  };
  const PARITY = { parell: /^(parell|parella|par|even|simetrica respecte (de )?l'eix( y| oy| vertical)?|eix y)$/, senar: /^(senar|imparell|impar|odd|simetrica respecte (de )?l'origen|origen)$/, cap: /^(cap|ni parell ni senar|ni par ni impar|no|cap simetria|no te simetria|ninguna)$/ };

  const F_DOM = (F) => ({ label: 'Punts fora del domini:', ph: 'p.ex. -1; 1   (o «cap»)', kind: 'est', check: checkList(uniqSort(F.holes)), ans: listStr(uniqSort(F.holes)), ansTex: listTex(uniqSort(F.holes)), prev: prevList });
  const F_PAR = (F) => ({ label: 'Simetria:', ph: 'parell / senar / cap', kind: 'est', check: s => ({ ok: PARITY[F.parity].test(norm(s)) }), ans: F.parity, ansTex: '\\text{' + F.parity + '}', prev: () => '' });
  const F_AV = (F) => ({ label: 'Asímptotes verticals $x=$', ph: 'p.ex. -1; 1   (o «cap»)', kind: 'est', check: checkList(uniqSort(F.holes)), ans: listStr(uniqSort(F.holes)), ansTex: listTex(uniqSort(F.holes)), prev: prevList });
  const F_AS = (F) => ({ label: 'Asímptota horitzontal o obliqua $y=$', ph: 'p.ex. x+2   (o «cap»)', kind: 'est', ans: F.asym ? F.asym.s : 'cap', ansTex: F.asym ? F.asym.t : '\\text{cap}', prev: s => (isCap(s) ? '\\text{cap}' : 'y=' + M.tex(String(s).replace(/^\s*y\s*=\s*/i, ''))),
    check: s => (F.asym ? (isCap(s) ? { ok: false } : M.checkFn(String(s).replace(/^\s*y\s*=\s*/i, ''), F.asym.s)) : { ok: isCap(s) }) });
  const F_IV = (label, ivs, F) => ({ label, ph: 'p.ex. (-inf,-1)U(2,inf)   (o «cap»)', kind: 'est', check: checkIv(ivs, F.holes), ans: ivStr(ivs), ansTex: ivTex(ivs), prev: prevIv });
  const F_PT = (label, os) => ({ label, ph: 'p.ex. -2; sqrt(3)   (o «cap»)', kind: 'est', check: checkList(os), ans: listStr(os), ansTex: listTex(os), prev: prevList });

  /* ---------------- solució: taules de signes ---------------- */
  function signTable(F, T, which) {
    const cols = [], d = which === 1;
    T.ivs.forEach((I, i) => {
      cols.push({ h: `$(${I.a.t},${I.b.t})$`, s: I.s > 0 ? '+' : '−', f: d ? (I.s > 0 ? '↗' : '↘') : (I.s > 0 ? '∪' : '∩'), cls: I.s > 0 ? 'pos' : 'neg' });
      const b = T.bps[i]; if (!b) return;
      const hole = isHole(F, b), l = I.s, rr = T.ivs[i + 1].s;
      cols.push({ h: `$${b.t}$`, s: hole ? '∄' : '0', f: hole ? '∄' : d ? (l > 0 && rr < 0 ? 'màx' : l < 0 && rr > 0 ? 'mín' : '—') : (l !== rr ? 'infl.' : '—'), pt: 1 });
    });
    return `<div class="signwrap"><table class="signtab"><tr><th>$x$</th>${cols.map(c => `<td class="${c.pt ? 'pt' : ''}">${c.h}</td>`).join('')}</tr>
      <tr><th>$f${d ? "'" : "''"}$</th>${cols.map(c => `<td class="${c.pt ? 'pt' : c.cls}">${c.s}</td>`).join('')}</tr>
      <tr><th>$f$</th>${cols.map(c => `<td class="${c.pt ? 'pt' : c.cls}">${c.f}</td>`).join('')}</tr></table></div>`;
  }
  const fv = (F, o) => { const v = F.f(o.v); return approx(v).startsWith('\\approx') ? approx(v) : '=' + approx(v); };

  function solA(F) {
    const H = uniqSort(F.holes), out = [];
    out.push('<b>(a) Domini.</b> ' + (H.length ? `El denominador s'anul·la a $x=${listTex(H)}$: $D=\\mathbb R\\setminus\\{${H.map(h => h.t).join(',')}\\}$.` : (F.asym ? 'El denominador no s\'anul·la mai: $D=\\mathbb R$.' : 'És un polinomi: $D=\\mathbb R$.')));
    const a = [1, 2, 3, 4].find(x => !isHole(F, num(x)) && !isHole(F, num(-x)));
    out.push('<b>Simetria.</b> ' + (F.parity === 'senar' ? 'Canviant $x$ per $-x$: $f(-x)=-f(x)$. És <b>senar</b> (simètrica respecte de l\'origen): n\'hi ha prou d\'estudiar $x>0$.' : F.parity === 'parell' ? 'Canviant $x$ per $-x$: $f(-x)=f(x)$. És <b>parell</b> (simètrica respecte de l\'eix $OY$).' : `No és ni parell ni senar: per exemple $f(${a})=${M.numTex(M.round(F.f(a), 4))}$ i $f(-${a})=${M.numTex(M.round(F.f(-a), 4))}$, que no són iguals ni oposats.`));
    out.push('<b>Asímptotes verticals.</b> ' + (H.length ? `Als punts fora del domini el numerador no s'anul·la i el denominador tendeix a $0$: $\\lim_{x\\to a^\\pm}f(x)=\\pm\\infty$. AV a $x=${listTex(H)}$.` : 'Cap: $f$ és contínua a tot $\\mathbb R$.'));
    out.push('<b>Asímptota horitzontal / obliqua.</b> ' + (F.asym ? F.asym.why : 'Cap: un polinomi de grau $\\ge2$ va a $\\pm\\infty$ més ràpid que qualsevol recta.'));
    return out;
  }
  function solB(F, A) {
    const H = uniqSort(F.holes), out = [];
    out.push(`<b>(b) Creixement.</b> $f'(x)=${F.d1Tex}$. Candidats: $f'(x)=0\\iff x=${listTex(F.crit)}$${H.length ? `; i els punts fora del domini ($x=${listTex(H)}$), que no poden ser extrems però separen intervals` : ''}.`);
    out.push('Taula de signes de $f\'$ (prova un punt de cada interval):' + signTable(F, A.T1, 1));
    out.push(`Creixent on $f'>0$: $${ivTex(A.inc)}$. Decreixent on $f'<0$: $${ivTex(A.dec)}$.`);
    const ex = [];
    A.max.forEach(o => ex.push(`<b>màxim relatiu</b> a $x=${o.t}$ ($f'$ passa de $+$ a $-$), $f(${o.t})${fv(F, o)}$`));
    A.min.forEach(o => ex.push(`<b>mínim relatiu</b> a $x=${o.t}$ ($f'$ passa de $-$ a $+$), $f(${o.t})${fv(F, o)}$`));
    A.flat.forEach(o => ex.push(`a $x=${o.t}$, $f'=0$ però <b>no canvia de signe</b>: no és extrem`));
    out.push('Extrems: ' + (ex.length ? ex.join('; ') : 'cap') + '.');
    return out;
  }
  function solC(F, A) {
    const H = uniqSort(F.holes), out = [];
    out.push(`<b>(c) Curvatura.</b> $f''(x)=${F.d2Tex}$. ${F.z2.length ? `$f''(x)=0\\iff x=${listTex(F.z2)}$.` : '$f\'\'$ no s\'anul·la mai.'}${H.length ? ` També canvia de signe als punts fora del domini ($x=${listTex(H)}$).` : ''}`);
    out.push('Taula de signes de $f\'\'$:' + signTable(F, A.T2, 2));
    out.push(`<b>Convexa</b> ($\\cup$, $f''>0$): $${ivTex(A.conv)}$. <b>Còncava</b> ($\\cap$, $f''<0$): $${ivTex(A.conc)}$.`);
    out.push('Punts d\'inflexió: ' + (A.infl.length ? A.infl.map(o => `$x=${o.t}$ (canvia la curvatura i és del domini), $f(${o.t})${fv(F, o)}$`).join('; ') : 'cap') + (H.length ? `. Compte: a $x=${listTex(H)}$ canvia la curvatura però <b>no és inflexió</b>, perquè no és del domini.` : '.'));
    return out;
  }

  const PARTS = { a: '(a) Domini, simetria i asímptotes', b: '(b) Intervals de creixement i extrems relatius', c: '(c) Convexitat, concavitat i punts d\'inflexió', full: 'Estudi complet: (a), (b) i (c)' };
  const full = {
    id: 'full', title: 'Estudi complet d\'una funció (com el parcial)', level: 3,
    make(r, forcePart) {
      const F = FAM[r.pick(FAM_W)](r), A = analyse(F);
      const part = forcePart || r.pick(['a', 'b', 'b', 'c', 'c', 'full']);
      let fields = [], sol = [];
      if (part === 'a' || part === 'full') { fields = fields.concat([F_DOM(F), F_PAR(F), F_AV(F), F_AS(F)]); sol = sol.concat(solA(F)); }
      if (part === 'b' || part === 'full') { fields = fields.concat([F_IV('Creixent a:', A.inc, F), F_IV('Decreixent a:', A.dec, F), F_PT('Màxims relatius $x=$', A.max), F_PT('Mínims relatius $x=$', A.min)]); sol = sol.concat(solB(F, A)); }
      if (part === 'c' || part === 'full') { fields = fields.concat([F_IV('Convexa ($\\cup$) a:', A.conv, F), F_IV('Còncava ($\\cap$) a:', A.conc, F), F_PT('Punts d\'inflexió $x=$', A.infl)]); sol = sol.concat(solC(F, A)); }
      const p = P.multi(`Considereu $$f(x)=${F.tex}$$ <b>${PARTS[part]}.</b><div class="muted small">Intervals com <code>(-inf,-1)U(2,inf)</code> · llistes amb <code>;</code> · arrels amb <code>sqrt(3)</code> · si no n'hi ha, <code>cap</code>.</div>`, fields, sol,
        { hint: part === 'a' ? 'Domini: on s\'anul·la el denominador? Simetria: calcula f(−x). Obliqua: fes la divisió.' : part === 'b' ? 'Deriva, iguala f\' a 0 i fes la taula de signes de f\' (posa-hi també els punts fora del domini).' : 'Deriva dues vegades, iguala f\'\' a 0 i fes la taula de signes de f\'\'. Un punt fora del domini no pot ser inflexió.' });
      p.part = part; p.fam = F.name;
      const pts = A.max.concat(A.min, A.infl).map(o => [o.v, F.f(o.v)]);
      p.solPlot = { fns: [{ f: F.fs, label: 'f' }].concat(F.asym && F.asym.kind === 'obliqua' ? [{ f: F.asym.s, label: F.asym.t }] : []), xr: F.xr, points: pts };
      if (F.yr) p.solPlot.yr = F.yr;
      return p;
    },
  };

  /* =====================================================================
     CONCEPTES PER ESCRIT — cada pregunta són 2 enunciats amb buits ⟨1⟩, ⟨2⟩…
     acc: respostes acceptades (ja normalitzades) o RegExp; t: TeX de la resposta
     ===================================================================== */
  const W = (ans, acc, t) => ({ ans, acc, t: t || '\\text{' + ans + '}' });
  const LE = W('≤', ['<=', '≤', '=<', 'menor o igual', 'mes petit o igual', 'menor o igual que', 'mes petit o igual que'], '\\le');
  const GE = W('≥', ['>=', '≥', '=>', 'major o igual', 'mes gran o igual', 'major o igual que', 'mes gran o igual que'], '\\ge');
  const LT = W('<', ['<', 'menor', 'mes petit', 'menor que', 'mes petit que'], '<');
  const GT = W('>', ['>', 'major', 'mes gran', 'major que', 'mes gran que'], '>');
  const POS = W('+', ['+', 'positiu', 'positiva', 'positius', 'positives', '>0', '> 0', 'mes gran que 0', 'major que 0', 'mes', 'positivo'], '+');
  const NEG = W('−', ['-', 'negatiu', 'negativa', 'negatius', 'negatives', '<0', '< 0', 'menor que 0', 'mes petit que 0', 'menys', 'negativo'], '-');
  const ZERO = W('0', ['0', 'zero', 'cero', '=0', '= 0'], '0');
  const SI = W('sí', ['si', 's', 'yes', 'cert', 'vertader', 'true']), NO = W('no', ['no', 'n', 'fals', 'false', 'mai']);
  const DER = W("f'", ["f'", "f'(x)", 'la derivada', 'derivada', 'f prima', "f '"], "f'");
  const DER2 = W("f''", ["f''", "f''(x)", 'la segona derivada', 'segona derivada', "f' '", 'f segona'], "f''");
  const SIGNE = W('signe', ['signe', 'el signe', 'signo', 'de signe']);
  const INF = W('±∞', [/^(\+|-|±|\+-|\+\/-)?\s*(inf|infinit|infinito|∞)$/], '\\pm\\infty');

  const BANK = {
    extrem: [
      { q: 'Definició: $f$ és <b>creixent</b> en $I$ si per a tot $x_1\\lt x_2$ de $I$ es compleix $f(x_1)$ ⟨1⟩ $f(x_2)$. I és <b>decreixent</b> si $f(x_1)$ ⟨2⟩ $f(x_2)$.', b: [W('≤', LE.acc.concat(LT.acc), '\\le'), W('≥', GE.acc.concat(GT.acc), '\\ge')], why: 'Creixent: si avances cap a la dreta, la $f$ no baixa ($\\le$; amb $<$ es diu <i>estrictament</i> creixent). Decreixent: $\\ge$.' },
      { q: 'Criteri de la derivada: si $f\'(x)>0$ per a tota $x$ d\'un interval $I$, $f$ és ⟨1⟩ a $I$; si $f\'(x)<0$, és ⟨2⟩.', b: [W('creixent', ['creixent', 'estrictament creixent', 'creciente', 'puja']), W('decreixent', ['decreixent', 'estrictament decreixent', 'decreciente', 'baixa'])], why: '$f\'$ és el pendent de la tangent: pendent positiu → puja; negatiu → baixa (és el teorema del valor mitjà).' },
      { q: 'Definició: $c$ és un <b>màxim relatiu</b> de $f$ si hi ha un entorn de $c$ on $f(x)$ ⟨1⟩ $f(c)$ per a tota $x$ de l\'entorn. És un <b>mínim relatiu</b> si $f(x)$ ⟨2⟩ $f(c)$.', b: [LE, GE], why: 'Màxim relatiu: a prop de $c$ cap valor supera $f(c)$. «Relatiu» (o local) vol dir «només a prop de $c$», no a tot el domini.' },
      { q: 'Condició necessària (Fermat): si $f$ és derivable a $c$ i $c$ és un extrem relatiu, aleshores $f\'(c)=$ ⟨1⟩. Per això els candidats a extrem són els punts amb $f\'(c)=0$ i els punts on $f$ no és ⟨2⟩.', b: [ZERO, W('derivable', ['derivable', 'diferenciable', 'derivable en c'])], why: 'Al cim d\'una muntanya llisa la tangent és horitzontal. Però també cal mirar els punts on no hi ha derivada (com $|x|$ a $0$, que hi té un mínim).' },
      { q: 'Si $f\'(c)=0$, segur que $c$ és un extrem? ⟨1⟩ (sí/no). Contraexemple: $f(x)=x^{⟨2⟩}$ a $c=0$.', b: [NO, W('3', [/^(3|5|7|9|11)$/], '3')], why: '$f(x)=x^3$: $f\'(0)=0$ però $f\'=3x^2\\ge0$ no canvia de signe, i $f$ continua pujant. $f\'(c)=0$ és necessari, no suficient.' },
      { q: 'Criteri de la 1a derivada: si $f\'$ passa de ⟨1⟩ (a l\'esquerra de $c$) a ⟨2⟩ (a la dreta), $c$ és un <b>màxim</b> relatiu.', b: [POS, NEG], why: 'Puja i després baixa: és el cim. Al revés ($-$ a $+$) és un mínim. Si no canvia de signe, no és extrem.' },
      { q: 'Criteri de la 2a derivada: si $f\'(c)=0$ i $f\'\'(c)$ ⟨1⟩ $0$, $c$ és un <b>mínim</b> relatiu. Si $f\'(c)=0$ i $f\'\'(c)<0$, és un ⟨2⟩ relatiu.', b: [GT, W('màxim', ['maxim', 'maximo', 'max'])], why: '$f\'\'>0$: forma $\\cup$, la tangent horitzontal és al fons → mínim. $f\'\'<0$: forma $\\cap$ → màxim. Si $f\'\'(c)=0$ el criteri <b>no decideix</b>: cal la taula de signes de $f\'$.' },
      { q: 'Extrems <b>absoluts</b> en $[a,b]$: si $f$ és contínua a $[a,b]$, el màxim i el mínim absoluts existeixen pel teorema de ⟨1⟩. Els candidats són els punts crítics de dins de l\'interval i els ⟨2⟩ de l\'interval.', b: [W('Weierstrass', ['weierstrass', 'weirstrass', 'weierstras', 'de weierstrass']), W('extrems', ['extrems', 'extrems a i b', 'a i b', 'punts extrems', 'extremos', 'bords', 'limits'])], why: 'Weierstrass garanteix que existeixen. Es calcula $f$ als crítics de dins i a $a$ i $b$, i es tria el valor més gran i el més petit.' },
      { q: 'Recepta per trobar els mínims relatius: (1) calcula ⟨1⟩; (2) resol $f\'(x)=0$ i afegeix els punts fora del domini; (3) estudia el ⟨2⟩ de $f\'$ a cada interval; (4) és mínim on $f\'$ passa de $-$ a $+$.', b: [DER, SIGNE], why: 'És el mètode de la taula de signes. A l\'examen escriu la taula i la frase «com que $f\'$ passa de $-$ a $+$ a $x=c$, $f$ té un mínim relatiu a $x=c$».' },
      { q: 'Un polinomi de grau senar (p. ex. $x^3-x$) té màxim absolut a $\\mathbb R$? ⟨1⟩ (sí/no). Perquè $\\lim_{x\\to+\\infty}f(x)=$ ⟨2⟩ (si el coeficient principal és positiu).', b: [NO, W('+∞', [/^\+?\s*(inf|infinit|infinito|∞)$/], '+\\infty')], why: 'Va a $+\\infty$ per un costat i a $-\\infty$ per l\'altre: per molt gran que sigui un valor, sempre n\'hi ha un de més gran. Així es justifica al seminari.' },
    ],
    curv: [
      { q: 'Convenció del curs (llista 3): si $f\'\'(x)>0$ a $I$, $f$ és ⟨1⟩ a $I$ (forma $\\cup$); si $f\'\'(x)<0$, és ⟨2⟩ (forma $\\cap$).', b: [W('convexa', ['convexa', 'convex', 'concava cap amunt', 'concava hacia arriba', 'convexo']), W('còncava', ['concava', 'concau', 'concava cap avall', 'concava hacia abajo', 'concavo'])], why: 'A la UAB (llista 3): <b>convexa = ∪</b>, <b>còncava = ∩</b>. Alguns llibres de batxillerat ho diuen al revés: a l\'examen, escriu sempre també el dibuix ($\\cup$/$\\cap$) o «$f\'\'>0$» perquè no hi hagi dubte.' },
      { q: 'Si $f$ és convexa ($\\cup$), la gràfica queda per ⟨1⟩ de les seves rectes tangents. Si és còncava ($\\cap$), queda per ⟨2⟩.', b: [W('sobre', ['sobre', 'damunt', 'a sobre', 'dalt', 'a dalt', 'encima', 'sobre de', 'damunt de']), W('sota', ['sota', 'davall', 'a sota', 'baix', 'a baix', 'debajo', 'sota de'])], why: 'Pensa en $x^2$ ($\\cup$): totes les tangents queden per sota de la paràbola.' },
      { q: 'Un <b>punt d\'inflexió</b> és un punt del ⟨1⟩ de $f$ on $f$ és contínua i ⟨2⟩ la curvatura (passa de $\\cup$ a $\\cap$ o al revés).', b: [W('domini', ['domini', 'dominio', 'domini de f']), W('canvia', ['canvia', 'canvia de', 'cambia', 'canvi de', 'canvia la'])], why: 'Les dues coses calen: ha de ser del domini (un forat o una asímptota vertical no és inflexió) i la curvatura ha de canviar.' },
      { q: 'Si $c$ és un punt d\'inflexió i existeix $f\'\'(c)$, aleshores $f\'\'(c)=$ ⟨1⟩. El recíproc és cert? ⟨2⟩ (sí/no).', b: [ZERO, NO], why: 'Contraexemple: $f(x)=x^4$ té $f\'\'(0)=0$ però és $\\cup$ a tot arreu: no hi ha inflexió. $f\'\'(c)=0$ és necessari, no suficient: cal que $f\'\'$ <b>canviï de signe</b>.' },
      { q: '$f(x)=x^4$: $f\'\'(0)=0$. És $x=0$ un punt d\'inflexió? ⟨1⟩ (sí/no). Perquè $f\'\'(x)=12x^2$ no canvia de ⟨2⟩.', b: [NO, SIGNE], why: '$12x^2\\ge0$ a banda i banda de $0$: és convexa a tot $\\mathbb R$.' },
      { q: '$f(x)=\\frac1x$: és convexa a $(0,+\\infty)$ i còncava a $(-\\infty,0)$. Té un punt d\'inflexió a $x=0$? ⟨1⟩ (sí/no). Perquè $0$ no és del ⟨2⟩.', b: [NO, W('domini', ['domini', 'dominio'])], why: 'Canvia la curvatura, però $x=0$ no és del domini (hi ha una asímptota vertical).' },
      { q: 'Recepta per trobar els punts d\'inflexió: resol ⟨1⟩ $=0$ (i afegeix els punts fora del domini), fes la taula de signes i quedat amb els punts del domini on ⟨2⟩ el signe.', b: [DER2, W('canvia', ['canvia', 'canvia de', 'cambia', 'hi ha canvi de'])], why: 'A l\'examen: «$f\'\'$ passa de $-$ a $+$ a $x=c$ i $c\\in D$: punt d\'inflexió $(c,f(c))$».' },
      { q: 'Si $f\'(c)=0$ però $f\'$ <b>no</b> canvia de signe (com $x^3$ a $0$), el punt és ⟨1⟩ (màxim/mínim/inflexió).', b: [W('inflexió', ['inflexio', 'punt d\'inflexio', 'inflexion', 'inflexio amb tangent horitzontal', 'un punt d\'inflexio'])], why: 'És una inflexió amb tangent horitzontal (va passar al parcial amb $\\frac{x^3}{x^2-1}$ a $x=0$).' },
    ],
    indet: [
      { gen: true },
      { gen: 'lhop' },
      { q: 'L\'Hôpital es pot aplicar <b>directament</b> només a dues formes: ⟨1⟩ (escriu-les totes dues).', b: [{ ans: '0/0 i ∞/∞', t: '\\frac00\\ \\text{i}\\ \\frac{\\infty}{\\infty}', acc: [s => { const t = s.replace(/infinit|infinito|∞|infty/g, 'inf').replace(/\s/g, ''); return /0\/0/.test(t) && /inf\/inf/.test(t); }] }], why: 'Les altres ($0\\cdot\\infty$, $\\infty-\\infty$, $1^\\infty$, $0^0$, $\\infty^0$) primer s\'han de transformar en una d\'aquestes dues.' },
      { q: 'Regla de L\'Hôpital: si $\\lim\\frac{f}{g}$ és $\\frac00$ o $\\frac\\infty\\infty$ i existeix el límit de la dreta, $\\lim\\frac{f(x)}{g(x)}=\\lim$ ⟨1⟩.', b: [{ ans: "f'/g'", t: "\\frac{f'(x)}{g'(x)}", acc: [s => ["f'/g'", "f'(x)/g'(x)", "(f')/(g')", "f'(x)/g'", "f'/g'(x)"].includes(s.replace(/\s/g, ''))] }], why: 'Es deriven el numerador i el denominador <b>per separat</b>. No és la derivada del quocient $\\left(\\frac fg\\right)\'$: aquest és l\'error més típic.' },
      { q: 'Per a la forma $0\\cdot\\infty$, abans de L\'Hôpital s\'escriu com un ⟨1⟩: $f\\cdot g=\\dfrac{f}{1/g}$.', b: [W('quocient', ['quocient', 'cocient', 'cociente', 'fraccio', 'fraccion', 'divisio', 'division', 'un quocient', 'una fraccio'])], why: 'Així passa a ser $\\frac00$ o $\\frac\\infty\\infty$. Tria baixar el factor que dona una derivada més fàcil (sovint es deixa $\\ln x$ a dalt).' },
      { q: 'Per a $1^\\infty$, $0^0$ i $\\infty^0$: $f(x)^{g(x)}=e^{⟨1⟩}$, i es calcula el límit de l\'exponent.', b: [{ ans: 'g·ln f', t: 'g(x)\\ln f(x)', acc: [s => { const t = s.replace(/[\s*·]/g, '').replace(/\(x\)/g, '').replace(/log/g, 'ln'); return ['glnf', 'gln(f)', 'ln(f)g', 'lnfg', 'lnf^g', 'ln(f^g)'].includes(t); }] }], why: '$f^g=e^{\\ln f^g}=e^{g\\ln f}$. Ara $g\\ln f$ és un $0\\cdot\\infty$, que ja saps tractar.' },
      { q: 'Si en substituir surt $\\frac{k}{0}$ amb $k\\neq0$, <b>no</b> és una indeterminació: el límit és ⟨1⟩ (mira els límits laterals pel signe).', b: [INF], why: 'Un número dividit per una cosa cada vegada més petita es fa enorme. Aplicar-hi L\'Hôpital donaria un resultat <b>fals</b>.' },
      { q: 'Per a $\\infty-\\infty$ amb fraccions es fa ⟨1⟩; amb arrels, es multiplica i es divideix pel ⟨2⟩.', b: [W('denominador comú', [/comu/, /denominador/]), W('conjugat', ['conjugat', 'conjugado', 'el conjugat', 'conjugada'])], why: 'Així queda un sol quocient, que acostuma a ser $\\frac00$ o $\\frac\\infty\\infty$.' },
    ],
    estudi: [
      { gen: 'order' },
      { q: '$f$ és <b>parell</b> si $f(-x)=$ ⟨1⟩, i <b>senar</b> si $f(-x)=$ ⟨2⟩.', b: [{ ans: 'f(x)', t: 'f(x)', acc: [s => ['f(x)', 'f', '+f(x)'].includes(s.replace(/\s/g, ''))] }, { ans: '−f(x)', t: '-f(x)', acc: [s => ['-f(x)', '-f', '-(f(x))'].includes(s.replace(/\s/g, ''))] }], why: 'Parell: simètrica respecte de l\'eix $OY$ (com $x^2$). Senar: respecte de l\'origen (com $x^3$). Si ho és, n\'hi ha prou d\'estudiar $x\\ge0$.' },
      { q: '$x=a$ és una asímptota <b>vertical</b> si $\\lim_{x\\to a^\\pm}f(x)=$ ⟨1⟩. Es busquen als punts que no són del ⟨2⟩.', b: [INF, W('domini', ['domini', 'dominio', 'domini de f'])], why: 'Típicament on s\'anul·la el denominador. Però cal comprovar que el límit és infinit: si també s\'anul·la el numerador pot ser un «forat».' },
      { q: 'Asímptota <b>obliqua</b> $y=mx+n$: $m=\\lim_{x\\to\\infty}$ ⟨1⟩ i $n=\\lim_{x\\to\\infty}$ ⟨2⟩.', b: [{ ans: 'f(x)/x', t: '\\frac{f(x)}{x}', acc: [s => ['f(x)/x', 'f/x'].includes(s.replace(/\s/g, ''))] }, { ans: 'f(x)−mx', t: 'f(x)-mx', acc: [s => ['f(x)-mx', 'f-mx', 'f(x)-m*x', 'f(x)-m·x', '(f(x)-mx)'].includes(s.replace(/\s/g, ''))] }], why: 'En un quocient de polinomis amb grau de dalt = grau de baix + 1, és més ràpid fer la divisió: el quocient és la recta.' },
      { q: 'Si $\\lim_{x\\to+\\infty}f(x)=L$ (un número), la recta $y=$ ⟨1⟩ és una asímptota ⟨2⟩.', b: [W('L', ['l']), W('horitzontal', ['horitzontal', 'horizontal'])], why: 'Si hi ha asímptota horitzontal per un costat, per aquest costat no n\'hi ha d\'obliqua.' },
      { q: 'Un polinomi té asímptotes (verticals, horitzontals o obliqües)? ⟨1⟩ (sí/no).', b: [NO], why: 'És continu a tot $\\mathbb R$ (cap vertical) i, si té grau $\\ge2$, creix més que qualsevol recta (cap horitzontal ni obliqua).' },
      { q: 'Per a la gràfica (apartat d): primer dibuixa les ⟨1⟩ (línies discontínues), marca els extrems i les inflexions, i uneix seguint la taula de ⟨2⟩ de $f\'$ i $f\'\'$.', b: [W('asímptotes', ['asimptotes', 'asintotas', 'les asimptotes']), W('signes', ['signes', 'signe', 'signos'])], why: 'Amb les asímptotes i les taules, la gràfica surt sola: no cal donar valors a l\'atzar.' },
    ],
  };
  // ítems generats: indeterminacions sí/no, L'Hôpital aplicable, ordre de l'estudi
  const FORMS = [
    ['\\frac{0}{0}', 1], ['\\frac{\\infty}{\\infty}', 1], ['0\\cdot\\infty', 1], ['\\infty-\\infty', 1], ['1^{\\infty}', 1], ['0^{0}', 1], ['\\infty^{0}', 1],
    ['\\frac{1}{0}', 0, '$\\pm\\infty$'], ['\\frac{0}{\\infty}', 0, '$0$'], ['\\frac{\\infty}{0}', 0, '$\\pm\\infty$'], ['\\infty+\\infty', 0, '$+\\infty$'], ['\\infty\\cdot\\infty', 0, '$\\infty$'], ['0^{\\infty}', 0, '$0$'], ['\\infty^{\\infty}', 0, '$\\infty$'], ['2^{\\infty}', 0, '$+\\infty$'], ['\\frac{5}{\\infty}', 0, '$0$'],
  ];
  const LHOP = [
    ['\\lim_{x\\to0}\\frac{\\sin x}{x}', 1, '$\\frac00$'], ['\\lim_{x\\to0}\\frac{\\cos x}{x}', 0, '$\\frac10$: dona $\\pm\\infty$ (no existeix)'], ['\\lim_{x\\to0}\\frac{e^x-1}{x}', 1, '$\\frac00$'],
    ['\\lim_{x\\to+\\infty}\\frac{x^2}{e^x}', 1, '$\\frac\\infty\\infty$'], ['\\lim_{x\\to0^+}x\\ln x', 0, '$0\\cdot(-\\infty)$: primer s\'ha d\'escriure com a quocient, $\\frac{\\ln x}{1/x}$'],
    ['\\lim_{x\\to1}\\frac{x^2+1}{x-1}', 0, '$\\frac20$: dona $\\pm\\infty$'], ['\\lim_{x\\to0}\\frac{1-\\cos x}{x^2}', 1, '$\\frac00$'], ['\\lim_{x\\to+\\infty}\\frac{\\ln x}{x}', 1, '$\\frac\\infty\\infty$'],
    ['\\lim_{x\\to0}\\frac{x+1}{x+2}', 0, '$\\frac12$: no és indeterminat, el límit és $\\frac12$ (substituir)'], ['\\lim_{x\\to+\\infty}\\left(1+\\frac1x\\right)^x', 0, '$1^\\infty$: primer $e^{x\\ln(1+1/x)}$'],
  ];
  const STEPS = ['Domini', 'Simetria (parell / senar)', 'Asímptotes (verticals, horitzontals, obliqües)', 'f\': creixement i extrems relatius', 'f\'\': curvatura i punts d\'inflexió', 'Gràfica'];
  function genItem(kind, r) {
    if (kind === true) {
      const yes = r.shuffle(FORMS.filter(f => f[1])).slice(0, 2), no = r.shuffle(FORMS.filter(f => !f[1])).slice(0, 2), fs = r.shuffle(yes.concat(no));
      return { q: 'Són indeterminacions? Escriu <b>sí</b> o <b>no</b> per a cada forma: ' + fs.map((f, i) => `⟨${i + 1}⟩ $${f[0]}$`).join(' &nbsp; '), b: fs.map(f => (f[1] ? SI : NO)),
        why: 'Les 7 indeterminacions: $\\frac00,\\ \\frac\\infty\\infty,\\ 0\\cdot\\infty,\\ \\infty-\\infty,\\ 1^\\infty,\\ 0^0,\\ \\infty^0$. ' + fs.filter(f => !f[1]).map(f => `$${f[0]}$ no ho és: dona ${f[2]}`).join('; ') + '.' };
    }
    if (kind === 'lhop') {
      const L = r.pick(LHOP);
      return { q: `Es pot aplicar L'Hôpital <b>directament</b> a $${L[0]}$? ⟨1⟩ (sí/no)`, b: [L[1] ? SI : NO], why: 'Substitueix primer: surt ' + L[2] + '. Només $\\frac00$ i $\\frac\\infty\\infty$ admeten L\'Hôpital directament.' };
    }
    if (kind === 'order') {
      const L = 'ABCDEF'.split(''), order = r.shuffle([0, 1, 2, 3, 4, 5]); // order[k] = pas que va a la lletra k
      const letterOf = step => L[order.indexOf(step)];
      const okStr = [0, 1, 2, 3, 4, 5].map(letterOf).join('');
      const alt = [0, 2, 1, 3, 4, 5].map(letterOf).join('');
      return { q: 'Ordena els passos d\'un estudi de funció (escriu les 6 lletres en ordre, p. ex. <code>CAFBDE</code>):<br>' + order.map((st, k) => `<b>${L[k]}</b>: ${esc(STEPS[st])}`).join(' &nbsp;·&nbsp; ') + '<br>Ordre: ⟨1⟩',
        b: [{ ans: okStr, t: '\\text{' + okStr + '}', acc: [s => { const t = s.replace(/[^a-z]/g, '').toUpperCase(); return t === okStr || t === alt; }] }],
        why: 'Ordre del parcial: (a) domini, simetria i asímptotes → (b) $f\'$: creixement i extrems → (c) $f\'\'$: curvatura i inflexió → (d) gràfica. El domini sempre primer: sense ell no saps on hi ha asímptotes ni quins punts compten.' };
    }
  }
  const matchAcc = (acc, s) => { const t = norm(s); return acc.some(a => (a instanceof RegExp ? a.test(t) : typeof a === 'function' ? a(t) : t === norm(a))); };
  function conceptMake(bank) {
    return function (r) {
      const idx = r.shuffle(bank.map((_, i) => i)).slice(0, 2).sort((a, b) => a - b);
      const items = idx.map(i => (bank[i].gen ? genItem(bank[i].gen, r) : bank[i]));
      let k = 0; const fields = [], qs = [];
      items.forEach(it => {
        const base = k;
        qs.push('<li>' + it.q.replace(/⟨(\d+)⟩/g, (_, n) => `<span class="blank">(${base + Number(n)})</span>`) + '</li>');
        it.b.forEach(bl => { k++; fields.push({ label: `(${k})`, ph: 'escriu la paraula o el símbol', kind: 'word', ans: bl.ans, ansTex: bl.t || '\\text{' + bl.ans + '}', check: s => ({ ok: matchAcc(bl.acc, s) }), prev: () => '' }); });
      });
      return P.multi('Completa (escriu-ho tu, com ho escriuries a l\'examen):<ol class="cblanks">' + qs.join('') + '</ol>', fields,
        items.map(it => it.why), { hint: 'No cal la frase sencera: només la paraula o el símbol de cada buit. S\'accepten sinònims i no compten els accents.' });
    };
  }

  /* ---------------- registre ---------------- */
  const CONCEPTS = [
    ['l3', 'concepts_extrem', 'Conceptes: creixement i extrems relatius (escriu-ho)', 'extrem', 'Definicions i criteris escrits: creixent/decreixent, màxim i mínim relatiu, Fermat ($f\'(c)=0$), canvi de signe de $f\'$, criteri de la 2a derivada, Weierstrass.', ['monot', 'absext']],
    ['l3', 'concepts_curv', 'Conceptes: convexa, còncava i inflexió (escriu-ho)', 'curv', 'Convenció del curs (convexa = ∪, $f\'\'>0$), definició de punt d\'inflexió, per què $f\'\'(c)=0$ no n\'hi ha prou.', ['concav']],
    ['l4', 'concepts_indet', 'Conceptes: indeterminacions i L\'Hôpital (escriu-ho)', 'indet', 'Quines formes són indeterminacions, quan es pot aplicar L\'Hôpital i com es transforma cada forma.', ['indet', 'formes']],
    ['l4', 'concepts_estudi', 'Conceptes: els passos d\'un estudi de funció (escriu-ho)', 'estudi', 'Ordre de l\'estudi, simetria, asímptotes (vertical, horitzontal, obliqua) i com es fa la gràfica.', ['estudi', 'asimp']],
  ];
  const concepts = CONCEPTS.map(([mod, id, title, bank, desc, needs]) => Calc.addGen(mod, { id, title, level: 1, desc, needs, make: conceptMake(BANK[bank]) }));

  full.key = 'estudi.full'; full.needs = ['estudi', 'asimp', 'monot', 'concav'];
  Calc.estudi = { full, PARTS, concepts, FAM, analyse, parseIv, parseList, checkIv, checkList, norm, sqrtQ, BANK };
})();
