import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportFilters {
  conferencia: string;
  checkin: string;
  busqueda: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  exportParticipantsReport(
    rows: (string | number)[][],
    filters: ReportFilters
  ): void {

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // =========================================================
    // TÍTULO
    // =========================================================

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);

    doc.text(
      'PARTICIPANTES REGISTRADOS',
      14,
      16
    );

    // =========================================================
    // FILTROS
    // =========================================================

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);

    doc.text('Filtros aplicados:', 14, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);

    const conferencia =
      filters.conferencia?.trim() || 'Todas las conferencias';

    const checkin =
      filters.checkin?.trim() || 'Todos los check-in';

    const busqueda =
      filters.busqueda?.trim() || 'Sin búsqueda';

    doc.text(
      `Conferencia: ${conferencia}`,
      14,
      31
    );

    doc.text(
      `Check-in: ${checkin}`,
      14,
      37
    );

    doc.text(
      `Búsqueda: ${busqueda}`,
      14,
      43
    );

    // =========================================================
    // INFORMACIÓN DEL REPORTE
    // =========================================================

    const fechaGeneracion = new Date().toLocaleString(
      'es-ES',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(33, 37, 41);

    doc.text(
      `Total encontrados: ${rows.length}`,
      14,
      51
    );

    doc.text(
      `Generado: ${fechaGeneracion}`,
      pageWidth - 14,
      51,
      {
        align: 'right'
      }
    );

    // =========================================================
    // LÍNEA SEPARADORA
    // =========================================================

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);

    doc.line(
      14,
      56,
      pageWidth - 14,
      56
    );

    // =========================================================
    // TABLA
    // =========================================================

    const headers = [
      'ID',
      'Nombre',
      'Teléfono',
      'Conferencia',
      'Estado',
      'Check-in',
      'Registro'
    ];

    autoTable(doc, {

      head: [headers],

      body: rows,

      startY: 61,

      theme: 'striped',

      margin: {
        top: 61,
        right: 14,
        bottom: 18,
        left: 14
      },

      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [50, 50, 50],
        lineColor: [225, 225, 225],
        lineWidth: 0.2,
        valign: 'middle'
      },

      headStyles: {
        fillColor: [239, 201, 112],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },

      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },

      columnStyles: {
        0: {
          cellWidth: 15,
          halign: 'center'
        },

        1: {
          cellWidth: 48
        },

        2: {
          cellWidth: 32
        },

        3: {
          cellWidth: 58
        },

        4: {
          cellWidth: 30
        },

        5: {
          cellWidth: 30,
          halign: 'center'
        },

        6: {
          cellWidth: 28,
          halign: 'center'
        }
      }
    });

    // =========================================================
    // FOOTER
    // =========================================================

    const totalPages = doc.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {

      doc.setPage(page);

      const pageHeight =
        doc.internal.pageSize.getHeight();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);

      doc.text(
        'Reporte de participantes',
        14,
        pageHeight - 8
      );

      doc.text(
        `Página ${page} de ${totalPages}`,
        pageWidth - 14,
        pageHeight - 8,
        {
          align: 'right'
        }
      );
    }

    // =========================================================
    // DESCARGA
    // =========================================================

    doc.save('participantes-registrados.pdf');
  }
}
