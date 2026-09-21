import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { TabKey } from '../types';
import {
  Users,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Database,
  AlertCircle,
} from 'lucide-react';

interface TabItem {
  key: TabKey;
  label: string;
  moduleBadge: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, totalAlumnosEnRiesgo } = useSchool();

  const tabs: TabItem[] = [
    {
      key: 'cursos_alumnos',
      label: 'Cursos y Estudiantes',
      moduleBadge: 'Módulo 1',
      icon: Users,
    },
    {
      key: 'asistencia',
      label: 'Control de Asistencia',
      moduleBadge: 'Módulo 2',
      icon: CalendarCheck,
    },
    {
      key: 'temario_desempeno',
      label: 'Contenido y Desempeño',
      moduleBadge: 'Módulo 3',
      icon: ClipboardList,
    },
    {
      key: 'calificaciones_alertas',
      label: 'Calificaciones y Alertas',
      moduleBadge: 'Módulo 4',
      icon: GraduationCap,
      badgeCount: totalAlumnosEnRiesgo > 0 ? totalAlumnosEnRiesgo : undefined,
    },
    {
      key: 'sql_export',
      label: 'Esquema PostgreSQL (SQL)',
      moduleBadge: 'DB / DDL',
      icon: Database,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-[57px] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto no-scrollbar space-x-1 sm:space-x-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-slate-400">
                    {tab.moduleBadge}
                  </span>
                  <span className="leading-tight">{tab.label}</span>
                </div>

                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    {tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
