import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FileSpreadsheet,
  FileText,
  FileJson,
  Printer,
  Download,
  Share2
} from 'lucide-react';
import { BookDetail } from '../types.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookDetail;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, book }) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const exercises = [...book.activeExercises, ...book.unlistedExercises];

  // 1. Copy as text: id | title | url
  const generateTextExport = () => {
    return exercises
      .map(ex => `${ex.id} | ${ex.title} | ${ex.url || ''}`)
      .join('\n');
  };

  const handleCopyText = async () => {
    const text = generateTextExport();
    await navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // 2. Download CSV
  const handleDownloadCsv = () => {
    const headers = ['id', 'title', 'class', 'unit', 'kind', 'url', 'views'];
    const rows = exercises.map(ex => [
      `"${(ex.id || '').replace(/"/g, '""')}"`,
      `"${(ex.title || '').replace(/"/g, '""')}"`,
      `"${(ex.class || '').replace(/"/g, '""')}"`,
      `"${(ex.unit || '').replace(/"/g, '""')}"`,
      `"${(ex.kind || '').replace(/"/g, '""')}"`,
      `"${(ex.url || '').replace(/"/g, '""')}"`,
      ex.views || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bma-${book.book_id}-links.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Download JSON
  const handleDownloadJson = () => {
    const payload = {
      meta: book.meta,
      book_id: book.book_id,
      publicUrl: book.publicUrl,
      exportedAt: new Date().toISOString(),
      totalExercises: exercises.length,
      exercises: exercises.map(ex => ({
        id: ex.id,
        title: ex.title,
        class: ex.class,
        unit: ex.unit,
        kind: ex.kind,
        url: ex.url,
        views: ex.views || 0
      }))
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bma-${book.book_id}-links.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Download PDF / Printable Clean Sheet
  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <title>Tabela de Links e Códigos QR - ${book.meta.title}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111; margin: 0; padding: 0; }
          .header { text-align: center; border-bottom: 2px solid #3F7D8C; padding-bottom: 12px; margin-bottom: 20px; }
          .logo { font-size: 14px; font-weight: 800; color: #A28F6A; text-transform: uppercase; letter-spacing: 1px; }
          h1 { margin: 6px 0 2px; font-size: 20px; color: #083C51; }
          .subtitle { font-size: 12px; color: #555; }
          .meta-info { margin-top: 6px; font-size: 11px; color: #444; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10pt; }
          th { background: #E5E2DD; color: #083C51; border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; font-weight: 700; }
          td { border: 1px solid #CBD5E1; padding: 7px 10px; vertical-align: middle; }
          tr:nth-child(even) { background: #F8FAFC; }
          .id-cell { font-family: monospace; font-weight: bold; color: #3F7D8C; }
          .url-cell { font-family: monospace; font-size: 8.5pt; color: #083C51; word-break: break-all; }
          .footer { margin-top: 25px; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #E2E8F0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Bantu Mentor Academy - BMA</div>
          <h1>${book.meta.title}</h1>
          <div class="subtitle">${book.meta.subtitle || 'Links Permanentes para Códigos QR em Livros Escolares'}</div>
          <div class="meta-info">Total de Exercícios: <strong>${exercises.length}</strong> | Gerado em: ${new Date().toLocaleDateString('pt-AO')}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 14%;">ID</th>
              <th style="width: 32%;">Título do Exercício</th>
              <th style="width: 14%;">Classe</th>
              <th style="width: 14%;">Unidade</th>
              <th style="width: 26%;">URL Permanente</th>
            </tr>
          </thead>
          <tbody>
            ${exercises.map(ex => `
              <tr>
                <td class="id-cell">${ex.id}</td>
                <td><strong>${ex.title}</strong></td>
                <td>${ex.class || '-'}</td>
                <td>${ex.unit || '-'}</td>
                <td class="url-cell">${ex.url || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Bantu Mentor Academy - BMA • Edição Escolar • Os links são permanentes e não sofrem alterações quando o conteúdo é actualizado.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="neu-card w-full max-w-2xl overflow-hidden p-5 sm:p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center btn-teal shadow-md shrink-0">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Exportar Links dos Exercícios
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {book.meta.title} • {exercises.length} Links Permanentes
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

        {/* Export Options Grid */}
        <div className="space-y-3 sm:space-y-4">
          
          {/* 1. Copy as text */}
          <div className="p-3.5 sm:p-4 rounded-xl neu-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Copiar como Texto</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Formato: <code>id | title | url</code> (uma linha por exercício)
                </p>
              </div>
            </div>
            <button
              onClick={handleCopyText}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[40px] ${
                copiedText ? 'btn-teal' : 'btn-gold'
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Todos</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Download CSV */}
          <div className="p-3.5 sm:p-4 rounded-xl neu-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Descarregar CSV</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Compatível com Excel e diagramação de livros escolares
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadCsv}
              className="neu-btn px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Baixar CSV</span>
            </button>
          </div>

          {/* 3. Download JSON */}
          <div className="p-3.5 sm:p-4 rounded-xl neu-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 flex items-center justify-center shrink-0">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Descarregar JSON</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Ficheiro JSON com metadados e URLs públicas estruturados
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadJson}
              className="neu-btn px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
            >
              <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Baixar JSON</span>
            </button>
          </div>

          {/* 4. Download PDF / Clean Printable Table */}
          <div className="p-3.5 sm:p-4 rounded-xl neu-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Descarregar PDF / Imprimir</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Tabela limpa pronta para impressão (id, título, classe, unidade, url)
                </p>
              </div>
            </div>
            <button
              onClick={handlePrintPdf}
              className="btn-teal px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 text-right">
          <button
            onClick={onClose}
            className="neu-btn px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
