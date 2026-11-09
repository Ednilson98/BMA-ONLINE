import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  FileArchive,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { validateBookHtml, uploadBook } from '../api.js';
import { ValidationResult } from '../types.js';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookId: string) => void;
  initialBookId?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialBookId
}) => {
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [unpublishMissing, setUnpublishMissing] = useState<'keep-missing' | 'unpublish'>('keep-missing');
  const [generalError, setGeneralError] = useState<string | null>(null);

  const htmlInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleHtmlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setGeneralError('Por favor seleccione um ficheiro com extensão .html');
      return;
    }

    setHtmlFile(file);
    setGeneralError(null);
    setValidationErrors([]);
    setValidationResult(null);
    setValidating(true);

    try {
      const result = await validateBookHtml(file);
      if (result.valid) {
        setValidationResult(result);
        setValidationErrors([]);
      } else {
        setValidationResult(result);
        setValidationErrors(result.errors || ['Ficheiro inválido']);
      }
    } catch (err: any) {
      setValidationErrors([err.message || 'Erro ao validar o ficheiro']);
    } finally {
      setValidating(false);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      setGeneralError('O arquivo de áudios deve ser um ficheiro .zip');
      return;
    }
    setZipFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlFile) {
      setGeneralError('Seleccione o ficheiro .html do livro.');
      return;
    }
    if (!validationResult?.valid) {
      setGeneralError('Corrija os erros de validação antes de publicar.');
      return;
    }

    setUploading(true);
    setGeneralError(null);

    try {
      const res = await uploadBook(htmlFile, zipFile, note, unpublishMissing);
      onSuccess(res.book_id);
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'Erro durante o envio do livro.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="neu-card w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-gold shadow-md shrink-0">
              <Upload className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {initialBookId ? 'Actualizar Livro Didáctico' : 'Publicar Novo Livro Didáctico'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formato Oficial <code>bma-book-v1</code> • Divisão Automática em Links Permanentes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neu-btn w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
          
          {generalError && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>{generalError}</div>
            </div>
          )}

          {/* HTML File Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Ficheiro HTML do Livro (.html) <span className="text-amber-500">*</span>
            </label>
            <div
              onClick={() => htmlInputRef.current?.click()}
              className={`p-5 sm:p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                htmlFile
                  ? 'border-teal-500 bg-teal-500/5'
                  : 'border-slate-300 dark:border-white/15 hover:border-amber-500 bg-slate-50 dark:bg-black/20'
              }`}
            >
              <input
                ref={htmlInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleHtmlChange}
                className="hidden"
              />
              <FileCode className={`w-9 h-9 sm:w-10 sm:h-10 mb-2 ${htmlFile ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
              {htmlFile ? (
                <div>
                  <div className="text-sm sm:text-base font-bold text-teal-700 dark:text-teal-300">{htmlFile.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {(htmlFile.size / 1024).toFixed(1)} KB • Clique para escolher outro
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Clique para seleccionar o ficheiro HTML do livro
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Deve conter o bloco &lt;script type="application/json" id="bma-book"&gt;
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Optional Audio ZIP File Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Pasta de Áudios (.zip) • Opcional</span>
              <span className="text-slate-400 text-[11px] font-normal">Áudios mp3 servidos em /&lt;book_id&gt;/audio/</span>
            </label>
            <div
              onClick={() => zipInputRef.current?.click()}
              className={`p-3.5 sm:p-4 rounded-xl border border-dashed cursor-pointer transition-all flex items-center justify-between ${
                zipFile
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-slate-300 dark:border-white/10 hover:border-amber-500 bg-slate-50 dark:bg-black/10'
              }`}
            >
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                onChange={handleZipChange}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <FileArchive className={`w-5 h-5 sm:w-6 sm:h-6 ${zipFile ? 'text-amber-500' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {zipFile ? zipFile.name : 'Adicionar ficheiros de som (.zip com MP3s)'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {zipFile ? `${(zipFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Ex: audios-ingles.zip contendo u71-l1.mp3, etc.'}
                  </div>
                </div>
              </div>
              {zipFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZipFile(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded"
                >
                  Remover
                </button>
              )}
            </div>
          </div>

          {/* Validating indicator */}
          {validating && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-2.5 text-teal-800 dark:text-teal-300 text-xs sm:text-sm">
              <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>A verificar a estrutura e exercícios do livro...</span>
            </div>
          )}

          {/* Validation Errors Box */}
          {validationErrors.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-800 dark:text-red-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>O ficheiro possui erros que impedem a publicação:</span>
              </div>
              <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation Success & Exercises Preview */}
          {validationResult && validationResult.valid && (
            <div className="space-y-4">
              
              {/* Book Metadata Badge Card */}
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                      {validationResult.meta?.title}
                    </span>
                    <span className="text-[11px] font-mono bg-teal-500/20 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded font-bold">
                      /{validationResult.meta?.book_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {validationResult.meta?.subtitle || 'Sem subtítulo'}
                  </p>
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1">
                    {validationResult.exerciseCount} exercícios interactivos detectados
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    validationResult.isUpdate
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30'
                  }`}>
                    {validationResult.isUpdate ? 'Actualização' : 'Novo'}
                  </span>
                </div>
              </div>

              {/* WARNING: Missing IDs in existing book */}
              {validationResult.isUpdate && validationResult.missingFromExisting && validationResult.missingFromExisting.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-900 dark:text-amber-100 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
                        Aviso Crítico de Códigos QR Impressos
                      </h4>
                      <p className="text-xs text-amber-900 dark:text-amber-200 mt-0.5 leading-relaxed">
                        Foram detectados <strong>{validationResult.missingFromExisting.length}</strong> exercícios da versão anterior que não constam neste novo ficheiro:
                        <code className="mx-1 bg-amber-200/50 dark:bg-black/40 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-300 font-mono">
                          {validationResult.missingFromExisting.join(', ')}
                        </code>
                        Se estes exercícios forem despublicados, os códigos QR impressos nos manuais deixarão de funcionar!
                      </p>
                    </div>
                  </div>

                  <div className="pl-6 space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-900 dark:text-white">
                      <input
                        type="radio"
                        name="unpublishMissing"
                        checked={unpublishMissing === 'keep-missing'}
                        onChange={() => setUnpublishMissing('keep-missing')}
                        className="accent-amber-500 w-4 h-4"
                      />
                      <span>
                        Manter os exercícios ausentes activos e acessíveis (Recomendado)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-red-700 dark:text-red-300">
                      <input
                        type="radio"
                        name="unpublishMissing"
                        checked={unpublishMissing === 'unpublish'}
                        onChange={() => setUnpublishMissing('unpublish')}
                        className="accent-red-500 w-4 h-4"
                      />
                      <span>
                        Despublicar exercícios ausentes (Cuidado: Códigos QR impressos serão desactivados)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Exercise Preview List */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Pré-visualização dos Exercícios</span>
                  <span>Total: {validationResult.exerciseCount}</span>
                </div>
                <div className="max-h-40 overflow-y-auto neu-inset rounded-xl p-2 divide-y divide-slate-200 dark:divide-white/5 space-y-1">
                  {validationResult.exercisesPreview?.map((ex, idx) => (
                    <div key={ex.id || idx} className="py-2 px-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 truncate mr-2">
                        <span className="font-mono text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-black/30 px-1.5 py-0.5 rounded text-[11px] shrink-0 font-bold">
                          {ex.id}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-200 truncate">{ex.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-slate-500 dark:text-slate-400 text-[11px]">
                        <span className="text-teal-700 dark:text-teal-400 font-semibold">{ex.class}</span>
                        <span>•</span>
                        <span>{ex.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Nota da Versão (Opcional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Correcção de gralhas e actualização de áudios"
                  className="w-full px-4 py-2.5 rounded-xl neu-inset text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

            </div>
          )}

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl neu-btn text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading || !validationResult?.valid}
              className="px-5 py-2.5 rounded-xl btn-gold text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md min-h-[42px]"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>A processar divisão...</span>
                </>
              ) : (
                <>
                  <span>{validationResult?.isUpdate ? 'Actualizar Livro' : 'Publicar Livro'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
