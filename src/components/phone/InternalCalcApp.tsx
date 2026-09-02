import React, { useState } from 'react';
import { Calculator, Percent, RefreshCw, Equal } from 'lucide-react';

export const InternalCalcApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Quick Commercial calculations
  const [costPrice, setCostPrice] = useState('100');
  const [marginPercent, setMarginPercent] = useState('35');
  const [calculatedSale, setCalculatedSale] = useState(135);

  const calculateMargin = (cost: string, margin: string) => {
    const c = parseFloat(cost) || 0;
    const m = parseFloat(margin) || 0;
    const sale = c * (1 + m / 100);
    setCalculatedSale(sale);
  };

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleOp = (nextOp: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let result = 0;
      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }
      setPrevValue(result);
      setDisplay(String(result));
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  };

  const handleEqual = () => {
    const inputValue = parseFloat(display);
    if (prevValue !== null && operation) {
      let result = 0;
      switch (operation) {
        case '+':
          result = prevValue + inputValue;
          break;
        case '-':
          result = prevValue - inputValue;
          break;
        case '×':
          result = prevValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? prevValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }
      setDisplay(String(result));
      setPrevValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none p-3 space-y-3">
      {/* Top Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-2.5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-700 text-cyan-400 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Calculadora Comercial</h3>
            <p className="text-[10px] text-slate-400">Margem e Descontos Rápidos</p>
          </div>
        </div>
      </div>

      {/* Standard Display */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-right">
        <div className="text-[10px] text-slate-500 font-mono h-4">
          {prevValue !== null ? `${prevValue} ${operation || ''}` : ''}
        </div>
        <div className="text-2xl font-bold font-mono text-cyan-300 truncate">{display}</div>
      </div>

      {/* Grid Keypad */}
      <div className="grid grid-cols-4 gap-1.5 text-xs font-bold font-mono">
        <button onClick={handleClear} className="bg-red-950/60 hover:bg-red-900 text-red-300 p-2.5 rounded-lg border border-red-800">
          C
        </button>
        <button
          onClick={() => {
            const val = parseFloat(display) * -1;
            setDisplay(String(val));
          }}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-lg"
        >
          ±
        </button>
        <button
          onClick={() => {
            const val = parseFloat(display) / 100;
            setDisplay(String(val));
          }}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-lg"
        >
          %
        </button>
        <button onClick={() => handleOp('÷')} className="bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 p-2.5 rounded-lg border border-cyan-700">
          ÷
        </button>

        {['7', '8', '9'].map((d) => (
          <button key={d} onClick={() => handleDigit(d)} className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg">
            {d}
          </button>
        ))}
        <button onClick={() => handleOp('×')} className="bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 p-2.5 rounded-lg border border-cyan-700">
          ×
        </button>

        {['4', '5', '6'].map((d) => (
          <button key={d} onClick={() => handleDigit(d)} className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg">
            {d}
          </button>
        ))}
        <button onClick={() => handleOp('-')} className="bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 p-2.5 rounded-lg border border-cyan-700">
          -
        </button>

        {['1', '2', '3'].map((d) => (
          <button key={d} onClick={() => handleDigit(d)} className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg">
            {d}
          </button>
        ))}
        <button onClick={() => handleOp('+')} className="bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 p-2.5 rounded-lg border border-cyan-700">
          +
        </button>

        <button onClick={() => handleDigit('0')} className="col-span-2 bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg">
          0
        </button>
        <button
          onClick={() => {
            if (!display.includes('.')) handleDigit('.');
          }}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg"
        >
          .
        </button>
        <button onClick={handleEqual} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-lg flex items-center justify-center">
          <Equal className="w-4 h-4" />
        </button>
      </div>

      {/* Commercial Markup Tool Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span className="flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-cyan-400" /> Simulador de Margem:
          </span>
          <span className="text-emerald-400 font-mono font-bold">
            Venda: R$ {calculatedSale.toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <label className="text-slate-500">Custo (R$):</label>
            <input
              type="number"
              value={costPrice}
              onChange={(e) => {
                setCostPrice(e.target.value);
                calculateMargin(e.target.value, marginPercent);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
            />
          </div>
          <div>
            <label className="text-slate-500">Margem (%):</label>
            <input
              type="number"
              value={marginPercent}
              onChange={(e) => {
                setMarginPercent(e.target.value);
                calculateMargin(costPrice, e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
