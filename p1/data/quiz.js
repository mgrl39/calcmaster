/* ============================================================
   quizdata.js — Banc de preguntes tipus test (conceptuals) i
   problemes resolts d'examens reals d'anys anteriors (UAB,
   Grau en Enginyeria Informàtica, Càlcul, 1r Parcial).
   ============================================================ */

const CONCEPTUAL_MC = [
  // ---- Inspirades i verificades a partir d'exàmens reals ----
  {
    q: "Quina és la derivada de $f(x) = e^{\\sqrt{x}}$?",
    options: [
      "$\\dfrac{1}{2\\sqrt{x}}e^{\\sqrt{x}}$",
      "$e^{\\sqrt{x}}$",
      "$\\sqrt{x}\\,e^{\\sqrt{x}-1}$",
      "$2\\sqrt{x}\\,e^{\\sqrt{x}}$"
    ],
    correct: 0,
    exp: "Regla de la cadena: $(e^{g(x)})' = g'(x)e^{g(x)}$, amb $g(x)=\\sqrt{x}$, $g'(x)=\\frac{1}{2\\sqrt{x}}$."
  },
  {
    q: "$\\displaystyle\\lim_{x\\to\\infty}\\dfrac{\\ln x}{x} = \\ ?$",
    options: ["$0$", "$1$", "$\\infty$", "$e$"],
    correct: 0,
    exp: "Indeterminació $\\infty/\\infty$. Per l'Hôpital: $\\lim \\frac{1/x}{1} = 0$. El logaritme creix molt més lentament que $x$."
  },
  {
    q: "$f$ té derivada contínua a tot $\\mathbb{R}$, amb $f''(x)<0$ a $(0,2)$ i un màxim relatiu en $x=1$. Llavors $f'(x)$ a $(0,2)$ és:",
    options: ["decreixent", "creixent", "sempre positiva", "constant"],
    correct: 0,
    exp: "$f''<0$ significa que $f'$ és decreixent ($f''$ és la derivada de $f'$, i una funció amb derivada negativa decreix). De fet, com que el màxim és a $x=1$, $f'$ passa de positiva a negativa allà."
  },
  {
    q: "La recta tangent a $f(x)=12\\sqrt{x}$ en el punt $(9,36)$ és:",
    options: ["$y=18+2x$", "$y=36+12\\sqrt{x}$", "$y=36+72x$", "$y=x$"],
    correct: 0,
    exp: "$f'(x)=\\frac{6}{\\sqrt{x}}$, $f'(9)=2$. Tangent: $y-36=2(x-9) \\Rightarrow y=18+2x$."
  },
  {
    q: "Els punts d'inflexió de $f(x)=x^4-8x^3-12$ són:",
    options: ["$x=0$ i $x=4$", "$x=4$ i $x=-4$", "no n'hi ha", "$x=0$ i $x=12$"],
    correct: 0,
    exp: "$f''(x)=12x^2-48x=12x(x-4)$, s'anul·la i canvia de signe a $x=0$ i $x=4$."
  },
  {
    q: "La recta tangent a $f(x)=\\ln(x^2+1)$ en $x=-1$ és:",
    options: ["$y+x=\\ln 2-1$", "$y-\\ln 2=x+1$", "$y+x=\\ln 2+1$", "no hi ha recta tangent"],
    correct: 0,
    exp: "$f(-1)=\\ln 2$, $f'(x)=\\frac{2x}{x^2+1}$, $f'(-1)=-1$. $y-\\ln2=-1(x+1)\\Rightarrow y+x=\\ln2-1$."
  },
  {
    q: "Totes les solucions de $\\log_3(1-9x^2)-\\log_3(1+3x)=-2$ són:",
    options: ["$x=8/27$", "$x=4/9$", "no té solució real", "$x=4/27$"],
    correct: 0,
    exp: "$\\frac{1-9x^2}{1+3x}=1-3x$ (factoritzant). Llavors $\\log_3(1-3x)=-2 \\Rightarrow 1-3x=1/9 \\Rightarrow x=8/27$."
  },
  {
    q: "$f$ té un únic punt crític, amb $f'(0)=f''(0)=0$, $f'(1)=1$ i $f'(-1)=-1$. Llavors, segur que:",
    options: ["$0$ és un mínim relatiu", "$f$ és convexa arreu", "$0$ és un punt d'inflexió", "$f$ és creixent arreu"],
    correct: 0,
    exp: "$f'$ passa de negativa (a $x=-1$) a positiva (a $x=1$), i $x=0$ n'és l'únic zero: $f$ decreix i després creix, per tant $0$ és un mínim relatiu."
  },
  // ---- Conceptuals (teoremes i indeterminacions) ----
  {
    q: "$f$ és un polinomi de grau 3 i $f'$ és un polinomi de grau 2 sense arrels reals. Quantes arrels reals pot tenir $f$ com a màxim?",
    options: ["1", "0", "2", "3"],
    correct: 0,
    exp: "Si $f$ tingués dues arrels reals $a,b$, el teorema de Rolle garantiria un punt $c\\in(a,b)$ amb $f'(c)=0$, contradient que $f'$ no té arrels reals."
  },
  {
    q: "Si $f$ és contínua a $[a,b]$ i $f(a)\\cdot f(b)<0$, el teorema de Bolzano garanteix que:",
    options: [
      "existeix almenys un $c\\in(a,b)$ amb $f(c)=0$",
      "existeix exactament un $c$ amb $f(c)=0$",
      "$f$ és creixent a $[a,b]$",
      "$f(a)=f(b)$"
    ],
    correct: 0,
    exp: "Bolzano només garanteix l'EXISTÈNCIA d'almenys un zero; la unicitat cal demostrar-la a part (p.ex. amb monotonia)."
  },
  {
    q: "Si $f$ és contínua a l'interval tancat $[a,b]$, el teorema de Weierstrass garanteix que:",
    options: [
      "$f$ assoleix un màxim i un mínim absoluts a $[a,b]$",
      "$f$ és derivable a $(a,b)$",
      "$f$ és acotada però pot no assolir el màxim",
      "$f$ és monòtona"
    ],
    correct: 0,
    exp: "Weierstrass: contínua en un interval TANCAT i ACOTAT implica que assoleix màxim i mínim absoluts."
  },
  {
    q: "Pel teorema del valor mitjà (Lagrange), si $f$ és contínua a $[a,b]$ i derivable a $(a,b)$, existeix $c\\in(a,b)$ tal que:",
    options: [
      "$f'(c)=\\dfrac{f(b)-f(a)}{b-a}$",
      "$f'(c)=0$",
      "$f(c)=\\dfrac{f(a)+f(b)}{2}$",
      "$f''(c)=0$"
    ],
    correct: 0,
    exp: "Aquesta és exactament l'afirmació del TVM: la derivada en algun punt intermedi coincideix amb la pendent mitjana."
  },
  {
    q: "Quina indeterminació apareix en $\\displaystyle\\lim_{x\\to 0}\\left(\\dfrac{1}{x}-\\dfrac{1}{\\sin x}\\right)$?",
    options: ["$\\infty-\\infty$", "$0/0$", "$0\\cdot\\infty$", "$\\infty/\\infty$"],
    correct: 0,
    exp: "Cada terme per separat tendeix a $\\pm\\infty$: és una resta d'infinits. Cal combinar-los en una sola fracció abans d'aplicar l'Hôpital."
  },
  {
    q: "Quina indeterminació apareix en $\\displaystyle\\lim_{x\\to 0^+} x^{x}$?",
    options: ["$0^0$", "$0\\cdot\\infty$", "$1^\\infty$", "$\\infty^0$"],
    correct: 0,
    exp: "Base i exponent tendeixen a $0$: indeterminació $0^0$. S'escriu com $e^{x\\ln x}$ i es resol l'exponent (que és $0\\cdot\\infty$)."
  },
  {
    q: "Quina indeterminació apareix en $\\displaystyle\\lim_{x\\to\\infty}\\left(1+\\dfrac{1}{x}\\right)^{x}$?",
    options: ["$1^\\infty$", "$\\infty^0$", "$0^0$", "$\\infty-\\infty$"],
    correct: 0,
    exp: "Base $\\to 1$ i exponent $\\to\\infty$: $1^\\infty$. Aquest límit clàssic val $e$."
  },
  {
    q: "Quina indeterminació apareix en $\\displaystyle\\lim_{x\\to 0^+} x\\ln x$?",
    options: ["$0\\cdot\\infty$", "$0/0$", "$\\infty/\\infty$", "$\\infty-\\infty$"],
    correct: 0,
    exp: "$x\\to0$ i $\\ln x\\to-\\infty$: producte $0\\cdot\\infty$. Es reescriu com $\\frac{\\ln x}{1/x}$ ($\\infty/\\infty$) per aplicar l'Hôpital."
  },
  {
    q: "Si $f''(x)>0$ per a tot $x$ d'un interval, la funció $f$ en aquest interval és:",
    options: ["convexa", "còncava", "creixent", "decreixent"],
    correct: 0,
    exp: "Segona derivada positiva equival a convexitat (la gràfica es corba cap amunt, com $\\cup$)."
  },
  {
    q: "Si $f'(x_0)=0$ i $f''(x_0)>0$, el punt $x_0$ és:",
    options: ["un mínim relatiu", "un màxim relatiu", "un punt d'inflexió", "no és un punt crític"],
    correct: 0,
    exp: "Criteri de la segona derivada: $f'(x_0)=0$ i $f''(x_0)>0$ implica mínim relatiu (la funció és convexa prop d'allà)."
  },
  {
    q: "La recta $y=mx+n$ és l'asímptota obliqua de $f$ quan $x\\to\\infty$ si:",
    options: [
      "$m=\\displaystyle\\lim_{x\\to\\infty}\\frac{f(x)}{x}$ i $n=\\displaystyle\\lim_{x\\to\\infty}[f(x)-mx]$, amb $m\\neq 0$ finits",
      "$m=\\displaystyle\\lim_{x\\to\\infty}f(x)$ i $n=0$",
      "$m=0$ sempre",
      "cal que $f(x)/x\\to\\infty$"
    ],
    correct: 0,
    exp: "Aquesta és la definició: cal que els dos límits existeixin i siguin finits, amb $m\\neq 0$ (si $m=0$ seria una asímptota horitzontal)."
  },
  {
    q: "Per aplicar la regla de l'Hôpital a una indeterminació $0/0$ en $x\\to a$ cal, entre altres coses, que:",
    options: [
      "$f$ i $g$ siguin derivables a prop de $a$ i $g'(x)\\neq 0$ a prop de $a$",
      "$f$ i $g$ siguin polinomis",
      "$g(a)\\neq 0$",
      "$f'(a)$ i $g'(a)$ existeixin i siguin diferents de $0$"
    ],
    correct: 0,
    exp: "Les hipòtesis clau de l'Hôpital són la derivabilitat prop del punt (no necessàriament al punt) i que $g'$ no s'anul·li a l'entorn."
  },
  {
    q: "El polinomi de Taylor de grau $n$ d'una funció $f$ centrat en $c$ coincideix exactament amb $f$ en quin sentit?",
    options: [
      "en $x=c$: $f$ i el polinomi tenen les mateixes derivades fins a ordre $n$",
      "en tot el domini de $f$",
      "en cap punt",
      "només als punts on $f'(x)=0$"
    ],
    correct: 0,
    exp: "El polinomi de Taylor s'ha construït precisament perquè $P^{(k)}(c)=f^{(k)}(c)$ per $k=0,\\dots,n$; fora de $c$ només és una aproximació."
  },
  {
    q: "Si $f$ és derivable a $(a,b)$ i $f'(x)>0$ per a tot $x\\in(a,b)$, llavors $f$ a $(a,b)$ és:",
    options: ["estrictament creixent", "estrictament decreixent", "constant", "convexa"],
    correct: 0,
    exp: "Conseqüència directa del TVM: derivada positiva arreu implica funció estrictament creixent."
  },
  {
    q: "L'error d'interpolació polinomial amb $n+1$ nodes $x_0,\\dots,x_n$ depèn de:",
    options: [
      "la derivada $(n+1)$-èsima de $f$ i del producte $(x-x_0)(x-x_1)\\cdots(x-x_n)$",
      "només del nombre de nodes",
      "només de la distància entre nodes",
      "no es pot acotar mai"
    ],
    correct: 0,
    exp: "$E(x) = \\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}\\displaystyle\\prod_{i=0}^{n}(x-x_i)$, fórmula anàloga al residu de Taylor."
  }
];

const SOLVED_PROBLEMS = [
  {
    title: "Estudi complet d'una funció racional (I)",
    statement: "Donada $f(x) = \\dfrac{1}{x^2-2x}$, estudieu creixement/decreixement, extrems relatius, concavitat/convexitat i totes les asímptotes.",
    solutionHtml: `
      <p><b>Domini:</b> $x^2-2x=x(x-2)=0 \\Rightarrow Dom(f)=\\mathbb{R}\\setminus\\{0,2\\}$.</p>
      <p><b>Primera derivada:</b> $f'(x) = \\dfrac{-(2x-2)}{(x^2-2x)^2} = \\dfrac{-2(x-1)}{(x^2-2x)^2}$.</p>
      <p>El denominador és sempre $>0$ (és un quadrat), així que el signe de $f'$ el dona $-(x-1)$: positiu si $x<1$, negatiu si $x>1$.</p>
      <p><b>Creixement:</b> $f$ creix a $(-\\infty,0)\\cup(0,1)$ i decreix a $(1,2)\\cup(2,\\infty)$.<br>
      A $x=1$ passa de creixent a decreixent $\\Rightarrow$ <b>màxim relatiu</b> a $(1,f(1))=(1,-1)$.</p>
      <p><b>Segona derivada:</b> desenvolupant, $f''(x) = \\dfrac{6x^2-12x+8}{(x^2-2x)^3}$. El numerador $6x^2-12x+8$ té discriminant $144-192=-48<0$ i coeficient principal positiu, per tant és <b>sempre positiu</b>.</p>
      <p>El signe de $f''$ coincideix amb el signe de $(x^2-2x)^3$, és a dir, de $x^2-2x=x(x-2)$: negatiu a $(0,2)$, positiu fora.</p>
      <p><b>Convexitat:</b> $f$ és convexa a $(-\\infty,0)\\cup(2,\\infty)$ i còncava a $(0,2)$. No hi ha punts d'inflexió reals (els canvis de signe passen a $x=0,2$, que no són del domini).</p>
      <p><b>Asímptotes:</b> verticals a $x=0$ i $x=2$ (el numerador no s'hi anul·la). Com $\\displaystyle\\lim_{x\\to\\pm\\infty}\\frac{1}{x^2-2x}=0$, l'asímptota horitzontal és $y=0$ (als dos costats).</p>
    `
  },
  {
    title: "Estudi complet d'una funció racional (II) — asímptota obliqua",
    statement: "Donada $f(x) = \\dfrac{x^2}{x-1}$, estudieu creixement, extrems, convexitat i asímptotes.",
    solutionHtml: `
      <p><b>Domini:</b> $\\mathbb{R}\\setminus\\{1\\}$.</p>
      <p><b>Primera derivada:</b> $f'(x)=\\dfrac{2x(x-1)-x^2}{(x-1)^2}=\\dfrac{x^2-2x}{(x-1)^2}=\\dfrac{x(x-2)}{(x-1)^2}$.</p>
      <p>Denominador sempre $>0$. Signe de $f'$ = signe de $x(x-2)$: positiu per $x<0$, negatiu per $0 \\lt x \\lt 2$ ($x\\neq1$), positiu per $x>2$.</p>
      <p><b>Creixement:</b> creix a $(-\\infty,0)$, decreix a $(0,1)\\cup(1,2)$, creix a $(2,\\infty)$.<br>
      $x=0$: creixent$\\to$decreixent $\\Rightarrow$ <b>màxim relatiu</b> $(0,0)$.<br>
      $x=2$: decreixent$\\to$creixent $\\Rightarrow$ <b>mínim relatiu</b> $(2,4)$.</p>
      <p><b>Segona derivada:</b> $f''(x)=\\dfrac{2}{(x-1)^3}$. Negativa per $x<1$ (còncava), positiva per $x>1$ (convexa). No hi ha inflexió real (el canvi és a $x=1$, fora del domini).</p>
      <p><b>Asímptotes:</b> vertical a $x=1$. Com el grau del numerador supera en $1$ el del denominador, dividint: $x^2 = (x-1)(x+1)+1$, és a dir $f(x)=x+1+\\dfrac{1}{x-1}$. Com $\\frac{1}{x-1}\\to0$, l'<b>asímptota obliqua</b> és $y=x+1$ (no n'hi ha d'horitzontal).</p>
    `
  },
  {
    title: "Estudi d'una funció exponencial",
    statement: "Donada $f(x) = e^{-x}x^2$ (igual que a l'examen del 26 d'abril de 2021), estudieu creixement, extrems, convexitat i asímptotes.",
    solutionHtml: `
      <p><b>Domini:</b> $\\mathbb{R}$ (tot arreu).</p>
      <p><b>Primera derivada</b> (regla del producte): $f'(x) = -e^{-x}x^2 + e^{-x}2x = e^{-x}x(2-x)$.</p>
      <p>Com $e^{-x}>0$ sempre, el signe de $f'$ el dona $x(2-x)$: negatiu per $x<0$, positiu per $0 \\lt x \\lt 2$, negatiu per $x>2$.</p>
      <p><b>Creixement:</b> decreix a $(-\\infty,0)$, creix a $(0,2)$, decreix a $(2,\\infty)$.<br>
      $x=0$: <b>mínim relatiu</b> $(0,0)$. &nbsp; $x=2$: <b>màxim relatiu</b> $\\left(2,\\dfrac{4}{e^2}\\right)\\approx(2,\\ 0.541)$.</p>
      <p><b>Segona derivada:</b> $f''(x) = e^{-x}(x^2-4x+2)$. Les arrels de $x^2-4x+2$ són $x=2\\pm\\sqrt2$.</p>
      <p><b>Convexitat:</b> convexa a $(-\\infty,2-\\sqrt2)\\cup(2+\\sqrt2,\\infty)$, còncava a $(2-\\sqrt2,2+\\sqrt2)$. <b>Punts d'inflexió</b> a $x=2-\\sqrt2\\approx0.586$ i $x=2+\\sqrt2\\approx3.414$.</p>
      <p><b>Asímptotes:</b> quan $x\\to+\\infty$, l'exponencial guanya i $f(x)\\to0$: asímptota horitzontal $y=0$ (només per la dreta). Quan $x\\to-\\infty$, $f(x)\\to\\infty$, no n'hi ha per l'esquerra.</p>
    `
  },
  {
    title: "Equació exponencial (estil examen)",
    statement: "Resoleu l'equació: $e^{2x} - 6e^{-2x} = -1$.",
    solutionHtml: `
      <p>Fem el canvi $t=e^{2x}$ (amb $t>0$). L'equació es converteix en $t - \\dfrac{6}{t} = -1$, és a dir $t^2+t-6=0$.</p>
      <p>Factoritzant: $(t+3)(t-2)=0 \\Rightarrow t=-3$ (es descarta, $t$ ha de ser $>0$) o $t=2$.</p>
      <p>Desfent el canvi: $e^{2x}=2 \\Rightarrow x = \\dfrac{\\ln 2}{2} \\approx 0.3466$.</p>
    `
  },
  {
    title: "Existència i unicitat amb Bolzano + monotonia",
    statement: "Proveu que l'equació $e^x = \\dfrac{e^2}{x^2}$ té una única solució a l'interval $(0,\\infty)$ (examen 26 d'abril de 2021).",
    solutionHtml: `
      <p>Definim $g(x) = e^x - \\dfrac{e^2}{x^2}$, contínua a $(0,\\infty)$.</p>
      <p><b>Existència (Bolzano):</b> $g(1) = e - e^2 \\approx 2.718-7.389 = -4.671 < 0$. $g(3) = e^3-\\dfrac{e^2}{9}\\approx 20.09-0.82=19.27>0$. Com $g$ és contínua a $[1,3]$ i canvia de signe, pel teorema de Bolzano existeix $c\\in(1,3)$ amb $g(c)=0$, és a dir una solució.</p>
      <p><b>Unicitat (monotonia):</b> $g'(x) = e^x + \\dfrac{2e^2}{x^3}$. Per $x>0$, tots dos termes són estrictament positius, així que $g'(x)>0$ a tot $(0,\\infty)$: $g$ és estrictament creixent, per tant només pot tallar el zero <b>una</b> vegada.</p>
      <p>Conclusió: existeix exactament una solució a $(0,\\infty)$. <i>(Aquest patró "Bolzano + signe de la derivada" és la manera estàndard de demostrar unicitat en aquests exàmens.)</i></p>
    `
  },
  {
    title: "Aproximació de Taylor i fita de l'error",
    statement: "Aproximeu $e^{1/2}$ amb el polinomi de Taylor de grau 5 de $f(x)=e^x$ centrat en $a=0$, i doneu una fita de l'error comès.",
    solutionHtml: `
      <p><b>Polinomi:</b> $P_5(x) = 1+x+\\dfrac{x^2}{2!}+\\dfrac{x^3}{3!}+\\dfrac{x^4}{4!}+\\dfrac{x^5}{5!}$.</p>
      <p>Avaluant en $x=\\tfrac12$: $P_5\\!\\left(\\tfrac12\\right) \\approx 1.648697917$.</p>
      <p><b>Fita de l'error (forma de Lagrange):</b> $R_5(x) = \\dfrac{f^{(6)}(\\xi)}{6!}x^6 = \\dfrac{e^{\\xi}}{720}\\left(\\tfrac12\\right)^6$, amb $\\xi\\in(0,\\tfrac12)$.</p>
      <p>Com $e^{\\xi} \\le e^{1/2} < 3 = M$ en aquest interval: $|R_5(\\tfrac12)| \\le \\dfrac{3}{720\\cdot 64} \\approx 6.5\\times 10^{-5}$.</p>
      <p>Per tant: $e^{1/2} \\in \\left[P_5(\\tfrac12) - 6.5\\times10^{-5},\\ P_5(\\tfrac12)+6.5\\times10^{-5}\\right]$, un interval molt estret al voltant de $1.6487$.</p>
    `
  }
];
