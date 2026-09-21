import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Alumno, Grupo, EstadoDesempeno } from '../types';
import {
  FileText,
  FileDown,
  Search,
  Filter,
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Printer,
  Download,
  ShieldCheck,
  Check,
  GraduationCap,
  Percent,
} from 'lucide-react';

export const ModuleListaEstudiantes: React.FC = () => {
  const {
    alumnos,
    grupos,
    resumenAlumnos,
    selectedCursoId,
    setSelectedCursoId,
    downloadStudentReport,
    downloadStudentsListReport,
    currentUser,
    currentUserProfile,
    setActiveTab,
  } = useSchool();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aprobado' | 'Regular' | 'En Riesgo' | 'Sin Notas'>('all');
  const [sortBy, setSortBy] = useState<'apellido' | 'nombre' | 'id' | 'promedio' | 'asistencia'>('apellido');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // PDF format state
  const [pdfFormat, setPdfFormat] = useState<'academico' | 'firmas_asistencia'>('academico');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filtered and Sorted Alumnos
  const filteredAlumnos = useMemo(() => {
    return alumnos
      .filter((alumno) => {
        // Course Filter
        if (selectedCursoId !== 'all' && alumno.id_curso !== selectedCursoId) {
          return false;
        }

        // Status Filter
        if (statusFilter !== 'all') {
          const resumen = resumenAlumnos.find((r) => r.alumno.id_alumno === alumno.id_alumno);
          if (!resumen || resumen.estadoAprobacion !== statusFilter) {
            return false;
          }
        }

        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const fullName = `${alumno.nombre} ${alumno.apellido} ${alumno.apellido} ${alumno.nombre}`.toLowerCase();
          const idStr = alumno.id_alumno.toString();
          const curso = grupos.find((g) => g.id_curso === alumno.id_curso);
          const cursoName = curso ? curso.nombre_curso.toLowerCase() : 'sin asignar';

          return fullName.includes(query) || idStr.includes(query) || cursoName.includes(query);
        }

        return true;
      })
      .sort((a, b) => {
        const resumenA = resumenAlumnos.find((r) => r.alumno.id_alumno === a.id_alumno);
        const resumenB = resumenAlumnos.find((r) => r.alumno.id_alumno === b.id_alumno);

        let comparison = 0;

        if (sortBy === 'apellido') {
          comparison = a.apellido.localeCompare(b.apellido, 'es');
        } else if (sortBy === 'nombre') {
          comparison = a.nombre.localeCompare(b.nombre, 'es');
        } else if (sortBy === 'id') {
          comparison = a.id_alumno - b.id_alumno;
        } else if (sortBy === 'promedio') {
          const promA = resumenA?.promedio ?? -1;
          const promB = resumenB?.promedio ?? -1;
          comparison = promA - promB;
        } else if (sortBy === 'asistencia') {
          const asistA = resumenA?.porcentajeAsistencia ?? 100;
          const asistB = resumenB?.porcentajeAsistencia ?? 100;
          comparison = asistA - asistB;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [alumnos, selectedCursoId, statusFilter, searchQuery, sortBy, sortOrder, resumenAlumnos, grupos]);

  // Statistics for the current filtered list
  const currentResumenList = useMemo(() => {
    return filteredAlumnos.map((a) => resumenAlumnos.find((r) => r.alumno.id_alumno === a.id_alumno)).filter(Boolean);
  }, [filteredAlumnos, resumenAlumnos]);

  const stats = useMemo(() => {
    const total = filteredAlumnos.length;
    const aprobados = currentResumenList.filter((r) => r?.estadoAprobacion === 'Aprobado').length;
    const regulares = currentResumenList.filter((r) => r?.estadoAprobacion === 'Regular').length;
    const enRiesgo = currentResumenList.filter((r) => r?.estadoAprobacion === 'En Riesgo').length;
    const sinNotas = currentResumenList.filter((r) => r?.estadoAprobacion === 'Sin Notas').length;

    const promediosValidos = currentResumenList
      .filter((r) => r && r.promedio !== null)
      .map((r) => r!.promedio as number);

    const promedioGral =
      promediosValidos.length > 0
        ? (promediosValidos.reduce((acc, curr) => acc + curr, 0) / promediosValidos.length).toFixed(2)
        : '-';

    const asistenciasValidas = currentResumenList.map((r) => r?.porcentajeAsistencia ?? 100);
    const asistenciaMedia =
      asistenciasValidas.length > 0
        ? Math.round(asistenciasValidas.reduce((a, b) => a + b, 0) / asistenciasValidas.length)
        : 100;

    return {
      total,
      aprobados,
      regulares,
      enRiesgo,
      sinNotas,
      promedioGral,
      asistenciaMedia,
    };
  }, [filteredAlumnos, currentResumenList]);

  // Handle PDF Export
  const handleDownloadPDF = (overrideFormat?: 'academico' | 'firmas_asistencia') => {
    setIsGeneratingPdf(true);
    try {
      downloadStudentsListReport({
        cursoId: selectedCursoId,
        searchQuery: searchQuery.trim(),
        formato: overrideFormat || pdfFormat,
        customAlumnosList: filteredAlumnos,
      });
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 600);
    }
  };

  const activeCourseObj = selectedCursoId === 'all' ? null : grupos.find((g) => g.id_curso === selectedCursoId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Module Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Nómina Oficial y Padrón Escolar
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Descarga en Formato PDF
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Lista de Estudiantes y Descarga en PDF
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Visualiza y gestiona la nómina general de estudiantes matriculados. Filtra por curso, busca por nombre o estado académico y genera el documento oficial en PDF listo para imprimir o archivar.
            </p>
          </div>

          {/* PDF Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="flex bg-slate-800/90 border border-slate-700 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setPdfFormat('academico')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  pdfFormat === 'academico'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Incluye promedios, asistencias, notas y estados de aprobación"
              >
                Académico Completo
              </button>
              <button
                type="button"
                onClick={() => setPdfFormat('firmas_asistencia')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  pdfFormat === 'firmas_asistencia'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Incluye casilleros para firmas del estudiante y control de asistencia física"
              >
                Planilla de Firmas
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadPDF()}
              disabled={isGeneratingPdf || filteredAlumnos.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Lista en PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Estudiantes</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-slate-400">
            {selectedCursoId === 'all' ? 'Toda la institución' : activeCourseObj?.nombre_curso}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-medium">Aprobados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.aprobados}</p>
          <span className="text-[11px] text-slate-400">Promedio ≥ 7.00</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 font-medium">Regulares</span>
            <GraduationCap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.regulares}</p>
          <span className="text-[11px] text-slate-400">Promedio 4.00 - 6.99</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 font-medium">En Riesgo</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-1">{stats.enRiesgo}</p>
          <span className="text-[11px] text-slate-400">Faltas o Prom. &lt; 4.00</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-700 font-medium">Promedio Gral</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{stats.promedioGral}</p>
          <span className="text-[11px] text-slate-400">Calificaciones del grupo</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-700 font-medium">Asistencia Media</span>
            <Percent className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{stats.asistenciaMedia}%</p>
          <span className="text-[11px] text-slate-400">Presentismo general</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar estudiante por nombre, apellido, matrícula (#ID) o curso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Curso Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">Curso:</span>
              <select
                value={selectedCursoId}
                onChange={(e) =>
                  setSelectedCursoId(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Todos los Cursos ({alumnos.length})</option>
                {grupos.map((g) => {
                  const count = alumnos.filter((a) => a.id_curso === g.id_curso).length;
                  return (
                    <option key={g.id_curso} value={g.id_curso}>
                      {g.nombre_curso} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">Condición:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Todos los Estados</option>
                <option value="Aprobado">Aprobados</option>
                <option value="Regular">Regulares</option>
                <option value="En Riesgo">En Riesgo</option>
                <option value="Sin Notas">Sin Notas</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="apellido">Apellido (A-Z)</option>
                <option value="nombre">Nombre (A-Z)</option>
                <option value="id">N° Matrícula</option>
                <option value="promedio">Promedio</option>
                <option value="asistencia">Asistencia %</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs transition-colors cursor-pointer"
                title={`Orden: ${sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedCursoId !== 'all' || statusFilter !== 'all' || searchQuery.trim()) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="text-slate-400 font-medium">Filtros aplicados:</span>
            {selectedCursoId !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Curso: {activeCourseObj?.nombre_curso}
                <button
                  type="button"
                  onClick={() => setSelectedCursoId('all')}
                  className="hover:text-blue-900 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                Estado: {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="hover:text-indigo-900 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Texto: "{searchQuery.trim()}"
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedCursoId('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold underline text-xs ml-auto cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Main Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Nómina Detallada ({filteredAlumnos.length} estudiantes)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en "Descargar PDF" para exportar la nómina completa o descarga el informe individual de cada alumno.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadPDF('academico')}
              disabled={filteredAlumnos.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Descargar PDF Académico con notas y asistencias"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span>PDF Académico</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPDF('firmas_asistencia')}
              disabled={filteredAlumnos.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Descargar Planilla con líneas para firmas de alumnos"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Planilla con Firmas</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-14 text-center">N°</th>
                <th className="py-3 px-4 w-20 text-center">Matrícula</th>
                <th className="py-3 px-4">Estudiante (Apellidos y Nombres)</th>
                <th className="py-3 px-4">Curso / Especialidad</th>
                <th className="py-3 px-4 text-center">Asistencia Diaria</th>
                <th className="py-3 px-4 text-center">Promedio</th>
                <th className="py-3 px-4 text-center">Estado Académico</th>
                <th className="py-3 px-4 text-right">Informe Individual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAlumnos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Users className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700 text-sm">
                        No se encontraron estudiantes
                      </p>
                      <p className="text-xs text-slate-400">
                        {alumnos.length === 0
                          ? 'No hay alumnos registrados en la base de datos.'
                          : 'Prueba modificando los filtros de búsqueda o curso seleccionado.'}
                      </p>
                      {alumnos.length === 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('cursos_alumnos')}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Ir a Cursos y Estudiantes
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAlumnos.map((alumno, index) => {
                  const curso = grupos.find((g) => g.id_curso === alumno.id_curso);
                  const resumen = resumenAlumnos.find((r) => r.alumno.id_alumno === alumno.id_alumno);

                  return (
                    <tr
                      key={alumno.id_alumno}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* N° Orden */}
                      <td className="py-3 px-4 text-center font-mono text-slate-400 font-medium">
                        {index + 1}
                      </td>

                      {/* ID Matrícula */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          #{alumno.id_alumno}
                        </span>
                      </td>

                      {/* Estudiante Nombre */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                            {alumno.nombre[0]}
                            {alumno.apellido[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {alumno.apellido}, {alumno.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Matrícula #{alumno.id_alumno}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Curso */}
                      <td className="py-3 px-4">
                        {curso ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-800 font-medium">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            {curso.nombre_curso}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                            Sin asignar
                          </span>
                        )}
                      </td>

                      {/* Asistencia */}
                      <td className="py-3 px-4 text-center">
                        {resumen ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold ${
                                  resumen.excedeFaltas
                                    ? 'text-rose-600'
                                    : resumen.porcentajeAsistencia >= 85
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {resumen.porcentajeAsistencia}%
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({resumen.asistenciasTotales}/{resumen.totalClasesRegistradas})
                              </span>
                            </div>
                            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  resumen.excedeFaltas
                                    ? 'bg-rose-500'
                                    : resumen.porcentajeAsistencia >= 85
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${resumen.porcentajeAsistencia}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Promedio */}
                      <td className="py-3 px-4 text-center">
                        {resumen && resumen.promedio !== null ? (
                          <span
                            className={`font-mono font-bold text-sm ${
                              resumen.promedio >= 7.0
                                ? 'text-emerald-600'
                                : resumen.promedio >= 4.0
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {resumen.promedio.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Estado Académico Badge */}
                      <td className="py-3 px-4 text-center">
                        {resumen ? (
                          resumen.estadoAprobacion === 'Aprobado' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Aprobado
                            </span>
                          ) : resumen.estadoAprobacion === 'Regular' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <GraduationCap className="w-3 h-3" />
                              Regular
                            </span>
                          ) : resumen.estadoAprobacion === 'En Riesgo' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              En Riesgo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Sin Notas
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Informe Individual PDF */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => downloadStudentReport(alumno.id_alumno)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer"
                          title="Descargar Informe Académico Individual en PDF"
                        >
                          <FileDown className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ficha PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Banner */}
        {filteredAlumnos.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Mostrando <strong>{filteredAlumnos.length}</strong> de <strong>{alumnos.length}</strong> estudiantes matriculados
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadPDF('academico')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Descargar Nómina en PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
