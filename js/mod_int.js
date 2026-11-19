/* =====================================================================
   mod_int.js — Mòdul «Integrar» (portat de Càlcul dx, itinerari «Tot»).
   Una habilitat per tècnica (immediates, canvi de variable, parts,
   racionals, trigonomètriques, irracionals, integral definida i
   impròpies) + dos generadors infinits amb la idea central de dx:
   derivar ⇄ integrar són la mateixa regla llegida en sentits oposats.
   Fa servir l'adaptador DXLIB.cm definit a mod_der.js.
   ===================================================================== */
(function () {
  'use strict';
  const L = (typeof window !== 'undefined' ? window : globalThis).DXLIB;
  if (!L || !L.cm) return;
  const { withSeed, SK, poolMake, ruleHint, bankOf, tableHtml } = L.cm, P = Calc.P;

  // [id de la tècnica a dx, nivell, conceptes de CalcMaster]
  const TECHS = [
    ['ipot', 1, ['primit']], ['iexp', 1, ['primit']], ['iarc', 1, ['primit']],
    ['flog', 2, ['subst']], ['fpot', 2, ['subst']], ['cv', 2, ['subst']],
    ['ppexp', 2, ['parts']], ['pptrig', 2, ['parts']], ['pplog', 2, ['parts']], ['pprei', 3, ['parts']], ['ppcic', 3, ['parts']],
    ['rsim', 2, ['fracs', 'intfracs']], ['rmul', 3, ['fracs', 'intfracs']], ['rquad', 3, ['fracs', 'intfracs']], ['rdiv', 3, ['fracs', 'intfracs']],
    ['tsen', 2, ['trigint']], ['tpar', 2, ['trigint']], ['ttan', 3, ['trigint']], ['tprod', 2, ['trigint']], ['tweier', 3, ['trigint', 'subst']],
    ['sqa2mx2', 3, ['subst']], ['sqa2px2', 3, ['subst']], ['sqx2ma2', 3, ['subst']], ['sqlin', 3, ['subst']],
    ['barrow', 2, ['tfc']], ['cvdef', 2, ['tfc', 'subst']], ['simet', 2, ['tfc']], ['tfc', 3, ['tfc']], ['arees', 3, ['arees', 'volums']],
    ['imp1', 3, ['tfc']], ['imp2', 3, ['tfc']], ['impcrit', 3, ['tfc']],
  ];
  const gens = [];
  TECHS.forEach(([id, level, needs]) => {
    const s = SK[id]; if (!s) return;
    const probs = s.p.filter(p => p.t !== 'c');
    if (!probs.length) return;
    gens.push({ id, title: s.n, level, needs, desc: s.i, make: poolMake(probs, ruleHint(s.r)) });
  });

  /* «Mirall»: la derivada d'una funció aleatòria, presentada com a integrand.
     Infinit i sempre nou: entrena a reconèixer f(g(x))·g'(x) (canvi de variable). */
  const MIRROR_KEYS = ['ch1', 'ch1', 'chpow', 'chroot', 'chexp', 'chln', 'chtrig', 'charc', 'chsinn', 'chax'];
  gens.push({
    id: 'mirall', title: 'Mirall: la derivada al revés (canvi de variable)', level: 2, needs: ['subst', 'cadena'],
    desc: 'Una integral que és exactament la derivada d\'una composició. Si reconeixes la funció de dins i la seva derivada, la primitiva surt sola.',
    make(r) {
      const p = withSeed(r, () => L.DX.gen(r.pick(MIRROR_KEYS)));
      if (!p || !p.f || p.ask) return null;
      const F = p.q.replace(/^f\(x\)=/, '');
      const q = `Calcula la primitiva:<div class="dxq">$$\\int\\left(${p.a}\\right)dx$$</div><div class="small muted">Pista de mirall: busca una funció de dins $g(x)$ amb la seva derivada $g'(x)$ multiplicant. La constant $+C$ és opcional.</div>`;
      const sol = [`És la derivada de $${F}$ (regla de la cadena), llegida al revés.`, `Comprova-ho derivant: $\\left(${F}\\right)'=${p.a}$.`, `$\\displaystyle\\int\\left(${p.a}\\right)dx=${F}+C$`];
      const pr = P.fn(q, p.f, sol, { ansTex: F, range: p.dom || [0.3, 1.2], utc: true });
      pr.hint = 'Pensa quina funció, derivada amb la regla de la cadena, dona això. $\\int f\'(g(x))\\,g\'(x)\\,dx=f(g(x))+C$.';
      const f = p.f, d = p.e, dom = p.dom || [0.3, 1.2];
      pr.check = () => { const Fc = M.compile(f), dc = M.compile(d); let n = 0; for (let k = 1; k <= 7; k++) { const x = dom[0] + (dom[1] - dom[0]) * k / 8, a = M.numDiff(Fc, x), b = dc(x); if (!isFinite(a) || !isFinite(b)) continue; if (Math.abs(a - b) > 1e-4 * Math.max(1, Math.abs(b))) return false; n++; } return n >= 3; };
      return pr;
    }
  });

  /* «Comprova la primitiva»: derivar el resultat d'una integral ha de tornar l'integrand
     (és la comprovació de qualsevol integral a l'examen). */
  const IPROBS = TECHS.map(t => SK[t[0]]).filter(Boolean).flatMap(s => s.p).filter(p => p.t === 'i' && p.f && !p.nochk);
  const MIRRORS = IPROBS.map(L.mirrorOf).filter(Boolean);
  if (MIRRORS.length) gens.push({
    id: 'comprova', title: 'Comprova la primitiva (derivant-la)', level: 2, needs: ['primit', 'regles'],
    desc: 'Deriva el resultat d\'una integral i comprova que tornes a l\'integrand. És el que has de fer a l\'examen abans de lliurar.',
    make: r => { const p = L.cm.toP(r.pick(MIRRORS), r); p.hint = 'Deriva la primitiva: has d\'obtenir l\'integrand.'; return p; }
  });
  // La idea: derivar ⇄ integrar
  if (SK.idea) gens.unshift({ id: 'idea', title: 'Derivar ⇄ Integrar: la idea', level: 1, needs: ['primit', 'dertab'], desc: SK.idea.i, make: poolMake(SK.idea.p.filter(p => p.t !== 'c'), ruleHint(SK.idea.r)) });

  /* ---------------- Teoria ---------------- */
  const pairs = L.NODES.filter(n => n.ri);
  let theory = `<h3>Derivar ⇄ Integrar: per què van junts</h3>
<p>Integrar és <b>desfer una derivada</b>: $\\int f(x)\\,dx=F(x)+C$ vol dir que $F'(x)=f(x)$. Per això cada tècnica d'integració és una regla de derivació llegida al revés:</p>
<div class="tablewrap"><table class="tbl"><tr><th>Tema</th><th>Derivar</th><th>Integrar</th></tr>${pairs.map(n => `<tr><td><b>${n.n}</b></td><td>$${n.r}$</td><td>$${n.ri}$</td></tr>`).join('')}</table></div>
<p><b>Comprovació de qualsevol primitiva:</b> deriva-la. Si tornes a l'integrand, està bé. (Ho entrenes a «Comprova la primitiva».)</p>
<p><b>Com escriure la resposta:</b> <code>x^3/3</code>, <code>ln(x^2+1)</code>, <code>-cos(2x)/2</code>, <code>atan(x/2)/2</code>, <code>x*e^x-e^x</code>. El $+C$ és opcional i el valor absolut del logaritme també.</p>
<h3>Taula de primitives</h3>${tableHtml(L.TABLES.i, '$f(x)$', '$\\int f(x)\\,dx$')}`;
  L.I_UNITS.forEach(u => {
    theory += `<h3>${u.icon} ${u.name}</h3><p>${u.desc}</p>${u.pista ? `<p class="muted">💡 ${u.pista}</p>` : ''}` +
      u.items.map(s => `<div class="box"><b>${s.n}</b>${s.r ? `<div class="formula">$$${s.r}$$</div>` : ''}${s.i ? `<p>${s.i}</p>` : ''}</div>`).join('');
  });

  Calc.add({
    id: 'int', num: 'I', llista: 'Integrar', title: 'Integrar: primitives, tècniques i integral definida',
    short: 'Una habilitat per tècnica (immediates, canvi, parts, racionals, trigonomètriques, irracionals, definida, impròpies) i la idea derivar ⇄ integrar.',
    desc: 'Portat de «Càlcul dx». Les primitives són dins de gairebé tots els exercicis del 2n parcial (L7–L12).',
    theory, gens,
    bank: bankOf(TECHS.map(t => t[0]).concat('idea')),
  });
})();
