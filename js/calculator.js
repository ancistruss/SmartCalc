class CalcModel {
  constructor() {
    this.mode = 'normal';
    this.expression = '';
    this.result = '';
    this.history = JSON.parse(localStorage.getItem('sc_calc_history') || '[]');
    this.onUpdate = null;
  }

  setMode(mode) {
    this.mode = mode;
    this.expression = '';
    this.result = '';
    this._notify();
  }

  appendToken(token) {
    const ops = ['+', '-', '×', '÷'];
    if (ops.includes(token) && ops.includes(this._lastChar())) {
      this.expression = this.expression.slice(0, -1);
    }
    if (token === '.') {
      const parts = this.expression.split(/[\+\-\×\÷]/);
      if (parts[parts.length - 1].includes('.')) return;
    }
    this.expression += token;
    this._notify();
  }

  backspace() {
    this.expression = this.expression.slice(0, -1);
    this._notify();
  }

  clearAll() {
    this.expression = '';
    this.result = '';
    this._notify();
  }

  toggleSign() {
    if (!this.expression) return;
    if (this.expression.startsWith('-')) {
      this.expression = this.expression.slice(1);
    } else {
      this.expression = '-' + this.expression;
    }
    this._notify();
  }

  percent() {
    if (!this.expression) return;
    try {
      const val = eval(this._toEvalExpr(this.expression));
      this.expression = String(val / 100);
      this._notify();
    } catch (_) { }
  }

  calculate() {
    if (!this.expression) return;
    try {
      let expr = this.expression;
      let res;

      if (this.mode === 'prog') {
        res = this._evalProg(expr);
      } else {
        res = eval(this._toEvalExpr(expr));
      }

      const entry = `${expr} = ${res}`;
      this.result = String(res);
      this.history.unshift(entry);
      if (this.history.length > 20) this.history.pop();
      localStorage.setItem('sc_calc_history', JSON.stringify(this.history));

      this.expression = String(res);
      this._notify();
    } catch (_) {
      this.result = 'Помилка';
      this._notify();
    }
  }

  bitwiseOp(op) {
    this.expression += ` ${op} `;
    this._notify();
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('sc_calc_history');
    this._notify();
  }

  _evalProg(expr) {
    const js = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\bAND\b/g, '&')
      .replace(/\bOR\b/g, '|')
      .replace(/\bXOR\b/g, '^');

  const withHex = js.replace(/\b([0-9A-Fa-f]+)\b/g, (m) => {
    if (m.startsWith('0x') || m.startsWith('0X')) return m;
    return '0x' + m.toUpperCase();
  });

  return eval(withHex).toString(16).toUpperCase();
  }

  _toEvalExpr(expr) {
    return expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  }

  _lastChar() {
    return this.expression.slice(-1);
  }

  _notify() {
    if (this.onUpdate) this.onUpdate();
  }
}

class CalcView {
  constructor() {
    this.exprEl = document.querySelector('.cp-display-expr');
    this.resultEl = document.querySelector('.cp-display-result');
    this.historyEl = document.getElementById('history');
    this.normalKeys = document.getElementById('normalKeys');
    this.progKeys = document.getElementById('progKeys');
    this.basePanel = document.getElementById('basePanel');
    this.modeBtns = document.querySelectorAll('.cp-mode-btn');

    this.hexVal = document.getElementById('hexVal');
    this.decVal = document.getElementById('decVal');
    this.octVal = document.getElementById('octVal');
    this.binVal = document.getElementById('binVal');
  }

  render(model) {
    this.exprEl.textContent = model.expression || '0';
    this.resultEl.textContent = model.result ? `= ${model.result}` : '';

    this.modeBtns.forEach((btn, i) => {
      const isNormal = model.mode === 'normal';
      btn.classList.toggle('active', i === 0 ? isNormal : !isNormal);
    });

    if (model.mode === 'normal') {
      this.normalKeys.style.display = '';
      this.progKeys.style.display = 'none';
      this.basePanel.style.display = 'none';
    } else {
      this.normalKeys.style.display = 'none';
      this.progKeys.style.display = '';
      this.basePanel.style.display = '';
      this._renderBaseConversion(model.result || model.expression);
    }

    this.historyEl.innerHTML = model.history.length
      ? model.history.map((h) => `<div class="cp-history-item">${h}</div>`).join('')
      : '<div class="cp-history-item" style="opacity:.5">Поки пусто</div>';
  }

  _renderBaseConversion(val) {
    if (!val) return;
    const match = String(val).match(/([0-9A-Fa-f]+)$/);
    if (!match) return;
    const dec = parseInt(match[1], 16);
    if (isNaN(dec)) return;

    this.hexVal.textContent = dec.toString(16).toUpperCase();
    this.decVal.textContent = dec.toString(10);
    this.octVal.textContent = dec.toString(8);
    this.binVal.textContent = dec.toString(2);
  }
}

class CalcController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    model.onUpdate = () => view.render(model);

    view.modeBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => model.setMode(i === 0 ? 'normal' : 'prog'));
    });

    document.getElementById('btnClearHistory').addEventListener('click', () => model.clearHistory());

    document.addEventListener('keydown', (e) => this._handleKey(e));

    view.render(model);
  }

  _handleKey(e) {
    const { key } = e;
    if ('0123456789'.includes(key)) { this.model.appendToken(key); return; }
    if ('abcdefABCDEF'.includes(key) && this.model.mode === 'prog') { this.model.appendToken(key.toUpperCase()); return; }
    if (key === '+') { this.model.appendToken('+'); return; }
    if (key === '-') { this.model.appendToken('−'); return; }
    if (key === '*') { this.model.appendToken('×'); return; }
    if (key === '/') { e.preventDefault(); this.model.appendToken('÷'); return; }
    if (key === '.') { this.model.appendToken('.'); return; }
    if (key === 'Enter' || key === '=') { this.model.calculate(); return; }
    if (key === 'Backspace') { this.model.backspace(); return; }
    if (key === 'Escape') { this.model.clearAll(); return; }
    if (key === '%') { this.model.percent(); return; }
  }
}

let _model;

window.num = (v) => _model.appendToken(v);
window.op = (v) => _model.appendToken(v);
window.calculate = () => _model.calculate();
window.clearAll = () => _model.clearAll();
window.backspace = () => _model.backspace();
window.toggleSign = () => _model.toggleSign();
window.percent = () => _model.percent();
window.bitwiseOp = (v) => _model.bitwiseOp(v);

document.addEventListener('DOMContentLoaded', () => {
  _model = new CalcModel();
  const view = new CalcView();
  const controller = new CalcController(_model, view);

  document.querySelectorAll('.cp-key-fn').forEach((btn) => {
    if (btn.textContent.trim() === 'AC') {
      btn.addEventListener('click', () => _model.clearAll());
    }
  });

  document.querySelectorAll('#normalKeys .cp-key').forEach((btn) => {
    if (!btn.getAttribute('onclick') && btn.textContent.trim().match(/^[0-9]$/)) {
      const digit = btn.textContent.trim();
      btn.addEventListener('click', () => _model.appendToken(digit));
    }
    if (btn.classList.contains('cp-key-op') && !btn.getAttribute('onclick')) {
      const o = btn.textContent.trim();
      btn.addEventListener('click', () => _model.appendToken(o));
    }
  });

  document.querySelectorAll('#progKeys .cp-key').forEach((btn) => {
    if (!btn.getAttribute('onclick') && btn.textContent.trim().match(/^[0-9]$/)) {
      const digit = btn.textContent.trim();
      btn.addEventListener('click', () => _model.appendToken(digit));
    }
  });
});
