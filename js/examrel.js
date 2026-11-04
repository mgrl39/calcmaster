/* ===================================================================
   examrel.js — Quant surt a l'examen cada habilitat (tipus d'exercici).
   Fet a partir dels exàmens reals: 11 del 1r parcial (2018–2026) i
   5 del 2n parcial (2023–2025). Escala:
     3 = surt a gairebé tots els exàmens (o és una eina que fas servir a tots)
     2 = surt sovint
     1 = ha sortit poc, o surt dins d'un altre exercici
     0 = no ha sortit en cap examen que tinguem
   La pràctica prioritza el que més surt; el que no surt també té mestria.
   =================================================================== */
(function () {
  'use strict';
  const W = {
    base: { frac: 1, quad: 2, factor: 2, ineq: 2, powers: 1, logs: 2, trig: 1, dertable: 3, inttable: 3, trig_eq: 1 },
    l0: { domain: 2, compose: 1, inverse: 0, parity: 1, transform: 0, p1_domain: 2, p1_equation: 2, p1_expQuadratic: 2, p1_inequality: 2, ineq_rat: 2, ineq_abs: 2, lines: 1 },
    l1: { bolzano_mc: 2, bolzano_vals: 2, limit_factor: 2, limit_inf: 2, limit_lateral: 2, cont_param: 1, cont_two: 1, tangent: 2, tangent_ext: 1, p1_tangent: 2, p1_limit: 2, p1_limitDirect: 1, p1_limitFactor: 2, p1_continuity: 1, p1_bolzano: 2, limit_inf_root: 2 },
    l2: { related_more: 0, d_poly: 3, d_product: 3, d_quotient: 3, d_chain: 3, d_mixed: 3, d_logdiff: 2, d_second: 2, d_implicit: 1, d_related: 0, tvm: 1, roots_count: 2, d100: 3, d100_0: 2, d100_1: 2, d100_2: 2, d100_3: 2, d100_4: 2, d100_5: 2, d100_6: 3, p1_derivBasic: 3, p1_derivChain: 3, p1_derivProdQuot: 3, p1_derivative: 3, p1_logDerivative: 2, p1_implicitDerivative: 1, p1_rolleTvm: 1 },
    l3: { crit_cubic: 3, monotony: 3, crit_rational: 3, crit_exp: 3, optim_basic: 0, optim_box: 0, optim_page: 0, optim_dist: 0, inflection: 3, abs_extrema: 2, p1_polyGrowth: 3, p1_absExtrema: 2 },
    l4: { asymp_oblique: 3, asymp_horiz: 3, asymp_vert: 3, asymp_exp: 2, lhop_00: 2, lhop_inf: 2, lhop_0inf: 2, lhop_pow: 2, lhop_diff: 2, lhop_param: 1, p1_asymptote: 3, p1_functionStudy: 3, p1_powLimit: 2 },
    l5: { mclaurin_mix: 1, coef: 1, poly0: 2, polya: 2, value: 2, degree: 2, err_ln: 2, p1_taylorValue: 2, p1_taylorError: 2, p1_taylorProblem: 3, p1_taylorDegree: 2 },
    l6: { basis: 1, dd: 1, newton_coefs: 1, poly: 1, value: 1, bound: 1, p1_interpolation: 1 },
    l7: { newton: 0, newton_extreme: 0, p1_newton: 0, linear: 2, split: 2, subst: 3, parts: 3, trigint: 2, parts_cyc: 1, parts_log: 2, trigsub: 1 },
    l8: { coef2: 3, coef3: 3, int_simple: 3, int_repeated: 3, int_arctan: 3, polydiv: 2, int_improper: 2, int_mixed: 3, int_cubic: 2, int_dbl_simple: 3 },
    l9: { volume_washer: 2, volume_shell: 2, improper: 1, defint: 3, signed_area: 1, leibniz: 3, ftc_value: 3, ftc_crit: 1, area_between: 3, area_axis: 3, volume: 2, mean: 0, riemann: 0, trapez: 0, simpson: 0, arclen: 0, surface: 0, leibniz_adv: 3, ftc_concav: 1, area_parts: 3, area_param: 2, volume_adv: 3 },
    l10: { classify: 1, verify: 1, separable: 3, logistic: 2, equilibria: 1, growth: 3, epidemic: 2, sep_more: 3, ode_subst: 2, growth_lim: 2 },
    l11: { mix_var: 1, cooling_time: 2, mu: 3, ivp: 3, mix: 1, cooling: 2, lin_exam: 3 },
    l12: { roots: 3, general_mc: 2, ivp: 3, from_solutions: 2, particular: 3, guess: 3, ivp_nh: 3, res_trig: 2, guess_adv: 3 },
    l13: { area_expr: 2, leibniz_mc: 3, logistic_mc: 2, ivp_exist: 2 }
  };
  const LABEL = ['No ha sortit a l\'examen', 'Ha sortit poc', 'Surt sovint', 'Surt a gairebé tots els exàmens'];
  const ICON = ['', '🔥', '🔥🔥', '🔥🔥🔥'];
  /** 0..3; si una habilitat no és a la taula, compta com 1. */
  Calc.examW = key => { const [m, g] = String(key).split('.'); const x = W[m] && W[m][g]; return x == null ? 1 : x; };
  Calc.examLabel = key => LABEL[Calc.examW(key)];
  Calc.examChip = key => { const w = Calc.examW(key); return w ? `<span class="exw w${w}" title="${LABEL[w]}">${ICON[w]}</span>` : `<span class="exw w0" title="${LABEL[0]}">no surt</span>`; };
  Calc.EXW = W;
})();
