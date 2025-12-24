
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <div className="w-9 h-9 bg-indigo-900 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <div>
          <h1 className="font-black text-slate-900 leading-none tracking-tighter text-lg">VERSO</h1>
          <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">智能研究助手</p>
        </div>
      </div>
      
      <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => onNavigate(AppView.DASHBOARD)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentView === AppView.DASHBOARD ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          摘要
        </button>
        <button 
          onClick={() => onNavigate(AppView.NOTEBOOK)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentView === AppView.NOTEBOOK ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          笔记
        </button>
      </nav>
    </header>
  );
};

export default Header;
