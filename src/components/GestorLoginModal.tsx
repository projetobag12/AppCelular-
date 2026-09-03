import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Smartphone,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GestorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GestorLoginModal: React.FC<GestorLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginWithEmail, loginWithPin, quickLoginAs, loginWithGoogle } = useAuth();

  const [authMethod, setAuthMethod] = useState<'pin' | 'credentials'>('pin');
  
  // PIN Form State
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  // Credentials Form State
  const [email, setEmail] = useState('admin@multivale.com.br');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Status State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    
    if (!pin.trim()) {
      setError('Por favor, digite o PIN de segurança do gestor.');
      return;
    }

    const success = loginWithPin(pin.trim());
    if (success) {
      setSuccessMsg('Acesso autenticado com sucesso!');
      setTimeout(() => {
        setPin('');
        setSuccessMsg('');
        onSuccess();
        onClose();
      }, 500);
    } else {
      setError('PIN incorreto. Digite a senha mestra forte configurada (1018192327aA#).');
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Informe seu e-mail corporativo de gestor.');
      return;
    }

    try {
      setIsLoading(true);
      await loginWithEmail(email, password || '1018192327aA#');
      setSuccessMsg('Login realizado com sucesso!');
      setTimeout(() => {
        setSuccessMsg('');
        onSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar gestor. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    quickLoginAs();
    setSuccessMsg('Entrando como Gestor Multivale...');
    setTimeout(() => {
      setSuccessMsg('');
      onSuccess();
      onClose();
    }, 400);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      await loginWithGoogle();
      setSuccessMsg('Autenticado via Google com sucesso!');
      setTimeout(() => {
        setSuccessMsg('');
        onSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setError('Não foi possível autenticar com o Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0F131C] border border-slate-700/80 rounded-3xl shadow-2xl shadow-blue-950/60 overflow-hidden flex flex-col">
        {/* Cabeçalho do Modal */}
        <div className="p-5 pb-4 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Área Restrita do Gestor</span>
                <span className="bg-blue-600/30 text-blue-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-blue-500/30">
                  MDM
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Painel Administrativo Multivale Telecom
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            title="Fechar e voltar ao Modo Colaborador"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-4">
          <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-3 text-xs text-amber-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-200 block">Aparelho em Uso de Campo</span>
              Para acessar o painel de controle e configurações, confirme sua senha corporativa ou o PIN de segurança.
            </div>
          </div>

          {/* Abas: PIN Rápido vs E-mail/Senha */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMethod('pin'); setError(''); }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                authMethod === 'pin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>PIN do Gestor</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('credentials'); setError(''); }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                authMethod === 'credentials'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>E-mail & Senha</span>
            </button>
          </div>

          {/* Mensagens de Sucesso ou Erro */}
          {error && (
            <div className="bg-rose-950/50 border border-rose-800/80 rounded-xl p-2.5 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/50 border border-emerald-800/80 rounded-xl p-2.5 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM 1: PIN RÁPIDO */}
          {authMethod === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    PIN / Senha de Segurança Forte:
                  </label>
                  <button
                    type="button"
                    onClick={() => setPin('1018192327aA#')}
                    className="text-[11px] font-mono text-amber-400 hover:text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 px-2 py-0.5 rounded-lg transition flex items-center gap-1"
                    title="Preencher com o PIN forte cadastrado"
                  >
                    <span>Preencher:</span>
                    <span className="font-bold underline">1018192327aA#</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={32}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1018192327aA#"
                    autoFocus
                    className="w-full bg-[#161B24] border border-slate-700 focus:border-blue-500 rounded-2xl p-3.5 pr-11 text-center text-lg sm:text-xl font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition"
                    title={showPin ? 'Ocultar PIN' : 'Ver PIN digitado'}
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-1">
                  <span>Código de desbloqueio MDM:</span>
                  <span className="font-mono text-amber-400 font-bold tracking-wide">1018192327aA#</span>
                </div>
              </div>

              {/* Teclado rápido adaptado para o novo PIN forte */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {['1', '0', '8', '9', '2', '3', '7', 'a', 'A', '#', 'Limpar', 'OK'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === 'Limpar') {
                        setPin('');
                      } else if (key === 'OK') {
                        handlePinSubmit();
                      } else {
                        setPin((prev) => prev + key);
                      }
                    }}
                    className={`h-11 rounded-xl font-mono text-sm font-bold transition flex items-center justify-center ${
                      key === 'OK'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md font-sans text-xs'
                        : key === 'Limpar'
                        ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 font-sans text-xs'
                        : key === 'a' || key === 'A' || key === '#'
                        ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 text-base'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 active:bg-slate-600'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl text-sm transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Desbloquear Painel do Gestor</span>
              </button>
            </form>
          )}

          {/* FORM 2: E-MAIL & SENHA */}
          {authMethod === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  E-mail do Gestor / Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gestor@multivale.com.br"
                    className="w-full bg-[#161B24] border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 pl-9 text-sm text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#161B24] border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 pl-9 pr-9 text-sm text-white focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? 'Autenticando...' : 'Entrar no Painel do Gestor'}</span>
              </button>
            </form>
          )}

          {/* Atalho de Acesso Rápido para Gestor */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full bg-slate-800/90 hover:bg-emerald-950/40 hover:border-emerald-700/60 border border-slate-700 rounded-xl p-2.5 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  GM
                </div>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-emerald-300">
                    Entrar como Gestor Multivale
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Acesso completo (Políticas, Apps, Dispositivos e Roteamento)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                1-Clique
              </span>
            </button>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1 font-medium transition flex items-center justify-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span>Permanecer no Modo Celular do Colaborador</span>
          </button>
        </div>
      </div>
    </div>
  );
};
