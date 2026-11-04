/* ============================================================
   mathparser.js
   Petit parser/evaluador d'expressions matemàtiques segur (sense eval).
   Permet interpretar el que l'estudiant escriu (p.ex. "3*x^2 - ln(x)+sqrt(2)")
   i avaluar-ho numèricament per comparar-ho amb la resposta correcta.
   ============================================================ */

const MathParser = (function () {
  const FUNCS = new Set([
    "sin", "cos", "tan", "cot", "sec", "csc",
    "asin", "acos", "atan",
    "sinh", "cosh", "tanh",
    "exp", "ln", "log", "sqrt", "abs"
  ]);
  const CONSTS = { pi: Math.PI, e: Math.E };
  // Noms de l'enunciat (arctan, arcsin...) que s'accepten com les funcions inverses de FUNCS.
  const ALIASES = { arcsin: "asin", arccos: "acos", arctan: "atan" };

  function tokenize(src) {
    const toks = [];
    let i = 0;
    const s = src.replace(/,/g, ",");
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        toks.push({ t: "num", v: parseFloat(s.slice(i, j)) });
        i = j;
        continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        let j = i;
        while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
        const word = s.slice(i, j).toLowerCase();
        toks.push({ t: "ident", v: ALIASES[word] || word });
        i = j;
        continue;
      }
      if ("+-*/^(),".includes(c)) {
        toks.push({ t: c });
        i++;
        continue;
      }
      throw new Error("Caràcter no reconegut: '" + c + "'");
    }
    return toks;
  }

  // Insereix multiplicacions implícites: 2x, 3(x+1), x(x-1) [si x no és funció], )(  , )2, )x
  function insertImplicitMul(toks) {
    const out = [];
    for (let k = 0; k < toks.length; k++) {
      const cur = toks[k];
      out.push(cur);
      const nxt = toks[k + 1];
      if (!nxt) continue;
      const curIsFuncName = cur.t === "ident" && FUNCS.has(cur.v);
      const curEndsValue = cur.t === "num" || cur.t === ")" ||
        (cur.t === "ident" && !curIsFuncName);
      const nxtStartsValue = nxt.t === "num" || nxt.t === "(" ||
        (nxt.t === "ident");
      if (curEndsValue && nxtStartsValue) {
        out.push({ t: "*" });
      }
    }
    return out;
  }

  function parse(src) {
    const toks = insertImplicitMul(tokenize(src));
    let pos = 0;

    function peek() { return toks[pos]; }
    function next() { return toks[pos++]; }

    function parseExpr() {
      let node = parseTerm();
      while (peek() && (peek().t === "+" || peek().t === "-")) {
        const op = next().t;
        const rhs = parseTerm();
        node = { op, a: node, b: rhs };
      }
      return node;
    }

    function parseTerm() {
      let node = parseUnary();
      while (peek() && (peek().t === "*" || peek().t === "/")) {
        const op = next().t;
        const rhs = parseUnary();
        node = { op, a: node, b: rhs };
      }
      return node;
    }

    function parseUnary() {
      if (peek() && (peek().t === "-" || peek().t === "+")) {
        const op = next().t;
        const node = parseUnary();
        return op === "-" ? { op: "neg", a: node } : node;
      }
      return parsePow();
    }

    function parsePow() {
      const base = parsePrimary();
      if (peek() && peek().t === "^") {
        next();
        const exp = parseUnary(); // permet x^-2
        return { op: "^", a: base, b: exp };
      }
      return base;
    }

    function parsePrimary() {
      const tok = peek();
      if (!tok) throw new Error("Expressió incompleta");
      if (tok.t === "num") { next(); return { op: "num", v: tok.v }; }
      if (tok.t === "(") {
        next();
        const node = parseExpr();
        if (!peek() || peek().t !== ")") throw new Error("Falta un parèntesi de tancament");
        next();
        return node;
      }
      if (tok.t === "ident") {
        next();
        const name = tok.v;
        if (FUNCS.has(name)) {
          if (!peek() || peek().t !== "(") throw new Error("S'esperava '(' després de " + name);
          next();
          const args = [parseExpr()];
          while (peek() && peek().t === ",") {
            next();
            args.push(parseExpr());
          }
          if (!peek() || peek().t !== ")") throw new Error("Falta un parèntesi de tancament a " + name);
          next();
          return { op: "call", name, args };
        }
        if (name === "x") return { op: "var" };
        if (CONSTS.hasOwnProperty(name)) return { op: "num", v: CONSTS[name] };
        throw new Error("Identificador desconegut: '" + name + "'. Fes servir x, pi, e o funcions com sin, cos, exp, ln, sqrt...");
      }
      throw new Error("Token inesperat");
    }

    const result = parseExpr();
    if (pos < toks.length) throw new Error("Caràcters sobrants a l'expressió");
    return result;
  }

  function evalNode(node, x) {
    switch (node.op) {
      case "num": return node.v;
      case "var": return x;
      case "neg": return -evalNode(node.a, x);
      case "+": return evalNode(node.a, x) + evalNode(node.b, x);
      case "-": return evalNode(node.a, x) - evalNode(node.b, x);
      case "*": return evalNode(node.a, x) * evalNode(node.b, x);
      case "/": return evalNode(node.a, x) / evalNode(node.b, x);
      case "^": return Math.pow(evalNode(node.a, x), evalNode(node.b, x));
      case "call": {
        const a = node.args.map(ar => evalNode(ar, x));
        switch (node.name) {
          case "sin": return Math.sin(a[0]);
          case "cos": return Math.cos(a[0]);
          case "tan": return Math.tan(a[0]);
          case "cot": return 1 / Math.tan(a[0]);
          case "sec": return 1 / Math.cos(a[0]);
          case "csc": return 1 / Math.sin(a[0]);
          case "asin": return Math.asin(a[0]);
          case "acos": return Math.acos(a[0]);
          case "atan": return Math.atan(a[0]);
          case "sinh": return Math.sinh(a[0]);
          case "cosh": return Math.cosh(a[0]);
          case "tanh": return Math.tanh(a[0]);
          case "exp": return Math.exp(a[0]);
          case "ln": return Math.log(a[0]);
          case "log": return a.length === 2 ? Math.log(a[1]) / Math.log(a[0]) : Math.log10(a[0]);
          case "sqrt": return Math.sqrt(a[0]);
          case "abs": return Math.abs(a[0]);
          default: throw new Error("Funció no implementada: " + node.name);
        }
      }
      default: throw new Error("Node AST desconegut");
    }
  }

  // Compila una cadena a una funció JS f(x)
  function compile(src) {
    const ast = parse(src);
    return function (x) { return evalNode(ast, x); };
  }

  // Compara un valor numèric escrit per l'usuari amb un valor correcte.
  // accepta expressions com "ln(3)", "sqrt(2)/2", "e^2", etc.
  function checkNumber(userInput, correctValue, opts) {
    opts = opts || {};
    const tol = opts.tol !== undefined ? opts.tol : Math.max(1e-2, Math.abs(correctValue) * 1e-2);
    let fn;
    try {
      fn = compile(userInput);
    } catch (err) {
      return { ok: false, error: err.message };
    }
    let val;
    try {
      val = fn(0);
    } catch (err) {
      return { ok: false, error: "No s'ha pogut avaluar l'expressió." };
    }
    if (!isFinite(val)) return { ok: false, error: "El resultat no és un nombre finit." };
    const ok = Math.abs(val - correctValue) <= tol;
    return { ok, value: val };
  }

  // Compara una funció escrita per l'usuari (en x) amb una funció de referència,
  // avaluant-les numèricament en diversos punts de mostra.
  function checkFunction(userInput, refFn, sampleXs, opts) {
    opts = opts || {};
    const tolRel = opts.tolRel !== undefined ? opts.tolRel : 0.02;
    let fn;
    try {
      fn = compile(userInput);
    } catch (err) {
      return { ok: false, error: err.message };
    }
    for (const xv of sampleXs) {
      let userVal, refVal;
      try {
        userVal = fn(xv);
        refVal = refFn(xv);
      } catch (err) {
        continue; // prova un altre punt si aquest no està al domini
      }
      if (!isFinite(userVal) || !isFinite(refVal)) continue;
      const tol = Math.max(1e-2, Math.abs(refVal) * tolRel);
      if (Math.abs(userVal - refVal) > tol) {
        return { ok: false, mismatchAt: xv, got: userVal, expected: refVal };
      }
    }
    return { ok: true };
  }

  return { parse, compile, evalNode, checkNumber, checkFunction };
})();
