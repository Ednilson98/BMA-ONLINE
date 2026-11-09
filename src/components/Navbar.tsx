import React from 'react';
import { BookOpen, Shield, LogOut, Sun, Moon, ArrowLeft, ExternalLink } from 'lucide-react';
import { clearStoredToken } from '../api.js';

interface NavbarProps {
  isAdmin: boolean;
  userEmail?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentView: 'public' | 'admin-dashboard' | 'book-detail' | 'login';
  onNavigate: (view: 'public' | 'admin-dashboard' | 'book-detail' | 'login') => void;
  selectedBookTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  userEmail,
  theme,
  onToggleTheme,
  currentView,
  onNavigate,
  selectedBookTitle
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bma-surface)]/90 border-b border-[var(--bma-border)] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0"
          onClick={() => onNavigate('public')}
          role="button"
          tabIndex={0}
          aria-label="Ir para a página inicial"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center btn-gold shadow-md shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#052431]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                BMA <span className="text-amber-500 dark:text-amber-400">BOOKS</span>
              </span>
              <span className="hidden xs:inline-flex text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Bantu Mentor Academy • Angola
            </p>
          </div>
        </div>

        {/* Center Breadcrumb (if inside a book on desktop) */}
        {selectedBookTitle && currentView === 'book-detail' && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-[var(--bma-inset)] px-3.5 py-1.5 rounded-full border border-[var(--bma-border)] max-w-xs truncate">
            <span className="text-slate-400 dark:text-slate-500">Livro:</span>
            <span className="font-bold text-amber-600 dark:text-amber-300 truncate">{selectedBookTitle}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Light/Dark Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="neu-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 transition-transform active:scale-95"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema de cor"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" />
            )}
          </button>

          {/* Navigation based on current view & auth */}
          {currentView === 'login' ? (
            <button
              onClick={() => onNavigate('public')}
              className="neu-btn px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Início</span>
            </button>
          ) : isAdmin ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {currentView !== 'admin-dashboard' && currentView !== 'book-detail' ? (
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="btn-teal px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 font-bold shadow-md"
                >
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Painel Docente</span>
                  <span className="xs:hidden">Painel</span>
                </button>
              ) : currentView === 'book-detail' ? (
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="neu-btn px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Todos os Livros</span>
                  <span className="sm:hidden">Voltar</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('public')}
                  className="neu-btn px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
                  <span className="hidden sm:inline">Portal Aluno</span>
                  <span className="sm:hidden">Portal</span>
                </button>
              )}

              <button
                onClick={() => {
                  clearStoredToken();
                  window.location.reload();
                }}
                className="neu-btn w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/10 transition-colors"
                title="Terminar Sessão"
                aria-label="Terminar sessão"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="neu-btn px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-300 flex items-center gap-1.5 sm:gap-2 border border-amber-500/30 hover:border-amber-500/60"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span className="hidden xs:inline">Área Docente</span>
              <span className="xs:hidden">Docente</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
