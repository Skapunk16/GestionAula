import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Grupo,
  Alumno,
  Asistencia,
  TemarioDia,
  DesempenoClase,
  Nota,
  EstadoDesempeno,
  ResumenAlumno,
  TabKey,
} from '../types';
import {
  INITIAL_GRUPOS,
  INITIAL_ALUMNOS,
  INITIAL_ASISTENCIAS,
  INITIAL_TEMARIOS,
  INITIAL_DESEMPENOS,
  INITIAL_NOTAS,
  DEMO_GRUPOS,
  DEMO_ALUMNOS,
  DEMO_ASISTENCIAS,
  DEMO_TEMARIOS,
  DEMO_DESEMPENOS,
  DEMO_NOTAS,
} from '../data/initialData';

interface SchoolContextType {
  // Authentication
  isAuthenticated: boolean;
  currentUser: string | null;
  login: (user: string, pass: string) => boolean;
  logout: () => void;

  // Cloud Database configuration
  databaseUrl: string;
  setDatabaseUrl: (url: string) => void;

  // Active Tab
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;

  // Configuration
  maxAbsencesThreshold: number;
  setMaxAbsencesThreshold: (limit: number) => void;

  // Selected state filters
  selectedCursoId: number | 'all';
  setSelectedCursoId: (id: number | 'all') => void;
  selectedFechaAsistencia: string;
  setSelectedFechaAsistencia: (fecha: string) => void;

  // 6 Tables
  grupos: Grupo[];
  alumnos: Alumno[];
  asistencias: Asistencia[];
  temarios: TemarioDia[];
  desempenos: DesempenoClase[];
  notas: Nota[];

  // Grupo actions
  addGrupo: (nombre_curso: string, descripcion: string) => Grupo;
  updateGrupo: (id_curso: number, nombre_curso: string, descripcion: string) => void;
  deleteGrupo: (id_curso: number) => void;

  // Alumno actions
  addAlumno: (nombre: string, apellido: string, id_curso: number | null, certificado: boolean) => Alumno;
  updateAlumno: (id_alumno: number, nombre: string, apellido: string, id_curso: number | null, certificado: boolean) => void;
  deleteAlumno: (id_alumno: number) => void;
  toggleCertificado: (id_alumno: number) => void;

  // Asistencia actions
  setAsistencia: (id_alumno: number, fecha: string, asistio: boolean) => void;
  markBatchAsistencia: (id_curso: number, fecha: string, asistio: boolean) => void;
  getAsistencia: (id_alumno: number, fecha: string) => boolean | null;

  // Temario_Dia actions
  addTemario: (data: Omit<TemarioDia, 'id_temario'>) => TemarioDia;
  updateTemario: (id_temario: number, data: Omit<TemarioDia, 'id_temario'>) => void;
  deleteTemario: (id_temario: number) => void;

  // Desempeno_Clase actions
  setDesempeno: (id_temario: number, id_alumno: number, estado: EstadoDesempeno) => void;
  getDesempeno: (id_temario: number, id_alumno: number) => EstadoDesempeno | null;

  // Notas actions
  addNota: (id_alumno: number, tipo_evaluacion: string, nota: number) => Nota;
  updateNota: (id_nota: number, tipo_evaluacion: string, nota: number) => void;
  deleteNota: (id_nota: number) => void;

  // Analytics & Summary
  resumenAlumnos: ResumenAlumno[];
  totalAlumnosEnRiesgo: number;
  promedioGeneralInstitucional: number;

  // Reset, Clear & Export
  clearAllData: () => void;
  loadDemoData: () => void;
  resetToDefaults: () => void;
  generatePostgreSQLScript: () => string;
}

const LOCAL_STORAGE_KEY = 'gestion_escolar_v2_clean';
const AUTH_SESSION_KEY = 'gestion_escolar_auth_session';

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication state - starts locked by default
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return isAuthenticated ? 'admin' : null;
  });

  const login = (user: string, pass: string): boolean => {
    if (user.trim() === 'admin' && pass === 'Brasil.2026') {
      setIsAuthenticated(true);
      setCurrentUser('admin');
      try {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      } catch {
        // Ignore session storage error
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  // Cloud Database URL State
  const [databaseUrl, setDatabaseUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(`${LOCAL_STORAGE_KEY}_db_url`) || '';
    } catch {
      return '';
    }
  });

  const [activeTab, setActiveTab] = useState<TabKey>('cursos_alumnos');
  const [maxAbsencesThreshold, setMaxAbsencesThreshold] = useState<number>(5);

  const [selectedCursoId, setSelectedCursoId] = useState<number | 'all'>('all');
  const [selectedFechaAsistencia, setSelectedFechaAsistencia] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Table states with persistence (defaulting to clean empty templates)
  const [grupos, setGrupos] = useState<Grupo[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_grupos`);
      return saved ? JSON.parse(saved) : INITIAL_GRUPOS;
    } catch {
      return INITIAL_GRUPOS;
    }
  });

  const [alumnos, setAlumnos] = useState<Alumno[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alumnos`);
      return saved ? JSON.parse(saved) : INITIAL_ALUMNOS;
    } catch {
      return INITIAL_ALUMNOS;
    }
  });

  const [asistencias, setAsistencias] = useState<Asistencia[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_asistencias`);
      return saved ? JSON.parse(saved) : INITIAL_ASISTENCIAS;
    } catch {
      return INITIAL_ASISTENCIAS;
    }
  });

  const [temarios, setTemarios] = useState<TemarioDia[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_temarios`);
      return saved ? JSON.parse(saved) : INITIAL_TEMARIOS;
    } catch {
      return INITIAL_TEMARIOS;
    }
  });

  const [desempenos, setDesempenos] = useState<DesempenoClase[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_desempenos`);
      return saved ? JSON.parse(saved) : INITIAL_DESEMPENOS;
    } catch {
      return INITIAL_DESEMPENOS;
    }
  });

  const [notas, setNotas] = useState<Nota[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notas`);
      return saved ? JSON.parse(saved) : INITIAL_NOTAS;
    } catch {
      return INITIAL_NOTAS;
    }
  });

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_grupos`, JSON.stringify(grupos));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_alumnos`, JSON.stringify(alumnos));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_asistencias`, JSON.stringify(asistencias));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_temarios`, JSON.stringify(temarios));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_desempenos`, JSON.stringify(desempenos));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notas`, JSON.stringify(notas));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_max_absences`, JSON.stringify(maxAbsencesThreshold));
      if (databaseUrl) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_db_url`, databaseUrl);
      }
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [grupos, alumnos, asistencias, temarios, desempenos, notas, maxAbsencesThreshold, databaseUrl]);

  // Load saved threshold on mount
  useEffect(() => {
    try {
      const savedLimit = localStorage.getItem(`${LOCAL_STORAGE_KEY}_max_absences`);
      if (savedLimit) {
        setMaxAbsencesThreshold(JSON.parse(savedLimit));
      }
    } catch {
      // ignore
    }
  }, []);

  // --- CRUD: Grupos ---
  const addGrupo = (nombre_curso: string, descripcion: string): Grupo => {
    const nextId = grupos.length > 0 ? Math.max(...grupos.map((g) => g.id_curso)) + 1 : 1;
    const newGrupo: Grupo = {
      id_curso: nextId,
      nombre_curso: nombre_curso.trim(),
      descripcion: descripcion.trim(),
    };
    setGrupos((prev) => [...prev, newGrupo]);
    return newGrupo;
  };

  const updateGrupo = (id_curso: number, nombre_curso: string, descripcion: string) => {
    setGrupos((prev) =>
      prev.map((g) => (g.id_curso === id_curso ? { ...g, nombre_curso: nombre_curso.trim(), descripcion: descripcion.trim() } : g))
    );
  };

  const deleteGrupo = (id_curso: number) => {
    setGrupos((prev) => prev.filter((g) => g.id_curso !== id_curso));
    // Set alumnos in this course to id_curso = null (Foreign key ON DELETE SET NULL)
    setAlumnos((prev) => prev.map((a) => (a.id_curso === id_curso ? { ...a, id_curso: null } : a)));
    // Delete temarios for this course and their child desempenos
    const temariosToDelete = temarios.filter((t) => t.id_curso === id_curso).map((t) => t.id_temario);
    setTemarios((prev) => prev.filter((t) => t.id_curso !== id_curso));
    setDesempenos((prev) => prev.filter((d) => !temariosToDelete.includes(d.id_temario)));
  };

  // --- CRUD: Alumnos ---
  const addAlumno = (nombre: string, apellido: string, id_curso: number | null, certificado: boolean): Alumno => {
    const nextId = alumnos.length > 0 ? Math.max(...alumnos.map((a) => a.id_alumno)) + 1 : 1;
    const newAlumno: Alumno = {
      id_alumno: nextId,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      id_curso,
      certificado,
    };
    setAlumnos((prev) => [...prev, newAlumno]);
    return newAlumno;
  };

  const updateAlumno = (id_alumno: number, nombre: string, apellido: string, id_curso: number | null, certificado: boolean) => {
    setAlumnos((prev) =>
      prev.map((a) =>
        a.id_alumno === id_alumno
          ? { ...a, nombre: nombre.trim(), apellido: apellido.trim(), id_curso, certificado }
          : a
      )
    );
  };

  const deleteAlumno = (id_alumno: number) => {
    // Cascade delete on related tables (Asistencia, Desempeno, Notas)
    setAlumnos((prev) => prev.filter((a) => a.id_alumno !== id_alumno));
    setAsistencias((prev) => prev.filter((asist) => asist.id_alumno !== id_alumno));
    setDesempenos((prev) => prev.filter((d) => d.id_alumno !== id_alumno));
    setNotas((prev) => prev.filter((n) => n.id_alumno !== id_alumno));
  };

  const toggleCertificado = (id_alumno: number) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id_alumno === id_alumno ? { ...a, certificado: !a.certificado } : a))
    );
  };

  // --- CRUD: Asistencia (Composite PK: id_alumno, fecha) ---
  const setAsistencia = (id_alumno: number, fecha: string, asistio: boolean) => {
    setAsistencias((prev) => {
      const index = prev.findIndex((item) => item.id_alumno === id_alumno && item.fecha === fecha);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { id_alumno, fecha, asistio };
        return updated;
      } else {
        return [...prev, { id_alumno, fecha, asistio }];
      }
    });
  };

  const markBatchAsistencia = (id_curso: number, fecha: string, asistio: boolean) => {
    const courseAlumnos = alumnos.filter((a) => a.id_curso === id_curso);
    const alumnoIds = new Set(courseAlumnos.map((a) => a.id_alumno));

    setAsistencias((prev) => {
      const others = prev.filter((item) => !(alumnoIds.has(item.id_alumno) && item.fecha === fecha));
      const newItems: Asistencia[] = courseAlumnos.map((a) => ({
        id_alumno: a.id_alumno,
        fecha,
        asistio,
      }));
      return [...others, ...newItems];
    });
  };

  const getAsistencia = (id_alumno: number, fecha: string): boolean | null => {
    const item = asistencias.find((a) => a.id_alumno === id_alumno && a.fecha === fecha);
    return item ? item.asistio : null;
  };

  // --- CRUD: Temario_Dia ---
  const addTemario = (data: Omit<TemarioDia, 'id_temario'>): TemarioDia => {
    const nextId = temarios.length > 0 ? Math.max(...temarios.map((t) => t.id_temario)) + 1 : 1;
    const newTemario: TemarioDia = {
      ...data,
      id_temario: nextId,
    };
    setTemarios((prev) => [newTemario, ...prev]);
    return newTemario;
  };

  const updateTemario = (id_temario: number, data: Omit<TemarioDia, 'id_temario'>) => {
    setTemarios((prev) =>
      prev.map((t) => (t.id_temario === id_temario ? { ...data, id_temario } : t))
    );
  };

  const deleteTemario = (id_temario: number) => {
    setTemarios((prev) => prev.filter((t) => t.id_temario !== id_temario));
    setDesempenos((prev) => prev.filter((d) => d.id_temario !== id_temario));
  };

  // --- CRUD: Desempeno_Clase (Composite PK: id_temario, id_alumno) ---
  const setDesempeno = (id_temario: number, id_alumno: number, estado: EstadoDesempeno) => {
    setDesempenos((prev) => {
      const index = prev.findIndex((d) => d.id_temario === id_temario && d.id_alumno === id_alumno);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { id_temario, id_alumno, estado_desempeno: estado };
        return updated;
      } else {
        return [...prev, { id_temario, id_alumno, estado_desempeno: estado }];
      }
    });
  };

  const getDesempeno = (id_temario: number, id_alumno: number): EstadoDesempeno | null => {
    const item = desempenos.find((d) => d.id_temario === id_temario && d.id_alumno === id_alumno);
    return item ? item.estado_desempeno : null;
  };

  // --- CRUD: Notas ---
  const addNota = (id_alumno: number, tipo_evaluacion: string, notaValue: number): Nota => {
    const nextId = notas.length > 0 ? Math.max(...notas.map((n) => n.id_nota)) + 1 : 1;
    const cleanNota = Math.max(0, Math.min(10, Number(notaValue.toFixed(2))));
    const newNota: Nota = {
      id_nota: nextId,
      id_alumno,
      tipo_evaluacion: tipo_evaluacion.trim(),
      nota: cleanNota,
    };
    setNotas((prev) => [...prev, newNota]);
    return newNota;
  };

  const updateNota = (id_nota: number, tipo_evaluacion: string, notaValue: number) => {
    const cleanNota = Math.max(0, Math.min(10, Number(notaValue.toFixed(2))));
    setNotas((prev) =>
      prev.map((n) =>
        n.id_nota === id_nota
          ? { ...n, tipo_evaluacion: tipo_evaluacion.trim(), nota: cleanNota }
          : n
      )
    );
  };

  const deleteNota = (id_nota: number) => {
    setNotas((prev) => prev.filter((n) => n.id_nota !== id_nota));
  };

  // --- Global Student Analytics Summary ---
  const resumenAlumnos = useMemo<ResumenAlumno[]>(() => {
    return alumnos.map((alumno) => {
      const curso = grupos.find((g) => g.id_curso === alumno.id_curso) || null;
      const studentNotas = notas.filter((n) => n.id_alumno === alumno.id_alumno);
      const studentAsistencias = asistencias.filter((a) => a.id_alumno === alumno.id_alumno);

      const faltasTotales = studentAsistencias.filter((a) => !a.asistio).length;
      const asistenciasTotales = studentAsistencias.filter((a) => a.asistio).length;
      const totalClasesRegistradas = studentAsistencias.length;
      const porcentajeAsistencia =
        totalClasesRegistradas > 0
          ? Math.round((asistenciasTotales / totalClasesRegistradas) * 100)
          : 100;

      const promedio =
        studentNotas.length > 0
          ? Number(
              (
                studentNotas.reduce((acc, curr) => acc + curr.nota, 0) / studentNotas.length
              ).toFixed(2)
            )
          : null;

      const excedeFaltas = faltasTotales > maxAbsencesThreshold;

      let estadoAprobacion: 'Aprobado' | 'Regular' | 'En Riesgo' | 'Sin Notas' = 'Sin Notas';
      if (promedio !== null) {
        if (excedeFaltas || promedio < 4.0) {
          estadoAprobacion = 'En Riesgo';
        } else if (promedio >= 7.0) {
          estadoAprobacion = 'Aprobado';
        } else {
          estadoAprobacion = 'Regular';
        }
      } else if (excedeFaltas) {
        estadoAprobacion = 'En Riesgo';
      }

      return {
        alumno,
        curso,
        promedio,
        totalNotas: studentNotas.length,
        notas: studentNotas,
        faltasTotales,
        asistenciasTotales,
        totalClasesRegistradas,
        porcentajeAsistencia,
        excedeFaltas,
        estadoAprobacion,
      };
    });
  }, [alumnos, grupos, notas, asistencias, maxAbsencesThreshold]);

  const totalAlumnosEnRiesgo = useMemo(() => {
    return resumenAlumnos.filter((r) => r.excedeFaltas).length;
  }, [resumenAlumnos]);

  const promedioGeneralInstitucional = useMemo(() => {
    const validPromedios = resumenAlumnos
      .map((r) => r.promedio)
      .filter((p): p is number => p !== null);
    if (validPromedios.length === 0) return 0;
    return Number(
      (validPromedios.reduce((acc, curr) => acc + curr, 0) / validPromedios.length).toFixed(2)
    );
  }, [resumenAlumnos]);

  // Clean Slate: Reset to 100% empty state (no courses, no students)
  const clearAllData = () => {
    setGrupos([]);
    setAlumnos([]);
    setAsistencias([]);
    setTemarios([]);
    setDesempenos([]);
    setNotas([]);
    setSelectedCursoId('all');
    setMaxAbsencesThreshold(5);
  };

  // Optional: Load sample demo data for quick review
  const loadDemoData = () => {
    setGrupos(DEMO_GRUPOS);
    setAlumnos(DEMO_ALUMNOS);
    setAsistencias(DEMO_ASISTENCIAS);
    setTemarios(DEMO_TEMARIOS);
    setDesempenos(DEMO_DESEMPENOS);
    setNotas(DEMO_NOTAS);
    setSelectedCursoId('all');
    setMaxAbsencesThreshold(5);
  };

  const resetToDefaults = clearAllData;

  // Generate full PostgreSQL DDL + optional data script
  const generatePostgreSQLScript = (): string => {
    const hasData = grupos.length > 0 || alumnos.length > 0;

    return `-- ==========================================================
-- GESTIÓN ESCOLAR INTEGRAL - ESQUEMA DE BASE DE DATOS POSTGRESQL
-- Compatible con: Supabase, Neon, Vercel Postgres, PostgreSQL 14+
-- Conexión Cloud: DATABASE_URL="postgresql://...sslmode=require"
-- ==========================================================

-- 1. TABLA: Grupo (Cursos / Asignaturas Técnicas)
CREATE TABLE IF NOT EXISTS "Grupo" (
    "id_curso" SERIAL PRIMARY KEY,
    "nombre_curso" VARCHAR(255) NOT NULL,
    "descripcion" TEXT
);

-- 2. TABLA: Alumnos (Estudiantes Técnicos)
CREATE TABLE IF NOT EXISTS "Alumnos" (
    "id_alumno" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "id_curso" INTEGER REFERENCES "Grupo"("id_curso") ON DELETE SET NULL,
    "certificado" BOOLEAN DEFAULT false NOT NULL
);

-- 3. TABLA: Asistencia (Control Diario de Presencias)
-- Primary Key Compuesta: (id_alumno, fecha)
CREATE TABLE IF NOT EXISTS "Asistencia" (
    "id_alumno" INTEGER NOT NULL REFERENCES "Alumnos"("id_alumno") ON DELETE CASCADE,
    "fecha" DATE NOT NULL,
    "asistio" BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY ("id_alumno", "fecha")
);

-- 4. TABLA: Temario_Dia (Planificación Académica y Contenidos)
CREATE TABLE IF NOT EXISTS "Temario_Dia" (
    "id_temario" SERIAL PRIMARY KEY,
    "fecha" DATE NOT NULL,
    "id_curso" INTEGER NOT NULL REFERENCES "Grupo"("id_curso") ON DELETE CASCADE,
    "unidad_tematica" VARCHAR(255) NOT NULL,
    "temas" TEXT,
    "objetivos" TEXT,
    "recursos" TEXT
);

-- 5. TABLA: Desempeno_Clase (Checklist de Participación Individual)
-- Primary Key Compuesta: (id_temario, id_alumno)
CREATE TABLE IF NOT EXISTS "Desempeno_Clase" (
    "id_temario" INTEGER NOT NULL REFERENCES "Temario_Dia"("id_temario") ON DELETE CASCADE,
    "id_alumno" INTEGER NOT NULL REFERENCES "Alumnos"("id_alumno") ON DELETE CASCADE,
    "estado_desempeno" VARCHAR(50) NOT NULL CHECK ("estado_desempeno" IN ('Excelente', 'Bueno', 'Regular', 'Necesita Refuerzo')),
    PRIMARY KEY ("id_temario", "id_alumno")
);

-- 6. TABLA: Notas (Calificaciones Parciales y Prácticas)
CREATE TABLE IF NOT EXISTS "Notas" (
    "id_nota" SERIAL PRIMARY KEY,
    "id_alumno" INTEGER NOT NULL REFERENCES "Alumnos"("id_alumno") ON DELETE CASCADE,
    "tipo_evaluacion" VARCHAR(100) NOT NULL,
    "nota" NUMERIC(4, 2) NOT NULL CHECK ("nota" >= 0.00 AND "nota" <= 10.00)
);

-- Índices recomendados para consultas analíticas de alto rendimiento
CREATE INDEX IF NOT EXISTS "idx_alumnos_curso" ON "Alumnos"("id_curso");
CREATE INDEX IF NOT EXISTS "idx_asistencia_fecha" ON "Asistencia"("fecha");
CREATE INDEX IF NOT EXISTS "idx_temario_curso_fecha" ON "Temario_Dia"("id_curso", "fecha");
CREATE INDEX IF NOT EXISTS "idx_notas_alumno" ON "Notas"("id_alumno");

${
  hasData
    ? `-- ==========================================================
-- INSERCIÓN DE DATOS REGISTRADOS EN EL SISTEMA
-- ==========================================================

-- Insertar Cursos / Grupos
${grupos
  .map(
    (g) =>
      `INSERT INTO "Grupo" ("id_curso", "nombre_curso", "descripcion") VALUES (${g.id_curso}, '${g.nombre_curso.replace(/'/g, "''")}', '${g.descripcion.replace(/'/g, "''")}') ON CONFLICT ("id_curso") DO UPDATE SET "nombre_curso" = EXCLUDED."nombre_curso", "descripcion" = EXCLUDED."descripcion";`
  )
  .join('\n')}

-- Insertar Alumnos
${alumnos
  .map(
    (a) =>
      `INSERT INTO "Alumnos" ("id_alumno", "nombre", "apellido", "id_curso", "certificado") VALUES (${a.id_alumno}, '${a.nombre.replace(/'/g, "''")}', '${a.apellido.replace(/'/g, "''")}', ${a.id_curso ?? 'NULL'}, ${a.certificado}) ON CONFLICT ("id_alumno") DO UPDATE SET "nombre" = EXCLUDED."nombre", "apellido" = EXCLUDED."apellido", "id_curso" = EXCLUDED."id_curso", "certificado" = EXCLUDED."certificado";`
  )
  .join('\n')}

-- Insertar Asistencias
${asistencias
  .map(
    (asist) =>
      `INSERT INTO "Asistencia" ("id_alumno", "fecha", "asistio") VALUES (${asist.id_alumno}, '${asist.fecha}', ${asist.asistio}) ON CONFLICT ("id_alumno", "fecha") DO UPDATE SET "asistio" = EXCLUDED."asistio";`
  )
  .join('\n')}

-- Insertar Temarios
${temarios
  .map(
    (t) =>
      `INSERT INTO "Temario_Dia" ("id_temario", "fecha", "id_curso", "unidad_tematica", "temas", "objetivos", "recursos") VALUES (${t.id_temario}, '${t.fecha}', ${t.id_curso}, '${t.unidad_tematica.replace(/'/g, "''")}', '${t.temas.replace(/'/g, "''")}', '${t.objetivos.replace(/'/g, "''")}', '${t.recursos.replace(/'/g, "''")}') ON CONFLICT ("id_temario") DO UPDATE SET "unidad_tematica" = EXCLUDED."unidad_tematica", "temas" = EXCLUDED."temas", "objetivos" = EXCLUDED."objetivos", "recursos" = EXCLUDED."recursos";`
  )
  .join('\n')}

-- Insertar Desempeños
${desempenos
  .map(
    (d) =>
      `INSERT INTO "Desempeno_Clase" ("id_temario", "id_alumno", "estado_desempeno") VALUES (${d.id_temario}, ${d.id_alumno}, '${d.estado_desempeno}') ON CONFLICT ("id_temario", "id_alumno") DO UPDATE SET "estado_desempeno" = EXCLUDED."estado_desempeno";`
  )
  .join('\n')}

-- Insertar Calificaciones
${notas
  .map(
    (n) =>
      `INSERT INTO "Notas" ("id_nota", "id_alumno", "tipo_evaluacion", "nota") VALUES (${n.id_nota}, ${n.id_alumno}, '${n.tipo_evaluacion.replace(/'/g, "''")}', ${n.nota.toFixed(2)}) ON CONFLICT ("id_nota") DO UPDATE SET "tipo_evaluacion" = EXCLUDED."tipo_evaluacion", "nota" = EXCLUDED."nota";`
  )
  .join('\n')}
`
    : `-- ==========================================================
-- PLANTILLA INICIAL VACÍA:
-- Las 6 tablas han sido creadas limpias y sin registros precargados.
-- El sistema está listo para registrar Cursos, Alumnos y Evaluaciones.
-- ==========================================================
`
}`;
  };

  return (
    <SchoolContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        databaseUrl,
        setDatabaseUrl,
        activeTab,
        setActiveTab,
        maxAbsencesThreshold,
        setMaxAbsencesThreshold,
        selectedCursoId,
        setSelectedCursoId,
        selectedFechaAsistencia,
        setSelectedFechaAsistencia,
        grupos,
        alumnos,
        asistencias,
        temarios,
        desempenos,
        notas,
        addGrupo,
        updateGrupo,
        deleteGrupo,
        addAlumno,
        updateAlumno,
        deleteAlumno,
        toggleCertificado,
        setAsistencia,
        markBatchAsistencia,
        getAsistencia,
        addTemario,
        updateTemario,
        deleteTemario,
        setDesempeno,
        getDesempeno,
        addNota,
        updateNota,
        deleteNota,
        resumenAlumnos,
        totalAlumnosEnRiesgo,
        promedioGeneralInstitucional,
        clearAllData,
        loadDemoData,
        resetToDefaults,
        generatePostgreSQLScript,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
