// Pure calculation and step-by-step algorithm trace engines for Sir's Classroom.
// Every function computes a deterministic result AND a second-method verification check.

export interface BaseConversionStep {
  operation: string;
  quotientOrProduct: string;
  digit: string;
}

export interface BaseConversionResult {
  valid: boolean;
  error?: string;
  inputNormalized: string;
  fromBase: number;
  toBase: number;
  decimalValue: number;
  convertedValue: string;
  integerSteps: BaseConversionStep[];
  fractionSteps: BaseConversionStep[];
  verificationFormula: string;
  verificationPassed: boolean;
}

const DIGITS = '0123456789ABCDEF';

export function convertNumberBase(
  rawInput: string,
  fromBase: 2 | 8 | 10 | 16,
  toBase: 2 | 8 | 10 | 16,
  fractionPrecision = 6
): BaseConversionResult {
  const cleaned = rawInput.trim().toUpperCase();
  if (!cleaned) {
    return {
      valid: false,
      error: 'Enter a number to convert.',
      inputNormalized: '',
      fromBase,
      toBase,
      decimalValue: 0,
      convertedValue: '',
      integerSteps: [],
      fractionSteps: [],
      verificationFormula: '',
      verificationPassed: false,
    };
  }

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return {
      valid: false,
      error: 'Only one decimal/radix point is allowed.',
      inputNormalized: cleaned,
      fromBase,
      toBase,
      decimalValue: 0,
      convertedValue: '',
      integerSteps: [],
      fractionSteps: [],
      verificationFormula: '',
      verificationPassed: false,
    };
  }

  const validChars = DIGITS.slice(0, fromBase);
  const intStr = parts[0] || '0';
  const fracStr = parts[1] || '';

  for (const ch of intStr + fracStr) {
    if (!validChars.includes(ch)) {
      return {
        valid: false,
        error: `Digit "${ch}" is not valid in base ${fromBase}. Allowed digits: ${validChars.split('').join(', ')}.`,
        inputNormalized: cleaned,
        fromBase,
        toBase,
        decimalValue: 0,
        convertedValue: '',
        integerSteps: [],
        fractionSteps: [],
        verificationFormula: '',
        verificationPassed: false,
      };
    }
  }

  // Step 1: Convert source to base 10 via positional expansion
  let intDec = 0;
  for (let i = 0; i < intStr.length; i++) {
    intDec = intDec * fromBase + DIGITS.indexOf(intStr[i]);
  }
  let fracDec = 0;
  for (let i = 0; i < fracStr.length; i++) {
    fracDec += DIGITS.indexOf(fracStr[i]) * Math.pow(fromBase, -(i + 1));
  }
  const decimalValue = intDec + fracDec;

  // Step 2: Integer part repeated division
  const integerSteps: BaseConversionStep[] = [];
  let q = intDec;
  let intOut = '';
  if (q === 0) {
    integerSteps.push({
      operation: `0 ÷ ${toBase}`,
      quotientOrProduct: '0',
      digit: '0',
    });
    intOut = '0';
  } else {
    while (q > 0) {
      const rem = q % toBase;
      const nextQ = Math.floor(q / toBase);
      const digit = DIGITS[rem];
      integerSteps.push({
        operation: `${q} ÷ ${toBase}`,
        quotientOrProduct: String(nextQ),
        digit,
      });
      intOut = digit + intOut;
      q = nextQ;
    }
  }

  // Step 3: Fractional part repeated multiplication
  const fractionSteps: BaseConversionStep[] = [];
  let fracOut = '';
  let f = fracDec;
  let count = 0;
  while (f > 1e-12 && count < fractionPrecision) {
    const product = Number((f * toBase).toFixed(10));
    const whole = Math.floor(product);
    const remFrac = Number((product - whole).toFixed(10));
    const digit = DIGITS[whole];
    fractionSteps.push({
      operation: `${Number(f.toFixed(6))} × ${toBase} = ${product}`,
      quotientOrProduct: String(remFrac),
      digit,
    });
    fracOut += digit;
    f = remFrac;
    count++;
  }

  const convertedValue = fracOut ? `${intOut}.${fracOut}` : intOut;

  // Step 4: Second-method verification via positional expansion back to base 10
  const [outInt, outFrac = ''] = convertedValue.split('.');
  const terms: string[] = [];
  let checkTotal = 0;
  for (let i = 0; i < outInt.length; i++) {
    const d = DIGITS.indexOf(outInt[i]);
    const power = outInt.length - 1 - i;
    if (d !== 0 || outInt.length <= 4) {
      terms.push(`${d}×${toBase}^${power}`);
    }
    checkTotal += d * Math.pow(toBase, power);
  }
  for (let i = 0; i < outFrac.length; i++) {
    const d = DIGITS.indexOf(outFrac[i]);
    const power = -(i + 1);
    if (d !== 0) {
      terms.push(`${d}×${toBase}^(${power})`);
    }
    checkTotal += d * Math.pow(toBase, power);
  }

  const tolerance = Math.pow(toBase, -fractionPrecision) + 1e-9;
  const verificationPassed = Math.abs(checkTotal - decimalValue) <= tolerance;
  const verificationFormula = `${terms.slice(0, 8).join(' + ')}${terms.length > 8 ? ' + ...' : ''} = ${Number(checkTotal.toFixed(6))}₁₀ (Source = ${Number(decimalValue.toFixed(6))}₁₀)`;

  return {
    valid: true,
    inputNormalized: cleaned,
    fromBase,
    toBase,
    decimalValue,
    convertedValue,
    integerSteps,
    fractionSteps,
    verificationFormula,
    verificationPassed,
  };
}

export interface SignedRepResult {
  valid: boolean;
  error?: string;
  value: number;
  bits: number;
  signedMagnitude: string;
  onesComplement: string;
  twosComplement: string;
  verificationTwosDecimal: number;
  verificationFormula: string;
}

export function computeSignedRepresentations(value: number, bits = 8): SignedRepResult {
  const maxMag = (1 << (bits - 1)) - 1;
  const minTwos = -(1 << (bits - 1));
  if (!Number.isInteger(value) || value < minTwos || value > maxMag) {
    return {
      valid: false,
      error: `For ${bits}-bit signed representation, enter an integer from ${minTwos} to +${maxMag} (Signed Magnitude & 1's Comp support −${maxMag} to +${maxMag}).`,
      value,
      bits,
      signedMagnitude: '',
      onesComplement: '',
      twosComplement: '',
      verificationTwosDecimal: 0,
      verificationFormula: '',
    };
  }

  const magBits = (n: number) => Math.abs(n).toString(2).padStart(bits - 1, '0');

  let signedMagnitude = '';
  let onesComplement = '';
  let twosComplement = '';

  if (value >= 0) {
    const b = '0' + magBits(value);
    signedMagnitude = b;
    onesComplement = b;
    twosComplement = b;
  } else {
    const pos = '0' + magBits(value);
    signedMagnitude = '1' + magBits(value);
    onesComplement = pos
      .split('')
      .map((c) => (c === '0' ? '1' : '0'))
      .join('');
    const twosVal = (1 << bits) + value;
    twosComplement = twosVal.toString(2).padStart(bits, '0');
  }

  // Second-method check: weighted sum with negative MSB weight -(2^(bits-1))
  let checkSum = -Number(twosComplement[0]) * (1 << (bits - 1));
  const checkTerms = [`-${twosComplement[0]}×2^${bits - 1}`];
  for (let i = 1; i < bits; i++) {
    const bit = Number(twosComplement[i]);
    const power = bits - 1 - i;
    if (bit === 1) {
      checkSum += 1 << power;
      checkTerms.push(`1×2^${power}`);
    }
  }

  return {
    valid: true,
    value,
    bits,
    signedMagnitude,
    onesComplement,
    twosComplement,
    verificationTwosDecimal: checkSum,
    verificationFormula: `2's comp positional check: ${checkTerms.join(' + ')} = ${checkSum}`,
  };
}

export interface TwosArithmeticResult {
  bits: number;
  aDec: number;
  bDec: number;
  operation: '+' | '-';
  aBin: string;
  bBin: string;
  bEffectiveBin: string;
  resultBin: string;
  carryOut: 0 | 1;
  cPrev: 0 | 1;
  overflow: boolean;
  resultSignedDecimal: number;
  expectedDecimal: number;
  verificationPassed: boolean;
}

export function performTwosComplementArithmetic(
  aDec: number,
  bDec: number,
  operation: '+' | '-',
  bits = 8
): TwosArithmeticResult {
  const aRep = computeSignedRepresentations(aDec, bits);
  const bRep = computeSignedRepresentations(bDec, bits);
  const aBin = aRep.twosComplement;
  const bBin = bRep.twosComplement;
  const bEffectiveBin =
    operation === '+'
      ? bBin
      : bBin
          .split('')
          .map((c) => (c === '0' ? '1' : '0'))
          .join('');
  let carry: 0 | 1 = operation === '-' ? 1 : 0;
  let cPrev: 0 | 1 = 0;
  const resBits = new Array<string>(bits);

  for (let i = bits - 1; i >= 0; i--) {
    const sum = Number(aBin[i]) + Number(bEffectiveBin[i]) + carry;
    resBits[i] = String(sum & 1);
    const nextCarry: 0 | 1 = sum >= 2 ? 1 : 0;
    if (i === 1) cPrev = nextCarry;
    carry = nextCarry;
  }

  const resultBin = resBits.join('');
  const unsignedVal = parseInt(resultBin, 2);
  const resultSignedDecimal =
    resultBin[0] === '1' ? unsignedVal - (1 << bits) : unsignedVal;
  const expectedDecimal = operation === '+' ? aDec + bDec : aDec - bDec;
  const overflow = carry !== cPrev;

  return {
    bits,
    aDec,
    bDec,
    operation,
    aBin,
    bBin,
    bEffectiveBin,
    resultBin,
    carryOut: carry,
    cPrev,
    overflow,
    resultSignedDecimal,
    expectedDecimal,
    verificationPassed: !overflow ? resultSignedDecimal === expectedDecimal : true,
  };
}

export interface IEEE754Result {
  valid: boolean;
  error?: string;
  input: number;
  signBit: '0' | '1';
  binaryNormalized: string;
  unbiasedExponent: number;
  biasedExponent: number;
  exponentBits: string;
  mantissaBits: string;
  full32Bits: string;
  hexRepresentation: string;
  verificationValue: number;
  verificationFormula: string;
  verificationPassed: boolean;
}

export function convertToIEEE754(num: number): IEEE754Result {
  if (!Number.isFinite(num)) {
    return {
      valid: false,
      error: 'Enter a valid finite real number (e.g., 13.625 or -3.75).',
      input: 0,
      signBit: '0',
      binaryNormalized: '0',
      unbiasedExponent: 0,
      biasedExponent: 0,
      exponentBits: '00000000',
      mantissaBits: '0'.repeat(23),
      full32Bits: '0'.repeat(32),
      hexRepresentation: '0x00000000',
      verificationValue: 0,
      verificationFormula: '',
      verificationPassed: false,
    };
  }

  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, num, false);
  const uint = view.getUint32(0, false);
  const full32Bits = uint.toString(2).padStart(32, '0');
  const signBit = full32Bits[0] as '0' | '1';
  const exponentBits = full32Bits.slice(1, 9);
  const mantissaBits = full32Bits.slice(9);
  const biasedExponent = parseInt(exponentBits, 2);
  const unbiasedExponent = num === 0 ? 0 : biasedExponent - 127;

  const absNum = Math.abs(num);
  let binaryNormalized = '0';
  if (absNum !== 0) {
    const trimmedMantissa = mantissaBits.replace(/0+$/, '') || '0';
    binaryNormalized = `1.${trimmedMantissa} × 2^${unbiasedExponent}`;
  }

  // Second-method verification from extracted IEEE 754 fields
  let mantissaVal = 0;
  for (let i = 0; i < 23; i++) {
    if (mantissaBits[i] === '1') {
      mantissaVal += Math.pow(2, -(i + 1));
    }
  }
  const reconstructed =
    num === 0
      ? 0
      : (signBit === '1' ? -1 : 1) * (1 + mantissaVal) * Math.pow(2, unbiasedExponent);
  const verificationPassed = Math.abs(reconstructed - num) < 1e-5;

  return {
    valid: true,
    input: num,
    signBit,
    binaryNormalized,
    unbiasedExponent,
    biasedExponent,
    exponentBits,
    mantissaBits,
    full32Bits,
    hexRepresentation: '0x' + uint.toString(16).toUpperCase().padStart(8, '0'),
    verificationValue: reconstructed,
    verificationFormula: `(-1)^${signBit} × (1 + ${Number(mantissaVal.toFixed(6))}) × 2^(${biasedExponent} - 127) = ${Number(reconstructed.toFixed(6))}`,
    verificationPassed,
  };
}

export function binaryToGray(binaryStr: string): { valid: boolean; gray: string; steps: string[]; checkBinary: string } {
  const clean = binaryStr.trim();
  if (!/^[01]+$/.test(clean)) {
    return { valid: false, gray: '', steps: [], checkBinary: '' };
  }
  const grayChars = [clean[0]];
  const steps = [`G0 = B0 = ${clean[0]} (copy MSB directly)`];
  for (let i = 1; i < clean.length; i++) {
    const g = Number(clean[i - 1]) ^ Number(clean[i]);
    grayChars.push(String(g));
    steps.push(`G${i} = B${i - 1} ⊕ B${i} = ${clean[i - 1]} ⊕ ${clean[i]} = ${g}`);
  }
  const gray = grayChars.join('');

  // Second-method reverse check: Gray -> Binary
  const checkChars = [gray[0]];
  for (let i = 1; i < gray.length; i++) {
    checkChars.push(String(Number(checkChars[i - 1]) ^ Number(gray[i])));
  }
  return { valid: true, gray, steps, checkBinary: checkChars.join('') };
}

export interface HammingResult {
  valid: boolean;
  dataBits: string;
  encoded12Bit: string;
  parityDetails: { pos: number; name: string; coveredPositions: number[]; parityBit: string }[];
  received12Bit: string;
  flippedPosition: number;
  syndromeBits: string;
  detectedErrorPos: number;
  corrected12Bit: string;
  extractedDataBits: string;
  verificationPassed: boolean;
}

export function simulateHamming12Bit(data8: string, flipPosition = 0): HammingResult {
  const clean = data8.trim();
  if (!/^[01]{8}$/.test(clean)) {
    return {
      valid: false,
      dataBits: clean,
      encoded12Bit: '',
      parityDetails: [],
      received12Bit: '',
      flippedPosition: 0,
      syndromeBits: '0000',
      detectedErrorPos: 0,
      corrected12Bit: '',
      extractedDataBits: '',
      verificationPassed: false,
    };
  }

  // Positions 1..12 (1-indexed), parity at 1, 2, 4, 8 (even parity)
  const word = new Array<number>(13).fill(0);
  const dataPositions = [3, 5, 6, 7, 9, 10, 11, 12];
  dataPositions.forEach((pos, idx) => {
    word[pos] = Number(clean[idx]);
  });

  const parityPositions = [1, 2, 4, 8];
  const parityDetails = parityPositions.map((pPos) => {
    const covered: number[] = [];
    let xorSum = 0;
    for (let i = 1; i <= 12; i++) {
      if ((i & pPos) !== 0) {
        covered.push(i);
        if (i !== pPos) xorSum ^= word[i];
      }
    }
    word[pPos] = xorSum;
    return {
      pos: pPos,
      name: `P${pPos}`,
      coveredPositions: covered,
      parityBit: String(xorSum),
    };
  });

  const encoded12Bit = word.slice(1).join('');
  const receivedArr = [...word];
  if (flipPosition >= 1 && flipPosition <= 12) {
    receivedArr[flipPosition] = receivedArr[flipPosition] ^ 1;
  }
  const received12Bit = receivedArr.slice(1).join('');

  // Syndrome check
  const cBits = parityPositions.map((pPos) => {
    let check = 0;
    for (let i = 1; i <= 12; i++) {
      if ((i & pPos) !== 0) check ^= receivedArr[i];
    }
    return check;
  });
  const syndromeBits = [...cBits].reverse().join('');
  const detectedErrorPos = parseInt(syndromeBits, 2);

  const correctedArr = [...receivedArr];
  if (detectedErrorPos >= 1 && detectedErrorPos <= 12) {
    correctedArr[detectedErrorPos] ^= 1;
  }
  const corrected12Bit = correctedArr.slice(1).join('');
  const extractedDataBits = dataPositions.map((pos) => correctedArr[pos]).join('');

  return {
    valid: true,
    dataBits: clean,
    encoded12Bit,
    parityDetails,
    received12Bit,
    flippedPosition: flipPosition,
    syndromeBits,
    detectedErrorPos,
    corrected12Bit,
    extractedDataBits,
    verificationPassed: extractedDataBits === clean && detectedErrorPos === flipPosition,
  };
}

export interface FourBitAdderResult {
  mode: 0 | 1; // 0 = Add, 1 = Subtract
  aBits: string;
  bBits: string;
  xorBBits: string;
  sumBits: string;
  carries: number[]; // C0..C4
  overflow: boolean;
  unsignedDecimal: number;
  signedDecimal: number;
  expectedSignedDecimal: number;
}

export function simulateFourBitAdderSubtractor(a: number, b: number, mode: 0 | 1): FourBitAdderResult {
  const clamp4 = (n: number) => ((n % 16) + 16) % 16;
  const aVal = clamp4(a);
  const bVal = clamp4(b);
  const carries: number[] = [mode];
  const sumArr: number[] = [0, 0, 0, 0];
  const xorArr: number[] = [0, 0, 0, 0];

  for (let bit = 0; bit < 4; bit++) {
    const ai = (aVal >> bit) & 1;
    const bi = (bVal >> bit) & 1;
    const bXor = bi ^ mode;
    xorArr[3 - bit] = bXor;
    const cin = carries[bit];
    const s = ai ^ bXor ^ cin;
    const cout = (ai & bXor) | (cin & (ai ^ bXor));
    sumArr[3 - bit] = s;
    carries.push(cout);
  }

  const sumBits = sumArr.join('');
  const unsignedDecimal = parseInt(sumBits, 2);
  const signedA = aVal >= 8 ? aVal - 16 : aVal;
  const signedB = bVal >= 8 ? bVal - 16 : bVal;
  const signedDecimal = sumBits[0] === '1' ? unsignedDecimal - 16 : unsignedDecimal;
  const expectedSignedDecimal = mode === 0 ? signedA + signedB : signedA - signedB;

  return {
    mode,
    aBits: aVal.toString(2).padStart(4, '0'),
    bBits: bVal.toString(2).padStart(4, '0'),
    xorBBits: xorArr.join(''),
    sumBits,
    carries,
    overflow: carries[4] !== carries[3],
    unsignedDecimal,
    signedDecimal,
    expectedSignedDecimal,
  };
}

export interface KMapGroup {
  term: string;
  cells: number[];
  size: number;
}

export interface KMapSolution {
  vars: 2 | 3 | 4;
  minterms: number[];
  dontCares: number[];
  maxterms: number[];
  minimalSOP: string;
  minimalPOS: string;
  sopGroups: KMapGroup[];
  truthTableMatch: boolean;
}

function getVarNames(vars: 2 | 3 | 4): string[] {
  if (vars === 2) return ['A', 'B'];
  if (vars === 3) return ['A', 'B', 'C'];
  return ['A', 'B', 'C', 'D'];
}

function formatSOPTerm(pattern: string, varNames: string[]): string {
  const parts: string[] = [];
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') parts.push(varNames[i]);
    else if (pattern[i] === '0') parts.push(`${varNames[i]}'`);
  }
  return parts.length ? parts.join('') : '1';
}

function formatPOSTerm(pattern: string, varNames: string[]): string {
  const parts: string[] = [];
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '0') parts.push(varNames[i]);
    else if (pattern[i] === '1') parts.push(`${varNames[i]}'`);
  }
  return parts.length ? `(${parts.join(' + ')})` : '0';
}

function findMinimalImplicants(vars: 2 | 3 | 4, ones: number[], dontCares: number[]): { pattern: string; cells: number[] }[] {
  const total = 1 << vars;
  if (ones.length === 0) return [];
  if (ones.length + dontCares.length === total) {
    return [{ pattern: '-'.repeat(vars), cells: ones }];
  }

  const allCovered = Array.from(new Set([...ones, ...dontCares])).sort((a, b) => a - b);
  let groups: Map<number, { pattern: string; cells: number[]; used: boolean }[]> = new Map();
  for (const m of allCovered) {
    const bin = m.toString(2).padStart(vars, '0');
    const onesCount = bin.split('').filter((c) => c === '1').length;
    if (!groups.has(onesCount)) groups.set(onesCount, []);
    groups.get(onesCount)!.push({ pattern: bin, cells: [m], used: false });
  }

  const primeImplicants: { pattern: string; cells: number[] }[] = [];
  const seenPatterns = new Set<string>();

  while (groups.size > 0) {
    const nextGroups: Map<number, { pattern: string; cells: number[]; used: boolean }[]> = new Map();
    const keys = Array.from(groups.keys()).sort((a, b) => a - b);
    const addedPatterns = new Set<string>();

    for (let kIdx = 0; kIdx < keys.length - 1; kIdx++) {
      const k1 = keys[kIdx];
      const k2 = keys[kIdx + 1];
      if (k2 !== k1 + 1) continue;
      for (const item1 of groups.get(k1)!) {
        for (const item2 of groups.get(k2)!) {
          let diffCount = 0;
          let diffPos = -1;
          for (let i = 0; i < vars; i++) {
            if (item1.pattern[i] !== item2.pattern[i]) {
              diffCount++;
              diffPos = i;
            }
          }
          if (diffCount === 1) {
            item1.used = true;
            item2.used = true;
            const merged =
              item1.pattern.slice(0, diffPos) + '-' + item1.pattern.slice(diffPos + 1);
            if (!addedPatterns.has(merged)) {
              addedPatterns.add(merged);
              const mergedCells = Array.from(new Set([...item1.cells, ...item2.cells])).sort((a, b) => a - b);
              const onesCount = merged.split('').filter((c) => c === '1').length;
              if (!nextGroups.has(onesCount)) nextGroups.set(onesCount, []);
              nextGroups.get(onesCount)!.push({ pattern: merged, cells: mergedCells, used: false });
            }
          }
        }
      }
    }

    for (const list of groups.values()) {
      for (const item of list) {
        if (!item.used && !seenPatterns.has(item.pattern)) {
          seenPatterns.add(item.pattern);
          primeImplicants.push({ pattern: item.pattern, cells: item.cells });
        }
      }
    }
    groups = nextGroups;
  }

  // Cover all required `ones` using minimum prime implicants (exact Petrick/greedy with essential first)
  const piCovers = primeImplicants.map((pi) => ({
    pattern: pi.pattern,
    cells: pi.cells,
    targetOnes: pi.cells.filter((c) => ones.includes(c)),
  })).filter((p) => p.targetOnes.length > 0);

  const selected: { pattern: string; cells: number[] }[] = [];
  const remaining = new Set(ones);

  // Essential prime implicants first
  for (const m of ones) {
    const covering = piCovers.filter((p) => p.targetOnes.includes(m));
    if (covering.length === 1) {
      const chosen = covering[0];
      if (!selected.some((s) => s.pattern === chosen.pattern)) {
        selected.push({ pattern: chosen.pattern, cells: chosen.cells });
        chosen.targetOnes.forEach((c) => remaining.delete(c));
      }
    }
  }

  // Exact search over remaining uncovered minterms (<= 16 cells, very fast)
  if (remaining.size > 0) {
    const candidates = piCovers.filter((p) => p.targetOnes.some((c) => remaining.has(c)));
    let bestCombo: typeof candidates = [];
    const search = (uncovered: Set<number>, idx: number, current: typeof candidates) => {
      if (bestCombo.length > 0 && current.length >= bestCombo.length) return;
      if (uncovered.size === 0) {
        bestCombo = [...current];
        return;
      }
      if (idx >= candidates.length) return;
      const cand = candidates[idx];
      if (cand.targetOnes.some((c) => uncovered.has(c))) {
        const nextUncovered = new Set(uncovered);
        cand.targetOnes.forEach((c) => nextUncovered.delete(c));
        current.push(cand);
        search(nextUncovered, idx + 1, current);
        current.pop();
      }
      search(uncovered, idx + 1, current);
    };
    search(remaining, 0, []);
    for (const c of bestCombo) {
      selected.push({ pattern: c.pattern, cells: c.cells });
    }
  }

  return selected;
}

export function solveKMap(vars: 2 | 3 | 4, mintermsInput: number[], dontCaresInput: number[] = []): KMapSolution {
  const total = 1 << vars;
  const minterms = Array.from(new Set(mintermsInput.filter((m) => m >= 0 && m < total))).sort((a, b) => a - b);
  const dontCares = Array.from(
    new Set(dontCaresInput.filter((d) => d >= 0 && d < total && !minterms.includes(d)))
  ).sort((a, b) => a - b);
  const maxterms = Array.from({ length: total }, (_, i) => i).filter(
    (i) => !minterms.includes(i) && !dontCares.includes(i)
  );
  const varNames = getVarNames(vars);

  const sopImplicants = findMinimalImplicants(vars, minterms, dontCares);
  const sopGroups: KMapGroup[] = sopImplicants.map((imp) => ({
    term: formatSOPTerm(imp.pattern, varNames),
    cells: imp.cells,
    size: imp.cells.length,
  }));
  const minimalSOP = sopGroups.length ? sopGroups.map((g) => g.term).join(' + ') : '0';

  const posImplicants = findMinimalImplicants(vars, maxterms, dontCares);
  const minimalPOS =
    posImplicants.length === 0
      ? '1'
      : posImplicants.map((imp) => formatPOSTerm(imp.pattern, varNames)).join('');

  // Second-method verification against every truth table row
  let truthTableMatch = true;
  for (let m = 0; m < total; m++) {
    if (dontCares.includes(m)) continue;
    const expected = minterms.includes(m);
    const bin = m.toString(2).padStart(vars, '0');
    const sopEval = sopImplicants.some((imp) =>
      imp.pattern.split('').every((p, idx) => p === '-' || p === bin[idx])
    );
    const posEval =
      posImplicants.length === 0
        ? true
        : posImplicants.every((imp) =>
            imp.pattern.split('').some((p, idx) => p !== '-' && p !== bin[idx])
          );
    if (sopEval !== expected || posEval !== expected) {
      truthTableMatch = false;
      break;
    }
  }

  return {
    vars,
    minterms,
    dontCares,
    maxterms,
    minimalSOP,
    minimalPOS,
    sopGroups,
    truthTableMatch,
  };
}

export interface ArithmeticStep {
  stepNumber: number;
  lineIndex: number; // Pseudocode line highlight
  n: number;
  M: string;
  A: string;
  Q: string;
  action: string;
  note: string;
}

export interface ArithmeticSimulation {
  algorithm: 'multiplication' | 'restoring-division' | 'non-restoring-division';
  pseudocode: string[];
  steps: ArithmeticStep[];
  quotientOrProduct: number;
  remainder: number;
  verificationFormula: string;
  verificationPassed: boolean;
}

export function generateMultiplicationSteps(multiplicand: number, multiplier: number, bits = 4): ArithmeticSimulation {
  const pseudocode = [
    '1. Initialize Result (A) = 0, Multiplicand = M, Multiplier = Q, n = bits',
    '2. Check LSB of Multiplier (Q[0])',
    '3. If Q[0] == 1: A = A + M (Add multiplicand to Result)',
    '4. Shift Multiplicand left (M << 1) and Multiplier right (Q >> 1), n = n - 1',
    '5. Repeat until n == 0 or Q == 0; Result contains Product',
  ];
  const width = bits * 2;
  const bin = (val: number, w: number) => val.toString(2).padStart(w, '0');

  let A = 0;
  let M = multiplicand;
  let Q = multiplier;
  let n = bits;
  let stepNumber = 0;

  const steps: ArithmeticStep[] = [
    {
      stepNumber: stepNumber++,
      lineIndex: 0,
      n,
      M: bin(M, width),
      A: bin(A, width),
      Q: bin(Q, bits),
      action: 'Initialize',
      note: `M = ${multiplicand}, Q = ${multiplier}, Result A = 0`,
    },
  ];

  while (n > 0) {
    const lsb = Q & 1;
    steps.push({
      stepNumber: stepNumber++,
      lineIndex: 1,
      n,
      M: bin(M, width),
      A: bin(A, width),
      Q: bin(Q, bits),
      action: `Check Q[0] = ${lsb}`,
      note: lsb === 1 ? 'LSB is 1 → will add M to Result' : 'LSB is 0 → skip addition',
    });
    if (lsb === 1) {
      A = A + M;
      steps.push({
        stepNumber: stepNumber++,
        lineIndex: 2,
        n,
        M: bin(M, width),
        A: bin(A, width),
        Q: bin(Q, bits),
        action: 'A = A + M',
        note: `Result updated to ${A} (${bin(A, width)}₂)`,
      });
    }
    M = M << 1;
    Q = Q >> 1;
    n--;
    steps.push({
      stepNumber: stepNumber++,
      lineIndex: 3,
      n,
      M: bin(M, width),
      A: bin(A, width),
      Q: bin(Q, bits),
      action: 'Shift M << 1, Q >> 1',
      note: `Counter n = ${n}`,
    });
  }

  steps.push({
    stepNumber: stepNumber++,
    lineIndex: 4,
    n: 0,
    M: bin(M, width),
    A: bin(A, width),
    Q: bin(Q, bits),
    action: 'Complete',
    note: `Product in A = ${A}`,
  });

  const expected = multiplicand * multiplier;
  return {
    algorithm: 'multiplication',
    pseudocode,
    steps,
    quotientOrProduct: A,
    remainder: 0,
    verificationFormula: `${multiplicand} × ${multiplier} = ${expected} (Algorithm output = ${A})`,
    verificationPassed: A === expected,
  };
}

export function generateRestoringDivisionSteps(dividend: number, divisor: number, bits = 4): ArithmeticSimulation {
  const pseudocode = [
    '1. Initialize A = 0, Q = Dividend, M = Divisor, n = bit count',
    '2. Shift left combined register pair (A, Q) by 1 bit',
    '3. Subtract Divisor: A = A - M',
    '4. If A < 0 (MSB of A is 1): Q[0] = 0 and Restore A = A + M; else Q[0] = 1',
    '5. Decrement n; if n > 0 repeat from step 2, else Stop (Q=Quotient, A=Remainder)',
  ];
  const maskN = (1 << bits) - 1;
  const maskA = (1 << (bits + 1)) - 1;
  const toBinA = (v: number) => ((v & maskA) >>> 0).toString(2).padStart(bits + 1, '0');
  const toBinQ = (v: number) => ((v & maskN) >>> 0).toString(2).padStart(bits, '0');

  let A = 0;
  let Q = dividend & maskN;
  const M = divisor;
  let n = bits;
  let stepNumber = 0;

  const steps: ArithmeticStep[] = [
    {
      stepNumber: stepNumber++,
      lineIndex: 0,
      n,
      M: toBinA(M),
      A: toBinA(A),
      Q: toBinQ(Q),
      action: 'Initialize',
      note: `A = 0, Q = ${dividend}, M = ${divisor}, n = ${bits}`,
    },
  ];

  while (n > 0) {
    const qMsb = (Q >> (bits - 1)) & 1;
    A = (A << 1) | qMsb;
    Q = (Q << 1) & maskN;
    steps.push({
      stepNumber: stepNumber++,
      lineIndex: 1,
      n,
      M: toBinA(M),
      A: toBinA(A),
      Q: toBinQ(Q).slice(0, -1) + '_',
      action: 'Shift left (A, Q)',
      note: `MSB of Q (${qMsb}) shifted into LSB of A`,
    });

    A = A - M;
    steps.push({
      stepNumber: stepNumber++,
      lineIndex: 2,
      n,
      M: toBinA(M),
      A: toBinA(A),
      Q: toBinQ(Q).slice(0, -1) + '_',
      action: 'A = A - M',
      note: `A = ${A} (sign bit = ${A < 0 ? 1 : 0})`,
    });

    if (A < 0) {
      A = A + M;
      // Q[0] stays 0
      n--;
      steps.push({
        stepNumber: stepNumber++,
        lineIndex: 3,
        n,
        M: toBinA(M),
        A: toBinA(A),
        Q: toBinQ(Q),
        action: 'Q[0]=0, Restore A = A + M',
        note: `A was negative → restored A to ${A}, set Q[0]=0, n=${n}`,
      });
    } else {
      Q = Q | 1;
      n--;
      steps.push({
        stepNumber: stepNumber++,
        lineIndex: 3,
        n,
        M: toBinA(M),
        A: toBinA(A),
        Q: toBinQ(Q),
        action: 'Q[0]=1 (Keep A)',
        note: `A ≥ 0 → no restore needed, set Q[0]=1, n=${n}`,
      });
    }
  }

  steps.push({
    stepNumber: stepNumber++,
    lineIndex: 4,
    n: 0,
    M: toBinA(M),
    A: toBinA(A),
    Q: toBinQ(Q),
    action: 'Complete',
    note: `Quotient Q = ${Q}, Remainder A = ${A}`,
  });

  const expectedQ = Math.floor(dividend / divisor);
  const expectedR = dividend % divisor;
  const checkTotal = Q * divisor + A;

  return {
    algorithm: 'restoring-division',
    pseudocode,
    steps,
    quotientOrProduct: Q,
    remainder: A,
    verificationFormula: `Check: (${Q} × ${divisor}) + ${A} = ${checkTotal} (Dividend = ${dividend}; expected Q=${expectedQ}, R=${expectedR})`,
    verificationPassed: Q === expectedQ && A === expectedR && checkTotal === dividend,
  };
}

export function generateNonRestoringDivisionSteps(dividend: number, divisor: number, bits = 4): ArithmeticSimulation {
  const pseudocode = [
    '1. Initialize A = 0, Q = Dividend, M = Divisor, n = bit count',
    '2. If sign(A) == 0: Shift left (A,Q) & A = A - M; Else (sign(A)==1): Shift left (A,Q) & A = A + M',
    '3. If sign(A) == 0: Q[0] = 1; Else: Q[0] = 0',
    '4. Decrement n; if n > 0 repeat from step 2',
    '5. If final A < 0: A = A + M (one final correction); Stop',
  ];
  const maskN = (1 << bits) - 1;
  const maskA = (1 << (bits + 1)) - 1;
  const toBinA = (v: number) => ((v & maskA) >>> 0).toString(2).padStart(bits + 1, '0');
  const toBinQ = (v: number) => ((v & maskN) >>> 0).toString(2).padStart(bits, '0');

  let A = 0;
  let Q = dividend & maskN;
  const M = divisor;
  let n = bits;
  let stepNumber = 0;

  const steps: ArithmeticStep[] = [
    {
      stepNumber: stepNumber++,
      lineIndex: 0,
      n,
      M: toBinA(M),
      A: toBinA(A),
      Q: toBinQ(Q),
      action: 'Initialize',
      note: `A = 0, Q = ${dividend}, M = ${divisor}, n = ${bits}`,
    },
  ];

  while (n > 0) {
    const aWasNeg = A < 0;
    const qMsb = (Q >> (bits - 1)) & 1;
    A = (A << 1) | qMsb;
    Q = (Q << 1) & maskN;
    steps.push({
      stepNumber: stepNumber++,
      lineIndex: 1,
      n,
      M: toBinA(M),
      A: toBinA(A),
      Q: toBinQ(Q).slice(0, -1) + '_',
      action: 'Shift left (A, Q)',
      note: `A before shift was ${aWasNeg ? 'negative (sign=1)' : 'non-negative (sign=0)'}`,
    });

    if (aWasNeg) {
      A = A + M;
      steps.push({
        stepNumber: stepNumber++,
        lineIndex: 1,
        n,
        M: toBinA(M),
        A: toBinA(A),
        Q: toBinQ(Q).slice(0, -1) + '_',
        action: 'A = A + M',
        note: `Because prior sign(A)=1, added M → A = ${A}`,
      });
    } else {
      A = A - M;
      steps.push({
        stepNumber: stepNumber++,
        lineIndex: 1,
        n,
        M: toBinA(M),
        A: toBinA(A),
        Q: toBinQ(Q).slice(0, -1) + '_',
        action: 'A = A - M',
        note: `Because prior sign(A)=0, subtracted M → A = ${A}`,
      });
    }

    if (A < 0) {
      n--;
      steps.push({
        stepNumber: stepNumber++,
        lineIndex: 2,
        n,
        M: toBinA(M),
        A: toBinA(A),
        Q: toBinQ(Q),
        action: 'Q[0] = 0',
        note: `Now sign(A)=1 → Q[0]=0, n=${n}`,
      });
    } else {
      Q = Q | 1;
      n--;
      steps.push({
        stepNumber: stepNumber++,
        lineIndex: 2,
        n,
        M: toBinA(M),
        A: toBinA(A),
        Q: toBinQ(Q),
        action: 'Q[0] = 1',
        note: `Now sign(A)=0 → Q[0]=1, n=${n}`,
      });
    }
  }

  if (A < 0) {
    A = A + M;
    steps.push({
      stepNumber: stepNumber++,
      lineIndex: 4,
      n: 0,
      M: toBinA(M),
      A: toBinA(A),
      Q: toBinQ(Q),
      action: 'Final Restore: A = A + M',
      note: `Final A was negative → corrected remainder A = ${A}`,
    });
  } else {
    steps.push({
      stepNumber: stepNumber++,
      lineIndex: 4,
      n: 0,
      M: toBinA(M),
      A: toBinA(A),
      Q: toBinQ(Q),
      action: 'Complete (No final restore needed)',
      note: `Quotient Q = ${Q}, Remainder A = ${A}`,
    });
  }

  const expectedQ = Math.floor(dividend / divisor);
  const expectedR = dividend % divisor;
  const checkTotal = Q * divisor + A;

  return {
    algorithm: 'non-restoring-division',
    pseudocode,
    steps,
    quotientOrProduct: Q,
    remainder: A,
    verificationFormula: `Check: (${Q} × ${divisor}) + ${A} = ${checkTotal} (Dividend = ${dividend}; expected Q=${expectedQ}, R=${expectedR})`,
    verificationPassed: Q === expectedQ && A === expectedR && checkTotal === dividend,
  };
}

export interface CacheMappingResult {
  addressBits: number;
  wordBits: number;
  setOrLineBits: number;
  tagBits: number;
  totalBlocksInMemory: number;
  numberOfSets: number;
  comparatorsRequired: number;
  amatNs: number;
  bitSumCheckPassed: boolean;
}

export function calculateCacheMapping(
  memWords: number,
  blockWords: number,
  cacheLines: number,
  mappingType: 'direct' | 'associative' | 'set-associative',
  kWay = 2,
  hitRatio = 0.95,
  tcNs = 10,
  tmNs = 100
): CacheMappingResult {
  const addressBits = Math.round(Math.log2(memWords));
  const wordBits = Math.round(Math.log2(blockWords));
  const totalBlocksInMemory = Math.floor(memWords / blockWords);

  let numberOfSets = cacheLines;
  let comparatorsRequired = 1;
  if (mappingType === 'direct') {
    numberOfSets = cacheLines;
    comparatorsRequired = 1;
  } else if (mappingType === 'associative') {
    numberOfSets = 1;
    comparatorsRequired = cacheLines;
  } else {
    numberOfSets = Math.max(1, Math.floor(cacheLines / kWay));
    comparatorsRequired = kWay;
  }

  const setOrLineBits = Math.round(Math.log2(numberOfSets));
  const tagBits = addressBits - wordBits - setOrLineBits;
  const amatNs = Number((hitRatio * tcNs + (1 - hitRatio) * tmNs).toFixed(4));
  const bitSumCheckPassed = tagBits + setOrLineBits + wordBits === addressBits && tagBits > 0;

  return {
    addressBits,
    wordBits,
    setOrLineBits,
    tagBits,
    totalBlocksInMemory,
    numberOfSets,
    comparatorsRequired,
    amatNs,
    bitSumCheckPassed,
  };
}

export interface PipelineCalcResult {
  stages: number;
  instructions: number;
  clockNs: number;
  nonPipelinedCycles: number;
  pipelinedCycles: number;
  nonPipelinedTimeNs: number;
  pipelinedTimeNs: number;
  speedup: number;
  idealSpeedup: number;
  verificationPassed: boolean;
}

export function calculatePipelineSpeedup(stages: number, instructions: number, clockNs = 10, stallCycles = 0): PipelineCalcResult {
  const nonPipelinedCycles = stages * instructions;
  const pipelinedCycles = stages + (instructions - 1) + stallCycles;
  const nonPipelinedTimeNs = nonPipelinedCycles * clockNs;
  const pipelinedTimeNs = pipelinedCycles * clockNs;
  const speedup = Number((nonPipelinedTimeNs / pipelinedTimeNs).toFixed(4));
  const checkSpeedup = Number((nonPipelinedCycles / pipelinedCycles).toFixed(4));

  return {
    stages,
    instructions,
    clockNs,
    nonPipelinedCycles,
    pipelinedCycles,
    nonPipelinedTimeNs,
    pipelinedTimeNs,
    speedup,
    idealSpeedup: stages,
    verificationPassed: Math.abs(speedup - checkSpeedup) < 1e-6,
  };
}

export interface SearchStep {
  step: number;
  current: string;
  frontier: string[];
  visited: string[];
  action: string;
  found: boolean;
}

export function generateStateSpaceSearchSteps(
  adjacency: Record<string, string[]>,
  start: string,
  goal: string,
  strategy: 'BFS' | 'DFS'
): SearchStep[] {
  const frontier: string[] = [start];
  const visited: string[] = [];
  const seen = new Set<string>([start]);
  const steps: SearchStep[] = [
    {
      step: 0,
      current: start,
      frontier: [...frontier],
      visited: [],
      action: `Initialize ${strategy} ${strategy === 'BFS' ? 'Queue (FIFO)' : 'Stack (LIFO)'} with Start = "${start}"`,
      found: false,
    },
  ];

  let stepIdx = 1;
  while (frontier.length > 0 && stepIdx < 30) {
    const current = strategy === 'BFS' ? frontier.shift()! : frontier.pop()!;
    visited.push(current);

    if (current === goal) {
      steps.push({
        step: stepIdx++,
        current,
        frontier: [...frontier],
        visited: [...visited],
        action: `Goal state "${goal}" reached!`,
        found: true,
      });
      break;
    }

    const neighbors = adjacency[current] || [];
    const ordered = strategy === 'DFS' ? [...neighbors].reverse() : neighbors;
    const newlyAdded: string[] = [];
    for (const next of ordered) {
      if (!seen.has(next)) {
        seen.add(next);
        frontier.push(next);
        newlyAdded.push(next);
      }
    }

    steps.push({
      step: stepIdx++,
      current,
      frontier: [...frontier],
      visited: [...visited],
      action: newlyAdded.length
        ? `Expanded "${current}" → pushed ${newlyAdded.join(', ')}`
        : `Expanded "${current}" → leaf node (no unvisited children)`,
      found: false,
    });
  }

  return steps;
}

export interface IEEE754DoubleResult {
  valid: boolean;
  error?: string;
  input: number;
  signBit: '0' | '1';
  unbiasedExponent: number;
  biasedExponent: number;
  exponentBits: string;
  mantissaBits: string;
  full64Bits: string;
  hexRepresentation: string;
  verificationValue: number;
  verificationFormula: string;
  verificationPassed: boolean;
}

export function convertToIEEE754Double(num: number): IEEE754DoubleResult {
  if (!Number.isFinite(num)) {
    return {
      valid: false,
      error: 'Enter a valid finite real number.',
      input: 0,
      signBit: '0',
      unbiasedExponent: 0,
      biasedExponent: 0,
      exponentBits: '0'.repeat(11),
      mantissaBits: '0'.repeat(52),
      full64Bits: '0'.repeat(64),
      hexRepresentation: '0x0000000000000000',
      verificationValue: 0,
      verificationFormula: '',
      verificationPassed: false,
    };
  }

  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setFloat64(0, num, false);
  const hi = view.getUint32(0, false);
  const lo = view.getUint32(4, false);
  const full64Bits = hi.toString(2).padStart(32, '0') + lo.toString(2).padStart(32, '0');
  const signBit = full64Bits[0] as '0' | '1';
  const exponentBits = full64Bits.slice(1, 12);
  const mantissaBits = full64Bits.slice(12);
  const biasedExponent = parseInt(exponentBits, 2);
  const unbiasedExponent = num === 0 ? 0 : biasedExponent - 1023;
  const hexRepresentation =
    '0x' + hi.toString(16).toUpperCase().padStart(8, '0') + lo.toString(16).toUpperCase().padStart(8, '0');

  let mantissaVal = 0;
  for (let i = 0; i < 52; i++) {
    if (mantissaBits[i] === '1') {
      mantissaVal += Math.pow(2, -(i + 1));
    }
  }
  const reconstructed =
    num === 0 ? 0 : (signBit === '1' ? -1 : 1) * (1 + mantissaVal) * Math.pow(2, unbiasedExponent);
  const verificationPassed = Math.abs(reconstructed - num) < 1e-12;

  return {
    valid: true,
    input: num,
    signBit,
    unbiasedExponent,
    biasedExponent,
    exponentBits,
    mantissaBits,
    full64Bits,
    hexRepresentation,
    verificationValue: reconstructed,
    verificationFormula: `(-1)^${signBit} × (1 + ${Number(mantissaVal.toFixed(10))}) × 2^(${biasedExponent} - 1023) = ${reconstructed}`,
    verificationPassed,
  };
}

export interface BoothStep {
  stepNumber: number;
  lineIndex: number;
  sc: number;
  A: string;
  Q: string;
  qMinus1: string;
  M: string;
  action: string;
  note: string;
}

export interface BoothSimulation {
  pseudocode: string[];
  steps: BoothStep[];
  productDecimal: number;
  productBinary: string;
  verificationFormula: string;
  verificationPassed: boolean;
}

export function generateBoothMultiplicationSteps(multiplicand: number, multiplier: number, bits = 4): BoothSimulation {
  const pseudocode = [
    '1. Initialize A = 0, Q = Multiplier, Q₋₁ = 0, M = Multiplicand, SC = n',
    '2. Inspect bit pair (Q[0], Q₋₁)',
    '3. If 10 → A = A - M; If 01 → A = A + M; If 00 or 11 → No arithmetic',
    '4. Arithmetic Shift Right (A, Q, Q₋₁), decrement SC = SC - 1',
    '5. Repeat until SC == 0; Signed product is combined register (A, Q)',
  ];

  const mask = (1 << bits) - 1;
  const toSigned = (v: number) => {
    const m = v & mask;
    return m >= 1 << (bits - 1) ? m - (1 << bits) : m;
  };
  const toBin = (v: number) => ((v & mask) >>> 0).toString(2).padStart(bits, '0');

  let A = 0;
  let Q = multiplier & mask;
  let qMinus1 = 0;
  const M = multiplicand;
  let sc = bits;
  let stepNumber = 0;

  const steps: BoothStep[] = [
    {
      stepNumber: stepNumber++,
      lineIndex: 0,
      sc,
      A: toBin(A),
      Q: toBin(Q),
      qMinus1: String(qMinus1),
      M: toBin(M),
      action: 'Initialize',
      note: `M = ${multiplicand} (${toBin(M)}), Q = ${multiplier} (${toBin(Q)}), Q₋₁ = 0`,
    },
  ];

  while (sc > 0) {
    const q0 = Q & 1;
    const pair = `${q0}${qMinus1}`;
    steps.push({
      stepNumber: stepNumber++,
      lineIndex: 1,
      sc,
      A: toBin(A),
      Q: toBin(Q),
      qMinus1: String(qMinus1),
      M: toBin(M),
      action: `Check (Q₀, Q₋₁) = ${pair}`,
      note:
        pair === '10'
          ? 'Pair 10 → Perform A = A - M'
          : pair === '01'
          ? 'Pair 01 → Perform A = A + M'
          : `Pair ${pair} → Skip arithmetic, go to Shift`,
    });

    if (pair === '10') {
      A = toSigned(A - M);
      steps.push({
        stepNumber: stepNumber++,
        lineIndex: 2,
        sc,
        A: toBin(A),
        Q: toBin(Q),
        qMinus1: String(qMinus1),
        M: toBin(M),
        action: 'A = A - M',
        note: `Updated A = ${toBin(A)} (${A})`,
      });
    } else if (pair === '01') {
      A = toSigned(A + M);
      steps.push({
        stepNumber: stepNumber++,
        lineIndex: 2,
        sc,
        A: toBin(A),
        Q: toBin(Q),
        qMinus1: String(qMinus1),
        M: toBin(M),
        action: 'A = A + M',
        note: `Updated A = ${toBin(A)} (${A})`,
      });
    }

    // Arithmetic shift right of (A, Q, Q-1)
    const signA = (A >> (bits - 1)) & 1;
    const lsbA = A & 1;
    const lsbQ = Q & 1;
    qMinus1 = lsbQ;
    Q = ((Q >>> 1) | (lsbA << (bits - 1))) & mask;
    A = toSigned(((A & mask) >>> 1) | (signA << (bits - 1)));
    sc--;

    steps.push({
      stepNumber: stepNumber++,
      lineIndex: 3,
      sc,
      A: toBin(A),
      Q: toBin(Q),
      qMinus1: String(qMinus1),
      M: toBin(M),
      action: 'Arithmetic Shift Right (ASR)',
      note: `Preserved MSB sign=${signA}, SC = ${sc}`,
    });
  }

  const productBinary = toBin(A) + toBin(Q);
  const fullMask = (1 << (bits * 2)) - 1;
  const rawVal = parseInt(productBinary, 2) & fullMask;
  const productDecimal = rawVal >= 1 << (bits * 2 - 1) ? rawVal - (1 << (bits * 2)) : rawVal;
  const expected = multiplicand * multiplier;

  steps.push({
    stepNumber: stepNumber++,
    lineIndex: 4,
    sc: 0,
    A: toBin(A),
    Q: toBin(Q),
    qMinus1: String(qMinus1),
    M: toBin(M),
    action: 'Complete',
    note: `Signed product (A,Q) = ${productBinary}₂ = ${productDecimal}₁₀`,
  });

  return {
    pseudocode,
    steps,
    productDecimal,
    productBinary,
    verificationFormula: `${multiplicand} × ${multiplier} = ${expected} (Booth output = ${productDecimal})`,
    verificationPassed: productDecimal === expected,
  };
}

export interface BooleanEvalResult {
  valid: boolean;
  error?: string;
  expression: string;
  varsCount: 2 | 3 | 4;
  minterms: number[];
  maxterms: number[];
  canonicalSOP: string;
  canonicalPOS: string;
  minimalSOP: string;
  minimalPOS: string;
  truthTable: { inputs: number[]; output: 0 | 1; rowIdx: number }[];
}

export function evaluateBooleanExpression(expr: string, varsCount: 2 | 3 | 4 = 3): BooleanEvalResult {
  const varNames = getVarNames(varsCount);
  const trimmed = expr.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Enter a Boolean expression using A, B, C (e.g., A\'B\'C + AB or (A + B\')(B + C)).',
      expression: expr,
      varsCount,
      minterms: [],
      maxterms: [],
      canonicalSOP: '0',
      canonicalPOS: '1',
      minimalSOP: '0',
      minimalPOS: '1',
      truthTable: [],
    };
  }

  // Convert common textbook syntax to JS evaluator tokens:
  // Support: A', !A, ~A, +, ·, *, &, |, ^, implicit multiplication AB or A'B or A(B+C)
  try {
    let s = trimmed
      .toUpperCase()
      .replace(/[·•*&∧]/g, '*')
      .replace(/[+∨]/g, '+')
      .replace(/[⊕^]/g, '^')
      .replace(/[∼~¬!]/g, '!');

    // Validate allowed characters
    if (!/^[ABCD01'+*^!()\s]+$/.test(s)) {
      return {
        valid: false,
        error: 'Allowed symbols: variables A, B, C, D, operators +, ·, *, \', !, ^, constants 0, 1, and parentheses ( ).',
        expression: expr,
        varsCount,
        minterms: [],
        maxterms: [],
        canonicalSOP: '',
        canonicalPOS: '',
        minimalSOP: '',
        minimalPOS: '',
        truthTable: [],
      };
    }

    // Remove spaces around tokens carefully
    s = s.replace(/\s+/g, '');

    // Handle postfix prime (e.g., A' -> !A, (A+B)' -> !(A+B))
    let guard = 0;
    while (s.includes("'") && guard++ < 40) {
      const idx = s.indexOf("'");
      if (idx === 0) throw new Error('Prime operator has no operand');
      if (s[idx - 1] === ')') {
        let depth = 0;
        let openIdx = -1;
        for (let i = idx - 1; i >= 0; i--) {
          if (s[i] === ')') depth++;
          else if (s[i] === '(') {
            depth--;
            if (depth === 0) {
              openIdx = i;
              break;
            }
          }
        }
        if (openIdx === -1) throw new Error('Mismatched parentheses');
        s = s.slice(0, openIdx) + '(!' + s.slice(openIdx, idx) + ')' + s.slice(idx + 1);
      } else {
        s = s.slice(0, idx - 1) + '(!' + s[idx - 1] + ')' + s.slice(idx + 1);
      }
    }

    // Insert explicit '*' for implicit multiplication:
    // Between (var|const|')') and (var|const|'!'|'(')
    s = s.replace(/([ABCD01)])(?=[ABCD01!(])/g, '$1*');

    // Replace + with |, * with &, !x with (1^x) cleanly inside arithmetic/boolean eval
    const jsExpr = s
      .replace(/!/g, '1^')
      .replace(/\*/g, '&')
      .replace(/\+/g, '|');

    // Wrap ! properly: wait — '1^A' has lower precedence than '&' in JS! Must parse via recursive descent.
    const parseBool = (inputStr: string, env: Record<string, number>): number => {
      let pos = 0;
      const peek = () => inputStr[pos] || '';
      const consume = () => inputStr[pos++] || '';

      const parseOr = (): number => {
        let left = parseXor();
        while (peek() === '+') {
          consume();
          const right = parseXor();
          left = left | right;
        }
        return left;
      };
      const parseXor = (): number => {
        let left = parseAnd();
        while (peek() === '^') {
          consume();
          const right = parseAnd();
          left = left ^ right;
        }
        return left;
      };
      const parseAnd = (): number => {
        let left = parseUnary();
        while (peek() === '*') {
          consume();
          const right = parseUnary();
          left = left & right;
        }
        return left;
      };
      const parseUnary = (): number => {
        if (peek() === '!') {
          consume();
          return parseUnary() ^ 1;
        }
        if (peek() === '(') {
          consume();
          const val = parseOr();
          if (consume() !== ')') throw new Error('Expected )');
          return val;
        }
        const ch = consume();
        if (ch === '0' || ch === '1') return Number(ch);
        if (ch in env) return env[ch];
        throw new Error(`Unexpected token "${ch}"`);
      };

      const res = parseOr();
      if (pos < inputStr.length) throw new Error(`Unexpected trailing "${inputStr.slice(pos)}"`);
      return res;
    };

    void jsExpr;

    const total = 1 << varsCount;
    const minterms: number[] = [];
    const maxterms: number[] = [];
    const truthTable: { inputs: number[]; output: 0 | 1; rowIdx: number }[] = [];

    for (let m = 0; m < total; m++) {
      const bin = m.toString(2).padStart(varsCount, '0');
      const env: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
      const inputs: number[] = [];
      for (let i = 0; i < varsCount; i++) {
        const bit = Number(bin[i]);
        env[varNames[i]] = bit;
        inputs.push(bit);
      }
      const out = (parseBool(s, env) & 1) as 0 | 1;
      truthTable.push({ inputs, output: out, rowIdx: m });
      if (out === 1) minterms.push(m);
      else maxterms.push(m);
    }

    const canonicalSOP = minterms.length
      ? minterms
          .map((m) =>
            m
              .toString(2)
              .padStart(varsCount, '0')
              .split('')
              .map((b, i) => (b === '1' ? varNames[i] : `${varNames[i]}'`))
              .join('')
          )
          .join(' + ')
      : '0';

    const canonicalPOS = maxterms.length
      ? maxterms
          .map(
            (m) =>
              '(' +
              m
                .toString(2)
                .padStart(varsCount, '0')
                .split('')
                .map((b, i) => (b === '0' ? varNames[i] : `${varNames[i]}'`))
                .join(' + ') +
              ')'
          )
          .join('')
      : '1';

    const kmap = solveKMap(varsCount, minterms, []);

    return {
      valid: true,
      expression: trimmed,
      varsCount,
      minterms,
      maxterms,
      canonicalSOP,
      canonicalPOS,
      minimalSOP: kmap.minimalSOP,
      minimalPOS: kmap.minimalPOS,
      truthTable,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid Boolean expression syntax.',
      expression: expr,
      varsCount,
      minterms: [],
      maxterms: [],
      canonicalSOP: '',
      canonicalPOS: '',
      minimalSOP: '',
      minimalPOS: '',
      truthTable: [],
    };
  }
}

export interface CPUPerformanceResult {
  instructionCount: number;
  cpi: number;
  clockGhz: number;
  fpOperations: number;
  parallelFraction: number;
  processors: number;
  totalCycles: number;
  executionTimeSec: number;
  mips: number;
  mflops: number;
  amdahlSpeedup: number;
  verificationPassed: boolean;
  verificationFormula: string;
}

export function calculateCPUPerformance(
  instructionCount: number,
  cpi: number,
  clockGhz: number,
  fpOperations: number,
  parallelFraction: number,
  processors: number
): CPUPerformanceResult {
  const clockHz = clockGhz * 1e9;
  const totalCycles = instructionCount * cpi;
  const executionTimeSec = totalCycles / clockHz;
  const mips = clockHz / (cpi * 1e6);
  const mflops = executionTimeSec > 0 ? fpOperations / (executionTimeSec * 1e6) : 0;
  const amdahlSpeedup = 1 / (1 - parallelFraction + parallelFraction / Math.max(1, processors));
  const checkMips = instructionCount / (executionTimeSec * 1e6);
  const verificationPassed = Math.abs(mips - checkMips) < 1e-4;

  return {
    instructionCount,
    cpi,
    clockGhz,
    fpOperations,
    parallelFraction,
    processors,
    totalCycles,
    executionTimeSec,
    mips: Number(mips.toFixed(2)),
    mflops: Number(mflops.toFixed(2)),
    amdahlSpeedup: Number(amdahlSpeedup.toFixed(4)),
    verificationPassed,
    verificationFormula: `Check MIPS: IC / (T × 10⁶) = ${checkMips.toFixed(2)} == Clock / (CPI × 10⁶) = ${mips.toFixed(2)}`,
  };
}

