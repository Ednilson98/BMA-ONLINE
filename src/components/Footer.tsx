import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-white/10 mt-auto py-8 sm:py-10 bg-slate-100/80 dark:bg-[#0B1B2B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base text-slate-900 dark:text-white tracking-wide">
                Bantu Mentor Academy - BMA
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plataforma de Livros Didácticos e Exercícios com QR Codes Permanentes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Links Permanentes e Imutáveis</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div>Formato Oficial: <code>bma-book-v1</code></div>
            <span className="hidden sm:inline">•</span>
            <div>Luanda, Angola</div>
          </div>

        </div>

        <div className="pt-5 border-t border-slate-200 dark:border-white/5 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-2">
          <span>Bantu Mentor Academy - BMA</span>
          <span>© {new Date().getFullYear()}</span>
          <span>•</span>
          <span>Educação e Inovação para o Ensino Angolano</span>
        </div>
      </div>
    </footer>
  );
};
