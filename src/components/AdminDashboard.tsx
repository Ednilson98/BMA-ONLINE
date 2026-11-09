import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Download,
  Globe,
  RotateCcw,
  Eye,
  ExternalLink,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { fetchBooks, resetSampleBook } from '../api.js';
import { BookSummary } from '../types.js';
import { UploadModal } from './UploadModal.js';
import { DomainSettingsModal } from './DomainSettingsModal.js';

interface AdminDashboardProps {
  onSelectBook: (bookId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectBook }) => {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [resettingSample, setResettingSample] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchBooks();
      setBooks(data);
      if (data && data.length > 0) {
        localStorage.setItem('bma_cached_books', JSON.stringify(data));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const totalExercises = books.reduce((acc, b) => acc + b.activeExerciseCount, 0);
  const totalViews = books.reduce((acc, b) => acc + (b.totalViews || 0), 0);

  const handleResetSample = async () => {
    if (!confirm('Deseja reinicializar o livro modelo oficial "ingles-7-8" com os 17 exercícios de teste?')) {
      return;
    }
    setResettingSample(true);
    try {
      await resetSampleBook();
      await loadBooks();
      setMessage('Livro modelo "ingles-7-8" reinicializado com sucesso com 17 exercícios.');
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Erro ao reiniciar livro');
    } finally {
      setResettingSample(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Top Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Painel de Controlo do Docente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestão de Livros Didácticos e Códigos QR
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Publique e divida manuais escolares em links permanentes individuais
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Download Official Sample HTML */}
          <a
            href="/api/sample-book/download"
            className="neu-btn px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
            download="ingles-7-8.html"
            title="Descarregar ficheiro .html modelo com 17 exercícios para testar re-envio e divisão"
          >
            <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Baixar Livro Modelo (.html)</span>
            <span className="sm:hidden">Modelo (.html)</span>
          </a>

          {/* Domain configuration */}
          <button
            onClick={() => setIsDomainOpen(true)}
            className="neu-btn px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Domínio Personalizado</span>
            <span className="sm:hidden">Domínio</span>
          </button>

          {/* Upload New Book */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn-gold px-4 sm:px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>Adicionar Novo Livro</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-800 dark:text-teal-200 text-xs font-semibold animate-fadeIn">
          {message}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="neu-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Livros Publicados</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{books.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Formato <code>bma-book-v1</code></div>
        </div>

        <div className="neu-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">QR Codes Activos</span>
            <QrCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-300">{totalExercises}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Páginas públicas individuais</div>
        </div>

        <div className="neu-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Total de Leituras</span>
            <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-700 dark:text-cyan-300">{totalViews}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Acessos directos por QR</div>
        </div>

        <div className="neu-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Garantia QR</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-amber-700 dark:text-amber-300 mt-1">Imutabilidade</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Preservado para manuais físicos</div>
        </div>

      </div>

      {/* Books List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Manuais Didácticos no Sistema</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {books.length}
            </span>
          </h2>

          <button
            onClick={handleResetSample}
            disabled={resettingSample}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 flex items-center gap-1 transition-colors"
            title="Repor livro de demonstração oficial com 17 exercícios"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Repor Amostra (17 exercícios)</span>
            <span className="sm:hidden">Repor Amostra</span>
          </button>
        </div>

        {loading ? (
          <div className="neu-card p-12 text-center text-slate-500 dark:text-slate-400">
            A carregar livros...
          </div>
        ) : books.length === 0 ? (
          <div className="neu-card p-10 sm:p-14 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <div className="text-slate-900 dark:text-white font-bold text-lg">Nenhum livro publicado ainda</div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Envie um ficheiro HTML no formato <code>bma-book-v1</code> ou carregue o livro modelo de exemplo.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="btn-gold px-6 py-3 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              <span>Publicar Primeiro Livro</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {books.map(b => (
              <div
                key={b.book_id}
                className="neu-card p-5 sm:p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="font-mono text-xs font-bold bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      /{b.book_id}
                    </span>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                      v{b.latestVersion} ({b.versionCount} versões salvas)
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors mb-1.5">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {b.subtitle || 'Sem subtítulo'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs neu-inset p-3 rounded-xl mb-5">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">Exercícios Activos:</div>
                      <div className="font-bold text-teal-700 dark:text-teal-300 text-sm mt-0.5">
                        {b.activeExerciseCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">Total de Leituras:</div>
                      <div className="font-bold text-amber-700 dark:text-amber-300 text-sm mt-0.5">
                        {b.totalViews} visualizações
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-2">
                  <a
                    href={b.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-btn px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
                    title="Ver página de índice pública"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Ver Índice</span>
                  </a>

                  <button
                    onClick={() => onSelectBook(b.book_id)}
                    className="btn-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Gerir Exercícios &amp; QRs</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(bookId) => {
          loadBooks();
          onSelectBook(bookId);
        }}
      />

      <DomainSettingsModal
        isOpen={isDomainOpen}
        onClose={() => setIsDomainOpen(false)}
        onSaved={() => loadBooks()}
      />

    </div>
  );
};
