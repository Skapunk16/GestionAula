import React, { useState, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useTheme } from '../context/ThemeContext';
import { AdminUser, UserRole, DatabaseBackup } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Database,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRightLeft,
  UserPlus,
  Lock,
  FileJson,
  Calendar,
  AlertTriangle,
  Info,
  Palette,
  Sun,
  Moon,
  Check,
} from 'lucide-react';

export const Module5BackupsUsuarios: React.FC = () => {
  const {
    users,
    currentUser,
    currentUserProfile,
    isSuperAdmin,
    setActiveTab,
    registerUser,
    deleteUser,
    switchUser,
    grupos,
    alumnos,
    notas,
    asistencias,
    temarios,
    backups,
    createBackup,
    restoreBackup,
    deleteBackup,
    exportBackupJson,
    importBackupJson,
    loadDemoData,
    clearAllData,
  } = useSchool();

  const { currentTheme, themeConfig, setTheme, availableThemes } = useTheme();

  // New User Form Modal State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newRol, setNewRol] = useState<UserRole>('Administrador');
  const [userError, setUserError] = useState('');

  // Backup Manual Creation State
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupCustomName, setBackupCustomName] = useState('');

  // Restore Confirmation Modal State
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<DatabaseBackup | null>(null);

  // File Upload Ref & State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle New User Creation
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    const res = registerUser({
      username: newUsername,
      password: newPassword,
      nombre: newNombre,
      rol: newRol,
    });

    if (!res.success) {
      setUserError(res.message || 'Error al crear usuario.');
      return;
    }

    setNewUsername('');
    setNewPassword('');
    setNewNombre('');
    setNewRol('Administrador');
    setShowCreateUserModal(false);
  };

  // Handle Manual Backup
  const handleCreateManualBackup = (e: React.FormEvent) => {
    e.preventDefault();
    createBackup(backupCustomName.trim() || undefined);
    setBackupCustomName('');
    setShowBackupModal(false);
  };

  // Handle File Upload for Restore / Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const result = importBackupJson(content, importMode);
      if (result.success) {
        setImportNotice({ type: 'success', text: result.message });
      } else {
        setImportNotice({ type: 'error', text: result.message });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isSuperAdmin ? (
                <>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Panel Exclusivo SuperAdmin
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Bases de Datos Aisladas
                  </span>
                </>
              ) : (
                <>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    Espacio de Respaldos Docente
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Partición Privada: @{currentUser}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isSuperAdmin
                ? 'Panel de Administración de Usuarios y Copias de Seguridad'
                : 'Mis Copias de Seguridad (Backups) y Personalización'}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isSuperAdmin
                ? 'Panel reservado para el Administrador General. Crea y gestiona las cuentas de docentes y administradores con sus propias bases de datos aisladas.'
                : 'Gestiona los puntos de restauración de tu base de datos privada (cursos, alumnos, asistencias y calificaciones) y personaliza los temas visuales.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowBackupModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Crear Respaldo Ahora</span>
            </button>
            <button
              onClick={() => exportBackupJson()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>Descargar Archivo (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice Message if any */}
      {importNotice && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-3 border animate-fadeIn ${
            importNotice.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
          }`}
        >
          {importNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{importNotice.text}</p>
          </div>
          <button
            onClick={() => setImportNotice(null)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* SECTION 1: GESTIÓN DE USUARIOS Y PARTICIONES DE BASE DE DATOS (SUPERADMIN ONLY) */}
      {isSuperAdmin && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Usuarios del Panel de Administración
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada usuario maneja una base de datos 100% aislada. Al cambiar de usuario, se cargarán sus propios cursos, alumnos y notas.
            </p>
          </div>

          <button
            onClick={() => setShowCreateUserModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Nuevo Usuario</span>
          </button>
        </div>

        {/* Current User Active Status Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {currentUserProfile?.nombre?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Espacio activo:</span>
                <strong className="text-slate-900 font-semibold text-sm">
                  {currentUserProfile?.nombre || currentUser}
                </strong>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {currentUserProfile?.rol || 'Administrador'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Usuario del sistema: <code className="text-indigo-600 font-mono">@{currentUser}</code>
              </p>
            </div>
          </div>

          {/* Quick Database Stats for Active User */}
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Cursos Propios</p>
              <p className="font-bold text-slate-800 text-sm">{grupos.length}</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Estudiantes</p>
              <p className="font-bold text-slate-800 text-sm">{alumnos.length}</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Evaluaciones</p>
              <p className="font-bold text-slate-800 text-sm">{notas.length}</p>
            </div>
          </div>
        </div>

        {/* Users List Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nombre y Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Fecha de Creación</th>
                <th className="px-4 py-3">Estado de Sesión</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isActive = currentUser?.toLowerCase() === u.username.toLowerCase();

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isActive ? 'bg-indigo-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{u.nombre}</p>
                          <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.rol === 'SuperAdmin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <ShieldCheck className="w-3 h-3 text-purple-600" />
                          SuperAdmin (Acceso Total)
                        </span>
                      ) : u.rol === 'Docente' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <Lock className="w-3 h-3 text-amber-600" />
                          Docente (Sin acceso a admin)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {u.rol}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Conectado Ahora
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isActive && (
                          <button
                            onClick={() => switchUser(u.username)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                            title={`Cambiar a la base de datos de ${u.nombre}`}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Abrir Base de Datos</span>
                          </button>
                        )}
                        {users.length > 1 && !isActive && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `¿Confirmas eliminar al usuario "${u.nombre}" (@${u.username}) y toda su base de datos asociada? Esta acción no se puede deshacer.`
                                )
                              ) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar usuario y su base de datos"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* SECTION 2: PROTECCIÓN DE DATOS Y CARGA SEGURA DE DEMO */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Protección de Datos y Carga Segura de Demostración
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Carga Demo no destructiva */}
          <div className="p-4 rounded-xl border border-blue-200/70 bg-blue-50/40 space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Anexar Datos Demo (Sin Borrar Tus Cursos)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Agrega los 3 cursos y 11 alumnos de demostración directamente a tu base de datos actual. Tus cursos, estudiantes, asistencias y notas preexistentes se mantienen 100% intactos. Además, el sistema crea un auto-respaldo preventivo al instante.
            </p>
            <button
              onClick={() => loadDemoData(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Anexar Datos Demo Ahora</span>
            </button>
          </div>

          {/* Card: Vaciar todo con protección de auto-respaldo */}
          <div className="p-4 rounded-xl border border-rose-200/70 bg-rose-50/40 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-semibold text-sm">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Plantilla Limpia (Con Auto-Respaldo de Emergencia)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Limpia la base de datos para comenzar desde cero con tu institución técnica. Por tu seguridad, el sistema genera automáticamente un respaldo previo en tu historial para que puedas recuperarlo en cualquier momento.
            </p>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    '¿Deseas vaciar las tablas de tu base de datos? Se creará una copia de seguridad automática para que puedas restaurarla cuando quieras.'
                  )
                ) {
                  clearAllData();
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar Base de Datos</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: HISTORIAL DE COPIAS DE SEGURIDAD (BACKUPS) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Copias de Seguridad y Puntos de Restauración
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Historial de respaldos guardados para el usuario <strong className="text-slate-800">@{currentUser}</strong>. Puedes restaurar cualquier versión en un solo clic.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="backup-file-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Importar un archivo JSON de respaldo"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar desde Archivo (.json)</span>
            </button>

            <button
              onClick={() => setShowBackupModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Respaldo</span>
            </button>
          </div>
        </div>

        {/* Restore options bar */}
        <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200/80">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Modo al importar archivo externo:</span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700">
            <input
              type="radio"
              name="importMode"
              checked={importMode === 'merge'}
              onChange={() => setImportMode('merge')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>Combinar sin borrar existentes (Recomendado)</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 ml-2">
            <input
              type="radio"
              name="importMode"
              checked={importMode === 'replace'}
              onChange={() => setImportMode('replace')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>Sobrescribir completamente</span>
          </label>
        </div>

        {/* Backups List */}
        {backups.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              Aún no tienes copias de seguridad guardadas en este espacio
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Presiona &quot;Crear Respaldo Ahora&quot; para guardar un punto de restauración seguro de todos tus cursos, estudiantes y calificaciones.
            </p>
            <button
              onClick={() => setShowBackupModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear mi primer respaldo</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 text-sm font-semibold">
                      {b.name}
                    </strong>
                    {b.isAutoBackup ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        Auto-Respaldo de Seguridad
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        Manual
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(b.timestamp).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>{b.counts.grupos}</strong> cursos
                    </span>
                    <span>•</span>
                    <span>
                      <strong>{b.counts.alumnos}</strong> alumnos
                    </span>
                    <span>•</span>
                    <span>
                      <strong>{b.counts.notas}</strong> calificaciones
                    </span>
                    <span>•</span>
                    <span>
                      <strong>{b.counts.asistencias}</strong> asistencias
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => setSelectedBackupForRestore(b)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                    title="Restaurar este punto en el tiempo"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>

                  <button
                    onClick={() => exportBackupJson(b.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Descargar como archivo .json"
                  >
                    <FileJson className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la copia de seguridad "${b.name}"?`)) {
                        deleteBackup(b.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Eliminar copia de seguridad"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: ESTILOS Y TEMAS DE LA INTERFAZ GRÁFICA */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Estilos y Temas de la Interfaz Gráfica
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Personaliza el aspecto visual del sistema escolar. Elige entre 8 estilos y paletas optimizadas para trabajo diurno, nocturno y de alto contraste.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Tema actual:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {themeConfig.name}
            </span>
          </div>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableThemes.map((theme) => {
            const isSelected = currentTheme === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`group relative rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {theme.isDark ? (
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      {theme.name}
                    </span>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {theme.tagline}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: theme.palette.primary }}
                      title="Color Primario"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: theme.palette.accent }}
                      title="Color Acento"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: theme.palette.background }}
                      title="Fondo Principal"
                    />
                  </div>

                  <span
                    className={`text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? 'text-indigo-600 font-bold'
                        : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  >
                    {isSelected ? 'Activo' : 'Aplicar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: CREAR NUEVO USUARIO ADMINISTRADOR */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">
                  Nuevo Usuario Administrador
                </h3>
              </div>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Se creará una cuenta con su <strong>propia base de datos independiente</strong>. Los cursos y estudiantes de este usuario no interferirán con los de los demás.
            </p>

            {userError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo / Docente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Prof. Roberto Medina"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de Usuario (Login)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: profe_roberto"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rol y Nivel de Acceso
                </label>
                <select
                  value={newRol}
                  onChange={(e) => setNewRol(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Docente">Docente / Profesor (Sin acceso a este panel de administración)</option>
                  <option value="Administrador">Administrador</option>
                  <option value="SuperAdmin">SuperAdmin (Acceso total)</option>
                </select>
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  {newRol === 'Docente' && (
                    <p className="flex items-start gap-1.5 text-amber-800">
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Docente:</strong> Tendrá su propia base de datos con cursos, alumnos, asistencias y notas. <strong>No tendrá acceso al panel de administración de usuarios.</strong></span>
                    </p>
                  )}
                  {newRol === 'SuperAdmin' && (
                    <p className="flex items-start gap-1.5 text-indigo-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>SuperAdmin:</strong> Administrador General con permisos totales, gestión de otros usuarios y acceso completo a este panel.</span>
                    </p>
                  )}
                  {newRol === 'Administrador' && (
                    <p className="flex items-start gap-1.5 text-slate-700">
                      <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span><strong>Administrador:</strong> Acceso a gestión operativa escolar en su propia partición de datos.</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                >
                  Crear Usuario y Partición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREAR RESPALDO MANUAL */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-700">
                <Database className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">
                  Crear Copia de Seguridad
                </h3>
              </div>
              <button
                onClick={() => setShowBackupModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Se guardará una instantánea con el estado exacto de tus <strong>{grupos.length} cursos</strong>, <strong>{alumnos.length} estudiantes</strong>, temarios y calificaciones para el usuario <code className="text-indigo-600 font-mono font-semibold">@{currentUser}</code>.
            </p>

            <form onSubmit={handleCreateManualBackup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre descriptivo del respaldo (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cierre de Trimestre 1 / Previo a Exámenes"
                  value={backupCustomName}
                  onChange={(e) => setBackupCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBackupModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm cursor-pointer"
                >
                  Guardar Respaldo Ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMAR RESTAURACIÓN */}
      {selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center gap-3 text-emerald-700 pb-3 border-b border-slate-100">
              <RotateCcw className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">
                Confirmar Restauración de Copia
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Estás seguro de que deseas restaurar la copia de seguridad{' '}
              <strong className="text-slate-900">&quot;{selectedBackupForRestore.name}&quot;</strong>?
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p className="font-semibold text-slate-700">Contenido que se restaurará:</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                <span>• Cursos: <strong>{selectedBackupForRestore.counts.grupos}</strong></span>
                <span>• Alumnos: <strong>{selectedBackupForRestore.counts.alumnos}</strong></span>
                <span>• Evaluaciones: <strong>{selectedBackupForRestore.counts.notas}</strong></span>
                <span>• Asistencias: <strong>{selectedBackupForRestore.counts.asistencias}</strong></span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                El sistema guardará automáticamente una copia del estado actual antes de aplicar la restauración, para que nunca pierdas información.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedBackupForRestore(null)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  restoreBackup(selectedBackupForRestore.id);
                  setSelectedBackupForRestore(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm cursor-pointer"
              >
                Restaurar Base de Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
