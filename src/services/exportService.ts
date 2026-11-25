import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Project, Task, DivisionWeight } from '../types';
import { StorageService } from './storage';
import { ProgressEngine } from './progressEngine';

// Formatting utilities
export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTimeIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export const ExportService = {
  /**
   * PRD 7.10: Export progres proyek ke PDF
   */
  exportProjectToPDF(projectId: string) {
    const project = StorageService.getProject(projectId);
    if (!project) return;

    const overallProgress = ProgressEngine.calculateProjectProgress(projectId);
    const weights = StorageService.getProjectWeights(projectId);
    const tasks = StorageService.getProjectTasks(projectId);
    const users = StorageService.getUsers();

    const doc = new jsPDF();

    // Header ProTrack
    doc.setFillColor(27, 54, 93); // #1b365d Brand Navy
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PROTRACK - LAPORAN PROGRES PROYEK', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak: ${formatDateTimeIndo(new Date().toISOString())}`, 14, 25);

    // Project Info Box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(project.nama, 14, 42);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Klien: ${project.klien}`, 14, 50);
    doc.text(`Lokasi: ${project.lokasi}`, 14, 56);
    doc.text(`Periode: ${formatDateIndo(project.tanggal_mulai)} s/d ${formatDateIndo(project.deadline)}`, 14, 62);
    doc.text(`Status: ${project.status}`, 14, 68);

    // Big Progress Card
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(140, 36, 56, 34, 3, 3, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.text('TOTAL PROGRES', 146, 46);

    doc.setTextColor(27, 54, 93);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`${overallProgress}%`, 146, 62);

    // Division Breakdown Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('1. Ringkasan Progres per Divisi', 14, 80);

    const divRows = weights.map((w) => {
      const p = ProgressEngine.calculateDivisionProgress(projectId, w.divisi);
      const divTasks = tasks.filter((t) => t.divisi === w.divisi);
      const finished = divTasks.filter((t) => t.status === 'Selesai').length;
      return [w.divisi, `${w.bobot}%`, `${p}%`, `${finished} / ${divTasks.length} Task`];
    });

    (doc as any).autoTable({
      startY: 84,
      head: [['Divisi', 'Bobot Divisi', 'Progres Realisasi', 'Status Pekerjaan']],
      body: divRows,
      theme: 'grid',
      headStyles: { fillColor: [27, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });

    // Task Details Table
    const lastY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Rincian Pekerjaan & Task PIC', 14, lastY);

    const taskRows = tasks.map((t, idx) => {
      const pic = users.find((u) => u.id === t.pic_id);
      const ind = ProgressEngine.getTaskIndicator(t);
      return [
        (idx + 1).toString(),
        t.judul,
        t.divisi,
        pic?.nama || '-',
        `${t.bobot}%`,
        formatDateIndo(t.deadline),
        t.status,
        `${t.progres}%`,
        ind.label,
      ];
    });

    (doc as any).autoTable({
      startY: lastY + 4,
      head: [['No', 'Uraian Task', 'Divisi', 'PIC', 'Bobot', 'Deadline', 'Status', 'Progres', 'Kondisi']],
      body: taskRows,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 46 },
        2: { cellWidth: 18 },
        3: { cellWidth: 26 },
        4: { cellWidth: 14 },
        5: { cellWidth: 20 },
        6: { cellWidth: 18 },
        7: { cellWidth: 16 },
        8: { cellWidth: 24 },
      },
    });

    // Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `ProTrack System - Halaman ${i} dari ${totalPages}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`Laporan_Progres_${project.nama.replace(/\s+/g, '_')}.pdf`);
  },

  /**
   * PRD 7.10: Export progres proyek ke Excel / CSV
   */
  exportProjectToExcel(projectId: string) {
    const project = StorageService.getProject(projectId);
    if (!project) return;

    const overallProgress = ProgressEngine.calculateProjectProgress(projectId);
    const weights = StorageService.getProjectWeights(projectId);
    const tasks = StorageService.getProjectTasks(projectId);
    const users = StorageService.getUsers();

    // Sheet 1: Informasi Proyek & Divisi
    const infoData = [
      ['PROTRACK - LAPORAN PROGRES PROYEK'],
      ['Tanggal Ekspor', new Date().toLocaleString('id-ID')],
      [],
      ['Nama Proyek', project.nama],
      ['Klien', project.klien],
      ['Lokasi', project.lokasi],
      ['Tanggal Mulai', project.tanggal_mulai],
      ['Target Deadline', project.deadline],
      ['Status Proyek', project.status],
      ['Total Progres Tertimbang', `${overallProgress}%`],
      [],
      ['RINGKASAN BOBOT & PROGRES DIVISI'],
      ['Divisi', 'Bobot (%)', 'Realisasi Progres (%)', 'Kontribusi Progres'],
      ...weights.map((w) => {
        const prog = ProgressEngine.calculateDivisionProgress(projectId, w.divisi);
        const kontribusi = Math.round(((prog * w.bobot) / 100) * 10) / 10;
        return [w.divisi, w.bobot, prog, kontribusi];
      }),
    ];

    // Sheet 2: Daftar Task Lengkap
    const taskHeaders = [
      'No',
      'Divisi',
      'Judul Task',
      'Nama PIC',
      'Email PIC',
      'Bobot Task (%)',
      'Tanggal Mulai',
      'Deadline',
      'Status',
      'Progres (%)',
      'Indikator Jadwal',
      'Catatan Terakhir',
      'Link Dokumen',
    ];

    const taskData = tasks.map((t, idx) => {
      const pic = users.find((u) => u.id === t.pic_id);
      const ind = ProgressEngine.getTaskIndicator(t);
      return [
        idx + 1,
        t.divisi,
        t.judul,
        pic?.nama || '-',
        pic?.email || '-',
        t.bobot,
        t.tanggal_mulai,
        t.deadline,
        t.status,
        t.progres,
        ind.label,
        t.catatan || '-',
        t.doc_link || '-',
      ];
    });

    const wb = XLSX.utils.book_new();

    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    const wsTasks = XLSX.utils.aoa_to_sheet([taskHeaders, ...taskData]);

    XLSX.utils.book_append_sheet(wb, wsInfo, 'Ringkasan Proyek');
    XLSX.utils.book_append_sheet(wb, wsTasks, 'Daftar Task');

    XLSX.writeFile(wb, `Progres_${project.nama.replace(/\s+/g, '_')}.xlsx`);
  },
};
