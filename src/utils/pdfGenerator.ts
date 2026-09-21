import { jsPDF } from 'jspdf';
import { Alumno, Grupo, ResumenAlumno, Nota, Asistencia, TemarioDia, DesempenoClase } from '../types';

export interface StudentReportData {
  alumno: Alumno;
  curso: Grupo | null;
  resumen: ResumenAlumno;
  notas: Nota[];
  asistencias: Asistencia[];
  desempenos: DesempenoClase[];
  temarios: TemarioDia[];
  maxAbsencesThreshold: number;
}

export function generateStudentReportPDF(data: StudentReportData) {
  const {
    alumno,
    curso,
    resumen,
    notas,
    asistencias,
    desempenos,
    temarios,
    maxAbsencesThreshold,
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = 14;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 15;
      drawSubHeader();
    }
  };

  const drawSubHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Informe Académico Oficial - Estudiante: ${alumno.apellido}, ${alumno.nombre} (ID #${alumno.id_alumno})`,
      margin + 3,
      y + 4.8
    );
    y += 11;
  };

  // 1. HEADER BANNER
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  // Blue Accent bar on top of the banner
  doc.setFillColor(37, 99, 235); // blue-600
  doc.roundedRect(margin, y, contentWidth, 3, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('SISTEMA DE GESTIÓN ESCOLAR INTEGRAL', margin + 6, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('INFORME ACADÉMICO, DE ASISTENCIA Y DESEMPEÑO DEL ESTUDIANTE', margin + 6, y + 17);

  const currentDateStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Fecha de emisión: ${currentDateStr}`, pageWidth - margin - 6, y + 21, { align: 'right' });

  y += 31;

  // 2. DATOS GENERALES DEL ESTUDIANTE
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('DATOS DEL ESTUDIANTE', margin + 5, y + 6);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 5, y + 8, margin + contentWidth - 5, y + 8);

  // Row 1: Nombre y Curso
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Estudiante:', margin + 5, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${alumno.apellido}, ${alumno.nombre}`, margin + 26, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Matrícula / ID: #${alumno.id_alumno}`, margin + 110, y + 14);

  // Row 2: Curso y Estado
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Asignatura / Curso:', margin + 5, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(curso ? curso.nombre_curso : 'Sin grupo asignado', margin + 38, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Situación:', margin + 110, y + 20);

  let estadoColor: [number, number, number] = [16, 185, 129]; // Emerald
  if (resumen.estadoAprobacion === 'En Riesgo') {
    estadoColor = [225, 29, 72]; // Rose
  } else if (resumen.estadoAprobacion === 'Regular') {
    estadoColor = [217, 119, 6]; // Amber
  } else if (resumen.estadoAprobacion === 'Sin Notas') {
    estadoColor = [100, 116, 139]; // Slate
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(estadoColor[0], estadoColor[1], estadoColor[2]);
  doc.text(resumen.estadoAprobacion.toUpperCase(), margin + 130, y + 20);

  y += 28;

  // 3. TARJETAS DE RESUMEN ACADÉMICO Y ASISTENCIA (KPIS)
  const cardWidth = (contentWidth - 6) / 3;
  const cardHeight = 18;

  // Card 1: Promedio
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175);
  doc.text('PROMEDIO ACADÉMICO', margin + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(29, 78, 216);
  doc.text(
    resumen.promedio !== null ? `${resumen.promedio.toFixed(2)} / 10` : 'Sin Calificaciones',
    margin + 4,
    y + 13
  );

  // Card 2: Asistencia %
  doc.setFillColor(240, 253, 244); // Emerald-50
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin + cardWidth + 3, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text('PORCENTAJE ASISTENCIA', margin + cardWidth + 7, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(21, 128, 61);
  doc.text(`${resumen.porcentajeAsistencia}%`, margin + cardWidth + 7, y + 13);

  // Card 3: Inasistencias & Alerta
  const isAlert = resumen.excedeFaltas;
  if (isAlert) {
    doc.setFillColor(255, 241, 242);
    doc.setDrawColor(254, 205, 211);
  } else {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
  }
  doc.roundedRect(margin + (cardWidth + 3) * 2, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  if (isAlert) {
    doc.setTextColor(159, 18, 57);
  } else {
    doc.setTextColor(71, 85, 105);
  }
  doc.text('INASISTENCIAS TOTALES', margin + (cardWidth + 3) * 2 + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  if (isAlert) {
    doc.setTextColor(225, 29, 72);
  } else {
    doc.setTextColor(15, 23, 42);
  }
  doc.text(
    `${resumen.faltasTotales} ${resumen.faltasTotales === 1 ? 'falta' : 'faltas'} ${
      isAlert ? '(EXCEDE LÍMITE)' : `(Máx: ${maxAbsencesThreshold})`
    }`,
    margin + (cardWidth + 3) * 2 + 4,
    y + 13
  );

  y += 24;

  // 4. TABLA DE CALIFICACIONES
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. REGISTRO DE CALIFICACIONES Y EVALUACIONES (Tabla: Notas)', margin, y);
  y += 4;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('#', margin + 3, y + 4.8);
  doc.text('Tipo de Evaluación', margin + 16, y + 4.8);
  doc.text('Calificación (0 - 10)', margin + 110, y + 4.8);
  doc.text('Estado Académico', margin + 148, y + 4.8);
  y += 7;

  if (notas.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No se han registrado calificaciones para este estudiante.', margin + 4, y + 5.5);
    y += 11;
  } else {
    notas.forEach((n, idx) => {
      checkPageBreak(8);
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, contentWidth, 7, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(String(idx + 1), margin + 3, y + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(n.tipo_evaluacion, margin + 16, y + 4.8);

      doc.setFont('helvetica', 'bold');
      const isPass = n.nota >= 6.0;
      if (isPass) {
        doc.setTextColor(21, 128, 61);
      } else {
        doc.setTextColor(225, 29, 72);
      }
      doc.text(n.nota.toFixed(2), margin + 115, y + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.text(isPass ? 'Aprobado' : 'Desaprobado', margin + 148, y + 4.8);

      y += 7;
    });

    // Subtotal promedio row
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('PROMEDIO FINAL:', margin + 70, y + 4.8);
    doc.setTextColor(29, 78, 216);
    doc.text(
      resumen.promedio !== null ? `${resumen.promedio.toFixed(2)} / 10.00` : 'N/A',
      margin + 115,
      y + 4.8
    );
    y += 11;
  }

  // 5. REGISTRO DE DESEMPEÑO EN CLASE (Checklist)
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. DESEMPEÑO INDIVIDUAL POR CLASE (Tabla: Desempeno_Clase)', margin, y);
  y += 4;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha', margin + 3, y + 4.8);
  doc.text('Unidad Temática / Contenido', margin + 28, y + 4.8);
  doc.text('Evaluación de Desempeño', margin + 130, y + 4.8);
  y += 7;

  const studentDesempenos = desempenos.filter((d) => d.id_alumno === alumno.id_alumno);

  if (studentDesempenos.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No hay registros de desempeño cargados en las clases dictadas.', margin + 4, y + 5.5);
    y += 11;
  } else {
    studentDesempenos.forEach((des, idx) => {
      checkPageBreak(8);
      const temario = temarios.find((t) => t.id_temario === des.id_temario);
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, contentWidth, 7, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(temario?.fecha || 'S/D', margin + 3, y + 4.8);

      doc.setTextColor(15, 23, 42);
      const unidadText = temario ? temario.unidad_tematica : `Clase #${des.id_temario}`;
      doc.text(
        unidadText.length > 55 ? unidadText.substring(0, 52) + '...' : unidadText,
        margin + 28,
        y + 4.8
      );

      doc.setFont('helvetica', 'bold');
      let statusColor: [number, number, number] = [16, 185, 129];
      if (des.estado_desempeno === 'Necesita Refuerzo') statusColor = [225, 29, 72];
      else if (des.estado_desempeno === 'Regular') statusColor = [217, 119, 6];
      else if (des.estado_desempeno === 'Bueno') statusColor = [37, 99, 235];

      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(des.estado_desempeno, margin + 130, y + 4.8);

      y += 7;
    });
    y += 4;
  }

  // 6. HISTORIAL DE ASISTENCIAS
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. CONTROL DETALLADO DE ASISTENCIAS (Tabla: Asistencia)', margin, y);
  y += 4;

  const studentAsistencias = asistencias
    .filter((a) => a.id_alumno === alumno.id_alumno)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (studentAsistencias.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No hay jornadas de asistencia registradas para este estudiante.', margin + 4, y + 5.5);
    y += 11;
  } else {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 7, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Fecha', margin + 3, y + 4.8);
    doc.text('Estado de Presencia', margin + 40, y + 4.8);
    doc.text('Observación', margin + 100, y + 4.8);
    y += 7;

    studentAsistencias.forEach((asist, idx) => {
      checkPageBreak(7);
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, contentWidth, 6.5, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(asist.fecha, margin + 3, y + 4.4);

      doc.setFont('helvetica', 'bold');
      if (asist.asistio) {
        doc.setTextColor(21, 128, 61);
        doc.text('✓ Presente', margin + 40, y + 4.4);
      } else {
        doc.setTextColor(225, 29, 72);
        doc.text('✗ Ausente (Falta)', margin + 40, y + 4.4);
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(asist.asistio ? 'Asistencia computada' : 'Inasistencia no justificada', margin + 100, y + 4.4);

      y += 6.5;
    });
    y += 6;
  }

  // 7. FIRMAS INSTITUCIONALES
  checkPageBreak(35);
  y += 10;
  const colWidth = 60;
  const col1X = margin + 15;
  const col2X = margin + contentWidth - colWidth - 15;

  doc.setDrawColor(148, 163, 184);
  doc.line(col1X, y + 12, col1X + colWidth, y + 12);
  doc.line(col2X, y + 12, col2X + colWidth, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Firma de la Dirección Técnica', col1X + colWidth / 2, y + 16, { align: 'center' });
  doc.text('Firma del Docente a Cargo', col2X + colWidth / 2, y + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Sello y Conformidad Institucional', col1X + colWidth / 2, y + 19.5, { align: 'center' });
  doc.text('Profesor Titular de Asignatura', col2X + colWidth / 2, y + 19.5, { align: 'center' });

  // Footer en todas las páginas
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 11, margin + contentWidth, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Sistema de Gestión Escolar Integral • Arquitectura Relacional de 6 Tablas', margin, pageHeight - 7);
    doc.text(`Página ${p} de ${totalPages}`, margin + contentWidth, pageHeight - 7, { align: 'right' });
  }

  // Guardar archivo descargable
  const sanitizedName = `${alumno.apellido}_${alumno.nombre}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Informe_Estudiante_${sanitizedName}.pdf`);
}

export interface StudentsListPDFOptions {
  alumnos: Alumno[];
  grupos: Grupo[];
  resumenAlumnos: ResumenAlumno[];
  cursoFiltro?: Grupo | null;
  docenteNombre?: string;
  formato?: 'academico' | 'firmas_asistencia';
  criterioFiltroTexto?: string;
}

export function generateStudentsListPDF(options: StudentsListPDFOptions) {
  const {
    alumnos,
    grupos,
    resumenAlumnos,
    cursoFiltro = null,
    docenteNombre = 'Docente Titular',
    formato = 'academico',
    criterioFiltroTexto = '',
  } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 273mm
  let y = 10;

  const currentDateStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const currentTimeStr = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // KPI Calculations
  const totalStudents = alumnos.length;
  const aprobados = resumenAlumnos.filter((r) => r.estadoAprobacion === 'Aprobado').length;
  const regulares = resumenAlumnos.filter((r) => r.estadoAprobacion === 'Regular').length;
  const enRiesgo = resumenAlumnos.filter((r) => r.estadoAprobacion === 'En Riesgo').length;
  const sinNotas = resumenAlumnos.filter((r) => r.estadoAprobacion === 'Sin Notas').length;

  const validPromedios = resumenAlumnos.filter((r) => r.promedio !== null).map((r) => r.promedio as number);
  const promedioGeneral =
    validPromedios.length > 0
      ? (validPromedios.reduce((a, b) => a + b, 0) / validPromedios.length).toFixed(2)
      : 'S/C';

  // Helper: Draw Table Header
  const drawTableHeader = () => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text('N°', margin + 3, y + 4.8);
    doc.text('ID', margin + 12, y + 4.8);
    doc.text('ESTUDIANTE (APELLIDOS Y NOMBRES)', margin + 28, y + 4.8);
    doc.text('CURSO / ASIGNATURA', margin + 94, y + 4.8);

    if (formato === 'academico') {
      doc.text('ASISTENCIA', margin + 148, y + 4.8);
      doc.text('PROM.', margin + 182, y + 4.8);
      doc.text('ESTADO ACADÉMICO', margin + 208, y + 4.8);
      doc.text('OBSERVACIONES', margin + 242, y + 4.8);
    } else {
      doc.text('ASISTENCIA', margin + 148, y + 4.8);
      doc.text('CONDICIÓN', margin + 176, y + 4.8);
      doc.text('FIRMA DE CONFORMIDAD', margin + 206, y + 4.8);
      doc.text('OBSERVACIONES', margin + 250, y + 4.8);
    }

    y += 7.8;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 12;
      // Subheader on secondary pages
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Nómina Oficial de Estudiantes ${cursoFiltro ? `• Curso: ${cursoFiltro.nombre_curso}` : '• Todos los Cursos'} • Emisión: ${currentDateStr}`,
        margin + 3,
        y + 4.2
      );
      y += 8;
      drawTableHeader();
    }
  };

  // 1. BANNER HEADER
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 23, 2, 2, 'F');

  // Blue Accent Bar
  doc.setFillColor(37, 99, 235); // blue-600
  doc.roundedRect(margin, y, contentWidth, 2.5, 2, 2, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('SISTEMA DE GESTIÓN ESCOLAR INTEGRAL', margin + 6, y + 9);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  const tituloNomina = cursoFiltro
    ? `NÓMINA OFICIAL DE ESTUDIANTES — CURSO: ${cursoFiltro.nombre_curso.toUpperCase()}`
    : 'NÓMINA OFICIAL DE ESTUDIANTES — REGISTRO INSTITUCIONAL GENERAL';
  doc.text(tituloNomina, margin + 6, y + 15);

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Docente / Responsable: ${docenteNombre} • Formato: ${formato === 'academico' ? 'Informe Académico Completo' : 'Planilla de Control y Firmas'}`,
    margin + 6,
    y + 19.5
  );

  // Right Meta
  doc.text(`Fecha: ${currentDateStr} • ${currentTimeStr}`, pageWidth - margin - 6, y + 9, { align: 'right' });
  doc.text(`Total Alumnos en Nómina: ${totalStudents}`, pageWidth - margin - 6, y + 15, { align: 'right' });
  if (criterioFiltroTexto) {
    doc.text(`Filtro: "${criterioFiltroTexto}"`, pageWidth - margin - 6, y + 19.5, { align: 'right' });
  }

  y += 26;

  // 2. KPI SUMMARY BAR
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const kpiY = y + 6.5;
  doc.text(`Total Estudiantes: ${totalStudents}`, margin + 6, kpiY);
  doc.setTextColor(5, 150, 105);
  doc.text(`• Aprobados: ${aprobados}`, margin + 50, kpiY);
  doc.setTextColor(217, 119, 6);
  doc.text(`• Regulares: ${regulares}`, margin + 92, kpiY);
  doc.setTextColor(225, 29, 72);
  doc.text(`• En Riesgo / Alerta: ${enRiesgo}`, margin + 134, kpiY);
  doc.setTextColor(100, 116, 139);
  doc.text(`• Sin Calificaciones: ${sinNotas}`, margin + 188, kpiY);
  doc.setTextColor(37, 99, 235);
  doc.text(`• Promedio General: ${promedioGeneral}`, margin + 236, kpiY);

  y += 13;

  // 3. TABLE HEADER
  drawTableHeader();

  // 4. ROWS
  if (alumnos.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 14, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No hay estudiantes registrados con los criterios seleccionados.', pageWidth / 2, y + 8, { align: 'center' });
    y += 16;
  } else {
    alumnos.forEach((alumno, index) => {
      checkPageBreak(8);

      const rowY = y;
      const isZebra = index % 2 === 1;

      // Background row
      if (isZebra) {
        doc.setFillColor(248, 250, 252); // slate-50
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(margin, rowY, contentWidth, 7, 'F');

      // Thin bottom line
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, rowY + 7, margin + contentWidth, rowY + 7);

      const resumen = resumenAlumnos.find((r) => r.alumno.id_alumno === alumno.id_alumno);
      const curso = grupos.find((g) => g.id_curso === alumno.id_curso);

      // Col 1: N°
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${index + 1}`, margin + 3, rowY + 4.8);

      // Col 2: ID
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`#${alumno.id_alumno}`, margin + 12, rowY + 4.8);

      // Col 3: Estudiante
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const studentName = `${alumno.apellido}, ${alumno.nombre}`;
      doc.text(studentName.length > 34 ? studentName.substring(0, 32) + '...' : studentName, margin + 28, rowY + 4.8);

      // Col 4: Curso
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const cursoName = curso ? curso.nombre_curso : 'Sin asignar';
      doc.text(cursoName.length > 28 ? cursoName.substring(0, 26) + '...' : cursoName, margin + 94, rowY + 4.8);

      if (formato === 'academico') {
        // Col 5: Asistencia
        const asistPct = resumen ? `${resumen.porcentajeAsistencia}%` : '100%';
        const asistDetalle = resumen ? `(${resumen.asistenciasTotales}/${resumen.totalClasesRegistradas})` : '';
        doc.setFont('helvetica', 'bold');
        if (resumen && resumen.excedeFaltas) {
          doc.setTextColor(225, 29, 72);
        } else {
          doc.setTextColor(51, 65, 85);
        }
        doc.text(`${asistPct} ${asistDetalle}`, margin + 148, rowY + 4.8);

        // Col 6: Promedio
        const promVal = resumen && resumen.promedio !== null ? resumen.promedio.toFixed(2) : '-';
        doc.setFont('helvetica', 'bold');
        if (resumen && resumen.promedio !== null) {
          if (resumen.promedio >= 7.0) doc.setTextColor(5, 150, 105);
          else if (resumen.promedio >= 4.0) doc.setTextColor(217, 119, 6);
          else doc.setTextColor(225, 29, 72);
        } else {
          doc.setTextColor(148, 163, 184);
        }
        doc.text(promVal, margin + 182, rowY + 4.8);

        // Col 7: Estado Académico Badge
        const estado = resumen ? resumen.estadoAprobacion : 'Sin Notas';
        if (estado === 'Aprobado') {
          doc.setFillColor(220, 252, 231);
          doc.roundedRect(margin + 207, rowY + 1.2, 26, 4.8, 1, 1, 'F');
          doc.setTextColor(22, 101, 52);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text('✓ Aprobado', margin + 210, rowY + 4.6);
        } else if (estado === 'Regular') {
          doc.setFillColor(254, 243, 199);
          doc.roundedRect(margin + 207, rowY + 1.2, 24, 4.8, 1, 1, 'F');
          doc.setTextColor(146, 64, 14);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text('⚠ Regular', margin + 210, rowY + 4.6);
        } else if (estado === 'En Riesgo') {
          doc.setFillColor(255, 228, 230);
          doc.roundedRect(margin + 207, rowY + 1.2, 26, 4.8, 1, 1, 'F');
          doc.setTextColor(159, 18, 57);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text('! En Riesgo', margin + 210, rowY + 4.6);
        } else {
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(margin + 207, rowY + 1.2, 24, 4.8, 1, 1, 'F');
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.text('Sin notas', margin + 210, rowY + 4.6);
        }

        // Col 8: Observaciones
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        let obs = '';
        if (resumen?.excedeFaltas) {
          obs = `Excede límite (${resumen.faltasTotales} inasist.)`;
        } else if (resumen && resumen.totalNotas === 0) {
          obs = 'Pendiente evaluaciones';
        } else if (resumen && resumen.promedio && resumen.promedio >= 9.0) {
          obs = 'Desempeño destacado';
        } else {
          obs = 'Regular';
        }
        doc.text(obs, margin + 242, rowY + 4.8);
      } else {
        // Planilla con Firmas
        const asistPct = resumen ? `${resumen.porcentajeAsistencia}%` : '100%';
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(asistPct, margin + 148, rowY + 4.8);

        const estado = resumen ? resumen.estadoAprobacion : 'Regular';
        doc.text(estado, margin + 176, rowY + 4.8);

        // Línea punteada para firma
        doc.setDrawColor(148, 163, 184);
        doc.line(margin + 206, rowY + 5.5, margin + 244, rowY + 5.5);

        // Casillero observación
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin + 250, rowY + 1.5, 20, 4.5, 'D');
      }

      y += 7;
    });
  }

  // 5. SIGNATURE SECTION
  checkPageBreak(28);
  y += 8;

  const sigWidth = 70;
  const sig1X = margin + 35;
  const sig2X = margin + contentWidth - sigWidth - 35;

  doc.setDrawColor(148, 163, 184);
  doc.line(sig1X, y + 10, sig1X + sigWidth, y + 10);
  doc.line(sig2X, y + 10, sig2X + sigWidth, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Firma del Docente / Instructor Titular', sig1X + sigWidth / 2, y + 14, { align: 'center' });
  doc.text('Firma y Sello de la Dirección Académica', sig2X + sigWidth / 2, y + 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${docenteNombre}`, sig1X + sigWidth / 2, y + 17.5, { align: 'center' });
  doc.text('Conformidad y Registro Oficial Institucional', sig2X + sigWidth / 2, y + 17.5, { align: 'center' });

  // 6. FOOTER ON ALL PAGES
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 9, margin + contentWidth, pageHeight - 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Sistema de Gestión Escolar Integral • Nómina y Registro Oficial de Estudiantes',
      margin,
      pageHeight - 5.5
    );
    doc.text(`Página ${p} de ${totalPages}`, margin + contentWidth, pageHeight - 5.5, { align: 'right' });
  }

  // File download name
  const cursoSlug = cursoFiltro ? cursoFiltro.nombre_curso.replace(/[^a-zA-Z0-9_-]/g, '_') : 'General';
  const fechaSlug = new Date().toISOString().split('T')[0];
  doc.save(`Nomina_Estudiantes_${cursoSlug}_${fechaSlug}.pdf`);
}
