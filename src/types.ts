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
  certificado?: boolean; // Obsoleto (reemplazado por Informe Académico PDF)
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
export type TabKey =
  | 'cursos_alumnos'
  | 'lista_estudiantes'
  | 'asistencia'
  | 'temario_desempeno'
  | 'calificaciones_alertas'
  | 'sql_export'
  | 'backups_usuarios';

// Administrator User Profile for Multi-User Management
export type UserRole = 'SuperAdmin' | 'Administrador' | 'Docente';

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  nombre: string;
  rol: UserRole;
  createdAt: string;
}

// Database Snapshot / Backup for Recovery
export interface DatabaseBackup {
  id: string;
  name: string;
  timestamp: string;
  username: string;
  isAutoBackup?: boolean;
  counts: {
    grupos: number;
    alumnos: number;
    asistencias: number;
    temarios: number;
    desempenos: number;
    notas: number;
  };
  data: {
    grupos: Grupo[];
    alumnos: Alumno[];
    asistencias: Asistencia[];
    temarios: TemarioDia[];
    desempenos: DesempenoClase[];
    notas: Nota[];
    maxAbsencesThreshold: number;
    databaseUrl?: string;
  };
}

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

// UI Theme Styles
export type ThemeId =
  | 'classic_slate'
  | 'minimal_white'
  | 'midnight_dark'
  | 'cyber_neon'
  | 'emerald_campus'
  | 'sunset_amber'
  | 'royal_purple'
  | 'high_contrast';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  category: 'Clásico' | 'Modo Oscuro' | 'Colorido' | 'Accesibilidad';
  isDark: boolean;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    border: string;
    text: string;
  };
}
