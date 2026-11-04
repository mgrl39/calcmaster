/* ===================================================================
   gens_p2.js — Tipus d'exercici que faltaven perquè res del 2n parcial
   sigui nou el dia de l'examen. Surten de comparar, un per un, els
   exercicis de les llistes 7–12 i els apartats dels exàmens reals
   (2023, 2024, recuperació 2024, 2025 i el solucionari) amb els
   generadors que ja hi havia.
   Cada generador porta un check() independent: deriva la primitiva,
   substitueix la solució a l'EDO o integra numèricament (Simpson).
   =================================================================== */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;
  const add = (mod, g) => { if (Calc.byId[mod]) Calc.addGen(mod, g); };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  /** fracció → [num, den] (den ≤ 2000) */
  const rat = x => { for (let d = 1; d <= 2000; d++) { const n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) { const g = gcd(n, d); return [n / g, d / g]; } } return null; };
  const fr = x => { const q = rat(x); if (!q) return T(x); const [n, d] = q; return d === 1 ? String(n) : (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; };
  const fs = x => { const q = rat(x); if (!q) return '(' + x + ')'; const [n, d] = q; return d === 1 ? '(' + n + ')' : '(' + n + '/' + d + ')'; };
  /** coeficient davant d'un terme en LaTeX: 1 → '', -1 → '-' */
  const cf = (c, first) => { const s = c < 0 ? '-' : (first ? '' : '+'); const a = Math.abs(c); return s + (a === 1 ? '' : fr(a)); };
  const lin = (pairs) => { let out = ''; pairs.forEach(([c, t]) => { if (!c) return; out += (out ? (c < 0 ? ' - ' : ' + ') : (c < 0 ? '-' : '')) + (Math.abs(c) === 1 && t ? '' : fr(Math.abs(c))) + t; }); return out || '0'; };
  const xpow = (k, n) => k === 0 ? '1' : 'e^{' + (k === 1 ? '' : k === -1 ? '-' : k) + 'x}';
  const near = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(b));
  /** comprova que F' = f en uns quants punts */
  const derivCheck = (F, f, xs) => { const Fc = M.compile(F); return xs.every(x => near(M.numDiff(Fc, x), f(x), 1e-5)); };
  const odeTex = (b, c) => 'y\'\'' + (b ? (b < 0 ? ' - ' : ' + ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y\'' : '') + (c ? (c < 0 ? ' - ' : ' + ') + (Math.abs(c) === 1 ? '' : Math.abs(c)) + 'y' : '');

  /* ===================== L7: primitives ===================== */
  add('l7', {
    id: 'parts_cyc', title: 'Per parts cíclica: $e^{ax}\\sin bx$, $e^{ax}\\cos bx$', level: 3,
    desc: 'Dues vegades per parts i torna a sortir la integral de partida: s\'aïlla (llista 7, exercici 6b).', needs: ['parts'],
    make(r) {
      const a = r.pick([1, 2, 3, -1, -2]), b = r.int(1, 3), s = r.int(0, 1) === 0, D = a * a + b * b;
      const E = 'e^{' + (a === 1 ? '' : a === -1 ? '-' : a) + 'x}', bx = (b === 1 ? '' : b) + 'x';
      const f = s ? (x => Math.exp(a * x) * Math.sin(b * x)) : (x => Math.exp(a * x) * Math.cos(b * x));
      const ans = s ? 'e^(' + a + '*x)*(' + a + '*sin(' + b + '*x)-' + b + '*cos(' + b + '*x))/' + D : 'e^(' + a + '*x)*(' + a + '*cos(' + b + '*x)+' + b + '*sin(' + b + '*x))/' + D;
      const tex = '\\frac{' + E + '\\left(' + (s ? lin([[a, '\\sin ' + bx], [-b, '\\cos ' + bx]]) : lin([[a, '\\cos ' + bx], [b, '\\sin ' + bx]])) + '\\right)}{' + D + '}';
      const p = P.fn('Calcula $\\displaystyle\\int ' + E + '\\' + (s ? 'sin ' : 'cos ') + bx + '\\,dx$.', ans, [
        'És una integral <b>cíclica</b>: fes parts dues vegades amb $u=$ la trigonomètrica i $dv=' + E + 'dx$ (les dues vegades igual!).',
        'Després de la segona, torna a aparèixer $I$: queda $I=(\\dots)-\\frac{' + b * b + '}{' + a * a + '}I$.',
        'Aïlla: $\\left(1+\\frac{' + b * b + '}{' + a * a + '}\\right)I=\\dots$ ⇒ $I=' + tex + '+C$. (Comprova-ho derivant.)'], { utc: true, ansTex: tex, range: [-1, 1] });
      p.check = () => derivCheck(ans, f, [-0.7, 0.2, 0.9]);
      return p;
    }
  });

  add('l7', {
    id: 'parts_log', title: 'Per parts amb logaritmes: $x^n\\ln x$, $\\ln^2x$', level: 2,
    desc: 'El logaritme sempre és la $u$ (llista 7, exercicis 5b i 5d).', needs: ['parts'],
    make(r) {
      const t = r.int(0, 3), n = r.int(1, 3), c = r.int(1, 4);
      let q, ans, f, st, tex;
      if (t === 0) {
        q = 'x^{' + n + '}\\ln x'; f = x => Math.pow(x, n) * Math.log(x);
        ans = 'x^' + (n + 1) + '/' + (n + 1) + '*ln(x)-x^' + (n + 1) + '/' + (n + 1) * (n + 1);
        tex = '\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}\\ln x-\\frac{x^{' + (n + 1) + '}}{' + (n + 1) * (n + 1) + '}';
        st = ['$u=\\ln x$, $dv=x^{' + n + '}dx$ ⇒ $du=\\frac{dx}x$, $v=\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}$.', '$\\int=\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}\\ln x-\\int\\frac{x^{' + n + '}}{' + (n + 1) + '}dx=' + tex + '$.'];
      } else if (t === 1) {
        q = '(\\ln x)^2'; f = x => Math.log(x) ** 2; ans = 'x*ln(x)^2-2*x*ln(x)+2*x'; tex = 'x\\ln^2x-2x\\ln x+2x';
        st = ['$u=\\ln^2x$, $dv=dx$ ⇒ $du=\\frac{2\\ln x}{x}dx$, $v=x$: $\\int\\ln^2x=x\\ln^2x-2\\int\\ln x\\,dx$.', 'I $\\int\\ln x=x\\ln x-x$ (també per parts). Resultat: $' + tex + '$.'];
      } else if (t === 2) {
        q = '(x^{' + n + '}+' + c + ')\\ln x'; f = x => (Math.pow(x, n) + c) * Math.log(x);
        ans = '(x^' + (n + 1) + '/' + (n + 1) + '+' + c + '*x)*ln(x)-x^' + (n + 1) + '/' + (n + 1) * (n + 1) + '-' + c + '*x';
        tex = '\\left(\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}+' + (c === 1 ? '' : c) + 'x\\right)\\ln x-\\frac{x^{' + (n + 1) + '}}{' + (n + 1) * (n + 1) + '}-' + (c === 1 ? '' : c) + 'x';
        st = ['$u=\\ln x$, $dv=(x^{' + n + '}+' + c + ')dx$ ⇒ $v=\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}+' + c + 'x$.', 'Queda $v\\ln x-\\int\\frac{v}{x}dx=v\\ln x-\\int\\left(\\frac{x^{' + n + '}}{' + (n + 1) + '}+' + c + '\\right)dx$.', 'Resultat: $' + tex + '$.'];
      } else {
        q = '\\dfrac{\\ln x}{x^2}'; f = x => Math.log(x) / (x * x); ans = '-ln(x)/x-1/x'; tex = '-\\frac{\\ln x}{x}-\\frac1x';
        st = ['$u=\\ln x$, $dv=x^{-2}dx$ ⇒ $v=-\\frac1x$.', '$\\int=-\\frac{\\ln x}{x}+\\int\\frac{dx}{x^2}=' + tex + '$.'];
      }
      const p = P.fn('Calcula $\\displaystyle\\int ' + q + '\\,dx$ (per a $x>0$).', ans, st, { utc: true, ansTex: tex, range: [0.5, 3] });
      p.check = () => derivCheck(ans, f, [0.7, 1.3, 2.4]);
      return p;
    }
  });

  add('l7', {
    id: 'trigsub', title: 'Canvi trigonomètric: $x=a\\sin\\theta$, $x=a\\tan\\theta$', level: 3,
    desc: 'Integrals amb $\\sqrt{a^2-x^2}$ o $a^2+x^2$: canvi trigonomètric i canvi de límits (va sortir a la recuperació de 2024).', needs: ['subst', 'trigint'],
    make(r) {
      const a = r.int(1, 4), t = r.int(0, 5), PI = Math.PI;
      const pool = [
        { q: '\\int_0^{' + a + '}\\sqrt{' + a * a + '-x^2}\\,dx', f: x => Math.sqrt(Math.max(0, a * a - x * x)), lo: 0, hi: a, v: PI * a * a / 4, tex: (a === 1 ? '' : a * a) + '\\frac{\\pi}{4}',
          st: ['$x=' + (a === 1 ? '' : a) + '\\sin\\theta$, $dx=' + (a === 1 ? '' : a) + '\\cos\\theta\\,d\\theta$; límits: $x=0\\to\\theta=0$, $x=' + a + '\\to\\theta=\\frac\\pi2$.', '$\\sqrt{' + a * a + '-x^2}=' + (a === 1 ? '' : a) + '\\cos\\theta$ ⇒ $\\int_0^{\\pi/2}' + a * a + '\\cos^2\\theta\\,d\\theta=' + a * a + '\\cdot\\frac\\pi4$ (angle doble).', '(És un quart de cercle de radi ' + a + ': $\\frac{\\pi\\cdot' + a * a + '}{4}$.)'] },
        { q: '\\int_0^1x^2\\sqrt{1-x^2}\\,dx', f: x => x * x * Math.sqrt(Math.max(0, 1 - x * x)), lo: 0, hi: 1, v: PI / 16, tex: '\\frac{\\pi}{16}',
          st: ['$x=\\sin\\theta$: $\\int_0^{\\pi/2}\\sin^2\\theta\\cos^2\\theta\\,d\\theta=\\int_0^{\\pi/2}\\frac{\\sin^22\\theta}{4}d\\theta$.', '$=\\frac14\\int_0^{\\pi/2}\\frac{1-\\cos4\\theta}{2}d\\theta=\\frac14\\cdot\\frac\\pi4=\\frac\\pi{16}$.'] },
        { q: '\\int_0^1x^2(1-x^2)^{3/2}\\,dx', f: x => x * x * Math.pow(Math.max(0, 1 - x * x), 1.5), lo: 0, hi: 1, v: PI / 32, tex: '\\frac{\\pi}{32}',
          st: ['$x=\\sin\\theta$, $dx=\\cos\\theta\\,d\\theta$, $(1-x^2)^{3/2}=\\cos^3\\theta$: $\\int_0^{\\pi/2}\\sin^2\\theta\\cos^4\\theta\\,d\\theta$.', 'Amb angle doble: $\\sin^2\\theta\\cos^4\\theta=\\frac18(1-\\cos2\\theta)(1+\\cos2\\theta)^2$; integrant, $\\frac{\\pi}{32}$. (Recuperació de 2024.)'] },
        { q: '\\int_0^{1}(1-x^2)^{3/2}\\,dx', f: x => Math.pow(Math.max(0, 1 - x * x), 1.5), lo: 0, hi: 1, v: 3 * PI / 16, tex: '\\frac{3\\pi}{16}',
          st: ['$x=\\sin\\theta$: $\\int_0^{\\pi/2}\\cos^4\\theta\\,d\\theta$.', '$\\cos^4\\theta=\\left(\\frac{1+\\cos2\\theta}2\\right)^2=\\frac38+\\frac{\\cos2\\theta}2+\\frac{\\cos4\\theta}8$ ⇒ $\\frac38\\cdot\\frac\\pi2=\\frac{3\\pi}{16}$.'] },
        { q: '\\int_0^{' + a + '}\\frac{dx}{' + a * a + '+x^2}', f: x => 1 / (a * a + x * x), lo: 0, hi: a, v: PI / (4 * a), tex: '\\frac{\\pi}{' + 4 * a + '}',
          st: ['$x=' + (a === 1 ? '' : a) + '\\tan\\theta$ (o directament $\\int\\frac{dx}{a^2+x^2}=\\frac1a\\arctan\\frac xa$).', '$\\frac1{' + a + '}\\left[\\arctan\\frac x{' + a + '}\\right]_0^{' + a + '}=\\frac1{' + a + '}\\cdot\\frac\\pi4$.'] },
        { q: '\\int_0^{' + fr(a / 2) + '}\\frac{dx}{\\sqrt{' + a * a + '-x^2}}', f: x => 1 / Math.sqrt(a * a - x * x), lo: 0, hi: a / 2, v: PI / 6, tex: '\\frac{\\pi}{6}',
          st: ['$x=' + (a === 1 ? '' : a) + '\\sin\\theta$: l\'integrand es converteix en $d\\theta$ (o directament $\\arcsin\\frac x{' + a + '}$).', 'Límits: $\\theta$ de $0$ a $\\arcsin\\frac12=\\frac\\pi6$.'] }
      ];
      const z = pool[t];
      const p = P.num('Calcula $\\displaystyle' + z.q + '$ (pots escriure <code>pi</code>).', z.v, z.st, { ansTex: z.tex, tol: 1e-4 });
      p.check = () => near(M.simpson(z.f, z.lo, z.hi, 20000), z.v, 2e-3);
      return p;
    }
  });

  /* ===================== L8: fraccions simples ===================== */
  add('l8', {
    id: 'int_mixed', title: 'Integral: arrel simple × quadràtic irreductible (ln + arctan)', level: 3,
    desc: '$\\int\\frac{\\dots}{(x-a)(x^2+px+q)}$ amb $x^2+px+q$ sense arrels: surt <b>a tots els 2ns parcials</b>.', needs: ['fracs', 'consts', 'intfracs'],
    make(r) {
      const a = r.int(-3, 3), b = r.pick([0, 0, 1, -1, 2]), c = r.int(1, 2), A = r.nz(-3, 3), B = r.int(-3, 3), D = r.int(-3, 3);
      if (B === 0 && D === 0) return null;
      const q0 = b * b + c * c; // Q = x^2+2bx+q0
      const n2 = A + B, n1 = 2 * b * A + B * b + D - a * B, n0 = A * q0 - a * (B * b + D);
      const num = [n0, n1, n2];
      if (num.every(v => v === 0)) return null;
      const Qtex = M.polyTex([q0, 2 * b, 1]), den = '(' + H.xm(a) + ')(' + Qtex + ')';
      const f = x => M.polyEval(num, x) / ((x - a) * (x * x + 2 * b * x + q0));
      const ans = A + '*ln(abs(x-(' + a + ')))' + '+(' + B + '/2)*ln(x^2+' + 2 * b + '*x+' + q0 + ')+(' + D + '/' + c + ')*atan((x+(' + b + '))/' + c + ')';
      const xb = b ? '(' + H.xm(-b) + ')' : 'x';
      const tex = lin([[A, '\\ln|' + H.xm(a) + '|'], [B / 2, '\\ln(' + Qtex + ')'], [D / c, '\\arctan ' + (c === 1 ? xb : '\\frac{' + H.xm(-b) + '}{' + c + '}')]]);
      const p = P.fn('Calcula $\\displaystyle\\int\\frac{' + M.polyTex(num) + '}{' + den + '}\\,dx$.', ans, [
        '$' + Qtex + '$ no té arrels reals (discriminant negatiu): $\\frac{A}{' + H.xm(a) + '}+\\frac{Bx+C}{' + Qtex + '}$.',
        'Amb $x=' + a + '$: $' + M.polyTex(num).replace(/x/g, '(' + a + ')') + '=A\\cdot' + (a * a + 2 * b * a + q0) + '$ ⇒ $A=' + A + '$. La resta, igualant coeficients.',
        (b ? 'Completa el quadrat: $' + Qtex + '=' + xb + '^2+' + c * c + '$. ' : '') + 'Separa el numerador en «derivada del denominador» (dona $\\ln$) i una constant (dona $\\arctan$).',
        'Resultat: $' + tex + '+C$.'], { utc: true, ansTex: tex, range: [a + 0.5, a + 3] });
      p.check = () => derivCheck(ans, f, [a + 0.7, a + 1.6, a + 2.5]);
      return p;
    }
  });

  add('l8', {
    id: 'int_cubic', title: 'Integral amb denominador cúbic (Ruffini primer)', level: 3,
    desc: 'El denominador ve desenvolupat: busca una arrel entera amb Ruffini, factoritza i descompon (llista 8, 2b; test de 2025).', needs: ['fracs', 'consts', 'intfracs'],
    make(r) {
      const rs = H.distinct(r, 3, -3, 3), [A, B, C] = [r.nz(-3, 3), r.nz(-3, 3), r.nz(-3, 3)];
      const mul = (p, q) => { const o = new Array(p.length + q.length - 1).fill(0); p.forEach((x, i) => q.forEach((y, j) => { o[i + j] += x * y; })); return o; };
      const lf = v => [-v, 1];
      const num = [0, 0, 0];
      [[A, 1, 2], [B, 0, 2], [C, 0, 1]].forEach(([k, i, j]) => mul(lf(rs[i]), lf(rs[j])).forEach((v, d) => { num[d] += k * v; }));
      const den = mul(mul(lf(rs[0]), lf(rs[1])), lf(rs[2]));
      if (num.every(v => v === 0)) return null;
      const hi = Math.max.apply(null, rs);
      const ans = [A, B, C].map((k, i) => k + '*ln(abs(x-(' + rs[i] + ')))').join('+');
      const tex = lin([A, B, C].map((k, i) => [k, '\\ln|' + H.xm(rs[i]) + '|']));
      const f = x => M.polyEval(num, x) / M.polyEval(den, x);
      const p = P.fn('Calcula $\\displaystyle\\int\\frac{' + M.polyTex(num) + '}{' + M.polyTex(den) + '}\\,dx$.', ans, [
        'Busca arrels enteres del denominador entre els divisors del terme independent ($' + den[0] + '$). Ruffini: $' + M.polyTex(den) + '=(' + H.xm(rs[0]) + ')(' + H.xm(rs[1]) + ')(' + H.xm(rs[2]) + ')$.',
        '$\\frac{A}{' + H.xm(rs[0]) + '}+\\frac{B}{' + H.xm(rs[1]) + '}+\\frac{C}{' + H.xm(rs[2]) + '}$; substituint cada arrel: $A=' + A + '$, $B=' + B + '$, $C=' + C + '$.',
        'Tres logaritmes: $' + tex + '+C$.'], { utc: true, ansTex: tex, range: [hi + 0.5, hi + 3] });
      p.check = () => derivCheck(ans, f, [hi + 0.7, hi + 1.5, hi + 2.6]);
      return p;
    }
  });

  add('l8', {
    id: 'int_dbl_simple', title: 'Integral: arrel doble + arrel simple', level: 3,
    desc: '$\\frac{\\dots}{(x-a)^2(x-b)}=\\frac{A}{x-b}+\\frac{B}{x-a}+\\frac{C}{(x-a)^2}$ (llista 8, 2c; examen de 2025).', needs: ['fracs', 'consts', 'intfracs'],
    make(r) {
      const [a, b] = H.distinct(r, 2, -3, 3), A = r.nz(-3, 3), B = r.int(-3, 3), C = r.nz(-3, 3);
      const num = [A * a * a + B * a * b - C * b, -2 * A * a - B * (a + b) + C, A + B];
      if (num.every(v => v === 0)) return null;
      const hi = Math.max(a, b);
      const ans = A + '*ln(abs(x-(' + b + ')))+(' + B + ')*ln(abs(x-(' + a + ')))-(' + C + ')/(x-(' + a + '))';
      const tex = lin([[A, '\\ln|' + H.xm(b) + '|'], [B, '\\ln|' + H.xm(a) + '|'], [-C, '\\frac{1}{' + H.xm(a) + '}']]);
      const f = x => M.polyEval(num, x) / ((x - a) * (x - a) * (x - b));
      const p = P.fn('Calcula $\\displaystyle\\int\\frac{' + M.polyTex(num) + '}{(' + H.xm(a) + ')^2(' + H.xm(b) + ')}\\,dx$.', ans, [
        'Arrel doble ⇒ <b>dos</b> termes: $\\frac{A}{' + H.xm(b) + '}+\\frac{B}{' + H.xm(a) + '}+\\frac{C}{(' + H.xm(a) + ')^2}$.',
        '$x=' + b + '$ dona $A=' + A + '$; $x=' + a + '$ dona $C=' + C + '$; el coeficient de $x^2$ ($A+B=' + (A + B) + '$) dona $B=' + B + '$.',
        '$\\int\\frac{C}{(x-a)^2}dx=-\\frac{C}{x-a}$. Resultat: $' + tex + '+C$.'], { utc: true, ansTex: tex, range: [hi + 0.5, hi + 3] });
      p.check = () => derivCheck(ans, f, [hi + 0.7, hi + 1.5, hi + 2.6]);
      return p;
    }
  });

  /* ===================== L9: TFC, àrees, volums ===================== */
  add('l9', {
    id: 'leibniz_adv', title: 'Leibniz avançat: dos límits variables i $\\sqrt{\\int}$', level: 3,
    desc: '$\\int_{-x}^{x^4}$ (2023), $F=\\sqrt{\\int_0^{x^2}te^t\\,dt}$ (solucionari), $F\'(a)$ amb la cadena.', needs: ['tfc', 'cadena'],
    make(r) {
      const t = r.int(0, 1);
      if (t === 0) {
        const n = r.int(2, 4), a = n === 2 ? r.int(1, 2) : 1;
        const gs = [
          ['\\frac{\\sin t}{t}', u => Math.sin(u) / u, 'sin(t)/t'], ['\\frac{t}{1+t^2}', u => u / (1 + u * u), ''], ['\\cos(t^2)', u => Math.cos(u * u), ''], ['\\sqrt{1+t^2}', u => Math.sqrt(1 + u * u), '']];
        const [gt, g] = r.pick(gs);
        const v = g(Math.pow(a, n)) * n * Math.pow(a, n - 1) + g(-a);
        const p = P.num('Sigui $F(x)=\\displaystyle\\int_{-x}^{x^{' + n + '}}' + gt + '\\,dt$. Calcula $F\'(' + a + ')$ (amb 4 decimals).', v, [
          'Leibniz amb els <b>dos</b> límits variables: $F\'(x)=g(x^{' + n + '})\\cdot' + n + 'x^{' + (n - 1) + '}-g(-x)\\cdot(-1)$.',
          'El límit inferior $-x$ té derivada $-1$, i se li resta: queda $+g(-x)$.',
          '$F\'(' + a + ')=g(' + Math.pow(a, n) + ')\\cdot' + n * Math.pow(a, n - 1) + '+g(' + (-a) + ')\\approx' + T(v) + '$.'], { tol: 1e-3 });
        p.check = () => { const F = x => M.simpson(g, -x, Math.pow(x, n), 80000); return near((F(a + 1e-4) - F(a - 1e-4)) / 2e-4, v, 1e-3); };
        return p;
      }
      const a = r.int(1, 2);
      const opts = [
        ['t e^t', u => (u - 1) * Math.exp(u) + 1, u => u * Math.exp(u), '(u-1)e^u+1'],
        ['3t^2', u => u * u * u, u => 3 * u * u, 'u^3'],
        ['e^t', u => Math.exp(u) - 1, u => Math.exp(u), 'e^u-1'],
        ['2t+1', u => u * u + u, u => 2 * u + 1, 'u^2+u']];
      const [gt, G, g, Gt] = r.pick(opts), u = a * a;
      const v = g(u) * 2 * a / (2 * Math.sqrt(G(u)));
      const p = P.num('Sigui $F(x)=\\sqrt{\\displaystyle\\int_0^{x^2}' + gt + '\\,dt}$. Calcula $F\'(' + a + ')$ (amb 4 decimals).', v, [
        'Cadena: $F=\\sqrt{I(x)}$ ⇒ $F\'=\\frac{I\'(x)}{2\\sqrt{I(x)}}$, amb $I(x)=\\int_0^{x^2}' + gt + '\\,dt$.',
        'Leibniz: $I\'(x)=g(x^2)\\cdot2x$. I $I(' + a + ')=\\int_0^{' + u + '}' + gt + '\\,dt=\\left[' + Gt.replace(/u/g, 't') + '\\right]$ avaluat, $\\approx' + T(G(u)) + '$.',
        '$F\'(' + a + ')=\\frac{' + T(g(u)) + '\\cdot' + 2 * a + '}{2\\sqrt{' + T(G(u)) + '}}\\approx' + T(v) + '$.'], { tol: 1e-3 });
      p.check = () => { const F = x => Math.sqrt(M.simpson(g, 0, x * x, 6000)); return near((F(a + 1e-4) - F(a - 1e-4)) / 2e-4, v, 1e-3); };
      return p;
    }
  });

  add('l9', {
    id: 'ftc_concav', title: 'Concavitat i inflexió de $F(x)=\\int f$', level: 3,
    desc: 'Derivar dues vegades una funció definida per una integral (llista 9, exercici 4b).', needs: ['tfc', 'concav'],
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const k = r.pick([1, 4, 1 / 4, 4]);
        const xi = Math.pow(4 * k, -0.25), kt = k === 1 ? '' : fr(k);
        const p = P.num('Sigui $F(x)=\\displaystyle\\int_0^{x^2}e^{-' + kt + 't^2}\\,dt$. Troba l\'abscissa <b>positiva</b> del punt d\'inflexió de $F$.', xi, [
          '$F\'(x)=e^{-' + kt + 'x^4}\\cdot2x$.', '$F\'\'(x)=2e^{-' + kt + 'x^4}+2x\\cdot(-' + fr(4 * k) + 'x^3)e^{-' + kt + 'x^4}=2e^{-' + kt + 'x^4}(1-' + fr(4 * k) + 'x^4)$.',
          '$F\'\'=0\\iff x^4=' + fr(1 / (4 * k)) + '$ ⇒ $x=' + T(xi) + '$, i $F\'\'$ hi canvia de signe ⇒ inflexió.'], { tol: 1e-3 });
        p.check = () => { const d2 = x => 2 * Math.exp(-k * x ** 4) * (1 - 4 * k * x ** 4); return d2(xi - 0.01) > 0 && d2(xi + 0.01) < 0; };
        return p;
      }
      if (t === 1) {
        const s = r.int(1, 3);
        const p = P.num('Sigui $F(x)=\\displaystyle\\int_0^{x}t\\,e^{-t^2/' + 2 * s * s + '}\\,dt$. Troba l\'abscissa <b>positiva</b> del punt d\'inflexió de $F$.', s, [
          'TFC: $F\'(x)=xe^{-x^2/' + 2 * s * s + '}$.', '$F\'\'(x)=e^{-x^2/' + 2 * s * s + '}\\left(1-\\frac{x^2}{' + s * s + '}\\right)$.', '$F\'\'=0\\iff x=\\pm' + s + '$; per a $x>0$, $x=' + s + '$ (canvia de signe).'], { tol: 1e-4 });
        p.check = () => { const d2 = x => Math.exp(-x * x / (2 * s * s)) * (1 - x * x / (s * s)); return d2(s - 0.01) > 0 && d2(s + 0.01) < 0; };
        return p;
      }
      const [p1, p2] = H.distinct(r, 2, -3, 4), mid = (p1 + p2) / 2;
      const pr = P.num('Sigui $F(x)=\\displaystyle\\int_0^{x}(' + H.xm(p1, 't') + ')(' + H.xm(p2, 't') + ')\\,dt$. Troba l\'abscissa del punt d\'inflexió de $F$.', mid, [
        '$F\'(x)=(' + H.xm(p1) + ')(' + H.xm(p2) + ')$ (no cal integrar!).', '$F\'\'(x)=2x-(' + (p1 + p2) + ')$.', '$F\'\'=0\\iff x=' + fr(mid) + '$.'], { ansTex: fr(mid) });
      pr.check = () => true;
      return pr;
    }
  });

  add('l9', {
    id: 'area_parts', title: 'Àrees que necessiten parts o potències trigonomètriques', level: 3,
    desc: 'Àrea entre $e^{-x}$ i $e^{-x}(x^2-3x+3)$ (2023), àrea de $(\\sin x\\cos x)^3$ (2024), regions amb $xe^x$ i $\\ln x$.', needs: ['arees', 'parts', 'trigint'],
    make(r) {
      const t = r.int(0, 3);
      let q, v, tex, f, lo, hi, st;
      if (t === 0) {
        const p = r.int(0, 2), qq = p + r.int(1, 2), c0 = p * qq + 1;
        q = 'les corbes $y=e^{-x}$ i $y=e^{-x}(' + M.polyTex([c0, -(p + qq), 1]) + ')$';
        f = x => Math.exp(-x) * (-(x - p) * (x - qq)); lo = p; hi = qq;
        v = Math.exp(-qq) * (qq - p + 2) - Math.exp(-p) * (2 - (qq - p));
        tex = (qq - p + 2) + 'e^{-' + qq + '}' + ((2 - (qq - p)) ? '-' + (2 - (qq - p) === 1 ? '' : 2 - (qq - p)) + (p ? 'e^{-' + p + '}' : '') : '');
        st = ['Talls: $e^{-x}=e^{-x}(' + M.polyTex([c0, -(p + qq), 1]) + ')\\iff ' + M.polyTex([p * qq, -(p + qq), 1]) + '=0\\iff x=' + p + ',\\ ' + qq + '$.',
          'Entre els talls, $e^{-x}$ queda per sobre: $A=\\int_{' + p + '}^{' + qq + '}e^{-x}\\big(-(x-' + p + ')(x-' + qq + ')\\big)dx$.',
          'Per parts (dues vegades) o amb $\\int P(x)e^{-x}dx=-e^{-x}(P+P\'+P\'\')$: $A=' + tex + '\\approx' + T(v) + '$.'];
      } else if (t === 1) {
        const n = r.pick([1, 2, 3, 4, 5]);
        q = 'la gràfica de $f(x)=\\sin^3x\\cos^{' + n + '}x$, l\'eix $X$ i les rectes $x=0$, $x=\\frac\\pi2$';
        f = x => Math.sin(x) ** 3 * Math.cos(x) ** n; lo = 0; hi = Math.PI / 2; v = 2 / ((n + 1) * (n + 3)); tex = fr(v);
        st = ['A $[0,\\frac\\pi2]$, $f\\ge0$. Potència senar de $\\sin$: $\\sin^3x=(1-\\cos^2x)\\sin x$, i $u=\\cos x$ (de 1 a 0).', '$\\int_0^1(u^{' + n + '}-u^{' + (n + 2) + '})du=\\frac1{' + (n + 1) + '}-\\frac1{' + (n + 3) + '}=' + tex + '$.' + (n === 3 ? ' (És l\'examen de 2024: $(\\sin x\\cos x)^3$.)' : '')];
      } else if (t === 2) {
        const c = r.int(1, 2);
        q = 'les corbes $y=e^x$, $y=' + (c === 1 ? '' : '\\frac{1}{' + c + '}') + 'xe^x$ i la recta $x=0$';
        f = x => Math.exp(x) * (1 - x / c); lo = 0; hi = c; v = (Math.exp(c) - c - 1) / c; tex = c === 1 ? 'e-2' : '\\frac{e^{' + c + '}-' + (c + 1) + '}{' + c + '}';
        st = ['Talls: $e^x=' + (c === 1 ? '' : '\\frac1' + c) + 'xe^x\\iff x=' + c + '$. A $[0,' + c + ']$ va per sobre $e^x$.', '$A=\\int_0^{' + c + '}\\left(1-\\frac x{' + c + '}\\right)e^xdx$; per parts, $\\int(1-\\frac xc)e^x=\\left(1-\\frac xc+\\frac1c\\right)e^x$.', '$A=' + tex + '\\approx' + T(v) + '$ (llista 9, exercici 13).'];
      } else {
        const k = r.int(1, 2);
        q = 'la gràfica de $f(x)=x' + (k === 1 ? '' : '^' + k) + '\\ln x$, l\'eix $X$ i les rectes $x=1$, $x=e$';
        f = x => x ** k * Math.log(x); lo = 1; hi = Math.E; v = (k * Math.E ** (k + 1) + 1) / ((k + 1) ** 2); tex = '\\frac{' + (k === 1 ? '' : k) + 'e^{' + (k + 1) + '}+1}{' + (k + 1) * (k + 1) + '}';
        st = ['A $[1,e]$, $f\\ge0$. Per parts amb $u=\\ln x$: $\\int x^{' + k + '}\\ln x=\\frac{x^{' + (k + 1) + '}}{' + (k + 1) + '}\\ln x-\\frac{x^{' + (k + 1) + '}}{' + (k + 1) ** 2 + '}$.', 'Barrow: $\\frac{e^{' + (k + 1) + '}}{' + (k + 1) + '}-\\frac{e^{' + (k + 1) + '}}{' + (k + 1) ** 2 + '}+\\frac{1}{' + (k + 1) ** 2 + '}=' + tex + '$.'];
      }
      const p = P.num('Calcula l\'àrea de la regió limitada per ' + q + ' (amb 4 decimals).', v, st, { ansTex: tex, tol: 1e-3 });
      p.check = () => near(M.simpson(f, lo, hi, 8000), v, 1e-5);
      return p;
    }
  });

  add('l9', {
    id: 'area_param', title: 'Troba el paràmetre $k$ perquè l\'àrea valgui…', level: 2,
    desc: 'Com al solucionari del 2n parcial: l\'àrea depèn de $k$; calcula-la i iguala.', needs: ['arees', 'tfc'],
    make(r) {
      const t = r.int(0, 2), k = r.int(1, 5);
      let q, st, v = k;
      if (t === 0) {
        const m = r.int(1, 3);
        q = 'l\'àrea sota $f(x)=\\dfrac{2kx}{1+x^2}$ entre $x=0$ i $x=1$ sigui igual a la de $g(x)=' + (2 * m === 1 ? '' : 2 * m) + 'xe^{-x^2}$ entre $0$ i $\\sqrt{\\ln 2}$';
        v = (m / 2) / Math.log(2);
        st = ['$\\int_0^1\\frac{2kx}{1+x^2}dx=k\\left[\\ln(1+x^2)\\right]_0^1=k\\ln2$.', '$\\int_0^{\\sqrt{\\ln2}}' + 2 * m + 'xe^{-x^2}dx=' + m + '\\left[-e^{-x^2}\\right]_0^{\\sqrt{\\ln2}}=' + m + '\\left(1-\\frac12\\right)=' + fr(m / 2) + '$.', '$k\\ln2=' + fr(m / 2) + '$ ⇒ $k=\\frac{' + fr(m / 2) + '}{\\ln 2}\\approx' + T(v) + '$.'];
        const p = P.num('Troba $k$ perquè ' + q + '.', v, st, { tol: 1e-3, ansTex: '\\frac{' + fr(m / 2) + '}{\\ln2}' });
        p.check = () => near(M.simpson(x => 2 * v * x / (1 + x * x), 0, 1, 4000), M.simpson(x => 2 * m * x * Math.exp(-x * x), 0, Math.sqrt(Math.log(2)), 4000), 1e-5);
        return p;
      }
      if (t === 1) {
        const a = r.int(1, 3), Ar = k * a ** 3 / 6;
        const p = P.num('Troba $k>0$ perquè l\'àrea entre la paràbola $y=kx(' + a + '-x)$ i l\'eix $X$ valgui $' + fr(Ar) + '$.', k, [
          'Talls amb l\'eix: $x=0$ i $x=' + a + '$; a $[0,' + a + ']$ la paràbola és positiva.', '$\\int_0^{' + a + '}kx(' + a + '-x)dx=k\\left[\\frac{' + a + 'x^2}{2}-\\frac{x^3}{3}\\right]_0^{' + a + '}=k\\cdot\\frac{' + a ** 3 + '}{6}$.', '$k\\cdot' + fr(a ** 3 / 6) + '=' + fr(Ar) + '$ ⇒ $k=' + k + '$.']);
        p.check = () => near(M.simpson(x => k * x * (a - x), 0, a, 2000), Ar, 1e-6);
        return p;
      }
      const m = r.int(2, 4), Ar = k * (m - 1);
      const p = P.num('Troba $k$ perquè l\'àrea sota $y=ke^x$ entre $x=0$ i $x=\\ln ' + m + '$ valgui $' + Ar + '$.', k, [
        '$\\int_0^{\\ln' + m + '}ke^xdx=k\\left(e^{\\ln' + m + '}-1\\right)=' + (m - 1) + 'k$.', '$' + (m - 1) + 'k=' + Ar + '$ ⇒ $k=' + k + '$.']);
      p.check = () => near(M.simpson(x => k * Math.exp(x), 0, Math.log(m), 2000), Ar, 1e-6);
      return p;
    }
  });

  add('l9', {
    id: 'volume_adv', title: 'Volums d\'examen: discs amb $\\sin^2$, parts i capes cilíndriques', level: 3,
    desc: '$\\sin3x$ al voltant de $X$ (2024), $xe^x$ (2025), $\\frac{\\ln x}{x^2}$ al voltant de $Y$ (llista 9), anelles entre dues corbes.', needs: ['volums', 'parts', 'trigint'],
    make(r) {
      const t = r.int(0, 6), PI = Math.PI;
      let z;
      if (t === 0) { const k = r.int(2, 4); z = { q: 'la gràfica de $f(x)=\\sin ' + k + 'x$ entre $x=0$ i $x=\\frac{\\pi}{' + k + '}$, al voltant de l\'eix $X$', f: x => Math.sin(k * x) ** 2, lo: 0, hi: PI / k, m: 1, v: PI / (2 * k), tex: '\\frac{\\pi}{' + 2 * k + '}', st: ['Discs: $V=\\pi\\int_0^{\\pi/' + k + '}\\sin^2' + k + 'x\\,dx$.', 'Angle doble: $\\sin^2' + k + 'x=\\frac{1-\\cos' + 2 * k + 'x}2$ ⇒ $\\int=\\frac{\\pi}{' + 2 * k + '}$, i $V=\\pi\\cdot\\frac{\\pi}{' + 2 * k + '}$.'] }; }
      else if (t === 1) { const c = r.int(1, 2); const v = Math.exp(2 * c) * (c * c / 2 - c / 2 + 0.25) - 0.25; z = { q: 'la regió limitada per $y=xe^x$, $y=0$ i $x=' + c + '$, al voltant de l\'eix $X$', f: x => x * x * Math.exp(2 * x), lo: 0, hi: c, m: 1, v, tex: c === 1 ? '\\frac{e^2-1}{4}' : '\\frac{5e^4-1}{4}', st: ['Discs: $V=\\pi\\int_0^{' + c + '}x^2e^{2x}dx$.', 'Per parts dues vegades: $\\int x^2e^{2x}=e^{2x}\\left(\\frac{x^2}2-\\frac x2+\\frac14\\right)$.', 'Barrow: $V/\\pi\\approx' + T(v) + '$ (examen de 2025 amb $c=1$).'] }; }
      else if (t === 2) { const m = r.int(1, 2); z = { q: 'la regió limitada per $f(x)=\\frac{\\ln x}{x^2}$, l\'eix $X$ i les rectes $x=1$, $x=e' + (m === 1 ? '' : '^' + m) + '$, al voltant de l\'eix $Y$', f: x => x * Math.log(x) / (x * x), lo: 1, hi: Math.exp(m), m: 2, v: m * m, tex: String(m * m), st: ['Al voltant de l\'eix $Y$ ⇒ <b>capes cilíndriques</b>: $V=2\\pi\\int x\\,f(x)\\,dx=2\\pi\\int_1^{e' + (m === 1 ? '' : '^' + m) + '}\\frac{\\ln x}{x}dx$.', '$=2\\pi\\left[\\frac{\\ln^2x}{2}\\right]=\\pi\\cdot' + m * m + '$.'] }; }
      else if (t === 3) { z = { q: 'la regió limitada per $y=\\cos x$, $y=0$, $x=0$ i $x=\\frac\\pi2$, al voltant de l\'eix $Y$', f: x => x * Math.cos(x), lo: 0, hi: PI / 2, m: 2, v: PI - 2, tex: '\\pi-2', st: ['Capes: $V=2\\pi\\int_0^{\\pi/2}x\\cos x\\,dx$.', 'Per parts: $\\int x\\cos x=x\\sin x+\\cos x$ ⇒ $2\\pi\\left(\\frac\\pi2-1\\right)=\\pi(\\pi-2)$.'] }; }
      else if (t === 4) { const c = r.int(1, 2); const v = 1 - Math.exp(-c * c); z = { q: 'la regió limitada per $y=e^{-x^2}$, $y=0$, $x=0$ i $x=' + c + '$, al voltant de l\'eix $Y$', f: x => x * Math.exp(-x * x), lo: 0, hi: c, m: 2, v, tex: '1-e^{-' + c * c + '}', st: ['Capes: $V=2\\pi\\int_0^{' + c + '}xe^{-x^2}dx$ (amb discs no es pot!).', 'Substitució $u=x^2$: $2\\pi\\cdot\\frac12\\left[-e^{-x^2}\\right]_0^{' + c + '}=\\pi(1-e^{-' + c * c + '})$.'] }; }
      else if (t === 6) { const k = r.int(2, 4); z = { q: 'la gràfica de $f(x)=\\sin ' + k + 'x$ entre $x=0$ i $x=\\frac{\\pi}{' + k + '}$, al voltant de l\'eix <b>vertical</b> ($Y$)', f: x => x * Math.sin(k * x), lo: 0, hi: PI / k, m: 2, v: 2 * PI / (k * k), tex: '\\frac{2\\pi}{' + k * k + '}', st: ['Eix vertical ⇒ <b>capes</b>: $V=2\\pi\\int_0^{\\pi/' + k + '}x\\sin ' + k + 'x\\,dx$.', 'Per parts: $\\int x\\sin ' + k + 'x=-\\frac{x\\cos ' + k + 'x}{' + k + '}+\\frac{\\sin ' + k + 'x}{' + k * k + '}$; entre $0$ i $\\frac\\pi{' + k + '}$ val $\\frac{\\pi}{' + k * k + '}$.', '$V=\\frac{2\\pi^2}{' + k * k + '}$ ⇒ $V/\\pi=\\frac{2\\pi}{' + k * k + '}$ (examen de 2024 amb $k=3$).'] }; }
      else { z = { q: 'la regió entre $y=e^x$ i $y=xe^x$ (de $x=0$ a $x=1$), al voltant de l\'eix $X$', f: x => Math.exp(2 * x) * (1 - x * x), lo: 0, hi: 1, m: 1, v: (Math.exp(2) - 1) / 4, tex: '\\frac{e^2-1}{4}', st: ['<b>Anelles</b>: $V=\\pi\\int_0^1\\left(e^{2x}-x^2e^{2x}\\right)dx$ (radi exterior al quadrat menys l\'interior al quadrat).', '$\\int_0^1e^{2x}=\\frac{e^2-1}{2}$; $\\int_0^1x^2e^{2x}=\\frac{e^2-1}{4}$ ⇒ $V/\\pi=\\frac{e^2-1}{4}$.'] }; }
      const p = P.num('Calcula el volum del cos de revolució generat per ' + z.q + '. Dona <b>$V/\\pi$</b> (el volum dividit per $\\pi$), amb 4 decimals.', z.v, z.st, { ansTex: z.tex, tol: 1e-3 });
      p.check = () => near(M.simpson(z.f, z.lo, z.hi, 8000) * z.m, z.v, 1e-5);
      return p;
    }
  });

  /* ===================== L10: EDOs separables i canvis ===================== */
  const odeCheck1 = (ans, rhs, x0, y0, xs) => () => { const f = M.compile(ans); return near(f(x0), y0, 1e-7) && xs.every(x => near(M.numDiff(f, x), rhs(x, f(x)), 1e-4)); };

  add('l10', {
    id: 'sep_more', title: 'Separables d\'examen: $\\sin y$, $e^{-y}$, $1+y^2$', level: 3,
    desc: 'Separables on cal integrar $\\frac{\\cos y}{\\sin y}$, $e^{y}$ o $\\frac1{1+y^2}$ (examen de 2025; llista 10, 2f i 3e).', needs: ['separables', 'primit'],
    make(r) {
      const t = r.int(0, 5);
      let ode, ic, ans, rhs, x0 = 0, y0, st, range = [0.1, 0.8];
      if (t === 0) { const b = r.int(0, 2); y0 = b; ode = 'y\'=xe^{-y}'; ic = 'y(0)=' + b; ans = 'ln(x^2/2+e^(' + b + '))'; rhs = (x, y) => x * Math.exp(-y);
        st = ['Separa: $e^y\\,dy=x\\,dx$ ⇒ $e^y=\\frac{x^2}2+C$.', '$y(0)=' + b + '$ ⇒ $C=e^{' + b + '}$ ⇒ $y=\\ln\\left(\\frac{x^2}2+e^{' + b + '}\\right)$.']; }
      else if (t === 1) { const k = r.int(1, 2); y0 = 0; ode = 'y\'=' + (k === 1 ? '' : k) + 'x(1+y^2)'; ic = 'y(0)=0'; ans = 'tan(' + k + '*x^2/2)'; rhs = (x, y) => k * x * (1 + y * y);
        st = ['Separa: $\\frac{dy}{1+y^2}=' + (k === 1 ? '' : k) + 'x\\,dx$ ⇒ $\\arctan y=' + fr(k / 2) + 'x^2+C$.', '$y(0)=0$ ⇒ $C=0$ ⇒ $y=\\tan\\left(' + fr(k / 2) + 'x^2\\right)$.']; }
      else if (t === 2) { y0 = Math.PI / 6; ode = '(\\sin x)(\\sin y)+(\\cos y)\\,y\'=0'; ic = 'y(0)=\\frac\\pi6'; ans = 'asin(e^(cos(x)-1)/2)'; rhs = (x, y) => -Math.sin(x) * Math.sin(y) / Math.cos(y);
        st = ['És l\'EDO de l\'examen de 2025. Separa: $\\frac{\\cos y}{\\sin y}dy=-\\sin x\\,dx$ ⇒ $\\ln|\\sin y|=\\cos x+C$.', '$\\sin y=Ke^{\\cos x}$; $y(0)=\\frac\\pi6$: $\\frac12=Ke$ ⇒ $K=\\frac1{2e}$.', '$y=\\arcsin\\left(\\frac12e^{\\cos x-1}\\right)$.']; }
      else if (t === 3) { y0 = 0; ode = 'y\'=e^{x+y}'; ic = 'y(0)=0'; ans = '-ln(2-e^x)'; rhs = (x, y) => Math.exp(x + y); range = [-1, 0.5];
        st = ['$e^{x+y}=e^xe^y$: separa $e^{-y}dy=e^xdx$ ⇒ $-e^{-y}=e^x+C$.', '$y(0)=0$ ⇒ $-1=1+C$, $C=-2$ ⇒ $e^{-y}=2-e^x$ ⇒ $y=-\\ln(2-e^x)$ (per a $x<\\ln2$).']; }
      else if (t === 4) { const b = r.int(1, 3); y0 = b; ode = '(1+e^x)\\,y\\,y\'=e^x'; ic = 'y(0)=' + b; ans = 'sqrt(' + b * b + '+2*ln((1+e^x)/2))'; rhs = (x, y) => Math.exp(x) / ((1 + Math.exp(x)) * y);
        st = ['Separa: $y\\,dy=\\frac{e^x}{1+e^x}dx$ ⇒ $\\frac{y^2}2=\\ln(1+e^x)+C$.', '$y(0)=' + b + '$ ⇒ $C=\\frac{' + b * b + '}{2}-\\ln2$ ⇒ $y^2=' + b * b + '+2\\ln\\frac{1+e^x}{2}$ (arrel positiva).']; }
      else { const b = r.pick([2, 3]); y0 = 1 / b; ode = 'y\'=y^2\\sin x'; ic = 'y(0)=\\frac1{' + b + '}'; ans = '1/(cos(x)+' + (b - 1) + ')'; rhs = (x, y) => y * y * Math.sin(x);
        st = ['Separa: $\\frac{dy}{y^2}=\\sin x\\,dx$ ⇒ $-\\frac1y=-\\cos x+C$.', '$y(0)=\\frac1{' + b + '}$: $-' + b + '=-1+C$ ⇒ $C=' + (1 - b) + '$ ⇒ $y=\\frac{1}{\\cos x+' + (b - 1) + '}$.']; }
      const p = P.fn('Resol el problema de valors inicials $' + ode + ',\\quad ' + ic + '$. Escriu $y(x)$.', ans, st, { range });
      p.check = odeCheck1(ans, rhs, x0, y0, [range[0] + 0.05, (range[0] + range[1]) / 2, range[1] - 0.05]);
      return p;
    }
  });

  add('l10', {
    id: 'ode_subst', title: 'EDOs amb un canvi de variable', level: 3,
    desc: '$z=x+y$ (llista 10, 2g), $z=x^2+y^2$ (llista 11, 1g), $y\'=(y-a)(y-b)$ (solucionari). El canvi et deixa una EDO que ja saps resoldre.', needs: ['separables', 'lineal1'],
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const y0 = r.pick([0, 1, -1]);
        const ans = 'tan(x+atan(' + y0 + '))-x';
        const p = P.fn('Resol $y\'=(x+y)^2$, $y(0)=' + y0 + '$, amb el canvi $z=x+y$.', ans, [
          '$z=x+y$ ⇒ $z\'=1+y\'=1+z^2$: separable.', '$\\int\\frac{dz}{1+z^2}=\\int dx$ ⇒ $\\arctan z=x+C$ ⇒ $z=\\tan(x+C)$.', '$z(0)=' + y0 + '$ ⇒ $C=\\arctan(' + y0 + ')' + (y0 === 1 ? '=\\frac\\pi4' : y0 === -1 ? '=-\\frac\\pi4' : '=0') + '$ ⇒ $y=\\tan(x+C)-x$.'], { range: [0.05, 0.5] });
        p.check = odeCheck1(ans, (x, y) => (x + y) ** 2, 0, y0, [0.1, 0.3, 0.45]);
        return p;
      }
      if (t === 1) {
        const b = r.int(1, 3);
        const ans = 'sqrt(x^2+' + (b * b - 1) + '*x)';
        const p = P.fn('Resol $x^2+y^2=2xyy\'$ amb $y(1)=' + b + '$ (per a $x>0$), fent el canvi $z=x^2+y^2$.', ans, [
          '$z\'=2x+2yy\'$ i, de l\'equació, $2yy\'=\\frac{z}{x}$ ⇒ $z\'-\\frac1xz=2x$: <b>lineal</b>.', 'Factor integrant $\\frac1x$: $\\left(\\frac zx\\right)\'=2$ ⇒ $z=2x^2+Cx$.', '$z(1)=1+' + b * b + '$ ⇒ $C=' + (b * b - 1) + '$; $y^2=z-x^2=x^2+' + (b * b - 1) + 'x$ ⇒ $y=\\sqrt{x^2+' + (b * b - 1) + 'x}$.'], { range: [0.5, 2.5] });
        p.check = odeCheck1(ans, (x, y) => (x * x + y * y) / (2 * x * y), 1, b, [0.7, 1.5, 2.3]);
        return p;
      }
      const a = r.int(-1, 1), b = a + r.int(1, 2), y0 = r.pick([a - 1, b + 1, (a + b) / 2].filter(v => v !== a && v !== b));
      const K = (y0 - b) / (y0 - a), L = b - a;
      const den = x => 1 - K * Math.exp(L * x);
      if ([0.05, 0.2, 0.4, 0.6].some(x => Math.abs(den(x)) < 0.15) || den(0.05) * den(0.6) < 0) return null;
      const ans = '(' + b + '-(' + a + ')*' + fs(K) + '*e^(' + L + '*x))/(1-' + fs(K) + '*e^(' + L + '*x))';
      const p = P.fn('Resol $y\'=(y' + H.sg(-a) + ')(y' + H.sg(-b) + ')$, $y(0)=' + fr(y0) + '$.'.replace('y + 0', 'y').replace('y - 0', 'y'), ans, [
        'Separable: $\\frac{dy}{(y-' + a + ')(y-' + b + ')}=dx$. Fraccions simples: $\\frac{1}{' + L + '}\\left(\\frac1{y-' + b + '}-\\frac1{y-' + a + '}\\right)$.'.replace(/--/g, '+'),
        '$\\ln\\left|\\frac{y-' + b + '}{y-' + a + '}\\right|=' + L + 'x+C$ ⇒ $\\frac{y-' + b + '}{y-' + a + '}=Ke^{' + L + 'x}$, i $y(0)$ dona $K=' + fr(K) + '$.'.replace(/--/g, '+'),
        'Aïllant: $y=\\dfrac{' + b + '-' + a + 'Ke^{' + L + 'x}}{1-Ke^{' + L + 'x}}$. (Al solucionari es fa amb el canvi $\\frac1v=y-' + b + '$, que porta a una lineal: el resultat és el mateix.)'.replace(/--/g, '+')], { range: [0.05, 0.6] });
      p.check = odeCheck1(ans, (x, y) => (y - a) * (y - b), 0, y0, [0.1, 0.3, 0.55]);
      return p;
    }
  });

  add('l10', {
    id: 'growth_lim', title: 'Creixement limitat amb dues dades: $L\'=k(M-L)$', level: 2,
    desc: 'La velocitat és proporcional a la diferència amb la mida màxima i no et donen el valor inicial (examen de 2024).', needs: ['poblacio', 'separables'],
    make(r) {
      const M0 = r.pick([10, 20, 50, 100]), d1 = M0 * r.pick([0.5, 0.4, 0.6]), q = r.pick([0.5, 0.6, 0.4]), d2 = d1 * q, a = M0 - d1, b = M0 - d2;
      const v = M0 - d2 * q, unit = M0 === 10 ? 'mm' : 'cm';
      const p = P.num('La velocitat de creixement d\'un organisme és proporcional a la diferència entre la mida màxima (' + M0 + ' ' + unit + ') i la mida $L(t)$. Si $L(1)=' + T(a) + '$ i $L(2)=' + T(b) + '$, quina serà la mida a temps $t=3$?', v, [
        '$L\'=k(' + M0 + '-L)$ ⇒ $' + M0 + '-L(t)=Ce^{-kt}$ (no cal saber $L(0)$).',
        'Dividint les dues dades: $\\frac{' + M0 + '-L(2)}{' + M0 + '-L(1)}=e^{-k}=\\frac{' + T(d2) + '}{' + T(d1) + '}=' + T(q) + '$.',
        'Cada unitat de temps la diferència es multiplica per $' + T(q) + '$: $' + M0 + '-L(3)=' + T(d2) + '\\cdot' + T(q) + '=' + T(d2 * q) + '$ ⇒ $L(3)=' + T(v) + '$.'], { tol: 1e-4 });
      p.check = () => { const k = -Math.log(d2 / d1), C = d1 * Math.exp(k); return near(M0 - C * Math.exp(-2 * k), b, 1e-9) && near(M0 - C * Math.exp(-3 * k), v, 1e-9); };
      return p;
    }
  });

  /* ===================== L11: lineals d'examen ===================== */
  add('l11', {
    id: 'lin_exam', title: 'Lineals d\'examen: $\\frac{1}{x+a}$, $\\cos 2x$, $x^n$, $e^{-kx^2}$', level: 3,
    desc: 'Les lineals que han sortit als parcials: $y\'+\\frac{y}{x+100}=1$ (2025), $y\'+\\frac yx=e^{-2x^2}$ (2024), $y\'-\\cos(2x)y=\\cos(2x)$ (2023), $y\'+y=x^3$.', needs: ['lineal1', 'parts'],
    make(r) {
      const t = r.int(0, 3);
      let ode, ic, ans, rhs, x0 = 0, y0, st, range = [0.2, 2];
      if (t === 0) { const a = r.pick([1, 2, 4, 100]), b = r.int(1, 3); y0 = r.int(0, 10); const C = a * y0 - b * a * a / 2;
        ode = 'y\'+\\dfrac{y}{x+' + a + '}=' + b; ic = 'y(0)=' + y0; ans = b + '*(x+' + a + ')/2+(' + C + ')/(x+' + a + ')'; rhs = (x, y) => b - y / (x + a);
        st = ['$\\mu=e^{\\int\\frac{dx}{x+' + a + '}}=x+' + a + '$ ⇒ $\\big((x+' + a + ')y\\big)\'=' + b + '(x+' + a + ')$.', '$(x+' + a + ')y=\\frac{' + b + '(x+' + a + ')^2}{2}+C$; amb $y(0)=' + y0 + '$: $C=' + fr(C) + '$.', '$y=\\frac{' + b + '(x+' + a + ')}{2}+\\frac{' + fr(C) + '}{x+' + a + '}$.']; }
      else if (t === 1) { const k = r.int(1, 3); y0 = r.int(-1, 3);
        ode = 'y\'-\\cos(' + k + 'x)\\,y=\\cos(' + k + 'x)'; ic = 'y(0)=' + y0; ans = '-1+(' + (y0 + 1) + ')*e^(sin(' + k + '*x)/' + k + ')'; rhs = (x, y) => Math.cos(k * x) * (1 + y);
        st = ['$P=-\\cos' + k + 'x$ ⇒ $\\mu=e^{-\\frac{\\sin' + k + 'x}{' + k + '}}$.', '$(\\mu y)\'=\\mu\\cos' + k + 'x$ ⇒ $\\mu y=-\\mu+C$ (la integral és immediata: $u=-\\frac{\\sin' + k + 'x}{' + k + '}$).', '$y=-1+Ce^{\\frac{\\sin' + k + 'x}{' + k + '}}$; $y(0)=' + y0 + '$ ⇒ $C=' + (y0 + 1) + '$. (També és separable: $y\'=\\cos(' + k + 'x)(1+y)$.)']; }
      else if (t === 2) { const n = r.int(2, 3); y0 = r.int(-3, 3); const yp = n === 2 ? 'x^2-2*x+2' : 'x^3-3*x^2+6*x-6', yp0 = n === 2 ? 2 : -6;
        ode = 'y\'+y=x^{' + n + '}'; ic = 'y(0)=' + y0; ans = yp + '+(' + (y0 - yp0) + ')*e^(-x)'; rhs = (x, y) => x ** n - y;
        st = ['$\\mu=e^x$: $(e^xy)\'=x^{' + n + '}e^x$ ⇒ per parts ' + n + ' vegades, $\\int x^{' + n + '}e^x=e^x(' + M.tex(yp) + ')$.', '$y=' + M.tex(yp) + '+Ce^{-x}$ (o coeficients indeterminats amb un polinomi de grau ' + n + ').', '$y(0)=' + y0 + '$ ⇒ $C=' + (y0 - yp0) + '$.']; }
      else { const k = r.int(1, 2), y1 = r.int(1, 3); x0 = 1; y0 = y1; const C = y1 + Math.exp(-k) / (2 * k);
        ode = 'y\'+\\dfrac yx=e^{-' + (k === 1 ? '' : k) + 'x^2}'; ic = 'y(1)=' + y1; ans = '(' + C + '-e^(-' + k + '*x^2)/' + 2 * k + ')/x'; rhs = (x, y) => Math.exp(-k * x * x) - y / x; range = [0.5, 2.5];
        st = ['$\\mu=e^{\\int\\frac{dx}x}=x$ ⇒ $(xy)\'=xe^{-' + (k === 1 ? '' : k) + 'x^2}$.', '$xy=-\\frac{e^{-' + (k === 1 ? '' : k) + 'x^2}}{' + 2 * k + '}+C$; $y(1)=' + y1 + '$ ⇒ $C=' + y1 + '+\\frac{e^{-' + k + '}}{' + 2 * k + '}$.', '$y=\\frac1x\\left(C-\\frac{e^{-' + (k === 1 ? '' : k) + 'x^2}}{' + 2 * k + '}\\right)$.']; }
      const p = P.fn('Resol $' + ode + ',\\quad ' + ic + '$.', ans, st, { range });
      p.check = odeCheck1(ans, rhs, x0, y0, [range[0] + 0.1, (range[0] + range[1]) / 2, range[1] - 0.1]);
      return p;
    }
  });

  /* ===================== L12: 2n ordre ===================== */
  const odeCheck2 = (ans, b, c, g, y0, v0, xs) => () => {
    const f = M.compile(ans), h = 1e-3;
    const d1 = x => (f(x + h) - f(x - h)) / (2 * h), d2 = x => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
    return near(f(0), y0, 1e-6) && near(d1(0), v0, 1e-4) && xs.every(x => Math.abs(d2(x) + b * d1(x) + c * f(x) - g(x)) < 1e-3 * Math.max(1, Math.abs(g(x)), 10 * Math.abs(f(x))));
  };

  add('l12', {
    id: 'ivp_nh', title: 'PVI no homogeni complet ($y_h+y_p$ i condicions inicials)', level: 3,
    desc: 'Tot l\'exercici d\'examen: homogènia (3 casos), particular i després les constants amb $y(0)$, $y\'(0)$ (2023: $y\'\'-4y\'+13y=e^{-x}$).', needs: ['homog', 'nohomog'],
    make(r) {
      const cs = r.int(0, 2);
      let b, c, yh, solveC, rootsTex;
      if (cs === 0) { const [r1, r2] = H.distinct(r, 2, -3, 3); b = -(r1 + r2); c = r1 * r2; rootsTex = 'r=' + r1 + ',\\ r=' + r2;
        yh = (C1, C2) => '(' + C1 + ')*e^(' + r1 + '*x)+(' + C2 + ')*e^(' + r2 + '*x)'; solveC = (Y, V) => { const C2 = (V - r1 * Y) / (r2 - r1); return [Y - C2, C2]; }; }
      else if (cs === 1) { const q = r.nz(-3, 3); b = -2 * q; c = q * q; rootsTex = 'r=' + q + '\\text{ (doble)}';
        yh = (C1, C2) => '((' + C1 + ')+(' + C2 + ')*x)*e^(' + q + '*x)'; solveC = (Y, V) => [Y, V - q * Y]; }
      else { const al = r.int(-2, 2), be = r.int(1, 3); b = -2 * al; c = al * al + be * be; rootsTex = 'r=' + al + '\\pm ' + (be === 1 ? '' : be) + 'i';
        yh = (C1, C2) => 'e^(' + al + '*x)*((' + C1 + ')*cos(' + be + '*x)+(' + C2 + ')*sin(' + be + '*x))'; solveC = (Y, V) => [Y, (V - al * Y) / be]; }
      const k = r.pick([-1, 1, 2, 0]), pk = k * k + b * k + c;
      if (pk === 0) return null;
      const K = r.nz(-4, 4), A = K / pk, y0 = r.int(-2, 2), v0 = r.int(-3, 3);
      const [C1, C2] = solveC(y0 - A, v0 - k * A);
      const ans = yh(fs(C1), fs(C2)) + '+' + fs(A) + (k ? '*e^(' + k + '*x)' : '');
      const gTex = (k ? (K === 1 ? '' : K === -1 ? '-' : K) + xpow(k) : String(K));
      const p = P.fn('Resol $' + odeTex(b, c) + '=' + gTex + '$ amb $y(0)=' + y0 + '$, $y\'(0)=' + v0 + '$.', ans, [
        'Homogènia: $r^2' + (b ? (b < 0 ? '-' : '+') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'r' : '') + (c < 0 ? '-' : '+') + Math.abs(c) + '=0$ ⇒ $' + rootsTex + '$.',
        'Particular: $y_p=A' + (k ? xpow(k) : '') + '$ (no hi ha ressonància). Substituint: $A\\cdot' + pk + '=' + K + '$ ⇒ $A=' + fr(A) + '$.',
        'Condicions inicials <b>sobre $y=y_h+y_p$</b> (no només sobre $y_h$!): $C_1=' + fr(C1) + '$, $C_2=' + fr(C2) + '$.'], { range: [0.1, 1.2] });
      p.check = odeCheck2(ans, b, c, x => K * Math.exp(k * x), y0, v0, [0.2, 0.6, 1]);
      return p;
    }
  });

  add('l12', {
    id: 'res_trig', title: 'Ressonància trigonomètrica: $y\'\'+k^2y=A\\sin kx$', level: 3,
    desc: 'El forçament coincideix amb l\'homogènia: $y_p=x(A\\cos kx+B\\sin kx)$ (llista 12, 1k i 5b).', needs: ['nohomog'],
    make(r) {
      const k = r.int(1, 3), A = r.nz(-4, 4) * 2 * k, s = r.int(0, 1) === 0, ivp = r.int(0, 1) === 1, k2 = k * k;
      const g = s ? (x => A * Math.sin(k * x)) : (x => A * Math.cos(k * x));
      const ypS = s ? '(' + (-A / (2 * k)) + ')*x*cos(' + k + '*x)' : '(' + (A / (2 * k)) + ')*x*sin(' + k + '*x)';
      let ans = ypS, y0 = 0, v0 = 0;
      if (ivp && s) ans = ypS + '+(' + fs(A / (2 * k2)) + ')*sin(' + k + '*x)';
      const kx = (k === 1 ? '' : k) + 'x';
      const p = P.fn((ivp ? 'Resol' : 'Troba una solució particular de') + ' $y\'\'+' + (k2 === 1 ? '' : k2) + 'y=' + (A === 1 ? '' : A === -1 ? '-' : A) + '\\' + (s ? 'sin ' : 'cos ') + kx + '$' + (ivp ? ' amb $y(0)=0$, $y\'(0)=0$.' : '.'), ans, [
        'Arrels $\\pm ' + (k === 1 ? '' : k) + 'i$: $\\sin ' + kx + '$ i $\\cos ' + kx + '$ són solucions de l\'homogènia ⇒ <b>ressonància</b>: $y_p=x(A\\cos ' + kx + '+B\\sin ' + kx + ')$.',
        'Substituint, els termes amb $x$ s\'anul·len i queda $-' + 2 * k + 'A\\sin ' + kx + '+' + 2 * k + 'B\\cos ' + kx + '=' + A + '\\' + (s ? 'sin ' : 'cos ') + kx + '$ ⇒ ' + (s ? '$A=' + fr(-A / (2 * k)) + '$, $B=0$' : '$A=0$, $B=' + fr(A / (2 * k)) + '$') + '.',
        ivp ? 'Amb $y=C_1\\cos ' + kx + '+C_2\\sin ' + kx + '+y_p$: $y(0)=C_1=0$; $y\'(0)=' + k + 'C_2' + (s ? H.sg(-A / (2 * k)) : '') + '=0$ ⇒ $C_2=' + fr(s ? A / (2 * k2) : 0) + '$.' : 'Comprova-ho substituint.'], { range: [0.1, 1.5] });
      if (ivp) p.check = odeCheck2(ans, 0, k2, g, 0, 0, [0.3, 0.8, 1.3]);
      else p.check = () => { const f = M.compile(ans), h = 1e-3; return [0.3, 0.8, 1.3].every(x => Math.abs((f(x + h) - 2 * f(x) + f(x - h)) / (h * h) + k2 * f(x) - g(x)) < 1e-3 * Math.max(1, Math.abs(A))); };
      return p;
    }
  });

  add('l12', {
    id: 'guess_adv', title: 'Forma de $y_p$: polinomi·trigo, arrel doble, complexa, superposició', level: 3,
    desc: 'Els casos difícils de coeficients indeterminats: $x^3\\cos 2x$ amb ressonància (solucionari), $xe^{rx}$ amb arrel doble, $e^{ax}\\cos bx$ amb arrels $a\\pm bi$, sumes.', needs: ['nohomog'],
    make(r) {
      const t = r.int(0, 5);
      let ode, g, ok, wr, why;
      if (t === 0) { const k = r.int(1, 3), n = r.int(1, 3), P1 = 'A_' + n + 'x^{' + n + '}+\\dots+A_0', P2 = 'B_' + n + 'x^{' + n + '}+\\dots+B_0';
        ode = 'y\'\'+' + k * k + 'y'; g = 'x^{' + n + '}\\cos ' + (k === 1 ? '' : k) + 'x';
        ok = '$x\\big[(' + P1 + ')\\cos ' + k + 'x+(' + P2 + ')\\sin ' + k + 'x\\big]$'; wr = ['$(' + P1 + ')\\cos ' + k + 'x+(' + P2 + ')\\sin ' + k + 'x$', '$x(' + P1 + ')\\cos ' + k + 'x$', '$Ax^{' + (n + 1) + '}\\cos ' + k + 'x$'];
        why = 'Arrels $\\pm' + k + 'i$: $\\cos ' + k + 'x$ és solució de l\'homogènia ⇒ ressonància ⇒ multiplica per $x$. I amb polinomi de grau ' + n + ' cal un polinomi <b>complet</b> de grau ' + n + ' davant del $\\cos$ i davant del $\\sin$.'; }
      else if (t === 1) { const k = r.int(1, 3), m = r.pick([1, 2].filter(v => v !== k)), n = r.int(1, 2);
        ode = 'y\'\'+' + m * m + 'y'; g = 'x^{' + n + '}\\sin ' + (k === 1 ? '' : k) + 'x';
        const P1 = n === 1 ? '(Ax+B)' : '(Ax^2+Bx+C)', P2 = n === 1 ? '(Cx+D)' : '(Dx^2+Ex+F)';
        ok = '$' + P1 + '\\cos ' + k + 'x+' + P2 + '\\sin ' + k + 'x$'; wr = ['$x\\big[' + P1 + '\\cos ' + k + 'x+' + P2 + '\\sin ' + k + 'x\\big]$', '$' + P2 + '\\sin ' + k + 'x$', '$Ax^{' + n + '}\\sin ' + k + 'x$'];
        why = 'Arrels $\\pm' + m + 'i$ i el forçament té freqüència ' + k + ' ≠ ' + m + ': <b>no</b> hi ha ressonància. Però sempre cal $\\cos$ i $\\sin$, amb polinomis complets.'; }
      else if (t === 2) { const q = r.nz(-3, 3);
        ode = odeTex(-2 * q, q * q); g = 'x' + xpow(q);
        ok = '$x^2(Ax+B)' + xpow(q) + '$'; wr = ['$(Ax+B)' + xpow(q) + '$', '$x(Ax+B)' + xpow(q) + '$', '$Ax^2' + xpow(q) + '$'];
        why = 'Arrel <b>doble</b> $r=' + q + '$ i el forçament porta $' + xpow(q) + '$ ⇒ multiplica per $x^2$; el polinomi $x$ dona $(Ax+B)$.'; }
      else if (t === 3) { const al = r.nz(-2, 2), be = r.int(1, 3);
        ode = odeTex(-2 * al, al * al + be * be); g = xpow(al) + '\\cos ' + (be === 1 ? '' : be) + 'x';
        ok = '$x' + xpow(al) + '(A\\cos ' + be + 'x+B\\sin ' + be + 'x)$'; wr = ['$' + xpow(al) + '(A\\cos ' + be + 'x+B\\sin ' + be + 'x)$', '$Ax' + xpow(al) + '\\cos ' + be + 'x$', '$x^2' + xpow(al) + '(A\\cos ' + be + 'x+B\\sin ' + be + 'x)$'];
        why = 'Arrels $' + al + '\\pm ' + (be === 1 ? '' : be) + 'i$: $' + g + '$ és solució de l\'homogènia ⇒ ressonància (arrels simples) ⇒ un factor $x$.'; }
      else if (t === 4) { const b = r.nz(-4, 4), n = r.int(1, 2);
        ode = 'y\'\'' + (b < 0 ? '-' : '+') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y\''; g = n === 1 ? 'x+1' : 'x^2';
        ok = n === 1 ? '$x(Ax+B)$' : '$x(Ax^2+Bx+C)$'; wr = n === 1 ? ['$Ax+B$', '$Ax^2$', '$Ae^x$'] : ['$Ax^2+Bx+C$', '$Ax^3$', '$x^2(Ax^2+Bx+C)$'];
        why = 'No hi ha terme en $y$: $r(r' + (b < 0 ? '-' : '+') + Math.abs(b) + ')=0$, una arrel és $r=0$. Un polinomi és «$e^{0x}$» ⇒ ressonància amb $r=0$ ⇒ multiplica per $x$.'; }
      else { const [r1, r2] = H.distinct(r, 2, -3, 3, true), k = r.pick([1, 2, 3].filter(z => z !== r1 && z !== r2)), w = r.int(1, 3);
        ode = odeTex(-(r1 + r2), r1 * r2); g = '\\cos ' + (w === 1 ? '' : w) + 'x+' + xpow(k).slice(0);
        ok = '$A\\cos ' + w + 'x+B\\sin ' + w + 'x+C' + xpow(k) + '$'; wr = ['$A\\cos ' + w + 'x+C' + xpow(k) + '$', '$(A\\cos ' + w + 'x+B\\sin ' + w + 'x)' + xpow(k) + '$', '$A\\cos ' + w + 'x+B\\sin ' + w + 'x+Cx' + xpow(k) + '$'];
        why = '<b>Superposició</b>: una $y_p$ per a cada sumand i se sumen. Arrels $' + r1 + '$ i $' + r2 + '$: cap ressonància.'; }
      return P.mc(r, 'Per a $' + ode + '=' + g + '$, quina és la forma correcta de la solució particular a provar?', ok, wr, [why, 'Forma correcta: ' + ok + '.']);
    }
  });
})();
