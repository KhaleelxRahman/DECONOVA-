import test from 'node:test';
import assert from 'node:assert/strict';
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
  generateStateSpaceSearchSteps,
  performTwosComplementArithmetic,
  simulateFourBitAdderSubtractor,
  simulateHamming12Bit,
  solveKMap,
} from './calculators';

test('Assignment 1 & Quiz 1 base conversions match verified answers', () => {
  const hex520 = convertNumberBase('520', 10, 16);
  assert.equal(hex520.valid, true);
  assert.equal(hex520.convertedValue, '208');
  assert.equal(hex520.verificationPassed, true);

  const oct480 = convertNumberBase('480', 10, 8);
  assert.equal(oct480.convertedValue, '740');
  assert.equal(oct480.verificationPassed, true);

  const binFrac = convertNumberBase('163.875', 10, 2);
  assert.equal(binFrac.convertedValue, '10100011.111');
  assert.equal(binFrac.verificationPassed, true);

  const decBin = convertNumberBase('11010111', 2, 10);
  assert.equal(decBin.convertedValue, '215');
  assert.equal(decBin.verificationPassed, true);
});

test('Signed binary representations and 2s complement arithmetic', () => {
  const neg18 = computeSignedRepresentations(-18, 8);
  assert.equal(neg18.valid, true);
  assert.equal(neg18.signedMagnitude, '10010010');
  assert.equal(neg18.onesComplement, '11101101');
  assert.equal(neg18.twosComplement, '11101110');
  assert.equal(neg18.verificationTwosDecimal, -18);

  const sub7minus5 = performTwosComplementArithmetic(7, 5, '-', 8);
  assert.equal(sub7minus5.resultSignedDecimal, 2);
  assert.equal(sub7minus5.overflow, false);
  assert.equal(sub7minus5.verificationPassed, true);
});

test('IEEE 754 single precision matches syllabus examples 13.625 and -3.75', () => {
  const fp1 = convertToIEEE754(13.625);
  assert.equal(fp1.valid, true);
  assert.equal(fp1.signBit, '0');
  assert.equal(fp1.biasedExponent, 130);
  assert.equal(fp1.hexRepresentation, '0x415A0000');
  assert.equal(fp1.verificationPassed, true);

  const fp2 = convertToIEEE754(-3.75);
  assert.equal(fp2.valid, true);
  assert.equal(fp2.signBit, '1');
  assert.equal(fp2.biasedExponent, 128);
  assert.equal(fp2.hexRepresentation, '0xC0700000');
  assert.equal(fp2.verificationPassed, true);
});

test('Gray code and 12-bit Hamming error correction', () => {
  const g1 = binaryToGray('110101');
  assert.equal(g1.gray, '101111');
  assert.equal(g1.checkBinary, '110101');

  const h = simulateHamming12Bit('10110011', 7);
  assert.equal(h.valid, true);
  assert.equal(h.detectedErrorPos, 7);
  assert.equal(h.extractedDataBits, '10110011');
  assert.equal(h.verificationPassed, true);
});

test('4-bit adder/subtractor matches CIE-2 LAQ 3 examples', () => {
  const add = simulateFourBitAdderSubtractor(5, 3, 0);
  assert.equal(add.sumBits, '1000');
  assert.equal(add.overflow, true);

  const sub = simulateFourBitAdderSubtractor(5, 3, 1);
  assert.equal(sub.sumBits, '0010');
  assert.equal(sub.overflow, false);
  assert.equal(sub.signedDecimal, 2);
});

test('K-map solver detects DECO_U2 slide 33 error and produces exact minimal SOP', () => {
  const k = solveKMap(3, [1, 2, 5, 7]);
  assert.equal(k.truthTableMatch, true);
  // Minimal SOP for m(1,2,5,7) has 3 terms, NOT B'C + BC' (which would cover m6 instead of m7)
  assert.equal(k.sopGroups.length, 3);

  const k4 = solveKMap(4, [0, 1, 2, 5, 8, 9, 10, 13]);
  assert.equal(k4.truthTableMatch, true);
});

test('Multiplication, Restoring Division, Non-Restoring Division match traces', () => {
  const mul = generateMultiplicationSteps(5, 3, 4);
  assert.equal(mul.quotientOrProduct, 15);
  assert.equal(mul.verificationPassed, true);

  const div1 = generateRestoringDivisionSteps(11, 3, 4);
  assert.equal(div1.quotientOrProduct, 3);
  assert.equal(div1.remainder, 2);
  assert.equal(div1.verificationPassed, true);

  const div2 = generateNonRestoringDivisionSteps(11, 3, 4);
  assert.equal(div2.quotientOrProduct, 3);
  assert.equal(div2.remainder, 2);
  assert.equal(div2.verificationPassed, true);

  const div7 = generateRestoringDivisionSteps(7, 3, 4);
  assert.equal(div7.quotientOrProduct, 2);
  assert.equal(div7.remainder, 1);
  assert.equal(div7.verificationPassed, true);
});

test('Cache mapping and Pipeline speedup match CIE-2 LAQ 6 and LAQ 7', () => {
  const cache = calculateCacheMapping(65536, 16, 128, 'set-associative', 2, 0.95, 10, 100);
  assert.equal(cache.addressBits, 16);
  assert.equal(cache.tagBits, 6);
  assert.equal(cache.setOrLineBits, 6);
  assert.equal(cache.wordBits, 4);
  assert.equal(cache.amatNs, 14.5);
  assert.equal(cache.bitSumCheckPassed, true);

  const pipe = calculatePipelineSpeedup(4, 100, 10);
  assert.equal(pipe.nonPipelinedCycles, 400);
  assert.equal(pipe.pipelinedCycles, 103);
  assert.equal(Number(pipe.speedup.toFixed(2)), 3.88);
  assert.equal(pipe.verificationPassed, true);
});

test('AI BFS and DFS state-space search reach goal state', () => {
  const graph = {
    Start: ['Engine Trouble', 'Transmission', 'Brakes'],
    'Engine Trouble': ['Engine Starts', 'Wont Start'],
    'Wont Start': ['Turns Over', 'Wont Turn Over'],
    'Wont Turn Over': ['Battery Dead', 'Battery OK'],
  };
  const bfs = generateStateSpaceSearchSteps(graph, 'Start', 'Battery Dead', 'BFS');
  assert.equal(bfs[bfs.length - 1].found, true);
  assert.equal(bfs[bfs.length - 1].current, 'Battery Dead');

  const dfs = generateStateSpaceSearchSteps(graph, 'Start', 'Battery Dead', 'DFS');
  assert.equal(dfs[dfs.length - 1].found, true);
  assert.equal(dfs[dfs.length - 1].current, 'Battery Dead');
});

test('IEEE 754 binary64, Booth multiplication, Boolean parser, and CPU/FLOPS match checks', () => {
  const fp64 = convertToIEEE754Double(-3.75);
  assert.equal(fp64.valid, true);
  assert.equal(fp64.signBit, '1');
  assert.equal(fp64.biasedExponent, 1024);
  assert.equal(fp64.verificationPassed, true);

  const boothNeg = generateBoothMultiplicationSteps(-5, 3, 4);
  assert.equal(boothNeg.productDecimal, -15);
  assert.equal(boothNeg.verificationPassed, true);

  const boolRes = evaluateBooleanExpression("A'B'C + AB", 3);
  assert.equal(boolRes.valid, true);
  assert.deepEqual(boolRes.minterms, [1, 6, 7]); // Confirms DECO_U2 slide 34 erratum!

  const perf = calculateCPUPerformance(2e9, 1.5, 3.0, 5e8, 0.8, 4);
  assert.equal(perf.executionTimeSec, 1);
  assert.equal(perf.mips, 2000);
  assert.equal(perf.mflops, 500);
  assert.equal(perf.amdahlSpeedup, 2.5);
  assert.equal(perf.verificationPassed, true);
});

import { ORIGINAL_FILES_INVENTORY } from '../data/filesInventory';
import { ALL_DECO_TOPICS, DECO_UNITS, SYLLABUS_COVERAGE_MATRIX } from '../data/knowledgeBase';
import { QUESTIONS_BANK } from '../data/questionsBank';

test('Unified DECO knowledge base preserves all 34 files and 100% 5-unit syllabus coverage', () => {
  assert.equal(ORIGINAL_FILES_INVENTORY.length, 34);
  const uniqueNames = new Set(ORIGINAL_FILES_INVENTORY.map((f) => f.storedFilename));
  assert.equal(uniqueNames.size, 34);

  assert.equal(DECO_UNITS.length, 5);
  assert.deepEqual(
    DECO_UNITS.map((u) => u.unitNumber),
    [1, 2, 3, 4, 5]
  );

  const fileIds = new Set(ORIGINAL_FILES_INVENTORY.map((f) => f.id));
  for (const topic of ALL_DECO_TOPICS) {
    assert.ok(topic.sourceFiles.length > 0, `Topic ${topic.code} missing sourceFiles`);
    for (const ref of topic.sourceFiles) {
      assert.ok(fileIds.has(ref.fileId), `Topic ${topic.code} references unknown fileId ${ref.fileId}`);
    }
  }

  for (const q of QUESTIONS_BANK) {
    assert.ok(fileIds.has(q.sourceFileId), `Question ${q.code} references unknown fileId ${q.sourceFileId}`);
    assert.ok(q.answer4Mark.available, `Question ${q.code} must provide a 4-Mark answer`);
    assert.ok(q.answer4Mark.definition.trim().length > 10, `Question ${q.code} 4M definition too short`);
    assert.ok(q.answer4Mark.keyPoints.length >= 2, `Question ${q.code} 4M needs >= 2 key points`);
    if (q.unitNumber > 0) {
      assert.ok(q.answer10Mark.available, `In-syllabus Question ${q.code} must provide a 10-Mark answer`);
      assert.ok(q.answer10Mark.introduction.trim().length > 10, `Question ${q.code} 10M introduction missing`);
      assert.ok(q.answer10Mark.sections.length >= 2, `Question ${q.code} 10M needs >= 2 structured sections`);
      assert.ok(q.answer10Mark.conclusion.trim().length > 10, `Question ${q.code} 10M conclusion missing`);
    }
  }

  // Unique question IDs and codes
  const qIds = new Set(QUESTIONS_BANK.map((q) => q.id));
  const qCodes = new Set(QUESTIONS_BANK.map((q) => q.code));
  assert.equal(qIds.size, QUESTIONS_BANK.length, 'Duplicate question id found');
  assert.equal(qCodes.size, QUESTIONS_BANK.length, 'Duplicate question code found');

  // Every official topic (26/26) must have >= 1 question in QUESTIONS_BANK
  for (const topic of ALL_DECO_TOPICS) {
    const count = QUESTIONS_BANK.filter((q) => q.topicId === topic.id).length;
    assert.ok(count >= 1, `Topic ${topic.code} has 0 questions in QUESTIONS_BANK`);
  }

  // Verify AUG18-U2-Q5 4-variable Boolean expression minterms & maxterms
  const aug18q5 = evaluateBooleanExpression("A + B*C' + A*B*D' + A*B*C*D", 4);
  assert.equal(aug18q5.valid, true);
  assert.deepEqual(aug18q5.minterms, [4, 5, 8, 9, 10, 11, 12, 13, 14, 15]);
  assert.deepEqual(aug18q5.maxterms, [0, 1, 2, 3, 6, 7]);

  // Verify exact Unit I-V & Outside-Syllabus counts and 4M/10M availability
  const unitExpectations: Record<number, { total: number; m4: number; m10: number }> = {
    1: { total: 10, m4: 10, m10: 10 },
    2: { total: 10, m4: 10, m10: 10 },
    3: { total: 9, m4: 9, m10: 9 },
    4: { total: 8, m4: 8, m10: 8 },
    5: { total: 6, m4: 6, m10: 6 },
    0: { total: 2, m4: 2, m10: 0 },
  };
  for (const [unitStr, exp] of Object.entries(unitExpectations)) {
    const unitNum = Number(unitStr);
    const qs = QUESTIONS_BANK.filter((q) => q.unitNumber === unitNum);
    assert.equal(qs.length, exp.total, `Unit ${unitNum} count mismatch`);
    assert.equal(qs.filter((q) => q.answer4Mark.available).length, exp.m4);
    assert.equal(qs.filter((q) => q.answer10Mark.available).length, exp.m10);
  }

  assert.equal(SYLLABUS_COVERAGE_MATRIX.length, ALL_DECO_TOPICS.length);
});



