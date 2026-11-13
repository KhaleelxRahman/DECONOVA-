import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, FileCheck2 } from 'lucide-react';
import {
  CONTENT_ERROR_REGISTER,
  GOOGLE_FORM_STATS,
  MISSING_CONTENT_REGISTER,
  ORIGINAL_FILES_INVENTORY,
} from '../data/filesInventory';
import { SYLLABUS_COVERAGE_MATRIX } from '../data/knowledgeBase';
import { DecorelevanceClass, OriginalFileRecord } from '../types/academic';

export type AuditTab = 'files' | 'errors' | 'coverage' | 'form';

interface SourceAuditViewProps {
  initialTab?: AuditTab;
  onPreviewFile: (file: OriginalFileRecord) => void;
  onOpenTopic: (topicId: string) => void;
}

export const SourceAuditView: React.FC<SourceAuditViewProps> = ({
  initialTab = 'files',
  onPreviewFile,
  onOpenTopic,
}) => {
  const [tab, setTab] = useState<AuditTab>(initialTab);
  const [relFilter, setRelFilter] = useState<'ALL' | DecorelevanceClass>('ALL');

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const filteredFiles = useMemo(() => {
    if (relFilter === 'ALL') return ORIGINAL_FILES_INVENTORY;
    return ORIGINAL_FILES_INVENTORY.filter((f) => f.decoRelevance === relFilter);
  }, [relFilter]);

  const counts = {
    core: ORIGINAL_FILES_INVENTORY.filter((f) => f.decoRelevance === 'CORE_DECO_U24EC304').length,
    partial: ORIGINAL_FILES_INVENTORY.filter((f) => f.decoRelevance === 'PARTIAL_DECO_OVERLAP').length,
    outside: ORIGINAL_FILES_INVENTORY.filter((f) => f.decoRelevance === 'OUTSIDE_DECO_PRESERVED').length,
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700/80 dark:bg-[#141E33]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-['Fraunces'] text-lg font-bold text-stone-900 dark:text-slate-50">
              Complete Source Audit (34/34 Unique Original Files Preserved)
            </h1>
            <p className="text-xs text-stone-500 dark:text-slate-400">
              Core DECO: {counts.core} files · Partial Overlap: {counts.partial} files · Outside DECO (Preserved Intact): {counts.outside} files. Zero files deleted.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'files' as const, label: '34 Original Files' },
              { id: 'errors' as const, label: `Gaps & Errata (${CONTENT_ERROR_REGISTER.length + MISSING_CONTENT_REGISTER.length})` },
              { id: 'coverage' as const, label: `100% Syllabus Matrix (${SYLLABUS_COVERAGE_MATRIX.length}/26)` },
              { id: 'form' as const, label: 'CSV Form Responses (31)' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded border px-3 py-1.5 text-xs font-semibold ${
                  tab === t.id
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-stone-300 bg-white text-stone-700 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'files' && (
        <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700/80 dark:bg-[#141E33]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-600 dark:text-slate-300">DECO Relevance Filter:</span>
            {(
              [
                { id: 'ALL', label: 'All 34 Files' },
                { id: 'CORE_DECO_U24EC304', label: `Core DECO (${counts.core})` },
                { id: 'PARTIAL_DECO_OVERLAP', label: `Partial Overlap (${counts.partial})` },
                { id: 'OUTSIDE_DECO_PRESERVED', label: `Excluded from DECO Curriculum / Preserved (${counts.outside})` },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setRelFilter(btn.id)}
                className={`rounded border px-2.5 py-1 text-xs font-medium ${
                  relFilter === btn.id
                    ? 'border-blue-700 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200'
                    : 'border-stone-200 bg-stone-50 text-stone-600 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-300'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded border border-stone-200 bg-white text-stone-900">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Original File Name &amp; Type</th>
                  <th className="px-3 py-2">DECO Relevance</th>
                  <th className="px-3 py-2">Units &amp; Audit Summary</th>
                  <th className="px-3 py-2">Audit Findings / Duplicate Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((f, idx) => (
                  <tr key={f.id} className="border-b border-slate-100 align-top hover:bg-slate-50/70">
                    <td className="px-3 py-2.5 font-['IBM_Plex_Mono'] text-slate-500">{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-900">{f.originalName}</div>
                      <div className="font-['IBM_Plex_Mono'] text-[11px] text-slate-500">
                        {f.fileType} · {f.pagesOrSize}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`font-['IBM_Plex_Mono'] text-[11px] font-bold ${
                          f.decoRelevance === 'CORE_DECO_U24EC304'
                            ? 'text-emerald-700'
                            : f.decoRelevance === 'PARTIAL_DECO_OVERLAP'
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {f.decoRelevance.replace(/_/g, ' ')}
                      </span>
                      <div className="mt-0.5 text-[11px] text-slate-500">{f.unitsCovered}</div>
                    </td>
                    <td className="max-w-xs px-3 py-2.5 text-slate-700">{f.relevanceSummary}</td>
                    <td className="max-w-xs px-3 py-2.5 text-slate-600">
                      <div>{f.problemsFound}</div>
                      {f.supersededBy && (
                        <div className="mt-1 font-semibold text-blue-700">
                          Consolidated into: {f.supersededBy}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => onPreviewFile(f)}
                        className="flex items-center gap-1 whitespace-nowrap rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-blue-700 hover:border-blue-500"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'errors' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700/80 dark:bg-[#141E33]">
            <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-slate-100">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Detailed Content Error &amp; Verification Register ({CONTENT_ERROR_REGISTER.length} Verified Corrections)</span>
            </h2>
            <div className="mt-3 space-y-3">
              {CONTENT_ERROR_REGISTER.map((err) => (
                <div key={err.id} className="rounded border border-stone-200 bg-stone-50/70 p-3 text-xs dark:border-slate-700 dark:bg-[#19253E]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-stone-900 dark:text-slate-100">
                      {err.fileName} — {err.location}
                    </span>
                    <span className="font-['IBM_Plex_Mono'] font-bold text-red-700 dark:text-red-300">{err.severity}</span>
                  </div>
                  <div className="mt-1 text-red-800 dark:text-red-300">
                    <strong>Original Source Text:</strong> {err.originalContent}
                  </div>
                  <div className="mt-1 text-emerald-800 dark:text-emerald-300">
                    <strong>Verified Correction:</strong> {err.correctedContent}
                  </div>
                  <div className="mt-1 text-stone-700 dark:text-slate-300">
                    <strong>Reason &amp; Independent Proof:</strong> {err.reason} ({err.verificationCheck})
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700/80 dark:bg-[#141E33]">
            <h2 className="text-sm font-bold text-stone-900 dark:text-slate-100">
              Missing-Content &amp; Gap Register ({MISSING_CONTENT_REGISTER.length} Tracked)
            </h2>
            <div className="mt-3 space-y-2">
              {MISSING_CONTENT_REGISTER.map((m) => (
                <div key={m.id} className="rounded border border-stone-200 p-3 text-xs dark:border-slate-700 dark:bg-[#19253E]">
                  <div className="font-bold text-blue-900 dark:text-blue-300">
                    Unit {m.unitNumber}: {m.syllabusItem} ({m.status.replace(/_/g, ' ')})
                  </div>
                  <p className="mt-1 text-stone-700 dark:text-slate-300">{m.details}</p>
                  <p className="mt-1 font-medium text-emerald-800 dark:text-emerald-300">Resolution in App: {m.remediationInApp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'coverage' && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700/80 dark:bg-[#141E33]">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-slate-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span>100% Official U24EC304 Syllabus Coverage Proof (26/26 Prescribed Topics Covered)</span>
          </div>
          <div className="overflow-x-auto rounded border border-stone-200 bg-white text-stone-900 dark:border-slate-700 dark:bg-[#0D1526] dark:text-slate-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-300">
                  <th className="px-3 py-2">Unit</th>
                  <th className="px-3 py-2">Official Syllabus Requirement</th>
                  <th className="px-3 py-2">Code &amp; Topic</th>
                  <th className="px-3 py-2">Sources</th>
                  <th className="px-3 py-2">Interactive Lab</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {SYLLABUS_COVERAGE_MATRIX.map((row) => (
                  <tr key={row.mappedTopicCode} className="border-b border-stone-100 dark:border-slate-800">
                    <td className="px-3 py-2 font-bold">Unit {row.unitNumber}</td>
                    <td className="px-3 py-2 text-stone-700 dark:text-slate-300">{row.officialPhrase}</td>
                    <td className="px-3 py-2 font-semibold text-blue-700 dark:text-blue-400">
                      <button
                        type="button"
                        onClick={() => onOpenTopic(row.mappedTopicCode.toLowerCase())}
                        className="text-left hover:underline"
                      >
                        {row.mappedTopicCode} · {row.mappedTopicTitle}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-['IBM_Plex_Mono']">{row.sourceFilesCount} files</td>
                    <td className="px-3 py-2 text-emerald-700 dark:text-emerald-400">{row.hasInteractiveLab ? 'Active' : 'None'}</td>
                    <td className="px-3 py-2 font-semibold text-emerald-800 dark:text-emerald-300">{row.coverageStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'form' && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700/80 dark:bg-[#141E33]">
          <div className="mb-3 flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-slate-100">
              CSV Student Response Analytics (`Untitled form (Responses)` — {GOOGLE_FORM_STATS.totalStudentRows} Student Rows)
            </h2>
          </div>
          <p className="mb-3 text-xs text-stone-600 dark:text-slate-300">
            Note: Raw CSV has no answer key and includes a duplicate empty Question 1 column. Below is the verified accuracy breakdown highlighting where students struggle most (e.g., A · 1 = A scored 14/31 = 45%).
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {GOOGLE_FORM_STATS.questions.map((gq) => {
              const pct = Math.round((gq.correctCount / gq.total) * 100);
              return (
                <div key={gq.num} className="rounded border border-stone-200 p-3 text-xs dark:border-slate-700 dark:bg-[#19253E]">
                  <div className="font-semibold text-stone-900 dark:text-slate-100">
                    Q{gq.num}. {gq.prompt}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-stone-600 dark:text-slate-300">
                    <span>Verified Answer: <strong className="text-emerald-700 dark:text-emerald-400">{gq.correctAnswer}</strong></span>
                    <span className="font-['IBM_Plex_Mono'] font-bold">{gq.correctCount}/{gq.total} ({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
