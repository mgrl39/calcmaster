/* ===================================================================
   gens_jocs.js — Tipus d'exercici dels jocs d'entrenament:
   · 🧭 Quin mètode?  — reconèixer la tècnica abans de calcular
                        (integrals i EDOs): és el primer pas de tot
                        exercici d'examen.
   · 🔎 Troba l'error — una resolució amb un pas equivocat (o cap):
                        entrena revisar, que és el que evita perdre punts.
   · 📜 Teoremes      — enunciats exactes (hipòtesis + conclusió) i
                        saber quan es poden aplicar.
   Són generadors normals: tenen rang, repàs espaiat i surten al mapa.
   El camp `game` indica a quin joc pertanyen.
   =================================================================== */
(function () {
  'use strict';
  const P = Calc.P;
  const add = (mod, g) => { if (Calc.byId[mod]) Calc.addGen(mod, g); };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  /** fracció n/d en LaTeX simplificada */
  const fq = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; };
  /** coeficient c davant de t: 1→'', -1→'-' */
  const co = c => c === 1 ? '' : c === -1 ? '-' : String(c);
  const sgn = c => c < 0 ? '- ' + Math.abs(c) : '+ ' + c;
  const ex = k => 'e^{' + co(k) + 'x}';

  /* ================================================================
     🧭 QUIN MÈTODE? — integrals
     ================================================================ */
  const MI = ['Immediata (taula o quasi)', 'Substitució (canvi de variable)', 'Per parts', 'Fraccions simples', 'Trigonomètrica (identitats)', 'Canvi trigonomètric'];
  const MI_POOL = [
    // [categoria, generador del integrand (r) → [tex, per què]]
    [0, r => { const a = r.int(1, 5); return ['\\frac{1}{x^2+' + a * a + '}', 'És de la taula: $\\int\\frac{dx}{x^2+a^2}=\\frac1a\\arctan\\frac xa$.']; }],
    [0, r => { const a = r.int(2, 6), b = r.nz(-5, 5); return ['\\frac{1}{' + a + 'x' + sgn(b) + '}', 'Lineal a baix: $\\frac1{' + a + '}\\ln|' + a + 'x' + sgn(b) + '|$ (taula, dividint per la derivada de dins).']; }],
    [0, r => { const a = r.int(1, 4); return ['\\frac{1}{\\sqrt{' + a * a + '-x^2}}', 'De la taula: $\\arcsin\\frac x{' + a + '}$.']; }],
    [0, r => { const a = r.int(2, 5), b = r.nz(-3, 3); return ['e^{' + a + 'x' + sgn(b) + '}', 'Exponencial d\'una lineal: $\\frac1{' + a + '}e^{' + a + 'x' + sgn(b) + '}$.']; }],
    [1, r => { const a = r.int(1, 4); return ['x\\,e^{' + co(a) + 'x^2}', 'Hi ha $x^2$ a dins i la seva derivada $2x$ fora: $u=' + co(a) + 'x^2$.']; }],
    [1, r => { const a = r.int(1, 6), n = r.int(2, 5); return ['x\\,(x^2+' + a + ')^{' + n + '}', '$u=x^2+' + a + '$, $du=2x\\,dx$: la $x$ de fora és (gairebé) la derivada de dins.']; }],
    [1, r => { const n = r.int(2, 4); return ['\\frac{(\\ln x)^{' + n + '}}{x}', '$u=\\ln x$, $du=\\frac{dx}x$.']; }],
    [1, () => ['\\cos x\\; e^{\\sin x}', '$u=\\sin x$, $du=\\cos x\\,dx$.']],
    [1, r => { const n = r.int(2, 5); return ['\\sin^{' + n + '}x\\,\\cos x', '$u=\\sin x$: queda $\\int u^{' + n + '}du$.']; }],
    [1, r => { const a = r.int(1, 4); return ['\\frac{e^x}{(e^x+' + a + ')^2}', '$u=e^x+' + a + '$, $du=e^x\\,dx$.']; }],
    [2, r => { const a = r.nz(-3, 3); return ['x\\,' + ex(a), 'Producte polinomi × exponencial: $u=x$, $dv=' + ex(a) + 'dx$.']; }],
    [2, r => { const a = r.int(1, 4); return ['x^2\\sin ' + co(a) + 'x', 'Polinomi × trigonomètrica: parts dues vegades ($u=x^2$).']; }],
    [2, r => { const n = r.int(1, 4); return ['x^{' + n + '}\\ln x', 'El logaritme fa de $u$: $u=\\ln x$, $dv=x^{' + n + '}dx$.']; }],
    [2, () => ['\\arctan x', 'Sola, sense res al costat: $u=\\arctan x$, $dv=dx$.']],
    [2, r => { const a = r.int(1, 3), b = r.int(1, 3); return ['e^{' + co(a) + 'x}\\cos ' + co(b) + 'x', 'Parts <b>cíclica</b>: dues vegades i s\'aïlla la integral.']; }],
    [3, r => { const a = r.int(1, 4), b = a + r.int(1, 4); return ['\\frac{1}{(x-' + a + ')(x-' + b + ')}', 'Quocient de polinomis amb el de baix factoritzat: $\\frac A{x-' + a + '}+\\frac B{x-' + b + '}$.']; }],
    [3, r => { const a = r.int(1, 5); return ['\\frac{1}{x^2-' + a * a + '}', '$x^2-' + a * a + '=(x-' + a + ')(x+' + a + ')$: dues arrels reals ⇒ fraccions simples (no és arctan: el signe és −).']; }],
    [3, r => { const a = r.int(1, 4); return ['\\frac{x+1}{x(x+' + a + ')^2}', 'Arrel doble: $\\frac Ax+\\frac B{x+' + a + '}+\\frac C{(x+' + a + ')^2}$.']; }],
    [3, r => { const a = r.int(1, 3); return ['\\frac{x^3}{x^2-' + a * a + '}', 'Grau de dalt ≥ grau de baix: primer divisió, després fraccions simples.']; }],
    [4, r => { const a = r.int(1, 4); return ['\\sin^2 ' + co(a) + 'x', 'Potència parella: angle doble $\\sin^2\\theta=\\frac{1-\\cos2\\theta}2$.']; }],
    [4, () => ['\\sin^2x\\cos^2x', 'Totes dues parelles: $\\sin x\\cos x=\\frac12\\sin2x$ i després angle doble.']],
    [4, r => { const a = r.int(2, 4); return ['\\sin ' + a + 'x\\,\\cos x', 'Producte d\'angles diferents: $\\sin A\\cos B=\\frac12[\\sin(A+B)+\\sin(A-B)]$.']; }],
    [4, () => ['\\cos^4x', 'Potència parella: angle doble dues vegades.']],
    [5, r => { const a = r.int(1, 4); return ['\\sqrt{' + a * a + '-x^2}', '$\\sqrt{a^2-x^2}$: $x=' + co(a) + '\\sin\\theta$ (queda $' + co(a) + '\\cos\\theta$).']; }],
    [5, r => { const a = r.int(1, 3); return ['\\frac{1}{(' + a * a + '+x^2)^{3/2}}', '$a^2+x^2$ elevat a una potència no entera: $x=' + co(a) + '\\tan\\theta$.']; }],
    [5, r => { const a = r.int(1, 3); return ['\\frac{x^2}{\\sqrt{' + a * a + '-x^2}}', '$x=' + co(a) + '\\sin\\theta$: l\'arrel es converteix en $' + co(a) + '\\cos\\theta$.']; }]
  ];
  add('l7', {
    id: 'metode_int', game: 'metode', title: '🧭 Quin mètode? (integrals)', level: 1,
    desc: 'Mira la integral i digues amb quina tècnica la faries, abans de calcular res. És el primer pas de qualsevol exercici d\'examen.',
    needs: ['primit', 'subst', 'parts', 'trigint', 'fracs'],
    make(r) {
      const [cat, f] = r.pick(MI_POOL), [tex, why] = f(r);
      return P.mcFixed('Quin és el mètode <b>adequat</b> per calcular $\\displaystyle\\int ' + tex + '\\,dx$? (no cal fer-la)', MI.slice(), cat,
        ['<b>' + MI[cat] + '</b>. ' + why, 'Truc: busca primer si hi ha <b>una funció i la seva derivada</b> (substitució); després <b>producte de tipus diferents</b> (parts); <b>quocient de polinomis</b> (fraccions); <b>potències de sin/cos</b> (identitats); <b>arrels de $a^2\\pm x^2$</b> (canvi trigonomètric).']);
    }
  });

  /* ================================================================
     🧭 QUIN MÈTODE? — EDOs
     ================================================================ */
  const ME = ['Variables separables', 'Lineal de 1r ordre (factor integrant)', 'Canvi de variable (z = …)', '2n ordre homogènia (equació característica)', '2n ordre no homogènia (coeficients indeterminats)'];
  const ME_POOL = [
    [0, r => { const a = r.int(1, 4); return ['y\'=' + co(a) + 'x\\,y^2', 'Es pot escriure $y\'=f(x)g(y)$: $\\frac{dy}{y^2}=' + co(a) + 'x\\,dx$. (No és lineal: hi ha $y^2$.)']; }],
    [0, r => { const k = r.int(1, 3), M_ = r.pick([10, 100, 1000]); return ['P\'=' + k + 'P\\left(1-\\frac{P}{' + M_ + '}\\right)', 'Logística: $\\frac{dP}{P(1-P/' + M_ + ')}=' + k + 'dt$ (separable, amb fraccions simples).']; }],
    [0, () => ['y\'=\\frac{x^2}{1+y^2}', '$(1+y^2)dy=x^2dx$.']],
    [0, r => { const a = r.int(1, 3); return ['y\'=e^{x-' + co(a) + 'y}', '$e^{x-' + a + 'y}=e^x\\cdot e^{-' + a + 'y}$ ⇒ $e^{' + a + 'y}dy=e^xdx$.']; }],
    [0, () => ['y\'=(y-1)(y-3)', 'Només depèn de $y$: $\\frac{dy}{(y-1)(y-3)}=dx$ (separable; la integral, per fraccions simples).']],
    [1, r => { const a = r.int(1, 4); return ['y\'+' + co(a) + 'y=x', 'Forma $y\'+p(x)y=q(x)$ i <b>no</b> es pot separar ($x$ i $y$ sumen): $\\mu=e^{' + co(a) + 'x}$.']; }],
    [1, r => { const n = r.int(1, 3); return ['y\'+\\frac{' + (n === 1 ? '' : n) + 'y}{x}=x^2', '$p(x)=\\frac{' + n + '}{x}$ ⇒ $\\mu=e^{' + n + '\\ln x}=x^{' + n + '}$.']; }],
    [1, () => ['y\'=x+y', '$y\'-y=x$: lineal. (Separable no: no és producte.)']],
    [1, () => ['xy\'-y=x^3', 'Dividint per $x$: $y\'-\\frac yx=x^2$, lineal.']],
    [1, r => { const a = r.int(2, 5); return ['\\frac{dQ}{dt}=' + a + '-\\frac{Q}{100}', 'Problema de mescles: $Q\'+\\frac{Q}{100}=' + a + '$ (lineal; també separable perquè els coeficients són constants, però el mètode estàndard és el factor integrant).']; }],
    [2, () => ['y\'=(x+y)^2', '$z=x+y$ ⇒ $z\'=1+z^2$, separable.']],
    [2, () => ['y\'=\\frac{x^2+y^2}{xy}', 'Homogènia de grau 0: $z=\\frac yx$ (o bé $z=x^2+y^2$).']],
    [2, () => ['y\'=\\frac{y}{x}+\\frac{x}{y}', 'Depèn només de $\\frac yx$: canvi $y=zx$.']],
    [3, r => { const b = r.nz(-4, 4), c = r.nz(-6, 6); return ['y\'\'' + (b < 0 ? '-' : '+') + co(Math.abs(b)) + 'y\'' + (c < 0 ? '-' : '+') + Math.abs(c) + 'y=0', 'Coeficients constants i $=0$: $r^2' + (b < 0 ? '-' : '+') + co(Math.abs(b)) + 'r' + (c < 0 ? '-' : '+') + Math.abs(c) + '=0$.']; }],
    [3, r => { const k = r.int(1, 5); return ['y\'\'+' + k * k + 'y=0', '$r^2+' + k * k + '=0$ ⇒ $r=\\pm' + k + 'i$: $C_1\\cos' + co(k) + 'x+C_2\\sin' + co(k) + 'x$.']; }],
    [4, r => { const b = r.nz(-4, 4); return ['y\'\'' + (b < 0 ? '-' : '+') + co(Math.abs(b)) + 'y\'+y=x^2', 'Segon membre polinòmic: $y=y_h+y_p$ amb $y_p=Ax^2+Bx+C$.']; }],
    [4, r => { const k = r.int(1, 3); return ['y\'\'+' + k * k + 'y=\\cos ' + co(k) + 'x', 'No homogènia amb <b>ressonància</b>: $y_p=x(A\\cos' + co(k) + 'x+B\\sin' + co(k) + 'x)$.']; }],
    [4, r => { const a = r.int(2, 4); return ['y\'\'-y\'=e^{' + a + 'x}', 'Coeficients constants i segon membre exponencial: $y_p=Ae^{' + a + 'x}$.']; }]
  ];
  add('l10', {
    id: 'metode_edo', game: 'metode', title: '🧭 Quin tipus d\'EDO és?', level: 1,
    desc: 'Classifica l\'EDO pel mètode que la resol. Si no saps de quin tipus és, no saps per on començar.',
    needs: ['edo', 'separables', 'lineal1', 'homog', 'nohomog'],
    make(r) {
      const [cat, f] = r.pick(ME_POOL), [tex, why] = f(r);
      return P.mcFixed('Amb quin mètode resoldries $' + tex + '$? (no cal resoldre-la)', ME.slice(), cat,
        ['<b>' + ME[cat] + '</b>. ' + why, 'Ordre de preguntes: <b>quin ordre té?</b> → (1r) es pot posar com $f(x)g(y)$? → és $y\'+p(x)y=q(x)$? → si no, busca un canvi. (2n) homogènia ($=0$) o amb segon membre?']);
    }
  });

  /* ================================================================
     🔎 TROBA L'ERROR — resolucions amb un pas equivocat (o cap)
     Cada plantilla rep `bad` (índex del pas erroni, o -1 si tot és bé)
     i retorna els passos ja coherents amb l'error (l'error es propaga).
     ================================================================ */
  const T_ERR = {
    l2: [
      { n: 3, build(r, bad) {
        const a = r.int(1, 4), n = r.int(2, 4), v = n * Math.pow(1 + a, n - 1) * 2, vb = n * Math.pow(1 + a, n - 1);
        const s = [
          'Regla de la cadena: $(g(h(x)))\'=g\'(h(x))\\cdot h\'(x)$, amb $g(u)=u^{' + n + '}$, $h(x)=x^2+' + a + '$.',
          bad === 1 ? '$f\'(x)=' + n + '(x^2+' + a + ')^{' + (n - 1) + '}$' : '$f\'(x)=' + n + '(x^2+' + a + ')^{' + (n - 1) + '}\\cdot 2x$',
          bad === 2 ? '$f\'(1)=' + n + '\\cdot' + (1 + a) + '^{' + (n - 1) + '}\\cdot2=' + (v + 2 * n) + '$' : bad === 1 ? '$f\'(1)=' + n + '\\cdot' + (1 + a) + '^{' + (n - 1) + '}=' + vb + '$' : '$f\'(1)=' + n + '\\cdot' + (1 + a) + '^{' + (n - 1) + '}\\cdot2=' + v + '$'];
        return { q: 'Calcula $f\'(1)$ per a $f(x)=(x^2+' + a + ')^{' + n + '}$.', s, ok: 'Correcte: $f\'(1)=' + v + '$.',
          why: ['', 'Falta multiplicar per la derivada de dins, $h\'(x)=2x$ (<b>regla de la cadena</b>).', 'Error d\'aritmètica: $' + n + '\\cdot' + (1 + a) + '^{' + (n - 1) + '}\\cdot 2=' + v + '$.'] };
      } },
      { n: 3, build(r, bad) {
        const a = r.int(2, 5);
        const s = [
          'Substituint $x=0$: surt $\\frac00$, indeterminació.',
          bad === 1 ? 'L\'Hôpital: $\\lim\\left(\\frac{1-\\cos ' + a + 'x}{x^2}\\right)\'=\\lim\\frac{' + a + '\\sin ' + a + 'x\\cdot x^2-(1-\\cos ' + a + 'x)2x}{x^4}$' : 'L\'Hôpital: $\\lim_{x\\to0}\\frac{' + a + '\\sin ' + a + 'x}{2x}$, i torna a ser $\\frac00$.',
          bad === 2 ? 'L\'Hôpital un altre cop: $\\lim_{x\\to0}\\frac{' + a + '\\cos ' + a + 'x}{2}=\\frac{' + a + '}{2}$' : bad === 1 ? 'Simplificant i substituint: el límit val $0$.' : 'L\'Hôpital un altre cop: $\\lim_{x\\to0}\\frac{' + a * a + '\\cos ' + a + 'x}{2}=' + fq(a * a, 2) + '$'];
        return { q: 'Calcula $\\displaystyle\\lim_{x\\to0}\\frac{1-\\cos ' + a + 'x}{x^2}$.', s, ok: 'Correcte: el límit és $' + fq(a * a, 2) + '$.',
          why: ['', 'L\'Hôpital <b>no</b> és derivar el quocient: es deriven <b>numerador i denominador per separat</b>, $\\frac{f\'}{g\'}$.', 'Falta la cadena: $(\\sin ' + a + 'x)\'=' + a + '\\cos ' + a + 'x$, així que surt $' + a * a + '\\cos ' + a + 'x$.'] };
      } }
    ],
    l7: [
      { n: 3, build(r, bad) {
        const a = r.pick([2, 3, 4, 5]), E = 'e^{' + a + 'x}';
        const v = bad === 0 ? co(a) + E : '\\frac1{' + a + '}' + E;
        const s = [
          '$u=x$, $dv=' + E + 'dx$ ⇒ $du=dx$, $v=' + v + '$.',
          bad === 1 ? '$\\int=uv+\\int v\\,du=' + (bad === 0 ? '' : '\\frac{x}{' + a + '}' + E) + '+\\int\\frac1{' + a + '}' + E + 'dx$' : bad === 0 ? '$\\int=uv-\\int v\\,du=' + co(a) + 'x' + E + '-\\int ' + co(a) + E + 'dx$' : '$\\int=uv-\\int v\\,du=\\frac{x}{' + a + '}' + E + '-\\int\\frac1{' + a + '}' + E + 'dx$',
          bad === 0 ? '$=' + co(a) + 'x' + E + '-' + E + '+C$' : bad === 1 ? '$=\\frac{x}{' + a + '}' + E + '+\\frac1{' + a * a + '}' + E + '+C$' : bad === 2 ? '$=\\frac{x}{' + a + '}' + E + '-\\frac1{' + a + '}' + E + '+C$' : '$=\\frac{x}{' + a + '}' + E + '-\\frac1{' + a * a + '}' + E + '+C$'];
        return { q: 'Calcula $\\displaystyle\\int x\\,' + E + '\\,dx$ per parts.', s, ok: 'Correcte: $\\frac{x}{' + a + '}' + E + '-\\frac1{' + a * a + '}' + E + '+C$ (derivant-ho surt $x' + E + '$).',
          why: ['La primitiva de $e^{' + a + 'x}$ és $\\frac1{' + a + '}e^{' + a + 'x}$: <b>es divideix</b> per $' + a + '$, no es multiplica (això seria derivar).', 'La fórmula és $\\int u\\,dv=uv\\,\\boldsymbol{-}\\int v\\,du$ (amb menys).', 'Integrar $\\frac1{' + a + '}e^{' + a + 'x}$ torna a dividir per $' + a + '$: surt $\\frac1{' + a * a + '}e^{' + a + 'x}$.'] };
      } },
      { n: 3, build(r, bad) {
        const a = r.int(1, 5), n = r.int(2, 4);
        const s = [
          bad === 0 ? '$u=x^2+' + a + '$ ⇒ $du=2x\\,dx$ ⇒ $x\\,dx=2\\,du$.' : '$u=x^2+' + a + '$ ⇒ $du=2x\\,dx$ ⇒ $x\\,dx=\\frac{du}2$.',
          bad === 0 ? '$\\int=2\\int u^{' + n + '}du=\\frac{2u^{' + (n + 1) + '}}{' + (n + 1) + '}$' : bad === 1 ? '$\\int=\\frac12\\int u^{' + n + '}du=\\frac{u^{' + (n + 1) + '}}{2}$' : '$\\int=\\frac12\\int u^{' + n + '}du=\\frac{u^{' + (n + 1) + '}}{' + 2 * (n + 1) + '}$',
          bad === 2 ? '$=\\frac{(x^2+' + a + ')^{' + (n + 1) + '}}{' + 2 * (n + 1) + '}$' : bad === 0 ? '$=\\frac{2(x^2+' + a + ')^{' + (n + 1) + '}}{' + (n + 1) + '}+C$' : bad === 1 ? '$=\\frac{(x^2+' + a + ')^{' + (n + 1) + '}}{2}+C$' : '$=\\frac{(x^2+' + a + ')^{' + (n + 1) + '}}{' + 2 * (n + 1) + '}+C$'];
        return { q: 'Calcula $\\displaystyle\\int x(x^2+' + a + ')^{' + n + '}dx$.', s, ok: 'Correcte: $\\frac{(x^2+' + a + ')^{' + (n + 1) + '}}{' + 2 * (n + 1) + '}+C$.',
          why: ['De $du=2x\\,dx$ surt $x\\,dx=\\frac{du}{2}$ (es divideix per 2).', 'Falta dividir per l\'exponent nou: $\\int u^{' + n + '}du=\\frac{u^{' + (n + 1) + '}}{' + (n + 1) + '}$.', 'Falta la constant $+C$: en una integral indefinida <b>sempre</b> (a l\'examen treu punts).'] };
      } }
    ],
    l9: [
      { n: 3, build(r, bad) {
        const k = r.int(1, 4), c = r.int(1, 2), f = t => t * t + k, v = f(c * c) * 2 * c;
        const s = [
          bad === 0 ? 'Sigui $G(u)=\\int_0^u(t^2+' + k + ')dt$. Pel TFC, $G\'(u)=(u^2+' + k + ')-' + k + '=u^2$.' : 'Sigui $G(u)=\\int_0^u(t^2+' + k + ')dt$. Pel TFC, $G\'(u)=u^2+' + k + '$.',
          bad === 1 ? '$F(x)=G(x^2)$ ⇒ $F\'(x)=G\'(x^2)=x^4+' + k + '$' : bad === 0 ? '$F(x)=G(x^2)$ ⇒ $F\'(x)=G\'(x^2)\\cdot2x=x^4\\cdot2x$' : '$F(x)=G(x^2)$ ⇒ $F\'(x)=G\'(x^2)\\cdot2x=(x^4+' + k + ')\\cdot2x$',
          bad === 2 ? '$F\'(' + c + ')=(' + Math.pow(c, 4) + '+' + k + ')\\cdot' + c + '=' + f(c * c) * c + '$' : bad === 1 ? '$F\'(' + c + ')=' + f(c * c) + '$' : bad === 0 ? '$F\'(' + c + ')=' + 2 * Math.pow(c, 5) + '$' : '$F\'(' + c + ')=(' + Math.pow(c, 4) + '+' + k + ')\\cdot' + 2 * c + '=' + v + '$'];
        return { q: 'Sigui $F(x)=\\displaystyle\\int_0^{x^2}(t^2+' + k + ')\\,dt$. Calcula $F\'(' + c + ')$.', s, ok: 'Correcte: $F\'(' + c + ')=' + v + '$.',
          why: ['El TFC diu $G\'(u)=f(u)$, sense restar res.', 'Falta la <b>regla de la cadena</b>: el límit de dalt és $x^2$, cal multiplicar per $(x^2)\'=2x$.', 'Error en substituir: $2x$ a $x=' + c + '$ val $' + 2 * c + '$.'] };
      } },
      { n: 3, build(r, bad) {
        const c = r.int(1, 2), U = c * c + 1;
        const s = [
          bad === 0 ? '$u=x^2+1$, $du=2x\\,dx$ ⇒ $x\\,dx=2\\,du$.' : '$u=x^2+1$, $du=2x\\,dx$ ⇒ $x\\,dx=\\frac{du}2$.',
          bad === 1 ? 'Els límits es queden igual: $\\int_0^{' + c + '}$.' : 'Límits nous: $x=0\\to u=1$, $x=' + c + '\\to u=' + U + '$.',
          bad === 0 ? '$I=2\\int_1^{' + U + '}u^2du=\\frac23(' + U + '^3-1)=' + fq(2 * (U * U * U - 1), 3) + '$' : bad === 1 ? '$I=\\frac12\\int_0^{' + c + '}u^2du=\\frac{' + c + '^3}{6}=' + fq(c * c * c, 6) + '$' : bad === 2 ? '$I=\\frac12\\int_1^{' + U + '}u^2du=\\frac12\\cdot\\frac{' + U + '^3}{3}=' + fq(U * U * U, 6) + '$' : '$I=\\frac12\\int_1^{' + U + '}u^2du=\\frac{' + U + '^3-1}{6}=' + fq(U * U * U - 1, 6) + '$'];
        return { q: 'Calcula $I=\\displaystyle\\int_0^{' + c + '}x(x^2+1)^2\\,dx$ amb el canvi $u=x^2+1$.', s, ok: 'Correcte: $I=' + fq(U * U * U - 1, 6) + '$.',
          why: ['De $du=2x\\,dx$ surt $x\\,dx=\\frac{du}2$.', 'Si canvies de variable en una integral <b>definida</b>, cal canviar els límits (o tornar a $x$ abans d\'avaluar).', 'Barrow: $[\\frac{u^3}3]_1^{' + U + '}=\\frac{' + U + '^3-1^3}{3}$; s\'ha oblidat el límit de baix.'] };
      } },
      { n: 4, build(r, bad) {
        const c = r.int(1, 4), A = fq(c * c * c, 6);
        const s = [
          'Talls: $x^2=' + co(c) + 'x$ ⇒ $x=0$, $x=' + c + '$.',
          bad === 1 ? 'A $(0,' + c + ')$ la de dalt és $y=x^2$.' : 'A $(0,' + c + ')$ la de dalt és $y=' + co(c) + 'x$ (prova $x=' + fq(c, 2) + '$).',
          bad === 1 ? '$A=\\int_0^{' + c + '}(x^2-' + co(c) + 'x)\\,dx$' : '$A=\\int_0^{' + c + '}(' + co(c) + 'x-x^2)\\,dx$',
          bad === 3 ? '$=\\left[' + co(c) + 'x^2-\\frac{x^3}3\\right]_0^{' + c + '}=' + fq(2 * c * c * c, 3) + '$' : bad === 1 ? '$=\\left[\\frac{x^3}3-\\frac{' + co(c) + 'x^2}2\\right]_0^{' + c + '}=-' + A + '$' : '$=\\left[\\frac{' + co(c) + 'x^2}2-\\frac{x^3}3\\right]_0^{' + c + '}=' + A + '$'];
        return { q: 'Àrea entre $y=x^2$ i $y=' + co(c) + 'x$.', s, ok: 'Correcte: l\'àrea és $' + A + '$.',
          why: ['', 'A $x=' + fq(c, 2) + '$: $x^2=' + fq(c * c, 4) + '$ i $' + co(c) + 'x=' + fq(c * c, 2) + '$: la recta queda per sobre. (A més, una àrea negativa sempre és senyal d\'error.)', '', 'La primitiva de $' + co(c) + 'x$ és $\\frac{' + co(c) + 'x^2}{2}$ (falta dividir per 2).'] };
      } }
    ],
    l10: [
      { n: 4, build(r, bad) {
        const a = r.pick([2, 4, -2, 6]), y0 = r.pick([2, 3, 5, -1]), h = a / 2;
        const s = [
          'Separem: $\\frac{dy}{y}=' + co(a) + 'x\\,dx$.',
          bad === 1 ? 'Integrem: $\\ln|y|=' + co(a) + 'x^2+C$.' : 'Integrem: $\\ln|y|=' + co(h) + 'x^2+C$.',
          bad === 2 ? 'Exponencial: $y=e^{' + co(bad === 1 ? a : h) + 'x^2}+C$.' : 'Exponencial: $y=Ke^{' + co(bad === 1 ? a : h) + 'x^2}$ (amb $K=\\pm e^C$).',
          bad === 2 ? '$y(0)=' + y0 + '$ ⇒ $1+C=' + y0 + '$ ⇒ $y=e^{' + co(h) + 'x^2}' + sgn(y0 - 1) + '$.' : '$y(0)=' + y0 + '$ ⇒ $K=' + y0 + '$ ⇒ $y=' + co(y0) + 'e^{' + co(bad === 1 ? a : h) + 'x^2}$.'];
        return { q: 'Resol $y\'=' + co(a) + 'xy$, $y(0)=' + y0 + '$.', s, ok: 'Correcte: $y=' + co(y0) + 'e^{' + co(h) + 'x^2}$.',
          why: ['', '$\\int ' + co(a) + 'x\\,dx=\\frac{' + a + 'x^2}{2}=' + co(h) + 'x^2$.', 'De $\\ln|y|=g(x)+C$ surt $y=e^{g(x)+C}=Ke^{g(x)}$: la constant <b>multiplica</b>, no suma. (Error clàssic.)', ''] };
      } }
    ],
    l11: [
      { n: 4, build(r, bad) {
        const a = r.pick([1, 2, 3]), b = a * r.pick([1, 2, 3]), y0 = r.int(0, 4), q = b / a, C = y0 - q, Cb = y0 + q;
        const ea = 'e^{' + co(a) + 'x}', ema = 'e^{' + co(-a) + 'x}';
        const s = [
          bad === 0 ? 'Factor integrant: $\\mu=e^{-\\int ' + a + '\\,dx}=' + ema + '$.' : 'Factor integrant: $\\mu=e^{\\int ' + a + '\\,dx}=' + ea + '$.',
          bad === 0 ? '$(' + ema + 'y)\'=' + b + ema + '$ ⇒ $' + ema + 'y=-' + fq(b, a) + ema + '+C$' : bad === 1 ? '$(' + ea + 'y)\'=' + b + ea + '$ ⇒ $' + ea + 'y=' + fq(b, a) + ea + '$' : '$(' + ea + 'y)\'=' + b + ea + '$ ⇒ $' + ea + 'y=' + fq(b, a) + ea + '+C$',
          bad === 0 ? '$y=-' + fq(b, a) + '+Ce^{' + co(a) + 'x}$' : bad === 1 ? '$y=' + fq(b, a) + '$' : '$y=' + fq(b, a) + '+Ce^{' + co(-a) + 'x}$',
          bad === 0 ? '$y(0)=' + y0 + '$ ⇒ $C=' + Cb + '$.' : bad === 1 ? 'La condició $y(0)=' + y0 + '$ ja no es pot imposar.' : bad === 3 ? '$y(0)=' + y0 + '$ ⇒ $C=' + (y0 + q) + '$.' : '$y(0)=' + y0 + '$ ⇒ $C=' + C + '$.'];
        if (bad === 1 && y0 === q) s[3] = 'La condició $y(0)=' + y0 + '$ es compleix sola.';
        return { q: 'Resol $y\'+' + co(a) + 'y=' + b + '$, $y(0)=' + y0 + '$.', s, ok: 'Correcte: $y=' + fq(b, a) + (C ? (C < 0 ? '-' : '+') + Math.abs(C) + 'e^{' + co(-a) + 'x}' : '') + '$.',
          why: ['Per a $y\'+p(x)y=q(x)$, $\\mu=e^{+\\int p}$ (amb signe <b>més</b>).', 'Falta la constant $+C$ en integrar: sense ella no es pot imposar la condició inicial.', '', '$C=y_0-' + fq(b, a) + '=' + C + '$: s\'ha sumat en lloc de restar.'] };
      } }
    ],
    l12: [
      { n: 4, build(r, bad) {
        let r1 = r.nz(-4, 4), r2 = r.nz(-4, 4); while (r2 === r1 || r2 === -r1) r2 = r.nz(-4, 4);
        const B = -(r1 + r2), Cc = r1 * r2, y0 = r.int(0, 3), v0 = r.int(-3, 3);
        const ode = odeT(B, Cc), ch = odeT(B, Cc, 'r');
        const R1 = bad === 0 || bad === 1 ? -r1 : r1, R2 = bad === 0 || bad === 1 ? -r2 : r2;
        const C1n = v0 - R2 * y0, C1d = R1 - R2, C2n = R1 * y0 - v0;
        const s = [
          bad === 0 ? 'Equació característica: $' + odeT(-B, Cc, 'r') + '=0$.' : 'Equació característica: $' + ch + '=0$.',
          'Arrels: $r=' + R1 + '$ i $r=' + R2 + '$.',
          bad === 2 ? '$y=C_1e^{' + co(R1) + 'x}+C_2x\\,e^{' + co(R2) + 'x}$' : '$y=C_1e^{' + co(R1) + 'x}+C_2e^{' + co(R2) + 'x}$',
          bad === 2 ? 'Amb $y(0)=' + y0 + '$: $C_1=' + y0 + '$, i amb $y\'(0)=' + v0 + '$: $C_2=' + (v0 - R1 * y0) + '$.' : 'Amb $y(0)=' + y0 + '$, $y\'(0)=' + v0 + '$: $C_1=' + fq(C1n, C1d) + '$, $C_2=' + fq(C2n, C1d) + '$.'];
        return { q: 'Resol $' + ode + '=0$, $y(0)=' + y0 + '$, $y\'(0)=' + v0 + '$.', s,
          ok: 'Correcte: arrels $' + r1 + '$ i $' + r2 + '$, $C_1=' + fq(v0 - r2 * y0, r1 - r2) + '$, $C_2=' + fq(r1 * y0 - v0, r1 - r2) + '$.',
          why: ['L\'equació característica es copia amb els <b>mateixos</b> signes: $y\'\'\\to r^2$, $y\'\\to r$, $y\\to1$.', 'Les arrels de $' + ch + '=0$ són $' + r1 + '$ i $' + r2 + '$ (comprova-ho substituint): s\'han canviat de signe.', 'La forma $x\\,e^{rx}$ només és per a una arrel <b>doble</b>. Aquí són diferents.', ''] };
      } }
    ]
  };
  function odeT(b, c, v) {
    v = v || 'y';
    const t2 = v === 'r' ? 'r^2' : 'y\'\'', t1 = v === 'r' ? 'r' : 'y\'', t0 = v === 'r' ? '' : 'y';
    let s = t2;
    if (b) s += (b < 0 ? '-' : '+') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + t1;
    if (c) s += (c < 0 ? '-' : '+') + (Math.abs(c) === 1 && t0 ? '' : Math.abs(c)) + t0;
    return s;
  }
  const ERR_TITLES = { l2: 'derivades i límits', l7: 'primitives', l9: 'integrals definides i TFC', l10: 'variables separables', l11: 'EDO lineal', l12: 'EDO de 2n ordre' };
  const ERR_NEEDS = { l2: ['cadena', 'lhop'], l7: ['parts', 'subst'], l9: ['tfc', 'arees', 'subst'], l10: ['separables'], l11: ['lineal1'], l12: ['homog'] };
  Object.keys(T_ERR).forEach(mid => add(mid, {
    id: 'troba_error', game: 'error', title: '🔎 Troba l\'error (' + ERR_TITLES[mid] + ')', level: 2,
    desc: 'Una resolució pas a pas amb un error (o cap). Troba el primer pas que falla: és el que has de fer amb el teu examen abans de lliurar-lo.',
    needs: ERR_NEEDS[mid],
    make(r) {
      const tp = r.pick(T_ERR[mid]);
      // passos que poden ser erronis (els que tenen explicació)
      const probe = tp.build(M.rng(1), -1);
      const cands = probe.why.map((w, i) => w ? i : -1).filter(i => i >= 0);
      const bad = r() < 0.2 ? -1 : r.pick(cands);
      const o = tp.build(M.rng(r.int(1, 1e9)), bad);
      // les dades (números) han de ser les mateixes que a `probe`: reconstruïm amb la mateixa llavor
      return mk(o, bad);
    }
  }));
  function mk(o, bad) {
    const steps = '<ol class="steps">' + o.s.map((x, i) => '<li><b>Pas ' + (i + 1) + '.</b> ' + x + '</li>').join('') + '</ol>';
    const ch = o.s.map((_, i) => 'Pas ' + (i + 1)).concat(['Cap: tot és correcte']);
    const sol = bad < 0 ? ['<b>Tot és correcte.</b> ' + o.ok, 'Revisar també vol dir saber dir «això està bé»: no canviïs un pas correcte per inseguretat.']
      : ['<b>El primer error és al pas ' + (bad + 1) + '.</b> ' + o.why[bad], 'Els passos següents arrosseguen l\'error. ' + o.ok];
    return P.mcFixed(o.q + ' Algú ho ha resolt així:' + steps + 'Quin és el <b>primer pas incorrecte</b>?', ch, bad < 0 ? ch.length - 1 : bad, sol);
  }

  /* ================================================================
     📜 TEOREMES — enunciat exacte i quan es poden aplicar
     ================================================================ */
  const TH = Calc.TEOREMES = [
    { id: 'bolzano', mod: 'l1', name: 'Teorema de Bolzano', hyp: ['$f$ contínua a $[a,b]$', '$f(a)$ i $f(b)$ tenen signes oposats'], concl: 'existeix $c\\in(a,b)$ amb $f(c)=0$',
      use: 'Demostrar que una equació té (com a mínim) una solució en un interval.',
      trap: 'No diu quantes arrels hi ha (pot haver-n\'hi més d\'una) ni on són. Sense continuïtat no val: $\\frac1x$ a $[-1,1]$ canvia de signe i no té cap zero.',
      wrong: ['$f$ derivable a $(a,b)$ i $f(a)\\cdot f(b)<0$ ⇒ existeix $c$ amb $f\'(c)=0$', '$f$ contínua a $[a,b]$ i $f(a)\\cdot f(b)<0$ ⇒ existeix un <b>únic</b> $c\\in(a,b)$ amb $f(c)=0$', '$f(a)\\cdot f(b)<0$ ⇒ existeix $c\\in(a,b)$ amb $f(c)=0$ (per a qualsevol $f$)'],
      apply: [
        ['$f(x)=x^3-x-1$ a $[1,2]$', -1, '$f$ és polinòmica (contínua), $f(1)=-1<0$ i $f(2)=5>0$.'],
        ['$f(x)=\\frac1x$ a $[-1,1]$', 0, 'No és contínua a $x=0\\in[-1,1]$ (i de fet no té cap zero).'],
        ['$f(x)=x^2+1$ a $[-1,1]$', 1, '$f(-1)=f(1)=2$: mateix signe.'],
        ['$f(x)=\\tan x$ a $\\left[\\frac\\pi4,\\frac{3\\pi}4\\right]$', 0, 'No és contínua a $\\frac\\pi2$, tot i que $\\tan\\frac\\pi4=1$ i $\\tan\\frac{3\\pi}4=-1$.'],
        ['$f(x)=e^x-2$ a $[0,1]$', -1, 'Contínua, $f(0)=-1<0$, $f(1)=e-2>0$.']],
      fails: ['$f$ no és contínua a tot l\'interval', '$f(a)$ i $f(b)$ no tenen signes oposats'] },
    { id: 'weierstrass', mod: 'l1', name: 'Teorema de Weierstrass', hyp: ['$f$ contínua', 'a un interval <b>tancat i fitat</b> $[a,b]$'], concl: '$f$ assoleix un màxim i un mínim absoluts a $[a,b]$',
      use: 'Garantir que els extrems absoluts existeixen abans de buscar-los (punts crítics + extrems de l\'interval).',
      trap: 'Si l\'interval és obert o la funció no és contínua pot no haver-hi màxim: $\\frac1x$ a $(0,1]$.',
      wrong: ['$f$ derivable a $(a,b)$ ⇒ $f$ té màxim i mínim absoluts a $(a,b)$', '$f$ contínua a qualsevol interval ⇒ $f$ té màxim i mínim absoluts', '$f$ contínua a $[a,b]$ ⇒ $f$ té un màxim absolut a $(a,b)$ on $f\'=0$'],
      apply: [
        ['$f(x)=x^2$ a $[-1,2]$', -1, 'Contínua en un interval tancat i fitat.'],
        ['$f(x)=\\frac1x$ a $(0,1]$', 0, 'L\'interval no és tancat: a prop de $0$ la funció creix sense fita.'],
        ['$f(x)=\\frac1{x-1}$ a $[0,2]$', 1, 'No és contínua a $x=1$.'],
        ['$f(x)=\\sin x$ a $[0,\\pi]$', -1, 'Contínua en un interval tancat i fitat.']],
      fails: ['l\'interval no és tancat i fitat', '$f$ no és contínua a l\'interval'] },
    { id: 'rolle', mod: 'l2', name: 'Teorema de Rolle', hyp: ['$f$ contínua a $[a,b]$', '$f$ derivable a $(a,b)$', '$f(a)=f(b)$'], concl: 'existeix $c\\in(a,b)$ amb $f\'(c)=0$',
      use: 'Fitar el nombre d\'arrels: si $f\'$ no s\'anul·la mai, $f$ té com a molt una arrel.',
      trap: 'Totes tres hipòtesis calen. $|x|$ a $[-1,1]$: $f(-1)=f(1)$ però $f\'$ mai no és 0 (no és derivable a 0).',
      wrong: ['$f$ contínua a $[a,b]$ i $f(a)=f(b)$ ⇒ existeix $c$ amb $f\'(c)=0$', '$f$ derivable a $(a,b)$ i $f(a)=f(b)$ ⇒ existeix $c$ amb $f(c)=0$', '$f$ contínua a $[a,b]$, derivable a $(a,b)$ ⇒ existeix $c$ amb $f\'(c)=0$'],
      apply: [
        ['$f(x)=x^2$ a $[-1,1]$', -1, 'Polinòmica, i $f(-1)=f(1)=1$.'],
        ['$f(x)=|x|$ a $[-1,1]$', 0, 'No és derivable a $x=0$.'],
        ['$f(x)=x$ a $[0,1]$', 1, '$f(0)=0\\neq1=f(1)$.'],
        ['$f(x)=\\sqrt[3]{x^2}$ a $[-1,1]$', 0, 'No és derivable a $x=0$ (tangent vertical).']],
      fails: ['$f$ no és derivable a tot $(a,b)$', '$f(a)\\neq f(b)$'] },
    { id: 'tvm', mod: 'l2', name: 'Teorema del valor mitjà (Lagrange)', hyp: ['$f$ contínua a $[a,b]$', '$f$ derivable a $(a,b)$'], concl: 'existeix $c\\in(a,b)$ amb $f\'(c)=\\dfrac{f(b)-f(a)}{b-a}$',
      use: 'Fitar diferències: $|f(b)-f(a)|\\le\\max|f\'|\\cdot|b-a|$, i provar desigualtats.',
      trap: 'El $c$ és <b>dins</b> l\'interval obert; normalment no se sap quin és.',
      wrong: ['$f$ contínua a $[a,b]$ ⇒ existeix $c$ amb $f(c)=\\frac{f(b)-f(a)}{b-a}$', '$f$ derivable a $(a,b)$ ⇒ existeix $c$ amb $f\'(c)=\\frac{f(b)+f(a)}{b-a}$', '$f$ contínua a $[a,b]$, derivable a $(a,b)$ ⇒ $f\'(c)=\\frac{f(b)-f(a)}{b-a}$ per a tot $c\\in(a,b)$'],
      apply: [
        ['$f(x)=x^3$ a $[0,2]$', -1, 'Polinòmica: contínua i derivable.'],
        ['$f(x)=|x-1|$ a $[0,3]$', 0, 'No és derivable a $x=1$.'],
        ['$f(x)=\\ln x$ a $[1,e]$', -1, 'Contínua i derivable per a $x>0$.']],
      fails: ['$f$ no és derivable a tot $(a,b)$', '$f$ no és contínua a $[a,b]$'] },
    { id: 'lhopital', mod: 'l4', name: 'Regla de L\'Hôpital', hyp: ['$\\lim f=\\lim g=0$ (o tots dos $\\pm\\infty$)', '$f,g$ derivables a prop del punt, $g\'\\neq0$', 'existeix $\\lim\\frac{f\'}{g\'}$'], concl: '$\\lim\\dfrac fg=\\lim\\dfrac{f\'}{g\'}$',
      use: 'Indeterminacions $\\frac00$ i $\\frac\\infty\\infty$ (i les altres, després de transformar-les).',
      trap: 'Només si és indeterminació. I es deriven numerador i denominador <b>per separat</b>, no el quocient.',
      wrong: ['$\\lim\\frac fg=\\lim\\left(\\frac fg\\right)\'$ si és $\\frac00$', '$\\lim\\frac fg=\\lim\\frac{f\'}{g\'}$ sempre que $f$ i $g$ siguin derivables', '$\\lim\\frac fg=\\frac{\\lim f\'}{\\lim g}$ si és $\\frac00$'],
      apply: [
        ['$\\displaystyle\\lim_{x\\to0}\\frac{\\sin x}{x}$', -1, 'És $\\frac00$: surt $\\lim\\frac{\\cos x}{1}=1$.'],
        ['$\\displaystyle\\lim_{x\\to0}\\frac{x+1}{x+2}$', 0, 'No és indeterminació: val $\\frac12$ directament (L\'Hôpital donaria 1, que és fals).'],
        ['$\\displaystyle\\lim_{x\\to\\infty}\\frac{\\ln x}{x}$', -1, 'És $\\frac\\infty\\infty$: $\\lim\\frac{1/x}{1}=0$.']],
      fails: ['no és una indeterminació $\\frac00$ ni $\\frac\\infty\\infty$', '$g$ no és derivable'] },
    { id: 'taylor', mod: 'l5', name: 'Fórmula de Taylor amb residu de Lagrange', hyp: ['$f$ derivable $n+1$ vegades entre $a$ i $x$'], concl: '$f(x)=P_n(x)+\\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}$ per a algun $\\xi$ entre $a$ i $x$',
      use: 'Fitar l\'error d\'una aproximació: $|R_n|\\le\\frac{\\max|f^{(n+1)}|}{(n+1)!}|x-a|^{n+1}$.',
      trap: 'El residu porta la derivada $n+1$ i el factorial $(n+1)!$; i $\\xi$ no és $a$ ni $x$, és un punt desconegut entre tots dos.',
      wrong: ['$f(x)=P_n(x)+\\frac{f^{(n)}(\\xi)}{n!}(x-a)^{n}$ amb $\\xi$ entre $a$ i $x$', '$f(x)=P_n(x)+\\frac{f^{(n+1)}(a)}{(n+1)!}(x-a)^{n+1}$', '$f(x)=P_n(x)+\\frac{f^{(n+1)}(\\xi)}{n!}(x-a)^{n+1}$ amb $\\xi$ entre $a$ i $x$'],
      apply: [], fails: [] },
    { id: 'tfc', mod: 'l9', name: 'Teorema fonamental del càlcul', hyp: ['$f$ contínua a $[a,b]$', '$F(x)=\\int_a^xf(t)\\,dt$'], concl: '$F$ és derivable i $F\'(x)=f(x)$',
      use: 'Derivar funcions definides amb integrals; amb límits variables: $\\frac{d}{dx}\\int_{u(x)}^{v(x)}f=f(v)v\'-f(u)u\'$ (Leibniz).',
      trap: 'Si el límit és $x^2$, cal la regla de la cadena: $f(x^2)\\cdot2x$.',
      wrong: ['$f$ derivable a $[a,b]$ ⇒ $F\'(x)=f\'(x)$', '$f$ contínua a $[a,b]$ ⇒ $F\'(x)=f(x)-f(a)$', '$f$ contínua a $[a,b]$ ⇒ $\\frac{d}{dx}\\int_a^{x^2}f(t)dt=f(x^2)$'],
      apply: [], fails: [] },
    { id: 'barrow', mod: 'l9', name: 'Regla de Barrow', hyp: ['$f$ contínua a $[a,b]$', '$G$ una primitiva de $f$ ($G\'=f$)'], concl: '$\\displaystyle\\int_a^bf(x)\\,dx=G(b)-G(a)$',
      use: 'Calcular qualsevol integral definida a partir d\'una primitiva.',
      trap: 'Si $f$ no és contínua a $[a,b]$ no val: $\\int_{-1}^1\\frac{dx}{x^2}$ «donaria» $-2$, impossible per a una funció positiva.',
      wrong: ['$G$ primitiva de $f$ ⇒ $\\int_a^bf=G(b)-G(a)$ per a qualsevol $f$', '$f$ contínua a $[a,b]$ ⇒ $\\int_a^bf=f(b)-f(a)$', '$f$ contínua a $[a,b]$, $G\'=f$ ⇒ $\\int_a^bf=G(a)-G(b)$'],
      apply: [
        ['$\\displaystyle\\int_{-1}^{1}\\frac{dx}{x^2}$', 0, '$\\frac1{x^2}$ no és contínua a $x=0\\in[-1,1]$ (és una integral impròpia i divergeix).'],
        ['$\\displaystyle\\int_{0}^{2}x\\,e^{x^2}dx$', -1, 'Integrand continu; $G=\\frac12e^{x^2}$.'],
        ['$\\displaystyle\\int_{0}^{\\pi}\\tan x\\,dx$', 0, '$\\tan x$ no és contínua a $\\frac\\pi2$.'],
        ['$\\displaystyle\\int_{1}^{e}\\frac{dx}{x}$', -1, 'Contínua a $[1,e]$: $\\ln e-\\ln1=1$.']],
      fails: ['$f$ no és contínua a $[a,b]$', 'no té primitiva elemental'] },
    { id: 'vmi', mod: 'l9', name: 'Teorema del valor mitjà integral', hyp: ['$f$ contínua a $[a,b]$'], concl: 'existeix $c\\in[a,b]$ amb $\\displaystyle\\int_a^bf=f(c)\\,(b-a)$',
      use: 'El valor mitjà d\'una funció: $\\frac1{b-a}\\int_a^bf$.',
      trap: 'No diu que $c$ sigui el punt mitjà de l\'interval.',
      wrong: ['$f$ contínua a $[a,b]$ ⇒ $\\int_a^bf=f\\left(\\frac{a+b}2\\right)(b-a)$', '$f$ derivable ⇒ existeix $c$ amb $\\int_a^bf=f\'(c)(b-a)$', '$f$ contínua a $[a,b]$ ⇒ $\\int_a^bf=\\frac{f(a)+f(b)}2(b-a)$'],
      apply: [], fails: [] },
    { id: 'eu1', mod: 'l10', name: 'Existència i unicitat (EDO de 1r ordre)', hyp: ['$y\'=f(x,y)$, $y(x_0)=y_0$', '$f$ i $\\dfrac{\\partial f}{\\partial y}$ contínues en un entorn de $(x_0,y_0)$'], concl: 'hi ha una <b>única</b> solució en un interval al voltant de $x_0$',
      use: 'Justificar «té solució única» abans de resoldre (ho demanen a l\'examen).',
      trap: 'Si $\\frac{\\partial f}{\\partial y}$ no és contínua pot haver-hi més d\'una solució: $y\'=3y^{2/3}$, $y(0)=0$ té $y=0$ i $y=x^3$.',
      wrong: ['$f$ contínua ⇒ hi ha una única solució', '$f$ i $\\frac{\\partial f}{\\partial x}$ contínues ⇒ hi ha una única solució', '$f$ i $\\frac{\\partial f}{\\partial y}$ contínues ⇒ la solució existeix per a tot $x\\in\\mathbb R$'],
      apply: [
        ['$y\'=xy+1$, $y(0)=1$', -1, '$f=xy+1$ i $\\frac{\\partial f}{\\partial y}=x$ són contínues a tot el pla.'],
        ['$y\'=3y^{2/3}$, $y(0)=0$', 0, '$\\frac{\\partial f}{\\partial y}=2y^{-1/3}$ no és contínua a $y=0$ (i de fet hi ha dues solucions).'],
        ['$y\'=\\sqrt{y}$, $y(0)=0$', 0, '$\\frac{\\partial f}{\\partial y}=\\frac1{2\\sqrt y}$ no és contínua a $y=0$.'],
        ['$y\'=\\sin(x+y)$, $y(0)=2$', -1, '$f$ i $\\frac{\\partial f}{\\partial y}=\\cos(x+y)$ són contínues.']],
      fails: ['$\\frac{\\partial f}{\\partial y}$ no és contínua a $(x_0,y_0)$', '$f$ no és contínua a $(x_0,y_0)$'] },
    { id: 'eu2', mod: 'l12', name: 'Existència i unicitat (EDO lineal de 2n ordre)', hyp: ['$y\'\'+p(x)y\'+q(x)y=g(x)$ amb $p,q,g$ contínues en un interval $I$', '$x_0\\in I$ i <b>dues</b> condicions $y(x_0)=y_0$, $y\'(x_0)=y_1$'], concl: 'hi ha una única solució, definida a tot $I$',
      use: 'Saber quantes constants queden: amb dues condicions, cap; amb una, una família d\'un paràmetre.',
      trap: 'Amb una sola condició <b>no</b> hi ha unicitat: queda una constant lliure.',
      wrong: ['amb una condició $y(x_0)=y_0$ ja hi ha solució única', 'cal que $p,q,g$ siguin polinomis', 'hi ha una única solució però només en un entorn petit de $x_0$, encara que $p,q,g$ siguin contínues a tot $\\mathbb R$'],
      apply: [
        ['$y\'\'+4y=\\cos x$, $y(0)=1$, $y\'(0)=0$', -1, 'Coeficients continus a tot $\\mathbb R$ i dues condicions.'],
        ['$y\'\'-y=0$, $y(0)=1$ (cap més condició)', 0, 'Només hi ha una condició: les solucions formen una família d\'un paràmetre.'],
        ['$y\'\'+\\frac1xy=0$, $y(0)=1$, $y\'(0)=0$', 1, '$\\frac1x$ no és contínua a $x_0=0$.']],
      fails: ['no hi ha dues condicions inicials', 'algun coeficient no és continu a $x_0$'] },
    { id: 'estructura', mod: 'l12', name: 'Estructura de la solució (lineal no homogènia)', hyp: ['$y_h$: solució general de l\'homogènia (2 constants)', '$y_p$: <b>una</b> solució particular'], concl: 'la solució general és $y=y_h+y_p$; i si $g=g_1+g_2$, $y_p=y_{p1}+y_{p2}$ (superposició)',
      use: 'Resoldre qualsevol no homogènia: primer $y_h$, després $y_p$ i, al final, les condicions inicials sobre $y_h+y_p$.',
      trap: 'Les condicions inicials s\'imposen a $y_h+y_p$, mai només a $y_h$.',
      wrong: ['$y=y_p$ (la particular ja és la solució general)', '$y=y_h\\cdot y_p$', 'les condicions inicials s\'imposen a $y_h$ i després se li suma $y_p$'],
      apply: [], fails: [] }
  ];
  Calc.TEO_BY_MOD = {};
  TH.forEach(t => (Calc.TEO_BY_MOD[t.mod] = Calc.TEO_BY_MOD[t.mod] || []).push(t));
  const stmt = t => '<b>Hipòtesis:</b> ' + t.hyp.join('; ') + '. <b>Conclusió:</b> ' + t.concl + '.';
  const TEO_NEEDS = { l1: ['bolzano', 'absext'], l2: ['rolle'], l4: ['lhop'], l5: ['lagrange'], l9: ['tfc'], l10: ['separables'], l12: ['homog', 'nohomog'] };
  Object.keys(Calc.TEO_BY_MOD).forEach(mid => add(mid, {
    id: 'teoremes', game: 'teo', title: '📜 Teoremes: enuncia\'ls i aplica\'ls', level: 2,
    desc: 'L\'enunciat exacte (totes les hipòtesis) i saber si es pot aplicar en un cas concret. A l\'examen et poden demanar «enuncieu el teorema…».',
    needs: TEO_NEEDS[mid],
    make(r) {
      const t = r.pick(Calc.TEO_BY_MOD[mid]), canApply = t.apply.length && r() < 0.55;
      if (canApply) {
        const [inst, fi, why] = r.pick(t.apply);
        const ch = ['Sí, es compleixen totes les hipòtesis', 'No: ' + t.fails[0], 'No: ' + t.fails[1]];
        return P.mcFixed('Es pot aplicar el <b>' + t.name + '</b> a ' + inst + '?', ch, fi + 1, [why, stmt(t), '⚠️ ' + t.trap]);
      }
      const good = t.hyp.join(' i ') + ' ⇒ ' + t.concl;
      return P.mc(r, 'Quin és l\'enunciat correcte del <b>' + t.name + '</b>?', good, t.wrong.slice(), [stmt(t), 'Per a què serveix: ' + t.use, '⚠️ ' + t.trap]);
    }
  }));
})();
