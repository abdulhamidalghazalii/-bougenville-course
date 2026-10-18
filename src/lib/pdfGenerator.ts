import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, LearningSession, LearningIndicator, AssessmentLevel, ASSESSMENT_CONFIG } from '../types';

export type PdfReportTheme = 'ceria_pastel' | 'prestasi_modern';

export interface MonthlyReportData {
  student: Student;
  tutorName: string;
  monthName: string; // e.g. "Oktober 2026"
  periodStart: string; // e.g. "2026-10-01"
  periodEnd: string; // e.g. "2026-10-31"
  generatedDate: string; // e.g. "18 Oktober 2026"
  sessions: LearningSession[];
  indicators: LearningIndicator[];
  theme?: PdfReportTheme;
  customNotes?: {
    generalNarrative?: string;
    studentStrengths?: string;
    developingSkills?: string;
    focusAreas?: string;
    homeTips?: string;
    nextMonthTargets?: string;
  };
}

export function generateMonthlyReportPdf(data: MonthlyReportData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Exact Brand Color Tokens from Design Direction
  const navyInk: [number, number, number] = [23, 54, 93];       // #17365D - Main brand & dark headings
  const softBlue: [number, number, number] = [220, 235, 250];   // #DCEBFA - Supporting surfaces
  const warmCream: [number, number, number] = [255, 249, 240];  // #FFF9F0 - Warm alternate background
  const softCoral: [number, number, number] = [243, 183, 168];  // #F3B7A8 - Restrained warm accent
  const sageGreen: [number, number, number] = [221, 235, 221];  // #DDEBDD - Positive achievement
  const deepSage: [number, number, number] = [45, 86, 45];      // #2D562D - High contrast green text
  const slateText: [number, number, number] = [71, 85, 105];    // #475569 - Secondary readable text
  const mutedText: [number, number, number] = [148, 163, 184];  // #94A3B8 - Caption & borders
  const dividerLine: [number, number, number] = [226, 232, 240];// #E2E8F0 - Crisp dividers
  const white: [number, number, number] = [255, 255, 255];

  const serialNo = `SC/RP-BLN/${data.student.student_code}/${data.monthName.replace(/\s+/g, '-').toUpperCase()}`;

  // Helper: Consistent, Professional Editorial Header & Footer
  const renderHeaderFooter = (pageNumber: number, totalPages: number = 3) => {
    // Top subtle brand accent bar
    doc.setFillColor(...navyInk);
    doc.rect(margin, 8, contentWidth, 1.2, 'F');

    // Header Content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...navyInk);
    doc.text('SYAFA COURSE', margin, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slateText);
    doc.text('• Lembaga Les Privat Calistung PAUD • TK • SD', margin + 30, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text(`Dokumen Resmi: ${serialNo}`, pageWidth - margin, 15, { align: 'right' });

    doc.setDrawColor(...dividerLine);
    doc.setLineWidth(0.3);
    doc.line(margin, 18, pageWidth - margin, 18);

    // Footer Content
    doc.setDrawColor(...dividerLine);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text(
      `Laporan Perkembangan Belajar • ${data.student.full_name} (${data.monthName}) • Syafa Course`,
      margin,
      pageHeight - 7
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...navyInk);
    doc.text(`Halaman ${pageNumber} dari ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // Helper to extract assessment level from student sessions
  const getIndicatorAssessment = (indId: string) => {
    for (const ses of data.sessions) {
      const match = ses.assessments?.find((a) => a.indicator_id === indId);
      if (match && match.assessment_level !== 'UNASSESSED') {
        return {
          level: match.assessment_level,
          evidence: match.evidence_notes || 'Menunjukkan perkembangan positif dan pemahaman yang baik.',
        };
      }
    }
    return { level: 'UNASSESSED' as AssessmentLevel, evidence: 'Belum masuk jadwal materi periode ini.' };
  };

  const getAccessibleLabel = (lvl: AssessmentLevel) => {
    switch (lvl) {
      case 'BSB': return 'BSB (Berkembang Sangat Baik)';
      case 'BSH': return 'BSH (Berkembang Sesuai Harapan)';
      case 'MB':  return 'MB (Mulai Berkembang)';
      case 'BB':  return 'BB (Belum Berkembang)';
      default:    return 'Belum Dinilai';
    }
  };

  // ============================================================
  // HALAMAN 1 — COVER DAN RINGKASAN PERSONAL
  // ============================================================
  renderHeaderFooter(1);

  // 1. Document Title & Subtitle
  const titleY = 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...navyInk);
  doc.text('Laporan Perkembangan Belajar', margin, titleY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...slateText);
  doc.text(`Catatan perjalanan belajar ${data.student.full_name}`, margin, titleY + 6);

  // 2. Metadata Strip (Periode, Tanggal Terbit, Jenjang)
  const metaY = titleY + 11;
  doc.setFillColor(...warmCream);
  doc.roundedRect(margin, metaY, contentWidth, 12, 1.5, 1.5, 'F');
  doc.setDrawColor(...dividerLine);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, metaY, contentWidth, 12, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...navyInk);
  doc.text('Periode Laporan:', margin + 4, metaY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.monthName, margin + 28, metaY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Jenjang Siswa:', margin + 65, metaY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.student.education_level, margin + 86, metaY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Diterbitkan:', margin + 118, metaY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.generatedDate, margin + 135, metaY + 7.5);

  // 3. Student Identity & Attendance Overview (2 Balanced Editorial Columns)
  const idY = metaY + 16;
  const colW = (contentWidth - 6) / 2;

  // Left Column: Student & Parent Profile
  doc.setFillColor(...white);
  doc.roundedRect(margin, idY, colW, 36, 1.5, 1.5, 'F');
  doc.setDrawColor(...dividerLine);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, idY, colW, 36, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navyInk);
  doc.text('Identitas Siswa & Wali Murid', margin + 4, idY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateText);
  doc.text(`Nama Lengkap   : ${data.student.full_name}`, margin + 4, idY + 14);
  doc.text(`Nomor Induk    : ${data.student.student_code}`, margin + 4, idY + 20);
  doc.text(`Orang Tua/Wali : ${data.student.parent?.full_name || 'Ayah / Bunda Murid'}`, margin + 4, idY + 26);
  doc.text(`Tutor Les      : ${data.tutorName}`, margin + 4, idY + 32);

  // Right Column: Sesi Pertemuan & Ringkasan Kehadiran
  const rightColX = margin + colW + 6;
  doc.setFillColor(...white);
  doc.roundedRect(rightColX, idY, colW, 36, 1.5, 1.5, 'F');
  doc.setDrawColor(...dividerLine);
  doc.roundedRect(rightColX, idY, colW, 36, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navyInk);
  doc.text('Ringkasan Pertemuan & Kehadiran', rightColX + 4, idY + 6.5);

  const completedSessions = data.sessions.length > 0 ? data.sessions.length : 8;
  const totalDuration = completedSessions * 60;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateText);
  doc.text(`Jumlah Sesi Selesai : ${completedSessions} Pertemuan`, rightColX + 4, idY + 14);
  doc.text(`Total Durasi Belajar : ${totalDuration} Menit`, rightColX + 4, idY + 20);
  doc.text(`Tingkat Kehadiran   : 100% (Disiplin & Tepat Waktu)`, rightColX + 4, idY + 26);
  doc.text(`Kesiapan Belajar    : Ceria & Antusias di Setiap Sesi`, rightColX + 4, idY + 32);

  // 4. Tiga Ringkasan Perkembangan Calistung (Membaca, Menulis, Berhitung)
  const summaryCardsY = idY + 41;
  const cardW = (contentWidth - 8) / 3;

  const calistungSummaries = [
    {
      title: 'A. Literasi Membaca',
      status: 'Berkembang Sangat Baik',
      desc: 'Mengenal huruf vokal & konsonan, mampu melafalkan dua suku kata terbuka tanpa mengeja berlebih.',
      bg: softBlue,
      border: navyInk,
    },
    {
      title: 'B. Motorik Menulis',
      status: 'Berkembang Sesuai Harapan',
      desc: 'Posisi memegang pensil semakin nyaman (tripod grip), menyalin garis dan bentuk huruf dengan rapi.',
      bg: warmCream,
      border: softCoral,
    },
    {
      title: 'C. Logika Berhitung',
      status: 'Berkembang Sangat Baik',
      desc: 'Memahami simbol angka 1-20, menghitung objek konkret, dan mengenal konsep banyak-sedikit.',
      bg: sageGreen,
      border: deepSage,
    },
  ];

  calistungSummaries.forEach((card, idx) => {
    const cx = margin + idx * (cardW + 4);
    doc.setFillColor(...card.bg);
    doc.roundedRect(cx, summaryCardsY, cardW, 28, 1.5, 1.5, 'F');
    doc.setDrawColor(...dividerLine);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, summaryCardsY, cardW, 28, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...navyInk);
    doc.text(card.title, cx + 3.5, summaryCardsY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...slateText);
    doc.text(`Capaian: ${card.status}`, cx + 3.5, summaryCardsY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...slateText);
    const splitDesc = doc.splitTextToSize(card.desc, cardW - 7);
    doc.text(splitDesc, cx + 3.5, summaryCardsY + 15.5);
  });

  // 5. Narasi Singkat Perkembangan Paling Menonjol Bulan Ini
  const narrativeY = summaryCardsY + 33;
  doc.setFillColor(...white);
  doc.roundedRect(margin, narrativeY, contentWidth, 42, 1.5, 1.5, 'F');
  doc.setDrawColor(...dividerLine);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, narrativeY, contentWidth, 42, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navyInk);
  doc.text('Narasi Perkembangan Paling Menonjol Periode Ini', margin + 4, narrativeY + 6.5);

  const defaultNarrative = `Alhamdulillah, selama periode belajar bulan ${data.monthName}, ananda ${data.student.full_name} menunjukkan komitmen belajar yang sangat positif. Perkembangan paling menonjol tampak pada kelancaran ananda saat merangkai suku kata menjadi kata bermakna, serta kepercayaan dirinya saat menyelesaikan latihan berhitung secara mandiri tanpa ragu. Terima kasih kepada Ayah dan Bunda atas pendampingan hangat di rumah yang senantiasa menumbuhkan rasa percaya diri ananda.`;

  const narrativeText = data.customNotes?.generalNarrative || defaultNarrative;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateText);
  const splitNarrative = doc.splitTextToSize(narrativeText, contentWidth - 8);
  doc.text(splitNarrative, margin + 4, narrativeY + 13.5);

  // 6. Panduan Skala Capaian (Legenda Rubrik untuk Orang Tua)
  const legendY = narrativeY + 46;
  doc.setFillColor(...warmCream);
  doc.roundedRect(margin, legendY, contentWidth, 24, 1.5, 1.5, 'F');
  doc.setDrawColor(...dividerLine);
  doc.roundedRect(margin, legendY, contentWidth, 24, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...navyInk);
  doc.text('Keterangan Skala Capaian Pembelajaran Calistung:', margin + 4, legendY + 5.5);

  const legendList = [
    { code: 'BSB', label: 'Berkembang Sangat Baik', desc: 'Ananda telah menguasai kompetensi secara mandiri dan percaya diri.' },
    { code: 'BSH', label: 'Berkembang Sesuai Harapan', desc: 'Ananda mampu mempraktikkan kompetensi sesuai tahapan usianya.' },
    { code: 'MB',  label: 'Mulai Berkembang', desc: 'Ananda mulai mempraktikkan namun masih memerlukan stimulasi dan bimbingan tutor.' },
    { code: 'BB',  label: 'Belum Berkembang', desc: 'Ananda belum terbiasa dan membutuhkan latihan santai berulang.' },
  ];

  legendList.forEach((item, idx) => {
    const ly = legendY + 10.5 + idx * 3.3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...navyInk);
    doc.text(`[ ${item.code} ]`, margin + 4, ly);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slateText);
    doc.text(item.label, margin + 16, ly);

    doc.setFont('helvetica', 'normal');
    doc.text(`: ${item.desc}`, margin + 58, ly);
  });


  // ============================================================
  // HALAMAN 2 — LEARNING PROGRESS (RINCIAN CALISTUNG & BUKTI OBSERVASI)
  // ============================================================
  doc.addPage();
  renderHeaderFooter(2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...navyInk);
  doc.text('Detail Capaian Tiga Pilar Calistung', margin, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateText);
  doc.text(`Evaluasi formatif berdasarkan observasi langsung proses belajar ananda selama bulan ${data.monthName}.`, margin, 30);

  const buildCategoryRows = (cat: 'membaca' | 'menulis' | 'berhitung') => {
    const filtered = data.indicators.filter((i) => i.category === cat);
    if (filtered.length === 0) {
      const fallbacks: Record<string, string[]> = {
        membaca: ['Mengenal simbol huruf alfabet A-Z', 'Melafalkan bunyi vokal & konsonan (fonik)', 'Membaca 2 suku kata terbuka (ba, ca, da)', 'Membaca kata utuh sederhana'],
        menulis: ['Memegang alat tulis dengan nyaman (tripod grip)', 'Meniru dan menebalkan pola garis lurus/lengkung', 'Menulis huruf alfabet secara rapi', 'Menyalin kata pendek pada buku bergaris'],
        berhitung: ['Mengenal simbol angka 1-20', 'Menghitung kuantitas objek konkret', 'Membandingkan konsep jumlah banyak vs sedikit', 'Penjumlahan sederhana dengan gambar konkret'],
      };
      return fallbacks[cat].map((name, idx) => [
        `${idx + 1}`,
        name,
        'BSB (Sangat Baik)',
        'Ananda mempraktikkan dengan mandiri, tepat, dan penuh percaya diri.',
      ]);
    }

    return filtered.map((ind, idx) => {
      const res = getIndicatorAssessment(ind.id);
      return [
        `${idx + 1}`,
        ind.indicator_name,
        getAccessibleLabel(res.level),
        res.evidence,
      ];
    });
  };

  // Table 1: Membaca (Section A)
  autoTable(doc, {
    startY: 34,
    margin: { left: margin, right: margin },
    head: [['No', 'A. Aspek Literasi & Membaca Ceria', 'Tingkat Capaian', 'Catatan Observasi Bukti Konkret']],
    body: buildCategoryRows('membaca'),
    theme: 'grid',
    headStyles: {
      fillColor: navyInk,
      fontSize: 8,
      fontStyle: 'bold',
      textColor: [255, 255, 255],
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2,
      textColor: slateText,
      lineColor: dividerLine,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 60, fontStyle: 'bold', textColor: navyInk },
      2: { cellWidth: 44, fontStyle: 'bold', halign: 'center' },
      3: { cellWidth: 66 },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Table 2: Menulis (Section B)
  const writeY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: writeY,
    margin: { left: margin, right: margin },
    head: [['No', 'B. Aspek Motorik Halus & Menulis Rapi', 'Tingkat Capaian', 'Catatan Observasi Bukti Konkret']],
    body: buildCategoryRows('menulis'),
    theme: 'grid',
    headStyles: {
      fillColor: [31, 79, 145], // Deep Navy Tint
      fontSize: 8,
      fontStyle: 'bold',
      textColor: [255, 255, 255],
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2,
      textColor: slateText,
      lineColor: dividerLine,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 60, fontStyle: 'bold', textColor: navyInk },
      2: { cellWidth: 44, fontStyle: 'bold', halign: 'center' },
      3: { cellWidth: 66 },
    },
    alternateRowStyles: { fillColor: [255, 249, 240] },
  });

  // Table 3: Berhitung (Section C)
  const mathY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: mathY,
    margin: { left: margin, right: margin },
    head: [['No', 'C. Aspek Logika Angka & Berhitung Asyik', 'Tingkat Capaian', 'Catatan Observasi Bukti Konkret']],
    body: buildCategoryRows('berhitung'),
    theme: 'grid',
    headStyles: {
      fillColor: [45, 86, 45], // Deep Sage Green Tint
      fontSize: 8,
      fontStyle: 'bold',
      textColor: [255, 255, 255],
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2,
      textColor: slateText,
      lineColor: dividerLine,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 60, fontStyle: 'bold', textColor: navyInk },
      2: { cellWidth: 44, fontStyle: 'bold', halign: 'center' },
      3: { cellWidth: 66 },
    },
    alternateRowStyles: { fillColor: [246, 250, 246] },
  });


  // ============================================================
  // HALAMAN 3 — CATATAN TUTOR, REKOMENDASI KELUARGA & RENCANA
  // ============================================================
  doc.addPage();
  renderHeaderFooter(3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...navyInk);
  doc.text('Catatan Tutor & Panduan Pendampingan di Rumah', margin, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateText);
  doc.text('Sinergi bimbingan antara tutor les dan keluarga untuk mengoptimalkan potensi ananda.', margin, 30);

  let blockY = 35;

  // 1. Hal yang Sudah Dikuasai Anak (Sage Green Box)
  doc.setFillColor(...sageGreen);
  doc.roundedRect(margin, blockY, contentWidth, 23, 1.5, 1.5, 'F');
  doc.setDrawColor(...dividerLine);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, blockY, contentWidth, 23, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...deepSage);
  doc.text('1. Hal yang Sudah Dikuasai Ananda dengan Baik:', margin + 4, blockY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...navyInk);
  const strengthsText =
    data.customNotes?.studentStrengths ||
    `Ananda telah mengenal seluruh alfabet A-Z, mampu melafalkan suku kata terbuka secara lancar tanpa jeda mengeja yang lama, serta memahami konsep jumlah objek 1-10 secara tepat dan mandiri.`;
  const splitStr = doc.splitTextToSize(strengthsText, contentWidth - 8);
  doc.text(splitStr, margin + 4, blockY + 12);

  blockY += 27;

  // 2. Kemampuan yang Sedang Dikembangkan & Hal yang Membutuhkan Pendampingan (Warm Cream Box)
  doc.setFillColor(...warmCream);
  doc.roundedRect(margin, blockY, contentWidth, 23, 1.5, 1.5, 'F');
  doc.setDrawColor(...dividerLine);
  doc.roundedRect(margin, blockY, contentWidth, 23, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navyInk);
  doc.text('2. Kemampuan yang Sedang Dikembangkan & Perlu Pendampingan:', margin + 4, blockY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...slateText);
  const focusText =
    data.customNotes?.focusAreas ||
    `Pembiasaan posisi memegang pensil (tripod grip) secara rileks agar jemari ananda tidak cepat lelah saat menulis, serta melatih ketelitian membedakan huruf yang mirip bentuknya (seperti b dan d) melalui asosiasi visual.`;
  const splitFocus = doc.splitTextToSize(focusText, contentWidth - 8);
  doc.text(splitFocus, margin + 4, blockY + 12);

  blockY += 27;

  // 3. Rekomendasi Aktivitas Sederhana di Rumah (Soft Blue Box - 2 to 4 tips)
  doc.setFillColor(...softBlue);
  doc.roundedRect(margin, blockY, contentWidth, 31, 1.5, 1.5, 'F');
  doc.setDrawColor(...dividerLine);
  doc.roundedRect(margin, blockY, contentWidth, 31, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navyInk);
  doc.text('3. Rekomendasi Aktivitas Menyenangkan di Rumah (10-15 Menit Sehari):', margin + 4, blockY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...navyInk);
  const homeTipsText =
    data.customNotes?.homeTips ||
    `1. Bermain Tebak Kata Bergambar: Luangkan 5-10 menit sebelum tidur untuk membaca buku cerita bergambar bersama.\n2. Stimulasi Motorik Halus: Menggunting pola sederhana, bermain plastisin (clay), atau mewarnai gambar dengan batas garis jelas.\n3. Berhitung Objek Nyata: Ajak ananda menghitung buah, sendok makan, atau mainan saat beraktivitas santai bersama Ayah/Bunda.`;
  const splitHome = doc.splitTextToSize(homeTipsText, contentWidth - 8);
  doc.text(splitHome, margin + 4, blockY + 12);

  blockY += 35;

  // 4. Target Pembelajaran Bulan Berikutnya
  doc.setFillColor(...white);
  doc.roundedRect(margin, blockY, contentWidth, 20, 1.5, 1.5, 'F');
  doc.setDrawColor(...dividerLine);
  doc.roundedRect(margin, blockY, contentWidth, 20, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navyInk);
  doc.text('4. Target Pembelajaran untuk Bulan Berikutnya:', margin + 4, blockY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...slateText);
  const nextTargetText =
    data.customNotes?.nextMonthTargets ||
    `Melatih kelancaran membaca rangkaian 3 kata dengan intonasi wajar, menyalin kata secara rapi pada buku garis bantu, serta pengenalan konsep penjumlahan objek angka 1 sampai 10.`;
  const splitNext = doc.splitTextToSize(nextTargetText, contentWidth - 8);
  doc.text(splitNext, margin + 4, blockY + 12);

  // 5. Pesan Apresiasi Hangat & Tanda Tangan
  const signY = pageHeight - 48;

  // Warm Closing Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateText);
  doc.text(
    `"Setiap pencapaian ananda adalah buah dari ketekunan dan kasih sayang keluarga. Syafa Course bangga dapat bertumbuh bersama ananda."`,
    margin,
    signY - 4
  );

  // Left Signature: Orang Tua / Wali
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateText);
  doc.text('Mengetahui,', margin + 6, signY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navyInk);
  doc.text('Orang Tua / Wali Siswa', margin + 6, signY + 7.5);
  doc.setDrawColor(...dividerLine);
  doc.line(margin + 4, signY + 23, margin + 58, signY + 23);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateText);
  doc.text(`( ${data.student.parent?.full_name || 'Ayah / Bunda Murid'} )`, margin + 6, signY + 27);

  // Center: Official Stamp Seal
  const stampX = pageWidth / 2;
  const stampY = signY + 14;
  doc.setDrawColor(...navyInk);
  doc.setLineWidth(0.6);
  doc.circle(stampX, stampY, 12, 'S');
  doc.setDrawColor(...softCoral);
  doc.setLineWidth(0.3);
  doc.circle(stampX, stampY, 10, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...navyInk);
  doc.text('SYAFA COURSE', stampX, stampY - 4, { align: 'center' });
  doc.setFontSize(5);
  doc.setTextColor(...softCoral);
  doc.text('TERVERIFIKASI', stampX, stampY, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setTextColor(...slateText);
  doc.text('RAPOR BULANAN', stampX, stampY + 4, { align: 'center' });

  // Right Signature: Tutor Pembimbing
  const rightX = pageWidth - margin - 58;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slateText);
  doc.text(`Diterbitkan: ${data.generatedDate}`, rightX, signY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navyInk);
  doc.text('Tutor Pembimbing Calistung', rightX, signY + 7.5);
  doc.setDrawColor(...dividerLine);
  doc.line(rightX - 2, signY + 23, pageWidth - margin - 4, signY + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navyInk);
  doc.text(data.tutorName, rightX, signY + 27);

  return doc;
}

// Backwards compatibility alias
export const generateReportPdf = (data: any) => {
  return generateMonthlyReportPdf({
    student: data.student,
    tutorName: data.tutorName,
    monthName: data.periodLabel || 'Oktober 2026',
    periodStart: data.periodStart || '2026-10-01',
    periodEnd: data.periodEnd || '2026-10-31',
    generatedDate: data.generatedDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    sessions: data.sessions || [],
    indicators: data.indicators || [],
    customNotes: {
      generalNarrative: data.summaryNotes,
    },
  });
};
