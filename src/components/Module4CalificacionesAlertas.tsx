import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Nota } from '../types';
import {
  GraduationCap,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckCircle2,
  Sliders,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const Module4CalificacionesAlertas: React.FC = () => {
  const {
    alumnos,
    grupos,
    notas,
    resumenAlumnos,
    totalAlumnosEnRiesgo,
    promedioGeneralInstitucional,
    maxAbsencesThreshold,
    setMaxAbsencesThreshold,
    addNota,
    updateNota,
    deleteNota,
    selectedCursoId,
    setSelectedCursoId,
    setActiveTab,
  } = useSchool();

  // Active subtab: 'resumen_global' vs 'registro_notas'
  const [subTab, setSubTab] = useState<'resumen_global' | 'registro_notas'>('resumen_global');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAlert, setFilterAlert] = useState<'all' | 'excede_faltas' | 'bajo_promedio' | 'aprobados'>('all');

  // Modal for adding/editing a grade
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [notaForm, setNotaForm] = useState<{
    id_alumno: number | '';
    tipo_evaluacion: string;
    nota: string;
  }>({
    id_alumno: '',
    tipo_evaluacion: '',
    nota: '',
  });
  const [notaError, setNotaError] = useState('');

  // Suggestions for evaluation types
  const EVALUATION_SUGGESTIONS = [
    'Parcial 1 (Teórico)',
    'Parcial 2 (Teórico)',
    'Práctica de Taller 1',
    'Práctica de Taller 2',
    'Laboratorio de Diagnóstico',
    'Proyecto Integrador',
    'Examen Final',
  ];

  // Open modal handlers
  const handleOpenNewNota = (defaultAlumnoId?: number) => {
    setEditingNota(null);
    setNotaForm({
      id_alumno: defaultAlumnoId ?? (alumnos[0]?.id_alumno || ''),
      tipo_evaluacion: '',
      nota: '',
    });
    setNotaError('');
    setIsNotaModalOpen(true);
  };

  const handleOpenEditNota = (notaItem: Nota) => {
    setEditingNota(notaItem);
    setNotaForm({
      id_alumno: notaItem.id_alumno,
      tipo_evaluacion: notaItem.tipo_evaluacion,
      nota: notaItem.nota.toFixed(2),
    });
    setNotaError('');
    setIsNotaModalOpen(true);
  };

  const handleSubmitNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (notaForm.id_alumno === '') {
      setNotaError('Seleccione un estudiante');
      return;
    }
    if (!notaForm.tipo_evaluacion.trim()) {
      setNotaError('Indique el tipo de evaluación');
      return;
    }

    const val = parseFloat(notaForm.nota);
    if (isNaN(val) || val < 0 || val > 10) {
      setNotaError('La calificación debe ser un valor numérico entre 0.00 y 10.00');
      return;
    }

    if (editingNota) {
      updateNota(editingNota.id_nota, notaForm.tipo_evaluacion, val);
    } else {
      addNota(Number(notaForm.id_alumno), notaForm.tipo_evaluacion, val);
    }

    setIsNotaModalOpen(false);
  };

  // Filtered Summary List
  const filteredResumen = useMemo(() => {
    return resumenAlumnos.filter((item) => {
      const matchesCurso =
        selectedCursoId === 'all' || item.alumno.id_curso === selectedCursoId;
      const matchesQuery =
        `${item.alumno.nombre} ${item.alumno.apellido}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.alumno.id_alumno.toString() === searchQuery.trim();

      let matchesAlert = true;
      if (filterAlert === 'excede_faltas') {
        matchesAlert = item.excedeFaltas;
      } else if (filterAlert === 'bajo_promedio') {
        matchesAlert = item.promedio !== null && item.promedio < 4.0;
      } else if (filterAlert === 'aprobados') {
        matchesAlert = item.promedio !== null && item.promedio >= 7.0 && !item.excedeFaltas;
      }

      return matchesCurso && matchesQuery && matchesAlert;
    });
  }, [resumenAlumnos, selectedCursoId, searchQuery, filterAlert]);

  // Statistics for top analytics cards
  const totalConNotas = resumenAlumnos.filter((r) => r.promedio !== null).length;
  const aprobadosCount = resumenAlumnos.filter((r) => r.estadoAprobacion === 'Aprobado').length;

  return (
    <div className="space-y-6">
      
      {/* Module Title Header */}
      <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Módulo 4
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Calificaciones y Alertas Académicas
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Control de notas parciales y finales con panel analítico, promedio dinámico y detección automática de exceso de inasistencias.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenNewNota()}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Registrar Calificación
            </button>
          </div>
        </div>
      </div>

      {/* Threshold Config & High-Level KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI: Alumnos en Riesgo por Faltas */}
        <div className={`p-4 rounded-2xl border transition-all ${
          totalAlumnosEnRiesgo > 0
            ? 'bg-rose-50 border-rose-200 shadow-xs'
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Exceso de Faltas
            </span>
            <AlertTriangle className={`w-4 h-4 ${totalAlumnosEnRiesgo > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">
              {totalAlumnosEnRiesgo}
            </span>
            <span className="text-xs text-rose-600 font-medium">
              estudiantes &gt; {maxAbsencesThreshold} inasistencias
            </span>
          </div>
        </div>

        {/* KPI: Promedio Institucional */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Promedio General
            </span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {promedioGeneralInstitucional}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              escala 0.00 a 10.00
            </span>
          </div>
        </div>

        {/* KPI: Aprobados / Con Notas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Estudiantes Evaluados
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              {aprobadosCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              aprobados de {totalConNotas} evaluados
            </span>
          </div>
        </div>

        {/* Config: Threshold Slider / Input */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Límite Configurable
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              Regla
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <label className="text-xs text-slate-300">
              Máx inasistencias permitidas:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={20}
                value={maxAbsencesThreshold}
                onChange={(e) => setMaxAbsencesThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-sm font-bold text-white focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-400">faltas</span>
            </div>
          </div>
        </div>

      </div>

      {/* Subtab navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('resumen_global')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'resumen_global'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          📊 Panel de Resumen Global (Promedio + Faltas + Alertas)
        </button>
        <button
          onClick={() => setSubTab('registro_notas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'registro_notas'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          📝 Registro Detallado de Calificaciones ({notas.length})
        </button>
      </div>

      {/* SUBTAB 1: PANEL DE RESUMEN GLOBAL (Dynamic Analytical Table) */}
      {subTab === 'resumen_global' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar estudiante..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl w-44 sm:w-56 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Course Filter */}
              <select
                value={selectedCursoId}
                onChange={(e) =>
                  setSelectedCursoId(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos los Cursos</option>
                {grupos.map((g) => (
                  <option key={g.id_curso} value={g.id_curso}>
                    {g.nombre_curso}
                  </option>
                ))}
              </select>

              {/* Alert Filter */}
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <select
                  value={filterAlert}
                  onChange={(e) => setFilterAlert(e.target.value as any)}
                  className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">Estado: Todos</option>
                  <option value="excede_faltas">⚠️ Solo Exceso de Faltas</option>
                  <option value="bajo_promedio">Bajo Rendimiento (&lt; 4.00)</option>
                  <option value="aprobados">Aprobados (&gt;= 7.00)</option>
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-500">
              Mostrando {filteredResumen.length} de {resumenAlumnos.length} estudiantes
            </span>
          </div>

          {/* MAIN ANALYTICAL TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">ID</th>
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Curso / Asignatura</th>
                    <th className="py-3 px-4 text-center">Promedio General</th>
                    <th className="py-3 px-4 text-center">Inasistencias Acumuladas</th>
                    <th className="py-3 px-4 text-center">Certificado</th>
                    <th className="py-3 px-4 text-center">Sistema de Alerta</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alumnos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <div className="max-w-sm mx-auto space-y-2">
                          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-semibold text-slate-700 text-sm">No hay estudiantes registrados</p>
                          <p className="text-xs text-slate-400">
                            La base de datos se encuentra limpia. Registra estudiantes en el Módulo 1 para habilitar el cálculo de promedios, inasistencias y alertas automáticas.
                          </p>
                          <button
                            onClick={() => setActiveTab('cursos_alumnos')}
                            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            Ir a Registrar Cursos y Alumnos →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredResumen.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No hay estudiantes que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredResumen.map((item) => (
                      <tr
                        key={item.alumno.id_alumno}
                        className={`transition-colors ${
                          item.excedeFaltas
                            ? 'bg-rose-50/40 hover:bg-rose-50/70'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* ID */}
                        <td className="py-3 px-4 text-center font-mono font-medium text-slate-400">
                          #{item.alumno.id_alumno}
                        </td>

                        {/* Estudiante */}
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                              {item.alumno.nombre[0]}
                              {item.alumno.apellido[0]}
                            </div>
                            <div>
                              <span>
                                {item.alumno.apellido}, {item.alumno.nombre}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {item.totalNotas} {item.totalNotas === 1 ? 'evaluación' : 'evaluaciones'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Curso */}
                        <td className="py-3 px-4 text-slate-700">
                          {item.curso?.nombre_curso || (
                            <span className="text-slate-400 italic">Sin asignar</span>
                          )}
                        </td>

                        {/* Promedio General */}
                        <td className="py-3 px-4 text-center">
                          {item.promedio !== null ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                                item.promedio >= 7.0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.promedio >= 4.0
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {item.promedio.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Sin notas
                            </span>
                          )}
                        </td>

                        {/* Inasistencias Acumuladas */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                                item.excedeFaltas
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : item.faltasTotales === maxAbsencesThreshold
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'text-slate-700 bg-slate-100'
                              }`}
                            >
                              {item.faltasTotales} {item.faltasTotales === 1 ? 'falta' : 'faltas'}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {item.asistenciasTotales} presencias ({item.porcentajeAsistencia}%)
                            </span>
                          </div>
                        </td>

                        {/* Certificado */}
                        <td className="py-3 px-4 text-center">
                          {item.alumno.certificado ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Entregado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Pendiente
                            </span>
                          )}
                        </td>

                        {/* ALERTA VISUAL AUTOMÁTICA */}
                        <td className="py-3 px-4 text-center">
                          {item.excedeFaltas ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-300 shadow-xs animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              EXCEDE FALTAS
                            </span>
                          ) : item.faltasTotales === maxAbsencesThreshold ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              En Límite ({maxAbsencesThreshold})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                              Regular
                            </span>
                          )}
                        </td>

                        {/* Acción rápida */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenNewNota(item.alumno.id_alumno)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg transition-colors font-medium"
                            title="Calificar a este alumno"
                          >
                            <Plus className="w-3 h-3" />
                            + Nota
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: REGISTRO DETALLADO DE CALIFICACIONES (Tabla Notas) */}
      {subTab === 'registro_notas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Nómina Completa de Calificaciones Registradas ({notas.length})
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Tabla relacional: Notas (id_nota, id_alumno, tipo_evaluacion, nota)
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-14 text-center">ID</th>
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Curso Asignado</th>
                    <th className="py-3 px-4">Tipo de Evaluación</th>
                    <th className="py-3 px-4 text-center">Calificación (0-10)</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No hay calificaciones registradas. Usa el botón &quot;+ Registrar Calificación&quot;.
                      </td>
                    </tr>
                  ) : (
                    notas.map((notaItem) => {
                      const alumno = alumnos.find((a) => a.id_alumno === notaItem.id_alumno);
                      const curso = grupos.find((g) => g.id_curso === alumno?.id_curso);

                      return (
                        <tr key={notaItem.id_nota} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-mono font-medium text-slate-400">
                            #{notaItem.id_nota}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {alumno ? `${alumno.apellido}, ${alumno.nombre}` : 'Desconocido'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {curso?.nombre_curso || 'Sin curso'}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                              {notaItem.tipo_evaluacion}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                                notaItem.nota >= 7.0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : notaItem.nota >= 4.0
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {notaItem.nota.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditNota(notaItem)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                                title="Editar calificación"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteNota(notaItem.id_nota)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                                title="Eliminar calificación"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Registrar / Editar Calificación (Notas) */}
      {isNotaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                {editingNota ? 'Modificar Calificación' : 'Registrar Nueva Calificación'}
              </h3>
              <button
                onClick={() => setIsNotaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNota} className="space-y-4 mt-4">
              {notaError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {notaError}
                </div>
              )}

              {/* Alumno Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estudiante *
                </label>
                <select
                  value={notaForm.id_alumno}
                  onChange={(e) =>
                    setNotaForm({
                      ...notaForm,
                      id_alumno: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">-- Seleccione un alumno --</option>
                  {alumnos.map((a) => {
                    const c = grupos.find((g) => g.id_curso === a.id_curso);
                    return (
                      <option key={a.id_alumno} value={a.id_alumno}>
                        {a.apellido}, {a.nombre} {c ? `(${c.nombre_curso})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tipo de Evaluación */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Evaluación *
                </label>
                <input
                  type="text"
                  value={notaForm.tipo_evaluacion}
                  onChange={(e) =>
                    setNotaForm({ ...notaForm, tipo_evaluacion: e.target.value })
                  }
                  placeholder="ej: Parcial 1, Examen Final, Práctica Taller..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
                
                {/* Suggestions Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {EVALUATION_SUGGESTIONS.map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => setNotaForm({ ...notaForm, tipo_evaluacion: sug })}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calificación Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calificación (Rango de 0.00 a 10.00) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10"
                    value={notaForm.nota}
                    onChange={(e) => setNotaForm({ ...notaForm, nota: e.target.value })}
                    placeholder="ej: 8.50"
                    className="w-full text-sm font-mono font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                    / 10.00
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNotaModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow-xs"
                >
                  {editingNota ? 'Actualizar Nota' : 'Guardar Calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
