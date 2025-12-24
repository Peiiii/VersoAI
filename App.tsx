
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { AppView, ResearchBrief, EvidenceItem, PageInfo } from './types';
import { generateResearchBrief } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [notebook, setNotebook] = useState<EvidenceItem[]>([]);
  const [selection, setSelection] = useState('');
  
  const sdk = window.gemigo;

  useEffect(() => {
    if (!sdk) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 先尝试获取基础页面信息，减少首屏空白
        const info = await sdk.extension.getPageInfo();
        if (info) setPageInfo(info);

        const saved = await sdk.storage.get<EvidenceItem[]>('research_notebook');
        if (saved) setNotebook(saved);

        const text = await sdk.extension.getPageText();
        if (text && text.length > 50) {
          const res = await generateResearchBrief(text);
          setBrief(res);
        }
      } catch (e) {
        console.error("Verso 加载失败", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const cleanup = sdk.extension.onSelectionChange((text) => {
      setSelection(text);
    });

    return () => cleanup();
  }, []);

  const saveToNotebook = async (content: string, type: 'quote' | 'insight' = 'quote') => {
    if (!sdk || !pageInfo) return;
    
    const newItem: EvidenceItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sourceUrl: pageInfo.url,
      sourceTitle: pageInfo.title,
      content,
      type
    };

    const updated = [newItem, ...notebook];
    setNotebook(updated);
    await sdk.storage.set('research_notebook', updated);
    sdk.notify({ title: "Verso 已保存", message: "内容已成功添加至研究笔记。" });
  };

  const deleteFromNotebook = async (id: string) => {
    const updated = notebook.filter(item => item.id !== id);
    setNotebook(updated);
    await sdk.storage.set('research_notebook', updated);
  };

  if (!sdk) return (
    <div className="p-10 text-center flex flex-col items-center justify-center h-screen bg-slate-50">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 mb-2">未检测到 Verso 环境</h2>
        <p className="text-sm text-slate-500">请在 GemiGo 浏览器扩展侧边栏中运行此应用。</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <Header currentView={view} onNavigate={setView} />
      
      <main className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
        {view === AppView.DASHBOARD && (
          <>
            {/* 页面元数据卡片 - 增加骨架屏支持 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              {pageInfo?.url ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-inner">
                      {pageInfo.favIconUrl ? (
                        <img src={pageInfo.favIconUrl} className="w-6 h-6" alt="" />
                      ) : (
                        pageInfo.title?.charAt(0) || 'V'
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h2 className="font-bold text-slate-800 truncate text-sm">{pageInfo.title || 'Verso 正在识别...'}</h2>
                      <p className="text-[10px] text-slate-400 truncate">{pageInfo.url}</p>
                    </div>
                  </div>

                  {brief && (
                    <div className="flex gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase">
                        {brief.metrics.complexity}
                      </span>
                      <span className="px-2 py-0.5 bg-green-50 text-[10px] font-bold text-green-600 rounded uppercase">
                        约 {brief.metrics.readingTime} 分钟阅读
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-600 rounded uppercase">
                        氛围: {brief.metrics.sentiment}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="animate-pulse flex gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Verso AI 研究摘要 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-indigo-900" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                Verso 研究简报
              </h3>
              
              {loading && !brief ? (
                <div className="py-10 flex flex-col items-center justify-center space-y-3">
                  <div className="w-6 h-6 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400">正在提炼页面核心洞察...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {brief?.summary || "当前页面内容不足，Verso 无法生成有效摘要。"}
                  </p>
                  {brief?.keyPoints && (
                    <ul className="space-y-2">
                      {brief.keyPoints.map((pt, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-600">
                          <span className="text-indigo-400 mt-1 flex-shrink-0">•</span> {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {brief && (
                    <button 
                      onClick={() => saveToNotebook(brief.summary, 'insight')}
                      className="text-[11px] font-bold text-indigo-900 hover:text-indigo-700 flex items-center gap-1 mt-2 underline decoration-indigo-200 underline-offset-4"
                    >
                      + 捕获此洞察至笔记
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 划词增强工具 */}
            {selection && (
              <div className="bg-indigo-900 p-4 rounded-2xl shadow-lg text-white animate-in slide-in-from-bottom-4">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">研究采样</p>
                <p className="text-sm italic mb-4 line-clamp-3">"{selection}"</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => saveToNotebook(selection)}
                    className="flex-1 py-2 bg-white text-indigo-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    存入研究笔记
                  </button>
                </div>
              </div>
            )}

            {/* 知识地图 (实体提取) */}
            {brief && brief.entities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Verso 实体地图</h3>
                <div className="grid grid-cols-1 gap-2">
                  {brief.entities.map((ent, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3 hover:border-indigo-200 hover:shadow-md transition-all">
                      <div className="bg-slate-50 p-2 rounded-lg text-lg flex-shrink-0">
                        {ent.type.includes('人') ? '👤' : ent.type.includes('组织') || ent.type.includes('公司') ? '🏢' : '📍'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{ent.name}</h4>
                          <span className="text-[9px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded uppercase font-bold">{ent.type}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-tight">{ent.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {view === AppView.NOTEBOOK && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">研究档案</h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                共 {notebook.length} 个存证
              </span>
            </div>

            {notebook.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="text-4xl">📓</div>
                <h3 className="font-bold text-slate-400">尚未建立档案</h3>
                <p className="text-xs text-slate-300 px-10">Verso 的笔记是持久化的，你在此保存的任何研究素材都将在后续访问时保持同步。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notebook.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.type === 'insight' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          {item.type === 'insight' ? 'AI 简报' : '采样引用'}
                        </span>
                        <button 
                          onClick={() => deleteFromNotebook(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed mb-4">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                        <div className="w-4 h-4 bg-indigo-900 rounded flex-shrink-0 flex items-center justify-center">
                           <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{item.sourceTitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Verso 交互栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 border border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner">
          <input 
            type="text" 
            placeholder="询问 Verso 关于此页的深度洞察..." 
            className="flex-1 bg-transparent text-sm py-1 focus:outline-none text-slate-700 placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') sdk.notify({ title: "Verso AI", message: "深度对话功能正在同步至本地..." });
            }}
          />
          <button className="text-indigo-900 hover:scale-110 transition-transform">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
