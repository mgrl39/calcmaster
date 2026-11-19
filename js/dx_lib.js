/* =====================================================================
   dx_lib.js — motor de «Càlcul dx» (derivar ⇄ integrar) portat dins de
   CalcMaster. Inclou les dades (data.js: tècniques, problemes, graf) i
   els generadors infinits de derivades (dtrack.js). Tot queda dins
   d'aquesta funció i s'exposa com a window.DXLIB.
   Els generadors avaluen numèricament amb el M de CalcMaster (no cal
   math.js): «math.compile» és un petit adaptador.
   ===================================================================== */
(function () {
  const CM = (typeof window !== 'undefined' ? window : globalThis).M;
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const math = { compile(code) { const f = CM.compile(code, ['x']); return { evaluate: s => f(s.x) }; } };
/* ---------- data.js ---------- */
/* =========================================================
   DADES · Càlcul dx (derivades i integrals, nivell universitari)
   Cada unitat té tècniques (skills). Cada tècnica:
     id, n = nom, r = regla (TeX), i = quan s'usa, p = problemes
   Cada problema:
     t   = 'd' derivada · 'i' primitiva · 'v' valor numèric · 'c' conceptual (només opcions)
     q   = enunciat (TeX en mode display; per a 'c', text amb $…$)
     ask = text de la pregunta (opcional)
     pre = prefix de la resposta escrita (TeX, opcional)
     a   = resposta (TeX)          e = resposta per corregir (sintaxi math.js)
     w   = 3 respostes errònies (TeX; per a 'c', text)
     s   = passos de la resolució (text amb $…$)
     f   = funció a derivar / integrand (math.js) · dom = interval de prova
     v   = variables (per defecte ['x']) · wrt = variable de derivació
     imp = F(x,y)=0 implícita · par = [x(t), y(t)] · tay = ordre de Taylor
     int = [f, a, b] integral definida · lim = [f, punt] límit (per verificar)
   ========================================================= */
const T = String.raw;

const D_UNITS = [
  {
    id: 'd1', icon: '📐', name: 'Fonaments',
    desc: 'La definició de derivada i les derivades de les funcions elementals.',
    pista: T`La derivada és un límit: $f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h}$. Totes les regles surten d'aquí. Abans de derivar, simplifica amb propietats (logaritmes, potències).`,
    items: [
      {
        id: 'lim', n: 'Definició per límit',
        r: T`f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}`,
        i: T`Quan et demanen derivar «per definició» o estudiar la derivabilitat en un punt (valors absoluts, funcions a trossos). Sovint cal racionalitzar o simplificar $h$.`,
        p: [
          { t: 'v', q: T`\lim_{h\to0}\frac{(3+h)^2-9}{h}`, e: '6', a: T`6`, w: [T`0`, T`9`, T`3`],
            s: [T`És la definició de $f'(3)$ per a $f(x)=x^2$.`, T`$(3+h)^2-9=6h+h^2$`, T`$\dfrac{6h+h^2}{h}=6+h\;\xrightarrow{h\to0}\;6$`], lim: ['((3+x)^2-9)/x', 0] },
          { t: 'v', q: T`\lim_{h\to0}\frac{\sqrt{4+h}-2}{h}`, e: '1/4', a: T`\tfrac14`, w: [T`\tfrac12`, T`0`, T`\infty`],
            s: [T`És $f'(4)$ per a $f(x)=\sqrt x$. Multiplica pel conjugat:`, T`$\dfrac{(\sqrt{4+h}-2)(\sqrt{4+h}+2)}{h(\sqrt{4+h}+2)}=\dfrac{h}{h(\sqrt{4+h}+2)}$`, T`$=\dfrac{1}{\sqrt{4+h}+2}\to\dfrac{1}{4}$`], lim: ['(sqrt(4+x)-2)/x', 0] },
          { t: 'c', q: T`La funció $f(x)=|x|$ en $x=0$…`, a: T`és contínua però no derivable: les derivades laterals valen $-1$ i $1$.`,
            w: [T`és derivable i $f'(0)=0$.`, T`no és contínua, i per això no és derivable.`, T`és derivable i $f'(0)=1$.`],
            s: [T`$f'(0^+)=\lim_{h\to0^+}\frac{|h|}{h}=1$ i $f'(0^-)=\lim_{h\to0^-}\frac{|h|}{h}=-1$.`, T`Les laterals no coincideixen: no és derivable (hi ha un «punxó»). Sí que és contínua: $\lim_{x\to0}|x|=0=f(0)$.`] },
          { t: 'v', q: T`\lim_{h\to0}\frac{\sin(\frac{\pi}{3}+h)-\sin\frac{\pi}{3}}{h}`, e: '1/2', a: T`\tfrac12`, w: [T`\tfrac{\sqrt3}{2}`, T`0`, T`1`],
            s: [T`És la derivada de $\sin x$ en $x=\pi/3$.`, T`$(\sin x)'=\cos x$, i $\cos\frac{\pi}{3}=\frac12$.`], lim: ['(sin(pi/3+x)-sin(pi/3))/x', 0] },
        ],
      },
      {
        id: 'pot', n: 'Potències i arrels',
        r: T`(x^n)'=n\,x^{n-1}\quad(n\in\mathbb R)`,
        i: T`Reescriu arrels i denominadors com a potències: $\sqrt[3]{x^2}=x^{2/3}$, $\frac1{x^2}=x^{-2}$. Després, la regla funciona per a qualsevol exponent real.`,
        p: [
          { t: 'd', q: T`f(x)=4x^5-\frac{3}{x^2}+2\sqrt{x}`, f: '4x^5-3/x^2+2*sqrt(x)', e: '20x^4+6/x^3+1/sqrt(x)', dom: [0.3, 3],
            a: T`20x^4+\frac{6}{x^3}+\frac{1}{\sqrt x}`, w: [T`20x^4-\frac{6}{x^3}+\frac{1}{\sqrt x}`, T`20x^4+\frac{6}{x}+\frac{1}{\sqrt x}`, T`20x^4+\frac{6}{x^3}+\frac{2}{\sqrt x}`],
            s: [T`Reescriu: $f(x)=4x^5-3x^{-2}+2x^{1/2}$.`, T`Deriva cada terme: $20x^4+6x^{-3}+2\cdot\tfrac12x^{-1/2}$.`, T`$f'(x)=20x^4+\dfrac{6}{x^3}+\dfrac{1}{\sqrt x}$`] },
          { t: 'd', q: T`f(x)=\sqrt[3]{x^2}+\frac{1}{\sqrt{x}}`, f: 'x^(2/3)+x^(-1/2)', e: '2/3*x^(-1/3)-1/2*x^(-3/2)', dom: [0.3, 3],
            a: T`\frac{2}{3\sqrt[3]{x}}-\frac{1}{2\sqrt{x^3}}`, w: [T`\frac{2}{3\sqrt[3]{x}}+\frac{1}{2\sqrt{x^3}}`, T`\frac{3}{2}\sqrt{x}-\frac{1}{2\sqrt{x^3}}`, T`\frac{2}{3}\sqrt[3]{x}-\frac{1}{2\sqrt{x}}`],
            s: [T`$f(x)=x^{2/3}+x^{-1/2}$`, T`$f'(x)=\tfrac23x^{-1/3}-\tfrac12x^{-3/2}$`, T`$=\dfrac{2}{3\sqrt[3]{x}}-\dfrac{1}{2\sqrt{x^3}}$`] },
          { t: 'd', q: T`f(x)=\frac{x^3-2x+5}{x}`, f: '(x^3-2x+5)/x', e: '2x-5/x^2', dom: [0.4, 3],
            a: T`2x-\frac{5}{x^2}`, w: [T`3x^2-2`, T`2x+\frac{5}{x^2}`, T`2x-2-\frac{5}{x^2}`],
            s: [T`No cal la regla del quocient: divideix primer. $f(x)=x^2-2+5x^{-1}$.`, T`$f'(x)=2x-5x^{-2}=2x-\dfrac{5}{x^2}$`] },
        ],
      },
      {
        id: 'explog', n: 'Exponencials i logaritmes',
        r: T`(e^x)'=e^x,\quad (a^x)'=a^x\ln a,\quad (\ln x)'=\tfrac1x,\quad (\log_a x)'=\tfrac{1}{x\ln a}`,
        i: T`Fes servir les propietats dels logaritmes abans de derivar: $\ln(x^4)=4\ln x$, $\ln\frac{a}{b}=\ln a-\ln b$. Estalvia molta feina.`,
        p: [
          { t: 'd', q: T`f(x)=3^x+\log_2 x`, f: '3^x+log(x)/log(2)', e: '3^x*log(3)+1/(x*log(2))', dom: [0.3, 3],
            a: T`3^x\ln 3+\frac{1}{x\ln 2}`, w: [T`x\,3^{x-1}+\frac1x`, T`3^x+\frac{1}{x\ln 2}`, T`\frac{3^x}{\ln 3}+\frac{\ln 2}{x}`],
            s: [T`$(a^x)'=a^x\ln a$: $(3^x)'=3^x\ln 3$. Compte: no és una potència $x^n$!`, T`$\log_2x=\dfrac{\ln x}{\ln 2}$, per tant la seva derivada és $\dfrac{1}{x\ln 2}$.`] },
          { t: 'd', q: T`f(x)=5e^x-\ln(x^4)`, f: '5*e^x-log(x^4)', e: '5e^x-4/x', dom: [0.3, 3],
            a: T`5e^x-\frac{4}{x}`, w: [T`5e^x-\frac{1}{x^4}`, T`5xe^{x-1}-\frac4x`, T`5e^x-\frac{4}{x^3}`],
            s: [T`Simplifica: $\ln(x^4)=4\ln x$.`, T`$f'(x)=5e^x-\dfrac{4}{x}$`] },
          { t: 'd', q: T`f(x)=\ln\frac{x^2}{\sqrt{x+1}}`, f: 'log(x^2/sqrt(x+1))', e: '2/x-1/(2*(x+1))', dom: [0.3, 3],
            a: T`\frac{2}{x}-\frac{1}{2(x+1)}`, w: [T`\frac{\sqrt{x+1}}{x^2}`, T`\frac{2}{x}+\frac{1}{2(x+1)}`, T`\frac{2}{x}-\frac{1}{x+1}`],
            s: [T`Desplega amb propietats: $f(x)=2\ln x-\tfrac12\ln(x+1)$.`, T`$f'(x)=\dfrac{2}{x}-\dfrac{1}{2(x+1)}$`] },
        ],
      },
      {
        id: 'trig', n: 'Trigonomètriques',
        r: T`(\sin x)'=\cos x,\quad(\cos x)'=-\sin x,\quad(\tan x)'=1+\tan^2x=\sec^2x`,
        i: T`Memoritza també $(\sec x)'=\sec x\tan x$, $(\csc x)'=-\csc x\cot x$ i $(\cot x)'=-\csc^2x$. Les «co-» porten signe menys.`,
        p: [
          { t: 'd', q: T`f(x)=2\sin x-3\cos x+\tan x`, f: '2sin(x)-3cos(x)+tan(x)', e: '2cos(x)+3sin(x)+sec(x)^2', dom: [-1, 1],
            a: T`2\cos x+3\sin x+\sec^2x`, w: [T`2\cos x-3\sin x+\sec^2x`, T`-2\cos x+3\sin x+\sec^2x`, T`2\cos x+3\sin x-\frac{1}{\cos^2x}`],
            s: [T`$(\cos x)'=-\sin x$, per tant $(-3\cos x)'=+3\sin x$.`, T`$(\tan x)'=\sec^2x=\dfrac{1}{\cos^2x}$.`] },
          { t: 'd', q: T`f(x)=\sec x`, f: 'sec(x)', e: 'sec(x)*tan(x)', dom: [-1.2, 1.2],
            a: T`\sec x\tan x`, w: [T`\tan^2x`, T`-\sec x\tan x`, T`\csc x`],
            s: [T`$\sec x=(\cos x)^{-1}$`, T`$(\sec x)'=-(\cos x)^{-2}\cdot(-\sin x)=\dfrac{\sin x}{\cos^2x}=\sec x\tan x$`] },
          { t: 'd', q: T`f(x)=\cot x`, f: 'cot(x)', e: '-csc(x)^2', dom: [0.3, 1.4],
            a: T`-\csc^2x`, w: [T`\csc^2x`, T`-\sec^2x`, T`\ln|\sin x|`],
            s: [T`$\cot x=\dfrac{\cos x}{\sin x}$`, T`Quocient: $\dfrac{-\sin^2x-\cos^2x}{\sin^2x}=-\dfrac{1}{\sin^2x}=-\csc^2x$`] },
        ],
      },
    ],
  },
  {
    id: 'd2', icon: '⚙️', name: 'Regles de derivació',
    desc: 'Producte, quocient i la regla de la cadena: el 90% de qualsevol examen.',
    pista: T`Llegeix la funció «de fora cap a dins». L'última operació que faries per avaluar-la és la regla que aplica primer: si és una divisió, quocient; si és una funció d'una altra, cadena.`,
    items: [
      {
        id: 'prod', n: 'Regla del producte',
        r: T`(f\,g)'=f'g+f\,g'`,
        i: T`Quan la funció és un producte de dues (o més) funcions de $x$. Per a tres factors: $(fgh)'=f'gh+fg'h+fgh'$.`,
        p: [
          { t: 'd', q: T`f(x)=x^3\ln x`, f: 'x^3*log(x)', e: '3x^2*log(x)+x^2', dom: [0.3, 3],
            a: T`3x^2\ln x+x^2`, w: [T`3x^2\cdot\frac1x`, T`3x^2\ln x`, T`3x^2\ln x-x^2`],
            s: [T`$f=x^3$, $g=\ln x$: $f'=3x^2$, $g'=\frac1x$.`, T`$f'g+fg'=3x^2\ln x+x^3\cdot\dfrac1x=3x^2\ln x+x^2$`] },
          { t: 'd', q: T`f(x)=e^x\sin x`, f: 'e^x*sin(x)', e: 'e^x*(sin(x)+cos(x))',
            a: T`e^x(\sin x+\cos x)`, w: [T`e^x\cos x`, T`e^x(\sin x-\cos x)`, T`e^x\sin x\cos x`],
            s: [T`$(e^x)'\sin x+e^x(\sin x)'=e^x\sin x+e^x\cos x$`, T`Treu factor comú: $e^x(\sin x+\cos x)$.`] },
          { t: 'd', q: T`f(x)=x^2e^x\cos x`, f: 'x^2*e^x*cos(x)', e: 'e^x*(2x*cos(x)+x^2*cos(x)-x^2*sin(x))',
            a: T`e^x\left(2x\cos x+x^2\cos x-x^2\sin x\right)`, w: [T`2xe^x(-\sin x)`, T`e^x\left(2x\cos x+x^2\cos x+x^2\sin x\right)`, T`e^x\left(2x\cos x-x^2\sin x\right)`],
            s: [T`Tres factors: $(fgh)'=f'gh+fg'h+fgh'$.`, T`$2x\,e^x\cos x+x^2e^x\cos x+x^2e^x(-\sin x)$`, T`$=e^x(2x\cos x+x^2\cos x-x^2\sin x)$`] },
        ],
      },
      {
        id: 'quot', n: 'Regla del quocient',
        r: T`\left(\frac{f}{g}\right)'=\frac{f'g-f\,g'}{g^2}`,
        i: T`Quan hi ha una fracció amb $x$ al denominador (i no la pots simplificar abans). L'ordre del numerador importa: primer derives el de dalt.`,
        p: [
          { t: 'd', q: T`f(x)=\frac{x^2+1}{x-1}`, f: '(x^2+1)/(x-1)', e: '(x^2-2x-1)/(x-1)^2', dom: [1.3, 4],
            a: T`\frac{x^2-2x-1}{(x-1)^2}`, w: [T`\frac{-x^2+2x+1}{(x-1)^2}`, T`2x`, T`\frac{x^2-2x-1}{x-1}`],
            s: [T`$\dfrac{2x(x-1)-(x^2+1)\cdot1}{(x-1)^2}$`, T`Numerador: $2x^2-2x-x^2-1=x^2-2x-1$.`] },
          { t: 'd', q: T`f(x)=\frac{\ln x}{x}`, f: 'log(x)/x', e: '(1-log(x))/x^2', dom: [0.3, 4],
            a: T`\frac{1-\ln x}{x^2}`, w: [T`\frac{\ln x-1}{x^2}`, T`\frac{1}{x}`, T`\frac{1-\ln x}{x}`],
            s: [T`$\dfrac{\frac1x\cdot x-\ln x\cdot1}{x^2}=\dfrac{1-\ln x}{x^2}$`] },
          { t: 'd', q: T`f(x)=\frac{\sin x}{1+\cos x}`, f: 'sin(x)/(1+cos(x))', e: '1/(1+cos(x))', dom: [-1.5, 1.5],
            a: T`\frac{1}{1+\cos x}`, w: [T`-\cot x`, T`\frac{-1}{1+\cos x}`, T`\frac{\cos x}{(1+\cos x)^2}`],
            s: [T`$\dfrac{\cos x(1+\cos x)-\sin x(-\sin x)}{(1+\cos x)^2}=\dfrac{\cos x+\cos^2x+\sin^2x}{(1+\cos x)^2}$`, T`Com que $\sin^2x+\cos^2x=1$: $\dfrac{1+\cos x}{(1+\cos x)^2}=\dfrac{1}{1+\cos x}$`] },
        ],
      },
      {
        id: 'cad', n: 'Regla de la cadena',
        r: T`\big(f(g(x))\big)'=f'\big(g(x)\big)\cdot g'(x)`,
        i: T`Quan hi ha una funció «dins» d'una altra. Deriva la de fora deixant intacta la de dins, i multiplica per la derivada de la de dins.`,
        p: [
          { t: 'd', q: T`f(x)=(3x^2-5)^7`, f: '(3x^2-5)^7', e: '42x*(3x^2-5)^6', dom: [-1.5, 1.5],
            a: T`42x(3x^2-5)^6`, w: [T`7(3x^2-5)^6`, T`42x(3x^2-5)^7`, T`7(6x)^6`],
            s: [T`Fora: $u^7\to7u^6$. Dins: $u=3x^2-5$, $u'=6x$.`, T`$7(3x^2-5)^6\cdot6x=42x(3x^2-5)^6$`] },
          { t: 'd', q: T`f(x)=\sin(x^3)`, f: 'sin(x^3)', e: '3x^2*cos(x^3)', dom: [-1, 1],
            a: T`3x^2\cos(x^3)`, w: [T`\cos(x^3)`, T`\cos(3x^2)`, T`-3x^2\cos(x^3)`],
            s: [T`Fora: $\sin u\to\cos u$. Dins: $(x^3)'=3x^2$.`, T`$\cos(x^3)\cdot3x^2$`] },
          { t: 'd', q: T`f(x)=e^{\sqrt x}`, f: 'e^sqrt(x)', e: 'e^sqrt(x)/(2*sqrt(x))', dom: [0.3, 3],
            a: T`\frac{e^{\sqrt x}}{2\sqrt x}`, w: [T`e^{\sqrt x}`, T`\sqrt x\,e^{\sqrt x-1}`, T`\frac{e^{\sqrt x}}{\sqrt x}`],
            s: [T`Fora: $e^u\to e^u$. Dins: $(\sqrt x)'=\dfrac{1}{2\sqrt x}$.`, T`$e^{\sqrt x}\cdot\dfrac{1}{2\sqrt x}$`] },
          { t: 'd', q: T`f(x)=\ln(x^2+4)`, f: 'log(x^2+4)', e: '2x/(x^2+4)', dom: [-2, 2],
            a: T`\frac{2x}{x^2+4}`, w: [T`\frac{1}{x^2+4}`, T`\frac{1}{2x}`, T`\frac{2x}{\ln(x^2+4)}`],
            s: [T`$(\ln u)'=\dfrac{u'}{u}$ amb $u=x^2+4$.`, T`$\dfrac{2x}{x^2+4}$`] },
        ],
      },
      {
        id: 'cad2', n: 'Cadena múltiple',
        r: T`\big(f(g(h(x)))\big)'=f'(g(h))\cdot g'(h)\cdot h'(x)`,
        i: T`Composicions niuades: ves pelant capes de fora cap a dins i multiplica totes les derivades. Escriu $\sin^3(2x)$ com $(\sin 2x)^3$ per veure les capes.`,
        p: [
          { t: 'd', q: T`f(x)=\sin^3(2x)`, f: 'sin(2x)^3', e: '6*sin(2x)^2*cos(2x)', dom: [-1, 1],
            a: T`6\sin^2(2x)\cos(2x)`, w: [T`3\sin^2(2x)\cos(2x)`, T`6\sin^2(2x)`, T`3\cos^3(2x)`],
            s: [T`Capes: $u^3$, $\sin v$, $2x$.`, T`$3\sin^2(2x)\cdot\cos(2x)\cdot2=6\sin^2(2x)\cos(2x)$`] },
          { t: 'd', q: T`f(x)=\ln\big(\cos(e^x)\big)`, f: 'log(cos(e^x))', e: '-e^x*tan(e^x)', dom: [-2, 0.3],
            a: T`-e^x\tan(e^x)`, w: [T`\frac{1}{\cos(e^x)}`, T`e^x\tan(e^x)`, T`-\tan(e^x)`],
            s: [T`$\dfrac{1}{\cos(e^x)}\cdot(-\sin(e^x))\cdot e^x$`, T`$=-e^x\tan(e^x)$`] },
          { t: 'd', q: T`f(x)=\sqrt{1+\sin^2x}`, f: 'sqrt(1+sin(x)^2)', e: 'sin(x)*cos(x)/sqrt(1+sin(x)^2)', dom: [-1.5, 1.5],
            a: T`\frac{\sin x\cos x}{\sqrt{1+\sin^2x}}`, w: [T`\frac{1}{2\sqrt{1+\sin^2x}}`, T`\frac{2\sin x\cos x}{\sqrt{1+\sin^2x}}`, T`\frac{\sin x\cos x}{1+\sin^2x}`],
            s: [T`$\dfrac{1}{2\sqrt{1+\sin^2x}}\cdot2\sin x\cdot\cos x$`, T`El 2 es simplifica: $\dfrac{\sin x\cos x}{\sqrt{1+\sin^2x}}$`] },
        ],
      },
    ],
  },
  {
    id: 'd3', icon: '🔁', name: 'Inverses i hiperbòliques',
    desc: 'Arcsinus, arctangent, la derivada de la inversa i les funcions hiperbòliques.',
    pista: T`La derivada de la inversa és l'invers del pendent: $(f^{-1})'(b)=\frac{1}{f'(a)}$ on $b=f(a)$. Les hiperbòliques es comporten com les trigonomètriques però amb canvis de signe: $\cosh^2x-\sinh^2x=1$.`,
    items: [
      {
        id: 'arc', n: 'Trigonomètriques inverses',
        r: T`(\arcsin x)'=\tfrac{1}{\sqrt{1-x^2}},\quad(\arccos x)'=\tfrac{-1}{\sqrt{1-x^2}},\quad(\arctan x)'=\tfrac{1}{1+x^2}`,
        i: T`Quasi sempre aniran amb la regla de la cadena: $(\arctan u)'=\frac{u'}{1+u^2}$, $(\arcsin u)'=\frac{u'}{\sqrt{1-u^2}}$.`,
        p: [
          { t: 'd', q: T`f(x)=\arctan(x^2)`, f: 'atan(x^2)', e: '2x/(1+x^4)', dom: [-2, 2],
            a: T`\frac{2x}{1+x^4}`, w: [T`\frac{1}{1+x^4}`, T`\frac{2x}{1+x^2}`, T`\frac{2x}{\sqrt{1-x^4}}`],
            s: [T`$\dfrac{u'}{1+u^2}$ amb $u=x^2$: $\dfrac{2x}{1+(x^2)^2}$`] },
          { t: 'd', q: T`f(x)=\arcsin(2x)`, f: 'asin(2x)', e: '2/sqrt(1-4x^2)', dom: [-0.4, 0.4],
            a: T`\frac{2}{\sqrt{1-4x^2}}`, w: [T`\frac{1}{\sqrt{1-4x^2}}`, T`\frac{2}{\sqrt{1-2x^2}}`, T`\frac{2}{1+4x^2}`],
            s: [T`$\dfrac{u'}{\sqrt{1-u^2}}$ amb $u=2x$, $u'=2$.`, T`$\dfrac{2}{\sqrt{1-(2x)^2}}=\dfrac{2}{\sqrt{1-4x^2}}$`] },
          { t: 'd', q: T`f(x)=x\arccos x-\sqrt{1-x^2}`, f: 'x*acos(x)-sqrt(1-x^2)', e: 'acos(x)', dom: [-0.8, 0.8],
            a: T`\arccos x`, w: [T`\arccos x-\frac{2x}{\sqrt{1-x^2}}`, T`-\frac{x}{\sqrt{1-x^2}}`, T`\arccos x+\frac{x}{\sqrt{1-x^2}}`],
            s: [T`Producte: $\arccos x+x\cdot\dfrac{-1}{\sqrt{1-x^2}}$.`, T`$-(\sqrt{1-x^2})'=-\dfrac{-x}{\sqrt{1-x^2}}=+\dfrac{x}{\sqrt{1-x^2}}$.`, T`Els dos termes es cancel·len: $f'(x)=\arccos x$. (Per tant $\int\arccos x\,dx=x\arccos x-\sqrt{1-x^2}+C$.)`] },
        ],
      },
      {
        id: 'inv', n: 'Derivada de la funció inversa',
        r: T`(f^{-1})'(b)=\frac{1}{f'(a)},\qquad b=f(a)`,
        i: T`Quan no pots aïllar la inversa. Busca el punt $a$ amb $f(a)=b$ (sovint a ull: prova 0, 1, −1) i fes l'invers de $f'(a)$.`,
        p: [
          { t: 'v', ask: T`Si $f(x)=x^3+x+1$, calcula $(f^{-1})'(3)$.`, q: T`(f^{-1})'(3)`, e: '1/4', a: T`\tfrac14`, w: [T`4`, T`\tfrac{1}{28}`, T`\tfrac13`],
            s: [T`Busca $a$ amb $f(a)=3$: $a=1$ ($1+1+1=3$).`, T`$f'(x)=3x^2+1\Rightarrow f'(1)=4$.`, T`$(f^{-1})'(3)=\dfrac{1}{f'(1)}=\dfrac14$. Error típic: fer $\frac{1}{f'(3)}=\frac{1}{28}$.`] },
          { t: 'v', ask: T`Si $f(x)=x+e^x$, calcula $(f^{-1})'(1)$.`, q: T`(f^{-1})'(1)`, e: '1/2', a: T`\tfrac12`, w: [T`\tfrac{1}{1+e}`, T`2`, T`1`],
            s: [T`$f(0)=0+1=1$, per tant $a=0$.`, T`$f'(x)=1+e^x\Rightarrow f'(0)=2$.`, T`$(f^{-1})'(1)=\tfrac12$`] },
          { t: 'c', q: T`Si $y=\arcsin x$, aleshores $\frac{dy}{dx}=\frac{1}{\cos y}$. Per què això és $\frac{1}{\sqrt{1-x^2}}$ i no $\frac{-1}{\sqrt{1-x^2}}$?`, a: T`Perquè $y\in[-\frac{\pi}{2},\frac{\pi}{2}]$ i en aquest interval $\cos y\ge0$.`,
            w: [T`Perquè l'arrel quadrada sempre és positiva per conveni, sense cap altra raó.`, T`Perquè $\sin y\ge 0$ per a tot $y$.`, T`Perquè $\arcsin x$ és una funció parella.`],
            s: [T`$\cos y=\pm\sqrt{1-\sin^2y}=\pm\sqrt{1-x^2}$.`, T`El rang de l'arcsinus és $[-\pi/2,\pi/2]$, on el cosinus és no negatiu: ens quedem amb el $+$.`] },
        ],
      },
      {
        id: 'hip', n: 'Funcions hiperbòliques',
        r: T`(\sinh x)'=\cosh x,\quad(\cosh x)'=\sinh x,\quad(\tanh x)'=1-\tanh^2x=\operatorname{sech}^2x`,
        i: T`$\sinh x=\frac{e^x-e^{-x}}{2}$, $\cosh x=\frac{e^x+e^{-x}}{2}$. A diferència del cosinus, $(\cosh x)'$ NO porta signe menys.`,
        p: [
          { t: 'd', q: T`f(x)=\cosh(x^2)`, f: 'cosh(x^2)', e: '2x*sinh(x^2)', dom: [-1.5, 1.5],
            a: T`2x\sinh(x^2)`, w: [T`-2x\sinh(x^2)`, T`\sinh(x^2)`, T`2x\cosh(x^2)`],
            s: [T`$(\cosh u)'=\sinh u\cdot u'$ (sense signe menys!).`, T`$\sinh(x^2)\cdot2x$`] },
          { t: 'd', q: T`f(x)=\ln(\cosh x)`, f: 'log(cosh(x))', e: 'tanh(x)', dom: [-2, 2],
            a: T`\tanh x`, w: [T`\coth x`, T`-\tanh x`, T`\frac{1}{\sinh x}`],
            s: [T`$\dfrac{(\cosh x)'}{\cosh x}=\dfrac{\sinh x}{\cosh x}=\tanh x$`] },
          { t: 'd', q: T`f(x)=\sinh x\cosh x`, f: 'sinh(x)*cosh(x)', e: 'cosh(2x)', dom: [-1.5, 1.5],
            a: T`\cosh(2x)`, w: [T`\sinh^2x-\cosh^2x`, T`1`, T`2\sinh x\cosh x`],
            s: [T`Producte: $\cosh x\cosh x+\sinh x\sinh x=\cosh^2x+\sinh^2x$.`, T`Identitat de l'angle doble: $\cosh^2x+\sinh^2x=\cosh 2x$.`] },
        ],
      },
      {
        id: 'arghip', n: 'Hiperbòliques inverses',
        r: T`(\operatorname{argsinh}x)'=\tfrac{1}{\sqrt{x^2+1}},\ (\operatorname{argcosh}x)'=\tfrac{1}{\sqrt{x^2-1}},\ (\operatorname{argtanh}x)'=\tfrac{1}{1-x^2}`,
        i: T`Tenen forma logarítmica: $\operatorname{argsinh}x=\ln(x+\sqrt{x^2+1})$. Són clau per integrar arrels del tipus $\sqrt{x^2\pm a^2}$.`,
        p: [
          { t: 'd', q: T`f(x)=\ln\left(x+\sqrt{x^2+1}\right)`, f: 'log(x+sqrt(x^2+1))', e: '1/sqrt(x^2+1)', dom: [-2, 2],
            a: T`\frac{1}{\sqrt{x^2+1}}`, w: [T`\frac{1}{x+\sqrt{x^2+1}}`, T`\frac{x}{\sqrt{x^2+1}}`, T`\frac{1}{\sqrt{x^2-1}}`],
            s: [T`$\dfrac{1}{x+\sqrt{x^2+1}}\left(1+\dfrac{x}{\sqrt{x^2+1}}\right)$`, T`$=\dfrac{1}{x+\sqrt{x^2+1}}\cdot\dfrac{\sqrt{x^2+1}+x}{\sqrt{x^2+1}}=\dfrac{1}{\sqrt{x^2+1}}$`] },
          { t: 'd', q: T`f(x)=\operatorname{argtanh}\frac{x}{2}`, f: 'atanh(x/2)', e: '2/(4-x^2)', dom: [-1.5, 1.5],
            a: T`\frac{2}{4-x^2}`, w: [T`\frac{1}{4-x^2}`, T`\frac{2}{4+x^2}`, T`\frac{1}{2(1-x^2)}`],
            s: [T`$\dfrac{u'}{1-u^2}$ amb $u=\frac x2$: $\dfrac{1/2}{1-x^2/4}$`, T`Multiplica per 4 a dalt i a baix: $\dfrac{2}{4-x^2}$`] },
        ],
      },
    ],
  },
  {
    id: 'd4', icon: '🧠', name: 'Tècniques avançades',
    desc: 'Logarítmica, implícita, paramètrica i derivades d\'ordre superior.',
    pista: T`Si la $x$ és a la base i a l'exponent, pren logaritmes. Si $y$ no es pot aïllar, deriva implícitament recordant que $(y^n)'=n\,y^{n-1}\,y'$.`,
    items: [
      {
        id: 'logd', n: 'Derivació logarítmica',
        r: T`y=f^{\,g}\ \Rightarrow\ \ln y=g\ln f\ \Rightarrow\ \frac{y'}{y}=g'\ln f+g\frac{f'}{f}`,
        i: T`Per a funcions del tipus $f(x)^{g(x)}$ (com $x^x$) i per a productes/quocients molt llargs, on els logaritmes converteixen productes en sumes.`,
        p: [
          { t: 'd', q: T`f(x)=x^x`, f: 'x^x', e: 'x^x*(log(x)+1)', dom: [0.3, 2.5],
            a: T`x^x(\ln x+1)`, w: [T`x\cdot x^{x-1}`, T`x^x\ln x`, T`x^x(\ln x-1)`],
            s: [T`$\ln y=x\ln x$`, T`$\dfrac{y'}{y}=\ln x+x\cdot\dfrac1x=\ln x+1$`, T`$y'=x^x(\ln x+1)$. Ni és $n x^{n-1}$ (exponent variable) ni $a^x\ln a$ (base variable).`] },
          { t: 'd', q: T`f(x)=x^{\sin x}`, f: 'x^sin(x)', e: 'x^sin(x)*(cos(x)*log(x)+sin(x)/x)', dom: [0.3, 3],
            a: T`x^{\sin x}\left(\cos x\ln x+\frac{\sin x}{x}\right)`, w: [T`\sin x\cdot x^{\sin x-1}`, T`x^{\sin x}\cos x\ln x`, T`x^{\sin x}\left(\cos x\ln x+\frac{\cos x}{x}\right)`],
            s: [T`$\ln y=\sin x\ln x$`, T`$\dfrac{y'}{y}=\cos x\ln x+\dfrac{\sin x}{x}$`, T`Multiplica per $y=x^{\sin x}$.`] },
          { t: 'd', q: T`f(x)=\frac{(x+1)^3\sqrt{x}}{(x^2+1)^2}`, f: '(x+1)^3*sqrt(x)/(x^2+1)^2', e: '(x+1)^3*sqrt(x)/(x^2+1)^2*(3/(x+1)+1/(2x)-4x/(x^2+1))', dom: [0.3, 3],
            a: T`\frac{(x+1)^3\sqrt x}{(x^2+1)^2}\left(\frac{3}{x+1}+\frac{1}{2x}-\frac{4x}{x^2+1}\right)`,
            w: [T`\frac{(x+1)^3\sqrt x}{(x^2+1)^2}\left(\frac{3}{x+1}+\frac{1}{2x}+\frac{4x}{x^2+1}\right)`, T`\frac{3(x+1)^2\cdot\frac{1}{2\sqrt x}}{2(x^2+1)\cdot 2x}`, T`\frac{(x+1)^3\sqrt x}{(x^2+1)^2}\left(\frac{3}{x+1}+\frac{1}{2x}-\frac{2}{x^2+1}\right)`],
            s: [T`$\ln y=3\ln(x+1)+\tfrac12\ln x-2\ln(x^2+1)$`, T`$\dfrac{y'}{y}=\dfrac{3}{x+1}+\dfrac{1}{2x}-\dfrac{4x}{x^2+1}$`, T`Multiplica per $y$.`] },
        ],
      },
      {
        id: 'impl', n: 'Derivació implícita',
        r: T`F(x,y)=0\ \Rightarrow\ \frac{dy}{dx}=-\frac{F_x}{F_y}`,
        i: T`Quan la corba ve donada per una equació i no pots aïllar $y$. Deriva els dos costats respecte de $x$ (cada $y$ porta un $y'$) i aïlla $y'$. Escriu la resposta en funció de $x$ i $y$ (usa $x*y$ per multiplicar).`,
        p: [
          { t: 'd', q: T`x^2+y^2=25`, ask: T`Calcula $y'=\frac{dy}{dx}$ (en funció de $x$ i $y$)`, pre: T`y'=`, v: ['x', 'y'], imp: 'x^2+y^2-25', e: '-x/y', dom: [0.5, 3],
            a: T`-\frac{x}{y}`, w: [T`\frac{x}{y}`, T`-\frac{y}{x}`, T`-\frac{x^2}{y^2}`],
            s: [T`$2x+2y\,y'=0$`, T`$y'=-\dfrac{x}{y}$`] },
          { t: 'd', q: T`x^3+y^3=6xy`, ask: T`Calcula $y'$ (folium de Descartes)`, pre: T`y'=`, v: ['x', 'y'], imp: 'x^3+y^3-6*x*y', e: '(2y-x^2)/(y^2-2x)', dom: [0.3, 1.2],
            a: T`\frac{2y-x^2}{y^2-2x}`, w: [T`\frac{x^2-2y}{y^2-2x}`, T`\frac{2y-x^2}{y^2}`, T`\frac{2y+x^2}{y^2-2x}`],
            s: [T`$3x^2+3y^2y'=6y+6xy'$`, T`Agrupa $y'$: $y'(3y^2-6x)=6y-3x^2$`, T`$y'=\dfrac{2y-x^2}{y^2-2x}$`] },
          { t: 'd', q: T`e^{xy}+y=x`, ask: T`Calcula $y'$`, pre: T`y'=`, v: ['x', 'y'], imp: 'e^(x*y)+y-x', e: '(1-y*e^(x*y))/(1+x*e^(x*y))', dom: [0.2, 1.2],
            a: T`\frac{1-y\,e^{xy}}{1+x\,e^{xy}}`, w: [T`\frac{1+y\,e^{xy}}{1+x\,e^{xy}}`, T`\frac{1}{e^{xy}+1}`, T`\frac{1-x\,e^{xy}}{1+y\,e^{xy}}`],
            s: [T`$e^{xy}(y+xy')+y'=1$`, T`$y'(xe^{xy}+1)=1-ye^{xy}$`, T`$y'=\dfrac{1-ye^{xy}}{1+xe^{xy}}$`] },
        ],
      },
      {
        id: 'param', n: 'Corbes paramètriques',
        r: T`\frac{dy}{dx}=\frac{y'(t)}{x'(t)},\qquad\frac{d^2y}{dx^2}=\frac{\frac{d}{dt}\left(\frac{dy}{dx}\right)}{x'(t)}`,
        i: T`Quan la corba és $(x(t),y(t))$. El pendent és el quocient de velocitats. Compte amb la segona derivada: NO és $y''/x''$.`,
        p: [
          { t: 'd', q: T`x=t^2,\quad y=t^3`, ask: T`Calcula $\frac{dy}{dx}$ en funció de $t$`, pre: T`\tfrac{dy}{dx}=`, v: ['t'], par: ['t^2', 't^3'], e: '3t/2', dom: [0.3, 3],
            a: T`\frac{3t}{2}`, w: [T`\frac{2}{3t}`, T`\frac{3t^2}{2}`, T`3t^2-2t`],
            s: [T`$x'(t)=2t$, $y'(t)=3t^2$`, T`$\dfrac{dy}{dx}=\dfrac{3t^2}{2t}=\dfrac{3t}{2}$`] },
          { t: 'd', q: T`x=\cos t,\quad y=\sin t`, ask: T`Calcula $\frac{dy}{dx}$`, pre: T`\tfrac{dy}{dx}=`, v: ['t'], par: ['cos(t)', 'sin(t)'], e: '-cos(t)/sin(t)', dom: [0.3, 2.8],
            a: T`-\cot t`, w: [T`-\tan t`, T`\cot t`, T`-1`],
            s: [T`$x'=-\sin t$, $y'=\cos t$`, T`$\dfrac{dy}{dx}=\dfrac{\cos t}{-\sin t}=-\cot t$`] },
          { t: 'd', q: T`x=e^t,\quad y=t\,e^t`, ask: T`Calcula $\frac{dy}{dx}$`, pre: T`\tfrac{dy}{dx}=`, v: ['t'], par: ['e^t', 't*e^t'], e: '1+t', dom: [-1, 2],
            a: T`1+t`, w: [T`t`, T`e^t(1+t)`, T`\frac{1}{1+t}`],
            s: [T`$x'=e^t$, $y'=e^t+te^t$`, T`$\dfrac{e^t(1+t)}{e^t}=1+t$`] },
        ],
      },
      {
        id: 'ordre', n: 'Derivades d\'ordre superior',
        r: T`(f\,g)^{(n)}=\sum_{k=0}^{n}\binom{n}{k}f^{(k)}g^{(n-k)}\quad\text{(Leibniz)}`,
        i: T`Per a $f''$ deriva dues vegades. Per a la derivada $n$-èsima busca el patró amb les primeres 3-4 derivades, o fes servir Leibniz si un factor és un polinomi (s'anul·la aviat).`,
        p: [
          { t: 'd', q: T`f(x)=x\,e^{2x}`, ask: T`Calcula $f''(x)$`, pre: T`f''(x)=`, n: 2, f: 'x*e^(2x)', e: '4*(1+x)*e^(2x)', dom: [-1, 1],
            a: T`4(1+x)e^{2x}`, w: [T`2(1+2x)e^{2x}`, T`4xe^{2x}`, T`(1+2x)e^{2x}`],
            s: [T`$f'=e^{2x}+2xe^{2x}=(1+2x)e^{2x}$`, T`$f''=2e^{2x}+(1+2x)2e^{2x}=(4+4x)e^{2x}$`] },
          { t: 'v', q: T`f(x)=\ln(1+x)`, ask: T`Calcula $f^{(5)}(0)$`, e: '24', a: T`24`, w: [T`-24`, T`120`, T`\tfrac15`],
            s: [T`$f'=(1+x)^{-1}$, $f''=-(1+x)^{-2}$, $f'''=2(1+x)^{-3}$, $f^{(4)}=-6(1+x)^{-4}$`, T`Patró: $f^{(n)}(x)=\dfrac{(-1)^{n-1}(n-1)!}{(1+x)^n}$`, T`$f^{(5)}(0)=4!=24$`] },
          { t: 'd', q: T`f(x)=x^2e^x`, ask: T`Calcula $f^{(10)}(x)$`, pre: T`f^{(10)}(x)=`, n: 10, nochk: 1, f: 'x^2*e^x', e: 'e^x*(x^2+20x+90)', dom: [-1, 1],
            a: T`e^x(x^2+20x+90)`, w: [T`e^x(x^2+10x+90)`, T`e^x(x^2+20x+45)`, T`10!\,e^x`],
            s: [T`Leibniz amb $f=x^2$ (només 3 derivades no nul·les) i $g=e^x$:`, T`$\binom{10}{0}x^2e^x+\binom{10}{1}2x\,e^x+\binom{10}{2}2\,e^x$`, T`$=e^x(x^2+20x+90)$`] },
        ],
      },
    ],
  },
  {
    id: 'd5', icon: '📈', name: 'Aplicacions',
    desc: 'L\'Hôpital, rectes tangents, polinomis de Taylor i optimització.',
    pista: T`L'Hôpital només per a $\frac00$ o $\frac{\infty}{\infty}$: les altres indeterminacions ($0\cdot\infty$, $1^\infty$…) primer s'hi han de transformar. Taylor: $f(x)\approx\sum\frac{f^{(k)}(a)}{k!}(x-a)^k$.`,
    items: [
      {
        id: 'hop', n: 'Regla de L\'Hôpital',
        r: T`\lim\frac{f}{g}\ \text{tipus}\ \tfrac00,\tfrac{\infty}{\infty}\ \Rightarrow\ \lim\frac{f}{g}=\lim\frac{f'}{g'}`,
        i: T`Deriva numerador i denominador per separat (NO és la regla del quocient!). Per a $1^\infty$: $\lim f^g=e^{\lim g\ln f}$. Per a $0\cdot\infty$: escriu-ho com un quocient.`,
        p: [
          { t: 'v', q: T`\lim_{x\to0}\frac{e^x-1-x}{x^2}`, e: '1/2', a: T`\tfrac12`, w: [T`0`, T`1`, T`\infty`], lim: ['(e^x-1-x)/x^2', 0],
            s: [T`Tipus $\frac00$. L'Hôpital: $\lim\dfrac{e^x-1}{2x}$, encara $\frac00$.`, T`Un altre cop: $\lim\dfrac{e^x}{2}=\dfrac12$`] },
          { t: 'v', q: T`\lim_{x\to0}\frac{x-\sin x}{x^3}`, e: '1/6', a: T`\tfrac16`, w: [T`0`, T`\tfrac13`, T`1`], lim: ['(x-sin(x))/x^3', 0],
            s: [T`$\frac00\to\dfrac{1-\cos x}{3x^2}\to\dfrac{\sin x}{6x}\to\dfrac{\cos x}{6}=\dfrac16$`, T`(O amb Taylor: $x-\sin x=\frac{x^3}{6}-\dots$)`] },
          { t: 'v', q: T`\lim_{x\to0^+}x\ln x`, e: '0', a: T`0`, w: [T`-\infty`, T`1`, T`-1`], lim: ['x*log(x)', 0, 1],
            s: [T`Tipus $0\cdot(-\infty)$. Escriu $\dfrac{\ln x}{1/x}$, tipus $\frac{\infty}{\infty}$.`, T`$\lim\dfrac{1/x}{-1/x^2}=\lim(-x)=0$`] },
          { t: 'v', q: T`\lim_{x\to\infty}\left(1+\frac{3}{x}\right)^x`, e: 'e^3', a: T`e^3`, w: [T`1`, T`3`, T`e`], lim: ['(1+3/x)^x', 'inf'],
            s: [T`Tipus $1^\infty$: $L=e^{\lim x\ln(1+3/x)}$.`, T`$\lim\dfrac{\ln(1+3/x)}{1/x}$ (tipus $\frac00$) $=\lim\dfrac{\frac{-3/x^2}{1+3/x}}{-1/x^2}=3$`, T`$L=e^3$`] },
        ],
      },
      {
        id: 'tang', n: 'Recta tangent i aproximació lineal',
        r: T`y=f(a)+f'(a)(x-a)`,
        i: T`La recta tangent és la millor aproximació lineal de $f$ prop de $a$. Serveix per aproximar valors: $\sqrt{4{,}1}\approx$ tangent a $\sqrt x$ en $a=4$.`,
        p: [
          { t: 'd', q: T`f(x)=e^{2x},\ a=0`, ask: T`Recta tangent a la gràfica en $x=0$`, pre: T`y=`, tan: ['e^(2x)', 0], e: '1+2x',
            a: T`1+2x`, w: [T`2x`, T`1+x`, T`2+2x`],
            s: [T`$f(0)=1$, $f'(x)=2e^{2x}\Rightarrow f'(0)=2$.`, T`$y=1+2(x-0)=1+2x$`] },
          { t: 'd', q: T`f(x)=\sqrt x,\ a=4`, ask: T`Recta tangent en $x=4$`, pre: T`y=`, tan: ['sqrt(x)', 4], e: '1+x/4',
            a: T`\frac{x}{4}+1`, w: [T`\frac{x}{2}+2`, T`\frac{x}{4}+2`, T`\frac{x-4}{2}`],
            s: [T`$f(4)=2$, $f'(x)=\frac{1}{2\sqrt x}\Rightarrow f'(4)=\frac14$.`, T`$y=2+\frac14(x-4)=\frac x4+1$`] },
          { t: 'v', q: T`\sqrt{4{,}1}`, ask: T`Aproxima amb la recta tangent en $a=4$ (dona el valor de l'aproximació)`, e: '2.025', a: T`2{,}025`, w: [T`2{,}05`, T`2{,}1`, T`2{,}0025`], nochk: 1,
            s: [T`Tangent: $y=2+\frac14(x-4)$.`, T`$y(4{,}1)=2+\frac{0{,}1}{4}=2{,}025$ (valor real: $2{,}02485\ldots$)`] },
        ],
      },
      {
        id: 'tay', n: 'Polinomi de Taylor',
        r: T`P_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x-a)^k`,
        i: T`Aprèn els desenvolupaments de MacLaurin bàsics ($e^x$, $\sin x$, $\cos x$, $\ln(1+x)$, $(1+x)^\alpha$) i combina'ls per substitució: $e^{x^2}=1+x^2+\frac{x^4}{2}+\dots$`,
        p: [
          { t: 'd', q: T`f(x)=e^x,\ a=0,\ n=3`, ask: T`Polinomi de Taylor d'ordre 3 en $a=0$`, pre: T`P_3(x)=`, tay: ['e^x', 3], e: '1+x+x^2/2+x^3/6',
            a: T`1+x+\frac{x^2}{2}+\frac{x^3}{6}`, w: [T`1+x+x^2+x^3`, T`x+\frac{x^2}{2}+\frac{x^3}{3}`, T`1+x+\frac{x^2}{2}+\frac{x^3}{3}`],
            s: [T`Totes les derivades valen $e^0=1$.`, T`$P_3=1+x+\dfrac{x^2}{2!}+\dfrac{x^3}{3!}$`] },
          { t: 'd', q: T`f(x)=\sin x,\ a=0,\ n=5`, ask: T`Polinomi de Taylor d'ordre 5`, pre: T`P_5(x)=`, tay: ['sin(x)', 5], e: 'x-x^3/6+x^5/120',
            a: T`x-\frac{x^3}{6}+\frac{x^5}{120}`, w: [T`x-\frac{x^3}{3}+\frac{x^5}{5}`, T`x+\frac{x^3}{6}+\frac{x^5}{120}`, T`1-\frac{x^2}{2}+\frac{x^4}{24}`],
            s: [T`Derivades en 0: $0,1,0,-1,0,1$.`, T`$P_5=x-\dfrac{x^3}{3!}+\dfrac{x^5}{5!}$`] },
          { t: 'd', q: T`f(x)=\ln(1+x),\ a=0,\ n=3`, ask: T`Polinomi de Taylor d'ordre 3`, pre: T`P_3(x)=`, tay: ['log(1+x)', 3], e: 'x-x^2/2+x^3/3',
            a: T`x-\frac{x^2}{2}+\frac{x^3}{3}`, w: [T`x+\frac{x^2}{2}+\frac{x^3}{3}`, T`x-\frac{x^2}{2}+\frac{x^3}{6}`, T`1+x-\frac{x^2}{2}`],
            s: [T`$f(0)=0$, $f'(0)=1$, $f''(0)=-1$, $f'''(0)=2$.`, T`$P_3=x-\dfrac{x^2}{2}+\dfrac{2x^3}{6}=x-\dfrac{x^2}{2}+\dfrac{x^3}{3}$`] },
          { t: 'd', q: T`f(x)=\sqrt{1+x},\ a=0,\ n=2`, ask: T`Polinomi de Taylor d'ordre 2`, pre: T`P_2(x)=`, tay: ['sqrt(1+x)', 2], e: '1+x/2-x^2/8',
            a: T`1+\frac{x}{2}-\frac{x^2}{8}`, w: [T`1+\frac{x}{2}+\frac{x^2}{8}`, T`1+\frac{x}{2}-\frac{x^2}{4}`, T`1-\frac{x}{2}+\frac{x^2}{8}`],
            s: [T`Binomial: $(1+x)^{\alpha}\approx1+\alpha x+\frac{\alpha(\alpha-1)}{2}x^2$ amb $\alpha=\frac12$.`, T`$\frac{\frac12\cdot(-\frac12)}{2}=-\frac18$`] },
        ],
      },
      {
        id: 'opt', n: 'Extrems i optimització',
        r: T`f'(a)=0,\ f''(a)<0\Rightarrow\text{màx.};\quad f'(a)=0,\ f''(a)>0\Rightarrow\text{mín.}`,
        i: T`1) Escriu la magnitud a optimitzar en funció d'una sola variable (fes servir la restricció). 2) Iguala la derivada a 0. 3) Comprova que és màxim/mínim (segona derivada o signe de $f'$) i mira els extrems de l'interval.`,
        p: [
          { t: 'v', ask: T`On té el màxim absolut $f(x)=x\,e^{-x}$ en $[0,\infty)$? Dona el valor de $x$.`, q: T`f(x)=x\,e^{-x}`, e: '1', a: T`x=1`, w: [T`x=0`, T`x=e^{-1}`, T`x=2`],
            s: [T`$f'(x)=e^{-x}-xe^{-x}=e^{-x}(1-x)=0\Rightarrow x=1$.`, T`$f'>0$ per a $x<1$ i $f'<0$ per a $x>1$: màxim. El valor màxim és $f(1)=1/e$.`] },
          { t: 'v', ask: T`Una caixa sense tapa, de base quadrada, ha de tenir un volum de $32\text{ cm}^3$. Quin costat de la base minimitza el material?`, q: T`V=x^2h=32`, e: '4', a: T`4\text{ cm}`, w: [T`2\text{ cm}`, T`8\text{ cm}`, T`\sqrt[3]{32}\text{ cm}`],
            s: [T`Superfície: $S=x^2+4xh$ i $h=\frac{32}{x^2}$, per tant $S(x)=x^2+\dfrac{128}{x}$.`, T`$S'(x)=2x-\dfrac{128}{x^2}=0\Rightarrow x^3=64\Rightarrow x=4$.`, T`$S''(4)=2+\frac{256}{64}>0$: mínim.`] },
          { t: 'v', ask: T`Abscissa del punt d'inflexió de $f(x)=x^3-6x^2+5$`, q: T`f(x)=x^3-6x^2+5`, e: '2', a: T`x=2`, w: [T`x=0`, T`x=4`, T`x=6`],
            s: [T`$f''(x)=6x-12=0\Rightarrow x=2$.`, T`$f''$ canvia de signe en $x=2$: és inflexió. (En $x=0$ i $x=4$ hi ha els extrems.)`] },
          { t: 'c', q: T`Si $f'(a)=0$ i $f''(a)=0$, què podem dir de $x=a$?`, a: T`Res encara: pot ser màxim, mínim o inflexió; cal estudiar més derivades o el signe de $f'$.`,
            w: [T`És segur un punt d'inflexió.`, T`És segur un mínim relatiu.`, T`La funció és constant a prop de $a$.`],
            s: [T`Exemples: $x^4$ (mínim), $-x^4$ (màxim) i $x^3$ (inflexió) compleixen $f'(0)=f''(0)=0$.`] },
        ],
      },
    ],
  },
  {
    id: 'd6', icon: '🧭', name: 'Diverses variables',
    desc: 'Parcials, gradient, cadena multivariable i extrems amb la hessiana.',
    pista: T`Per derivar parcialment respecte de $x$, tracta $y$ com una constant. El gradient $\nabla f=(f_x,f_y)$ apunta cap on $f$ creix més ràpid i és perpendicular a les corbes de nivell.`,
    items: [
      {
        id: 'parc', n: 'Derivades parcials',
        r: T`\frac{\partial f}{\partial x}(a,b)=\lim_{h\to0}\frac{f(a+h,b)-f(a,b)}{h}`,
        i: T`Deriva com sempre, però l'altra variable és una constant. Escriu els productes amb asterisc: x*y.`,
        p: [
          { t: 'd', q: T`f(x,y)=x^2y^3+\sin(xy)`, ask: T`Calcula $\frac{\partial f}{\partial x}$`, pre: T`f_x=`, v: ['x', 'y'], wrt: 'x', f: 'x^2*y^3+sin(x*y)', e: '2*x*y^3+y*cos(x*y)', dom: [-1.5, 1.5],
            a: T`2xy^3+y\cos(xy)`, w: [T`3x^2y^2+x\cos(xy)`, T`2xy^3+\cos(xy)`, T`2xy^3-y\cos(xy)`],
            s: [T`$y$ és constant: $(x^2)'y^3=2xy^3$.`, T`Cadena: $\cos(xy)\cdot\frac{\partial}{\partial x}(xy)=y\cos(xy)$`] },
          { t: 'd', q: T`f(x,y)=x\,e^{y/x}`, ask: T`Calcula $\frac{\partial f}{\partial x}$`, pre: T`f_x=`, v: ['x', 'y'], wrt: 'x', f: 'x*e^(y/x)', e: 'e^(y/x)*(1-y/x)', dom: [0.5, 2],
            a: T`e^{y/x}\left(1-\frac{y}{x}\right)`, w: [T`e^{y/x}`, T`-\frac{y}{x}e^{y/x}`, T`e^{y/x}\left(1+\frac{y}{x}\right)`],
            s: [T`Producte: $1\cdot e^{y/x}+x\cdot e^{y/x}\cdot\left(-\dfrac{y}{x^2}\right)$`, T`$=e^{y/x}\left(1-\dfrac yx\right)$`] },
          { t: 'd', q: T`f(x,y)=\arctan\frac{y}{x}`, ask: T`Calcula $\frac{\partial f}{\partial y}$`, pre: T`f_y=`, v: ['x', 'y'], wrt: 'y', f: 'atan(y/x)', e: 'x/(x^2+y^2)', dom: [0.5, 2],
            a: T`\frac{x}{x^2+y^2}`, w: [T`\frac{-y}{x^2+y^2}`, T`\frac{x^2}{x^2+y^2}`, T`\frac{1}{x^2+y^2}`],
            s: [T`$\dfrac{1}{1+(y/x)^2}\cdot\dfrac1x$`, T`$=\dfrac{x^2}{x^2+y^2}\cdot\dfrac1x=\dfrac{x}{x^2+y^2}$`] },
        ],
      },
      {
        id: 'grad', n: 'Gradient i derivada direccional',
        r: T`D_{\vec u}f=\nabla f\cdot\vec u,\qquad \nabla f=\left(f_x,\,f_y\right),\ \ |\vec u|=1`,
        i: T`El vector direcció ha de ser unitari (divideix pel mòdul!). El valor màxim de $D_{\vec u}f$ és $|\nabla f|$, en la direcció de $\nabla f$.`,
        p: [
          { t: 'v', ask: T`Derivada direccional de $f=x^2+3xy$ en $(1,2)$ en la direcció $\vec u=\left(\frac35,\frac45\right)$`, q: T`D_{\vec u}f(1,2)`, e: '36/5', a: T`\tfrac{36}{5}`, w: [T`11`, T`\tfrac{36}{25}`, T`8`],
            s: [T`$\nabla f=(2x+3y,\ 3x)=(8,\ 3)$ en $(1,2)$.`, T`$D_{\vec u}f=8\cdot\frac35+3\cdot\frac45=\frac{24+12}{5}=\frac{36}{5}$`] },
          { t: 'v', ask: T`Ritme màxim de creixement de $f=x\,e^{y}$ en el punt $(2,0)$`, q: T`|\nabla f(2,0)|`, e: 'sqrt(5)', a: T`\sqrt5`, w: [T`3`, T`5`, T`1`],
            s: [T`$\nabla f=(e^y,\ xe^y)=(1,\ 2)$`, T`Màxim $=|\nabla f|=\sqrt{1+4}=\sqrt5$`] },
          { t: 'c', q: T`En un punt on $\nabla f\neq\vec0$, en quina direcció $f$ NO varia (derivada direccional 0)?`, a: T`En la direcció perpendicular a $\nabla f$ (tangent a la corba de nivell).`,
            w: [T`En la direcció de $\nabla f$.`, T`En la direcció de $-\nabla f$.`, T`En cap: sempre varia.`],
            s: [T`$D_{\vec u}f=|\nabla f|\cos\theta=0\iff\theta=90^\circ$.`] },
        ],
      },
      {
        id: 'cadmv', n: 'Cadena en diverses variables',
        r: T`\frac{dz}{dt}=\frac{\partial z}{\partial x}\frac{dx}{dt}+\frac{\partial z}{\partial y}\frac{dy}{dt}`,
        i: T`Dibuixa l'arbre de dependències: $z\to(x,y)\to t$. Suma un terme per cada camí. Al final, substitueix $x(t)$ i $y(t)$.`,
        p: [
          { t: 'd', q: T`z=x^2y,\quad x=\cos t,\ y=\sin t`, ask: T`Calcula $\frac{dz}{dt}$ en funció de $t$`, pre: T`\tfrac{dz}{dt}=`, v: ['t'], f: 'cos(t)^2*sin(t)', e: 'cos(t)^3-2*cos(t)*sin(t)^2', dom: [-2, 2],
            a: T`\cos^3t-2\cos t\sin^2t`, w: [T`\cos^3t+2\cos t\sin^2t`, T`-2\cos t\sin t`, T`2\cos t\sin t\cdot\cos t`],
            s: [T`$z_x=2xy$, $z_y=x^2$, $x'=-\sin t$, $y'=\cos t$.`, T`$2xy(-\sin t)+x^2\cos t=-2\cos t\sin^2t+\cos^3t$`] },
          { t: 'd', q: T`z=e^{xy},\quad x=t^2,\ y=\frac1t`, ask: T`Calcula $\frac{dz}{dt}$`, pre: T`\tfrac{dz}{dt}=`, v: ['t'], f: 'e^(t^2/t)', e: 'e^t', dom: [0.3, 2],
            a: T`e^t`, w: [T`2e^t`, T`e^t\left(2t-\frac{1}{t^2}\right)`, T`t\,e^t`],
            s: [T`$z_x\,x'+z_y\,y'=ye^{xy}\cdot2t+xe^{xy}\cdot\left(-\frac{1}{t^2}\right)$`, T`Amb $xy=t$: $\frac1t e^t\,2t-t^2e^t\frac{1}{t^2}=2e^t-e^t=e^t$. (Comprovació: $z=e^t$.)`] },
        ],
      },
      {
        id: 'hess', n: 'Hessiana i extrems',
        r: T`D=f_{xx}f_{yy}-f_{xy}^2:\ \ D>0,f_{xx}>0\Rightarrow\text{mín.};\ D>0,f_{xx}<0\Rightarrow\text{màx.};\ D<0\Rightarrow\text{sella}`,
        i: T`1) Punts crítics: $\nabla f=\vec0$. 2) Determinant de la hessiana en cada un. Si $D=0$, el criteri no decideix.`,
        p: [
          { t: 'c', q: T`Què és el punt $(0,0)$ per a $f(x,y)=x^2-y^2$?`, a: T`Un punt de sella.`, w: [T`Un mínim relatiu.`, T`Un màxim relatiu.`, T`No és un punt crític.`],
            s: [T`$\nabla f=(2x,-2y)=\vec0$ en $(0,0)$: és crític.`, T`$D=2\cdot(-2)-0=-4<0$: sella (puja en $x$, baixa en $y$).`] },
          { t: 'c', q: T`Punt crític de $f(x,y)=x^2+xy+y^2-3x$ i la seva naturalesa:`, a: T`$(2,-1)$, mínim relatiu.`, w: [T`$(2,-1)$, punt de sella.`, T`$(1,1)$, mínim relatiu.`, T`$(-2,1)$, màxim relatiu.`],
            s: [T`$f_x=2x+y-3=0$, $f_y=x+2y=0\Rightarrow x=2,\ y=-1$.`, T`$D=2\cdot2-1^2=3>0$ i $f_{xx}=2>0$: mínim.`] },
          { t: 'v', ask: T`Valor de $D=f_{xx}f_{yy}-f_{xy}^2$ per a $f=x^3+y^3-3xy$ en $(1,1)$`, q: T`D(1,1)`, e: '27', a: T`27`, w: [T`36`, T`45`, T`-27`],
            s: [T`$f_{xx}=6x=6$, $f_{yy}=6y=6$, $f_{xy}=-3$.`, T`$D=36-9=27>0$ i $f_{xx}>0$: mínim relatiu.`] },
        ],
      },
    ],
  },
];

const I_UNITS = [
  {
    id: 'i1', icon: '∫', name: 'Primitives immediates',
    desc: 'La taula d\'integrals que has de saber sense pensar.',
    pista: T`Integrar és derivar al revés: comprova sempre el resultat derivant-lo. I no oblidis la $+C$!`,
    items: [
      {
        id: 'ipot', n: 'Potències i 1/x',
        r: T`\int x^n\,dx=\frac{x^{n+1}}{n+1}+C\ (n\neq-1),\qquad\int\frac{dx}{x}=\ln|x|+C`,
        i: T`Desenvolupa i reescriu com a potències abans d'integrar. L'únic exponent prohibit és $-1$, que dona el logaritme.`,
        p: [
          { t: 'i', q: T`\int\left(3x^2-\frac{4}{x}+\frac{1}{x^3}\right)dx`, f: '3x^2-4/x+1/x^3', e: 'x^3-4*log(abs(x))-1/(2x^2)', dom: [0.4, 3],
            a: T`x^3-4\ln|x|-\frac{1}{2x^2}+C`, w: [T`x^3-\frac{4}{x^2}-\frac{1}{2x^2}+C`, T`x^3-4\ln|x|+\frac{1}{2x^2}+C`, T`6x+\frac{4}{x^2}-\frac{3}{x^4}+C`],
            s: [T`$\int x^{-3}dx=\dfrac{x^{-2}}{-2}=-\dfrac{1}{2x^2}$`, T`$\int\frac4x\,dx=4\ln|x|$`] },
          { t: 'i', q: T`\int\frac{(x+1)^2}{\sqrt x}\,dx`, f: '(x+1)^2/sqrt(x)', e: '2/5*x^(5/2)+4/3*x^(3/2)+2*sqrt(x)', dom: [0.3, 3],
            a: T`\frac25x^{5/2}+\frac43x^{3/2}+2\sqrt x+C`, w: [T`\frac{(x+1)^3}{3\sqrt x}+C`, T`\frac25x^{5/2}+\frac43x^{3/2}+\frac{1}{2\sqrt x}+C`, T`\frac{(x+1)^3}{3}\cdot2\sqrt x+C`],
            s: [T`Desenvolupa: $\dfrac{x^2+2x+1}{x^{1/2}}=x^{3/2}+2x^{1/2}+x^{-1/2}$`, T`$\dfrac{x^{5/2}}{5/2}+2\dfrac{x^{3/2}}{3/2}+\dfrac{x^{1/2}}{1/2}$`] },
        ],
      },
      {
        id: 'iexp', n: 'Exponencials i trigonomètriques',
        r: T`\int e^{ax}dx=\tfrac{e^{ax}}{a},\ \int a^xdx=\tfrac{a^x}{\ln a},\ \int\sin x\,dx=-\cos x,\ \int\sec^2x\,dx=\tan x`,
        i: T`Per a $\int f(ax+b)\,dx$ divideix per $a$. Fes servir identitats: $\tan^2x=\sec^2x-1$.`,
        p: [
          { t: 'i', q: T`\int\left(e^{3x}+2^x-\sin x\right)dx`, f: 'e^(3x)+2^x-sin(x)', e: 'e^(3x)/3+2^x/log(2)+cos(x)', dom: [-1, 1],
            a: T`\frac{e^{3x}}{3}+\frac{2^x}{\ln2}+\cos x+C`, w: [T`3e^{3x}+2^x\ln2-\cos x+C`, T`\frac{e^{3x}}{3}+\frac{2^{x+1}}{x+1}+\cos x+C`, T`\frac{e^{3x}}{3}+\frac{2^x}{\ln2}-\cos x+C`],
            s: [T`$\int e^{3x}=\frac{e^{3x}}{3}$, $\int2^x=\frac{2^x}{\ln2}$`, T`$\int(-\sin x)=\cos x$`] },
          { t: 'i', q: T`\int\tan^2x\,dx`, f: 'tan(x)^2', e: 'tan(x)-x', dom: [-1, 1],
            a: T`\tan x-x+C`, w: [T`\frac{\tan^3x}{3}+C`, T`\sec^2x+C`, T`\tan x+x+C`],
            s: [T`$\tan^2x=\sec^2x-1$`, T`$\int(\sec^2x-1)dx=\tan x-x+C$`] },
          { t: 'i', q: T`\int\cos(5x)\,dx`, f: 'cos(5x)', e: 'sin(5x)/5', dom: [-1, 1],
            a: T`\frac{\sin 5x}{5}+C`, w: [T`5\sin5x+C`, T`-\frac{\sin5x}{5}+C`, T`\sin5x+C`],
            s: [T`Argument lineal: divideix per 5.`, T`Comprova: $\left(\frac{\sin5x}{5}\right)'=\cos5x$ ✓`] },
        ],
      },
      {
        id: 'iarc', n: 'Arctangent i arcsinus',
        r: T`\int\frac{dx}{a^2+x^2}=\frac1a\arctan\frac xa+C,\qquad\int\frac{dx}{\sqrt{a^2-x^2}}=\arcsin\frac xa+C`,
        i: T`Si veus $1+(\text{alguna cosa})^2$ al denominador (sense $x$ al numerador), pensa en arctangent. Si hi ha arrel de $a^2-x^2$, arcsinus.`,
        p: [
          { t: 'i', q: T`\int\frac{dx}{9+x^2}`, f: '1/(9+x^2)', e: 'atan(x/3)/3', dom: [-3, 3],
            a: T`\frac13\arctan\frac x3+C`, w: [T`\arctan\frac x3+C`, T`\frac13\arctan(3x)+C`, T`\ln(9+x^2)+C`],
            s: [T`$a=3$: $\dfrac13\arctan\dfrac x3+C$`] },
          { t: 'i', q: T`\int\frac{dx}{\sqrt{4-x^2}}`, f: '1/sqrt(4-x^2)', e: 'asin(x/2)', dom: [-1.5, 1.5],
            a: T`\arcsin\frac x2+C`, w: [T`\frac12\arcsin\frac x2+C`, T`\arcsin(2x)+C`, T`-\sqrt{4-x^2}+C`],
            s: [T`$a=2$: $\arcsin\dfrac x2+C$ (aquí NO hi ha factor $\frac1a$).`] },
          { t: 'i', q: T`\int\frac{dx}{1+4x^2}`, f: '1/(1+4x^2)', e: 'atan(2x)/2', dom: [-2, 2],
            a: T`\frac12\arctan(2x)+C`, w: [T`\arctan(2x)+C`, T`2\arctan(2x)+C`, T`\frac14\arctan(2x)+C`],
            s: [T`$1+4x^2=1+(2x)^2$. Amb $u=2x$, $du=2dx$:`, T`$\frac12\int\frac{du}{1+u^2}=\frac12\arctan(2x)+C$`] },
        ],
      },
    ],
  },
  {
    id: 'i2', icon: '🔄', name: 'Canvi de variable',
    desc: 'Reconèixer la derivada de la funció interior: la tècnica més usada.',
    pista: T`Busca una funció $g(x)$ que tingui la seva derivada $g'(x)$ multiplicant (fins a una constant). Fes $u=g(x)$, $du=g'(x)\,dx$ i tot el que quedi ha de ser en $u$.`,
    items: [
      {
        id: 'flog', n: 'Forma f\'/f (logaritme)',
        r: T`\int\frac{g'(x)}{g(x)}\,dx=\ln|g(x)|+C`,
        i: T`Si el numerador és (proporcional a) la derivada del denominador.`,
        p: [
          { t: 'i', q: T`\int\frac{2x+3}{x^2+3x+5}\,dx`, f: '(2x+3)/(x^2+3x+5)', e: 'log(x^2+3x+5)', dom: [-2, 2],
            a: T`\ln(x^2+3x+5)+C`, w: [T`\ln|2x+3|+C`, T`\frac{(x^2+3x+5)^2}{2}+C`, T`\arctan(x^2+3x+5)+C`],
            s: [T`$(x^2+3x+5)'=2x+3$, exactament el numerador.`, T`$\ln|x^2+3x+5|+C$ (sempre positiu: discriminant $<0$).`] },
          { t: 'i', q: T`\int\tan x\,dx`, f: 'tan(x)', e: '-log(abs(cos(x)))', dom: [-1.2, 1.2],
            a: T`-\ln|\cos x|+C`, w: [T`\ln|\cos x|+C`, T`\sec^2x+C`, T`\frac{\tan^2x}{2}+C`],
            s: [T`$\tan x=\dfrac{\sin x}{\cos x}=-\dfrac{(\cos x)'}{\cos x}$`, T`$-\ln|\cos x|+C=\ln|\sec x|+C$`] },
          { t: 'i', q: T`\int\frac{e^x}{e^x+1}\,dx`, f: 'e^x/(e^x+1)', e: 'log(e^x+1)', dom: [-2, 2],
            a: T`\ln(e^x+1)+C`, w: [T`e^x\ln(e^x+1)+C`, T`x-\ln(e^x+1)+C`, T`\frac{1}{e^x+1}+C`],
            s: [T`$(e^x+1)'=e^x$: forma $\frac{g'}{g}$.`] },
        ],
      },
      {
        id: 'fpot', n: 'Forma gⁿ·g\'',
        r: T`\int g(x)^n\,g'(x)\,dx=\frac{g(x)^{n+1}}{n+1}+C`,
        i: T`Una potència d'una funció multiplicada per la derivada d'aquesta funció. Ajusta les constants que faltin.`,
        p: [
          { t: 'i', q: T`\int x(x^2+1)^5\,dx`, f: 'x*(x^2+1)^5', e: '(x^2+1)^6/12', dom: [-1, 1],
            a: T`\frac{(x^2+1)^6}{12}+C`, w: [T`\frac{(x^2+1)^6}{6}+C`, T`\frac{x^2(x^2+1)^6}{12}+C`, T`\frac{(x^2+1)^6}{12x}+C`],
            s: [T`$u=x^2+1$, $du=2x\,dx\Rightarrow x\,dx=\frac{du}{2}$`, T`$\frac12\int u^5du=\frac{u^6}{12}+C$`] },
          { t: 'i', q: T`\int\sin^4x\cos x\,dx`, f: 'sin(x)^4*cos(x)', e: 'sin(x)^5/5', dom: [-1.5, 1.5],
            a: T`\frac{\sin^5x}{5}+C`, w: [T`\frac{\cos^5x}{5}+C`, T`-\frac{\sin^5x}{5}+C`, T`\frac{\sin^5x\cos^2x}{10}+C`],
            s: [T`$u=\sin x$, $du=\cos x\,dx$: $\int u^4du$`] },
          { t: 'i', q: T`\int\frac{(\ln x)^2}{x}\,dx`, f: 'log(x)^2/x', e: 'log(x)^3/3', dom: [0.3, 4],
            a: T`\frac{(\ln x)^3}{3}+C`, w: [T`\frac{(\ln x)^3}{3x}+C`, T`2\ln x+C`, T`\frac{(\ln x)^2}{2}+C`],
            s: [T`$u=\ln x$, $du=\frac{dx}{x}$: $\int u^2du=\frac{u^3}{3}$`] },
        ],
      },
      {
        id: 'cv', n: 'Canvi de variable general',
        r: T`\int f(g(x))\,g'(x)\,dx=\int f(u)\,du,\qquad u=g(x)`,
        i: T`Si després del canvi encara queda $x$, aïlla-la de $u=g(x)$ (per exemple $x=u+1$). No t'oblidis de desfer el canvi.`,
        p: [
          { t: 'i', q: T`\int x\,e^{x^2}\,dx`, f: 'x*e^(x^2)', e: 'e^(x^2)/2', dom: [-1, 1],
            a: T`\frac{e^{x^2}}{2}+C`, w: [T`e^{x^2}+C`, T`\frac{x^2}{2}e^{x^2}+C`, T`2x\,e^{x^2}+C`],
            s: [T`$u=x^2$, $du=2x\,dx$: $\frac12\int e^udu$`] },
          { t: 'i', q: T`\int\frac{\cos\sqrt x}{\sqrt x}\,dx`, f: 'cos(sqrt(x))/sqrt(x)', e: '2*sin(sqrt(x))', dom: [0.3, 3],
            a: T`2\sin\sqrt x+C`, w: [T`\sin\sqrt x+C`, T`\frac{\sin\sqrt x}{2}+C`, T`-2\sin\sqrt x+C`],
            s: [T`$u=\sqrt x$, $du=\frac{dx}{2\sqrt x}\Rightarrow\frac{dx}{\sqrt x}=2\,du$`, T`$2\int\cos u\,du=2\sin u$`] },
          { t: 'i', q: T`\int x\sqrt{x-1}\,dx`, f: 'x*sqrt(x-1)', e: '2/5*(x-1)^(5/2)+2/3*(x-1)^(3/2)', dom: [1.2, 4],
            a: T`\frac25(x-1)^{5/2}+\frac23(x-1)^{3/2}+C`, w: [T`\frac23x(x-1)^{3/2}+C`, T`\frac25(x-1)^{5/2}-\frac23(x-1)^{3/2}+C`, T`\frac{x^2}{2}\cdot\frac23(x-1)^{3/2}+C`],
            s: [T`$u=x-1$, $x=u+1$: $\int(u+1)u^{1/2}du=\int(u^{3/2}+u^{1/2})du$`, T`$=\frac25u^{5/2}+\frac23u^{3/2}+C$`] },
          { t: 'i', q: T`\int\frac{e^x}{1+e^{2x}}\,dx`, f: 'e^x/(1+e^(2x))', e: 'atan(e^x)', dom: [-2, 2],
            a: T`\arctan(e^x)+C`, w: [T`\ln(1+e^{2x})+C`, T`\frac12\ln(1+e^{2x})+C`, T`\arctan(e^{2x})+C`],
            s: [T`$u=e^x$, $du=e^xdx$, $e^{2x}=u^2$: $\int\frac{du}{1+u^2}$`] },
          { t: 'i', q: T`\int\frac{dx}{x\ln x}`, f: '1/(x*log(x))', e: 'log(abs(log(x)))', dom: [1.3, 5],
            a: T`\ln|\ln x|+C`, w: [T`\frac{1}{\ln x}+C`, T`\frac{(\ln x)^2}{2}+C`, T`\ln x\cdot\ln|x|+C`],
            s: [T`$u=\ln x$, $du=\frac{dx}{x}$: $\int\frac{du}{u}=\ln|u|$`] },
        ],
      },
    ],
  },
  {
    id: 'i3', icon: '🧩', name: 'Integració per parts',
    desc: 'Productes de funcions de famílies diferents.',
    pista: T`$\int u\,dv=uv-\int v\,du$. Tria $u$ amb l'ordre ALPES: Arcs (inverses), Logaritmes, Polinomis, Exponencials, Sinus/cosinus. La $u$ és la que es simplifica en derivar.`,
    items: [
      {
        id: 'ppexp', n: 'Polinomi × exponencial',
        r: T`\int u\,dv=uv-\int v\,du,\qquad u=\text{polinomi},\ dv=e^{ax}dx`,
        i: T`El polinomi baixa de grau cada cop que el derives; l'exponencial no canvia en integrar-la.`,
        p: [
          { t: 'i', q: T`\int x\,e^x\,dx`, f: 'x*e^x', e: 'e^x*(x-1)',
            a: T`e^x(x-1)+C`, w: [T`\frac{x^2}{2}e^x+C`, T`e^x(x+1)+C`, T`xe^x+C`],
            s: [T`$u=x$, $dv=e^xdx\Rightarrow du=dx$, $v=e^x$`, T`$xe^x-\int e^xdx=xe^x-e^x+C$`] },
          { t: 'i', q: T`\int x\,e^{-2x}\,dx`, f: 'x*e^(-2x)', e: '-e^(-2x)*(2x+1)/4',
            a: T`-\frac{e^{-2x}(2x+1)}{4}+C`, w: [T`-\frac{e^{-2x}(2x-1)}{4}+C`, T`\frac{e^{-2x}(2x+1)}{4}+C`, T`-\frac{x^2e^{-2x}}{4}+C`],
            s: [T`$u=x$, $v=-\frac{e^{-2x}}{2}$`, T`$-\frac{xe^{-2x}}{2}+\frac12\int e^{-2x}dx=-\frac{xe^{-2x}}{2}-\frac{e^{-2x}}{4}$`] },
        ],
      },
      {
        id: 'pptrig', n: 'Polinomi × trigonomètrica',
        r: T`u=\text{polinomi},\quad dv=\sin(ax)\,dx\ \text{o}\ \cos(ax)\,dx`,
        i: T`Igual que amb l'exponencial. Compte amb els signes: $\int\sin=-\cos$.`,
        p: [
          { t: 'i', q: T`\int x\cos x\,dx`, f: 'x*cos(x)', e: 'x*sin(x)+cos(x)',
            a: T`x\sin x+\cos x+C`, w: [T`x\sin x-\cos x+C`, T`\frac{x^2}{2}\sin x+C`, T`-x\sin x+\cos x+C`],
            s: [T`$u=x$, $v=\sin x$`, T`$x\sin x-\int\sin x\,dx=x\sin x+\cos x+C$`] },
          { t: 'i', q: T`\int x\sin(3x)\,dx`, f: 'x*sin(3x)', e: '-x*cos(3x)/3+sin(3x)/9',
            a: T`-\frac{x\cos3x}{3}+\frac{\sin3x}{9}+C`, w: [T`-\frac{x\cos3x}{3}-\frac{\sin3x}{9}+C`, T`\frac{x\cos3x}{3}+\frac{\sin3x}{9}+C`, T`-x\cos3x+\sin3x+C`],
            s: [T`$u=x$, $v=-\frac{\cos3x}{3}$`, T`$-\frac{x\cos3x}{3}+\frac13\int\cos3x\,dx=-\frac{x\cos3x}{3}+\frac{\sin3x}{9}$`] },
        ],
      },
      {
        id: 'pplog', n: 'Logaritmes i inverses',
        r: T`\int\ln x\,dx:\quad u=\ln x,\ dv=dx`,
        i: T`Si hi ha un logaritme o una funció inversa (arctan, arcsin), aquesta és la $u$: la seva derivada és algebraica i molt més fàcil. Encara que no hi hagi cap altre factor, fes $dv=dx$.`,
        p: [
          { t: 'i', q: T`\int\ln x\,dx`, f: 'log(x)', e: 'x*log(x)-x', dom: [0.3, 4],
            a: T`x\ln x-x+C`, w: [T`\frac1x+C`, T`x\ln x+x+C`, T`\frac{(\ln x)^2}{2}+C`],
            s: [T`$u=\ln x$, $dv=dx\Rightarrow du=\frac{dx}{x}$, $v=x$`, T`$x\ln x-\int x\cdot\frac1x\,dx=x\ln x-x+C$`] },
          { t: 'i', q: T`\int\arctan x\,dx`, f: 'atan(x)', e: 'x*atan(x)-log(1+x^2)/2', dom: [-2, 2],
            a: T`x\arctan x-\frac12\ln(1+x^2)+C`, w: [T`x\arctan x+\frac12\ln(1+x^2)+C`, T`\frac{1}{1+x^2}+C`, T`x\arctan x-\ln(1+x^2)+C`],
            s: [T`$u=\arctan x$, $v=x$: $x\arctan x-\int\frac{x}{1+x^2}dx$`, T`L'última és $f'/f$: $\frac12\ln(1+x^2)$`] },
          { t: 'i', q: T`\int x\ln x\,dx`, f: 'x*log(x)', e: 'x^2*log(x)/2-x^2/4', dom: [0.3, 4],
            a: T`\frac{x^2\ln x}{2}-\frac{x^2}{4}+C`, w: [T`\frac{x^2\ln x}{2}+\frac{x^2}{4}+C`, T`\frac{x^2\ln x}{2}-\frac{x^2}{2}+C`, T`x\ln x-x+C`],
            s: [T`$u=\ln x$, $dv=x\,dx\Rightarrow v=\frac{x^2}{2}$`, T`$\frac{x^2\ln x}{2}-\int\frac{x^2}{2}\cdot\frac1x\,dx=\frac{x^2\ln x}{2}-\frac{x^2}{4}$`] },
        ],
      },
      {
        id: 'pprei', n: 'Parts reiterada',
        r: T`\int x^n e^x\,dx\ \to\ n\ \text{vegades per parts}`,
        i: T`Quan el polinomi és de grau 2 o més. Truc ràpid (mètode tabular): alterna signes $+,-,+$ multiplicant les derivades de $u$ per les primitives successives de $dv$.`,
        p: [
          { t: 'i', q: T`\int x^2e^x\,dx`, f: 'x^2*e^x', e: 'e^x*(x^2-2x+2)',
            a: T`e^x(x^2-2x+2)+C`, w: [T`e^x(x^2+2x+2)+C`, T`e^x(x^2-2x)+C`, T`\frac{x^3}{3}e^x+C`],
            s: [T`Tabular: derivades de $x^2$: $x^2,\,2x,\,2,\,0$; primitives de $e^x$: $e^x$.`, T`$+x^2e^x-2xe^x+2e^x$`] },
          { t: 'i', q: T`\int x^2\sin x\,dx`, f: 'x^2*sin(x)', e: '-x^2*cos(x)+2x*sin(x)+2cos(x)',
            a: T`-x^2\cos x+2x\sin x+2\cos x+C`, w: [T`-x^2\cos x+2x\sin x-2\cos x+C`, T`x^2\cos x-2x\sin x-2\cos x+C`, T`-x^2\cos x+2\cos x+C`],
            s: [T`Derivades: $x^2,2x,2$. Primitives de $\sin x$: $-\cos x,\,-\sin x,\,\cos x$.`, T`$+x^2(-\cos x)-2x(-\sin x)+2\cos x$`] },
          { t: 'i', q: T`\int(\ln x)^2\,dx`, f: 'log(x)^2', e: 'x*log(x)^2-2x*log(x)+2x', dom: [0.3, 4],
            a: T`x(\ln x)^2-2x\ln x+2x+C`, w: [T`x(\ln x)^2-2x\ln x+C`, T`\frac{(\ln x)^3}{3}+C`, T`x(\ln x)^2+2x\ln x+2x+C`],
            s: [T`$u=(\ln x)^2$, $v=x$: $x(\ln x)^2-\int2\ln x\,dx$`, T`$\int\ln x=x\ln x-x$, per tant $x(\ln x)^2-2x\ln x+2x$`] },
        ],
      },
      {
        id: 'ppcic', n: 'Parts cíclica',
        r: T`I=\int e^{ax}\sin(bx)\,dx\ \to\ I=(\dots)-k\,I\ \Rightarrow\ I=\frac{(\dots)}{1+k}`,
        i: T`Quan després de dues vegades per parts torna a sortir la integral original. No la resolguis: aïlla-la com si fos una incògnita.`,
        p: [
          { t: 'i', q: T`\int e^x\sin x\,dx`, f: 'e^x*sin(x)', e: 'e^x*(sin(x)-cos(x))/2',
            a: T`\frac{e^x(\sin x-\cos x)}{2}+C`, w: [T`\frac{e^x(\sin x+\cos x)}{2}+C`, T`-e^x\cos x+C`, T`\frac{e^x(\cos x-\sin x)}{2}+C`],
            s: [T`$I=-e^x\cos x+\int e^x\cos x\,dx=-e^x\cos x+e^x\sin x-I$`, T`$2I=e^x(\sin x-\cos x)$`] },
          { t: 'i', q: T`\int e^{2x}\cos x\,dx`, f: 'e^(2x)*cos(x)', e: 'e^(2x)*(2cos(x)+sin(x))/5',
            a: T`\frac{e^{2x}(2\cos x+\sin x)}{5}+C`, w: [T`\frac{e^{2x}(2\sin x+\cos x)}{5}+C`, T`\frac{e^{2x}(2\cos x+\sin x)}{3}+C`, T`\frac{e^{2x}\sin x}{2}+C`],
            s: [T`$u=e^{2x}$: $I=e^{2x}\sin x-2\int e^{2x}\sin x\,dx$`, T`$\int e^{2x}\sin x=-e^{2x}\cos x+2I$`, T`$I=e^{2x}\sin x+2e^{2x}\cos x-4I\Rightarrow5I=e^{2x}(\sin x+2\cos x)$`] },
          { t: 'i', q: T`\int\sec^3x\,dx`, f: 'sec(x)^3', e: '(sec(x)*tan(x)+log(abs(sec(x)+tan(x))))/2', dom: [-1.2, 1.2],
            a: T`\frac{\sec x\tan x+\ln|\sec x+\tan x|}{2}+C`, w: [T`\sec x\tan x+\ln|\sec x+\tan x|+C`, T`\frac{\sec x\tan x-\ln|\sec x+\tan x|}{2}+C`, T`\frac{\sec^4x}{4}+C`],
            s: [T`$u=\sec x$, $dv=\sec^2x\,dx$: $I=\sec x\tan x-\int\sec x\tan^2x\,dx$`, T`$\tan^2x=\sec^2x-1$: $I=\sec x\tan x-I+\int\sec x\,dx$`, T`$2I=\sec x\tan x+\ln|\sec x+\tan x|$`] },
        ],
      },
    ],
  },
  {
    id: 'i4', icon: '➗', name: 'Funcions racionals',
    desc: 'Descomposició en fraccions simples: el procediment sistemàtic.',
    pista: T`1) Si grau(num) ≥ grau(den), divideix. 2) Factoritza el denominador. 3) Descompon: $\frac{A}{x-a}$ per arrel simple, $\frac{A}{x-a}+\frac{B}{(x-a)^2}$ per doble, $\frac{Bx+C}{x^2+px+q}$ per quadràtic irreductible.`,
    items: [
      {
        id: 'rsim', n: 'Arrels reals simples',
        r: T`\frac{P(x)}{(x-a)(x-b)}=\frac{A}{x-a}+\frac{B}{x-b}\ \Rightarrow\ A\ln|x-a|+B\ln|x-b|`,
        i: T`Per trobar $A$: tapa $(x-a)$ i avalua la resta en $x=a$ (mètode de Heaviside).`,
        p: [
          { t: 'i', q: T`\int\frac{dx}{x^2-1}`, f: '1/(x^2-1)', e: 'log(abs((x-1)/(x+1)))/2', dom: [1.3, 4],
            a: T`\frac12\ln\left|\frac{x-1}{x+1}\right|+C`, w: [T`\frac12\ln\left|\frac{x+1}{x-1}\right|+C`, T`\ln|x^2-1|+C`, T`\ln|x-1|-\ln|x+1|+C`],
            s: [T`$\dfrac{1}{(x-1)(x+1)}=\dfrac{1/2}{x-1}-\dfrac{1/2}{x+1}$`, T`$\frac12\ln|x-1|-\frac12\ln|x+1|$`] },
          { t: 'i', q: T`\int\frac{5x-1}{x^2-x-2}\,dx`, f: '(5x-1)/(x^2-x-2)', e: '3*log(abs(x-2))+2*log(abs(x+1))', dom: [2.3, 5],
            a: T`3\ln|x-2|+2\ln|x+1|+C`, w: [T`2\ln|x-2|+3\ln|x+1|+C`, T`3\ln|x+2|+2\ln|x-1|+C`, T`\frac52\ln|x^2-x-2|+C`],
            s: [T`$x^2-x-2=(x-2)(x+1)$`, T`$5x-1=A(x+1)+B(x-2)$. $x=2$: $9=3A$, $A=3$. $x=-1$: $-6=-3B$, $B=2$.`] },
          { t: 'i', q: T`\int\frac{x\,dx}{(x-1)(x-3)}`, f: 'x/((x-1)*(x-3))', e: '-log(abs(x-1))/2+3*log(abs(x-3))/2', dom: [3.3, 6],
            a: T`-\frac12\ln|x-1|+\frac32\ln|x-3|+C`, w: [T`\frac12\ln|x-1|+\frac32\ln|x-3|+C`, T`\frac32\ln|x-1|-\frac12\ln|x-3|+C`, T`\ln|x-1|+\ln|x-3|+C`],
            s: [T`$x=1$: $A=\frac{1}{1-3}=-\frac12$. $x=3$: $B=\frac{3}{3-1}=\frac32$.`] },
        ],
      },
      {
        id: 'rmul', n: 'Arrels múltiples',
        r: T`\frac{P(x)}{(x-a)^2}=\frac{A}{x-a}+\frac{B}{(x-a)^2},\qquad\int\frac{dx}{(x-a)^2}=-\frac{1}{x-a}`,
        i: T`Una arrel de multiplicitat $k$ genera $k$ fraccions, amb potències $1,2,\dots,k$. Les potències $\ge2$ s'integren com a potències, no com a logaritmes.`,
        p: [
          { t: 'i', q: T`\int\frac{dx}{x(x-1)^2}`, f: '1/(x*(x-1)^2)', e: 'log(abs(x))-log(abs(x-1))-1/(x-1)', dom: [1.3, 4],
            a: T`\ln|x|-\ln|x-1|-\frac{1}{x-1}+C`, w: [T`\ln|x|-\ln|x-1|+\frac{1}{x-1}+C`, T`\ln|x|+\ln|x-1|-\frac{1}{x-1}+C`, T`\ln|x|-\frac{1}{x-1}+C`],
            s: [T`$\dfrac{A}{x}+\dfrac{B}{x-1}+\dfrac{C}{(x-1)^2}$; $1=A(x-1)^2+Bx(x-1)+Cx$`, T`$x=0$: $A=1$. $x=1$: $C=1$. Coef. de $x^2$: $A+B=0\Rightarrow B=-1$.`] },
          { t: 'i', q: T`\int\frac{x+2}{(x-1)^2}\,dx`, f: '(x+2)/(x-1)^2', e: 'log(abs(x-1))-3/(x-1)', dom: [1.3, 4],
            a: T`\ln|x-1|-\frac{3}{x-1}+C`, w: [T`\ln|x-1|+\frac{3}{x-1}+C`, T`\ln|x-1|-\frac{3}{(x-1)^2}+C`, T`-\frac{x+2}{x-1}+C`],
            s: [T`$x+2=(x-1)+3$: $\dfrac{1}{x-1}+\dfrac{3}{(x-1)^2}$`, T`$\ln|x-1|-\dfrac{3}{x-1}+C$`] },
        ],
      },
      {
        id: 'rquad', n: 'Quadràtics irreductibles',
        r: T`\int\frac{dx}{(x-p)^2+q^2}=\frac1q\arctan\frac{x-p}{q}+C`,
        i: T`Completa el quadrat al denominador. Si hi ha $x$ al numerador, separa la part que és $f'/f$ (logaritme) i la resta (arctangent).`,
        p: [
          { t: 'i', q: T`\int\frac{dx}{x^2+2x+5}`, f: '1/(x^2+2x+5)', e: 'atan((x+1)/2)/2', dom: [-3, 2],
            a: T`\frac12\arctan\frac{x+1}{2}+C`, w: [T`\arctan\frac{x+1}{2}+C`, T`\frac12\arctan(x+1)+C`, T`\ln(x^2+2x+5)+C`],
            s: [T`$x^2+2x+5=(x+1)^2+4$`, T`$\frac12\arctan\frac{x+1}{2}+C$`] },
          { t: 'i', q: T`\int\frac{2x+3}{x^2+1}\,dx`, f: '(2x+3)/(x^2+1)', e: 'log(x^2+1)+3*atan(x)', dom: [-2, 2],
            a: T`\ln(x^2+1)+3\arctan x+C`, w: [T`2\ln(x^2+1)+3\arctan x+C`, T`\ln(x^2+1)+\frac32\arctan x+C`, T`(2x+3)\arctan x+C`],
            s: [T`Separa: $\dfrac{2x}{x^2+1}+\dfrac{3}{x^2+1}$`, T`$\ln(x^2+1)+3\arctan x+C$`] },
          { t: 'i', q: T`\int\frac{dx}{x^3+x}`, f: '1/(x^3+x)', e: 'log(abs(x))-log(x^2+1)/2', dom: [0.4, 3],
            a: T`\ln|x|-\frac12\ln(x^2+1)+C`, w: [T`\ln|x|-\ln(x^2+1)+C`, T`\ln|x|-\arctan x+C`, T`\ln|x^3+x|+C`],
            s: [T`$\dfrac{1}{x(x^2+1)}=\dfrac{A}{x}+\dfrac{Bx+C}{x^2+1}$: $A=1$, $B=-1$, $C=0$.`, T`$\ln|x|-\frac12\ln(x^2+1)+C$`] },
        ],
      },
      {
        id: 'rdiv', n: 'Divisió prèvia',
        r: T`\frac{P(x)}{Q(x)}=C(x)+\frac{R(x)}{Q(x)},\quad\operatorname{gr}R<\operatorname{gr}Q`,
        i: T`Si el grau del numerador és igual o més gran que el del denominador, fes primer la divisió de polinomis.`,
        p: [
          { t: 'i', q: T`\int\frac{x^2}{x+1}\,dx`, f: 'x^2/(x+1)', e: 'x^2/2-x+log(abs(x+1))', dom: [0.2, 3],
            a: T`\frac{x^2}{2}-x+\ln|x+1|+C`, w: [T`\frac{x^2}{2}+x+\ln|x+1|+C`, T`\frac{x^2}{2}-x-\ln|x+1|+C`, T`\frac{x^3}{3(x+1)}+C`],
            s: [T`$x^2=(x+1)(x-1)+1$, per tant $\dfrac{x^2}{x+1}=x-1+\dfrac{1}{x+1}$`] },
          { t: 'i', q: T`\int\frac{x^3+x+1}{x^2+1}\,dx`, f: '(x^3+x+1)/(x^2+1)', e: 'x^2/2+atan(x)', dom: [-2, 2],
            a: T`\frac{x^2}{2}+\arctan x+C`, w: [T`\frac{x^2}{2}+\ln(x^2+1)+C`, T`\frac{x^2}{2}-\arctan x+C`, T`\frac{x^2}{2}+\frac12\ln(x^2+1)+C`],
            s: [T`$x^3+x=x(x^2+1)$: $\dfrac{x^3+x+1}{x^2+1}=x+\dfrac{1}{x^2+1}$`] },
        ],
      },
    ],
  },
  {
    id: 'i5', icon: '〰️', name: 'Integrals trigonomètriques',
    desc: 'Potències de sinus i cosinus, tangents, productes i el canvi universal.',
    pista: T`Potència senar → separa'n una i passa la resta amb $\sin^2+\cos^2=1$. Totes parells → angle doble: $\sin^2x=\frac{1-\cos2x}{2}$, $\cos^2x=\frac{1+\cos2x}{2}$. Últim recurs: $t=\tan\frac x2$.`,
    items: [
      {
        id: 'tsen', n: 'Potència senar',
        r: T`\int\sin^{2k+1}x\,\cos^mx\,dx:\ \ u=\cos x,\ \ \sin^2x=1-u^2`,
        i: T`Si el sinus té potència senar, guarda'n un per a $du$ i fes $u=\cos x$ (i a l'inrevés si és el cosinus el senar).`,
        p: [
          { t: 'i', q: T`\int\sin^3x\,dx`, f: 'sin(x)^3', e: '-cos(x)+cos(x)^3/3', dom: [-1.5, 1.5],
            a: T`-\cos x+\frac{\cos^3x}{3}+C`, w: [T`\frac{\sin^4x}{4}+C`, T`\cos x-\frac{\cos^3x}{3}+C`, T`-\cos x-\frac{\cos^3x}{3}+C`],
            s: [T`$\sin^3x=(1-\cos^2x)\sin x$; $u=\cos x$, $du=-\sin x\,dx$`, T`$-\int(1-u^2)du=-u+\frac{u^3}{3}$`] },
          { t: 'i', q: T`\int\sin^2x\cos^3x\,dx`, f: 'sin(x)^2*cos(x)^3', e: 'sin(x)^3/3-sin(x)^5/5', dom: [-1.5, 1.5],
            a: T`\frac{\sin^3x}{3}-\frac{\sin^5x}{5}+C`, w: [T`\frac{\sin^3x}{3}+\frac{\sin^5x}{5}+C`, T`-\frac{\cos^3x}{3}+\frac{\cos^5x}{5}+C`, T`\frac{\sin^3x\cos^4x}{12}+C`],
            s: [T`Cosinus senar: $\cos^3x=(1-\sin^2x)\cos x$, $u=\sin x$`, T`$\int u^2(1-u^2)du=\frac{u^3}{3}-\frac{u^5}{5}$`] },
        ],
      },
      {
        id: 'tpar', n: 'Potències parelles',
        r: T`\sin^2x=\frac{1-\cos2x}{2},\qquad\cos^2x=\frac{1+\cos2x}{2}`,
        i: T`Si totes les potències són parelles, redueix el grau amb l'angle doble (tantes vegades com calgui).`,
        p: [
          { t: 'i', q: T`\int\cos^2x\,dx`, f: 'cos(x)^2', e: 'x/2+sin(2x)/4', dom: [-1.5, 1.5],
            a: T`\frac x2+\frac{\sin2x}{4}+C`, w: [T`\frac{\cos^3x}{3}+C`, T`\frac x2-\frac{\sin2x}{4}+C`, T`\frac x2+\frac{\sin2x}{2}+C`],
            s: [T`$\int\frac{1+\cos2x}{2}dx=\frac x2+\frac{\sin2x}{4}$`] },
          { t: 'i', q: T`\int\sin^2x\cos^2x\,dx`, f: 'sin(x)^2*cos(x)^2', e: 'x/8-sin(4x)/32', dom: [-1.5, 1.5],
            a: T`\frac x8-\frac{\sin4x}{32}+C`, w: [T`\frac x8+\frac{\sin4x}{32}+C`, T`\frac{\sin^3x\cos^3x}{9}+C`, T`\frac x4-\frac{\sin4x}{16}+C`],
            s: [T`$\sin x\cos x=\frac{\sin2x}{2}\Rightarrow\sin^2x\cos^2x=\frac{\sin^22x}{4}=\frac{1-\cos4x}{8}$`, T`$\frac x8-\frac{\sin4x}{32}$`] },
          { t: 'i', q: T`\int\sin^4x\,dx`, f: 'sin(x)^4', e: '3x/8-sin(2x)/4+sin(4x)/32', dom: [-1.5, 1.5],
            a: T`\frac{3x}{8}-\frac{\sin2x}{4}+\frac{\sin4x}{32}+C`, w: [T`\frac{\sin^5x}{5}+C`, T`\frac{3x}{8}+\frac{\sin2x}{4}+\frac{\sin4x}{32}+C`, T`\frac{3x}{8}-\frac{\sin2x}{4}-\frac{\sin4x}{32}+C`],
            s: [T`$\sin^4x=\left(\frac{1-\cos2x}{2}\right)^2=\frac14(1-2\cos2x+\cos^22x)$`, T`$\cos^22x=\frac{1+\cos4x}{2}$: $\sin^4x=\frac38-\frac{\cos2x}{2}+\frac{\cos4x}{8}$`] },
        ],
      },
      {
        id: 'ttan', n: 'Tangents i secants',
        r: T`\int\tan^mx\sec^2x\,dx\ (u=\tan x),\qquad\int\sec x\,dx=\ln|\sec x+\tan x|+C`,
        i: T`Si hi ha un $\sec^2x$ disponible, $u=\tan x$. Si no, fes servir $\tan^2x=\sec^2x-1$ per crear-lo.`,
        p: [
          { t: 'i', q: T`\int\tan^3x\sec^2x\,dx`, f: 'tan(x)^3*sec(x)^2', e: 'tan(x)^4/4', dom: [-1.2, 1.2],
            a: T`\frac{\tan^4x}{4}+C`, w: [T`\frac{\sec^4x}{4}+\tan x+C`, T`\frac{\tan^4x}{4}+\tan x+C`, T`3\tan^2x\sec^2x+C`],
            s: [T`$u=\tan x$, $du=\sec^2x\,dx$: $\int u^3du$`] },
          { t: 'i', q: T`\int\sec x\,dx`, f: 'sec(x)', e: 'log(abs(sec(x)+tan(x)))', dom: [-1.2, 1.2],
            a: T`\ln|\sec x+\tan x|+C`, w: [T`\sec x\tan x+C`, T`\ln|\sec x|+C`, T`\frac{\sec^2x}{2}+C`],
            s: [T`Truc: multiplica i divideix per $\sec x+\tan x$.`, T`$\int\dfrac{\sec^2x+\sec x\tan x}{\sec x+\tan x}dx$: el numerador és la derivada del denominador.`] },
          { t: 'i', q: T`\int\tan^3x\,dx`, f: 'tan(x)^3', e: 'tan(x)^2/2+log(abs(cos(x)))', dom: [-1.2, 1.2],
            a: T`\frac{\tan^2x}{2}+\ln|\cos x|+C`, w: [T`\frac{\tan^4x}{4}+C`, T`\frac{\tan^2x}{2}-\ln|\cos x|+C`, T`\tan x-x+C`],
            s: [T`$\tan^3x=\tan x(\sec^2x-1)=\tan x\sec^2x-\tan x$`, T`$\frac{\tan^2x}{2}-(-\ln|\cos x|)$`] },
        ],
      },
      {
        id: 'tprod', n: 'Producte a suma',
        r: T`\sin A\cos B=\tfrac12[\sin(A-B)+\sin(A+B)],\ \cos A\cos B=\tfrac12[\cos(A-B)+\cos(A+B)]`,
        i: T`Per a productes de sinus/cosinus amb arguments diferents ($3x$ i $x$). També: $\sin A\sin B=\frac12[\cos(A-B)-\cos(A+B)]$.`,
        p: [
          { t: 'i', q: T`\int\sin3x\cos x\,dx`, f: 'sin(3x)*cos(x)', e: '-cos(2x)/4-cos(4x)/8', dom: [-1.5, 1.5],
            a: T`-\frac{\cos2x}{4}-\frac{\cos4x}{8}+C`, w: [T`\frac{\cos2x}{4}+\frac{\cos4x}{8}+C`, T`-\frac{\cos2x}{2}-\frac{\cos4x}{4}+C`, T`-\frac{\cos3x\sin x}{3}+C`],
            s: [T`$\sin3x\cos x=\frac12(\sin2x+\sin4x)$`, T`$\frac12\left(-\frac{\cos2x}{2}-\frac{\cos4x}{4}\right)$`] },
          { t: 'i', q: T`\int\cos5x\cos3x\,dx`, f: 'cos(5x)*cos(3x)', e: 'sin(2x)/4+sin(8x)/16', dom: [-1.5, 1.5],
            a: T`\frac{\sin2x}{4}+\frac{\sin8x}{16}+C`, w: [T`\frac{\sin2x}{4}-\frac{\sin8x}{16}+C`, T`\frac{\sin2x}{2}+\frac{\sin8x}{8}+C`, T`\frac{\sin5x\sin3x}{15}+C`],
            s: [T`$\cos5x\cos3x=\frac12(\cos2x+\cos8x)$`, T`$\frac12\left(\frac{\sin2x}{2}+\frac{\sin8x}{8}\right)$`] },
        ],
      },
      {
        id: 'tweier', n: 'Canvi universal t = tan(x/2)',
        r: T`t=\tan\tfrac x2:\ \ \sin x=\tfrac{2t}{1+t^2},\ \cos x=\tfrac{1-t^2}{1+t^2},\ dx=\tfrac{2\,dt}{1+t^2}`,
        i: T`Converteix qualsevol racional en $\sin x$ i $\cos x$ en una racional en $t$. Funciona sempre, però sovint és llarg: usa'l si res més funciona.`,
        p: [
          { t: 'i', q: T`\int\frac{dx}{1+\cos x}`, f: '1/(1+cos(x))', e: 'tan(x/2)', dom: [-2, 2],
            a: T`\tan\frac x2+C`, w: [T`\ln(1+\cos x)+C`, T`-\tan\frac x2+C`, T`\frac12\tan\frac x2+C`],
            s: [T`$1+\cos x=\frac{2}{1+t^2}$; $\int\frac{1+t^2}{2}\cdot\frac{2dt}{1+t^2}=\int dt=t$`] },
          { t: 'i', q: T`\int\frac{dx}{\sin x}`, f: '1/sin(x)', e: 'log(abs(tan(x/2)))', dom: [0.3, 2.8],
            a: T`\ln\left|\tan\frac x2\right|+C`, w: [T`\ln|\sin x|+C`, T`-\cot x+C`, T`\ln|\tan x|+C`],
            s: [T`$\int\frac{1+t^2}{2t}\cdot\frac{2dt}{1+t^2}=\int\frac{dt}{t}=\ln|t|$`] },
          { t: 'i', q: T`\int\frac{dx}{2+\cos x}`, f: '1/(2+cos(x))', e: '2/sqrt(3)*atan(tan(x/2)/sqrt(3))', dom: [-2.5, 2.5],
            a: T`\frac{2}{\sqrt3}\arctan\frac{\tan(x/2)}{\sqrt3}+C`, w: [T`\arctan\frac{\tan(x/2)}{\sqrt3}+C`, T`\frac{1}{\sqrt3}\arctan\frac{\tan(x/2)}{\sqrt3}+C`, T`\ln(2+\cos x)+C`],
            s: [T`$2+\cos x=\frac{3+t^2}{1+t^2}$, per tant $\int\frac{2\,dt}{3+t^2}$`, T`$=\frac{2}{\sqrt3}\arctan\frac{t}{\sqrt3}$`] },
        ],
      },
    ],
  },
  {
    id: 'i6', icon: '√', name: 'Funcions irracionals',
    desc: 'Substitucions trigonomètriques i hiperbòliques per a arrels.',
    pista: T`$\sqrt{a^2-x^2}\to x=a\sin\theta$ · $\sqrt{a^2+x^2}\to x=a\tan\theta$ (o $a\sinh t$) · $\sqrt{x^2-a^2}\to x=a\sec\theta$ (o $a\cosh t$). L'objectiu: que l'arrel desaparegui amb una identitat.`,
    items: [
      {
        id: 'sqa2mx2', n: 'Arrel de a² − x²',
        r: T`x=a\sin\theta,\ dx=a\cos\theta\,d\theta,\ \sqrt{a^2-x^2}=a\cos\theta`,
        i: T`Al final, desfés el canvi amb un triangle: $\sin\theta=\frac xa$, $\cos\theta=\frac{\sqrt{a^2-x^2}}{a}$.`,
        p: [
          { t: 'i', q: T`\int\sqrt{1-x^2}\,dx`, f: 'sqrt(1-x^2)', e: '(x*sqrt(1-x^2)+asin(x))/2', dom: [-0.9, 0.9],
            a: T`\frac{x\sqrt{1-x^2}+\arcsin x}{2}+C`, w: [T`x\sqrt{1-x^2}+\arcsin x+C`, T`\frac{\arcsin x}{2}+C`, T`-\frac{(1-x^2)^{3/2}}{3}+C`],
            s: [T`$x=\sin\theta$: $\int\cos^2\theta\,d\theta=\frac\theta2+\frac{\sin2\theta}{4}=\frac{\theta+\sin\theta\cos\theta}{2}$`, T`$\theta=\arcsin x$, $\sin\theta\cos\theta=x\sqrt{1-x^2}$`] },
          { t: 'i', q: T`\int\frac{x^2}{\sqrt{4-x^2}}\,dx`, f: 'x^2/sqrt(4-x^2)', e: '2*asin(x/2)-x*sqrt(4-x^2)/2', dom: [-1.8, 1.8],
            a: T`2\arcsin\frac x2-\frac{x\sqrt{4-x^2}}{2}+C`, w: [T`2\arcsin\frac x2+\frac{x\sqrt{4-x^2}}{2}+C`, T`-x\sqrt{4-x^2}+C`, T`\frac{x^3}{3}\arcsin\frac x2+C`],
            s: [T`$x=2\sin\theta$: $\int\frac{4\sin^2\theta\cdot2\cos\theta}{2\cos\theta}d\theta=\int4\sin^2\theta\,d\theta=2\theta-\sin2\theta$`, T`$\sin2\theta=2\cdot\frac x2\cdot\frac{\sqrt{4-x^2}}{2}=\frac{x\sqrt{4-x^2}}{2}$`] },
          { t: 'i', q: T`\int\frac{dx}{(1-x^2)^{3/2}}`, f: '(1-x^2)^(-3/2)', e: 'x/sqrt(1-x^2)', dom: [-0.9, 0.9],
            a: T`\frac{x}{\sqrt{1-x^2}}+C`, w: [T`\arcsin x+C`, T`\frac{1}{\sqrt{1-x^2}}+C`, T`-\frac{x}{\sqrt{1-x^2}}+C`],
            s: [T`$x=\sin\theta$: $\int\frac{\cos\theta}{\cos^3\theta}d\theta=\int\sec^2\theta\,d\theta=\tan\theta$`, T`$\tan\theta=\frac{x}{\sqrt{1-x^2}}$`] },
        ],
      },
      {
        id: 'sqa2px2', n: 'Arrel de a² + x²',
        r: T`x=a\tan\theta\ \ \text{o}\ \ x=a\sinh t;\qquad\int\frac{dx}{\sqrt{x^2+a^2}}=\ln\left(x+\sqrt{x^2+a^2}\right)+C`,
        i: T`Amb $x=a\sinh t$: $\sqrt{x^2+a^2}=a\cosh t$. Amb $x=a\tan\theta$: $\sqrt{x^2+a^2}=a\sec\theta$.`,
        p: [
          { t: 'i', q: T`\int\frac{dx}{\sqrt{x^2+9}}`, f: '1/sqrt(x^2+9)', e: 'log(x+sqrt(x^2+9))', dom: [-2, 3],
            a: T`\ln\left(x+\sqrt{x^2+9}\right)+C`, w: [T`\arctan\frac x3+C`, T`\frac13\ln\left(x+\sqrt{x^2+9}\right)+C`, T`\arcsin\frac x3+C`],
            s: [T`$x=3\sinh t$: $\int\frac{3\cosh t}{3\cosh t}dt=t=\operatorname{argsinh}\frac x3$`, T`$=\ln\left(\frac x3+\sqrt{\frac{x^2}{9}+1}\right)=\ln(x+\sqrt{x^2+9})-\ln3$, i el $\ln 3$ va a la constant.`] },
          { t: 'i', q: T`\int\frac{dx}{(x^2+1)^{3/2}}`, f: '(x^2+1)^(-3/2)', e: 'x/sqrt(x^2+1)', dom: [-2, 2],
            a: T`\frac{x}{\sqrt{x^2+1}}+C`, w: [T`\arctan x+C`, T`-\frac{1}{\sqrt{x^2+1}}+C`, T`-\frac{x}{\sqrt{x^2+1}}+C`],
            s: [T`$x=\tan\theta$: $\int\frac{\sec^2\theta}{\sec^3\theta}d\theta=\int\cos\theta\,d\theta=\sin\theta$`, T`$\sin\theta=\frac{x}{\sqrt{x^2+1}}$`] },
          { t: 'i', q: T`\int\frac{x^3}{\sqrt{x^2+1}}\,dx`, f: 'x^3/sqrt(x^2+1)', e: '(x^2+1)^(3/2)/3-sqrt(x^2+1)', dom: [-2, 2],
            a: T`\frac{(x^2+1)^{3/2}}{3}-\sqrt{x^2+1}+C`, w: [T`\frac{(x^2+1)^{3/2}}{3}+\sqrt{x^2+1}+C`, T`\frac{x^4}{4\sqrt{x^2+1}}+C`, T`x^2\sqrt{x^2+1}+C`],
            s: [T`Aquí n'hi ha prou amb $u=x^2+1$: $x^3dx=x^2\cdot x\,dx=(u-1)\frac{du}{2}$`, T`$\frac12\int(u^{1/2}-u^{-1/2})du=\frac{u^{3/2}}{3}-u^{1/2}$`] },
        ],
      },
      {
        id: 'sqx2ma2', n: 'Arrel de x² − a²',
        r: T`x=a\sec\theta\ \ \text{o}\ \ x=a\cosh t;\qquad\int\frac{dx}{\sqrt{x^2-a^2}}=\ln\left|x+\sqrt{x^2-a^2}\right|+C`,
        i: T`$\sec^2\theta-1=\tan^2\theta$ i $\cosh^2t-1=\sinh^2t$ eliminen l'arrel.`,
        p: [
          { t: 'i', q: T`\int\frac{dx}{\sqrt{x^2-4}}`, f: '1/sqrt(x^2-4)', e: 'log(abs(x+sqrt(x^2-4)))', dom: [2.3, 5],
            a: T`\ln\left|x+\sqrt{x^2-4}\right|+C`, w: [T`\frac12\ln\left|x+\sqrt{x^2-4}\right|+C`, T`\ln\left|x-\sqrt{x^2-4}\right|+C`, T`\arcsin\frac x2+C`],
            s: [T`$x=2\cosh t$: $\int\frac{2\sinh t}{2\sinh t}dt=t=\operatorname{argcosh}\frac x2$`, T`$=\ln\left(x+\sqrt{x^2-4}\right)-\ln2$`] },
          { t: 'i', q: T`\int\frac{\sqrt{x^2-1}}{x}\,dx`, f: 'sqrt(x^2-1)/x', e: 'sqrt(x^2-1)-atan(sqrt(x^2-1))', dom: [1.2, 4],
            a: T`\sqrt{x^2-1}-\arctan\sqrt{x^2-1}+C`, w: [T`\sqrt{x^2-1}+\arctan\sqrt{x^2-1}+C`, T`\frac{(x^2-1)^{3/2}}{3x}+C`, T`\ln\left|x+\sqrt{x^2-1}\right|+C`],
            s: [T`$x=\sec\theta$: $\int\frac{\tan\theta}{\sec\theta}\sec\theta\tan\theta\,d\theta=\int\tan^2\theta\,d\theta=\tan\theta-\theta$`, T`$\tan\theta=\sqrt{x^2-1}$, $\theta=\arctan\sqrt{x^2-1}$`] },
        ],
      },
      {
        id: 'sqlin', n: 'Arrels de funcions lineals',
        r: T`\int R\left(x,\sqrt{ax+b}\right)dx:\quad u=\sqrt{ax+b},\ \ x=\frac{u^2-b}{a}`,
        i: T`Quan l'arrel és d'una expressió lineal, fes-la desaparèixer canviant-la per $u$. Queda una racional en $u$.`,
        p: [
          { t: 'i', q: T`\int\frac{dx}{1+\sqrt x}`, f: '1/(1+sqrt(x))', e: '2*sqrt(x)-2*log(1+sqrt(x))', dom: [0.3, 4],
            a: T`2\sqrt x-2\ln(1+\sqrt x)+C`, w: [T`\ln(1+\sqrt x)+C`, T`2\sqrt x+2\ln(1+\sqrt x)+C`, T`2\ln(1+\sqrt x)+C`],
            s: [T`$u=\sqrt x$, $x=u^2$, $dx=2u\,du$: $\int\frac{2u}{1+u}du$`, T`$\frac{2u}{1+u}=2-\frac{2}{1+u}\Rightarrow2u-2\ln(1+u)$`] },
          { t: 'i', q: T`\int\frac{x}{\sqrt{x+1}}\,dx`, f: 'x/sqrt(x+1)', e: '2/3*(x+1)^(3/2)-2*sqrt(x+1)', dom: [0, 3],
            a: T`\frac23(x+1)^{3/2}-2\sqrt{x+1}+C`, w: [T`\frac23(x+1)^{3/2}+2\sqrt{x+1}+C`, T`2x\sqrt{x+1}+C`, T`\frac{x^2}{2\sqrt{x+1}}+C`],
            s: [T`$u=\sqrt{x+1}$, $x=u^2-1$, $dx=2u\,du$: $\int\frac{u^2-1}{u}2u\,du=2\int(u^2-1)du$`, T`$=\frac{2u^3}{3}-2u$`] },
        ],
      },
    ],
  },
  {
    id: 'i7', icon: '📏', name: 'Integral definida',
    desc: 'Barrow, canvi de límits, simetries, el teorema fonamental i aplicacions geomètriques.',
    pista: T`$\int_a^bf=F(b)-F(a)$. En un canvi de variable, canvia també els límits i no cal desfer-lo. $\frac{d}{dx}\int_a^{g(x)}f(t)\,dt=f(g(x))\,g'(x)$.`,
    items: [
      {
        id: 'barrow', n: 'Regla de Barrow',
        r: T`\int_a^bf(x)\,dx=F(b)-F(a),\qquad F'=f`,
        i: T`Calcula una primitiva (sense $+C$) i avalua-la als extrems. Pots escriure fraccions, pi, e, ln…`,
        p: [
          { t: 'v', q: T`\int_0^1x\,e^x\,dx`, e: '1', a: T`1`, w: [T`e`, T`e-1`, T`0`], int: ['x*e^x', 0, 1],
            s: [T`Primitiva: $e^x(x-1)$`, T`$[e^x(x-1)]_0^1=0-(-1)=1$`] },
          { t: 'v', q: T`\int_0^{\pi/2}\sin^2x\,dx`, e: 'pi/4', a: T`\frac{\pi}{4}`, w: [T`\frac{\pi}{2}`, T`\frac12`, T`\frac\pi8`], int: ['sin(x)^2', 0, 'pi/2'],
            s: [T`$\left[\frac x2-\frac{\sin2x}{4}\right]_0^{\pi/2}=\frac\pi4-0$`] },
          { t: 'v', q: T`\int_0^1\frac{dx}{1+x^2}`, e: 'pi/4', a: T`\frac\pi4`, w: [T`\frac\pi2`, T`1`, T`\ln2`], int: ['1/(1+x^2)', 0, 1],
            s: [T`$[\arctan x]_0^1=\frac\pi4-0$`] },
          { t: 'v', q: T`\int_1^e\ln x\,dx`, e: '1', a: T`1`, w: [T`e`, T`e-1`, T`\frac{1}{e}`], int: ['log(x)', 1, 'e'],
            s: [T`$[x\ln x-x]_1^e=(e-e)-(0-1)=1$`] },
        ],
      },
      {
        id: 'cvdef', n: 'Canvi de variable amb límits',
        r: T`\int_a^bf(g(x))g'(x)\,dx=\int_{g(a)}^{g(b)}f(u)\,du`,
        i: T`Transforma els límits al fer el canvi. Així no has de tornar a la variable original.`,
        p: [
          { t: 'v', q: T`\int_0^{\sqrt\pi}x\sin(x^2)\,dx`, e: '1', a: T`1`, w: [T`2`, T`0`, T`\frac12`], int: ['x*sin(x^2)', 0, 'sqrt(pi)'],
            s: [T`$u=x^2$: $x=0\to u=0$, $x=\sqrt\pi\to u=\pi$`, T`$\frac12\int_0^\pi\sin u\,du=\frac12[-\cos u]_0^\pi=\frac12(1+1)=1$`] },
          { t: 'v', q: T`\int_1^e\frac{(\ln x)^3}{x}\,dx`, e: '1/4', a: T`\frac14`, w: [T`\frac13`, T`\frac{e^4}{4}`, T`1`], int: ['log(x)^3/x', 1, 'e'],
            s: [T`$u=\ln x$: límits $0\to1$`, T`$\int_0^1u^3du=\frac14$`] },
          { t: 'v', q: T`\int_0^1\frac{x}{1+x^2}\,dx`, e: 'log(2)/2', a: T`\frac{\ln2}{2}`, w: [T`\ln2`, T`\frac\pi4`, T`\frac12`], int: ['x/(1+x^2)', 0, 1],
            s: [T`$u=1+x^2$: límits $1\to2$; $\frac12\int_1^2\frac{du}{u}=\frac{\ln2}{2}$`] },
        ],
      },
      {
        id: 'simet', n: 'Simetria i propietats',
        r: T`f\ \text{senar}\Rightarrow\int_{-a}^af=0;\qquad f\ \text{parell}\Rightarrow\int_{-a}^af=2\int_0^af`,
        i: T`Abans de calcular, mira si l'interval és simètric i si hi ha parts senars: s'anul·len. Amb valors absoluts, parteix l'interval on canvia el signe.`,
        p: [
          { t: 'v', q: T`\int_{-2}^{2}\left(x^5\cos x+x^2\right)dx`, e: '16/3', a: T`\frac{16}{3}`, w: [T`0`, T`\frac{32}{3}`, T`\frac83`], int: ['x^5*cos(x)+x^2', -2, 2],
            s: [T`$x^5\cos x$ és senar: la seva integral és 0.`, T`$\int_{-2}^2x^2dx=2\int_0^2x^2dx=2\cdot\frac83=\frac{16}{3}$`] },
          { t: 'v', q: T`\int_0^{2\pi}|\sin x|\,dx`, e: '4', a: T`4`, w: [T`0`, T`2`, T`2\pi`], int: ['abs(sin(x))', 0, '2*pi'],
            s: [T`$\int_0^\pi\sin x\,dx=2$, i per simetria l'altra meitat també val 2.`] },
          { t: 'c', q: T`Si $f$ és contínua i senar, $\int_{-a}^{a}f(x)\,dx$ val…`, a: T`$0$`, w: [T`$2\int_0^af(x)\,dx$`, T`$\int_0^af(x)\,dx$`, T`No es pot saber sense conèixer $f$.`],
            s: [T`$\int_{-a}^0f(x)dx\overset{x=-t}{=}\int_0^af(-t)dt=-\int_0^af(t)dt$`] },
        ],
      },
      {
        id: 'tfc', n: 'Teorema fonamental del càlcul',
        r: T`\frac{d}{dx}\int_{a}^{g(x)}f(t)\,dt=f\big(g(x)\big)\,g'(x)`,
        i: T`No calculis la integral: substitueix el límit superior a l'integrand i multiplica per la seva derivada. Si el límit variable és l'inferior, canvia el signe.`,
        p: [
          { t: 'd', q: T`F(x)=\int_0^{x^2}\sin t\,dt`, ask: T`Calcula $F'(x)$`, pre: T`F'(x)=`, f: '1-cos(x^2)', e: '2x*sin(x^2)', dom: [-1.5, 1.5],
            a: T`2x\sin(x^2)`, w: [T`\sin(x^2)`, T`\sin x`, T`-\cos(x^2)`],
            s: [T`$f(g(x))\,g'(x)=\sin(x^2)\cdot2x$`] },
          { t: 'd', q: T`F(x)=\int_0^{x^3}e^{-t^2}\,dt`, ask: T`Calcula $F'(x)$ (la primitiva no és elemental, i no cal!)`, pre: T`F'(x)=`, f: 'sqrt(pi)/2*erf(x^3)', e: '3x^2*e^(-x^6)', dom: [-1, 1],
            a: T`3x^2e^{-x^6}`, w: [T`e^{-x^6}`, T`3x^2e^{-x^2}`, T`-2x^3e^{-x^6}`],
            s: [T`$e^{-(x^3)^2}\cdot3x^2=3x^2e^{-x^6}$`] },
          { t: 'd', q: T`F(x)=\int_{\sin x}^{1}\frac{dt}{1+t^2}`, ask: T`Calcula $F'(x)$`, pre: T`F'(x)=`, f: 'pi/4-atan(sin(x))', e: '-cos(x)/(1+sin(x)^2)', dom: [-1.5, 1.5],
            a: T`-\frac{\cos x}{1+\sin^2x}`, w: [T`\frac{\cos x}{1+\sin^2x}`, T`-\frac{1}{1+\sin^2x}`, T`\frac{1}{1+x^2}`],
            s: [T`El límit variable és el de baix: $F(x)=-\int_1^{\sin x}\frac{dt}{1+t^2}$`, T`$F'(x)=-\dfrac{1}{1+\sin^2x}\cdot\cos x$`] },
          { t: 'd', q: T`F(x)=\int_{x}^{2x}\frac{dt}{t}\quad(x>0)`, ask: T`Calcula $F'(x)$`, pre: T`F'(x)=`, f: 'log(2x)-log(x)', e: '0', dom: [0.5, 3],
            a: T`0`, w: [T`\frac1x`, T`\frac{1}{2x}`, T`\ln2`],
            s: [T`$F'(x)=\frac{1}{2x}\cdot2-\frac1x\cdot1=0$`, T`Té sentit: $F(x)=\ln2x-\ln x=\ln2$, constant.`] },
        ],
      },
      {
        id: 'arees', n: 'Àrees, volums i longituds',
        r: T`A=\int_a^b|f-g|\,dx,\quad V=\pi\int_a^bf(x)^2dx,\quad L=\int_a^b\sqrt{1+f'(x)^2}\,dx`,
        i: T`Per a àrees entre corbes, troba primer els punts de tall i resta «la de dalt menys la de baix». Per a volums de revolució al voltant de l'eix $X$, discs: $\pi\int f^2$.`,
        p: [
          { t: 'v', ask: T`Àrea tancada entre $y=x$ i $y=x^2$`, q: T`A`, e: '1/6', a: T`\frac16`, w: [T`\frac13`, T`\frac12`, T`\frac56`], int: ['x-x^2', 0, 1],
            s: [T`Talls: $x=x^2\Rightarrow x=0,1$. A $[0,1]$, $x\ge x^2$.`, T`$\int_0^1(x-x^2)dx=\frac12-\frac13=\frac16$`] },
          { t: 'v', ask: T`Àrea tancada entre $y=x^2$ i $y=2-x^2$`, q: T`A`, e: '8/3', a: T`\frac83`, w: [T`\frac43`, T`4`, T`2`], int: ['2-2x^2', -1, 1],
            s: [T`Talls: $x^2=2-x^2\Rightarrow x=\pm1$.`, T`$\int_{-1}^1(2-2x^2)dx=4-\frac43=\frac83$`] },
          { t: 'v', ask: T`Volum en girar $y=\sqrt x$, $0\le x\le4$, al voltant de l'eix $X$`, q: T`V`, e: '8*pi', a: T`8\pi`, w: [T`16\pi`, T`4\pi`, T`8`], int: ['pi*x', 0, 4],
            s: [T`$V=\pi\int_0^4(\sqrt x)^2dx=\pi\int_0^4x\,dx=\pi\cdot8$`] },
          { t: 'v', ask: T`Longitud de la corba $y=\frac23x^{3/2}$ entre $x=0$ i $x=3$`, q: T`L`, e: '14/3', a: T`\frac{14}{3}`, w: [T`2\sqrt3`, T`\frac{16}{3}`, T`3`], int: ['sqrt(1+x)', 0, 3],
            s: [T`$y'=\sqrt x\Rightarrow\sqrt{1+y'^2}=\sqrt{1+x}$`, T`$\int_0^3\sqrt{1+x}\,dx=\frac23\left[(1+x)^{3/2}\right]_0^3=\frac23(8-1)=\frac{14}{3}$`] },
        ],
      },
    ],
  },
  {
    id: 'i8', icon: '♾️', name: 'Integrals impròpies',
    desc: 'Intervals infinits, integrands no fitats i criteris de convergència.',
    pista: T`Una impròpia és un límit: $\int_a^\infty f=\lim_{b\to\infty}\int_a^bf$. Si el límit no existeix o és infinit, divergeix. Referència: $\int_1^\infty\frac{dx}{x^p}$ convergeix si $p>1$; $\int_0^1\frac{dx}{x^p}$ si $p<1$.`,
    items: [
      {
        id: 'imp1', n: 'Interval infinit',
        r: T`\int_a^{\infty}f(x)\,dx=\lim_{b\to\infty}\int_a^bf(x)\,dx`,
        i: T`Calcula la primitiva i fes el límit. Si divergeix, escriu «diverge» (o «inf»).`,
        p: [
          { t: 'v', q: T`\int_1^{\infty}\frac{dx}{x^2}`, e: '1', a: T`1`, w: [T`\text{Divergeix}`, T`\frac12`, T`2`], int: ['1/x^2', 1, 'inf'],
            s: [T`$\left[-\frac1x\right]_1^b=1-\frac1b\to1$`] },
          { t: 'v', q: T`\int_0^{\infty}x\,e^{-x}\,dx`, e: '1', a: T`1`, w: [T`\text{Divergeix}`, T`0`, T`e`], int: ['x*e^(-x)', 0, 'inf'],
            s: [T`Primitiva: $-e^{-x}(x+1)$`, T`$\lim_{b\to\infty}\left(-e^{-b}(b+1)\right)+1=0+1=1$ (l'exponencial guanya).`] },
          { t: 'v', q: T`\int_1^{\infty}\frac{dx}{x}`, e: 'inf', a: T`\text{Divergeix}`, w: [T`1`, T`0`, T`\ln2`], int: ['1/x', 1, 'inf'],
            s: [T`$[\ln x]_1^b=\ln b\to\infty$: divergeix (és el cas límit $p=1$).`] },
          { t: 'v', q: T`\int_0^{\infty}\frac{dx}{1+x^2}`, e: 'pi/2', a: T`\frac\pi2`, w: [T`\pi`, T`\frac\pi4`, T`\text{Divergeix}`], int: ['1/(1+x^2)', 0, 'inf'],
            s: [T`$\lim_{b\to\infty}\arctan b-\arctan0=\frac\pi2$`] },
        ],
      },
      {
        id: 'imp2', n: 'Integrand no fitat',
        r: T`\int_a^bf\,dx=\lim_{c\to a^+}\int_c^bf\,dx\quad(f\ \text{no fitada en}\ a)`,
        i: T`Busca on s'anul·la el denominador o on el log explota. Compte: $\int_{-1}^1\frac{dx}{x^2}$ NO val $-2$; té una singularitat a dins i divergeix.`,
        p: [
          { t: 'v', q: T`\int_0^1\frac{dx}{\sqrt x}`, e: '2', a: T`2`, w: [T`\text{Divergeix}`, T`\frac12`, T`1`], int: ['1/sqrt(x)', 0, 1],
            s: [T`$[2\sqrt x]_c^1=2-2\sqrt c\to2$`] },
          { t: 'v', q: T`\int_0^1\ln x\,dx`, e: '-1', a: T`-1`, w: [T`\text{Divergeix}`, T`1`, T`0`], int: ['log(x)', 0, 1],
            s: [T`$[x\ln x-x]_c^1=-1-(c\ln c-c)\to-1$ (ja que $c\ln c\to0$).`] },
          { t: 'v', q: T`\int_0^1\frac{dx}{x^2}`, e: 'inf', a: T`\text{Divergeix}`, w: [T`1`, T`-1`, T`2`], int: ['1/x^2', 0, 1],
            s: [T`$\left[-\frac1x\right]_c^1=-1+\frac1c\to\infty$`] },
          { t: 'v', q: T`\int_0^2\frac{dx}{\sqrt{4-x^2}}`, e: 'pi/2', a: T`\frac\pi2`, w: [T`\text{Divergeix}`, T`\pi`, T`1`], int: ['1/sqrt(4-x^2)', 0, 2],
            s: [T`Singular en $x=2$. $\left[\arcsin\frac x2\right]_0^{c}\to\arcsin1=\frac\pi2$`] },
        ],
      },
      {
        id: 'impcrit', n: 'Criteris de convergència',
        r: T`0\le f\le g:\ \int g<\infty\Rightarrow\int f<\infty;\qquad \lim\frac fg=L\in(0,\infty)\Rightarrow\text{mateix caràcter}`,
        i: T`Quan no pots calcular la primitiva. Compara amb $\frac{1}{x^p}$ mirant el comportament dominant de l'integrand a l'infinit (o prop de la singularitat).`,
        p: [
          { t: 'c', q: T`$\displaystyle\int_1^\infty\frac{dx}{x^p}$ convergeix si i només si…`, a: T`$p>1$`, w: [T`$p\ge1$`, T`$p<1$`, T`$p>0$`],
            s: [T`Si $p\ne1$: $\left[\frac{x^{1-p}}{1-p}\right]_1^b$ té límit finit només si $1-p<0$. Si $p=1$, $\ln b\to\infty$.`] },
          { t: 'c', q: T`$\displaystyle\int_0^1\frac{dx}{x^p}$ (amb $p>0$) convergeix si i només si…`, a: T`$p<1$`, w: [T`$p>1$`, T`$p\le1$`, T`Mai convergeix.`],
            s: [T`Ara la $x^{1-p}$ s'avalua prop de 0: necessitem $1-p>0$.`] },
          { t: 'c', q: T`$\displaystyle\int_1^\infty\frac{\sin^2x}{x^2}\,dx$…`, a: T`Convergeix, per comparació amb $\frac{1}{x^2}$.`, w: [T`Divergeix, perquè $\sin^2x$ no té límit.`, T`Convergeix, per comparació amb $\frac1x$.`, T`Divergeix, per comparació amb $\frac{1}{x^2}$.`],
            s: [T`$0\le\frac{\sin^2x}{x^2}\le\frac{1}{x^2}$ i $\int_1^\infty\frac{dx}{x^2}$ convergeix ($p=2>1$).`] },
          { t: 'c', q: T`$\displaystyle\int_2^\infty\frac{dx}{\ln x}$…`, a: T`Divergeix: $\frac{1}{\ln x}\ge\frac{1}{x}$.`, w: [T`Convergeix, perquè $\ln x\to\infty$.`, T`Convergeix, per comparació amb $\frac{1}{x^2}$.`, T`Convergeix pel criteri $p$.`],
            s: [T`$\ln x<x\Rightarrow\frac{1}{\ln x}>\frac1x$, i $\int_2^\infty\frac{dx}{x}$ divergeix.`] },
          { t: 'v', q: T`\int_1^{\infty}x^{-3/2}\,dx`, e: '2', a: T`2`, w: [T`\text{Divergeix}`, T`\frac23`, T`\frac12`], int: ['x^(-3/2)', 1, 'inf'],
            s: [T`$p=\frac32>1$, convergeix: $\left[-2x^{-1/2}\right]_1^\infty=0+2=2$`] },
          { t: 'c', q: T`$\displaystyle\int_1^\infty\frac{x+1}{x^3+2}\,dx$…`, a: T`Convergeix: es comporta com $\frac{1}{x^2}$ (comparació al límit).`, w: [T`Divergeix: es comporta com $\frac1x$.`, T`Divergeix: el numerador creix.`, T`Convergeix: es comporta com $\frac{1}{x^3}$, però no com $\frac1{x^2}$.`],
            s: [T`$\lim_{x\to\infty}\frac{(x+1)/(x^3+2)}{1/x^2}=\lim\frac{x^3+x^2}{x^3+2}=1\in(0,\infty)$.`, T`$\int_1^\infty\frac{dx}{x^2}$ convergeix, per tant la nostra també.`] },
        ],
      },
    ],
  },
];

/* Taules ràpides per a la pestanya Consulta */
const TABLES = {
  d: [
    [T`x^n`, T`n\,x^{n-1}`], [T`e^x`, T`e^x`], [T`a^x`, T`a^x\ln a`], [T`\ln x`, T`\frac1x`], [T`\log_a x`, T`\frac{1}{x\ln a}`],
    [T`\sin x`, T`\cos x`], [T`\cos x`, T`-\sin x`], [T`\tan x`, T`\sec^2x=1+\tan^2x`], [T`\cot x`, T`-\csc^2x`], [T`\sec x`, T`\sec x\tan x`],
    [T`\arcsin x`, T`\frac{1}{\sqrt{1-x^2}}`], [T`\arccos x`, T`-\frac{1}{\sqrt{1-x^2}}`], [T`\arctan x`, T`\frac{1}{1+x^2}`],
    [T`\sinh x`, T`\cosh x`], [T`\cosh x`, T`\sinh x`], [T`\tanh x`, T`1-\tanh^2x`], [T`\operatorname{argsinh}x`, T`\frac{1}{\sqrt{x^2+1}}`], [T`\operatorname{argtanh}x`, T`\frac{1}{1-x^2}`],
  ],
  i: [
    [T`x^n\ (n\ne-1)`, T`\frac{x^{n+1}}{n+1}`], [T`\frac1x`, T`\ln|x|`], [T`e^{ax}`, T`\frac{e^{ax}}{a}`], [T`a^x`, T`\frac{a^x}{\ln a}`],
    [T`\sin x`, T`-\cos x`], [T`\cos x`, T`\sin x`], [T`\sec^2x`, T`\tan x`], [T`\tan x`, T`-\ln|\cos x|`], [T`\sec x`, T`\ln|\sec x+\tan x|`],
    [T`\frac{1}{a^2+x^2}`, T`\frac1a\arctan\frac xa`], [T`\frac{1}{\sqrt{a^2-x^2}}`, T`\arcsin\frac xa`], [T`\frac{1}{\sqrt{x^2\pm a^2}}`, T`\ln\left|x+\sqrt{x^2\pm a^2}\right|`],
    [T`\frac{1}{x^2-a^2}`, T`\frac{1}{2a}\ln\left|\frac{x-a}{x+a}\right|`], [T`\sqrt{a^2-x^2}`, T`\frac{x\sqrt{a^2-x^2}}{2}+\frac{a^2}{2}\arcsin\frac xa`],
    [T`\sinh x`, T`\cosh x`], [T`\cosh x`, T`\sinh x`], [T`\ln x`, T`x\ln x-x`],
  ],
};

/* =========================================================
   NOUS CONTINGUTS: la idea derivar ⇄ integrar i estudi de funcions
   ========================================================= */
D_UNITS.push({
  id: 'd7', icon: '📊', name: 'Estudi de funcions', desc: '', pista: '',
  items: [
    {
      id: 'idea', n: 'Derivar ⇄ Integrar',
      r: T`F'(x)=f(x)\iff\int f(x)\,dx=F(x)+C`,
      i: T`Integrar és buscar la funció que, derivada, et dona l'integrand. Per això cada regla de derivació té una regla d'integració «mirall».`,
      p: [
        { t: 'i', q: T`\int 2x\,dx`, f: '2x', e: 'x^2', dom: [-2, 2], a: T`x^2+C`, w: [T`2+C`, T`\frac{x^2}{2}+C`, T`2x^2+C`],
          s: [T`Quina funció té derivada $2x$? Doncs $(x^2)'=2x$.`, T`$\int2x\,dx=x^2+C$`] },
        { t: 'c', q: T`Si $F'(x)=f(x)$, quina afirmació és certa?`, a: T`$\int f(x)\,dx=F(x)+C$`, w: [T`$\int F(x)\,dx=f(x)+C$`, T`$f'(x)=F(x)$`, T`$\int f(x)\,dx=F'(x)$`],
          s: [T`Integrar desfà la derivada: tornes de $f$ a $F$.`] },
        { t: 'd', q: T`f(x)=x^3+7`, f: 'x^3+7', e: '3x^2', dom: [-2, 2], a: T`3x^2`, w: [T`3x^2+7`, T`x^2`, T`3x`],
          s: [T`La constant 7 té derivada 0.`, T`Per això quan integres $3x^2$ no saps si hi havia un $+7$: per això s'escriu $+C$.`] },
        { t: 'c', q: T`Per què s'escriu $+C$ en una primitiva?`, a: T`Perquè totes les funcions $F(x)+C$ tenen la mateixa derivada: la constant desapareix en derivar.`,
          w: [T`Per indicar que la integral és definida.`, T`Perquè $C$ és el valor de la funció en $x=0$, sempre.`, T`És una convenció sense significat.`],
          s: [T`$(F(x)+C)'=F'(x)+0=f(x)$ per a qualsevol constant $C$.`] },
      ],
    },
    {
      id: 'mono', n: 'Creixement i extrems',
      r: T`f'>0\Rightarrow f\nearrow,\quad f'<0\Rightarrow f\searrow,\quad f'\ \text{canvia de signe en}\ a\Rightarrow\text{extrem}`,
      i: T`Deriva, factoritza $f'$ i fes la taula de signes. Els extrems relatius són on $f'$ canvia de signe.`,
      p: [
        { t: 'd', q: T`f(x)=x^2e^{-x}`, ask: T`Calcula $f'(x)$ i factoritza-la (et servirà per trobar els extrems)`, f: 'x^2*e^(-x)', e: 'x*(2-x)*e^(-x)', dom: [-1, 3],
          a: T`x(2-x)e^{-x}`, w: [T`2xe^{-x}`, T`(2x+x^2)e^{-x}`, T`-2xe^{-x}`],
          s: [T`Producte: $2xe^{-x}+x^2(-e^{-x})=e^{-x}(2x-x^2)=x(2-x)e^{-x}$`, T`$e^{-x}>0$, per tant el signe és el de $x(2-x)$: decreix a $(-\infty,0)$, creix a $(0,2)$, decreix a $(2,\infty)$.`, T`Mínim en $x=0$ i màxim en $x=2$.`] },
        { t: 'c', q: T`Intervals de monotonia de $f(x)=x^3-3x$:`, a: T`Creix a $(-\infty,-1)\cup(1,\infty)$ i decreix a $(-1,1)$.`,
          w: [T`Creix a $(-1,1)$ i decreix a $(-\infty,-1)\cup(1,\infty)$.`, T`Creix a tot $\mathbb R$.`, T`Creix a $(0,\infty)$ i decreix a $(-\infty,0)$.`],
          s: [T`$f'(x)=3x^2-3=3(x-1)(x+1)$`, T`És positiva fora de $[-1,1]$ i negativa a dins.`] },
        { t: 'v', ask: T`Valor del màxim relatiu de $f(x)=x^3-3x+2$`, q: T`f(x)=x^3-3x+2`, e: '4', a: T`4`, w: [T`0`, T`2`, T`-1`],
          s: [T`$f'(x)=3x^2-3=0\Rightarrow x=\pm1$`, T`$f''(x)=6x$, $f''(-1)<0$: màxim en $x=-1$.`, T`$f(-1)=-1+3+2=4$`] },
        { t: 'v', ask: T`Abscissa del mínim de $f(x)=x\ln x$`, q: T`f(x)=x\ln x`, e: '1/e', a: T`\frac1e`, w: [T`1`, T`e`, T`0`],
          s: [T`$f'(x)=\ln x+1=0\Rightarrow x=e^{-1}$`, T`$f'<0$ abans i $f'>0$ després: mínim.`] },
      ],
    },
    {
      id: 'curv', n: 'Curvatura i inflexió',
      r: T`f''>0\Rightarrow\text{convexa}\ (\cup),\quad f''<0\Rightarrow\text{còncava}\ (\cap)`,
      i: T`Segona derivada i taula de signes. Un punt d'inflexió és on la curvatura canvia: no n'hi ha prou amb $f''=0$.`,
      p: [
        { t: 'd', q: T`f(x)=\ln(1+x^2)`, ask: T`Calcula $f''(x)$`, pre: T`f''(x)=`, n: 2, f: 'log(1+x^2)', e: '(2-2x^2)/(1+x^2)^2', dom: [-2, 2],
          a: T`\frac{2-2x^2}{(1+x^2)^2}`, w: [T`\frac{2}{1+x^2}`, T`\frac{2+2x^2}{(1+x^2)^2}`, T`\frac{-4x}{(1+x^2)^2}`],
          s: [T`$f'(x)=\dfrac{2x}{1+x^2}$`, T`Quocient: $\dfrac{2(1+x^2)-2x\cdot2x}{(1+x^2)^2}=\dfrac{2-2x^2}{(1+x^2)^2}$`] },
        { t: 'c', q: T`On és convexa ($\cup$) la funció $f(x)=\ln(1+x^2)$?`, a: T`A $(-1,1)$`, w: [T`A $(-\infty,-1)\cup(1,\infty)$`, T`A tot $\mathbb R$`, T`A $(0,\infty)$`],
          s: [T`$f''(x)=\dfrac{2(1-x^2)}{(1+x^2)^2}>0\iff|x|<1$`, T`Inflexions en $x=\pm1$.`] },
        { t: 'v', ask: T`Abscissa del punt d'inflexió de $f(x)=x\,e^{x}$`, q: T`f(x)=x\,e^x`, e: '-2', a: T`-2`, w: [T`-1`, T`0`, T`2`],
          s: [T`$f'=(1+x)e^x$, $f''=(2+x)e^x$`, T`$f''=0\iff x=-2$, i hi canvia de signe.`] },
      ],
    },
    {
      id: 'estudi', n: 'Estudi complet',
      r: T`\text{domini}\to\text{asímptotes}\to f'\ (\text{monotonia})\to f''\ (\text{curvatura})\to\int\ (\text{àrees})`,
      i: T`Aquí s'ajunta tot: la derivada et diu on puja i baixa la funció, la segona com es corba, i la integral quanta àrea tanca.`,
      p: [
        { t: 'd', q: T`f(x)=\frac{x^2}{x-1}`, f: 'x^2/(x-1)', e: '(x^2-2x)/(x-1)^2', dom: [1.3, 4],
          a: T`\frac{x^2-2x}{(x-1)^2}`, w: [T`\frac{x^2-2x}{x-1}`, T`\frac{x^2+2x}{(x-1)^2}`, T`2x`],
          s: [T`$\dfrac{2x(x-1)-x^2}{(x-1)^2}=\dfrac{x^2-2x}{(x-1)^2}=\dfrac{x(x-2)}{(x-1)^2}$`] },
        { t: 'c', q: T`Extrems relatius de $f(x)=\frac{x^2}{x-1}$:`, a: T`Màxim en $(0,0)$ i mínim en $(2,4)$.`,
          w: [T`Mínim en $(0,0)$ i màxim en $(2,4)$.`, T`Només un mínim, en $(2,4)$.`, T`No en té, perquè $x=1$ no és del domini.`],
          s: [T`$f'(x)=\frac{x(x-2)}{(x-1)^2}$: positiva a $(-\infty,0)$, negativa a $(0,1)\cup(1,2)$, positiva a $(2,\infty)$.`, T`$f(0)=0$ és màxim i $f(2)=4$ és mínim.`] },
        { t: 'd', q: T`f(x)=\frac{x^2}{x-1}`, ask: T`Equació de l'asímptota obliqua`, pre: T`y=`, nochk: 1, e: 'x+1', a: T`y=x+1`, w: [T`y=x`, T`y=x-1`, T`y=1`],
          s: [T`$m=\lim\limits_{x\to\infty}\frac{f(x)}{x}=\lim\frac{x^2}{x^2-x}=1$`, T`$n=\lim\limits_{x\to\infty}(f(x)-x)=\lim\frac{x}{x-1}=1$`, T`$y=x+1$ (i asímptota vertical en $x=1$).`] },
        { t: 'v', ask: T`Àrea entre $f(x)=x\,e^{-x}$, l'eix $X$ i les rectes $x=0$ i $x=1$`, q: T`\int_0^1x\,e^{-x}\,dx`, e: '1-2/e', a: T`1-\frac{2}{e}`, w: [T`\frac1e`, T`1-\frac1e`, T`2-\frac2e`], int: ['x*e^(-x)', 0, 1],
          s: [T`$f\ge0$ a $[0,1]$, així que l'àrea és la integral.`, T`Per parts, una primitiva és $-e^{-x}(x+1)$.`, T`$\left[-e^{-x}(x+1)\right]_0^1=1-\frac2e$`] },
      ],
    },
  ],
});

/* Problema «mirall»: d'una derivada en surt una integral i al revés */
const PLAIN = p => !p.ask && !p.nochk && !p.v && !p.wrt && !p.imp && !p.par && !p.tan && !p.tay && !p.n && p.f;
function mirrorOf(p) {
  if (p.t === 'd' && PLAIN(p) && /^f\(x\)=/.test(p.q)) {
    const F = p.q.replace(/^f\(x\)=/, '');
    return { t: 'i', mirror: 1, q: T`\int\left(${p.a}\right)dx`, a: F + '+C', e: p.f, f: p.e, dom: p.dom,
      s: [T`És la derivada que acabes de fer, llegida al revés: si $F'=f$, aleshores $\int f\,dx=F+C$.`, T`$\displaystyle\int\left(${p.a}\right)dx=${F}+C$`] };
  }
  if (p.t === 'i' && p.f && !p.nochk) {
    let g = p.q.replace(/^\\int\s*/, '');
    if (/\\,?\s*dx\s*$/.test(g)) g = g.replace(/\\,?\s*dx\s*$/, '');
    else g = g.replace(/\\,\s*dx|dx/, '').replace(/\\frac\{\}/, T`\frac{1}`);
    g = g.replace(/^\\left\((.*)\\right\)$/, '$1');
    const F = p.a.replace(/\+C$/, '');
    return { t: 'd', mirror: 1, q: 'f(x)=' + F, a: g, e: p.f, f: p.e, dom: p.dom,
      s: [T`Derivar una primitiva t'ha de tornar l'integrand: és la comprovació de qualsevol integral.`, T`$\left(${F}\right)'=${g}$`] };
  }
  return null;
}

/* =========================================================
   GRAF DE TÈCNIQUES
   b: 'd' derivar · 'i' integrar · 'di' les dues alhora · 'app' aplicacions
   x, y: posició al graf · req: nodes previs · sk: tècniques (id o id#problema)
   ========================================================= */
const NODES = [
  { id: 'pot', n: 'Potències', icon: 'xⁿ', b: 'di', x: 2, y: 0, req: [], sk: ['idea', 'pot', 'ipot'],
    r: T`(x^n)'=n\,x^{n-1}`, ri: T`\int x^n\,dx=\frac{x^{n+1}}{n+1}+C`, i: T`El punt de partida. Derivar baixa l'exponent i el multiplica; integrar el puja i hi divideix. Són operacions inverses: tot el graf es basa en això.` },
  { id: 'explog', n: 'Exponencials i logaritmes', s: 'Exp. i logaritmes', icon: 'eˣ', b: 'di', x: 1, y: 1, req: ['pot'], sk: ['explog', 'iexp#0'],
    r: T`(e^x)'=e^x,\quad(\ln x)'=\frac1x`, ri: T`\int e^x\,dx=e^x+C,\quad\int\frac{dx}{x}=\ln|x|+C`, i: T`$e^x$ és la seva pròpia derivada i primitiva. El logaritme omple l'únic forat de les potències: $\int x^{-1}dx$.` },
  { id: 'trig', n: 'Trigonomètriques', icon: 'sin', b: 'di', x: 3, y: 1, req: ['pot'], sk: ['trig', 'iexp#1', 'iexp#2'],
    r: T`(\sin x)'=\cos x,\quad(\cos x)'=-\sin x`, ri: T`\int\cos x\,dx=\sin x+C,\quad\int\sin x\,dx=-\cos x+C`, i: T`Cicle de quatre: $\sin\to\cos\to-\sin\to-\cos\to\sin$. Derivar avança pel cicle i integrar hi retrocedeix.` },
  { id: 'prodq', n: 'Producte i quocient', icon: '×÷', b: 'd', x: 0, y: 2, req: ['explog', 'trig'], sk: ['prod', 'quot'],
    r: T`(fg)'=f'g+fg',\quad\left(\frac fg\right)'=\frac{f'g-fg'}{g^2}`, i: T`La regla del producte, llegida al revés, és la integració per parts (més avall al graf).` },
  { id: 'cadena', n: 'Cadena ⇄ Canvi de variable', s: 'Cadena ⇄ Canvi de var.', icon: '∘', b: 'di', x: 2, y: 2, req: ['explog', 'trig'], sk: ['cad', 'fpot', 'flog'],
    r: T`\big(f(g(x))\big)'=f'(g(x))\,g'(x)`, ri: T`\int f'(g(x))\,g'(x)\,dx=f(g(x))+C`, i: T`La parella més important del càlcul. En derivar una composició apareix el factor $g'(x)$; en integrar l'has de reconèixer i fer $u=g(x)$.` },
  { id: 'inv', n: 'Arcs: arctan i arcsin', s: 'arctan i arcsin', icon: 'arc', b: 'di', x: 4, y: 2, req: ['trig'], sk: ['arc', 'iarc'],
    r: T`(\arctan x)'=\frac{1}{1+x^2},\quad(\arcsin x)'=\frac{1}{\sqrt{1-x^2}}`, ri: T`\int\frac{dx}{1+x^2}=\arctan x+C,\quad\int\frac{dx}{\sqrt{1-x^2}}=\arcsin x+C`, i: T`Les derivades de les inverses són algebraiques. Per això, en integrar fraccions i arrels, et sortiran arctangents i arcsinus.` },
  { id: 'parts', n: 'Per parts', icon: '∫u dv', b: 'di', x: 0, y: 3, req: ['prodq', 'cadena'], sk: ['ppexp', 'pptrig', 'pplog'],
    r: T`(uv)'=u'v+uv'`, ri: T`\int u\,dv=uv-\int v\,du`, i: T`És la regla del producte integrada. Tria $u$ amb ALPES (Arcs, Logaritmes, Polinomis, Exponencials, Sinus): la $u$ ha de simplificar-se en derivar-la.` },
  { id: 'logd', n: 'Derivació logarítmica', s: 'Derivació log.', icon: 'ln y', b: 'd', x: 1, y: 3, req: ['explog', 'cadena'], sk: ['logd'] },
  { id: 'cad2', n: 'Composicions ⇄ Canvi general', s: 'Composicions ⇄ Canvi', icon: '∘∘', b: 'di', x: 2, y: 3, req: ['cadena'], sk: ['cad2', 'cv'],
    r: T`\big(f(g(h(x)))\big)'=f'\cdot g'\cdot h'`, ri: T`\int f(g(x))\,g'(x)\,dx=\int f(u)\,du`, i: T`Composicions de diverses capes: en derivar multipliques totes les derivades interiors. En integrar busques quina capa té la seva derivada fora.` },
  { id: 'hip', n: 'Hiperbòliques', icon: 'sinh', b: 'di', x: 3, y: 3, req: ['cadena'], sk: ['hip', 'arghip'],
    r: T`(\sinh x)'=\cosh x,\quad(\cosh x)'=\sinh x`, ri: T`\int\cosh x\,dx=\sinh x+C,\quad\int\frac{dx}{\sqrt{x^2+1}}=\operatorname{argsinh}x+C`, i: T`Com les trigonomètriques però sense el signe menys. Les seves inverses resolen integrals amb $\sqrt{x^2\pm1}$.` },
  { id: 'racional', n: 'Fraccions simples', icon: 'P/Q', b: 'i', x: 4, y: 3, req: ['explog', 'inv'], sk: ['rsim', 'rmul', 'rquad', 'rdiv'] },
  { id: 'partsplus', n: 'Parts reiterada i cíclica', s: 'Parts reiterada', icon: '↻', b: 'i', x: 0, y: 4, req: ['parts'], sk: ['pprei', 'ppcic'] },
  { id: 'ordre', n: 'Derivades successives', s: "f'', f''', …", icon: "f''", b: 'd', x: 1, y: 4, req: ['prodq', 'cadena'], sk: ['ordre'] },
  { id: 'trigint', n: 'Integrals trigonomètriques', s: 'Integrals trig.', icon: '∫sin', b: 'i', x: 2, y: 4, req: ['cad2', 'trig'], sk: ['tsen', 'tpar', 'ttan', 'tprod', 'tweier'] },
  { id: 'irrac', n: 'Arrels: substitucions', s: 'Arrels', icon: '√', b: 'i', x: 3, y: 4, req: ['inv', 'hip', 'cad2'], sk: ['sqa2mx2', 'sqa2px2', 'sqx2ma2', 'sqlin'] },
  { id: 'invf', n: 'Derivada de la inversa', s: 'Inversa', icon: 'f⁻¹', b: 'd', x: 4, y: 4, req: ['inv'], sk: ['inv'] },
  { id: 'tang', n: 'Recta tangent', icon: '⟋', b: 'app', x: 0, y: 5, req: ['cadena'], sk: ['tang'] },
  { id: 'mono', n: 'Creixement i extrems', s: 'Extrems', icon: '⛰', b: 'app', x: 1, y: 5, req: ['prodq', 'cadena'], sk: ['mono'] },
  { id: 'barrow', n: 'Integral definida', icon: '∫ₐᵇ', b: 'i', x: 2, y: 5, req: ['cad2', 'parts'], sk: ['barrow', 'cvdef', 'simet'] },
  { id: 'impl', n: 'Implícita i paramètrica', s: 'Implícita', icon: 'y\'', b: 'd', x: 3, y: 5, req: ['cad2'], sk: ['impl', 'param'] },
  { id: 'hop', n: "L'Hôpital", icon: '0/0', b: 'app', x: 4, y: 5, req: ['ordre'], sk: ['hop'], opt: 1 },
  { id: 'curv', n: 'Curvatura i inflexió', s: 'Curvatura', icon: '∪∩', b: 'app', x: 0, y: 6, req: ['mono', 'ordre'], sk: ['curv', 'opt#2', 'opt#3'] },
  { id: 'opt', n: 'Optimització', icon: '★', b: 'app', x: 1, y: 6, req: ['mono'], sk: ['opt#0', 'opt#1'] },
  { id: 'tfc', n: 'Teorema fonamental', s: 'T. fonamental', icon: 'd∫', b: 'di', x: 2, y: 6, req: ['barrow'], sk: ['tfc'],
    r: T`\frac{d}{dx}\int_a^xf(t)\,dt=f(x)`, ri: T`\int_a^bf(x)\,dx=F(b)-F(a)`, i: T`El teorema que demostra que derivar i integrar són inverses. Derivar una integral amb límit variable et torna l'integrand.` },
  { id: 'arees', n: 'Àrees, volums i longituds', s: 'Àrees i volums', icon: '▱', b: 'app', x: 3, y: 6, req: ['barrow'], sk: ['arees'] },
  { id: 'imp', n: 'Integrals impròpies', s: 'Impròpies', icon: '∞', b: 'i', x: 4, y: 6, req: ['barrow', 'racional'], sk: ['imp1', 'imp2', 'impcrit'] },
  { id: 'estudi', n: 'Estudi complet de funcions', s: 'Estudi complet', icon: '📈', b: 'app', x: 0, y: 7, req: ['curv', 'opt'], sk: ['estudi'] },
  { id: 'tay', n: 'Polinomi de Taylor', s: 'Taylor', icon: 'Σ', b: 'app', x: 1, y: 7, req: ['ordre'], sk: ['tay'] },
  { id: 'parc', n: 'Derivades parcials', s: 'Parcials', icon: '∂', b: 'd', x: 2, y: 7, req: ['cad2', 'impl'], sk: ['parc', 'cadmv'] },
  { id: 'grad', n: 'Gradient i extrems en 2D', s: 'Gradient i hessiana', icon: '∇', b: 'app', x: 2, y: 8, req: ['parc', 'opt'], sk: ['grad', 'hess'] },
];
/* Tècnica d'integració de cada node (joc «Quina tècnica?») */
const TECH = { pot: 'Immediata', explog: 'Immediata', trig: 'Immediata', inv: 'Immediata', hip: 'Immediata', cadena: 'Canvi de variable', cad2: 'Canvi de variable',
  parts: 'Per parts', partsplus: 'Per parts', racional: 'Fraccions simples', trigint: 'Identitats trigonomètriques', irrac: 'Substitució trigonomètrica o hiperbòlica' };
/* ---------- js/dtrack.js ---------- */
/* =========================================================
   Itinerari «Només derivades» (seminari 1)
   - Mini motor simbòlic: expressions, derivada, TeX i math.js
   - Generadors d'exercicis infinits, de les constants a la cadena
   - Cada resposta i cada distractor es comprova numèricament
   ========================================================= */
const DX = (() => {
  /* ---------- Fraccions ---------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const F = (p, q = 1) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q); return { p: p / g, q: q / g }; };
  const toF = v => typeof v === 'number' ? F(v) : v;
  const fadd = (a, b) => F(a.p * b.q + b.p * a.q, a.q * b.q), fmul = (a, b) => F(a.p * b.p, a.q * b.q), fneg = a => F(-a.p, a.q);
  const fz = a => a.p === 0, fone = a => a.p === a.q;
  const fjs = a => a.q === 1 ? `${a.p}` : `(${a.p}/${a.q})`;
  const ftexE = e => e.q === 1 ? `${e.p}` : `${e.p < 0 ? '-' : ''}\\frac{${Math.abs(e.p)}}{${e.q}}`;
  function fpow(c, n) { let r = F(1); for (let k = 0; k < Math.abs(n); k++) r = fmul(r, c); return n < 0 ? F(r.q, r.p) : r; }

  /* ---------- Expressions: Sum = [Term], Term = {c, f:[{b, e}]} ---------- */
  const XB = { k: 'x' };
  const fnB = (name, arg, a0) => ({ k: 'fn', name, arg, a0 });
  const sumB = s => ({ k: 'sum', s });
  const lnC = a0 => ({ k: 'c', a0 });
  const fac = (b, e) => ({ b, e: toF(e) });
  const Tm = (c, f = []) => ({ c: toF(c), f });
  const FJS = { sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', exp: 'exp', ln: 'log', asin: 'asin', acos: 'acos', atan: 'atan', sinh: 'sinh', cosh: 'cosh' };
  function bjs(b) {
    if (b.k === 'x') return 'x';
    if (b.k === 'c') return `log(${b.a0})`;
    if (b.k === 'sum') return `(${js(b.s)})`;
    const a = js(b.arg);
    if (b.name === 'apow') return `${b.a0}^(${a})`;
    if (b.name === 'loga') return `(log(${a})/log(${b.a0}))`;
    return `${FJS[b.name]}(${a})`;
  }
  const tjs = t => [fjs(t.c), ...t.f.map(f => fone(f.e) ? `(${bjs(f.b)})` : `(${bjs(f.b)})^(${fjs(f.e)})`)].join('*');
  const js = s => s.length ? s.map(t => `(${tjs(t)})`).join('+') : '0';
  const bkey = b => b.k === 'x' ? 'x' : b.k === 'c' ? `c${b.a0}` : b.k === 'sum' ? `(${js(b.s)})` : `${b.name}${b.a0 ?? ''}(${js(b.arg)})`;
  const sig = t => t.f.map(f => bkey(f.b) + '^' + f.e.p + '/' + f.e.q).sort().join('*');

  /* ---------- TeX ---------- */
  const FT = { sin: '\\sin', cos: '\\cos', tan: '\\tan', cot: '\\cot', ln: '\\ln', asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan', sinh: '\\sinh', cosh: '\\cosh' };
  const isX = s => s.length === 1 && fone(s[0].c) && s[0].f.length === 1 && s[0].f[0].b.k === 'x' && fone(s[0].f[0].e);
  const wrap = t => /\\frac|\\sqrt/.test(t) ? `\\left(${t}\\right)` : `(${t})`;
  function fnTex(b, n) {
    const a = tex(b.arg), simple = isX(b.arg);
    if (b.name === 'exp' || b.name === 'apow') { const t = `${b.name === 'exp' ? 'e' : b.a0}^{${a}}`; return n ? `\\left(${t}\\right)^{${n}}` : t; }
    if (b.name === 'loga') { const t = `\\log_{${b.a0}}${simple ? ' x' : wrap(a)}`; return n ? `\\left(${t}\\right)^{${n}}` : t; }
    const nm = FT[b.name] + (n ? `^{${n}}` : '');
    return simple ? `${nm} x` : `${nm}${wrap(a)}`;
  }
  function ftex(f, e, alone) {
    const b = f.b;
    if (b.k === 'c') return fone(e) ? `\\ln ${b.a0}` : `(\\ln ${b.a0})^{${ftexE(e)}}`;
    const inner = () => b.k === 'x' ? 'x' : b.k === 'fn' ? fnTex(b) : tex(b.s);
    if (e.p === 1 && e.q === 2) return `\\sqrt{${inner()}}`;
    if (e.p === 1 && e.q === 3) return `\\sqrt[3]{${inner()}}`;
    if (b.k === 'fn') { if (fone(e)) return fnTex(b); if (e.q === 1) return fnTex(b, e.p); return `\\left(${fnTex(b)}\\right)^{${ftexE(e)}}`; }
    if (b.k === 'x') {
      if (fone(e)) return 'x';
      const k = Math.floor(e.p / e.q), r = e.p % e.q, xk = k === 0 ? '' : k === 1 ? 'x' : `x^{${k}}`;
      if (e.q === 2) return `${xk}\\sqrt{x}`;
      if (e.q === 3) return `${xk}\\sqrt[3]{${r === 1 ? 'x' : 'x^{2}'}}`;
      if (e.q === 4 && k === 0) return `\\sqrt[4]{${r === 1 ? 'x' : `x^{${r}}`}}`;
      return `x^{${ftexE(e)}}`;
    }
    if (fone(e)) return alone ? tex(b.s) : `\\left(${tex(b.s)}\\right)`;
    { const B = tex(b.s), P2 = `\\left(${B}\\right)`, k = Math.floor(e.p / e.q), r = e.p % e.q, pk2 = k === 0 ? '' : k === 1 ? P2 : `${P2}^{${k}}`;
      if (e.q === 2) return `${pk2}\\sqrt{${B}}`;
      if (e.q === 3) return `${pk2}\\sqrt[3]{${r === 1 ? B : `${P2}^{2}`}}`; }
    return `\\left(${tex(b.s)}\\right)^{${ftexE(e)}}`;
  }
  const RANK = { c: 8, x: 2, sum: 3, exp: 4, apow: 4.5, sin: 5, cos: 5, tan: 5, cot: 5, sinh: 5, cosh: 5, ln: 6, loga: 6, asin: 7, acos: 7, atan: 7 };
  const rank = b => b.k === 'fn' ? RANK[b.name] : RANK[b.k];
  function joinF(arr) { return arr.reduce((out, s, i) => !i ? s : out + (/^\d/.test(s) ? '\\cdot ' : s.startsWith('\\') && !s.startsWith('\\left') ? '\\,' : '') + s, ''); }
  function ttex(t, solo) {
    const neg = t.c.p < 0, P = Math.abs(t.c.p), Q = t.c.q;
    const fs = [...t.f].sort((a, b) => rank(a.b) - rank(b.b));
    const nF = fs.filter(f => f.e.p > 0), dF = fs.filter(f => f.e.p < 0);
    const hasDen = dF.length > 0 || Q !== 1;
    let ns = joinF(nF.map(f => ftex(f, f.e, nF.length === 1 && P === 1 && (hasDen || (solo && !neg)))));
    let ds = joinF(dF.map(f => ftex(f, fneg(f.e), dF.length === 1 && Q === 1)));
    if (P !== 1 || !ns) ns = `${P}` + (ns ? (/^\d/.test(ns) ? `\\cdot ${ns}` : ns) : '');
    if (Q !== 1) ds = `${Q}` + (ds ? (/^\d/.test(ds) ? `\\cdot ${ds}` : ds) : '');
    return { neg, body: ds ? `\\frac{${ns}}{${ds}}` : ns };
  }
  function tex(s) {
    if (!s.length) return '0';
    return s.map((t, i) => { const { neg, body } = ttex(t, s.length === 1); return i ? (neg ? ' - ' : ' + ') + body : (neg ? '-' : '') + body; }).join('');
  }

  /* ---------- Àlgebra ---------- */
  function powT(t, n) {
    n = toF(n);
    if (n.q !== 1 && !fone(t.c)) return null;
    return Tm(n.q === 1 ? fpow(t.c, n.p) : F(1), t.f.map(f => ({ b: f.b, e: fmul(f.e, n) })).filter(f => !fz(f.e)));
  }
  function facT(s, e) { /* (suma)^e com a terme, aplanant si és un sol terme */
    e = toF(e);
    if (!s.length) return Tm(0);
    if (s.length === 1) { const p = powT(s[0], e); if (p) return p; }
    return Tm(1, [fac(sumB(s), e)]);
  }
  function mulT(a, b) {
    const fs = a.f.map(f => ({ ...f }));
    b.f.forEach(g => { const k = bkey(g.b), h = fs.find(f => bkey(f.b) === k); if (h) h.e = fadd(h.e, g.e); else fs.push({ ...g }); });
    return Tm(fmul(a.c, b.c), fs.filter(f => !fz(f.e)));
  }
  function addLike(s) {
    const out = [];
    s.forEach(t => { if (fz(t.c)) return; const k = sig(t), o = out.find(u => sig(u) === k); if (o) o.c = fadd(o.c, t.c); else out.push({ c: t.c, f: t.f }); });
    return out.filter(t => !fz(t.c));
  }
  const add = (...ss) => addLike(ss.flat());
  const scale = (s, c) => s.map(t => Tm(fmul(t.c, toF(c)), t.f)).filter(t => !fz(t.c));
  const neg = s => scale(s, -1);
  const sub = (a, b) => add(a, neg(b));
  function mulS(A, B) {
    if (!A.length || !B.length) return [];
    if (A.length === 1 && B.length === 1) return [mulT(A[0], B[0])];
    if (A.length === 1) return [mulT(A[0], facT(B, 1))];
    if (B.length === 1) return [mulT(facT(A, 1), B[0])];
    return [Tm(1, [fac(sumB(A), 1), fac(sumB(B), 1)])];
  }
  const powS = (s, n) => [facT(s, n)];
  const divS = (a, b) => mulS(a, powS(b, -1));
  function expand(s) {
    const out = [];
    s.forEach(t => {
      let acc = [Tm(t.c)];
      t.f.forEach(f => {
        if (f.b.k === 'sum' && f.e.q === 1 && f.e.p > 0 && f.e.p <= 4) { const inner = expand(f.b.s); for (let k = 0; k < f.e.p; k++) acc = acc.flatMap(a => inner.map(b => mulT(a, b))); }
        else acc = acc.map(a => mulT(a, Tm(1, [f])));
      });
      out.push(...acc);
    });
    return addLike(out);
  }
  const X = [Tm(1, [fac(XB, 1)])];
  const mono = (c, n) => { n = toF(n); return fz(toF(c)) ? [] : fz(n) ? [Tm(c)] : [Tm(c, [fac(XB, n)])]; };
  const K = c => fz(toF(c)) ? [] : [Tm(c)];
  const fn = (name, arg = X, a0) => [Tm(1, [fac(fnB(name, arg, a0), 1)])];
  const degOf = t => { const f = t.f.find(g => g.b.k === 'x'); return t.f.length === 0 ? -99 : f && t.f.length === 1 ? f.e.p / f.e.q : -50; };
  const byDeg = s => [...s].sort((a, b) => degOf(b) - degOf(a));
  const isPoly = s => s.every(t => t.f.every(f => f.b.k === 'x' && f.e.q === 1 && f.e.p > 0));

  /* ---------- Derivada (amb «errors típics» per als distractors) ---------- */
  let FL = {};
  function dOuter(b) {
    const a = b.arg, sq = () => powS(a, 2);
    switch (b.name) {
      case 'sin': return fn('cos', a);
      case 'cos': return FL.trigSign ? fn('sin', a) : neg(fn('sin', a));
      case 'tan': return [Tm(1, [fac(fnB('cos', a), -2)])];
      case 'cot': return [Tm(-1, [fac(fnB('sin', a), -2)])];
      case 'sinh': return fn('cosh', a);
      case 'cosh': return fn('sinh', a);
      case 'exp': return [Tm(1, [fac(b, 1)])];
      case 'apow': return [Tm(1, FL.noLnA ? [fac(b, 1)] : [fac(b, 1), fac(lnC(b.a0), 1)])];
      case 'ln': return [facT(a, -1)];
      case 'loga': return [mulT(facT(a, -1), Tm(1, FL.noLnA ? [] : [fac(lnC(b.a0), -1)]))];
      case 'asin': return powS(sub(K(1), sq()), F(-1, 2));
      case 'acos': return neg(powS(sub(K(1), sq()), F(-1, 2)));
      case 'atan': return powS(add(K(1), sq()), -1);
    }
    throw new Error('fn ' + b.name);
  }
  function dBase(b) {
    if (b.k === 'x') return K(1);
    if (b.k === 'c') return [];
    if (b.k === 'sum') return dS(b.s);
    const o = dOuter(b);
    return FL.noChain && !isX(b.arg) ? o : mulS(o, dS(b.arg));
  }
  function dFac(f) {
    if (f.b.k === 'c') return [];
    const e1 = FL.noLower && (f.b.k !== 'fn' || !fone(f.e)) ? f.e : fadd(f.e, F(-1));
    const head = [Tm(f.e, fz(e1) ? [] : [fac(f.b, e1)])];
    if (f.b.k === 'sum' && FL.noChain) return head;
    return mulS(head, dBase(f.b));
  }
  function dT(t) {
    const vf = t.f.filter(f => f.b.k !== 'c');
    if (FL.prodWrong && vf.length > 1) return t.f.reduce((acc, f) => f.b.k === 'c' ? mulS(acc, [Tm(1, [f])]) : mulS(acc, dFac(f)), [Tm(t.c)]);
    const out = [];
    t.f.forEach((f, i) => { const rest = [Tm(t.c, t.f.filter((_, j) => j !== i))]; out.push(...mulS(rest, dFac(f))); });
    return out;
  }
  const dS = s => addLike(s.flatMap(dT));
  function dWith(flags, s) { const prev = FL; FL = flags; try { return dS(s); } catch (e) { return null; } finally { FL = prev; } }

  /* ---------- Comprovació numèrica ---------- */
  const CMP = {};
  function ev(code, x) {
    try { const c = CMP[code] || (CMP[code] = math.compile(code)); const r = c.evaluate({ x }); return typeof r === 'number' && isFinite(r) ? r : NaN; } catch (e) { return NaN; }
  }
  const PTS = dom => [0.11, 0.27, 0.42, 0.55, 0.69, 0.83, 0.95].map(t => dom[0] + t * (dom[1] - dom[0]));
  const vec = (code, dom) => PTS(dom).map(x => ev(code, x));
  function same(u, v) { let n = 0; for (let i = 0; i < u.length; i++) { if (!isFinite(u[i]) || !isFinite(v[i])) continue; n++; if (Math.abs(u[i] - v[i]) > 1e-6 * (1 + Math.abs(u[i]))) return false; } return n >= 4; }
  const finiteN = v => v.filter(isFinite).length;
  function derivOk(fCode, eCode, dom) {
    let n = 0;
    for (const x of PTS(dom)) {
      const h = 1e-5, d = (ev(fCode, x + h) - ev(fCode, x - h)) / (2 * h), e = ev(eCode, x);
      if (!isFinite(d) || !isFinite(e)) continue; n++;
      if (Math.abs(d - e) > 2e-4 * (1 + Math.abs(e))) return false;
    }
    return n >= 5;
  }

  /* ---------- Constructor d'exercicis ---------- */
  const ERRS = ['noLower', 'noChain', 'trigSign', 'prodWrong', 'noLnA'];
  function pickW(dVec, cands, dom) {
    const seen = [dVec], w = [], texs = new Set();
    for (const c of cands) {
      if (w.length === 3) break;
      if (!c || !c.t || texs.has(c.t)) continue;
      const v = vec(c.j, dom);
      if (finiteN(v) < 4 || seen.some(u => same(u, v))) continue;
      seen.push(v); texs.add(c.t); w.push(c.t);
    }
    return w.length === 3 ? w : null;
  }
  const asC = s => s && (s.t ? s : { t: tex(s), j: js(s) });
  function generic(d) {
    const out = [];
    if (d.length > 1) d.forEach((t, i) => { out.push(d.map((u, j) => j === i ? Tm(fneg(u.c), u.f) : u)); out.push(d.filter((_, j) => j !== i)); });
    out.push(neg(d), scale(d, 2), mulS(d, X), scale(d, F(1, 2)));
    return shuffle(out);
  }
  /* f: Sum; o: { d, aTex, aJs, extra:[Sum|{t,j}], errs, dom, s(ctx), ask, pre, check } */
  function mk(f, o = {}) {
    const d = o.d || dS(f), dom = o.dom || [0.3, 1.2];
    const fJ = js(f), aJ = o.aJs || js(d), aT = o.aTex || tex(d);
    if (!o.noCheck && !derivOk(o.check || fJ, aJ, dom)) return null;
    const dVec = vec(aJ, dom); if (finiteN(dVec) < 5) return null;
    const errs = (o.errs || ERRS).map(fl => o.d ? null : dWith({ [fl]: 1 }, f)).filter(Boolean).map(asC);
    const w = pickW(dVec, [...(o.extra || []).map(asC), ...errs, ...generic(d).map(asC)], dom);
    if (!w) return null;
    const p = { t: 'd', q: 'f(x)=' + tex(f), a: aT, e: aJ, f: fJ, w, dom };
    if (o.ask) p.ask = o.ask;
    if (o.pre) p.pre = o.pre;
    p.s = o.s ? o.s({ f, d, aT }) : [T`Aplica la regla: $\left(${tex(f)}\right)'=${aT}$`];
    return p;
  }
  const termSteps = (f, intro) => [intro || 'Deriva terme a terme (la derivada d\'una suma és la suma de derivades).',
    ...f.slice(0, 4).map(t => `$\\left(${tex([t])}\\right)'=${tex(dS([t]))}$`)];

  /* ---------- Aleatori ---------- */
  const ri = (a, b) => a + rnd(b - a + 1);
  const nz = (a, b) => (Math.random() < .5 ? -1 : 1) * ri(a, b);
  const pos = (a, b) => ri(a, b);
  const pk = a => pick(a);
  function polyR(deg, nTerms, o = {}) {
    const exps = shuffle(Array.from({ length: deg }, (_, k) => k + 1)).slice(0, Math.max(1, nTerms - 1));
    if (!exps.includes(deg)) exps[0] = deg;
    let s = [...new Set(exps)].sort((a, b) => b - a).map(n => mono(o.positive ? pos(1, 6) : nz(1, 7), n)).flat();
    if (nTerms > s.length) s = s.concat(K(o.positive ? pos(1, 9) : nz(1, 9)));
    return addLike(s);
  }
  const lin = (o = {}) => add(mono(o.positive ? pos(2, 6) : nz(2, 6), 1), o.c || Math.random() < .7 ? K(o.positive ? pos(1, 7) : nz(1, 7)) : []);
  const posQuad = () => add(mono(pos(1, 4), 2), Math.random() < .5 ? mono(pos(1, 5), 1) : [], K(pos(1, 6)));

  /* ======================= GENERADORS ======================= */
  const G = {};
  /* --- Nivell 0: bàsiques --- */
  G.k = () => {
    const kind = pk(['c', 'c', 'x', 'cx', 'cx', 'cxb', 'cst']);
    if (kind === 'cst') {
      const c = pk([['\\pi', 'pi'], ['e^{2}', 'e^2'], ['\\sqrt{3}', 'sqrt(3)'], ['\\ln 5', 'log(5)'], ['\\pi^{2}', 'pi^2'], ['\\sin\\frac{\\pi}{6}', 'sin(pi/6)']]);
      return { t: 'd', q: `f(x)=${c[0]}`, a: '0', e: '0', f: c[1], w: [c[0], '1', `${c[0]}\\,x`], s: [T`$${c[0]}$ és un número fix: no depèn de $x$.`, T`La derivada d'una constant és $0$.`] };
    }
    const c = nz(2, 12), b = nz(1, 15);
    if (kind === 'c') return mk(K(c), { extra: [K(c), K(1), mono(c, 1)], s: () => [T`$${c}$ és una constant: no canvia quan canvia $x$.`, T`La derivada d'una constant és $0$.`] });
    if (kind === 'x') return mk(X, { extra: [K(0), mono(1, 1), mono(2, 1)], s: () => [T`La recta $y=x$ té pendent $1$.`, T`$(x)'=1$`] });
    if (kind === 'cx') return mk(mono(c, 1), { extra: [K(1), mono(c, 1), K(0), mono(1, 1)], s: () => [T`La constant multiplica i es queda: $(c\,x)'=c\cdot(x)'=c$.`, T`$(${tex(mono(c, 1))})'=${c}$`] });
    return mk(add(mono(c, 1), K(b)), { extra: [K(c + b), add(mono(c, 1), K(b)), K(b), mono(c, 1)], s: f => [T`Terme a terme: $(${tex(mono(c, 1))})'=${c}$`, T`I la constant: $(${b})'=0$.`, T`$f'(x)=${c}$`] });
  };
  G.pow = () => {
    const n = ri(2, 12);
    return mk(mono(1, n), { extra: [mono(1, n - 1), mono(n, n + 1), mono(n - 1, n - 1)], s: () => [T`Regla de la potència: $(x^n)'=n\,x^{n-1}$.`, T`Aquí $n=${n}$: baixa el ${n} i resta 1 a l'exponent.`, T`$f'(x)=${tex(mono(n, n - 1))}$`] });
  };
  G.cpow = () => {
    const n = ri(2, 8);
    const c = Math.random() < .25 ? F(pk([1, 1, 2, 3]) * (Math.random() < .3 ? -1 : 1), n) : F(nz(2, 9));
    return mk(mono(c, n), { extra: [mono(c, n - 1), mono(n, n - 1), mono(fmul(c, F(n - 1)), n - 1)], s: f => [T`La constant es queda multiplicant: $(c\,x^n)'=c\cdot n\,x^{n-1}$.`, T`$${tex(f)}\;\to\;${ftexE(c)}\cdot ${n}\,x^{${n - 1}}$`, T`$f'(x)=${tex(mono(fmul(c, F(n)), n - 1))}$`] });
  };
  G.neg = () => {
    const n = ri(1, 5), kind = pk(['c', 'c', 'inv']);
    const c = kind === 'inv' ? F(1, pos(2, 5)) : F(nz(1, 8));
    const f = mono(c, -n), d = mono(fmul(c, F(-n)), -n - 1);
    return mk(f, {
      extra: [mono(fmul(c, F(-n)), -n + 1), mono(fmul(c, F(n)), -n - 1), mono(c, -n - 1)],
      s: () => [T`Reescriu com a potència: $${tex(f)}=${ftexE(c)}\,x^{-${n}}$`, T`Regla de la potència amb $n=-${n}$: l'exponent passa a $-${n}-1=-${n + 1}$.`, T`$f'(x)=${ftexE(c)}\cdot(-${n})\,x^{-${n + 1}}=${tex(d)}$`],
    });
  };
  G.root = () => {
    const kind = pk(['sqrt', 'csqrt', 'cbrt', 'invsqrt', 'frac']);
    let e, c = F(1);
    if (kind === 'sqrt') e = F(1, 2);
    else if (kind === 'csqrt') { e = F(1, 2); c = F(nz(2, 8)); }
    else if (kind === 'cbrt') e = F(1, 3);
    else if (kind === 'invsqrt') { e = F(-1, 2); c = F(pk([1, 2, 4, -2])); }
    else e = pk([F(3, 2), F(2, 3), F(5, 2), F(4, 3), F(3, 4)]);
    const f = mono(c, e), e1 = fadd(e, F(-1));
    return mk(f, {
      extra: [mono(c, fadd(e, F(1))), mono(fmul(c, e), e), mono(c, e1), mono(c, F(-1, 2))],
      s: () => [T`Escriu l'arrel com a potència: $${tex(f)}=${fone(c) ? '' : ftexE(c)}x^{${ftexE(e)}}$`, T`Baixa l'exponent i resta 1: $${ftexE(e)}-1=${ftexE(e1)}$`, T`$f'(x)=${tex(mono(fmul(c, e), e1))}$`],
    });
  };
  G.poly = () => {
    const f = polyR(ri(2, 6), ri(2, 4));
    const keepC = add(dS(f), f.filter(t => !t.f.length));
    return mk(f, { extra: [keepC], s: () => [...termSteps(f), T`Les constants desapareixen: $f'(x)=${tex(dS(f))}$`] });
  };
  G.alg = () => {
    const parts = shuffle([mono(nz(1, 6), ri(2, 5)), mono(nz(1, 6), -ri(1, 3)), mono(nz(1, 6), pk([F(1, 2), F(1, 3), F(3, 2), F(-1, 2)])), K(nz(1, 9))]).slice(0, ri(2, 3));
    const f = byDeg(add(...parts));
    return mk(f, { s: () => [T`Primer reescriu tot com a potències de $x$: $\frac{1}{x^n}=x^{-n}$, $\sqrt[q]{x^p}=x^{p/q}$.`, ...termSteps(f, 'Després, regla de la potència a cada terme:').slice(1), T`$f'(x)=${tex(dS(f))}$`] });
  };
  /* --- Nivell 1: elementals --- */
  const exT = c => ({ t: `${c === 1 ? '' : c === -1 ? '-' : c}x\\,e^{x-1}`, j: `${c}*x*exp(x-1)` });
  G.exp = () => {
    const c = pk([1, 1, nz(2, 7)]), kind = pk(['solo', 'mix', 'mix2']);
    const E = scale(fn('exp'), c);
    const f = kind === 'solo' ? E : kind === 'mix' ? add(E, mono(nz(1, 6), ri(2, 4))) : add(mono(nz(1, 5), ri(1, 3)), E, K(nz(1, 9)));
    return mk(f, { extra: [exT(c), mulS(E, X)], s: () => [T`$e^x$ és especial: la seva derivada és ella mateixa, $(e^x)'=e^x$.`, ...termSteps(f).slice(1), T`$f'(x)=${tex(dS(f))}$`] });
  };
  G.ln = () => {
    const kind = pk(['c', 'c', 'mix', 'prop', 'cx']);
    const c = pk([1, nz(2, 8)]);
    let f, s;
    if (kind === 'c') { f = scale(fn('ln'), c); s = [T`$(\ln x)'=\frac{1}{x}$`, T`La constant es queda: $f'(x)=${tex(dS(f))}$`]; }
    else if (kind === 'mix') { f = add(scale(fn('ln'), c), mono(nz(1, 6), ri(2, 4)), K(nz(1, 9))); s = [...termSteps(f), T`$f'(x)=${tex(dS(f))}$`]; }
    else if (kind === 'prop') { const n = ri(2, 7); f = fn('ln', mono(1, n)); s = [T`Propietat dels logaritmes: $\ln x^{${n}}=${n}\ln x$.`, T`$f'(x)=${n}\cdot\frac1x=${tex(dS(f))}$`]; }
    else { const a = pos(2, 9); f = fn('ln', mono(a, 1)); s = [T`Propietat: $\ln(${a}x)=\ln ${a}+\ln x$, i $\ln ${a}$ és una constant.`, T`$f'(x)=0+\frac1x=\frac{1}{x}$`]; }
    return mk(f, { extra: [scale(mono(1, 1), c), mono(c, -2)], s: () => s });
  };
  G.ax = () => {
    const a = pk([2, 3, 5, 10, 7]), c = pk([1, 1, nz(2, 5)]), kind = pk(['a', 'a', 'log', 'mix']);
    let f;
    if (kind === 'a') f = scale(fn('apow', X, a), c);
    else if (kind === 'log') f = scale(fn('loga', X, a), c);
    else f = add(scale(fn('apow', X, a), c), scale(fn('loga', X, pk([2, 3, 10])), nz(1, 4)));
    const ex = kind === 'a' ? [{ t: `${c === 1 ? '' : c}x\\cdot ${a}^{x-1}`, j: `${c}*x*${a}^(x-1)` }, [Tm(c, [fac(fnB('apow', X, a), 1), fac(lnC(a), -1)])]] : kind === 'log' ? [mono(c, -1), [Tm(c, [fac(lnC(a), 1), fac(XB, -1)])]] : [];
    return mk(f, { extra: ex, s: () => [T`$(a^x)'=a^x\ln a$ i $(\log_a x)'=\frac{1}{x\ln a}$.`, ...(f.length > 1 ? termSteps(f).slice(1) : []), T`$f'(x)=${tex(dS(f))}$`] });
  };
  G.trig = () => {
    const kind = pk(['sin', 'cos', 'both', 'mix']), a = pk([1, nz(2, 7)]), b = pk([1, nz(2, 7)]);
    const f = kind === 'sin' ? scale(fn('sin'), a) : kind === 'cos' ? scale(fn('cos'), a) : kind === 'both' ? add(scale(fn('sin'), a), scale(fn('cos'), b)) : add(scale(fn(pk(['sin', 'cos'])), a), mono(nz(1, 5), ri(1, 3)));
    const swap = f.map(t => t.f[0] && t.f[0].b.k === 'fn' ? Tm(t.c, [fac(fnB(t.f[0].b.name === 'sin' ? 'cos' : 'sin', X), 1)]) : t);
    return mk(f, { extra: [swap], s: () => [T`$(\sin x)'=\cos x$ i $(\cos x)'=-\sin x$ (compte amb el signe!).`, ...(f.length > 1 ? termSteps(f).slice(1) : []), T`$f'(x)=${tex(dS(f))}$`] });
  };
  G.tan = () => {
    const kind = pk(['tan', 'tan', 'cot', 'mix']), c = pk([1, nz(2, 6)]);
    const f = kind === 'tan' ? scale(fn('tan'), c) : kind === 'cot' ? scale(fn('cot'), c) : add(scale(fn('tan'), c), scale(fn(pk(['sin', 'cos'])), nz(1, 5)));
    return mk(f, {
      extra: [[Tm(c, [fac(fnB('sin', X), -2)])], [Tm(-c, [fac(fnB('cos', X), -2)])], [Tm(c, [fac(fnB('cos', X), -1)])], [Tm(c, [fac(fnB('tan', X), 2)])]],
      s: () => [T`$(\tan x)'=\frac{1}{\cos^2 x}=1+\tan^2 x$ i $(\cot x)'=-\frac{1}{\sin^2 x}$.`, ...(f.length > 1 ? termSteps(f).slice(1) : []), T`$f'(x)=${tex(dS(f))}$`],
    });
  };
  G.arc = () => {
    const name = pk(['asin', 'acos', 'atan', 'atan']), c = pk([1, 1, nz(2, 5)]);
    const f = scale(fn(name), c);
    const r1 = powS(sub(K(1), mono(1, 2)), F(-1, 2)), r2 = powS(add(K(1), mono(1, 2)), -1);
    return mk(f, {
      dom: [0.1, 0.8],
      extra: [scale(r1, -c), scale(r2, c), scale(powS(sub(K(1), mono(1, 2)), -1), c), scale(powS(add(K(1), mono(1, 2)), F(-1, 2)), c), scale(r1, c)],
      s: () => [T`$(\arcsin x)'=\frac{1}{\sqrt{1-x^2}}$, $(\arccos x)'=-\frac{1}{\sqrt{1-x^2}}$, $(\arctan x)'=\frac{1}{1+x^2}$.`, T`$f'(x)=${tex(dS(f))}$`],
    });
  };
  const ELEM = [() => mono(nz(1, 6), ri(2, 5)), () => scale(fn('exp'), nz(1, 5)), () => scale(fn('ln'), nz(1, 5)), () => scale(fn('sin'), nz(1, 5)), () => scale(fn('cos'), nz(1, 5)),
    () => scale(fn('tan'), nz(1, 3)), () => mono(nz(1, 5), F(1, 2)), () => mono(nz(1, 5), -1), () => scale(fn('apow', X, pk([2, 3])), nz(1, 3)), () => scale(fn('atan'), nz(1, 3))];
  G.elem = () => {
    const f = add(...shuffle(ELEM).slice(0, ri(2, 4)).map(g => g()));
    return mk(f, { dom: [0.2, 0.9], s: () => [...termSteps(f), T`$f'(x)=${tex(dS(f))}$`] });
  };
  /* --- Nivell 2: producte i quocient --- */
  const U_SIMPLE = [() => X, () => mono(1, ri(2, 4)), () => mono(nz(2, 5), ri(1, 3)), () => mono(1, F(1, 2))];
  const V_ELEM = [() => fn('exp'), () => fn('sin'), () => fn('cos'), () => fn('ln'), () => fn('apow', X, 2), () => fn('atan')];
  const prodSteps = (u, v) => () => {
    const du = dS(u), dv = dS(v);
    return [T`Producte: $(u\,v)'=u'\,v+u\,v'$ amb $u=${tex(u)}$, $v=${tex(v)}$.`, T`$u'=${tex(du)}$, $\;v'=${tex(dv)}$`, T`$f'(x)=${tex(add(mulS(du, v), mulS(u, dv)))}$`];
  };
  function prodQ(u, v, o = {}) {
    const f = mulS(u, v), du = dS(u), dv = dS(v);
    return mk(f, { dom: o.dom, extra: [mulS(du, dv), sub(mulS(du, v), mulS(u, dv)), add(mulS(du, v), mulS(u, v))], s: prodSteps(u, v) });
  }
  G.prod = () => {
    const kind = pk(['uv', 'uv', 'uv', 'poly', 'two']);
    if (kind === 'poly') return prodQ(polyR(2, 2, { positive: true }), pk(V_ELEM)());
    if (kind === 'two') { const [a, b] = shuffle(V_ELEM).slice(0, 2).map(g => g()); return prodQ(a, b); }
    return prodQ(pk(U_SIMPLE)(), pk(V_ELEM)());
  };
  function quotQ(u, v, o = {}) {
    const du = dS(u), dv = dS(v), poly = isPoly(u) && isPoly(v);
    let num = sub(mulS(du, v), mulS(u, dv)); if (poly) num = expand(num);
    const den = powS(v, 2), f = divS(u, v);
    const tq = (n, dn) => n.length === 1 && n[0].c.p < 0 ? `-\\frac{${tex(neg(n))}}{${tex(dn)}}` : `\\frac{${tex(n)}}{${tex(dn)}}`, jq = (n, dn) => `(${js(n)})/(${js(dn)})`;
    let numW = sub(mulS(u, dv), mulS(du, v)); if (poly) numW = expand(numW);
    let numP = add(mulS(du, v), mulS(u, dv)); if (poly) numP = expand(numP);
    return mk(f, {
      dom: o.dom, d: dS(f), aTex: tq(num, den), aJs: jq(num, den),
      extra: [{ t: tq(numW, den), j: jq(numW, den) }, { t: tq(num, v), j: jq(num, v) }, { t: tq(numP, den), j: jq(numP, den) }, du.length && dv.length ? { t: tq(du, dv), j: jq(du, dv) } : null, { t: tq(neg(num), den), j: jq(neg(num), den) }, { t: tq(scale(num, 2), den), j: jq(scale(num, 2), den) }],
      s: () => [T`Quocient: $\left(\frac uv\right)'=\frac{u'v-u\,v'}{v^2}$ amb $u=${tex(u)}$, $v=${tex(v)}$.`, T`$u'=${tex(du)}$, $\;v'=${tex(dv)}$`, T`Numerador: $${tex(sub(mulS(du, v), mulS(u, dv)))}${poly ? `=${tex(num)}` : ''}$`, T`$f'(x)=${tq(num, den)}$`],
    });
  }
  const DEN = [() => lin({ positive: true, c: true }), () => posQuad(), () => mono(1, ri(1, 3)), () => fn('exp'), () => add(X, K(pos(1, 4)))];
  G.quot = () => {
    const kind = pk(['pp', 'pp', 'fe', 'ef']);
    if (kind === 'pp') return quotQ(pk([() => X, () => mono(1, 2), () => lin({ c: true }), () => K(pos(1, 5)), () => add(mono(1, 2), K(nz(1, 5)))])(), pk(DEN.slice(0, 2))());
    if (kind === 'fe') return quotQ(pk(V_ELEM.slice(0, 4))(), pk([() => X, () => mono(1, 2), () => lin({ positive: true })])());
    return quotQ(pk([() => X, () => mono(1, 2), () => K(pos(1, 5))])(), pk([() => fn('exp'), () => fn('ln'), () => add(X, K(pos(1, 4)))])(), { dom: [1.2, 2.4] });
  };
  G.pq = () => {
    const kind = pk(['p3', 'pq', 'qp', 'q2']);
    if (kind === 'p3') return prodQ(mulS(pk(U_SIMPLE)(), fn('exp')), fn(pk(['sin', 'cos'])));
    if (kind === 'pq') return quotQ(mulS(X, pk(V_ELEM.slice(0, 3))()), pk(DEN.slice(0, 2))());
    if (kind === 'qp') return prodQ(pk(V_ELEM.slice(0, 4))(), pk([() => polyR(2, 3, { positive: true }), () => mono(1, F(1, 2))])());
    return quotQ(fn(pk(['sin', 'cos', 'ln'])), add(fn('exp'), K(1)));
  };
  /* --- Nivell 3: regla de la cadena --- */
  const OUTER = {
    sin: g => fn('sin', g), cos: g => fn('cos', g), tan: g => fn('tan', g), exp: g => fn('exp', g), ln: g => fn('ln', g),
    pow: g => powS(g, ri(2, 9)), sqrt: g => powS(g, F(1, 2)), cbrt: g => powS(g, F(1, 3)), ipow: g => powS(g, -ri(1, 4)), isqrt: g => powS(g, F(-1, 2)),
    atan: g => fn('atan', g), asin: g => fn('asin', g), apow: g => fn('apow', g, pk([2, 3, 10])), loga: g => fn('loga', g, pk([2, 3, 10])),
  };
  function chainSteps(f, g, label) {
    return () => {
      const dg = dS(g);
      return [T`Cadena: $\big(f(g(x))\big)'=f'(g(x))\cdot g'(x)$.`, T`Capa de dins: $g(x)=${tex(g)}$, $\;g'(x)=${tex(dg)}$`,
        T`Capa de fora: ${label}. La derives deixant $g(x)$ a dins tal com està.`, T`Multiplica per $g'(x)$: $f'(x)=${tex(dS(f))}$`];
    };
  }
  const LBL = { sin: '$\\sin(\\square)$', cos: '$\\cos(\\square)$', tan: '$\\tan(\\square)$', exp: '$e^{\\square}$', ln: '$\\ln(\\square)$', pow: '$(\\square)^n$', sqrt: '$\\sqrt{\\square}$', cbrt: '$\\sqrt[3]{\\square}$', ipow: '$\\frac{1}{(\\square)^n}$', isqrt: '$\\frac{1}{\\sqrt{\\square}}$', atan: '$\\arctan(\\square)$', asin: '$\\arcsin(\\square)$', apow: '$a^{\\square}$', loga: '$\\log_a(\\square)$' };
  function chainQ(outer, g, o = {}) {
    const f = OUTER[outer](g);
    const dg = dS(g);
    const extra = [];
    const dgVar = dg.some(t => t.f.length);
    if (dgVar && ['sin', 'cos', 'exp', 'ln', 'tan', 'atan'].includes(outer)) extra.push(OUTER[outer](dg));
    if (outer === 'exp') extra.push(mulS(g, fn('exp', add(g, K(-1)))));
    if (outer === 'ln') extra.push(powS(dg, -1), mulS(dg, powS(g, -2)));
    return mk(f, { dom: o.dom, extra, s: chainSteps(f, g, LBL[outer]) });
  }
  G.ch1 = () => {
    const outer = pk(['sin', 'cos', 'exp', 'exp', 'ln', 'pow', 'sqrt', 'tan', 'ipow']);
    const g = ['ln', 'sqrt'].includes(outer) ? lin({ positive: true, c: true }) : ['pow', 'ipow'].includes(outer) ? lin({ c: true }) : outer === 'tan' ? mono(pk([2, 3, F(1, 2)]), 1) : pk([() => mono(nz(2, 9), 1), () => lin()])();
    return chainQ(outer, g, { dom: outer === 'tan' ? [0.1, 0.5] : undefined });
  };
  G.chpow = () => {
    const g = pk([() => polyR(2, 2), () => polyR(3, 2), () => polyR(2, 3), () => add(mono(1, 2), K(nz(1, 6)))])();
    return chainQ(pk(['pow', 'pow', 'pow', 'ipow']), g, { dom: [0.3, 1.2] });
  };
  G.chroot = () => {
    const g = pk([() => posQuad(), () => add(mono(pos(1, 3), 3), K(pos(1, 5))), () => lin({ positive: true, c: true }), () => add(mono(1, 2), K(pos(1, 9)))])();
    return chainQ(pk(['sqrt', 'sqrt', 'cbrt', 'isqrt']), g);
  };
  G.chexp = () => {
    const g = pk([() => mono(nz(2, 6), ri(2, 3)), () => polyR(2, 2), () => mono(1, F(1, 2)), () => mono(nz(1, 3), -1), () => fn('sin'), () => fn('cos')])();
    return chainQ('exp', g);
  };
  G.chln = () => {
    const g = pk([() => posQuad(), () => add(mono(pos(1, 3), 3), K(pos(1, 5))), () => add(mono(1, 2), K(pos(1, 9))), () => add(fn('exp'), K(pos(1, 3)))])();
    return chainQ('ln', g);
  };
  G.chtrig = () => {
    const outer = pk(['sin', 'cos', 'sin', 'cos', 'tan']);
    const g = outer === 'tan' ? mono(pk([1, 2]), 2) : pk([() => mono(nz(1, 4), ri(2, 3)), () => polyR(2, 2), () => mono(1, F(1, 2)), () => mono(1, -1), () => fn('exp'), () => fn('ln')])();
    return chainQ(outer, g, { dom: outer === 'tan' ? [0.1, 0.7] : undefined });
  };
  G.charc = () => {
    const kind = pk(['atan', 'atan', 'asin']);
    if (kind === 'asin') { const a = pk([2, 3]); return chainQ('asin', mono(a, 1), { dom: [0.05, 0.9 / a] }); }
    return chainQ('atan', pk([() => mono(nz(2, 5), 1), () => mono(1, 2), () => lin(), () => fn('exp'), () => mono(1, F(1, 2))])());
  };
  G.chsinn = () => {
    const nm = pk(['sin', 'cos', 'sin', 'cos', 'tan']), n = ri(2, 6), arg = pk([X, X, mono(pk([2, 3]), 1)]);
    const inner = fn(nm, arg), f = powS(inner, n);
    return mk(f, { dom: nm === 'tan' ? [0.1, 0.6] : undefined, extra: [scale(powS(fn(nm === 'sin' ? 'cos' : 'sin', arg), n - 1), n)], s: chainSteps(f, inner, '$(\\square)^{' + n + '}$') });
  };
  G.chax = () => {
    const kind = pk(['apow', 'apow', 'loga']);
    const g = kind === 'apow' ? pk([() => mono(nz(2, 5), 1), () => mono(1, 2), () => fn('sin')])() : pk([() => posQuad(), () => mono(pos(2, 5), 1), () => add(mono(1, 3), K(pos(1, 4)))])();
    return chainQ(kind, g);
  };
  G.ch2 = () => {
    const a = pk([2, 3, 4]), L = () => pk([X, mono(a, 1), lin({ positive: true, c: true })]);
    const T3 = [
      () => [powS(fn(pk(['sin', 'cos']), mono(a, 1)), ri(2, 4)), [0.2, 1]],
      () => [fn('exp', fn(pk(['sin', 'cos']), L())), null],
      () => [fn('ln', fn(pk(['sin', 'cos']), X)), [0.2, 1.2]],
      () => [powS(fn('ln', X), ri(2, 4)), [1.2, 2.6]],
      () => [fn('sin', powS(lin({ c: true }), ri(2, 3))), [0.1, 0.6]],
      () => [powS(add(fn('exp', mono(a, 1)), K(1)), ri(2, 5)), null],
      () => [powS(add(K(1), powS(fn('sin', X), 2)), F(1, 2)), null],
      () => [fn('exp', powS(posQuad(), F(1, 2))), null],
      () => [fn('ln', powS(posQuad(), F(1, 2))), null],
      () => [fn('sin', fn('exp', mono(nz(1, 3), 1))), [0.1, 0.8]],
      () => [fn('cos', powS(X, F(1, 2))), null],
      () => [powS(fn('tan', mono(a, 1)), 2), [0.05, 0.3]],
      () => [fn('atan', powS(X, F(1, 2))), null],
      () => [fn('exp', powS(fn('sin', X), 2)), null],
    ];
    const [f, dom] = pk(T3)();
    return mk(f, { dom: dom || undefined, s: () => [T`Hi ha tres capes. Deriva de fora cap a dins i multiplica totes les derivades.`, T`Comprova cada capa: $\big(f(g(h(x)))\big)'=f'(g(h))\cdot g'(h)\cdot h'(x)$.`, T`$f'(x)=${tex(dS(f))}$`] });
  };
  const CH_PARTS = [() => fn('exp', mono(nz(2, 4), 1)), () => fn('sin', mono(pos(2, 5), 1)), () => fn('cos', mono(pos(2, 5), 1)), () => powS(add(mono(1, 2), K(pos(1, 5))), F(1, 2)), () => powS(lin({ positive: true, c: true }), ri(2, 5)), () => fn('ln', add(mono(1, 2), K(pos(1, 4)))), () => fn('exp', mono(nz(1, 2), 2))];
  G.chprod = () => {
    const kind = pk(['ux', 'ux', 'two']);
    if (kind === 'two') { const [a, b] = shuffle(CH_PARTS).slice(0, 2).map(g => g()); return prodQ(a, b); }
    return prodQ(pk([() => X, () => mono(1, ri(2, 3)), () => mono(nz(2, 4), 1)])(), pk(CH_PARTS)());
  };
  G.chquot = () => {
    const kind = pk(['cu', 'uc', 'cc']);
    if (kind === 'cu') return quotQ(pk(CH_PARTS.filter((_, i) => i !== 3))(), pk([() => X, () => mono(1, 2), () => lin({ positive: true })])());
    if (kind === 'uc') return quotQ(pk([() => X, () => mono(1, 2), () => K(pos(1, 4))])(), pk([() => add(fn('exp', mono(pos(2, 3), 1)), K(1)), () => posQuad(), () => add(mono(1, 3), K(pos(1, 4)))])());
    return quotQ(fn(pk(['sin', 'cos']), mono(pos(2, 3), 1)), fn('exp', mono(pos(2, 3), 1)));
  };
  /* --- Derivades llargues («tochas») --- */
  const bigSteps = f => () => [T`Abans de res, identifica l'estructura de fora (producte, quocient o composició) i escriu-la.`,
    T`Deriva cada peça per separat amb la regla que toqui (cadena a dins de cada peça).`, T`Ajunta-ho sense pressa: $f'(x)=${tex(dS(f))}$`,
    T`No cal simplificar: qualsevol expressió equivalent es dona per bona.`];
  const BIG = [
    () => prodQ(mulS(mono(1, ri(2, 3)), fn('exp', mono(nz(2, 3), 1))), fn(pk(['sin', 'cos']), mono(pos(2, 4), 1))),
    () => prodQ(powS(fn('sin', mono(pos(2, 3), 1)), ri(2, 3)), fn('exp', mono(nz(1, 2), 1))),
    () => prodQ(powS(posQuad(), ri(2, 4)), powS(lin({ positive: true, c: true }), F(1, 2))),
    () => prodQ(mulS(X, fn('ln', posQuad())), fn('exp', mono(nz(1, 2), 2))),
    () => quotQ(mulS(X, fn('exp', mono(pos(2, 3), 1))), powS(posQuad(), 2)),
    () => quotQ(fn('sin', mono(pos(2, 3), 2)), add(fn('exp', X), K(pos(1, 3)))),
    () => quotQ(fn('ln', posQuad()), mulS(X, fn('exp', X))),
    () => { const f = powS(add(mulS(X, fn('sin', X)), K(pos(1, 3))), ri(2, 4)); return mk(f, { s: bigSteps(f) }); },
    () => {
      const g = posQuad(), h = lin({ positive: true, c: true }), f = fn('ln', divS(g, h)), dg = dS(g), dh = dS(h);
      const d = sub(divS(dg, g), divS(dh, h));
      return mk(f, { d, extra: [sub(powS(g, -1), powS(h, -1)), add(divS(dg, g), divS(dh, h)), divS(dg, dh), sub(divS(dg, h), divS(dh, g))],
        s: () => [T`Propietat dels logaritmes: $\ln\frac{a}{b}=\ln a-\ln b$. Molt més fàcil que fer el quocient!`, T`$(\ln(${tex(g)}))'=\frac{${tex(dg)}}{${tex(g)}}$ i $(\ln(${tex(h)}))'=\frac{${tex(dh)}}{${tex(h)}}$`, T`$f'(x)=${tex(d)}$`] });
    },
    () => { const f = powS(divS(posQuad(), add(mono(1, 2), K(pos(1, 4)))), F(1, 2)); return mk(f, { s: bigSteps(f) }); },
    () => { const f = fn('atan', divS(lin({ c: true }), lin({ positive: true, c: true }))); return mk(f, { dom: [0.3, 1.2], s: bigSteps(f) }); },
    () => { const f = mulS(fn('exp', fn('sin', mono(1, 2))), powS(posQuad(), F(1, 2))); return mk(f, { s: bigSteps(f) }); },
    () => { const f = fn('ln', powS(add(fn('exp', mono(pos(2, 3), 1)), K(1)), F(1, 2))); return mk(f, { s: bigSteps(f) }); },
    () => { const f = powS(fn('sin', powS(posQuad(), F(1, 2))), 2); return mk(f, { s: bigSteps(f) }); },
    () => { const f = mulS(mono(1, 2), mulS(fn('atan', mono(pos(2, 3), 1)), fn('exp', mono(-1, 1)))); return mk(f, { s: bigSteps(f) }); },
  ];
  G.big = () => pk(BIG)();
  const MIXERS = ['ch1', 'chpow', 'chroot', 'chexp', 'chln', 'chtrig', 'charc', 'chsinn', 'chax', 'ch2', 'ch2', 'chprod', 'chprod', 'chquot', 'chquot', 'prod', 'quot', 'elem'];
  G.mix = () => G[pk(MIXERS)]();
  /* --- Nivell 4: més enllà --- */
  G.ordre = () => {
    const base = pk([() => polyR(ri(3, 5), 3), () => fn('exp', mono(nz(2, 4), 1)), () => fn(pk(['sin', 'cos']), mono(pos(2, 4), 1)), () => fn('ln'), () => mulS(X, fn('exp')), () => mono(1, -1), () => mono(pos(1, 4), F(1, 2)), () => mulS(mono(1, 2), fn('ln'))])();
    const third = isPoly(base) && Math.random() < .4;
    const d1 = dS(base), d2 = dS(d1), d3 = dS(d2), dd = third ? d3 : d2, prev = third ? d2 : d1;
    return mk(base, {
      d: dd, check: js(prev), ask: third ? 'Calcula la tercera derivada:' : 'Calcula la segona derivada:', pre: third ? "f'''(x)=" : "f''(x)=",
      extra: [d1, third ? d2 : d3, neg(dd), mulS(d1, d1)].filter(s => s && s.length),
      s: () => [T`Primera derivada: $f'(x)=${tex(d1)}$`, T`Torna a derivar: $f''(x)=${tex(d2)}$`, ...(third ? [T`I un cop més: $f'''(x)=${tex(d3)}$`] : [])],
    });
  };
  G.tang = () => {
    const kind = pk(['poly', 'poly', 'poly', 'exp', 'ln', 'sin']);
    let f, a;
    if (kind === 'poly') { f = polyR(ri(2, 3), ri(2, 3)); a = nz(1, 2); }
    else if (kind === 'exp') { f = fn('exp'); a = 0; }
    else if (kind === 'ln') { f = fn('ln'); a = 1; }
    else { f = pk([fn('sin'), add(fn('sin'), X)]); a = 0; }
    const fa = Math.round(ev(js(f), a) * 1e9) / 1e9, m = Math.round(ev(js(dS(f)), a) * 1e9) / 1e9;
    if (![fa, m].every(v => Number.isInteger(v))) return null;
    const line = add(mono(m, 1), K(fa - m * a));
    const p = mk(line, {
      d: line, noCheck: true, aTex: tex(line), aJs: js(line), dom: [-2, 2],
      ask: `Recta tangent a la gràfica de $f$ en $x=${a}$:`, pre: 'y=',
      extra: [add(mono(m, 1)), add(mono(fa, 1), K(m)), add(mono(m, 1), K(fa + m * a)), K(fa), add(mono(-m, 1), K(fa + m * a))].filter(s => s.length),
      s: () => [T`Recta tangent: $y=f(a)+f'(a)\,(x-a)$ amb $a=${a}$.`, T`$f(${a})=${fa}$ i $f'(x)=${tex(dS(f))}$, així que $f'(${a})=${m}$.`, T`$y=${fa}${m < 0 ? '' : '+'}${m}\,(x${a < 0 ? '+' : '-'}${Math.abs(a)})\;\Rightarrow\;y=${tex(line)}$`],
    });
    if (!p) return null;
    p.q = 'f(x)=' + tex(f); delete p.f;
    return p;
  };

  function gen(key) { for (let k = 0; k < 30; k++) { let p = null; try { p = G[key](); } catch (e) { p = null; } if (p) return p; } return null; }
  return { gen, G, tex, js, dS, mk, F };
})();

/* =========================================================
   GRAF DE DERIVADES
   g: grup (0 bàsiques · 1 elementals · 2 producte/quocient · 3 cadena · 4 més enllà)
   ========================================================= */
const DGROUPS = [['Bàsiques', 'Constants, potències i polinomis'], ['Funcions elementals', 'eˣ, ln, sin, cos, tan, arcs'], ['Producte i quocient', 'Sense cadena'], ['Regla de la cadena', 'De la més fàcil a la de tres capes'], ['Més enllà', 'Derivades llargues, successives, tangent, logarítmica, implícita']];
const DNODES = [
  { id: 'D_k', g: 0, n: 'Constants i la x', s: 'Constants i x', icon: 'c', x: 2, y: 0, req: [], gen: 'k', r: T`(c)'=0,\quad (x)'=1,\quad (c\,x)'=c`, i: T`El primer graó: una constant no canvia (pendent 0) i la recta $y=x$ té pendent 1.` },
  { id: 'D_pow', g: 0, n: 'Potències xⁿ', s: 'Potències xⁿ', icon: 'xⁿ', x: 2, y: 1, req: ['D_k'], gen: 'pow', r: T`(x^n)'=n\,x^{n-1}`, i: T`Baixa l'exponent davant i resta-li 1. És la regla que faràs servir més.` },
  { id: 'D_cpow', g: 0, n: 'Constant per potència', s: 'c · xⁿ', icon: 'cxⁿ', x: 1, y: 2, req: ['D_pow'], gen: 'cpow', r: T`(c\,x^n)'=c\,n\,x^{n-1}`, i: T`La constant que multiplica es queda tal qual: només derives la potència.` },
  { id: 'D_neg', g: 0, n: 'Exponents negatius', s: '1/xⁿ', icon: '1/xⁿ', x: 3, y: 2, req: ['D_pow'], gen: 'neg', r: T`\left(\frac{1}{x^n}\right)'=(x^{-n})'=-\frac{n}{x^{n+1}}`, i: T`Reescriu $\frac{1}{x^n}=x^{-n}$ i aplica la regla de sempre. L'exponent es fa més negatiu: $-n-1$.` },
  { id: 'D_poly', g: 0, n: 'Polinomis', icon: 'P(x)', x: 0, y: 3, req: ['D_cpow'], gen: 'poly', r: T`(f\pm g)'=f'\pm g'`, i: T`Deriva terme a terme. Les constants soles desapareixen.` },
  { id: 'D_root', g: 0, n: 'Arrels', icon: '√x', x: 2, y: 3, req: ['D_neg', 'D_cpow'], gen: 'root', r: T`(\sqrt{x})'=\frac{1}{2\sqrt{x}},\quad \left(\sqrt[q]{x^p}\right)'=\frac pq\,x^{\frac pq-1}`, i: T`Una arrel és una potència fraccionària: $\sqrt{x}=x^{1/2}$, $\sqrt[3]{x}=x^{1/3}$.` },
  { id: 'D_alg', g: 0, n: 'Barreja: potències, arrels i fraccions', s: 'Barreja algebraica', icon: 'Σ', x: 1, y: 4, req: ['D_poly', 'D_root'], gen: 'alg', r: T`x^{-n},\quad x^{p/q},\quad (f\pm g)'=f'\pm g'`, i: T`Primer ho reescrius tot com a potències de $x$; després és mecànic.` },
  { id: 'D_exp', g: 1, n: 'Exponencial eˣ', s: 'Exponencial eˣ', icon: 'eˣ', x: 0, y: 5, req: ['D_alg'], gen: 'exp', r: T`(e^x)'=e^x`, i: T`L'única funció que és la seva pròpia derivada.` },
  { id: 'D_ln', g: 1, n: 'Logaritme ln x', s: 'Logaritme ln x', icon: 'ln', x: 1, y: 5, req: ['D_alg'], gen: 'ln', r: T`(\ln x)'=\frac{1}{x}`, i: T`Abans de derivar, aprofita les propietats: $\ln x^n=n\ln x$, $\ln(ax)=\ln a+\ln x$.` },
  { id: 'D_trig', g: 1, n: 'Sinus i cosinus', icon: 'sin', x: 3, y: 5, req: ['D_alg'], gen: 'trig', r: T`(\sin x)'=\cos x,\quad(\cos x)'=-\sin x`, i: T`El signe menys només apareix en derivar el cosinus.` },
  { id: 'D_ax', g: 1, n: 'aˣ i logₐ x', s: 'aˣ i logₐ x', icon: 'aˣ', x: 0, y: 6, req: ['D_exp', 'D_ln'], gen: 'ax', r: T`(a^x)'=a^x\ln a,\quad(\log_a x)'=\frac{1}{x\ln a}`, i: T`Com $e^x$ i $\ln x$, però apareix el factor $\ln a$.` },
  { id: 'D_tan', g: 1, n: 'Tangent i cotangent', s: 'tan i cot', icon: 'tan', x: 3, y: 6, req: ['D_trig'], gen: 'tan', r: T`(\tan x)'=\frac{1}{\cos^2 x}=1+\tan^2 x,\quad(\cot x)'=-\frac{1}{\sin^2 x}`, i: T`Surt de fer el quocient $\frac{\sin x}{\cos x}$. Val la pena saber-la de memòria.` },
  { id: 'D_arc', g: 1, n: 'arcsin, arccos, arctan', s: 'Arcs', icon: 'arc', x: 4, y: 6, req: ['D_trig'], gen: 'arc', r: T`(\arcsin x)'=\frac{1}{\sqrt{1-x^2}},\quad(\arccos x)'=-\frac{1}{\sqrt{1-x^2}},\quad(\arctan x)'=\frac{1}{1+x^2}`, i: T`arcsin i arccos només es diferencien en el signe.` },
  { id: 'D_elem', g: 1, n: 'Barreja d\'elementals', s: 'Barreja elementals', icon: 'f±g', x: 2, y: 7, req: ['D_ax', 'D_tan', 'D_ln'], gen: 'elem', r: T`(a\,f+b\,g)'=a\,f'+b\,g'`, i: T`Totes les regles anteriors alhora, terme a terme.` },
  { id: 'D_prod', g: 2, n: 'Regla del producte', s: 'Producte', icon: 'f·g', x: 1, y: 8, req: ['D_elem'], gen: 'prod', sk: ['prod'], r: T`(f\,g)'=f'\,g+f\,g'`, i: T`«La derivada del primer pel segon sense derivar, més el primer sense derivar per la derivada del segon.»` },
  { id: 'D_quot', g: 2, n: 'Regla del quocient', s: 'Quocient', icon: 'f/g', x: 3, y: 8, req: ['D_elem'], gen: 'quot', sk: ['quot'], r: T`\left(\frac fg\right)'=\frac{f'\,g-f\,g'}{g^2}`, i: T`Ordre important: primer el de dalt derivat. Al denominador, el de baix al quadrat.` },
  { id: 'D_pq', g: 2, n: 'Producte i quocient barrejats', s: 'Producte + quocient', icon: '×÷', x: 2, y: 9, req: ['D_prod', 'D_quot'], gen: 'pq', r: T`(fgh)'=f'gh+fg'h+fgh'`, i: T`Identifica l'estructura principal (producte o quocient) i després deriva cada peça.` },
  { id: 'D_ch1', g: 3, n: 'Cadena: interior lineal', s: 'Cadena: f(ax+b)', icon: '∘', x: 2, y: 10, req: ['D_pq'], gen: 'ch1', r: T`\big(f(ax+b)\big)'=a\,f'(ax+b)`, i: T`El primer contacte amb la cadena: la derivada de la capa de dins és només un número.` },
  { id: 'D_chpow', g: 3, n: 'Potència d\'una funció', s: '(g(x))ⁿ', icon: '( )ⁿ', x: 0, y: 11, req: ['D_ch1'], gen: 'chpow', r: T`\big(g(x)^n\big)'=n\,g(x)^{n-1}\,g'(x)`, i: T`No desenvolupis el parèntesi: baixa l'exponent i multiplica per la derivada de dins.` },
  { id: 'D_chroot', g: 3, n: 'Arrel d\'una funció', s: '√g(x)', icon: '√g', x: 1, y: 11, req: ['D_ch1'], gen: 'chroot', r: T`\big(\sqrt{g}\big)'=\frac{g'}{2\sqrt{g}}`, i: T`És la potència $\frac12$: $\frac12\,g^{-1/2}\cdot g'$.` },
  { id: 'D_chexp', g: 3, n: 'Exponencial d\'una funció', s: 'e^{g(x)}', icon: 'eᵍ', x: 3, y: 11, req: ['D_ch1'], gen: 'chexp', r: T`\big(e^{g(x)}\big)'=e^{g(x)}\,g'(x)`, i: T`L'exponencial es copia igual i multipliques per la derivada de l'exponent.` },
  { id: 'D_chln', g: 3, n: 'Logaritme d\'una funció', s: 'ln g(x)', icon: 'ln g', x: 4, y: 11, req: ['D_ch1'], gen: 'chln', r: T`\big(\ln g(x)\big)'=\frac{g'(x)}{g(x)}`, i: T`«La derivada de dins partit pel de dins.»` },
  { id: 'D_chtrig', g: 3, n: 'Trigonomètriques d\'una funció', s: 'sin g(x)', icon: 'sin g', x: 2, y: 12, req: ['D_ch1'], gen: 'chtrig', r: T`\big(\sin g\big)'=\cos g\cdot g',\quad\big(\cos g\big)'=-\sin g\cdot g',\quad\big(\tan g\big)'=\frac{g'}{\cos^2 g}`, i: T`L'argument no es toca: $\sin(x^2)\to\cos(x^2)\cdot 2x$.` },
  { id: 'D_charc', g: 3, n: 'Arcs d\'una funció', s: 'arctan g(x)', icon: 'arc g', x: 4, y: 12, req: ['D_ch1', 'D_arc'], gen: 'charc', r: T`\big(\arctan g\big)'=\frac{g'}{1+g^2},\quad\big(\arcsin g\big)'=\frac{g'}{\sqrt{1-g^2}}`, i: T`Al denominador hi va $g$ al quadrat, i a dalt $g'$.` },
  { id: 'D_chsinn', g: 3, n: 'Potències de trigonomètriques', s: 'sinⁿ x', icon: 'sin²', x: 1, y: 13, req: ['D_chtrig', 'D_chpow'], gen: 'chsinn', r: T`\big(\sin^n x\big)'=n\sin^{n-1}x\cdot\cos x`, i: T`$\sin^2 x$ vol dir $(\sin x)^2$: la capa de fora és la potència.` },
  { id: 'D_chax', g: 3, n: 'a^{g(x)} i logₐ g(x)', s: 'aᵍ i logₐ g', icon: 'aᵍ', x: 3, y: 13, req: ['D_chexp', 'D_chln'], gen: 'chax', r: T`\big(a^{g}\big)'=a^{g}\ln a\cdot g',\quad\big(\log_a g\big)'=\frac{g'}{g\ln a}`, i: T`Com les naturals, amb el factor $\ln a$ i la derivada de dins.` },
  { id: 'D_ch2', g: 3, n: 'Cadena doble (tres capes)', s: 'Cadena doble', icon: '∘∘', x: 2, y: 14, req: ['D_chsinn', 'D_chax', 'D_chroot'], gen: 'ch2', sk: ['cad2'], r: T`\big(f(g(h(x)))\big)'=f'(g(h))\cdot g'(h)\cdot h'(x)`, i: T`Pela la ceba: capa a capa de fora cap a dins, multiplicant cada derivada.` },
  { id: 'D_chprod', g: 3, n: 'Cadena + producte', s: 'Cadena + producte', icon: 'f·g∘', x: 1, y: 15, req: ['D_ch2'], gen: 'chprod', r: T`(u\,v)'=u'v+uv'\;\text{ amb }u',v'\text{ per la cadena}`, i: T`Primer el producte; cada peça es deriva amb la cadena si cal.` },
  { id: 'D_chquot', g: 3, n: 'Cadena + quocient', s: 'Cadena + quocient', icon: 'f/g∘', x: 3, y: 15, req: ['D_ch2'], gen: 'chquot', r: T`\left(\frac uv\right)'=\frac{u'v-uv'}{v^2}\;\text{ amb la cadena a cada peça}`, i: T`Escriu $u$, $v$, $u'$, $v'$ per separat abans d'ajuntar-ho.` },
  { id: 'D_mix', g: 3, n: 'Barreja total (tipus examen)', s: 'Barreja total', icon: '★', x: 2, y: 16, req: ['D_chprod', 'D_chquot'], gen: 'mix', sk: ['cad', 'explog', 'trig', 'pot'], r: T`\text{Totes les regles}`, i: T`Qualsevol cosa del temari: identifica l'estructura i aplica-ho de manera mecànica.` },
  { id: 'D_big', g: 4, n: 'Derivades llargues (examen dur)', s: 'Derivades llargues', icon: '🦖', x: 2, y: 17, req: ['D_mix'], gen: 'big', r: T`\text{producte}\;\circ\;\text{quocient}\;\circ\;\text{cadena}`, i: T`Derivades «tochas»: cadena dins de producte dins de quocient. Escriu $u$, $v$, $u'$, $v'$ per separat i ajunta-ho al final. No cal simplificar.` },
  { id: 'D_ordre', g: 4, n: 'Derivades successives', s: "f'', f'''", icon: "f''", x: 0, y: 17, req: ['D_mix'], gen: 'ordre', sk: ['ordre'], r: T`f''=(f')',\quad f'''=(f'')'`, i: T`Deriva, simplifica, i torna a derivar.` },
  { id: 'D_tang', g: 4, n: 'Recta tangent', icon: '⟋', x: 1, y: 17, req: ['D_mix'], gen: 'tang', sk: ['tang'], b: 'app', r: T`y=f(a)+f'(a)\,(x-a)`, i: T`El pendent de la tangent és la derivada en el punt.` },
  { id: 'D_logd', g: 4, n: 'Derivació logarítmica', s: 'Derivació log.', icon: 'ln y', x: 3, y: 17, req: ['D_mix'], sk: ['logd'], r: T`y=f^g\;\Rightarrow\;\frac{y'}{y}=\big(g\ln f\big)'`, i: T`Per a funcions del tipus $f(x)^{g(x)}$: pren logaritmes abans de derivar.` },
  { id: 'D_impl', g: 4, n: 'Derivació implícita', s: 'Implícita', icon: "y'", x: 4, y: 17, req: ['D_mix'], sk: ['impl'], r: T`\frac{d}{dx}\big[F(x,y)\big]=0\;\Rightarrow\;y'=-\frac{F_x}{F_y}`, i: T`Deriva tot respecte de $x$ recordant que $y$ depèn de $x$: $(y^2)'=2y\,y'$.` },
  { id: 'D_hip', g: 4, n: 'Hiperbòliques', icon: 'sinh', x: 2, y: 18, req: ['D_mix'], sk: ['hip'], opt: 1, r: T`(\sinh x)'=\cosh x,\quad(\cosh x)'=\sinh x`, i: T`Com les trigonomètriques però sense signes menys. Opcional.` },
];
  (typeof window !== 'undefined' ? window : globalThis).DXLIB = { D_UNITS, I_UNITS, NODES, DNODES, DGROUPS, TECH, TABLES, DX, mirrorOf };
})();
