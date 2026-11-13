import React, { useMemo, useState } from 'react';
import { FileText, FlaskConical, HelpCircle, Search, X } from 'lucide-react';
import { ALL_DECO_TOPICS } from '../data/knowledgeBase';
import { ORIGINAL_FILES_INVENTORY } from '../data/filesInventory';
import { QUESTIONS_BANK } from '../data/questionsBank';
import { OriginalFileRecord, VisualLabId } from '../types/academic';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
  onSelectLab: (labId: VisualLabId) => void;
  onSelectQuestion: (questionId: string) => void;
  onPreviewFile: (file: OriginalFileRecord) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
  onSelectLab,
  onSelectQuestion,
  onPreviewFile,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        topics: ALL_DECO_TOPICS.slice(0, 6),
        questions: QUESTIONS_BANK.slice(0, 4),
        files: ORIGINAL_FILES_INVENTORY.slice(0, 5),
      };
    }
    return {
      topics: ALL_DECO_TOPICS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.oneLiner.toLowerCase().includes(q) ||
          t.concepts.some((c) => c.toLowerCase().includes(q))
      ).slice(0, 8),
      questions: QUESTIONS_BANK.filter(
        (item) =>
          item.questionText.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.answerFromFile.toLowerCase().includes(q) ||
          item.conceptsRequired.some((c) => c.toLowerCase().includes(q))
      ).slice(0, 6),
      files: ORIGINAL_FILES_INVENTORY.filter(
        (f) =>
          f.originalName.toLowerCase().includes(q) ||
          f.relevanceSummary.toLowerCase().includes(q) ||
          f.topicsCovered.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 8),
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-16 backdrop-blur-xs">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-stone-200 bg-white text-stone-900 shadow-xl dark:border-slate-700 dark:bg-[#141E33] dark:text-slate-100">
        <div className="flex items-center gap-3 border-b border-stone-200 px-4 py-3 dark:border-slate-700">
          <Search className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all 5 DECO units, topics, IEEE 754, K-maps, Booth, DMA, questions, and all 34 files..."
            className="w-full bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-400"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-4">
          {/* Topics */}
          <div>
            <h3 className="mb-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              DECO Topics ({results.topics.length})
            </h3>
            <div className="grid gap-2">
              {results.topics.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded border border-stone-200 px-3 py-2 hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-[#19253E]/50 dark:hover:border-blue-500 dark:hover:bg-[#1E2C49]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTopic(t.id);
                      onClose();
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      Unit {t.unitNumber} · {t.code}
                    </div>
                    <div className="text-sm font-medium text-stone-900 dark:text-slate-100">{t.title}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectLab(t.visualLabId);
                      onClose();
                    }}
                    className="flex shrink-0 items-center gap-1 rounded border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-[#0D1526] dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    <span>Open Lab</span>
                  </button>
                </div>
              ))}
              {results.topics.length === 0 && (
                <p className="text-xs text-stone-500 dark:text-slate-400">No DECO topics matched your query.</p>
              )}
            </div>
          </div>

          {/* Questions */}
          <div>
            <h3 className="mb-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Exam Questions &amp; Keys ({results.questions.length})
            </h3>
            <div className="grid gap-2">
              {results.questions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectQuestion(item.id);
                    onClose();
                  }}
                  className="flex items-start gap-2.5 rounded border border-stone-200 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-[#19253E]/50 dark:hover:border-blue-500 dark:hover:bg-[#1E2C49]"
                >
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <div>
                    <div className="text-xs font-medium text-stone-500 dark:text-slate-400">
                      {item.code} · {item.sourceName}
                    </div>
                    <div className="text-sm text-stone-900 dark:text-slate-100">{item.questionText}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* All 34 Files */}
          <div>
            <h3 className="mb-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Original Source Files (34/34 Archive · {results.files.length} shown)
            </h3>
            <div className="grid gap-2">
              {results.files.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    onPreviewFile(f);
                    onClose();
                  }}
                  className="flex items-start gap-2.5 rounded border border-stone-200 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-[#19253E]/50 dark:hover:border-blue-500 dark:hover:bg-[#1E2C49]"
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-stone-600 dark:text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-stone-900 dark:text-slate-100">{f.originalName}</div>
                    <div className="text-xs text-stone-500 dark:text-slate-400">
                      {f.fileType} · {f.pagesOrSize} · {f.decoRelevance.replace(/_/g, ' ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
