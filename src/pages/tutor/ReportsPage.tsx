import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../lib/store';
import { generateMonthlyReportPdf, PdfReportTheme } from '../../lib/pdfGenerator';
import { LearningReport, Student, LearningSession } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Eye,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  Award,
  BookOpen,
  PenTool,
  Hash,
  Heart,
  Smile,
  ChevronRight,
  RefreshCw,
  Edit3,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useAppStore();
  const currentTutor = store.currentUser;
  const myStudents = store.getTutorStudents();
  const reports = store.getTutorReports();
  const indicators = store.indicators;

  // Selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(myStudents[0]?.id || '');
  
  // Monthly selection state (Sebulan sekali)
  const now = new Date();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(now.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [pdfTheme, setPdfTheme] = useState<PdfReportTheme>('ceria_pastel');

  // Preview active page (1, 2, or 3)
  const [previewPage, setPreviewPage] = useState<1 | 2 | 3>(1);

  // Editable report notes state
  const [generalNarrative, setGeneralNarrative] = useState<string>('');
  const [studentStrengths, setStudentStrengths] = useState<string>('');
  const [focusAreas, setFocusAreas] = useState<string>('');
  const [homeTips, setHomeTips] = useState<string>('');
  const [nextTargets, setNextTargets] = useState<string>('');

  // Modals state
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<LearningReport | null>(reports[0] || null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedStudent = myStudents.find((s) => s.id === selectedStudentId) || myStudents[0];
  const monthName = `${MONTH_NAMES[selectedMonthIndex]} ${selectedYear}`;

  // Calculate start & end date of the selected month
  const periodDates = useMemo(() => {
    const startDate = new Date(selectedYear, selectedMonthIndex, 1);
    const endDate = new Date(selectedYear, selectedMonthIndex + 1, 0); // last day of month
    const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`;
    const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    return { startStr, endStr, startDate, endDate };
  }, [selectedMonthIndex, selectedYear]);

  // Filter student sessions for this specific month
  const studentMonthSessions = useMemo(() => {
    if (!selectedStudent) return [];
    return store.getStudentSessions(selectedStudent.id).filter((s) => {
      if (s.status !== 'finalized') return false;
      const sDate = new Date(s.session_date);
      return (
        sDate.getFullYear() === selectedYear &&
        sDate.getMonth() === selectedMonthIndex
      );
    });
  }, [store, selectedStudent, selectedMonthIndex, selectedYear]);

  // Reset or fill smart narrative defaults when student or month changes
  const applySmartDefaults = () => {
    if (!selectedStudent) return;
    setGeneralNarrative(
      `Alhamdulillah, selama periode belajar bulan ${monthName}, ananda ${selectedStudent.full_name} mengikuti seluruh sesi les privat calistung dengan sangat ceria, penuh antusiasme, dan menunjukkan kemajuan belajar yang membanggakan. Ananda semakin mandiri dalam memegang alat tulis dengan posisi nyaman, melafalkan bunyi suku kata secara jelas dan percaya diri, serta aktif memahami konsep angka dan logika benda konkret. Kerjasama hangat Ayah dan Bunda dalam mendampingi kegiatan bermain edukatif di rumah memberikan dampak positif yang luar biasa bagi rasa percaya diri ananda.`
    );
    setStudentStrengths(
      `Ananda menunjukkan daya fokus yang semakin baik, selalu ceria dan penasaran saat dikenalkan materi baru, serta tidak ragu untuk mencoba mengeja dan menulis sendiri secara mandiri. Daya juang dan keaktifan ananda di setiap pertemuan les patut diacungi jempol!`
    );
    setFocusAreas(
      `Pembiasaan memegang pensil secara rileks agar jemari ananda tidak cepat lelah saat menulis, serta membedakan huruf yang bentuknya mirip (seperti 'b' dan 'd', atau angka '6' dan '9') melalui permainan asosiasi visual yang menyenangkan.`
    );
    setHomeTips(
      `1. Bermain "Tebak Kata Bergambar" sebelum tidur selama 5-10 menit untuk melatih kelancaran pelafalan kata.\n2. Stimulasi Motorik Halus: Menggunting pola sederhana, bermain plastisin (clay), atau meronce manik-manik warna-warni.\n3. Berhitung Objek Nyata: Ajak ananda menghitung buah, sendok makan, atau mainan mobil-mobilan saat beraktivitas santai bersama Ayah/Bunda.`
    );
    setNextTargets(
      `Melatih kelancaran membaca rangkaian 3 kata dengan intonasi santai, meningkatkan kerapian menyalin tulisan pada garis bantu buku, serta pengenalan konsep penjumlahan objek kuantitas angka 1 sampai 10.`
    );
    showToast('Template narasi apresiatif berhasil dimuat!');
  };

  // Run on mount or when student changes if empty
  React.useEffect(() => {
    if (!generalNarrative && selectedStudent) {
      applySmartDefaults();
    }
  }, [selectedStudentId, selectedMonthIndex, selectedYear]);

  const handleDownloadPdf = (existingReport?: LearningReport) => {
    const targetStudent = existingReport?.student || selectedStudent;
    if (!targetStudent) return;

    const reportMonth = existingReport ? existingReport.summary_notes?.match(/bulan (.*?)(\.|$)/)?.[1] || monthName : monthName;
    const dateFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const doc = generateMonthlyReportPdf({
      student: targetStudent,
      tutorName: currentTutor?.full_name || 'Tutor Calistung Syafa Course',
      monthName: reportMonth,
      periodStart: existingReport?.period_start || periodDates.startStr,
      periodEnd: existingReport?.period_end || periodDates.endStr,
      generatedDate: dateFormatted,
      sessions: studentMonthSessions,
      indicators,
      theme: pdfTheme,
      customNotes: {
        generalNarrative: generalNarrative || undefined,
        studentStrengths: studentStrengths || undefined,
        focusAreas: focusAreas || undefined,
        homeTips: homeTips || undefined,
        nextMonthTargets: nextTargets || undefined,
      },
    });

    const cleanName = targetStudent.full_name.replace(/\s+/g, '_');
    const cleanMonth = reportMonth.replace(/\s+/g, '_');
    doc.save(`Rapor_Bulanan_SyafaCourse_${cleanName}_${cleanMonth}.pdf`);
    showToast('File PDF Rapor Bulanan berhasil diunduh.');
  };

  const handlePrintPdf = () => {
    if (!selectedStudent) return;

    const dateFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const doc = generateMonthlyReportPdf({
      student: selectedStudent,
      tutorName: currentTutor?.full_name || 'Tutor Calistung Syafa Course',
      monthName,
      periodStart: periodDates.startStr,
      periodEnd: periodDates.endStr,
      generatedDate: dateFormatted,
      sessions: studentMonthSessions,
      indicators,
      theme: pdfTheme,
      customNotes: {
        generalNarrative: generalNarrative || undefined,
        studentStrengths: studentStrengths || undefined,
        focusAreas: focusAreas || undefined,
        homeTips: homeTips || undefined,
        nextMonthTargets: nextTargets || undefined,
      },
    });

    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  const handleSaveMonthlyReport = () => {
    if (!selectedStudent) return;

    const cleanName = selectedStudent.full_name.replace(/\s+/g, '_');
    const cleanMonth = monthName.replace(/\s+/g, '_');
    const fileName = `Rapor_Bulanan_SyafaCourse_${cleanName}_${cleanMonth}.pdf`;

    const newReport = store.saveReport({
      student_id: selectedStudent.id,
      period_type: 'monthly',
      period_start: periodDates.startStr,
      period_end: periodDates.endStr,
      status: 'ready',
      file_path: `reports/${fileName}`,
      summary_notes: `Laporan perkembangan belajar calistung bulanan ananda ${selectedStudent.full_name} untuk bulan ${monthName}.`,
    });

    setActiveReport(newReport);
    showToast(`Rapor bulanan untuk ${selectedStudent.full_name} (${monthName}) berhasil diterbitkan.`);
  };

  // WhatsApp Messaging Logic
  const parentName = selectedStudent?.parent?.full_name || 'Bapak/Ibu Wali Siswa';
  const parentPhone = selectedStudent?.parent?.whatsapp_number || '081234567890';
  const intlPhone = parentPhone.replace(/^0/, '62').replace(/\D/g, '');

  const whatsappMessage = `Assalamu'alaikum wr. wb., Halo ${parentName} yang dirahmati Allah,

Kami dari *Syafa Course* menyampaikan Laporan Rapor Perkembangan Belajar Bulanan ananda *${selectedStudent?.full_name}* untuk periode *${monthName}*.

Alhamdulillah, ananda telah menyelesaikan seluruh sesi belajar calistung bulan ini dengan penuh keceriaan dan antusiasme tinggi. Dalam dokumen terlampir, Ayah/Bunda dapat melihat:
1. Capaian tiga pilar calistung (Membaca, Menulis, & Berhitung)
2. Karakter positif dan kemandirian ananda bulan ini
3. Hal yang terus kita dampingi bersama
4. 3 ide permainan stimulasi menyenangkan di rumah (10 menit sehari)

File PDF resmi telah kami siapkan dan lampirkan di chat ini. Terima kasih banyak atas kepercayaan hangat Ayah & Bunda kepada Syafa Course. 

Salam hangat,
*${currentTutor?.full_name || 'Tutor Syafa Course'}*
Syafa Course - Belajar Ceria, Tumbuh Penuh Percaya Diri ✨`;

  const handleOpenWhatsApp = () => {
    if (activeReport) {
      store.logReportDelivery(activeReport.id, 'whatsapp', 'opened', 'Tutor membuka tautan WhatsApp wali murid');
    }
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${intlPhone}?text=${encoded}`, '_blank');
  };

  const handleMarkSent = () => {
    if (activeReport) {
      store.logReportDelivery(activeReport.id, 'whatsapp', 'sent', 'Tutor mengonfirmasi PDF telah dikirim ke wali murid');
      setIsWhatsAppModalOpen(false);
      showToast('Status diperbarui: Laporan bulanan telah terkirim ke WhatsApp wali murid!');
    }
  };

  return (
    <div className="space-y-7 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slateGray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-navyInk-700">Laporan Perkembangan Bulanan</span>
            <span className="text-slateGray-300">•</span>
            <span className="text-slateGray-500">Evaluasi Berkala & Apresiasi Karakter</span>
          </div>
          <h1 className="text-2xl font-bold text-navyInk-700 tracking-tight">
            Rapor Calistung Siswa & Pengiriman ke Wali
          </h1>
          <p className="text-xs text-slateGray-500 mt-0.5 max-w-2xl">
            Laporan perkembangan belajar ananda disusun sebulan sekali sebagai wujud transparansi, apresiasi karakter, dan panduan stimulasi hangat bagi orang tua di rumah.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4 text-slateGray-600" />}
            onClick={handlePrintPdf}
          >
            Cetak Lembar
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => handleDownloadPdf()}
          >
            Unduh PDF Rapor
          </Button>
        </div>
      </div>

      {/* Monthly Control Strip & Student Selector */}
      <div className="p-4 rounded-lg border border-slateGray-200 bg-white shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Siswa */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slateGray-600">
              Pilih Siswa Calistung
            </label>
            {myStudents.length === 0 ? (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Belum ada siswa aktif.</span>
                <button
                  type="button"
                  onClick={() => navigate('/tutor/students')}
                  className="font-bold underline text-navyInk-700"
                >
                  Daftarkan
                </button>
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-lg border border-slateGray-200 bg-slateGray-50/60 px-3 py-2 text-xs font-semibold text-navyInk-900 focus:outline-none focus:ring-1 focus:ring-navyInk-600 focus:bg-white"
              >
                {myStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.education_level})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Bulan */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slateGray-600">
              Pilih Bulan Laporan
            </label>
            <select
              value={selectedMonthIndex}
              onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-slateGray-200 bg-slateGray-50/60 px-3 py-2 text-xs font-semibold text-navyInk-900 focus:outline-none focus:ring-1 focus:ring-navyInk-600 focus:bg-white"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slateGray-600">
              Tahun Ajaran
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-lg border border-slateGray-200 bg-slateGray-50/60 px-3 py-2 text-xs font-semibold text-navyInk-900 focus:outline-none focus:ring-1 focus:ring-navyInk-600 focus:bg-white"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          {/* Pilihan Template PDF Unik */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slateGray-600">
              Format Desain PDF
            </label>
            <select
              value={pdfTheme}
              onChange={(e) => setPdfTheme(e.target.value as PdfReportTheme)}
              className="w-full rounded-lg border border-slateGray-200 bg-slateGray-50/60 px-3 py-2 text-xs font-semibold text-navyInk-900 focus:outline-none focus:ring-1 focus:ring-navyInk-600 focus:bg-white"
            >
              <option value="ceria_pastel">Ceria Edukatif (PAUD & TK)</option>
              <option value="prestasi_modern">Prestasi Akademik (TK-B & SD)</option>
            </select>
          </div>
        </div>

        {/* Action Bar & Stats Summary */}
        <div className="mt-4 pt-3.5 border-t border-slateGray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-slateGray-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-navyInk-600" />
              <span>Periode: <strong>1 - {periodDates.endDate.getDate()} {monthName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slateGray-600" />
              <span>Data Sesi: <strong>{studentMonthSessions.length} sesi tercatat</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-slateGray-500" />
              <span>Wali Murid: <strong>{selectedStudent?.parent?.full_name || 'Ayah/Bunda'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={applySmartDefaults}
            >
              Reset Teks Cerdas
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={handleSaveMonthlyReport}
            >
              Terbitkan Rapor Bulanan
            </Button>
          </div>
        </div>
      </div>

      {/* Warning if no sessions recorded for this month */}
      {studentMonthSessions.length === 0 && (
        <div className="p-3.5 rounded-lg bg-slateGray-100 border border-slateGray-200 text-navyInk-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-slateGray-600 shrink-0" />
            <div>
              <span className="font-bold block">Pemberitahuan Kelengkapan Data:</span>
              <span className="text-slateGray-600">
                Belum ada sesi bimbingan yang difinalisasi untuk ananda {selectedStudent?.full_name} pada periode {monthName}. Rapor akan menggunakan capaian target jenjang sebagai referensi.
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tutor/sessions')}
          >
            Catat Sesi Bimbingan
          </Button>
        </div>
      )}

      {/* Anti-AI-Slop Metric Summary Strip (Replaces the 4 Rainbow Candy Cards) */}
      <div className="bg-white rounded-lg border border-slateGray-200 p-4 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slateGray-200">
        <div className="p-2 sm:p-3">
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Pertemuan Tuntas</span>
          <div className="text-xl font-bold text-navyInk-700 mt-1">{studentMonthSessions.length || 8} Sesi</div>
          <span className="text-[11px] text-slateGray-400 mt-0.5 block">Periode {monthName}</span>
        </div>

        <div className="p-2 sm:p-3">
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Tingkat Kehadiran</span>
          <div className="text-xl font-bold text-navyInk-700 mt-1">100% Ceria</div>
          <span className="text-[11px] text-deepSage font-medium mt-0.5 block">Presensi tertib & disiplin</span>
        </div>

        <div className="p-2 sm:p-3">
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Total Waktu Belajar</span>
          <div className="text-xl font-bold text-navyInk-700 mt-1">{(studentMonthSessions.length || 8) * 60} Menit</div>
          <span className="text-[11px] text-slateGray-400 mt-0.5 block">Bimbingan privat intensif</span>
        </div>

        <div className="p-2 sm:p-3">
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Observasi Karakter</span>
          <div className="text-xl font-bold text-navyInk-700 mt-1">Mandiri & Percaya Diri</div>
          <span className="text-[11px] text-slateGray-500 mt-0.5 block">Fokus & antusias belajar</span>
        </div>
      </div>

      {/* Editor & Realistic Sheet Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Note Customizer for Monthly Report (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-lg border border-slateGray-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slateGray-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-navyInk-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-navyInk-700">Catatan Narasi Tutor</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slateGray-100 text-slateGray-600 font-medium">
                Dapat disesuaikan
              </span>
            </div>

            {/* Narasi Umum */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-navyInk-800">
                1. Narasi Kemajuan Belajar Bulan Ini
              </label>
              <textarea
                rows={4}
                value={generalNarrative}
                onChange={(e) => setGeneralNarrative(e.target.value)}
                placeholder="Tuliskan apresiasi dan ringkasan perkembangan belajar anak selama sebulan terakhir..."
                className="w-full text-xs rounded-lg border border-slateGray-200 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-navyInk-600 text-slateGray-800 leading-relaxed"
              />
            </div>

            {/* Karakter Unggul */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-navyInk-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-navyInk-600" />
                <span>2. Karakter & Sikap Belajar Positif</span>
              </label>
              <textarea
                rows={3}
                value={studentStrengths}
                onChange={(e) => setStudentStrengths(e.target.value)}
                placeholder="Contoh: Fokus ananda sangat baik, tidak mudah menyerah saat belajar suku kata baru..."
                className="w-full text-xs rounded-lg border border-slateGray-200 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-navyInk-600 text-slateGray-800 leading-relaxed"
              />
            </div>

            {/* Hal yang Sedang Dilatih */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-navyInk-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-navyInk-600" />
                <span>3. Hal yang Terus Dilatih Bersama</span>
              </label>
              <textarea
                rows={3}
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="Contoh: Pembiasaan memegang pensil secara rileks agar jari ananda tidak lelah..."
                className="w-full text-xs rounded-lg border border-slateGray-200 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-navyInk-600 text-slateGray-800 leading-relaxed"
              />
            </div>

            {/* Rekomendasi di Rumah */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-navyInk-800 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-navyInk-600" />
                <span>4. Ide Stimulasi Santai di Rumah (10 Menit)</span>
              </label>
              <textarea
                rows={3}
                value={homeTips}
                onChange={(e) => setHomeTips(e.target.value)}
                placeholder="Tuliskan 3 tips bermain edukatif tanpa gadget untuk Ayah & Bunda di rumah..."
                className="w-full text-xs rounded-lg border border-slateGray-200 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-navyInk-600 text-slateGray-800 leading-relaxed"
              />
            </div>

            {/* Target Bulan Depan */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-navyInk-800">
                5. Target Pembelajaran Bulan Depan
              </label>
              <textarea
                rows={2}
                value={nextTargets}
                onChange={(e) => setNextTargets(e.target.value)}
                placeholder="Target kemampuan membaca, menulis, dan berhitung untuk bulan berikutnya..."
                className="w-full text-xs rounded-lg border border-slateGray-200 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-navyInk-600 text-slateGray-800 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Realistic A4 Document Sheet Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Page Tabs */}
          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slateGray-200 shadow-xs">
            <div className="inline-flex p-0.5 bg-slateGray-100 rounded-md border border-slateGray-200 text-xs">
              <button
                type="button"
                onClick={() => setPreviewPage(1)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  previewPage === 1
                    ? 'bg-white text-navyInk-800 shadow-xs'
                    : 'text-slateGray-600 hover:text-navyInk-800'
                }`}
              >
                Hal 1: Cover & Ikhtisar
              </button>
              <button
                type="button"
                onClick={() => setPreviewPage(2)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  previewPage === 2
                    ? 'bg-white text-navyInk-800 shadow-xs'
                    : 'text-slateGray-600 hover:text-navyInk-800'
                }`}
              >
                Hal 2: Rincian Calistung
              </button>
              <button
                type="button"
                onClick={() => setPreviewPage(3)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  previewPage === 3
                    ? 'bg-white text-navyInk-800 shadow-xs'
                    : 'text-slateGray-600 hover:text-navyInk-800'
                }`}
              >
                Hal 3: Rekomendasi & Pengesahan
              </button>
            </div>

            <span className="text-[11px] text-slateGray-400 font-mono hidden sm:inline">
              Simulasi Cetak A4
            </span>
          </div>

          {/* Sheet Canvas: Crisp, Physical Editorial Paper */}
          <div className="bg-white rounded-lg border border-slateGray-300 p-6 md:p-8 shadow-sm relative overflow-hidden transition-all text-slateGray-800">

            {/* HALAMAN 1 PREVIEW */}
            {previewPage === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                {/* Header Branding */}
                <div className="flex items-center justify-between border-b border-slateGray-200 pb-3">
                  <div>
                    <span className="text-sm font-bold text-navyInk-800 tracking-tight">SYAFA COURSE</span>
                    <p className="text-[10px] text-slateGray-500">Bimbingan Belajar Calistung Berbasis Karakter & Fonik Anak</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-navyInk-700 block uppercase tracking-wider">Laporan Resmi Bulanan</span>
                    <span className="text-[9px] font-mono text-slateGray-400">NO: SC/RP/{selectedStudent?.student_code || '001'}</span>
                  </div>
                </div>

                {/* Document Title Banner */}
                <div className="p-3.5 rounded-lg border border-slateGray-200 bg-slateGray-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navyInk-700 block">
                      Laporan Perkembangan Belajar
                    </span>
                    <h3 className="text-sm font-bold text-navyInk-800 mt-0.5">
                      RAPOR CALISTUNG BULANAN
                    </h3>
                    <p className="text-[10px] text-slateGray-500">
                      Membaca Fonik, Menulis Motorik Halus & Logika Bilangan
                    </p>
                  </div>
                  <div className="text-right bg-white px-3 py-1.5 rounded border border-slateGray-200">
                    <span className="text-[9px] text-slateGray-500 uppercase block font-semibold">Periode</span>
                    <span className="text-xs font-bold text-navyInk-800">{monthName}</span>
                  </div>
                </div>

                {/* Student Profile Metadata Box */}
                <div className="rounded-lg border border-slateGray-200 bg-white p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-slateGray-400 text-[10px] block">Nama Siswa:</span>
                    <strong className="text-navyInk-800 block text-xs">{selectedStudent?.full_name}</strong>
                    <span className="text-slateGray-500 text-[10px]">NIS: {selectedStudent?.student_code}</span>
                  </div>
                  <div>
                    <span className="text-slateGray-400 text-[10px] block">Jenjang Usia:</span>
                    <strong className="text-slateGray-700 block text-xs">{selectedStudent?.education_level}</strong>
                    <span className="text-slateGray-500 text-[10px]">Les Privat</span>
                  </div>
                  <div>
                    <span className="text-slateGray-400 text-[10px] block">Wali Murid:</span>
                    <strong className="text-slateGray-700 block text-xs">{selectedStudent?.parent?.full_name || 'Ayah/Bunda'}</strong>
                    <span className="text-slateGray-500 text-[10px]">{selectedStudent?.parent?.whatsapp_number}</span>
                  </div>
                  <div>
                    <span className="text-slateGray-400 text-[10px] block">Tutor & Kehadiran:</span>
                    <strong className="text-slateGray-700 block text-xs">{currentTutor?.full_name || 'Tutor Syafa'}</strong>
                    <span className="text-deepSage font-semibold text-[10px]">{studentMonthSessions.length || 8} Sesi (100% Hadir)</span>
                  </div>
                </div>

                {/* Narasi Preview */}
                <div className="rounded-lg border border-slateGray-200 p-4 space-y-2 bg-slateGray-50/50">
                  <h4 className="font-bold text-xs text-navyInk-800 flex items-center gap-1.5">
                    <span>I. Ringkasan & Narasi Perkembangan Belajar Ananda</span>
                  </h4>
                  <div className="border-l-2 border-navyInk-700 pl-3 py-1 text-[11px] leading-relaxed text-slateGray-700 italic">
                    "{generalNarrative || 'Ananda menunjukkan kemajuan belajar yang membanggakan di setiap pertemuan...'}"
                  </div>
                </div>

                {/* Rubrik Legend for Parents */}
                <div className="p-3.5 rounded-lg border border-slateGray-200 bg-white text-[10px] space-y-2">
                  <span className="font-bold text-navyInk-800 block uppercase tracking-wider">
                    Panduan Skala Capaian untuk Orang Tua:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded border border-slateGray-200 bg-slateGray-50">
                      <strong className="text-navyInk-800">[ BSB ] ★★★★</strong>: Berkembang Sangat Baik (Mandiri & Percaya Diri)
                    </div>
                    <div className="p-2 rounded border border-slateGray-200 bg-slateGray-50">
                      <strong className="text-navyInk-800">[ BSH ] ★★★☆</strong>: Berkembang Sesuai Harapan (Tuntas Standar Usia)
                    </div>
                    <div className="p-2 rounded border border-slateGray-200 bg-slateGray-50">
                      <strong className="text-slateGray-700">[ MB ] ★★☆☆</strong>: Mulai Berkembang (Perlu Stimulasi Tutor)
                    </div>
                    <div className="p-2 rounded border border-slateGray-200 bg-slateGray-50">
                      <strong className="text-slateGray-700">[ BB ] ★☆☆☆</strong>: Belum Berkembang (Pengenalan Konsep Awal)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HALAMAN 2 PREVIEW: 3 PILAR CALISTUNG */}
            {previewPage === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center justify-between border-b border-slateGray-200 pb-2">
                  <h4 className="font-bold text-xs text-navyInk-800 uppercase tracking-wider">
                    II. Lembar Capaian Tiga Pilar Calistung ({monthName})
                  </h4>
                  <span className="text-[10px] text-slateGray-500 font-mono">Tabel Evaluasi Rubrik</span>
                </div>

                {/* Pilar Membaca */}
                <div className="rounded-lg border border-slateGray-200 overflow-hidden">
                  <div className="bg-slateGray-100 border-b border-slateGray-200 px-3 py-1.5 font-bold text-xs text-navyInk-800 flex justify-between items-center">
                    <span>A. Aspek Literasi & Membaca Fonik</span>
                    <span className="text-[10px] font-bold text-navyInk-700">Capaian: BSB</span>
                  </div>
                  <div className="p-3 bg-white divide-y divide-slateGray-100 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slateGray-700">1. Mengenal simbol dan bunyi huruf alfabet A-Z</span>
                      <strong className="text-navyInk-700 font-mono">★★★★ BSB</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slateGray-700">2. Melafalkan bunyi suku kata terbuka secara lancar</span>
                      <strong className="text-navyInk-700 font-mono">★★★★ BSB</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slateGray-700">3. Membaca kalimat sederhana dengan intonasi wajar</span>
                      <strong className="text-slateGray-600 font-mono">★★★☆ BSH</strong>
                    </div>
                  </div>
                </div>

                {/* Pilar Menulis */}
                <div className="rounded-lg border border-slateGray-200 overflow-hidden">
                  <div className="bg-slateGray-100 border-b border-slateGray-200 px-3 py-1.5 font-bold text-xs text-navyInk-800 flex justify-between items-center">
                    <span>B. Aspek Motorik Halus & Menulis Rapi</span>
                    <span className="text-[10px] font-bold text-navyInk-700">Capaian: BSH</span>
                  </div>
                  <div className="p-3 bg-white divide-y divide-slateGray-100 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slateGray-700">1. Posisi memegang pensil (tripod grip) dengan nyaman</span>
                      <strong className="text-slateGray-600 font-mono">★★★☆ BSH</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slateGray-700">2. Menyalin kata pendek pada buku bergaris secara rapi</span>
                      <strong className="text-slateGray-600 font-mono">★★★☆ BSH</strong>
                    </div>
                  </div>
                </div>

                {/* Pilar Berhitung */}
                <div className="rounded-lg border border-slateGray-200 overflow-hidden">
                  <div className="bg-slateGray-100 border-b border-slateGray-200 px-3 py-1.5 font-bold text-xs text-navyInk-800 flex justify-between items-center">
                    <span>C. Aspek Logika Bilangan & Berhitung</span>
                    <span className="text-[10px] font-bold text-navyInk-700">Capaian: BSB</span>
                  </div>
                  <div className="p-3 bg-white divide-y divide-slateGray-100 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slateGray-700">1. Mengenal simbol angka dan konsep perbandingan jumlah</span>
                      <strong className="text-navyInk-700 font-mono">★★★★ BSB</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slateGray-700">2. Menghitung kuantitas benda konkret & penjumlahan dasar</span>
                      <strong className="text-navyInk-700 font-mono">★★★★ BSB</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HALAMAN 3 PREVIEW: REKOMENDASI & PENGESAHAN */}
            {previewPage === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center justify-between border-b border-slateGray-200 pb-2">
                  <h4 className="font-bold text-xs text-navyInk-800 uppercase tracking-wider">
                    III. Rekomendasi di Rumah, Stempel & Pengesahan
                  </h4>
                  <span className="text-[10px] text-slateGray-500 font-mono">Lembar Pengesahan</span>
                </div>

                <div className="p-3 rounded-lg border border-slateGray-200 bg-slateGray-50 text-[11px]">
                  <strong className="text-navyInk-800 block mb-1">Karakter & Sikap Unggul Ananda:</strong>
                  <p className="text-slateGray-700 leading-relaxed">{studentStrengths}</p>
                </div>

                <div className="p-3 rounded-lg border border-slateGray-200 bg-slateGray-50 text-[11px]">
                  <strong className="text-navyInk-800 block mb-1">Fokus yang Terus Dilatih Bersama:</strong>
                  <p className="text-slateGray-700 leading-relaxed">{focusAreas}</p>
                </div>

                <div className="p-3 rounded-lg border border-slateGray-200 bg-slateGray-50 text-[11px]">
                  <strong className="text-navyInk-800 block mb-1">Ide Stimulasi Santai di Rumah (10 Menit):</strong>
                  <p className="text-slateGray-700 whitespace-pre-line leading-relaxed">{homeTips}</p>
                </div>

                <div className="p-3 rounded-lg border border-slateGray-200 bg-slateGray-50 text-[11px]">
                  <strong className="text-navyInk-800 block mb-1">Target Pembelajaran Bulan Depan:</strong>
                  <p className="text-slateGray-700 leading-relaxed">{nextTargets}</p>
                </div>

                {/* Stempel & Tanda Tangan Resmi */}
                <div className="pt-4 border-t border-slateGray-200 flex items-center justify-between text-[11px]">
                  <div className="text-center w-36">
                    <p className="text-slateGray-500 text-[10px]">Wali Murid,</p>
                    <div className="h-10" />
                    <p className="font-semibold text-slateGray-800">( {selectedStudent?.parent?.full_name || 'Ayah / Bunda'} )</p>
                  </div>

                  {/* Stamp Center */}
                  <div className="w-16 h-16 rounded-full border-2 border-navyInk-700 text-navyInk-700 flex flex-col items-center justify-center text-[7px] font-bold p-1 text-center rotate-[-4deg]">
                    <span>SYAFA COURSE</span>
                    <span className="text-[6px] tracking-wider text-slateGray-600">RAPOR RESMI</span>
                    <span>CALISTUNG</span>
                  </div>

                  <div className="text-center w-36">
                    <p className="text-slateGray-500 text-[10px]">Tutor Pembimbing,</p>
                    <div className="h-10" />
                    <p className="font-semibold text-navyInk-800">( {currentTutor?.full_name || 'Tutor Syafa'} )</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Reports History & WhatsApp Delivery Log */}
      <div className="bg-white rounded-lg border border-slateGray-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slateGray-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-navyInk-700" />
            <h2 className="text-sm font-bold text-navyInk-800">
              Riwayat Rapor Bulanan & Pengiriman ke Wali Murid
            </h2>
          </div>
          <span className="text-xs text-slateGray-500">
            Total {reports.length} rapor diterbitkan
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 bg-slateGray-50 rounded-lg border border-dashed border-slateGray-200 text-xs text-slateGray-500 space-y-1.5">
            <p className="font-semibold text-slateGray-700">Belum ada rapor bulanan yang disimpan.</p>
            <p className="text-slateGray-400">
              Pilih siswa dan bulan di atas, lalu klik <strong>"Terbitkan Rapor Bulanan"</strong>.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slateGray-100">
            {reports.map((rep) => {
              const student = myStudents.find((s) => s.id === rep.student_id);
              const latestLog = rep.delivery_logs?.[0];

              return (
                <div
                  key={rep.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slateNavy-900 text-sm">
                        {student?.full_name || 'Siswa'}
                      </span>
                      <Badge variant="blue" size="sm">
                        {rep.period_start} s/d {rep.period_end}
                      </Badge>
                      <Badge
                        variant={rep.status === 'sent' ? 'green' : rep.status === 'ready' ? 'amber' : 'slate'}
                        size="sm"
                      >
                        {rep.status === 'sent'
                          ? 'Terkirim ke WhatsApp Wali'
                          : rep.status === 'ready'
                          ? 'Siap Dikirim'
                          : 'Draf'}
                      </Badge>
                    </div>

                    <p className="text-slateNavy-500 text-[11px]">
                      File Dokumen: <span className="font-mono">{rep.file_path || 'Rapor_Bulanan.pdf'}</span> • Dibuat pada:{' '}
                      {new Date(rep.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>

                    {latestLog && (
                      <p className="text-emerald-700 text-[11px] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>
                          Status WhatsApp: {latestLog.status === 'sent' ? 'Telah dikonfirmasi terkirim' : 'Tautan chat dibuka'} (
                          {new Date(latestLog.attempted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                      onClick={() => handleDownloadPdf(rep)}
                    >
                      Unduh PDF
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setActiveReport(rep);
                        setIsWhatsAppModalOpen(true);
                      }}
                    >
                      Kirim via WhatsApp
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp Dispatch Modal */}
      <Modal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        title="Kirimkan Rapor Bulanan ke Orang Tua via WhatsApp"
        description="Hubungkan langsung dengan wali murid melalui pesan WhatsApp yang santun dan apresiatif."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-slateGray-50 border border-slateGray-200 text-xs text-navyInk-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-navyInk-800">
              <CheckCircle2 className="w-4 h-4 text-deepSage" />
              <span>Panduan Pengiriman Rapor PDF:</span>
            </div>
            <p className="text-slateGray-600 text-[11px] leading-relaxed">
              1. Pastikan Anda telah mengunduh file PDF rapor ke perangkat Anda.<br />
              2. Klik tombol <strong>"Buka WhatsApp Orang Tua"</strong> di bawah untuk membuka ruang obrolan dengan draf pesan pengantar yang telah terisi rapi.<br />
              3. Di dalam WhatsApp, pilih tombol <strong>Lampirkan Dokumen (Paperclip)</strong>, pilih file PDF rapor, lalu kirimkan.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slateGray-600">
              Nomor WhatsApp Wali Murid
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slateGray-200 bg-slateGray-50 text-xs font-mono text-navyInk-900">
              <span>+{intlPhone}</span>
              <span className="text-slateGray-500 font-sans font-medium">({parentName})</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slateGray-600">
              Pratinjau Pesan Pengantar WhatsApp
            </label>
            <textarea
              rows={8}
              readOnly
              className="w-full rounded-lg border border-slateGray-200 bg-white p-3 text-xs text-slateGray-800 focus:outline-none font-sans leading-relaxed"
              value={whatsappMessage}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slateGray-200">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => handleDownloadPdf(activeReport || undefined)}
            >
              Unduh File PDF Dulu
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="success"
                size="sm"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={handleOpenWhatsApp}
              >
                Buka WhatsApp Orang Tua
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkSent}
              >
                Tandai Sudah Terkirim
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
