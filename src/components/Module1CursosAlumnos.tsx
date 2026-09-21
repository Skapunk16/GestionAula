import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Grupo, Alumno } from '../types';
import {
  BookOpen,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  FileDown,
  FileText,
} from 'lucide-react';

export const Module1CursosAlumnos: React.FC = () => {
  const {
    grupos,
    alumnos,
    addGrupo,
    updateGrupo,
    deleteGrupo,
    addAlumno,
    updateAlumno,
    deleteAlumno,
    downloadStudentReport,
    selectedCursoId,
    setSelectedCursoId,
  } = useSchool();

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state for Grupo
  const [isGrupoModalOpen, setIsGrupoModalOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [grupoForm, setGrupoForm] = useState({ nombre_curso: '', descripcion: '' });
  const [grupoError, setGrupoError] = useState('');

  // Modal / Form state for Alumno
  const [isAlumnoModalOpen, setIsAlumnoModalOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [alumnoForm, setAlumnoForm] = useState<{
    nombre: string;
    apellido: string;
    id_curso: number | '';
  }>({
    nombre: '',
    apellido: '',
    id_curso: '',
  });
  const [alumnoError, setAlumnoError] = useState('');

  // Delete Confirmations
  const [confirmDeleteGrupoId, setConfirmDeleteGrupoId] = useState<number | null>(null);
  const [confirmDeleteAlumnoId, setConfirmDeleteAlumnoId] = useState<number | null>(null);

  // Handlers for Grupo
  const handleOpenNewGrupo = () => {
    setEditingGrupo(null);
    setGrupoForm({ nombre_curso: '', descripcion: '' });
    setGrupoError('');
    setIsGrupoModalOpen(true);
  };

  const handleOpenEditGrupo = (grupo: Grupo) => {
    setEditingGrupo(grupo);
    setGrupoForm({ nombre_curso: grupo.nombre_curso, descripcion: grupo.descripcion });
    setGrupoError('');
    setIsGrupoModalOpen(true);
  };

  const handleSubmitGrupo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoForm.nombre_curso.trim()) {
      setGrupoError('El nombre del curso es obligatorio');
      return;
    }
    if (editingGrupo) {
      updateGrupo(editingGrupo.id_curso, grupoForm.nombre_curso, grupoForm.descripcion);
    } else {
      addGrupo(grupoForm.nombre_curso, grupoForm.descripcion);
    }
    setIsGrupoModalOpen(false);
  };

  // Handlers for Alumno
  const handleOpenNewAlumno = () => {
    setEditingAlumno(null);
    setAlumnoForm({
      nombre: '',
      apellido: '',
      id_curso: selectedCursoId === 'all' ? (grupos[0]?.id_curso || '') : selectedCursoId,
    });
    setAlumnoError('');
    setIsAlumnoModalOpen(true);
  };

  const handleOpenEditAlumno = (alumno: Alumno) => {
    setEditingAlumno(alumno);
    setAlumnoForm({
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      id_curso: alumno.id_curso ?? '',
    });
    setAlumnoError('');
    setIsAlumnoModalOpen(true);
  };

  const handleSubmitAlumno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumnoForm.nombre.trim() || !alumnoForm.apellido.trim()) {
      setAlumnoError('Nombre y apellido son obligatorios');
      return;
    }

    const cursoIdValue = alumnoForm.id_curso === '' ? null : Number(alumnoForm.id_curso);

    if (editingAlumno) {
      updateAlumno(
        editingAlumno.id_alumno,
        alumnoForm.nombre,
        alumnoForm.apellido,
        cursoIdValue
      );
    } else {
      addAlumno(alumnoForm.nombre, alumnoForm.apellido, cursoIdValue);
    }
    setIsAlumnoModalOpen(false);
  };

  // Filtered Alumnos
  const filteredAlumnos = alumnos.filter((alumno) => {
    const matchesCurso =
      selectedCursoId === 'all' || alumno.id_curso === selectedCursoId;
    const matchesQuery =
      `${alumno.nombre} ${alumno.apellido}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumno.id_alumno.toString() === searchQuery.trim();

    return matchesCurso && matchesQuery;
  });

  return (
    <div className="space-y-8">
      
      {/* Introduction Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white p-5 rounded-2xl border border-blue-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
              Módulo 1
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Gestión de Cursos y Estudiantes
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Administración de grupos académicos (asignaturas técnicas) y registro oficial de alumnos con estado de certificación.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenNewGrupo}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-medium text-xs shadow-xs transition-colors"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            + Nuevo Grupo / Curso
          </button>
          <button
            onClick={handleOpenNewAlumno}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Registrar Alumno
          </button>
        </div>
      </div>

      {/* SECTION 1: Cursos / Grupos Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Cursos Técnicos y Asignaturas ({grupos.length})
          </h3>
          <span className="text-xs text-slate-500">
            Tabla relacional: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">Grupo (id_curso, nombre_curso, descripcion)</code>
          </span>
        </div>

        {grupos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-800">No hay cursos ni asignaturas registradas</h4>
              <p className="text-xs text-slate-500 mt-1">
                La base de datos se encuentra en estado inicial limpio. Da de alta la primera asignatura técnica para comenzar a registrar contenidos y alumnos.
              </p>
            </div>
            <button
              onClick={handleOpenNewGrupo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Crear Primer Curso / Grupo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {grupos.map((grupo) => {
              const countAlumnos = alumnos.filter((a) => a.id_curso === grupo.id_curso).length;
              const isSelected = selectedCursoId === grupo.id_curso;

              return (
                <div
                  key={grupo.id_curso}
                  className={`relative p-4 rounded-xl border transition-all duration-200 bg-white ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        ID #{grupo.id_curso}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                        {countAlumnos} {countAlumnos === 1 ? 'estudiante' : 'estudiantes'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditGrupo(grupo)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        title="Editar curso"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteGrupoId(grupo.id_curso)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 mt-2 text-sm leading-snug">
                    {grupo.nombre_curso}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {grupo.descripcion || 'Sin descripción especificada.'}
                  </p>

                  {/* Filter shortcut */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCursoId(isSelected ? 'all' : grupo.id_curso)}
                      className={`text-xs font-medium transition-colors ${
                        isSelected
                          ? 'text-blue-600 font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isSelected ? '✓ Filtrando nómina' : 'Filtrar alumnos →'}
                    </button>
                  </div>

                  {/* Confirm Delete Popup */}
                  {confirmDeleteGrupoId === grupo.id_curso && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-xl p-4 flex flex-col justify-center items-center text-center z-10">
                      <AlertCircle className="w-8 h-8 text-rose-500 mb-1" />
                      <p className="text-xs font-bold text-slate-800">¿Eliminar este curso?</p>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Los alumnos asignados quedarán sin grupo (id_curso = null).
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteGrupoId(null)}
                          className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            deleteGrupo(grupo.id_curso);
                            setConfirmDeleteGrupoId(null);
                          }}
                          className="px-2.5 py-1 text-xs bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700"
                        >
                          Sí, eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Nómina de Alumnos */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Nómina Oficial de Estudiantes ({filteredAlumnos.length} de {alumnos.length})
            </h3>
            <span className="text-xs text-slate-500">
              Tabla relacional: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">Alumnos (id_alumno, nombre, apellido, id_curso)</code>
            </span>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, apellido o ID..."
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl w-48 sm:w-60 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Course Filter Dropdown */}
            <select
              value={selectedCursoId}
              onChange={(e) =>
                setSelectedCursoId(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Cursos ({alumnos.length})</option>
              {grupos.map((g) => (
                <option key={g.id_curso} value={g.id_curso}>
                  {g.nombre_curso}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table of Alumnos */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">ID</th>
                  <th className="py-3 px-4">Estudiante (Nombre y Apellido)</th>
                  <th className="py-3 px-4">Curso / Asignatura Asignada</th>
                  <th className="py-3 px-4 text-center">Informe del Estudiante</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {alumnos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-700 text-sm">No hay estudiantes registrados</p>
                        <p className="text-xs text-slate-400">
                          La nómina escolar está limpia. Inscribe a tu primer estudiante técnico para comenzar.
                        </p>
                        <button
                          onClick={handleOpenNewAlumno}
                          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          + Inscribir Primer Alumno
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredAlumnos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No se encontraron alumnos con los criterios de búsqueda seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredAlumnos.map((alumno) => {
                    const curso = grupos.find((g) => g.id_curso === alumno.id_curso);

                    return (
                      <tr key={alumno.id_alumno} className="hover:bg-slate-50/80 transition-colors">
                        {/* ID */}
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-500">
                          #{alumno.id_alumno}
                        </td>

                        {/* Estudiante Avatar + Nombre */}
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {alumno.nombre[0]}
                              {alumno.apellido[0]}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900">
                                {alumno.apellido}, {alumno.nombre}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Curso Asignado */}
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

                        {/* Informe del Estudiante PDF */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => downloadStudentReport(alumno.id_alumno)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer"
                            title="Generar y descargar Informe Académico Oficial en PDF"
                          >
                            <FileDown className="w-3.5 h-3.5 text-blue-600" />
                            <span>Descargar PDF</span>
                          </button>
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => downloadStudentReport(alumno.id_alumno)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Descargar informe oficial en PDF"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditAlumno(alumno)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar alumno"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteAlumnoId(alumno.id_alumno)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar alumno"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Inline confirm delete */}
                          {confirmDeleteAlumnoId === alumno.id_alumno && (
                            <div className="absolute right-4 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-20 text-left">
                              <p className="text-xs font-bold text-slate-800 mb-1">
                                ¿Eliminar a {alumno.nombre}?
                              </p>
                              <p className="text-[10px] text-slate-500 mb-2">
                                Se eliminarán sus asistencias, desempeño y notas asociadas.
                              </p>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setConfirmDeleteAlumnoId(null)}
                                  className="px-2 py-0.5 text-xs bg-slate-100 rounded hover:bg-slate-200"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => {
                                    deleteAlumno(alumno.id_alumno);
                                    setConfirmDeleteAlumnoId(null);
                                  }}
                                  className="px-2 py-0.5 text-xs bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
                                >
                                  Confirmar
                                </button>
                              </div>
                            </div>
                          )}
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

      {/* MODAL: Formulario Curso / Grupo */}
      {isGrupoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {editingGrupo ? 'Editar Curso / Asignatura' : 'Alta de Nuevo Grupo'}
              </h3>
              <button
                onClick={() => setIsGrupoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGrupo} className="space-y-4 mt-4">
              {grupoError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {grupoError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Curso / Asignatura *
                </label>
                <input
                  type="text"
                  value={grupoForm.nombre_curso}
                  onChange={(e) => setGrupoForm({ ...grupoForm, nombre_curso: e.target.value })}
                  placeholder="ej: Electrónica Industrial y PLC"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción Técnica del Curso
                </label>
                <textarea
                  rows={3}
                  value={grupoForm.descripcion}
                  onChange={(e) => setGrupoForm({ ...grupoForm, descripcion: e.target.value })}
                  placeholder="Detalles sobre el contenido, taller o perfil del curso..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGrupoModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow-xs"
                >
                  {editingGrupo ? 'Guardar Cambios' : 'Crear Grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Formulario Alumno */}
      {isAlumnoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {editingAlumno ? 'Modificar Datos de Alumno' : 'Registro de Nuevo Alumno'}
              </h3>
              <button
                onClick={() => setIsAlumnoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAlumno} className="space-y-4 mt-4">
              {alumnoError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {alumnoError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={alumnoForm.nombre}
                    onChange={(e) => setAlumnoForm({ ...alumnoForm, nombre: e.target.value })}
                    placeholder="ej: Carlos"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={alumnoForm.apellido}
                    onChange={(e) => setAlumnoForm({ ...alumnoForm, apellido: e.target.value })}
                    placeholder="ej: Gutiérrez"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asignación Directa a Grupo / Curso
                </label>
                <select
                  value={alumnoForm.id_curso}
                  onChange={(e) =>
                    setAlumnoForm({
                      ...alumnoForm,
                      id_curso: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Sin grupo asignado --</option>
                  {grupos.map((g) => (
                    <option key={g.id_curso} value={g.id_curso}>
                      {g.nombre_curso}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-blue-900 leading-relaxed">
                  <span className="font-semibold block text-blue-950">Informe Académico Oficial en PDF</span>
                  El sistema generará el informe descargable con todas las calificaciones, asistencias y seguimiento temático del estudiante.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAlumnoModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow-xs"
                >
                  {editingAlumno ? 'Actualizar Alumno' : 'Registrar Alumno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
