import React, { useState, useEffect } from 'react';
import { X, Globe, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { fetchDomainInfo, saveCustomDomain } from '../api.js';

interface DomainSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const DomainSettingsModal: React.FC<DomainSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [domain, setDomain] = useState('');
  const [currentHost, setCurrentHost] = useState('');
  const [effectiveBaseUrl, setEffectiveBaseUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDomainInfo().then(info => {
        setDomain(info.customDomain || '');
        setCurrentHost(info.currentHost || '');
        setEffectiveBaseUrl(info.effectiveBaseUrl || '');
      }).catch(err => {
        setErrorMsg(err.message);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await saveCustomDomain(domain);
      setEffectiveBaseUrl(res.effectiveBaseUrl);
      setSuccessMsg('Domínio configurado com sucesso! Todos os links e códigos QR reflectem este endereço.');
      onSaved();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar domínio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="neu-card w-full max-w-lg overflow-hidden p-5 sm:p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl btn-teal flex items-center justify-center shadow-md shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Domínio Personalizado</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Permanência e integridade de QR codes escolares</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Nome do Domínio Escolar
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Ex: livros.bma.ao ou exercicios.bantuacademy.com"
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl neu-inset text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Deixe em branco para utilizar automaticamente o endereço padrão da aplicação.
            </p>
          </div>

          <div className="neu-inset p-3 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Host Actual:</span>
              <span className="font-mono font-medium">{currentHost || 'Detectando...'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Base URL Efectiva:</span>
              <span className="font-mono text-amber-700 dark:text-amber-400 font-bold truncate max-w-[240px]">{effectiveBaseUrl || 'Detectando...'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Garantia de Permanência:</strong> Como a estrutura segue <code>/&lt;book_id&gt;/&lt;exercise_id&gt;</code>, alterar o domínio não invalida nenhum código QR já impresso nos livros escolares físicos.
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl neu-btn text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl btn-teal text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 min-h-[40px]"
            >
              {saving ? 'A guardar...' : 'Guardar Domínio'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
