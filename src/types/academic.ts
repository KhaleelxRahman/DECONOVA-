export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'PARTIAL_OVERLAP' | 'OUTSIDE_DECO_SYLLABUS';

export type DecorelevanceClass =
  | 'CORE_DECO_U24EC304'
  | 'PARTIAL_DECO_OVERLAP'
  | 'OUTSIDE_DECO_PRESERVED';

export type VisualLabId =
  | 'number-converter'
  | 'signed-complements'
  | 'ieee754'
  | 'codes-hamming'
  | 'boolean-algebra'
  | 'logic-gates-adder'
  | 'kmap-simplifier'
  | 'sequential-circuits'
  | 'multiplication-division'
  | 'cache-mapping'
  | 'pipeline-simulator'
  | 'performance-flops'
  | 'architecture-io';

export interface OriginalFileRecord {
  id: string;
  originalName: string;
  storedFilename: string;
  publicUrl: string;
  fileType: 'PDF' | 'CSV' | 'JPG' | 'PPT' | 'DOCX';
  pagesOrSize: string;
  decoRelevance: DecorelevanceClass;
  relevanceSummary: string;
  verificationStatus: VerificationStatus;
  unitsCovered: string;
  topicsCovered: string[];
  hasQA: boolean;
  hasExplanationSlides: boolean;
  problemsFound: string;
  duplicateGroup?: string;
  supersededBy?: string;
  attachedTwiceInPrompt?: boolean;
}

export interface ErrorRegisterEntry {
  id: string;
  fileId: string;
  fileName: string;
  location: string;
  severity: 'MATHEMATICAL_ERROR' | 'TERMINOLOGY_TYPO' | 'MISSING_NOTATION' | 'MISNAMED_FILE' | 'INCOMPLETE_CONTENT';
  originalContent: string;
  correctedContent: string;
  reason: string;
  verificationCheck: string;
}

export interface MissingContentEntry {
  id: string;
  unitNumber: number;
  syllabusItem: string;
  status: 'MISSING_SLIDES_AND_QA' | 'MISSING_SLIDES_ONLY' | 'MISSING_FILE' | 'INCOMPLETE_KEY';
  details: string;
  remediationInApp: string;
}

export interface WorkedStep {
  label: string;
  detail: string;
}

export interface TopicCheckQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicNode {
  id: string;
  code: string;
  title: string;
  unitId: string;
  unitNumber: 1 | 2 | 3 | 4 | 5;
  syllabusStatus: 'OFFICIAL_SYLLABUS' | 'SYLLABUS_GAP_FILLED' | 'EXTENDED_STLD_REFERENCE';
  officialSyllabusPhrase: string;
  sourceFiles: { fileId: string; citation: string }[];
  concepts: string[];
  // Beginner-to-Exam Unified Teaching Sequence
  oneLiner: string;
  analogy: string;
  whyItExists: string;
  stepByStep: { term: string; explanation: string }[];
  visualLabId: VisualLabId;
  visualCaption: string;
  workedExample: {
    problem: string;
    steps: WorkedStep[];
    finalAnswer: string;
    verificationCheck: string;
  };
  intermediateExample?: {
    problem: string;
    steps: WorkedStep[];
    finalAnswer: string;
    verificationCheck: string;
  };
  examAnswer: {
    marksHint: string;
    keywords: string[];
    points: string[];
    diagramNote: string;
  };
  commonMistakes: string[];
  quickRecap: [string, string, string];
  practicePrompts: { question: string; hint: string; answer: string }[];
  checkQuestion: TopicCheckQuestion;
}

export interface UnitNode {
  id: string;
  unitNumber: 1 | 2 | 3 | 4 | 5;
  code: string;
  title: string;
  syllabusSummary: string;
  coMapping: string;
  sourceCitation: string;
  topics: TopicNode[];
}

export interface ShortAnswer4Mark {
  available: boolean;
  definition: string;
  keyPoints: string[];
  formulaOrExample?: string;
  diagramNeeded: boolean;
  diagramNote?: string;
  gapReason?: string;
}

export interface LongAnswer10MarkSection {
  heading: string;
  points: string[];
}

export interface LongAnswer10Mark {
  available: boolean;
  introduction: string;
  sections: LongAnswer10MarkSection[];
  tableOrEquations?: string;
  workedCalculation?: string[];
  diagramDescription?: string;
  hasVisualDiagram?: boolean;
  advantagesOrApplications?: string[];
  conclusion: string;
  gapReason?: string;
}

export type QuestionOriginType =
  | 'PROFESSOR_KEY'
  | 'SOURCE_QUESTION_VERIFIED'
  | 'NEWLY_PREPARED_PRACTICE'
  | 'OUTSIDE_SYLLABUS';

export interface QuestionRecord {
  id: string;
  code: string;
  unitNumber: 1 | 2 | 3 | 4 | 5 | 0; // 0 for outside syllabus
  unitLabel: string;
  topicId?: string;
  subtopic: string;
  questionType: 'MCQ' | 'True/False' | 'Short Answer' | 'Long Answer' | 'Numerical' | 'Algorithm' | 'Diagram';
  questionCategory: 'Conceptual' | 'Numerical' | 'Algorithm' | 'Diagram' | 'Comparison';
  difficulty: 'Beginner' | 'Intermediate' | 'Exam-Level';
  conceptsRequired: string[];
  sourceFileId: string;
  sourceName: string;
  duplicateSources?: string[];
  errataOrConflictNote?: string;
  originType: QuestionOriginType;
  questionText: string;
  marksOrType: string;
  whatIsAsked: string;
  givenInfo: string;
  formulaOrPrinciple: string;
  stepByStepSolution: string[];
  answerFromFile: string;
  answerSourceStatus: 'PROFESSOR_ANSWER_KEY' | 'INDEPENDENTLY_VERIFIED_SOLUTION' | 'STUDENT_RESPONSES_NEED_KEY';
  matchingSlideOrFile: string;
  matchConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'MISSING';
  syllabusStatus: 'IN_SYLLABUS' | 'EXTENDED_REFERENCE' | 'OUTSIDE_DECO_SYLLABUS';
  verificationCheck: string;
  commonMistakes: string[];
  similarPractice: string;
  diagramHint?: string;
  answer4Mark: ShortAnswer4Mark;
  answer10Mark: LongAnswer10Mark;
}

