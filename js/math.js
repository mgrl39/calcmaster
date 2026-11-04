/* ===================================================================
   math.js — Mini-CAS: parser, avaluador, derivador simbòlic, simplificador,
   conversió a LaTeX, comprovador de respostes i utilitats numèriques.
   =================================================================== */
(function (global) {
  'use strict';
  const M = {};

  /* ------------------------------ RNG ------------------------------ */
  M.rng = function (seed) {
    let a = seed >>> 0;
    const r = function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    r.nz = (lo, hi) => { let v; do v = r.int(lo, hi); while (v === 0); return v; };
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    r.sign = () => (r() < 0.5 ? -1 : 1);
    r.shuffle = arr => {
      const b = arr.slice();
      for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
      return b;
    };
    return r;
  };

  /* ------------------------- Utilitats numèriques ------------------------- */
  const EPS = 1e-9;
  M.isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
  M.gcd = function (a, b) { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) { [a, b] = [b, a % b]; } return a; };
  M.lcm = (a, b) => Math.abs(a * b) / M.gcd(a, b);
  M.fact = n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };

  /** Aproxima un real per una fracció p/q (q <= maxDen). Retorna [p,q] o null. */
  M.toFrac = function (v, maxDen) {
    maxDen = maxDen || 720;
    if (!isFinite(v)) return null;
    if (M.isInt(v)) return [Math.round(v), 1];
    for (let q = 1; q <= maxDen; q++) {
      const p = Math.round(v * q);
      if (Math.abs(v - p / q) < 1e-9 * Math.max(1, Math.abs(v))) {
        const g = M.gcd(p, q); return [p / g, q / g];
      }
    }
    return null;
  };

  /** LaTeX d'un nombre real (enter, fracció o decimal). */
  M.numTex = function (v, dec) {
    if (!isFinite(v)) return v > 0 ? '+\\infty' : (v < 0 ? '-\\infty' : '\\text{?}');
    const f = M.toFrac(v);
    if (f) {
      if (f[1] === 1) return String(f[0]);
      return (f[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(f[0]) + '}{' + f[1] + '}';
    }
    const sg = M.sig(v, 5);
    if (Math.abs(sg) < 1e-4 && sg !== 0) {
      const [m, e] = sg.toExponential(3).split('e');
      return Number(m) + '\\cdot10^{' + parseInt(e, 10) + '}';
    }
    return String(sg).replace('.', '{,}');
  };
  M.sig = (v, d) => Number(Number(v).toPrecision(d || 6));
  M.round = (v, d) => { const k = Math.pow(10, d == null ? 6 : d); return Math.round(v * k) / k; };
  /** Text pla d'un nombre (per posar a "resposta correcta" i inputs). */
  M.numStr = function (v, dec) {
    if (!isFinite(v)) return v > 0 ? 'inf' : '-inf';
    const f = M.toFrac(v);
    if (f) return f[1] === 1 ? String(f[0]) : f[0] + '/' + f[1];
    return String(M.sig(v, dec == null ? 6 : Math.max(dec, 6)));
  };

  /** Polinomi (coefs de menor a major grau) a LaTeX. */
  M.polyTex = function (c, v) {
    v = v || 'x';
    let s = '';
    for (let k = c.length - 1; k >= 0; k--) {
      const a = c[k];
      if (Math.abs(a) < 1e-12) continue;
      const neg = a < 0, A = Math.abs(a);
      const one = Math.abs(A - 1) < 1e-12;
      const coef = (one && k > 0) ? '' : M.numTex(A);
      const xp = k === 0 ? '' : (k === 1 ? v : v + '^{' + k + '}');
      const body = coef + xp;
      s += (s === '' ? (neg ? '-' : '') : (neg ? ' - ' : ' + ')) + body;
    }
    return s || '0';
  };
  M.polyStr = function (c, v) {
    v = v || 'x';
    const parts = [];
    for (let k = c.length - 1; k >= 0; k--) {
      const a = c[k];
      if (Math.abs(a) < 1e-12) continue;
      const t = (k === 0) ? '(' + M.numStr(a) + ')' : ((Math.abs(a - 1) < 1e-12 ? '' : '(' + M.numStr(a) + ')*') + (k === 1 ? v : v + '^' + k));
      parts.push(t);
    }
    return parts.length ? parts.join('+') : '0';
  };
  M.polyEval = (c, x) => c.reduceRight((acc, a) => acc * x + a, 0);
  M.polyDer = c => c.slice(1).map((a, i) => a * (i + 1));
  M.polyMul = (p, q) => { const r = new Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; })); return r; };
  M.polyAdd = (p, q) => { const n = Math.max(p.length, q.length); const r = []; for (let i = 0; i < n; i++) r.push((p[i] || 0) + (q[i] || 0)); return r; };
  M.polyScale = (p, k) => p.map(a => a * k);

  /* ------------------------------- AST ------------------------------- */
  const num = v => ({ t: 'num', v });
  const vr = name => ({ t: 'var', name: name || 'x' });
  const cst = name => ({ t: 'const', name });
  const bin = (t, a, b) => ({ t, a, b });
  const neg = a => ({ t: 'neg', a });
  const fn = (name, a) => ({ t: 'fn', name, a });
  M.N = { num, vr, cst, add: (a, b) => bin('add', a, b), sub: (a, b) => bin('sub', a, b), mul: (a, b) => bin('mul', a, b), div: (a, b) => bin('div', a, b), pow: (a, b) => bin('pow', a, b), neg, fn };

  /* ------------------------------ Parser ------------------------------ */
  const FUNCS = {
    sin: 'sin', cos: 'cos', tan: 'tan', asin: 'asin', arcsin: 'asin', acos: 'acos', arccos: 'acos', atan: 'atan', arctan: 'atan', arctg: 'atan', tg: 'tan',
    sinh: 'sinh', cosh: 'cosh', tanh: 'tanh', ln: 'ln', log: 'ln', sqrt: 'sqrt', abs: 'abs', exp: 'exp', cbrt: 'cbrt'
  };

  function preprocess(s) {
    return String(s)
      .replace(/−|–|—/g, '-').replace(/[·×⋅]/g, '*').replace(/÷/g, '/')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi').replace(/∞/g, 'inf')
      .replace(/√\s*\(/g, 'sqrt(').replace(/√\s*([A-Za-z0-9.]+)/g, 'sqrt($1)')
      .replace(/,/g, '.').replace(/\s+/g, ' ').trim();
  }

  function tokenize(s) {
    const toks = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === ' ') { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const ex = /^[eE][+-]?[0-9]+/.exec(s.slice(j));
        if (ex) j += ex[0].length;
        const txt = s.slice(i, j);
        if ((txt.match(/\./g) || []).length > 1 || txt === '.' || isNaN(parseFloat(txt))) throw new Error('nombre');
        toks.push({ k: 'num', v: parseFloat(txt) }); i = j; continue;
      }
      if (/[A-Za-z]/.test(c)) {
        let j = i; while (j < s.length && /[A-Za-z]/.test(s[j])) j++;
        // lletres seguides: poden ser funció/constant o producte de variables (xy); es resol al parser
        const word = s.slice(i, j), wl = word.toLowerCase();
        if (FUNCS[wl] || wl === 'pi' || wl === 'inf' || wl === 'oo') { toks.push({ k: 'id', v: word }); i = j; continue; }
        // altrament: lletres soltes (producte implícit: "xe", "ab")
        for (const ch of word) {
          let name = ch;
          if (/^[Cc]$/.test(ch) && j === i + 1) { let m = j; while (m < s.length && /[0-9]/.test(s[m])) m++; name = s.slice(i, m); j = m; }
          toks.push({ k: 'id', v: name });
        }
        i = j; continue;
      }
      if ('+-*/^()|'.includes(c)) { toks.push({ k: 'op', v: c }); i++; continue; }
      throw new Error('caràcter ' + c);
    }
    return toks;
  }

  /** Parseja una expressió. `vars` = llista de noms de variable (p.ex. ['x']). */
  M.parse = function (src, vars) {
    vars = vars || ['x'];
    const toks = tokenize(preprocess(src));
    let p = 0;
    const peek = () => toks[p];
    const eat = v => { if (toks[p] && toks[p].v === v && toks[p].k === 'op') { p++; return true; } return false; };

    function startsAtom(t) {
      return t && (t.k === 'num' || t.k === 'id' || (t.k === 'op' && (t.v === '(' || t.v === '|')));
    }
    function parseExpr() {
      let a = parseTerm();
      for (;;) {
        if (eat('+')) a = bin('add', a, parseTerm());
        else if (eat('-')) a = bin('sub', a, parseTerm());
        else break;
      }
      return a;
    }
    function parseTerm() {
      let a = parseUnary();
      for (;;) {
        const t = peek();
        if (eat('*')) a = bin('mul', a, parseUnary());
        else if (eat('/')) a = bin('div', a, parseUnary());
        else if (startsAtom(t) && !(t.k === 'op' && t.v === '|' && absOpen)) a = bin('mul', a, parsePowOnly()); // multiplicació implícita
        else break;
      }
      return a;
    }
    function parseUnary() {
      if (eat('-')) return neg(parseUnary());
      if (eat('+')) return parseUnary();
      return parsePowOnly();
    }
    function parsePowOnly() {
      const base = parseAtom();
      if (eat('^')) {
        // exponent: admet signe i potència dreta-associativa
        let e;
        if (eat('-')) e = neg(parsePowOnly()); else { eat('+'); e = parsePowOnly(); }
        return bin('pow', base, e);
      }
      return base;
    }
    let absOpen = 0;
    function parseAtom() {
      const t = toks[p];
      if (!t) throw new Error('final inesperat');
      if (t.k === 'num') { p++; return num(t.v); }
      if (t.k === 'op' && t.v === '(') {
        p++; const e = parseExpr(); if (!eat(')')) throw new Error('parèntesi'); return e;
      }
      if (t.k === 'op' && t.v === '|') {
        p++; absOpen++; const e = parseExpr(); absOpen--; if (!eat('|')) throw new Error('barres'); return fn('abs', e);
      }
      if (t.k === 'id') {
        p++;
        const w = t.v, wl = w.toLowerCase();
        if (vars.includes(w)) return vr(w);
        if (w === 'e' || w === 'E') return cst('e');
        if (wl === 'pi') return cst('pi');
        if (wl === 'inf' || wl === 'oo') return cst('inf');
        if (/^[Cc][0-9]*$/.test(w)) return cst(w.toUpperCase());
        if (FUNCS[wl]) {
          let arg;
          if (toks[p] && toks[p].k === 'op' && toks[p].v === '(') {
            p++; arg = parseExpr(); if (!eat(')')) throw new Error('parèntesi');
            // sin(x)^2
          } else {
            arg = parsePowOnly(); // "sin x"
          }
          let node = FUNCS[wl] === 'exp' ? bin('pow', cst('e'), arg) : fn(FUNCS[wl], arg);
          if (eat('^')) { let e; if (eat('-')) e = neg(parsePowOnly()); else e = parsePowOnly(); node = bin('pow', node, e); }
          return node;
        }
        // paraules de lletres: producte de variables/constants d'una lletra (p.ex. "xe")
        if (w.length > 1) {
          let node = null;
          for (const ch of w) {
            let f;
            if (vars.includes(ch)) f = vr(ch); else if (ch === 'e') f = cst('e'); else throw new Error('identificador ' + w);
            node = node ? bin('mul', node, f) : f;
          }
          return node;
        }
        throw new Error('identificador ' + w);
      }
      throw new Error('inesperat');
    }
    const ast = parseExpr();
    if (p < toks.length) throw new Error('sobra text');
    return ast;
  };

  /* ------------------------------ Avaluador ------------------------------ */
  M.evalAst = function evalAst(n, env) {
    switch (n.t) {
      case 'num': return n.v;
      case 'var': return env[n.name];
      case 'const':
        if (n.name === 'e') return Math.E;
        if (n.name === 'pi') return Math.PI;
        if (n.name === 'inf') return Infinity;
        return env[n.name] != null ? env[n.name] : NaN;
      case 'neg': return -evalAst(n.a, env);
      case 'add': return evalAst(n.a, env) + evalAst(n.b, env);
      case 'sub': return evalAst(n.a, env) - evalAst(n.b, env);
      case 'mul': return evalAst(n.a, env) * evalAst(n.b, env);
      case 'div': return evalAst(n.a, env) / evalAst(n.b, env);
      case 'pow': {
        const b = evalAst(n.a, env), e = evalAst(n.b, env);
        if (b < 0 && !Number.isInteger(e)) {
          // arrels imparelles: (-8)^(1/3)
          const f = M.toFrac(e, 25);
          if (f && f[1] % 2 === 1) return (f[0] % 2 === 0 ? 1 : -1) * Math.pow(-b, e);
          return NaN;
        }
        return Math.pow(b, e);
      }
      case 'fn': {
        const a = evalAst(n.a, env);
        switch (n.name) {
          case 'sin': return Math.sin(a); case 'cos': return Math.cos(a); case 'tan': return Math.tan(a);
          case 'asin': return Math.asin(a); case 'acos': return Math.acos(a); case 'atan': return Math.atan(a);
          case 'sinh': return Math.sinh(a); case 'cosh': return Math.cosh(a); case 'tanh': return Math.tanh(a);
          case 'ln': return Math.log(Math.abs(a)); // ln|x| (lenient)
          case 'sqrt': return Math.sqrt(a); case 'abs': return Math.abs(a); case 'cbrt': return Math.cbrt(a);
        }
      }
    }
    return NaN;
  };
  M.compile = function (src, vars) {
    const ast = typeof src === 'string' ? M.parse(src, vars || ['x']) : src;
    const v0 = (vars && vars[0]) || 'x';
    const f = (x, extra) => { const env = Object.assign({}, extra || {}); env[v0] = x; return M.evalAst(ast, env); };
    f.ast = ast;
    return f;
  };

  const hasVar = (n, name) => {
    if (!n) return false;
    switch (n.t) {
      case 'var': return !name || n.name === name;
      case 'num': case 'const': return false;
      case 'neg': case 'fn': return hasVar(n.a, name);
      default: return hasVar(n.a, name) || hasVar(n.b, name);
    }
  };
  M.hasVar = hasVar;

  /* ------------------------------ Simplificador ------------------------------ */
  const val = n => {
    if (n.t === 'num') return n.v;
    if (n.t === 'neg' && n.a.t === 'num') return -n.a.v;
    return null;
  };
  const mkNum = v => {
    if (Math.abs(v - Math.round(v)) < 1e-12) v = Math.round(v);
    return v < 0 ? neg(num(-v)) : num(v);
  };
  const isZ = n => val(n) === 0;
  const isCstE = n => n.t === 'const' && n.name === 'e';

  function simp1(n) {
    switch (n.t) {
      case 'num': return n.v < 0 ? neg(num(-n.v)) : n;
      case 'var': case 'const': return n;
      case 'neg': {
        const a = simp1(n.a);
        if (a.t === 'neg') return a.a;
        if (isZ(a)) return num(0);
        return neg(a);
      }
      case 'add': {
        const a = simp1(n.a), b = simp1(n.b);
        const va = val(a), vb = val(b);
        if (va !== null && vb !== null) return mkNum(va + vb);
        if (va === 0) return b; if (vb === 0) return a;
        if (b.t === 'neg') return bin('sub', a, b.a);
        if (a.t === 'neg') return bin('sub', b, a.a);
        return bin('add', a, b);
      }
      case 'sub': {
        const a = simp1(n.a), b = simp1(n.b);
        const va = val(a), vb = val(b);
        if (va !== null && vb !== null) return mkNum(va - vb);
        if (vb === 0) return a; if (va === 0) return neg(b);
        if (b.t === 'neg') return bin('add', a, b.a);
        if (a.t === 'neg') return neg(bin('add', a.a, b));
        return bin('sub', a, b);
      }
      case 'mul': {
        let a = simp1(n.a), b = simp1(n.b);
        const va = val(a), vb = val(b);
        if (va !== null && vb !== null) return mkNum(va * vb);
        if (va === 0 || vb === 0) return num(0);
        if (va === 1) return b; if (vb === 1) return a;
        if (va === -1) return neg(b); if (vb === -1) return neg(a);
        if (a.t === 'neg') return neg(bin('mul', a.a, b));
        if (b.t === 'neg') return neg(bin('mul', a, b.a));
        if (a.t === 'div' && b.t !== 'div') return bin('div', bin('mul', a.a, b), a.b);
        if (b.t === 'div' && a.t !== 'div') return bin('div', bin('mul', a, b.a), b.b);
        if (vb !== null && va === null) return bin('mul', b, a);
        if (va !== null && b.t === 'mul' && val(b.a) !== null) return bin('mul', mkNum(va * val(b.a)), b.b);
        if (a.t === 'mul' && val(a.a) !== null && vb === null && val(b) === null) {
          // (c*u)*v -> c*(u*v)
          return bin('mul', a.a, bin('mul', a.b, b));
        }
        // 2*(x/3) -> etc.: deixem-ho
        return bin('mul', a, b);
      }
      case 'div': {
        const a = simp1(n.a), b = simp1(n.b);
        const va = val(a), vb = val(b);
        if (vb === 1) return a;
        if (va === 0 && vb !== 0) return num(0);
        if (va !== null && vb !== null && vb !== 0) {
          if (M.isInt(va) && M.isInt(vb)) {
            const g = M.gcd(va, vb); let p = va / g, q = vb / g; if (q < 0) { p = -p; q = -q; }
            if (q === 1) return mkNum(p);
            return p < 0 ? neg(bin('div', num(-p), num(q))) : bin('div', num(p), num(q));
          }
          return mkNum(va / vb);
        }
        if (a.t === 'neg') return neg(bin('div', a.a, b));
        if (b.t === 'neg') return neg(bin('div', a, b.a));
        // (c*u)/d amb c,d enters: reduir
        if (a.t === 'mul' && val(a.a) !== null && vb !== null && M.isInt(val(a.a)) && M.isInt(vb)) {
          const c = val(a.a); const g = M.gcd(c, vb);
          if (g > 1) return simp1(bin('div', bin('mul', mkNum(c / g), a.b), mkNum(vb / g)));
        }
        return bin('div', a, b);
      }
      case 'pow': {
        const a = simp1(n.a), b = simp1(n.b);
        const va = val(a), vb = val(b);
        if (vb === 1) return a; if (vb === 0) return num(1);
        if (va === 1) return num(1);
        if (va !== null && vb !== null && M.isInt(vb) && vb >= 0 && Math.abs(Math.pow(va, vb)) < 1e9) return mkNum(Math.pow(va, vb));
        if (a.t === 'pow' && val(a.b) !== null && vb !== null) return bin('pow', a.a, mkNum(val(a.b) * vb));
        if (a.t === 'fn' && a.name === 'sqrt' && vb === 2) return a.a;
        return bin('pow', a, b);
      }
      case 'fn': {
        const a = simp1(n.a);
        const va = val(a);
        if (n.name === 'sin' && va === 0) return num(0);
        if (n.name === 'cos' && va === 0) return num(1);
        if (n.name === 'tan' && va === 0) return num(0);
        if (n.name === 'ln' && va === 1) return num(0);
        if (n.name === 'ln' && isCstE(a)) return num(1);
        return fn(n.name, a);
      }
    }
    return n;
  }
  M.simplify = function (n) {
    let cur = n;
    for (let i = 0; i < 12; i++) {
      const nx = simp1(cur);
      if (JSON.stringify(nx) === JSON.stringify(cur)) return nx;
      cur = nx;
    }
    return cur;
  };

  /* ------------------------------ Derivada simbòlica ------------------------------ */
  M.diffAst = function d(n, v) {
    v = v || 'x';
    const A = M.N;
    switch (n.t) {
      case 'num': case 'const': return num(0);
      case 'var': return num(n.name === v ? 1 : 0);
      case 'neg': return neg(d(n.a, v));
      case 'add': return A.add(d(n.a, v), d(n.b, v));
      case 'sub': return A.sub(d(n.a, v), d(n.b, v));
      case 'mul': return A.add(A.mul(d(n.a, v), n.b), A.mul(n.a, d(n.b, v)));
      case 'div': return A.div(A.sub(A.mul(d(n.a, v), n.b), A.mul(n.a, d(n.b, v))), A.pow(n.b, num(2)));
      case 'pow': {
        const hb = hasVar(n.a, v), he = hasVar(n.b, v);
        if (!he) return A.mul(A.mul(n.b, A.pow(n.a, A.sub(n.b, num(1)))), d(n.a, v));
        if (!hb) return A.mul(A.mul(n, isCstE(n.a) ? num(1) : fn('ln', n.a)), d(n.b, v));
        return A.mul(n, A.add(A.mul(d(n.b, v), fn('ln', n.a)), A.div(A.mul(n.b, d(n.a, v)), n.a)));
      }
      case 'fn': {
        const u = n.a, du = d(u, v);
        let o;
        switch (n.name) {
          case 'sin': o = fn('cos', u); break;
          case 'cos': o = neg(fn('sin', u)); break;
          case 'tan': o = A.div(num(1), A.pow(fn('cos', u), num(2))); break;
          case 'asin': o = A.div(num(1), fn('sqrt', A.sub(num(1), A.pow(u, num(2))))); break;
          case 'acos': o = neg(A.div(num(1), fn('sqrt', A.sub(num(1), A.pow(u, num(2)))))); break;
          case 'atan': o = A.div(num(1), A.add(num(1), A.pow(u, num(2)))); break;
          case 'sinh': o = fn('cosh', u); break;
          case 'cosh': o = fn('sinh', u); break;
          case 'tanh': o = A.sub(num(1), A.pow(fn('tanh', u), num(2))); break;
          case 'ln': o = A.div(num(1), u); break;
          case 'sqrt': o = A.div(num(1), A.mul(num(2), fn('sqrt', u))); break;
          case 'cbrt': o = A.div(num(1), A.mul(num(3), A.pow(fn('cbrt', u), num(2)))); break;
          case 'abs': o = A.div(u, fn('abs', u)); break;
        }
        return A.mul(o, du);
      }
    }
    return num(0);
  };
  /** Substitueix la variable `v` de l'AST `n` per l'AST `rep`. */
  M.subst = function sb(n, v, rep) {
    switch (n.t) {
      case 'var': return n.name === v ? rep : n;
      case 'num': case 'const': return n;
      case 'neg': case 'fn': return Object.assign({}, n, { a: sb(n.a, v, rep) });
      default: return Object.assign({}, n, { a: sb(n.a, v, rep), b: sb(n.b, v, rep) });
    }
  };
  /** Composició textual: f(u) on f està en la variable `v` (p.ex. 't'). */
  M.compose = (fsrc, v, usrc) => M.subst(M.parse(fsrc, [v]), v, M.parse(usrc, ['x']));
  /** Deriva una cadena i retorna l'AST simplificat. */
  M.diff = function (src, v) {
    const ast = typeof src === 'string' ? M.parse(src, [v || 'x']) : src;
    return M.simplify(M.diffAst(ast, v || 'x'));
  };
  M.nthDiff = function (src, n, v) { let a = typeof src === 'string' ? M.parse(src, [v || 'x']) : src; for (let i = 0; i < n; i++) a = M.diff(a, v); return a; };

  /* --------------------------------- LaTeX --------------------------------- */
  const FTEX = { sin: '\\sin', cos: '\\cos', tan: '\\tan', asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan', sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh', ln: '\\ln' };
  function prec(n) {
    switch (n.t) {
      case 'add': case 'sub': return 1;
      case 'mul': return 2;
      case 'div': return 2;
      case 'neg': return 2;
      case 'pow': return 4;
      default: return 6;
    }
  }
  const startsWithDigit = s => /^[0-9]/.test(s) || /^\\frac/.test(s);
  M.toTex = function tex(n, ctx) {
    switch (n.t) {
      case 'num': return M.numTex(n.v);
      case 'var': return n.name;
      case 'const': return n.name === 'e' ? 'e' : (n.name === 'pi' ? '\\pi' : (n.name === 'inf' ? '\\infty' : n.name));
      case 'neg': {
        const inner = tex(n.a);
        return '-' + (prec(n.a) <= 1 ? '\\left(' + inner + '\\right)' : inner);
      }
      case 'add': return tex(n.a) + ' + ' + tex(n.b);
      case 'sub': return tex(n.a) + ' - ' + (prec(n.b) <= 1 ? '\\left(' + tex(n.b) + '\\right)' : tex(n.b));
      case 'mul': {
        let L = tex(n.a), R = tex(n.b);
        if (prec(n.a) <= 1) L = '\\left(' + L + '\\right)';
        if (prec(n.b) <= 1 || n.b.t === 'neg') R = '\\left(' + R + '\\right)';
        const rIsNum = n.b.t === 'num' || (n.b.t === 'pow' && n.b.a.t === 'num');
        const dot = rIsNum || startsWithDigit(R) || n.b.t === 'div' || (n.a.t === 'num' && n.b.t === 'num');
        return L + (dot ? ' \\cdot ' : ' ') + R;
      }
      case 'div': return '\\frac{' + tex(n.a) + '}{' + tex(n.b) + '}';
      case 'pow': {
        const b = n.a;
        const e = tex(n.b);
        if (b.t === 'fn' && FTEX[b.name] && n.b.t === 'num') {
          return FTEX[b.name] + '^{' + e + '}\\left(' + tex(b.a) + '\\right)';
        }
        let B = tex(b);
        const atomic = b.t === 'var' || b.t === 'const' || (b.t === 'num' && Number.isInteger(b.v)) || (b.t === 'fn' && b.name !== 'abs' && b.name !== 'sqrt' && false);
        if (!atomic) B = '\\left(' + B + '\\right)';
        return B + '^{' + e + '}';
      }
      case 'fn': {
        if (n.name === 'sqrt') return '\\sqrt{' + tex(n.a) + '}';
        if (n.name === 'cbrt') return '\\sqrt[3]{' + tex(n.a) + '}';
        if (n.name === 'abs') return '\\left|' + tex(n.a) + '\\right|';
        return FTEX[n.name] + '\\left(' + tex(n.a) + '\\right)';
      }
    }
    return '?';
  };
  /** Cadena d'expressió -> LaTeX simplificat. */
  M.tex = function (src, simplify) {
    let ast = typeof src === 'string' ? M.parse(src) : src;
    if (simplify !== false) ast = M.simplify(ast);
    return M.toTex(ast);
  };
  /** AST -> cadena parsejable. */
  M.toStr = function s(n) {
    switch (n.t) {
      case 'num': return String(n.v);
      case 'var': return n.name;
      case 'const': return n.name;
      case 'neg': return '(-' + s(n.a) + ')';
      case 'add': return '(' + s(n.a) + '+' + s(n.b) + ')';
      case 'sub': return '(' + s(n.a) + '-' + s(n.b) + ')';
      case 'mul': return '(' + s(n.a) + '*' + s(n.b) + ')';
      case 'div': return '(' + s(n.a) + '/' + s(n.b) + ')';
      case 'pow': return '(' + s(n.a) + '^' + s(n.b) + ')';
      case 'fn': return n.name + '(' + s(n.a) + ')';
    }
    return '?';
  };

  /* ------------------------- Comprovació de respostes ------------------------- */
  const SPECIAL_ZERO = /^(no\s*existeix|cap|ninguna?|∅|buit)$/i;

  M.parseConst = function (src) {
    const t = String(src).trim();
    if (t === '') throw new Error('buit');
    const ast = M.parse(t, []);
    return M.evalAst(ast, {});
  };

  M.checkNum = function (input, ans, tol) {
    tol = tol == null ? 2e-4 : tol;
    let v;
    try { v = M.parseConst(input); } catch (e) { return { ok: false, parseError: true }; }
    if (!isFinite(ans) || !isFinite(v)) return { ok: (v === ans) };
    if (Number.isNaN(v)) return { ok: false, parseError: true };
    if (ans === 0) return { ok: Math.abs(v) < 1e-6 };
    const ok = Math.abs(v - ans) <= tol * Math.abs(ans);
    return ok ? { ok } : { ok, why: M.diagNum(v, ans), val: v };
  };
  /** Intenta endevinar el tipus d'error (per donar un missatge útil). */
  M.diagNum = function (v, ans) {
    const near = (a, b, t) => Math.abs(a - b) <= (t || 1e-6) * Math.max(1, Math.abs(b));
    if (near(v, -ans)) return 'sign';
    if (Math.abs(v - ans) <= 0.02 * Math.abs(ans)) return 'close';
    if (ans !== 0 && near(v * ans, 1)) return 'recip';
    const k = v / ans;
    if ([2, 0.5, 3, 1 / 3, 4, 0.25].some(c => near(k, c, 1e-6))) return 'factor';
    return null;
  };

  const SAMPLE_T = [0.113, 0.271, 0.437, 0.593, 0.719, 0.827, 0.953];
  M.checkFn = function (input, ans, opts) {
    opts = opts || {};
    const v = opts.v || 'x';
    let s = String(input).trim().replace(/\+\s*[cC]\s*$/, '').replace(/^[a-zA-Z]\s*\(\s*[a-z]\s*\)\s*=\s*/, '').replace(/^[yYfFgGhH]\s*=\s*/, '');
    if (s === '') return { ok: false, parseError: true };
    let fin;
    try { fin = M.compile(s, [v]); } catch (e) { return { ok: false, parseError: true }; }
    const fa = typeof ans === 'function' ? ans : M.compile(ans, [v]);
    const [lo, hi] = opts.range || [0.3, 2.7];
    let diffs = [], bad = 0, fine = 0;
    for (const t of SAMPLE_T) {
      const x = lo + (hi - lo) * t;
      const a = fa(x), b = fin(x);
      if (!isFinite(a) || Number.isNaN(a)) continue;
      fine++;
      if (!isFinite(b) || Number.isNaN(b)) { bad++; continue; }
      diffs.push([a, b]);
    }
    if (fine === 0) return { ok: false };
    if (bad > 0 || diffs.length < 3) return { ok: false };
    if (opts.upToConst) {
      const d0 = diffs[0][1] - diffs[0][0];
      const sc = Math.max(1, ...diffs.map(p => Math.abs(p[0])));
      return { ok: diffs.every(p => Math.abs((p[1] - p[0]) - d0) <= 1e-6 * sc) };
    }
    const ok = diffs.every(p => Math.abs(p[1] - p[0]) <= 1e-6 * Math.max(1, Math.abs(p[0])));
    if (ok) return { ok };
    const sc = Math.max(1, ...diffs.map(p => Math.abs(p[0])));
    let why = null;
    if (diffs.every(p => Math.abs(p[1] + p[0]) <= 1e-6 * sc)) why = 'sign';
    else if (diffs.every(p => Math.abs((p[1] - p[0]) - (diffs[0][1] - diffs[0][0])) <= 1e-6 * sc)) why = 'const';
    else if (diffs.every(p => Math.abs(p[0]) > 1e-9) && diffs.every(p => Math.abs(p[1] / p[0] - diffs[0][1] / diffs[0][0]) <= 1e-6)) why = 'factor';
    return { ok, why };
  };

  /* ----------------------- Derivació / integració numèrica ----------------------- */
  M.numDiff = (f, x, h) => { h = h || 1e-5; return (f(x + h) - f(x - h)) / (2 * h); };
  M.simpson = function (f, a, b, n) {
    n = n || 2000; if (n % 2) n++;
    const h = (b - a) / n; let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return s * h / 3;
  };
  M.bisect = function (f, a, b) {
    let fa = f(a);
    for (let i = 0; i < 200; i++) { const m = (a + b) / 2, fm = f(m); if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m; }
    return (a + b) / 2;
  };

  /* ------------------ Distractors genèrics per a opció múltiple ------------------ */
  M.numDistractors = function (ans, r, n) {
    n = n || 3;
    if (!isFinite(ans)) return r.shuffle([-ans, 0, 1, ans > 0 ? -1 : 2]).slice(0, n); // límits infinits: errors típics
    const cands = [-ans, ans + 1, ans - 1, ans * 2, ans / 2, ans + 2, ans - 2, ans * 3, ans + 0.5, ans * 1.5, 1 / (ans || 1), ans * ans];
    const out = [];
    for (const c of r.shuffle(cands)) {
      if (!isFinite(c)) continue;
      if (Math.abs(c - ans) < 1e-9) continue;
      if (out.some(o => Math.abs(o - c) < 1e-9)) continue;
      const f = M.toFrac(c, 64);
      out.push(f ? f[0] / f[1] : M.round(c, 3));
      if (out.length >= n) break;
    }
    let k = 3; while (out.length < n && k < 1000) { const c = ans + k++; if (!out.includes(c)) out.push(c); }
    return out;
  };

  global.M = M;
  if (typeof module !== 'undefined') module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
