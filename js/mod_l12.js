/* Llista 12 — EDOs lineals de 2n ordre a coeficients constants (homogènies i no homogènies) */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Homogènia: $y''+by'+cy=0$</h3>
<p>Prova $y=e^{rx}$ ⇒ <b>equació característica</b> $r^2+br+c=0$. Segons l'arrel:</p>
<table class="tbl">
<tr><th>Arrels</th><th>Solució general</th></tr>
<tr><td>$r_1\\ne r_2$ reals ($\\Delta>0$)</td><td>$y=C_1e^{r_1x}+C_2e^{r_2x}$</td></tr>
<tr><td>$r_1=r_2=r$ ($\\Delta=0$)</td><td>$y=(C_1+C_2x)\\,e^{rx}$</td></tr>
<tr><td>$r=\\alpha\\pm\\beta i$ ($\\Delta<0$)</td><td>$y=e^{\\alpha x}\\left(C_1\\cos\\beta x+C_2\\sin\\beta x\\right)$</td></tr>
</table>
<div class="box ex"><b>Exemple.</b> $y''-10y'+34y=0$: $r=\\frac{10\\pm\\sqrt{100-136}}{2}=5\\pm3i$ ⇒ $y=e^{5x}(C_1\\cos3x+C_2\\sin3x)$.</div>
<p><b>Condicions inicials</b> $y(x_0)=y_0$, $y'(x_0)=v_0$: dues equacions per a $C_1,C_2$ (cal derivar la solució general!).</p>
<p><b>Construir l'EDO a partir de solucions:</b> si $e^{r_1x},e^{r_2x}$ són solucions, el polinomi característic és $(r-r_1)(r-r_2)=r^2-(r_1+r_2)r+r_1r_2$ ⇒ $y''-(r_1+r_2)y'+r_1r_2y=0$. Si $e^{rx},xe^{rx}$: $(r-\\rho)^2$. Si $e^{\\alpha x}\\cos\\beta x$: $r^2-2\\alpha r+\\alpha^2+\\beta^2$.</p>

<h3>No homogènia: $y''+by'+cy=g(x)$</h3>
<div class="box formula">$y=y_h+y_p$ &nbsp; ($y_h$: solució general de l'homogènia; $y_p$: una solució particular qualsevol)</div>
<p><b>Mètode dels coeficients indeterminats</b> — prova $y_p$ segons $g$:</p>
<table class="tbl">
<tr><th>$g(x)$</th><th>Prova de $y_p$</th></tr>
<tr><td>polinomi de grau $n$</td><td>polinomi general de grau $n$ ($Ax^2+Bx+C$…)</td></tr>
<tr><td>$Ke^{kx}$</td><td>$Ae^{kx}$</td></tr>
<tr><td>$K\\cos kx$ o $K\\sin kx$ o combinació</td><td>$A\\cos kx+B\\sin kx$ (<b>sempre els dos</b>)</td></tr>
<tr><td>producte (ex. $xe^{kx}$, $e^{kx}\\sin x$)</td><td>producte de les formes</td></tr>
</table>
<div class="box warn"><b>Ressonància:</b> si la prova coincideix amb una solució de l'homogènia (p.ex. $g=e^{rx}$ amb $r$ arrel de la característica), <b>multiplica per $x$</b> (o $x^2$ si $r$ és doble). Exemple: $y''-3y'+2y=e^{x}$ ($r=1$ és arrel) ⇒ $y_p=Axe^{x}$.</div>
<p>Pas a pas: (1) $y_h$; (2) tria la forma de $y_p$ i <b>deriva-la dues vegades</b>; (3) substitueix a l'EDO i <b>iguala coeficients</b>; (4) $y=y_h+y_p$ i aplica condicions inicials (sobre la solució <b>completa</b>).</p>
`;

  const odeTex = (b, c) => 'y\'\'' + (b === 0 ? '' : (b < 0 ? ' - ' : ' + ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y\'') + (c === 0 ? '' : (c < 0 ? ' - ' : ' + ') + (Math.abs(c) === 1 ? '' : Math.abs(c)) + 'y');
  /** Comprova numèricament que `ans` compleix y''+by'+cy=g(x) (i les condicions inicials en x=0 si n'hi ha). */
  const fnOde = (meta, q, ans, sol, o) => {
    const p = P.fn(q, ans, sol, o);
    p.check = () => {
      const f = M.compile(ans), f1 = M.compile(M.diff(ans)), f2 = M.compile(M.nthDiff(ans, 2));
      const xs = [0.2, 0.5, 0.9, 1.2];
      const okEq = xs.every(x => Math.abs(f2(x) + meta.b * f1(x) + meta.c * f(x) - meta.g(x)) < 1e-6 * Math.max(1, Math.abs(meta.g(x)), Math.abs(f2(x))));
      const okIc = meta.y0 === undefined || (Math.abs(f(0) - meta.y0) < 1e-9 && Math.abs(f1(0) - meta.v0) < 1e-9);
      return okEq && okIc;
    };
    return p;
  };
  const gens = [];

  gens.push({
    id: 'roots', title: 'Equació característica', level: 1,
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const [r1, r2] = H.sortNum(H.distinct(r, 2, -5, 5));
        const b = -(r1 + r2), c = r1 * r2;
        return P.multi('Troba les arrels de l\'equació característica de $' + odeTex(b, c) + '=0$ (primer la menor).', [{ label: '$r_1=$', ans: r1 }, { label: '$r_2=$', ans: r2 }],
          ['$r^2' + (b ? H.sg(b) + 'r' : '') + (c ? H.sg(c) : '') + '=0$ ⇒ $r=\\dfrac{' + (-b) + '\\pm\\sqrt{' + (b * b - 4 * c) + '}}{2}$ ⇒ $' + r1 + '$ i $' + r2 + '$.']);
      }
      if (t === 1) {
        const rho = r.nz(-5, 5);
        return P.num('L\'equació $' + odeTex(-2 * rho, rho * rho) + '=0$ té una arrel doble. Quin és el valor de l\'arrel?', rho,
          ['$r^2' + H.sg(-2 * rho) + 'r' + H.sg(rho * rho) + '=(r' + H.sg(-rho) + ')^2$ ⇒ $r=' + rho + '$ (doble). Solució: $(C_1+C_2x)e^{' + rho + 'x}$.']);
      }
      const al = r.int(-3, 3), be = r.int(1, 4);
      return P.multi('Resol l\'equació característica de $' + odeTex(-2 * al, al * al + be * be) + '=0$ i escriu les arrels complexes $\\alpha\\pm\\beta i$ ($\\beta>0$).', [{ label: '$\\alpha=$', ans: al }, { label: '$\\beta=$', ans: be }],
        ['$\\Delta=' + (4 * al * al - 4 * (al * al + be * be)) + '<0$ ⇒ $r=\\dfrac{' + 2 * al + '\\pm\\sqrt{' + (-4 * be * be) + '}}{2}=' + al + '\\pm' + be + 'i$.', 'Solució general: $y=e^{' + al + 'x}(C_1\\cos' + be + 'x+C_2\\sin' + be + 'x)$.']);
    }
  });

  gens.push({
    id: 'general_mc', title: 'Solució general (tria la correcta)', level: 1,
    make(r) {
      const t = r.int(0, 2);
      let b, c, ok, wr, st;
      if (t === 0) {
        const [r1, r2] = H.sortNum(H.distinct(r, 2, -4, 4, true)); b = -(r1 + r2); c = r1 * r2;
        ok = '$y=C_1e^{' + r1 + 'x}+C_2e^{' + r2 + 'x}$';
        wr = ['$y=C_1e^{' + -r1 + 'x}+C_2e^{' + -r2 + 'x}$', '$y=(C_1+C_2x)e^{' + r1 + 'x}$', '$y=e^{' + r1 + 'x}(C_1\\cos' + Math.abs(r2) + 'x+C_2\\sin' + Math.abs(r2) + 'x)$'];
        st = ['Arrels $' + r1 + '$ i $' + r2 + '$ (reals diferents) ⇒ ' + ok + '.'];
      } else if (t === 1) {
        const rho = r.nz(-4, 4); b = -2 * rho; c = rho * rho;
        ok = '$y=(C_1+C_2x)e^{' + rho + 'x}$';
        wr = ['$y=C_1e^{' + rho + 'x}+C_2e^{' + rho + 'x}$', '$y=C_1e^{' + rho + 'x}+C_2e^{' + -rho + 'x}$', '$y=e^{' + rho + 'x}(C_1\\cos x+C_2\\sin x)$'];
        st = ['Arrel doble $' + rho + '$ ⇒ ' + ok + '.', '(Compte: $C_1e^{' + rho + 'x}+C_2e^{' + rho + 'x}$ només és una solució, no dues de independents.)'];
      } else {
        const al = r.int(-3, 3), be = r.int(1, 4); b = -2 * al; c = al * al + be * be;
        ok = '$y=e^{' + al + 'x}(C_1\\cos' + be + 'x+C_2\\sin' + be + 'x)$';
        wr = ['$y=e^{' + be + 'x}(C_1\\cos' + al + 'x+C_2\\sin' + al + 'x)$', '$y=C_1e^{' + al + 'x}+C_2e^{' + be + 'x}$', '$y=e^{' + al + 'x}(C_1+C_2x)$'];
        if (al === 0) wr[0] = '$y=C_1\\cos' + (be + 1) + 'x+C_2\\sin' + (be + 1) + 'x$';
        st = ['$\\Delta<0$: arrels $' + al + '\\pm' + be + 'i$ ⇒ ' + ok + '.'];
      }
      return P.mc(r, 'Quina és la solució general de $' + odeTex(b, c) + '=0$?', ok, wr, st);
    }
  });

  gens.push({
    id: 'ivp', title: 'Problema de valors inicials (homogènia)', level: 2,
    make(r) {
      const t = r.int(0, 2), y0 = r.int(-3, 4), v0 = r.int(-4, 5);
      if (t === 0) {
        const [r1, r2] = H.sortNum(H.distinct(r, 2, -3, 3));
        const b = -(r1 + r2), c = r1 * r2;
        const C1 = (v0 - r2 * y0) / (r1 - r2), C2 = y0 - C1;
        const ans = '(' + C1 + ')*e^(' + r1 + '*x)+(' + C2 + ')*e^(' + r2 + '*x)';
        return fnOde({ b, c, g: () => 0, y0, v0 }, 'Resol $' + odeTex(b, c) + '=0$ amb $y(0)=' + y0 + '$, $y\'(0)=' + v0 + '$.', ans,
          ['Arrels $' + r1 + '$, $' + r2 + '$: $y=C_1e^{' + r1 + 'x}+C_2e^{' + r2 + 'x}$, $y\'=' + r1 + 'C_1e^{' + r1 + 'x}+' + r2 + 'C_2e^{' + r2 + 'x}$.', 'Sistema: $C_1+C_2=' + y0 + '$, $' + r1 + 'C_1+' + r2 + 'C_2=' + v0 + '$ ⇒ $C_1=' + T(C1) + '$, $C_2=' + T(C2) + '$.'], { range: [0.1, 1.3] });
      }
      if (t === 1) {
        const rho = r.nz(-3, 3), b = -2 * rho, c = rho * rho;
        const C1 = y0, C2 = v0 - rho * y0;
        return fnOde({ b, c, g: () => 0, y0, v0 }, 'Resol $' + odeTex(b, c) + '=0$ amb $y(0)=' + y0 + '$, $y\'(0)=' + v0 + '$.', '(' + C1 + '+(' + C2 + ')*x)*e^(' + rho + '*x)',
          ['Arrel doble $' + rho + '$: $y=(C_1+C_2x)e^{' + rho + 'x}$, $y\'=(C_2+' + rho + 'C_1+' + rho + 'C_2x)e^{' + rho + 'x}$.', '$y(0)=C_1=' + C1 + '$; $y\'(0)=C_2+' + rho + 'C_1=' + v0 + '$ ⇒ $C_2=' + C2 + '$.'], { range: [0.1, 1.5] });
      }
      const al = r.int(-1, 2), be = r.int(1, 3), b = -2 * al, c = al * al + be * be;
      const A = y0, B = (v0 - al * y0) / be;
      return fnOde({ b, c, g: () => 0, y0, v0 }, 'Resol $' + odeTex(b, c) + '=0$ amb $y(0)=' + y0 + '$, $y\'(0)=' + v0 + '$.', 'e^(' + al + '*x)*((' + A + ')*cos(' + be + '*x)+(' + B + ')*sin(' + be + '*x))',
        ['Arrels $' + al + '\\pm' + be + 'i$: $y=e^{' + al + 'x}(C_1\\cos' + be + 'x+C_2\\sin' + be + 'x)$.', '$y(0)=C_1=' + y0 + '$. $y\'(0)=' + al + 'C_1+' + be + 'C_2=' + v0 + '$ ⇒ $C_2=' + T(B) + '$.'], { range: [0.1, 1.5] });
    }
  });

  gens.push({
    id: 'from_solutions', title: 'Construir l\'EDO a partir de solucions', level: 2,
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const [r1, r2] = H.distinct(r, 2, -4, 4);
        return P.multi('Escriu una EDO lineal homogènia d\'ordre 2 a coeficients constants $y\'\'+by\'+cy=0$ de la qual $e^{' + r1 + 'x}$ i $e^{' + r2 + 'x}$ siguin solucions. Troba $b$ i $c$.', [{ label: '$b=$', ans: -(r1 + r2) }, { label: '$c=$', ans: r1 * r2 }],
          ['Arrels $' + r1 + '$ i $' + r2 + '$ ⇒ $(r-' + T(r1) + ')(r-' + T(r2) + ')=r^2-(' + (r1 + r2) + ')r+' + r1 * r2 + '$.', 'EDO: $' + odeTex(-(r1 + r2), r1 * r2) + '=0$.']);
      }
      if (t === 1) {
        const rho = r.nz(-4, 4);
        return P.multi('Escriu l\'EDO $y\'\'+by\'+cy=0$ de la qual $e^{' + rho + 'x}$ i $xe^{' + rho + 'x}$ siguin solucions. Troba $b$ i $c$.', [{ label: '$b=$', ans: -2 * rho }, { label: '$c=$', ans: rho * rho }],
          ['Arrel doble $' + rho + '$: $(r-' + T(rho) + ')^2=r^2-' + 2 * rho + 'r+' + rho * rho + '$.', 'EDO: $' + odeTex(-2 * rho, rho * rho) + '=0$.']);
      }
      const al = r.int(-2, 3), be = r.int(1, 4);
      return P.multi('Escriu l\'EDO $y\'\'+by\'+cy=0$ de la qual $e^{' + al + 'x}\\cos(' + be + 'x)$ i $e^{' + al + 'x}\\sin(' + be + 'x)$ siguin solucions. Troba $b$ i $c$.', [{ label: '$b=$', ans: -2 * al }, { label: '$c=$', ans: al * al + be * be }],
        ['Arrels $' + al + '\\pm' + be + 'i$: polinomi $r^2-2\\cdot' + T(al) + 'r+(' + al + '^2+' + be + '^2)$.', 'EDO: $' + odeTex(-2 * al, al * al + be * be) + '=0$.']);
    }
  });

  /* Solució particular (no homogènia) */
  gens.push({
    id: 'particular', title: 'Solució particular (coeficients indeterminats)', level: 3,
    make(r) {
      const t = r.int(0, 3);
      let b = r.int(-4, 4), c = r.nz(-4, 4);
      if (t === 0) { // polinomi grau 2
        const al = r.nz(-2, 2), be = r.int(-3, 3), ga = r.int(-3, 3);
        const g = [2 * al * 0 + 2 * al + b * be + c * ga, 2 * b * al + c * be, c * al];
        return fnOde({ b, c, g: x => M.polyEval(g, x) }, 'Troba una solució particular de $' + odeTex(b, c) + '=' + M.polyTex(g) + '$.', M.polyStr([ga, be, al]), [
          'Prova $y_p=Ax^2+Bx+C$ ⇒ $y_p\'=2Ax+B$, $y_p\'\'=2A$.', 'Substitueix: $2A+b(2Ax+B)+c(Ax^2+Bx+C)$ i iguala coeficients: $x^2$: $' + c + 'A=' + g[2] + '$; $x$: $' + 2 * b + 'A+' + c + 'B=' + g[1] + '$; terme indep.: $2A+' + b + 'B+' + c + 'C=' + g[0] + '$.', 'Resultat: $A=' + al + '$, $B=' + be + '$, $C=' + ga + '$ ⇒ $y_p=' + M.polyTex([ga, be, al]) + '$.'], { ansTex: M.polyTex([ga, be, al]) });
      }
      if (t === 1) { // exponencial no resonant
        const k = r.int(1, 3) * r.sign(), A = r.nz(-3, 3);
        if (k * k + b * k + c === 0) return null;
        const K = A * (k * k + b * k + c);
        return fnOde({ b, c, g: x => K * Math.exp(k * x) }, 'Troba una solució particular de $' + odeTex(b, c) + '=' + (K === 1 ? '' : (K === -1 ? '-' : K)) + 'e^{' + (k === 1 ? '' : k) + 'x}$.', A + '*e^(' + k + '*x)', [
          'Prova $y_p=Ae^{' + k + 'x}$ ⇒ $y_p\'=' + k + 'Ae^{' + k + 'x}$, $y_p\'\'=' + k * k + 'Ae^{' + k + 'x}$.', 'Substitueix: $A(' + k * k + '+' + T(b * k) + '+' + c + ')e^{' + k + 'x}=' + K + 'e^{' + k + 'x}$ ⇒ $A(' + (k * k + b * k + c) + ')=' + K + '$ ⇒ $A=' + A + '$.', '$y_p=' + A + 'e^{' + k + 'x}$.'], { ansTex: A + 'e^{' + k + 'x}' });
      }
      if (t === 2) { // trigonomètrica
        const k = r.int(1, 3), A = r.int(-2, 2), B = r.int(-2, 2);
        if (A === 0 && B === 0) return null;
        const d = c - k * k;
        if (d * d + b * b * k * k === 0) return null;
        const gc = d * A + b * k * B, gs = d * B - b * k * A;
        const gtex = (gc ? (gc === 1 ? '' : gc === -1 ? '-' : gc) + '\\cos ' + k + 'x' : '') + (gs ? (gc ? (gs < 0 ? ' - ' : ' + ') : (gs < 0 ? '-' : '')) + (Math.abs(gs) === 1 ? '' : Math.abs(gs)) + '\\sin ' + k + 'x' : '');
        return fnOde({ b, c, g: x => gc * Math.cos(k * x) + gs * Math.sin(k * x) }, 'Troba una solució particular de $' + odeTex(b, c) + '=' + gtex + '$.', '(' + A + ')*cos(' + k + '*x)+(' + B + ')*sin(' + k + '*x)', [
          'Prova $y_p=A\\cos' + k + 'x+B\\sin' + k + 'x$ (sempre els dos). $y_p\'=-' + k + 'A\\sin+' + k + 'B\\cos$, $y_p\'\'=-' + k * k + 'A\\cos-' + k * k + 'B\\sin$.', 'Substituint i igualant: $\\cos$: $' + d + 'A+' + b * k + 'B=' + gc + '$; $\\sin$: $' + d + 'B-' + b * k + 'A=' + gs + '$.', 'Resultat: $A=' + A + '$, $B=' + B + '$.'], { ansTex: M.numTex(A) + '\\cos ' + k + 'x' + H.sg(B) + '\\sin ' + k + 'x' });
      }
      // ressonància simple: arrel r1
      const [r1, r2] = H.distinct(r, 2, -3, 3);
      const Kc = r.nz(-3, 3) * (r1 - r2);
      b = -(r1 + r2); c = r1 * r2;
      const A = Kc / (r1 - r2);
      return fnOde({ b, c, g: x => Kc * Math.exp(r1 * x) }, 'Troba una solució particular de $' + odeTex(b, c) + '=' + (Kc === 1 ? '' : (Kc === -1 ? '-' : Kc)) + 'e^{' + (r1 === 1 ? '' : r1) + 'x}$ (compte: ressonància).', A + '*x*e^(' + r1 + '*x)', [
        'L\'equació característica té arrels $' + r1 + '$ i $' + r2 + '$: $e^{' + r1 + 'x}$ és solució de l\'homogènia ⇒ <b>ressonància</b>. Prova $y_p=Axe^{' + r1 + 'x}$.', '$y_p\'=A(1+' + r1 + 'x)e^{' + r1 + 'x}$, $y_p\'\'=A(' + 2 * r1 + '+' + r1 * r1 + 'x)e^{' + r1 + 'x}$.', 'Substituint, els termes en $x$ s\'anul·len i queda $A(2\\cdot' + r1 + '+b)=' + Kc + '$, és a dir $A(' + (r1 - r2) + ')=' + Kc + '$ ⇒ $A=' + A + '$.'], { ansTex: A + 'xe^{' + r1 + 'x}', range: [0.1, 1.5] });
    }
  });

  gens.push({
    id: 'guess', title: 'Quina forma té y_p?', level: 2,
    make(r) {
      const [r1, r2] = H.distinct(r, 2, -3, 3, true);
      const b = -(r1 + r2), c = r1 * r2;
      const t = r.int(0, 3);
      let g, ok, wr;
      if (t === 0) { g = 'x^2+1'; ok = '$y_p=Ax^2+Bx+C$'; wr = ['$y_p=Ax^2+B$', '$y_p=Ax^2$', '$y_p=Ae^{x}$']; }
      else if (t === 1) { g = 'e^{' + r1 + 'x}'; ok = '$y_p=Axe^{' + r1 + 'x}$'; wr = ['$y_p=Ae^{' + r1 + 'x}$', '$y_p=Ax^2e^{' + r1 + 'x}$', '$y_p=(Ax+B)e^{' + r1 + 'x}$']; }
      else if (t === 2) { const k = r.int(1, 3); g = '\\sin ' + k + 'x'; ok = '$y_p=A\\cos ' + k + 'x+B\\sin ' + k + 'x$'; wr = ['$y_p=A\\sin ' + k + 'x$', '$y_p=Ae^{' + k + 'x}$', '$y_p=Ax\\sin ' + k + 'x$']; if (c === k * k) return null; }
      else { const k = r.pick([1, 2, 3].filter(z => z !== r1 && z !== r2)); g = 'e^{' + k + 'x}'; ok = '$y_p=Ae^{' + k + 'x}$'; wr = ['$y_p=Axe^{' + k + 'x}$', '$y_p=Ae^{' + r1 + 'x}$', '$y_p=Ax^2e^{' + k + 'x}$']; }
      return P.mc(r, 'Per a $' + odeTex(b, c) + '=' + g + '$ (arrels de la característica: $' + r1 + '$ i $' + r2 + '$), quina és la forma correcta de la solució particular a provar?', ok, wr,
        ['Mira $g(x)=' + g + '$ i comprova si coincideix amb una solució de l\'homogènia (ressonància ⇒ multiplicar per $x$).', 'Forma correcta: ' + ok + '.']);
    }
  });

  Calc.add({
    id: 'l12', num: '12', llista: 'Llista 12', title: 'EDOs lineals de 2n ordre',
    short: 'Equació característica (3 casos), valors inicials, construir EDOs i coeficients indeterminats.',
    desc: 'Homogènies i no homogènies a coeficients constants.',
    theory, gens,
    bank: [
      { q: 'Si l\'equació característica té arrels $-1\\pm4i$, la solució general és…', c: ['$e^{-x}(C_1\\cos4x+C_2\\sin4x)$', '$e^{4x}(C_1\\cos x+C_2\\sin x)$', '$C_1e^{-x}+C_2e^{4x}$', '$(C_1+C_2x)e^{-x}$'], a: 0, e: '$e^{\\alpha x}(\\dots\\beta x)$.' },
      { q: 'Si $\\Delta=0$ amb arrel doble $r$, les dues solucions independents són…', c: ['$e^{rx}$ i $e^{-rx}$', '$e^{rx}$ i $xe^{rx}$', '$\\cos rx$ i $\\sin rx$', '$e^{rx}$ i $e^{rx}$'], a: 1, e: 'Cal multiplicar per $x$.' },
      { q: 'La solució general de $y\'\'+by\'+cy=g(x)$ és…', c: ['$y_h$', '$y_p$', '$y_h+y_p$', '$y_h\\cdot y_p$'], a: 2, e: 'Homogènia + particular.' },
      { q: 'Per a $g(x)=\\cos2x$ la prova de $y_p$ és…', c: ['$A\\cos2x$', '$A\\cos2x+B\\sin2x$', '$Ae^{2x}$', '$A\\sin2x$'], a: 1, e: 'Les derivades barregen sinus i cosinus.' },
      { q: 'A $y\'\'-y=e^{x}$, la forma de $y_p$ és…', c: ['$Ae^x$', '$Axe^x$', '$Ax^2e^x$', '$A+Bx$'], a: 1, e: '$r=1$ és arrel: ressonància.' },
      { q: 'Les condicions inicials $y(0),y\'(0)$ s\'apliquen a…', c: ['$y_h$', '$y_p$', 'la solució completa $y_h+y_p$', 'l\'EDO'], a: 2, e: 'Errada típica: aplicar-les només a $y_h$.' },
      { q: 'L\'EDO amb solucions $e^{2x}$ i $e^{3x}$ és…', c: ['$y\'\'-5y\'+6y=0$', '$y\'\'+5y\'+6y=0$', '$y\'\'-6y\'+5y=0$', '$y\'\'+y\'-6y=0$'], a: 0, e: '$(r-2)(r-3)=r^2-5r+6$.' }
    ]
  });
})();
