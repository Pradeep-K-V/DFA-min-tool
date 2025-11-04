function minimizeDFA() {
  const input = document.getElementById("transitions").value.trim();
  const lines = input.split("\n").map(l => l.trim()).filter(l => l);

  let dfa = {};
  let finalStates = new Set();
  let startState = "";

  for (const line of lines) {
    if (line.startsWith("Final:")) {
      finalStates = new Set(line.replace("Final:", "").split(",").map(s => s.trim()));
      continue;
    }
    if (line.startsWith("Start:")) {
      startState = line.replace("Start:", "").trim();
      continue;
    }

    // Parse transitions like: A,0->B
    const match = line.match(/^([A-Za-z]),([ab])->([A-Za-z])$/);
    if (match) {
      const [_, state, symbol, nextState] = match;
      if (!dfa[state]) dfa[state] = {};
      dfa[state][symbol] = nextState;
    }
  }

  const states = Object.keys(dfa);
  const alphabet = ["a", "b"];

  // Initial partition
  let P = [finalStates, new Set(states.filter(s => !finalStates.has(s)))];

  // Refinement
  let changed = true;
  while (changed) {
    changed = false;
    let newP = [];

    for (const group of P) {
      let subgroups = {};
      for (const state of group) {
        const signature = alphabet.map(sym => {
          const next = dfa[state][sym];
          const index = P.findIndex(g => g.has(next));
          return index;
        }).join(",");
        if (!subgroups[signature]) subgroups[signature] = new Set();
        subgroups[signature].add(state);
      }
      newP.push(...Object.values(subgroups));
    }

    if (JSON.stringify(P.map(g => [...g].sort())) !== JSON.stringify(newP.map(g => [...g].sort()))) {
      P = newP;
      changed = true;
    }
  }

  // Display Result
  const resultDiv = document.getElementById("result");
  let output = `<h3>✅ Minimized DFA Groups:</h3>`;
  P.forEach((g, i) => {
    output += `<p><b>Group ${i + 1}:</b> { ${[...g].join(", ")} }</p>`;
  });
  resultDiv.innerHTML = output;
}
document.getElementById("minimizeBtn").addEventListener("click", minimizeDFA);

