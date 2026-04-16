const PRESETS = {
  binaryIncrement: {
    name: 'Binary Increment', desc: 'n → n + 1', tape: '1011',
    rules: `q0, 0, 0, R, q0\nq0, 1, 1, R, q0\nq0, _, _, L, q1\nq1, 0, 1, L, qHalt\nq1, 1, 0, L, q1\nq1, _, 1, L, qHalt`
  },
  binaryDecrement: {
    name: 'Binary Decrement', desc: 'n → n − 1', tape: '1100',
    rules: `q0, 0, 0, R, q0\nq0, 1, 1, R, q0\nq0, _, _, L, q1\nq1, 1, 0, L, qHalt\nq1, 0, 1, L, q1\nq1, _, _, R, qHalt`
  },
  onesComplement: {
    name: "1's Complement", desc: 'flip all bits', tape: '101100',
    rules: `q0, 0, 1, R, q0\nq0, 1, 0, R, q0\nq0, _, _, L, qHalt`
  },
  twosComplement: {
    name: "2's Complement", desc: 'negate integer', tape: '10100',
    rules: `q0, 0, 0, R, q0\nq0, 1, 1, R, q0\nq0, _, _, L, q1\nq1, 0, 0, L, q1\nq1, 1, 1, L, q2\nq1, _, _, R, qHalt\nq2, 0, 1, L, q2\nq2, 1, 0, L, q2\nq2, _, _, R, qHalt`
  },
  palindromeCheck: {
    name: 'Palindrome Check', desc: 'marks match/no-match', tape: '10101',
    rules: `q0, 0, X, R, q1\nq0, 1, Y, R, q2\nq0, X, X, R, q0\nq0, Y, Y, R, q0\nq0, _, _, L, qAccept\nq1, 0, 0, R, q1\nq1, 1, 1, R, q1\nq1, X, X, L, q3\nq1, Y, Y, L, q3\nq1, _, X, L, q3\nq2, 0, 0, R, q2\nq2, 1, 1, R, q2\nq2, X, X, L, q4\nq2, Y, Y, L, q4\nq2, _, Y, L, q4\nq3, 0, 0, L, q3\nq3, 1, 1, L, q3\nq3, X, X, R, q0\nq3, Y, Y, R, q0\nq4, 0, 0, L, q4\nq4, 1, 1, L, q4\nq4, X, X, R, q0\nq4, Y, Y, R, q0`
  },
  unaryAddition: {
    name: 'Unary Addition', desc: '111 + 1111 = 1111111', tape: '111+1111',
    rules: `q0, 1, 1, R, q0\nq0, +, 1, R, q1\nq1, 1, 1, R, q1\nq1, _, _, L, q2\nq2, 1, _, L, qHalt`
  },
  unarySubtraction: {
    name: 'Unary Subtraction', desc: '11111 − 11 = 111', tape: '11111-11',
    rules: `q0, 1, _, R, q1\nq0, -, _, R, qHalt\nq1, 1, 1, R, q1\nq1, -, -, R, q2\nq2, 1, _, L, q3\nq2, _, _, L, q4\nq3, 1, 1, L, q3\nq3, -, -, L, q5\nq5, 1, 1, L, q5\nq5, _, _, R, q0\nq4, _, _, L, qHalt`
  },
  busyBeaver3: {
    name: 'Busy Beaver (3)', desc: '3-state champion', tape: '_',
    rules: `A, _, 1, R, B\nA, 1, 1, L, C\nB, _, 1, L, A\nB, 1, 1, R, B\nC, _, 1, L, B\nC, 1, 1, R, qHalt`
  },
  bubbleSort: {
    name: 'Bubble Sort', desc: '0s before 1s', tape: '110100',
    rules: `q0, 0, 0, R, q0\nq0, 1, 1, R, q1\nq0, _, _, L, qHalt\nq1, 0, 1, L, q2\nq1, 1, 1, R, q1\nq1, _, _, L, qHalt\nq2, 1, 0, R, q0\nq2, 0, 0, L, q2`
  },
  copyTape: {
    name: 'Tape Copy', desc: 'duplicates a string', tape: '101',
    rules: `q0, 0, _, R, q1\nq0, 1, _, R, q4\nq0, _, _, R, qHalt\nq1, 0, 0, R, q1\nq1, 1, 1, R, q1\nq1, #, #, R, q2\nq2, 0, 0, R, q2\nq2, _, 0, L, q3\nq3, 0, 0, L, q3\nq3, 1, 1, L, q3\nq3, #, #, L, q3b\nq3b, 0, 0, L, q3b\nq3b, 1, 1, L, q3b\nq3b, _, _, R, q0\nq4, 0, 0, R, q4\nq4, 1, 1, R, q4\nq4, #, #, R, q5\nq5, 0, 0, R, q5\nq5, 1, 1, R, q5\nq5, _, 1, L, q3`
  }
};

const M = {
  tape: [], head: 0, state: 'q0', prevState: null, steps: 0,
  rules: {}, running: false, animating: false, halted: false,
  history: [], trace: [], timer: null
};

const D = {
  nodes: {}, edges: [],
  drag: null, dox: 0, doy: 0,
  pan: { x: 0, y: 0 }, panStart: { x: 0, y: 0 }, mouseStart: { x: 0, y: 0 }, panning: false,
  zoom: 1,
  fromState: null, toState: null, anim: null,
  w: 0, h: 0,
  fullscreen: false
};

const H = {
  cellVisits: {},
  stateVisits: {},
  maxCell: 0,
  maxState: 0
};

const G = id => document.getElementById(id);

const EL = {
  tapeInput: G('initial-tape'),
  rulesInput: G('rules-input'),
  regexInput: G('regex-input'),
  regexStatus: G('regex-status'),
  btnCompile: G('btn-compile'),
  rulesTbody: G('rules-tbody'),
  tapeTrack: G('tape-track'),
  tapeViewport: G('tape-viewport'),
  stateBadge: G('state-badge'),
  stepBadge: G('step-badge'),
  symbolBadge: G('symbol-badge'),
  headBadge: G('head-badge'),
  ruleDisplay: G('rule-display'),
  statusDot: G('status-dot'),
  statusLabel: G('status-label'),
  historyList: G('history-list'),
  historyCount: G('history-count'),
  traceRow: G('trace-row'),
  traceCount: G('trace-count'),
  traceScroll: G('trace-scroll'),
  btnInit: G('btn-initialize'),
  btnBackEdit: G('btn-back-edit'),
  btnBack: G('btn-back'),
  btnStep: G('btn-step'),
  btnRun: G('btn-run'),
  btnReset: G('btn-reset'),
  speedSlider: G('speed-slider'),
  presetsGrid: G('presets-grid'),
  diagramCanvas: G('diagram-canvas'),
  diagramWrap: G('diagram-wrap'),
  canvasWrapper: G('canvas-wrapper'),
  diagramCard: G('diagram-card'),
  diagramHint: G('diagram-hint'),
  diagramFab: G('diagram-fab'),
  fabFit: G('fab-fit'),
  fabFullscreen: G('fab-fullscreen'),
  fabFsIcon: G('fab-fs-icon'),
  fabZoomIn: G('fab-zoomin'),
  fabZoomOut: G('fab-zoomout'),
  navPills: document.querySelectorAll('.nav-pill'),
  views: document.querySelectorAll('.view'),
  btnExport: G('btn-export'),
  btnImport: G('btn-import'),
  importFileInput: G('import-file-input')
};

function isHalt(s) {
  if (!s) return false;
  const l = s.toLowerCase();
  return l.startsWith('qhalt') || l.startsWith('qaccept') || l.startsWith('qreject') || l === 'halt';
}

function showView(id) {
  EL.views.forEach(v => v.classList.remove('active'));
  EL.navPills.forEach(p => { p.classList.toggle('active', p.dataset.view === id); });
  G(id).classList.add('active');
  if (id === 'view-run') {
    EL.diagramFab.classList.add('fab-visible');
    setTimeout(() => { dResize(); dDraw(); }, 50);
  } else {
    if (!D.fullscreen) EL.diagramFab.classList.remove('fab-visible');
  }
}

EL.navPills.forEach(p => {
  p.addEventListener('click', () => showView(p.dataset.view));
});

function toast(msg, type, ms) {
  ms = ms || 2800;
  const t = document.createElement('div');
  t.className = 'toast ' + (type || 'info');
  t.textContent = msg;
  G('toast-container').appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-14px)';
    t.style.transition = 'all 0.22s';
    setTimeout(() => t.remove(), 230);
  }, ms);
}

function setStatus(mode) {
  EL.statusDot.className = 'status-dot ' + mode;
  const labels = { idle: 'Idle', ready: 'Ready', running: 'Running', paused: 'Paused', halted: 'Halted' };
  EL.statusLabel.textContent = labels[mode] || mode;
}

function buildPresets() {
  Object.entries(PRESETS).forEach(([key, p]) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.innerHTML = '<span class="preset-name">' + p.name + '</span><span class="preset-desc">' + p.desc + '</span>';
    btn.addEventListener('click', () => {
      EL.tapeInput.value = p.tape;
      EL.rulesInput.value = p.rules;
      EL.regexInput.value = '';
      EL.regexStatus.textContent = '';
      EL.regexStatus.className = 'regex-status';
      toast('Loaded: ' + p.name, 'success');
    });
    EL.presetsGrid.appendChild(btn);
  });
}

function parseRules(text) {
  const rules = {};
  EL.rulesTbody.innerHTML = '';
  text.split('\n').forEach((line, idx) => {
    const raw = line.trim();
    if (!raw) return;
    const parts = raw.split(',').map(s => s.trim());
    if (parts.length !== 5) return;
    const [st, rd, wr, mv, nx] = parts;
    if (!rules[st]) rules[st] = {};
    rules[st][rd] = { write: wr, move: mv.toUpperCase(), next: nx, raw: raw, idx: idx };
    const tr = document.createElement('tr');
    tr.id = 'r' + idx;
    parts.forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.appendChild(td); });
    EL.rulesTbody.appendChild(tr);
  });
  return rules;
}

function snap(ruleRaw) {
  return { tape: M.tape.slice(), head: M.head, state: M.state, prevState: M.prevState, steps: M.steps, rule: ruleRaw || null };
}

function restore(s) {
  M.tape = s.tape.slice();
  M.head = s.head;
  M.state = s.state;
  M.prevState = s.prevState;
  M.steps = s.steps;
}

function bounds() {
  if (M.head < 10) {
    const n = 15;
    M.tape.unshift(...Array(n).fill('_'));
    M.head += n;
    M.history.forEach(h => { h.head += n; });
    const newCellVisits = {};
    Object.keys(H.cellVisits).forEach(k => {
      newCellVisits[parseInt(k) + n] = H.cellVisits[k];
    });
    H.cellVisits = newCellVisits;
  }
  if (M.head >= M.tape.length - 10) {
    M.tape.push(...Array(15).fill('_'));
  }
}

function heatColor(ratio) {
  const r = Math.max(0, Math.min(1, ratio));
  if (r < 0.5) {
    const t = r * 2;
    const r1 = Math.round(0 + t * 249);
    const g1 = Math.round(200 - t * 85);
    const b1 = Math.round(255 - t * 232);
    return 'rgb(' + r1 + ',' + g1 + ',' + b1 + ')';
  } else {
    const t = (r - 0.5) * 2;
    const r1 = Math.round(249 + t * 6);
    const g1 = Math.round(115 - t * 115);
    const b1 = Math.round(23 - t * 23 + t * 120);
    return 'rgb(' + r1 + ',' + g1 + ',' + b1 + ')';
  }
}

function heatFill(ratio) {
  const r = Math.max(0, Math.min(1, ratio));
  if (r < 0.5) {
    const t = r * 2;
    return 'rgba(' + Math.round(0 + t * 249) + ',' + Math.round(200 - t * 85) + ',' + Math.round(255 - t * 232) + ',0.11)';
  } else {
    const t = (r - 0.5) * 2;
    return 'rgba(' + Math.round(249 + t * 6) + ',' + Math.round(115 - t * 115) + ',' + Math.round(23 + t * 97) + ',0.14)';
  }
}

function heatGlow(ratio) {
  const r = Math.max(0, Math.min(1, ratio));
  const col = heatColor(r);
  const intensity = 8 + r * 18;
  return 'drop-shadow(0 0 ' + intensity + 'px ' + col + ')';
}

function recordCellVisit(idx) {
  H.cellVisits[idx] = (H.cellVisits[idx] || 0) + 1;
  if (H.cellVisits[idx] > H.maxCell) H.maxCell = H.cellVisits[idx];
}

function recordStateVisit(state) {
  H.stateVisits[state] = (H.stateVisits[state] || 0) + 1;
  if (H.stateVisits[state] > H.maxState) H.maxState = H.stateVisits[state];
}

function cellHeatRatio(idx) {
  if (!H.maxCell) return 0;
  return (H.cellVisits[idx] || 0) / H.maxCell;
}

function stateHeatRatio(state) {
  if (!H.maxState) return 0;
  return (H.stateVisits[state] || 0) / H.maxState;
}

function resetHeat() {
  H.cellVisits = {};
  H.stateVisits = {};
  H.maxCell = 0;
  H.maxState = 0;
}

function renderTape(writtenAt) {
  const SHOW = 28;
  const start = Math.max(0, M.head - SHOW);
  const end = Math.min(M.tape.length, M.head + SHOW + 1);
  const W = 56;
  const G_SIZE = 5;
  const STRIDE = W + G_SIZE;
  while (EL.tapeTrack.children.length < (end - start)) {
    const cell = document.createElement('div');
    cell.className = 'tape-cell';
    const idx = document.createElement('span');
    idx.className = 'tape-cell-idx';
    cell.appendChild(idx);
    EL.tapeTrack.appendChild(cell);
  }
  while (EL.tapeTrack.children.length > (end - start)) {
    EL.tapeTrack.removeChild(EL.tapeTrack.lastChild);
  }
  for (let i = start; i < end; i++) {
    const di = i - start;
    const cell = EL.tapeTrack.children[di];
    const v = M.tape[i];
    const isActive = i === M.head;
    const isBlank = v === '_';
    const isWritten = i === writtenAt;
    const ratio = cellHeatRatio(i);
    let cls = 'tape-cell';
    if (isActive) cls += ' active';
    else if (isBlank) cls += ' blank';
    if (isWritten) cls += ' written';
    if (ratio >= 0.65) cls += ' heat-hot';
    else if (ratio >= 0.3) cls += ' heat-warm';
    cell.className = cls;
    if (ratio > 0 && !isActive) {
      const col = heatColor(ratio);
      const alpha = 0.04 + ratio * 0.1;
      cell.style.background = 'rgba(' + heatBgComponents(ratio) + ',' + alpha + ')';
      cell.style.borderColor = 'rgba(' + heatRgbComponents(ratio) + ',' + (0.2 + ratio * 0.55) + ')';
      cell.style.boxShadow = '0 0 ' + (6 + ratio * 14) + 'px rgba(' + heatRgbComponents(ratio) + ',' + (0.08 + ratio * 0.22) + ')';
    } else if (!isActive) {
      cell.style.background = '';
      cell.style.borderColor = '';
      cell.style.boxShadow = '';
    }
    const nodes = cell.childNodes;
    let textNode = null;
    for (let n = 0; n < nodes.length; n++) {
      if (nodes[n].nodeType === Node.TEXT_NODE) { textNode = nodes[n]; break; }
    }
    if (textNode) { textNode.textContent = v; } else { cell.insertBefore(document.createTextNode(v), cell.firstChild); }
    const idxEl = cell.querySelector('.tape-cell-idx');
    if (idxEl) idxEl.textContent = i;
  }
  const activeRel = M.head - start;
  const vpW = EL.tapeViewport.clientWidth;
  const offset = (vpW / 2) - (activeRel * STRIDE) - (W / 2);
  EL.tapeTrack.style.transform = 'translateX(' + offset + 'px)';
  const sym = M.tape[M.head] || '_';
  EL.stateBadge.textContent = M.state;
  EL.stateBadge.className = 'readout-val' + (isHalt(M.state) && M.halted ? ' halted' : '');
  EL.stepBadge.textContent = M.steps;
  EL.symbolBadge.textContent = sym;
  EL.headBadge.textContent = M.head;
}

function heatRgbComponents(ratio) {
  const r2 = Math.max(0, Math.min(1, ratio));
  if (r2 < 0.5) {
    const t = r2 * 2;
    return Math.round(0 + t * 249) + ',' + Math.round(200 - t * 85) + ',' + Math.round(255 - t * 232);
  } else {
    const t = (r2 - 0.5) * 2;
    return Math.round(249 + t * 6) + ',' + Math.round(115 - t * 115) + ',' + Math.round(23 + t * 97);
  }
}

function heatBgComponents(ratio) {
  return heatRgbComponents(ratio);
}

function buildTrace() {
  EL.traceRow.innerHTML = '';
  EL.traceCount.textContent = Math.max(0, M.trace.length - 1) + ' transitions';
  M.trace.forEach((entry, i) => {
    const isLast = i === M.trace.length - 1;
    const node = document.createElement('div');
    node.className = 'trace-node' + (isLast ? ' current' : '') + (entry.halted ? ' halted' : '');
    node.textContent = entry.state;
    node.title = 'Rewind to step ' + i;
    node.addEventListener('click', () => rewindTo(i));
    EL.traceRow.appendChild(node);
    if (!isLast) {
      const arr = document.createElement('div');
      arr.className = 'trace-arrow';
      EL.traceRow.appendChild(arr);
    }
  });
  requestAnimationFrame(() => { EL.traceScroll.scrollLeft = EL.traceScroll.scrollWidth; });
}

function clearHistory() {
  EL.historyList.innerHTML = '<div class="empty-state">No steps taken yet.</div>';
  EL.historyCount.textContent = '';
}

function appendHistoryRow(s, active) {
  if (EL.historyList.querySelector('.empty-state')) EL.historyList.innerHTML = '';
  const tapeView = s.tape.map((c, i) => i === s.head ? '[' + c + ']' : c).join('').replace(/^_+/, '').replace(/_+$/, '') || '_';
  const row = document.createElement('div');
  row.className = 'history-row' + (active ? ' active-row' : '');
  row.dataset.step = s.steps;
  row.innerHTML =
    '<span class="h-num">' + s.steps + '</span>' +
    '<span class="h-tape">' + tapeView + '</span>' +
    '<span class="h-state">' + s.state + '</span>' +
    '<span class="h-rule">' + (s.rule || '—') + '</span>';
  row.addEventListener('click', () => rewindTo(s.steps));
  EL.historyList.appendChild(row);
  row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  const all = EL.historyList.querySelectorAll('.history-row');
  EL.historyCount.textContent = all.length + ' entries';
}

function markActiveHistoryRow(step) {
  EL.historyList.querySelectorAll('.history-row').forEach(r => {
    r.classList.toggle('active-row', parseInt(r.dataset.step) === step);
  });
}

function highlightRule(idx) {
  EL.rulesTbody.querySelectorAll('tr').forEach(r => r.classList.remove('active-rule'));
  if (idx >= 0) {
    const row = G('r' + idx);
    if (row) { row.classList.add('active-rule'); row.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }
}

function extractStatesFromRules(rulesText) {
  const states = new Set();
  rulesText.split('\n').forEach(line => {
    const raw = line.trim();
    if (!raw) return;
    const parts = raw.split(',').map(s => s.trim());
    if (parts.length !== 5) return;
    states.add(parts[0]);
    states.add(parts[4]);
  });
  return states;
}

function initMachine() {
  M.rules = parseRules(EL.rulesInput.value);
  const raw = EL.tapeInput.value.trim() || '_';
  const PAD = 20;
  M.tape = [...Array(PAD).fill('_'), ...raw.split(''), ...Array(PAD).fill('_')];
  M.head = PAD;
  M.state = 'q0';
  M.prevState = null;
  M.steps = 0;
  M.running = false;
  M.animating = false;
  M.halted = false;
  M.history = [snap(null)];
  M.trace = [{ state: 'q0', halted: false }];
  D.nodes = {};
  D.edges = [];
  D.fromState = null;
  D.toState = null;
  D.anim = null;
  D.pan = { x: 0, y: 0 };
  D.zoom = 1;
  resetHeat();
  stopRun();
  setStatus('ready');
  EL.ruleDisplay.textContent = 'Ready — step or run';
  EL.rulesTbody.querySelectorAll('tr').forEach(r => r.classList.remove('active-rule'));
  clearHistory();
  buildTrace();
  renderTape(-1);
  showView('view-run');

  const allStates = extractStatesFromRules(EL.rulesInput.value);
  allStates.add('q0');

  setTimeout(() => {
    dResize();
    allStates.forEach(st => dSpawnNodeSilent(st));
    dSpawnNode('q0');
    dAutoLayout();
    dDraw();
    if (EL.diagramHint) {
      const nc = Object.keys(D.nodes).length;
      EL.diagramHint.textContent = nc + ' state' + (nc !== 1 ? 's' : '') + ' pre-loaded · step to animate transitions';
    }
  }, 80);
}

function dSpawnNodeSilent(state) {
  if (D.nodes[state]) return;
  const w = D.w || 600, h = D.h || 400;
  const existing = Object.keys(D.nodes);
  let wx, wy;
  if (existing.length === 0) {
    wx = w * 0.18 / D.zoom;
    wy = (h * 0.5 - D.pan.y) / D.zoom;
  } else {
    const angle = (existing.length * 2.399) % (2 * Math.PI);
    const r = Math.min(w, h) * 0.28 + existing.length * 10;
    const cx = (w * 0.5 - D.pan.x) / D.zoom;
    const cy = (h * 0.5 - D.pan.y) / D.zoom;
    wx = cx + Math.cos(angle) * r;
    wy = cy + Math.sin(angle) * r;
  }
  D.nodes[state] = { x: wx, y: wy };
}

async function doStep() {
  if (M.animating || M.halted) return false;
  bounds();
  const sym = M.tape[M.head] || '_';
  const stRules = M.rules[M.state];
  EL.rulesTbody.querySelectorAll('tr').forEach(r => r.classList.remove('active-rule'));
  if (!stRules) {
    EL.ruleDisplay.textContent = 'No rules for "' + M.state + '" — halted';
    doHalt(false);
    return false;
  }
  const rule = stRules[sym] || stRules['_'];
  if (!rule) {
    EL.ruleDisplay.textContent = 'No rule for (' + M.state + ', "' + sym + '") — halted';
    doHalt(false);
    return false;
  }
  const s = snap(rule.raw);
  M.history.push(s);
  EL.ruleDisplay.textContent = rule.raw;
  highlightRule(rule.idx);
  const writtenAt = M.head;
  recordCellVisit(M.head);
  recordStateVisit(M.state);
  M.tape[M.head] = rule.write;
  const fromSt = M.state;
  M.prevState = M.state;
  M.state = rule.next;
  M.head += (rule.move === 'R') ? 1 : -1;
  M.steps++;
  const halting = isHalt(rule.next);
  M.trace.push({ state: rule.next, halted: halting });
  buildTrace();
  appendHistoryRow(s, false);
  markActiveHistoryRow(M.steps);
  bounds();
  M.animating = true;
  setLocked(true);
  renderTape(writtenAt);
  dSpawnNode(rule.next);
  dAddEdge(fromSt, rule.next, sym, rule.write, rule.move);
  await dAnimEdge(fromSt, rule.next, 340);
  M.animating = false;
  setLocked(false);
  if (halting) { doHalt(true); return false; }
  return true;
}

function doHalt(clean) {
  stopRun();
  M.halted = true;
  setStatus('halted');
  renderTape(-1);
  toast(clean ? 'Halted in "' + M.state + '"' : 'No transition — machine halted', clean ? 'success' : 'error');
}

function setLocked(v) {
  EL.btnStep.disabled = v;
  EL.btnBack.disabled = v;
}

async function stepBack() {
  if (M.animating) return;
  if (M.history.length <= 1) { toast('Already at initial state', 'info'); return; }
  stopRun();
  M.history.pop();
  restore(M.history[M.history.length - 1]);
  if (M.trace.length > 1) M.trace.pop();
  buildTrace();
  const rows = EL.historyList.querySelectorAll('.history-row');
  if (rows.length) rows[rows.length - 1].remove();
  if (!EL.historyList.querySelector('.history-row')) clearHistory();
  M.halted = false;
  setStatus('paused');
  EL.ruleDisplay.textContent = M.history[M.history.length - 1].rule || 'Stepped back';
  D.fromState = M.prevState;
  D.toState = M.state;
  renderTape(-1);
  dDraw();
}

function rewindTo(targetStep) {
  if (targetStep >= M.history.length) return;
  stopRun();
  while (M.history.length > targetStep + 1) M.history.pop();
  while (M.trace.length > targetStep + 1) M.trace.pop();
  restore(M.history[M.history.length - 1]);
  buildTrace();
  EL.historyList.querySelectorAll('.history-row').forEach(r => {
    if (parseInt(r.dataset.step) > targetStep) r.remove();
  });
  if (!EL.historyList.querySelector('.history-row')) clearHistory();
  markActiveHistoryRow(M.steps);
  M.halted = false;
  setStatus('paused');
  D.fromState = M.prevState;
  D.toState = M.state;
  renderTape(-1);
  dDraw();
  toast('Rewound to step ' + targetStep, 'info');
  showView('view-run');
}

function toggleRun() {
  if (M.running) { stopRun(); return; }
  M.running = true;
  EL.btnRun.textContent = '⏸ Pause';
  EL.btnRun.classList.add('paused');
  setStatus('running');
  const delay = () => Math.round(1200 / parseInt(EL.speedSlider.value));
  const loop = async () => {
    if (!M.running) return;
    const cont = await doStep();
    if (cont === false) return;
    M.timer = setTimeout(loop, delay());
  };
  M.timer = setTimeout(loop, delay());
}

function stopRun() {
  M.running = false;
  clearTimeout(M.timer);
  EL.btnRun.textContent = '▶ Run';
  EL.btnRun.classList.remove('paused');
  if (!M.halted) setStatus('paused');
}

const C_CYAN = '#00c8ff';
const C_HALT = '#fb7185';
const C_TEXT = '#7b8db0';
const NODE_R = 28;

function canvasToWorld(cx, cy) {
  return {
    x: (cx - D.pan.x) / D.zoom,
    y: (cy - D.pan.y) / D.zoom
  };
}

function worldToCanvas(wx, wy) {
  return {
    x: wx * D.zoom + D.pan.x,
    y: wy * D.zoom + D.pan.y
  };
}

function dResize() {
  const cvs = EL.diagramCanvas;
  const wrap = EL.diagramWrap;
  const dpr = window.devicePixelRatio || 1;
  const rect = wrap.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (w < 10 || h < 10) return;
  cvs.style.width = w + 'px';
  cvs.style.height = h + 'px';
  cvs.width = Math.round(w * dpr);
  cvs.height = Math.round(h * dpr);
  D.w = w;
  D.h = h;
  const ctx = cvs.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dDraw();
}

function dSpawnNode(state) {
  if (D.nodes[state]) return;
  const w = D.w || 600, h = D.h || 400;
  const existing = Object.keys(D.nodes);
  let wx, wy;
  if (existing.length === 0) {
    wx = w * 0.18 / D.zoom;
    wy = (h * 0.5 - D.pan.y) / D.zoom;
  } else {
    const angle = (existing.length * 2.399) % (2 * Math.PI);
    const r = Math.min(w, h) * 0.28 + existing.length * 10;
    const cx = (w * 0.5 - D.pan.x) / D.zoom;
    const cy = (h * 0.5 - D.pan.y) / D.zoom;
    wx = cx + Math.cos(angle) * r;
    wy = cy + Math.sin(angle) * r;
  }
  D.nodes[state] = { x: wx, y: wy };
  if (EL.diagramHint) {
    const nc = Object.keys(D.nodes).length;
    EL.diagramHint.textContent = nc + ' state' + (nc !== 1 ? 's' : '') + ' · ' + D.edges.length + ' transition' + (D.edges.length !== 1 ? 's' : '') + ' discovered';
  }
  dSmoothFitAll();
}

function dAddEdge(from, to, readSym, writeSym, move) {
  const label = readSym + '/' + writeSym + ',' + move;
  const ex = D.edges.find(e => e.from === from && e.to === to);
  if (ex) { if (!ex.labels.includes(label)) ex.labels.push(label); }
  else D.edges.push({ from, to, labels: [label] });
  D.fromState = from;
  D.toState = to;
  if (EL.diagramHint) {
    const nc = Object.keys(D.nodes).length;
    EL.diagramHint.textContent = nc + ' state' + (nc !== 1 ? 's' : '') + ' · ' + D.edges.length + ' transition' + (D.edges.length !== 1 ? 's' : '') + ' discovered';
  }
}

function dComputeFitTransform() {
  const states = Object.keys(D.nodes);
  if (!states.length || !D.w || !D.h) return null;
  const PAD = NODE_R + 32;
  const xs = states.map(s => D.nodes[s].x);
  const ys = states.map(s => D.nodes[s].y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const contentW = (maxX - minX) || 1;
  const contentH = (maxY - minY) || 1;
  const scaleX = (D.w - PAD * 2) / contentW;
  const scaleY = (D.h - PAD * 2) / contentH;
  const zoom = Math.min(scaleX, scaleY, 2.0);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const panX = D.w / 2 - cx * zoom;
  const panY = D.h / 2 - cy * zoom;
  return { zoom, panX, panY };
}

function dFitAll() {
  const result = dComputeFitTransform();
  if (!result) return;
  D.zoom = result.zoom;
  D.pan.x = result.panX;
  D.pan.y = result.panY;
  dDraw();
}

function dSmoothFitAll() {
  const result = dComputeFitTransform();
  if (!result) { dDraw(); return; }
  const startZoom = D.zoom, startPanX = D.pan.x, startPanY = D.pan.y;
  const endZoom = result.zoom, endPanX = result.panX, endPanY = result.panY;
  const dur = 420;
  const t0 = performance.now();
  const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const tick = now => {
    const p = ease(Math.min(1, (now - t0) / dur));
    D.zoom = startZoom + (endZoom - startZoom) * p;
    D.pan.x = startPanX + (endPanX - startPanX) * p;
    D.pan.y = startPanY + (endPanY - startPanY) * p;
    dDraw();
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function dAnimEdge(from, to, dur) {
  return new Promise(resolve => {
    const t0 = performance.now();
    D.anim = { from, to, progress: 0 };
    D.fromState = from;
    D.toState = to;
    const tick = now => {
      const t = Math.min(1, (now - t0) / dur);
      D.anim.progress = t;
      dDraw();
      if (t < 1) requestAnimationFrame(tick);
      else { D.anim = null; dDraw(); resolve(); }
    };
    requestAnimationFrame(tick);
  });
}

function dAutoLayout() {
  const states = Object.keys(D.nodes);
  if (!states.length) return;
  if (states.length === 1) {
    D.nodes[states[0]].x = 0;
    D.nodes[states[0]].y = 0;
    dSmoothFitAll();
    return;
  }
  const haltStates = states.filter(s => isHalt(s));
  const normalStates = states.filter(s => !isHalt(s));
  const ordered = normalStates.concat(haltStates);
  const n = ordered.length;
  const radius = Math.max(120, n * 38);
  ordered.forEach((s, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    D.nodes[s].x = Math.cos(angle) * radius;
    D.nodes[s].y = Math.sin(angle) * radius;
  });
  dSmoothFitAll();
}

function dZoomAt(factor, cx, cy) {
  cx = cx !== undefined ? cx : D.w / 2;
  cy = cy !== undefined ? cy : D.h / 2;
  const newZoom = Math.min(4, Math.max(0.15, D.zoom * factor));
  D.pan.x = cx - (cx - D.pan.x) * (newZoom / D.zoom);
  D.pan.y = cy - (cy - D.pan.y) * (newZoom / D.zoom);
  D.zoom = newZoom;
  dDraw();
}

function dDraw() {
  const cvs = EL.diagramCanvas;
  const ctx = cvs.getContext('2d');
  const w = D.w, h = D.h;
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.strokeStyle = 'rgba(0,200,255,0.04)';
  ctx.lineWidth = 1;
  const gridStep = 32 * D.zoom;
  const offX = ((D.pan.x % gridStep) + gridStep) % gridStep;
  const offY = ((D.pan.y % gridStep) + gridStep) % gridStep;
  for (let x = offX; x < w; x += gridStep) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = offY; y < h; y += gridStep) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.restore();

  ctx.save();
  ctx.translate(D.pan.x, D.pan.y);
  ctx.scale(D.zoom, D.zoom);

  D.edges.forEach(edge => {
    const nf = D.nodes[edge.from];
    const nt = D.nodes[edge.to];
    if (!nf || !nt) return;
    const isAct = edge.from === D.fromState && edge.to === D.toState;
    const isSelf = edge.from === edge.to;
    const hasRev = D.edges.some(e => e.from === edge.to && e.to === edge.from);
    ctx.save();
    ctx.strokeStyle = isAct ? C_CYAN : 'rgba(0,200,255,0.18)';
    ctx.lineWidth = isAct ? 1.8 / D.zoom : 1.2 / D.zoom;
    if (isAct) { ctx.shadowColor = C_CYAN; ctx.shadowBlur = 8; }

    if (isSelf) {
      const lr = 22;
      const cy2 = nf.y - NODE_R - lr + 4;
      ctx.beginPath();
      ctx.arc(nf.x, cy2, lr, 0.25, Math.PI * 2 - 0.25);
      ctx.stroke();
      if (isAct && D.anim) {
        const ang = 0.25 + D.anim.progress * (Math.PI * 2 - 0.5);
        const px2 = nf.x + Math.cos(ang - Math.PI / 2) * lr;
        const py2 = cy2 + Math.sin(ang - Math.PI / 2) * lr;
        ctx.fillStyle = C_CYAN; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(px2, py2, 4.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      dLabel(ctx, edge.labels.join(' | '), nf.x + lr + 8, nf.y - NODE_R - lr * 2 + 4, isAct);
      return;
    }

    const ang = Math.atan2(nt.y - nf.y, nt.x - nf.x);
    const sx = nf.x + Math.cos(ang) * NODE_R;
    const sy = nf.y + Math.sin(ang) * NODE_R;
    const ex = nt.x - Math.cos(ang) * (NODE_R + 9);
    const ey = nt.y - Math.sin(ang) * (NODE_R + 9);
    let cpx, cpy;
    if (hasRev) {
      const pl = Math.hypot(nt.x - nf.x, nt.y - nf.y) || 1;
      const px3 = -(nt.y - nf.y) / pl, py3 = (nt.x - nf.x) / pl;
      cpx = (sx + ex) / 2 + px3 * 40;
      cpy = (sy + ey) / 2 + py3 * 40;
    } else {
      cpx = (sx + ex) / 2;
      cpy = (sy + ey) / 2;
    }
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cpx, cpy, ex, ey);
    ctx.stroke();
    const aLen = 9;
    const tx2 = ex - cpx, ty2 = ey - cpy;
    const tl = Math.hypot(tx2, ty2) || 1;
    const ta = tx2 / tl, tb = ty2 / tl;
    ctx.fillStyle = isAct ? C_CYAN : 'rgba(0,200,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - aLen * ta + aLen * 0.4 * (-tb), ey - aLen * tb + aLen * 0.4 * ta);
    ctx.lineTo(ex - aLen * ta - aLen * 0.4 * (-tb), ey - aLen * tb - aLen * 0.4 * ta);
    ctx.closePath();
    ctx.fill();
    if (isAct && D.anim) {
      const p = D.anim.progress;
      const bx = (1 - p) * (1 - p) * sx + 2 * (1 - p) * p * cpx + p * p * ex;
      const by = (1 - p) * (1 - p) * sy + 2 * (1 - p) * p * cpy + p * p * ey;
      ctx.fillStyle = C_CYAN; ctx.shadowColor = C_CYAN; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    const mlx = hasRev
      ? (sx + ex) / 2 + (-(nt.y - nf.y) / (Math.hypot(nt.x - nf.x, nt.y - nf.y) || 1)) * 40
      : (sx + ex) / 2;
    const mly = hasRev
      ? (sy + ey) / 2 + ((nt.x - nf.x) / (Math.hypot(nt.x - nf.x, nt.y - nf.y) || 1)) * 40
      : (sy + ey) / 2;
    dLabel(ctx, edge.labels.join(' | '), mlx, mly, isAct);
  });

  Object.entries(D.nodes).forEach(([state, node]) => {
    const isActive = state === D.toState;
    const isHaltSt = isHalt(state);
    const isStart = state === 'q0' || (Object.keys(D.nodes)[0] === state && !D.nodes['q0']);
    const hRatio = stateHeatRatio(state);
    const hCol = heatColor(hRatio);
    const hFill = heatFill(hRatio);
    const hasHeat = hRatio > 0.04;

    ctx.save();
    if (isActive) {
      if (hasHeat && !isHaltSt) {
        ctx.shadowColor = hCol;
        ctx.shadowBlur = 24;
      } else {
        ctx.shadowColor = isHaltSt ? C_HALT : C_CYAN;
        ctx.shadowBlur = 22;
      }
    } else if (hasHeat && !isHaltSt) {
      ctx.shadowColor = hCol;
      ctx.shadowBlur = 6 + hRatio * 14;
    }

    ctx.beginPath(); ctx.arc(node.x, node.y, NODE_R, 0, Math.PI * 2);
    if (hasHeat && !isHaltSt) {
      ctx.fillStyle = isActive ? hFill : hFill;
    } else {
      ctx.fillStyle = isActive && isHaltSt ? 'rgba(251,113,133,0.12)'
        : isActive ? 'rgba(0,200,255,0.10)'
          : isHaltSt ? 'rgba(251,113,133,0.06)'
            : 'rgba(14,18,32,0.8)';
    }
    ctx.fill();

    ctx.beginPath(); ctx.arc(node.x, node.y, NODE_R, 0, Math.PI * 2);
    if (hasHeat && !isHaltSt) {
      const alpha = isActive ? 1 : 0.4 + hRatio * 0.6;
      const parts = heatRgbComponents(hRatio).split(',');
      ctx.strokeStyle = 'rgba(' + parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + alpha + ')';
    } else {
      ctx.strokeStyle = isActive && isHaltSt ? C_HALT
        : isActive ? C_CYAN
          : isHaltSt ? 'rgba(251,113,133,0.45)'
            : isStart ? 'rgba(129,140,248,0.55)'
              : 'rgba(0,200,255,0.2)';
    }
    ctx.lineWidth = isActive ? 2 / D.zoom : 1.4 / D.zoom;
    ctx.stroke();

    if (isHaltSt) {
      ctx.beginPath(); ctx.arc(node.x, node.y, NODE_R - 4, 0, Math.PI * 2);
      ctx.strokeStyle = isActive ? 'rgba(251,113,133,0.3)' : 'rgba(251,113,133,0.12)';
      ctx.lineWidth = 1 / D.zoom;
      ctx.stroke();
    }

    if (isStart) {
      ctx.strokeStyle = 'rgba(129,140,248,0.5)';
      ctx.lineWidth = 1 / D.zoom;
      const ax = node.x - NODE_R - 18;
      ctx.beginPath(); ctx.moveTo(ax, node.y); ctx.lineTo(node.x - NODE_R - 2, node.y); ctx.stroke();
      ctx.fillStyle = 'rgba(129,140,248,0.5)';
      ctx.beginPath(); ctx.moveTo(node.x - NODE_R - 2, node.y); ctx.lineTo(node.x - NODE_R - 9, node.y - 4); ctx.lineTo(node.x - NODE_R - 9, node.y + 4); ctx.closePath(); ctx.fill();
    }

    ctx.font = (isActive ? '500' : '400') + ' ' + (11 / D.zoom) + 'px "DM Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowBlur = 0;
    if (hasHeat && !isHaltSt) {
      ctx.fillStyle = isActive ? hCol : hCol;
    } else {
      ctx.fillStyle = isActive && isHaltSt ? C_HALT : isActive ? C_CYAN : isHaltSt ? 'rgba(251,113,133,0.7)' : C_TEXT;
    }
    ctx.fillText(state, node.x, node.y);

    if (hasHeat && !isHaltSt) {
      ctx.font = '300 ' + (7 / D.zoom) + 'px "DM Mono", monospace';
      ctx.fillStyle = 'rgba(' + heatRgbComponents(hRatio) + ',0.6)';
      ctx.fillText('×' + (H.stateVisits[state] || 0), node.x, node.y + NODE_R + 9 / D.zoom);
    }
    ctx.restore();
  });

  ctx.restore();
}

function dLabel(ctx, text, x, y, active) {
  ctx.save();
  ctx.font = (9 / D.zoom) + 'px "DM Mono", monospace';
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(7,9,15,0.88)';
  ctx.fillRect(x - tw / 2 - 3, y - 6, tw + 6, 12);
  ctx.fillStyle = active ? C_CYAN : 'rgba(59,69,96,1)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function getNodeAtCanvas(cx, cy) {
  for (const [st, node] of Object.entries(D.nodes)) {
    const tx = node.x * D.zoom + D.pan.x;
    const ty = node.y * D.zoom + D.pan.y;
    if (Math.hypot(cx - tx, cy - ty) <= NODE_R * D.zoom) {
      return st;
    }
  }
  return null;
}

EL.diagramCanvas.addEventListener('mousedown', e => {
  const rect = EL.diagramCanvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const hit = getNodeAtCanvas(cx, cy);
  if (hit) {
    D.drag = hit;
    const w = canvasToWorld(cx, cy);
    D.dox = w.x - D.nodes[hit].x;
    D.doy = w.y - D.nodes[hit].y;
    EL.diagramCanvas.classList.add('dragging');
    EL.diagramCanvas.classList.remove('node-hover');
  } else {
    D.panning = true;
    D.mouseStart.x = cx;
    D.mouseStart.y = cy;
    D.panStart.x = D.pan.x;
    D.panStart.y = D.pan.y;
    EL.diagramCanvas.classList.add('dragging');
  }
});

EL.diagramCanvas.addEventListener('mousemove', e => {
  const rect = EL.diagramCanvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  if (D.drag) {
    const w = canvasToWorld(cx, cy);
    D.nodes[D.drag].x = w.x - D.dox;
    D.nodes[D.drag].y = w.y - D.doy;
    dDraw();
    return;
  }
  if (D.panning) {
    D.pan.x = D.panStart.x + (cx - D.mouseStart.x);
    D.pan.y = D.panStart.y + (cy - D.mouseStart.y);
    dDraw();
    return;
  }
  const hit = getNodeAtCanvas(cx, cy);
  if (hit) {
    if (!EL.diagramCanvas.classList.contains('node-hover')) {
      EL.diagramCanvas.classList.add('node-hover');
    }
  } else {
    EL.diagramCanvas.classList.remove('node-hover');
  }
});

EL.diagramCanvas.addEventListener('mouseup', () => {
  D.drag = null;
  D.panning = false;
  EL.diagramCanvas.classList.remove('dragging');
});

EL.diagramCanvas.addEventListener('mouseleave', () => {
  D.drag = null;
  D.panning = false;
  EL.diagramCanvas.classList.remove('dragging');
  EL.diagramCanvas.classList.remove('node-hover');
});

EL.diagramCanvas.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = EL.diagramCanvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const factor = e.deltaY < 0 ? 1.12 : 0.89;
  dZoomAt(factor, cx, cy);
}, { passive: false });

EL.fabFit.addEventListener('click', () => {
  dSmoothFitAll();
  toast('View centered', 'info', 1200);
});

EL.fabZoomIn.addEventListener('click', () => dZoomAt(1.2));
EL.fabZoomOut.addEventListener('click', () => dZoomAt(0.83));

const FS_ICON_EXPAND = `<path d="M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
const FS_ICON_COLLAPSE = `<path d="M7 3v4H3M13 3v4h4M7 17v-4H3M13 17v-4h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;

EL.fabFullscreen.addEventListener('click', () => {
  D.fullscreen = !D.fullscreen;
  EL.canvasWrapper.classList.toggle('fullscreen', D.fullscreen);
  EL.fabFsIcon.innerHTML = D.fullscreen ? FS_ICON_COLLAPSE : FS_ICON_EXPAND;
  EL.fabFullscreen.classList.toggle('active-fab', D.fullscreen);
  setTimeout(() => {
    dResize();
    dSmoothFitAll();
  }, 60);
  toast(D.fullscreen ? 'Teacher Mode — fullscreen' : 'Dashboard view restored', 'info', 1400);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && D.fullscreen) {
    D.fullscreen = false;
    EL.canvasWrapper.classList.remove('fullscreen');
    EL.fabFsIcon.innerHTML = FS_ICON_EXPAND;
    EL.fabFullscreen.classList.remove('active-fab');
    setTimeout(() => { dResize(); dSmoothFitAll(); }, 60);
    return;
  }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const onRun = G('view-run').classList.contains('active');
  if (!onRun) return;
  if (e.key === ' ') { e.preventDefault(); toggleRun(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); if (!M.running && !M.animating) doStep(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); stepBack(); }
  if (e.key === 'r' || e.key === 'R') { e.preventDefault(); stopRun(); initMachine(); }
});

EL.btnInit.addEventListener('click', initMachine);
EL.btnBackEdit.addEventListener('click', () => { stopRun(); showView('view-setup'); });
EL.btnStep.addEventListener('click', () => { if (!M.running && !M.animating) doStep(); });
EL.btnBack.addEventListener('click', stepBack);
EL.btnRun.addEventListener('click', toggleRun);
EL.btnReset.addEventListener('click', () => { stopRun(); initMachine(); });

EL.speedSlider.addEventListener('input', () => {
  const v = parseInt(EL.speedSlider.value);
  toast(Math.round(1200 / v) + 'ms / step', 'info', 900);
});

EL.btnExport.addEventListener('click', () => {
  const payload = {
    tape: EL.tapeInput.value,
    rules: EL.rulesInput.value,
    nodePositions: {}
  };
  Object.entries(D.nodes).forEach(([state, node]) => {
    payload.nodePositions[state] = { x: node.x, y: node.y };
  });
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tm-workspace-' + Date.now() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Workspace exported', 'success', 2200);
});

EL.btnImport.addEventListener('click', () => {
  EL.importFileInput.value = '';
  EL.importFileInput.click();
});

EL.importFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    let payload;
    try {
      payload = JSON.parse(evt.target.result);
    } catch (err) {
      toast('Invalid JSON file', 'error');
      return;
    }
    if (!payload.rules) { toast('Missing rules in workspace file', 'error'); return; }
    EL.tapeInput.value = payload.tape || '';
    EL.rulesInput.value = payload.rules || '';
    EL.regexInput.value = '';
    EL.regexStatus.textContent = '';
    EL.regexStatus.className = 'regex-status';
    M.rules = parseRules(EL.rulesInput.value);
    const raw = EL.tapeInput.value.trim() || '_';
    const PAD = 20;
    M.tape = [...Array(PAD).fill('_'), ...raw.split(''), ...Array(PAD).fill('_')];
    M.head = PAD;
    M.state = 'q0';
    M.prevState = null;
    M.steps = 0;
    M.running = false;
    M.animating = false;
    M.halted = false;
    M.history = [snap(null)];
    M.trace = [{ state: 'q0', halted: false }];
    D.edges = [];
    D.fromState = null;
    D.toState = null;
    D.anim = null;
    D.pan = { x: 0, y: 0 };
    D.zoom = 1;
    resetHeat();
    stopRun();
    setStatus('ready');
    EL.ruleDisplay.textContent = 'Ready — step or run';
    EL.rulesTbody.querySelectorAll('tr').forEach(r => r.classList.remove('active-rule'));
    clearHistory();
    buildTrace();
    renderTape(-1);
    showView('view-run');
    const savedPositions = payload.nodePositions || {};
    const allStates = extractStatesFromRules(EL.rulesInput.value);
    allStates.add('q0');
    setTimeout(() => {
      dResize();
      D.nodes = {};
      if (Object.keys(savedPositions).length > 0) {
        allStates.forEach(st => {
          if (savedPositions[st]) {
            D.nodes[st] = { x: savedPositions[st].x, y: savedPositions[st].y };
          } else {
            dSpawnNodeSilent(st);
          }
        });
        Object.keys(savedPositions).forEach(st => {
          if (!D.nodes[st]) {
            D.nodes[st] = { x: savedPositions[st].x, y: savedPositions[st].y };
          }
        });
        dFitAll();
      } else {
        allStates.forEach(st => dSpawnNodeSilent(st));
        dSpawnNode('q0');
        dAutoLayout();
      }
      dDraw();
      if (EL.diagramHint) {
        const nc = Object.keys(D.nodes).length;
        EL.diagramHint.textContent = nc + ' state' + (nc !== 1 ? 's' : '') + ' loaded from workspace · step to run';
      }
    }, 80);
    toast('Workspace imported', 'success', 2200);
  };
  reader.readAsText(file);
});

const ro = new ResizeObserver(() => {
  if (G('view-run').classList.contains('active') || D.fullscreen) {
    requestAnimationFrame(() => { dResize(); });
  }
});
ro.observe(EL.canvasWrapper);
window.addEventListener('resize', () => { dResize(); if (!M.halted) renderTape(-1); });

function regexToTM(pattern) {
  const src = pattern.trim();

  if (!src) throw new Error('Pattern is empty');

  let pos = 0;
  let nfaStateCount = 0;
  const newNfaState = () => nfaStateCount++;
  const nfaTrans = {};
  const nfaEps = {};

  const ensureNfa = s => {
    if (!nfaTrans[s]) nfaTrans[s] = {};
    if (!nfaEps[s]) nfaEps[s] = [];
  };
  const addTrans = (from, sym, to) => {
    ensureNfa(from); ensureNfa(to);
    if (!nfaTrans[from][sym]) nfaTrans[from][sym] = [];
    nfaTrans[from][sym].push(to);
  };
  const addEps = (from, to) => { ensureNfa(from); ensureNfa(to); nfaEps[from].push(to); };

  function parseExpr() { return parseAlt(); }
  function parseAlt() {
    let nfa = parseCat();
    while (pos < src.length && src[pos] === '|') {
      pos++;
      const right = parseCat();
      const s = newNfaState(), e = newNfaState();
      addEps(s, nfa.start); addEps(s, right.start);
      addEps(nfa.end, e); addEps(right.end, e);
      nfa = { start: s, end: e };
    }
    return nfa;
  }
  function parseCat() {
    let nfa = parseQuant();
    while (pos < src.length && src[pos] !== ')' && src[pos] !== '|') {
      const right = parseQuant();
      addEps(nfa.end, right.start);
      nfa = { start: nfa.start, end: right.end };
    }
    return nfa;
  }
  function parseQuant() {
    let nfa = parseAtom();
    if (pos < src.length) {
      const ch = src[pos];
      if (ch === '*') {
        pos++;
        const s = newNfaState(), e = newNfaState();
        addEps(s, nfa.start); addEps(s, e);
        addEps(nfa.end, nfa.start); addEps(nfa.end, e);
        nfa = { start: s, end: e };
      } else if (ch === '+') {
        pos++;
        const s = newNfaState(), e = newNfaState();
        addEps(s, nfa.start); addEps(nfa.end, nfa.start); addEps(nfa.end, e);
        nfa = { start: s, end: e };
      } else if (ch === '?') {
        pos++;
        const s = newNfaState(), e = newNfaState();
        addEps(s, nfa.start); addEps(s, e); addEps(nfa.end, e);
        nfa = { start: s, end: e };
      }
    }
    return nfa;
  }
  function parseAtom() {
    if (pos >= src.length) throw new Error('Unexpected end of pattern');
    const ch = src[pos];
    if (ch === '(') {
      pos++;
      const nfa = parseExpr();
      if (pos >= src.length || src[pos] !== ')') throw new Error('Missing closing parenthesis');
      pos++; return nfa;
    }
    if (ch === '\\') {
      pos++;
      if (pos >= src.length) throw new Error('Trailing backslash');
      const esc = src[pos++];
      const s = newNfaState(), e = newNfaState();
      addTrans(s, esc, e); return { start: s, end: e };
    }
    if (ch === '.') {
      pos++;
      const s = newNfaState(), e = newNfaState();
      ['0', '1', 'a', 'b', 'c', 'd', 'e', 'f', 'x', 'y', 'z'].forEach(c => addTrans(s, c, e));
      return { start: s, end: e };
    }
    if ('|)*+?'.includes(ch)) throw new Error('Unexpected operator: ' + ch);
    pos++;
    const s = newNfaState(), e = newNfaState();
    addTrans(s, ch, e); return { start: s, end: e };
  }

  let nfa;
  nfa = parseExpr();
  if (pos !== src.length) throw new Error('Unexpected character at position ' + pos + ': "' + src[pos] + '"');

  for (let i = 0; i < nfaStateCount; i++) ensureNfa(i);

  const epsClosure = states => {
    const closure = new Set(states);
    const stack = [...states];
    while (stack.length) {
      const s = stack.pop();
      for (const t of (nfaEps[s] || [])) {
        if (!closure.has(t)) { closure.add(t); stack.push(t); }
      }
    }
    return closure;
  };

  const alphabet = new Set();
  for (let s = 0; s < nfaStateCount; s++) {
    Object.keys(nfaTrans[s] || {}).forEach(sym => alphabet.add(sym));
  }

  const dfaKey = set => [...set].sort((a, b) => a - b).join(',');
  const dfaMap = new Map();
  const dfaTransitions = [];
  let dfaId = 0;
  const startClosure = epsClosure(new Set([nfa.start]));
  const startKey = dfaKey(startClosure);
  dfaMap.set(startKey, { id: dfaId++, states: startClosure, accept: startClosure.has(nfa.end) });
  const queue = [startClosure];

  while (queue.length) {
    const cur = queue.shift();
    const curKey = dfaKey(cur);
    const curDfa = dfaMap.get(curKey);
    for (const sym of alphabet) {
      const moved = new Set();
      for (const s of cur) {
        for (const t of (nfaTrans[s][sym] || [])) moved.add(t);
      }
      if (!moved.size) continue;
      const nextClosure = epsClosure(moved);
      const nextKey = dfaKey(nextClosure);
      if (!dfaMap.has(nextKey)) {
        dfaMap.set(nextKey, { id: dfaId++, states: nextClosure, accept: nextClosure.has(nfa.end) });
        queue.push(nextClosure);
      }
      dfaTransitions.push({ from: curDfa.id, sym, to: dfaMap.get(nextKey).id });
    }
  }

  const dfaStates = [...dfaMap.values()];

  const dfaTransMap = {};
  for (const { from, sym, to } of dfaTransitions) {
    if (!dfaTransMap[from]) dfaTransMap[from] = {};
    dfaTransMap[from][sym] = to;
  }

  const syms = [...alphabet];
  const acceptSet = new Set(dfaStates.filter(s => s.accept).map(s => s.id));

  const rejectSet = new Set(dfaStates.filter(s => !s.accept).map(s => s.id));

  const partitions = [];
  if (acceptSet.size > 0) partitions.push(acceptSet);
  if (rejectSet.size > 0) partitions.push(rejectSet);

  const stateToPartition = new Map();
  partitions.forEach((part, pi) => { part.forEach(sid => stateToPartition.set(sid, pi)); });

  let changed = true;
  while (changed) {
    changed = false;
    const newPartitions = [];
    for (const part of partitions) {
      if (part.size <= 1) { newPartitions.push(part); continue; }
      const groups = new Map();
      for (const sid of part) {
        const sig = syms.map(sym => {
          const target = (dfaTransMap[sid] || {})[sym];
          return target !== undefined ? stateToPartition.get(target) : -1;
        }).join(',');
        if (!groups.has(sig)) groups.set(sig, new Set());
        groups.get(sig).add(sid);
      }
      if (groups.size > 1) changed = true;
      groups.forEach(g => newPartitions.push(g));
    }
    partitions.length = 0;
    newPartitions.forEach(p => partitions.push(p));
    stateToPartition.clear();
    partitions.forEach((part, pi) => { part.forEach(sid => stateToPartition.set(sid, pi)); });
  }

  const startDfaId = dfaMap.get(startKey).id;
  const startPartition = stateToPartition.get(startDfaId);

  const partitionIds = new Map();
  let pidCounter = 0;
  const startPi = startPartition;
  partitionIds.set(startPi, pidCounter++);
  for (let pi = 0; pi < partitions.length; pi++) {
    if (pi !== startPi && !partitionIds.has(pi)) {
      partitionIds.set(pi, pidCounter++);
    }
  }

  const minStateId = pi => 'q' + partitionIds.get(pi);

  const minAcceptPartitions = new Set();
  for (const part of partitions) {
    const rep = [...part][0];
    if (acceptSet.has(rep)) {
      minAcceptPartitions.add(stateToPartition.get(rep));
    }
  }

  const minTransitions = new Set();
  for (let pi = 0; pi < partitions.length; pi++) {
    if (!partitionIds.has(pi)) continue;
    const rep = [...partitions[pi]][0];
    for (const sym of syms) {
      const target = (dfaTransMap[rep] || {})[sym];
      if (target !== undefined) {
        const targetPi = stateToPartition.get(target);
        if (partitionIds.has(targetPi)) {
          minTransitions.add(pi + '|' + sym + '|' + targetPi);
        }
      }
    }
  }

  const lines = [];
  for (const key of minTransitions) {
    const [fromPi, sym, toPi] = key.split('|');
    lines.push(minStateId(parseInt(fromPi)) + ', ' + sym + ', ' + sym + ', R, ' + minStateId(parseInt(toPi)));
  }

  const processedPartitions = new Set();
  for (let pi = 0; pi < partitions.length; pi++) {
    if (!partitionIds.has(pi)) continue;
    if (processedPartitions.has(pi)) continue;
    processedPartitions.add(pi);
    const isAccept = minAcceptPartitions.has(pi);
    const rep = [...partitions[pi]][0];
    const definedSyms = new Set(syms.filter(sym => (dfaTransMap[rep] || {})[sym] !== undefined));
    for (const sym of syms) {
      if (!definedSyms.has(sym)) {
        lines.push(minStateId(pi) + ', ' + sym + ', ' + sym + ', R, qReject');
      }
    }
    if (isAccept) {
      lines.push(minStateId(pi) + ', _, _, R, qAccept');
    } else {
      lines.push(minStateId(pi) + ', _, _, R, qReject');
    }
  }

  return { rules: lines.join('\n'), stateCount: partitionIds.size };
}

function regexMinimalString(pattern) {
  let pos = 0;
  const src = pattern.trim();
  function parseExpr() { return parseAlt(); }
  function parseAlt() {
    let best = parseCat();
    while (pos < src.length && src[pos] === '|') {
      pos++;
      const alt = parseCat();
      if (alt.length < best.length) best = alt;
    }
    return best;
  }
  function parseCat() {
    let r = '';
    while (pos < src.length && src[pos] !== ')' && src[pos] !== '|') r += parseQuant();
    return r;
  }
  function parseQuant() {
    const a = parseAtom();
    if (pos < src.length) {
      const ch = src[pos];
      if (ch === '*') { pos++; return a; }
      if (ch === '+') { pos++; return a; }
      if (ch === '?') { pos++; return a; }
    }
    return a;
  }
  function parseAtom() {
    if (pos >= src.length) return '';
    const ch = src[pos];
    if (ch === '(') { pos++; const r = parseExpr(); if (pos < src.length && src[pos] === ')') pos++; return r; }
    if (ch === '\\') { pos++; return pos < src.length ? src[pos++] : ''; }
    if (ch === '.') { pos++; return 'a'; }
    if ('|)*+?'.includes(ch)) return '';
    pos++;
    return ch;
  }
  try { const r = parseExpr(); return r || 'a'; } catch (e) { return 'a'; }
}

EL.btnCompile.addEventListener('click', () => {
  const pat = EL.regexInput.value.trim();
  if (!pat) {
    EL.regexStatus.textContent = 'Enter a pattern first.';
    EL.regexStatus.className = 'regex-status err';
    return;
  }

  let result;
  try {
    result = regexToTM(pat);
  } catch (err) {
    const msg = 'Invalid Regular Expression: ' + err.message;
    EL.regexStatus.textContent = '\u2717 ' + msg;
    EL.regexStatus.className = 'regex-status err';
    toast('\u2717 ' + msg, 'error', 3800);
    return;
  }

  const minTape = regexMinimalString(pat);
  EL.rulesInput.value = result.rules;
  EL.tapeInput.value = minTape;
  const lineCount = result.rules.split('\n').filter(l => l.trim()).length;
  EL.regexStatus.textContent = '\u2713 Minimized DFA/DTM \u2014 ' + result.stateCount + ' states \u00b7 ' + lineCount + ' rules \u00b7 tape: "' + minTape + '"';
  EL.regexStatus.className = 'regex-status ok';
  toast('\u2713 Minimized DFA: ' + result.stateCount + ' states, ' + lineCount + ' rules', 'success', 2800);
  initMachine();
});

buildPresets();
setStatus('idle');
dResize();
