import { Grupo, Alumno, Asistencia, TemarioDia, DesempenoClase, Nota } from '../types';

// ==========================================================
// ESTADO INICIAL: PLANTILLA 100% VACÍA (SIN REGISTROS)
// ==========================================================
export const INITIAL_GRUPOS: Grupo[] = [];
export const INITIAL_ALUMNOS: Alumno[] = [];
export const INITIAL_ASISTENCIAS: Asistencia[] = [];
export const INITIAL_TEMARIOS: TemarioDia[] = [];
export const INITIAL_DESEMPENOS: DesempenoClase[] = [];
export const INITIAL_NOTAS: Nota[] = [];

// ==========================================================
// DATOS OPCIONALES DE DEMOSTRACIÓN (SOLO SI SE SOLICITA)
// ==========================================================
export const DEMO_GRUPOS: Grupo[] = [
  {
    id_curso: 1,
    nombre_curso: 'Electrónica y Microcontroladores',
    descripcion: 'Diseño de circuitos analógicos y digitales, microcontroladores ESP32 y sensores IoT industriales.',
  },
  {
    id_curso: 2,
    nombre_curso: 'Redes y Telecomunicaciones',
    descripcion: 'Configuración de switches y routers Cisco, topologías VLAN, direccionamiento IPv4/IPv6 y cableado estructurado.',
  },
  {
    id_curso: 3,
    nombre_curso: 'Automatización y Robótica Industrial',
    descripcion: 'Programación de autómatas programables (PLC Siemens S7-1200), electro-neumática y brazos robóticos SCARA.',
  },
];

export const DEMO_ALUMNOS: Alumno[] = [
  { id_alumno: 1, nombre: 'Mateo', apellido: 'Fernández', id_curso: 1 },
  { id_alumno: 2, nombre: 'Sofía', apellido: 'Gómez', id_curso: 1 },
  { id_alumno: 3, nombre: 'Lucas', apellido: 'Herrera', id_curso: 1 },
  { id_alumno: 4, nombre: 'Camila', apellido: 'Vargas', id_curso: 1 },
  { id_alumno: 5, nombre: 'Nicolás', apellido: 'Rojas', id_curso: 1 },
  { id_alumno: 6, nombre: 'Valentina', apellido: 'Silva', id_curso: 2 },
  { id_alumno: 7, nombre: 'Joaquín', apellido: 'Castillo', id_curso: 2 },
  { id_alumno: 8, nombre: 'Martina', apellido: 'Pérez', id_curso: 2 },
  { id_alumno: 9, nombre: 'Diego', apellido: 'Morales', id_curso: 2 },
  { id_alumno: 10, nombre: 'Agustín', apellido: 'Romero', id_curso: 3 },
  { id_alumno: 11, nombre: 'Lucía', apellido: 'Torres', id_curso: 3 },
];

export const DEMO_ASISTENCIAS: Asistencia[] = [
  { id_alumno: 1, fecha: '2026-09-18', asistio: true },
  { id_alumno: 2, fecha: '2026-09-18', asistio: true },
  { id_alumno: 3, fecha: '2026-09-18', asistio: true },
  { id_alumno: 4, fecha: '2026-09-18', asistio: true },
  { id_alumno: 5, fecha: '2026-09-18', asistio: false },
  { id_alumno: 6, fecha: '2026-09-18', asistio: true },
  { id_alumno: 7, fecha: '2026-09-18', asistio: true },
  { id_alumno: 8, fecha: '2026-09-18', asistio: false },
  { id_alumno: 9, fecha: '2026-09-18', asistio: true },
];

export const DEMO_TEMARIOS: TemarioDia[] = [
  {
    id_temario: 1,
    fecha: '2026-09-18',
    id_curso: 1,
    unidad_tematica: 'Unidad 1: Arquitectura de Microcontroladores',
    temas: 'Introducción al ESP32, pines GPIO, multiplexación y lectura de entradas analógicas (ADC 12 bits).',
    objetivos: 'Comprender el conexionado de transductores analógicos y el acondicionamiento de señales eléctricas de 0-3.3V.',
    recursos: 'Osciloscopio digital, placas ESP32-WROOM-32, potenciómetros de precisión y software VS Code con PlatformIO.',
  },
];

export const DEMO_DESEMPENOS: DesempenoClase[] = [
  { id_temario: 1, id_alumno: 1, estado_desempeno: 'Excelente' },
  { id_temario: 1, id_alumno: 2, estado_desempeno: 'Excelente' },
  { id_temario: 1, id_alumno: 3, estado_desempeno: 'Bueno' },
  { id_temario: 1, id_alumno: 4, estado_desempeno: 'Bueno' },
  { id_temario: 1, id_alumno: 5, estado_desempeno: 'Necesita Refuerzo' },
];

export const DEMO_NOTAS: Nota[] = [
  { id_nota: 1, id_alumno: 1, tipo_evaluacion: 'Parcial 1 (Teórico)', nota: 9.50 },
  { id_nota: 2, id_alumno: 1, tipo_evaluacion: 'Práctica de Taller 1', nota: 10.00 },
  { id_nota: 3, id_alumno: 2, tipo_evaluacion: 'Parcial 1 (Teórico)', nota: 8.75 },
  { id_nota: 4, id_alumno: 3, tipo_evaluacion: 'Parcial 1 (Teórico)', nota: 6.50 },
  { id_nota: 5, id_alumno: 5, tipo_evaluacion: 'Parcial 1 (Teórico)', nota: 3.50 },
];
