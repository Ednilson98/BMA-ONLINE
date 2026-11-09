import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertTriangle, ArrowRight, KeyRound } from 'lucide-react';
import { loginAdmin } from '../api.js';

interface AdminLoginProps {
  onSuccess: (user: { email: string; name: string }) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('bantudesignstudio9@gmail.com');
  const [password, setPassword] = useState('bma-docente-2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAdmin(email, password);
      onSuccess({ email: res.email, name: res.name });
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword('bma-docente-2026');
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 px-4">
      <div className="neu-card p-6 sm:p-8 relative overflow-hidden">
        
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3.5 btn-gold shadow-lg">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Área do Professor
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Bantu Mentor Academy • Gestão de Livros e Exercícios
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-700 dark:text-red-200 text-xs sm:text-sm animate-shake">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Email do Docente
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@bma.ao"
                className="w-full pl-10 pr-4 py-3 rounded-xl neu-inset text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Palavra-passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl neu-inset text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl btn-gold flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold shadow-lg disabled:opacity-50 cursor-pointer min-h-[48px]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                A verificar credenciais...
              </span>
            ) : (
              <>
                <span>Entrar no Painel de Gestão</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Firebase Google Auth Button */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                const { signInWithGoogle } = await import('../firebase.js');
                const user = await signInWithGoogle();
                if (user) {
                  onSuccess({ email: user.email || 'docente@bma.ao', name: user.displayName || 'Docente BMA' });
                }
              } catch (err: any) {
                setError(err.message || 'Falha ao iniciar sessão com Google.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-3 rounded-xl neu-btn text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[44px]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continuar com Google (Firebase)</span>
          </button>
        </div>

        {/* Quick demo helper card */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10">
          <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Credenciais Oficiais BMA:</span>
          </div>
          <div className="neu-inset p-3 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Email:</span>
              <button
                type="button"
                onClick={() => fillQuickCredentials('bantudesignstudio9@gmail.com')}
                className="font-mono text-amber-700 dark:text-amber-300 hover:underline text-left sm:text-right truncate"
              >
                bantudesignstudio9@gmail.com
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Email Alternativo:</span>
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@bmabooks.ao')}
                className="font-mono text-teal-700 dark:text-teal-300 hover:underline text-left sm:text-right"
              >
                admin@bmabooks.ao
              </button>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-white/5">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Palavra-passe:</span>
              <code className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200 font-mono">bma-docente-2026</code>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-center">
            Protegido contra ataques de força bruta com limite de 5 tentativas por intervalo.
          </p>
        </div>

      </div>
    </div>
  );
};
