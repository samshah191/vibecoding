import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Undo2,
  Redo2,
  History,
  RefreshCcw,
  Monitor,
  Tablet,
  Smartphone,
  Share2,
  Rocket,
  MessageCircle,
  Send,
  Sparkles,
  CheckCircle2,
  Download,
  Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  App,
  ConversationMessage,
  GeneratedProjectSummary,
  ConversationalGenerationRequest,
} from '../types';
import { aiAPI } from '../services/api';

interface AppBuilderProps {
  onAppGenerated: (app: App) => void;
  onClose?: () => void;
}

const INITIAL_ASSISTANT_MESSAGE: ConversationMessage = {
  role: 'assistant',
  content:
    'Tell me what you want to build. I will assemble a linked frontend and backend project for you – no scaffolding required.',
  timestamp: new Date().toISOString(),
};

const FALLBACK_TASKS = [
  'Generate responsive layout',
  'Wire client to backend endpoints',
  'Prepare run scripts and environment files',
];

const FALLBACK_FEATURES = [
  'Hero section with conversion CTA',
  'Dynamic feature highlights',
  'Backend-powered idea capture form',
];

const AppBuilder: React.FC<AppBuilderProps> = ({ onAppGenerated, onClose }) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [chatInput, setChatInput] = useState('');
  const [projectSummary, setProjectSummary] = useState<GeneratedProjectSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetPlatform] = useState<'web' | 'mobile'>('web');

  const checklist = useMemo(() => projectSummary?.features ?? FALLBACK_TASKS, [projectSummary]);
  const previewFeatures = useMemo(() => projectSummary?.features ?? FALLBACK_FEATURES, [projectSummary]);

  const workspaceTitle = projectSummary?.name || 'Anis AI';
  const workspaceSubtitle = projectSummary?.description ||
    'Generate viral-ready clips in seconds';

  const handleGenerate = async () => {
    const idea = chatInput.trim();
    if (!idea) {
      setError('Describe your app idea before generating the project.');
      return;
    }

    const userMessage: ConversationMessage = {
      role: 'user',
      content: idea,
      timestamp: new Date().toISOString(),
    };

    const conversationPayload: ConversationMessage[] = [...messages, userMessage];

    setMessages(conversationPayload);
    setIsGenerating(true);
    setError(null);

    const payload: ConversationalGenerationRequest = {
      description: idea,
      platform: targetPlatform,
      backend: targetPlatform === 'mobile' ? 'fastapi' : 'node',
      conversation: conversationPayload,
    };

    try {
      const response = await aiAPI.generateConversationalApp(payload);

      if (!response.success) {
        const failureMessage = response.error || 'Failed to generate project.';
        setError(failureMessage);
        toast.error(failureMessage);
        return;
      }

      if (response.conversation) {
        setMessages(response.conversation);
      }

      if (response.project) {
        setProjectSummary(response.project);
      }

      if (response.app) {
        onAppGenerated(response.app as App);
      }

      setChatInput('');
      toast.success(response.message || 'Full-stack project generated.');
    } catch (err: any) {
      const failureMessage = err?.response?.data?.message || err?.message || 'Failed to generate project.';
      setError(failureMessage);
      toast.error(failureMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadUrl = projectSummary?.downloadUrl;
  const clientCommand = projectSummary?.commands.client;
  const serverCommand = projectSummary?.commands.server;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold">
            AI
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-slate-900">{workspaceTitle}</h1>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xs text-slate-500">Workspace · {projectSummary ? 'just now' : 'prepped for generation'}</p>
          </div>

          <div className="flex items-center space-x-2 border-l border-slate-200 pl-4 ml-4 text-slate-500">
            <button className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center" aria-label="Undo">
              <Undo2 className="w-4 h-4" />
            </button>
            <button className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center" aria-label="Redo">
              <Redo2 className="w-4 h-4" />
            </button>
            <button className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center" aria-label="Version history">
              <History className="w-4 h-4" />
            </button>
            <button className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center" aria-label="Refresh preview">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 rounded-full p-1">
            <button className="px-3 py-1.5 text-sm font-medium rounded-full text-slate-600 hover:text-slate-900">
              Dashboard
            </button>
            <button className="px-3 py-1.5 text-sm font-medium rounded-full bg-white text-slate-900 shadow">
              Preview
            </button>
          </div>

          <div className="flex items-center bg-slate-100 rounded-full p-1">
            <button className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900" aria-label="Desktop view">
              <Monitor className="w-4 h-4" />
            </button>
            <button className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900" aria-label="Tablet view">
              <Tablet className="w-4 h-4" />
            </button>
            <button className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900" aria-label="Mobile view">
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button className="btn-secondary flex items-center">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button className="btn-primary flex items-center">
            <Rocket className="w-4 h-4 mr-2" />
            Publish
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-96 bg-white border-r border-slate-200 flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map((entry, index) => {
              const isAssistant = entry.role === 'assistant';
              const showArtifacts =
                isAssistant && projectSummary && index === messages.length - 1;

              return (
                <div key={`${entry.role}-${index}-${entry.timestamp}`} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={
                        isAssistant
                          ? 'h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold'
                          : 'h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold'
                      }
                    >
                      {isAssistant ? 'B' : 'You'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {isAssistant ? 'Base Builder' : 'You'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'moments ago'}
                      </div>
                    </div>
                  </div>

                  <div className={`border rounded-2xl p-4 shadow-sm ${isAssistant ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  </div>

                  {showArtifacts && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-900">Project assets prepared</div>
                          <p className="text-xs text-slate-500">Frontend and backend are linked and ready to run locally.</p>
                        </div>
                        {downloadUrl && (
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download zip
                          </a>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="text-xs font-semibold uppercase text-slate-500">Next steps</div>
                        <div className="space-y-2">
                          {checklist.map((task, i) => (
                            <div key={task + i} className="flex items-start space-x-3">
                              <div className="mt-0.5 text-green-500">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div className="text-sm text-slate-700">{task}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(clientCommand || serverCommand) && (
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs text-slate-600">
                          <div className="flex items-center text-slate-500 font-medium">
                            <Terminal className="w-3 h-3 mr-2" />
                            Run locally
                          </div>
                          {clientCommand && (
                            <pre className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-700 overflow-x-auto">{clientCommand}</pre>
                          )}
                          {serverCommand && (
                            <pre className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-700 overflow-x-auto">{serverCommand}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 px-6 py-5 space-y-4">
            <div className="flex items-center space-x-4 text-slate-500">
              <button className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100" aria-label="Open chat">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300">
                Visual Edit
              </button>
              <button className="px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300">
                Discuss
              </button>
            </div>
            <div className="bg-slate-100 rounded-2xl px-4 py-3">
              <label className="text-xs text-slate-500 block mb-1">Describe your application</label>
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                rows={3}
                className="w-full bg-transparent text-sm text-slate-800 resize-none focus:outline-none"
                placeholder="E.g. A productivity hub for remote teams with task tracking and daily standups"
              />
            </div>
            {error && <div className="text-xs text-red-500">{error}</div>}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Sparkles className="w-4 h-4" />
                <span>Powered by your OpenAI credits</span>
              </div>
              <button
                className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center disabled:opacity-60"
                onClick={handleGenerate}
                disabled={isGenerating}
                aria-label="Send description"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full btn-primary justify-center disabled:opacity-60"
            >
              {isGenerating ? 'Generating project…' : 'Run App Generation'}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto px-16 py-12">
            <div className="mb-8 space-y-3">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>{projectSummary ? 'AI generated project assets' : '3.2M+ users worldwide'}</span>
              </div>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                {workspaceSubtitle}
              </h2>
              <p className="text-lg text-slate-600">
                {projectSummary
                  ? 'The frontend is preconfigured to call the generated backend. Clone the repo, run both services, and continue iterating in this workspace.'
                  : 'Your all-in-one tool for creating AI voiceovers, engaging subtitles, optimized gameplay, and more.'}
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <button className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700">
                  Start Editing Today
                </button>
                <button className="px-6 py-3 rounded-full border border-slate-200 font-semibold text-slate-700 hover:border-slate-300">
                  {projectSummary ? 'Open README' : 'Try Anis AI Now'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previewFeatures.map((feature, index) => (
                <div key={feature + index} className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900 mb-2">Feature #{index + 1}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>

            {projectSummary && (
              <div className="mt-12 grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Frontend stack</h3>
                  <p className="text-sm text-slate-600 mb-2">{projectSummary.platform === 'mobile' ? 'React Native + Expo' : 'React + Vite + Tailwind CSS'}</p>
                  <p className="text-xs text-slate-500 break-all">Directory: {projectSummary.clientPath}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Backend stack</h3>
                  <p className="text-sm text-slate-600 mb-2">{projectSummary.backend === 'fastapi' ? 'FastAPI (Python)' : 'Express (Node.js)'}</p>
                  <p className="text-xs text-slate-500 break-all">Directory: {projectSummary.serverPath}</p>
                </div>
              </div>
            )}

            <div className="mt-12 rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">What makes this build different?</h3>
              <ul className="space-y-3 text-sm text-slate-600 leading-relaxed list-disc list-inside">
                <li>Production-ready folder structure linking client and server out of the box.</li>
                <li>Environment templates with sensible defaults so you can boot instantly.</li>
                <li>Readable commands for both stacks, making local testing one command away.</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppBuilder;
