/* exam2026.js — Primer parcial 2026 (el més recent), amb les solucions oficials. */
(function () {
  const R = String.raw;
  EXAM_ORDER.unshift("2026");
  REAL_EXAMS.push({
    id: "2026",
    title: "Primer Parcial — 2026",
    tag: "AQUEST CURS · EL MÉS RECENT",
    hot: true,
    format: "Test de 5 preguntes (4 punts) + 2 problemes de 3 punts (6 punts a cada model: versions A i B). Problema 1: estudi i gràfica d'una funció racional senar. Problema 2: Taylor i zeros de funcions (Bolzano + residu de Lagrange).",
    problems: [
      {
        title: "Preguntes de test (4 punts)",
        statement: "",
        parts: [
          { q: R`1. Considerem $f(x)=\begin{cases}\dfrac{1-\cos(2x)-ax^2}{x^4}, & x\neq0\\[2mm] -\dfrac23, & x=0\end{cases}$. Per a quin valor de $a$ la funció és contínua en $x=0$?`,
            sol: R`Si és contínua en $0$, $\lim_{x\to0}x^2f(x)=0$. Amb dues aplicacions de l'Hôpital: $$0=\lim\frac{1-\cos2x-ax^2}{x^2}=\lim\frac{2\sin2x-2ax}{2x}=\lim(2\cos2x-a)=2-a.$$ Per tant $a=2$. Amb aquest valor, quatre aplicacions de l'Hôpital (sempre $0/0$): $$\lim f=\lim\frac{2\sin2x-4x}{4x^3}=\lim\frac{4\cos2x-4}{12x^2}=\lim\frac{-8\sin2x}{24x}=\lim\frac{-16\cos2x}{24}=-\frac23=f(0).$$ <b>$a=2$.</b>` },
          { q: R`2. Sigui $f(x)=\ln x$, $x\in[1,e]$. Quin és el valor de $c\in(1,e)$ que satisfà la igualtat del teorema del valor mitjà?`,
            sol: R`$\ln x$ és contínua a $[1,e]$ i derivable a $(1,e)$: $$\frac1c=f'(c)=\frac{f(e)-f(1)}{e-1}=\frac1{e-1}.$$ <b>$c=e-1$</b> (i $1<e-1<e$ ✓).` },
          { q: R`3. Sigui $f:\mathbb R\to\mathbb R$ derivable amb $f'(x)>0$ si $x<0$, $f'(x)<0$ si $x>0$, i $f(-1)=f(1)=0$. En quins intervals és estrictament creixent $g(x)=[f(x)]^2$?`,
            sol: R`$f$ creix a $(-\infty,0)$ i decreix a $(0,+\infty)$. Com $f(-1)=f(1)=0$: $f<0$ a $(-\infty,-1)\cup(1,+\infty)$ i $f>0$ a $(-1,1)$. Aleshores $g'(x)=2f(x)f'(x)$: $g'<0$ a $(-\infty,-1)\cup(0,1)$ i $g'>0$ a $(-1,0)\cup(1,+\infty)$. <b>$g$ creix a $(-1,0)$ i $(1,+\infty)$.</b>` },
          { q: R`4. Sigui $f(x)=e^{-x^2}\sin^2(x^2)$. Quin és el polinomi de Taylor de grau 8 de $f$ al voltant de $x=0$?`,
            sol: R`$e^{-x^2}=1-x^2+\frac{x^4}{2}+O(x^6)$ i $\sin^2(x^2)=x^4-\frac{x^8}{3}+O(x^{12})$. Multiplicant i agrupant fins a grau 8: $$e^{-x^2}\sin^2(x^2)=x^4-x^6+\left(\tfrac12-\tfrac13\right)x^8+O(x^{10}).$$ <b>$P_8(x)=x^4-x^6+\dfrac{x^8}{6}$.</b>` },
          { q: R`5. Sigui $g(x)=\cos(x^2)$. Quant val $g^{(8)}(0)$?`,
            sol: R`$g(x)=\cos(x^2)=1-\frac{x^4}{2!}+\frac{x^8}{4!}+O(x^{12})$. El coeficient de $x^8$ és $g^{(8)}(0)/8!=1/4!$, per tant <b>$g^{(8)}(0)=\dfrac{8!}{4!}=1680$.</b>` }
        ]
      },
      {
        title: "Problema 1 — Versió A (3 punts): estudi i gràfica",
        statement: R`Considerem la funció $f(x)=\dfrac{x^3}{x^2-1}$.`,
        parts: [
          { q: "(a) (0,75 p) Determineu el domini de $f$ i totes les seves asímptotes.",
            sol: R`$f(-x)=-f(x)$: <b>funció senar</b> (només cal estudiar $x\ge0$ i reflectir respecte de l'origen). El denominador s'anul·la a $x=\pm1$: $D_f=\mathbb R\setminus\{-1,1\}$. $\lim_{x\to1^-}f=-\infty$, $\lim_{x\to1^+}f=+\infty$: AV $x=1$ i, per simetria, $x=-1$. Dividint: $f(x)=x+\dfrac{x}{x^2-1}$, i $\lim(f(x)-x)=0$: <b>asímptota obliqua $y=x$</b> (a $\pm\infty$). No hi ha horitzontals.` },
          { q: "(b) (0,75 p) Creixement i decreixement; extrems relatius.",
            sol: R`$f'(x)=\dfrac{3x^2(x^2-1)-2x^4}{(x^2-1)^2}=\dfrac{x^2(x^2-3)}{(x^2-1)^2}$. Per a $x>0$ el signe el dona $x^2-3$: decreix a $(0,1)$ i $(1,\sqrt3)$, creix a $(\sqrt3,+\infty)$. <b>Mínim relatiu</b> a $x=\sqrt3$: $f(\sqrt3)=\dfrac{3\sqrt3}{2}$. A $x=0$: $f'(0)=0$ però segueix decreixent: <b>no és extrem</b>. Per senar: creix a $(-\infty,-\sqrt3)$ i $(\sqrt3,\infty)$, decreix a $(-\sqrt3,-1),(-1,1),(1,\sqrt3)$; <b>màxim relatiu</b> a $x=-\sqrt3$: $f=-\dfrac{3\sqrt3}{2}$.` },
          { q: "(c) (0,5 p) Convexitat i concavitat; punts d'inflexió.",
            sol: R`$f''(x)=\dfrac{2x(x^2+3)}{(x^2-1)^3}$. Per a $x>0$: còncava a $(0,1)$, convexa a $(1,\infty)$. Per senar: $f''>0$ a $(-1,0)$ i $f''<0$ a $(-\infty,-1)$. <b>Únic punt d'inflexió: $(0,0)$</b> (amb tangent horitzontal, $f'(0)=0$).` },
          { q: "(d) (0,5 p) Representeu aproximadament la gràfica de $f$.",
            sol: R`Tres branques i dues AV: a $(0,1)$ baixa de $0$ a $-\infty$; a $(1,\infty)$ baixa de $+\infty$ al mínim $(\sqrt3,3\sqrt3/2)$ i després creix acostant-se a $y=x$; la part $x<0$ és la simètrica respecte de l'origen.<div class='plot' data-f='x^3/(x^2-1)' data-xr='-4.5,4.5' data-yr='-15,15' data-va='-1,1' data-lines='x' data-pts='0,0;1.732,2.598;-1.732,-2.598'></div>` },
          { q: "(e) (0,5 p) Segons el paràmetre $a\\in\\mathbb R$, nombre de solucions reals de $f(x)=a$. Justifiqueu-ho.",
            sol: R`Per imparitat $N(a)=N(-a)$: n'hi ha prou amb $a\ge0$. La branca central $(-1,1)$ és contínua i estrictament decreixent de $+\infty$ a $-\infty$: <b>una</b> solució per a cada $a$. La branca $(-\infty,-1)$ ($f<0$) no en dona per a $a\ge0$. A $(1,\infty)$ el mínim és $m=\frac{3\sqrt3}2$: dues solucions si $a>m$, una si $a=m$, cap si $0\le a<m$. Per simetria: $$N(a)=\begin{cases}3,&|a|>\frac{3\sqrt3}{2}\\2,&|a|=\frac{3\sqrt3}{2}\\1,&|a|<\frac{3\sqrt3}{2}\end{cases}$$` }
        ]
      },
      {
        title: "Problema 1 — Versió B (3 punts): estudi i gràfica",
        statement: R`Considerem la funció $f(x)=\dfrac{5x^3+4x}{x^2-1}$.`,
        parts: [
          { q: "(a) (0,75 p) Domini i asímptotes.",
            sol: R`Senar ($f(-x)=-f(x)$). $D_f=\mathbb R\setminus\{-1,1\}$. $\lim_{x\to1^-}f=-\infty$, $\lim_{x\to1^+}f=+\infty$: AV $x=\pm1$. Dividint: $f(x)=5x+\dfrac{9x}{x^2-1}$ i $\lim(f-5x)=0$: <b>asímptota obliqua $y=5x$</b> (a $\pm\infty$). Sense horitzontals.` },
          { q: "(b) (0,75 p) Creixement i decreixement; extrems relatius.",
            sol: R`$f'(x)=\dfrac{5x^4-19x^2-4}{(x^2-1)^2}=\dfrac{(x^2-4)(5x^2+1)}{(x^2-1)^2}$. Per a $x\ge0$: decreix a $(0,1)$ i $(1,2)$, creix a $(2,\infty)$; <b>mínim relatiu</b> $f(2)=\dfrac{40+8}{3}=16$. Per senar: creix a $(-\infty,-2)$ i $(2,\infty)$, decreix a $(-2,-1),(-1,1),(1,2)$; <b>màxim relatiu</b> $f(-2)=-16$.` },
          { q: "(c) (0,5 p) Convexitat i concavitat; punts d'inflexió.",
            sol: R`$f''(x)=\dfrac{18x(x^2+3)}{(x^2-1)^3}$. Còncava a $(0,1)$, convexa a $(1,\infty)$; per senar convexa a $(-1,0)$ i còncava a $(-\infty,-1)$. <b>Únic punt d'inflexió $(0,0)$</b>, amb $f'(0)=-4$: tangent $y=-4x$.` },
          { q: "(d) (0,5 p) Representeu aproximadament la gràfica de $f$.",
            sol: R`A $(0,1)$ baixa de $0$ a $-\infty$; a $(1,\infty)$ baixa de $+\infty$ al mínim $(2,16)$ i torna a créixer acostant-se a $y=5x$; $x<0$ per simetria central.<div class='plot' data-f='(5*x^3+4*x)/(x^2-1)' data-xr='-4.5,4.5' data-yr='-45,45' data-va='-1,1' data-lines='5*x' data-pts='0,0;2,16;-2,-16'></div>` },
          { q: "(e) (0,5 p) Nombre de solucions reals de $f(x)=a$ segons $a$.",
            sol: R`Per imparitat $N(a)=N(-a)$. La branca central $(-1,1)$ és estrictament decreixent i pren tots els valors: sempre una solució. Per a $a\ge0$, la branca $(1,\infty)$ té mínim $16$: dues solucions si $a>16$, una si $a=16$, cap si $0\le a<16$. $$N(a)=\begin{cases}3,&|a|>16\\2,&|a|=16\\1,&|a|<16\end{cases}$$ (arrels reals diferents).` }
        ]
      },
      {
        title: "Problema 2 — Versió A (3 punts): Taylor i zeros",
        statement: R`Considerem $g(x)=24\sin x+25x-26$.`,
        parts: [
          { q: R`(a) (0,75 p) Demostreu que $g$ té exactament una arrel real $\alpha$ i que $0<\alpha<2$.`,
            sol: R`$g'(x)=24\cos x+25\ge1>0$: $g$ estrictament creixent, com a màxim una arrel. $g(0)=-26<0$ i $g(2)=24\sin2+24>0$ (perquè $0<2<\pi$). Bolzano dona una arrel a $(0,2)$, única per monotonia: <b>$\exists!\,\alpha\in(0,2)$, $g(\alpha)=0$.</b>` },
          { q: "(b) (0,75 p) Polinomi de Taylor d'ordre 3 de $g$ centrat en $x=0$.",
            sol: R`$g(0)=-26$, $g'(0)=49$, $g''(0)=0$, $g^{(3)}(0)=-24$. <b>$P_3(x)=-26+49x-\dfrac{24}{3!}x^3=-26+49x-4x^3$.</b>` },
          { q: R`(c) (1 p) Amb $P_3$ i el residu de Lagrange, demostreu que $\frac12<\alpha<1$. (Indicació: $g=P_3+R_3$ i comproveu que per $0<x\le1$, $0<R_3(x)\le x^4$.)`,
            sol: R`$R_3(x)=\dfrac{g^{(4)}(\xi)}{4!}x^4=x^4\sin\xi$, $0<\xi<x$, amb $g^{(4)}=24\sin x$. Si $0<x\le1$, $0<\xi<1<\pi$ i $0<\sin\xi\le1$: <b>$0<R_3(x)\le x^4$</b>. Avaluem: $P_3(\tfrac12)=-2$, $P_3(1)=19$. Aleshores $g(\tfrac12)\le-2+\tfrac1{16}<0$ i $g(1)>19>0$. Bolzano + unicitat: <b>$\tfrac12<\alpha<1$.</b>` },
          { q: "(d) (0,5 p) Justifiqueu que $g$ té màxim i mínim absoluts a $[0,2]$ i determineu-los.",
            sol: R`Weierstrass: contínua en $[0,2]$ ⇒ assoleix extrems absoluts. Com $g'>0$: <b>mínim $g(0)=-26$, màxim $g(2)=24\sin2+24$.</b>` }
        ]
      },
      {
        title: "Problema 2 — Versió B (3 punts): Taylor i zeros",
        statement: R`Considerem $g(x)=6\sin x+10x-17$.`,
        parts: [
          { q: R`(a) (0,75 p) Demostreu que $g$ té exactament una arrel real $\alpha$ i que $0<\alpha<3$.`,
            sol: R`$g'(x)=6\cos x+10\ge4>0$: estrictament creixent, com a màxim una arrel. $g(0)=-17<0$, $g(3)=13+6\sin3>0$ ($0<3<\pi$). Bolzano + monotonia: <b>$\exists!\,\alpha\in(0,3)$.</b>` },
          { q: "(b) (0,75 p) Polinomi de Taylor d'ordre 3 de $g$ centrat en $x=0$.",
            sol: R`$g(0)=-17$, $g'(0)=16$, $g''(0)=0$, $g^{(3)}(0)=-6$. <b>$P_3(x)=-17+16x-x^3$.</b>` },
          { q: R`(c) (1 p) Amb $P_3$ i el residu de Lagrange, demostreu que $1<\alpha<2$. (Indicació: per $0<x\le2$, $0<R_3(x)\le x^4/4$.)`,
            sol: R`$g^{(4)}=6\sin x$: $R_3(x)=\dfrac{x^4}{4}\sin\xi$. Si $0<x\le2$, $0<\xi<2<\pi$: <b>$0<R_3\le\dfrac{x^4}{4}$.</b> $P_3(1)=-2$, $P_3(2)=7$. Llavors $g(1)\le-2+\tfrac14=-\tfrac74<0$ i $g(2)>7>0$. Bolzano + unicitat: <b>$1<\alpha<2$.</b>` },
          { q: "(d) (0,5 p) Màxim i mínim absoluts de $g$ a $[0,3]$.",
            sol: R`Contínua a $[0,3]$ (Weierstrass) i $g'>0$: <b>mínim $g(0)=-17$, màxim $g(3)=13+6\sin3$.</b>` }
        ]
      }
    ]
  });
  REAL_EXAMS.sort((a, b) => EXAM_ORDER.indexOf(a.id) - EXAM_ORDER.indexOf(b.id));
})();
