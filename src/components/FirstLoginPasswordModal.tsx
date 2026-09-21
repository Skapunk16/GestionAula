import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const FirstLoginPasswordModal: React.FC = () => {
  const {
    showFirstLoginModal,
    setShowFirstLoginModal,
    currentUserProfile,
    currentUser,
    changeAdminPassword,
  } = useSchool();

  const [nombre, setNombre] = useState(currentUserProfile?.nombre || 'Administrador General');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showFirstLoginModal) return null;

  // Simple password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Sin ingresar', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 4) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Básica', color: 'bg-amber-400 text-amber-900' };
    if (score === 2) return { score: 2, label: 'Aceptable', color: 'bg-blue-400 text-blue-900' };
    if (score === 3) return { score: 3, label: 'Buena', color: 'bg-indigo-500 text-indigo-100' };
    return { score: 4, label: 'Muy Segura', color: 'bg-emerald-500 text-emerald-100' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 4) {
      setErrorMessage('La nueva contraseña debe contener al menos 4 caracteres.');
      return;
    }
    if (cleanPass.toLowerCase() === 'admin') {
      setErrorMessage('Por favor elija una contraseña segura distinta de la clave inicial predeterminada "admin".');
      return;
    }
    if (cleanPass !== confirmPassword.trim()) {
      setErrorMessage('Las contraseñas no coinciden. Verifique ambas entradas.');
      return;
    }

    setIsSubmitting(true);
    const result = changeAdminPassword(cleanPass, nombre.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Error al guardar la nueva contraseña.');
    }
  };

  return (
    <div
      id="first-login-password-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 relative">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mb-3 shadow-lg">
            <KeyRound className="w-6 h-6" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 inline-block mb-1.5">
            Primer Inicio de Sesión
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Modificar Contraseña de Administrador
          </h3>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Se ha iniciado sesión con la clave predeterminada (<code className="text-amber-300 font-mono">admin</code>). Por seguridad institucional, establezca una contraseña privada para su cuenta de SuperAdmin.
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Account info pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-500">Cuenta de Superusuario:</span>
                <strong className="text-slate-800 ml-1.5 font-mono">@{currentUser || 'admin'}</strong>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
              SuperAdmin
            </span>
          </div>

          {/* Nombre / Display Name field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Nombre o Título del Administrador
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Administrador General o su Nombre"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* New Password field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Nueva Contraseña Personalizada
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres (distinta de 'admin')"
                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {newPassword && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full flex-1 ${strength.score >= 1 ? 'bg-amber-400' : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 ${strength.score >= 2 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 ${strength.score >= 3 ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 ${strength.score >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">
                  Seguridad: {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva contraseña"
                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Las contraseñas coinciden
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              <span>Guardar Nueva Contraseña</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFirstLoginModal(false)}
              className="w-full sm:w-auto py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
              title="Puede modificar la contraseña más tarde desde el panel de administración"
            >
              Recordarme después
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
