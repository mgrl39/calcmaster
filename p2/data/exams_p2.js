/* ============================================================
   exams_p2.js — Exàmens reals del 2n Parcial (integrals i EDOs),
   del més recent al més antic, amb solucions pas a pas.
   Cada apartat porta `t`: les llistes on es practica (l7…l13).
   Totes les solucions s'han comprovat numèricament
   (derivant les primitives, integrant les àrees i substituint a les EDOs).
   ============================================================ */
const P2_EXAMS = (function () {
  const R = String.raw;
  return [
    {
      id: 'sol',
      title: '2n Parcial — solucionari amb test',
      tag: 'FORMAT ACTUAL (test de 5 opcions)',
      hot: true,
      pdf: ['p2-solucionari-test.pdf'],
      format: 'Test de 5 preguntes amb 5 opcions + 2 problemes de 3 punts. És el format del curs 2025-26 (el mateix que el 1r parcial de 2025). Al PDF no hi consta l\'any. La primera pàgina del PDF està malmesa: de les preguntes 1–3 només es conserva l\'enunciat i la resposta.',
      test: [
        {
          t: 'l9', q: R`Sigui $F(x)=\sqrt{\displaystyle\int_0^{x^2} t\,e^t\,dt}$. El valor de $F'(1)$ és:`,
          options: ['$e$', R`$\dfrac e2$`, R`$\dfrac1e$`, '$e^2$', 'Cap opció és correcta'],
          correct: 0,
          exp: R`Sigui $G(u)=\int_0^u te^t\,dt$. Pel <b>TFC</b>, $G'(u)=ue^u$. Regla de la cadena: $F=\sqrt{G(x^2)}\Rightarrow F'(x)=\dfrac{G'(x^2)\cdot2x}{2\sqrt{G(x^2)}}=\dfrac{x^3e^{x^2}}{\sqrt{G(x^2)}}$. Falta $G(1)=\int_0^1te^t\,dt=[e^t(t-1)]_0^1=0-(-1)=1$ (per parts). Llavors $F'(1)=\dfrac{e}{\sqrt1}=e$.`
        },
        {
          t: 'l12', q: R`Per a l'EDO $y''+4y=x^3\cos(2x)$, quina és la forma correcta d'una solució particular pel mètode dels coeficients indeterminats?`,
          options: [R`$(Ax^3+Bx^2+Cx)\cos 2x+(Ex^3+Fx^2+Gx)\sin 2x$`, R`$x\big[(Ax^3+Bx^2+Cx)\cos 2x+(Ex^3+Fx^2+Gx)\sin 2x\big]$`, R`$(Ax^3+Bx^2+Cx+D)\cos 2x$`, R`$x^2\big[(Ax^3+Bx^2+Cx)\cos 2x+(Ex^3+Fx^2+Gx)\sin 2x\big]$`, 'Cap opció és correcta'],
          correct: 4,
          exp: R`Homogènia: $r^2+4=0\Rightarrow r=\pm2i$, és a dir $y_h=C_1\cos2x+C_2\sin2x$. Com que $\cos2x$ ja és solució de l'homogènia (<b>ressonància</b>), cal multiplicar per $x$: $$y_p=x\big[(Ax^3+Bx^2+Cx+D)\cos2x+(Ex^3+Fx^2+Gx+H)\sin2x\big].$$ Els polinomis han de ser <b>complets</b> (amb terme constant). De fet, la solució és $y_p=\left(\tfrac{x^3}{16}-\tfrac{3x}{128}\right)\cos2x+\left(\tfrac{x^4}{16}-\tfrac{3x^2}{64}\right)\sin2x$, i el terme $-\tfrac{3x}{128}\cos 2x$ (que és $x\cdot D$ amb $D\neq0$) no hi cap a l'opció (b). <br>⚠️ El solucionari marca <b>(b)</b> com a «oficial», tot i reconèixer que li falta el terme constant. Matemàticament és <b>(e)</b>. Lliçó: amb ressonància, multiplica per $x$ <b>i</b> posa els polinomis sencers.`
        }
      ],
      problems: [
        {
          title: 'Preguntes de test 1–3 (les opcions no es conserven senceres)',
          parts: [
            { t: ['l10'], q: R`<b>1.</b> Resoleu $P'(t)=kP(t)$ amb $P(0)=A$ i trobeu el temps $t$ en què $P(t)=\dfrac A4$.`,
              sol: R`EDO de <b>variables separables</b>: $\dfrac{dP}{P}=k\,dt\Rightarrow\ln|P|=kt+C\Rightarrow P(t)=C_0e^{kt}$. Amb $P(0)=A$: $C_0=A$, així que $P(t)=Ae^{kt}$.<br>$\dfrac A4=Ae^{kt}\Rightarrow e^{kt}=\dfrac14\Rightarrow kt=-\ln4\Rightarrow$ <b>$t=-\dfrac{\ln4}{k}$</b> (opció (a); té sentit si $k<0$, és a dir, si la població decreix).` },
            { t: ['l9'], q: R`<b>2.</b> Calculeu l'àrea entre $f(x)=x^3-4x$ i $g(x)=x$.`,
              sol: R`<b>Punts de tall:</b> $x^3-4x=x\iff x(x^2-5)=0\iff x=0,\pm\sqrt5$.<br><b>Qui està a sobre?</b> A $x=1$: $f(1)=-3$, $g(1)=1$, així que a $(0,\sqrt5)$ manda $g$. Les dues funcions són senars, i l'àrea a $[-\sqrt5,0]$ és la mateixa: $$A=2\int_0^{\sqrt5}(5x-x^3)\,dx=2\left[\tfrac{5x^2}{2}-\tfrac{x^4}{4}\right]_0^{\sqrt5}=2\left(\tfrac{25}{2}-\tfrac{25}{4}\right)=\boxed{\tfrac{25}{2}}$$ (opció (a)). <div class='plot' data-f='x^3-4*x' data-xr='-3,3' data-yr='-6,6' data-lines='x' data-pts='0,0;2.236,2.236;-2.236,-2.236'></div>` },
            { t: ['l12'], q: R`<b>3.</b> Quina EDO lineal homogènia té com a solucions $e^x$ i $xe^x$? (Opcions conservades: (a) $y''-2y'+y=0$; (c) $y''-y=0$; (d) $y''+y=0$; (e) cap.)`,
              sol: R`$e^{rx}$ és solució si $r$ és arrel del <b>polinomi característic</b>. Que surti $xe^x$ vol dir que $r=1$ és arrel <b>doble</b>: $(r-1)^2=r^2-2r+1=0$. Tornant a l'EDO ($r^2\to y''$, $r\to y'$, $1\to y$): <b>$y''-2y'+y=0$</b>, opció (a).` }
          ]
        },
        {
          title: 'Problema 1 (3 punts)',
          parts: [
            { t: ['l8'], q: R`(a) (i) Trobeu $A,B,C$ tals que $\dfrac{3x^2+5x+2}{x(x^2+1)}=\dfrac Ax+\dfrac{Bx+C}{x^2+1}$. (ii) Calculeu $\displaystyle\int\frac{3x^2+5x+2}{x(x^2+1)}\,dx$.`,
              sol: R`(i) Multiplicant per $x(x^2+1)$: $3x^2+5x+2=A(x^2+1)+(Bx+C)x=(A+B)x^2+Cx+A$. Igualant coeficients: $A=2$, $C=5$, $A+B=3\Rightarrow B=1$. <b>$A=2,\ B=1,\ C=5$</b>.<br>(ii) $$\int\left(\frac2x+\frac{x}{x^2+1}+\frac5{x^2+1}\right)dx=\boxed{2\ln|x|+\tfrac12\ln(x^2+1)+5\arctan x+C}$$ (la del mig amb $u=x^2+1$, $du=2x\,dx$).` },
            { t: ['l7'], q: R`(b) Calculeu $\displaystyle\int\sin^3x\cos^4x\,dx$.`,
              sol: R`Potència <b>senar</b> de $\sin$: en separem un i la resta la passem a cosinus: $\sin^3x=(1-\cos^2x)\sin x$. Canvi $u=\cos x$, $du=-\sin x\,dx$: $$\int(1-u^2)u^4(-du)=\int(u^6-u^4)\,du=\frac{u^7}7-\frac{u^5}5+C=\boxed{\frac{\cos^7x}{7}-\frac{\cos^5x}{5}+C}$$` },
            { t: ['l9'], q: R`(c) Trobeu $k$ perquè l'àrea sota $f(x)=\dfrac{2kx}{1+x^2}$ entre $x=0$ i $x=1$ sigui igual a la de $g(x)=2xe^{-x^2}$.`,
              sol: R`$A_f=k\displaystyle\int_0^1\frac{2x}{1+x^2}dx=k\big[\ln(1+x^2)\big]_0^1=k\ln2$.<br>$A_g=\displaystyle\int_0^12xe^{-x^2}dx=\big[-e^{-x^2}\big]_0^1=1-\tfrac1e$ (canvi $u=-x^2$).<br>$k\ln2=1-\tfrac1e\Rightarrow\boxed{k=\dfrac{e-1}{e\ln2}}\approx0{,}912$.` }
          ]
        },
        {
          title: 'Problema 2 (3 punts)',
          parts: [
            { t: ['l10'], q: R`(a) (i) Proveu que el canvi $\dfrac1v=y-2$ transforma l'EDO $y'=(y-1)(y-2)$ en $v'=-v-1$. (ii) Resoleu $y'=(y-1)(y+1)$, $y(0)=2$.`,
              sol: R`(i) $y=2+v^{-1}\Rightarrow y'=-\dfrac{v'}{v^2}$. Substituint: $-\dfrac{v'}{v^2}=\left(1+\dfrac1v\right)\dfrac1v=\dfrac{v+1}{v^2}\Rightarrow v'=-v-1$. ∎<br>(ii) <b>Separables:</b> $\displaystyle\int\frac{dy}{y^2-1}=\int dx$. Fraccions simples: $\frac1{y^2-1}=\frac12\left(\frac1{y-1}-\frac1{y+1}\right)$, i $\tfrac12\ln\left|\tfrac{y-1}{y+1}\right|=x+C\Rightarrow\dfrac{y-1}{y+1}=Ke^{2x}$. Amb $y(0)=2$: $K=\tfrac13$. Aïllant: $3(y-1)=e^{2x}(y+1)\Rightarrow\boxed{y(x)=\dfrac{3+e^{2x}}{3-e^{2x}}}$ (definida mentre $e^{2x}<3$).` },
            { t: ['l10', 'l11'], q: R`(b) Propagació d'un virus amb $K=100$ i $I(0)=10$. Model logístic: $I_L'=I_L\left(1-\tfrac{I_L}{100}\right)$. Model de saturació lineal: $I_S'=100-I_S$. (i) Resoleu les dues EDOs. (ii) Calculeu $\displaystyle\lim_{t\to\infty}\frac{I_L(t)}{I_S(t)}$.`,
              sol: R`(i) <b>Logística</b> ($r=1$, $K=100$): $I_L(t)=\dfrac{100}{1+Ae^{-t}}$; amb $I_L(0)=10$, $1+A=10$ i $A=9$: $\boxed{I_L=\dfrac{100}{1+9e^{-t}}}$.<br><b>Lineal</b>: $I_S'+I_S=100$, amb <b>factor integrant</b> $e^t$: $(I_Se^t)'=100e^t\Rightarrow I_S=100+Ce^{-t}$; amb $I_S(0)=10$, $C=-90$: $\boxed{I_S=100-90e^{-t}}$.<br>(ii) Tots dos tendeixen a 100 (la capacitat màxima): el límit és $\dfrac{100}{100}=\boxed1$.` }
          ]
        }
      ]
    },
    {
      id: '2025',
      title: '2n Parcial — gener 2025',
      tag: 'AMB TEST',
      hot: true,
      pdf: ['p2-gener-2025-enunciat-parcial.pdf', 'p2-gener-2025-solucions-oficials.pdf', 'p2-gener-2025-solucions-alumne.pdf'],
      format: 'Exercici 1: test de 5 preguntes (3 punts). Exercici 2: tres EDOs (4 punts). Exercici 3: primitiva racional i volum (3 punts). Enunciats de les preguntes 1–3 recollits de les solucions d\'un alumne (el full original no es conserva).',
      test: [
        {
          t: 'l8', q: R`La primitiva de la funció racional $\dfrac{1}{x^3-10x^2+16x-7}$ (observeu que $1$ és arrel del denominador):`,
          options: ['no es pot expressar en termes de funcions elementals', 'conté algun terme trigonomètric', R`val $\pi/2$`, 'no conté cap terme trigonomètric', 'és una funció polinòmica'],
          correct: 3,
          exp: R`Ruffini amb $x=1$: $x^3-10x^2+16x-7=(x-1)(x^2-9x+7)$. El discriminant de $x^2-9x+7$ és $81-28=53>0$: <b>dues arrels reals</b> $\frac{9\pm\sqrt{53}}2$. Totes les fraccions simples són de la forma $\frac{A}{x-a}$ i donen <b>logaritmes</b>: cap $\arctan$. (Només surt $\arctan$ quan hi ha un factor de grau 2 <b>sense</b> arrels reals.)`
        },
        {
          t: 'l12', q: R`L'equació diferencial $\begin{cases}\log(2)\,y''+\sqrt\pi\,y'+2y=0\\ y(0)=7,\ y'(0)=10\end{cases}$`,
          options: ['és una EDO lineal no homogènia', 'té una única solució', 'no té solució perquè té coeficients no enters', 'té una família de solucions que depèn de dos paràmetres reals', 'té una família de solucions que depèn d\'un paràmetre real'],
          correct: 1,
          exp: R`És lineal, <b>homogènia</b> (a la dreta hi ha 0) i de coeficients constants (que siguin $\log 2$ o $\sqrt\pi$ no importa: són números). La solució general té 2 constants, però les <b>dues condicions inicials</b> les fixen: <b>una única solució</b>. (Teorema d'existència i unicitat.)`
        }
      ],
      problems: [
        {
          title: 'Exercici 1 — preguntes de test 1–3',
          parts: [
            { t: ['l10'], q: R`<b>1.</b> Sigui $P(t)$ la població d'una espècie amb $\dfrac{dP}{dt}=50P\left(1-\dfrac{P}{10000}\right)$, $P(0)=10$. (Resposta correcta segons les solucions: «té una única solució amb $P(t)\le10000$».)`,
              sol: R`És l'EDO <b>logística</b> amb $r=50$ i capacitat $K=10000$. Separant variables i amb fraccions simples, $\ln\left|\frac{P}{10000-P}\right|=50t+C$. Amb $P(0)=10$: $\frac{P}{10000-P}=\frac{e^{50t}}{999}$, i aïllant: $$P(t)=\frac{10000}{1+999e^{-50t}}.$$ Creix de 10 cap a 10000 sense passar-lo mai, i $\lim_{t\to\infty}P=10000$. Hi ha una única solució (condició inicial) i compleix $P\le10000$.` },
            { t: ['l9'], q: R`<b>2.</b> Sigui $F(x)=\displaystyle\int_0^{x^3}y^2e^{y^5}\,dy$. Calculeu $F'(x)$.`,
              sol: R`<b>TFC + regla de la cadena</b>: si $F(x)=\int_a^{g(x)}f(y)\,dy$, llavors $F'(x)=f(g(x))\,g'(x)$. Aquí $g=x^3$, $g'=3x^2$: $$F'(x)=(x^3)^2e^{(x^3)^5}\cdot3x^2=\boxed{3x^8e^{x^{15}}}$$` },
            { t: ['l9'], q: R`<b>3.</b> L'àrea entre les corbes $y=-|x|$ i $y=1-2x^2$.`,
              sol: R`<b>Punts de tall</b> ($x\ge0$): $1-2x^2=-x\iff2x^2-x-1=0\iff x=1$ (l'altra arrel, $-\frac12$, no és $\ge0$). Per simetria, també $x=-1$. A sobre hi ha la paràbola. $$A=\int_{-1}^{1}\big[(1-2x^2)-(-|x|)\big]dx=2\int_0^1(1-2x^2+x)\,dx=2\left(1-\tfrac23+\tfrac12\right)=\boxed{\tfrac53}.$$ A l'examen era de triar quina integral la dona: compte amb el signe de $-|x|$ i amb $|x|=-x$ quan $x<0$.<div class='plot' data-f='1-2*x^2' data-xr='-1.6,1.6' data-yr='-1.8,1.4' data-lines='-abs(x)' data-pts='1,-1;-1,-1'></div>` }
          ]
        },
        {
          title: 'Exercici 2 (4 punts)',
          parts: [
            { t: ['l10'], q: R`(a) (1 punt) Trobeu la solució general de l'EDO $(\sin x)(\sin y)+(\cos y)\,y'=0$.`,
              sol: R`<b>Separables:</b> $\cos y\,\dfrac{dy}{dx}=-\sin x\sin y\Rightarrow\dfrac{\cos y}{\sin y}dy=-\sin x\,dx$. Integrant: $\ln|\sin y|=\cos x+C$. Per tant <b>$\sin y=Ce^{\cos x}$</b> ($C\in\mathbb R$; amb $C=0$ surten les solucions constants $y=k\pi$), i on es pugui aïllar, $y=\arcsin(Ce^{\cos x})$.` },
            { t: ['l11'], q: R`(b) (1 punt) Trobeu la solució de $y'+\dfrac{y}{x+100}=1$, $y(0)=10$.`,
              sol: R`EDO <b>lineal de 1r ordre</b>. <b>Factor integrant</b> $\mu=e^{\int\frac{dx}{x+100}}=x+100$: $\big((x+100)y\big)'=x+100\Rightarrow(x+100)y=\frac{x^2}2+100x+C$. Amb $y(0)=10$: $1000=C$. $$\boxed{y=\frac{x^2+200x+2000}{2(x+100)}}$$` },
            { t: ['l12'], q: R`(c) (2 punts) Trobeu la solució general de $y''-7y'+12y=4e^{2x}$.`,
              sol: R`<b>Homogènia:</b> $r^2-7r+12=0\Rightarrow r=3,4$; $y_h=Ae^{3x}+Be^{4x}$.<br><b>Particular:</b> $e^{2x}$ no és a $y_h$, així que provem $y_p=Ce^{2x}$: $4C-14C+12C=2C=4\Rightarrow C=2$.<br>$$\boxed{y=Ae^{3x}+Be^{4x}+2e^{2x}}$$` }
          ]
        },
        {
          title: 'Exercici 3 (3 punts)',
          parts: [
            { t: ['l8'], q: R`(a) (1,5 punts) Trobeu una primitiva de $f(x)=\dfrac{x^2}{(x-1)(x+1)^2}$.`,
              sol: R`<b>Fraccions simples</b> (arrel doble a $-1$): $\dfrac{x^2}{(x-1)(x+1)^2}=\dfrac A{x-1}+\dfrac B{x+1}+\dfrac C{(x+1)^2}$, és a dir $x^2=A(x+1)^2+B(x-1)(x+1)+C(x-1)$.<br>$x=1$: $1=4A\Rightarrow A=\frac14$. $x=-1$: $1=-2C\Rightarrow C=-\frac12$. $x=0$: $0=A-B-C\Rightarrow B=\frac34$. $$\int f=\boxed{\tfrac14\ln|x-1|+\tfrac34\ln|x+1|+\frac{1}{2(x+1)}+C}$$` },
            { t: ['l9', 'l7'], q: R`(b) (1,5 punts) La regió limitada per $y=xe^x$, $y=0$ i $x=1$ gira al voltant de l'eix $OX$. Trobeu el volum (recordeu: $V=\pi\int_a^bf(x)^2dx$).`,
              sol: R`La corba talla $y=0$ a $x=0$, així que $x\in[0,1]$. $V=\pi\displaystyle\int_0^1x^2e^{2x}dx$. <b>Per parts</b> dues vegades: $\int x^2e^{2x}dx=\frac12x^2e^{2x}-\frac12xe^{2x}+\frac14e^{2x}$. $$V=\pi\left[\tfrac12x^2e^{2x}-\tfrac12xe^{2x}+\tfrac14e^{2x}\right]_0^1=\pi\left(\tfrac{e^2}4-\tfrac14\right)=\boxed{\frac{\pi}{4}(e^2-1)}\approx5{,}02$$` }
          ]
        }
      ]
    },
    {
      id: 'R2024',
      title: 'Recuperació — juny 2024',
      tag: 'TOT EL TEMARI',
      pdf: ['recu-juny-2024.pdf'],
      format: '4 exercicis de 10 punts. La recuperació substitueix els dos parcials, i per això barreja el temari del 1r parcial (límits, equacions, estudi de funcions) amb integrals i EDOs.',
      problems: [
        {
          title: 'Exercici 1 (2,5 punts cada apartat)',
          parts: [
            { t: ['l4'], q: R`(a) Calculeu (i) $\displaystyle\lim_{x\to0}\left(\frac{2\cos x}{\sin2x}-\frac1x\right)$; (ii) $\displaystyle\lim_{x\to\infty}\left(\frac{x^3}{x^2-x+1}-\frac{x^3}{x^2+x-1}\right)$.`,
              sol: R`(i) $\sin2x=2\sin x\cos x$, així que $\frac{2\cos x}{\sin2x}=\frac1{\sin x}$. Queda $\infty-\infty$: $\dfrac1{\sin x}-\dfrac1x=\dfrac{x-\sin x}{x\sin x}$. Com $x-\sin x\sim\frac{x^3}6$ i $x\sin x\sim x^2$, tendeix a $\frac x6\to\boxed0$ (o L'Hôpital dues vegades).<br>(ii) Denominador comú: $\dfrac{x^3\big[(x^2+x-1)-(x^2-x+1)\big]}{(x^2-x+1)(x^2+x-1)}=\dfrac{x^3(2x-2)}{x^4-x^2+2x-1}\to\boxed2$ (mateix grau: quocient de coeficients principals).` },
            { t: ['l0'], q: R`(b) Resoleu (i) $\dfrac{10}{e^x-e^{-x}}=4(e^x+e^{-x})$; (ii) $\ln(2x^2+3x-18)-2\ln x=0$.`,
              sol: R`(i) Multiplicant: $10=4(e^x-e^{-x})(e^x+e^{-x})=4(e^{2x}-e^{-2x})$. Amb $t=e^{2x}>0$: $10=4\left(t-\frac1t\right)\Rightarrow2t^2-5t-2=0\Rightarrow t=\frac{5\pm\sqrt{41}}4$. Només serveix la positiva: $\boxed{x=\tfrac12\ln\frac{5+\sqrt{41}}{4}}\approx0{,}524$.<br>(ii) Domini: $x>0$ i $2x^2+3x-18>0$. Com $2\ln x=\ln x^2$: $2x^2+3x-18=x^2\Rightarrow x^2+3x-18=0\Rightarrow x=3$ o $x=-6$. Fora del domini $-6$: <b>$x=3$</b> (comprova: $\ln9-2\ln3=0$ ✓).` }
          ]
        },
        {
          title: 'Exercici 2 (6 + 3 punts)',
          parts: [
            { t: ['l3', 'l4'], q: R`(a) Estudieu $f(x)=3x^5-5x^3-15x$: creixement, concavitat, punts crítics i el seu tipus, inflexions, asímptotes i esbós.`,
              sol: R`$f'(x)=15(x^4-x^2-1)$. Amb $u=x^2$: $u=\frac{1+\sqrt5}2=\varphi\approx1{,}618$ (l'altra és negativa). Crítics: $x=\pm\sqrt\varphi\approx\pm1{,}272$.<br>Creix a $(-\infty,-\sqrt\varphi)$ i $(\sqrt\varphi,\infty)$; decreix entre. <b>Màxim</b> a $x=-\sqrt\varphi$ ($f\approx19{,}4$), <b>mínim</b> a $x=\sqrt\varphi$ ($f\approx-19{,}4$). La funció és senar.<br>$f''=60x^3-30x=30x(2x^2-1)$: zeros $0,\pm\frac1{\sqrt2}$. Còncava a $(-\infty,-\frac1{\sqrt2})$ i $(0,\frac1{\sqrt2})$; convexa a $(-\frac1{\sqrt2},0)$ i $(\frac1{\sqrt2},\infty)$. <b>Tres inflexions</b>. Polinomi: <b>sense asímptotes</b>.<div class='plot' data-f='3*x^5-5*x^3-15*x' data-xr='-2,2' data-yr='-30,30' data-pts='-1.272,19.38;1.272,-19.38;0,0'></div>` },
            { t: ['l2'], q: R`(b) Enuncieu el teorema del valor mitjà i calculeu $\displaystyle\lim_{x\to0}\frac{(2+x)^{1/5}-2^{1/5}}{x}$.`,
              sol: R`<b>TVM:</b> si $f$ és contínua a $[a,b]$ i derivable a $(a,b)$, existeix $c\in(a,b)$ amb $f'(c)=\frac{f(b)-f(a)}{b-a}$.<br>Amb $f(t)=t^{1/5}$ entre $2$ i $2+x$: el quocient val $f'(c)=\frac15c^{-4/5}$ per a algun $c$ entre $2$ i $2+x$. Quan $x\to0$, $c\to2$: $$\boxed{\tfrac15\,2^{-4/5}}\approx0{,}115$$ (és la definició de la derivada de $t^{1/5}$ a $t=2$).` }
          ]
        },
        {
          title: 'Exercici 3 (5 + 5 punts)',
          parts: [
            { t: ['l7', 'l9'], q: R`(i) $\displaystyle\int_0^1x^2(1-x^2)^{3/2}\,dx$`,
              sol: R`<b>Canvi trigonomètric</b> $x=\sin\theta$, $dx=\cos\theta\,d\theta$, $\sqrt{1-x^2}=\cos\theta$; límits $0\to0$, $1\to\frac\pi2$: $$\int_0^{\pi/2}\sin^2\theta\cos^4\theta\,d\theta.$$ Amb $\sin\theta\cos\theta=\frac12\sin2\theta$: $=\int_0^{\pi/2}\tfrac14\sin^22\theta\,\cos^2\theta\,d\theta$, i baixant potències ($\cos^2=\frac{1+\cos2\theta}2$, $\sin^2=\frac{1-\cos 2\theta}{2}$…) surt $\boxed{\dfrac{\pi}{32}}\approx0{,}098$.` },
            { t: ['l8'], q: R`(ii) $\displaystyle\int\frac{x+1}{(x-1)(x^2+1)}\,dx$`,
              sol: R`$\dfrac{x+1}{(x-1)(x^2+1)}=\dfrac A{x-1}+\dfrac{Bx+C}{x^2+1}$: $x+1=A(x^2+1)+(Bx+C)(x-1)$. $x=1$: $A=1$. Coef. $x^2$: $0=A+B\Rightarrow B=-1$. Constant: $1=A-C\Rightarrow C=0$. $$\boxed{\ln|x-1|-\tfrac12\ln(x^2+1)+C}$$` }
          ]
        },
        {
          title: 'Exercici 4 (5 + 5 punts)',
          parts: [
            { t: ['l10'], q: R`Una partícula surt de $x(0)=100$ cap a $x=0$ amb velocitat inicial $x'(0)=-10$, i la seva velocitat és proporcional a la posició. (a) Doneu l'EDO (homogènia) i resoleu-la.`,
              sol: R`$x'(t)=k\,x(t)$. Amb $x'(0)=-10$ i $x(0)=100$: $k=-\frac{10}{100}=-\frac1{10}$. EDO: $x'=-\frac{x}{10}$, separables: $\boxed{x(t)=100e^{-t/10}}$. S'acosta a 0 sense arribar-hi mai.` },
            { t: ['l11'], q: R`(b) Resoleu $y'+y=x^3$.`,
              sol: R`<b>Factor integrant</b> $e^x$: $(ye^x)'=x^3e^x$. Per parts tres vegades (o amb la taula): $\int x^3e^x=e^x(x^3-3x^2+6x-6)$. $$\boxed{y=x^3-3x^2+6x-6+Ce^{-x}}$$` }
          ]
        }
      ]
    },
    {
      id: '2024',
      title: '2n Parcial — juny 2024',
      tag: 'SENSE TEST',
      pdf: ['p2-juny-2024.pdf'],
      format: '3 exercicis de 10 punts (3+3+4). Sense test.',
      problems: [
        {
          title: 'Exercici 1',
          parts: [
            { t: ['l9'], q: R`(a) Sigui $H(x)=\displaystyle\int_0^{x^3}e^{2t^2}dt$. Calculeu $H'(1)$.`,
              sol: R`<b>TFC + cadena</b>: $H'(x)=e^{2(x^3)^2}\cdot3x^2=3x^2e^{2x^6}$. $\boxed{H'(1)=3e^2}$. (No cal calcular la integral, que no té primitiva elemental.)` },
            { t: ['l9', 'l7'], q: R`(b) Calculeu l'àrea limitada per $f(x)=(\sin x\cos x)^3$, l'eix horitzontal i les rectes $x=0$, $x=\pi/2$.`,
              sol: R`A $[0,\frac\pi2]$, $f\ge0$. Com $\sin x\cos x=\frac12\sin2x$: $f=\frac18\sin^32x$. Amb $u=2x$: $$A=\frac1{16}\int_0^{\pi}\sin^3u\,du=\frac1{16}\left[-\cos u+\frac{\cos^3u}3\right]_0^\pi=\frac1{16}\cdot\frac43=\boxed{\frac1{12}}$$ ($\sin^3u=(1-\cos^2u)\sin u$, canvi $v=\cos u$).` },
            { t: ['l8'], q: R`(c) Calculeu $\displaystyle\int\frac{x}{(x-3)(x^2+4)}dx$.`,
              sol: R`$x=A(x^2+4)+(Bx+C)(x-3)$. $x=3$: $3=13A\Rightarrow A=\frac3{13}$. Coef. $x^2$: $B=-\frac3{13}$. Constant: $0=4A-3C\Rightarrow C=\frac4{13}$. $$\int=\frac3{13}\ln|x-3|-\frac3{26}\ln(x^2+4)+\frac2{13}\arctan\frac x2+C$$ (l'últim: $\int\frac{dx}{x^2+4}=\frac12\arctan\frac x2$).` }
          ]
        },
        {
          title: 'Exercici 2',
          parts: [
            { t: ['l7', 'l9'], q: R`(a) Calculeu $\displaystyle\int_1^e\frac{\sqrt{1+\ln x}}{x}dx$.`,
              sol: R`Canvi $u=1+\ln x$, $du=\frac{dx}x$; límits $1\to1$, $e\to2$: $$\int_1^2\sqrt u\,du=\frac23\left[u^{3/2}\right]_1^2=\boxed{\frac{2}{3}(2\sqrt2-1)}\approx1{,}219$$` },
            { t: ['l9'], q: R`(b) Calculeu el volum del cos obtingut en girar la gràfica de $f(x)=\sin3x$ al voltant de l'eix <b>vertical</b>, entre $x=0$ i $x=\pi/3$.`,
              sol: R`Girant al voltant de l'eix $Y$ es fa servir el <b>mètode de capes</b> (cilindres de radi $x$ i alçada $f(x)$): $V=2\pi\int_a^bx\,f(x)\,dx$. $$V=2\pi\int_0^{\pi/3}x\sin3x\,dx.$$ Per parts: $\int x\sin3x\,dx=-\frac{x\cos3x}3+\frac{\sin3x}9$. Entre $0$ i $\frac\pi3$: $\frac\pi9$. $$\boxed{V=\frac{2\pi^2}{9}}\approx2{,}19$$` },
            { t: ['l10'], q: R`(c) La velocitat de creixement d'un organisme és proporcional a la diferència entre la mida màxima (10 mm) i la mida a temps $t$. Si $L(1)=5$ i $L(2)=7$, quina serà la mida a temps 3?`,
              sol: R`$L'=k(10-L)$. Separables: $10-L=Ce^{-kt}$. Amb les dades: $Ce^{-k}=5$ i $Ce^{-2k}=3$; dividint, $e^{-k}=\frac35$. Llavors $10-L(3)=Ce^{-3k}=3\cdot\frac35=\frac95$, i $$\boxed{L(3)=10-1{,}8=8{,}2\text{ mm}}$$ (cada unitat de temps, la distància al màxim es multiplica per $\frac35$: $5\to3\to1{,}8$).` }
          ]
        },
        {
          title: 'Exercici 3',
          parts: [
            { t: ['l11'], q: R`(a) Trobeu la solució de $y'+\dfrac yx=e^{-2x^2}$ que compleix $y(1)=2$.`,
              sol: R`<b>Lineal de 1r ordre</b>; factor integrant $\mu=e^{\int dx/x}=x$: $(xy)'=xe^{-2x^2}\Rightarrow xy=-\frac14e^{-2x^2}+C$. Amb $y(1)=2$: $C=2+\frac{e^{-2}}4$. $$\boxed{y=\frac{1}{x}\left(2+\frac{e^{-2}-e^{-2x^2}}{4}\right)}$$` },
            { t: ['l12'], q: R`(b) Trobeu totes les solucions de $y''-4y'+13y=0$.`,
              sol: R`$r^2-4r+13=0\Rightarrow r=2\pm3i$ (arrels <b>complexes</b> $\alpha\pm\beta i$ donen $e^{\alpha x}(\cos\beta x,\ \sin\beta x)$): $$\boxed{y=e^{2x}(A\cos3x+B\sin3x)}$$` },
            { t: ['l12'], q: R`(c) Trobeu totes les solucions de $y''-4y'+13y=4e^x$.`,
              sol: R`$y_p=Ke^x$: $K-4K+13K=10K=4\Rightarrow K=\frac25$. $$\boxed{y=e^{2x}(A\cos3x+B\sin3x)+\tfrac25e^x}$$` }
          ]
        }
      ]
    },
    {
      id: '2023',
      title: '2n Parcial — juny 2023',
      tag: 'SENSE TEST',
      pdf: ['wuolah-free-Parcial2-Calculo-2223.pdf'],
      format: '2 exercicis de 10 punts (3+3+4).',
      problems: [
        {
          title: 'Exercici 1',
          parts: [
            { t: ['l9'], q: R`(a) Calculeu la derivada de $F(x)=\displaystyle\int_{-x}^{x^4}\frac{\sin t}{t}dt$.`,
              sol: R`Amb els <b>dos límits variables</b>: $F'(x)=f(b(x))\,b'(x)-f(a(x))\,a'(x)$, amb $b=x^4$, $a=-x$, $f(t)=\frac{\sin t}t$: $$F'(x)=\frac{\sin x^4}{x^4}\cdot4x^3-\frac{\sin(-x)}{-x}\cdot(-1)=\boxed{\frac{4\sin x^4}{x}+\frac{\sin x}{x}}$$` },
            { t: ['l8'], q: R`(b) Calculeu $\displaystyle\int\frac{1}{(x-1)(x^2+2x+2)}dx$.`,
              sol: R`$1=A(x^2+2x+2)+(Bx+C)(x-1)$. $x=1$: $A=\frac15$. Coef. $x^2$: $B=-\frac15$. Constant: $1=2A-C\Rightarrow C=-\frac35$. Llavors $\frac15\left[\frac1{x-1}-\frac{x+3}{x^2+2x+2}\right]$, i com $x+3=(x+1)+2$ i $x^2+2x+2=(x+1)^2+1$: $$\boxed{\tfrac15\ln|x-1|-\tfrac1{10}\ln(x^2+2x+2)-\tfrac25\arctan(x+1)+C}$$` },
            { t: ['l9', 'l7'], q: R`(c) Calculeu l'àrea limitada per $y=e^{-x}$ i $y=e^{-x}(x^2-3x+3)$.`,
              sol: R`<b>Tall:</b> $x^2-3x+3=1\iff x=1,2$. Entre 1 i 2, $x^2-3x+3<1$: a sobre hi ha $e^{-x}$. $$A=\int_1^2e^{-x}(-x^2+3x-2)\,dx.$$ Per parts (o amb la regla $\int e^{-x}p=-e^{-x}(p+p'+p'')$): primitiva $e^{-x}(x^2-x+1)$. $$A=3e^{-2}-e^{-1}=\boxed{\frac{3-e}{e^2}}\approx0{,}038$$<div class='plot' data-f='exp(-x)' data-xr='0.5,2.5' data-yr='0,0.7' data-lines='exp(-x)*(x^2-3*x+3)' data-pts='1,0.3679;2,0.1353'></div>` }
          ]
        },
        {
          title: 'Exercici 2',
          parts: [
            { t: ['l10'], q: R`(a) La velocitat de creixement d'una població és proporcional a la seva mida. Si triga 2 hores a duplicar-se, quant trigarà a triplicar-se?`,
              sol: R`$P'=kP\Rightarrow P=P_0e^{kt}$. Duplicar en 2 h: $e^{2k}=2\Rightarrow k=\frac{\ln2}2$. Triplicar: $e^{kt}=3\Rightarrow t=\frac{\ln3}k=\boxed{\frac{2\ln3}{\ln2}\approx3{,}17\text{ h}}$.` },
            { t: ['l11', 'l10'], q: R`(b) Trobeu totes les solucions de $y'-\cos(2x)\,y=\cos(2x)$.`,
              sol: R`Es pot veure com a <b>separable</b>: $y'=\cos(2x)(y+1)\Rightarrow\frac{dy}{y+1}=\cos2x\,dx\Rightarrow\ln|y+1|=\frac{\sin2x}2+C$. $$\boxed{y=Ce^{\sin(2x)/2}-1}$$ (també surt amb el factor integrant $e^{-\sin(2x)/2}$).` },
            { t: ['l12'], q: R`(c) Trobeu la solució de $y''-4y'+13y=e^{-x}$ amb $y(0)=1$, $y'(0)=0$ (busqueu una particular $y=Ae^{-x}$).`,
              sol: R`$y_h=e^{2x}(C_1\cos3x+C_2\sin3x)$ ($r=2\pm3i$). $y_p=Ae^{-x}$: $A(1+4+13)=1\Rightarrow A=\frac1{18}$.<br>$y(0)=C_1+\frac1{18}=1\Rightarrow C_1=\frac{17}{18}$. $y'(0)=2C_1+3C_2-\frac1{18}=0\Rightarrow C_2=-\frac{11}{18}$. $$\boxed{y=e^{2x}\left(\tfrac{17}{18}\cos3x-\tfrac{11}{18}\sin3x\right)+\tfrac1{18}e^{-x}}$$` }
          ]
        }
      ]
    }
  ];
})();

/* Freqüència de cada tema als exàmens del 2n parcial (columnes = exàmens). */
const P2_COLS = [['sol', 'Solucionari'], ['2025', 'Gen 2025'], ['R2024', 'Recu 2024'], ['2024', 'Jun 2024'], ['2023', 'Jun 2023']];
const P2_TOPICS = [
  { topic: 'Primitives de funcions racionals (fraccions simples)', lists: ['l8'], seen: ['sol', '2025', 'R2024', '2024', '2023'], tier: 'S', why: 'Ha sortit a tots els exàmens, sovint dues vegades. Sap-te els tres casos: arrels simples (logaritmes), arrel doble (terme $\\frac{C}{(x-a)^2}$) i factor de grau 2 sense arrels (arctangent).' },
  { topic: 'EDO lineal de 1r ordre (factor integrant)', lists: ['l11'], seen: ['sol', '2025', 'R2024', '2024', '2023'], tier: 'S', why: 'Cada any: $y\'+p(x)y=q(x)$, multiplica per $e^{\\int p}$ i integra. Sovint amb condició inicial.' },
  { topic: 'EDOs separables i models (creixement, logística, mida màxima)', lists: ['l10'], seen: ['sol', '2025', 'R2024', '2024', '2023'], tier: 'S', why: 'Problemes de «la velocitat és proporcional a…»: escriu l\'EDO, separa variables i usa les dades per trobar les constants.' },
  { topic: 'EDO de 2n ordre amb coeficients constants', lists: ['l12'], seen: ['sol', '2025', '2024', '2023'], tier: 'S', why: 'Polinomi característic (arrels reals, doble o complexes) + solució particular per coeficients indeterminats. Compte amb la ressonància.' },
  { topic: 'Derivada d\'una integral amb límits variables (TFC)', lists: ['l9'], seen: ['sol', '2025', '2024', '2023'], tier: 'S', why: 'Punts fàcils: $\\frac{d}{dx}\\int_a^{g(x)}f=f(g(x))g\'(x)$. Mai cal calcular la integral.' },
  { topic: 'Àrees entre corbes', lists: ['l9'], seen: ['sol', '2025', '2024', '2023'], tier: 'S', why: 'Punts de tall, qui està a sobre, i integrar la diferència. Aprofita les simetries.' },
  { topic: 'Integració per parts i per canvi de variable', lists: ['l7'], seen: ['sol', '2025', 'R2024', '2024', '2023'], tier: 'A', why: 'Rarament surt sol, però el necessites dins d\'àrees, volums i EDOs ($x^2e^{2x}$, $te^t$, $\\frac{\\sqrt{1+\\ln x}}{x}$…).' },
  { topic: 'Primitives trigonomètriques (potències de sin i cos)', lists: ['l7'], seen: ['sol', 'R2024', '2024'], tier: 'A', why: 'Potència senar: separa un factor i canvi $u=\\cos x$ o $u=\\sin x$. Parell: baixa potències amb l\'angle doble.' },
  { topic: 'Volums de revolució', lists: ['l9'], seen: ['2025', '2024'], tier: 'B', why: 'Eix $OX$: discos, $\\pi\\int f^2$. Eix vertical: capes, $2\\pi\\int x f(x)$.' },
  { topic: 'Sumes de Riemann, trapezis, Simpson, longitud d\'arc, superfície de revolució', lists: ['l9'], seen: [], tier: 'C', why: 'Són a la guia docent però no han sortit en cap d\'aquests exàmens. Llegeix-los un cop (pot caure una pregunta de test).' }
];
