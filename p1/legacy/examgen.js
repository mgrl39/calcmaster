/* ============================================================
   examgen.js — Variants autogenerades de l'examen de 2025
   (Primer Parcial, 3 de novembre de 2025): mateix format i mateixos
   patrons, però amb números nous cada vegada.
   Sense la pregunta d'interpolació (no es fa a classe).
   ============================================================ */

const ExamGen = (function () {

  function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function fmtSigned(n) { return n >= 0 ? "+ " + n : "- " + Math.abs(n); }
  function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
  function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
  function frac(n, d) { // n/d simplificat, en LaTeX
    const g = gcd(n, d) || 1;
    n /= g; d /= g;
    if (d < 0) { n = -n; d = -d; }
    if (d === 1) return String(n);
    return `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${d}}`;
  }
  function sci(x) { // notació científica en LaTeX: 2.00·10^{-4}
    const [m, e] = x.toExponential(2).split("e");
    return `${m}\\cdot10^{${+e}}`;
  }
  function numChecker(value, tol) {
    return s => MathParser.checkNumber(s, value, { tol });
  }

  /* ---------------- TEST (4 preguntes, 5 opcions) ---------------- */
  // La correcta es posa en una posició aleatòria; `correct` és el seu índex
  function mc(q, correctTex, wrongTex, exp) {
    const options = wrongTex.slice();
    const pos = ri(0, options.length);
    options.splice(pos, 0, correctTex);
    return { q, options, correct: pos, exp };
  }

  // Continuïtat amb paràmetre (com 2025, test 1)
  function tCont() {
    const a = choice([3, 4, 5]);
    return mc(
      `Sigui $f(x)=\\dfrac{(\\sin(${a}x^{2}))^{2}}{x^{4}}$ si $x\\neq0$ i $f(0)=k$. Per a quin valor de $k$ la funció és contínua en $x=0$?`,
      `$k=${a * a}$`,
      [`$k=${a}$`, `$k=${2 * a}$`, `$k=-${a * a}$`, "No és possible fer-la contínua"],
      `$\\displaystyle\\lim_{x\\to0}\\frac{\\sin(${a}x^{2})}{x^{2}}=${a}$, així que el límit de $f$ és $${a}^{2}=${a * a}$ i cal $k=${a * a}$.`
    );
  }

  // Valor de la logística en el punt d'inflexió (com 2025, test 2)
  function tInfl() {
    const L = choice([200, 400, 600, 800, 1000]);
    const k = choice([1, 2, 3, 4]);
    const x0 = choice([-2, -1, 1, 2, 3]);
    const den = `1+e^{-${k}(x${x0 < 0 ? "+" : "-"}${Math.abs(x0)})}`;
    return mc(
      `Sigui $f(x)=\\dfrac{${L}}{${den}}$. El valor de la funció $f$ en el punt d'inflexió és:`,
      `$${L / 2}$`,
      [`$${L}$`, `$${L / 4}$`, `$${(3 * L) / 2}$`, "$0$"],
      `És una logística: el punt d'inflexió és $x=${x0}$ i allà $f=\\frac{${L}}{2}=${L / 2}$ (la meitat de $L$).`
    );
  }

  // Fita més precisa del residu de Taylor de e^c (com 2025, test 4)
  function tBound() {
    const c = choice([0.1, 0.2]);
    const n = choice([3, 4, 5]);
    const B = 3 * Math.pow(c, n + 1) / fact(n + 1);
    // q = el major enter amb 10^{-q} > B: la fita més precisa és $\lt 10^{-q}$
    let q = 0;
    while (Math.pow(10, -(q + 1)) > B) q++;
    const opt = e => `$\\lt 10^{${e}}$`;
    return mc(
      `S'aproxima $e^{${c}}$ amb el polinomi de Taylor $P_{${n}}$ de $e^{x}$ en $a=0$. Quina és la fita més precisa (vàlida) de $|R_{${n}}(${c})|$? (useu $e\\lt3$)`,
      opt(-q),
      [opt(-(q + 1)), opt(-(q + 2)), opt(-(q - 1)), opt(-(q - 2))],
      `$|R_{${n}}(${c})|=\\dfrac{e^{\\xi}}{${n + 1}!}\\,${c}^{${n + 1}}\\lt\\dfrac{3\\,${c}^{${n + 1}}}{${n + 1}!}\\approx${sci(B)}$. ` +
      `Com que $${sci(B)}$ és més gran que $10^{${-(q + 1)}}$, aquesta no és una fita vàlida; la més precisa és $\\lt 10^{${-q}}$.`
    );
  }

  // Límit amb paràmetres (com 2025, test 5)
  function tLimit() {
    const a = choice([2, 4, 6]);
    const b = choice([2, 3]);
    return mc(
      `Calculeu (si existeix) $\\displaystyle\\lim_{x\\to0}\\frac{${a}(1-\\cos(${b}x))}{x^{2}}$.`,
      `$${frac(a * b * b, 2)}$`,
      [`$${a * b * b}$`, `$${frac(a * b, 2)}$`, `$${frac(2 * a, b * b)}$`, "$0$"],
      `$1-\\cos(${b}x)\\sim\\frac{(${b}x)^{2}}{2}$, així que el límit és $\\frac{${a}\\cdot${b}^{2}}{2}=${frac(a * b * b, 2)}$.`
    );
  }

  /* ---------------- PROBLEMA 1: estudi de f(x) = (x²+c)/(x-d) ---------------- */
  // Mateixa estructura que el Problema 1 de 2025: asímptotes, extrems, convexitat
  // i extrems absoluts en un interval a l'esquerra de l'asímptota vertical.
  function problem1() {
    const d = ri(-2, 2);
    const K = ri(2, 3);
    const c = K * K - d * d;
    const f = x => (x * x + c) / (x - d);
    const xMax = d - K, xMin = d + K;
    const a = xMax - ri(1, 2), b = d - 1;
    const cands = [a, xMax, b];
    const vals = cands.map(f);
    const mx = Math.max(...vals), mn = Math.min(...vals);

    const numTex = `x^{2}${c === 0 ? "" : ` ${fmtSigned(c)}`}`;
    const denTex = `x${d === 0 ? "" : ` ${fmtSigned(-d)}`}`;
    const plotF = `(x^2${c >= 0 ? "+" : "-"}${Math.abs(c)})/(x${d >= 0 ? "-" : "+"}${Math.abs(d)})`;
    const plotLine = `x${d >= 0 ? "+" : "-"}${Math.abs(d)}`;

    return {
      promptLatex: `<p>Considerem la funció $f(x)=\\dfrac{${numTex}}{${denTex}}$.</p>` +
        `<p>(a) Trobeu les asímptotes, els extrems relatius i on és convexa. (b) Trobeu el màxim i el mínim absoluts de $f$ a l'interval $[${a},${b}]$.</p>`,
      instructions: "Omple totes les caselles. Asímptota obliqua y = mx + n. Convexa (∪) per a x > p: dona p. Pots escriure fraccions (p.ex. -7/3).",
      fields: [
        { label: "AV x =", checker: numChecker(d, 1e-3) },
        { label: "AO m =", checker: numChecker(1, 1e-3) },
        { label: "AO n =", checker: numChecker(d, 1e-3) },
        { label: "x màx rel =", checker: numChecker(xMax, 1e-3) },
        { label: "f(màx) =", checker: numChecker(f(xMax), 1e-3) },
        { label: "x mín rel =", checker: numChecker(xMin, 1e-3) },
        { label: "f(mín) =", checker: numChecker(f(xMin), 1e-3) },
        { label: "convexa per x >", checker: numChecker(d, 1e-3) },
        { label: "màx absolut =", checker: numChecker(mx, 1e-3) },
        { label: "mín absolut =", checker: numChecker(mn, 1e-3) }
      ],
      solutionHtml:
        `Domini $\\mathbb{R}\\setminus\\{${d}\\}$. Dividint: $x^{2}${c === 0 ? "" : ` ${fmtSigned(c)}`}=(x${d === 0 ? "" : ` ${fmtSigned(-d)}`})(x${d === 0 ? "" : ` ${fmtSigned(d)}`})+${K * K}$, així que $f(x)=x${d === 0 ? "" : ` ${fmtSigned(d)}`}+\\dfrac{${K * K}}{x${d === 0 ? "" : ` ${fmtSigned(-d)}`}}$.<br>` +
        `• <b>Vertical</b> $x=${d}$. <b>Obliqua</b> $y=x${d === 0 ? "" : ` ${fmtSigned(d)}`}$ (m=1, n=${d}).<br>` +
        `• $f'(x)=1-\\dfrac{${K * K}}{(x-(${d}))^{2}}=0\\Rightarrow x=${xMax}$ i $x=${xMin}$. ` +
        `Màxim relatiu a $x=${xMax}$: $f=${fmtNum(f(xMax))}$; mínim relatiu a $x=${xMin}$: $f=${fmtNum(f(xMin))}$.<br>` +
        `• $f''(x)=\\dfrac{${2 * K * K}}{(x-(${d}))^{3}}$: <b>convexa</b> ($\\cup$) per a $x>${d}$, còncava per a $x<${d}$.<br>` +
        `• <b>Weierstrass a $[${a},${b}]$</b> (f contínua, l'asímptota és fora): candidats $f(${a})=${fmtNum(vals[0])}$, $f(${xMax})=${fmtNum(vals[1])}$, $f(${b})=${fmtNum(vals[2])}$. ` +
        `Màxim absolut ${fmtNum(mx)}, mínim absolut ${fmtNum(mn)}.` +
        `<div class='plot' data-f='${plotF}' data-xr='${d - K - 3},${d + K + 3}' data-yr='${2 * d - 2 * K - 3},${2 * d + 2 * K + 3}' data-va='${d}' data-lines='${plotLine}' data-pts='${xMax},${f(xMax)};${xMin},${f(xMin)}'></div>`
    };
  }

  /* ---------------- PROBLEMA 2: Taylor de sinh/cosh + fita de l'error ---------------- */
  function problem2() {
    const cosh = Math.random() < 0.5;
    const n = choice([5, 6, 7]);
    const name = cosh ? "\\dfrac{e^{x}+e^{-x}}{2}" : "\\dfrac{e^{x}-e^{-x}}{2}";
    // Coeficients de Maclaurin: sinh té termes senars, cosh té termes parells
    const coeff = k => ((cosh ? k % 2 === 0 : k % 2 === 1) ? 1 / fact(k) : 0);
    let P1 = 0;
    for (let k = 0; k <= n; k++) P1 += coeff(k);
    const f = cosh ? Math.cosh : Math.sinh;
    const trueErr = Math.abs(f(1) - P1);
    // f^{(n+1)} és cosh o sinh segons la paritat de n+1; en [0,1] el màxim és a x=1
    const useCosh = cosh ? (n + 1) % 2 === 0 : (n + 1) % 2 === 1;
    const M = useCosh ? 1.6 : 1.2;
    const Mtex = useCosh ? "\\cosh\\xi\\le\\cosh 1\\lt 1.6" : "\\sinh\\xi\\le\\sinh 1\\lt 1.2";
    const ref = M / fact(n + 1);
    const terms = [];
    for (let k = 0; k <= n; k++) {
      if (coeff(k) === 0) continue;
      terms.push(k === 0 ? "1" : k === 1 ? "x" : `\\dfrac{x^{${k}}}{${k}!}`);
    }

    return {
      promptLatex: `<p>(a) Trobeu el polinomi de Taylor de grau $${n}$ de $f(x)=${name}$ al voltant de $a=0$, i avalueu-lo a $x=1$. ` +
        `(b) Utilitzant l'expressió del residu, doneu una fita de l'error $|R_{${n}}(1)|$ en fer aquesta aproximació (podeu usar $e\\lt 3$).</p>`,
      instructions: "Dona P(1) i una fita vàlida de l'error (ha de ser ≥ l'error real i raonablement ajustada).",
      fields: [
        { label: `P${n}(1) =`, checker: numChecker(P1, 1e-4) },
        { label: "fita |R| ≤", checker: s => {
          let v;
          try { v = MathParser.compile(s)(0); } catch (e) { return { ok: false, error: e.message }; }
          if (!isFinite(v)) return { ok: false, error: "valor no numèric" };
          if (v < trueErr * 0.999) return { ok: false, error: "aquesta fita és MASSA petita: l'error real és més gran" };
          if (v > ref * 1.5) return { ok: false, error: "fita correcta però massa grollera; afina M" };
          return { ok: true };
        } }
      ],
      solutionHtml:
        `$f^{(k)}(0)=\\text{${cosh ? "1 si k és parell, 0 si és senar" : "1 si k és senar, 0 si és parell"}}$.<br>` +
        `$P_{${n}}(x)=${terms.join(" + ")}$, així que $P_{${n}}(1)\\approx ${P1.toFixed(6)}$.<br>` +
        `$|R_{${n}}(1)|=\\dfrac{|f^{(${n + 1})}(\\xi)|}{${n + 1}!}$ amb $0\\lt\\xi\\lt1$; $${Mtex}$. ` +
        `Per tant $|R_{${n}}(1)|\\lt\\dfrac{${M}}{${n + 1}!}\\approx${sci(ref)}$ (l'error real és $\\approx${sci(trueErr)}$).`
    };
  }

  /* ---------------- EXAMEN COMPLET ---------------- */
  function exam() {
    return {
      test: [tCont(), tInfl(), tBound(), tLimit()],
      p1: problem1(),
      p2: problem2()
    };
  }

  function fmtNum(x) { return +x.toFixed(6) + ""; }

  return { exam };
})();
