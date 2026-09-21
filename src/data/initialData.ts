import { Grupo, Alumno, Asistencia, TemarioDia, DesempenoClase, Nota } from '../types';

export const INITIAL_GRUPOS: Grupo[] = [
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

export const INITIAL_ALUMNOS: Alumno[] = [
  // Curso 1: Electrónica (id_curso = 1)
  { id_alumno: 1, nombre: 'Mateo', apellido: 'Fernández', id_curso: 1, certificado: true },
  { id_alumno: 2, nombre: 'Sofía', apellido: 'Gómez', id_curso: 1, certificado: true },
  { id_alumno: 3, nombre: 'Lucas', apellido: 'Herrera', id_curso: 1, certificado: false },
  { id_alumno: 4, nombre: 'Camila', apellido: 'Vargas', id_curso: 1, certificado: true },
  { id_alumno: 5, nombre: 'Nicolás', apellido: 'Rojas', id_curso: 1, certificado: false }, // acumulador de faltas

  // Curso 2: Redes (id_curso = 2)
  { id_alumno: 6, nombre: 'Valentina', apellido: 'Silva', id_curso: 2, certificado: true },
  { id_alumno: 7, nombre: 'Joaquín', apellido: 'Castillo', id_curso: 2, certificado: true },
  { id_alumno: 8, nombre: 'Martina', apellido: 'Pérez', id_curso: 2, certificado: false }, // acumulador de faltas
  { id_alumno: 9, nombre: 'Diego', apellido: 'Morales', id_curso: 2, certificado: true },

  // Curso 3: Automatización (id_curso = 3)
  { id_alumno: 10, nombre: 'Agustín', apellido: 'Romero', id_curso: 3, certificado: true },
  { id_alumno: 11, nombre: 'Lucía', apellido: 'Torres', id_curso: 3, certificado: false },
  { id_alumno: 12, nombre: 'Emiliano', apellido: 'Navarro', id_curso: 3, certificado: true },
  { id_alumno: 13, nombre: 'Florencia', apellido: 'Méndez', id_curso: 3, certificado: false },
];

export const INITIAL_ASISTENCIAS: Asistencia[] = [
  // Semana 1: 2026-09-14
  { id_alumno: 1, fecha: '2026-09-14', asistio: true },
  { id_alumno: 2, fecha: '2026-09-14', asistio: true },
  { id_alumno: 3, fecha: '2026-09-14', asistio: true },
  { id_alumno: 4, fecha: '2026-09-14', asistio: true },
  { id_alumno: 5, fecha: '2026-09-14', asistio: false }, // Falta 1

  { id_alumno: 6, fecha: '2026-09-14', asistio: true },
  { id_alumno: 7, fecha: '2026-09-14', asistio: true },
  { id_alumno: 8, fecha: '2026-09-14', asistio: false }, // Falta 1
  { id_alumno: 9, fecha: '2026-09-14', asistio: true },

  // Semana 1: 2026-09-15
  { id_alumno: 1, fecha: '2026-09-15', asistio: true },
  { id_alumno: 2, fecha: '2026-09-15', asistio: true },
  { id_alumno: 3, fecha: '2026-09-15', asistio: false }, // Falta 1
  { id_alumno: 4, fecha: '2026-09-15', asistio: true },
  { id_alumno: 5, fecha: '2026-09-15', asistio: false }, // Falta 2

  { id_alumno: 6, fecha: '2026-09-15', asistio: true },
  { id_alumno: 7, fecha: '2026-09-15', asistio: false }, // Falta 1
  { id_alumno: 8, fecha: '2026-09-15', asistio: false }, // Falta 2
  { id_alumno: 9, fecha: '2026-09-15', asistio: true },

  // Semana 1: 2026-09-16
  { id_alumno: 1, fecha: '2026-09-16', asistio: true },
  { id_alumno: 2, fecha: '2026-09-16', asistio: true },
  { id_alumno: 3, fecha: '2026-09-16', asistio: true },
  { id_alumno: 4, fecha: '2026-09-16', asistio: false }, // Falta 1
  { id_alumno: 5, fecha: '2026-09-16', asistio: false }, // Falta 3

  { id_alumno: 6, fecha: '2026-09-16', asistio: true },
  { id_alumno: 7, fecha: '2026-09-16', asistio: true },
  { id_alumno: 8, fecha: '2026-09-16', asistio: false }, // Falta 3
  { id_alumno: 9, fecha: '2026-09-16', asistio: true },

  // Semana 1: 2026-09-17
  { id_alumno: 1, fecha: '2026-09-17', asistio: true },
  { id_alumno: 2, fecha: '2026-09-17', asistio: true },
  { id_alumno: 3, fecha: '2026-09-17', asistio: true },
  { id_alumno: 4, fecha: '2026-09-17', asistio: true },
  { id_alumno: 5, fecha: '2026-09-17', asistio: false }, // Falta 4

  { id_alumno: 6, fecha: '2026-09-17', asistio: true },
  { id_alumno: 7, fecha: '2026-09-17', asistio: true },
  { id_alumno: 8, fecha: '2026-09-17', asistio: false }, // Falta 4
  { id_alumno: 9, fecha: '2026-09-17', asistio: true },

  // Semana 1: 2026-09-18
  { id_alumno: 1, fecha: '2026-09-18', asistio: true },
  { id_alumno: 2, fecha: '2026-09-18', asistio: true },
  { id_alumno: 3, fecha: '2026-09-18', asistio: true },
  { id_alumno: 4, fecha: '2026-09-18', asistio: true },
  { id_alumno: 5, fecha: '2026-09-18', asistio: false }, // Falta 5

  { id_alumno: 6, fecha: '2026-09-18', asistio: true },
  { id_alumno: 7, fecha: '2026-09-18', asistio: true },
  { id_alumno: 8, fecha: '2026-09-18', asistio: false }, // Falta 5
  { id_alumno: 9, fecha: '2026-09-18', asistio: true },

  // Semana 2: 2026-09-21 (Fecha actual/reciente)
  { id_alumno: 1, fecha: '2026-09-21', asistio: true },
  { id_alumno: 2, fecha: '2026-09-21', asistio: true },
  { id_alumno: 3, fecha: '2026-09-21', asistio: true },
  { id_alumno: 4, fecha: '2026-09-21', asistio: true },
  { id_alumno: 5, fecha: '2026-09-21', asistio: false }, // Falta 6 -> EXCEDE FALTAS!

  { id_alumno: 6, fecha: '2026-09-21', asistio: true },
  { id_alumno: 7, fecha: '2026-09-21', asistio: true },
  { id_alumno: 8, fecha: '2026-09-21', asistio: false }, // Falta 6 -> EXCEDE FALTAS!
  { id_alumno: 9, fecha: '2026-09-21', asistio: true },

  // Curso 3 Asistencias
  { id_alumno: 10, fecha: '2026-09-14', asistio: true },
  { id_alumno: 11, fecha: '2026-09-14', asistio: true },
  { id_alumno: 12, fecha: '2026-09-14', asistio: true },
  { id_alumno: 13, fecha: '2026-09-14', asistio: true },

  { id_alumno: 10, fecha: '2026-09-18', asistio: true },
  { id_alumno: 11, fecha: '2026-09-18', asistio: false },
  { id_alumno: 12, fecha: '2026-09-18', asistio: true },
  { id_alumno: 13, fecha: '2026-09-18', asistio: true },
];

export const INITIAL_TEMARIOS: TemarioDia[] = [
  {
    id_temario: 1,
    fecha: '2026-09-14',
    id_curso: 1,
    unidad_tematica: 'Unidad 1: Arquitectura de Microcontroladores',
    temas: 'Introducción al ESP32, pines GPIO, multiplexación y lectura de entradas analógicas (ADC 12 bits).',
    objetivos: 'Comprender el conexionado de transductores analógicos y el acondicionamiento de señales eléctricas de 0-3.3V.',
    recursos: 'Osciloscopio digital, placas ESP32-WROOM-32, potenciómetros de precisión y software VS Code con PlatformIO.',
  },
  {
    id_temario: 2,
    fecha: '2026-09-15',
    id_curso: 1,
    unidad_tematica: 'Unidad 2: Buses de Comunicación Industrial',
    temas: 'Protocolo I2C y SPI. Conexión de pantalla OLED y memoria EEPROM externa.',
    objetivos: 'Implementar comunicación maestro-esclavo y diagnosticar fallas con analizador lógico.',
    recursos: 'Analizador lógico USB Saleae, display OLED 0.96 I2C, resistencias pull-up 4.7k ohm.',
  },
  {
    id_temario: 3,
    fecha: '2026-09-14',
    id_curso: 2,
    unidad_tematica: 'Unidad 1: Fundamentos de Enrutamiento y Conmutación',
    temas: 'Modelo OSI vs TCP/IP. Creación y asignación de puertos en VLANs 10, 20 y 30 en Switch Cisco Catalyst 2960.',
    objetivos: 'Aislar tráfico de difusión por departamentos y configurar enlace troncal dot1q.',
    recursos: 'Switch Cisco 2960, cables de consola RJ45 a USB, emulador Cisco Packet Tracer y terminal PuTTY.',
  },
  {
    id_temario: 4,
    fecha: '2026-09-14',
    id_curso: 3,
    unidad_tematica: 'Unidad 1: Programación Lógica de Controladores',
    temas: 'Entorno TIA Portal V18. Lógica combinacional básica en lenguaje KOP / Ladder para control de cintas transportadoras.',
    objetivos: 'Diseñar enclavamiento eléctrico por software con pulsadores normalmente abiertos y paradas de emergencia.',
    recursos: 'Banco de pruebas didáctico con PLC Siemens S7-1200 CPU 1214C DC/DC/DC y botonera industrial.',
  },
];

export const INITIAL_DESEMPENOS: DesempenoClase[] = [
  // Temario 1 (Curso 1, Clase 2026-09-14)
  { id_temario: 1, id_alumno: 1, estado_desempeno: 'Excelente' },
  { id_temario: 1, id_alumno: 2, estado_desempeno: 'Excelente' },
  { id_temario: 1, id_alumno: 3, estado_desempeno: 'Bueno' },
  { id_temario: 1, id_alumno: 4, estado_desempeno: 'Bueno' },
  { id_temario: 1, id_alumno: 5, estado_desempeno: 'Necesita Refuerzo' },

  // Temario 2 (Curso 1, Clase 2026-09-15)
  { id_temario: 2, id_alumno: 1, estado_desempeno: 'Excelente' },
  { id_temario: 2, id_alumno: 2, estado_desempeno: 'Bueno' },
  { id_temario: 2, id_alumno: 3, estado_desempeno: 'Regular' },
  { id_temario: 2, id_alumno: 4, estado_desempeno: 'Excelente' },
  { id_temario: 2, id_alumno: 5, estado_desempeno: 'Necesita Refuerzo' },

  // Temario 3 (Curso 2, Clase 2026-09-14)
  { id_temario: 3, id_alumno: 6, estado_desempeno: 'Excelente' },
  { id_temario: 3, id_alumno: 7, estado_desempeno: 'Bueno' },
  { id_temario: 3, id_alumno: 8, estado_desempeno: 'Necesita Refuerzo' },
  { id_temario: 3, id_alumno: 9, estado_desempeno: 'Excelente' },
];

export const INITIAL_NOTAS: Nota[] = [
  // Alumno 1 (Mateo)
  { id_nota: 1, id_alumno: 1, tipo_evaluacion: 'Parcial 1 (Teórico)', nota: 9.50 },
  { id_nota: 2, id_alumno: 1, tipo_evaluacion: 'Práctica de Taller 1', nota: 10.00 },
  { id_nota: 3, id_alumno: 1, tipo_evaluacion: 'Examen de Medio Término', nota: 9.00 },

  // Alumno 2 (Sofía)
  { id_nota: 4, id_alumno: 2, tipo_evaluacion: 'Parcial 1 (Teórico)', nota: 8.75 },
  { id_nota: 5, id_alumno: 2, tipo_evaluacion: 'Práctica de Taller 1', nota: 9.20 },

  // Alumno 3 (Lucas)
  { id_nota: 6, id_alumno: 3, tipo_evaluacion: 'Parcial 1 (Teórico)', nota: 6.50 },
  { id_nota: 7, id_alumno: 3, tipo_evaluacion: 'Práctica de Taller 1', nota: 7.00 },

  // Alumno 4 (Camila)
  { id_nota: 8, id_alumno: 4, tipo_evaluacion: 'Parcial 1 (Teórico)', nota: 8.00 },
  { id_nota: 9, id_alumno: 4, tipo_evaluacion: 'Práctica de Taller 1', nota: 8.50 },

  // Alumno 5 (Nicolás - En riesgo)
  { id_nota: 10, id_alumno: 5, tipo_evaluacion: 'Parcial 1 (Teórico)', nota: 3.50 },
  { id_nota: 11, id_alumno: 5, tipo_evaluacion: 'Práctica de Taller 1', nota: 4.00 },

  // Alumno 6 (Valentina)
  { id_nota: 12, id_alumno: 6, tipo_evaluacion: 'Parcial 1: Topologías', nota: 9.00 },
  { id_nota: 13, id_alumno: 6, tipo_evaluacion: 'Laboratorio Cisco VLANs', nota: 9.50 },

  // Alumno 7 (Joaquín)
  { id_nota: 14, id_alumno: 7, tipo_evaluacion: 'Parcial 1: Topologías', nota: 7.50 },
  { id_nota: 15, id_alumno: 7, tipo_evaluacion: 'Laboratorio Cisco VLANs', nota: 7.00 },

  // Alumno 8 (Martina - En riesgo por faltas y notas)
  { id_nota: 16, id_alumno: 8, tipo_evaluacion: 'Parcial 1: Topologías', nota: 4.50 },

  // Alumno 9 (Diego)
  { id_nota: 17, id_alumno: 9, tipo_evaluacion: 'Parcial 1: Topologías', nota: 8.80 },
  { id_nota: 18, id_alumno: 9, tipo_evaluacion: 'Laboratorio Cisco VLANs', nota: 8.50 },

  // Alumnos Curso 3
  { id_nota: 19, id_alumno: 10, tipo_evaluacion: 'Parcial 1: Lógica Ladder', nota: 9.25 },
  { id_nota: 20, id_alumno: 11, tipo_evaluacion: 'Parcial 1: Lógica Ladder', nota: 6.00 },
  { id_nota: 21, id_alumno: 12, tipo_evaluacion: 'Parcial 1: Lógica Ladder', nota: 8.00 },
  { id_nota: 22, id_alumno: 13, tipo_evaluacion: 'Parcial 1: Lógica Ladder', nota: 5.50 },
];
