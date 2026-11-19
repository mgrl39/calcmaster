/* =====================================================================
   arbres.js — Arbres d'habilitats (#/arbres, #/arbre/<id>[/<node>])
   Com l'arbre de l'app de derivades: el tema dividit en peces petites amb
   fletxes «cal saber això abans», i de cada peça, si la domines.
   · NO és una mestria a part: cada node és un tros d'un o més tipus d'exercici
     de les llistes (src = d'on surt l'exercici). Practicar un node entrena el
     tipus d'exercici de la llista (mateix rang, XP i repàs), i el node mostra
     la sub-mestria d'aquell tros (merge.js porta el compte per font).
   · 4 arbres: Derivades (L2), Límits i L'Hôpital (L1+L4), Extrems i estudi (L3),
     Integrar (L7–L9).
   ===================================================================== */
(function () {
  'use strict';
  const U = CalcUI, { $, esc, app, typeset } = U, store = Calc.store;
  const DX = (typeof window !== 'undefined' ? window : globalThis).DXLIB;
  const n = (id, t, req, srcs, o) => Object.assign({ id, t, req: req || [], srcs }, o || {});

  /* ---------------- 1. Derivades: l'arbre de Càlcul dx (36 nodes) + el seminari + L2 ---------------- */
  const DER_EXTRA = {
    D_pow: ['sem3.d_pow'], D_poly: ['l2.d_poly', 'l2.p1_derivBasic', 'l2.d100_0'], D_elem: ['base.dertable', 'sem3.d_elem'],
    D_prod: ['l2.d_product', 'sem3.d_prod'], D_quot: ['l2.d_quotient', 'sem3.d_quot', 'l2.d100_1'], D_pq: ['l2.p1_derivProdQuot'],
    D_ch1: ['l2.d_chain', 'sem3.c_one', 'l2.p1_derivChain'], D_chsinn: ['sem3.c_powtrig'], D_ch2: ['sem3.c_multi'],
    D_chexp: ['l2.d100_2'], D_chroot: ['l2.d100_3'], D_chln: ['l2.d100_4'], D_charc: ['l2.d100_5'],
    D_mix: ['l2.d_mixed', 'sem3.c_mixed', 'l2.p1_derivative'], D_big: ['l2.d100_6', 'l2.d100'],
    D_logd: ['l2.d_logdiff', 'l2.p1_logDerivative'], D_impl: ['l2.d_implicit', 'l2.p1_implicitDerivative'],
    D_ordre: ['l2.d_second'], D_tang: ['l1.tangent', 'l1.p1_tangent', 'l1.tangent_ext'], D_hip: ['der.x_arghip'],
  };
  const derNodes = (DX ? DX.DNODES : []).map(d => n(d.id, d.n, d.req.slice(), ['der.' + d.id.replace(/^D_/, '').toLowerCase()].concat(DER_EXTRA[d.id] || []), { icon: d.icon, r: d.r, i: d.i, g: d.g }));
  if (derNodes.length) {
    derNodes.push(n('D_layers', 'Identificar les capes', ['D_elem'], ['sem3.c_layers'], { icon: '🧅', g: 3, i: 'Abans de derivar una composició, digues quines capes té, de fora cap a dins.' }));
    derNodes.find(x => x.id === 'D_ch1').req.push('D_layers');
    derNodes.push(n('D_val', 'Derivada en un punt', ['D_mix'], ['sem3.d_val'], { icon: "f'(a)", g: 4 }));
    derNodes.push(n('D_def', 'Derivada per definició', ['D_poly'], ['sem3.l_defder', 'der.x_lim'], { icon: 'lim', g: 4, r: "f'(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}{h}" }));
    derNodes.push(n('D_class', 'Contínua, derivable, C¹', ['D_def'], ['sem3.l_class'], { icon: 'C¹', g: 4 }));
    derNodes.push(n('D_inv', 'Derivada de la inversa', ['D_arc'], ['der.x_inv'], { icon: 'f⁻¹', g: 4 }));
    derNodes.push(n('D_related', 'Raons de canvi', ['D_impl'], ['l2.d_related', 'l2.related_more'], { icon: 'dV/dt', g: 4 }));
    derNodes.push(n('D_rolle', 'Rolle, TVM i nombre d\'arrels', ['D_mix'], ['l2.tvm', 'l2.p1_rolleTvm', 'l2.roots_count'], { icon: 'TVM', g: 4 }));
    derNodes.push(n('D_param', 'Corbes paramètriques', ['D_impl'], ['der.x_param'], { icon: 'dy/dx', g: 4 }));
  }

  /* ---------------- 2. Límits, L'Hôpital i asímptotes ---------------- */
  const limNodes = [
    n('l_sub', 'Substitució directa', [], ['sem3.l_sub', 'l1.p1_limitDirect', 'l1.p1_limit'], { icon: 'f(a)' }),
    n('l_factor', '0/0 factoritzant', ['l_sub'], ['l1.limit_factor', 'l1.p1_limitFactor'], { icon: '0/0' }),
    n('l_lat', 'Límits laterals', ['l_sub'], ['l1.limit_lateral'], { icon: 'a±' }),
    n('l_cont', 'Continuïtat amb paràmetre', ['l_lat'], ['l1.cont_param', 'l1.cont_two', 'l1.p1_continuity'], { icon: 'k' }),
    n('l_bolz', 'Bolzano', ['l_cont'], ['l1.bolzano_mc', 'l1.bolzano_vals', 'l1.p1_bolzano'], { icon: '±→0' }),
    n('l_bounded', 'Zero per acotada', ['l_sub'], ['sem3.l_bounded'], { icon: '0·acot' }),
    n('l_osc', 'Quan no existeix (sin 1/x)', ['l_bounded'], ['sem3.l_osc'], { icon: '∄' }),
    n('r_deg', 'Graus a +∞', ['l_sub'], ['sem3.r_deg', 'l1.limit_inf'], { icon: '∞/∞' }),
    n('r_neg', 'Cap a −∞', ['r_deg'], ['sem3.r_neg'], { icon: '−∞' }),
    n('r_general', 'Quocients: cas general', ['r_neg'], ['sem3.r_general', 'sem3.x_limits'], { icon: 'P/Q' }),
    n('r_root', 'Arrels a l\'infinit', ['r_deg'], ['l1.limit_inf_root'], { icon: '√' }),
    n('h_form', 'Quin tipus d\'indeterminació és?', ['l_factor'], ['sem3.h_form'], { icon: '?' }),
    n('h_step', 'Aplicar la regla (un pas)', ['h_form'], ['sem3.h_step'], { icon: "f'/g'", r: "\\lim\\frac fg=\\lim\\frac{f'}{g'}" }),
    n('h_00', 'L\'Hôpital 0/0', ['h_step'], ['sem3.h_00', 'l4.lhop_00', 'der.x_hop'], { icon: '0/0' }),
    n('h_twice', 'Aplicar-la diversos cops', ['h_00'], ['sem3.h_twice'], { icon: '×2' }),
    n('h_inf', '∞/∞ i jerarquia', ['h_00'], ['sem3.h_inf', 'l4.lhop_inf'], { icon: '∞/∞', r: '\\ln x\\ll x^a\\ll e^x' }),
    n('h_prod', '0·∞', ['h_inf'], ['sem3.h_prod', 'l4.lhop_0inf'], { icon: '0·∞', r: '0\\cdot\\infty=\\frac{0}{1/\\infty}' }),
    n('h_diff', '∞−∞', ['h_twice'], ['sem3.h_diff', 'l4.lhop_diff'], { icon: '∞−∞' }),
    n('h_exp', '1^∞, 0⁰, ∞⁰', ['h_prod'], ['sem3.h_exp', 'l4.lhop_pow', 'l4.p1_powLimit'], { icon: '1^∞', r: 'f^g=e^{g\\ln f}' }),
    n('h_param', 'L\'Hôpital amb paràmetre', ['h_00'], ['l4.lhop_param'], { icon: 'a?' }),
    n('a_vert', 'Asímptotes verticals', ['l_lat'], ['l4.asymp_vert'], { icon: 'x=a' }),
    n('a_horiz', 'Asímptotes horitzontals', ['r_deg'], ['l4.asymp_horiz'], { icon: 'y=b' }),
    n('a_obl', 'Asímptotes obliqües', ['a_horiz'], ['l4.asymp_oblique', 'l4.p1_asymptote'], { icon: 'y=mx+n' }),
    n('a_exp', 'Asímptotes amb e^x i ln', ['h_inf', 'a_horiz'], ['l4.asymp_exp'], { icon: 'eˣ' }),
  ];

  /* ---------------- 3. Extrems i estudi de funcions ---------------- */
  const extNodes = [
    n('e_roots', 'Resoldre equacions', [], ['sem3.e_roots', 'base.quad'], { icon: '=0' }),
    n('e_sign', 'Taula de signes', ['e_roots'], ['sem3.e_sign', 'base.ineq'], { icon: '+−' }),
    n('x_crit', 'Punts crítics', ['e_roots'], ['sem3.x_crit', 'l3.crit_cubic', 'der.x_mono'], { icon: "f'=0" }),
    n('x_mono', 'Creixement', ['x_crit', 'e_sign'], ['sem3.x_mono', 'l3.monotony', 'l3.p1_polyGrowth'], { icon: '↗↘' }),
    n('x_rat', 'Extrems de racionals', ['x_mono'], ['l3.crit_rational'], { icon: 'P/Q' }),
    n('x_exp', 'Extrems amb e^x i ln', ['x_mono'], ['l3.crit_exp'], { icon: 'eˣ' }),
    n('x_first', 'Criteri de la 1a derivada', ['x_mono'], ['sem3.x_first'], { icon: "f'" }),
    n('x_second', 'Criteri de la 2a derivada', ['x_crit'], ['sem3.x_second'], { icon: "f''" }),
    n('x_value', 'Valor de l\'extrem', ['x_first'], ['sem3.x_value'], { icon: 'f(c)' }),
    n('x_infl', 'Concavitat i inflexió', ['x_second'], ['sem3.x_infl', 'l3.inflection', 'der.x_curv'], { icon: '∪∩' }),
    n('x_abs', 'Extrems absoluts en [a,b]', ['x_value'], ['sem3.x_abs', 'l3.abs_extrema', 'l3.p1_absExtrema'], { icon: '[a,b]' }),
    n('x_opt', 'Optimització', ['x_abs'], ['l3.optim_basic', 'l3.optim_box', 'l3.optim_page', 'l3.optim_dist'], { icon: '📦' }),
    n('x_study', 'Estudi complet', ['x_infl', 'x_mono'], ['l4.p1_functionStudy'], { icon: '📈' }),
  ];

  /* ---------------- 4. Integrar (2n parcial) ---------------- */
  const intNodes = [
    n('i_pot', 'Potències i polinomis', [], ['int.ipot', 'l7.split', 'l7.linear'], { icon: '∫xⁿ', r: '\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C' }),
    n('i_check', 'Comprova derivant', ['i_pot'], ['l7.comprova'], { icon: '✓' }),
    n('i_exp', 'Exponencials, 1/x i trig.', ['i_pot'], ['int.iexp', 'base.inttable'], { icon: '∫eˣ' }),
    n('i_arc', 'Arcs: arctan, arcsin', ['i_exp'], ['int.iarc'], { icon: 'arc' }),
    n('i_subst', 'Canvi de variable (f\'/f, f\'·fⁿ)', ['i_exp'], ['int.flog', 'int.fpot', 'l7.subst'], { icon: '∘', r: "\\int\\frac{f'}{f}=\\ln|f|" }),
    n('i_cv', 'Canvi de variable general', ['i_subst'], ['int.cv', 'int.sqlin', 'int.mirall'], { icon: 'u=…' }),
    n('i_parts', 'Per parts', ['i_subst'], ['int.ppexp', 'int.pptrig', 'l7.parts'], { icon: 'u·dv', r: '\\int u\\,dv=uv-\\int v\\,du' }),
    n('i_plog', 'Parts amb ln i arcs', ['i_parts'], ['int.pplog', 'int.pprei', 'l7.parts_log'], { icon: 'ln' }),
    n('i_pcyc', 'Parts cíclica', ['i_parts'], ['int.ppcic', 'l7.parts_cyc'], { icon: '🔄' }),
    n('i_trig', 'Integrals trigonomètriques', ['i_cv'], ['int.tsen', 'int.tpar', 'int.ttan', 'int.tprod', 'l7.trigint'], { icon: 'sinⁿ' }),
    n('i_weier', 'Canvi tan(x/2)', ['i_trig'], ['int.tweier'], { icon: 't' }),
    n('i_trigsub', 'Arrels: x = a·sin t …', ['i_trig', 'i_arc'], ['int.sqa2mx2', 'int.sqa2px2', 'int.sqx2ma2', 'l7.trigsub'], { icon: '√' }),
    n('r_sim', 'Racionals: arrels simples', ['i_subst'], ['int.rsim', 'l8.int_simple', 'l8.coef2'], { icon: 'A/(x−a)' }),
    n('r_mul', 'Arrels múltiples', ['r_sim'], ['int.rmul', 'l8.int_repeated', 'l8.coef3'], { icon: '(x−a)²' }),
    n('r_quad', 'Factor x²+bx+c irreductible', ['r_sim', 'i_arc'], ['int.rquad', 'l8.int_mixed', 'l8.int_arctan'], { icon: 'arctan' }),
    n('r_div', 'Grau ≥: dividir primer', ['r_sim'], ['int.rdiv', 'l8.int_improper', 'l8.polydiv'], { icon: '÷' }),
    n('r_big', 'Racionals llargues', ['r_mul', 'r_quad'], ['l8.int_cubic', 'l8.int_dbl_simple'], { icon: '★' }),
    n('i_method', 'Quin mètode?', ['i_parts', 'i_trig', 'r_sim'], ['l7.metode_int'], { icon: '🧭' }),
    n('d_barrow', 'Integral definida (Barrow)', ['i_subst'], ['int.barrow', 'int.cvdef', 'l9.defint', 'l9.signed_area'], { icon: '∫ₐᵇ', r: '\\int_a^b f=F(b)-F(a)' }),
    n('d_sym', 'Simetria i valor mitjà', ['d_barrow'], ['int.simet', 'l9.mean'], { icon: '⇋' }),
    n('d_tfc', 'Teorema fonamental', ['d_barrow'], ['int.tfc', 'l9.leibniz', 'l9.ftc_value', 'l9.ftc_crit', 'l9.leibniz_adv', 'l9.ftc_concav'], { icon: 'F\'', r: "\\Big(\\int_a^{g(x)}f\\Big)'=f(g(x))\\,g'(x)" }),
    n('d_area', 'Àrees', ['d_barrow'], ['int.arees', 'l9.area_between', 'l9.area_axis', 'l9.area_parts', 'l9.area_param'], { icon: '▨' }),
    n('d_vol', 'Volums de revolució', ['d_area'], ['l9.volume', 'l9.volume_adv', 'l9.volume_washer', 'l9.volume_shell'], { icon: '🏺' }),
    n('d_len', 'Longitud i superfície', ['d_area'], ['l9.arclen', 'l9.surface'], { icon: '〰' }),
    n('d_imp', 'Integrals impròpies', ['d_barrow', 'r_sim'], ['int.imp1', 'int.imp2', 'int.impcrit', 'l9.improper'], { icon: '∫^∞' }),
    n('d_num', 'Mètodes numèrics', ['d_barrow'], ['l9.riemann', 'l9.trapez', 'l9.simpson'], { icon: '≈' }),
  ];

  const TREES = [
    { id: 'der', icon: '📐', t: 'Derivades', par: '1r parcial', mods: ['l2', 'base'], theory: 'l2', q: 'De xⁿ a les derivades llargues d\'examen, peça a peça.', nodes: derNodes, groups: ['Bàsiques', 'Elementals', 'Prod./quoc.', 'Cadena', 'Aplicacions'] },
    { id: 'lim', icon: '🎯', t: 'Límits, L\'Hôpital i asímptotes', par: '1r parcial · Seminari 3', mods: ['l1', 'l4'], theory: 'l4', q: 'Saber quin tipus d\'indeterminació és (0/0, ∞/∞, 1^∞…) i com es desfà.', nodes: limNodes },
    { id: 'ext', icon: '⛰️', t: 'Extrems i estudi de funcions', par: '1r parcial · Seminari 3', mods: ['l3'], theory: 'l3', q: 'Punts crítics, signes de f\', criteris, absoluts i optimització.', nodes: extNodes },
    { id: 'int', icon: '∫', t: 'Integrar', par: '2n parcial', mods: ['l7', 'l8', 'l9'], theory: 'l7', q: 'Una tècnica per node: immediates, canvi, parts, trigonomètriques, racionals, definida.', nodes: intNodes },
  ];
  // només les fonts que existeixen (si en falta alguna, el node no peta)
  TREES.forEach(T => { T.nodes.forEach(x => { x.srcs = x.srcs.filter(s => Calc.srcGen && Calc.srcGen(s)); }); T.nodes = T.nodes.filter(x => x.srcs.length); const ids = new Set(T.nodes.map(x => x.id)); T.nodes.forEach(x => { x.req = x.req.filter(r => ids.has(r)); }); T.byId = {}; T.nodes.forEach(x => { T.byId[x.id] = x; }); });
  const TBY = {}; TREES.forEach(T => { TBY[T.id] = T; });

  /* ---------------- mestria d'un node ---------------- */
  const V = Calc.RANK_VAL;
  function nodeStats(x) {
    const ds = x.srcs.map(s => Calc.srcData(s)).filter(Boolean);
    if (!ds.length) return { att: 0, rank: 0, val: 0, acc: null, st: 0 };
    // totes les fonts d'un node són la mateixa peça: es compten juntes, amb les regles de rang de sempre
    const pool = { att: 0, ok: 0, pts: 0, days: 0, revs: 0, hist: [], floor: 0 };
    ds.forEach(g => { pool.att += g.att || 0; pool.ok += g.ok || 0; pool.pts += g.pts || 0; pool.days = Math.max(pool.days, g.days || 0); pool.revs += g.revs || 0; pool.hist = pool.hist.concat(g.hist || []); pool.floor = Math.max(pool.floor, g.floor || 0); });
    const rank = Math.max(Calc.rankOfG(pool), ...ds.map(g => g.best || 0));
    const h = pool.hist.slice(-12); const acc = h.length ? h.reduce((a, b) => a + b, 0) / h.length : null;
    const val = pool.att || rank ? V[rank] : 0;
    return { att: pool.att, rank, val, acc, st: Calc.graph.statusOf(pool.att, val, acc), pool };
  }
  function treeStats(T) {
    const ss = T.nodes.map(nodeStats);
    return { n: ss.length, dom: ss.filter(s => s.rank >= 5).length, tried: ss.filter(s => s.att).length, pct: ss.reduce((a, s) => a + s.val, 0) / Math.max(1, ss.length) };
  }
  Calc.TREES = TREES; Calc.treeStats = id => treeStats(TBY[id]); Calc.nodeStats = (tid, nid) => nodeStats(TBY[tid].byId[nid]);

  /* ---------------- pàgines ---------------- */
  const pill = r => `<span class="rk r${r}">${Calc.RANKS[r]}</span>`;
  const pct = v => Math.round(v * 100);

  function indexPage() {
    U.renderSide('arbres');
    const card = T => { const s = treeStats(T); return `<a class="card tcard" href="#/arbre/${T.id}"><div class="row"><b>${T.icon} ${esc(T.t)}</b><span class="spacer"></span><span class="tpct" style="font-size:1.3rem">${pct(s.pct)}%</span></div><div class="chip">${esc(T.par)}</div><div class="tq">${esc(T.q)}</div><div class="small muted">${s.dom}/${s.n} peces dominades · ${s.tried} començades</div><div class="bar"><i style="width:${pct(s.pct)}%"></i></div></a>`; };
    app.innerHTML = `<h1>🌳 Arbres d'habilitats</h1>
      <p class="lead">Cada tema partit en peces petites, amb fletxes «cal saber això abans». Cada peça és un tros dels tipus d'exercici de les llistes: el que practiques aquí puja el rang de la llista, i el que fas a la llista (o al seminari) es veu aquí.</p>
      <h2>1r parcial</h2><div class="grid cols3">${TREES.filter(T => /^1r/.test(T.par)).map(card).join('')}</div>
      <h2>2n parcial</h2><div class="grid cols3">${TREES.filter(T => /^2n/.test(T.par)).map(card).join('')}</div>`;
  }

  function treePage(tid, nid) {
    const T = TBY[tid]; if (!T) return indexPage();
    U.renderSide('arbres');
    const s = treeStats(T);
    app.innerHTML = `<div class="crumbs small muted"><a href="#/arbres">Arbres d'habilitats</a> › ${esc(T.t)}</div>
      <div class="row" style="align-items:baseline"><h1 style="margin:0">${T.icon} ${esc(T.t)}</h1><span class="chip">${esc(T.par)}</span><span class="spacer"></span><a class="btn sm" href="#/mod/${T.theory}/theory">📖 Teoria</a></div>
      <p class="muted">${esc(T.q)} Clica una peça per veure-la i practicar-la. Compta per a: ${T.mods.map(m => Calc.byId[m] ? `<a href="#/mod/${m}/resum">${esc(Calc.byId[m].llista.replace(' + Seminari', ''))}</a>` : '').filter(Boolean).join(', ')}.</p>
      <div class="mapbar"><div class="maplegend">${Calc.graph.STATUS.map((x, i) => `<span><i class="lg s${i}"></i>${x}</span>`).join('')}</div>
        <div class="mapprog"><b>${s.dom}/${s.n}</b> peces dominades<div class="bar"><i style="width:${pct(s.pct)}%"></i></div></div></div>
      <div class="graphwrap" id="tgraph"></div>
      <div id="tnode"></div>`;
    drawTree(T);
    if (nid && T.byId[nid]) showNode(T, nid);
  }
  function drawTree(T) {
    const host = $('#tgraph'); if (!host) return;
    const deps = id => T.byId[id].req;
    const depth = {}, dep = id => depth[id] != null ? depth[id] : (depth[id] = deps(id).reduce((a, p) => Math.max(a, dep(p) + 1), 0));
    T.nodes.forEach(x => dep(x.id));
    const maxD = Math.max(...Object.values(depth)), rows = [];
    let lastG = null;
    for (let k = 0; k <= maxD; k++) {
      const ids = T.nodes.filter(x => depth[x.id] === k).map(x => x.id); if (!ids.length) continue;
      const g = T.groups && T.groups.length ? T.byId[ids[0]].g : null;
      rows.push({ label: g != null && g !== lastG ? String(T.groups[g] || '') : '', ids }); lastG = g;
    }
    Calc.graph.drawGraph(host, rows, id => { const x = T.byId[id], st = nodeStats(x); return { title: (x.icon && !x.t.includes(x.icon) ? x.icon + ' · ' : '') + x.t, val: st.val, st: st.st, tip: `${x.t} — ${Calc.graph.STATUS[st.st]} (${pct(st.val)}%)` }; }, deps,
      id => { history.replaceState(null, '', '#/arbre/' + T.id + '/' + id); showNode(T, id); }, { w: 170, lw: 70, per: 5, chars: 20 });
  }
  function showNode(T, id) {
    const x = T.byId[id], st = nodeStats(x), box = $('#tnode'); if (!box) return;
    const gens = []; x.srcs.forEach(s => { const g = Calc.srcGen(s); if (g && !gens.includes(g)) gens.push(g); });
    const after = T.nodes.filter(y => y.req.includes(id));
    const link = y => `<a href="#/arbre/${T.id}/${y.id}" data-n="${y.id}">${esc(y.t)}</a>`;
    box.innerHTML = `<div class="card" id="tnodecard"><div class="row"><h2 style="margin:0">${x.icon ? esc(x.icon) + ' · ' : ''}${esc(x.t)}</h2>${pill(st.rank)}<span class="spacer"></span><span class="muted small">${st.att} intents${st.acc != null ? ' · encert recent ' + pct(st.acc) + '%' : ''}</span></div>
      ${x.r ? `<div class="formula">$$${x.r}$$</div>` : ''}${x.i ? `<p>${x.i}</p>` : ''}
      <p class="small">${x.req.length ? 'Abans: ' + x.req.map(r => link(T.byId[r])).join(', ') + '. ' : ''}${after.length ? 'Obre: ' + after.map(link).join(', ') + '.' : ''}</p>
      <div class="small muted">És part d'aquests tipus d'exercici (el rang de la llista és un de sol):</div>
      <ul class="small">${gens.map(g => `<li><a href="#/mod/${g.mod}/practice?g=${g.id}">${esc(Calc.byId[g.mod].llista.replace(' + Seminari', ''))} · ${g.title}</a> ${pill(store.rank(g.key))}</li>`).join('')}</ul>
      <button class="btn primary" id="tpr">✍️ Practicar aquesta peça</button></div><div id="tprhost"></div>`;
    box.querySelectorAll('[data-n]').forEach(a => a.onclick = e => { e.preventDefault(); history.replaceState(null, '', a.getAttribute('href')); showNode(T, a.dataset.n); });
    typeset(box);
    $('#tpr').onclick = () => {
      const h = $('#tprhost');
      U.mountPractice(h, { gens, seedFor: g => { const ss = x.srcs.filter(s => Calc.srcGen(s) === g); return Calc.seedFor(g, ss[Math.floor(Math.random() * ss.length)]); } });
      $('#tpr').style.display = 'none';
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (!/^#\/arbre\//.test(location.hash) || location.hash.split('/')[3] !== id) return;
    box.scrollIntoView && box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // després de cada resposta, l'arbre es repinta (la peça es pot posar verda en directe)
  store.on(() => setTimeout(() => {
    const m = /^#\/arbre\/([^/?]+)\/?([^/?]*)/.exec(location.hash); if (!m || !TBY[m[1]]) return;
    drawTree(TBY[m[1]]);
    const T = TBY[m[1]], c = $('#tnodecard'); if (c && m[2] && T.byId[m[2]]) { const st = nodeStats(T.byId[m[2]]); const pl = c.querySelector('.rk'); if (pl) pl.outerHTML = pill(st.rank); }
  }, 0));

  /** Targeta per al resum d'una llista. */
  Calc.treeCard = function (mid) {
    const ts = TREES.filter(T => T.mods.includes(mid)); if (!ts.length) return '';
    return ts.map(T => { const s = treeStats(T); return `<div class="card" style="margin-top:12px"><div class="row"><div><b>🌳 Arbre: ${T.icon} ${esc(T.t)}</b><div class="muted small">${s.dom}/${s.n} peces dominades · ${pct(s.pct)}%. El tema partit en peces, per veure exactament què saps i què no.</div></div><span class="spacer"></span><a class="btn sm" href="#/arbre/${T.id}">Obrir l'arbre</a></div></div>`; }).join('');
  };

  Calc.routes.push({ re: /^#\/arbres?\/?$/, fn: indexPage });
  Calc.routes.push({ re: /^#\/arbre\//, fn: () => { const [, , tid, nid] = location.hash.split('?')[0].split('/'); treePage(tid, nid); } });
})();
