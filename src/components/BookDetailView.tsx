import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Share2,
  Download,
  ExternalLink,
  History,
  QrCode,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import {
  fetchBookDetail,
  deleteExercise,
  deleteBook,
  restoreBookVersion
} from '../api.js';
import { BookDetail, Exercise } from '../types.js';
import { ExportModal } from './ExportModal.js';
import { QrModal } from './QrModal.js';
import { UploadModal } from './UploadModal.js';

interface BookDetailViewProps {
  bookId: string;
  onBack: () => void;
  onBookDeleted: () => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  bookId,
  onBack,
  onBookDeleted
}) => {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedQrExercise, setSelectedQrExercise] = useState<Exercise | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete exercise warning state
  const [deleteExerciseTarget, setDeleteExerciseTarget] = useState<Exercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState(false);

  // Delete book warning state
  const [confirmDeleteBook, setConfirmDeleteBook] = useState(false);
  const [deletingBook, setDeletingBook] = useState(false);

  // Version restore state
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);
  const [showVersionsModal, setShowVersionsModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookDetail(bookId);
      setBook(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar detalhes do livro.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bookId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">A carregar detalhes e exercícios de {bookId}...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="neu-card p-8 border border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Erro ao carregar livro</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{error || 'Livro não encontrado'}</p>
          <button onClick={onBack} className="neu-btn px-6 py-2.5 rounded-xl text-sm font-bold">
            Voltar aos Livros
          </button>
        </div>
      </div>
    );
  }

  const allExercises = [...book.activeExercises, ...book.unlistedExercises];
  const units = Array.from(new Set(allExercises.map(e => e.unit).filter(Boolean)));

  const filteredExercises = allExercises.filter(ex => {
    const matchesSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.class && ex.class.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ex.unit && ex.unit.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesUnit = selectedUnit === 'all' || ex.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  const handleCopyLink = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDeleteExercise = async () => {
    if (!deleteExerciseTarget) return;
    setDeletingExercise(true);
    try {
      await deleteExercise(book.book_id, deleteExerciseTarget.id);
      setDeleteExerciseTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao despublicar exercício');
    } finally {
      setDeletingExercise(false);
    }
  };

  const handleConfirmDeleteBook = async () => {
    setDeletingBook(true);
    try {
      await deleteBook(book.book_id);
      onBookDeleted();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar livro');
      setDeletingBook(false);
    }
  };

  const handleRestoreVersion = async (versionNum: number) => {
    if (!confirm(`Tem certeza que deseja restaurar a Versão ${versionNum}? Os exercícios serão actualizados para o estado dessa versão.`)) {
      return;
    }
    setRestoringVersion(versionNum);
    try {
      const updated = await restoreBookVersion(book.book_id, versionNum);
      setBook(updated);
      setShowVersionsModal(false);
      alert(`Livro restaurado com sucesso para a Versão ${versionNum}!`);
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar versão');
    } finally {
      setRestoringVersion(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <button
          onClick={onBack}
          className="neu-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel Geral</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Version History Button */}
          <button
            onClick={() => setShowVersionsModal(true)}
            className="neu-btn px-3 sm:px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-amber-500" />
            <span>Versões ({book.versions.length})</span>
          </button>

          {/* Download Original HTML */}
          <a
            href={`/api/books/${book.book_id}/download-original`}
            className="neu-btn px-3 sm:px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
            download={`${book.book_id}.html`}
          >
            <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Descarregar HTML</span>
            <span className="sm:hidden">HTML</span>
          </a>

          {/* Export Links (important feature) */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="btn-teal px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Exportar Links</span>
          </button>

          {/* Update Book (re-upload) */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn-gold px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-900" />
            <span>Actualizar Ficheiro</span>
          </button>
        </div>
      </div>

      {/* Book Meta Hero Card */}
      <div className="neu-card p-5 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                /{book.book_id}
              </span>
              <span className="text-xs bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full font-bold">
                Versão {book.versions[0]?.version || 1}
              </span>
              {book.audioFiles && book.audioFiles.length > 0 && (
                <span className="text-xs bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{book.audioFiles.length} áudios MP3</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {book.meta.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {book.meta.subtitle || 'Livro didáctico com códigos QR escolares'}
            </p>
            {book.meta.author && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Coordenação: <span className="text-slate-700 dark:text-slate-300 font-medium">{book.meta.author}</span> • {book.meta.edition || '1ª Edição'}
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 neu-inset p-3.5 sm:p-4 rounded-2xl shrink-0 self-start md:self-auto">
            <div className="text-center px-3 border-r border-slate-300 dark:border-white/10">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{book.activeExercises.length}</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Exercícios</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400">{book.totalViews || 0}</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Leituras QR</div>
            </div>
          </div>
        </div>

        {/* Public Book Link Bar */}
        <div className="mt-5 pt-5 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-semibold">Índice Público:</span>
            <span className="font-mono text-teal-700 dark:text-teal-300 truncate bg-slate-100 dark:bg-black/30 px-2 py-1 rounded border border-slate-200 dark:border-white/5">{book.publicUrl}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopyLink(book.publicUrl, 'book-index')}
              className="neu-btn px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              {copiedId === 'book-index' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'book-index' ? 'Copiado' : 'Copiar Link'}</span>
            </button>
            <a
              href={book.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="neu-btn px-3 py-1.5 rounded-lg text-amber-600 dark:text-amber-300 font-bold flex items-center gap-1.5"
            >
              <span>Abrir Índice</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Warning if unlisted exercises exist */}
      {book.unlistedExercises && book.unlistedExercises.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            <strong className="text-amber-900 dark:text-amber-300">Protecção de Códigos QR Activa:</strong> Existem <strong>{book.unlistedExercises.length}</strong> exercícios que foram omitidos no ficheiro mais recente, mas continuam activos no servidor para garantir que os manuais físicos com códigos QR impressos continuem funcionais.
          </div>
        </div>
      )}

      {/* Exercises Section Header with Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Exercícios e Códigos QR Permanentes</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                {filteredExercises.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cada exercício possui um link individual e permanente, acessível instantaneamente sem login.
            </p>
          </div>

          {/* Search & Filter Inputs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar exercícios..."
                className="pl-9 pr-3 py-2 rounded-xl neu-inset text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-44 sm:w-56"
              />
            </div>

            {units.length > 1 && (
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="neu-inset px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">Todas as Unidades</option>
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Desktop Table View (hidden on small screens) */}
        <div className="hidden md:block neu-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-black/30 border-b border-slate-200/80 dark:border-white/10 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
                <tr>
                  <th className="py-3 px-4">ID (Slug)</th>
                  <th className="py-3 px-4">Título do Exercício</th>
                  <th className="py-3 px-4">Classe & Unidade</th>
                  <th className="py-3 px-4 text-center">Leituras</th>
                  <th className="py-3 px-4 text-right">Acções Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {filteredExercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700 dark:text-amber-300">
                      <div className="flex items-center gap-1.5">
                        <span>{ex.id}</span>
                        {ex.isUnlisted && (
                          <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-sans font-semibold">
                            Preservado
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold max-w-xs truncate">
                      {ex.title}
                      {ex.instr && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                          {ex.instr}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="text-teal-700 dark:text-teal-400 font-bold">{ex.class}</span>
                        <span>•</span>
                        <span>{ex.unit}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-black/20 px-2.5 py-1 rounded-lg">
                        <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{ex.views || 0}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyLink(ex.url!, ex.id)}
                          className="neu-btn p-2 rounded-lg"
                          title="Copiar Link Permanente"
                        >
                          {copiedId === ex.id ? (
                            <Check className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <a
                          href={ex.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="neu-btn p-2 rounded-lg text-teal-600 dark:text-teal-400"
                          title="Abrir Exercício Top-Level"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setSelectedQrExercise(ex)}
                          className="neu-btn p-2 rounded-lg text-amber-600 dark:text-amber-400"
                          title="Ver e Descarregar Código QR (SVG/PNG)"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteExerciseTarget(ex)}
                          className="neu-btn p-2 rounded-lg text-red-500 hover:text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          title="Despublicar Exercício"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Dedicated Card List (shown on small screens) */}
        <div className="md:hidden space-y-3">
          {filteredExercises.map((ex) => (
            <div key={ex.id} className="neu-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-black/40 px-2 py-0.5 rounded border border-amber-500/20">
                  {ex.id}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-700 dark:text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  <span>{ex.views || 0} leituras</span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ex.title}</h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="text-teal-600 dark:text-teal-400 font-semibold">{ex.class}</span>
                  <span>•</span>
                  <span>{ex.unit}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
                <button
                  onClick={() => handleCopyLink(ex.url!, ex.id)}
                  className="neu-btn py-2 text-xs flex items-center justify-center"
                  title="Copiar Link"
                >
                  {copiedId === ex.id ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <a
                  href={ex.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-btn py-2 text-xs text-teal-600 dark:text-teal-400 flex items-center justify-center"
                  title="Abrir"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setSelectedQrExercise(ex)}
                  className="neu-btn py-2 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center"
                  title="Código QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteExerciseTarget(ex)}
                  className="neu-btn py-2 text-xs text-red-500 flex items-center justify-center hover:bg-red-500/10"
                  title="Despublicar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="neu-card p-10 text-center text-slate-500 dark:text-slate-400 text-xs">
            Nenhum exercício encontrado com os filtros actuais.
          </div>
        )}
      </div>

      {/* Danger Zone: Delete Entire Book */}
      <div className="p-5 sm:p-6 rounded-2xl border border-red-500/25 bg-red-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-300">Zona de Perigo: Eliminar Livro</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Ao eliminar o livro, todos os {allExercises.length} exercícios e links de códigos QR deixarão de responder.
          </p>
        </div>
        <button
          onClick={() => setConfirmDeleteBook(true)}
          className="neu-btn px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-500/10 border border-red-500/30 self-start sm:self-auto cursor-pointer"
        >
          Eliminar Livro Completo
        </button>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        book={book}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => loadData()}
        initialBookId={book.book_id}
      />

      {selectedQrExercise && (
        <QrModal
          isOpen={true}
          onClose={() => setSelectedQrExercise(null)}
          bookId={book.book_id}
          exercise={selectedQrExercise}
        />
      )}

      {/* Version History Modal */}
      {showVersionsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="neu-card w-full max-w-xl overflow-hidden p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200/80 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Histórico de Versões</h3>
              </div>
              <button
                onClick={() => setShowVersionsModal(false)}
                className="neu-btn px-3 py-1 rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3">
              {book.versions.map((ver, idx) => (
                <div
                  key={ver.version}
                  className="p-3.5 rounded-xl neu-inset flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Versão {ver.version}</span>
                      {idx === 0 && (
                        <span className="bg-teal-500/15 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Actual
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(ver.timestamp).toLocaleString('pt-AO')} • {ver.exerciseCount} exercícios
                    </div>
                    {ver.note && (
                      <div className="text-amber-700 dark:text-amber-300 italic mt-0.5 font-medium">"{ver.note}"</div>
                    )}
                  </div>

                  {idx !== 0 && (
                    <button
                      onClick={() => handleRestoreVersion(ver.version)}
                      disabled={restoringVersion === ver.version}
                      className="btn-gold px-3 py-1.5 rounded-lg font-bold text-slate-900 flex items-center gap-1 text-[11px] shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{restoringVersion === ver.version ? 'A restaurar...' : 'Restaurar'}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Exercise Confirmation Modal */}
      {deleteExerciseTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="neu-card w-full max-w-md p-6 border-2 border-red-500/40 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
              Aviso Crítico de Código QR Impresso!
            </h3>
            <p className="text-xs text-slate-600 dark:text-red-200 mb-4 leading-relaxed">
              Está prestes a despublicar o exercício <strong>"{deleteExerciseTarget.id}"</strong> ({deleteExerciseTarget.title}).
              <br /><br />
              Se este código QR já foi impresso em livros escolares físicos, os alunos não conseguirão mais aceder a esta lição!
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteExerciseTarget(null)}
                disabled={deletingExercise}
                className="neu-btn px-4 py-2.5 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteExercise}
                disabled={deletingExercise}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
              >
                {deletingExercise ? 'A remover...' : 'Despublicar Mesmo Assim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Book Confirmation Modal */}
      {confirmDeleteBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="neu-card w-full max-w-md p-6 border-2 border-red-500/50 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              Eliminar Livro "{book.meta.title}"?
            </h3>
            <p className="text-xs text-slate-600 dark:text-red-200 mb-5 leading-relaxed">
              Esta acção é irreversível. Todos os <strong>{allExercises.length}</strong> links permanentes e códigos QR deixarão de funcionar imediatamente.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteBook(false)}
                disabled={deletingBook}
                className="neu-btn px-4 py-2.5 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteBook}
                disabled={deletingBook}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
              >
                {deletingBook ? 'A eliminar...' : 'Confirmar Eliminação'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
