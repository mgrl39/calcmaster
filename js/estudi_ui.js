/* =====================================================================
   estudi_ui.js — #/estudi: «📐 Estudi de funcions»
   · Xuleta: creixent/decreixent, màxim i mínim relatiu, extrems absoluts, convexa/còncava,
     inflexió, asímptotes, simetria, indeterminacions i L'Hôpital. Per a cada concepte:
     què és, com es troba, la frase que cal escriure a l'examen i l'error típic.
   · ✍️ Explica-ho tu: escrius la resposta i la compares amb el model (punts clau per marcar).
   · Pràctica: estudi complet com el parcial (per apartats) i els 4 tipus de «Conceptes (escriu-ho)».
   ===================================================================== */
(function () {
  'use strict';
  const Calc = window.Calc, U = window.CalcUI;
  if (!Calc || !U || !Calc.estudi) return;
  const { $, $$, esc, app, typeset, renderSide } = U;
  const store = Calc.store, RANKS = Calc.RANKS, E = Calc.estudi;
  const pill = r => `<span class="rk r${r}">${RANKS[r]}</span>`;
  const LS = 'cm_estudi_expl';
  const load = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (e) { return {}; } };
  const save = o => { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) { /* sense emmagatzematge: no passa res */ } };

  /* ---------------- xuleta ---------------- */
  // [id, títol, què és, com es troba, frase d'examen, error típic]
  const SHEET = [
    ['mono', '↗↘ Creixent i decreixent',
      '$f$ és <b>creixent</b> a $I$ si $x_1\\lt x_2\\Rightarrow f(x_1)\\le f(x_2)$ (amb $<$: estrictament creixent). <b>Decreixent</b>: $f(x_1)\\ge f(x_2)$.',
      'Criteri: $f\'>0$ a $I$ ⇒ creixent; $f\'<0$ ⇒ decreixent. Taula de signes de $f\'$ amb els zeros de $f\'$ <b>i els punts fora del domini</b>.',
      '«Com que $f\'(x)>0$ per a tota $x\\in(a,b)$, $f$ és estrictament creixent a $(a,b)$.»',
      'Ajuntar intervals per sobre d\'un punt fora del domini: si $x=1\\notin D$, escriu $(0,1)\\cup(1,\\sqrt3)$, no $(0,\\sqrt3)$.'],
    ['extr', '⛰️ Màxim i mínim relatiu',
      '$c$ és <b>màxim relatiu</b> si hi ha un entorn de $c$ on $f(x)\\le f(c)$. <b>Mínim relatiu</b>: $f(x)\\ge f(c)$. «Relatiu» = només a prop de $c$.',
      '1) <b>Candidats</b>: $f\'(c)=0$ (Fermat: si és extrem i derivable, $f\'(c)=0$) i punts on $f$ no és derivable. 2) <b>Criteri 1a derivada</b>: $f\'$ passa de $+$ a $-$ ⇒ màxim; de $-$ a $+$ ⇒ mínim; no canvia ⇒ no és extrem. 3) O bé <b>criteri 2a derivada</b>: $f\'(c)=0$ i $f\'\'(c)<0$ ⇒ màxim, $f\'\'(c)>0$ ⇒ mínim, $f\'\'(c)=0$ ⇒ no decideix.',
      '«$f\'(c)=0$ i $f\'$ passa de $+$ a $-$ a $x=c$: $f$ té un màxim relatiu a $x=c$, de valor $f(c)=\\dots$»',
      'Pensar que $f\'(c)=0$ ja vol dir extrem. Contraexemple: $x^3$ a $0$ (va sortir al parcial: $\\frac{x^3}{x^2-1}$ a $x=0$).'],
    ['abs', '🏔️ Extrems absoluts',
      'El valor més gran (o més petit) de $f$ en <b>tot</b> el conjunt.',
      'A $[a,b]$ amb $f$ contínua: existeixen (<b>Weierstrass</b>). Calcula $f$ als crítics de dins i a $a$ i $b$, i tria. A $\\mathbb R$ o en un interval obert: mira els <b>límits</b> als extrems.',
      '«$\\lim_{x\\to+\\infty}f(x)=+\\infty$, per tant $f$ no està fitada superiorment i no té màxim absolut.»',
      'Oblidar els extrems de l\'interval $a$ i $b$, o donar la $x$ quan et demanen el valor.'],
    ['curv', '∪∩ Convexa i còncava (convenció del curs)',
      '<b>Convexa = $\\cup$</b> (la gràfica queda per sobre de les tangents). <b>Còncava = $\\cap$</b> (per sota). Així ho fa la llista 3 de la UAB.',
      '$f\'\'>0$ ⇒ convexa $\\cup$; $f\'\'<0$ ⇒ còncava $\\cap$. Taula de signes de $f\'\'$ (amb els zeros de $f\'\'$ i els punts fora del domini).',
      '«$f\'\'(x)>0$ a $(1,+\\infty)$: $f$ és convexa ($\\cup$) a $(1,+\\infty)$.»',
      'Alguns llibres ho diuen al revés: escriu sempre també $\\cup$/$\\cap$ o «$f\'\'>0$», i no hi haurà dubte.'],
    ['infl', '〰️ Punt d\'inflexió',
      'Punt <b>del domini</b>, on $f$ és contínua i <b>canvia la curvatura</b> ($\\cup\\leftrightarrow\\cap$).',
      'Resol $f\'\'(x)=0$; és inflexió si $f\'\'$ <b>canvia de signe</b> i el punt és del domini. ($f\'\'(c)=0$ és necessari però no suficient.)',
      '«$f\'\'$ passa de $-$ a $+$ a $x=0$, i $0\\in D$: $(0,f(0))$ és un punt d\'inflexió.»',
      '$x^4$: $f\'\'(0)=0$ però no és inflexió. $\\frac1x$: canvia la curvatura a $0$ però no és inflexió ($0\\notin D$).'],
    ['asim', '📏 Asímptotes',
      '<b>Vertical</b> $x=a$: $\\lim_{x\\to a^\\pm}f=\\pm\\infty$. <b>Horitzontal</b> $y=L$: $\\lim_{x\\to\\pm\\infty}f=L$. <b>Obliqua</b> $y=mx+n$: $m=\\lim\\frac{f(x)}{x}$, $n=\\lim(f(x)-mx)$.',
      'Verticals: als punts fora del domini (comprova que el límit és infinit). En $P/Q$: grau dalt < baix → $y=0$; iguals → $y=\\frac{a_n}{b_m}$; dalt = baix + 1 → obliqua (fes la divisió).',
      '«$\\lim_{x\\to1^+}f(x)=+\\infty$: $x=1$ és una asímptota vertical.»',
      'Donar una vertical on el límit és finit (un «forat»), o buscar obliqua on ja hi ha horitzontal.'],
    ['sim', '🪞 Simetria',
      '<b>Parell</b>: $f(-x)=f(x)$, simètrica respecte de l\'eix $OY$. <b>Senar</b>: $f(-x)=-f(x)$, respecte de l\'origen.',
      'Substitueix $x$ per $-x$ i simplifica. Si és parell o senar, n\'hi ha prou d\'estudiar $x\\ge0$ i reflectir.',
      '«$f(-x)=\\frac{(-x)^3}{(-x)^2-1}=-f(x)$: $f$ és senar.»',
      'Dir que no té simetria sense provar-ho: dona un contraexemple, p. ex. $f(1)\\neq\\pm f(-1)$.'],
    ['indet', '∞/∞ Indeterminacions i L\'Hôpital',
      'Les <b>7</b>: $\\frac00,\\ \\frac\\infty\\infty,\\ 0\\cdot\\infty,\\ \\infty-\\infty,\\ 1^\\infty,\\ 0^0,\\ \\infty^0$. <b>No</b> ho són: $\\frac k0=\\pm\\infty$, $\\frac0\\infty=0$, $\\infty+\\infty$, $\\infty\\cdot\\infty$, $0^\\infty=0$.',
      'L\'Hôpital, només amb $\\frac00$ o $\\frac\\infty\\infty$: $\\lim\\frac fg=\\lim\\frac{f\'}{g\'}$. $0\\cdot\\infty$ → quocient $\\frac{f}{1/g}$. $\\infty-\\infty$ → denominador comú o conjugat. $1^\\infty,0^0,\\infty^0$ → $f^g=e^{g\\ln f}$.',
      '«És una indeterminació $\\frac00$; aplicant L\'Hôpital, $\\lim\\frac{f}{g}=\\lim\\frac{f\'}{g\'}=\\dots$»',
      'Derivar el quocient $\\left(\\frac fg\\right)\'$ en lloc de $\\frac{f\'}{g\'}$, o aplicar L\'Hôpital a $\\frac10$.'],
  ];
  const PLAN = [
    ['(a)', 'Domini, simetria i asímptotes', 'On s\'anul·la el denominador · $f(-x)$ · límits als punts fora del domini i a $\\pm\\infty$'],
    ['(b)', 'Creixement i extrems relatius', '$f\'$, zeros i punts fora del domini → taula de signes de $f\'$ → màxims (+ a −) i mínims (− a +)'],
    ['(c)', 'Convexitat, concavitat i inflexió', '$f\'\'$ → taula de signes de $f\'\'$ → inflexió on canvia el signe i és del domini'],
    ['(d)', 'Gràfica', 'Asímptotes (discontínues) → punts d\'extrem i d\'inflexió → uneix seguint les taules'],
  ];

  /* ---------------- ✍️ explica-ho tu ---------------- */
  const EXPL = [
    { id: 'min', q: 'Explica com trobaries els <b>mínims relatius</b> d\'una funció $f$ i com justificaries que un punt ho és.',
      model: 'Calculo $f\'$ i el domini. Els candidats són els punts on $f\'(x)=0$ i on $f$ no és derivable. Faig la taula de signes de $f\'$ (hi poso també els punts fora del domini). A $x=c$ hi ha un mínim relatiu si $f\'$ passa de $-$ a $+$ (o si $f\'(c)=0$ i $f\'\'(c)>0$). El valor del mínim és $f(c)$.',
      keys: ['Calcular $f\'$', 'Candidats: $f\'(x)=0$ (i on no és derivable)', 'Taula de signes de $f\'$', 'Mínim: $f\'$ passa de $-$ a $+$ (o $f\'\'(c)>0$)', 'Donar el valor $f(c)$'] },
    { id: 'infl', q: 'Què és un <b>punt d\'inflexió</b> i com es troba? Per què $f\'\'(c)=0$ no n\'hi ha prou?',
      model: 'És un punt del domini on $f$ és contínua i canvia la curvatura (de convexa $\\cup$ a còncava $\\cap$ o al revés). Es resol $f\'\'(x)=0$ i es fa la taula de signes de $f\'\'$: és inflexió si $f\'\'$ canvia de signe i el punt és del domini. No n\'hi ha prou amb $f\'\'(c)=0$: $x^4$ té $f\'\'(0)=0$ però és convexa a tot arreu.',
      keys: ['Del domini i $f$ contínua', 'Canvia la curvatura ($\\cup\\leftrightarrow\\cap$)', 'Resoldre $f\'\'=0$ i taula de signes', '$f\'\'$ ha de canviar de signe', 'Contraexemple ($x^4$)'] },
    { id: 'curv', q: 'Què vol dir que $f$ és <b>convexa</b> en un interval i com ho comproves?',
      model: 'Convexa (forma $\\cup$, convenció del curs) vol dir que la gràfica queda per sobre de les rectes tangents. Si $f\'\'(x)>0$ a tot l\'interval, $f$ és convexa. Si $f\'\'<0$, és còncava ($\\cap$).',
      keys: ['Forma $\\cup$', 'Per sobre de les tangents', '$f\'\'>0$ ⇒ convexa', 'Còncava: $f\'\'<0$, forma $\\cap$'] },
    { id: 'lhop', q: 'Quan es pot aplicar la regla de <b>L\'Hôpital</b> i què diu? Què fas amb $0\\cdot\\infty$?',
      model: 'Només quan el límit és una indeterminació $\\frac00$ o $\\frac\\infty\\infty$. Diu que $\\lim\\frac{f}{g}=\\lim\\frac{f\'}{g\'}$ si aquest darrer límit existeix (es deriven numerador i denominador per separat). Amb $0\\cdot\\infty$, primer s\'escriu com a quocient: $f\\cdot g=\\frac{f}{1/g}$.',
      keys: ['Només $\\frac00$ o $\\frac\\infty\\infty$', '$\\lim\\frac fg=\\lim\\frac{f\'}{g\'}$', 'Derivar per separat (no el quocient)', '$0\\cdot\\infty$ → quocient'] },
    { id: 'abs', q: 'Explica per què $f(x)=x^3-x$ <b>no té</b> màxim ni mínim absoluts a $\\mathbb R$.',
      model: '$\\lim_{x\\to+\\infty}(x^3-x)=+\\infty$ i $\\lim_{x\\to-\\infty}(x^3-x)=-\\infty$. Per tant, $f$ pren valors tan grans i tan petits com vulguem: per a qualsevol valor $f(c)$ n\'hi ha un de més gran i un de més petit. Els extrems relatius ($\\pm\\frac{\\sqrt3}{3}$) no són absoluts.',
      keys: ['Límit a $+\\infty$ és $+\\infty$', 'Límit a $-\\infty$ és $-\\infty$', 'No està fitada', 'Els relatius no són absoluts'] },
  ];

  /* ---------------- pràctica ---------------- */
  const CONC = [['extrem', 'l3.concepts_extrem'], ['curv', 'l3.concepts_curv'], ['indet', 'l4.concepts_indet'], ['estudi', 'l4.concepts_estudi']];
  const partSeed = (T, part) => { const s0 = Math.floor(Math.random() * 1e6); for (let i = 0; i < 3000; i++) { const p = Calc.make(T, s0 + i); if (p.sub === 'estudi.full' && p.part === part) return s0 + i; } return s0; };
  function practice(what) {
    const host = $('#esp'); if (!host) return;
    if (E.PARTS[what]) { const T = Calc.srcGen('estudi.full'); if (T) U.mountPractice(host, { gens: [T], seedFor: t => partSeed(t, what), activeId: 'estudi' }); return; }
    const c = CONC.find(x => x[0] === what); const g = c && Calc.genByKey(c[1]);
    if (g) U.mountPractice(host, { gens: [g], activeId: 'estudi' });
  }

  function page(m, h) {
    renderSide('estudi');
    const what = (h.match(/^#\/estudi\/p\/(\w+)/) || [])[1];
    const sd = Calc.srcData('estudi.full'), rFull = sd ? sd.best || 0 : 0;
    const gR = key => store.rank(key), gT = key => { const g = Calc.genByKey(key); return g ? g.title.replace(/^Conceptes: /, '').replace(/ \(escriu-ho\)$/, '') : key; };
    const ex = load();
    const practiceBlock = `<div class="card" id="espc"><h2 style="margin-top:0">🎯 Practica</h2>
      <div class="grid cols2">
        <div><b>Estudi complet (com el parcial)</b> ${pill(rFull)}<div class="muted small">5 famílies de funcions, entre elles la del parcial ($\\frac{x^3}{x^2-1}$). Respostes amb punts i intervals; la solució porta les taules de signes.</div>
          <div class="row" style="margin-top:6px">${Object.keys(E.PARTS).map(k => `<a class="btn sm ${what === k ? 'primary' : ''}" href="#/estudi/p/${k}">${({ a: '(a) Asímptotes', b: '(b) Extrems', c: '(c) Curvatura', full: 'Complet' })[k]}</a>`).join('')}</div></div>
        <div><b>Conceptes (escriu-ho)</b><div class="muted small">Completes definicions i criteris amb la paraula o el símbol just. S'accepten sinònims; no compten els accents.</div>
          ${CONC.map(([k, key]) => `<div class="row small" style="margin-top:4px"><a class="btn sm ${what === k ? 'primary' : ''}" href="#/estudi/p/${k}">${esc(gT(key))}</a><span class="spacer"></span>${pill(gR(key))}</div>`).join('')}</div>
      </div>
      ${what ? `<div class="row small" style="margin-top:10px"><a href="#/estudi">← Tornar a la xuleta</a><span class="spacer"></span><b>${esc(E.PARTS[what] || gT((CONC.find(x => x[0] === what) || [])[1] || ''))}</b></div><div id="esp"></div>` : ''}
    </div>`;
    app.innerHTML = `<div class="crumbs small muted"><a href="#/">Inici</a> › <a href="#/temari">Temari</a> › Estudi de funcions</div>
      <h1 style="margin-bottom:4px">📐 Estudi de funcions</h1>
      <p class="lead" style="margin-top:0">Al parcial va valer <b>3 punts</b> i surt al seminari. Aquí tens la xuleta (què és cada cosa, com es troba i <b>què cal escriure</b>), exercicis per escriure-ho tu i l'estudi complet per apartats.</p>
      ${what ? practiceBlock : ''}
      <div class="card"><h2 style="margin-top:0">🗺️ Pla de l'estudi (com al parcial)</h2><ol class="esplan">${PLAN.map(([n, t, d]) => `<li><b>${n} ${t}</b><div class="small muted">${d}</div></li>`).join('')}</ol></div>
      <h2>📋 Xuleta</h2>
      <div class="grid cols2 essheet">${SHEET.map(([id, t, what1, how, write, err]) => `<div class="card" id="x-${id}"><h3 style="margin-top:0">${t}</h3>
        <div class="small"><b>Què és.</b> ${what1}</div><div class="small" style="margin-top:6px"><b>Com es troba.</b> ${how}</div>
        <div class="small eswrite"><b>✍️ A l'examen escriu:</b> ${write}</div><div class="small eserr"><b>⚠️ Error típic:</b> ${err}</div></div>`).join('')}</div>
      <h2>✍️ Explica-ho tu</h2>
      <p class="muted small">Escriu la resposta com si fos a l'examen i després compara-la amb el model. Marca els punts clau que hi has posat. (El que escrius es guarda només en aquest navegador.)</p>
      <div class="grid cols2">${EXPL.map(e => `<div class="card esexp" data-id="${e.id}"><div class="small">${e.q}</div>
        <textarea class="estxt" rows="4" placeholder="Escriu aquí la teva explicació…">${esc((ex[e.id] && ex[e.id].t) || '')}</textarea>
        <div class="row"><button class="btn sm primary" data-cmp>Compara amb el model</button><span class="spacer"></span><span class="small muted" data-score>${ex[e.id] && ex[e.id].k ? Object.values(ex[e.id].k).filter(Boolean).length + '/' + e.keys.length + ' punts clau' : ''}</span></div>
        <div class="esmodel" hidden><div class="small"><b>Model:</b> ${e.model}</div><div class="small" style="margin-top:6px"><b>Punts clau que hi has posat:</b></div>
          ${e.keys.map((k, i) => `<label class="small eskey"><input type="checkbox" data-k="${i}" ${ex[e.id] && ex[e.id].k && ex[e.id].k[i] ? 'checked' : ''}> ${k}</label>`).join('')}</div></div>`).join('')}</div>
      ${what ? '' : practiceBlock}`;
    typeset(app);
    $$('.esexp', app).forEach(card => {
      const id = card.dataset.id, e = EXPL.find(x => x.id === id), ta = $('.estxt', card), md = $('.esmodel', card), sc = $('[data-score]', card);
      const st = () => { const o = load(); o[id] = o[id] || { t: '', k: {} }; return o; };
      ta.addEventListener('input', () => { const o = st(); o[id].t = ta.value; save(o); });
      $('[data-cmp]', card).onclick = () => { md.hidden = false; if (!ta.value.trim()) ta.placeholder = 'Prova d\'escriure-ho primer: recordar-ho tu és el que fa que es quedi.'; };
      $$('input[data-k]', card).forEach(cb => cb.onchange = () => { const o = st(); o[id].k[cb.dataset.k] = cb.checked; save(o); const n = Object.values(o[id].k).filter(Boolean).length; sc.textContent = n + '/' + e.keys.length + ' punts clau' + (n === e.keys.length ? ' ✓' : ''); });
    });
    if (what) practice(what);
  }
  Calc.routes.push({ re: /^#\/estudi/, fn: page });

  // targeta a L3 i L4 (resum) que porta a la xuleta
  const prevApps = Calc.appsResum;
  Calc.appsResum = function (mid) {
    const base = prevApps ? prevApps(mid) : '';
    if (mid !== 'l3' && mid !== 'l4') return base;
    return `<a class="card s3rapcta" href="#/estudi" style="margin-top:12px"><b>📐 Estudi de funcions: xuleta i conceptes</b><span class="muted small"> — màxim/mínim relatiu, convexa/còncava, inflexió, asímptotes, indeterminacions. Què cal escriure a l'examen i exercicis per escriure-ho tu.</span></a>` + base;
  };
  Calc.ESTUDI_HREF = '#/estudi';
  if (/^#\/estudi/.test(location.hash)) U.route();
})();
