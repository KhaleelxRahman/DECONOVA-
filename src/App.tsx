import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import { AITeacherView } from './components/AITeacherView';
import { FilePreviewModal } from './components/FilePreviewModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AppView, HeaderNav } from './components/HeaderNav';
import { InteractiveLabs, LAB_META } from './components/InteractiveLabs';
import { QuestionBankView, UnitFilterOption } from './components/QuestionBankView';
import { AuditTab, SourceAuditView } from './components/SourceAuditView';
import {
  CONTENT_ERROR_REGISTER,
  MISSING_CONTENT_REGISTER,
  ORIGINAL_FILES_INVENTORY,
} from './data/filesInventory';
import {
  ALL_DECO_TOPICS,
  DECO_SYLLABUS_META,
  DECO_UNITS,
} from './data/knowledgeBase';
import { QUESTIONS_BANK } from './data/questionsBank';
import { OriginalFileRecord, TopicNode, VisualLabId } from './types/academic';

const STORAGE_KEY = 'deco_mastered_topics_v1';
const THEME_KEY = 'deco_theme_v1';

export function App() {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [auditTab, setAuditTab] = useState<AuditTab>('files');
  const [bankUnitFilter, setBankUnitFilter] = useState<UnitFilterOption>('all');
  const [bankTopicId, setBankTopicId] = useState<string | null>(null);
  const [bankQuestionId, setBankQuestionId] = useState<string | null>(null);
  const [activeLabId, setActiveLabId] = useState<VisualLabId>('number-converter');
  const [aiTeacherTopic, setAiTeacherTopic] = useState<TopicNode | undefined>(undefined);
  const [searchOpen, setSearchOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<OriginalFileRecord | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      window.localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  const [reviewedTopicIds, setReviewedTopicIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewedTopicIds));
    } catch {
      // ignore storage errors
    }
  }, [reviewedTopicIds]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setPreviewFile(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const questionCountByTopic = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of QUESTIONS_BANK) {
      if (q.topicId) counts.set(q.topicId, (counts.get(q.topicId) || 0) + 1);
    }
    return counts;
  }, []);

  const answerStats = useMemo(() => {
    const fourMarkCount = QUESTIONS_BANK.filter((q) => q.answer4Mark.available).length;
    const tenMarkCount = QUESTIONS_BANK.filter((q) => q.answer10Mark.available).length;
    const professorKeyCount = QUESTIONS_BANK.filter((q) => q.originType === 'PROFESSOR_KEY').length;
    return { fourMarkCount, tenMarkCount, professorKeyCount };
  }, []);

  const toggleTopicReviewed = (topicId: string) => {
    setReviewedTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const openUnitInBank = (unitNumber: UnitFilterOption) => {
    setBankUnitFilter(unitNumber);
    setBankTopicId(null);
    setBankQuestionId(null);
    setActiveView('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTopicInBank = (topicId: string) => {
    const topic = ALL_DECO_TOPICS.find((t) => t.id === topicId);
    setBankUnitFilter(topic ? (String(topic.unitNumber) as UnitFilterOption) : 'all');
    setBankTopicId(topicId);
    setBankQuestionId(null);
    setActiveView('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openQuestionInBank = (questionId: string) => {
    const q = QUESTIONS_BANK.find((item) => item.id === questionId);
    setBankUnitFilter(q ? (String(q.unitNumber) as UnitFilterOption) : 'all');
    setBankTopicId(q?.topicId || null);
    setBankQuestionId(questionId);
    setActiveView('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLab = (labId: VisualLabId) => {
    setActiveLabId(labId);
    setActiveView('labs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAITeacher = (topic?: TopicNode) => {
    setAiTeacherTopic(topic);
    setActiveView('ai-teacher');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAudit = (tab: AuditTab = 'files') => {
    setAuditTab(tab);
    setActiveView('audit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const masteryPct = Math.round((reviewedTopicIds.length / ALL_DECO_TOPICS.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1C1B18] transition-colors dark:bg-[#0D1526] dark:text-[#E6ECF5] print:bg-white print:text-black">
      <HeaderNav
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'audit') setAuditTab('files');
          if (view === 'questions') {
            setBankQuestionId(null);
          }
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setSearchOpen(true)}
        reviewedCount={reviewedTopicIds.length}
        totalTopics={ALL_DECO_TOPICS.length}
      />

      {/* Workspace Study Bar */}
      <div className="border-b border-stone-200/80 bg-[#F3EFE6]/70 print:hidden dark:border-slate-800 dark:bg-[#111B30]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs sm:px-6">
          <div className="flex flex-wrap items-center gap-2 font-['IBM_Plex_Mono'] text-[11px] text-stone-600 dark:text-slate-300">
            <span className="font-semibold text-blue-700 dark:text-blue-400">
              {DECO_SYLLABUS_META.courseCode}
            </span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline">Units I–V Question Bank</span>
            <span aria-hidden="true">·</span>
            <span>{DECO_SYLLABUS_META.assessmentSplit}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAudit('errors')}
              className="rounded border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:border-blue-500 hover:text-blue-700 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-200"
            >
              Gaps &amp; Errata ({MISSING_CONTENT_REGISTER.length + CONTENT_ERROR_REGISTER.length})
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-pressed={darkMode}
              className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:border-blue-500 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-200"
            >
              {darkMode ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-blue-700" />
              )}
              <span>{darkMode ? 'Warm Paper Mode' : 'Ink-Blue Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 print:max-w-none print:p-0">
        {activeView === 'home' && (
          <div className="space-y-8">
            {/* Academic Hero Overview */}
            <section className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8 dark:border-slate-700/80 dark:bg-[#141E33]">
              <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
                <div className="space-y-4 lg:col-span-8">
                  <div className="font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    {DECO_SYLLABUS_META.courseCode} · Complete Topic-Wise Question Bank &amp; Exam Answer System
                  </div>
                  <h1 className="font-['Fraunces'] text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-slate-50">
                    Digital Electronics &amp; Computer Organization (DECO)
                  </h1>
                  <p className="max-w-3xl text-[17px] leading-[1.7] text-stone-700 dark:text-slate-300">
                    One unified exam preparation workspace covering all{' '}
                    <span className="font-semibold text-stone-900 dark:text-white">5 units and 26 topics</span> of{' '}
                    <span className="font-semibold text-stone-900 dark:text-white">U24EC304</span>—with consolidated{' '}
                    <span className="font-semibold text-stone-900 dark:text-white">4-Mark short</span> and{' '}
                    <span className="font-semibold text-stone-900 dark:text-white">10-Mark long exam answers</span>,
                    13 deterministic interactive simulators, embedded diagrams, and full traceability across all{' '}
                    <span className="font-semibold text-stone-900 dark:text-white">{ORIGINAL_FILES_INVENTORY.length}</span>{' '}
                    original source files.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => openUnitInBank('all')}
                      className="inline-flex items-center gap-2 rounded bg-blue-700 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-blue-800"
                    >
                      <FileCheck2 className="h-4 w-4" />
                      <span>Open Question Bank ({QUESTIONS_BANK.length} Qs)</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openLab('kmap-simplifier')}
                      className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3.5 py-2 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200 dark:hover:bg-[#1E2B47]"
                    >
                      <FlaskConical className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                      <span>Interactive Labs ({LAB_META.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openAudit('files')}
                      className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3.5 py-2 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200 dark:hover:bg-[#1E2B47]"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      <span>34-File Audit</span>
                    </button>
                  </div>
                </div>

                {/* Progress & Syllabus Telemetry Card */}
                <div className="rounded-lg border border-stone-200 bg-[#FAF8F4] p-4 lg:col-span-4 dark:border-slate-700 dark:bg-[#19253E]">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-slate-200">
                    <span>Topics Reviewed (Units I–V)</span>
                    <span className="font-['IBM_Plex_Mono'] text-blue-700 dark:text-blue-400">
                      {reviewedTopicIds.length}/{ALL_DECO_TOPICS.length} ({masteryPct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded bg-stone-200 dark:bg-slate-700">
                    <div
                      className="h-full bg-blue-700 transition-all duration-300 dark:bg-blue-500"
                      style={{ width: `${masteryPct}%` }}
                    />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-200 pt-3 text-xs dark:border-slate-700">
                    <div>
                      <dt className="text-stone-500 dark:text-slate-400">Official Units</dt>
                      <dd className="font-['IBM_Plex_Mono'] text-base font-bold text-stone-900 dark:text-white">
                        {DECO_UNITS.length} Units · {ALL_DECO_TOPICS.length} Topics
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone-500 dark:text-slate-400">Question Bank</dt>
                      <dd className="font-['IBM_Plex_Mono'] text-base font-bold text-stone-900 dark:text-white">
                        {QUESTIONS_BANK.length} Mapped Qs
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone-500 dark:text-slate-400">Structured Answers</dt>
                      <dd className="font-['IBM_Plex_Mono'] text-base font-bold text-stone-900 dark:text-white">
                        {answerStats.fourMarkCount} 4M · {answerStats.tenMarkCount} 10M
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone-500 dark:text-slate-400">Interactive Labs</dt>
                      <dd className="font-['IBM_Plex_Mono'] text-base font-bold text-stone-900 dark:text-white">
                        {LAB_META.length} Simulators
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 border-t border-stone-200 pt-2.5 font-['IBM_Plex_Mono'] text-[11px] text-stone-500 dark:border-slate-700 dark:text-slate-400">
                    {DECO_SYLLABUS_META.contactHours} · {answerStats.professorKeyCount} Professor-Keyed Items
                  </div>
                </div>
              </div>
            </section>

            {/* Unified 5-Unit Topic-Wise Question Navigator */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-['Fraunces'] text-xl font-bold text-stone-900 dark:text-slate-50">
                    Official U24EC304 Syllabus &amp; Topic-Wise Question Directory
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-slate-400">
                    100% syllabus coverage verified against Syllabus_DECO.pdf. Click any Unit or Topic to inspect 4-Mark &amp; 10-Mark exam answers, Concept Briefs, or simulators.
                  </p>
                </div>
                <span className="font-['IBM_Plex_Mono'] text-xs text-stone-500 dark:text-slate-400">
                  Shortcut: Ctrl+K / Cmd+K to search questions, topics, or files
                </span>
              </div>

              <div className="space-y-4">
                {DECO_UNITS.map((unit) => {
                  const unitReviewed = unit.topics.filter((t) => reviewedTopicIds.includes(t.id)).length;
                  const unitQCount = QUESTIONS_BANK.filter((q) => q.unitNumber === unit.unitNumber).length;
                  return (
                    <div
                      key={unit.id}
                      className="rounded-lg border border-stone-200 bg-white p-5 dark:border-slate-700/80 dark:bg-[#141E33]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 pb-3 dark:border-slate-700">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 font-['IBM_Plex_Mono'] text-xs text-stone-600 dark:text-slate-300">
                            <span className="font-semibold text-blue-700 dark:text-blue-400">{unit.code}</span>
                            <span aria-hidden="true">·</span>
                            <span>{unit.coMapping}</span>
                            <span aria-hidden="true">·</span>
                            <span>{unitQCount} Questions</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {unitReviewed}/{unit.topics.length} reviewed
                            </span>
                          </div>
                          <h3 className="font-['Fraunces'] text-lg font-bold text-stone-900 dark:text-slate-50">
                            {unit.title}
                          </h3>
                          <p className="text-xs text-stone-600 dark:text-slate-400">{unit.syllabusSummary}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openUnitInBank(String(unit.unitNumber) as UnitFilterOption)}
                          className="shrink-0 rounded border border-blue-700 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200"
                        >
                          Open {unit.code} Questions ({unitQCount})
                        </button>
                      </div>

                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {unit.topics.map((topic) => {
                          const done = reviewedTopicIds.includes(topic.id);
                          const topicQCount = questionCountByTopic.get(topic.id) || 0;
                          return (
                            <div
                              key={topic.id}
                              className="flex flex-col justify-between rounded border border-stone-200 bg-[#FAF8F4] p-3 transition-colors hover:border-blue-400 hover:bg-white dark:border-slate-700 dark:bg-[#19253E] dark:hover:border-blue-500"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                                    {topic.code}
                                    {topic.syllabusStatus === 'SYLLABUS_GAP_FILLED' ? ' · Gap-Filled' : ''}
                                  </span>
                                  <span className="flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-[11px] text-stone-500 dark:text-slate-400">
                                    <span>{topicQCount} Q{topicQCount === 1 ? '' : 's'}</span>
                                    {done && (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openTopicInBank(topic.id)}
                                  className="mt-1 text-left text-sm font-semibold text-stone-900 hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300"
                                >
                                  {topic.title}
                                </button>
                                <p className="mt-1 line-clamp-2 text-xs text-stone-600 dark:text-slate-400">
                                  {topic.oneLiner}
                                </p>
                              </div>

                              <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-2 dark:border-slate-700">
                                <button
                                  type="button"
                                  onClick={() => openTopicInBank(topic.id)}
                                  className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
                                >
                                  Exam Q&amp;As ({topicQCount}) →
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openLab(topic.visualLabId)}
                                  className="inline-flex items-center gap-1 rounded border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-700 hover:bg-stone-100 dark:border-slate-600 dark:bg-[#141E33] dark:text-slate-200"
                                >
                                  <FlaskConical className="h-3 w-3 text-blue-700 dark:text-blue-400" />
                                  <span>Lab</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Lab Launcher & Integrity Summary */}
            <section className="grid gap-4 lg:grid-cols-12">
              <div className="rounded-lg border border-stone-200 bg-white p-5 lg:col-span-8 dark:border-slate-700/80 dark:bg-[#141E33]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="font-['Fraunces'] text-base font-bold text-stone-900 dark:text-slate-50">
                      13 Interactive DECO Simulators &amp; Calculators
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-slate-400">
                      Every numerical solver runs step-by-step and verifies results with an independent second check.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('labs')}
                    className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
                  >
                    View All Labs →
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {LAB_META.slice(0, 9).map((lab) => (
                    <button
                      key={lab.id}
                      type="button"
                      onClick={() => openLab(lab.id)}
                      className="rounded border border-stone-200 bg-[#FAF8F4] p-2.5 text-left transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-[#19253E] dark:hover:border-blue-500"
                    >
                      <div className="font-['IBM_Plex_Mono'] text-[10px] font-semibold text-blue-700 dark:text-blue-400">
                        UNIT {lab.unit}
                      </div>
                      <div className="text-xs font-bold text-stone-900 dark:text-slate-100">{lab.title}</div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400">{lab.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-5 lg:col-span-4 dark:border-slate-700/80 dark:bg-[#141E33]">
                <h2 className="font-['Fraunces'] text-base font-bold text-stone-900 dark:text-slate-50">
                  Source Audit &amp; Exam Tools
                </h2>
                <button
                  type="button"
                  onClick={() => openUnitInBank('0')}
                  className="flex w-full items-start gap-3 rounded border border-stone-200 bg-[#FAF8F4] p-3 text-left hover:border-blue-400 hover:bg-white dark:border-slate-700 dark:bg-[#19253E]"
                >
                  <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-slate-100">
                      Outside-Syllabus Audit Items (8086 &amp; MRCET)
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-slate-400">
                      Inspect preserved questions excluded from U24EC304 so you never waste exam prep time.
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => openAITeacher(ALL_DECO_TOPICS[0])}
                  className="flex w-full items-start gap-3 rounded border border-stone-200 bg-[#FAF8F4] p-3 text-left hover:border-blue-400 hover:bg-white dark:border-slate-700 dark:bg-[#19253E]"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-slate-100">
                      Ask Sir&apos;s Classroom AI Teacher
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-slate-400">
                      Grounded in U24EC304 syllabus files for live step-by-step explanations.
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => openAudit('errors')}
                  className="flex w-full items-start gap-3 rounded border border-stone-200 bg-[#FAF8F4] p-3 text-left hover:border-blue-400 hover:bg-white dark:border-slate-700 dark:bg-[#19253E]"
                >
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-slate-100">
                      34 Files, {CONTENT_ERROR_REGISTER.length} Errata &amp; {MISSING_CONTENT_REGISTER.length} Gaps
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-slate-400">
                      Preview every original PDF/JPG/CSV file and inspect Slide 33/34 errata &amp; gaps.
                    </div>
                  </div>
                </button>
              </div>
            </section>
          </div>
        )}

        {activeView === 'questions' && (
          <QuestionBankView
            initialUnitFilter={bankUnitFilter}
            initialTopicId={bankTopicId}
            initialQuestionId={bankQuestionId}
            reviewedTopicIds={reviewedTopicIds}
            onToggleTopicReviewed={toggleTopicReviewed}
            onPreviewFile={setPreviewFile}
            onOpenLab={openLab}
            onBackToDashboard={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'labs' && (
          <InteractiveLabs activeLabId={activeLabId} onSelectLab={setActiveLabId} />
        )}

        {activeView === 'ai-teacher' && <AITeacherView initialTopic={aiTeacherTopic} />}

        {activeView === 'audit' && (
          <SourceAuditView
            initialTab={auditTab}
            onPreviewFile={setPreviewFile}
            onOpenTopic={openTopicInBank}
          />
        )}
      </main>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTopic={openTopicInBank}
        onSelectLab={openLab}
        onSelectQuestion={openQuestionInBank}
        onPreviewFile={setPreviewFile}
      />

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}

export default App;
