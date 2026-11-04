/* Formulari complet (full de trucs) — tot el curs en una sola pàgina */
(function () {
  'use strict';
  Calc.formulari = [
    {
      title: 'Límits i continuïtat', html: `
<table class="tbl"><tr><td>$\\lim_{x\\to0}\\frac{\\sin x}{x}=1$</td><td>$\\lim_{x\\to0}\\frac{e^x-1}{x}=1$</td><td>$\\lim_{x\\to0}\\frac{\\ln(1+x)}{x}=1$</td></tr>
<tr><td>$\\lim_{x\\to0}\\frac{1-\\cos x}{x^2}=\\frac12$</td><td>$\\lim_{x\\to\\infty}\\left(1+\\frac1x\\right)^x=e$</td><td>$\\lim_{x\\to\\infty}\\frac{\\ln x}{x^n}=0,\\ \\lim\\frac{x^n}{e^x}=0$</td></tr></table>
<div class="box formula"><b>Bolzano:</b> $f$ contínua en $[a,b]$, $f(a)f(b)<0$ ⇒ $\\exists c\\in(a,b):f(c)=0$.</div>
<p><b>Indeterminacions:</b> $\\frac00,\\frac\\infty\\infty,0\\cdot\\infty,\\infty-\\infty,1^\\infty,0^0,\\infty^0$. L'Hôpital: $\\lim\\frac fg=\\lim\\frac{f'}{g'}$ (només $\\frac00$ i $\\frac\\infty\\infty$). Potències: $f^g=e^{g\\ln f}$.</p>` },
    {
      title: 'Derivades', html: `
<table class="tbl">
<tr><td>$(x^n)'=nx^{n-1}$</td><td>$(e^x)'=e^x$</td><td>$(a^x)'=a^x\\ln a$</td><td>$(\\ln x)'=\\frac1x$</td></tr>
<tr><td>$(\\sin x)'=\\cos x$</td><td>$(\\cos x)'=-\\sin x$</td><td>$(\\tan x)'=\\frac1{\\cos^2x}$</td><td>$(\\sqrt x)'=\\frac1{2\\sqrt x}$</td></tr>
<tr><td>$(\\arctan x)'=\\frac1{1+x^2}$</td><td>$(\\arcsin x)'=\\frac1{\\sqrt{1-x^2}}$</td><td>$(\\arccos x)'=-\\frac1{\\sqrt{1-x^2}}$</td><td>$(\\log_ax)'=\\frac{1}{x\\ln a}$</td></tr></table>
<div class="box formula">$(fg)'=f'g+fg'$ &nbsp; $\\left(\\frac fg\\right)'=\\frac{f'g-fg'}{g^2}$ &nbsp; $[f(g)]'=f'(g)g'$ &nbsp; $(f^g)'=f^g\\left(g'\\ln f+\\frac{gf'}f\\right)$</div>
<p>Implícita: $y'=-F_x/F_y$. Tangent: $y=f(a)+f'(a)(x-a)$. Rolle: $f(a)=f(b)\\Rightarrow\\exists c: f'(c)=0$. TVM: $f'(c)=\\frac{f(b)-f(a)}{b-a}$.</p>` },
    {
      title: 'Estudi de funcions i optimització', html: `
<ul><li>$f'>0$ creixent, $f'<0$ decreixent. Màxim: $f'$ de $+$ a $-$ (o $f''<0$). Mínim: de $-$ a $+$ (o $f''>0$).</li>
<li>$f''>0$ convexa (∪), $f''<0$ còncava (∩); inflexió: $f''$ canvia de signe.</li>
<li>Extrems absoluts en $[a,b]$: compara $f$ als extrems i als punts crítics.</li>
<li>Asímptotes: vertical $x=a$ ($\\lim=\\pm\\infty$); horitzontal $y=L$; obliqua $y=mx+n$ amb $m=\\lim\\frac fx$, $n=\\lim(f-mx)$.</li></ul>` },
    {
      title: 'Taylor', html: `
<div class="box formula">$P_n(x)=\\sum_{k=0}^n\\frac{f^{(k)}(a)}{k!}(x-a)^k$, &nbsp; $R_n=\\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}$, &nbsp; $|R_n|\\le\\frac{M|x-a|^{n+1}}{(n+1)!}$</div>
<table class="tbl"><tr><td>$e^x=\\sum\\frac{x^k}{k!}$</td><td>$\\sin x=\\sum(-1)^k\\frac{x^{2k+1}}{(2k+1)!}$</td><td>$\\cos x=\\sum(-1)^k\\frac{x^{2k}}{(2k)!}$</td></tr>
<tr><td>$\\ln(1+x)=\\sum(-1)^{k+1}\\frac{x^k}{k}$</td><td>$\\frac1{1-x}=\\sum x^k$</td><td>$(1+x)^\\alpha=1+\\alpha x+\\frac{\\alpha(\\alpha-1)}{2}x^2+\\cdots$</td></tr></table>` },
    {
      title: 'Interpolació i Newton (mètode)', html: `
<div class="box formula">Lagrange: $p(x)=\\sum y_iL_i(x)$, $L_i=\\prod_{j\\ne i}\\frac{x-x_j}{x_i-x_j}$.<br>
Newton: $p=f[x_0]+f[x_0,x_1](x-x_0)+f[x_0,x_1,x_2](x-x_0)(x-x_1)+\\cdots$, $f[x_i,..,x_{i+k}]=\\frac{f[x_{i+1},..]-f[x_i,..]}{x_{i+k}-x_i}$.<br>
Error: $|f(x)-p(x)|\\le\\frac{M}{(n+1)!}\\prod|x-x_i|$, $M=\\max|f^{(n+1)}|$.</div>
<div class="box formula">Newton–Raphson: $x_{n+1}=x_n-\\dfrac{f(x_n)}{f'(x_n)}$ (extrems: aplica-ho a $f'$).</div>` },
    {
      title: 'Primitives', html: `
<table class="tbl">
<tr><td>$\\int x^n=\\frac{x^{n+1}}{n+1}$</td><td>$\\int\\frac1x=\\ln|x|$</td><td>$\\int e^x=e^x$</td><td>$\\int a^x=\\frac{a^x}{\\ln a}$</td></tr>
<tr><td>$\\int\\sin x=-\\cos x$</td><td>$\\int\\cos x=\\sin x$</td><td>$\\int\\frac1{\\cos^2x}=\\tan x$</td><td>$\\int\\tan x=-\\ln|\\cos x|$</td></tr>
<tr><td>$\\int\\frac1{1+x^2}=\\arctan x$</td><td>$\\int\\frac1{\\sqrt{1-x^2}}=\\arcsin x$</td><td>$\\int\\ln x=x\\ln x-x$</td><td>$\\int\\frac{1}{x^2+k^2}=\\frac1k\\arctan\\frac xk$</td></tr></table>
<div class="box formula">Per parts: $\\int u\\,dv=uv-\\int v\\,du$ (LIATE). Substitució: $u=g(x)$, $du=g'dx$.<br>
$\\int\\frac{u'}{u}=\\ln|u|$, $\\int u^nu'=\\frac{u^{n+1}}{n+1}$, $\\int e^uu'=e^u$.<br>
$\\sin^2=\\frac{1-\\cos2x}2$, $\\cos^2=\\frac{1+\\cos2x}2$; potència senar ⇒ separa un factor i usa $\\sin^2+\\cos^2=1$.</div>
<p><b>Fraccions simples:</b> $(x-a)\\to\\frac A{x-a}$; $(x-a)^k\\to\\sum\\frac{A_j}{(x-a)^j}$; $x^2+bx+c$ irreductible $\\to\\frac{Ax+B}{x^2+bx+c}$. Primer divideix si grau num $\\ge$ grau den.</p>` },
    {
      title: 'Integral definida i aplicacions', html: `
<div class="box formula">Barrow: $\\int_a^bf=F(b)-F(a)$. TFC: $\\left(\\int_a^xf\\right)'=f(x)$. Leibniz: $\\frac d{dx}\\int_{h(x)}^{g(x)}f=f(g)g'-f(h)h'$.<br>
Àrea: $\\int_a^b|f-g|$. Valor mitjà: $\\frac1{b-a}\\int_a^bf$.<br>
Volum (eix $X$): $\\pi\\int f^2$; rentadores $\\pi\\int(f^2-g^2)$; capes (eix $Y$): $2\\pi\\int x|f|$.<br>
Longitud: $\\int_a^b\\sqrt{1+f'^2}$. Àrea de revolució: $2\\pi\\int_a^b f\\sqrt{1+f'^2}$.<br>
Trapezis: $\\frac h2(f_0+2f_1+\\dots+2f_{n-1}+f_n)$. Simpson ($n$ parell): $\\frac h3(f_0+4f_1+2f_2+\\dots+4f_{n-1}+f_n)$, $h=\\frac{b-a}n$.</div>` },
    {
      title: 'EDO de 1r ordre', html: `
<table class="tbl">
<tr><td><b>Separable</b> $y'=f(x)g(y)$</td><td>$\\int\\frac{dy}{g(y)}=\\int f\\,dx$</td></tr>
<tr><td><b>Lineal</b> $y'+Py=Q$</td><td>$\\mu=e^{\\int P}$, $y=\\frac1\\mu\\left(\\int\\mu Q+C\\right)$</td></tr>
<tr><td>$y'=ky$</td><td>$y=y_0e^{kt}$</td></tr>
<tr><td>Logística $y'=ry(1-y/K)$</td><td>$y=\\dfrac{K}{1+(K/y_0-1)e^{-rt}}$</td></tr>
<tr><td>Newton refredament $T'=-k(T-T_a)$</td><td>$T=T_a+(T_0-T_a)e^{-kt}$</td></tr>
<tr><td>Dipòsit $S'=qc-\\frac qVS$</td><td>$S=cV+(S_0-cV)e^{-qt/V}$</td></tr></table>` },
    {
      title: 'EDO de 2n ordre (coeficients constants)', html: `
<table class="tbl">
<tr><th>Arrels de $r^2+br+c=0$</th><th>$y_h$</th></tr>
<tr><td>$r_1\\ne r_2$ reals</td><td>$C_1e^{r_1x}+C_2e^{r_2x}$</td></tr>
<tr><td>$r$ doble</td><td>$(C_1+C_2x)e^{rx}$</td></tr>
<tr><td>$\\alpha\\pm\\beta i$</td><td>$e^{\\alpha x}(C_1\\cos\\beta x+C_2\\sin\\beta x)$</td></tr></table>
<div class="box formula">$y=y_h+y_p$. Proves: polinomi ⇒ polinomi del mateix grau; $e^{kx}$ ⇒ $Ae^{kx}$; $\\cos kx/\\sin kx$ ⇒ $A\\cos kx+B\\sin kx$. Ressonància ⇒ multiplica per $x$.</div>` },
    {
      title: 'Àlgebra i trigonometria', html: `
<table class="tbl"><tr><td>$a^2-b^2=(a-b)(a+b)$</td><td>$(a\\pm b)^2=a^2\\pm2ab+b^2$</td><td>$x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$</td></tr>
<tr><td>$\\ln(ab)=\\ln a+\\ln b$</td><td>$\\ln a^n=n\\ln a$</td><td>$\\sin^2+\\cos^2=1$</td></tr>
<tr><td>$\\sin2x=2\\sin x\\cos x$</td><td>$\\cos2x=\\cos^2x-\\sin^2x$</td><td>$\\sin\\frac\\pi6=\\frac12,\\ \\sin\\frac\\pi4=\\frac{\\sqrt2}2,\\ \\sin\\frac\\pi3=\\frac{\\sqrt3}2$</td></tr></table>` }
  ];
})();
