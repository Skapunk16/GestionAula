import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  GraduationCap,
  Users,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  Database,
  Sliders,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    grupos,
    alumnos,
    totalAlumnosEnRiesgo,
    promedioGeneralInstitucional,
    maxAbsencesThreshold,
    setMaxAbsencesThreshold,
    clearAllData,
    loadDemoData,
    setActiveTab,
    currentUser,
    logout,
  } = useSchool();

  const [showConfig, setShowConfig] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Gestión Escolar Integral
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Institutos Técnicos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Control académico, asistencia diaria, temarios y calificaciones
              </p>
            </div>
          </div>

          {/* KPI Mini-Pills & Fast Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
            
            {/* Cursos Count */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Cursos:</span>
              <strong className="text-white font-semibold">{grupos.length}</strong>
            </div>

            {/* Alumnos Count */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Estudiantes:</span>
              <strong className="text-white font-semibold">{alumnos.length}</strong>
            </div>

            {/* Promedio General */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Promedio Gral:</span>
              <strong className="text-emerald-300 font-semibold">{promedioGeneralInstitucional}</strong>
            </div>

            {/* Inasistencias Alert Badge */}
            <button
              onClick={() => setActiveTab('calificaciones_alertas')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
                totalAlumnosEnRiesgo > 0
                  ? 'bg-rose-950/60 border-rose-600/50 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
              }`}
              title="Ver estudiantes con exceso de inasistencias"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${totalAlumnosEnRiesgo > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
              <span>Exceso Faltas:</span>
              <strong className={`font-bold ${totalAlumnosEnRiesgo > 0 ? 'text-rose-200' : 'text-slate-300'}`}>
                {totalAlumnosEnRiesgo}
              </strong>
            </button>

            {/* Config Limit Button */}
            <div className="relative">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                title="Configurar límite de faltas"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Límite: {maxAbsencesThreshold}</span>
              </button>

              {showConfig && (
                <div className="absolute right-0 mt-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 text-slate-200">
                  <p className="font-semibold text-xs mb-1.5 text-white">Configuración de Alertas</p>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Límite máximo de inasistencias permitidas:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={maxAbsencesThreshold}
                      onChange={(e) => setMaxAbsencesThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-center text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-xs text-slate-400">faltas</span>
                    <button
                      onClick={() => setShowConfig(false)}
                      className="ml-auto px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                    >
                      Listo
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Si un estudiante supera este valor ({maxAbsencesThreshold}), se activará la alerta visual &quot;EXCEDE FALTAS&quot;.
                  </p>
                </div>
              )}
            </div>

            {/* SQL Export Tab Shortcut */}
            <button
              onClick={() => setActiveTab('sql_export')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-200 transition-colors"
              title="Ver esquema relacional PostgreSQL y scripts DDL"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Esquema SQL</span>
            </button>

            {/* Data Management (Empty State vs Demo) */}
            <div className="relative">
              <button
                onClick={() => setShowDataMenu(!showDataMenu)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                title="Gestión del estado de datos (Vaciar o Demo)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Datos</span>
              </button>

              {showDataMenu && (
                <div className="absolute right-0 mt-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 text-slate-200 space-y-2">
                  <p className="font-semibold text-xs text-white">Gestión de la Base de Datos</p>
                  <p className="text-[11px] text-slate-400">
                    Control de plantilla vacía institucional y pruebas:
                  </p>
                  
                  <button
                    onClick={() => {
                      clearAllData();
                      setShowDataMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-900/80 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-600/60 text-rose-300 text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold leading-tight">Vaciar todo (Plantilla Limpia)</p>
                      <p className="text-[10px] text-slate-400">0 cursos, 0 alumnos, tablas limpias</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loadDemoData();
                      setShowDataMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-900/80 hover:bg-blue-950/80 border border-slate-700 hover:border-blue-600/60 text-blue-300 text-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold leading-tight">Cargar Datos Demo</p>
                      <p className="text-[10px] text-slate-400">Cargar ejemplos para demostración</p>
                    </div>
                  </button>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => setShowDataMenu(false)}
                      className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin User Info & Logout Button */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-700/80">
              <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700/70">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser || 'admin'}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 hover:text-rose-100 transition-colors"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
