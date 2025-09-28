import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import type * as MonacoEditor from 'monaco-editor';
import {
  FileCode,
  Search,
  Replace,
  Sparkles,
  Sun,
  Moon,
  Save,
  X,
  RefreshCw,
  Loader2,
  MessageCircle,
  Users,
  Hash,
  AtSign,
  Plus,
  Minus
} from 'lucide-react';
import clsx from 'clsx';
import prettier from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';
import htmlPlugin from 'prettier/plugins/html';
import markdownPlugin from 'prettier/plugins/markdown';
import postcssPlugin from 'prettier/plugins/postcss';
import typescriptPlugin from 'prettier/plugins/typescript';
import toast from 'react-hot-toast';
import FileStructure, { FileNode } from './FileStructure';
import PresenceAndComments from './PresenceAndComments';

interface CodeEditorWorkspaceProps {
  files: FileNode[];
  initialFilePath?: string;
  height?: number | string;
  onSaveFile?: (file: { path: string; content: string }) => Promise<void> | void;
}

interface OpenFile {
  path: string;
  name: string;
  language: string;
  content: string;
  originalContent: string;
}

interface InlineComment {
  id: string;
  line: number;
  content: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
}

const supportedLanguages = new Map<string, string>([
  ['ts', 'typescript'],
  ['tsx', 'typescript'],
  ['js', 'javascript'],
  ['jsx', 'javascript'],
  ['json', 'json'],
  ['css', 'css'],
  ['scss', 'scss'],
  ['less', 'less'],
  ['html', 'html'],
  ['htm', 'html'],
  ['md', 'markdown'],
  ['mdx', 'markdown'],
]);

const editorOptions = {
  fontSize: 14,
  minimap: { enabled: true },
  wordWrap: 'on' as const,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  readOnly: false,
  contextmenu: true,
  formatOnPaste: true,
  formatOnType: true,
  suggestOnTriggerCharacters: true,
  inlineSuggest: { enabled: true },
  tabSize: 2,
};

const CodeEditorWorkspace: React.FC<CodeEditorWorkspaceProps> = ({
  files,
  initialFilePath,
  height = '100%',
  onSaveFile,
}) => {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [theme, setTheme] = useState<'vs-dark' | 'vs'>('vs-dark');
  const [isFormatting, setIsFormatting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showComments, setShowComments] = useState(true);
  const [inlineComments, setInlineComments] = useState<InlineComment[]>([
    {
      id: '1',
      line: 10,
      content: 'Consider adding error handling here',
      author: 'Alex Johnson',
      timestamp: new Date(Date.now() - 3600000),
      resolved: false
    },
    {
      id: '2',
      line: 25,
      content: '@Sam Wilson Can you review this logic?',
      author: 'You',
      timestamp: new Date(Date.now() - 7200000),
      resolved: false
    }
  ]);
  const [newInlineComment, setNewInlineComment] = useState<{ line: number; content: string } | null>(null);

  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const completionProvidersRef = useRef<MonacoEditor.IDisposable[]>([]);
  const commentDecorationsRef = useRef<string[]>([]);

  const fileMap = useMemo(() => {
    const map = new Map<string, FileNode>();
    const visit = (nodes: FileNode[]) => {
      nodes.forEach((node) => {
        if (node.type === 'file') {
          map.set(node.path, node);
        }
        if (node.children) {
          visit(node.children);
        }
      });
    };
    visit(files);
    return map;
  }, [files]);

  const resolveLanguage = useCallback((node: FileNode) => {
    if (node.language) {
      return node.language;
    }
    const extension = node.name.split('.').pop()?.toLowerCase() ?? '';
    return supportedLanguages.get(extension) ?? 'plaintext';
  }, []);

  const ensureFileOpen = useCallback(
    (path: string) => {
      const source = fileMap.get(path);
      if (!source || source.type !== 'file') {
        toast.error('Unable to open file.');
        return;
      }

      setOpenFiles((prev) => {
        if (prev.some((file) => file.path === path)) {
          return prev;
        }
        return [
          ...prev,
          {
            path,
            name: source.name,
            language: resolveLanguage(source),
            content: source.content ?? '',
            originalContent: source.content ?? '',
          },
        ];
      });

      setActivePath(path);
    },
    [fileMap, resolveLanguage],
  );

  // Apply comment decorations to the editor
  const applyCommentDecorations = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return;
    
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    
    // Clear existing decorations
    if (commentDecorationsRef.current.length > 0) {
      editor.deltaDecorations(commentDecorationsRef.current, []);
    }
    
    // Create new decorations for comments
    const decorations = inlineComments
      .filter(comment => !comment.resolved)
      .map(comment => ({
        range: new monaco.Range(comment.line, 1, comment.line, 1),
        options: {
          isWholeLine: true,
          className: 'inline-comment-line',
          glyphMarginClassName: 'inline-comment-glyph',
          hoverMessage: {
            value: `**${comment.author}**: ${comment.content}`
          }
        }
      }));
    
    commentDecorationsRef.current = editor.deltaDecorations([], decorations);
  }, [inlineComments]);

  useEffect(() => {
    applyCommentDecorations();
  }, [applyCommentDecorations]);

  useEffect(
    () => () => {
      completionProvidersRef.current.forEach((disposable) => disposable.dispose());
    },
    [],
  );

  useEffect(() => {
    if (initialFilePath && fileMap.has(initialFilePath)) {
      ensureFileOpen(initialFilePath);
      return;
    }

    if (!initialFilePath && !activePath && fileMap.size) {
      const iterator = fileMap.keys();
      const firstPath = iterator.next().value as string | undefined;
      if (firstPath) {
        ensureFileOpen(firstPath);
      }
    }
  }, [activePath, ensureFileOpen, fileMap, initialFilePath]);

  const activeFile = useMemo(
    () => openFiles.find((file) => file.path === activePath) ?? null,
    [activePath, openFiles],
  );

  const handleChange = useCallback(
    (value?: string) => {
      if (!activeFile || value === undefined) {
        return;
      }

      setOpenFiles((prev) =>
        prev.map((file) =>
          file.path === activeFile.path
            ? {
                ...file,
                content: value,
              }
            : file,
        ),
      );
    },
    [activeFile],
  );

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      esModuleInterop: true,
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      allowComments: true,
      validate: true,
    });
    monaco.languages.css.cssDefaults.setDiagnosticsOptions({
      validate: true,
    });

    // Add custom completion providers for mentions
    if (completionProvidersRef.current.length === 0) {
      completionProvidersRef.current.push(
        monaco.languages.registerCompletionItemProvider('typescript', {
          triggerCharacters: ['@'],
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const textUntilPosition = model.getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            });
            
            // Check if we're typing a mention
            if (textUntilPosition.endsWith('@')) {
              const range = new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              );
              
              return {
                suggestions: [
                  {
                    label: 'Alex Johnson',
                    kind: monaco.languages.CompletionItemKind.User,
                    insertText: 'Alex Johnson ',
                    detail: 'Team member',
                    range
                  },
                  {
                    label: 'Sam Wilson',
                    kind: monaco.languages.CompletionItemKind.User,
                    insertText: 'Sam Wilson ',
                    detail: 'Team member',
                    range
                  }
                ]
              };
            }
            
            // Regular snippets
            const range = new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn,
            );
            
            return {
              suggestions: [
                {
                  label: 'useState',
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  insertText: 'const [${1:state}, set${2:State}] = useState(${3:initialValue});',
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'React useState snippet',
                  range,
                },
                {
                  label: 'useEffect',
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  insertText: [
                    'useEffect(() => {',
                    '  ${1:// effect}',
                    '  return () => {',
                    '    ${2:// cleanup}',
                    '  };',
                    '}, [${3:deps}]);',
                  ].join('\n'),
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'React useEffect snippet',
                  range,
                },
              ],
            };
          },
        }),
        monaco.languages.registerCompletionItemProvider('javascript', {
          triggerCharacters: ['@'],
          provideCompletionItems: (model, position) => {
            const textUntilPosition = model.getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            });
            
            // Check if we're typing a mention
            if (textUntilPosition.endsWith('@')) {
              const range = new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              );
              
              return {
                suggestions: [
                  {
                    label: 'Alex Johnson',
                    kind: monaco.languages.CompletionItemKind.User,
                    insertText: 'Alex Johnson ',
                    detail: 'Team member',
                    range
                  },
                  {
                    label: 'Sam Wilson',
                    kind: monaco.languages.CompletionItemKind.User,
                    insertText: 'Sam Wilson ',
                    detail: 'Team member',
                    range
                  }
                ]
              };
            }
            
            const word = model.getWordUntilPosition(position);
            const range = new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn,
            );
            return {
              suggestions: [
                {
                  label: 'log',
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  insertText: "console.log('${1:label}', ${2:value});",
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'console.log helper',
                  range,
                },
              ],
            };
          },
        }),
        monaco.languages.registerCompletionItemProvider('json', {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn,
            );
            return {
              suggestions: [
                {
                  label: 'jsonPair',
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  insertText: '"${1:key}": "${2:value}"',
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: 'JSON key/value pair',
                  range,
                },
              ],
            };
          },
        }),
      );
    }

    editor.onDidChangeCursorPosition((event) => {
      setCursorPosition({
        line: event.position.lineNumber,
        column: event.position.column,
      });
    });
    
    // Add context menu action for adding inline comments
    editor.addAction({
      id: 'add-inline-comment',
      label: 'Add Inline Comment',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: (ed) => {
        const position = ed.getPosition();
        if (position) {
          setNewInlineComment({
            line: position.lineNumber,
            content: ''
          });
        }
      }
    });
  }, []);

  const closeFile = useCallback((path: string) => {
    setOpenFiles((prev) => {
      const next = prev.filter((file) => file.path !== path);
      setActivePath((current) => {
        if (current !== path) {
          return current;
        }
        return next.length ? next[next.length - 1].path : null;
      });
      return next;
    });
  }, []);

  const getPrettierParser = useCallback((file?: OpenFile) => {
    if (!file) return null;
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'babel';
      case 'json':
        return 'json';
      case 'css':
      case 'scss':
      case 'less':
        return extension;
      case 'html':
      case 'htm':
        return 'html';
      case 'md':
      case 'mdx':
        return 'markdown';
      default:
        return null;
    }
  }, []);

  const formatActiveFile = useCallback(async () => {
    if (!activeFile) {
      toast.error('Select a file to format.');
      return;
    }

    const parser = getPrettierParser(activeFile);
    if (!parser) {
      toast.error(`Prettier formatter is not configured for ${activeFile.name}.`);
      return;
    }

    try {
      setIsFormatting(true);
      const formatted = await prettier.format(activeFile.content, {
        parser,
        plugins: [babelPlugin, estreePlugin, typescriptPlugin, htmlPlugin, markdownPlugin, postcssPlugin],
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
        printWidth: 100,
        semi: true,
      });

      setOpenFiles((prev) =>
        prev.map((file) =>
          file.path === activeFile.path
            ? {
                ...file,
                content: formatted,
              }
            : file,
        ),
      );
      toast.success('Code formatted with Prettier.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to format file.');
    } finally {
      setIsFormatting(false);
    }
  }, [activeFile, getPrettierParser]);

  const handleSave = useCallback(async () => {
    if (!activeFile) {
      toast.error('No active file to save.');
      return;
    }

    try {
      setIsSaving(true);
      await onSaveFile?.({ path: activeFile.path, content: activeFile.content });
      setOpenFiles((prev) =>
        prev.map((file) =>
          file.path === activeFile.path
            ? {
                ...file,
                originalContent: file.content,
              }
            : file,
        ),
      );
      toast.success('File saved.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save file.');
    } finally {
      setIsSaving(false);
    }
  }, [activeFile, onSaveFile]);

  const openSearch = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.getAction('actions.find')?.run();
  }, []);

  const openReplace = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.getAction('editor.action.startFindReplaceAction')?.run();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'vs-dark' ? 'vs' : 'vs-dark'));
  }, []);

  const addInlineComment = useCallback(() => {
    if (!newInlineComment || !newInlineComment.content.trim()) return;
    
    const comment: InlineComment = {
      id: `ic${Date.now()}`,
      line: newInlineComment.line,
      content: newInlineComment.content,
      author: 'You',
      timestamp: new Date(),
      resolved: false
    };
    
    setInlineComments(prev => [...prev, comment]);
    setNewInlineComment(null);
    applyCommentDecorations();
  }, [newInlineComment, applyCommentDecorations]);

  const toggleCommentResolved = useCallback((id: string) => {
    setInlineComments(prev => 
      prev.map(comment => 
        comment.id === id 
          ? { ...comment, resolved: !comment.resolved } 
          : comment
      )
    );
  }, []);

  useEffect(() => {
    if (!activeFile || !editorRef.current) return;
    editorRef.current.focus();
  }, [activeFile]);

  const unsavedFiles = openFiles.filter((file) => file.content !== file.originalContent);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
      <div className="flex w-64 flex-col border-r border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileCode className="h-4 w-4 text-blue-500" />
            Workspace
          </div>
          <div className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
            {openFiles.length} open
          </div>
        </div>
        <div className="flex-1 overflow-auto px-2 pb-2">
          <FileStructure
            files={files}
            onFileSelect={(node) => ensureFileOpen(node.path)}
            selectedFile={activePath ?? undefined}
            expandAll
            showLastModified={false}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col" style={{ height }}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-2">
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {openFiles.length === 0 && (
              <div className="text-xs text-slate-500">Select a file from the explorer to start editing.</div>
            )}
            <div className="flex items-center gap-1 overflow-auto">
              {openFiles.map((file) => {
                const isActive = file.path === activePath;
                const isDirty = file.content !== file.originalContent;
                return (
                  <button
                    key={file.path}
                    onClick={() => setActivePath(file.path)}
                    className={clsx(
                      'group flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100',
                    )}
                  >
                    <span className="max-w-[140px] truncate">{file.name}</span>
                    {isDirty && <span className="text-orange-500">*</span>}
                    <span
                      className="rounded p-0.5 text-slate-400 transition-colors group-hover:text-slate-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        closeFile(file.path);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            {unsavedFiles.length > 0 && (
              <div className="hidden items-center gap-1 text-xs font-medium text-orange-500 sm:flex">
                <RefreshCw className="h-3 w-3 animate-spin" />
                {unsavedFiles.length} unsaved
              </div>
            )}
            <button
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium hover:border-slate-200 hover:bg-slate-100"
              onClick={openSearch}
              disabled={!activeFile}
              title="Find in files"
            >
              <Search className="h-3 w-3" />
              Find
            </button>
            <button
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium hover:border-slate-200 hover:bg-slate-100"
              onClick={openReplace}
              disabled={!activeFile}
              title="Replace in files"
            >
              <Replace className="h-3 w-3" />
              Replace
            </button>
            <button
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium hover:border-slate-200 hover:bg-slate-100"
              onClick={formatActiveFile}
              disabled={!activeFile || isFormatting}
              title="Format code"
            >
              {isFormatting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Format
            </button>
            <button
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium hover:border-slate-200 hover:bg-slate-100"
              onClick={handleSave}
              disabled={!activeFile || isSaving}
              title="Save file"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save
            </button>
            <button
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium hover:border-slate-200 hover:bg-slate-100"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {theme === 'vs-dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              {theme === 'vs-dark' ? 'Light' : 'Dark'}
            </button>
            <button
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium hover:border-slate-200 hover:bg-slate-100"
              onClick={() => setShowComments(!showComments)}
              title="Toggle comments"
            >
              <MessageCircle className="h-3 w-3" />
              Comments
            </button>
          </div>
        </div>

        <div className="flex flex-1">
          <div className="flex-1 bg-[#1e1e1e] relative">
            {activeFile ? (
              <>
                <Editor
                  height={height}
                  theme={theme}
                  path={activeFile.path}
                  language={activeFile.language}
                  value={activeFile.content}
                  onChange={handleChange}
                  onMount={handleMount}
                  options={{
                    ...editorOptions,
                    glyphMargin: true
                  }}
                />
                
                {/* Inline Comment Form */}
                {newInlineComment && (
                  <div 
                    className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-80 z-10"
                    style={{
                      top: `${(newInlineComment.line * 20) - 10}px`,
                      right: showComments ? '320px' : '20px'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Add Comment</h4>
                      <button 
                        onClick={() => setNewInlineComment(null)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={newInlineComment.content}
                      onChange={(e) => setNewInlineComment(prev => 
                        prev ? {...prev, content: e.target.value} : null
                      )}
                      placeholder="Type your comment here..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none mb-2"
                      rows={3}
                    />
                    <div className="flex justify-between">
                      <button 
                        onClick={() => setNewInlineComment(null)}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addInlineComment}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-50">
                <div className="rounded-lg border border-dashed border-slate-300 bg-white px-10 py-12 text-center text-slate-500">
                  <p className="text-sm font-medium">No file selected</p>
                  <p className="mt-2 text-xs text-slate-400">Pick a file from the explorer to open it in the editor.</p>
                </div>
              </div>
            )}
          </div>
          
          {showComments && (
            <div className="w-80">
              <PresenceAndComments />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>{activeFile ? activeFile.path : 'Ready'}</span>
            {activeFile && (
              <span className="hidden items-center gap-1 sm:flex">
                Language: <strong className="font-semibold text-slate-700">{activeFile.language}</strong>
              </span>
            )}
          </div>
          <div>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </div>
        </div>
      </div>
      
      {/* Inline Comments Panel */}
      {showComments && inlineComments.filter(c => !c.resolved).length > 0 && (
        <div className="absolute bottom-4 right-80 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Inline Comments</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {inlineComments.filter(c => !c.resolved).map(comment => (
              <div key={comment.id} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium mr-2">
                    {comment.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">Line {comment.line}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={() => toggleCommentResolved(comment.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditorWorkspace;