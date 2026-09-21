import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Database,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Layers,
  Key,
  ShieldCheck,
} from 'lucide-react';

export const ModuleSqlExport: React.FC = () => {
  const { generatePostgreSQLScript, grupos, alumnos, asistencias, temarios, desempenos, notas } = useSchool();
  const [copied, setCopied] = useState(false);

  const sqlScript = generatePostgreSQLScript();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar al portapapeles', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sqlScript], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gestion_escolar_schema_postgres.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tablesSummary = [
    {
      name: 'Grupo',
      desc: 'Cursos y asignaturas técnicas',
      pk: 'id_curso (SERIAL PK)',
      fk: '—',
      count: grupos.length,
    },
    {
      name: 'Alumnos',
      desc: 'Nómina de estudiantes técnicos',
      pk: 'id_alumno (SERIAL PK)',
      fk: 'id_curso -> Grupo(id_curso) ON DELETE SET NULL',
      count: alumnos.length,
    },
    {
      name: 'Asistencia',
      desc: 'Control diario de presencias y faltas',
      pk: '(id_alumno, fecha) PK COMPUESTA',
      fk: 'id_alumno -> Alumnos(id_alumno) ON DELETE CASCADE',
      count: asistencias.length,
    },
    {
      name: 'Temario_Dia',
      desc: 'Planificación académica por sesión',
      pk: 'id_temario (SERIAL PK)',
      fk: 'id_curso -> Grupo(id_curso) ON DELETE CASCADE',
      count: temarios.length,
    },
    {
      name: 'Desempeno_Clase',
      desc: 'Checklist y evaluación por alumno',
      pk: '(id_temario, id_alumno) PK COMPUESTA',
      fk: 'id_temario -> Temario_Dia, id_alumno -> Alumnos',
      count: desempenos.length,
    },
    {
      name: 'Notas',
      desc: 'Calificaciones parciales y finales',
      pk: 'id_nota (SERIAL PK)',
      fk: 'id_alumno -> Alumnos(id_alumno) ON DELETE CASCADE',
      count: notas.length,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-white p-5 rounded-2xl border border-indigo-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                Base de Datos Relacional
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Esquema PostgreSQL Normalizado (DDL & Snapshot)
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Esquema de 6 tablas con llaves primarias compuestas, integridad referencial y script SQL compatible con Supabase, Neon y Vercel Postgres.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Script SQL
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-medium shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Descargar .sql
            </button>
          </div>
        </div>
      </div>

      {/* Relational Tables Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {tablesSummary.map((t, idx) => (
          <div key={t.name} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                #{idx + 1}. {t.name}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {t.count} registros
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {t.desc}
            </p>
            <div className="pt-2 border-t border-slate-100 text-[10px] space-y-1 font-mono">
              <div className="flex items-center gap-1 text-slate-700">
                <Key className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{t.pk}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Layers className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{t.fk}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deployment & Vercel / Supabase guide */}
      <div className="bg-slate-900 text-slate-200 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            Compatibilidad con Vercel Postgres, Supabase y Neon
          </h3>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sintaxis ANSI PostgreSQL 14+
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Para desplegar la base de datos en producción:
          copia el script SQL que se muestra a continuación y pégalo directamente en el <strong>SQL Editor</strong> de <strong>Supabase</strong>, en la consola de <strong>Neon</strong> o en <strong>Vercel Postgres</strong>.
          Las 6 tablas se crearán respetando las llaves foráneas y los tipos de datos exactos solicitados.
        </p>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-slate-200 font-semibold">schema_gestion_escolar.sql</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-indigo-300 hover:text-white transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '¡Copiado!' : 'Copiar todo'}
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-[500px] leading-relaxed select-all">
          {sqlScript}
        </pre>
      </div>

    </div>
  );
};
