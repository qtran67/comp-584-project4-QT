'use strict';

const display    = document.getElementById('display');
const expression = document.getElementById('expression');

const state = {
  current:      '0',
  previous:     null,
  operator:     null,
  waitingNext:  false,
  justEqualed:  false,
};

/* Calculate */
function calculate(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (op === '+') return x + y;
  if (op === '−') return x - y;
  if (op === '×') return x * y;
  if (op === '÷') return y === 0 ? null : x / y;
  return y;
}

/* Format display */
function format(num) {
  if (num === null || isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';
  const s = String(num);
  if (s.includes('e')) return num.toPrecision(6).replace(/\.?0+$/, '');
  const [intPart, decPart] = s.split('.');
  const formatted = parseInt(intPart, 10).toLocaleString('en-US');
  return decPart !== undefined ? formatted + '.' + decPart : formatted;
}

/* Update the display element */
function updateDisplay() {
  const val = parseFloat(state.current);
  display.textContent = isNaN(val) ? state.current : format(val);
}

/* Highlight active operator */
function highlightOperator(activeOp) {
  document.querySelectorAll('[data-action="operator"]').forEach(btn => {
    btn.classList.toggle('active-operator', btn.dataset.value === activeOp);
  });
}

/* Handlers */
function handleNumber(digit) {
  if (state.waitingNext || state.justEqualed) {
    state.current     = digit;
    state.waitingNext = false;
    state.justEqualed = false;
  } else {
    if (state.current.length >= 12) return;
    state.current = state.current === '0' ? digit : state.current + digit;
  }
  updateDisplay();
}
function handleOperator(op) {
  state.justEqualed = false;

  if (state.operator !== null && !state.waitingNext) {
    // Chain: compute pending operation first
    const result = calculate(state.previous, state.current, state.operator);
    if (result === null) {
      state.current  = 'Error';
      state.operator = null;
      state.previous = null;
      updateDisplay();
      return;
    }
    state.current  = String(result);
    state.previous = state.current;
  } else {
    state.previous = state.current;
  }

  expression.textContent = format(parseFloat(state.previous)) + ' ' + op;
  state.operator    = op;
  state.waitingNext = true;
  highlightOperator(op);
  updateDisplay();
}

function handleEquals() {
  if (state.operator === null || state.previous === null) return;

  const a      = state.previous;
  const b      = state.current;
  const result = calculate(a, b, state.operator);

  expression.textContent =
    format(parseFloat(a)) + ' ' + state.operator + ' ' + format(parseFloat(b)) + ' =';

  state.current     = result === null ? 'Error' : String(result);
  state.previous    = null;
  state.operator    = null;
  state.waitingNext = false;
  state.justEqualed = true;
  highlightOperator(null);
  updateDisplay();
}

function handleClear() {
  state.current     = '0';
  state.previous    = null;
  state.operator    = null;
  state.waitingNext = false;
  state.justEqualed = false;
  expression.textContent = '';
  highlightOperator(null);
  updateDisplay();
}

function handleBackspace() {
  if (state.waitingNext || state.justEqualed || state.current === 'Error') return;
  state.current = state.current.length > 1 ? state.current.slice(0, -1) : '0';
  updateDisplay();
}

function handleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay();
}

/* Event Listeners */
document.querySelector('.calculator-buttons').addEventListener('click', function(e) {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  if (action === 'number')    { handleNumber(value);    return; }
  if (action === 'operator')  { handleOperator(value);   return; }
  if (action === 'equals')    { handleEquals();          return; }
  if (action === 'clear')     { handleClear();           return; }
  if (action === 'backspace') { handleBackspace();       return; }
  if (action === 'sign')      { handleSign();            return; }
});

/* Keyboard support */
document.addEventListener('keydown', function(e) {
  if (e.key >= '0' && e.key <= '9') { handleNumber(e.key); return; }
  if (e.key === 'Enter' || e.key === '=') { handleEquals(); return; }
  if (e.key === 'Escape')            { handleClear();        return; }
  if (e.key === 'Backspace')         { handleBackspace();    return; }
  if (e.key === '+')                 { handleOperator('+');  return; }
  if (e.key === '-')                 { handleOperator('−');  return; }
  if (e.key === '*')                 { handleOperator('×');  return; }
  if (e.key === '/') { e.preventDefault(); handleOperator('÷'); return; }
});

updateDisplay();
