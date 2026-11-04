/* ============================================================
   llistes_p2.js — Les llistes oficials 6–12, exercici per exercici,
   amb la solució completa. Mateix format que CLASS_LISTS (L0–L5):
   { id, title, short, stars, topic, exam, pdf, items:[{ n, q, sol, check?, g? }] }
   g = generador de la mateixa llista per practicar-ne de semblants.
   Totes les respostes s'han comprovat numèricament (derivant les
   primitives, substituint les solucions a l'EDO, integrant les àrees).
   On la resolució d'un company que circula tenia un error, la nota
   «⚠️» ho avisa.
   (La llista 13 és el final de gener de 2025: es fa servir l'examen
   que ja hi ha a P2_EXAMS, amb la mateixa mestria.)
   ============================================================ */
var CLASS_LISTS_P2 = (function () {
  const R = String.raw;
  return [
    /* ------------------------------------------------------------ L6 */
    {
      id: 'L6', short: 'Llista 6', stars: 1, pdf: 'llista6.pdf',
      title: 'Llista 6 — Interpolació polinòmica (Lagrange, Newton i error)',
      topic: "Polinomi interpolador amb la fórmula de Lagrange i amb diferències dividides de Newton; interpolar en un punt; cota de l'error.",
      exam: R`Al 2n parcial no ha sortit; al 1r parcial només una pregunta de test el 2025 (0,8 punts). <b>Entrena-la igualment</b> (et pot sortir al final), però prioritza les llistes 8–12.`,
      items: [
        { n: '1', g: 'basis', q: R`Obteniu el polinomi d'interpolació amb la fórmula de <b>Lagrange</b> per a la taula següent, i interpoleu en el punt $x=1$.
$$\begin{array}{c|cccc}x_k&-4&-3&2&-6\\\hline y_k&-16&-6&-10&-50\end{array}$$`,
          sol: R`$L_i(x)=\prod_{j\ne i}\frac{x-x_j}{x_i-x_j}$ i $P(x)=\sum y_iL_i(x)$.<br>
$L_0(x)=\frac{(x+3)(x-2)(x+6)}{(-1)(-6)(2)}=\frac{(x+3)(x-2)(x+6)}{12}$, $\;L_1(x)=\frac{(x+4)(x-2)(x+6)}{(1)(-5)(3)}=\frac{(x+4)(x-2)(x+6)}{-15}$,<br>
$L_2(x)=\frac{(x+4)(x+3)(x+6)}{(6)(5)(8)}=\frac{(x+4)(x+3)(x+6)}{240}$, $\;L_3(x)=\frac{(x+4)(x+3)(x-2)}{(-2)(-3)(-8)}=\frac{(x+4)(x+3)(x-2)}{-48}$.<br>
En $x=1$: $L_0(1)=\frac{4\cdot(-1)\cdot7}{12}=-\frac73$, $L_1(1)=\frac{5\cdot(-1)\cdot7}{-15}=\frac73$, $L_2(1)=\frac{5\cdot4\cdot7}{240}=\frac7{12}$, $L_3(1)=\frac{5\cdot4\cdot(-1)}{-48}=\frac5{12}$.<br>
(Comprovació: els $L_i(1)$ sumen 1.) $$P(1)=-16\left(-\tfrac73\right)-6\cdot\tfrac73-10\cdot\tfrac7{12}-50\cdot\tfrac5{12}=\frac{112-42}{3}-\frac{320}{12}=-\frac{10}{3}\approx-3{,}333$$`,
          check: { label: 'P(1) =', value: -10 / 3 } },
        { n: '2', g: 'value', q: R`Obteniu el polinomi d'interpolació amb la fórmula de <b>Lagrange</b> per a la taula següent, i interpoleu en el punt $x=-1$.
$$\begin{array}{c|ccccc}x_k&4&0&-6&1&-4\\\hline y_k&808&4&1438&10&160\end{array}$$`,
          sol: R`Calculem cada $L_i(-1)$ (numerador: producte de $(-1-x_j)$; denominador: producte de $(x_i-x_j)$, sempre $j\ne i$):<br>
$L_0(-1)=\frac{(-1)(5)(-2)(3)}{(4)(10)(3)(8)}=\frac{30}{960}=\frac1{32}$, $\quad L_1(-1)=\frac{(-5)(5)(-2)(3)}{(-4)(6)(-1)(4)}=\frac{150}{96}=\frac{25}{16}$,<br>
$L_2(-1)=\frac{(-5)(-1)(-2)(3)}{(-10)(-6)(-7)(-2)}=\frac{-30}{840}=-\frac1{28}$, $\quad L_3(-1)=\frac{(-5)(-1)(5)(3)}{(-3)(1)(7)(5)}=\frac{75}{-105}=-\frac57$,<br>
$L_4(-1)=\frac{(-5)(-1)(5)(-2)}{(-8)(-4)(2)(-5)}=\frac{-50}{-320}=\frac5{32}$.<br>
$$P(-1)=\frac{808}{32}+4\cdot\frac{25}{16}-\frac{1438}{28}-\frac{50}{7}+\frac{800}{32}=25{,}25+6{,}25-51{,}357-7{,}143+25=\mathbf{-2}$$
⚠️ Una resolució que circula dona $-52$: s'equivoca en el signe de $L_4(-1)$ (el denominador $(-8)(-4)(2)(-5)$ és <b>negatiu</b>, i el numerador també). <b>Truc de control:</b> els $L_i$ en qualsevol punt sumen 1: $\frac1{32}+\frac{25}{16}-\frac1{28}-\frac57+\frac5{32}=1$ ✓.`,
          check: { label: 'P(−1) =', value: -2 } },
        { n: '3', g: 'newton_coefs', q: R`Obteniu el polinomi d'interpolació amb la fórmula de <b>Newton amb diferències dividides</b> per a les dades següents, i interpoleu en $x=5$.
$$\begin{array}{c|ccccc}x_k&4&-4&7&6&2\\\hline y_k&278&-242&1430&908&40\end{array}$$`,
          sol: R`Ordre 1: $f[x_0,x_1]=\frac{-242-278}{-4-4}=65$, $f[x_1,x_2]=\frac{1430+242}{11}=152$, $f[x_2,x_3]=\frac{908-1430}{-1}=522$, $f[x_3,x_4]=\frac{40-908}{-4}=217$.<br>
Ordre 2: $\frac{152-65}{7-4}=29$, $\frac{522-152}{6+4}=37$, $\frac{217-522}{2-7}=61$.<br>
Ordre 3: $\frac{37-29}{6-4}=4$, $\frac{61-37}{2+4}=4$. $\quad$ Ordre 4: $\frac{4-4}{2-4}=0$ (el polinomi és de grau 3).<br>
$$P(x)=278+65(x-4)+29(x-4)(x+4)+4(x-4)(x+4)(x-7)$$
$$P(5)=278+65+29\cdot1\cdot9+4\cdot1\cdot9\cdot(-2)=278+65+261-72=\mathbf{532}$$
<b>Recorda:</b> el denominador d'una diferència d'ordre $k$ és $x_{i+k}-x_i$ (els extrems del tram), no la resta de dos nodes consecutius.`,
          check: { label: 'P(5) =', value: 532 } },
        { n: '4', g: 'dd', q: R`Obteniu el polinomi d'interpolació amb la fórmula de <b>Newton amb diferències dividides</b> per a les dades següents, i interpoleu en $x=1$.
$$\begin{array}{c|cccccc}x_k&3&-3&4&-7&2&6\\\hline y_k&-144&-180&-460&-5124&-30&-2394\end{array}$$`,
          sol: R`Taula de diferències dividides:<br>
Ordre 1: $6,\ -40,\ 424,\ 566,\ -591$.<br>
Ordre 2: $\frac{-40-6}{4-3}=-46$, $\frac{424+40}{-7+3}=-116$, $\frac{566-424}{2-4}=-71$, $\frac{-591-566}{6-(-7)}=-89$.<br>
Ordre 3: $\frac{-116+46}{-7-3}=7$, $\frac{-71+116}{2+3}=9$, $\frac{-89+71}{6-4}=-9$.<br>
Ordre 4: $\frac{9-7}{2-3}=-2$, $\frac{-9-9}{6+3}=-2$. $\quad$ Ordre 5: $0$ (grau 4).<br>
$$P(x)=-144+6(x-3)-46(x-3)(x+3)+7(x-3)(x+3)(x-4)-2(x-3)(x+3)(x-4)(x+7)$$
$$P(1)=-144-12+368+168-384=\mathbf{-4}$$
⚠️ Una resolució que circula dona 452: en $f[x_3,x_4,x_5]$ divideix per $6-2$ en lloc de $x_5-x_3=6-(-7)=13$, i l'error s'arrossega. Comprovació: $P(4)=-144+6-46\cdot7+0=-460$ ✓.`,
          check: { label: 'P(1) =', value: -4 } },
        { n: '5', g: 'bound', q: R`Es vol aproximar $f(x)=\cos(\pi x)$ a l'interval $[1,2]$ amb interpolació polinòmica amb els 4 nodes $x=1{,}5;\ 1{,}8;\ 1{,}1;\ 1{,}3$. Quin és l'error màxim teòric que es cometria en el punt $x=1{,}9$? I quin és l'error real?`,
          sol: R`Amb 4 nodes ($n=3$): $E(x)=\frac{f^{(4)}(\xi)}{4!}\prod_{i=0}^{3}(x-x_i)$.<br>
$f^{(4)}(x)=\pi^4\cos(\pi x)$, així que $|f^{(4)}(\xi)|\le\pi^4$.<br>
$\prod(1{,}9-x_i)=(0{,}4)(0{,}1)(0{,}8)(0{,}6)=0{,}0192$.
$$|E(1{,}9)|\le\frac{\pi^4}{24}\cdot0{,}0192\approx\mathbf{0{,}0779}$$
Error real: $y_i=\cos(\pi x_i)$: $0;\ 0{,}8090;\ -0{,}9511;\ -0{,}5878$. Amb Lagrange, $L_0(1{,}9)=-2$, $L_1(1{,}9)\approx1{,}8286$, $L_2(1{,}9)\approx-0{,}4286$, $L_3(1{,}9)=1{,}6$, i $P_3(1{,}9)\approx0{,}9465$.<br>
$f(1{,}9)=\cos(1{,}9\pi)\approx0{,}9511$, per tant l'error real és $\approx\mathbf{0{,}0046}$, menor que la cota ✓.`,
          check: { label: 'cota de l\'error ≈', value: 0.0779, tol: 1e-3 } },
        { n: '6', g: 'bound', q: R`Es vol aproximar $f(x)=5^x$ a l'interval $[0,2]$ amb interpolació polinòmica amb 5 punts equidistants. Quin és l'error màxim teòric en el punt $0{,}9$? I quin és l'error real?`,
          sol: R`Nodes: $0;\ 0{,}5;\ 1;\ 1{,}5;\ 2$ ($n=4$), per tant $E(x)=\frac{f^{(5)}(\xi)}{5!}\prod(x-x_i)$.<br>
$f^{(k)}(x)=(\ln5)^k5^x$, creixent: el màxim a $[0,2]$ és $|f^{(5)}|\le(\ln5)^5\cdot5^2$.<br>
$\prod(0{,}9-x_i)=(0{,}9)(0{,}4)(-0{,}1)(-0{,}6)(-1{,}1)=-0{,}02376$.
$$|E(0{,}9)|\le\frac{(\ln5)^5\cdot25}{120}\cdot0{,}02376\approx\mathbf{0{,}0535}$$
Error real: $P_4(0{,}9)=1\cdot\left(-\frac{11}{625}\right)+\sqrt5\cdot\frac{99}{625}+5\cdot\frac{594}{625}+5\sqrt5\cdot\left(-\frac{66}{625}\right)+25\cdot\frac{9}{625}\approx4{,}2679$, i $5^{0{,}9}\approx4{,}2567$: error real $\approx\mathbf{0{,}0112}$.`,
          check: { label: 'cota de l\'error ≈', value: 0.0535, tol: 1e-3 } },
        { n: '7', g: 'bound', q: R`Considereu la taula de $f(x)=\ln x$: $\;\ln1=0,\ \ln2=0{,}693147,\ \ln3=1{,}09861$. Calculeu una cota de l'error si s'aproxima $\ln1{,}5$ amb el polinomi interpolador de totes les dades.`,
          sol: R`3 nodes ($n=2$): $E(x)=\frac{f'''(\xi)}{3!}(x-1)(x-2)(x-3)$, amb $\xi\in[1,3]$.<br>
$f'''(x)=\frac2{x^3}$, decreixent: màxim en $x=1$, $|f'''(\xi)|\le2$.<br>
$|(1{,}5-1)(1{,}5-2)(1{,}5-3)|=0{,}5\cdot0{,}5\cdot1{,}5=0{,}375$.
$$|E(1{,}5)|\le\frac{2}{6}\cdot0{,}375=\mathbf{0{,}125}$$
(De fet, $P(1{,}5)\approx0{,}3825$ i $\ln1{,}5\approx0{,}4055$: error real $0{,}023$.)`,
          check: { label: 'cota =', value: 0.125 } }
      ]
    },
    /* ------------------------------------------------------------ L7 */
    {
      id: 'L7', short: 'Llista 7', stars: 2, pdf: 'llista7.pdf',
      title: 'Llista 7 — Mètode de Newton i primitives (substitució, parts, trigonomètriques)',
      topic: 'Newton per a extrems i inflexions; primitives immediates i per canvi de variable; integració per parts; potències de sin i cos.',
      exam: R`Les primitives de la llista 7 són <b>dins de gairebé tots els exercicis del 2n parcial</b>: $\int\sin^3x\cos^4x$ (solucionari), $\int\frac{\sqrt{1+\ln x}}{x}$ (2024), $\int x^2e^{2x}$ per parts dins d'un volum (2025). Sense aquesta llista no pots fer àrees, volums ni EDOs.`,
      items: [
        { n: '1–2', g: 'newton_extreme', q: R`Justifiqueu que $f(x)=\frac{x^4}{4}-x^2-x$ té un mínim absolut a l'interval $[0,2]$, i calculeu-lo amb el mètode de Newton amb sis xifres decimals correctes.`,
          sol: R`$f$ és contínua a $[0,2]$ (tancat i fitat) ⇒ pel <b>teorema de Weierstrass</b> té màxim i mínim absoluts.<br>
$f'(x)=x^3-2x-1=(x+1)(x^2-x-1)$, $f''(x)=3x^2-2$. A $[0,2]$, $f'(0)=-1\lt0$ i $f'(2)=3\gt0$: hi ha un punt crític on $f'$ canvia de $-$ a $+$ (mínim).<br>
Newton sobre $f'$: $x_{n+1}=x_n-\frac{x_n^3-2x_n-1}{3x_n^2-2}$, amb $x_0=2$: $x_1=1{,}7$, $x_2=1{,}623088$, $x_3=1{,}618055$, $x_4=1{,}618034$, $x_5=1{,}618034$ (ja no canvia).<br>
(És exactament $\frac{1+\sqrt5}2$.) Valors: $f(0)=0$, $f(2)=-2$, $f(1{,}618034)\approx-2{,}522542$.
$$\text{Mínim absolut: }(1{,}618034,\ -2{,}522542)$$`,
          check: { label: 'x del mínim ≈', value: 1.618034, tol: 1e-5 } },
        { n: '3', g: 'newton_extreme', q: R`Utilitzant el mètode de Newton, trobeu el punt d'inflexió de $f(x)=e^{\cos x}$ ($0\le x\le\pi$) amb sis xifres decimals.`,
          sol: R`$f'(x)=-\sin x\,e^{\cos x}$, $\;f''(x)=e^{\cos x}(\sin^2x-\cos x)$. Com que $e^{\cos x}\gt0$, cal resoldre $g(x)=\sin^2x-\cos x=0$.<br>
$g(0)=-1\lt0$, $g(\pi/2)=1\gt0$: hi ha canvi de signe (i, per tant, de concavitat).<br>
Newton: $g'(x)=2\sin x\cos x+\sin x$, amb $x_0=0{,}9$: $x_1=0{,}904558$, $x_2=0{,}904557$, $x_3=0{,}904557$.<br>
(Comprovació exacta: $\sin^2x=1-\cos^2x$ dona $\cos^2x+\cos x-1=0$, $\cos x=\frac{\sqrt5-1}2$, $x=\arccos(0{,}618034)=0{,}904557$.)
$$\text{Punt d'inflexió: }x\approx0{,}904557$$`,
          check: { label: 'x ≈', value: 0.904557, tol: 1e-5 } },
        { n: '4a', g: 'subst', q: R`$\displaystyle\int\frac{e^x}{3+e^x}\,dx$`, sol: R`$u=3+e^x$, $du=e^xdx$: $\int\frac{du}u=\ln|u|$. $$\ln(3+e^x)+C$$` },
        { n: '4b', g: 'subst', q: R`$\displaystyle\int\frac{x}{\sqrt{1-x^2}}\,dx$`, sol: R`$u=1-x^2$, $du=-2x\,dx$: $-\frac12\int u^{-1/2}du=-\sqrt u$. $$-\sqrt{1-x^2}+C$$` },
        { n: '4c', g: 'subst', q: R`$\displaystyle\int\frac{\sin(1/x)}{x^2}\,dx$`, sol: R`$u=\frac1x$, $du=-\frac{dx}{x^2}$: $-\int\sin u\,du=\cos u$. $$\cos\frac1x+C$$` },
        { n: '4d', g: 'subst', q: R`$\displaystyle\int\frac{e^{2x}}{\sqrt{1+e^{2x}}}\,dx$`, sol: R`$u=1+e^{2x}$, $du=2e^{2x}dx$: $\frac12\int u^{-1/2}du=\sqrt u$. $$\sqrt{1+e^{2x}}+C$$` },
        { n: '4e', g: 'subst', q: R`$\displaystyle\int\frac{\ln^2x}{x}\,dx$`, sol: R`$u=\ln x$, $du=\frac{dx}x$: $\int u^2du=\frac{u^3}3$. $$\frac{(\ln x)^3}{3}+C$$` },
        { n: '4f', g: 'subst', q: R`$\displaystyle\int\frac{\sin x}{\sqrt{\cos^3x}}\,dx$`, sol: R`$u=\cos x$, $du=-\sin x\,dx$: $-\int u^{-3/2}du=-\frac{u^{-1/2}}{-1/2}=2u^{-1/2}$. $$\frac{2}{\sqrt{\cos x}}+C$$` },
        { n: '5a', g: 'trigint', q: R`$\displaystyle\int\sin^2x\,dx$`, sol: R`Potència <b>parella</b>: angle doble, $\sin^2x=\frac{1-\cos2x}2$. $$\frac x2-\frac{\sin2x}{4}+C$$` },
        { n: '5b', g: 'parts_log', q: R`$\displaystyle\int(\ln x)^2\,dx$`, sol: R`Per parts amb $u=(\ln x)^2$, $dv=dx$: $du=\frac{2\ln x}x dx$, $v=x$. $\int(\ln x)^2=x\ln^2x-2\int\ln x\,dx=x\ln^2x-2(x\ln x-x)$. $$x\left(\ln^2x-2\ln x+2\right)+C$$` },
        { n: '5c', g: 'parts', q: R`$\displaystyle\int x\sin^2x\,dx$`, sol: R`$\sin^2x=\frac{1-\cos2x}2$: $\int x\sin^2x=\frac{x^2}4-\frac12\int x\cos2x\,dx$. Per parts ($u=x$, $dv=\cos2x\,dx$): $\int x\cos2x=\frac{x\sin2x}2+\frac{\cos2x}4$. $$\frac{x^2}{4}-\frac{x\sin2x}{4}-\frac{\cos2x}{8}+C$$` },
        { n: '5d', g: 'parts_log', q: R`$\displaystyle\int(x^3+1)\ln x\,dx$`, sol: R`Per parts amb $u=\ln x$ (el logaritme sempre és la $u$), $dv=(x^3+1)dx$, $v=\frac{x^4}4+x$: $\left(\frac{x^4}4+x\right)\ln x-\int\left(\frac{x^3}4+1\right)dx$. $$\left(\frac{x^4}{4}+x\right)\ln x-\frac{x^4}{16}-x+C$$` },
        { n: '5e', g: 'subst', q: R`$\displaystyle\int\frac{1}{1+e^x}\,dx$`, sol: R`Truc: $\frac1{1+e^x}=\frac{1+e^x-e^x}{1+e^x}=1-\frac{e^x}{1+e^x}$. (O bé $u=e^x$ i fraccions simples.) $$x-\ln(1+e^x)+C$$` },
        { n: '6a', g: 'parts', q: R`Per parts: $\displaystyle\int x^2\cos x\,dx$`, sol: R`Dues vegades per parts (el polinomi és la $u$): $u=x^2$, $dv=\cos x\,dx$ ⇒ $x^2\sin x-\int2x\sin x\,dx$; i $\int2x\sin x=-2x\cos x+2\sin x$. $$x^2\sin x+2x\cos x-2\sin x+C$$` },
        { n: '6b', g: 'parts_cyc', q: R`Per parts: $\displaystyle\int e^{2x}\sin x\,dx$`, sol: R`Integral <b>cíclica</b>: dues vegades per parts i torna a sortir $I$. Amb $u=\sin x$, $dv=e^{2x}dx$: $I=\frac{e^{2x}\sin x}2-\frac12\int e^{2x}\cos x$, i $\int e^{2x}\cos x=\frac{e^{2x}\cos x}2+\frac12I$. Per tant $I=\frac{e^{2x}\sin x}2-\frac{e^{2x}\cos x}4-\frac I4$ ⇒ $\frac54I=\dots$ $$\frac{e^{2x}(2\sin x-\cos x)}{5}+C$$` },
        { n: '6c', g: 'parts', q: R`Per parts: $\displaystyle\int\arctan x\,dx$`, sol: R`$u=\arctan x$, $dv=dx$: $du=\frac{dx}{1+x^2}$, $v=x$. $x\arctan x-\int\frac{x}{1+x^2}dx$, i amb $t=1+x^2$ la integral és $\frac12\ln(1+x^2)$. $$x\arctan x-\frac12\ln(1+x^2)+C$$` }
      ]
    },
    /* ------------------------------------------------------------ L8 */
    {
      id: 'L8', short: 'Llista 8', stars: 3, pdf: 'llista8.pdf',
      title: 'Llista 8 — Fraccions simples i integrals trigonomètriques',
      topic: 'Descomposició en fraccions simples (arrels simples, dobles i factor irreductible ⇒ arctan), divisió de polinomis, potències senars de sin/cos.',
      exam: R`<b>Surt a TOTS els 2ns parcials</b>: $\int\frac{x}{(x-3)(x^2+4)}$ (2024), $\int\frac{1}{(x-1)(x^2+2x+2)}$ (2023), $\int\frac{x^2}{(x-1)(x+1)^2}$ (2025), $\frac{3x^2+5x+2}{x(x^2+1)}$ (solucionari) i la pregunta de test de 2025. Els exercicis 2c i 2e són exactament el tipus d'examen.`,
      items: [
        { n: '1a', g: 'int_simple', q: R`$\displaystyle\int\frac{9x-6}{(x-1)(x+2)}\,dx$`, sol: R`$\frac{9x-6}{(x-1)(x+2)}=\frac A{x-1}+\frac B{x+2}$ ⇒ $9x-6=A(x+2)+B(x-1)$. $x=1$: $3=3A$, $A=1$. $x=-2$: $-24=-3B$, $B=8$. $$\ln|x-1|+8\ln|x+2|+C$$` },
        { n: '1b', g: 'int_simple', q: R`$\displaystyle\int\frac{2x+14}{x^2-2x-8}\,dx$`, sol: R`$x^2-2x-8=(x-4)(x+2)$. $2x+14=A(x+2)+B(x-4)$: $x=4$: $22=6A$, $A=\frac{11}3$; $x=-2$: $10=-6B$, $B=-\frac53$. $$\frac{11}{3}\ln|x-4|-\frac53\ln|x+2|+C$$` },
        { n: '1c', g: 'int_arctan', q: R`$\displaystyle\int\frac{7x+19}{x^2+4}\,dx$`, sol: R`El denominador no té arrels reals: es separa en part «logaritme» i part «arctan». $\int\frac{7x}{x^2+4}=\frac72\ln(x^2+4)$ i $\int\frac{19}{x^2+4}=\frac{19}2\arctan\frac x2$ (perquè $\int\frac{du}{u^2+a^2}=\frac1a\arctan\frac ua$). $$\frac72\ln(x^2+4)+\frac{19}{2}\arctan\frac x2+C$$` },
        { n: '1d', g: 'int_simple', q: R`$\displaystyle\int\frac{4x-5}{(x-2)(x-1)}\,dx$`, sol: R`$4x-5=A(x-1)+B(x-2)$: $x=2$: $A=3$; $x=1$: $-1=-B$, $B=1$. $$3\ln|x-2|+\ln|x-1|+C$$` },
        { n: '2a', g: 'coef2', q: R`$\displaystyle\int\frac{13}{(x+4)(x-3)}\,dx$`, sol: R`$13=A(x-3)+B(x+4)$: $x=3$: $B=\frac{13}7$; $x=-4$: $A=-\frac{13}7$. $$\frac{13}{7}\ln\left|\frac{x-3}{x+4}\right|+C$$` },
        { n: '2b', g: 'int_cubic', q: R`$\displaystyle\int\frac{x^2-5}{x^3-19x-30}\,dx$`, sol: R`Ruffini amb $x=-2$: $x^3-19x-30=(x+2)(x^2-2x-15)=(x+2)(x+3)(x-5)$.<br>
$x^2-5=A(x+3)(x-5)+B(x+2)(x-5)+C(x+2)(x+3)$: $x=-2$: $-1=-7A$, $A=\frac17$; $x=-3$: $4=8B$, $B=\frac12$; $x=5$: $20=56C$, $C=\frac5{14}$.
$$\frac17\ln|x+2|+\frac12\ln|x+3|+\frac{5}{14}\ln|x-5|+C$$` },
        { n: '2c', g: 'int_dbl_simple', q: R`$\displaystyle\int\frac{x^2-5}{(x+2)^2(x+1)}\,dx$`, sol: R`Arrel doble ⇒ $\frac A{x+1}+\frac B{x+2}+\frac C{(x+2)^2}$. $x^2-5=A(x+2)^2+B(x+1)(x+2)+C(x+1)$.<br>
$x=-1$: $-4=A$. $x=-2$: $-1=-C$, $C=1$. Coeficient de $x^2$: $1=A+B$, $B=5$.<br>
$\int\frac{dx}{(x+2)^2}=-\frac1{x+2}$. $$-4\ln|x+1|+5\ln|x+2|-\frac{1}{x+2}+C$$` },
        { n: '2d', g: 'int_arctan', q: R`$\displaystyle\int\frac{x}{(x+1)^2+4}\,dx$`, sol: R`Canvi $u=x+1$ ($x=u-1$): $\int\frac{u-1}{u^2+4}du=\frac12\ln(u^2+4)-\frac12\arctan\frac u2$.
$$\frac12\ln\big((x+1)^2+4\big)-\frac12\arctan\frac{x+1}{2}+C$$
⚠️ Compte amb el signe: és $\int\frac u{u^2+4}\,\mathbf{-}\int\frac1{u^2+4}$ (una resolució que circula hi posa $+$). Comprova-ho derivant.` },
        { n: '2e', g: 'int_mixed', q: R`$\displaystyle\int\frac{x-5}{(x^2+6x+10)(x+1)}\,dx$`, sol: R`$x^2+6x+10=(x+3)^2+1$ no té arrels reals. $\frac{x-5}{(x^2+6x+10)(x+1)}=\frac A{x+1}+\frac{Bx+C}{x^2+6x+10}$.<br>
$x=-1$: $-6=5A$, $A=-\frac65$. Coeficients: $x^2$: $A+B=0$ ⇒ $B=\frac65$; terme independent: $10A+C=-5$ ⇒ $C=7$.<br>
$\frac65x+7=\frac65(x+3)+\frac{17}5$, per tant $\int\frac{\frac65(x+3)+\frac{17}5}{(x+3)^2+1}=\frac35\ln\big((x+3)^2+1\big)+\frac{17}5\arctan(x+3)$.
$$-\frac65\ln|x+1|+\frac35\ln(x^2+6x+10)+\frac{17}{5}\arctan(x+3)+C$$` },
        { n: '3a', g: 'int_improper', q: R`$\displaystyle\int\frac{x^2+4x+6}{x^2-4x+5}\,dx$`, sol: R`Mateix grau ⇒ primer divideix: $\frac{x^2+4x+6}{x^2-4x+5}=1+\frac{8x+1}{x^2-4x+5}$. I $x^2-4x+5=(x-2)^2+1$.<br>
$8x+1=8(x-2)+17$: $\int\frac{8(x-2)}{(x-2)^2+1}=4\ln\big((x-2)^2+1\big)$ i $\int\frac{17}{(x-2)^2+1}=17\arctan(x-2)$.
$$x+4\ln(x^2-4x+5)+17\arctan(x-2)+C$$
⚠️ Una resolució que circula dona $x+\arctan(x-2)$: s'oblida de dividir bé (el residu és $8x+1$, no $1$). Derivant ho veus de seguida.` },
        { n: '3b', g: 'int_improper', q: R`$\displaystyle\int\frac{x^2+x+3}{(x+1)^2}\,dx$`, sol: R`$u=x+1$: $x^2+x+3=u^2-u+3$, i $\int\frac{u^2-u+3}{u^2}du=\int\left(1-\frac1u+\frac3{u^2}\right)du=u-\ln|u|-\frac3u$.
$$x-\ln|x+1|-\frac{3}{x+1}+C$$ (la constant $+1$ de $u=x+1$ s'absorbeix a $C$).` },
        { n: '4a', g: 'l7.trigint', q: R`$\displaystyle\int\cos^2x\,\sin^3x\,dx$`, sol: R`Potència <b>senar</b> de $\sin$: guarda un $\sin x$ i passa la resta a $\cos$: $\cos^2x(1-\cos^2x)\sin x$. Amb $u=\cos x$, $du=-\sin x\,dx$: $-\int(u^2-u^4)du$. $$-\frac{\cos^3x}{3}+\frac{\cos^5x}{5}+C$$` },
        { n: '4b', g: 'l7.trigint', q: R`$\displaystyle\int\cos^4x\,\sin^3x\,dx$`, sol: R`Igual: $\cos^4x(1-\cos^2x)\sin x$, $u=\cos x$: $-\int(u^4-u^6)du$. $$-\frac{\cos^5x}{5}+\frac{\cos^7x}{7}+C$$ (És la mateixa integral que el test del solucionari del 2n parcial.)` },
        { n: '4c', g: 'l7.trigint', q: R`$\displaystyle\int\cos^3x\,\sin^3x\,dx$`, sol: R`Totes dues senars: tria'n una. Amb $\cos^3x(1-\cos^2x)\sin x$ i $u=\cos x$: $-\int(u^3-u^5)du$. $$-\frac{\cos^4x}{4}+\frac{\cos^6x}{6}+C$$ (Si tries $u=\sin x$ surt $\frac{\sin^4x}4-\frac{\sin^6x}6$: és el mateix llevat d'una constant.)` },
        { n: '4d', g: 'l7.trigint', q: R`$\displaystyle\int\cos^3(3x)\,dx$`, sol: R`$\cos^3(3x)=(1-\sin^2 3x)\cos3x$, i $u=\sin3x$, $du=3\cos3x\,dx$: $\frac13\int(1-u^2)du$. $$\frac{\sin3x}{3}-\frac{\sin^33x}{9}+C$$` }
      ]
    },
    /* ------------------------------------------------------------ L9 */
    {
      id: 'L9', short: 'Llista 9', stars: 3, pdf: 'llista9.pdf',
      title: 'Llista 9 — Teorema fonamental, àrees i volums de revolució',
      topic: 'Derivar F(x)=∫f (Leibniz), punts crítics de F; àrees entre corbes; volums de revolució (discs i capes cilíndriques).',
      exam: R`<b>La llista que més punts dona al 2n parcial.</b> Derivar $\int_0^{x^3}$ (2024, 2025, 2023), àrea entre corbes (2023, 2025, solucionari), volums (2024 $\sin3x$, 2025 $xe^x$) i àrea amb $\sin^3\cos^3$ (2024).`,
      items: [
        { n: '1', g: 'ftc_crit', q: R`Demostreu que $f(x)=\displaystyle\int_{-1}^{x}\sqrt{\ln(t^2+1)}\,dt$ té un punt crític en $x=0$.`,
          sol: R`L'integrand és continu, així que pel <b>teorema fonamental del càlcul</b> $f'(x)=\sqrt{\ln(x^2+1)}$.<br>
$f'(0)=\sqrt{\ln1}=0$ ⇒ $x=0$ és un punt crític. (De fet és l'únic: $\ln(x^2+1)=0\iff x=0$.)` },
        { n: '2', g: 'ftc_value', q: R`Sigui $f:[0,1]\to\mathbb R$ contínua amb $\int_0^1f(t)\,dt=1$. És cert que sempre existeix $c\in(0,1)$ tal que $\int_0^cf(t)\,dt=\frac13$? Raoneu-ho.`,
          sol: R`<b>Sí.</b> Sigui $F(x)=\int_0^xf(t)\,dt$. Com que $f$ és contínua, $F$ és contínua (i derivable) a $[0,1]$.<br>
$F(0)=0$ i $F(1)=1$, i $0\lt\frac13\lt1$. Pel <b>teorema dels valors intermedis</b> (Bolzano aplicat a $F(x)-\frac13$), existeix $c\in(0,1)$ amb $F(c)=\frac13$.<br>
(A l'examen: anomena el teorema, comprova'n les hipòtesis — continuïtat de $F$ — i escriu els valors als extrems.)` },
        { n: '3', g: 'ftc_crit', q: R`Sigui $F(x)=\displaystyle\int_0^x\frac{\sin t}{t}\,dt$ amb $x\in\left(\frac\pi2,\frac{3\pi}2\right)$. (a) Determineu els punts crítics de $F$. (b) Raoneu si són màxims, mínims o cap de les dues coses.`,
          sol: R`(a) $F'(x)=\frac{\sin x}{x}=0\iff\sin x=0$. A $\left(\frac\pi2,\frac{3\pi}2\right)$ l'únic és $x=\pi$.<br>
(b) $F''(x)=\frac{x\cos x-\sin x}{x^2}$, i $F''(\pi)=\frac{\pi\cdot(-1)-0}{\pi^2}=-\frac1\pi\lt0$ ⇒ <b>màxim relatiu</b> en $x=\pi$.<br>
(Amb signes: $F'\gt0$ abans de $\pi$ i $F'\lt0$ després.) ⚠️ Una resolució que circula escriu $F''(\pi)\gt0$ i conclou «màxim»: la conclusió és bona però el signe està malament, i amb $F''\gt0$ seria un mínim.` },
        { n: '4', g: 'ftc_concav', q: R`Sigui $F(x)=\displaystyle\int_0^{x^2}e^{-t^2}\,dt$. (a) Calculeu $F'(x)$, els intervals de creixement i decreixement i els extrems. (b) Determineu la convexitat/concavitat i els punts d'inflexió.`,
          sol: R`(a) <b>Leibniz:</b> $F'(x)=e^{-(x^2)^2}\cdot2x=2xe^{-x^4}$. Signe de $F'$ = signe de $x$: decreixent a $(-\infty,0)$, creixent a $(0,\infty)$, <b>mínim</b> en $x=0$ ($F(0)=0$).<br>
(b) $F''(x)=2e^{-x^4}+2x\cdot(-4x^3)e^{-x^4}=2e^{-x^4}(1-4x^4)$. $F''=0\iff x^4=\frac14\iff x=\pm\frac1{\sqrt2}$.<br>
$F''\gt0$ (convexa, ∪) a $\left(-\frac1{\sqrt2},\frac1{\sqrt2}\right)$; $F''\lt0$ (còncava, ∩) a $\left(-\infty,-\frac1{\sqrt2}\right)\cup\left(\frac1{\sqrt2},\infty\right)$.<br>
Punts d'inflexió: $x=\pm\frac1{\sqrt2}$, amb $F\left(\pm\frac1{\sqrt2}\right)=\int_0^{1/2}e^{-t^2}dt\approx0{,}4613$.` },
        { n: '5a', g: 'area_between', q: R`Dibuixeu la regió limitada per $y=4x$ i $y=x^3$ i calculeu-ne l'àrea.`, sol: R`Talls: $x^3=4x\iff x\in\{-2,0,2\}$. A $[-2,0]$ va per sobre $x^3$; a $[0,2]$, $4x$. $$A=\int_{-2}^0(x^3-4x)dx+\int_0^2(4x-x^3)dx=4+4=8$$ (Per simetria senar, $2\int_0^2$.)`, check: { label: 'Àrea =', value: 8 } },
        { n: '5b', g: 'area_between', q: R`Dibuixeu la regió limitada per $y=\sqrt x$ i $y=x^2$ i calculeu-ne l'àrea.`, sol: R`Talls en $x=0$ i $x=1$; a $[0,1]$, $\sqrt x\ge x^2$. $$A=\int_0^1(\sqrt x-x^2)dx=\frac23-\frac13=\frac13$$`, check: { label: 'Àrea =', value: 1 / 3 } },
        { n: '5c', g: 'area_between', q: R`Dibuixeu la regió limitada per $y=6x-x^2$ i $y=2x$ i calculeu-ne l'àrea.`, sol: R`$6x-x^2=2x\iff x(4-x)=0$: $x=0,4$. $$A=\int_0^4(4x-x^2)dx=\left[2x^2-\frac{x^3}3\right]_0^4=32-\frac{64}3=\frac{32}{3}$$`, check: { label: 'Àrea =', value: 32 / 3 } },
        { n: '5d', g: 'area_between', q: R`Dibuixeu la regió limitada per $y=\sin x$ i $y=\frac{2x}{\pi}$ i calculeu-ne l'àrea.`, sol: R`Talls: $x=-\frac\pi2,0,\frac\pi2$. A $[0,\frac\pi2]$, $\sin x\ge\frac{2x}\pi$ (sinus còncau per sobre de la corda). Per simetria senar: $$A=2\int_0^{\pi/2}\left(\sin x-\frac{2x}{\pi}\right)dx=2\left[-\cos x-\frac{x^2}\pi\right]_0^{\pi/2}=2\left(1-\frac\pi4\right)=2-\frac\pi2$$`, check: { label: 'Àrea ≈', value: 2 - Math.PI / 2, tol: 1e-3 } },
        { n: '6', g: 'area_parts', q: R`Calculeu l'àrea tancada per la gràfica de $f(x)=\cos^3x\,\sin^7x$, l'eix d'abscisses i les rectes $x=0$, $x=\frac\pi4$.`,
          sol: R`A $[0,\frac\pi4]$, $f\ge0$. Potència senar de $\cos$: $\cos^3x\sin^7x=(1-\sin^2x)\sin^7x\cos x$, i $u=\sin x$ (de $0$ a $\frac{\sqrt2}2$):
$$\int_0^{\sqrt2/2}(u^7-u^9)du=\left[\frac{u^8}8-\frac{u^{10}}{10}\right]_0^{\sqrt2/2}=\frac{1/16}{8}-\frac{1/32}{10}=\frac1{128}-\frac1{320}=\frac{3}{640}$$`, check: { label: 'Àrea =', value: 3 / 640 } },
        { n: '7', g: 'area_between', q: R`Calculeu l'àrea de la regió tancada per $y=5-x^2$ i $y=3-x$. (Els apartats a–c d'aquest exercici són els mateixos que el 5.)`,
          sol: R`$5-x^2=3-x\iff x^2-x-2=0\iff x=-1,\ 2$. La paràbola va per sobre. $$A=\int_{-1}^2(-x^2+x+2)dx=\left[-\frac{x^3}3+\frac{x^2}2+2x\right]_{-1}^2=\frac{10}3-\left(-\frac76\right)=\frac92$$`, check: { label: 'Àrea =', value: 4.5 } },
        { n: '8', g: 'volume_adv', q: R`Calculeu el volum del cos de revolució obtingut en girar al voltant de l'<b>eix $Y$</b> la regió limitada per $f(x)=\frac{\ln x}{x^2}$ i les rectes $x=1$, $x=e$.`,
          sol: R`Gir al voltant de l'eix $Y$ d'una regió donada com $y=f(x)$ ⇒ <b>capes cilíndriques</b>: $V=2\pi\int_a^b x\,f(x)\,dx$ (radi $x$, alçada $f(x)$).
$$V=2\pi\int_1^e x\cdot\frac{\ln x}{x^2}dx=2\pi\int_1^e\frac{\ln x}{x}dx=2\pi\left[\frac{\ln^2x}2\right]_1^e=\pi$$`, check: { label: 'V ≈', value: Math.PI, tol: 1e-3 } },
        { n: '9', g: 'volume', q: R`Calculeu el volum del cos de revolució obtingut en girar al voltant de l'<b>eix $X$</b> la regió limitada per $f(x)=e^x$ i l'eix $X$ entre $x=0$ i $x=\frac12$.`,
          sol: R`<b>Discs:</b> $V=\pi\int_a^bf(x)^2dx$. $$V=\pi\int_0^{1/2}e^{2x}dx=\pi\left[\frac{e^{2x}}2\right]_0^{1/2}=\frac\pi2(e-1)$$`, check: { label: 'V ≈', value: Math.PI / 2 * (Math.E - 1), tol: 1e-3 } },
        { n: '10', g: 'volume_adv', q: R`(a) Calculeu el volum engendrat per l'ona $y=\cos x$ entre $0$ i $\frac\pi2$ en girar al voltant de l'eix d'abscisses. (b) Calculeu també el volum en girar al voltant de l'eix d'ordenades.`,
          sol: R`(a) Discs: $V=\pi\int_0^{\pi/2}\cos^2x\,dx=\pi\int_0^{\pi/2}\frac{1+\cos2x}2dx=\pi\cdot\frac\pi4=\frac{\pi^2}{4}\approx2{,}467$.<br>
(b) Capes: $V=2\pi\int_0^{\pi/2}x\cos x\,dx$. Per parts, $\int x\cos x=x\sin x+\cos x$: $2\pi\left[x\sin x+\cos x\right]_0^{\pi/2}=2\pi\left(\frac\pi2-1\right)=\pi^2-2\pi\approx3{,}586$.`, check: { label: 'V (eix X) ≈', value: Math.PI * Math.PI / 4, tol: 1e-3 } },
        { n: '11', g: 'area_axis', q: R`Calculeu l'àrea del conjunt, dins del semiplà $\{x\ge0\}$, limitat per la gràfica de $f(x)=2x^2$, la recta $y+2x-12=0$ i l'eix d'abscisses ($y=0$).`,
          sol: R`La recta és $y=12-2x$ (talla l'eix $X$ en $x=6$). Tall amb la paràbola: $2x^2=12-2x\iff x^2+x-6=0\iff x=2$ (amb $x\ge0$).<br>
La regió té per sostre la paràbola a $[0,2]$ i la recta a $[2,6]$:
$$A=\int_0^2 2x^2dx+\int_2^6(12-2x)dx=\frac{16}3+16=\frac{64}{3}$$`, check: { label: 'Àrea =', value: 64 / 3 } },
        { n: '12', g: 'defint', q: R`Calculeu $\displaystyle\int_0^{\pi/4}x\cos(2x)\,dx$.`,
          sol: R`Per parts ($u=x$, $dv=\cos2x\,dx$): $\int x\cos2x=\frac{x\sin2x}2+\frac{\cos2x}4$. $$\left[\frac{x\sin2x}2+\frac{\cos2x}4\right]_0^{\pi/4}=\frac\pi8+0-\frac14=\frac{\pi-2}{8}$$`, check: { label: 'Resultat ≈', value: (Math.PI - 2) / 8, tol: 1e-4 } },
        { n: '13', g: 'area_parts', q: R`Considereu la regió del pla determinada per $x=0$, $y=xe^x$ i $y=e^x$. Dibuixeu-ne un esbós. (a) Calculeu-ne l'àrea. (b) Calculeu el volum del cos de revolució obtingut en girar-la al voltant de l'eix d'abscisses.`,
          sol: R`Talls: $xe^x=e^x\iff x=1$. A $[0,1]$, $e^x\ge xe^x$ (i totes dues positives).<br>
(a) $A=\int_0^1(1-x)e^x\,dx$. Per parts: $\int(1-x)e^x=(2-x)e^x$. $A=[(2-x)e^x]_0^1=e-2\approx0{,}718$.<br>
(b) Gira una regió entre dues corbes ⇒ <b>anelles</b>: $V=\pi\int_0^1\left(e^{2x}-x^2e^{2x}\right)dx$.<br>
$\int e^{2x}=\frac{e^{2x}}2$ i (per parts dues vegades) $\int x^2e^{2x}=e^{2x}\left(\frac{x^2}2-\frac x2+\frac14\right)$.<br>
$V=\pi\left[\frac{e^2-1}2-\left(\frac{e^2}4-\frac14\right)\right]=\frac{\pi}{4}(e^2-1)\approx5{,}018$.`, check: { label: 'Àrea ≈', value: Math.E - 2, tol: 1e-3 } }
      ]
    },
    /* ------------------------------------------------------------ L10 */
    {
      id: 'L10', short: 'Llista 10', stars: 3, pdf: 'llista10.pdf',
      title: 'Llista 10 — EDOs: solucions, variables separables i models',
      topic: 'Comprovar solucions implícites; separables amb condició inicial; canvi z=x+y; creixement exponencial; model logístic d\'un virus.',
      exam: R`Surt <b>a tots els 2ns parcials</b>: separables amb $\sin y$ (2025), creixement proporcional (2023, 2024, solucionari), logística (2025, solucionari). L'exercici 4 és pràcticament el del 2023 i el 5 és el model del solucionari.`,
      items: [
        { n: '1a', g: 'verify', q: R`Proveu que $y^2=x^2+Cx-1$ és solució implícita de $2xyy'=x^2+y^2+1$.`, sol: R`Derivant implícitament: $2yy'=2x+C$. De l'equació, $C=\frac{y^2-x^2+1}{x}$. Substituint: $2xyy'=2x^2+y^2-x^2+1=x^2+y^2+1$ ✓.` },
        { n: '1b', g: 'verify', q: R`Proveu que $xye^{-y}=C$ és solució implícita de $xy'(y-1)=y$.`, sol: R`Derivant: $ye^{-y}+xy'e^{-y}-xyy'e^{-y}=0$. Dividint per $e^{-y}\ne0$: $y+xy'(1-y)=0\iff xy'(y-1)=y$ ✓.` },
        { n: '2a', g: 'separable', q: R`$y'=-2y$, $y(0)=3$.`, sol: R`$\frac{dy}y=-2dx$ ⇒ $\ln|y|=-2x+C$ ⇒ $y=Ke^{-2x}$. $y(0)=K=3$. $$y=3e^{-2x}$$` },
        { n: '2b', g: 'separable', q: R`$y'=3e^{-2x}$, $y(0)=3$.`, sol: R`Integral directa: $y=-\frac32e^{-2x}+C$; $y(0)=-\frac32+C=3$ ⇒ $C=\frac92$. $$y=\frac92-\frac32e^{-2x}$$` },
        { n: '2c', g: 'separable', q: R`$y'=-\frac12y$, $y(0)=\frac13$.`, sol: R`$y=Ke^{-x/2}$, $K=\frac13$. $$y=\frac13e^{-x/2}$$` },
        { n: '2d', g: 'separable', q: R`$y'=\frac14y$, $y(0)=-1$.`, sol: R`$y=Ke^{x/4}$, $K=-1$. $$y=-e^{x/4}$$` },
        { n: '2e', g: 'separable', q: R`$y'=-2y$, $y(-1)=3e^2$.`, sol: R`$y=Ke^{-2x}$; $y(-1)=Ke^{2}=3e^2$ ⇒ $K=3$. $$y=3e^{-2x}$$` },
        { n: '2f', g: 'sep_more', q: R`$(1+e^x)\,y\,y'=e^x$, $y(0)=1$.`, sol: R`$y\,dy=\frac{e^x}{1+e^x}dx$ ⇒ $\frac{y^2}2=\ln(1+e^x)+C$. $y(0)=1$: $\frac12=\ln2+C$ ⇒ $C=\frac12-\ln2$.<br>
$y^2=2\ln(1+e^x)+1-2\ln2=2\ln\frac{1+e^x}2+1$, i com que $y(0)=1\gt0$ agafem l'arrel positiva: $$y=\sqrt{1+2\ln\frac{1+e^x}{2}}$$` },
        { n: '2g', g: 'ode_subst', q: R`$y'=(x+y)^2$, $y(0)=1$. (Indicació: canvi $z=x+y$.)`, sol: R`$z=x+y$ ⇒ $z'=1+y'=1+z^2$: separable. $\int\frac{dz}{1+z^2}=\int dx$ ⇒ $\arctan z=x+C$ ⇒ $z=\tan(x+C)$.<br>
$z(0)=0+1=1$ ⇒ $\tan C=1$, $C=\frac\pi4$. $$y=\tan\left(x+\frac\pi4\right)-x$$` },
        { n: '3a', g: 'separable', q: R`Solució general de $y'=\dfrac{4y}{x(y-3)}$.`, sol: R`$\frac{y-3}{y}dy=\frac4xdx$ ⇒ $\int\left(1-\frac3y\right)dy=4\ln|x|$. $$y-3\ln|y|=4\ln|x|+C$$ (Solució implícita: no cal aïllar $y$. També $y=0$ és solució.)` },
        { n: '3b', g: 'separable', q: R`Solució general de $y'=\dfrac{x^2y}{1+x^3}$.`, sol: R`$\frac{dy}y=\frac{x^2}{1+x^3}dx$ ⇒ $\ln|y|=\frac13\ln|1+x^3|+C$. $$y=K\sqrt[3]{1+x^3}$$` },
        { n: '3c', g: 'separable', q: R`Solució general de $y'+2xy=0$.`, sol: R`$\frac{dy}y=-2x\,dx$ ⇒ $\ln|y|=-x^2+C$. $$y=Ke^{-x^2}$$` },
        { n: '3d', g: 'separable', q: R`Solució general de $y'+(\cos x)\,y=0$.`, sol: R`$\frac{dy}y=-\cos x\,dx$ ⇒ $\ln|y|=-\sin x+C$. $$y=Ke^{-\sin x}$$` },
        { n: '3e', g: 'sep_more', q: R`Solució general de $y'=y^2\cos x\,\sin^3x$.`, sol: R`$\frac{dy}{y^2}=\sin^3x\cos x\,dx$ ⇒ $-\frac1y=\frac{\sin^4x}4+C$. $$y=-\frac{4}{\sin^4x+C}$$ (i també la solució $y=0$).` },
        { n: '3f', g: 'separable', q: R`Solució general de $y'=(y^2-1)\,x$.`, sol: R`$\frac{dy}{y^2-1}=x\,dx$. Fraccions simples: $\frac1{y^2-1}=\frac12\left(\frac1{y-1}-\frac1{y+1}\right)$.<br>
$\frac12\ln\left|\frac{y-1}{y+1}\right|=\frac{x^2}2+C$ ⇒ $\frac{y-1}{y+1}=Ke^{x^2}$ ⇒ $$y=\frac{1+Ke^{x^2}}{1-Ke^{x^2}}$$ (més les solucions constants $y=\pm1$).` },
        { n: '4', g: 'growth', q: R`Sigui $x(t)$ el nombre d'individus d'una població. La velocitat de creixement és directament proporcional al nombre d'individus. La població es duplica en dues hores. Quant triga a triplicar-se?`,
          sol: R`$x'=kx$ ⇒ $x(t)=x_0e^{kt}$. Duplicar en 2 h: $e^{2k}=2$ ⇒ $k=\frac{\ln2}2$.<br>
Triplicar: $e^{kt}=3$ ⇒ $t=\frac{\ln3}{k}=\frac{2\ln3}{\ln2}\approx\mathbf{3{,}17}$ hores.`, check: { label: 't (hores) ≈', value: 2 * Math.log(3) / Math.log(2), tol: 1e-2 } },
        { n: '5', g: 'epidemic', q: R`Un estudiant portador d'un virus torna a un campus aïllat de 1000 estudiants. La velocitat de propagació és proporcional al producte entre infectats i no infectats. (a) Escriviu l'EDO. (b) Si al cap de 4 dies hi ha 20 contagiats, quants n'hi haurà al cap de 6 dies? (c) En quin instant la velocitat de propagació és màxima?`,
          sol: R`(a) $\frac{dI}{dt}=kI(1000-I)$, $I(0)=1$.<br>
(b) Separant i amb fraccions simples: $\ln\frac{I}{1000-I}=1000kt+C$, i amb $I(0)=1$: $\frac{I}{1000-I}=\frac{e^{1000kt}}{999}$, és a dir $$I(t)=\frac{1000}{1+999e^{-1000kt}}.$$
$I(4)=20$: $\frac{20}{980}=\frac{e^{4000k}}{999}$ ⇒ $e^{4000k}=\frac{999}{49}$.<br>
$I(6)$: $e^{6000k}=\left(\frac{999}{49}\right)^{3/2}$, $\frac I{1000-I}=\frac{(999/49)^{3/2}}{999}\approx0{,}0921$ ⇒ $I(6)\approx\mathbf{84{,}4}$ estudiants.<br>
(c) $V(I)=kI(1000-I)$ és màxima quan $V'(I)=k(1000-2I)=0$: $I=500$. Llavors $e^{1000kt}=999$ ⇒ $t=\frac{\ln999}{1000k}=\frac{4\ln999}{\ln(999/49)}\approx\mathbf{9{,}16}$ dies.`, check: { label: 'I(6) ≈', value: 84.37, tol: 0.5 } }
      ]
    },
    /* ------------------------------------------------------------ L11 */
    {
      id: 'L11', short: 'Llista 11', stars: 3, pdf: 'llista11.pdf',
      title: 'Llista 11 — EDOs lineals de primer ordre, mescles i refredament',
      topic: "Factor integrant μ=e^{∫P}; problemes de Cauchy; canvi de variable que porta a una lineal; dissolució de sal; llei de refredament de Newton.",
      exam: R`<b>Un exercici a cada 2n parcial</b>: $y'+\frac{y}{x+100}=1$ (2025), $y'+\frac yx=e^{-2x^2}$ (2024), $y'-\cos(2x)y=\cos(2x)$ (2023), $y'+y=x^3$ (recuperació). L'1g (canvi de variable) és el tipus que va sortir al solucionari.`,
      items: [
        { n: '1a', g: 'mu', q: R`$y'+(\sin x)\,y=\sin x$`, sol: R`$\mu=e^{\int\sin x}=e^{-\cos x}$. $(ye^{-\cos x})'=\sin x\,e^{-\cos x}$ ⇒ $ye^{-\cos x}=e^{-\cos x}+C$. $$y=1+Ce^{\cos x}$$ (També és separable: $y'=\sin x(1-y)$.)` },
        { n: '1b', g: 'mu', q: R`$y'+2xy=2xe^{-x^2}$`, sol: R`$\mu=e^{x^2}$: $(ye^{x^2})'=2x$ ⇒ $ye^{x^2}=x^2+C$. $$y=e^{-x^2}(x^2+C)$$` },
        { n: '1c', g: 'mu', q: R`$y'+2y=x^2+2x$`, sol: R`$\mu=e^{2x}$: $ye^{2x}=\int(x^2+2x)e^{2x}dx$. Per parts: $\int x^2e^{2x}=e^{2x}\left(\frac{x^2}2-\frac x2+\frac14\right)$, $\int2xe^{2x}=e^{2x}\left(x-\frac12\right)$. Suma: $e^{2x}\left(\frac{x^2}2+\frac x2-\frac14\right)$. $$y=\frac{x^2}{2}+\frac x2-\frac14+Ce^{-2x}$$ (Alternativa: coeficients indeterminats amb $y_p=ax^2+bx+c$.)` },
        { n: '1d', g: 'ivp', q: R`$2xy'-y=3x^2$, $y(1)=3$`, sol: R`Forma estàndard: $y'-\frac1{2x}y=\frac{3x}2$. $\mu=e^{-\frac12\ln x}=x^{-1/2}$. $(yx^{-1/2})'=\frac32x^{1/2}$ ⇒ $yx^{-1/2}=x^{3/2}+C$ ⇒ $y=x^2+C\sqrt x$. $y(1)=1+C=3$, $C=2$. $$y=x^2+2\sqrt x$$`, check: { label: 'y(4) =', value: 20 } },
        { n: '1e', g: 'lin_exam', q: R`$y'+(1-x)\,y=x^3e^{-x}$`, sol: R`$\mu=e^{\int(1-x)}=e^{x-x^2/2}$. $(y\mu)'=x^3e^{-x}e^{x-x^2/2}=x^3e^{-x^2/2}$.<br>
$\int x^3e^{-x^2/2}dx$: amb $t=\frac{x^2}2$ ($x\,dx=dt$, $x^2=2t$): $\int2te^{-t}dt=-2(t+1)e^{-t}=-(x^2+2)e^{-x^2/2}$.
$$y=-(x^2+2)e^{-x}+Ce^{\frac{x^2}{2}-x}$$` },
        { n: '1f', g: 'mu', q: R`$y'+3\cos(3x)\,y=\dfrac{x}{1+x^2}e^{-\sin3x}$`, sol: R`$\mu=e^{\sin3x}$: $(ye^{\sin3x})'=\frac x{1+x^2}$ ⇒ $ye^{\sin3x}=\frac12\ln(1+x^2)+C$. $$y=e^{-\sin3x}\left(\frac12\ln(1+x^2)+C\right)$$` },
        { n: '1g', g: 'l10.ode_subst', q: R`$x^2+y^2=2xyy'$ amb $y(1)=1$. (Indicació: el canvi $z(x)=x^2+y^2(x)$ dona una EDO lineal de primer ordre en $z$.)`, sol: R`$z=x^2+y^2$ ⇒ $z'=2x+2yy'$. De l'equació, $2yy'=\frac zx$, per tant $z'=2x+\frac zx$, és a dir, $z'-\frac1xz=2x$ (lineal).<br>
$\mu=e^{-\ln x}=\frac1x$: $\left(\frac zx\right)'=2$ ⇒ $z=2x^2+Cx$. $z(1)=1+1=2$ ⇒ $C=0$: $z=2x^2$.<br>
$y^2=z-x^2=x^2$, i amb $y(1)=1$: $$y=x$$
⚠️ Una resolució que circula obté $y=\sqrt x$: oblida el $2x$ en derivar $z$ ($z'=2x+2yy'$, no $x+\dots$). Comprova: $y=x$ dona $x^2+x^2=2x\cdot x\cdot1$ ✓; $y=\sqrt x$ no la compleix.`, check: { label: 'y(2) =', value: 2 } },
        { n: '2', g: 'mix', q: R`En un recipient d'aigua pura s'hi aboca molta sal (més de la que es pot dissoldre). La concentració augmenta amb velocitat proporcional a la diferència entre la concentració de saturació (360 g/l) i la concentració actual. Al cap d'un minut la concentració és de 200 g/l. Quina concentració hi haurà al cap de 5 minuts?`,
          sol: R`$C'=k(360-C)$, $C(0)=0$. Solució: $C(t)=360-360e^{-kt}$.<br>
$C(1)=200$: $e^{-k}=\frac{160}{360}=\frac49$.
$$C(5)=360-360\left(\frac49\right)^5\approx\mathbf{353{,}8}\ \text{g/l}$$`, check: { label: 'C(5) ≈', value: 353.757, tol: 0.1 } },
        { n: '3', g: 'cooling', q: R`Segons la llei de refredament de Newton, la velocitat de refredament és proporcional a la diferència entre la temperatura $T$ del cos i la de l'aire $T_0$. Un cos en una habitació a 20 °C triga 20 minuts a refredar-se de 80 °C a 35 °C. (a) Trobeu $T(t)$. (b) Quant triga a arribar a 23,75 °C?`,
          sol: R`(a) $T'=-k(T-20)$ ⇒ $T(t)=20+60e^{-kt}$. $T(20)=35$: $e^{-20k}=\frac{15}{60}=\frac14$ ⇒ $k=\frac{\ln4}{20}$. $$T(t)=20+60\cdot4^{-t/20}$$
(b) $20+60e^{-kt}=23{,}75$ ⇒ $e^{-kt}=\frac1{16}=\left(\frac14\right)^2$ ⇒ $t=2\cdot20=\mathbf{40}$ minuts.`, check: { label: 't (min) =', value: 40 } }
      ]
    },
    /* ------------------------------------------------------------ L12 */
    {
      id: 'L12', short: 'Llista 12', stars: 3, pdf: 'llista12.pdf',
      title: 'Llista 12 — EDOs lineals de segon ordre (homogènies i coeficients indeterminats)',
      topic: "Equació característica (arrels reals, dobles, complexes); solució particular per coeficients indeterminats, amb ressonància; problemes de valors inicials; construir l'EDO a partir de solucions.",
      exam: R`<b>Un exercici a cada 2n parcial</b>: $y''-7y'+12y=4e^{2x}$ (2025), $y''-4y'+13y=4e^x$ (2024), PVI amb $e^{-x}$ (2023), forma de $y_p$ amb ressonància (solucionari). Domina les arrels dobles (cal el factor $x$!) i la ressonància.`,
      items: [
        { n: '1a', g: 'roots', q: R`$y''+6y'+9y=0$`, sol: R`$r^2+6r+9=(r+3)^2=0$: arrel <b>doble</b> $r=-3$. $$y=(C_1+C_2x)e^{-3x}$$ ⚠️ Amb arrel doble cal el factor $x$ al segon terme. Una resolució que circula escriu $e^{-3x}(C_1+C_2)$, que és una sola constant i <b>no</b> és la solució general.` },
        { n: '1b', g: 'roots', q: R`$y''-10y'+34y=0$`, sol: R`$r=\frac{10\pm\sqrt{100-136}}2=5\pm3i$. $$y=e^{5x}\big(C_1\cos3x+C_2\sin3x\big)$$` },
        { n: '1c', g: 'roots', q: R`$y''-6y'+13y=0$`, sol: R`$r=3\pm2i$. $$y=e^{3x}\big(C_1\cos2x+C_2\sin2x\big)$$` },
        { n: '1d', g: 'roots', q: R`$y''-4y'+4y=0$`, sol: R`$(r-2)^2=0$, arrel doble $r=2$. $$y=(C_1+C_2x)e^{2x}$$` },
        { n: '1e', g: 'roots', q: R`$y''+6y'-7y=0$`, sol: R`$r^2+6r-7=(r+7)(r-1)$: $r=1,-7$. $$y=C_1e^{x}+C_2e^{-7x}$$` },
        { n: '1f', g: 'roots', q: R`$y''+7y'+10y=0$`, sol: R`$(r+2)(r+5)=0$. $$y=C_1e^{-2x}+C_2e^{-5x}$$` },
        { n: '1g', g: 'particular', q: R`$y''+2y'+17y=34\sin x-12\cos x$`, sol: R`$r=-1\pm4i$ ⇒ $y_h=e^{-x}(C_1\cos4x+C_2\sin4x)$. $\sin x$, $\cos x$ no són solucions de l'homogènia ⇒ $y_p=A\sin x+B\cos x$.<br>
$y_p''+2y_p'+17y_p=(16A-2B)\sin x+(16B+2A)\cos x$. Sistema: $16A-2B=34$, $2A+16B=-12$ ⇒ $A=2$, $B=-1$. $$y=e^{-x}(C_1\cos4x+C_2\sin4x)+2\sin x-\cos x$$` },
        { n: '1h', g: 'particular', q: R`$y''-4y'+4y=10e^x\cos x-6e^x\sin x$`, sol: R`$y_h=(C_1+C_2x)e^{2x}$. Com que $1\pm i$ no és arrel, $y_p=e^x(A\cos x+B\sin x)$.<br>
Derivant i substituint: $y_p''-4y_p'+4y_p=e^x\big[-2B\cos x+2A\sin x\big]$. Igualant amb $e^x(10\cos x-6\sin x)$: $-2B=10$, $2A=-6$ ⇒ $A=-3$, $B=-5$. $$y=(C_1+C_2x)e^{2x}-e^x(3\cos x+5\sin x)$$` },
        { n: '1i', g: 'guess_adv', q: R`$y''+4y=x^2\sin(2x)$`, sol: R`$y_h=C_1\cos2x+C_2\sin2x$. El terme $\sin2x$ <b>és</b> solució de l'homogènia (ressonància) ⇒ cal multiplicar per $x$ <b>tot</b> el candidat: $$y_p=x\big[(ax^2+bx+c)\cos2x+(dx^2+ex+f)\sin2x\big].$$
Substituint i igualant coeficients: $a=-\frac1{12}$, $b=0$, $c=\frac1{32}$, $d=0$, $e=\frac1{16}$, $f=0$:
$$y=C_1\cos2x+C_2\sin2x-\frac{x^3}{12}\cos2x+\frac{x^2}{16}\sin2x+\frac{x}{32}\cos2x$$
⚠️ Les dues resolucions que circulen són incompletes: una dona només $-\frac{x^3}{12}\sin2x$ i l'altra no posa el factor $x$ (amb ressonància no pot funcionar). Comprovat substituint a l'EDO.` },
        { n: '1j', g: 'particular', q: R`$y''+6y'+8y=32x$`, sol: R`$r=-2,-4$. $y_p=Ax+B$: $6A+8(Ax+B)=32x$ ⇒ $A=4$, $B=-3$. $$y=C_1e^{-2x}+C_2e^{-4x}+4x-3$$` },
        { n: '1k', g: 'res_trig', q: R`$y''+4y=\cos x+\cos2x$`, sol: R`$y_h=C_1\cos2x+C_2\sin2x$. Superposició: per a $\cos x$ (no ressonant) $y_{p1}=\frac13\cos x$; per a $\cos2x$ (ressonant) $y_{p2}=x(A\cos2x+B\sin2x)$, i surt $A=0$, $B=\frac14$. $$y=C_1\cos2x+C_2\sin2x+\frac13\cos x+\frac x4\sin2x$$` },
        { n: '1l', g: 'particular', q: R`$y''-10y'+25y=e^{5x}$`, sol: R`$(r-5)^2$: arrel doble $r=5$, i $e^{5x}$ hi coincideix ⇒ $y_p=Ax^2e^{5x}$ (factor $x^2$). Substituint: $2Ae^{5x}=e^{5x}$, $A=\frac12$. $$y=(C_1+C_2x)e^{5x}+\frac{x^2}{2}e^{5x}$$` },
        { n: '1m', g: 'particular', q: R`$y''+2y'+3y=e^{-x}$`, sol: R`$r=-1\pm i\sqrt2$. $y_p=Ae^{-x}$: $(1-2+3)A=1$, $A=\frac12$. $$y=e^{-x}\left(C_1\cos\sqrt2x+C_2\sin\sqrt2x\right)+\frac12e^{-x}$$` },
        { n: '2', g: 'from_solutions', q: R`Les funcions $f(x)=e^{-4x}$ i $g(x)=e^{3x}$ són solució d'una EDO lineal homogènia d'ordre 2 amb coeficients constants. Escriviu-la.`, sol: R`Arrels $r=-4$ i $r=3$: $(r+4)(r-3)=r^2+r-12$. $$y''+y'-12y=0$$` },
        { n: '3', g: 'from_solutions', q: R`Escriviu una EDO lineal homogènia d'ordre 2 amb coeficients constants que tingui com a solucions $e^{-4x}$ i $(x+1)e^{-4x}$.`, sol: R`$(x+1)e^{-4x}=xe^{-4x}+e^{-4x}$: apareix $xe^{-4x}$ ⇒ $r=-4$ és arrel <b>doble</b>: $(r+4)^2=r^2+8r+16$. $$y''+8y'+16y=0$$` },
        { n: '4', g: 'ivp', q: R`De totes les funcions que satisfan $y''+2y'+17y=0$, trobeu la que compleix $y(0)=1$, $y'(0)=-5$.`, sol: R`$y=e^{-x}(C_1\cos4x+C_2\sin4x)$. $y(0)=C_1=1$. $y'(0)=-C_1+4C_2=-5$ ⇒ $C_2=-1$. $$y=e^{-x}(\cos4x-\sin4x)$$` },
        { n: '5a', g: 'particular', q: R`$y''+9y=\sin(2x)$ amb $y(0)=0$, $y'(0)=0$.`, sol: R`$y_h=C_1\cos3x+C_2\sin3x$. $y_p=A\cos2x+B\sin2x$: $5A\cos2x+5B\sin2x=\sin2x$ ⇒ $A=0$, $B=\frac15$.<br>
$y(0)=C_1=0$; $y'(0)=3C_2+\frac25=0$ ⇒ $C_2=-\frac2{15}$. $$y=\frac15\sin2x-\frac{2}{15}\sin3x$$` },
        { n: '5b', g: 'res_trig', q: R`$y''+9y=\sin(3x)$ amb $y(0)=0$, $y'(0)=0$.`, sol: R`Ressonància ($\sin3x$ és solució de l'homogènia): $y_p=x(A\cos3x+B\sin3x)$. Substituint: $-6A\sin3x+6B\cos3x=\sin3x$ ⇒ $A=-\frac16$, $B=0$.<br>
$y=C_1\cos3x+C_2\sin3x-\frac x6\cos3x$. $y(0)=C_1=0$; $y'(0)=3C_2-\frac16=0$ ⇒ $C_2=\frac1{18}$. $$y=\frac{1}{18}\sin3x-\frac x6\cos3x$$` }
      ]
    }
  ];
})();
