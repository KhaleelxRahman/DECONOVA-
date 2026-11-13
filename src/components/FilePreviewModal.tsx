import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText, X } from 'lucide-react';
import { OriginalFileRecord } from '../types/academic';

interface FilePreviewModalProps {
  file: OriginalFileRecord | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const [csvText, setCsvText] = useState<string>('');
  const [loadingCsv, setLoadingCsv] = useState(false);

  useEffect(() => {
    if (!file || file.fileType !== 'CSV') {
      setCsvText('');
      return;
    }
    setLoadingCsv(true);
    fetch(file.publicUrl)
      .then((res) => res.text())
      .then((text) => setCsvText(text))
      .catch(() => setCsvText('Unable to preview CSV text locally.'))
      .finally(() => setLoadingCsv(false));
  }, [file]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-stone-200 bg-white text-stone-900 shadow-2xl dark:border-slate-700 dark:bg-[#141E33] dark:text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-5 py-3 dark:border-slate-700 dark:bg-[#0D1526]">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-blue-700 dark:text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-slate-100">{file.originalName}</h2>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                {file.fileType} · {file.pagesOrSize} · {file.unitsCovered}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={file.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open Raw File</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close file preview"
              className="rounded p-1.5 text-stone-500 hover:bg-stone-200 hover:text-stone-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="border-b border-stone-200 bg-white px-5 py-2.5 text-xs text-stone-700 dark:border-slate-700 dark:bg-[#141E33] dark:text-slate-300">
          <span className="font-semibold text-stone-900 dark:text-slate-100">Audit Finding: </span>
          {file.problemsFound}
        </div>

        <div className="flex-1 overflow-auto bg-stone-100 p-4 dark:bg-[#0B1220]">
          {file.fileType === 'JPG' && (
            <div className="flex h-full items-center justify-center">
              <img
                src={file.publicUrl}
                alt={file.originalName}
                className="max-h-full max-w-full rounded border border-stone-200 bg-white object-contain shadow dark:border-slate-700"
              />
            </div>
          )}

          {file.fileType === 'CSV' && (
            <div className="rounded border border-stone-200 bg-white p-4 dark:border-slate-700 dark:bg-[#141E33]">
              {loadingCsv ? (
                <p className="text-sm text-stone-500 dark:text-slate-400">Loading CSV student response table...</p>
              ) : (
                <pre className="overflow-x-auto font-['IBM_Plex_Mono'] text-xs leading-relaxed text-stone-800 dark:text-slate-200">
                  {csvText}
                </pre>
              )}
            </div>
          )}

          {file.fileType === 'PDF' && (
            <iframe
              src={file.publicUrl}
              title={file.originalName}
              className="h-full w-full rounded border border-stone-200 bg-white dark:border-slate-700"
            />
          )}
        </div>
      </div>
    </div>
  );
};
