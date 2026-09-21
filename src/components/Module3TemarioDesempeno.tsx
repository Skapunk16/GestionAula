import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { TemarioDia, EstadoDesempeno } from '../types';
import {
  ClipboardList,
  Calendar,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Target,
  Wrench,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';

export const Module3TemarioDesempeno: React.FC = () => {
  const {
    grupos,
    alumnos,
    asistencias,
    temarios,
    desempenos,
    addTemario,
    updateTemario,
    deleteTemario,
    setDesempeno,
    getDesempeno,
    selectedCursoId,
    setSelectedCursoId,
    setActiveTab,
  } = useSchool();

  // Active course
  const activeCursoId = useMemo(() => {
    if (selectedCursoId !== 'all' && grupos.some((g) => g.id_curso === selectedCursoId)) {
      return selectedCursoId;
    }
    return grupos[0]?.id_curso || 1;
  }, [selectedCursoId, grupos]);

  const activeCurso = grupos.find((g) => g.id_curso === activeCursoId);

  // Temarios for active course
  const temariosCurso = useMemo(() => {
    return temarios.filter((t) => t.id_curso === activeCursoId);
  }, [temarios, activeCursoId]);

  // Selected Temario for Checklist view
  const [selectedTemarioId, setSelectedTemarioId] = useState<number | null>(() => {
    return temariosCurso[0]?.id_temario || null;
  });

  // Keep selected temario valid when course changes
  const activeTemario = useMemo(() => {
    if (selectedTemarioId && temariosCurso.some((t) => t.id_temario === selectedTemarioId)) {
      return temariosCurso.find((t) => t.id_temario === selectedTemarioId)!;
    }
    return temariosCurso[0] || null;
  }, [temariosCurso, selectedTemarioId]);

  // Alumnos for active course
  const alumnosCurso = useMemo(() => {
    return alumnos.filter((a) => a.id_curso === activeCursoId);
  }, [alumnos, activeCursoId]);

  // Form State for Temario
  const [isTemarioModalOpen, setIsTemarioModalOpen] = useState(false);
  const [editingTemario, setEditingTemario] = useState<TemarioDia | null>(null);
  const [temarioForm, setTemarioForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    unidad_tematica: '',
    temas: '',
    objetivos: '',
    recursos: '',
  });
  const [temarioError, setTemarioError] = useState('');

  // Handlers for Temario Modal
  const handleOpenNewTemario = () => {
    setEditingTemario(null);
    setTemarioForm({
      fecha: new Date().toISOString().split('T')[0],
      unidad_tematica: '',
      temas: '',
      objetivos: '',
      recursos: '',
    });
    setTemarioError('');
    setIsTemarioModalOpen(true);
  };

  const handleOpenEditTemario = (t: TemarioDia) => {
    setEditingTemario(t);
    setTemarioForm({
      fecha: t.fecha,
      unidad_tematica: t.unidad_tematica,
      temas: t.temas,
      objetivos: t.objetivos,
      recursos: t.recursos,
    });
    setTemarioError('');
    setIsTemarioModalOpen(true);
  };

  const handleSubmitTemario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!temarioForm.unidad_tematica.trim() || !temarioForm.temas.trim()) {
      setTemarioError('La unidad temática y los temas desarrollados son obligatorios');
      return;
    }

    if (editingTemario) {
      updateTemario(editingTemario.id_temario, {
        fecha: temarioForm.fecha,
        id_curso: activeCursoId,
        unidad_tematica: temarioForm.unidad_tematica,
        temas: temarioForm.temas,
        objetivos: temarioForm.objetivos,
        recursos: temarioForm.recursos,
      });
    } else {
      const created = addTemario({
        fecha: temarioForm.fecha,
        id_curso: activeCursoId,
        unidad_tematica: temarioForm.unidad_tematica,
        temas: temarioForm.temas,
        objetivos: temarioForm.objetivos,
        recursos: temarioForm.recursos,
      });
      setSelectedTemarioId(created.id_temario);
    }
    setIsTemarioModalOpen(false);
  };

  // Performance options and color schemes
  const ESTADOS_DESEMPENO: { key: EstadoDesempeno; label: string; bg: string; text: string; border: string }[] = [
    { key: 'Excelente', label: 'Excelente', bg: 'bg-emerald-500 text-white', text: 'text-emerald-700', border: 'border-emerald-300' },
    { key: 'Bueno', label: 'Bueno', bg: 'bg-blue-600 text-white', text: 'text-blue-700', border: 'border-blue-300' },
    { key: 'Regular', label: 'Regular', bg: 'bg-amber-500 text-white', text: 'text-amber-800', border: 'border-amber-300' },
    { key: 'Necesita Refuerzo', label: 'Necesita Refuerzo', bg: 'bg-rose-600 text-white', text: 'text-rose-700', border: 'border-rose-300' },
  ];

  // Performance metrics for currently viewed Temario
  const desempenosCurrentClass = useMemo(() => {
    if (!activeTemario) return [];
    return alumnosCurso.map((alumno) => {
      const estado = getDesempeno(activeTemario.id_temario, alumno.id_alumno);
      // Check attendance for this class's date
      const asistioRecord = asistencias.find(
        (a) => a.id_alumno === alumno.id_alumno && a.fecha === activeTemario.fecha
      );
      const asistio = asistioRecord ? asistioRecord.asistio : null;

      return {
        alumno,
        estado,
        asistio,
      };
    });
  }, [activeTemario, alumnosCurso, desempenos, asistencias, getDesempeno]);

  const performanceStats = useMemo(() => {
    const counts = {
      Excelente: 0,
      Bueno: 0,
      Regular: 0,
      'Necesita Refuerzo': 0,
      SinEvaluar: 0,
    };

    desempenosCurrentClass.forEach((item) => {
      if (item.estado) {
        counts[item.estado]++;
      } else {
        counts.SinEvaluar++;
      }
    });

    return counts;
  }, [desempenosCurrentClass]);

  if (grupos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto shadow-2xs">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No hay cursos para planificar clases</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              La base de datos se encuentra limpia. Primero crea una asignatura o curso para poder registrar unidades temáticas, objetivos, recursos y evaluar el desempeño de los alumnos.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('cursos_alumnos')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Ir a Crear Cursos y Alumnos →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Module Title Header */}
      <div className="bg-gradient-to-r from-violet-50/70 via-indigo-50/50 to-white p-5 rounded-2xl border border-violet-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-100 px-2 py-0.5 rounded">
                Módulo 3
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Contenido del Día y Evaluación de Desempeño
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Planificación académica por sesión técnica con checklist de participación individual en clase.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewTemario}
              className="flex items-center gap-2 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Nueva Planificación de Clase
            </button>
          </div>
        </div>
      </div>

      {/* Course Filter Bar & Class Carousel */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <label className="text-xs font-bold text-slate-700">Curso / Asignatura:</label>
            <select
              value={activeCursoId}
              onChange={(e) => {
                setSelectedCursoId(Number(e.target.value));
                setSelectedTemarioId(null);
              }}
              className="text-xs font-semibold py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {grupos.map((g) => (
                <option key={g.id_curso} value={g.id_curso}>
                  {g.nombre_curso}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500">
            {temariosCurso.length} {temariosCurso.length === 1 ? 'clase planificada' : 'clases planificadas'}
          </span>
        </div>

        {/* List / Tabs of Classes */}
        {temariosCurso.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 text-xs border border-dashed border-slate-300">
            No hay temarios planificados para {activeCurso?.nombre_curso}. Haz clic en &quot;+ Nueva Planificación de Clase&quot; para registrar el contenido de hoy.
          </div>
        ) : (
          <div className="flex overflow-x-auto no-scrollbar gap-3 pb-1">
            {temariosCurso.map((t) => {
              const isSelected = activeTemario?.id_temario === t.id_temario;
              return (
                <button
                  key={t.id_temario}
                  onClick={() => setSelectedTemarioId(t.id_temario)}
                  className={`shrink-0 text-left p-3 rounded-xl border transition-all w-64 ${
                    isSelected
                      ? 'bg-violet-50/70 border-violet-500 ring-2 ring-violet-500/20 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      📅 {t.fecha}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{t.id_temario}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {t.unidad_tematica}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                    {t.temas}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Workspace: Temario Details + Performance Checklist */}
      {activeTemario && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Temario Details Card (Temario_Dia) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                  Plan de Clase #{activeTemario.id_temario}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Fecha: <strong>{activeTemario.fecha}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditTemario(activeTemario)}
                  className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  title="Editar temario"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTemario(activeTemario.id_temario)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Eliminar temario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Unidad Temática */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Unidad Temática
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                {activeTemario.unidad_tematica}
              </h3>
            </div>

            {/* Temas */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Temas Desarrollados
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {activeTemario.temas}
              </p>
            </div>

            {/* Objetivos */}
            {activeTemario.objetivos && (
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  Objetivos de Aprendizaje
                </span>
                <p className="text-xs text-emerald-800 whitespace-pre-line leading-relaxed">
                  {activeTemario.objetivos}
                </p>
              </div>
            )}

            {/* Recursos */}
            {activeTemario.recursos && (
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  Recursos y Equipamiento
                </span>
                <p className="text-xs text-amber-800 whitespace-pre-line leading-relaxed">
                  {activeTemario.recursos}
                </p>
              </div>
            )}

            {/* Performance Summary Pill Box */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 block mb-2">
                Resumen de Participación del Grupo:
              </span>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                  <strong className="block text-sm font-bold">{performanceStats.Excelente}</strong>
                  Excelente
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-800">
                  <strong className="block text-sm font-bold">{performanceStats.Bueno}</strong>
                  Bueno
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
                  <strong className="block text-sm font-bold">{performanceStats.Regular}</strong>
                  Regular
                </div>
                <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 text-rose-800">
                  <strong className="block text-sm font-bold">{performanceStats['Necesita Refuerzo']}</strong>
                  Refuerzo
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Checklist Individual de Participación (Desempeno_Clase) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-violet-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Checklist de Desempeño Individual por Estudiante
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                PK Compuesta: (id_temario: {activeTemario.id_temario}, id_alumno)
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4 text-center">Asistencia Hoy</th>
                    <th className="py-3 px-4 text-center">Nivel de Desempeño / Participación</th>
                    <th className="py-3 px-4 text-center w-28">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {desempenosCurrentClass.map(({ alumno, estado, asistio }) => (
                    <tr key={alumno.id_alumno} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Estudiante */}
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {alumno.nombre[0]}
                            {alumno.apellido[0]}
                          </div>
                          <div>
                            <span className="font-semibold block">
                              {alumno.apellido}, {alumno.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID #{alumno.id_alumno}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Asistencia Indicator */}
                      <td className="py-3 px-4 text-center">
                        {asistio === true && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Presente
                          </span>
                        )}
                        {asistio === false && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Ausente
                          </span>
                        )}
                        {asistio === null && (
                          <span className="text-[10px] text-slate-400">
                            No registrada
                          </span>
                        )}
                      </td>

                      {/* Interactive Segmented Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl gap-1">
                          {ESTADOS_DESEMPENO.map((opt) => {
                            const isSelected = estado === opt.key;
                            return (
                              <button
                                key={opt.key}
                                onClick={() =>
                                  setDesempeno(activeTemario.id_temario, alumno.id_alumno, opt.key)
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                  isSelected
                                    ? `${opt.bg} shadow-xs font-bold scale-[1.02]`
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Current Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {estado ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              estado === 'Excelente'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : estado === 'Bueno'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : estado === 'Regular'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {estado}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Pendiente
                          </span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: Nueva / Editar Planificación de Clase (Temario_Dia) */}
      {isTemarioModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-violet-600" />
                {editingTemario ? 'Modificar Plan de Clase' : 'Registrar Contenido del Día'}
              </h3>
              <button
                onClick={() => setIsTemarioModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTemario} className="space-y-4 mt-4">
              {temarioError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {temarioError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de la Clase *
                  </label>
                  <input
                    type="date"
                    value={temarioForm.fecha}
                    onChange={(e) => setTemarioForm({ ...temarioForm, fecha: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Curso Destino
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeCurso?.nombre_curso || ''}
                    className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidad Temática *
                </label>
                <input
                  type="text"
                  value={temarioForm.unidad_tematica}
                  onChange={(e) => setTemarioForm({ ...temarioForm, unidad_tematica: e.target.value })}
                  placeholder="ej: Unidad 2: Circuitos Lógicos Secuenciales"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temas Específicos Desarrollados *
                </label>
                <textarea
                  rows={2}
                  value={temarioForm.temas}
                  onChange={(e) => setTemarioForm({ ...temarioForm, temas: e.target.value })}
                  placeholder="ej: Flip-Flops tipo D y JK, diagramas de tiempo, contadores asíncronos..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Objetivos Pedagógicos y Técnicos
                </label>
                <textarea
                  rows={2}
                  value={temarioForm.objetivos}
                  onChange={(e) => setTemarioForm({ ...temarioForm, objetivos: e.target.value })}
                  placeholder="ej: Implementar un contador de 0 a 9 en protoboard y verificar su tabla de verdad..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recursos y Equipos de Laboratorio / Taller
                </label>
                <input
                  type="text"
                  value={temarioForm.recursos}
                  onChange={(e) => setTemarioForm({ ...temarioForm, recursos: e.target.value })}
                  placeholder="ej: Circuitos integrados 74LS74, fuente de poder 5V, display 7 segmentos"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTemarioModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs text-white bg-violet-600 hover:bg-violet-700 rounded-xl font-semibold shadow-xs"
                >
                  {editingTemario ? 'Guardar Cambios' : 'Guardar y Evaluar Desempeño'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
