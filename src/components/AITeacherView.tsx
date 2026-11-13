import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ALL_DECO_TOPICS } from '../data/knowledgeBase';
import { TopicNode } from '../types/academic';

interface AITeacherViewProps {
  initialTopic?: TopicNode;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const AITeacherView: React.FC<AITeacherViewProps> = ({ initialTopic }) => {
  const [focusTopicId, setFocusTopicId] = useState(initialTopic?.id || ALL_DECO_TOPICS[0].id);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Welcome to Sir's Classroom! Pick any DECO topic above and ask me to explain a concept from absolute zero, trace a calculation step by step, or clarify why a slide had a mistake.",
    },
  ]);

  const activeTopic = ALL_DECO_TOPICS.find((t) => t.id === focusTopicId) || ALL_DECO_TOPICS[0];

  const sendQuestion = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    const nextHistory = [...messages, { role: 'user' as const, text: trimmed }];
    setMessages(nextHistory);
    setInput('');
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          topicContext: {
            code: activeTopic.code,
            title: activeTopic.title,
            unitNumber: activeTopic.unitNumber,
            officialSyllabusPhrase: activeTopic.officialSyllabusPhrase,
            sourceCitations: activeTopic.sourceFiles.map((s) => s.citation),
            workedSummary: activeTopic.workedExample.finalAnswer,
          },
          history: nextHistory.slice(-6),
        }),
      });

      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok) {
        setErrorMsg(
          data.error ||
            'AI Teacher could not connect right now. Use the deterministic Interactive Labs and Topic-Wise Question Bank anytime.'
        );
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.answer || 'No explanation returned.' },
        ]);
      }
    } catch {
      setErrorMsg('Network error contacting /api/ai-teacher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-700/80 dark:bg-[#141E33]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-['Fraunces'] text-lg font-bold text-stone-900 dark:text-slate-50">
              <Sparkles className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              <span>Sir&apos;s Classroom AI Teacher (DECO U24EC304 Grounded)</span>
            </h1>
            <p className="text-xs text-stone-500 dark:text-slate-400">
              Uses server-side Gemini integration grounded in Syllabus_DECO.pdf Units I–V. Deterministic labs always verify math.
            </p>
          </div>
          <select
            value={focusTopicId}
            onChange={(e) => setFocusTopicId(e.target.value)}
            className="rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 dark:border-slate-600 dark:bg-[#19253E] dark:text-slate-100"
          >
            {ALL_DECO_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                Unit {t.unitNumber} · {t.code}: {t.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            'Explain this topic from zero using a simple daily-life analogy.',
            'Walk through an exam-level numerical step by step and verify it two ways.',
            'What is the most common mistake students make here?',
            'Is 8086 architecture part of DECO U24EC304?',
          ].map((starter) => (
            <button
              key={starter}
              type="button"
              onClick={() => sendQuestion(starter)}
              className="rounded border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-200"
            >
              {starter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-[54vh] flex-col overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-slate-700/80 dark:bg-[#141E33]">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'ml-auto bg-blue-700 text-white'
                  : 'border border-stone-200 bg-stone-50 text-stone-800 dark:border-slate-700 dark:bg-[#19253E] dark:text-slate-200'
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && <div className="text-xs text-stone-500 dark:text-slate-400">Professor is writing an explanation...</div>}
          {errorMsg && (
            <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200">
              {errorMsg}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion(input);
          }}
          className="flex gap-2 border-t border-stone-200 bg-stone-50 p-3 dark:border-slate-700 dark:bg-[#19253E]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${activeTopic.title}...`}
            className="flex-1 rounded border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:bg-[#141E33] dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center gap-1.5 rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
