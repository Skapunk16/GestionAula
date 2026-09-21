// Types for the 6 relational tables of the Technical School Management System

export type EstadoDesempeno = 'Excelente' | 'Bueno' | 'Regular' | 'Necesita Refuerzo';

// 1. Grupo (Cursos / Asignaturas)
export interface Grupo {
  id_curso: number; // PK, Autoincremental
  nombre_curso: string; // VARCHAR, Obligatorio
  descripcion: string; // TEXT
}

// 2. Alumnos (Estudiantes)
export interface Alumno {
  id_alumno: number; // PK, Autoincremental
  nombre: string; // VARCHAR, Obligatorio
  apellido: string; // VARCHAR, Obligatorio
  id_curso: number | null; // FK hacia Grupo, Opcional/Nullable
  certificado: boolean; // BOOLEAN / TINYINT, por defecto false
}

// 3. Asistencia (Control Diario)
// Primary Key compuesta: (id_alumno, fecha)
export interface Asistencia {
  id_alumno: number; // FK hacia Alumnos
  fecha: string; // DATE (formato YYYY-MM-DD)
  asistio: boolean; // BOOLEAN
}

// 4. Temario_Dia (Planificación Académica)
export interface TemarioDia {
  id_temario: number; // PK, Autoincremental
  fecha: string; // DATE (formato YYYY-MM-DD)
  id_curso: number; // FK hacia Grupo
  unidad_tematica: string; // VARCHAR
  temas: string; // TEXT
  objetivos: string; // TEXT
  recursos: string; // TEXT
}

// 5. Desempeno_Clase (Checklist de Participación)
// Primary Key compuesta: (id_temario, id_alumno)
export interface DesempenoClase {
  id_temario: number; // FK hacia Temario_Dia
  id_alumno: number; // FK hacia Alumnos
  estado_desempeno: EstadoDesempeno; // ENUM: 'Excelente' | 'Bueno' | 'Regular' | 'Necesita Refuerzo'
}

// 6. Notas (Calificaciones)
export interface Nota {
  id_nota: number; // PK, Autoincremental
  id_alumno: number; // FK hacia Alumnos
  tipo_evaluacion: string; // VARCHAR — ej: "Parcial 1", "Examen Final"
  nota: number; // DECIMAL, rango de 0.00 a 10.00
}

// UI Navigation Tabs
export type TabKey = 'cursos_alumnos' | 'asistencia' | 'temario_desempeno' | 'calificaciones_alertas' | 'sql_export';

// Dynamic Student Academic Summary
export interface ResumenAlumno {
  alumno: Alumno;
  curso: Grupo | null;
  promedio: number | null;
  totalNotas: number;
  notas: Nota[];
  faltasTotales: number;
  asistenciasTotales: number;
  totalClasesRegistradas: number;
  porcentajeAsistencia: number;
  excedeFaltas: boolean;
  estadoAprobacion: 'Aprobado' | 'Regular' | 'En Riesgo' | 'Sin Notas';
}
