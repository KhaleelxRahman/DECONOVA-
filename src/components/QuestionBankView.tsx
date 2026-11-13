import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FlaskConical,
  Printer,
  RotateCcw,
  Search,
} from 'lucide-react';
import { ORIGINAL_FILES_INVENTORY } from '../data/filesInventory';
import { ALL_DECO_TOPICS, DECO_UNITS } from '../data/knowledgeBase';
import { QUESTIONS_BANK } from '../data/questionsBank';
import {
  OriginalFileRecord,
  QuestionOriginType,
  QuestionRecord,
  VisualLabId,
} from '../types/academic';
import { ExamDiagram } from './ExamDiagrams';

export type UnitFilterOption = 'all' | '1' | '2' | '3' | '4' | '5' | '0';
type AnswerFormatMode = 'both' | '4m' | '10m';
type CategoryFilterOption = 'all' | QuestionRecord['questionCategory'];
type OriginFilterOption = 'all' | QuestionOriginType;

interface QuestionBankViewProps {
  initialUnitFilter?: UnitFilterOption;
  initialTopicId?: string | null;
  initialQuestionId?: string | null;
  reviewedTopicIds: string[];
  onToggleTopicReviewed: (topicId: string) => void;
  onPreviewFile: (file: OriginalFileRecord) => void;
  onOpenLab: (labId: VisualLabId) => void;
  onBackToDashboard?: () => void;
}

function formatAnswerForClipboard(
  q: QuestionRecord,
  scope: '4m' | '10m' | 'both'
): string {
  const lines: string[] = [
    `[${q.code}] ${q.questionText}`,
    `Source: ${q.sourceName}`,
    '',
  ];

  if ((scope === '4m' || scope === 'both') && q.answer4Mark.available) {
    lines.push('--- 4-MARK SHORT ANSWER ---');
    lines.push(q.answer4Mark.definition);
    q.answer4Mark.keyPoints.forEach((pt, idx) => lines.push(`${idx + 1}. ${pt}`));
    if (q.answer4Mark.formulaOrExample) {
      lines.push(`Formula / Example: ${q.answer4Mark.formulaOrExample}`);
    }
    if (q.answer4Mark.diagramNeeded && q.answer4Mark.diagramNote) {
      lines.push(`Diagram Note: ${q.answer4Mark.diagramNote}`);
    }
    lines.push('');
  }

  if ((scope === '10m' || scope === 'both') && q.answer10Mark.available) {
    lines.push('--- 10-MARK LONG ANSWER ---');
    lines.push(`Introduction: ${q.answer10Mark.introduction}`);
    q.answer10Mark.sections.forEach((sec) => {
      lines.push('');
      lines.push(sec.heading);
      sec.points.forEach((pt) => lines.push(`- ${pt}`));
    });
    if (q.answer10Mark.tableOrEquations) {
      lines.push('');
      lines.push('Key Equations / Table:');
      lines.push(q.answer10Mark.tableOrEquations);
    }
    if (q.answer10Mark.workedCalculation?.length) {
      lines.push('');
      lines.push('Worked Calculation:');
      q.answer10Mark.workedCalculation.forEach((c) => lines.push(c));
    }
    if (q.answer10Mark.diagramDescription) {
      lines.push('');
      lines.push(`Diagram to Draw: ${q.answer10Mark.diagramDescription}`);
    }
    if (q.answer10Mark.advantagesOrApplications?.length) {
      lines.push('');
      lines.push('Applications / Advantages:');
      q.answer10Mark.advantagesOrApplications.forEach((a) => lines.push(`- ${a}`));
    }
    lines.push('');
    lines.push(`Conclusion: ${q.answer10Mark.conclusion}`);
  }

  lines.push('');
  lines.push(`Verification Check: ${q.verificationCheck}`);
  return lines.join('\n');
}

function originLabel(origin: QuestionOriginType): { text: string; colorClass: string } {
  switch (origin) {
    case 'PROFESSOR_KEY':
      return { text: 'Professor Key', colorClass: 'text-emerald-700 dark:text-emerald-400' };
    case 'SOURCE_QUESTION_VERIFIED':
      return { text: 'Verified Source', colorClass: 'text-blue-700 dark:text-blue-400' };
    case 'NEWLY_PREPARED_PRACTICE':
      return { text: 'Prepared Practice', colorClass: 'text-amber-700 dark:text-amber-400' };
    case 'OUTSIDE_SYLLABUS':
      return { text: 'Outside Syllabus', colorClass: 'text-red-700 dark:text-red-400' };
  }
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  initialUnitFilter = 'all',
  initialTopicId = null,
  initialQuestionId = null,
  reviewedTopicIds,
  onToggleTopicReviewed,
  onPreviewFile,
  onOpenLab,
  onBackToDashboard,
}) => {
  const [unitFilter, setUnitFilter] = useState<UnitFilterOption>(initialUnitFilter);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(initialTopicId);
  const [topicQuery, setTopicQuery] = useState('');
  const [questionQuery, setQuestionQuery] = useState('');
  const [answerFormat, setAnswerFormat] = useState<AnswerFormatMode>('both');
  const [originFilter, setOriginFilter] = useState<OriginFilterOption>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterOption>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const firstId = initialQuestionId || QUESTIONS_BANK[0]?.id;
    return firstId ? { [firstId]: true } : {};
  });
  const [conceptBriefOpen, setConceptBriefOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setUnitFilter(initialUnitFilter);
  }, [initialUnitFilter]);

  useEffect(() => {
    if (initialTopicId) {
      setSelectedTopicId(initialTopicId);
      const firstTopicQ = QUESTIONS_BANK.find((q) => q.topicId === initialTopicId);
      if (firstTopicQ) {
        setExpandedIds({ [firstTopicQ.id]: true });
      }
    } else if (initialTopicId === null && initialQuestionId === null) {
      setSelectedTopicId(null);
    }
  }, [initialTopicId, initialQuestionId]);

  useEffect(() => {
    if (initialQuestionId) {
      const target = QUESTIONS_BANK.find((q) => q.id === initialQuestionId);
      if (target) {
        setUnitFilter(String(target.unitNumber) as UnitFilterOption);
        setSelectedTopicId(target.topicId || null);
        setExpandedIds({ [target.id]: true });
        setTimeout(() => {
          document.getElementById(`question-card-${target.id}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 60);
      }
    }
  }, [initialQuestionId]);

  const fileMap = useMemo(
    () => new Map(ORIGINAL_FILES_INVENTORY.map((f) => [f.id, f])),
    []
  );

  const topicMap = useMemo(
    () => new Map(ALL_DECO_TOPICS.map((t) => [t.id, t])),
    []
  );

  const questionCountByTopic = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of QUESTIONS_BANK) {
      if (q.topicId) {
        map.set(q.topicId, (map.get(q.topicId) || 0) + 1);
      }
    }
    return map;
  }, []);

  const unitCounts = useMemo(() => {
    const counts: Record<string, number> = { all: QUESTIONS_BANK.length, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '0': 0 };
    for (const q of QUESTIONS_BANK) {
      counts[String(q.unitNumber)] = (counts[String(q.unitNumber)] || 0) + 1;
    }
    return counts;
  }, []);

  const visibleTopics = useMemo(() => {
    const q = topicQuery.trim().toLowerCase();
    return ALL_DECO_TOPICS.filter((t) => {
      if (unitFilter === '0') return false;
      if (unitFilter !== 'all' && String(t.unitNumber) !== unitFilter) return false;
      if (!q) return true;
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.officialSyllabusPhrase.toLowerCase().includes(q)
      );
    });
  }, [unitFilter, topicQuery]);

  const filteredQuestions = useMemo(() => {
    const qLower = questionQuery.trim().toLowerCase();
    return QUESTIONS_BANK.filter((q) => {
      if (unitFilter !== 'all' && String(q.unitNumber) !== unitFilter) return false;
      if (selectedTopicId && q.topicId !== selectedTopicId) return false;
      if (originFilter !== 'all' && q.originType !== originFilter) return false;
      if (categoryFilter !== 'all' && q.questionCategory !== categoryFilter) return false;
      if (answerFormat === '4m' && !q.answer4Mark.available) return false;
      if (answerFormat === '10m' && !q.answer10Mark.available) return false;
      if (!qLower) return true;
      return (
        q.code.toLowerCase().includes(qLower) ||
        q.questionText.toLowerCase().includes(qLower) ||
        q.subtopic.toLowerCase().includes(qLower) ||
        q.sourceName.toLowerCase().includes(qLower) ||
        q.conceptsRequired.some((c) => c.toLowerCase().includes(qLower)) ||
        q.answerFromFile.toLowerCase().includes(qLower)
      );
    });
  }, [unitFilter, selectedTopicId, originFilter, categoryFilter, answerFormat, questionQuery]);

  const activeTopic = selectedTopicId ? topicMap.get(selectedTopicId) || null : null;

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllVisible = () => {
    const next: Record<string, boolean> = {};
    filteredQuestions.forEach((q) => {
      next[q.id] = true;
    });
    setExpandedIds(next);
  };

  const collapseAllVisible = () => {
    setExpandedIds({});
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((curr) => (curr === key ? null : curr)), 1800);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleUnitChange = (nextUnit: UnitFilterOption) => {
    setUnitFilter(nextUnit);
    setSelectedTopicId(null);
    setConceptBriefOpen(false);
    const firstMatch = QUESTIONS_BANK.find((q) =>
      nextUnit === 'all' ? true : String(q.unitNumber) === nextUnit
    );
    setExpandedIds(firstMatch ? { [firstMatch.id]: true } : {});
  };

  const handleSelectTopic = (topicId: string | null) => {
    setSelectedTopicId(topicId);
    setConceptBriefOpen(false);
    if (topicId) {
      const topic = topicMap.get(topicId);
      if (topic && unitFilter !== 'all' && String(topic.unitNumber) !== unitFilter) {
        setUnitFilter(String(topic.unitNumber) as UnitFilterOption);
      }
      const firstQ = QUESTIONS_BANK.find((q) => q.topicId === topicId);
      if (firstQ) setExpandedIds({ [firstQ.id]: true });
    }
  };

  const resetAllFilters = () => {
    setUnitFilter('all');
    setSelectedTopicId(null);
    setTopicQuery('');
    setQuestionQuery('');
    setAnswerFormat('both');
    setOriginFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Top Unit Selection & Action Header */}
      <section className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700/80 dark:bg-[#141E33] print:border-0 print:p-0">
        {/* Clickable Navigation Hierarchy: Dashboard -> Unit -> Topic -> Questions */}
        <nav
          aria-label="Question bank hierarchy"
          className="mb-2.5 flex flex-wrap items-center gap-1.5 font-['IBM_Plex_Mono'] text-[11px] text-stone-500 print:hidden dark:text-slate-400"
        >
          {onBackToDashboard && (
            <>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="font-semibold text-blue-700 hover:underline dark:text-blue-400"
              >
                Dashboard
              </button>
              <span aria-hidden="true">/</span>
            </>
          )}
          <button
            type="button"
            onClick={() => handleUnitChange('all')}
            className={`hover:underline ${
              unitFilter === 'all' && !selectedTopicId
                ? 'font-semibold text-stone-900 dark:text-slate-100'
                : 'text-blue-700 dark:text-blue-400'
            }`}
          >
            All Units
          </button>
          {unitFilter !== 'all' && (
            <>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => handleSelectTopic(null)}
                className={`hover:underline ${
                  !selectedTopicId
                    ? 'font-semibold text-stone-900 dark:text-slate-100'
                    : 'text-blue-700 dark:text-blue-400'
                }`}
              >
                {unitFilter === '0' ? 'Outside Syllabus' : `Unit ${unitFilter}`}
              </button>
            </>
          )}
          {activeTopic && (
            <>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-stone-900 dark:text-slate-100">
                {activeTopic.code} · {activeTopic.title}
              </span>
            </>
          )}
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              U24EC304 · Consolidated Units I–V Exam Answer System
            </div>
            <h1 className="font-['Fraunces'] text-xl font-bold text-stone-900 dark:text-slate-50">
              Topic-Wise Question Bank (4-Mark &amp; 10-Mark Exam Answers)
            </h1>
            <p className="text-xs text-stone-600 dark:text-slate-400">
              Every question carries source traceability, errata/conflict checks, structured 4-Mark short and 10-Mark long answers, and two-method mathematical verification.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={expandAllVisible}
              className="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-blue-500 hover:text-blue-700 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200"
            >
              Expand All ({filteredQuestions.length})
            </button>
            <button
              type="button"
              onClick={collapseAllVisible}
              className="rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-blue-500 hover:text-blue-700 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200"
            >
              Collapse All
            </button>
            <button
              type="button"
              onClick={() => {
                expandAllVisible();
                setTimeout(() => window.print(), 80);
              }}
              className="inline-flex items-center gap-1.5 rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Study Sheet</span>
            </button>
          </div>
        </div>

        {/* Unit Tabs */}
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stone-200 pt-3 print:hidden dark:border-slate-700">
          {(
            [
              { id: 'all', label: `All Units (${unitCounts.all})` },
              { id: '1', label: `Unit I · Structure & Data (${unitCounts['1']})` },
              { id: '2', label: `Unit II · Logic & K-Maps (${unitCounts['2']})` },
              { id: '3', label: `Unit III · Arithmetic & RTL (${unitCounts['3']})` },
              { id: '4', label: `Unit IV · I/O & Cache (${unitCounts['4']})` },
              { id: '5', label: `Unit V · RISC & Pipelining (${unitCounts['5']})` },
              { id: '0', label: `Outside Syllabus (${unitCounts['0']})` },
            ] as const
          ).map((tab) => {
            const active = unitFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleUnitChange(tab.id)}
                className={`rounded border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-stone-200 bg-[#FAF8F4] text-stone-700 hover:border-blue-400 hover:bg-white dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Two-Column Workspace */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left Sidebar: Topic Navigator */}
        <aside className="space-y-3 lg:col-span-4 print:hidden">
          <div className="rounded-lg border border-stone-200 bg-white p-3.5 dark:border-slate-700/80 dark:bg-[#141E33]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-['Fraunces'] text-sm font-bold text-stone-900 dark:text-slate-50">
                Syllabus Topics ({visibleTopics.length}/26)
              </h2>
              {selectedTopicId && (
                <button
                  type="button"
                  onClick={() => handleSelectTopic(null)}
                  className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
                >
                  Show All Topics
                </button>
              )}
            </div>

            <div className="relative mt-2.5">
              <Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                aria-label="Filter syllabus topics"
                value={topicQuery}
                onChange={(e) => setTopicQuery(e.target.value)}
                placeholder="Filter topic code or title..."
                className="w-full rounded border border-stone-300 bg-[#FAF8F4] py-1.5 pr-3 pl-8 text-xs text-stone-900 placeholder-stone-400 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-100"
              />
            </div>

            {unitFilter === '0' ? (
              <div className="mt-3 rounded border border-red-200 bg-red-50/70 p-3 text-xs text-red-900 dark:border-red-800/70 dark:bg-red-950/40 dark:text-red-200">
                Showing preserved outside-syllabus items (Intel 8086 Q10 and MRCET Question Archive audit) excluded from U24EC304.
              </div>
            ) : (
              <div className="mt-3 max-h-[68vh] space-y-1.5 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => handleSelectTopic(null)}
                  className={`w-full rounded border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    selectedTopicId === null
                      ? 'border-blue-700 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/70 dark:text-blue-100'
                      : 'border-stone-200 bg-[#FAF8F4] text-stone-700 hover:border-stone-300 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-200'
                  }`}
                >
                  All {unitFilter === 'all' ? 'Units I–V' : `Unit ${unitFilter}`} Topics ({unitCounts[unitFilter]} Qs)
                </button>

                {visibleTopics.map((topic) => {
                  const isSelected = selectedTopicId === topic.id;
                  const qCount = questionCountByTopic.get(topic.id) || 0;
                  const isReviewed = reviewedTopicIds.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleSelectTopic(topic.id)}
                      className={`w-full rounded border px-3 py-2 text-left transition-colors ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50 text-blue-950 dark:border-blue-500 dark:bg-blue-950/70 dark:text-blue-100'
                          : 'border-stone-200 bg-white text-stone-800 hover:border-blue-300 hover:bg-[#FAF8F4] dark:border-slate-700 dark:bg-[#19253E]/80 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-['IBM_Plex_Mono'] text-[11px]">
                        <span className="font-semibold text-blue-700 dark:text-blue-400">
                          {topic.code}
                        </span>
                        <span className="flex items-center gap-1.5 text-stone-500 dark:text-slate-400">
                          {isReviewed && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                          <span>{qCount} Q{qCount === 1 ? '' : 's'}</span>
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs font-semibold leading-snug">{topic.title}</div>
                    </button>
                  );
                })}
                {visibleTopics.length === 0 && (
                  <p className="py-4 text-center text-xs text-stone-500 dark:text-slate-400">
                    No syllabus topics matched &ldquo;{topicQuery}&rdquo;.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Right Workspace: Concept Brief Drawer + Filters + Question Cards */}
        <div className="space-y-4 lg:col-span-8 print:col-span-12">
          {/* Selected Topic Context & Concept Brief Drawer */}
          {activeTopic && (
            <section className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700/80 dark:bg-[#141E33]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 font-['IBM_Plex_Mono'] text-xs text-stone-600 dark:text-slate-300">
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      {activeTopic.code}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Unit {activeTopic.unitNumber}</span>
                    {activeTopic.syllabusStatus === 'SYLLABUS_GAP_FILLED' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                          Gap-Filled from Textbook/Syllabus
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="font-['Fraunces'] text-lg font-bold text-stone-900 dark:text-slate-50">
                    {activeTopic.title}
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-slate-400">
                    <strong className="text-stone-800 dark:text-slate-200">Official Syllabus:</strong>{' '}
                    {activeTopic.officialSyllabusPhrase}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => onToggleTopicReviewed(activeTopic.id)}
                    className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      reviewedTopicIds.includes(activeTopic.id)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-500 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>
                      {reviewedTopicIds.includes(activeTopic.id) ? 'Reviewed' : 'Mark Reviewed'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLab(activeTopic.visualLabId)}
                    className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-blue-500 hover:text-blue-700 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200"
                  >
                    <FlaskConical className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                    <span>Interactive Lab</span>
                  </button>
                  <button
                    type="button"
                    aria-expanded={conceptBriefOpen}
                    onClick={() => setConceptBriefOpen((o) => !o)}
                    className="inline-flex items-center gap-1 rounded border border-blue-700 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{conceptBriefOpen ? 'Hide Concept Brief' : 'Topic Concept Brief & Diagram'}</span>
                  </button>
                </div>
              </div>

              {conceptBriefOpen && (
                <div className="mt-4 space-y-4 border-t border-stone-200 pt-4 text-xs dark:border-slate-700">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded border border-stone-200 bg-[#FAF8F4] p-3 dark:border-slate-700 dark:bg-[#19253E]">
                      <div className="font-['IBM_Plex_Mono'] text-[11px] font-bold uppercase text-blue-700 dark:text-blue-400">
                        In One Line
                      </div>
                      <p className="mt-1 text-stone-800 dark:text-slate-200">{activeTopic.oneLiner}</p>
                    </div>
                    <div className="rounded border border-stone-200 bg-[#FAF8F4] p-3 dark:border-slate-700 dark:bg-[#19253E]">
                      <div className="font-['IBM_Plex_Mono'] text-[11px] font-bold uppercase text-blue-700 dark:text-blue-400">
                        Everyday Analogy
                      </div>
                      <p className="mt-1 text-stone-800 dark:text-slate-200">{activeTopic.analogy}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-['IBM_Plex_Mono'] text-[11px] font-bold uppercase text-stone-500 dark:text-slate-400">
                      Core Concepts &amp; Definitions
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {activeTopic.stepByStep.map((s) => (
                        <div
                          key={s.term}
                          className="rounded border border-stone-200 bg-white p-2.5 dark:border-slate-700 dark:bg-[#0D1526]"
                        >
                          <div className="font-semibold text-stone-900 dark:text-slate-100">{s.term}</div>
                          <p className="mt-1 text-stone-600 dark:text-slate-300">{s.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded border border-stone-200 bg-white p-3 dark:border-slate-700 dark:bg-[#0D1526]">
                    <div className="mb-2 font-['IBM_Plex_Mono'] text-[11px] font-bold uppercase text-stone-500 dark:text-slate-400">
                      Reference Exam Diagram ({activeTopic.code})
                    </div>
                    <ExamDiagram unitNumber={activeTopic.unitNumber} topicId={activeTopic.id} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
                      <div className="font-bold">3-Point Quick Recap</div>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {activeTopic.quickRecap.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded border border-amber-200 bg-amber-50/70 p-3 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                      <div className="font-bold">Common Exam Mistakes</div>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {activeTopic.commonMistakes.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Question Search, Format Toggle & Provenance/Category Filters */}
          <section className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 print:hidden dark:border-slate-700/80 dark:bg-[#141E33]">
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="relative sm:col-span-6">
                <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  aria-label="Search questions, keywords, or source files"
                  value={questionQuery}
                  onChange={(e) => setQuestionQuery(e.target.value)}
                  placeholder="Search question text, code (e.g. CIE2-LAQ-6), Booth, K-map..."
                  className="w-full rounded border border-stone-300 bg-[#FAF8F4] py-2 pr-3 pl-9 text-xs text-stone-900 placeholder-stone-400 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  aria-label="Filter by provenance"
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value as OriginFilterOption)}
                  className="w-full rounded border border-stone-300 bg-[#FAF8F4] px-2.5 py-2 text-xs font-medium text-stone-800 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-100"
                >
                  <option value="all">All Provenances</option>
                  <option value="PROFESSOR_KEY">Professor Answer Key</option>
                  <option value="SOURCE_QUESTION_VERIFIED">Verified Source Question</option>
                  <option value="NEWLY_PREPARED_PRACTICE">Prepared Practice</option>
                  <option value="OUTSIDE_SYLLABUS">Outside Syllabus</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  aria-label="Filter by question category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as CategoryFilterOption)}
                  className="w-full rounded border border-stone-300 bg-[#FAF8F4] px-2.5 py-2 text-xs font-medium text-stone-800 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-100"
                >
                  <option value="all">All Categories</option>
                  <option value="Conceptual">Conceptual</option>
                  <option value="Numerical">Numerical</option>
                  <option value="Algorithm">Algorithm</option>
                  <option value="Diagram">Diagram</option>
                  <option value="Comparison">Comparison</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-2.5 dark:border-slate-700">
              {/* Answer Mark Mode Switcher */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-stone-500 dark:text-slate-400">
                  Answer Availability:
                </span>
                {(
                  [
                    { id: 'both', label: 'Both 4M & 10M' },
                    { id: '4m', label: '4-Mark Short Only' },
                    { id: '10m', label: '10-Mark Long Only' },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setAnswerFormat(fmt.id)}
                    className={`rounded border px-2.5 py-1 text-xs font-semibold ${
                      answerFormat === fmt.id
                        ? 'border-blue-700 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/70 dark:text-blue-200'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-300'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 font-['IBM_Plex_Mono'] text-[11px] text-stone-500 dark:text-slate-400">
                <span>
                  Showing {filteredQuestions.length} of {QUESTIONS_BANK.length} questions
                </span>
                {(unitFilter !== 'all' ||
                  selectedTopicId !== null ||
                  questionQuery ||
                  originFilter !== 'all' ||
                  categoryFilter !== 'all' ||
                  answerFormat !== 'both') && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Question Cards */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="rounded-lg border border-stone-200 bg-white p-8 text-center dark:border-slate-700/80 dark:bg-[#141E33]">
                <p className="text-sm font-semibold text-stone-800 dark:text-slate-100">
                  No questions match your current filters.
                </p>
                <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
                  Note: Outside-syllabus items have 4-Mark audit notes only and are excluded when filtering strictly by 10-Mark answers.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-3 rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isExpanded = Boolean(expandedIds[q.id]);
                const origin = originLabel(q.originType);
                const sourceFile = fileMap.get(q.sourceFileId);
                const topic = q.topicId ? topicMap.get(q.topicId) : undefined;
                const copy4Key = `${q.id}-4m`;
                const copy10Key = `${q.id}-10m`;
                const copyBothKey = `${q.id}-both`;

                return (
                  <article
                    key={q.id}
                    id={`question-card-${q.id}`}
                    className="overflow-hidden rounded-lg border border-stone-200 bg-[#FCFBF8] text-stone-900 dark:border-slate-700/80 dark:bg-[#141E33] dark:text-slate-100 print:break-inside-avoid print:border-slate-300 print:bg-white print:text-black"
                  >
                    {/* Accordion Header */}
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => toggleExpanded(q.id)}
                      className="flex w-full items-start justify-between gap-3 bg-white p-4 text-left transition-colors hover:bg-stone-50/80 dark:bg-[#141E33] dark:hover:bg-[#19253E]/80 print:bg-white"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-['IBM_Plex_Mono'] text-[11px]">
                          <span className="font-bold text-blue-700 dark:text-blue-400">{q.code}</span>
                          <span aria-hidden="true" className="text-stone-400">·</span>
                          <span className="text-stone-600 dark:text-slate-300">
                            {q.unitNumber === 0 ? 'Outside U24EC304' : `Unit ${q.unitNumber}`}
                          </span>
                          <span aria-hidden="true" className="text-stone-400">·</span>
                          <span className="text-stone-600 dark:text-slate-300">{q.subtopic}</span>
                          <span aria-hidden="true" className="text-stone-400">·</span>
                          <span className="text-stone-500 dark:text-slate-400">{q.questionCategory}</span>
                          <span aria-hidden="true" className="text-stone-400">·</span>
                          <span className={`font-semibold ${origin.colorClass}`}>{origin.text}</span>
                          <span aria-hidden="true" className="text-stone-400">·</span>
                          <span className="text-stone-600 dark:text-slate-300">
                            {q.answer4Mark.available && q.answer10Mark.available
                              ? '4M & 10M'
                              : q.answer4Mark.available
                              ? '4M Only'
                              : '10M Only'}
                          </span>
                        </div>

                        <h3 className="font-['Fraunces'] text-base font-bold leading-snug text-stone-900 dark:text-slate-50">
                          {q.questionText}
                        </h3>

                        <div className="text-xs text-stone-500 dark:text-slate-400">
                          Source: <span className="font-medium text-stone-700 dark:text-slate-300">{q.sourceName}</span>
                          {q.duplicateSources && q.duplicateSources.length > 0 && (
                            <span> · Consolidated with {q.duplicateSources.length} duplicate/related file(s)</span>
                          )}
                        </div>
                      </div>

                      <span className="mt-1 flex shrink-0 items-center gap-1 font-['IBM_Plex_Mono'] text-xs font-semibold text-blue-700 print:hidden dark:text-blue-400">
                        <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'Answer'}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    {/* Expanded Answer Workspace */}
                    {isExpanded && (
                      <div className="space-y-4 border-t border-stone-200 p-4 sm:p-5 dark:border-slate-700">
                        {/* Errata / Conflict Warning */}
                        {q.errataOrConflictNote && (
                          <div className="flex items-start gap-2.5 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                            <div>
                              <strong>Source Erratum / Conflict Audit: </strong>
                              {q.errataOrConflictNote}
                            </div>
                          </div>
                        )}

                        {/* Duplicate Sources List */}
                        {q.duplicateSources && q.duplicateSources.length > 0 && (
                          <div className="rounded border border-stone-200 bg-white px-3 py-2 text-xs text-stone-600 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-300">
                            <strong>Consolidated Sources: </strong>
                            {q.duplicateSources.join(' · ')}
                          </div>
                        )}

                        {/* Copy / Print / Source / Lab Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {q.answer4Mark.available && (
                              <button
                                type="button"
                                onClick={() => handleCopy(copy4Key, formatAnswerForClipboard(q, '4m'))}
                                className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-blue-500 hover:text-blue-700 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200"
                              >
                                {copiedKey === copy4Key ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                <span>{copiedKey === copy4Key ? 'Copied 4M!' : 'Copy 4-Mark'}</span>
                              </button>
                            )}
                            {q.answer10Mark.available && (
                              <button
                                type="button"
                                onClick={() => handleCopy(copy10Key, formatAnswerForClipboard(q, '10m'))}
                                className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-blue-500 hover:text-blue-700 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200"
                              >
                                {copiedKey === copy10Key ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                <span>{copiedKey === copy10Key ? 'Copied 10M!' : 'Copy 10-Mark'}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopy(copyBothKey, formatAnswerForClipboard(q, 'both'))}
                              className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-blue-500 hover:text-blue-700 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200"
                            >
                              {copiedKey === copyBothKey ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                              <span>{copiedKey === copyBothKey ? 'Copied!' : 'Copy Full Q&A'}</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {topic && (
                              <button
                                type="button"
                                onClick={() => onOpenLab(topic.visualLabId)}
                                className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-blue-500 hover:text-blue-700 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200"
                              >
                                <FlaskConical className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                                <span>Open Matching Lab</span>
                              </button>
                            )}
                            {sourceFile && (
                              <button
                                type="button"
                                onClick={() => onPreviewFile(sourceFile)}
                                className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-blue-500 hover:text-blue-700 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200"
                              >
                                <span>Source PDF</span>
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* PAPER SHEET READABLE EXAM ANSWERS (Warm-Paper High Contrast even in dark mode for long study) */}
                        <div className="space-y-4">
                          {/* A. 4-MARK SHORT ANSWER */}
                          {(answerFormat === 'both' || answerFormat === '4m') && (
                            <section className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700 dark:bg-[#0F172A]">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2 dark:border-slate-700">
                                <h4 className="font-['Fraunces'] text-sm font-bold text-blue-900 dark:text-blue-300">
                                  A. 4-Mark Short Answer (Concise Exam Format)
                                </h4>
                                <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-stone-500 dark:text-slate-400">
                                  Target: Definition + 3 Key Points
                                </span>
                              </div>

                              {q.answer4Mark.available ? (
                                <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-stone-800 dark:text-slate-200">
                                  <p>
                                    <strong className="text-stone-950 dark:text-white">Definition: </strong>
                                    {q.answer4Mark.definition}
                                  </p>
                                  <ul className="list-disc space-y-1.5 pl-5 text-xs sm:text-[13px]">
                                    {q.answer4Mark.keyPoints.map((pt, i) => (
                                      <li key={i}>{pt}</li>
                                    ))}
                                  </ul>
                                  {q.answer4Mark.formulaOrExample && (
                                    <div className="rounded border border-stone-200 bg-[#FAF8F4] px-3 py-2 font-['IBM_Plex_Mono'] text-xs text-stone-900 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-100">
                                      <strong>Key Formula / Example: </strong>
                                      {q.answer4Mark.formulaOrExample}
                                    </div>
                                  )}
                                  {q.answer4Mark.diagramNeeded && q.answer4Mark.diagramNote && (
                                    <div className="text-xs text-blue-800 dark:text-blue-300">
                                      <strong>Compact Diagram to Sketch: </strong>
                                      {q.answer4Mark.diagramNote}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
                                  {q.answer4Mark.gapReason || '4-Mark short answer not applicable.'}
                                </p>
                              )}
                            </section>
                          )}

                          {/* B. 10-MARK LONG ANSWER */}
                          {(answerFormat === 'both' || answerFormat === '10m') && (
                            <section className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700 dark:bg-[#0F172A]">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2 dark:border-slate-700">
                                <h4 className="font-['Fraunces'] text-sm font-bold text-stone-900 dark:text-slate-50">
                                  B. 10-Mark Long Answer (Full Structured University Answer)
                                </h4>
                                <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-stone-500 dark:text-slate-400">
                                  Intro + Headings + Worked Steps + Diagram + Conclusion
                                </span>
                              </div>

                              {q.answer10Mark.available ? (
                                <div className="mt-3 space-y-3.5 text-sm leading-relaxed text-stone-800 dark:text-slate-200">
                                  <div>
                                    <div className="font-['IBM_Plex_Mono'] text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                                      Introduction
                                    </div>
                                    <p className="mt-1 text-xs sm:text-[13.5px]">{q.answer10Mark.introduction}</p>
                                  </div>

                                  <div className="space-y-2.5">
                                    {q.answer10Mark.sections.map((sec) => (
                                      <div
                                        key={sec.heading}
                                        className="rounded border border-stone-200 bg-[#FAF8F4] p-3 dark:border-slate-700 dark:bg-[#19253E]"
                                      >
                                        <h5 className="text-xs font-bold text-stone-950 sm:text-[13px] dark:text-white">
                                          {sec.heading}
                                        </h5>
                                        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs sm:text-[13px]">
                                          {sec.points.map((pt, idx) => (
                                            <li key={idx}>{pt}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>

                                  {q.answer10Mark.tableOrEquations && (
                                    <div className="rounded border border-stone-200 bg-[#FAF8F4] p-3 font-['IBM_Plex_Mono'] text-xs whitespace-pre-line text-stone-900 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-100">
                                      <div className="mb-1 font-sans text-[11px] font-bold uppercase text-stone-500 dark:text-slate-400">
                                        Summary Table / Key Equations
                                      </div>
                                      {q.answer10Mark.tableOrEquations}
                                    </div>
                                  )}

                                  {q.answer10Mark.workedCalculation && q.answer10Mark.workedCalculation.length > 0 && (
                                    <div className="rounded border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
                                      <div className="mb-1.5 font-['IBM_Plex_Mono'] text-[11px] font-bold uppercase text-blue-800 dark:text-blue-300">
                                        Step-by-Step Worked Calculation / Trace
                                      </div>
                                      <div className="space-y-1 font-['IBM_Plex_Mono']">
                                        {q.answer10Mark.workedCalculation.map((line, idx) => (
                                          <div key={idx}>{line}</div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {q.answer10Mark.diagramDescription && (
                                    <div className="space-y-2 rounded border border-stone-200 bg-white p-3 dark:border-slate-700 dark:bg-[#141E33]">
                                      <div className="text-xs text-stone-700 dark:text-slate-300">
                                        <strong className="text-stone-900 dark:text-white">Exam Diagram Guidance: </strong>
                                        {q.answer10Mark.diagramDescription}
                                      </div>
                                      {q.answer10Mark.hasVisualDiagram && q.unitNumber !== 0 && q.topicId && (
                                        <ExamDiagram unitNumber={q.unitNumber} topicId={q.topicId} />
                                      )}
                                    </div>
                                  )}

                                  {q.answer10Mark.advantagesOrApplications &&
                                    q.answer10Mark.advantagesOrApplications.length > 0 && (
                                      <div className="text-xs">
                                        <strong className="text-stone-950 dark:text-white">
                                          Advantages &amp; Engineering Applications:
                                        </strong>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                          {q.answer10Mark.advantagesOrApplications.map((a, idx) => (
                                            <li key={idx}>{a}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                  <div className="border-t border-stone-200 pt-2.5 text-xs sm:text-[13px] dark:border-slate-700">
                                    <strong className="text-stone-950 dark:text-white">Conclusion: </strong>
                                    {q.answer10Mark.conclusion}
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
                                  {q.answer10Mark.gapReason || '10-Mark long answer not applicable for outside-syllabus reference.'}
                                </p>
                              )}
                            </section>
                          )}

                          {/* Verification Check + Common Mistakes + Practice */}
                          <div className="grid gap-3 text-xs sm:grid-cols-2">
                            <div className="flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                              <div>
                                <strong>Independent Verification Check: </strong>
                                {q.verificationCheck}
                              </div>
                            </div>

                            <div className="rounded border border-stone-200 bg-white p-3 text-stone-700 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-300">
                              <div className="font-bold text-stone-900 dark:text-white">
                                Common Exam Mistakes &amp; Practice
                              </div>
                              <ul className="mt-1 list-disc pl-4">
                                {q.commonMistakes.map((m) => (
                                  <li key={m}>{m}</li>
                                ))}
                              </ul>
                              <p className="mt-1.5 text-stone-600 dark:text-slate-400">
                                <strong>Similar Practice:</strong> {q.similarPractice}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
