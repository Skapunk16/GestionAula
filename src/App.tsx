import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Module1CursosAlumnos } from './components/Module1CursosAlumnos';
import { Module2Asistencia } from './components/Module2Asistencia';
import { Module3TemarioDesempeno } from './components/Module3TemarioDesempeno';
import { Module4CalificacionesAlertas } from './components/Module4CalificacionesAlertas';
import { ModuleSqlExport } from './components/ModuleSqlExport';
import { Module5BackupsUsuarios } from './components/Module5BackupsUsuarios';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useSchool();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {activeTab === 'cursos_alumnos' && <Module1CursosAlumnos />}
      {activeTab === 'asistencia' && <Module2Asistencia />}
      {activeTab === 'temario_desempeno' && <Module3TemarioDesempeno />}
      {activeTab === 'calificaciones_alertas' && <Module4CalificacionesAlertas />}
      {activeTab === 'sql_export' && <ModuleSqlExport />}
      {activeTab === 'backups_usuarios' && <Module5BackupsUsuarios />}
    </main>
  );
};

const SchoolApp: React.FC = () => {
  const { isAuthenticated, systemNotice, setSystemNotice } = useSchool();
  const { currentTheme } = useTheme();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div
      data-theme={currentTheme}
      className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased relative transition-colors duration-150"
    >
      <Header />
      <Navigation />

      {/* Global System Notice Toast */}
      {systemNotice && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <p className="font-semibold text-slate-200">Notificación del Sistema</p>
            <p className="text-slate-300/90 mt-0.5">{systemNotice}</p>
          </div>
          <button
            onClick={() => setSystemNotice(null)}
            className="text-slate-400 hover:text-white text-sm leading-none ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex-1">
        <MainContent />
      </div>
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Sistema de Gestión Escolar Integral para Instituciones Técnicas — Arquitectura Relacional de 6 Tablas Normalizadas
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            PostgreSQL • Supabase • Neon • Vercel Ready
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <SchoolProvider>
        <SchoolApp />
      </SchoolProvider>
    </ThemeProvider>
  );
}
