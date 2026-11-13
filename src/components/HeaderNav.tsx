import React from 'react';
import { FileCheck2, FlaskConical, GraduationCap, LayoutDashboard, Search, ShieldCheck } from 'lucide-react';

export type AppView = 'home' | 'questions' | 'labs' | 'ai-teacher' | 'audit';

interface HeaderNavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSearch: () => void;
  reviewedCount: number;
  totalTopics: number;
}

const NAV_ITEMS: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'questions', label: 'Question Bank', icon: FileCheck2 },
  { id: 'labs', label: 'Interactive Labs', icon: FlaskConical },
  { id: 'ai-teacher', label: 'AI Teacher', icon: GraduationCap },
  { id: 'audit', label: '34-File Audit', icon: ShieldCheck },
];

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeView,
  onNavigate,
  onOpenSearch,
  reviewedCount,
  totalTopics,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#FAF8F4]/95 backdrop-blur print:hidden dark:border-slate-800 dark:bg-[#0D1526]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Zone 1: Brand Identity */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex shrink-0 items-center gap-2 rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded bg-blue-700 font-['IBM_Plex_Mono'] text-sm font-bold text-white">
            DE
          </span>
          <span className="whitespace-nowrap font-['Fraunces'] text-base font-bold tracking-tight text-stone-900 dark:text-slate-100">
            Sir&apos;s Classroom · DECO
          </span>
        </button>

        {/* Zone 2: Single-line Primary Navigation */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-2.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 underline decoration-blue-600 underline-offset-4 dark:bg-blue-950/70 dark:text-blue-200'
                    : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="hidden whitespace-nowrap font-['IBM_Plex_Mono'] text-xs text-stone-500 xl:inline dark:text-slate-400">
            {reviewedCount}/{totalTopics} reviewed
          </span>
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Search className="h-4 w-4" />
            <span>Search DECO</span>
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <div className="flex items-center gap-1 overflow-x-auto border-t border-stone-200/80 px-4 py-1.5 lg:hidden dark:border-slate-800">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`shrink-0 whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-stone-600 hover:bg-stone-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
