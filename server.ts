import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

// Server-side Gemini API route for the Sir's Classroom DECO Teacher
app.post('/api/ai-teacher', async (req, res) => {
  const { question, topicContext, history } = req.body as {
    question?: string;
    topicContext?: {
      code?: string;
      title?: string;
      unitNumber?: number;
      officialSyllabusPhrase?: string;
      sourceCitations?: string[];
      workedSummary?: string;
    };
    history?: { role: 'user' | 'assistant'; text: string }[];
  };

  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Please ask a DECO question.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI Teacher cloud key is not active in this preview environment.',
      code: 'NO_API_KEY',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are "Sir's Classroom", a calm, patient Digital Electronics and Computer Organization (DECO, course U24EC304) professor teaching first/second-year engineering students who know nothing about the topic.

STRICT SYLLABUS & ACCURACY RULES:
1. Teach EXCLUSIVELY from the U24EC304 DECO syllabus (Units I–V) and the professor's supplied materials. Never use branch labels (do not say CSM or CSE AIML).
2. Always define any technical term in [brackets] on first use. Use simple English, short sentences, and Indian student analogies (canteen queue, hostel roll numbers, bus seats, UPI, ceiling fan regulator).
3. Never say "obviously" or "simply". Never pad with filler phrases like "it is important to note".
4. Cite exact source files/slides when referencing supplied materials (e.g., Syllabus_DECO.pdf, DECO_U1_Datarep.pdf, DECO_U2_01Aug25.pdf, Deco_Unit3.pdf, Division Algorithm.pdf, DECO_Assignment2_Answers.pdf, DECO_CIE2_QB_Answers.pdf, RISC.pdf, Switching Theory and Logic Design.pdf).
5. If a topic is NOT in U24EC304 (such as 8086 PIN diagram, QBFs/BDDs, Virtual Memory, or AI/ML ECE slides), explicitly mark it as [OUTSIDE DECO U24EC304 SYLLABUS] before answering briefly.
6. Whenever solving a numerical problem, verify the arithmetic by checking a second way and explicitly show the verification step.
7. Admit uncertainty if something is not verified in the supplied notes.

Current topic focus: ${
      topicContext
        ? `${topicContext.code || ''} ${topicContext.title || ''} (Unit ${topicContext.unitNumber || ''}) | Official Syllabus: "${
            topicContext.officialSyllabusPhrase || ''
          }" | Sources: ${(topicContext.sourceCitations || []).join('; ')} | Verified Example: ${topicContext.workedSummary || ''}`
        : 'General DECO (U24EC304 Units I–V)'
    }`;

    const historyText = (history || [])
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Student' : 'Professor'}: ${m.text}`)
      .join('\n\n');

    const prompt = historyText
      ? `Previous conversation:\n${historyText}\n\nStudent's new question:\n${question.trim()}`
      : `Student's question:\n${question.trim()}`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      answer: response.text || 'I could not generate an explanation right now. Please try rephrasing your question.',
      modelUsed: 'gemini-4-hydrogen',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error calling Gemini API.';
    return res.status(500).json({ error: message });
  }
});

async function startServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sir's Classroom DECO server running at http://localhost:${PORT}`);
  });
}

startServer();
