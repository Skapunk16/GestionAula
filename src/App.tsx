import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Module1CursosAlumnos } from './components/Module1CursosAlumnos';
import { Module2Asistencia } from './components/Module2Asistencia';
import { Module3TemarioDesempeno } from './components/Module3TemarioDesempeno';
import { Module4CalificacionesAlertas } from './components/Module4CalificacionesAlertas';
import { ModuleSqlExport } from './components/ModuleSqlExport';

const MainContent: React.FC = () => {
  const { activeTab } = useSchool();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {activeTab === 'cursos_alumnos' && <Module1CursosAlumnos />}
      {activeTab === 'asistencia' && <Module2Asistencia />}
      {activeTab === 'temario_desempeno' && <Module3TemarioDesempeno />}
      {activeTab === 'calificaciones_alertas' && <Module4CalificacionesAlertas />}
      {activeTab === 'sql_export' && <ModuleSqlExport />}
    </main>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased">
        <Header />
        <Navigation />
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
    </SchoolProvider>
  );
}
