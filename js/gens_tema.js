/* ===================================================================
   gens_tema.js — Tipus d'exercici per als conceptes que només tenien
   1 o 2 generadors (volums, impròpies, mescles, refredament, raons de
   canvi, Maclaurin). Cada un porta un check() independent.
   =================================================================== */
(function () {
  'use strict';
  const P = Calc.P;
  const add = (mod, g) => { if (Calc.byId[mod]) Calc.addGen(mod, g); };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const fq = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; };
  const fpi = (n, d) => { const g = gcd(n, d); n /= g; d /= g; return (d === 1 ? (n === 1 ? '' : n) + '\\pi' : '\\frac{' + (n === 1 ? '' : n) + '\\pi}{' + d + '}'); };
  const near = (a, b, t) => Math.abs(a - b) <= (t || 1e-6) * Math.max(1, Math.abs(b));
  const simpson = (f, a, b, n) => { n = n || 2000; const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
  /** RK4 per a y'=F(t,y) */
  const rk4 = (F, t0, y0, t1, n) => { n = n || 4000; const h = (t1 - t0) / n; let t = t0, y = y0; for (let i = 0; i < n; i++) { const k1 = F(t, y), k2 = F(t + h / 2, y + h * k1 / 2), k3 = F(t + h / 2, y + h * k2 / 2), k4 = F(t + h, y + h * k3); y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; t += h; } return y; };

  /* ---------------- L9: volums per anelles ---------------- */
  add('l9', {
    id: 'volume_washer', title: 'Volum per anelles (regió entre dues corbes)', level: 2,
    desc: 'La regió entre dues corbes gira al voltant de l\'eix $x$: cada llesca és una anella, $V=\\pi\\int_a^b(R^2-r^2)\\,dx$.',
    needs: ['volums', 'arees'],
    make(r) {
      const t = r.int(0, 1);
      if (t === 0) {
        const k = r.int(1, 3), V = 2 * Math.PI * Math.pow(k, 5) / 15;
        const p = P.num('La regió limitada per $y=' + (k === 1 ? '' : k) + 'x$ i $y=x^2$ gira al voltant de l\'eix $x$. Calcula el volum (pots escriure <code>pi</code>).', V, [
          'Talls: $x^2=' + (k === 1 ? '' : k) + 'x$ ⇒ $x=0$ i $x=' + k + '$. A $(0,' + k + ')$ la recta va per sobre: radi exterior $R=' + (k === 1 ? '' : k) + 'x$, interior $r=x^2$.',
          '$V=\\pi\\int_0^{' + k + '}\\left(' + (k === 1 ? '' : k * k) + 'x^2-x^4\\right)dx=\\pi\\left[' + (k === 1 ? '' : fq(k * k, 3)) + (k === 1 ? '\\frac{x^3}{3}' : 'x^3') + '-\\frac{x^5}5\\right]_0^{' + k + '}$.',
          '$=\\pi\\left(\\frac{' + Math.pow(k, 5) + '}{3}-\\frac{' + Math.pow(k, 5) + '}{5}\\right)=' + fpi(2 * Math.pow(k, 5), 15) + '$. ⚠️ És $R^2-r^2$, <b>no</b> $(R-r)^2$.'], { ansTex: fpi(2 * Math.pow(k, 5), 15), tol: 1e-4 });
        p.check = () => near(Math.PI * simpson(x => (k * x) ** 2 - x ** 4, 0, k), V, 1e-6);
        return p;
      }
      const c = r.int(1, 2), V = 8 * Math.PI * Math.pow(c, 5) / 5;
      const p = P.num('La regió limitada per $y=x^2$ i $y=' + c * c + '$ gira al voltant de l\'eix $x$. Calcula el volum.', V, [
        'Talls: $x^2=' + c * c + '$ ⇒ $x=\\pm' + c + '$. Radi exterior $R=' + c * c + '$ (la recta), interior $r=x^2$.',
        '$V=\\pi\\int_{-' + c + '}^{' + c + '}\\left(' + Math.pow(c, 4) + '-x^4\\right)dx=2\\pi\\int_0^{' + c + '}\\left(' + Math.pow(c, 4) + '-x^4\\right)dx$ (simetria).',
        '$=2\\pi\\left(' + Math.pow(c, 5) + '-\\frac{' + Math.pow(c, 5) + '}{5}\\right)=' + fpi(8 * Math.pow(c, 5), 5) + '$.'], { ansTex: fpi(8 * Math.pow(c, 5), 5), tol: 1e-4 });
      p.check = () => near(Math.PI * simpson(x => Math.pow(c, 4) - x ** 4, -c, c), V, 1e-6);
      return p;
    }
  });

  /* ---------------- L9: volums per capes cilíndriques ---------------- */
  add('l9', {
    id: 'volume_shell', title: 'Volum per capes cilíndriques (gir al voltant de l\'eix $y$)', level: 3,
    desc: 'Quan la regió gira al voltant de l\'eix $y$ i la funció és $y=f(x)$: $V=2\\pi\\int_a^b x\\,f(x)\\,dx$ (cada capa té radi $x$ i alçada $f(x)$).',
    needs: ['volums', 'primit'],
    make(r) {
      const t = r.int(0, 1);
      if (t === 0) {
        const k = r.int(1, 4), V = Math.PI * Math.pow(k, 4) / 6;
        const f = 'x(' + k + '-x)';
        const p = P.num('La regió entre $y=' + f + '$ i l\'eix $x$ gira al voltant de l\'eix $y$. Calcula el volum.', V, [
          '$y=' + f + '\\ge0$ a $[0,' + k + ']$. Capes: radi $x$, alçada $' + f + '$.',
          '$V=2\\pi\\int_0^{' + k + '}x\\cdot x(' + k + '-x)\\,dx=2\\pi\\int_0^{' + k + '}(' + (k === 1 ? '' : k) + 'x^2-x^3)\\,dx$.',
          '$=2\\pi\\left(\\frac{' + Math.pow(k, 4) + '}{3}-\\frac{' + Math.pow(k, 4) + '}{4}\\right)=' + fpi(Math.pow(k, 4), 6) + '$.'], { ansTex: fpi(Math.pow(k, 4), 6), tol: 1e-4 });
        p.check = () => near(2 * Math.PI * simpson(x => x * x * (k - x), 0, k), V, 1e-6);
        return p;
      }
      const m = r.int(1, 3), V = Math.PI * Math.pow(m, 4) / 2;
      const p = P.num('La regió del primer quadrant sota $y=' + m * m + '-x^2$ gira al voltant de l\'eix $y$. Calcula el volum.', V, [
        'Talla l\'eix $x$ a $x=' + m + '$. Capes: radi $x$, alçada $' + m * m + '-x^2$.',
        '$V=2\\pi\\int_0^{' + m + '}x(' + m * m + '-x^2)\\,dx=2\\pi\\left[\\frac{' + m * m + 'x^2}{2}-\\frac{x^4}{4}\\right]_0^{' + m + '}$.',
        '$=2\\pi\\cdot\\frac{' + Math.pow(m, 4) + '}{4}=' + fpi(Math.pow(m, 4), 2) + '$. (Comprovació: és un paraboloide, $\\frac12\\pi R^2h$ amb $R=' + m + '$, $h=' + m * m + '$.)'], { ansTex: fpi(Math.pow(m, 4), 2), tol: 1e-4 });
      p.check = () => near(2 * Math.PI * simpson(x => x * (m * m - x * x), 0, m), V, 1e-6);
      return p;
    }
  });

  /* ---------------- L9: integrals impròpies ---------------- */
  const IMP = [
    p => ({ q: '\\int_1^{\\infty}\\frac{dx}{x^{' + p + '}}', conv: p > 1, v: p > 1 ? [1, p - 1] : null, why: p > 1 ? '$\\left[\\frac{x^{' + (1 - p) + '}}{' + (1 - p) + '}\\right]_1^{\\infty}=0-\\frac{1}{' + (1 - p) + '}=' + fq(1, p - 1) + '$ (a l\'infinit, $x^{' + (1 - p) + '}\\to0$).' : (p === 1 ? '$[\\ln x]_1^{\\infty}=\\infty$.' : '$x^{' + (1 - p) + '}\\to\\infty$.'), rule: 'A l\'infinit, $\\int_1^\\infty\\frac{dx}{x^p}$ convergeix si i només si $p>1$.' }),
    a => ({ q: '\\int_0^{\\infty}e^{-' + (a === 1 ? '' : a) + 'x}\\,dx', conv: true, v: [1, a], why: '$\\left[-\\frac{1}{' + a + '}e^{-' + (a === 1 ? '' : a) + 'x}\\right]_0^{\\infty}=0+\\frac1{' + a + '}=' + fq(1, a) + '$.', rule: 'L\'exponencial decreixent mana: $e^{-ax}\\to0$ molt de pressa.' }),
    k => ({ q: '\\int_0^{1}\\frac{dx}{\\sqrt[' + k + ']{x}}', conv: true, v: [k, k - 1], why: '$\\int_0^1x^{-1/' + k + '}dx=\\left[\\frac{x^{' + (k - 1) + '/' + k + '}}{' + (k - 1) + '/' + k + '}\\right]_0^1=' + fq(k, k - 1) + '$.', rule: 'A prop de 0, $\\int_0^1\\frac{dx}{x^p}$ convergeix si i només si $p<1$ (al revés que a l\'infinit).' }),
    p => ({ q: '\\int_0^{1}\\frac{dx}{x^{' + p + '}}', conv: false, v: null, why: p === 1 ? '$[\\ln x]_0^1=0-(-\\infty)=\\infty$.' : '$\\left[\\frac{x^{' + (1 - p) + '}}{' + (1 - p) + '}\\right]_0^1$ i $x^{' + (1 - p) + '}\\to\\infty$ quan $x\\to0^+$.', rule: 'A prop de 0, $\\int_0^1\\frac{dx}{x^p}$ convergeix si i només si $p<1$.' }),
    () => ({ q: '\\int_{-\\infty}^{\\infty}\\frac{dx}{1+x^2}', conv: true, v: 'pi', why: '$[\\arctan x]_{-\\infty}^{\\infty}=\\frac\\pi2-\\left(-\\frac\\pi2\\right)=\\pi$.', rule: 'Es parteix en dues ($-\\infty$ a 0 i 0 a $\\infty$) i cal que convergeixin totes dues.' }),
    () => ({ q: '\\int_0^{\\infty}x\\,e^{-x}\\,dx', conv: true, v: [1, 1], why: 'Per parts: $[-xe^{-x}-e^{-x}]_0^{\\infty}=0-(-1)=1$ (L\'Hôpital: $xe^{-x}\\to0$).', rule: 'Per parts i després el límit a l\'infinit.' })
  ];
  add('l9', {
    id: 'improper', title: 'Integrals impròpies: convergeix? quant val?', level: 2,
    desc: 'Integral amb un límit infinit o una funció que explota: es calcula com un límit. Si el límit és finit, convergeix.',
    needs: ['tfc', 'limits'],
    make(r) {
      const t = r.int(0, 5);
      const arg = t === 0 ? r.pick([2, 3, 4, 1]) : t === 1 ? r.int(1, 5) : t === 2 ? r.int(2, 4) : t === 3 ? r.pick([1, 2, 3]) : 0;
      const o = IMP[t](arg);
      const vt = o.v === 'pi' ? '$\\pi$' : o.v ? '$' + fq(o.v[0], o.v[1]) + '$' : null;
      const pool = ['$1$', '$\\frac{1}{2}$', '$2$', '$\\frac{1}{3}$', '$\\frac{\\pi}{2}$', '$0$', '$\\frac{3}{2}$', '$3$', '$\\frac{1}{4}$', '$\\frac{4}{3}$'];
      const correct = o.conv ? 'Convergeix i val ' + vt : 'Divergeix (val $\\infty$)';
      const wr = o.conv ? ['Divergeix (val $\\infty$)'] : [];
      pool.filter(x => x !== vt).slice(0, 8).forEach(x => wr.push('Convergeix i val ' + x));
      const ws = r.shuffle(wr.slice(o.conv ? 1 : 0)).slice(0, o.conv ? 2 : 3);
      if (o.conv) ws.unshift(wr[0]);
      return P.mc(r, 'Estudia $\\displaystyle ' + o.q + '$.', correct, ws, ['Es calcula com un límit: $\\int_a^\\infty f=\\lim_{b\\to\\infty}\\int_a^bf$ (o $\\lim_{\\epsilon\\to0^+}$ si el problema és al punt).', o.why, o.rule]);
    }
  });

  /* ---------------- L11: mescles amb volum variable ---------------- */
  add('l11', {
    id: 'mix_var', title: 'Mescles amb volum variable', level: 3,
    desc: 'Si entra i surt cabal diferent, el volum canvia: $V(t)=V_0+(e-s)t$ i la concentració que surt és $\\frac{Q}{V(t)}$. L\'EDO és lineal amb coeficient no constant.',
    needs: ['mescles', 'lineal1'],
    make(r) {
      const V0 = r.pick([50, 100, 200]), ein = r.pick([3, 4]), sout = ein - 1, c = r.pick([1, 2, 0.5]), Q0 = r.pick([0, 10, 20]);
      const T = V0; // el volum es duplica
      const V = V0 + T, ex = sout; // (V0/V)^(s/(e-s)) amb e-s = 1
      const Q = c * V + (Q0 - c * V0) * Math.pow(V0 / V, ex);
      const p = P.num('Un dipòsit té $' + V0 + '$ L d\'aigua amb $' + Q0 + '$ kg de sal. Hi entra aigua amb $' + String(c).replace('.', ',') + '$ kg/L de sal a $' + ein + '$ L/min i en surt la mescla (ben remenada) a $' + sout + '$ L/min. Quanta sal hi ha quan el volum s\'ha duplicat?', Q, [
        'Volum: $V(t)=' + V0 + '+t$ (entra 1 L/min més del que surt). Es duplica a $t=' + T + '$ min.',
        'Balanç: $Q\'=\\underbrace{' + String(c * ein).replace('.', ',') + '}_{\\text{entra}}-\\underbrace{\\frac{' + sout + 'Q}{' + V0 + '+t}}_{\\text{surt}}$: lineal, $Q\'+\\frac{' + sout + '}{' + V0 + '+t}Q=' + String(c * ein).replace('.', ',') + '$.',
        'Factor integrant: $\\mu=e^{\\int\\frac{' + sout + '}{' + V0 + '+t}dt}=(' + V0 + '+t)^{' + sout + '}$. Integrant: $Q=' + String(c).replace('.', ',') + '(' + V0 + '+t)+\\frac{C}{(' + V0 + '+t)^{' + sout + '}}$.',
        '$Q(0)=' + Q0 + '$ ⇒ $C=(' + Q0 + '-' + String(c * V0).replace('.', ',') + ')\\cdot' + V0 + '^{' + sout + '}$. A $t=' + T + '$: $Q=' + String(c * V).replace('.', ',') + (Q0 - c * V0 < 0 ? '-' : '+') + String(Math.abs(Q0 - c * V0)).replace('.', ',') + '\\cdot\\left(\\frac12\\right)^{' + sout + '}=' + M.numTex(Q) + '$ kg.'], { tol: 1e-3 });
      p.check = () => near(rk4((t, q) => c * ein - sout * q / (V0 + t), 0, Q0, T), Q, 1e-6);
      return p;
    }
  });

  /* ---------------- L11: refredament, quant triga? ---------------- */
  add('l11', {
    id: 'cooling_time', title: 'Refredament de Newton: troba $k$ i quant triga', level: 2,
    desc: 'Amb dues mesures es troba $k$; després s\'aïlla el temps. La diferència amb l\'ambient decau exponencialment: $T-T_a=(T_0-T_a)e^{-kt}$.',
    needs: ['refred', 'log'],
    make(r) {
      const Ta = r.pick([18, 20, 22, 25]), q = r.pick([2, 3]), D0 = q === 2 ? r.pick([64, 80, 96]) : r.pick([54, 81]), t1 = r.pick([5, 10, 15]), n = r.int(2, 3);
      const D1 = D0 / q, Dn = D0 / Math.pow(q, n), ans = n * t1;
      const p = P.num('Un cafè a $' + (Ta + D0) + '$ °C es deixa en una habitació a $' + Ta + '$ °C. Al cap de $' + t1 + '$ min és a $' + (Ta + D1) + '$ °C. Quants minuts (des del principi) triga a arribar a $' + (Ta + Dn) + '$ °C?', ans, [
        'Llei de Newton: $T\'=-k(T-' + Ta + ')$ ⇒ $T-' + Ta + '=' + D0 + 'e^{-kt}$ (separable).',
        'A $t=' + t1 + '$: $' + D1 + '=' + D0 + 'e^{-' + t1 + 'k}$ ⇒ $e^{-' + t1 + 'k}=\\frac1' + q + '$ ⇒ $k=\\frac{\\ln ' + q + '}{' + t1 + '}$.',
        'Volem $' + Dn + '=' + D0 + 'e^{-kt}$ ⇒ $e^{-kt}=\\frac{1}{' + Math.pow(q, n) + '}$ ⇒ $t=\\frac{' + n + '\\ln ' + q + '}{k}=' + ans + '$ min. (Cada ' + t1 + ' min la diferència es divideix per ' + q + '.)'], {});
      p.check = () => { const k = Math.log(D0 / D1) / t1; return near(Math.log(D0 / Dn) / k, ans, 1e-9); };
      return p;
    }
  });

  /* ---------------- L2: raons de canvi relacionades ---------------- */
  add('l2', {
    id: 'related_more', title: 'Raons de canvi: escala, globus, ombra', level: 2,
    desc: 'Escriu la relació entre les magnituds, deriva-la respecte del temps (regla de la cadena) i substitueix els valors de l\'instant.',
    needs: ['related', 'cadena'],
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const [x, y, L] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10]]), v = r.int(1, 3), ans = -x * v / y;
        const p = P.num('Una escala de $' + L + '$ m recolzada en una paret. La base s\'allunya de la paret a $' + v + '$ m/s. A quina velocitat baixa la part de dalt quan la base és a $' + x + '$ m? (negatiu si baixa)', ans, [
          'Relació: $x^2+y^2=' + L * L + '$.', 'Derivem respecte de $t$: $2x\\,x\'+2y\\,y\'=0$ ⇒ $y\'=-\\frac{x\\,x\'}{y}$.', 'Quan $x=' + x + '$: $y=\\sqrt{' + L * L + '-' + x * x + '}=' + y + '$, i $y\'=-\\frac{' + x + '\\cdot' + v + '}{' + y + '}=' + fq(-x * v, y) + '$ m/s.'], { ansTex: fq(-x * v, y) });
        p.check = () => { const h = 1e-6, Y = s => Math.sqrt(L * L - (x + v * s) ** 2); return near((Y(h) - Y(-h)) / (2 * h), ans, 1e-5); };
        return p;
      }
      if (t === 1) {
        const q = r.pick([4, 8, 16, 36]), R = r.int(1, 3), ans = q / (4 * Math.PI * R * R);
        const p = P.num('S\'infla un globus esfèric a $' + q + '$ cm³/s. A quina velocitat creix el radi quan fa $' + R + '$ cm? (pots escriure <code>pi</code>)', ans, [
          'Relació: $V=\\frac43\\pi r^3$.', 'Derivem: $V\'=4\\pi r^2\\,r\'$ ⇒ $r\'=\\frac{V\'}{4\\pi r^2}$.', '$r\'=\\frac{' + q + '}{4\\pi\\cdot' + R * R + '}=\\frac{' + fq(q, 4 * R * R) + '}{\\pi}$ cm/s.'], { ansTex: '\\frac{' + fq(q, 4 * R * R) + '}{\\pi}', tol: 1e-4 });
        p.check = () => { const h = 1e-5, Rof = s => Math.cbrt((4 / 3 * Math.PI * R ** 3 + q * s) * 3 / (4 * Math.PI)); return near((Rof(h) - Rof(-h)) / (2 * h), ans, 1e-5); };
        return p;
      }
      const H = r.pick([6, 8, 10]), h = r.pick([2, 3]), v = r.pick([1, 2]), ans = h * v / (H - h);
      const p = P.num('Una persona de $' + h + '$ m camina a $' + v + '$ m/s allunyant-se d\'un fanal de $' + H + '$ m. A quina velocitat creix la seva ombra?', ans, [
        'Triangles semblants: si $x$ és la distància al fanal i $s$ la longitud de l\'ombra, $\\frac{' + H + '}{x+s}=\\frac{' + h + '}{s}$ ⇒ $' + (H - h) + 's=' + h + 'x$.',
        'Derivem: $' + (H - h) + 's\'=' + h + 'x\'$ ⇒ $s\'=\\frac{' + h + '\\cdot' + v + '}{' + (H - h) + '}=' + fq(h * v, H - h) + '$ m/s.', 'No depèn d\'on sigui: l\'ombra creix a ritme constant.'], { ansTex: fq(h * v, H - h) });
      p.check = () => near(h * v / (H - h), ans) && near(H / (10 + h * 10 / (H - h)), h / (h * 10 / (H - h)), 1e-9);
      return p;
    }
  });

  /* ---------------- L5: coeficient de Maclaurin d'un producte ---------------- */
  const SER = {
    exp: { tex: a => 'e^{' + (a === 1 ? '' : a === -1 ? '-' : a) + 'x}', c: n => 1 / fact(n), f: Math.exp, name: '$e^u=1+u+\\frac{u^2}{2}+\\frac{u^3}{6}+\\dots$' },
    sin: { tex: a => '\\sin ' + (a === 1 ? '' : a) + 'x', c: n => n % 2 ? (((n - 1) / 2) % 2 ? -1 : 1) / fact(n) : 0, f: Math.sin, name: '$\\sin u=u-\\frac{u^3}{6}+\\dots$' },
    cos: { tex: a => '\\cos ' + (a === 1 ? '' : a) + 'x', c: n => n % 2 ? 0 : ((n / 2) % 2 ? -1 : 1) / fact(n), f: Math.cos, name: '$\\cos u=1-\\frac{u^2}{2}+\\dots$' },
    ln: { tex: a => '\\ln(1+' + (a === 1 ? '' : a) + 'x)', c: n => n === 0 ? 0 : (n % 2 ? 1 : -1) / n, f: u => Math.log(1 + u), name: '$\\ln(1+u)=u-\\frac{u^2}{2}+\\frac{u^3}{3}-\\dots$' },
    geo: { tex: a => '\\frac{1}{1-' + (a === 1 ? '' : a) + 'x}', c: () => 1, f: u => 1 / (1 - u), name: '$\\frac1{1-u}=1+u+u^2+u^3+\\dots$' }
  };
  function fact(n) { let p = 1; for (let i = 2; i <= n; i++) p *= i; return p; }
  add('l5', {
    id: 'mclaurin_mix', title: 'Coeficient de Maclaurin d\'un producte (sense derivar)', level: 2,
    desc: 'Multiplica els desenvolupaments coneguts i queda\'t amb el terme que demanen: molt més ràpid que derivar 3 vegades.',
    needs: ['mclaurin', 'taylor'],
    make(r) {
      const ks = Object.keys(SER), A = r.pick(ks); let B = r.pick(ks); while (B === A) B = r.pick(ks);
      const a = A === 'exp' ? r.pick([1, 2, -1]) : r.pick([1, 2]), b = r.pick([1, 2]), n = r.int(2, 3);
      const ca = k => SER[A].c(k) * Math.pow(a, k), cb = k => SER[B].c(k) * Math.pow(b, k);
      let v = 0; const terms = [];
      for (let i = 0; i <= n; i++) { const t = ca(i) * cb(n - i); v += t; if (Math.abs(t) > 1e-12) terms.push('(' + M.numTex(ca(i)) + ')(' + M.numTex(cb(n - i)) + ')'); }
      if (Math.abs(v) < 1e-12) return null; // massa trivial
      const tex = SER[A].tex(a) + '\\cdot ' + SER[B].tex(b);
      const p = P.num('Quin és el coeficient de $x^{' + n + '}$ al polinomi de Maclaurin de $f(x)=' + tex + '$?', v, [
        'Desenvolupaments: ' + SER[A].name + ' i ' + SER[B].name + (a !== 1 || b !== 1 ? ' (amb $u=' + (a === 1 ? '' : a) + 'x$ o $u=' + (b === 1 ? '' : b) + 'x$).' : '.'),
        'El terme $x^{' + n + '}$ surt de multiplicar $x^i$ del primer per $x^{' + n + '-i}$ del segon: $' + (terms.join('+') || '0') + '$.',
        'Coeficient: $' + M.numTex(v) + '$. (També és $\\frac{f^{(' + n + ')}(0)}{' + n + '!}$.)'], { tol: 1e-6 });
      p.check = () => {
        // a partir de la funció: (f(h) - P_{n-1}(h)) / h^n quan h→0
        const f = x => SER[A].f(a * x) * SER[B].f(b * x);
        const low = x => { let s = 0; for (let k = 0; k < n; k++) { let ck = 0; for (let i = 0; i <= k; i++) ck += ca(i) * cb(k - i); s += ck * Math.pow(x, k); } return s; };
        const h = 2e-3, e1 = (f(h) - low(h)) / Math.pow(h, n), e2 = (f(-h) - low(-h)) / Math.pow(-h, n);
        return Math.abs((e1 + e2) / 2 - v) < 0.05 * Math.max(1, Math.abs(v));
      };
      return p;
    }
  });
})();
