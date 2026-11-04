/* ============================================================
   llistesdata.js — Les llistes que es fan a classe (Llista 0–5),
   enunciat per enunciat, amb solució i relació amb l'examen.
   Cada problema: { n, q, sol, check? }  (check = {label, value}
   per comprovar un resultat numèric amb el MathParser).
   S'usa String.raw perquè el LaTeX no necessiti dobles barres.
   ============================================================ */

const R = String.raw;

const CLASS_LISTS = [
  {
    id: "L5",
    title: "Llista 5 — Polinomi de Taylor i aproximacions",
    short: "Llista 5",
    latest: true,
    stars: 3,
    topic: "Polinomi de Taylor, derivades a l'origen a partir del polinomi, aproximació amb error menor que un valor donat.",
    exam: R`És exactament el <b>Problema 2 del Parcial 2025</b> (Taylor de grau 7 de $\frac{e^x-e^{-x}}{2}$ + fita de l'error) i la pregunta 4 del test 2025 (residu de $\sin(0.1)$). <b>És la llista més recent: molt probable a l'examen.</b>`,
    items: [
      {
        n: "1",
        q: R`Calcula el polinomi de Taylor de grau 6 de $f(x)=\cos x$ en $x=0$. Utilitzant la fórmula anterior, calcula $g^{(8)}(0)$ per a $g(x)=\cos x^2$.`,
        sol: R`Derivades de $\cos$ en 0: $1,0,-1,0,1,0,-1$. $$P_6(x)=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\frac{x^6}{6!}$$
Substituint $x\to x^2$: $\cos x^2=1-\frac{x^4}{2}+\frac{x^8}{24}-\cdots$. El coeficient de $x^8$ del polinomi de Taylor és $\frac{g^{(8)}(0)}{8!}$, per tant $$\frac{g^{(8)}(0)}{8!}=\frac1{24}\Rightarrow g^{(8)}(0)=\frac{8!}{24}=\frac{40320}{24}=1680.$$
<b>Truc:</b> per trobar una derivada alta en 0, no derivis 8 cops: busca el coeficient al desenvolupament i multiplica per $k!$.`,
        check: { label: "g⁽⁸⁾(0) =", value: 1680 }
      },
      {
        n: "2",
        q: R`Considerem $f(x)=\cos\left(\frac{\pi x}{2}\right)-\frac{\pi^2x^2}{8}$. Determineu el polinomi de Taylor d'ordre 3 de $f$ centrat en $x=0$.`,
        sol: R`Fem servir $\cos t=1-\frac{t^2}{2}+\frac{t^4}{24}-\cdots$ amb $t=\frac{\pi x}{2}$: $\cos\frac{\pi x}{2}=1-\frac{\pi^2x^2}{8}+\frac{\pi^4x^4}{384}-\cdots$<br>
Llavors $f(x)=1-\frac{\pi^2x^2}{8}-\frac{\pi^2x^2}{8}+O(x^4)=1-\frac{\pi^2x^2}{4}+O(x^4)$. $$P_3(x)=1-\frac{\pi^2}{4}x^2$$
(No hi ha termes de grau 1 ni 3 perquè $f$ és parell. Compte amb el signe: els dos termes en $x^2$ <b>se sumen</b>, no s'anul·len.)`,
        check: { label: "coef. de x² =", value: -Math.PI * Math.PI / 4 }
      },
      {
        n: "3",
        q: R`Obteniu, utilitzant la fórmula de Taylor, una aproximació de $\sin(0{,}1)$ amb error més petit que $10^{-4}$.`,
        sol: R`$|R_n(0.1)|=\frac{|f^{(n+1)}(\xi)|}{(n+1)!}(0.1)^{n+1}\le\frac{(0.1)^{n+1}}{(n+1)!}$, ja que totes les derivades de $\sin$ són $\le1$ en valor absolut.<br>
$n=2$: $\frac{10^{-3}}{6}\approx1.7\cdot10^{-4}$ ✗. $\quad n=3$: $\frac{10^{-4}}{24}\approx4.2\cdot10^{-6}$ ✓.<br>
$$\sin(0.1)\approx P_3(0.1)=0.1-\frac{0.001}{6}=0.0998\overline{3}$$ (Valor real: $0.0998334\ldots$)`,
        check: { label: "sin(0,1) ≈", value: 0.0998333, tol: 1e-4 }
      },
      {
        n: "4",
        q: R`Obteniu, utilitzant la fórmula de Taylor, una aproximació de $e^{0{,}3}$ amb error més petit que $10^{-4}$.`,
        sol: R`$|R_n(0.3)|=\frac{e^{\xi}}{(n+1)!}(0.3)^{n+1}$ amb $0\lt\xi\lt0.3$, i $e^\xi\lt e^{0.3}\lt e\lt3$.<br>
$n=3$: $\frac{3\cdot0.0081}{24}\approx1.0\cdot10^{-3}$ ✗. $\quad n=4$: $\frac{3\cdot0.00243}{120}\approx6.1\cdot10^{-5}$ ✓.<br>
$$e^{0.3}\approx1+0.3+\frac{0.09}{2}+\frac{0.027}{6}+\frac{0.0081}{24}=1.3498375$$ (Valor real $1.3498588$; error real $2\cdot10^{-5}$.)`,
        check: { label: "e^0,3 ≈", value: 1.3498375, tol: 1e-4 }
      },
      {
        n: "5",
        q: R`Obteniu, utilitzant la fórmula de Taylor, una aproximació de $\sqrt[3]{1{,}06}$ amb error més petit que $10^{-4}$.`,
        sol: R`$f(x)=(1+x)^{1/3}$ en $a=0$, avaluat en $x=0.06$. $f'=\frac13(1+x)^{-2/3}$, $f''=-\frac29(1+x)^{-5/3}$, $f'''=\frac{10}{27}(1+x)^{-8/3}$.<br>
$P_2(x)=1+\frac x3-\frac{x^2}{9}$. Error: $|R_2|=\frac{|f'''(\xi)|}{3!}x^3\le\frac{10/27}{6}(0.06)^3\approx1.3\cdot10^{-5}\lt10^{-4}$ ✓ (perquè $(1+\xi)^{-8/3}\lt1$ per $\xi>0$). Amb $n=1$ seria $\frac{2/9}{2}(0.06)^2=4\cdot10^{-4}$ ✗.<br>
$$\sqrt[3]{1.06}\approx1+0.02-0.0004=1.0196$$ (Valor real $1.019613$.)`,
        check: { label: "∛1,06 ≈", value: 1.0196, tol: 1e-4 }
      }
    ]
  },
  {
    id: "L4",
    title: "Llista 4 — Estudi de funcions i límits amb l'Hôpital",
    short: "Llista 4",
    stars: 3,
    topic: "Asímptotes, creixement, extrems, concavitat/convexitat, inflexió, gràfica; funcions amb paràmetre; límits amb indeterminacions (incl. $1^\\infty$, $0^0$, $\\infty^0$).",
    exam: R`És el <b>Problema 1 del Parcial 2025</b> ($\frac{x^2+3}{x-1}$, igual que 1(a)/(b) d'aquesta llista), l'exercici 3 d'Abril 2024 ($\frac{e^{-x}}{x+2}$, gairebé igual que 1(f)) i el límit $1^\infty$ d'Abril 2024.`,
    items: [
      { n: "1(a)", q: R`Estudi complet de $f(x)=\dfrac{x^2+8}{x+1}$.`,
        sol: R`$f(x)=x-1+\frac{9}{x+1}$. AV $x=-1$, AO $y=x-1$. $f'=1-\frac{9}{(x+1)^2}=0\Rightarrow x=2,\ x=-4$. Creixent a $(-\infty,-4)\cup(2,\infty)$, decreixent a $(-4,-1)\cup(-1,2)$. Màx $(-4,-8)$, mín $(2,4)$. $f''=\frac{18}{(x+1)^3}$: còncava a $x\lt-1$, convexa a $x>-1$, sense inflexió.<div class='plot' data-f='(x^2+8)/(x+1)' data-xr='-10,8' data-yr='-25,20' data-va='-1' data-lines='x-1' data-pts='-4,-8;2,4'></div>` },
      { n: "1(b)", q: R`Estudi complet de $f(x)=\dfrac{x^2+12}{x-2}$.`,
        sol: R`$f(x)=x+2+\frac{16}{x-2}$. AV $x=2$, AO $y=x+2$. $f'=1-\frac{16}{(x-2)^2}=0\Rightarrow x=6,\ x=-2$. Màx $(-2,-4)$, mín $(6,12)$. $f''=\frac{32}{(x-2)^3}$: còncava a $x\lt2$, convexa a $x>2$.<div class='plot' data-f='(x^2+12)/(x-2)' data-xr='-10,14' data-yr='-25,30' data-va='2' data-lines='x+2' data-pts='-2,-4;6,12'></div>` },
      { n: "1(c)", q: R`Estudi complet de $f(x)=\dfrac{5-3x^2}{1-x^2}$.`,
        sol: R`$f(x)=3+\frac{2}{1-x^2}$. AV $x=\pm1$, AH $y=3$. $f'=\frac{4x}{(1-x^2)^2}$: decreixent a $x\lt0$, creixent a $x>0$ (fora de $\pm1$). Mínim relatiu $(0,5)$. $f''=\frac{4(1+3x^2)}{(1-x^2)^3}$: convexa a $(-1,1)$, còncava a $|x|>1$. Funció parell.<div class='plot' data-f='(5-3*x^2)/(1-x^2)' data-xr='-4,4' data-yr='-8,14' data-va='-1,1' data-lines='3' data-pts='0,5'></div>` },
      { n: "1(d)", q: R`Estudi complet de $f(x)=x^3-\dfrac{48}{x^2}$.`,
        sol: R`Domini $x\neq0$. $f'=3x^2+\frac{96}{x^3}=\frac{3(x^5+32)}{x^3}=0\Rightarrow x=-2$. Creixent a $(-\infty,-2)$, decreixent a $(-2,0)$, creixent a $(0,\infty)$. Màxim relatiu $(-2,-20)$.<br>
$f''=6x-\frac{288}{x^4}=\frac{6(x^5-48)}{x^4}$: còncava a $x\lt\sqrt[5]{48}$ ($x\neq0$), convexa a $x>\sqrt[5]{48}\approx2.17$. Inflexió a $(\sqrt[5]{48},0)$ (curiosament també és el tall amb l'eix $X$). AV $x=0$ ($f\to-\infty$ pels dos costats); no hi ha AH ni AO.<div class='plot' data-f='x^3-48/x^2' data-xr='-5,5' data-yr='-60,60' data-va='0' data-pts='-2,-20;2.1689,0'></div>` },
      { n: "1(e)", q: R`Estudi complet de $f(x)=\sqrt{x}-\sqrt{16-x}$.`,
        sol: R`Domini $[0,16]$. $f'=\frac{1}{2\sqrt x}+\frac{1}{2\sqrt{16-x}}>0$: creixent a tot el domini; mínim absolut $f(0)=-4$, màxim absolut $f(16)=4$. $f''=-\frac{1}{4x^{3/2}}+\frac{1}{4(16-x)^{3/2}}=0\iff x=8$: còncava a $(0,8)$, convexa a $(8,16)$, inflexió $(8,0)$. Sense asímptotes.<div class='plot' data-f='sqrt(x)-sqrt(16-x)' data-xr='-1,17' data-yr='-5,5' data-pts='0,-4;8,0;16,4'></div>` },
      { n: "1(f)", q: R`Estudi complet de $f(x)=\dfrac{e^{-x}}{x-3}$.`,
        sol: R`$f'=\frac{-e^{-x}(x-2)}{(x-3)^2}$: creixent a $(-\infty,2)$, decreixent a $(2,3)\cup(3,\infty)$. Màxim relatiu $(2,-e^{-2})$. $f''=\frac{e^{-x}\left((x-3)^2+2(x-3)+2\right)}{(x-3)^3}$, i el parèntesi és sempre $>0$: còncava a $x\lt3$, convexa a $x>3$. AV $x=3$, AH $y=0$ a $+\infty$; $f\to-\infty$ a $-\infty$.<div class='plot' data-f='exp(-x)/(x-3)' data-xr='-2,7' data-yr='-3,2' data-va='3' data-lines='0' data-pts='2,-0.1353'></div>` },
      { n: "2", q: R`Donat $a\in\mathbb R$, representa gràficament $f_a(x)=\dfrac{x^2+1}{x^2+2ax+1}$.`,
        sol: R`AH $y=1$ sempre; $f_a(0)=1$. Denominador: discriminant $4a^2-4$ ⇒ <b>dues AV</b> si $|a|>1$, <b>una</b> ($x=-a$) si $|a|=1$, <b>cap</b> si $|a|\lt1$.<br>
$f_a'=\frac{2a(x^2-1)}{(x^2+2ax+1)^2}$. Si $a>0$: creixent a $|x|>1$, decreixent a $(-1,1)$ (on estigui definida); si $a\lt0$, al revés; si $a=0$, $f\equiv1$.<br>
Per $0\lt a\lt1$: màx $\left(-1,\frac{1}{1-a}\right)$, mín $\left(1,\frac1{1+a}\right)$. Per $-1\lt a\lt0$ els papers s'intercanvien.<div class='plot' data-f='(x^2+1)/(x^2+x+1)' data-xr='-6,6' data-yr='-0.5,2.5' data-lines='1' data-pts='-1,2;1,0.6667'></div><span class='muted small'>Gràfica per a $a=\frac12$.</span>` },
      { n: "3", q: R`Donat $a\in\mathbb R$, representa gràficament $f_a(x)=\dfrac{3x}{x^3+a}$.`,
        sol: R`$a=0$: $f=\frac3{x^2}$ ($x\neq0$). En general: AV $x=-\sqrt[3]{a}$, AH $y=0$, $f_a(0)=0$.<br>
$f_a'=\frac{3(a-2x^3)}{(x^3+a)^2}$ ⇒ punt crític $x=\sqrt[3]{a/2}$. Si $a>0$: creixent a l'esquerra del crític (fora de l'AV) i decreixent després ⇒ màxim $\left(\sqrt[3]{a/2},\ \frac{2}{a}\sqrt[3]{a/2}\right)$. Si $a\lt0$: al revés ⇒ mínim.<div class='plot' data-f='3*x/(x^3+2)' data-xr='-5,5' data-yr='-4,4' data-va='-1.26' data-lines='0' data-pts='1,1'></div><span class='muted small'>Gràfica per a $a=2$ (màxim a $(1,1)$).</span>` },
      { n: "4", q: R`Calculeu: $\lim_{x\to1}\left(\frac1{\log x}-\frac1{x-1}\right)$, $\lim_{x\to0}\frac{x}{\arctan4x}$, $\lim_{x\to\infty}(xe^{1/x}-x)$, $\lim_{x\to\infty}\sqrt x\sin\frac1x$, $\lim_{x\to0^+}(\tan2x)^x$, $\lim_{x\to0}\frac{1-e^{-2x}}{\sec x}$, $\lim_{x\to\infty}\left(\frac{x}{1+x}\right)^x$, $\lim_{x\to\pi/2}\frac{\tan x}{\sec^2x}$, $\lim_{x\to0}\frac{1-\cos x}{x\tan x}$.`,
        sol: R`• $\frac1{\ln x}-\frac1{x-1}=\frac{x-1-\ln x}{(x-1)\ln x}\overset{H}{=}\frac{1-1/x}{\ln x+1-1/x}\overset{H}{=}\frac{1/x^2}{1/x+1/x^2}\to\frac12$.<br>
• $\frac{x}{\arctan4x}\overset{H}{=}\frac{1}{4/(1+16x^2)}\to\frac14$.<br>
• $xe^{1/x}-x=\frac{e^{1/x}-1}{1/x}\to1$ (canvi $t=1/x$).<br>
• $\sqrt x\sin\frac1x=\frac{\sin(1/x)}{1/x}\cdot\frac{1}{\sqrt x}\to1\cdot0=0$.<br>
• $(\tan2x)^x=e^{x\ln\tan2x}$, i $x\ln\tan2x\sim x\ln2x\to0$ ⇒ $1$.<br>
• $\frac{1-e^{-2x}}{\sec x}=(1-e^{-2x})\cos x\to0$ (no és indeterminació!).<br>
• $\left(\frac{x}{1+x}\right)^x=e^{x\ln\frac{x}{1+x}}$, $x\ln\left(1-\frac1{1+x}\right)\to-1$ ⇒ $e^{-1}$.<br>
• $\frac{\tan x}{\sec^2x}=\sin x\cos x\to0$.<br>
• $\frac{1-\cos x}{x\tan x}\sim\frac{x^2/2}{x^2}=\frac12$.` },
      { n: "5", q: R`(a) $\lim_{x\to0^+}x^{2x}$ (b) $\lim_{x\to\infty}x^{1/x}$ (c) $\lim_{x\to0^+}x^{\sin x}$ (d) $\lim_{x\to\infty}\left(\frac{1+5x}{3+5x}\right)^{2x-1}$ (e) $\lim_{x\to0^+}(1+\sin4x)^{\cot x}$ (f) $\lim_{x\to1}(2-x)^{\tan(\pi x/2)}$`,
        sol: R`Totes amb $f^g=e^{g\ln f}$:<br>(a) $2x\ln x\to0$ ⇒ $1$. (b) $\frac{\ln x}{x}\to0$ ⇒ $1$. (c) $\sin x\ln x\sim x\ln x\to0$ ⇒ $1$.<br>
(d) $(2x-1)\ln\frac{1+5x}{3+5x}=(2x-1)\ln\left(1-\frac{2}{3+5x}\right)\sim(2x-1)\cdot\frac{-2}{3+5x}\to-\frac45$ ⇒ $e^{-4/5}$.<br>
(e) $\frac{\ln(1+\sin4x)}{\tan x}\sim\frac{4x}{x}=4$ ⇒ $e^4$.<br>
(f) $\frac{\ln(2-x)}{\cot(\pi x/2)}\overset{H}{=}\frac{-1/(2-x)}{-\frac\pi2\csc^2(\pi x/2)}\to\frac{2}{\pi}$ ⇒ $e^{2/\pi}$.` },
      { n: "6", q: R`Per quins valors d'$a$ i $b$ es compleix $\displaystyle\lim_{x\to0}\left(\frac{\sin2x}{x^3}+a+\frac{b}{x^2}\right)=0$?`,
        sol: R`Taylor: $\sin2x=2x-\frac{8x^3}{6}+O(x^5)$ ⇒ $\frac{\sin2x}{x^3}=\frac2{x^2}-\frac43+O(x^2)$. L'expressió és $\frac{2+b}{x^2}+a-\frac43+O(x^2)$. Cal $b=-2$ (si no, divergeix) i $a=\frac43$.`,
        check: { label: "a =", value: 4 / 3 } }
    ]
  },
  {
    id: "L3",
    title: "Llista 3 — Creixement, extrems, optimització, concavitat, extrems absoluts",
    short: "Llista 3",
    stars: 3,
    topic: "Intervals de creixement, extrems relatius, problemes amb paràmetre, optimització, concavitat/inflexió i extrems absoluts en un interval.",
    exam: R`El problema 10 (<b>màxim i mínim absolut en un interval</b>) és el 1(d) del Parcial 2025. Els problemes 1, 3, 4 i 7 són les parts (a)-(b) de qualsevol estudi de funció d'examen.`,
    items: [
      { n: "1(a)", q: R`Creixement i extrems de $f(x)=x^2-\frac{16}{x}$.`, sol: R`$f'=2x+\frac{16}{x^2}=\frac{2(x^3+8)}{x^2}=0\Rightarrow x=-2$. Decreixent a $(-\infty,-2)$, creixent a $(-2,0)\cup(0,\infty)$. Mínim relatiu $(-2,12)$.`, check: { label: "f(mín) =", value: 12 } },
      { n: "1(b)", q: R`Creixement i extrems de $f(x)=x+\sqrt[3]{x}$.`, sol: R`$f'=1+\frac{1}{3x^{2/3}}>0$ per a $x\neq0$ (en $x=0$ la derivada és infinita): creixent a tot $\mathbb R$, sense extrems.` },
      { n: "1(c)", q: R`Creixement i extrems de $f(x)=\frac{x^2+2x+1}{x^2+3}$.`, sol: R`$f'=\frac{-2x^2+4x+6}{(x^2+3)^2}=\frac{-2(x-3)(x+1)}{(x^2+3)^2}$. Creixent a $(-1,3)$, decreixent a $(-\infty,-1)\cup(3,\infty)$. Mínim $(-1,0)$, màxim $\left(3,\frac43\right)$.`, check: { label: "f(màx) =", value: 4 / 3 } },
      { n: "1(d)", q: R`Creixement i extrems de $f(x)=\frac{x^2}{x^2-3x+4}$.`, sol: R`$f'=\frac{x(8-3x)}{(x^2-3x+4)^2}$ (el denominador no s'anul·la mai). Creixent a $\left(0,\frac83\right)$, decreixent fora. Mínim $(0,0)$, màxim $\left(\frac83,\frac{16}{7}\right)$.`, check: { label: "f(màx) =", value: 16 / 7 } },
      { n: "2", q: R`$P(x)=\frac{x^3}{3}-\frac{3x^2}{2}-4x+A$. (a) Creixement. (b) Extrems relatius. (c) Per a quins $A$ podem assegurar que $P(x)=0$ té almenys una solució a $(-\infty,0)$? (d) Per a quins $A$ té una solució a $[4,\infty)$?`,
        sol: R`(a) $P'=x^2-3x-4=(x-4)(x+1)$: creixent a $(-\infty,-1)\cup(4,\infty)$, decreixent a $(-1,4)$.<br>
(b) Màxim a $x=-1$: $P(-1)=A+\frac{13}{6}$. Mínim a $x=4$: $P(4)=A-\frac{56}{3}$.<br>
(c) A $(-\infty,0)$, $P$ va de $-\infty$ fins al màxim $A+\frac{13}6$ i baixa fins a $P(0)=A$. Per Bolzano hi ha zero si $A+\frac{13}6\ge0$, és a dir $A\ge-\frac{13}{6}$.<br>
(d) A $[4,\infty)$, $P$ creix de $A-\frac{56}3$ a $+\infty$: hi ha solució si $A-\frac{56}{3}\le0$, és a dir $A\le\frac{56}{3}$.` },
      { n: "3", q: R`Creixement i extrems de (a) $\frac{x^2+4}{x^2-1}$ (b) $\frac{x^2}{x^2-3x+4}$ (c) $e^{-x}(x^2-2x+1)$.`,
        sol: R`(a) $f'=\frac{-10x}{(x^2-1)^2}$: creixent a $x\lt0$, decreixent a $x>0$ (fora de $\pm1$). Màxim relatiu $(0,-4)$.<br>(b) Com 1(d).<br>
(c) $f'=e^{-x}(x-1)(3-x)$: decreixent a $(-\infty,1)\cup(3,\infty)$, creixent a $(1,3)$. Mínim $(1,0)$, màxim $(3,4e^{-3})$.` },
      { n: "4", q: R`Punts crítics i extrems locals de (a) $x^2+\frac{16}{x^2}$ (b) $\frac{x^2+x}{x-1}$ (c) $x^3(1-x)^2$ (d) $\left(\frac{x-2}{x+2}\right)^3$.`,
        sol: R`(a) $f'=2x-\frac{32}{x^3}=0\Rightarrow x=\pm2$: mínims $(\pm2,8)$.<br>
(b) $f'=\frac{x^2-2x-1}{(x-1)^2}=0\Rightarrow x=1\pm\sqrt2$: màxim a $1-\sqrt2$ ($f=3-2\sqrt2$), mínim a $1+\sqrt2$ ($f=3+2\sqrt2$).<br>
(c) $f'=x^2(1-x)(3-5x)$: crítics $0,\frac35,1$. En $0$ no canvia el signe (no és extrem); màxim a $\frac35$ ($f=\frac{108}{3125}$); mínim a $1$ ($f=0$).<br>
(d) $f'=3\left(\frac{x-2}{x+2}\right)^2\frac{4}{(x+2)^2}\ge0$: crític $x=2$ però no és extrem (creixent). Sense extrems.` },
      { n: "5", q: R`L'àrea d'impressió d'un paper ha de ser $81\text{ cm}^2$, amb marges superior i inferior de 3 cm i laterals de 2 cm. Si el preu és proporcional al perímetre, quines dimensions del paper són més econòmiques?`,
        sol: R`Zona impresa $x\times y$ amb $xy=81$. Paper: $(x+4)\times(y+6)$. Perímetre $2(x+y+10)$ ⇒ minimitzem $g(x)=x+\frac{81}{x}$: $g'=1-\frac{81}{x^2}=0\Rightarrow x=9$, $y=9$ ($g''>0$, mínim). Paper de <b>13 cm d'ample × 15 cm d'alt</b>.` },
      { n: "6", q: R`Dimensions del triangle isòsceles d'àrea màxima i perímetre 12 cm.`,
        sol: R`Costats iguals $a$, base $b$: $2a+b=12$. Altura $\sqrt{a^2-b^2/4}=\sqrt{36-6b}$. Àrea $A=\frac b2\sqrt{36-6b}$. Maximitzem $A^2\propto36b^2-6b^3$: derivada $72b-18b^2=0\Rightarrow b=4$, $a=4$. És <b>equilàter de costat 4</b>, àrea $4\sqrt3$.` },
      { n: "7", q: R`Concavitat, convexitat i inflexió de (a) $\frac{x^2+4}{x^2-1}$ (b) $\frac{x^2+x}{x-1}$ (c) $\frac{x-1}{\sqrt{x^2+1}}$.`,
        sol: R`(a) $f''=\frac{10(3x^2+1)}{(x^2-1)^3}$: convexa a $|x|>1$, còncava a $(-1,1)$, sense inflexió.<br>
(b) $f=x+2+\frac2{x-1}$, $f''=\frac4{(x-1)^3}$: còncava a $x\lt1$, convexa a $x>1$.<br>
(c) $f'=\frac{x+1}{(x^2+1)^{3/2}}$, $f''=\frac{-2x^2-3x+1}{(x^2+1)^{5/2}}$. Zeros $x=\frac{-3\pm\sqrt{17}}{4}$ ($\approx-1.78$ i $0.28$): convexa entre ells, còncava fora. Dos punts d'inflexió.` },
      { n: "8", q: R`$f(x)=3x^4+ax^2-7$. Valors d'$a$ perquè: (a) $f$ sigui convexa; (b) tingui almenys un punt d'inflexió; (c) tingui un màxim relatiu.`,
        sol: R`$f''=36x^2+2a$. (a) $f''\ge0$ per a tot $x$ ⇔ $a\ge0$. (b) $f''$ canvia de signe ⇔ $a\lt0$. (c) $f'=2x(6x^2+a)$; si $a\lt0$, $f''(0)=2a\lt0$ ⇒ màxim relatiu a $0$; si $a\ge0$ només hi ha un mínim. Per tant $a\lt0$.` },
      { n: "9", q: R`Valors d'$a$ perquè la recta tangent a $f(x)=x^5+x^4+4x^3+ax+1$ en els punts d'inflexió tingui pendent $-4$.`,
        sol: R`$f''=20x^3+12x^2+24x=4x(5x^2+3x+6)$ i $5x^2+3x+6$ no té arrels reals ⇒ única inflexió a $x=0$. Pendent: $f'(0)=a=-4$.`, check: { label: "a =", value: -4 } },
      { n: "10", q: R`Màxim i mínim absolut de $f$ a $I$: (a) $2x^3+3x^2-12x+1$ a $[-4,1]$ i a $[-3,2]$; (b) $x-\frac{4x}{x+1}$ a $[0,3]$; (c) $\frac{\log x}{x^3}$ a $[1,\infty)$; (d) $(x+1)e^{-x^2}$ a $\mathbb R$.`,
        sol: R`(a) $f'=6(x+2)(x-1)$. A $[-4,1]$: $f(-4)=-31$, $f(-2)=21$, $f(1)=-6$ ⇒ màx $21$, mín $-31$. A $[-3,2]$: $f(-3)=10$, $f(-2)=21$, $f(1)=-6$, $f(2)=5$ ⇒ màx $21$, mín $-6$.<br>
(b) $f'=1-\frac4{(x+1)^2}=0\Rightarrow x=1$. $f(0)=0$, $f(1)=-1$, $f(3)=0$ ⇒ màx $0$ (a $x=0$ i $x=3$), mín $-1$.<br>
(c) $f'=\frac{1-3\ln x}{x^4}=0\Rightarrow x=e^{1/3}$; $f(e^{1/3})=\frac{1}{3e}$, $f(1)=0$, $f\to0^+$ a $\infty$ ⇒ màx $\frac1{3e}$, mín $0$ (a $x=1$).<br>
(d) Interval no tancat: cal mirar límits. $f'=e^{-x^2}(-2x^2-2x+1)=0\Rightarrow x=\frac{-1\pm\sqrt3}{2}$; $f\to0$ a $\pm\infty$. Màx absolut $\frac{1+\sqrt3}{2}e^{\frac{\sqrt3}{2}-1}\approx1.195$; mín absolut $\frac{1-\sqrt3}{2}e^{-1-\frac{\sqrt3}{2}}\approx-0.057$.` }
    ]
  },
  {
    id: "L2",
    title: "Llista 2 — Derivades, Rolle, valor mitjà, derivació implícita",
    short: "Llista 2",
    stars: 2,
    topic: "Regles de derivació (incl. derivació logarítmica), taxes de variació, Rolle, TVM, derivada implícita, unicitat d'arrels.",
    exam: R`Derivada de $f(x)^{g(x)}$ (Abril 2024, 1c) = problemes 1(q)-(t). <b>Unicitat d'arrels amb Bolzano + monotonia/Rolle</b> (Abril 2024 2b, Abril 2023 1c, 2021) = problemes 8 i 9.`,
    items: [
      { n: "1 (a–h)", q: R`Derivades: (a) $6x^7-2x^4+2x+1$ (b) $(x^5+5x-8)^{40}$ (c) $(x^2-3x+2)e^{3x}$ (d) $\frac{x^3-x+1}{x^2-x+5}$ (e) $2^{x^2}-\log_3x$ (f) $\sqrt{3x^2-7x-2}$ (g) $\sqrt[3]{\frac{x-2}{x+1}}$ (h) $e^x\log x$`,
        sol: R`(a) $42x^6-8x^3+2$<br>(b) $40(x^5+5x-8)^{39}(5x^4+5)$<br>(c) $e^{3x}(3x^2-7x+3)$<br>(d) $\frac{x^4-2x^3+16x^2-2x-4}{(x^2-x+5)^2}$<br>(e) $2x\ln2\cdot2^{x^2}-\frac{1}{x\ln3}$<br>(f) $\frac{6x-7}{2\sqrt{3x^2-7x-2}}$<br>(g) $\frac13\left(\frac{x-2}{x+1}\right)^{-2/3}\cdot\frac{3}{(x+1)^2}=\left(\frac{x-2}{x+1}\right)^{-2/3}\frac{1}{(x+1)^2}$<br>(h) $e^x\left(\ln x+\frac1x\right)$` },
      { n: "1 (i–p)", q: R`(i) $\frac{e^x}{\arcsin x}$ (j) $\arcsin x+\arccos x$ (k) $\sqrt{\arccos x}$ (l) $\log\sin x$ (m) $\log(\arctan x)$ (n) $\arccos\sqrt x$ (o) $(\arctan x)^2+x^6$ (p) $\pi\sqrt{x^3}\arccos x^2+1$`,
        sol: R`(i) $\frac{e^x\left(\arcsin x-\frac{1}{\sqrt{1-x^2}}\right)}{\arcsin^2x}$<br>(j) $0$ (és constant, $=\frac\pi2$)<br>(k) $\frac{-1}{2\sqrt{\arccos x}\sqrt{1-x^2}}$<br>(l) $\cot x$<br>(m) $\frac{1}{(1+x^2)\arctan x}$<br>(n) $\frac{-1}{2\sqrt{x}\sqrt{1-x}}$<br>(o) $\frac{2\arctan x}{1+x^2}+6x^5$<br>(p) $\pi\left[\frac32\sqrt x\arccos x^2-\frac{2x^{5/2}}{\sqrt{1-x^4}}\right]$` },
      { n: "1 (q–t)", q: R`Derivació logarítmica: (q) $(\log x)^{\log x}$ (r) $(3x)^x$ (s) $(\sqrt{1+x^2})^{\log x}$ (t) $(\cos x)^{3x}$`,
        sol: R`Recepta: $\ln f=g\ln u$ ⇒ $f'=f\cdot(\ln f)'$.<br>
(q) $f'=(\ln x)^{\ln x}\cdot\frac{\ln\ln x+1}{x}$<br>(r) $f'=(3x)^x(\ln3x+1)$<br>
(s) $f'=(\sqrt{1+x^2})^{\ln x}\left[\frac{\ln(1+x^2)}{2x}+\frac{x\ln x}{1+x^2}\right]$<br>(t) $f'=(\cos x)^{3x}\left[3\ln\cos x-3x\tan x\right]$` },
      { n: "2", q: R`Derivades compostes: (a) $\log((x+1)^2+(x+3)^4)$ (b) $\sin\left(\dfrac{x^3}{\cos x^3}\right)$ (c) $\sin^3(\sin^2(\sin x))$ (d) $\sqrt{1+x^4}+\arctan x^3+(\arcsin x)^5$ (e) $\sqrt[3]{x+\sqrt x}$ (f) $\log\left(\sqrt{1+e^{x^2-x}}+1\right)$ (g) $\log\log(2x^4-3)$ (h) $\arctan^3\!\left(\log(x^3+\sin^24x)\right)$ (i) $\tan\left(\dfrac{x}{x-\sin\left(\frac{x}{x-\sin x}\right)}\right)$ (j) $\sin\left((\cos^3x^2+\sin^6x^4)^5\right)$`,
        sol: R`Regla de la cadena capa per capa (de fora cap a dins):<br>
(a) $\frac{2(x+1)+4(x+3)^3}{(x+1)^2+(x+3)^4}$<br>
(b) Amb $u=\frac{x^3}{\cos x^3}$: $u'=\frac{3x^2\cos x^3+3x^5\sin x^3}{\cos^2x^3}$, i la derivada és $\cos(u)\cdot u'=\cos\!\left(\frac{x^3}{\cos x^3}\right)\cdot\frac{3x^2(\cos x^3+x^3\sin x^3)}{\cos^2x^3}$<br>
(c) $3\sin^2(\sin^2(\sin x))\cos(\sin^2(\sin x))\cdot2\sin(\sin x)\cos(\sin x)\cdot\cos x$<br>
(d) $\frac{2x^3}{\sqrt{1+x^4}}+\frac{3x^2}{1+x^6}+\frac{5(\arcsin x)^4}{\sqrt{1-x^2}}$<br>
(e) $\frac13(x+\sqrt x)^{-2/3}\left(1+\frac{1}{2\sqrt x}\right)$<br>
(f) Amb $v=\sqrt{1+e^{x^2-x}}$: $v'=\frac{(2x-1)e^{x^2-x}}{2v}$, i la derivada és $\frac{v'}{v+1}=\frac{(2x-1)e^{x^2-x}}{2\sqrt{1+e^{x^2-x}}\left(\sqrt{1+e^{x^2-x}}+1\right)}$<br>
(g) $\frac{8x^3}{(2x^4-3)\ln(2x^4-3)}$<br>
(h) Amb $g=x^3+\sin^24x$ (i $g'=3x^2+4\sin8x$, ja que $2\sin4x\cos4x\cdot4=4\sin8x$) i $u=\log g$: la derivada és $3\arctan^2(u)\cdot\frac{u'}{1+u^2}=\dfrac{3\arctan^2\!\left(\log g\right)\cdot g'}{g\left(1+\log^2g\right)}$<br>
(i) Capa per capa, de dins cap a fora: $h=x-\sin x$ ($h'=1-\cos x$), $m=\frac xh$ ($m'=\frac{h-xh'}{h^2}=\frac{x\cos x-\sin x}{h^2}$), $k=x-\sin m$ ($k'=1-\cos(m)\,m'$), $n=\frac xk$ ($n'=\frac{k-xk'}{k^2}$); la derivada final és $\dfrac{n'}{\cos^2n}$. <b>Truc:</b> en problemes tan niats, nomes cal anar baixant un nivell cada vegada i substituir — no intentis simplificar-ho tot de cop.<br>
(j) amb $v=\cos^3x^2+\sin^6x^4$: $\cos(v^5)\cdot5v^4\cdot\left(-6x\cos^2x^2\sin x^2+24x^3\sin^5x^4\cos x^4\right)$` },
      { n: "3", q: R`El costat d'un quadrat creix a 1 cm/s. A quina velocitat creix l'àrea quan el costat fa 10 cm?`, sol: R`$A=l^2$ ⇒ $\frac{dA}{dt}=2l\frac{dl}{dt}=2\cdot10\cdot1=20\ \text{cm}^2/\text{s}$.`, check: { label: "dA/dt =", value: 20 } },
      { n: "4", q: R`Comprova que $f(x)=x-x^3$ compleix les hipòtesis de Rolle a $[0,1]$. En quin punt es compleix la tesi?`, sol: R`Polinomi ⇒ continu i derivable; $f(0)=f(1)=0$. $f'(c)=1-3c^2=0\Rightarrow c=\frac{1}{\sqrt3}\in(0,1)$.`, check: { label: "c =", value: 1 / Math.sqrt(3) } },
      { n: "5", q: R`Comprova que $f(x)=x-x^3$ compleix les hipòtesis del TVM a $[-2,1]$. En quin punt es compleix la tesi?`, sol: R`$\frac{f(1)-f(-2)}{1-(-2)}=\frac{0-6}{3}=-2$. $1-3c^2=-2\Rightarrow c=\pm1$; dins $(-2,1)$ només $c=-1$.`, check: { label: "c =", value: -1 } },
      { n: "6", q: R`Comprova que $e^{xy}+2x-3y+y^3=-1$ passa per $(0,1)$ i troba la derivada en aquest punt.`,
        sol: R`$e^0+0-3+1=-1$ ✓. Derivant implícitament: $e^{xy}(y+xy')+2-3y'+3y^2y'=0$. A $(0,1)$: $1+2+y'(0-3+3)=0\Rightarrow3=0$, impossible. <b>No existeix $y'(0)$</b>: la tangent és <b>vertical</b> (de fet $\frac{dx}{dy}=0$ en aquest punt).` },
      { n: "7", q: R`Proveu que no existeix $f$ derivable amb $f(0)=-1$, $f(2)=4$ i $f'(x)\lt\frac52$ a $[0,2]$. Demostreu que sí existeix $g$ amb $g(0)=-1$, $g(2)=4$ i $g'(x)\le\frac52$.`,
        sol: R`Pel TVM existeix $c\in(0,2)$ amb $f'(c)=\frac{4-(-1)}{2}=\frac52$, que contradiu $f'\lt\frac52$. En canvi, $g(x)=-1+\frac52x$ compleix tot (amb $g'\equiv\frac52$). Geomètricament: la corba ha de tenir en algun punt el pendent de la corda que uneix els extrems.` },
      { n: "8", q: R`Demostreu que $f(x)=6x^5+13x+1$ té exactament una arrel real.`, sol: R`<b>Existència:</b> $f(-1)=-18\lt0$, $f(0)=1>0$ ⇒ Bolzano. <b>Unicitat:</b> $f'=30x^4+13>0$ ⇒ estrictament creixent (o per Rolle: dues arrels donarien $f'(c)=0$).` },
      { n: "9", q: R`Demostreu que $f(x)=x^3+6x^2+15x+1$ té una única arrel real entre $-1$ i $0$.`, sol: R`$f(-1)=-9\lt0$, $f(0)=1>0$ ⇒ Bolzano. $f'=3(x^2+4x+5)=3((x+2)^2+1)>0$ ⇒ estrictament creixent ⇒ única (a tot $\mathbb R$).` }
    ]
  },
  {
    id: "L1",
    title: "Llista 1 — Bolzano, límits i continuïtat",
    short: "Llista 1",
    stars: 2,
    topic: "Teorema de Bolzano, límits laterals, continuïtat a trossos amb paràmetres, càlcul de límits (indeterminacions algebraiques), recta tangent.",
    exam: R`<b>Continuïtat amb paràmetre</b> (pregunta 1 del test 2025) = problemes 6, 7, 8. Recta tangent (Abril 2024, Abril 2023, 2021, 2018) = problema 11. Bolzano = problemes 1–3.`,
    items: [
      { n: "1", q: R`Si $f(x)=x^3-x^2+x$, demostreu que existeix $c$ tal que $f(c)=-1$.`, sol: R`$g(x)=f(x)+1$ és contínua; $g(-1)=-3+1=-2\lt0$, $g(0)=1>0$ ⇒ per Bolzano existeix $c\in(-1,0)$ amb $g(c)=0$, és a dir $f(c)=-1$.` },
      { n: "2", q: R`Demostreu que $\sin x+2x-1=0$ té almenys una arrel a $[0,\frac\pi2]$.`, sol: R`$g(0)=-1\lt0$, $g(\frac\pi2)=1+\pi-1=\pi>0$, $g$ contínua ⇒ Bolzano.` },
      { n: "3", q: R`Demostreu que hi ha tres reals tals que el seu cub és igual a tres vegades el nombre més 1.`, sol: R`$h(x)=x^3-3x-1$. $h(-2)=-3$, $h(-1)=1$, $h(0)=-1$, $h(2)=1$: tres canvis de signe ⇒ arrels a $(-2,-1)$, $(-1,0)$ i $(0,2)$ (de fet $(1,2)$). Un polinomi de grau 3 en té com a màxim 3 ⇒ exactament tres.` },
      { n: "4", q: R`Límits laterals: (a) $\frac{5x+2}{x^2-1}$ en $x=1$ (b) $\frac{-3}{1+e^{1/(x-1)}}$ en $x=1$ (c) $e^{1/|x|}$ en $0$ (d) $3^{1/x}$ en $0$.`, sol: R`(a) $1^-$: $-\infty$; $1^+$: $+\infty$.<br>(b) $1^-$: $e^{-\infty}=0$ ⇒ $-3$; $1^+$: $e^{+\infty}$ ⇒ $0$.<br>(c) $+\infty$ pels dos costats.<br>(d) $0^-$: $0$; $0^+$: $+\infty$.` },
      { n: "5", q: R`Continuïtat de: (a) $\frac{x+1}{3-\sqrt{x^2+5}}$ (b) $4-(x-3)^2$ si $0\le x\le7$, $7x-61$ si $7\lt x\le8$ (c) $x+\frac{|x-2|}{x}$ si $x\neq0$, $1$ si $x=0$ (d) $x\sin\frac1x$ si $x\neq0$, $0$ si $x=0$.`, sol: R`(a) Contínua excepte on $\sqrt{x^2+5}=3$, és a dir $x=\pm2$.<br>(b) En $x=7$: $4-16=-12$ i $49-61=-12$ ⇒ contínua a tot $[0,8]$.<br>(c) En $0$: $\frac{|x-2|}{x}\to\pm\infty$ ⇒ discontinuïtat (asímptota) en $0$; contínua a la resta.<br>(d) $|x\sin\frac1x|\le|x|\to0$ ⇒ contínua a tot $\mathbb R$.` },
      { n: "6", q: R`Valor d'$a$ perquè $f(x)=ax^2+3x-5$ si $x\lt1$, $-2x+7$ si $x\ge1$, sigui contínua en $x=1$.`, sol: R`$\lim_{x\to1^-}f=a-2$, $f(1)=5$ ⇒ $a=7$.`, check: { label: "a =", value: 7 } },
      { n: "7", q: R`Valor d'$a$ perquè $f(x)=a+x^2$ si $x\le0$, $\log(x+e)$ si $x>0$, sigui contínua.`, sol: R`$\lim_{x\to0^+}\ln(x+e)=\ln e=1=f(0)=a$ ⇒ $a=1$.`, check: { label: "a =", value: 1 } },
      { n: "8", q: R`Per a quins $a,b,c$ és contínua $f(x)=-\frac12x+\frac25$ ($x\le-1$), $ax+3$ ($-1\lt x\le2$), $-x+b$ ($2\lt x\le5$), $c$ ($x>5$)?`, sol: R`En $-1$: $\frac12+\frac25=\frac9{10}=3-a\Rightarrow a=\frac{21}{10}$. En $2$: $2a+3=-2+b\Rightarrow b=2a+5=\frac{46}{5}$. En $5$: $c=-5+b=\frac{21}{5}$.`, check: { label: "a =", value: 2.1 } },
      { n: "9 (a–h)", q: R`(a) $\lim_{x\to3}\frac{x^2-9}{x-3}$ (b) $\lim_{x\to1}\frac{2x^3-14x^2+12x}{x^3-10x^2+27x-18}$ (c) $\lim_{h\to0}\frac{(x+h)^2-x^2}{h}$ (d) $\lim_{x\to4}\frac{\sqrt x-\sqrt4}{x-4}$ (e) $\lim_{h\to0}\frac{\sqrt{x+h}-\sqrt x}{h}$ (f) $\lim_{x\to0}\frac1{2+e^{1/x}}$ (g) $\lim_{x\to1}(x^4-3x^3+4)^{\frac1{(x-1)^4}}$ (h) $\lim_{x\to1}(3x^5-2)^{\frac{-2}{x-1}}$`,
        sol: R`(a) $6$. (b) $\frac{2x(x-1)(x-6)}{(x-1)(x-3)(x-6)}\to\frac{2}{-2}=-1$. (c) $2x$. (d) $\frac{1}{\sqrt x+2}\to\frac14$. (e) $\frac1{2\sqrt x}$. (f) $0^+$: $0$; $0^-$: $\frac12$ ⇒ no existeix. (g) base $\to2$, exponent $\to+\infty$ ⇒ $+\infty$ (no és indeterminació). (h) $1^\infty$: exponent $\frac{-2\ln(3x^5-2)}{x-1}\overset{H}{\to}-2\cdot15=-30$ ⇒ $e^{-30}$.` },
      { n: "9 (i–p)", q: R`(i) $\lim_{x\to\infty}\frac{2x^5-x^3-5x^2}{2x^2+3x-7}$ (j) $\lim_{x\to\infty}\frac{2x^2-3x+5}{3x^3+2x-4}$ (k) $\lim_{x\to\infty}\frac{-5x^2-7x-3}{3x^2+5x-6}$ (l) $\lim_{x\to-\infty}(\sqrt{x^2-3x}+x)$ (m) $\lim_{x\to\infty}(\sqrt{x+1}-\sqrt x)$ (n) $\lim_{x\to\infty}(\sqrt{x^2+2x}-\sqrt{3x})$ (o) $\lim_{x\to\infty}(x^2-\sqrt{x^3+a}\sqrt{x+b})$ (p) $\lim_{x\to\infty}\frac{\log(4x^2+5x+7)}{\log(x+3)}$`,
        sol: R`(i) $+\infty$. (j) $0$. (k) $-\frac53$.<br>(l) Conjugat: $\frac{-3x}{\sqrt{x^2-3x}-x}$; per $x\to-\infty$, $\sqrt{x^2-3x}\approx-x$ ⇒ $\frac{-3x}{-2x}=\frac32$. <b>Compte</b>: $\sqrt{x^2}=|x|=-x$ quan $x\lt0$.<br>
(m) $\frac{1}{\sqrt{x+1}+\sqrt x}\to0$. (n) $+\infty$.<br>
(o) $\frac{x^4-(x^3+a)(x+b)}{x^2+\sqrt{\cdots}}=\frac{-bx^3-ax-ab}{x^2+\sqrt\cdots}$: si $b>0$, $-\infty$; si $b\lt0$, $+\infty$; si $b=0$, $0$.<br>
(p) $\frac{\ln4+2\ln x+\cdots}{\ln x+\cdots}\to2$.` },
      { n: "10", q: R`Valor de $\displaystyle\lim_{x\to a^+}\frac{x^2-(1-a)x-a}{x^2-a^2}$ segons $a$.`, sol: R`$x^2-(1-a)x-a=(x-1)(x+a)$ i $x^2-a^2=(x-a)(x+a)$ ⇒ $\frac{x-1}{x-a}$ (per $a\neq0$; per $a=0$ queda igual). Quan $x\to a^+$: numerador $\to a-1$, denominador $\to0^+$.<br>$a\lt1$: $-\infty$. $\quad a=1$: $1$. $\quad a>1$: $+\infty$.` },
      { n: "11", q: R`Recta tangent a $f(x)=\frac{x}{x^2+1}$ en $x=2$.`, sol: R`$f(2)=\frac25$, $f'=\frac{1-x^2}{(x^2+1)^2}\Rightarrow f'(2)=-\frac{3}{25}$. $$y=\frac25-\frac3{25}(x-2)=-\frac{3}{25}x+\frac{16}{25}$$`, check: { label: "pendent =", value: -3 / 25 } },
      { n: "12", q: R`Punts de $f(x)=3x^2-2x+1$ on la recta tangent passa per $(2,6)$.`, sol: R`Tangent en $a$: $y=f(a)+f'(a)(x-a)$. Imposant $(2,6)$: $6=3a^2-2a+1+(6a-2)(2-a)=-3a^2+12a-3$ ⇒ $a^2-4a+3=0$ ⇒ $a=1,3$. Punts $(1,2)$ i $(3,22)$.` }
    ]
  },
  {
    id: "L0",
    title: "Llista 0 — Bàsics (inequacions, valor absolut, rectes, funcions, exp/log, trigonometria)",
    short: "Llista 0",
    stars: 1,
    topic: "Coneixements previs: no es fan a classe, però surten dins de problemes d'examen.",
    exam: R`Inequacions (Abril 2024 1b, 2021 test 5) = problemes 1, 3. Equacions exponencials amb canvi $t=e^x$ (Abril 2024 1a, Abril 2023 1b) = problema 12. Rectes = base de la recta tangent.`,
    items: [
      { n: "1", q: R`(a) $2x+7>3$ (b) $1+x\lt7x+5$ (c) $4\le3x-2\lt13$ (d) $(x-1)(x-2)>0$ (e) $x^3-x\le0$ (f) $x^2\lt2x+8$`, sol: R`(a) $x>-2$. (b) $x>-\frac23$. (c) $2\le x\lt5$. (d) $x\lt1$ o $x>2$. (e) $x(x-1)(x+1)\le0\iff x\in(-\infty,-1]\cup[0,1]$. (f) $(x-4)(x+2)\lt0\iff-2\lt x\lt4$.` },
      { n: "2", q: R`Escriviu sense valor absolut: (a) $|3x-2|$ (b) $|x^2+1|$ (c) $|1-2x^2|$ (d) $|x^2-5x-24|$`, sol: R`(a) $3x-2$ si $x\ge\frac23$; $2-3x$ si $x\lt\frac23$. (b) $x^2+1$ sempre. (c) $1-2x^2$ si $|x|\le\frac1{\sqrt2}$; $2x^2-1$ altrament. (d) $x^2-5x-24$ si $x\le-3$ o $x\ge8$; $-(x^2-5x-24)$ si $-3\lt x\lt8$.` },
      { n: "3", q: R`En forma d'interval: (a) $|3x+2|\ge4$ (b) $1\le|x|\lt4$ (c) $\left|\frac{2-3x}{1+2x}\right|\le4$`, sol: R`(a) $(-\infty,-2]\cup[\frac23,\infty)$. (b) $(-4,-1]\cup[1,4)$.<br>(c) $\frac{2-3x}{1+2x}\le4\iff\frac{11x+2}{2x+1}\ge0\iff x\lt-\frac12$ o $x\ge-\frac2{11}$; $\ \ge-4\iff\frac{5x+6}{2x+1}\ge0\iff x\le-\frac65$ o $x>-\frac12$. Intersecció: $(-\infty,-\frac65]\cup[-\frac2{11},\infty)$.` },
      { n: "4", q: R`Demostreu que $2x-y=4$ i $6x-2y=10$ no són paral·leles i calculeu el punt d'intersecció.`, sol: R`Pendents $2$ i $3$ ⇒ no paral·leles. $2x-4=3x-5\Rightarrow x=1$, $y=-2$. Punt $(1,-2)$.` },
      { n: "5–6", q: R`Rectes: per $P=(1,5),Q=(4,11)$; per $(-3,3),(-1,-6)$; per $(1,1)$ amb pendent $\frac12$; per $(1,2)$ paral·lela a la que passa per $(0,3),(4,0)$; per $(-1,3)$ perpendicular a $y=3x+8$.`, sol: R`$y=2x+3$ (pendent 2). $\ y=-\frac92x-\frac{21}{2}$ (pendent $-\frac92$). $\ y=\frac x2+\frac12$. $\ y=-\frac34x+\frac{11}{4}$. $\ y=-\frac13x+\frac83$ (pendent perpendicular $=-\frac1m$).` },
      { n: "7", q: R`Dominis: (a) $\sqrt{x(x-1)}$ (b) $\sqrt[3]{1-x^2}$ (c) $\ln\frac{|x|-1}{x^2-2}$ (d) $\sqrt{1-\sqrt{9-x^2}}$`, sol: R`(a) $(-\infty,0]\cup[1,\infty)$. (b) $\mathbb R$ (arrel senar). (c) $\frac{|x|-1}{x^2-2}>0$: $(-\infty,-\sqrt2)\cup(-1,1)\cup(\sqrt2,\infty)$. (d) $|x|\le3$ i $9-x^2\le1$ ⇒ $[-3,-2\sqrt2]\cup[2\sqrt2,3]$.` },
      { n: "8–10", q: R`Gràfiques de paràboles ($ax^2$, translacions) i $f(x)=x^2+6x+10$: completar quadrats, injectivitat a $[-3,\infty)$ i inversa.`, sol: R`$a(x-h)^2+k$: vèrtex $(h,k)$, oberta cap amunt si $a>0$, més estreta si $|a|$ gran. $x^2+6x+10=(x+3)^2+1$, vèrtex $(-3,1)$; creixent a $[-3,\infty)$ ⇒ injectiva. Inversa: $f^{-1}(x)=-3+\sqrt{x-1}$, $x\ge1$.` },
      { n: "11", q: R`$f(x)=3x^2$, $g(x)=\sqrt{x+3}$. Trobeu $f\circ g$, $g\circ f$, $g\circ g$, $f\circ f$.`, sol: R`$f\circ g=3(x+3)$ ($x\ge-3$); $g\circ f=\sqrt{3x^2+3}$; $g\circ g=\sqrt{\sqrt{x+3}+3}$; $f\circ f=27x^4$.` },
      { n: "12", q: R`(a) $4^x+4^{-x}=4$ (b) $3e^{2x}-2e^x=8$ (c) $e^x-6e^{-x}=1$ (d) $\ln[(2x+1)(x+2)]=2\ln(x+2)$`, sol: R`(a) $t=4^x$: $t^2-4t+1=0\Rightarrow t=2\pm\sqrt3$ ⇒ $x=\pm\log_4(2+\sqrt3)$.<br>(b) $3t^2-2t-8=0\Rightarrow t=2$ ($t=-\frac43$ descartada) ⇒ $x=\ln2$.<br>(c) $t^2-t-6=0\Rightarrow t=3$ ⇒ $x=\ln3$.<br>(d) Domini $x>-\frac12$. $(2x+1)(x+2)=(x+2)^2\Rightarrow x=1$ ($x=-2$ fora del domini).`, check: { label: "(b) x =", value: Math.log(2) } },
      { n: "13–14", q: R`Demostreu $\ln(|x|+\sqrt{x^2-a^2})=-\ln(|x|-\sqrt{x^2-a^2})+2\ln a$ per $|x|\ge a>0$. Resoleu $\frac1{\ln5}\ln[(3x^2-3)(x^2+2)]=\log_5(x^2+2)$.`, sol: R`13: $(|x|+\sqrt{x^2-a^2})(|x|-\sqrt{x^2-a^2})=a^2$; prenent $\ln$: $\ln A+\ln B=2\ln a$.<br>14: l'esquerra és $\log_5[(3x^2-3)(x^2+2)]$ ⇒ $3x^2-3=1\Rightarrow x=\pm\frac{2}{\sqrt3}$ (compleixen $|x|>1$).` },
      { n: "15–18", q: R`Graus/radians; identitats trigonomètriques; $\tan15°$, $\sin15°$, $\cos15°$; problema del far; $2\sin^2x+\sin x-1=0$; $\sin x+\cos x=\frac1{\sqrt2}$.`, sol: R`15: $120°=\frac{2\pi}3$, $155°=\frac{31\pi}{36}$, $270°=\frac{3\pi}2$, $130°=\frac{13\pi}{18}$; $\frac\pi{10}=18°$, $\frac{3\pi}8=67.5°$, $\frac{2\pi}3=120°$, $\frac{5\pi}4=225°$.<br>
16: divideix $\sin^2+\cos^2=1$ per $\cos^2$; usa $\cos2x=1-2\sin^2x=2\cos^2x-1$.<br>
17: $\tan15°=2-\sqrt3$; $\sin15°=\frac{\sqrt6-\sqrt2}4$, $\cos15°=\frac{\sqrt6+\sqrt2}4$; far: $d=\frac{50}{\tan15°}=50(2+\sqrt3)\approx186.6$ m.<br>
18: (a) $\sin x=\frac12$ o $-1$: $x=\frac\pi6,\frac{5\pi}6,\frac{3\pi}2$ $(+2k\pi)$. (b) $\sqrt2\sin(x+\frac\pi4)=\frac1{\sqrt2}\Rightarrow\sin(x+\frac\pi4)=\frac12$: $x=-\frac\pi{12}$ o $\frac{7\pi}{12}$ $(+2k\pi)$.` }
    ]
  }
];
