/* ============================================================
   plandata.js — Llista prioritzada de temes (a partir dels 10
   parcials 2018–2026 + llistes) i errors típics.
   Enllaços: {l: "text", goto: "pestanya", cat?, exam?, list?}
   ============================================================ */

const EXAM_COLS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "R2019", "2018", "R2018"];

const TOPIC_RANKING = [
  {
    tier: "S", topic: "Estudi complet de funció: creixement, extrems relatius, concavitat, inflexió",
    seen: ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "R2019", "2018", "R2018"],
    lists: "L3 · L4", weight: "3–4 punts",
    why: "Ha sortit a tots els parcials (2018–2026), sense excepció. És el problema llarg segur.",
    links: [{ l: "Generador", goto: "exercicis", cat: "functionStudy" }, { l: "Llista 4", goto: "llistes", list: "L4" }, { l: "Llista 3", goto: "llistes", list: "L3" }]
  },
  {
    tier: "S", topic: "Asímptotes (verticals, horitzontals, obliqües) + esbós de la gràfica",
    seen: ["2026", "2025", "2024", "2023", "2022", "2021", "2018", "R2018"],
    lists: "L4", weight: "1–2 punts",
    why: "Va sempre dins de l'estudi de funció. Truc: divideix el polinomi abans de derivar.",
    links: [{ l: "Asímptota obliqua", goto: "exercicis", cat: "asymptote" }, { l: "Examen 2025 P1", goto: "examens", exam: "2025" }]
  },
  {
    tier: "S", topic: "Polinomi de Taylor + fita de l'error (residu de Lagrange)",
    seen: ["2026", "2025"],
    lists: "L5", weight: "3 + 0.8 punts",
    why: "El 2025 i el 2026 hi va haver un problema llarg de Taylor (3 punts o més). Ja és fix a l'examen.",
    links: [{ l: "Taylor + fita", goto: "exercicis", cat: "taylorProblem" }, { l: "Error < 10⁻ᵏ", goto: "exercicis", cat: "taylorDegree" }, { l: "Llista 5", goto: "llistes", list: "L5" }]
  },
  {
    tier: "S", topic: "Extrems absoluts en un interval [a,b] (Weierstrass)",
    seen: ["2026", "2025", "2022"],
    lists: "L3 (10)", weight: "0.75–1 punt",
    why: "Ha sortit els últims anys dins del problema llarg. Són 5 minuts si saps la recepta.",
    links: [{ l: "Generador", goto: "exercicis", cat: "absExtrema" }, { l: "Llista 3", goto: "llistes", list: "L3" }]
  },
  {
    tier: "A", topic: "Límits: l'Hôpital i indeterminacions 1^∞, 0^0, ∞^0",
    seen: ["2025", "2024", "2022", "2021", "2019", "R2019", "2018", "R2018"],
    lists: "L4 (4–6) · L1 (9)", weight: "1–2 punts",
    why: "Gairebé cada any. Recepta fixa: f^g = e^(g·ln f) i infinitèsims equivalents.",
    links: [{ l: "Límits 1^∞", goto: "exercicis", cat: "powLimit" }, { l: "l'Hôpital", goto: "exercicis", cat: "limit" }, { l: "Llista 4", goto: "llistes", list: "L4" }]
  },
  {
    tier: "A", topic: "Bolzano + unicitat (monotonia o Rolle) i nombre d'arrels amb paràmetre",
    seen: ["2026", "2024", "2023", "2022", "2021", "2020"],
    lists: "L1 (1–3) · L2 (8–9) · L3 (2)", weight: "1–3 punts",
    why: "Cada any de 2020 a 2024. És una demostració amb plantilla: si l'escrius bé, punts segurs.",
    links: [{ l: "Llista 2", goto: "llistes", list: "L2" }, { l: "Examen 2022", goto: "examens", exam: "2022" }, { l: "Examen 2020", goto: "examens", exam: "2020" }]
  },
  {
    tier: "B", topic: "Equacions exponencials/logarítmiques (canvi t = eˣ)",
    seen: ["2024", "2023", "2022", "2021", "R2018"],
    lists: "L0 (12)", weight: "1 punt",
    why: "Sempre és una quadràtica amb un canvi de variable. Recorda descartar t ≤ 0.",
    links: [{ l: "Generador", goto: "exercicis", cat: "expQuadratic" }]
  },
  {
    tier: "B", topic: "Recta tangent",
    seen: ["2024", "2023", "2021", "2018", "R2018"],
    lists: "L1 (11–12)", weight: "0.8–1 punt",
    why: "Fàcil i freqüent: y − f(a) = f'(a)(x − a).",
    links: [{ l: "Generador", goto: "exercicis", cat: "tangent" }]
  },
  {
    tier: "B", topic: "Derivades (incl. derivació logarítmica f(x)^g(x))",
    seen: ["2024", "2021", "2018", "R2018"],
    lists: "L2", weight: "0.8–1 punt",
    why: "Surt sol o dins de tot. f^g: pren logaritmes.",
    links: [{ l: "Derivada f^g", goto: "exercicis", cat: "logDerivative" }, { l: "Derivades", goto: "exercicis", cat: "derivative" }]
  },
  {
    tier: "B", topic: "Inequacions i valor absolut",
    seen: ["2024", "2022", "2021"],
    lists: "L0 (1–3)", weight: "0.8–1 punt",
    why: "Taula de signes. Amb |·|: eleva al quadrat o separa casos.",
    links: [{ l: "Generador", goto: "exercicis", cat: "inequality" }]
  },
  {
    tier: "B", topic: "Continuïtat amb paràmetre",
    seen: ["2025"],
    lists: "L1 (6–8)", weight: "0.8 punts",
    why: "Va sortir al test del 2025 i és a la Llista 1. És calcular un límit.",
    links: [{ l: "Generador", goto: "exercicis", cat: "continuity" }]
  },
  {
    tier: "C", topic: "Interpolació polinomial (Newton / Lagrange)",
    seen: ["2025"],
    lists: "L6", weight: "0.8 punts",
    why: "Només al test del 2025. Ara és la Llista 6: amb una estona n'hi ha prou per a l'examen.",
    links: [{ l: "Generador", goto: "exercicis", cat: "interpolation" }]
  },
  {
    tier: "C", topic: "Rolle / TVM, optimització, mètode de Newton",
    seen: [],
    lists: "L2 (4–7) · L3 (5–6)", weight: "0 punts fins ara",
    why: "No han sortit a cap parcial. Llegeix-ho un cop; no hi inverteixis hores.",
    links: [{ l: "Newton", goto: "exercicis", cat: "newton" }, { l: "Teoria", goto: "teoria" }]
  }
];

const PLAN_DAYS = [
  {
    day: "Dia 1", title: "Els 6 punts dels problemes", goal: "Dominar l'estudi de funció complet i Taylor + error (tier S).",
    tasks: [
      { id: "d1a", h: "30 min", t: "Llegeix la teoria: Estudi de funció (bloc 8), Asímptotes (bloc 9) i el truc de dividir racionals.", links: [{ l: "Teoria", goto: "teoria" }] },
      { id: "d1b", h: "60 min", t: "Fes el <b>Problema 1 del 2025</b> en paper, sense mirar res. Després corregeix-lo amb la solució apartat per apartat.", links: [{ l: "Examen 2025", goto: "examens", exam: "2025" }] },
      { id: "d1c", h: "90 min", t: "Llista 4: 1(a), 1(b), 1(f) i <b>Abril 2024 Ex. 3</b> ($e^{-x}/(x+2)$) i <b>2022 P1</b> ($x/(1+x^2)$). Escriu sempre: domini → asímptotes → $f'$ i taula → $f''$ i taula → gràfica.", links: [{ l: "Llista 4", goto: "llistes", list: "L4" }, { l: "Examen 2024", goto: "examens", exam: "2024" }] },
      { id: "d1d", h: "30 min", t: "Generador <b>Estudi de funció</b> fins que n'encertis 3 seguits. Després <b>Extrems absoluts</b> ×3 i la Llista 3 problema 10.", links: [{ l: "Estudi de funció", goto: "exercicis", cat: "functionStudy" }, { l: "Extrems absoluts", goto: "exercicis", cat: "absExtrema" }] },
      { id: "d1e", h: "30 min", t: "Teoria de Taylor (bloc 11). Aprèn de memòria els desenvolupaments de $e^x$, $\\sin$, $\\cos$, $\\ln(1+x)$ i $(1+x)^a$, i la fórmula del residu de Lagrange.", links: [{ l: "Teoria", goto: "teoria" }] },
      { id: "d1f", h: "90 min", t: "<b>Problema 2 del 2025</b> en paper i després tota la <b>Llista 5</b> (5 problemes).", links: [{ l: "Examen 2025", goto: "examens", exam: "2025" }, { l: "Llista 5", goto: "llistes", list: "L5" }] },
      { id: "d1g", h: "30 min", t: "Generadors <b>Taylor + fita</b> i <b>Taylor amb error &lt; 10⁻ᵏ</b>: 3 encerts seguits de cadascun.", links: [{ l: "Taylor + fita", goto: "exercicis", cat: "taylorProblem" }, { l: "Error < 10⁻ᵏ", goto: "exercicis", cat: "taylorDegree" }] }
    ]
  },
  {
    day: "Dia 2", title: "Límits, demostracions i punts ràpids", goal: "Tiers A i B: el que surt al test i als apartats curts.",
    tasks: [
      { id: "d2a", h: "30 min", t: "Teoria de límits (bloc 4): les 7 indeterminacions, $f^g=e^{g\\ln f}$ i els infinitèsims equivalents ($\\sin t\\sim t$, $1-\\cos t\\sim t^2/2$, $\\ln(1+t)\\sim t$, $e^t-1\\sim t$).", links: [{ l: "Teoria", goto: "teoria" }] },
      { id: "d2b", h: "75 min", t: "Llista 4 problemes 4, 5 i 6 + els límits de 2024, 2022, 2019, Recu 2019 i Recu 2018.", links: [{ l: "Llista 4", goto: "llistes", list: "L4" }, { l: "Exàmens", goto: "examens", exam: "2022" }] },
      { id: "d2c", h: "30 min", t: "Generadors <b>Límits 1^∞</b> ×5, <b>l'Hôpital</b> ×5, <b>Continuïtat (k)</b> ×3.", links: [{ l: "Límits 1^∞", goto: "exercicis", cat: "powLimit" }, { l: "l'Hôpital", goto: "exercicis", cat: "limit" }, { l: "Continuïtat", goto: "exercicis", cat: "continuity" }] },
      { id: "d2d", h: "60 min", t: "<b>Bolzano + unicitat</b>: memoritza la plantilla (vegeu a sota) i fes 2024 2(b), 2023 1(c), 2022 test 1, Llista 2 (8, 9) i Llista 1 (1–3).", links: [{ l: "Llista 2", goto: "llistes", list: "L2" }, { l: "Llista 1", goto: "llistes", list: "L1" }] },
      { id: "d2e", h: "45 min", t: "Arrels amb paràmetre: <b>2020</b> (= Llista 3 problema 2) i <b>2022 P2(b)</b>.", links: [{ l: "Examen 2020", goto: "examens", exam: "2020" }, { l: "Examen 2022", goto: "examens", exam: "2022" }] },
      { id: "d2f", h: "60 min", t: "Ronda ràpida de tier B: <b>Recta tangent</b> ×3, <b>Equacions exp.</b> ×3, <b>Derivada f^g</b> ×3, <b>Inequacions</b> ×3.", links: [{ l: "Tangent", goto: "exercicis", cat: "tangent" }, { l: "Equacions", goto: "exercicis", cat: "expQuadratic" }, { l: "f^g", goto: "exercicis", cat: "logDerivative" }, { l: "Inequacions", goto: "exercicis", cat: "inequality" }] },
      { id: "d2g", h: "20 min", t: "Interpolació (Newton amb diferències dividides, 3 punts): llegeix el bloc 12 i fes 3 exercicis.", links: [{ l: "Interpolació", goto: "exercicis", cat: "interpolation" }] }
    ]
  },
  {
    day: "Dia 3", title: "Condicions d'examen", goal: "Fer exàmens complets cronometrats i tapar forats.",
    tasks: [
      { id: "d3a", h: "90 min", t: "<b>Abril 2024 complet</b> en paper, cronometrat (1h30). Corregeix-lo amb les solucions i apunta els errors.", links: [{ l: "Examen 2024", goto: "examens", exam: "2024" }] },
      { id: "d3b", h: "90 min", t: "<b>Simulacre format 2025</b> (90 min) a la web. Si treus menys d'un 6, repeteix el tipus d'exercici que has fallat.", links: [{ l: "Simulacre", goto: "simulacre" }] },
      { id: "d3c", h: "30 min", t: "<b>Test format 2025</b> ×3 rondes (+0.8/−0.2). Objectiu: ≥ 3.2/4.", links: [{ l: "Test", goto: "test" }] },
      { id: "d3d", h: "60 min", t: "Repàs dels errors apuntats: refés només els exercicis que t'han sortit malament els dies 1 i 2.", links: [{ l: "El teu progrés", goto: "inici" }] },
      { id: "d3e", h: "30 min", t: "Fes 2022 i 2023 (només planteja'ls: domini, derivada i taula de signes) per veure que no et bloqueges.", links: [{ l: "Examen 2023", goto: "examens", exam: "2023" }, { l: "Examen 2022", goto: "examens", exam: "2022" }] },
      { id: "d3f", h: "20 min", t: "Llegeix una vegada Rolle/TVM, optimització i el mètode de Newton (tier C).", links: [{ l: "Teoria", goto: "teoria" }] },
      { id: "d3g", h: "20 min", t: "Abans de dormir, rellegeix: la taula de derivades, Maclaurin, els infinitèsims equivalents i la llista d'errors de sota. Dorm bé.", links: [{ l: "Teoria", goto: "teoria" }] }
    ]
  }
];

const TEMPLATES = [
  {
    t: "Plantilla: «té una única solució a [a,b]»",
    b: "1) Defineix $g(x)=\\text{(esquerra)}-\\text{(dreta)}$ i digues que és contínua a $[a,b]$ (suma/composició de contínues).<br>2) <b>Existència (Bolzano):</b> calcula $g(a)$ i $g(b)$ i mostra que tenen signes oposats ⇒ $\\exists\\,c\\in(a,b)$ amb $g(c)=0$.<br>3) <b>Unicitat:</b> $g'(x)>0$ (o $\\lt0$) a $(a,b)$ ⇒ estrictament monòtona ⇒ com a molt un zero. (Alternativa: si n'hi hagués dos, per Rolle existiria $d$ amb $g'(d)=0$, contradicció.)<br>4) Conclusió: exactament una solució."
  },
  {
    t: "Plantilla: fita de l'error de Taylor",
    b: "1) $R_n(x)=\\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}$, amb $\\xi$ <b>entre $a$ i $x$</b> (digues-ho!).<br>2) Calcula $f^{(n+1)}$ i fita-la per una constant $M$ a l'interval, justificant-ho (és creixent, $|\\sin|\\le1$, $e\\lt3$...).<br>3) $|R_n(x)|\\le\\dfrac{M}{(n+1)!}|x-a|^{n+1}$ i substitueix amb la taula de $\\frac1{n!}$.<br>4) Si et demanen error $\\lt10^{-k}$: prova $n=1,2,3,\\dots$ fins que la fita hi entri."
  },
  {
    t: "Plantilla: estudi complet de funció",
    b: "Domini → talls amb els eixos → asímptotes (AV: on s'anul·la el denominador <i>i no</i> el numerador; AH/AO: límits a $\\pm\\infty$) → $f'$, zeros i <b>taula de signes</b> → extrems → $f''$ i taula → inflexions → gràfica coherent amb tot. Per a extrems absoluts a $[a,b]$: compara $f$ als extrems de l'interval i als punts crítics de dins."
  }
];

const COMMON_ERRORS = [
  "Per $x\\to-\\infty$: $\\sqrt{x^2}=|x|=-x$. Error molt típic en límits amb arrels (Llista 1, 9l).",
  "Fer el canvi $t=e^x$ i oblidar-se de <b>descartar $t\\le0$</b>.",
  "Una AV candidata on el numerador també s'anul·la pot ser un <b>forat</b>, no una asímptota (Recu 2018).",
  "Dir que hi ha extrem perquè $f'=0$ sense comprovar el <b>canvi de signe</b> (p. ex. $x=0$ a $x^3/(x^2-3)$, 2019).",
  "Logaritmes: comprova sempre el <b>domini</b> de les solucions ($x=-2$ a la Llista 0, 12d).",
  "Taylor: no dir on és $\\xi$ o no justificar la cota $M$. És la meitat dels punts de l'apartat.",
  "Taylor de funcions parells/senars: hi ha termes que són 0 (p. ex. $P_7=P_8$ per a $\\sinh$), però també coeficients que <b>se sumen</b> (Llista 5, 2).",
  "Al test del 2025 hi havia una pregunta amb errata: si cap opció quadra, <b>substitueix els punts</b> i, si no en surt cap, deixa-la en blanc.",
  "Estratègia del test: amb +0.8/−0.2 i 5 opcions, contestar a l'atzar dona 0 de mitjana. Si en pots descartar <b>almenys una</b>, contesta."
];
