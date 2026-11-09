import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Globe,
  UserPlus,
  Eye,
  EyeOff
} from 'lucide-react';
import { loginAdmin, syncFirebaseSession } from '../api.js';
import {
  signInWithEmail,
  registerWithEmail,
  signInWithGoogle,
  signOutFirebase,
  parseFirebaseAuthError,
  ParsedAuthError,
  firebaseConfig
} from '../firebase.js';

interface AdminLoginProps {
  onSuccess: (user: { email: string; name: string }) => void;
  onCancel: () => void;
}

const AUTHORIZED_ADMIN_EMAIL = 'bantudesignstudio9@gmail.com';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [authMode, setAuthMode] = useState<'firebase' | 'local'>('firebase');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainDiagnostic, setDomainDiagnostic] = useState<ParsedAuthError | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  // Copy hostname to clipboard for quick pasting into Firebase Console
  const copyCurrentDomain = () => {
    if (!currentHost) return;
    navigator.clipboard.writeText(currentHost);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  // 1. Firebase Email & Password login
  const handleFirebaseEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDomainDiagnostic(null);
    setStatusMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
      setError(`Acesso restrito. Apenas o email oficial (${AUTHORIZED_ADMIN_EMAIL}) tem permissão de administração.`);
      return;
    }

    if (!password) {
      setError('Por favor introduza a sua palavra-passe.');
      return;
    }

    setLoading(true);

    try {
      const user = await signInWithEmail(normalizedEmail, password);
      setStatusMessage('Autenticação confirmada! A aceder ao painel...');
      const session = await syncFirebaseSession({
        email: user.email || normalizedEmail,
        name: user.displayName || 'Professor Bantu Mentor Academy',
        uid: user.uid
      });
      onSuccess({ email: session.email, name: session.name });
    } catch (err: any) {
      console.warn('Firebase email auth note:', err);
      const parsed = parseFirebaseAuthError(err);
      if (parsed.isUnauthorizedDomain) {
        setDomainDiagnostic(parsed);
      } else if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        setError('Credenciais não encontradas no Firebase Authentication ou palavra-passe incorrecta.');
      } else {
        setError(parsed.message || 'Falha ao autenticar via Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Firebase Google login (STRICT: bantudesignstudio9@gmail.com only)
  const handleFirebaseGoogleLogin = async () => {
    setError(null);
    setDomainDiagnostic(null);
    setStatusMessage(null);
    setLoading(true);

    try {
      const user = await signInWithGoogle();
      const userEmail = (user.email || '').trim().toLowerCase();

      // STRICT AUTHORIZATION CHECK
      if (userEmail !== AUTHORIZED_ADMIN_EMAIL) {
        await signOutFirebase();
        setError(`Acesso negado para a conta Google "${user.email}". Apenas o email oficial da instituição (${AUTHORIZED_ADMIN_EMAIL}) tem permissão de docente.`);
        return;
      }

      setStatusMessage('Conta Google verificada! A aceder ao painel...');
      const session = await syncFirebaseSession({
        email: userEmail,
        name: user.displayName || 'Professor Bantu Mentor Academy',
        uid: user.uid
      });
      onSuccess({ email: session.email, name: session.name });
    } catch (err: any) {
      console.warn('Firebase google auth note:', err);
      const parsed = parseFirebaseAuthError(err);
      if (parsed.isUnauthorizedDomain) {
        setDomainDiagnostic(parsed);
      } else {
        setError(parsed.message || 'Falha ao iniciar sessão com Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Register user directly in Firebase Authentication
  const handleCreateFirebaseUser = async () => {
    setError(null);
    setDomainDiagnostic(null);
    setStatusMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
      setError(`Apenas o email docente oficial (${AUTHORIZED_ADMIN_EMAIL}) pode ser registado como administrador.`);
      return;
    }

    if (!password || password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const user = await registerWithEmail(normalizedEmail, password);
      setStatusMessage('Conta Firebase criada com sucesso! A aceder...');
      const session = await syncFirebaseSession({
        email: user.email || normalizedEmail,
        name: user.displayName || 'Professor Bantu Mentor Academy',
        uid: user.uid
      });
      onSuccess({ email: session.email, name: session.name });
    } catch (err: any) {
      const parsed = parseFirebaseAuthError(err);
      if (parsed.isUnauthorizedDomain) {
        setDomainDiagnostic(parsed);
      } else {
        setError(parsed.message || 'Não foi possível registar o utilizador no Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Local BMA Server Login (direct fallback)
  const handleLocalLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Por favor introduza o seu email docente.');
      return;
    }

    if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
      setError(`Acesso restrito. Apenas o email oficial (${AUTHORIZED_ADMIN_EMAIL}) tem permissão de administração.`);
      return;
    }

    if (!password) {
      setError('Por favor introduza a sua palavra-passe.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginAdmin(normalizedEmail, password);
      onSuccess({ email: res.email, name: res.name });
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-6 sm:my-12 px-4">
      <div className="neu-card p-6 sm:p-9 relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3.5 btn-gold shadow-lg">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Área do Professor
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Bantu Mentor Academy • Gestão Pedagógica de Manuais e Exercícios
          </p>
        </div>

        {/* Tab switcher: Firebase vs Local Direct */}
        <div className="flex rounded-xl p-1 mb-6 neu-inset">
          <button
            type="button"
            onClick={() => { setAuthMode('firebase'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'firebase'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Firebase Authentication</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('local'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'local'
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Acesso Directo</span>
          </button>
        </div>

        {/* Domain Diagnostic Alert Box (Displayed only if unauthorized domain is reported by Firebase) */}
        {domainDiagnostic && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-slate-900 dark:text-white space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-amber-900 dark:text-amber-300">
                  Domínio Não Autorizado no Firebase
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  Por protecção de segurança, o Firebase só aceita autenticações de domínios explicitamente registados na Consola do Firebase.
                </p>
              </div>
            </div>

            {/* Current domain copy pill */}
            <div className="p-3 rounded-xl neu-inset bg-slate-900/5 dark:bg-black/30 border border-amber-500/30">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
                Domínio actual a autorizar:
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-slate-900 dark:text-amber-200 truncate select-all">
                  {currentHost}
                </code>
                <button
                  type="button"
                  onClick={copyCurrentDomain}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold neu-btn flex items-center gap-1 shrink-0 text-slate-800 dark:text-white hover:text-amber-600 cursor-pointer"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions: Open Firebase Console or Bypass via Local Mode */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={domainDiagnostic.consoleSettingsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl neu-btn text-xs font-bold flex items-center justify-center gap-1.5 text-amber-800 dark:text-amber-300 hover:text-amber-900 transition-all text-center"
              >
                <span>Abrir Consola Firebase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => handleLocalLogin()}
                className="flex-1 py-2.5 px-3 rounded-xl btn-teal text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar no Modo Directo</span>
              </button>
            </div>
          </div>
        )}

        {/* Status message */}
        {statusMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center gap-2.5 text-teal-800 dark:text-teal-200 text-xs sm:text-sm">
            <span className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <div className="leading-relaxed">{statusMessage}</div>
          </div>
        )}

        {/* Error message */}
        {error && !domainDiagnostic && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-700 dark:text-red-200 text-xs sm:text-sm animate-shake">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <div>{error}</div>
              {error.includes('não encontradas') && (
                <button
                  type="button"
                  onClick={handleCreateFirebaseUser}
                  disabled={loading}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 underline hover:no-underline cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Criar esta conta no Firebase com esta palavra-passe</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form fields (Standard clean production inputs, no hardcoded values) */}
        <form onSubmit={authMode === 'firebase' ? handleFirebaseEmailLogin : handleLocalLogin} className="space-y-4 sm:space-y-5">
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
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
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
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl neu-inset text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold shadow-lg disabled:opacity-50 cursor-pointer min-h-[48px] ${
              authMode === 'firebase' ? 'btn-gold text-slate-900' : 'btn-teal text-white'
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                A validar credenciais...
              </span>
            ) : (
              <>
                <span>
                  {authMode === 'firebase' ? 'Entrar com Firebase Authentication' : 'Entrar com Acesso Directo'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Firebase Google Auth Button (Available in Firebase mode) */}
        {authMode === 'firebase' && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleFirebaseGoogleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl neu-btn text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[44px] text-slate-800 dark:text-white hover:text-amber-600"
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
        )}

        {/* Clean, professional bottom bar with return button */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px]">Bantu Mentor Academy • Sistema Protegido</span>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium cursor-pointer transition-colors"
          >
            Voltar ao Início
          </button>
        </div>

      </div>
    </div>
  );
};
