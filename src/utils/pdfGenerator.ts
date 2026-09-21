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
