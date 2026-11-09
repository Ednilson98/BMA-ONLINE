import React, { useState } from 'react';
import { X, QrCode, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { Exercise } from '../types.js';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  exercise: Exercise;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, bookId, exercise }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl = exercise.url || `${window.location.origin}/${bookId}/${exercise.id}`;
  const qrPngUrl = `/api/qr/${bookId}/${exercise.id}?format=png`;
  const qrSvgUrl = `/api/qr/${bookId}/${exercise.id}?format=svg`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="neu-card w-full max-w-sm sm:max-w-md overflow-hidden text-center p-5 sm:p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <QrCode className="w-4 h-4" />
            <span>Código QR Permanente</span>
          </div>
          <button
            onClick={onClose}
            className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container (Crisp White Card for Camera Scanning) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl inline-block mx-auto border border-slate-200">
          <img
            src={qrPngUrl}
            alt={`Código QR do exercício ${exercise.id}`}
            className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain block"
          />
        </div>

        {/* Exercise Details */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold bg-amber-500/15 dark:bg-black/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
              {exercise.id}
            </span>
            <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold">{exercise.class}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{exercise.unit}</span>
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{exercise.title}</h3>
        </div>

        {/* Permanent URL display */}
        <div className="neu-inset p-2.5 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-300 break-all flex items-center justify-between gap-2">
          <span className="truncate">{targetUrl}</span>
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg neu-btn text-amber-600 dark:text-amber-300 shrink-0"
            title="Copiar Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Download Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={`${qrSvgUrl}&download=true`}
            download={`qr-${bookId}-${exercise.id}.svg`}
            className="neu-btn py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Baixar SVG</span>
          </a>

          <a
            href={`${qrPngUrl}&download=true`}
            download={`qr-${bookId}-${exercise.id}.png`}
            className="neu-btn py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Baixar PNG</span>
          </a>
        </div>

        {/* Test in Browser */}
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl btn-teal text-xs font-extrabold flex items-center justify-center gap-2 shadow-md block min-h-[44px]"
        >
          <span>Abrir Lição Autónoma</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Ideal para impressão directa em manuais escolares. Este código QR nunca expira.
        </p>

      </div>
    </div>
  );
};
