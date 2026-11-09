import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  QrCode,
  Sparkles,
  ArrowRight,
  Volume2,
  Smartphone,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { fetchBooks, fetchBookDetail } from '../api.js';
import { BookSummary, BookDetail, Exercise } from '../types.js';

interface PublicHomeProps {
  onGoToAdmin: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onGoToAdmin }) => {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Quick exercise code jumper
  const [quickCode, setQuickCode] = useState('');
  const [quickCodeError, setQuickCodeError] = useState<string | null>(null);

  // Search & filter inside selected book
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    fetchBooks().then(list => {
      setBooks(list);
      if (list.length > 0) {
        setSelectedBookId(list[0].book_id);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      setLoadingDetail(true);
      fetchBookDetail(selectedBookId).then(detail => {
        setBookDetail(detail);
        setLoadingDetail(false);
      }).catch(err => {
        console.error(err);
        setLoadingDetail(false);
      });
    }
  }, [selectedBookId]);

  // Handle direct exercise jump
  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickCodeError(null);
    const cleaned = quickCode.trim().toLowerCase();
    if (!cleaned) return;

    if (cleaned.includes('/')) {
      window.location.href = `/${cleaned}`;
      return;
    }

    if (selectedBookId) {
      window.location.href = `/${selectedBookId}/${cleaned}`;
      return;
    }

    setQuickCodeError('Por favor indique o código do exercício (ex: u71-l1 ou ingles-7-8/u71-l1)');
  };

  const activeExercises = bookDetail ? [...bookDetail.activeExercises, ...bookDetail.unlistedExercises] : [];

  const units = Array.from(new Set(activeExercises.map(e => e.unit).filter(Boolean)));
  const classes = Array.from(new Set(activeExercises.map(e => e.class).filter(Boolean)));

  const filteredExercises = activeExercises.filter(ex => {
    const matchesSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.instr && ex.instr.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesUnit = selectedUnit === 'all' || ex.unit === selectedUnit;
    const matchesClass = selectedClass === 'all' || ex.class === selectedClass;

    return matchesSearch && matchesUnit && matchesClass;
  });

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-8 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Bantu Mentor Academy • Ensino Interactivo</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4 text-balance">
          Livros Didácticos e Exercícios com{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-teal-600 dark:from-amber-400 dark:via-amber-300 dark:to-teal-300">
            QR Codes Permanentes
          </span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 text-balance">
          Aceda directamente às lições impressas nos manuais escolares. Páginas rápidas, autónomas e sem necessidade de palavras-passe.
        </p>

        {/* Quick QR / Exercise ID Jumper */}
        <div className="max-w-xl mx-auto neu-card p-3 sm:p-5 mb-6 text-left">
          <form onSubmit={handleJump} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <QrCode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
              <input
                type="text"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="Código do exercício (ex: u71-l1)"
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl neu-inset text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl btn-gold text-sm font-extrabold flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer min-h-[48px]"
            >
              <span>Abrir Lição</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </button>
          </form>
          {quickCodeError && (
            <div className="text-red-500 dark:text-red-300 text-xs mt-2 pl-2 font-medium">
              {quickCodeError}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-3 text-[11px] text-slate-500 dark:text-slate-400 pl-1">
            <span>Experimente o código <code>u71-l1</code></span>
            <span>•</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              Directo no telemóvel
            </span>
          </div>
        </div>

      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Book Selector Tabs (if multiple books exist) */}
        {books.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Manuais Escolares Disponíveis:</span>
            </div>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {books.map(b => (
                <button
                  key={b.book_id}
                  onClick={() => setSelectedBookId(b.book_id)}
                  className={`px-4 sm:px-5 py-3 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3 ${
                    selectedBookId === b.book_id
                      ? 'btn-teal shadow-lg text-white'
                      : 'neu-card text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold">{b.title}</div>
                    <div className="text-[11px] opacity-80 font-mono">
                      /{b.book_id} • {b.activeExerciseCount} exercícios
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Book Banner & Full Index Link */}
        {bookDetail && (
          <div className="neu-card p-5 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full uppercase">
                    /{bookDetail.book_id}
                  </span>
                  <span className="text-xs bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full font-bold">
                    {bookDetail.activeExercises.length} Lições Prontas
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {bookDetail.meta.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {bookDetail.meta.subtitle || 'Livro didáctico com conteúdos interactivos'}
                </p>
                {bookDetail.meta.footer && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {bookDetail.meta.footer}
                  </p>
                )}
              </div>

              {/* Big Touch-friendly Button to open full book index */}
              <a
                href={bookDetail.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 shadow-xl shrink-0 cursor-pointer min-h-[50px]"
              >
                <BookOpen className="w-5 h-5 text-slate-900" />
                <span>Abrir Índice Geral</span>
                <ExternalLink className="w-4 h-4 text-slate-900" />
              </a>
            </div>

            {/* Filter & Search Bar */}
            <div className="pt-5 border-t border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center">
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar exercícios..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl neu-inset text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Unit and Class Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {classes.length > 1 && (
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="neu-inset px-3 py-2.5 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="all">Todas as Classes</option>
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}

                {units.length > 1 && (
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="neu-inset px-3 py-2.5 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="all">Todas as Unidades</option>
                    {units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            {/* Exercises Grid with Large Tap Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 pt-2">
              {filteredExercises.map(ex => (
                <div
                  key={ex.id}
                  className="neu-card p-4 sm:p-5 flex flex-col justify-between hover:border-amber-500/50 transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-black/40 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {ex.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-teal-700 dark:text-teal-400 font-bold">{ex.class}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{ex.unit}</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors line-clamp-2">
                      {ex.title}
                    </h3>

                    {ex.instr && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {ex.instr}
                      </p>
                    )}

                    {ex.audioText && (
                      <div className="flex items-center gap-2 text-xs text-teal-800 dark:text-teal-300 font-medium bg-teal-500/10 dark:bg-teal-500/15 px-3 py-1.5 rounded-lg border border-teal-500/20">
                        <Volume2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Áudio em inglês incluído</span>
                      </div>
                    )}
                  </div>

                  {/* Big Touch-friendly direct button */}
                  <a
                    href={ex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-3 rounded-xl btn-teal text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer min-h-[46px]"
                  >
                    <span>Iniciar Exercício</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>

            {filteredExercises.length === 0 && (
              <div className="p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                Nenhum exercício encontrado com estes critérios de pesquisa.
              </div>
            )}

          </div>
        )}

      </section>

    </div>
  );
};
