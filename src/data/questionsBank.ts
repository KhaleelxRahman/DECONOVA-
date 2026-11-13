import { QUESTIONS_UNIT_1 } from './questionsUnit1';
import { QUESTIONS_UNIT_2 } from './questionsUnit2';
import { QUESTIONS_UNIT_3 } from './questionsUnit3';
import { QUESTIONS_UNIT_4 } from './questionsUnit4';
import { QUESTIONS_UNIT_5 } from './questionsUnit5';
import { QuestionRecord } from '../types/academic';

export const QUESTIONS_BANK: QuestionRecord[] = [
  ...QUESTIONS_UNIT_1,
  ...QUESTIONS_UNIT_2,
  ...QUESTIONS_UNIT_3,
  ...QUESTIONS_UNIT_4,
  ...QUESTIONS_UNIT_5,
];
