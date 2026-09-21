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
  AdminUser,
  DatabaseBackup,
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
import { generateStudentReportPDF, generateStudentsListPDF, StudentsListPDFOptions } from '../utils/pdfGenerator';

interface SchoolContextType {
  // Authentication & Multi-User
  isAuthenticated: boolean;
  currentUser: string | null;
  currentUserProfile: AdminUser | null;
  isSuperAdmin: boolean;
  users: AdminUser[];
  showFirstLoginModal: boolean;
  setShowFirstLoginModal: (show: boolean) => void;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  changeAdminPassword: (newPassword: string, newNombre?: string) => { success: boolean; message?: string };
  registerUser: (user: Omit<AdminUser, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  updateUser: (id: string, partial: Partial<Omit<AdminUser, 'id' | 'createdAt'>>) => { success: boolean; message?: string };
  deleteUser: (id: string) => { success: boolean; message?: string };
  switchUser: (username: string) => void;

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
  addAlumno: (nombre: string, apellido: string, id_curso: number | null) => Alumno;
  updateAlumno: (id_alumno: number, nombre: string, apellido: string, id_curso: number | null) => void;
  deleteAlumno: (id_alumno: number) => void;
  downloadStudentReport: (id_alumno: number) => void;
  downloadStudentsListReport: (options?: {
    cursoId?: number | 'all';
    searchQuery?: string;
    formato?: 'academico' | 'firmas_asistencia';
    customAlumnosList?: Alumno[];
  }) => void;

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

  // Backups & Snapshots
  backups: DatabaseBackup[];
  createBackup: (name?: string, isAuto?: boolean) => DatabaseBackup;
  restoreBackup: (backupId: string) => boolean;
  deleteBackup: (backupId: string) => void;
  exportBackupJson: (backupId?: string) => void;
  importBackupJson: (jsonString: string, mode: 'replace' | 'merge') => { success: boolean; message: string };

  // System Toast Notice
  systemNotice: string | null;
  setSystemNotice: (msg: string | null) => void;

  // Reset, Clear & Export
  clearAllData: () => void;
  loadDemoData: (preserveExisting?: boolean) => void;
  resetToDefaults: () => void;
  generatePostgreSQLScript: () => string;
}

const LOCAL_STORAGE_KEY = 'gestion_escolar_v2_clean';
const AUTH_SESSION_KEY = 'gestion_escolar_auth_session';
const AUTH_SESSION_USER = 'gestion_escolar_auth_user';
const USERS_STORAGE_KEY = 'gestion_escolar_users_v1';

const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'user-admin-default',
    username: 'admin',
    password: 'admin',
    nombre: 'Administrador General',
    rol: 'SuperAdmin',
    createdAt: '2026-09-01T00:00:00.000Z',
    firstLoginPending: true,
  },
];

const getUserStorageKey = (username: string, key: string) => {
  const cleanUser = (username || 'admin').toLowerCase().trim();
  return `gestion_escolar_v2_u_${cleanUser}_${key}`;
};

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Users registry state
  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        let parsed: AdminUser[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize default admin: migrate any previous 'Brasil.2026' password to 'admin'
          let modified = false;
          parsed = parsed.map((u) => {
            if (u.username.toLowerCase().trim() === 'admin') {
              if (u.password === 'Brasil.2026') {
                modified = true;
                return { ...u, password: 'admin', firstLoginPending: true };
              }
              if (u.password === 'admin' && u.firstLoginPending === undefined) {
                modified = true;
                return { ...u, firstLoginPending: true };
              }
            }
            return u;
          });
          if (modified) {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  // 2. Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(AUTH_SESSION_USER) || (isAuthenticated ? 'admin' : null);
    } catch {
      return isAuthenticated ? 'admin' : null;
    }
  });

  // First Login Password Modification Modal state
  const [showFirstLoginModal, setShowFirstLoginModal] = useState<boolean>(() => {
    try {
      const isAuth = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
      const activeUser = sessionStorage.getItem(AUTH_SESSION_USER);
      if (isAuth && activeUser) {
        const saved = localStorage.getItem(USERS_STORAGE_KEY);
        if (saved) {
          const parsed: AdminUser[] = JSON.parse(saved);
          const found = parsed.find((u) => u.username.toLowerCase().trim() === activeUser.toLowerCase().trim());
          if (found && (found.firstLoginPending || (found.username.toLowerCase().trim() === 'admin' && found.password === 'admin'))) {
            return true;
          }
        }
      }
    } catch {
      // Ignore
    }
    return false;
  });

  const currentUserProfile = useMemo(() => {
    if (!currentUser) return null;
    return users.find((u) => u.username.toLowerCase().trim() === currentUser.toLowerCase().trim()) || null;
  }, [users, currentUser]);

  const isSuperAdmin = currentUserProfile?.rol === 'SuperAdmin';

  // System toast notice
  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  useEffect(() => {
    if (systemNotice) {
      const timer = setTimeout(() => setSystemNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [systemNotice]);

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<TabKey>('cursos_alumnos');
  const [maxAbsencesThreshold, setMaxAbsencesThreshold] = useState<number>(5);
  const [selectedCursoId, setSelectedCursoId] = useState<number | 'all'>('all');
  const [selectedFechaAsistencia, setSelectedFechaAsistencia] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Cloud Database URL State
  const [databaseUrl, setDatabaseUrl] = useState<string>('');

  // 3. User's Isolated Table States
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [temarios, setTemarios] = useState<TemarioDia[]>([]);
  const [desempenos, setDesempenos] = useState<DesempenoClase[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);

  // Function to load the isolated database for a specific username
  const loadUserDataPartition = (username: string) => {
    const norm = (username || 'admin').toLowerCase().trim();
    try {
      // 1. Grupos (with backward compatibility migration for 'admin')
      let savedGrupos = localStorage.getItem(getUserStorageKey(norm, 'grupos'));
      if (!savedGrupos && norm === 'admin') {
        savedGrupos = localStorage.getItem(`${LOCAL_STORAGE_KEY}_grupos`);
      }
      setGrupos(savedGrupos ? JSON.parse(savedGrupos) : INITIAL_GRUPOS);

      // 2. Alumnos
      let savedAlumnos = localStorage.getItem(getUserStorageKey(norm, 'alumnos'));
      if (!savedAlumnos && norm === 'admin') {
        savedAlumnos = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alumnos`);
      }
      setAlumnos(savedAlumnos ? JSON.parse(savedAlumnos) : INITIAL_ALUMNOS);

      // 3. Asistencias
      let savedAsistencias = localStorage.getItem(getUserStorageKey(norm, 'asistencias'));
      if (!savedAsistencias && norm === 'admin') {
        savedAsistencias = localStorage.getItem(`${LOCAL_STORAGE_KEY}_asistencias`);
      }
      setAsistencias(savedAsistencias ? JSON.parse(savedAsistencias) : INITIAL_ASISTENCIAS);

      // 4. Temarios
      let savedTemarios = localStorage.getItem(getUserStorageKey(norm, 'temarios'));
      if (!savedTemarios && norm === 'admin') {
        savedTemarios = localStorage.getItem(`${LOCAL_STORAGE_KEY}_temarios`);
      }
      setTemarios(savedTemarios ? JSON.parse(savedTemarios) : INITIAL_TEMARIOS);

      // 5. Desempenos
      let savedDesempenos = localStorage.getItem(getUserStorageKey(norm, 'desempenos'));
      if (!savedDesempenos && norm === 'admin') {
        savedDesempenos = localStorage.getItem(`${LOCAL_STORAGE_KEY}_desempenos`);
      }
      setDesempenos(savedDesempenos ? JSON.parse(savedDesempenos) : INITIAL_DESEMPENOS);

      // 6. Notas
      let savedNotas = localStorage.getItem(getUserStorageKey(norm, 'notas'));
      if (!savedNotas && norm === 'admin') {
        savedNotas = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notas`);
      }
      setNotas(savedNotas ? JSON.parse(savedNotas) : INITIAL_NOTAS);

      // Max absences
      let savedThreshold = localStorage.getItem(getUserStorageKey(norm, 'max_absences'));
      if (!savedThreshold && norm === 'admin') {
        savedThreshold = localStorage.getItem(`${LOCAL_STORAGE_KEY}_max_absences`);
      }
      setMaxAbsencesThreshold(savedThreshold ? JSON.parse(savedThreshold) : 5);

      // Backups
      const savedBackups = localStorage.getItem(getUserStorageKey(norm, 'backups'));
      setBackups(savedBackups ? JSON.parse(savedBackups) : []);

      // DB URL
      let savedDbUrl = localStorage.getItem(getUserStorageKey(norm, 'db_url'));
      if (!savedDbUrl && norm === 'admin') {
        savedDbUrl = localStorage.getItem(`${LOCAL_STORAGE_KEY}_db_url`) || '';
      }
      setDatabaseUrl(savedDbUrl || '');

      setSelectedCursoId('all');
    } catch (e) {
      console.error('Error cargando partición de base de datos de usuario:', e);
    }
  };

  // Initial load when mounted
  useEffect(() => {
    const activeUsername = currentUser || 'admin';
    loadUserDataPartition(activeUsername);
  }, []);

  // Save changes to current user's isolated storage
  useEffect(() => {
    const activeUsername = currentUser || 'admin';
    try {
      localStorage.setItem(getUserStorageKey(activeUsername, 'grupos'), JSON.stringify(grupos));
      localStorage.setItem(getUserStorageKey(activeUsername, 'alumnos'), JSON.stringify(alumnos));
      localStorage.setItem(getUserStorageKey(activeUsername, 'asistencias'), JSON.stringify(asistencias));
      localStorage.setItem(getUserStorageKey(activeUsername, 'temarios'), JSON.stringify(temarios));
      localStorage.setItem(getUserStorageKey(activeUsername, 'desempenos'), JSON.stringify(desempenos));
      localStorage.setItem(getUserStorageKey(activeUsername, 'notas'), JSON.stringify(notas));
      localStorage.setItem(getUserStorageKey(activeUsername, 'max_absences'), JSON.stringify(maxAbsencesThreshold));
      if (databaseUrl) {
        localStorage.setItem(getUserStorageKey(activeUsername, 'db_url'), databaseUrl);
      }
    } catch (e) {
      console.error('Error saving to isolated localStorage', e);
    }
  }, [grupos, alumnos, asistencias, temarios, desempenos, notas, maxAbsencesThreshold, databaseUrl, currentUser]);

  // Save backups to current user's isolated storage
  useEffect(() => {
    const activeUsername = currentUser || 'admin';
    try {
      localStorage.setItem(getUserStorageKey(activeUsername, 'backups'), JSON.stringify(backups));
    } catch (e) {
      console.error('Error saving backups', e);
    }
  }, [backups, currentUser]);

  // Auth: Login
  const login = (user: string, pass: string): boolean => {
    const norm = user.toLowerCase().trim();
    const matched = users.find((u) => u.username.toLowerCase().trim() === norm && u.password === pass);

    if (matched) {
      setIsAuthenticated(true);
      setCurrentUser(matched.username);
      try {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        sessionStorage.setItem(AUTH_SESSION_USER, matched.username);
      } catch {
        // Ignore
      }
      loadUserDataPartition(matched.username);
      if (matched.rol !== 'SuperAdmin' && activeTab === 'backups_usuarios') {
        setActiveTab('cursos_alumnos');
      }

      // Check if this is the first login or if default password is still active
      if (
        matched.firstLoginPending ||
        (matched.username.toLowerCase().trim() === 'admin' && matched.password === 'admin')
      ) {
        setShowFirstLoginModal(true);
      }

      setSystemNotice(`Bienvenido/a, ${matched.nombre} (${matched.rol}). Base de datos conectada.`);
      return true;
    }
    return false;
  };

  // Auth: Logout
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowFirstLoginModal(false);
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_SESSION_USER);
    } catch {
      // Ignore
    }
  };

  // Change Admin Password on First Login or from Settings
  const changeAdminPassword = (newPassword: string, newNombre?: string): { success: boolean; message?: string } => {
    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'La nueva contraseña debe tener al menos 4 caracteres.' };
    }
    if (cleanPass.toLowerCase() === 'admin') {
      return { success: false, message: 'Por favor ingrese una contraseña diferente de la predeterminada "admin".' };
    }

    const activeUser = currentUserProfile || users.find((u) => u.username.toLowerCase().trim() === 'admin');
    if (!activeUser) {
      return { success: false, message: 'No se encontró el usuario activo.' };
    }

    const updated = users.map((u) => {
      if (u.id === activeUser.id) {
        return {
          ...u,
          password: cleanPass,
          nombre: newNombre && newNombre.trim() ? newNombre.trim() : u.nombre,
          firstLoginPending: false,
        };
      }
      return u;
    });

    setUsers(updated);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setShowFirstLoginModal(false);
    setSystemNotice('¡Contraseña de administrador actualizada con éxito! Se han guardado sus nuevas credenciales.');
    return { success: true };
  };

  // User Management: Register New User (SuperAdmin ONLY)
  const registerUser = (newUserData: Omit<AdminUser, 'id' | 'createdAt'>): { success: boolean; message?: string } => {
    if (!isSuperAdmin) {
      return {
        success: false,
        message: 'Acceso denegado: Solamente el Administrador General con rol SuperAdmin tiene autorización para registrar usuarios.',
      };
    }

    const norm = newUserData.username.toLowerCase().trim();
    if (!norm || norm.length < 3) {
      return { success: false, message: 'El nombre de usuario debe contener al menos 3 caracteres alfanuméricos.' };
    }
    if (!newUserData.password || newUserData.password.length < 4) {
      return { success: false, message: 'La contraseña debe contener al menos 4 caracteres.' };
    }
    if (users.some((u) => u.username.toLowerCase().trim() === norm)) {
      return { success: false, message: `El usuario "${newUserData.username}" ya se encuentra registrado.` };
    }

    const created: AdminUser = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      username: norm,
      password: newUserData.password,
      nombre: newUserData.nombre.trim() || norm,
      rol: newUserData.rol || 'Administrador',
      createdAt: new Date().toISOString(),
      firstLoginPending: false,
    };

    const nextUsers = [...users, created];
    setUsers(nextUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    } catch (e) {
      console.error(e);
    }

    // Initialize an empty database partition for this new user
    try {
      localStorage.setItem(getUserStorageKey(norm, 'grupos'), JSON.stringify([]));
      localStorage.setItem(getUserStorageKey(norm, 'alumnos'), JSON.stringify([]));
      localStorage.setItem(getUserStorageKey(norm, 'asistencias'), JSON.stringify([]));
      localStorage.setItem(getUserStorageKey(norm, 'temarios'), JSON.stringify([]));
      localStorage.setItem(getUserStorageKey(norm, 'desempenos'), JSON.stringify([]));
      localStorage.setItem(getUserStorageKey(norm, 'notas'), JSON.stringify([]));
      localStorage.setItem(getUserStorageKey(norm, 'max_absences'), JSON.stringify(5));
      localStorage.setItem(getUserStorageKey(norm, 'backups'), JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }

    setSystemNotice(`Usuario "${created.nombre}" (${created.username}) creado con éxito con su propia base de datos.`);
    return { success: true };
  };

  // User Management: Update User (SuperAdmin ONLY)
  const updateUser = (
    id: string,
    partial: Partial<Omit<AdminUser, 'id' | 'createdAt'>>
  ): { success: boolean; message?: string } => {
    if (!isSuperAdmin) {
      const msg = 'Acceso denegado: Solamente el Administrador General con rol SuperAdmin puede modificar usuarios.';
      setSystemNotice(msg);
      return { success: false, message: msg };
    }

    const target = users.find((u) => u.id === id);
    if (!target) {
      return { success: false, message: 'Usuario no encontrado en el sistema.' };
    }

    // Validate username if provided
    let newNorm = target.username.toLowerCase().trim();
    if (partial.username !== undefined) {
      const trimmedUser = partial.username.toLowerCase().trim();
      if (!trimmedUser || trimmedUser.length < 3) {
        return { success: false, message: 'El nombre de usuario debe contener al menos 3 caracteres.' };
      }
      const conflict = users.find((u) => u.id !== id && u.username.toLowerCase().trim() === trimmedUser);
      if (conflict) {
        return { success: false, message: `El nombre de usuario "@${trimmedUser}" ya está asignado a otra cuenta.` };
      }
      newNorm = trimmedUser;
    }

    // Validate password if provided
    if (partial.password !== undefined) {
      if (!partial.password || partial.password.trim().length < 4) {
        return { success: false, message: 'La contraseña debe contener al menos 4 caracteres.' };
      }
    }

    // Check that we don't accidentally remove the SuperAdmin role from the last remaining SuperAdmin
    if (target.rol === 'SuperAdmin' && partial.rol && partial.rol !== 'SuperAdmin') {
      const superAdminCount = users.filter((u) => u.rol === 'SuperAdmin').length;
      if (superAdminCount <= 1) {
        return {
          success: false,
          message: 'No puedes revocar el rol SuperAdmin al único superusuario del sistema.',
        };
      }
    }

    // If username changed, migrate existing database storage keys to new username
    const oldNorm = target.username.toLowerCase().trim();
    if (newNorm !== oldNorm) {
      try {
        const partitionKeys = ['grupos', 'alumnos', 'asistencias', 'temarios', 'desempenos', 'notas', 'max_absences', 'backups', 'db_url'];
        partitionKeys.forEach((k) => {
          const oldVal = localStorage.getItem(getUserStorageKey(oldNorm, k));
          if (oldVal !== null) {
            localStorage.setItem(getUserStorageKey(newNorm, k), oldVal);
            localStorage.removeItem(getUserStorageKey(oldNorm, k));
          }
        });
        if (currentUser?.toLowerCase().trim() === oldNorm) {
          setCurrentUser(newNorm);
          sessionStorage.setItem(AUTH_SESSION_USER, newNorm);
        }
      } catch (err) {
        console.error('Error migrando partición:', err);
      }
    }

    const updated = users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          ...partial,
          nombre: partial.nombre !== undefined ? partial.nombre.trim() : u.nombre,
          username: newNorm,
          password: partial.password !== undefined ? partial.password.trim() : u.password,
          rol: partial.rol !== undefined ? partial.rol : u.rol,
          firstLoginPending: partial.firstLoginPending !== undefined ? partial.firstLoginPending : u.firstLoginPending,
        };
      }
      return u;
    });

    setUsers(updated);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setSystemNotice(`Usuario "${partial.nombre || target.nombre}" (@${newNorm}) actualizado con éxito.`);
    return { success: true };
  };

  // User Management: Delete User (SuperAdmin ONLY)
  const deleteUser = (id: string): { success: boolean; message?: string } => {
    if (!isSuperAdmin) {
      return {
        success: false,
        message: 'Acceso denegado: Solamente el Administrador General con rol SuperAdmin puede eliminar usuarios.',
      };
    }

    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, message: 'Usuario no encontrado.' };

    if (users.length <= 1) {
      return { success: false, message: 'No es posible eliminar el único usuario del sistema.' };
    }
    if (currentUserProfile?.id === id) {
      return { success: false, message: 'No puedes eliminar el usuario con el que te encuentras autenticado.' };
    }

    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      const norm = target.username.toLowerCase().trim();
      localStorage.removeItem(getUserStorageKey(norm, 'grupos'));
      localStorage.removeItem(getUserStorageKey(norm, 'alumnos'));
      localStorage.removeItem(getUserStorageKey(norm, 'asistencias'));
      localStorage.removeItem(getUserStorageKey(norm, 'temarios'));
      localStorage.removeItem(getUserStorageKey(norm, 'desempenos'));
      localStorage.removeItem(getUserStorageKey(norm, 'notas'));
      localStorage.removeItem(getUserStorageKey(norm, 'max_absences'));
      localStorage.removeItem(getUserStorageKey(norm, 'backups'));
      localStorage.removeItem(getUserStorageKey(norm, 'db_url'));
    } catch (e) {
      console.error(e);
    }
    setSystemNotice(`Usuario "${target.username}" y su base de datos fueron eliminados.`);
    return { success: true };
  };

  // User Management: Switch Active User Database (SuperAdmin ONLY)
  const switchUser = (targetUsername: string) => {
    if (!isSuperAdmin) {
      setSystemNotice('Acceso denegado: Solamente el Administrador General con rol SuperAdmin puede alternar entre espacios de otros usuarios.');
      return;
    }

    const target = users.find((u) => u.username.toLowerCase().trim() === targetUsername.toLowerCase().trim());
    if (!target) return;
    setCurrentUser(target.username);
    try {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      sessionStorage.setItem(AUTH_SESSION_USER, target.username);
    } catch (e) {
      console.error(e);
    }
    loadUserDataPartition(target.username);
    setSystemNotice(`Cambiado al espacio y base de datos de: ${target.nombre} (${target.username})`);
  };

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
    setAlumnos((prev) => prev.map((a) => (a.id_curso === id_curso ? { ...a, id_curso: null } : a)));
    const temariosToDelete = temarios.filter((t) => t.id_curso === id_curso).map((t) => t.id_temario);
    setTemarios((prev) => prev.filter((t) => t.id_curso !== id_curso));
    setDesempenos((prev) => prev.filter((d) => !temariosToDelete.includes(d.id_temario)));
  };

  // --- CRUD: Alumnos ---
  const addAlumno = (nombre: string, apellido: string, id_curso: number | null): Alumno => {
    const nextId = alumnos.length > 0 ? Math.max(...alumnos.map((a) => a.id_alumno)) + 1 : 1;
    const newAlumno: Alumno = {
      id_alumno: nextId,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      id_curso,
    };
    setAlumnos((prev) => [...prev, newAlumno]);
    return newAlumno;
  };

  const updateAlumno = (id_alumno: number, nombre: string, apellido: string, id_curso: number | null) => {
    setAlumnos((prev) =>
      prev.map((a) =>
        a.id_alumno === id_alumno
          ? { ...a, nombre: nombre.trim(), apellido: apellido.trim(), id_curso }
          : a
      )
    );
  };

  const deleteAlumno = (id_alumno: number) => {
    setAlumnos((prev) => prev.filter((a) => a.id_alumno !== id_alumno));
    setAsistencias((prev) => prev.filter((asist) => asist.id_alumno !== id_alumno));
    setDesempenos((prev) => prev.filter((des) => des.id_alumno !== id_alumno));
    setNotas((prev) => prev.filter((n) => n.id_alumno !== id_alumno));
  };

  // Descargar Informe Oficial en PDF
  const downloadStudentReport = (id_alumno: number) => {
    const alumno = alumnos.find((a) => a.id_alumno === id_alumno);
    if (!alumno) return;

    const curso = grupos.find((g) => g.id_curso === alumno.id_curso) || null;
    const studentNotas = notas.filter((n) => n.id_alumno === id_alumno);
    const studentAsistencias = asistencias.filter((a) => a.id_alumno === id_alumno);
    const studentDesempenos = desempenos.filter((d) => d.id_alumno === id_alumno);

    const totalClases = studentAsistencias.length;
    const faltasTotales = studentAsistencias.filter((a) => !a.asistio).length;
    const asistenciasTotales = studentAsistencias.filter((a) => a.asistio).length;
    const porcentajeAsistencia = totalClases > 0 ? Math.round((asistenciasTotales / totalClases) * 100) : 100;
    const excedeFaltas = faltasTotales > maxAbsencesThreshold;

    const promedio =
      studentNotas.length > 0
        ? Number((studentNotas.reduce((acc, curr) => acc + curr.nota, 0) / studentNotas.length).toFixed(2))
        : null;

    let estadoAprobacion: 'Aprobado' | 'Regular' | 'En Riesgo' | 'Sin Notas' = 'Sin Notas';
    if (excedeFaltas) {
      estadoAprobacion = 'En Riesgo';
    } else if (promedio !== null) {
      if (promedio >= 7.0) estadoAprobacion = 'Aprobado';
      else if (promedio >= 4.0) estadoAprobacion = 'Regular';
      else estadoAprobacion = 'En Riesgo';
    }

    const resumen: ResumenAlumno = {
      alumno,
      curso,
      promedio,
      totalNotas: studentNotas.length,
      notas: studentNotas,
      faltasTotales,
      asistenciasTotales,
      totalClasesRegistradas: totalClases,
      porcentajeAsistencia,
      excedeFaltas,
      estadoAprobacion,
    };

    generateStudentReportPDF({
      alumno,
      curso,
      resumen,
      notas: studentNotas,
      asistencias: studentAsistencias,
      desempenos: studentDesempenos,
      temarios,
      maxAbsencesThreshold,
    });
  };

  // Descargar Nómina / Padrón General de Estudiantes en PDF
  const downloadStudentsListReport = (options?: {
    cursoId?: number | 'all';
    searchQuery?: string;
    formato?: 'academico' | 'firmas_asistencia';
    customAlumnosList?: Alumno[];
  }) => {
    const cursoId = options?.cursoId !== undefined ? options.cursoId : selectedCursoId;
    const formato = options?.formato || 'academico';
    const query = (options?.searchQuery || '').trim().toLowerCase();

    let targetAlumnos = options?.customAlumnosList ? [...options.customAlumnosList] : [...alumnos];

    if (!options?.customAlumnosList) {
      if (cursoId !== 'all') {
        targetAlumnos = targetAlumnos.filter((a) => a.id_curso === cursoId);
      }
      if (query) {
        targetAlumnos = targetAlumnos.filter(
          (a) =>
            a.nombre.toLowerCase().includes(query) ||
            a.apellido.toLowerCase().includes(query) ||
            a.id_alumno.toString().includes(query)
        );
      }
    }

    const cursoFiltro = cursoId !== 'all' ? grupos.find((g) => g.id_curso === cursoId) || null : null;
    const docenteNombre = currentUserProfile?.nombre || (currentUser ? `@${currentUser}` : 'Docente Titular');

    generateStudentsListPDF({
      alumnos: targetAlumnos,
      grupos,
      resumenAlumnos,
      cursoFiltro,
      docenteNombre,
      formato,
      criterioFiltroTexto: query ? `Búsqueda: "${query}"` : '',
    });
  };

  // --- Asistencias ---
  const setAsistencia = (id_alumno: number, fecha: string, asistio: boolean) => {
    setAsistencias((prev) => {
      const exists = prev.some((a) => a.id_alumno === id_alumno && a.fecha === fecha);
      if (exists) {
        return prev.map((a) => (a.id_alumno === id_alumno && a.fecha === fecha ? { ...a, asistio } : a));
      }
      return [...prev, { id_alumno, fecha, asistio }];
    });
  };

  const markBatchAsistencia = (id_curso: number, fecha: string, asistio: boolean) => {
    const courseAlumnos = alumnos.filter((a) => a.id_curso === id_curso);
    if (courseAlumnos.length === 0) return;

    setAsistencias((prev) => {
      const remaining = prev.filter(
        (a) => !courseAlumnos.some((ca) => ca.id_alumno === a.id_alumno && a.fecha === fecha)
      );
      const newEntries: Asistencia[] = courseAlumnos.map((ca) => ({
        id_alumno: ca.id_alumno,
        fecha,
        asistio,
      }));
      return [...remaining, ...newEntries];
    });
  };

  const getAsistencia = (id_alumno: number, fecha: string): boolean | null => {
    const record = asistencias.find((a) => a.id_alumno === id_alumno && a.fecha === fecha);
    return record ? record.asistio : null;
  };

  // --- Temario_Dia ---
  const addTemario = (data: Omit<TemarioDia, 'id_temario'>): TemarioDia => {
    const nextId = temarios.length > 0 ? Math.max(...temarios.map((t) => t.id_temario)) + 1 : 1;
    const newTemario: TemarioDia = {
      id_temario: nextId,
      ...data,
      unidad_tematica: data.unidad_tematica.trim(),
      temas: data.temas.trim(),
      objetivos: data.objetivos.trim(),
      recursos: data.recursos.trim(),
    };
    setTemarios((prev) => [newTemario, ...prev]);

    const courseAlumnos = alumnos.filter((a) => a.id_curso === data.id_curso);
    const initialDesempenos: DesempenoClase[] = courseAlumnos.map((a) => ({
      id_temario: nextId,
      id_alumno: a.id_alumno,
      estado_desempeno: 'Bueno',
    }));
    setDesempenos((prev) => [...prev, ...initialDesempenos]);

    return newTemario;
  };

  const updateTemario = (id_temario: number, data: Omit<TemarioDia, 'id_temario'>) => {
    setTemarios((prev) =>
      prev.map((t) => (t.id_temario === id_temario ? { ...t, ...data } : t))
    );
  };

  const deleteTemario = (id_temario: number) => {
    setTemarios((prev) => prev.filter((t) => t.id_temario !== id_temario));
    setDesempenos((prev) => prev.filter((d) => d.id_temario !== id_temario));
  };

  // --- Desempeno_Clase ---
  const setDesempeno = (id_temario: number, id_alumno: number, estado: EstadoDesempeno) => {
    setDesempenos((prev) => {
      const exists = prev.some((d) => d.id_temario === id_temario && d.id_alumno === id_alumno);
      if (exists) {
        return prev.map((d) =>
          d.id_temario === id_temario && d.id_alumno === id_alumno ? { ...d, estado_desempeno: estado } : d
        );
      }
      return [...prev, { id_temario, id_alumno, estado_desempeno: estado }];
    });
  };

  const getDesempeno = (id_temario: number, id_alumno: number): EstadoDesempeno | null => {
    const record = desempenos.find((d) => d.id_temario === id_temario && d.id_alumno === id_alumno);
    return record ? record.estado_desempeno : null;
  };

  // --- Notas ---
  const addNota = (id_alumno: number, tipo_evaluacion: string, notaValue: number): Nota => {
    const nextId = notas.length > 0 ? Math.max(...notas.map((n) => n.id_nota)) + 1 : 1;
    const newNota: Nota = {
      id_nota: nextId,
      id_alumno,
      tipo_evaluacion: tipo_evaluacion.trim(),
      nota: Math.min(10, Math.max(0, parseFloat(notaValue.toFixed(2)))),
    };
    setNotas((prev) => [...prev, newNota]);
    return newNota;
  };

  const updateNota = (id_nota: number, tipo_evaluacion: string, notaValue: number) => {
    setNotas((prev) =>
      prev.map((n) =>
        n.id_nota === id_nota
          ? {
              ...n,
              tipo_evaluacion: tipo_evaluacion.trim(),
              nota: Math.min(10, Math.max(0, parseFloat(notaValue.toFixed(2)))),
            }
          : n
      )
    );
  };

  const deleteNota = (id_nota: number) => {
    setNotas((prev) => prev.filter((n) => n.id_nota !== id_nota));
  };

  // --- Analytics & Summary ---
  const resumenAlumnos = useMemo<ResumenAlumno[]>(() => {
    return alumnos.map((alumno) => {
      const curso = grupos.find((g) => g.id_curso === alumno.id_curso) || null;
      const studentNotas = notas.filter((n) => n.id_alumno === alumno.id_alumno);
      const studentAsistencias = asistencias.filter((a) => a.id_alumno === alumno.id_alumno);

      const totalClases = studentAsistencias.length;
      const faltasTotales = studentAsistencias.filter((a) => !a.asistio).length;
      const asistenciasTotales = studentAsistencias.filter((a) => a.asistio).length;
      const porcentajeAsistencia = totalClases > 0 ? Math.round((asistenciasTotales / totalClases) * 100) : 100;
      const excedeFaltas = faltasTotales > maxAbsencesThreshold;

      const promedio =
        studentNotas.length > 0
          ? Number((studentNotas.reduce((acc, curr) => acc + curr.nota, 0) / studentNotas.length).toFixed(2))
          : null;

      let estadoAprobacion: 'Aprobado' | 'Regular' | 'En Riesgo' | 'Sin Notas' = 'Sin Notas';
      if (excedeFaltas) {
        estadoAprobacion = 'En Riesgo';
      } else if (promedio !== null) {
        if (promedio >= 7.0) estadoAprobacion = 'Aprobado';
        else if (promedio >= 4.0) estadoAprobacion = 'Regular';
        else estadoAprobacion = 'En Riesgo';
      }

      return {
        alumno,
        curso,
        promedio,
        totalNotas: studentNotas.length,
        notas: studentNotas,
        faltasTotales,
        asistenciasTotales,
        totalClasesRegistradas: totalClases,
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

  // --- BACKUPS & SNAPSHOTS ENGINE ---
  const createBackup = (name?: string, isAuto: boolean = false): DatabaseBackup => {
    const activeUsername = currentUser || 'admin';
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const defaultName = isAuto
      ? (name || `Auto-Respaldo (${formattedDate} ${formattedTime})`)
      : (name || `Copia de Seguridad manual - ${formattedDate} ${formattedTime}`);

    const newBackup: DatabaseBackup = {
      id: 'backup-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: defaultName,
      timestamp,
      username: activeUsername,
      isAutoBackup: isAuto,
      counts: {
        grupos: grupos.length,
        alumnos: alumnos.length,
        asistencias: asistencias.length,
        temarios: temarios.length,
        desempenos: desempenos.length,
        notas: notas.length,
      },
      data: {
        grupos: JSON.parse(JSON.stringify(grupos)),
        alumnos: JSON.parse(JSON.stringify(alumnos)),
        asistencias: JSON.parse(JSON.stringify(asistencias)),
        temarios: JSON.parse(JSON.stringify(temarios)),
        desempenos: JSON.parse(JSON.stringify(desempenos)),
        notas: JSON.parse(JSON.stringify(notas)),
        maxAbsencesThreshold,
        databaseUrl,
      },
    };

    setBackups((prev) => [newBackup, ...prev.slice(0, 24)]); // Keep last 25 backups
    if (!isAuto) {
      setSystemNotice(`Copia de seguridad guardada: "${newBackup.name}" (${grupos.length} cursos, ${alumnos.length} estudiantes).`);
    }
    return newBackup;
  };

  const restoreBackup = (backupId: string): boolean => {
    const target = backups.find((b) => b.id === backupId);
    if (!target) return false;

    // Create an automatic safety snapshot before restoring
    createBackup(`Auto-Respaldo previo a restaurar (${target.name})`, true);

    setGrupos(target.data.grupos || []);
    setAlumnos(target.data.alumnos || []);
    setAsistencias(target.data.asistencias || []);
    setTemarios(target.data.temarios || []);
    setDesempenos(target.data.desempenos || []);
    setNotas(target.data.notas || []);
    if (target.data.maxAbsencesThreshold) {
      setMaxAbsencesThreshold(target.data.maxAbsencesThreshold);
    }
    if (target.data.databaseUrl !== undefined) {
      setDatabaseUrl(target.data.databaseUrl);
    }
    setSelectedCursoId('all');
    setSystemNotice(`Copia de seguridad "${target.name}" restaurada con éxito.`);
    return true;
  };

  const deleteBackup = (backupId: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== backupId));
    setSystemNotice('Copia de seguridad eliminada.');
  };

  const exportBackupJson = (backupId?: string) => {
    let targetBackup: DatabaseBackup | undefined;
    if (backupId) {
      targetBackup = backups.find((b) => b.id === backupId);
    } else {
      targetBackup = createBackup(`Respaldo descargado ${new Date().toLocaleDateString()}`);
    }
    if (!targetBackup) return;

    const payload = {
      app: 'GestionEscolarIntegral',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      user: currentUser || 'admin',
      backup: targetBackup,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStamp = new Date().toISOString().split('T')[0];
    const userStamp = (currentUser || 'admin').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Respaldo_Escolar_${userStamp}_${dateStamp}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSystemNotice('Archivo JSON de respaldo descargado correctamente.');
  };

  const importBackupJson = (jsonString: string, mode: 'replace' | 'merge'): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.backup?.data || parsed.data || parsed;

      if (!data || (!Array.isArray(data.grupos) && !Array.isArray(data.alumnos))) {
        return { success: false, message: 'El archivo JSON no contiene una estructura válida de Gestión Escolar.' };
      }

      // Auto safety backup before import
      createBackup('Auto-Respaldo previo a importar archivo', true);

      if (mode === 'replace') {
        setGrupos(data.grupos || []);
        setAlumnos(data.alumnos || []);
        setAsistencias(data.asistencias || []);
        setTemarios(data.temarios || []);
        setDesempenos(data.desempenos || []);
        setNotas(data.notas || []);
        if (data.maxAbsencesThreshold) setMaxAbsencesThreshold(data.maxAbsencesThreshold);
        setSystemNotice('Base de datos restaurada completamente desde el archivo.');
        return { success: true, message: 'Base de datos restaurada con éxito.' };
      } else {
        // Merge mode: append without destroying
        const maxCursoId = grupos.length > 0 ? Math.max(...grupos.map((g) => g.id_curso)) : 0;
        const maxAlumnoId = alumnos.length > 0 ? Math.max(...alumnos.map((a) => a.id_alumno)) : 0;
        const maxTemarioId = temarios.length > 0 ? Math.max(...temarios.map((t) => t.id_temario)) : 0;
        const maxNotaId = notas.length > 0 ? Math.max(...notas.map((n) => n.id_nota)) : 0;

        const importedGrupos: Grupo[] = (data.grupos || []).map((g: Grupo) => ({
          ...g,
          id_curso: g.id_curso + maxCursoId,
        }));

        const cursoMap = new Map<number, number>();
        (data.grupos || []).forEach((g: Grupo) => cursoMap.set(g.id_curso, g.id_curso + maxCursoId));

        const importedAlumnos: Alumno[] = (data.alumnos || []).map((a: Alumno) => ({
          ...a,
          id_alumno: a.id_alumno + maxAlumnoId,
          id_curso: a.id_curso ? cursoMap.get(a.id_curso) || a.id_curso + maxCursoId : null,
        }));

        const alumnoMap = new Map<number, number>();
        (data.alumnos || []).forEach((a: Alumno) => alumnoMap.set(a.id_alumno, a.id_alumno + maxAlumnoId));

        const importedAsistencias: Asistencia[] = (data.asistencias || []).map((asist: Asistencia) => ({
          ...asist,
          id_alumno: alumnoMap.get(asist.id_alumno) || asist.id_alumno + maxAlumnoId,
        }));

        const temarioMap = new Map<number, number>();
        const importedTemarios: TemarioDia[] = (data.temarios || []).map((t: TemarioDia) => {
          const newTid = t.id_temario + maxTemarioId;
          temarioMap.set(t.id_temario, newTid);
          return {
            ...t,
            id_temario: newTid,
            id_curso: cursoMap.get(t.id_curso) || t.id_curso + maxCursoId,
          };
        });

        const importedDesempenos: DesempenoClase[] = (data.desempenos || []).map((d: DesempenoClase) => ({
          ...d,
          id_temario: temarioMap.get(d.id_temario) || d.id_temario + maxTemarioId,
          id_alumno: alumnoMap.get(d.id_alumno) || d.id_alumno + maxAlumnoId,
        }));

        const importedNotas: Nota[] = (data.notas || []).map((n: Nota) => ({
          ...n,
          id_nota: n.id_nota + maxNotaId,
          id_alumno: alumnoMap.get(n.id_alumno) || n.id_alumno + maxAlumnoId,
        }));

        setGrupos((prev) => [...prev, ...importedGrupos]);
        setAlumnos((prev) => [...prev, ...importedAlumnos]);
        setAsistencias((prev) => [...prev, ...importedAsistencias]);
        setTemarios((prev) => [...prev, ...importedTemarios]);
        setDesempenos((prev) => [...prev, ...importedDesempenos]);
        setNotas((prev) => [...prev, ...importedNotas]);

        setSystemNotice(`Registros del archivo combinados exitosamente con tu base de datos.`);
        return { success: true, message: 'Registros integrados sin borrar tus cursos ni estudiantes.' };
      }
    } catch (err: any) {
      return { success: false, message: 'Error procesando archivo: ' + (err.message || 'Formato JSON incorrecto') };
    }
  };

  // Clean Slate: Reset to empty state (with safety auto-backup!)
  const clearAllData = () => {
    if (grupos.length > 0 || alumnos.length > 0) {
      createBackup('Auto-Respaldo previo a vaciar base de datos', true);
    }
    setGrupos([]);
    setAlumnos([]);
    setAsistencias([]);
    setTemarios([]);
    setDesempenos([]);
    setNotas([]);
    setSelectedCursoId('all');
    setMaxAbsencesThreshold(5);
    setSystemNotice('Base de datos vaciada. Se guardó una copia de respaldo automática previa.');
  };

  // SAFE DEMO DATA LOADING:
  // "Que no se borren mis cursos o estudiantes, al presionar el botón de datos 'demo'"
  const loadDemoData = (preserveExisting: boolean = true) => {
    // 1. Always create an automatic safety backup first!
    if (grupos.length > 0 || alumnos.length > 0) {
      createBackup('Auto-Respaldo previo a cargar Demo', true);
    }

    if (!preserveExisting || (grupos.length === 0 && alumnos.length === 0)) {
      setGrupos(DEMO_GRUPOS);
      setAlumnos(DEMO_ALUMNOS);
      setAsistencias(DEMO_ASISTENCIAS);
      setTemarios(DEMO_TEMARIOS);
      setDesempenos(DEMO_DESEMPENOS);
      setNotas(DEMO_NOTAS);
      setSelectedCursoId('all');
      setMaxAbsencesThreshold(5);
      setSystemNotice('Datos de demostración cargados en la plantilla.');
      return;
    }

    // 2. Safely merge demo data into existing database WITHOUT DELETING OR OVERWRITING!
    const maxCursoId = grupos.length > 0 ? Math.max(...grupos.map((g) => g.id_curso)) : 0;
    const maxAlumnoId = alumnos.length > 0 ? Math.max(...alumnos.map((a) => a.id_alumno)) : 0;
    const maxTemarioId = temarios.length > 0 ? Math.max(...temarios.map((t) => t.id_temario)) : 0;
    const maxNotaId = notas.length > 0 ? Math.max(...notas.map((n) => n.id_nota)) : 0;

    const cursoMap = new Map<number, number>();
    const remappedGrupos: Grupo[] = DEMO_GRUPOS.map((dg) => {
      const newCid = dg.id_curso + maxCursoId;
      cursoMap.set(dg.id_curso, newCid);
      const nameConflict = grupos.some((g) => g.nombre_curso.trim().toLowerCase() === dg.nombre_curso.trim().toLowerCase());
      return {
        ...dg,
        id_curso: newCid,
        nombre_curso: nameConflict ? `${dg.nombre_curso} (Demo)` : dg.nombre_curso,
      };
    });

    const alumnoMap = new Map<number, number>();
    const remappedAlumnos: Alumno[] = DEMO_ALUMNOS.map((da) => {
      const newAid = da.id_alumno + maxAlumnoId;
      alumnoMap.set(da.id_alumno, newAid);
      return {
        ...da,
        id_alumno: newAid,
        id_curso: da.id_curso ? cursoMap.get(da.id_curso) || da.id_curso + maxCursoId : null,
      };
    });

    const remappedAsistencias: Asistencia[] = DEMO_ASISTENCIAS.map((das) => ({
      ...das,
      id_alumno: alumnoMap.get(das.id_alumno) || das.id_alumno + maxAlumnoId,
    }));

    const temarioMap = new Map<number, number>();
    const remappedTemarios: TemarioDia[] = DEMO_TEMARIOS.map((dt) => {
      const newTid = dt.id_temario + maxTemarioId;
      temarioMap.set(dt.id_temario, newTid);
      return {
        ...dt,
        id_temario: newTid,
        id_curso: cursoMap.get(dt.id_curso) || dt.id_curso + maxCursoId,
      };
    });

    const remappedDesempenos: DesempenoClase[] = DEMO_DESEMPENOS.map((dd) => ({
      ...dd,
      id_temario: temarioMap.get(dd.id_temario) || dd.id_temario + maxTemarioId,
      id_alumno: alumnoMap.get(dd.id_alumno) || dd.id_alumno + maxAlumnoId,
    }));

    const remappedNotas: Nota[] = DEMO_NOTAS.map((dn) => ({
      ...dn,
      id_nota: dn.id_nota + maxNotaId,
      id_alumno: alumnoMap.get(dn.id_alumno) || dn.id_alumno + maxAlumnoId,
    }));

    setGrupos((prev) => [...prev, ...remappedGrupos]);
    setAlumnos((prev) => [...prev, ...remappedAlumnos]);
    setAsistencias((prev) => [...prev, ...remappedAsistencias]);
    setTemarios((prev) => [...prev, ...remappedTemarios]);
    setDesempenos((prev) => [...prev, ...remappedDesempenos]);
    setNotas((prev) => [...prev, ...remappedNotas]);

    setSystemNotice(`¡Listo! Se agregaron 3 cursos y 11 alumnos demo sin borrar tus cursos y estudiantes existentes. Se guardó además un auto-respaldo previo.`);
  };

  const resetToDefaults = clearAllData;

  // Generate full PostgreSQL DDL + data script
  const generatePostgreSQLScript = (): string => {
    const hasData = grupos.length > 0 || alumnos.length > 0;
    const activeUsername = currentUser || 'admin';

    return `-- ==========================================================
-- GESTIÓN ESCOLAR INTEGRAL - ESQUEMA DE BASE DE DATOS POSTGRESQL
-- Base de Datos del Usuario: ${activeUsername}
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
    "id_curso" INTEGER REFERENCES "Grupo"("id_curso") ON DELETE SET NULL
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
-- INSERCIÓN DE DATOS REGISTRADOS EN EL SISTEMA (${activeUsername})
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
      `INSERT INTO "Alumnos" ("id_alumno", "nombre", "apellido", "id_curso") VALUES (${a.id_alumno}, '${a.nombre.replace(/'/g, "''")}', '${a.apellido.replace(/'/g, "''")}', ${a.id_curso ?? 'NULL'}) ON CONFLICT ("id_alumno") DO UPDATE SET "nombre" = EXCLUDED."nombre", "apellido" = EXCLUDED."apellido", "id_curso" = EXCLUDED."id_curso";`
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
        currentUserProfile,
        isSuperAdmin,
        users,
        showFirstLoginModal,
        setShowFirstLoginModal,
        login,
        logout,
        changeAdminPassword,
        registerUser,
        updateUser,
        deleteUser,
        switchUser,
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
        downloadStudentReport,
        downloadStudentsListReport,
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
        backups,
        createBackup,
        restoreBackup,
        deleteBackup,
        exportBackupJson,
        importBackupJson,
        systemNotice,
        setSystemNotice,
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
