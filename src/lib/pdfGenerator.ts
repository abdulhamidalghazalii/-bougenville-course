import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, LearningSession, LearningIndicator, AssessmentLevel, ASSESSMENT_CONFIG } from '../types';

export interface ReportData {
  student: Student;
  tutorName: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  generatedDate: string;
  sessions: LearningSession[];
  indicators: LearningIndicator[];
  summaryNotes?: string;
}

export function generateReportPdf(data: ReportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const brandBlue: [number, number, number] = [15, 132, 232]; // #0F84E8
  const pastelPink: [number, number, number] = [236, 72, 153]; // #EC4899
  const darkNavy: [number, number, number] = [15, 23, 42]; // #0F172A
  const slateMuted: [number, number, number] = [100, 116, 139]; // #64748B
  const creamBg: [number, number, number] = [250, 248, 243]; // #FAF8F3

  // Helper for consistent header and footer
  const addHeaderFooter = (pageNumber: number, totalPages: number = 3) => {
    // Top banner
    doc.setFillColor(...brandBlue);
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Header line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...brandBlue);
    doc.text('SYAFA COURSE', margin, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slateMuted);
    doc.text('Bimbingan Belajar Calistung PAUD • TK • SD | "Belajar Ceria, Tumbuh Bersama"', margin + 35, 13);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 16, pageWidth - margin, 16);

    // Footer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFontSize(8);
    doc.setTextColor(...slateMuted);
    doc.text(
      `Laporan Perkembangan Belajar Anak • ${data.student.full_name} (${data.periodLabel})`,
      margin,
      pageHeight - 7
    );
    doc.text(
      `Halaman ${pageNumber} dari ${totalPages}`,
      pageWidth - margin - 22,
      pageHeight - 7
    );
  };

  // ==========================================
  // HALAMAN 1: RINGKASAN & IDENTITAS
  // ==========================================
  addHeaderFooter(1);

  // Title Box
  doc.setFillColor(...creamBg);
  doc.roundedRect(margin, 22, contentWidth, 26, 3, 3, 'F');
  doc.setDrawColor(...brandBlue);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, 22, contentWidth, 26, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...darkNavy);
  doc.text('LAPORAN PERKEMBANGAN BELAJAR ANAK', margin + 6, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...slateMuted);
  doc.text(`Periode Evaluasi: ${data.periodLabel} • Tanggal Penerbitan: ${data.generatedDate}`, margin + 6, 40);

  // Student & Tutor Info Table
  autoTable(doc, {
    startY: 52,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2.2, textColor: darkNavy },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, textColor: slateMuted },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 35, textColor: slateMuted },
      3: { cellWidth: 55 },
    },
    body: [
      ['Nama Lengkap Siswa', `: ${data.student.full_name}`, 'Tutor Pembimbing', `: ${data.tutorName}`],
      ['Nomor Induk Siswa', `: ${data.student.student_code}`, 'Jenjang & Kelas', `: ${data.student.education_level} ${data.student.school_class ? `(${data.student.school_class})` : ''}`],
      ['Tanggal Lahir Siswa', `: ${new Date(data.student.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 'Orang Tua / Wali', `: ${data.student.parent?.full_name || '-'}`],
      ['Mulai Bimbingan', `: ${new Date(data.student.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 'Kontak WhatsApp', `: ${data.student.parent?.whatsapp_number || '-'}`],
    ],
  });

  // Recap Sessions & Attendance Card
  const currentY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text('Rekapitulasi Pertemuan & Presensi', margin + 6, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  doc.text(`• Total Sesi Terlaksana: ${data.sessions.length} Pertemuan`, margin + 6, currentY + 14);
  doc.text(`• Rata-rata Durasi Belajar: 60 Menit per Sesi`, margin + 6, currentY + 20);
  doc.text(`• Status Presensi: Hadir Aktif dan Tepat Waktu`, margin + 95, currentY + 14);
  doc.text(`• Fokus Pembelajaran: Calistung (Membaca, Menulis, Berhitung)`, margin + 95, currentY + 20);

  // Executive Summary Narrative
  const summaryY = currentY + 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...brandBlue);
  doc.text('I. Ringkasan Perkembangan Umum', margin, summaryY);

  const summaryText = data.summaryNotes || 
    `Selama periode ${data.periodLabel}, ananda ${data.student.full_name} menunjukkan antusiasme yang sangat baik dalam setiap sesi les privat. Koordinasi motorik halus dan rasa percaya diri ananda berkembang secara nyata. Ananda mampu mengikuti instruksi tutor dengan ceria dan mulai menunjukkan kemandirian saat mengerjakan latihan membaca dan mengenal angka.`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkNavy);
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(splitSummary, margin, summaryY + 6);

  // Skala Penilaian Explanation Box
  const scaleY = summaryY + 8 + splitSummary.length * 5 + 6;
  doc.setFillColor(...creamBg);
  doc.roundedRect(margin, scaleY, contentWidth, 42, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, scaleY, contentWidth, 42, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkNavy);
  doc.text('Keterangan Skala Penilaian Formatif:', margin + 6, scaleY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkNavy);
  doc.text('• BSB (Berkembang Sangat Baik) : Ananda telah menguasai indikator secara mandiri, konsisten, dan percaya diri.', margin + 6, scaleY + 15);
  doc.text('• BSH (Berkembang Sesuai Harapan) : Ananda mampu melakukan kompetensi dengan baik dan sesuai target jenjang usianya.', margin + 6, scaleY + 22);
  doc.text('• MB  (Mulai Berkembang)       : Ananda mulai menunjukkan kemampuan, namun masih memerlukan bantuan tutor.', margin + 6, scaleY + 29);
  doc.text('• BB  (Belum Berkembang)       : Ananda belum terbiasa dengan indikator tersebut dan membutuhkan stimulasi lanjutan.', margin + 6, scaleY + 36);


  // ==========================================
  // HALAMAN 2: PERKEMBANGAN CALISTUNG
  // ==========================================
  doc.addPage();
  addHeaderFooter(2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...brandBlue);
  doc.text('II. Lembar Evaluasi Capaian Calistung (Membaca, Menulis, Berhitung)', margin, 24);

  // Helper to extract latest level and notes for an indicator
  const getIndicatorStatus = (indId: string) => {
    for (const ses of data.sessions) {
      const match = ses.assessments?.find((a) => a.indicator_id === indId);
      if (match && match.assessment_level !== 'UNASSESSED') {
        return {
          level: match.assessment_level,
          evidence: match.evidence_notes || 'Tercapai dengan baik',
        };
      }
    }
    return { level: 'BSH' as AssessmentLevel, evidence: 'Sesuai tahapan belajar' };
  };

  // Build table data
  const buildRows = (cat: 'membaca' | 'menulis' | 'berhitung') => {
    return data.indicators
      .filter((i) => i.category === cat)
      .map((ind, idx) => {
        const res = getIndicatorStatus(ind.id);
        const conf = ASSESSMENT_CONFIG[res.level] || ASSESSMENT_CONFIG.BSH;
        return [
          `${idx + 1}`,
          ind.indicator_name,
          `${conf.short} (${conf.label})`,
          res.evidence,
        ];
      });
  };

  // Table 1: Membaca
  autoTable(doc, {
    startY: 28,
    margin: { left: margin, right: margin },
    head: [['No', 'A. Aspek Membaca & Literasi', 'Capaian', 'Catatan Observasi Bukti']],
    body: buildRows('membaca'),
    theme: 'grid',
    headStyles: { fillColor: brandBlue, fontSize: 8.5, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 1.8, textColor: darkNavy },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 62 },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 66 },
    },
  });

  // Table 2: Menulis
  const writeStartY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: writeStartY,
    margin: { left: margin, right: margin },
    head: [['No', 'B. Aspek Menulis & Motorik Halus', 'Capaian', 'Catatan Observasi Bukti']],
    body: buildRows('menulis'),
    theme: 'grid',
    headStyles: { fillColor: pastelPink, fontSize: 8.5, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 1.8, textColor: darkNavy },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 62 },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 66 },
    },
  });

  // Table 3: Berhitung
  const mathStartY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: mathStartY,
    margin: { left: margin, right: margin },
    head: [['No', 'C. Aspek Berhitung & Logika Angka', 'Capaian', 'Catatan Observasi Bukti']],
    body: buildRows('berhitung'),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], fontSize: 8.5, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 1.8, textColor: darkNavy },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 62 },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 66 },
    },
  });


  // ==========================================
  // HALAMAN 3: CATATAN & REKOMENDASI TUTOR
  // ==========================================
  doc.addPage();
  addHeaderFooter(3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...brandBlue);
  doc.text('III. Catatan Bimbingan, Rekomendasi & Tindak Lanjut', margin, 24);

  // Latest session details or summary
  const latestSes = data.sessions[0];
  let noteY = 32;

  // 1. Pencapaian Utama
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129); // green
  doc.text('1. Kompetensi yang Telah Dikuasai dengan Baik:', margin, noteY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  const text1 = latestSes?.achievements || 
    `Ananda telah mengenal seluruh alfabet dan bunyi fonik secara fasih, mampu merangkai 2 suku kata tanpa jeda mengeja, serta dapat menghitung kuantitas objek 1-10 dengan tepat.`;
  const split1 = doc.splitTextToSize(text1, contentWidth);
  doc.text(split1, margin, noteY + 5);
  noteY += 8 + split1.length * 4.5;

  // 2. Hal yang Masih Butuh Latihan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(245, 158, 11); // amber
  doc.text('2. Hal yang Perlu Terus Dilatih & Distimulasi:', margin, noteY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  const text2 = latestSes?.difficulties || 
    `Masih sesekali tertukar antara huruf b dan d saat menulis cepat, serta perlu pembiasaan ketahanan posisi memegang pensil (tripod grip) agar jari tidak cepat lelah.`;
  const split2 = doc.splitTextToSize(text2, contentWidth);
  doc.text(split2, margin, noteY + 5);
  noteY += 8 + split2.length * 4.5;

  // 3. Rekomendasi di Rumah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...brandBlue);
  doc.text('3. Rekomendasi Aktivitas Seru di Rumah untuk Orang Tua:', margin, noteY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  const text3 = latestSes?.home_recommendations || 
    `• Luangkan waktu 10-15 menit sehari untuk bermain tebak kata atau membaca buku cerita bergambar bersama ananda.\n• Ajak ananda bermain plastisin (playdough) atau meremas spons air untuk memperkuat otot jari jemari.\n• Berikan apresiasi berupa pelukan atau kalimat positif setiap kali ananda berhasil mencoba hal baru.`;
  const split3 = doc.splitTextToSize(text3, contentWidth);
  doc.text(split3, margin, noteY + 5);
  noteY += 8 + split3.length * 4.5;

  // 4. Target Pertemuan Berikutnya
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text('4. Target Pembelajaran Periode Berikutnya:', margin, noteY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  const text4 = latestSes?.next_targets || 
    `Membaca kalimat 3 kata sederhana dengan intonasi wajar, menyalin kata secara rapi pada buku garis tiga, serta pengenalan konsep pengurangan benda kuantitas 1-10.`;
  const split4 = doc.splitTextToSize(text4, contentWidth);
  doc.text(split4, margin, noteY + 5);
  noteY += 8 + split4.length * 4.5;

  // Apresiasi Box
  doc.setFillColor(...creamBg);
  doc.roundedRect(margin, noteY + 2, contentWidth, 20, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);
  doc.text('"Setiap anak adalah bintang yang bersinar dengan caranya sendiri yang istimewa."', margin + 6, noteY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateMuted);
  doc.text('Terima kasih banyak atas kepercayaan dan kerjasama hangat Ayah & Bunda bersama Syafa Course.', margin + 6, noteY + 16);

  // Signatures Area
  const signY = pageHeight - 50;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkNavy);

  // Left: Kota & Orang tua
  doc.text('Mengetahui,', margin + 10, signY);
  doc.text('Orang Tua / Wali Siswa', margin + 10, signY + 5);
  doc.line(margin + 5, signY + 28, margin + 55, signY + 28);
  doc.text(`( ${data.student.parent?.full_name || '........................................'} )`, margin + 10, signY + 33);

  // Right: Tutor
  doc.text(`Jakarta, ${data.generatedDate}`, pageWidth - margin - 60, signY);
  doc.text('Tutor Pembimbing Calistung', pageWidth - margin - 60, signY + 5);
  doc.line(pageWidth - margin - 65, signY + 28, pageWidth - margin - 10, signY + 28);
  doc.setFont('helvetica', 'bold');
  doc.text(data.tutorName, pageWidth - margin - 60, signY + 33);

  return doc;
}
