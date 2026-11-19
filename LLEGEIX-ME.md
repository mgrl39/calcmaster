# CalcMaster — aprendre Càlcul des de zero

Obre **`web/index.html`** (doble clic). Funciona sense connexió i sense instal·lar res.
Per publicar-la a GitHub Pages (sense els PDFs, i demanant als bots que no la indexin): vegeu **[README.md](README.md)**.
El progrés es guarda al navegador (El meu progrés › Exportar per fer-ne còpia).

## 📝 Seminaris, derivar i integrar (dins de les llistes, sense duplicats)

Les dues apps que havies fet a part (l'entrenador del Seminari 3 i Càlcul dx) ja **no són apps ni apartats a part**.
El que s'hi entrenava és el mateix coneixement que les llistes, i per això té **una sola mestria**:

- Cada habilitat antiga s'ha posat a la llista on toca (`js/merge.js`, taula `MAP`):
  - si ja hi havia un tipus d'exercici equivalent, els exercicis nous s'hi afegeixen com a **variant** (mateix rang,
    XP i repàs). P. ex. «derivar $9x^2$» del seminari, de Càlcul dx i de L2 són tots `l2.d_poly`;
  - si no n'hi havia, és un **tipus nou dins de la llista**: L1 `lim_bounded`; L2 `chain_layers`, `chain_multi`,
    `d_val`, `d_def`, `d_class`, `d_hyp`, `d_inverse`, `d_param`; L3 `crit_test`; L4 `lhop_form`, `lhop_step`;
    L7 `comprova`.
  - Derivades → Fonaments/L1–L5 (1r parcial). Integrals → L7–L9 (2n parcial).
  - El progrés desat amb les claus antigues (`sem3.*`, `der.*`, `int.*`) es fusiona sol amb la clau nova.
- **📝 Seminari 3** (`#/seminari`): és al menú, al grup plegable **Seminaris (1r parcial)** (sota el temari). Al temari surt
  com a «Seminaris del bloc 1», i al mapa (vista Llistes) és un node que depèn de L1–L4.
  - No té tipus d'exercici propis: les seves peces són tipus d'exercici de L1–L4 i Fonaments.
  - Inclou un pla en 5 passos i la teoria.
  - Té 6 exercicis sencers amb mestria d'apartat (`S3:<tema>`). Cada apartat també suma al tipus d'exercici de la llista corresponent.
  - També té 18 lliçons, un simulacre de 50 minuts (compten els 3 millors de 4) i el full 2023-24 resolt.

Fitxers: `js/sem3_lib.js` (motor del seminari), `js/mod_sem3.js` (habilitats, sense mòdul), `js/sem3_ui.js`,
`js/dx_lib.js`, `js/mod_der.js`, `js/mod_int.js` (generadors font), `js/merge.js` (la fusió).
Les carpetes originals (`calcul-seminari3/`, `derivar-integrar/`) ja no les fa servir la web.

## 🌳 Arbres d'habilitats (`#/arbres`)

Cada tema partit en peces petites amb fletxes «cal saber això abans», com l'arbre de l'app de derivades. Hi ha 4 arbres:
**Derivades** (44 peces, L2 i Fonaments), **Límits, L'Hôpital i asímptotes** (24 peces, L1 i L4, amb 0/0, ∞/∞, 0·∞, ∞−∞ i 1^∞),
**Extrems i estudi** (13 peces, L3) i **Integrar** (26 peces, L7–L9).
- Una peça no té una mestria pròpia. Agrupa trossos dels tipus d'exercici de les llistes. Si practiques la peça, entrenes el
  tipus d'exercici de la llista (amb el mateix rang i XP). El que fas a la llista o al seminari també es veu a l'arbre.
- `merge.js` porta un compte per «font» de cada exercici (`p.sub`, desat a `sub` a les dades), sense donar XP extra. Així
  l'arbre pot dir «Arrels: dominat · Exponents negatius: no començat», tot i que totes dues peces són de `l2.d_poly`.
- Els arbres s'obren des del menú, des del Mapa, des del resum de cada llista i des de les Habilitats del seminari.

## Mestria i constància (`#/mestria`)

Dominar no és fer un exercici dos cops: és **entrenar-lo**. Cada tipus d'exercici (209 habilitats: cada tipus de
límit, de derivada, d'asímptota, d'inequació…) té un rang que demana **punts + dies diferents + repassos superats**:

| Rang | Punts | Dies amb encerts | Repassos superats |
|---|---|---|---|
| Iniciat | 1 | – | – |
| Aprenent | 5 | – | – |
| Practicant | 12 | 2 | – |
| Competent | 25 | 4 | 1 |
| **Dominat** | **45** | **7** | **3** |
| Mestre | 80 | 12 | 6 |

Encertar a la primera i sense pista: **+1 punt**. Fallar: **−1**. Amb pista o mirant la solució: 0 (però suma XP).
Un *repàs superat* és encertar-la quan el repàs espaiat te la torna a posar. **El rang no baixa mai.**
Es compta el **temps entrenat** de cada habilitat i de cada llista.

- **🔥 Què surt a l'examen**: cada habilitat porta 🔥🔥🔥 (surt a gairebé tots els exàmens), 🔥🔥, 🔥 o «no surt».
  La pràctica barrejada prioritza el que més surt, però tot té mestria.
- **🎓 Entrenament d'exàmens** (`#/entrena`): cada apartat dels exàmens reals (1r i 2n parcial) té el seu rang.
  El resols en paper, mires la solució i t'autoavalues. Per dominar-lo: 6 resolucions netes en 4 dies diferents
  (una per dia compta). Primer surten els que toca repassar, després els nous.
- **XP i nivells** (30 títols, de *Nouvingut* a *Gauss*), **ratxa** de dies, **objectiu diari** i **missions**.
- **Calendari d'esforç** de 20 setmanes i comparació amb la setmana passada.
- **🧠 Repàs del dia** (`#/repas`): cada rang té un interval (1, 2, 4, 8, 21 dies).
- **🏅 Prova de mestria** per llista: amb un 80% la llista queda certificada i les habilitats encertades pugen a
  Practicant. *Dominat* només s'aconsegueix entrenant.
- **Objectiu: aprovar**: quina nota et cal al 2n parcial, quants exercicis i hores et falten, i quants dies com a mínim.
- **🗂️ El meu temari** (`#/temari`): tot el curs per **blocs → temes**, amb tres comptadors per tema (tipus d'exercici,
  llista oficial, apartats d'examen) i el domini en %. Marca **Focus** a uns temes i **🎯 Practica només això** (`#/focus`).
- **📊 Resum de cada tema** (primera pestanya de cada llista; el menú hi porta directament): on és dins del curs, què cal
  abans i per a què serveix després, què fer ara, tots els tipus d'exercici agrupats per concepte i els apartats d'examen.
- **🧭 Franja de propòsit** a dalt de cada pàgina: en quin pas del cicle ets (entendre, practicar, llistes, consolidar,
  examen), on ets (bloc › tema · %), per a què serveix la pàgina i quan fer-la servir.
- **❓ Com funciona** (`#/guia`): el cicle d'estudi, la jerarquia bloc › tema › concepte › tipus d'exercici, la taula de
  rangs i què vol dir cada percentatge.
- **🎮 Jocs d'entrenament** (`#/jocs`, tecles `G` `J`):
  - *⚡ Contrarellotge* (5 min, +1 / −¼) i *❤️ Supervivència* (3 vides, cada cop més difícil): velocitat i regularitat.
    No pugen rangs (amb pressa s'endevina), però cada error va al repàs d'errors.
  - *🧭 Quin mètode?* (integrals i EDOs), *🔎 Troba l'error* (resolucions amb un pas equivocat, o cap) i *📜 Teoremes*
    (enunciat exacte i quan es pot aplicar): són tipus d'exercici normals, amb rang i repàs.
- **📜 Teoremes** (`#/teoremes`): 12 fitxes «tapa, escriu-lo i compara» (Bolzano, Weierstrass, Rolle, TVM, L'Hôpital,
  Taylor, TFC, Barrow, valor mitjà integral, existència i unicitat de 1r i 2n ordre, estructura $y_h+y_p$).
- **⏱️ Simulacre del 2n parcial** (`#/p2/sim`): 5 preguntes de test de 5 opcions (amb «Cap opció és correcta») +
  2 problemes (integrals i EDOs), amb temps, llista de comprovació abans de lliurar i **rúbrica del procediment**
  (plantejament 40 %, desenvolupament 30 %, resultat 20 %, detalls 10 %; orientativa).
- **Confiança:** a la pràctica, abans de comprovar, marca *✔ Segur* o *🤔 Dubto* (tecla `D`). Un encert amb dubte dona XP
  però no puja el rang; un error «segur» et surt avisat. A *Jocs* veus la teva calibració.
- **Rúbrica als exàmens reals:** a cada apartat, «🧾 Corregeix-te amb la rúbrica» decideix per tu si és ✅, 🤔 o ❌.
- **✅ Res nou a l'examen** (`#/cobertura`): cada apartat dels exàmens reals del 2n parcial (43/43) i cada exercici
  de les llistes té enllaçat el tipus d'exercici que l'entrena, amb el rang de l'apartat i el del tipus al costat.
- **📋 Llistes oficials** (`#/llistes`): les 14 llistes de classe (L0–L13), exercici per exercici, amb la solució
  verificada i **mestria per exercici** (com els apartats d'examen). A cada llista, la pestanya «📋 Llista oficial» té
  el mode *Entrenar* (un exercici cada vegada: primer els que toca repassar) i el mode *Tota la llista*.
  La llista 13 és el final de gener de 2025 i comparteix el progrés amb l'entrenament d'exàmens.
- **44 assoliments** (fins a 100 hores d'estudi, 20 apartats d'examen i 10 exercicis de llista dominats).

## Com fer-la servir

> **🎯 Prioritat 2n parcial (activa per defecte).** Les llistes 6–13 i els exàmens del 2n parcial surten primer i pesen
> més a la pràctica barrejada, però **res es dona per sabut**: la base i les llistes 0–5 es veuen igual, entren al
> repàs i tenen mestria. **🧰 Eines per integrar** (`#/eines`) són les 7 habilitats de la base que surten dins de
> cada exercici del 2n parcial. A l'inici, «Mateix pes a tot el curs» treu la prioritat.

0. **🎓 Què estudiem i per què** (`#/curs`): els 4 blocs de la guia docent, quina pregunta respon cada un, com es
   connecten, per a què serveix cada llista a informàtica, com t'avaluen i una **calculadora de nota** (et diu quant
   necessites al 2n parcial). A cada llista, la franja **📍 On som** resumeix el mateix: bloc, d'on ve, cap a on porta.
1. **🔎 Test de nivell** (`#/nivell`): 20 preguntes curtes des dels fonaments fins al final. Et diu per on començar.
2. **🧭 Camí recomanat** (`#/cami`): ordre suggerit de lo bàsic a lo avançat. Mai bloqueja res.
   **🗺️ Mapa del temari** (`#/mapa`): graf de tots els conceptes (o de les llistes) amb fletxes «cal saber abans».
   Cada node es pinta segons el teu domini i es posa **verd** quan el domines. Clica'l per obrir teoria i exercicis.
   **🔥 Exàmens reals 2n parcial** (`#/p2`): 5 exàmens d'integrals i EDOs (juny 2023, juny 2024, recuperació
   juny 2024, gener 2025 i un solucionari amb test del format actual) amb la solució pas a pas comprovada
   numèricament. A cada apartat marques «resolt sol / a mitges / no» i et dona XP (només el primer cop).
   **📈 Què surt al 2n parcial** (`#/p2/temes`) ordena els temes per freqüència. Les preguntes de test reals
   també entren als bancs de les llistes 8, 9 i 12.
3. A cada llista: **📖 Teoria** (comença amb «la idea en 30 segons») → **✍️ Pràctica** → **✅ Test**.

Si una cosa dona per fet un concepte, apareix un botó <kbd>📖 concepte</kbd>: obre un recordatori i la secció de teoria
**en un panell al costat**, sense perdre la pregunta. Cada tipus d'exercici explica «de què va» i què cal saber abans.

A la pràctica: 💡 **Pista** (pas a pas), 📘 **Exemple** (un exercici semblant ja resolt, no compta com a error),
**Solució**. Si t'equivoques, la correcció intenta dir-te el motiu (signe canviat, falta un factor, arrodoniment…).

## Què hi ha

| Per a cada llista | |
|---|---|
| 📖 Teoria | idea en paraules + seccions plegables amb «abans cal saber» + exemple resolt nou cada cop |
| ✍️ Pràctica | generador infinit amb correcció immediata, pistes, exemples i diagnòstic d'errors |
| ✅ Test | preguntes de teoria i de càlcul, incloses les dels exàmens reals |
| (L9) temari complet de la guia | sumes de Riemann, longituds de corbes, àrees de revolució, trapezis i Simpson |
| 📋 Llista oficial | (L0–L13) els exercicis de la llista de classe, amb solució i mestria per exercici |
| 🎓 A l'examen | (L0–L5) apartats dels parcials 2018–2026 de cada llista |

**Exàmens**: examen generat amb temporitzador, exàmens reals 2018–2026 amb solució, simulacre del 1r parcial,
**Què surt més** (freqüència de cada tema per any).
**Consulta**: formulari, apunts generals, plantilles i errors típics, problemes resolts, **📈 Dibuixa una funció** (amb f′ i f″), xuleta, PDFs.

## Dreceres de teclat (prem `?` per veure-les)

`Enter` comprova / següent · `Shift+Enter` pista · `Ctrl+Enter` solució · `Esc` surt de la casella o tanca el panell ·
`/` torna a la casella · `H` pista · `S` solució · `E` exemple · `N` següent · `1–6` opció de test ·
`G` i després `i/p/e/r/c/t/q/f/m` per navegar (`t` = mapa del temari, `q` = què estudiem i per què, `m` = mestria).

A pantalla ampla, l'enunciat és a l'esquerra i ajuda/solució a la dreta. Els botons no canvien de lloc
i en passar a la pregunta següent la pàgina no salta.

## Reset del progrés

Botó **🗑️ Reset progrés** al peu del menú (o al final de la pàgina de Mestria, on també pots exportar i importar el progrés).

## Estructura

```
web/index.html          pàgina principal
web/js/math.js          mini-CAS (parser, derivades simbòliques, correcció numèrica i diagnòstic d'errors)
web/js/core.js          registre de mòduls, correcció, progrés, gràfics
web/js/mod_*.js         un fitxer per llista: teoria + generadors + banc de preguntes
web/js/p1_gens.js       Derivades de 100 funcions + generadors de l'antic projecte adaptats
web/js/learn.js         conceptes, «de què va» de cada exercici, què cal saber, intros i missatges d'error
web/js/app.js           interfície general (menú, pràctica, panell de teoria, dreceres)
web/js/mestria.js       rangs, XP, ratxa, missions, repàs espaciat, proves de mestria, assoliments
web/js/guide.js         camí recomanat, recomanacions, test de nivell, dibuixa una funció
web/js/p1_ui.js         pàgines del 1r parcial i «Tria llistes i barreja»
web/js/p2_ui.js         exàmens reals i «Què surt» del 2n parcial
web/js/listtrain.js     llistes oficials L0–L13: entrenar exercici per exercici amb mestria
web/p2/data/llistes_p2.js  exercicis de les llistes 6–12 amb la solució verificada
web/js/examtrain.js     entrenament d'exàmens: mestria per apartat d'examen real
web/js/examrel.js       quant surt a l'examen cada habilitat (0–3)
web/js/gens_extra.js    tipus d'exercici afegits (inequacions, rectes, trigonometria, límits amb arrels, asímptotes)
web/js/gens_p2.js       tipus d'exercici del 2n parcial que faltaven (parts cícliques, integrals mixtes, Leibniz, àrees i volums
                        avançats, EDO amb canvi de variable, coeficients indeterminats, ressonància…)
web/js/gens_jocs.js     tipus d'exercici dels jocs (quin mètode, troba l'error, teoremes)
web/js/jocs.js          jocs, fitxes de teoremes, simulacre del 2n parcial, rúbrica i calibració
web/js/gens_tema.js     volums (anelles, capes), impròpies, mescles amb volum variable, refredament, raons de canvi, Maclaurin
web/js/temari.js        temari per blocs, resum de cada tema, focus, guia de la web i franja de propòsit
web/js/sem3_lib.js      motor del Seminari 3 (generadors, teoria, lliçons), aïllat dins window.SEM3
web/js/mod_sem3.js      habilitats del Seminari 3 (generadors; no és un mòdul)
web/js/sem3_ui.js       apartat #/seminari: pla, exercicis sencers, lliçons, habilitats, simulacre
web/js/dx_lib.js        motor de Càlcul dx (dades i generadors), aïllat dins window.DXLIB
web/js/mod_der.js       generadors de derivar (Càlcul dx)
web/js/mod_int.js       generadors d'integrar (Càlcul dx)
web/js/arbres.js        arbres d'habilitats (derivades, límits/L'Hôpital, extrems, integrar)
web/js/merge.js         fusiona seminari i dx amb les llistes: una sola mestria per a cada coneixement
web/p1/data/            dades del 1r parcial: llistes resoltes, exàmens, tests, temes, teoria
web/p2/data/            exàmens del 2n parcial resolts (exams_p2.js) i freqüència de temes
web/p1/legacy/          generadors i simulacre de l'antic projecte
web/recursos/pdf/       tots els PDFs
```

## Afegir contingut

- Nova llista: crea `web/js/mod_lXX.js` amb `Calc.add({...})` (mira `mod_l5.js`) i afegeix-lo a `index.html`.
- Nou examen: afegeix un objecte a `REAL_EXAMS` (`web/p1/data/exams.js`).
- Nou generador: `Calc.addGen('l2', {id, title, level, make(r){…}})` i la seva descripció a `learn.js` (`G`).
