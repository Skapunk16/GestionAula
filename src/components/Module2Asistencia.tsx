import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  CalendarCheck,
  CheckCheck,
  XCircle,
  Calendar,
  BookOpen,
  UserCheck,
  UserX,
  RotateCw,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export const Module2Asistencia: React.FC = () => {
  const {
    grupos,
    alumnos,
    asistencias,
    setAsistencia,
    markBatchAsistencia,
    selectedCursoId,
    setSelectedCursoId,
    selectedFechaAsistencia,
    setSelectedFechaAsistencia,
    maxAbsencesThreshold,
    setActiveTab,
  } = useSchool();

  // Active course for attendance (must be a valid single course)
  const activeCursoId = useMemo(() => {
    if (selectedCursoId !== 'all' && grupos.some((g) => g.id_curso === selectedCursoId)) {
      return selectedCursoId;
    }
    return grupos[0]?.id_curso || 1;
  }, [selectedCursoId, grupos]);

  const activeCurso = grupos.find((g) => g.id_curso === activeCursoId);

  // Alumnos for this specific course
  const alumnosCurso = useMemo(() => {
    return alumnos.filter((a) => a.id_curso === activeCursoId);
  }, [alumnos, activeCursoId]);

  // Date shortcuts
  const handleSetToday = () => {
    setSelectedFechaAsistencia(new Date().toISOString().split('T')[0]);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedFechaAsistencia(d.toISOString().split('T')[0]);
  };

  // State of students for selected date
  const studentsAttendanceState = useMemo(() => {
    return alumnosCurso.map((alumno) => {
      const record = asistencias.find(
        (a) => a.id_alumno === alumno.id_alumno && a.fecha === selectedFechaAsistencia
      );
      // Default to true (presente) if not recorded, or use recorded value
      const asistio = record !== undefined ? record.asistio : true;

      // Cumulative absences for this student across all historical dates
      const totalFaltasAcumuladas = asistencias.filter(
        (a) => a.id_alumno === alumno.id_alumno && !a.asistio
      ).length;

      return {
        alumno,
        asistio,
        totalFaltasAcumuladas,
        excedeFaltas: totalFaltasAcumuladas > maxAbsencesThreshold,
        cercaDelLimite: totalFaltasAcumuladas === maxAbsencesThreshold,
      };
    });
  }, [alumnosCurso, asistencias, selectedFechaAsistencia, maxAbsencesThreshold]);

  // Daily statistics
  const totalAlumnos = studentsAttendanceState.length;
  const presentesCount = studentsAttendanceState.filter((s) => s.asistio).length;
  const ausentesCount = totalAlumnos - presentesCount;
  const porcentajeAsistencia = totalAlumnos > 0 ? Math.round((presentesCount / totalAlumnos) * 100) : 0;

  // Mass action handlers
  const handleMarcarTodosPresentes = () => {
    markBatchAsistencia(activeCursoId, selectedFechaAsistencia, true);
  };

  const handleMarcarTodosAusentes = () => {
    markBatchAsistencia(activeCursoId, selectedFechaAsistencia, false);
  };

  const handleInvertir = () => {
    studentsAttendanceState.forEach((item) => {
      setAsistencia(item.alumno.id_alumno, selectedFechaAsistencia, !item.asistio);
    });
  };

  // Dates with registered attendance for this course
  const registeredDates = useMemo(() => {
    const studentIds = new Set(alumnosCurso.map((a) => a.id_alumno));
    const dates = new Set<string>();
    asistencias.forEach((a) => {
      if (studentIds.has(a.id_alumno)) {
        dates.add(a.fecha);
      }
    });
    return Array.from(dates).sort().reverse();
  }, [alumnosCurso, asistencias]);

  if (grupos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No hay cursos creados para registrar asistencia</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              La base de datos se encuentra en estado inicial limpio. Para registrar el control diario de presencias y ausencias, primero debes crear al menos un curso o grupo académico en el Módulo 1.
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
      <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Módulo 2
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Control de Asistencia Diaria
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Registro diario de presencias y ausencias con marcado masivo y cálculo de inasistencias en tiempo real.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            PK Compuesta: <span className="font-bold text-slate-700">Asistencia (id_alumno, fecha)</span>
          </div>
        </div>
      </div>

      {/* Course & Date Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Dynamic Course Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Seleccionar Curso / Asignatura:
            </label>
            <select
              value={activeCursoId}
              onChange={(e) => setSelectedCursoId(Number(e.target.value))}
              className="w-full text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {grupos.map((g) => (
                <option key={g.id_curso} value={g.id_curso}>
                  {g.nombre_curso} ({alumnos.filter((a) => a.id_curso === g.id_curso).length} alumnos)
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker with Today/Yesterday shortcuts */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Fecha de la Sesión:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedFechaAsistencia}
                onChange={(e) => setSelectedFechaAsistencia(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSetToday}
                className="px-2.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
                title="Cargar fecha de hoy"
              >
                Hoy
              </button>
              <button
                onClick={handleSetYesterday}
                className="px-2.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
                title="Cargar fecha de ayer"
              >
                Ayer
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:col-span-2 lg:col-span-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total</span>
              <span className="text-base font-bold text-slate-800">{totalAlumnos}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Presentes</span>
              <span className="text-base font-bold text-emerald-700">{presentesCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Ausentes</span>
              <span className="text-base font-bold text-rose-700">{ausentesCount}</span>
            </div>
          </div>

        </div>

        {/* Progress Bar of Attendance */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Tasa de Asistencia del Día</span>
            <span className={porcentajeAsistencia >= 80 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
              {porcentajeAsistencia}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                porcentajeAsistencia >= 80 ? 'bg-emerald-500' : porcentajeAsistencia >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${porcentajeAsistencia}%` }}
            />
          </div>
        </div>

        {/* Mass Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">
            Acciones Masivas para esta fecha:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleMarcarTodosPresentes}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-2xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Marcar Todos Presentes
            </button>
            <button
              onClick={handleMarcarTodosAusentes}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium shadow-2xs transition-colors"
            >
              <UserX className="w-3.5 h-3.5" />
              Marcar Todos Ausentes
            </button>
            <button
              onClick={handleInvertir}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              Invertir Selección
            </button>
          </div>
        </div>

      </div>

      {/* Attendance Interactive Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Lista de Asistencia: {activeCurso?.nombre_curso} ({selectedFechaAsistencia})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {alumnosCurso.length} alumnos matriculados
          </span>
        </div>

        {alumnosCurso.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Este curso no tiene alumnos asignados actualmente. Asigna alumnos desde el Módulo 1.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ID</th>
                  <th className="py-3 px-4">Estudiante (Nombre y Apellido)</th>
                  <th className="py-3 px-4 text-center w-36">Marcar Asistencia</th>
                  <th className="py-3 px-4 text-center w-32">Estado del Día</th>
                  <th className="py-3 px-4 text-center w-48">Faltas Acumuladas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsAttendanceState.map(({ alumno, asistio, totalFaltasAcumuladas, excedeFaltas, cercaDelLimite }) => (
                  <tr
                    key={alumno.id_alumno}
                    className={`transition-colors ${
                      asistio ? 'hover:bg-emerald-50/40' : 'bg-rose-50/30 hover:bg-rose-50/60'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-400">
                      #{alumno.id_alumno}
                    </td>

                    {/* Estudiante Avatar + Nombre */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs transition-colors ${
                            asistio ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {alumno.nombre[0]}
                          {alumno.apellido[0]}
                        </div>
                        <div>
                          <span>
                            {alumno.apellido}, {alumno.nombre}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Checkbox interactivo */}
                    <td className="py-3 px-4 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={asistio}
                          onChange={(e) =>
                            setAsistencia(alumno.id_alumno, selectedFechaAsistencia, e.target.checked)
                          }
                          className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        />
                      </label>
                    </td>

                    {/* Badge Estado */}
                    <td className="py-3 px-4 text-center">
                      {asistio ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCheck className="w-3.5 h-3.5" />
                          PRESENTE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          AUSENTE
                        </span>
                      )}
                    </td>

                    {/* Faltas Totales Acumuladas */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            excedeFaltas
                              ? 'bg-rose-600 text-white'
                              : cercaDelLimite
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {totalFaltasAcumuladas} faltas
                        </span>

                        {excedeFaltas && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded border border-rose-300"
                            title="Supera el límite de faltas permitido"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            EXCEDE
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical dates registered for this course */}
      {registeredDates.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Fechas con Asistencias Registradas ({activeCurso?.nombre_curso})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {registeredDates.map((date) => {
              const isCurrent = date === selectedFechaAsistencia;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedFechaAsistencia(date)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {date}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
