/* =====================================================================
   merge.js — Una sola mestria per a un mateix coneixement.
   Les habilitats que venen de l'antic entrenador del Seminari 3 (sem3.*) i
   de Càlcul dx (der.*, int.*) NO són tipus d'exercici a part:
   · si ja hi havia un tipus d'exercici equivalent a la llista, els seus
     exercicis s'hi afegeixen com a VARIANT (mateixa clau → mateix rang,
     mateix XP, mateix repàs: «derivar 9x³» és el mateix a tot arreu);
   · si no n'hi havia cap, es crea el tipus NOU dins de la llista on toca
     (derivades → L2, límits → L1, L'Hôpital → L4, extrems → L3,
     primitives → L7, racionals → L8, integral definida → L9).
   Després s'eliminen els mòduls provisionals «der» i «int».
   · Calc.SKILL_KEY[clauAntiga] = clau definitiva (p. ex. 'sem3.d_pow' → 'l2.d_poly')
   · el progrés desat amb les claus antigues es fusiona amb la nova (una vegada).
   S'ha de carregar després de TOTS els generadors (gens_tema.js) i abans d'examrel.js.
   ===================================================================== */
(function () {
  'use strict';
  const Calc = (typeof window !== 'undefined' ? window : globalThis).Calc;
  const byKey = {};
  Calc.modules.forEach(m => m.gens.forEach(g => { byKey[g.key] = g; }));
  (Calc.sem3 && Calc.sem3.gens || []).forEach(g => { g.key = 'sem3.' + g.id; byKey[g.key] = g; });
  (Calc.sem3 && Calc.sem3.rapid || []).forEach(g => { g.key = 'sem3r.' + g.id; byKey[g.key] = g; });
  (Calc.sem3 && Calc.sem3.intuit || []).forEach(g => { g.key = 'sem3i.' + g.id; byKey[g.key] = g; });
  if (Calc.estudi) byKey['estudi.full'] = Calc.estudi.full;

  // clau antiga → clau existent (variant)   o   → [mòdul, id nou, títol] (tipus nou)
  const MAP = {
    // ---- derivades (L2 i Fonaments) ----
    'sem3.d_pow': 'l2.d_poly', 'der.k': 'l2.d_poly', 'der.pow': 'l2.d_poly', 'der.cpow': 'l2.d_poly', 'der.neg': 'l2.d_poly', 'der.poly': 'l2.d_poly', 'der.root': 'l2.d_poly', 'der.alg': 'l2.d_poly',
    'sem3.d_elem': 'base.dertable', 'der.exp': 'base.dertable', 'der.ln': 'base.dertable', 'der.trig': 'base.dertable', 'der.ax': 'base.dertable', 'der.tan': 'base.dertable', 'der.arc': 'base.dertable', 'der.elem': 'base.dertable',
    'sem3.d_prod': 'l2.d_product', 'der.prod': 'l2.d_product',
    'sem3.d_quot': 'l2.d_quotient', 'der.quot': 'l2.d_quotient', 'der.pq': 'l2.d_quotient',
    'sem3.c_one': 'l2.d_chain', 'sem3.c_powtrig': 'l2.d_chain', 'der.ch1': 'l2.d_chain', 'der.chpow': 'l2.d_chain', 'der.chroot': 'l2.d_chain', 'der.chexp': 'l2.d_chain', 'der.chln': 'l2.d_chain', 'der.chtrig': 'l2.d_chain', 'der.charc': 'l2.d_chain', 'der.chsinn': 'l2.d_chain', 'der.chax': 'l2.d_chain',
    'sem3.c_mixed': 'l2.d_mixed', 'der.chprod': 'l2.d_mixed', 'der.chquot': 'l2.d_mixed', 'der.mix': 'l2.d_mixed', 'der.big': 'l2.d_mixed',
    'sem3.c_layers': ['l2', 'chain_layers', 'Cadena: identificar les capes (de fora cap a dins)'],
    'sem3.c_multi': ['l2', 'chain_multi', 'Cadena de 2 a 5 capes'], 'der.ch2': 'l2.chain_multi',
    'sem3.d_val': ['l2', 'd_val', 'Derivada en un punt'],
    'sem3.l_defder': ['l2', 'd_def', 'Derivada per definició (límit)'], 'der.x_lim': 'l2.d_def',
    'sem3.l_class': ['l2', 'd_class', 'Contínua, derivable, $C^1$: $x^k\\sin(1/x)$'],
    'der.hip': ['l2', 'd_hyp', 'Hiperbòliques i les seves inverses'], 'der.x_arghip': 'l2.d_hyp',
    'der.x_inv': ['l2', 'd_inverse', 'Derivada de la funció inversa'],
    'der.x_param': ['l2', 'd_param', 'Corbes paramètriques: $dy/dx$'],
    'der.logd': 'l2.d_logdiff', 'der.impl': 'l2.d_implicit', 'der.ordre': 'l2.d_second', 'der.tang': 'l1.tangent',
    // ---- límits (L1) ----
    'sem3.l_sub': 'l1.p1_limitDirect',
    'sem3.l_bounded': ['l1', 'lim_bounded', 'Zero per acotada, o no existeix ($\\sin(1/x)$)'], 'sem3.l_osc': 'l1.lim_bounded',
    'sem3.r_deg': 'l1.limit_inf', 'sem3.r_neg': 'l1.limit_inf', 'sem3.r_general': 'l1.limit_inf', 'sem3.x_limits': 'l1.limit_inf',
    // ---- L'Hôpital (L4) ----
    'sem3.h_form': ['l4', 'lhop_form', 'Quin tipus d\'indeterminació és?'],
    'sem3.h_step': ['l4', 'lhop_step', 'L\'Hôpital: aplicar la regla (un pas)'],
    'sem3.h_00': 'l4.lhop_00', 'sem3.h_twice': 'l4.lhop_00', 'der.x_hop': 'l4.lhop_00',
    'sem3.h_inf': 'l4.lhop_inf', 'sem3.h_prod': 'l4.lhop_0inf', 'sem3.h_diff': 'l4.lhop_diff', 'sem3.h_exp': 'l4.lhop_pow',
    // ---- equacions i signes (Fonaments) ----
    'sem3.e_roots': 'base.quad', 'sem3.e_sign': 'base.ineq',
    // ---- extrems (L3) ----
    'sem3.x_crit': 'l3.crit_cubic', 'sem3.x_value': 'l3.crit_cubic', 'der.x_mono': 'l3.crit_cubic',
    'sem3.x_mono': 'l3.monotony',
    'sem3.x_first': ['l3', 'crit_test', 'Criteris de la 1a i la 2a derivada'], 'sem3.x_second': 'l3.crit_test',
    'sem3.x_infl': 'l3.inflection', 'der.x_curv': 'l3.inflection', 'sem3.x_abs': 'l3.abs_extrema',
    // ---- Taylor (L5) ----
    'der.x_tay': 'l5.poly0',
    // ---- primitives (L7, Fonaments), racionals (L8), integral definida (L9) ----
    'int.ipot': 'l7.split', 'int.iexp': 'base.inttable', 'int.iarc': 'base.inttable',
    'int.flog': 'l7.subst', 'int.fpot': 'l7.subst', 'int.cv': 'l7.subst', 'int.mirall': 'l7.subst', 'int.sqlin': 'l7.subst',
    'int.ppexp': 'l7.parts', 'int.pptrig': 'l7.parts', 'int.pplog': 'l7.parts_log', 'int.pprei': 'l7.parts_log', 'int.ppcic': 'l7.parts_cyc',
    'int.tsen': 'l7.trigint', 'int.tpar': 'l7.trigint', 'int.ttan': 'l7.trigint', 'int.tprod': 'l7.trigint', 'int.tweier': 'l7.trigint',
    'int.sqa2mx2': 'l7.trigsub', 'int.sqa2px2': 'l7.trigsub', 'int.sqx2ma2': 'l7.trigsub',
    'int.comprova': ['l7', 'comprova', 'Comprova la primitiva derivant-la'],
    'int.rsim': 'l8.int_simple', 'int.rmul': 'l8.int_repeated', 'int.rquad': 'l8.int_mixed', 'int.rdiv': 'l8.int_improper',
    'int.barrow': 'l9.defint', 'int.cvdef': 'l9.defint', 'int.simet': 'l9.mean', 'int.tfc': 'l9.leibniz', 'int.arees': 'l9.area_between',
    'int.imp1': 'l9.improper', 'int.imp2': 'l9.improper', 'int.impcrit': 'l9.improper',
    // ---- «⚡ Ràpids» del Seminari 3 (sem3_rapid.js): variants dels tipus de la llista on viu el coneixement ----
    'sem3r.chain5': 'l2.chain_multi', 'sem3r.chainval': 'l2.d_val', 'sem3r.xk_class': 'l2.d_class', 'sem3r.xk_der': 'l2.d_mixed', 'sem3r.xk_f0': 'l2.d_def',
    'sem3r.cubic_ext': 'l3.crit_cubic', 'sem3r.cubic_mono': 'l3.monotony', 'sem3r.cubic_abs': 'l3.abs_extrema', 'sem3r.cubic_zeros': 'base.factor',
    'sem3r.ratinf': 'l1.limit_inf', 'sem3r.ratgen': 'l1.limit_inf',
    // ---- Estudi de funcions (estudi.js): mateixa mestria que l'exercici de parcial ----
    'estudi.full': 'l4.p1_functionStudy',
    // ---- «🧭 Intuïció» (endevinar amb criteri) ----
    'sem3i.ch_count': 'l2.chain_layers', 'sem3i.ch_pick': 'l2.chain_multi', 'sem3i.bnd_guess': 'l1.lim_bounded',
    'sem3i.lim_dom': 'l4.lhop_inf', 'sem3i.lim_1inf': 'l4.lhop_pow', 'sem3i.plaus_pq': 'l1.limit_inf',
    'sem3i.cubic_shape': 'l3.monotony', 'sem3i.infl_mid': 'l3.inflection', 'sem3i.extr_type': 'l3.crit_test',
  };
  // Sense lloc: barreges de 2–3 exercicis fixos que ja cobreixen altres tipus.
  const DROP = ['der.x_estudi', 'der.x_opt', 'int.idea'];

  const KEY = {};
  const tag = (p, src) => { if (p && !p.sub) p.sub = src; return p; };
  /** Executa el generador antic com si fos de la clau definitiva (la dificultat segueix el rang d'aquesta). */
  const runAs = (src, key) => function (r) { return src.make.call(Object.assign(Object.create(src), { rankKey: key }), r); };
  /** Afegeix una variant a un tipus d'exercici: la meitat de les vegades surt l'original, l'altra meitat una variant. */
  function addVariant(T, src) {
    if (!T._vars) {
      const base = T.make; T._vars = []; T._baseSrc = T._baseSrc || T.key;
      T._pick = r => (r() < 0.5 ? -1 : Math.floor(r() * T._vars.length));
      // si la variant triada descarta els números (torna null), es reintenta la MATEIXA variant
      const again = (f, self, r) => { for (let k = 0; k < 40; k++) { const p = f.call(self, r); if (p) return p; } return null; };
      T.make = function (r) { const i = T._pick(r); return i < 0 ? tag(again(base, this, r), T._baseSrc) : tag(again(T._vars[i].fn, this, r), T._vars[i].src); };
    }
    T._vars.push({ src: src.key, fn: runAs(src, T.key) });
    T.from = (T.from || []).concat(src.key);
  }
  // 1) tipus nous
  Object.entries(MAP).forEach(([k, to]) => {
    if (!Array.isArray(to)) return;
    const src = byKey[k]; if (!src) return;
    const [mod, id, title] = to, key = mod + '.' + id;
    const g = Calc.addGen(mod, { id, title, level: src.level || 2, needs: src.needs, about: src.about, from: [k] });
    g.make = runAs(src, key); g._baseSrc = k;
    byKey[key] = g; KEY[k] = key;
  });
  // 2) variants
  Object.entries(MAP).forEach(([k, to]) => {
    if (Array.isArray(to)) return;
    const src = byKey[k], T = byKey[to]; if (!src || !T) return;
    addVariant(T, src); KEY[k] = to;
  });
  DROP.forEach(k => { KEY[k] = null; });
  // 3) fora els mòduls provisionals; la teoria «derivar ⇄ integrar» i els tests passen a L2 / L7
  ['der', 'int'].forEach(id => {
    const m = Calc.byId[id]; if (!m) return;
    const tgt = Calc.byId[id === 'der' ? 'l2' : 'l7'];
    if (id === 'int' && m.theory) {
      const secs = String(m.theory).split(/(?=<h3>)/i).filter(s => /Derivar ⇄ Integrar|Taula de primitives/i.test(s));
      if (secs.length) tgt.theory = String(tgt.theory || '') + '\n' + secs.join('\n');
    }
    tgt.bank = (tgt.bank || []).concat(m.bank || []);
    Calc.modules.splice(Calc.modules.indexOf(m), 1); delete Calc.byId[id];
  });
  Calc.SKILL_KEY = KEY;

  /* ---- Sub-mestria per «font» (per als arbres d'habilitats) ----
     Un tipus d'exercici amb variants (p. ex. l2.d_poly: polinomis, potències, arrels, constants…) té UN rang.
     A més, cada problema porta p.sub = d'on surt, i aquí se'n porta el compte amb les mateixes regles de rang,
     sense XP extra. Els arbres ho fan servir per dir «Arrels: dominat · Exponents negatius: no començat». */
  const LOCAL = {};
  Object.keys(byKey).forEach(k => { LOCAL[k] = byKey[k]; });
  /** Clau del tipus d'exercici on viu una font (clau antiga o clau d'un tipus). */
  Calc.srcGen = src => Calc.genByKey(KEY[src] || src) || null;
  /** Llavor perquè el tipus T generi un exercici de la font src (per practicar un node concret). */
  Calc.seedFor = (T, src) => {
    if (!T || !T._vars || !src) return Calc.newSeed();
    const want = src === T._baseSrc ? -1 : T._vars.findIndex(v => v.src === src);
    if (want === -1 && src !== T._baseSrc) return Calc.newSeed();
    for (let i = 0; i < 2000; i++) { const s = Calc.newSeed(); if (T._pick(M.rng(s)) === want) return s; }
    return Calc.newSeed();
  };
  /** Dades de rang d'una font: la sub-mestria si el tipus té variants; si no, el del tipus sencer (és el mateix). */
  Calc.srcData = src => {
    const T = Calc.srcGen(src), d = Calc.store.data();
    if (!T) return null;
    if (!T._vars) return d.gens[T.key] || null;
    return (d.sub || {})[src] || null;
  };
  const st0 = Calc.store, rec0 = st0.record;
  st0.record = function (key, ok, p, kind) {
    const info = rec0.apply(this, arguments);
    try {
      const T = Calc.genByKey(key), src = p && p.sub;
      if (src && T && T._vars) {
        kind = kind || (ok ? 'ok' : 'fail');
        const d = st0.data(), now = Date.now(), dk = Calc.dayStr(new Date(now)), sub = d.sub || (d.sub = {});
        const g = sub[src] || (sub[src] = { att: 0, ok: 0, hist: [], pts: 0, best: 0, due: now, days: 0, revs: 0 });
        const wasDue = g.best >= 2 && g.due <= now;
        g.att++; if (kind === 'ok') g.ok++;
        g.hist.push(kind === 'ok' ? 1 : kind === 'assist' ? 0.5 : 0); if (g.hist.length > 12) g.hist.shift();
        if (kind === 'ok') g.pts += 1; else if (kind === 'fail') g.pts = Math.max(0, g.pts - 1);
        if (kind === 'ok' && g.okDay !== dk) { g.days++; g.okDay = dk; }
        if (wasDue && g.sched && kind === 'ok') g.revs++;
        g.best = Math.max(g.best, Calc.rankOfG(g));
        g.due = kind === 'ok' ? now + Calc.REVIEW_DAYS[g.best] * 864e5 : now; g.sched = kind === 'ok'; g.last = now;
        st0.save();
      }
    } catch (e) { /* res */ }
    return info;
  };

  // 4) progrés desat amb claus antigues → claus definitives (una sola vegada per clau)
  try {
    const st = Calc.store, d = st && st.data();
    if (d && d.gens) {
      let changed = false;
      Object.keys(d.gens).forEach(k => {
        if (!(k in KEY)) return;
        const to = KEY[k], g = d.gens[k]; delete d.gens[k]; changed = true;
        if (!to) return;
        const t = d.gens[to];
        if (!t) { d.gens[to] = g; return; }
        ['att', 'ok', 'pts', 'revs', 'ms'].forEach(f => { t[f] = (t[f] || 0) + (g[f] || 0); });
        t.days = Math.max(t.days || 0, g.days || 0); t.best = Math.max(t.best || 0, g.best || 0);
        t.hist = (t.hist || []).concat(g.hist || []).slice(-20); t.due = Math.min(t.due || Infinity, g.due || Infinity);
      });
      (d.errors || []).forEach(e => { if (e.gkey in KEY) e.gkey = KEY[e.gkey]; });
      d.errors = (d.errors || []).filter(e => e.gkey);
      if (changed) st.save();
    }
  } catch (e) { /* res */ }
})();
