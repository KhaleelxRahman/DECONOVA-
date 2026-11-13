import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import {
  binaryToGray,
  calculateCacheMapping,
  calculateCPUPerformance,
  calculatePipelineSpeedup,
  computeSignedRepresentations,
  convertNumberBase,
  convertToIEEE754,
  convertToIEEE754Double,
  evaluateBooleanExpression,
  generateBoothMultiplicationSteps,
  generateMultiplicationSteps,
  generateNonRestoringDivisionSteps,
  generateRestoringDivisionSteps,
  performTwosComplementArithmetic,
  simulateFourBitAdderSubtractor,
  simulateHamming12Bit,
  solveKMap,
} from '../utils/calculators';
import { VisualLabId } from '../types/academic';

interface InteractiveLabsProps {
  activeLabId: VisualLabId;
  onSelectLab?: (labId: VisualLabId) => void;
  embedded?: boolean;
}

export const LAB_META: { id: VisualLabId; unit: number; title: string; subtitle: string }[] = [
  { id: 'number-converter', unit: 1, title: 'Number Base Converter', subtitle: 'Int & Fraction + Verification' },
  { id: 'signed-complements', unit: 1, title: 'Complements & Arithmetic', subtitle: 'SM / 1s / 2s + Overflow' },
  { id: 'ieee754', unit: 1, title: 'IEEE 754 Floating-Point', subtitle: 'Binary32 & Binary64' },
  { id: 'codes-hamming', unit: 1, title: 'Gray, BCD & Hamming ECC', subtitle: '12-Bit SEC Error Injector' },
  { id: 'boolean-algebra', unit: 2, title: 'Boolean Expression Lab', subtitle: 'Parser + Truth Table + SOP/POS' },
  { id: 'logic-gates-adder', unit: 2, title: 'Gates, Decoder & 4-Bit Adder', subtitle: 'Mode M Adder/Subtractor' },
  { id: 'kmap-simplifier', unit: 2, title: 'Karnaugh Map (2/3/4-Var)', subtitle: 'Click Cells + Slide 33 Fix' },
  { id: 'sequential-circuits', unit: 2, title: 'Flip-Flops, Shift & Counter', subtitle: 'Clock-Pulsed State Stepper' },
  { id: 'multiplication-division', unit: 3, title: 'Mult, Booth & Division', subtitle: 'Animated Register Stepper' },
  { id: 'architecture-io', unit: 4, title: 'Instruction, Handshake & DMA', subtitle: 'Step-by-Step Control Flows' },
  { id: 'cache-mapping', unit: 4, title: 'Cache Mapping & AMAT', subtitle: 'Direct / Assoc / k-Way' },
  { id: 'pipeline-simulator', unit: 5, title: 'Pipeline & Hazard Animator', subtitle: 'Gantt + Forwarding + Speedup' },
  { id: 'performance-flops', unit: 1, title: 'CPU Time, MIPS & FLOPS', subtitle: 'Performance + Amdahl Check' },
];

export const InteractiveLabs: React.FC<InteractiveLabsProps> = ({
  activeLabId,
  onSelectLab,
  embedded = false,
}) => {
  return (
    <div className="space-y-4">
      {!embedded && onSelectLab && (
        <div className="rounded-lg border border-stone-200 bg-white p-3 dark:border-slate-700/80 dark:bg-[#141E33]">
          <h1 className="mb-2 font-['Fraunces'] text-lg font-bold text-stone-900 dark:text-slate-50">
            Select Interactive DECO Laboratory (13 Deterministic Simulators)
          </h1>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {LAB_META.map((lab) => {
              const selected = lab.id === activeLabId;
              return (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => onSelectLab(lab.id)}
                  className={`rounded border px-3 py-2 text-left transition-colors ${
                    selected
                      ? 'border-blue-700 bg-blue-50 text-blue-950 dark:border-blue-500 dark:bg-blue-950/70 dark:text-blue-100'
                      : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:border-stone-300 hover:bg-white dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-200 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                    Unit {lab.unit}
                  </div>
                  <div className="text-sm font-semibold">{lab.title}</div>
                  <div className="text-xs text-stone-500 dark:text-slate-400">{lab.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-stone-200 bg-[#FCFBF8] p-4 text-stone-900 sm:p-5 dark:border-slate-700/80 dark:bg-[#F5F2EA] dark:text-stone-900">
        {activeLabId === 'number-converter' && <NumberConverterLab />}
        {activeLabId === 'signed-complements' && <SignedComplementsLab />}
        {activeLabId === 'ieee754' && <IEEE754Lab />}
        {activeLabId === 'codes-hamming' && <CodesHammingLab />}
        {activeLabId === 'boolean-algebra' && <BooleanAlgebraLab />}
        {activeLabId === 'logic-gates-adder' && <LogicGatesAdderLab />}
        {activeLabId === 'kmap-simplifier' && <KMapLab />}
        {activeLabId === 'sequential-circuits' && <SequentialLab />}
        {activeLabId === 'multiplication-division' && <ArithmeticStepperLab />}
        {activeLabId === 'cache-mapping' && <CacheMappingLab />}
        {activeLabId === 'pipeline-simulator' && <PipelineSimulatorLab />}
        {activeLabId === 'performance-flops' && <PerformanceFlopsLab />}
        {activeLabId === 'architecture-io' && <ArchitectureIOLab />}
      </div>
    </div>
  );
};

/* 1. NUMBER BASE CONVERTER LAB */
const NumberConverterLab: React.FC = () => {
  const [inputVal, setInputVal] = useState('163.875');
  const [fromBase, setFromBase] = useState<2 | 8 | 10 | 16>(10);
  const [toBase, setToBase] = useState<2 | 8 | 10 | 16>(2);
  const [history, setHistory] = useState<string[]>([
    '163.875₁₀ → 10100011.111₂',
    '520₁₀ → 208₁₆',
    '480₁₀ → 740₈',
  ]);

  const result = useMemo(
    () => convertNumberBase(inputVal, fromBase, toBase, 6),
    [inputVal, fromBase, toBase]
  );

  const intByteVal = result.valid ? Math.floor(Math.abs(result.decimalValue)) : 0;
  const byteBits = useMemo(() => {
    const clamped = intByteVal % 256;
    return [128, 64, 32, 16, 8, 4, 2, 1].map((w) => ({
      weight: w,
      on: (clamped & w) !== 0,
    }));
  }, [intByteVal]);

  const saveHistory = () => {
    if (!result.valid) return;
    const entry = `${result.inputNormalized} (base ${fromBase}) → ${result.convertedValue} (base ${toBase})`;
    setHistory((prev) => [entry, ...prev.filter((x) => x !== entry)].slice(0, 5));
  };

  const applyRandom = () => {
    const samples: { v: string; f: 2 | 8 | 10 | 16; t: 2 | 8 | 10 | 16 }[] = [
      { v: '45.625', f: 10, t: 2 },
      { v: '2F', f: 16, t: 10 },
      { v: '740', f: 8, t: 2 },
      { v: '101101.101', f: 2, t: 10 },
      { v: '219', f: 10, t: 16 },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    setInputVal(pick.v);
    setFromBase(pick.f);
    setToBase(pick.t);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-['Fraunces'] text-lg font-bold text-slate-900">
            Number System Base Conversion Laboratory
          </h3>
          <p className="text-xs text-slate-600">
            Formula: Value = Σ (dᵢ × rⁱ). Supports integers and fractions with repeated division, multiplication, and live 8-bit weights.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: '163.875₁₀→₂', val: '163.875', f: 10 as const, t: 2 as const },
            { label: '520₁₀→₁₆', val: '520', f: 10 as const, t: 16 as const },
            { label: '480₁₀→₈', val: '480', f: 10 as const, t: 8 as const },
            { label: '11010111₂→₁₆', val: '11010111', f: 2 as const, t: 16 as const },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setInputVal(preset.val);
                setFromBase(preset.f);
                setToBase(preset.t);
              }}
              className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={applyRandom}
            className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            Random Example
          </button>
          <button
            type="button"
            onClick={() => {
              setInputVal('163.875');
              setFromBase(10);
              setToBase(2);
            }}
            className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Input Number</label>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 font-['IBM_Plex_Mono'] text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">From Base</label>
          <select
            value={fromBase}
            onChange={(e) => setFromBase(Number(e.target.value) as 2 | 8 | 10 | 16)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value={2}>Binary (2)</option>
            <option value={8}>Octal (8)</option>
            <option value={10}>Decimal (10)</option>
            <option value={16}>Hexadecimal (16)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">To Base</label>
          <select
            value={toBase}
            onChange={(e) => setToBase(Number(e.target.value) as 2 | 8 | 10 | 16)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value={2}>Binary (2)</option>
            <option value={8}>Octal (8)</option>
            <option value={10}>Decimal (10)</option>
            <option value={16}>Hexadecimal (16)</option>
          </select>
        </div>
      </div>

      {!result.valid ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{result.error}</div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-blue-200 bg-blue-50/70 p-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Converted Result (Base {toBase})
              </div>
              <div className="tabular-nums font-['IBM_Plex_Mono'] text-2xl font-bold text-slate-900">
                {result.convertedValue}
                <sub className="ml-1 text-xs font-normal text-slate-600">{toBase}</sub>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Exact Base-10 Value: <span className="font-semibold">{Number(result.decimalValue.toFixed(6))}₁₀</span>
              </div>
            </div>
            <button
              type="button"
              onClick={saveHistory}
              className="rounded border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
            >
              Save to History
            </button>
          </div>

          {/* Positional Weights Lighting Up (128 64 32 16 8 4 2 1) */}
          <div className="bg-graph-paper rounded border border-slate-200 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-700">
                Positional Weights (Lower 8 Integer Bits: {intByteVal % 256}₁₀)
              </span>
              <span className="font-['IBM_Plex_Mono'] text-slate-600">
                Active sum: {byteBits.filter((b) => b.on).map((b) => b.weight).join(' + ') || '0'} = {intByteVal % 256}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {byteBits.map((b) => (
                <div
                  key={b.weight}
                  className={`rounded border p-2 text-center font-['IBM_Plex_Mono'] transition-colors ${
                    b.on
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  <div className="text-[10px] opacity-80">{b.weight}</div>
                  <div className="text-base font-bold">{b.on ? '1' : '0'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded border border-slate-200 bg-white p-3">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                Integer Part: Repeated Division (Read Bottom → Top)
              </h4>
              <table className="w-full text-left font-['IBM_Plex_Mono'] text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-1">Division</th>
                    <th className="py-1">Quotient</th>
                    <th className="py-1">Remainder (Digit)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.integerSteps.map((s, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-1">{s.operation}</td>
                      <td className="py-1">{s.quotientOrProduct}</td>
                      <td className="py-1 font-bold text-blue-700">{s.digit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded border border-slate-200 bg-white p-3">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                Fractional Part: Repeated Multiplication (Read Top → Bottom)
              </h4>
              {result.fractionSteps.length === 0 ? (
                <p className="text-xs text-slate-500">No fractional digits after radix point.</p>
              ) : (
                <table className="w-full text-left font-['IBM_Plex_Mono'] text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-1">Multiply</th>
                      <th className="py-1">Rem Fraction</th>
                      <th className="py-1">Carry (Digit)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.fractionSteps.map((s, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-1">{s.operation}</td>
                        <td className="py-1">{s.quotientOrProduct}</td>
                        <td className="py-1 font-bold text-emerald-700">{s.digit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <div>
              <span className="font-bold">Double-Check Verification ({result.verificationPassed ? 'Passed' : 'Approx'}): </span>
              <span className="font-['IBM_Plex_Mono']">{result.verificationFormula}</span>
            </div>
          </div>

          <div className="rounded border border-amber-200 bg-amber-50/60 p-3 text-xs text-stone-800">
            <strong>What just happened?</strong> Integer digits were divided repeatedly by {toBase} (remainders give bits from right to left), fractional digits were multiplied repeatedly by {toBase} (integer carries read left to right), and the lit weight boxes verify the integer value directly.
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <div className="mb-1 text-xs font-semibold text-slate-600">Recent Conversions</div>
            <div className="flex flex-wrap gap-2 font-['IBM_Plex_Mono'] text-xs text-slate-700">
              {history.map((h) => (
                <span key={h} className="rounded border border-slate-200 bg-white px-2 py-0.5">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 2. SIGNED COMPLEMENTS & ARITHMETIC LAB */
const SignedComplementsLab: React.FC = () => {
  const [valA, setValA] = useState(7);
  const [valB, setValB] = useState(5);
  const [op, setOp] = useState<'+' | '-'>('-');

  const repA = useMemo(() => computeSignedRepresentations(valA, 8), [valA]);
  const arith = useMemo(() => performTwosComplementArithmetic(valA, valB, op, 8), [valA, valB, op]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">8-Bit Signed Representations &amp; 2&apos;s Complement Arithmetic</h3>
          <p className="text-xs text-slate-500">Test QUIZ_01 (−18), DECO_Ast_Unit1 (+7 − +5, ±23), and Signed Overflow (−128 to +127).</p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setValA(7);
              setValB(5);
              setOp('-');
            }}
            className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400"
          >
            (+7) − (+5)
          </button>
          <button
            type="button"
            onClick={() => {
              setValA(-18);
              setValB(5);
              setOp('+');
            }}
            className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400"
          >
            QUIZ_01: −18
          </button>
          <button
            type="button"
            onClick={() => {
              setValA(100);
              setValB(50);
              setOp('+');
            }}
            className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400"
          >
            Overflow: 100+50
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Operand A (−127 to +127)</label>
          <input
            type="number"
            min={-127}
            max={127}
            value={valA}
            onChange={(e) => setValA(Math.max(-127, Math.min(127, Number(e.target.value) || 0)))}
            className="w-full rounded border border-slate-300 px-3 py-2 font-['IBM_Plex_Mono'] text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Operation</label>
          <select
            value={op}
            onChange={(e) => setOp(e.target.value as '+' | '-')}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="+">Addition (A + B)</option>
            <option value="-">Subtraction (A − B)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Operand B (−127 to +127)</label>
          <input
            type="number"
            min={-127}
            max={127}
            value={valB}
            onChange={(e) => setValB(Math.max(-127, Math.min(127, Number(e.target.value) || 0)))}
            className="w-full rounded border border-slate-300 px-3 py-2 font-['IBM_Plex_Mono'] text-sm"
          />
        </div>
      </div>

      {repA.valid && (
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: 'Signed-Magnitude (A)', bits: repA.signedMagnitude },
            { label: "1's Complement (A)", bits: repA.onesComplement },
            { label: "2's Complement (A)", bits: repA.twosComplement },
          ].map((item) => (
            <div key={item.label} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-600">{item.label}</div>
              <div className="mt-1 font-['IBM_Plex_Mono'] text-lg font-bold tracking-wider text-slate-900">
                <span className="text-red-600">{item.bits[0]}</span>
                <span>{item.bits.slice(1)}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">Red leftmost bit = Sign Bit (MSB)</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded border border-slate-200 p-4 font-['IBM_Plex_Mono'] text-sm">
        <div className="mb-2 text-xs font-sans font-bold uppercase tracking-wider text-slate-500">
          8-Bit 2&apos;s Complement Arithmetic Trace
        </div>
        <div className="space-y-1 text-slate-800">
          <div>
            A ({valA}) : <span className="font-bold">{arith.aBin}</span>
          </div>
          <div>
            {op === '-' ? `2's comp(−${valB})` : `B (${valB})`} :{' '}
            <span className="font-bold">{performTwosComplementArithmetic(0, op === '-' ? -valB : valB, '+', 8).bBin}</span>
          </div>
          <div className="border-t border-slate-300 pt-1">
            8-Bit Sum : <span className="font-bold text-blue-700">{arith.resultBin}</span> ={' '}
            <span className="font-bold">{arith.resultSignedDecimal}₁₀</span> (Carry Out = {arith.carryOut}, Carry into Sign = {arith.cPrev})
          </div>
        </div>
        <div className="mt-3 font-sans text-xs">
          {arith.overflow ? (
            <span className="font-semibold text-red-700">
              Overflow Detected! C_out ({arith.carryOut}) ≠ C_in(MSB) ({arith.cPrev}) — true math result {arith.expectedDecimal} exceeds 8-bit signed range [−128, +127].
            </span>
          ) : (
            <span className="font-semibold text-emerald-700">
              Verified Clean: C_out ({arith.carryOut}) == C_in(MSB) ({arith.cPrev}) → No Overflow! Check: {valA} {op} {valB} = {arith.expectedDecimal}.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* 3. IEEE 754 FLOATING POINT LAB (32-BIT & 64-BIT) */
const IEEE754Lab: React.FC = () => {
  const [value, setValue] = useState('13.625');
  const [precision, setPrecision] = useState<'32' | '64'>('32');

  const num = Number(value);
  const res32 = useMemo(() => convertToIEEE754(num), [num]);
  const res64 = useMemo(() => convertToIEEE754Double(num), [num]);
  const active = precision === '32' ? res32 : res64;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">IEEE 754 Floating-Point Visualizer</h3>
          <p className="text-xs text-slate-500">Supports Binary32 (Bias 127) and Binary64 (Bias 1023) with reverse reconstruction verification.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['13.625', '-3.75', '0.1', '-26.25'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setValue(v)}
              className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Decimal Number</label>
          <input
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 font-['IBM_Plex_Mono'] text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">IEEE 754 Precision Format</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPrecision('32')}
              className={`flex-1 rounded border px-3 py-2 text-xs font-semibold ${
                precision === '32' ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              Binary32 (Single · 32-bit)
            </button>
            <button
              type="button"
              onClick={() => setPrecision('64')}
              className={`flex-1 rounded border px-3 py-2 text-xs font-semibold ${
                precision === '64' ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              Binary64 (Double · 64-bit)
            </button>
          </div>
        </div>
      </div>

      {!active.valid ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{active.error}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded border border-red-200 bg-red-50/50 p-3">
              <div className="text-xs font-bold text-red-800">Sign Bit (1 bit)</div>
              <div className="font-['IBM_Plex_Mono'] text-xl font-bold text-slate-900">{active.signBit}</div>
              <div className="text-xs text-slate-600">{active.signBit === '1' ? 'Negative (−)' : 'Positive (+)'}</div>
            </div>
            <div className="rounded border border-amber-200 bg-amber-50/50 p-3">
              <div className="text-xs font-bold text-amber-800">
                Biased Exponent ({precision === '32' ? '8 bits · Bias 127' : '11 bits · Bias 1023'})
              </div>
              <div className="break-all font-['IBM_Plex_Mono'] text-base font-bold text-slate-900">
                {active.exponentBits}
              </div>
              <div className="text-xs text-slate-600">
                E = {active.unbiasedExponent} → Biased = {active.biasedExponent}
              </div>
            </div>
            <div className="rounded border border-blue-200 bg-blue-50/50 p-3">
              <div className="text-xs font-bold text-blue-800">
                Mantissa / Fraction ({precision === '32' ? '23 bits' : '52 bits'})
              </div>
              <div className="break-all font-['IBM_Plex_Mono'] text-xs font-bold text-slate-900">
                {active.mantissaBits}
              </div>
              <div className="mt-1 text-xs text-slate-600">Hex: {active.hexRepresentation}</div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <div>
              <span className="font-bold">Reverse Formula Verification: </span>
              <span className="font-['IBM_Plex_Mono']">{active.verificationFormula}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* 4. GRAY CODE, BCD & 12-BIT HAMMING ECC LAB */
const CodesHammingLab: React.FC = () => {
  const [binInput, setBinInput] = useState('110101');
  const [data8, setData8] = useState('10110011');
  const [flipPos, setFlipPos] = useState(7);

  const grayRes = useMemo(() => binaryToGray(binInput), [binInput]);
  const hamming = useMemo(() => simulateHamming12Bit(data8, flipPos), [data8, flipPos]);

  return (
    <div className="space-y-5">
      <div className="rounded border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-900">Part A: Binary → Gray Code Converter (QUIZ_01 Bonus)</h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Binary Bits</label>
            <input
              type="text"
              value={binInput}
              onChange={(e) => setBinInput(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-1.5 font-['IBM_Plex_Mono'] text-sm"
            />
          </div>
          <div className="rounded bg-slate-50 p-2.5 font-['IBM_Plex_Mono'] text-sm">
            {grayRes.valid ? (
              <>
                <div>
                  Gray Code: <span className="font-bold text-blue-700">{grayRes.gray}</span>
                </div>
                <div className="text-xs text-emerald-700">Reverse Check → Binary: {grayRes.checkBinary}</div>
              </>
            ) : (
              <span className="text-xs text-red-600">Enter only 0s and 1s.</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-900">
          Part B: 12-Bit Even-Parity Hamming Error Detection &amp; Correction (DECO1_2 Slides 54–60)
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">8 Data Bits</label>
            <input
              type="text"
              maxLength={8}
              value={data8}
              onChange={(e) => setData8(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-1.5 font-['IBM_Plex_Mono'] text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Inject Single-Bit Noise at Position (0 = No Error, 1–12 = Flip Bit)
            </label>
            <input
              type="range"
              min={0}
              max={12}
              value={flipPos}
              onChange={(e) => setFlipPos(Number(e.target.value))}
              className="w-full"
            />
            <div className="font-['IBM_Plex_Mono'] text-xs text-slate-600">
              Injected Noise Position: {flipPos === 0 ? 'None (Clean Transmission)' : `Bit #${flipPos}`}
            </div>
          </div>
        </div>

        {hamming.valid ? (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
              {hamming.received12Bit.split('').map((bit, i) => {
                const pos = i + 1;
                const isParity = [1, 2, 4, 8].includes(pos);
                const isErrored = pos === flipPos;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setFlipPos(flipPos === pos ? 0 : pos)}
                    className={`rounded border p-1.5 text-center font-['IBM_Plex_Mono'] text-xs ${
                      isErrored
                        ? 'border-red-500 bg-red-100 text-red-900'
                        : isParity
                        ? 'border-amber-300 bg-amber-50 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-900'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500">{isParity ? `P${pos}` : `D${pos}`}</div>
                    <div className="text-sm font-bold">{bit}</div>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              <div>
                <strong>Syndrome (P₈P₄P₂P₁):</strong>{' '}
                <span className="font-['IBM_Plex_Mono'] font-bold">{hamming.syndromeBits}</span> → Detected Position:{' '}
                <strong>{hamming.detectedErrorPos === 0 ? '0 (No Error)' : `Bit #${hamming.detectedErrorPos}`}</strong>
              </div>
              <div>
                <strong>Restored Data:</strong>{' '}
                <span className="font-['IBM_Plex_Mono'] font-bold">{hamming.extractedDataBits}</span> (Matches original:{' '}
                {hamming.verificationPassed ? 'YES' : 'NO'})
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-red-600">Enter exactly 8 bits (0 or 1).</p>
        )}
      </div>
    </div>
  );
};

/* 5. BOOLEAN EXPRESSION PARSER & SIMPLIFIER LAB */
const BooleanAlgebraLab: React.FC = () => {
  const [expr, setExpr] = useState("A'B'C + AB");
  const [varsCount, setVarsCount] = useState<2 | 3 | 4>(3);

  const res = useMemo(() => evaluateBooleanExpression(expr, varsCount), [expr, varsCount]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Boolean Expression Evaluator &amp; Truth Table Lab</h3>
          <p className="text-xs text-slate-500">Use A, B, C, D with +, ·, *, &apos; (NOT), ^ (XOR), and parentheses.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Slide 34: A'B'C + AB", e: "A'B'C + AB", v: 3 as const },
            { label: "Majority: AB + BC + AC", e: 'AB + BC + AC', v: 3 as const },
            { label: "XOR: A'B + AB'", e: "A'B + AB'", v: 2 as const },
            { label: "DeMorgan: (A+B)'", e: "(A+B)'", v: 2 as const },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setExpr(p.e);
                setVarsCount(p.v);
              }}
              className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Boolean Expression F =</label>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 font-['IBM_Plex_Mono'] text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Variables</label>
          <select
            value={varsCount}
            onChange={(e) => setVarsCount(Number(e.target.value) as 2 | 3 | 4)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value={2}>2 (A, B)</option>
            <option value={3}>3 (A, B, C)</option>
            <option value={4}>4 (A, B, C, D)</option>
          </select>
        </div>
      </div>

      {!res.valid ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{res.error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded border border-slate-200 bg-slate-50 p-3 text-xs">
            <div>
              <span className="font-bold text-slate-700">Minterms Σm: </span>
              <span className="font-['IBM_Plex_Mono'] font-semibold text-blue-700">
                Σm({res.minterms.join(', ')})
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Maxterms ΠM: </span>
              <span className="font-['IBM_Plex_Mono'] font-semibold text-slate-800">
                ΠM({res.maxterms.join(', ')})
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Canonical SOP: </span>
              <span className="font-['IBM_Plex_Mono']">{res.canonicalSOP}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Minimal SOP (K-map verified): </span>
              <span className="font-['IBM_Plex_Mono'] font-bold text-emerald-700">{res.minimalSOP}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Minimal POS (K-map verified): </span>
              <span className="font-['IBM_Plex_Mono'] font-bold text-blue-700">{res.minimalPOS}</span>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto rounded border border-slate-200">
            <table className="w-full text-center font-['IBM_Plex_Mono'] text-xs">
              <thead className="sticky top-0 bg-slate-100 text-slate-600">
                <tr>
                  <th className="py-1">Idx</th>
                  {['A', 'B', 'C', 'D'].slice(0, varsCount).map((v) => (
                    <th key={v} className="py-1">{v}</th>
                  ))}
                  <th className="py-1">F</th>
                </tr>
              </thead>
              <tbody>
                {res.truthTable.map((row) => (
                  <tr
                    key={row.rowIdx}
                    className={`border-t border-slate-100 ${row.output === 1 ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="py-1 text-slate-500">m{row.rowIdx}</td>
                    {row.inputs.map((b, i) => (
                      <td key={i} className="py-1">{b}</td>
                    ))}
                    <td className={`py-1 font-bold ${row.output === 1 ? 'text-blue-700' : 'text-slate-500'}`}>
                      {row.output}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* 6. LOGIC GATES, DECODER & 4-BIT ADDER/SUBTRACTOR LAB */
const LogicGatesAdderLab: React.FC = () => {
  const [inA, setInA] = useState<0 | 1>(1);
  const [inB, setInB] = useState<0 | 1>(0);
  const [decEn, setDecEn] = useState<0 | 1>(1);
  const [opA, setOpA] = useState(5);
  const [opB, setOpB] = useState(3);
  const [mode, setMode] = useState<0 | 1>(1);

  const adder = useMemo(() => simulateFourBitAdderSubtractor(opA, opB, mode), [opA, opB, mode]);
  const decIdx = inA * 2 + inB;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Logic Gates */}
        <div className="rounded border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Basic, Universal &amp; XOR Gates</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInA(inA ? 0 : 1)}
                className={`rounded px-2.5 py-1 font-['IBM_Plex_Mono'] text-xs font-bold ${
                  inA ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                A = {inA}
              </button>
              <button
                type="button"
                onClick={() => setInB(inB ? 0 : 1)}
                className={`rounded px-2.5 py-1 font-['IBM_Plex_Mono'] text-xs font-bold ${
                  inB ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                B = {inB}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 font-['IBM_Plex_Mono'] text-xs">
            {[
              { name: 'AND (A·B)', val: inA & inB },
              { name: 'OR (A+B)', val: inA | inB },
              { name: 'NOT (A\')', val: inA ^ 1 },
              { name: 'NAND ((AB)\')', val: (inA & inB) ^ 1 },
              { name: 'NOR ((A+B)\')', val: (inA | inB) ^ 1 },
              { name: 'XOR (A⊕B)', val: inA ^ inB },
              { name: 'XNOR ((A⊕B)\')', val: (inA ^ inB) ^ 1 },
            ].map((g) => (
              <div
                key={g.name}
                className={`flex items-center justify-between rounded border px-2.5 py-1.5 ${
                  g.val ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span>{g.name}</span>
                <span className="font-bold">{g.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2-to-4 Decoder */}
        <div className="rounded border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">2-to-4 Binary Decoder (Unit II Gap-Fill)</h4>
            <button
              type="button"
              onClick={() => setDecEn(decEn ? 0 : 1)}
              className={`rounded px-2.5 py-1 font-['IBM_Plex_Mono'] text-xs font-bold ${
                decEn ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              Enable E = {decEn}
            </button>
          </div>
          <p className="mb-2 text-xs text-slate-500">Uses switches A={inA}, B={inB} → binary {inA}{inB}₂ = D{decIdx}.</p>
          <div className="grid grid-cols-2 gap-2 font-['IBM_Plex_Mono'] text-xs">
            {[0, 1, 2, 3].map((d) => {
              const active = decEn === 1 && decIdx === d;
              return (
                <div
                  key={d}
                  className={`rounded border px-3 py-2 font-semibold ${
                    active ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  D{d} (m{d}) = {active ? '1 (HIGH)' : '0'}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4-bit Adder-Subtractor */}
      <div className="rounded border border-slate-200 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">4-Bit Ripple-Carry Adder-Subtractor (CIE-2 LAQ 3)</h4>
            <p className="text-xs text-slate-500">Mode M=0 computes A + B; Mode M=1 XOR-inverts B and sets C₀=1 for A − B.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode(0)}
              className={`rounded border px-3 py-1 text-xs font-semibold ${
                mode === 0 ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              M = 0 (Add)
            </button>
            <button
              type="button"
              onClick={() => setMode(1)}
              className={`rounded border px-3 py-1 text-xs font-semibold ${
                mode === 1 ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              M = 1 (Subtract)
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">4-bit Input A (0..15): {opA}</label>
            <input type="range" min={0} max={15} value={opA} onChange={(e) => setOpA(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">4-bit Input B (0..15): {opB}</label>
            <input type="range" min={0} max={15} value={opB} onChange={(e) => setOpB(Number(e.target.value))} className="w-full" />
          </div>
        </div>
        <div className="mt-3 grid gap-2 rounded border border-slate-200 bg-slate-50 p-3 font-['IBM_Plex_Mono'] text-xs sm:grid-cols-4">
          <div>A = <strong>{adder.aBits}</strong></div>
          <div>B ⊕ M = <strong>{adder.xorBBits}</strong></div>
          <div>Sum S₃..S₀ = <strong className="text-blue-700">{adder.sumBits}</strong></div>
          <div>
            C₄={adder.carries[4]}, C₃={adder.carries[3]} →{' '}
            <strong className={adder.overflow ? 'text-red-700' : 'text-emerald-700'}>
              {adder.overflow ? 'OVERFLOW V=1' : 'No Overflow (V=0)'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 7. K-MAP SIMPLIFIER LAB */
const KMapLab: React.FC = () => {
  const [vars, setVars] = useState<2 | 3 | 4>(3);
  const [minterms, setMinterms] = useState<number[]>([1, 2, 5, 7]);
  const [dontCares, setDontCares] = useState<number[]>([]);

  const solution = useMemo(() => solveKMap(vars, minterms, dontCares), [vars, minterms, dontCares]);

  const cycleCell = (m: number) => {
    if (minterms.includes(m)) {
      setMinterms((prev) => prev.filter((x) => x !== m));
      setDontCares((prev) => [...prev, m]);
    } else if (dontCares.includes(m)) {
      setDontCares((prev) => prev.filter((x) => x !== m));
    } else {
      setMinterms((prev) => [...prev, m]);
    }
  };

  const rows = vars === 2 ? [0, 1] : vars === 3 ? [0, 1] : [0, 1, 3, 2];
  const cols = vars === 2 ? [0, 1] : [0, 1, 3, 2];
  const rowLabels = vars === 2 ? ['A=0', 'A=1'] : vars === 3 ? ['A=0', 'A=1'] : ['AB=00', 'AB=01', 'AB=11', 'AB=10'];
  const colLabels = vars === 2 ? ['B=0', 'B=1'] : vars === 3 ? ['BC=00', 'BC=01', 'BC=11', 'BC=10'] : ['CD=00', 'CD=01', 'CD=11', 'CD=10'];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Karnaugh Map (2, 3, 4 Variables) — Click Any Cell (0 → 1 → X)</h3>
          <p className="text-xs text-slate-500">Exact Quine-McCluskey minimal SOP &amp; POS verified against all truth-table rows.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setVars(3);
              setMinterms([1, 2, 5, 7]);
              setDontCares([]);
            }}
            className="rounded border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            Slide 33 Erratum: Σm(1,2,5,7)
          </button>
          <button
            type="button"
            onClick={() => {
              setVars(3);
              setMinterms([3, 5, 6, 7]);
              setDontCares([]);
            }}
            className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            Majority: Σm(3,5,6,7)
          </button>
          <button
            type="button"
            onClick={() => {
              setVars(4);
              setMinterms([0, 1, 2, 5, 8, 9, 10, 13]);
              setDontCares([]);
            }}
            className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            4-Var Wrap: Σm(0,1,2,5,8,9,10,13)
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {([2, 3, 4] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setVars(v);
              setMinterms([]);
              setDontCares([]);
            }}
            className={`rounded border px-3 py-1 text-xs font-semibold ${
              vars === v ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            {v}-Variable K-Map
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse font-['IBM_Plex_Mono'] text-xs">
          <thead>
            <tr>
              <th className="border border-slate-200 bg-slate-100 px-3 py-2 text-slate-600">Gray Map</th>
              {colLabels.map((cl) => (
                <th key={cl} className="border border-slate-200 bg-slate-100 px-4 py-2 text-slate-700">
                  {cl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rVal, rIdx) => (
              <tr key={rVal}>
                <td className="border border-slate-200 bg-slate-100 px-3 py-2 font-bold text-slate-700">
                  {rowLabels[rIdx]}
                </td>
                {cols.map((cVal) => {
                  const cellIdx = vars === 2 ? rVal * 2 + cVal : rVal * 4 + cVal;
                  const isOne = minterms.includes(cellIdx);
                  const isX = dontCares.includes(cellIdx);
                  return (
                    <td key={cellIdx} className="border border-slate-200 p-1">
                      <button
                        type="button"
                        onClick={() => cycleCell(cellIdx)}
                        className={`flex h-14 w-16 flex-col items-center justify-center rounded border transition-colors ${
                          isOne
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : isX
                            ? 'border-amber-400 bg-amber-50 text-amber-900'
                            : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400">m{cellIdx}</span>
                        <span className="text-base font-bold">{isOne ? '1' : isX ? 'X' : '0'}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded border border-blue-200 bg-blue-50/70 p-3 text-xs">
          <div className="font-bold text-blue-900">Minimal SOP Expression</div>
          <div className="mt-1 font-['IBM_Plex_Mono'] text-base font-bold text-slate-900">{solution.minimalSOP}</div>
          <div className="mt-1 text-slate-600">
            Groups: {solution.sopGroups.map((g) => `${g.term} {${g.cells.join(',')}}`).join(' · ') || 'None'}
          </div>
        </div>
        <div className="rounded border border-emerald-200 bg-emerald-50/70 p-3 text-xs">
          <div className="font-bold text-emerald-900">Minimal POS &amp; Verification</div>
          <div className="mt-1 font-['IBM_Plex_Mono'] text-base font-bold text-slate-900">{solution.minimalPOS}</div>
          <div className="mt-1 font-semibold text-emerald-800">
            Truth-Table Match Check: {solution.truthTableMatch ? '100% Verified Across All Rows' : 'Mismatch'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-200 bg-amber-50/60 p-3 text-xs text-stone-800">
        <div>
          <strong>What just happened?</strong> Adjacent 1s in Gray-code order were grouped in powers of 2 (1, 2, 4, 8...) so variables that flip within a group cancel out automatically.
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setVars(3);
              setMinterms([1, 2, 5, 7]);
              setDontCares([]);
            }}
            className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset Slide 33
          </button>
          <button
            type="button"
            onClick={() => {
              const presets: [2 | 3 | 4, number[]][] = [
                [3, [0, 2, 4, 5, 6]],
                [3, [1, 3, 5, 7]],
                [4, [0, 1, 4, 5, 10, 11, 14, 15]],
              ];
              const p = presets[Math.floor(Math.random() * presets.length)];
              setVars(p[0]);
              setMinterms(p[1]);
              setDontCares([]);
            }}
            className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            Random Example
          </button>
        </div>
      </div>
    </div>
  );
};

/* 8. SEQUENTIAL CIRCUITS LAB (FLIP-FLOPS, SHIFT REGISTER, COUNTER) */
const SequentialLab: React.FC = () => {
  const [ffType, setFfType] = useState<'SR' | 'D' | 'JK' | 'T'>('JK');
  const [ffIn1, setFfIn1] = useState<0 | 1>(1);
  const [ffIn2, setFfIn2] = useState<0 | 1>(1);
  const [ffQ, setFfQ] = useState<0 | 1>(0);
  const [serialIn, setSerialIn] = useState<0 | 1>(1);
  const [shiftReg, setShiftReg] = useState<number[]>([1, 0, 1, 1]);
  const [counterVal, setCounterVal] = useState(0);

  const pulseClock = () => {
    // Flip-Flop Update
    if (ffType === 'D') setFfQ(ffIn1);
    else if (ffType === 'T') setFfQ(ffIn1 ? (ffQ ? 0 : 1) : ffQ);
    else if (ffType === 'SR') {
      if (ffIn1 === 1 && ffIn2 === 0) setFfQ(1);
      else if (ffIn1 === 0 && ffIn2 === 1) setFfQ(0);
    } else if (ffType === 'JK') {
      if (ffIn1 === 1 && ffIn2 === 1) setFfQ(ffQ ? 0 : 1);
      else if (ffIn1 === 1 && ffIn2 === 0) setFfQ(1);
      else if (ffIn1 === 0 && ffIn2 === 1) setFfQ(0);
    }
    // Shift Register Right (SISO)
    setShiftReg((prev) => [serialIn, prev[0], prev[1], prev[2]]);
    // 4-bit Mod-16 Counter
    setCounterVal((c) => (c + 1) % 16);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Sequential Circuits: Flip-Flops, 4-Bit Shift Register &amp; Binary Counter</h3>
          <p className="text-xs text-slate-500">Click &quot;Clock Edge ↑&quot; to advance all clocked sequential stages together.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={pulseClock}
            className="rounded bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
          >
            Clock Edge ↑ (Pulse)
          </button>
          <button
            type="button"
            onClick={() => {
              setFfQ(0);
              setShiftReg([0, 0, 0, 0]);
              setCounterVal(0);
            }}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Flip Flop */}
        <div className="rounded border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Flip-Flop Type</span>
            <select
              value={ffType}
              onChange={(e) => setFfType(e.target.value as 'SR' | 'D' | 'JK' | 'T')}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="SR">SR Flip-Flop</option>
              <option value="D">D Flip-Flop</option>
              <option value="JK">JK Flip-Flop</option>
              <option value="T">T Flip-Flop</option>
            </select>
          </div>
          <div className="flex gap-2 font-['IBM_Plex_Mono'] text-xs">
            <button
              type="button"
              onClick={() => setFfIn1(ffIn1 ? 0 : 1)}
              className="rounded border border-slate-300 bg-slate-50 px-2.5 py-1 font-bold"
            >
              {ffType === 'D' ? 'D' : ffType === 'T' ? 'T' : ffType[0]} = {ffIn1}
            </button>
            {(ffType === 'SR' || ffType === 'JK') && (
              <button
                type="button"
                onClick={() => setFfIn2(ffIn2 ? 0 : 1)}
                className="rounded border border-slate-300 bg-slate-50 px-2.5 py-1 font-bold"
              >
                {ffType[1]} = {ffIn2}
              </button>
            )}
          </div>
          <div className="mt-3 rounded bg-blue-50 p-2.5 font-['IBM_Plex_Mono'] text-sm">
            Current Q = <strong className="text-blue-800">{ffQ}</strong> | Q&apos; = <strong>{ffQ ^ 1}</strong>
            {ffType === 'SR' && ffIn1 === 1 && ffIn2 === 1 && (
              <div className="mt-1 text-xs font-sans font-semibold text-red-700">S=1, R=1 is INVALID in SR! Switch to JK to Toggle cleanly.</div>
            )}
          </div>
        </div>

        {/* 4-bit Shift Register */}
        <div className="rounded border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">4-Bit SISO Shift Register</span>
            <button
              type="button"
              onClick={() => setSerialIn(serialIn ? 0 : 1)}
              className="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-['IBM_Plex_Mono'] text-xs font-bold"
            >
              Serial In = {serialIn}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5 font-['IBM_Plex_Mono']">
            {shiftReg.map((bit, i) => (
              <div key={i} className="rounded border border-slate-300 bg-slate-50 py-2 text-center">
                <div className="text-[10px] text-slate-500">FF{i}</div>
                <div className="text-base font-bold text-slate-900">{bit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4-bit Binary Up-Counter */}
        <div className="rounded border border-slate-200 p-3">
          <div className="text-xs font-bold text-slate-800">4-Bit Mod-16 Binary Up-Counter</div>
          <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-center font-['IBM_Plex_Mono']">
            <div className="text-2xl font-bold text-emerald-900">
              {counterVal.toString(2).padStart(4, '0')}
            </div>
            <div className="text-xs text-emerald-700">Decimal Count = {counterVal}₁₀ (Mod 16)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 9. ANIMATED MULTIPLICATION, BOOTH & DIVISION LAB */
const ArithmeticStepperLab: React.FC = () => {
  const [algo, setAlgo] = useState<'multiplication' | 'booth' | 'restoring' | 'non-restoring'>('restoring');
  const [op1, setOp1] = useState(11);
  const [op2, setOp2] = useState(3);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(700);

  const boothSim = useMemo(
    () => generateBoothMultiplicationSteps(Math.max(-8, Math.min(7, op1)), Math.max(-8, Math.min(7, op2)), 4),
    [op1, op2]
  );

  const stdSim = useMemo(() => {
    const d1 = Math.max(0, Math.min(15, Math.abs(op1)));
    const d2 = Math.max(1, Math.min(15, Math.abs(op2)));
    if (algo === 'multiplication') return generateMultiplicationSteps(d1, d2, 4);
    if (algo === 'restoring') return generateRestoringDivisionSteps(d1, d2, 4);
    return generateNonRestoringDivisionSteps(d1, d2, 4);
  }, [algo, op1, op2]);

  const totalSteps = algo === 'booth' ? boothSim.steps.length : stdSim.steps.length;
  const clampedIdx = Math.min(stepIdx, totalSteps - 1);

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [algo, op1, op2]);

  useEffect(() => {
    if (!playing) return;
    if (clampedIdx >= totalSteps - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIdx((i) => Math.min(totalSteps - 1, i + 1)), speedMs);
    return () => clearTimeout(timer);
  }, [playing, clampedIdx, totalSteps, speedMs]);

  const pseudocode = algo === 'booth' ? boothSim.pseudocode : stdSim.pseudocode;
  const activeStep = algo === 'booth' ? boothSim.steps[clampedIdx] : stdSim.steps[clampedIdx];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Unit III Step-by-Step Arithmetic Algorithm Simulator
          </h3>
          <p className="text-xs text-slate-500">
            Runs line-by-line with Play / Pause / Next / Back / Speed controls and live register updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: '11 ÷ 3 Restoring', a: 'restoring' as const, x: 11, y: 3 },
            { label: '7 ÷ 3 Restoring (Ast-2)', a: 'restoring' as const, x: 7, y: 3 },
            { label: '11 ÷ 3 Non-Restoring', a: 'non-restoring' as const, x: 11, y: 3 },
            { label: 'Booth (−5) × (+3)', a: 'booth' as const, x: -5, y: 3 },
            { label: 'Unsigned 5 × 3', a: 'multiplication' as const, x: 5, y: 3 },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setAlgo(p.a);
                setOp1(p.x);
                setOp2(p.y);
              }}
              className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Algorithm</label>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as 'multiplication' | 'booth' | 'restoring' | 'non-restoring')}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="restoring">Restoring Division (4-bit)</option>
            <option value="non-restoring">Non-Restoring Division (4-bit)</option>
            <option value="booth">Booth&apos;s Signed Multiplication (4-bit)</option>
            <option value="multiplication">Unsigned Shift-Add Multiplication (4-bit)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            {algo === 'booth' ? 'Multiplicand M (−8..7)' : algo === 'multiplication' ? 'Multiplicand M (0..15)' : 'Dividend Q (0..15)'}
          </label>
          <input
            type="number"
            min={algo === 'booth' ? -8 : 0}
            max={algo === 'booth' ? 7 : 15}
            value={op1}
            onChange={(e) => setOp1(Number(e.target.value) || 0)}
            className="w-full rounded border border-slate-300 px-3 py-2 font-['IBM_Plex_Mono'] text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            {algo === 'booth' ? 'Multiplier Q (−8..7)' : algo === 'multiplication' ? 'Multiplier Q (0..15)' : 'Divisor M (1..15)'}
          </label>
          <input
            type="number"
            min={algo === 'booth' ? -8 : 1}
            max={algo === 'booth' ? 7 : 15}
            value={op2}
            onChange={(e) => setOp2(Number(e.target.value) || 1)}
            className="w-full rounded border border-slate-300 px-3 py-2 font-['IBM_Plex_Mono'] text-sm"
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex items-center gap-1 rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx((i) => Math.max(0, i - 1));
            }}
            className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx((i) => Math.min(totalSteps - 1, i + 1));
            }}
            className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx(0);
            }}
            className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-['IBM_Plex_Mono'] font-semibold">
            Step {clampedIdx + 1} / {totalSteps}
          </span>
          <label className="flex items-center gap-1.5">
            <span>Speed:</span>
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              <option value={1200}>0.5x (Slow)</option>
              <option value={700}>1x (Normal)</option>
              <option value={300}>2x (Fast)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Active Pseudocode & Registers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded border border-slate-200 p-3">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Algorithm Pseudocode</div>
          <div className="space-y-1 font-['IBM_Plex_Mono'] text-xs">
            {pseudocode.map((line, idx) => (
              <div
                key={idx}
                className={`rounded px-2.5 py-1.5 ${
                  activeStep.lineIndex === idx ? 'bg-blue-700 font-semibold text-white' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded border border-slate-200 p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Live Hardware Registers — {activeStep.action}
          </div>
          <div className="grid grid-cols-2 gap-2 font-['IBM_Plex_Mono'] sm:grid-cols-4">
            <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
              <div className="text-[10px] text-slate-500">Register A</div>
              <div className="text-sm font-bold text-blue-700">{activeStep.A}</div>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
              <div className="text-[10px] text-slate-500">Register Q</div>
              <div className="text-sm font-bold text-slate-900">{activeStep.Q}</div>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
              <div className="text-[10px] text-slate-500">M / Divisor</div>
              <div className="text-sm font-bold text-slate-900">{activeStep.M}</div>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
              <div className="text-[10px] text-slate-500">{algo === 'booth' ? 'SC | Q₋₁' : 'Count n'}</div>
              <div className="text-sm font-bold text-amber-700">
                {'qMinus1' in activeStep ? `${activeStep.sc} | ${activeStep.qMinus1}` : activeStep.n}
              </div>
            </div>
          </div>
          <div className="rounded border border-blue-200 bg-blue-50/70 p-2.5 text-xs text-slate-800">
            <strong>Step Explanation:</strong> {activeStep.note}
          </div>
          <div className="flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <span className="font-['IBM_Plex_Mono']">
              {algo === 'booth' ? boothSim.verificationFormula : stdSim.verificationFormula}
            </span>
          </div>
          <div className="rounded border border-amber-200 bg-amber-50/60 p-2.5 text-xs text-stone-800">
            <strong>What just happened?</strong> {activeStep.note} (Step {clampedIdx + 1} of {totalSteps} in {algo} trace).
          </div>
        </div>
      </div>
    </div>
  );
};

/* 10. CACHE MAPPING & AMAT LAB */
const CacheMappingLab: React.FC = () => {
  const [memWords, setMemWords] = useState(65536);
  const [blockWords, setBlockWords] = useState(16);
  const [cacheLines, setCacheLines] = useState(128);
  const [mappingType, setMappingType] = useState<'direct' | 'associative' | 'set-associative'>('set-associative');
  const [kWay, setKWay] = useState(2);
  const [hitRatio, setHitRatio] = useState(0.95);
  const [tcNs, setTcNs] = useState(10);
  const [tmNs, setTmNs] = useState(100);

  const res = useMemo(
    () => calculateCacheMapping(memWords, blockWords, cacheLines, mappingType, kWay, hitRatio, tcNs, tmNs),
    [memWords, blockWords, cacheLines, mappingType, kWay, hitRatio, tcNs, tmNs]
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900">Cache Memory Mapping &amp; AMAT Lab (CIE-2 LAQ 6)</h3>
        <p className="text-xs text-slate-500">Default values match CIE-2 Question Bank: 64K RAM, 128 Cache Lines, 16-Word Block, 2-Way, h=0.95.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">RAM Words</label>
          <select
            value={memWords}
            onChange={(e) => setMemWords(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm"
          >
            <option value={4096}>4K (2¹²)</option>
            <option value={16384}>16K (2¹⁴)</option>
            <option value={65536}>64K (2¹⁶)</option>
            <option value={1048576}>1M (2²⁰)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Block Size (Words)</label>
          <select
            value={blockWords}
            onChange={(e) => setBlockWords(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm"
          >
            <option value={4}>4 Words</option>
            <option value={8}>8 Words</option>
            <option value={16}>16 Words</option>
            <option value={32}>32 Words</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Cache Lines</label>
          <select
            value={cacheLines}
            onChange={(e) => setCacheLines(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm"
          >
            <option value={32}>32 Lines</option>
            <option value={64}>64 Lines</option>
            <option value={128}>128 Lines</option>
            <option value={256}>256 Lines</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Mapping Mode</label>
          <select
            value={mappingType}
            onChange={(e) => setMappingType(e.target.value as 'direct' | 'associative' | 'set-associative')}
            className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm"
          >
            <option value="direct">Direct Mapping</option>
            <option value="associative">Fully Associative</option>
            <option value="set-associative">k-Way Set-Associative</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {mappingType === 'set-associative' && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Associativity k-Way</label>
            <select value={kWay} onChange={(e) => setKWay(Number(e.target.value))} className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm">
              <option value={2}>2-Way</option>
              <option value={4}>4-Way</option>
              <option value={8}>8-Way</option>
            </select>
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Hit Ratio (h): {hitRatio}</label>
          <input type="range" min={0.5} max={0.99} step={0.01} value={hitRatio} onChange={(e) => setHitRatio(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Cache Tc (ns)</label>
          <input type="number" min={1} value={tcNs} onChange={(e) => setTcNs(Number(e.target.value) || 1)} className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Main Memory Tm (ns)</label>
          <input type="number" min={10} value={tmNs} onChange={(e) => setTmNs(Number(e.target.value) || 10)} className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm" />
        </div>
      </div>

      {/* Horizontal Address Bit Visualizer */}
      <div className="rounded border border-slate-200 p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          {res.addressBits}-Bit Memory Address Format Breakdown
        </div>
        <div className="flex overflow-hidden rounded border border-slate-300 text-center font-['IBM_Plex_Mono'] text-xs font-bold">
          <div style={{ flex: Math.max(1, res.tagBits) }} className="bg-blue-700 py-3 text-white">
            TAG: {res.tagBits} bits
          </div>
          {res.setOrLineBits > 0 && (
            <div style={{ flex: res.setOrLineBits }} className="border-l border-white bg-amber-500 py-3 text-white">
              {mappingType === 'direct' ? 'LINE' : 'SET'}: {res.setOrLineBits} bits
            </div>
          )}
          <div style={{ flex: res.wordBits }} className="border-l border-white bg-emerald-600 py-3 text-white">
            WORD: {res.wordBits} bits
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
          <span>Comparators Needed: <strong>{res.comparatorsRequired}</strong> · Sets: <strong>{res.numberOfSets}</strong></span>
          <span>AMAT: <strong className="text-blue-700">{res.amatNs} ns</strong></span>
          <span className="font-semibold text-emerald-700">
            Sum Check: {res.tagBits} + {res.setOrLineBits} + {res.wordBits} = {res.addressBits} bits ({res.bitSumCheckPassed ? 'Verified' : 'Invalid'})
          </span>
        </div>
      </div>
    </div>
  );
};

/* 11. ANIMATED PIPELINE & HAZARD SIMULATOR LAB */
const PipelineSimulatorLab: React.FC = () => {
  const [hazardMode, setHazardMode] = useState<'ideal' | 'raw-stall' | 'forwarding' | 'load-use'>('forwarding');
  const [stages, setStages] = useState(4);
  const [instructions, setInstructions] = useState(100);
  const [clockNs, setClockNs] = useState(10);
  const [cycle, setCycle] = useState(1);
  const [playing, setPlaying] = useState(false);

  const stageNames = ['IF', 'ID', 'EX', 'MEM', 'WB'];
  const maxCycles = hazardMode === 'raw-stall' ? 10 : hazardMode === 'load-use' ? 9 : 8;

  useEffect(() => {
    setCycle(1);
    setPlaying(false);
  }, [hazardMode]);

  useEffect(() => {
    if (!playing) return;
    if (cycle >= maxCycles) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setCycle((c) => Math.min(maxCycles, c + 1)), 650);
    return () => clearTimeout(t);
  }, [playing, cycle, maxCycles]);

  const stallCount = hazardMode === 'raw-stall' ? 2 : hazardMode === 'load-use' ? 1 : 0;
  const perf = useMemo(
    () => calculatePipelineSpeedup(stages, instructions, clockNs, stallCount),
    [stages, instructions, clockNs, stallCount]
  );

  const getCell = (instrIdx: number, cc: number) => {
    // 4 sample instructions I1..I4, dependency between I1 and I2
    if (instrIdx === 0) {
      const idx = cc - 1;
      return idx >= 0 && idx < 5 ? stageNames[idx] : '';
    }
    if (hazardMode === 'raw-stall') {
      if (instrIdx === 1) {
        if (cc === 2) return 'IF';
        if (cc === 3 || cc === 4) return 'STALL';
        const idx = cc - 4;
        return idx >= 1 && idx < 5 ? stageNames[idx] : '';
      }
      const shift = instrIdx + 2;
      const idx = cc - 1 - shift;
      return idx >= 0 && idx < 5 ? stageNames[idx] : '';
    }
    if (hazardMode === 'load-use') {
      if (instrIdx === 1) {
        if (cc === 2) return 'IF';
        if (cc === 3) return 'STALL';
        const idx = cc - 3;
        return idx >= 1 && idx < 5 ? stageNames[idx] : '';
      }
      const shift = instrIdx + 1;
      const idx = cc - 1 - shift;
      return idx >= 0 && idx < 5 ? stageNames[idx] : '';
    }
    const idx = cc - 1 - instrIdx;
    return idx >= 0 && idx < 5 ? stageNames[idx] : '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">5-Stage Pipeline Space-Time &amp; Hazard Animator</h3>
          <p className="text-xs text-slate-500">Compare RAW Stalls (Bubbles), Operand Forwarding, Load-Use Stalls, and Speedup (CIE-2 LAQ 7 &amp; 9).</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex items-center gap-1 rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={() => setCycle((c) => Math.max(1, c - 1))}
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setCycle((c) => Math.min(maxCycles, c + 1))}
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
          >
            Next (CC{cycle}/{maxCycles})
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setCycle(maxCycles);
            }}
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
          >
            Show Full Gantt
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ideal' as const, label: 'Ideal (No Dependencies)' },
          { id: 'raw-stall' as const, label: 'RAW Hazard — Stall (2 Bubbles)' },
          { id: 'forwarding' as const, label: 'RAW Hazard — Operand Forwarding (0 Bubbles)' },
          { id: 'load-use' as const, label: 'Load-Use Hazard (1 Mandatory Stall)' },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setHazardMode(m.id)}
            className={`rounded border px-3 py-1.5 text-xs font-semibold ${
              hazardMode === m.id ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full border-collapse text-center font-['IBM_Plex_Mono'] text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="border border-slate-200 px-3 py-2 text-left">Instruction</th>
              {Array.from({ length: maxCycles }, (_, i) => i + 1).map((cc) => (
                <th
                  key={cc}
                  className={`border border-slate-200 px-2 py-2 ${cc === cycle ? 'bg-blue-700 text-white' : ''}`}
                >
                  CC{cc}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['I1: ADD R1, R2, R3', 'I2: SUB R4, R1, R5', 'I3: AND R6, R7, R8', 'I4: OR R9, R10, R11'].map((label, rIdx) => (
              <tr key={label}>
                <td className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-800">
                  {label}
                </td>
                {Array.from({ length: maxCycles }, (_, i) => i + 1).map((cc) => {
                  const val = cc <= cycle ? getCell(rIdx, cc) : '';
                  return (
                    <td
                      key={cc}
                      className={`border border-slate-200 px-2 py-2 font-bold ${
                        val === 'STALL'
                          ? 'bg-red-100 text-red-800'
                          : val === 'EX' && hazardMode === 'forwarding' && rIdx === 1
                          ? 'bg-emerald-100 text-emerald-900'
                          : val
                          ? 'bg-blue-50 text-blue-900'
                          : 'text-slate-300'
                      }`}
                    >
                      {val || '·'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pipeline Quantitative Calculator */}
      <div className="rounded border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          Pipeline Quantitative Speedup Calculator (Default = CIE-2 LAQ 7: k=4, n=100, τ=10ns)
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">Stages (k)</label>
            <input type="number" min={2} max={12} value={stages} onChange={(e) => setStages(Number(e.target.value) || 2)} className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Instructions (n)</label>
            <input type="number" min={1} max={10000} value={instructions} onChange={(e) => setInstructions(Number(e.target.value) || 1)} className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Clock Cycle (ns)</label>
            <input type="number" min={1} max={100} value={clockNs} onChange={(e) => setClockNs(Number(e.target.value) || 1)} className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-sm" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 font-['IBM_Plex_Mono'] text-xs text-slate-800">
          <span>Non-Pipelined: <strong>{perf.nonPipelinedTimeNs} ns</strong> ({perf.nonPipelinedCycles} cyc)</span>
          <span>Pipelined: <strong>{perf.pipelinedTimeNs} ns</strong> ({perf.pipelinedCycles} cyc)</span>
          <span className="text-blue-700">Speedup: <strong>{perf.speedup.toFixed(2)}×</strong> (Ideal max: {perf.idealSpeedup}×)</span>
        </div>
      </div>
    </div>
  );
};

/* 12. CPU TIME, MIPS, FLOPS & AMDAHL PERFORMANCE LAB */
const PerformanceFlopsLab: React.FC = () => {
  const [icMillions, setIcMillions] = useState(2000);
  const [cpi, setCpi] = useState(1.5);
  const [clockGhz, setClockGhz] = useState(3.0);
  const [fpMillions, setFpMillions] = useState(500);
  const [parallelFrac, setParallelFrac] = useState(0.8);
  const [cores, setCores] = useState(4);

  const perf = useMemo(
    () => calculateCPUPerformance(icMillions * 1e6, cpi, clockGhz, fpMillions * 1e6, parallelFrac, cores),
    [icMillions, cpi, clockGhz, fpMillions, parallelFrac, cores]
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900">CPU Performance, MIPS, MFLOPS &amp; Amdahl&apos;s Law Lab</h3>
        <p className="text-xs text-slate-500">Live calculation of T = (IC × CPI) / Clock, MIPS, MFLOPS, and parallel speedup.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold text-slate-700">Instructions (Millions)</label>
          <input type="number" min={1} value={icMillions} onChange={(e) => setIcMillions(Number(e.target.value) || 1)} className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">Average CPI</label>
          <input type="number" step={0.1} min={0.5} value={cpi} onChange={(e) => setCpi(Number(e.target.value) || 1)} className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">Clock Rate (GHz)</label>
          <input type="number" step={0.1} min={0.1} value={clockGhz} onChange={(e) => setClockGhz(Number(e.target.value) || 1)} className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">FP Operations (Millions)</label>
          <input type="number" min={1} value={fpMillions} onChange={(e) => setFpMillions(Number(e.target.value) || 1)} className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">Parallelizable Fraction (0–1): {parallelFrac}</label>
          <input type="range" min={0} max={1} step={0.05} value={parallelFrac} onChange={(e) => setParallelFrac(Number(e.target.value))} className="mt-2 w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">Cores / Processors (n)</label>
          <input type="number" min={1} max={128} value={cores} onChange={(e) => setCores(Number(e.target.value) || 1)} className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4 font-['IBM_Plex_Mono']">
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="font-sans text-xs text-slate-500">Execution Time (T)</div>
          <div className="text-lg font-bold text-slate-900">{perf.executionTimeSec.toFixed(4)} s</div>
        </div>
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="font-sans text-xs text-slate-500">MIPS Rating</div>
          <div className="text-lg font-bold text-blue-700">{perf.mips} MIPS</div>
        </div>
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="font-sans text-xs text-slate-500">MFLOPS Rating</div>
          <div className="text-lg font-bold text-emerald-700">{perf.mflops} MFLOPS</div>
        </div>
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="font-sans text-xs text-slate-500">Amdahl Speedup</div>
          <div className="text-lg font-bold text-amber-700">{perf.amdahlSpeedup}×</div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <span className="font-['IBM_Plex_Mono']">{perf.verificationFormula}</span>
      </div>
    </div>
  );
};

/* 13. ARCHITECTURE, INSTRUCTION CYCLE, HANDSHAKING & DMA STEPPER LAB */
const ArchitectureIOLab: React.FC = () => {
  const [flow, setFlow] = useState<'instruction' | 'handshake' | 'dma'>('dma');
  const [step, setStep] = useState(0);

  const flows = {
    instruction: [
      { title: '1. Fetch Instruction', detail: 'PC → MAR; Memory Read brings instruction from RAM into MDR → IR; PC advances PC+4.' },
      { title: '2. Decode Opcode', detail: 'Control Unit decodes IR opcode and identifies addressing mode (Immediate, Direct, Register, etc.).' },
      { title: '3. Effective Address (EA)', detail: 'If Indirect or Indexed mode, calculate EA = Base + Index or fetch pointer from memory.' },
      { title: '4. Fetch Operands', detail: 'Load register/memory operand values into ALU input latches.' },
      { title: '5. Execute Operation', detail: 'ALU computes arithmetic/logic result or updates condition flags.' },
      { title: '6. Store Result', detail: 'Write result back to destination register or RAM via MAR/MDR.' },
    ],
    handshake: [
      { title: '1. Idle State', detail: 'Both Data Valid = 0 and Data Accepted = 0. Bus lines idle.' },
      { title: '2. Source Drives Data + Valid', detail: 'CPU I/O interface places byte 0x41 on Data Bus and sets Data Valid = 1.' },
      { title: '3. Receiver Latches & Acknowledges', detail: 'Peripheral reads 0x41 into buffer and raises Data Accepted = 1.' },
      { title: '4. Source Releases Valid & Bus', detail: 'Source sees Data Accepted = 1, clears Data Bus, and drops Data Valid = 0.' },
      { title: '5. Handshake Complete', detail: 'Peripheral detects Data Valid = 0 and drops Data Accepted = 0, ready for next byte.' },
    ],
    dma: [
      { title: '1. CPU Initializes DMAC', detail: 'CPU writes RAM Starting Address, Word Count (e.g. 1024), and Read/Write Mode to DMA Controller registers.' },
      { title: '2. Peripheral Requests DMA (DRQ)', detail: 'Disk/Network peripheral signals DMAC that a block is ready for RAM transfer.' },
      { title: '3. DMAC Requests Bus (BR / HOLD)', detail: 'DMAC asserts HOLD / Bus Request to CPU asking for temporary bus ownership.' },
      { title: '4. CPU Grants Bus (BG / HLDA)', detail: 'CPU completes current memory cycle, tri-states Address/Data/Control lines, and asserts HLDA = 1.' },
      { title: '5. Direct RAM Transfer', detail: 'DMAC drives Address + Data directly between Peripheral and RAM, incrementing Address and decrementing Word Count without CPU.' },
      { title: '6. Completion Interrupt', detail: 'When Word Count reaches 0, DMAC drops HOLD, releases the bus back to CPU, and fires 1 completion Interrupt!' },
    ],
  };

  const steps = flows[flow];
  const current = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Architecture, Asynchronous Handshaking &amp; DMA Flow Stepper</h3>
          <p className="text-xs text-slate-500">Walk step-by-step through Unit I/III Instruction Cycle and Unit IV Handshake / DMA bus signals.</p>
        </div>
        <div className="flex gap-1.5">
          {[
            { id: 'dma' as const, label: 'DMA Transfer (HOLD/HLDA)' },
            { id: 'handshake' as const, label: '2-Wire Handshaking' },
            { id: 'instruction' as const, label: '6-Stage Instruction Cycle' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFlow(f.id);
                setStep(0);
              }}
              className={`rounded border px-3 py-1.5 text-xs font-semibold ${
                flow === f.id ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((s, idx) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setStep(idx)}
            className={`rounded border p-2.5 text-left text-xs transition-colors ${
              step === idx ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
            }`}
          >
            <div className="font-bold">{s.title}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-blue-200 bg-blue-50/70 p-4">
        <div className="max-w-2xl">
          <div className="text-sm font-bold text-blue-900">{current.title}</div>
          <p className="mt-1 text-sm text-slate-800">{current.detail}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => (s + 1) % steps.length)}
            className="rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Next Stage
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <span>
          <strong>Source Erratum Reminder:</strong> Assignment2_DECO.pdf Q5 writes &quot;Dynamic Memory Access&quot; — always write <strong>Direct Memory Access (DMA)</strong> in your exam answers!
        </span>
      </div>
    </div>
  );
};
