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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
              Evaluasi Berkala Sebulan Sekali
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              Desain Edukatif Premium
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 tracking-tight">
            Rapor Bulanan Siswa & Pengiriman ke Wali Murid
          </h1>
          <p className="text-sm text-slateNavy-500 mt-1 max-w-2xl">
            Laporan perkembangan belajar ananda disusun sebulan sekali sebagai wujud transparansi, apresiasi karakter, dan panduan stimulasi hangat bagi orang tua di rumah.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4 text-slateNavy-600" />}
            onClick={handlePrintPdf}
          >
            Cetak Dokumen
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
      <Card className="p-5 shadow-sm border border-slateNavy-100 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Siswa */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slateNavy-600">
              Pilih Siswa Calistung
            </label>
            {myStudents.length === 0 ? (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Belum ada siswa aktif.</span>
                <button
                  type="button"
                  onClick={() => navigate('/tutor/students')}
                  className="font-bold underline text-brand-600"
                >
                  Daftarkan
                </button>
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-xl border border-slateNavy-200 bg-cream-50/50 px-3 py-2.5 text-sm font-semibold text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white"
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
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slateNavy-600">
              Pilih Bulan Laporan
            </label>
            <select
              value={selectedMonthIndex}
              onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
              className="w-full rounded-xl border border-slateNavy-200 bg-cream-50/50 px-3 py-2.5 text-sm font-semibold text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slateNavy-600">
              Tahun Ajaran
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-xl border border-slateNavy-200 bg-cream-50/50 px-3 py-2.5 text-sm font-semibold text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          {/* Pilihan Template PDF Unik */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slateNavy-600">
              Template Desain PDF
            </label>
            <select
              value={pdfTheme}
              onChange={(e) => setPdfTheme(e.target.value as PdfReportTheme)}
              className="w-full rounded-xl border border-slateNavy-200 bg-cream-50/50 px-3 py-2.5 text-sm font-semibold text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white"
            >
              <option value="ceria_pastel">🌸 Ceria Pastel Kids (PAUD & TK)</option>
              <option value="prestasi_modern">🎓 Prestasi Modern (TK-B & SD)</option>
            </select>
          </div>
        </div>

        {/* Action Bar & Stats Summary */}
        <div className="mt-5 pt-4 border-t border-slateNavy-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slateNavy-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Periode: <strong>1 - {periodDates.endDate.getDate()} {monthName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Data Sesi: <strong>{studentMonthSessions.length} sesi pertemuan tercatat</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pastelPink-500" />
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
      </Card>

      {/* Warning if no sessions recorded for this month */}
      {studentMonthSessions.length === 0 && (
        <div className="p-4 rounded-xl bg-warmCream border border-softCoral-300 text-navyInk-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-softCoral-500 shrink-0" />
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

      {/* 4 Stat Highlights for Selected Month */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-brand-600 flex items-center justify-center font-bold text-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slateNavy-500 uppercase">Pertemuan Selesai</div>
            <div className="text-xl font-extrabold text-slateNavy-900">{studentMonthSessions.length || 8} Sesi</div>
            <div className="text-[10px] text-blue-600 font-medium">Bulan {monthName}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slateNavy-500 uppercase">Tingkat Hadir</div>
            <div className="text-xl font-extrabold text-slateNavy-900">100% Ceria</div>
            <div className="text-[10px] text-emerald-600 font-medium">Sangat disiplin & aktif</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-pink-500/10 text-pastelPink-600 flex items-center justify-center font-bold text-lg">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slateNavy-500 uppercase">Durasi Total</div>
            <div className="text-xl font-extrabold text-slateNavy-900">{(studentMonthSessions.length || 8) * 60} Menit</div>
            <div className="text-[10px] text-pink-600 font-medium">Belajar efektif terarah</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slateNavy-500 uppercase">Predikat Karakter</div>
            <div className="text-xl font-extrabold text-slateNavy-900">Mandiri ⭐</div>
            <div className="text-[10px] text-amber-700 font-medium">Percaya diri tinggi</div>
          </div>
        </div>
      </div>

      {/* Editor & Realistic Sheet Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Note Customizer for Monthly Report (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4 shadow-sm border border-slateNavy-100">
            <div className="flex items-center justify-between border-b border-slateNavy-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-slateNavy-900">Kustomisasi Catatan Rapor</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream-200 text-slateNavy-700 font-semibold">
                Bisa diedit tutor
              </span>
            </div>

            {/* Narasi Umum */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slateNavy-700">
                1. Narasi Kemajuan Umum Bulan Ini
              </label>
              <textarea
                rows={4}
                value={generalNarrative}
                onChange={(e) => setGeneralNarrative(e.target.value)}
                placeholder="Tuliskan apresiasi dan ringkasan perkembangan belajar anak selama sebulan terakhir..."
                className="w-full text-xs rounded-xl border border-slateNavy-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            {/* Karakter Unggul */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slateNavy-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Karakter Unggul & Pujian Ananda</span>
              </label>
              <textarea
                rows={3}
                value={studentStrengths}
                onChange={(e) => setStudentStrengths(e.target.value)}
                placeholder="Contoh: Fokus ananda sangat baik, tidak mudah menyerah saat belajar suku kata baru..."
                className="w-full text-xs rounded-xl border border-slateNavy-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            {/* Hal yang Sedang Dilatih */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slateNavy-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                <span>3. Hal yang Terus Dilatih Bersama</span>
              </label>
              <textarea
                rows={3}
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="Contoh: Pembiasaan memegang pensil secara rileks agar jari ananda tidak lelah..."
                className="w-full text-xs rounded-xl border border-slateNavy-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            {/* Rekomendasi di Rumah */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slateNavy-700 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pastelPink-500" />
                <span>4. Ide Stimulasi Santai di Rumah (10 Menit)</span>
              </label>
              <textarea
                rows={3}
                value={homeTips}
                onChange={(e) => setHomeTips(e.target.value)}
                placeholder="Tuliskan 3 tips bermain edukatif tanpa gadget untuk Ayah & Bunda di rumah..."
                className="w-full text-xs rounded-xl border border-slateNavy-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            {/* Target Bulan Depan */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slateNavy-700">
                5. Target Pembelajaran Bulan Depan
              </label>
              <textarea
                rows={2}
                value={nextTargets}
                onChange={(e) => setNextTargets(e.target.value)}
                placeholder="Target kemampuan membaca, menulis, dan berhitung untuk bulan berikutnya..."
                className="w-full text-xs rounded-xl border border-slateNavy-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Realistic A4 Document Sheet Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Page Tabs */}
          <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slateNavy-100 shadow-sm">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewPage(1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewPage === 1
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slateNavy-600 hover:bg-slateNavy-50'
                }`}
              >
                Hal 1: Cover & Ikhtisar
              </button>
              <button
                type="button"
                onClick={() => setPreviewPage(2)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewPage === 2
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slateNavy-600 hover:bg-slateNavy-50'
                }`}
              >
                Hal 2: Rincian Calistung
              </button>
              <button
                type="button"
                onClick={() => setPreviewPage(3)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  previewPage === 3
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slateNavy-600 hover:bg-slateNavy-50'
                }`}
              >
                Hal 3: Rekomendasi & Stempel
              </button>
            </div>

            <span className="text-[11px] text-slateNavy-400 font-mono hidden sm:inline">
              Simulasi Cetak A4
            </span>
          </div>

          {/* Sheet Canvas with Realistic Shadow */}
          <div className="bg-white rounded-3xl border-2 border-slateNavy-200/80 p-6 md:p-8 shadow-card relative overflow-hidden transition-all text-slateNavy-800">
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 via-pastelPink-400 to-amber-400" />

            {/* HALAMAN 1 PREVIEW */}
            {previewPage === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs">
                {/* Header Branding */}
                <div className="flex items-center justify-between border-b border-slateNavy-100 pb-3">
                  <div>
                    <span className="text-base font-extrabold text-brand-700 tracking-tight">SYAFA COURSE</span>
                    <p className="text-[10px] text-slateNavy-500">Les Privat Calistung PAUD • TK • SD | "Belajar Ceria, Tumbuh Penuh Percaya Diri"</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-amber-700 block">RAPOR BULANAN RESMI</span>
                    <span className="text-[9px] font-mono text-slateNavy-400">NO: SC/RP/{selectedStudent?.student_code || '001'}</span>
                  </div>
                </div>

                {/* Banner Hero */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-pink-50 border border-brand-200/80 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[9px] font-bold uppercase">
                      Laporan Perkembangan Belajar
                    </span>
                    <h3 className="text-base font-black text-slateNavy-900 mt-1">
                      RAPOR CALISTUNG BULANAN
                    </h3>
                    <p className="text-[11px] text-slateNavy-600">
                      Membaca Fonik, Menulis Motorik & Logika Kuantitas Angka
                    </p>
                  </div>
                  <div className="text-center bg-white px-3.5 py-2 rounded-xl border border-brand-100 shadow-sm">
                    <span className="text-[9px] text-brand-700 font-bold block uppercase">Periode</span>
                    <span className="text-xs font-black text-slateNavy-900">{monthName}</span>
                  </div>
                </div>

                {/* Student Showcase Card */}
                <div className="p-4 rounded-2xl bg-cream-50/70 border border-slateNavy-200 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
                    {selectedStudent?.full_name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="font-extrabold text-sm text-slateNavy-900">{selectedStudent?.full_name}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold">
                        Jenjang: {selectedStudent?.education_level}
                      </span>
                      <p className="text-slateNavy-500 mt-1">NIS: {selectedStudent?.student_code}</p>
                    </div>
                    <div className="sm:border-l sm:border-slateNavy-200 sm:pl-3 text-slateNavy-600 space-y-0.5">
                      <div>Wali: <strong>{selectedStudent?.parent?.full_name || 'Ayah/Bunda'}</strong></div>
                      <div>Tutor: <strong>{currentTutor?.full_name || 'Tutor Syafa'}</strong></div>
                      <div>Kehadiran: <strong className="text-emerald-700">100% Ceria ({studentMonthSessions.length || 8} Sesi)</strong></div>
                    </div>
                  </div>
                </div>

                {/* Narasi Preview */}
                <div className="p-4 rounded-2xl bg-white border border-slateNavy-200 space-y-2">
                  <h4 className="font-bold text-xs text-brand-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>I. Narasi Perkembangan Belajar Ananda Bulan Ini</span>
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slateNavy-700 italic">
                    "{generalNarrative || 'Ananda menunjukkan kemajuan belajar yang membanggakan di setiap pertemuan...'}"
                  </p>
                </div>

                {/* Rubrik Legend for Parents */}
                <div className="p-3.5 rounded-2xl bg-slateNavy-50 border border-slateNavy-200 text-[10px] space-y-1.5">
                  <span className="font-bold text-slateNavy-900 block">Panduan Skala Capaian untuk Ayah & Bunda:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-900">
                      <strong>[ BSB ] ★★★★</strong>: Berkembang Sangat Baik (Mandiri & Percaya Diri)
                    </div>
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-900">
                      <strong>[ BSH ] ★★★☆</strong>: Berkembang Sesuai Harapan (Tuntas Standar Usia)
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-900">
                      <strong>[ MB ] ★★☆☆</strong>: Mulai Berkembang (Memerlukan Arahan Tutor)
                    </div>
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-900">
                      <strong>[ BB ] ★☆☆☆</strong>: Belum Berkembang (Membutuhkan Stimulasi Santai)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HALAMAN 2 PREVIEW: 3 PILAR CALISTUNG */}
            {previewPage === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center justify-between border-b border-slateNavy-100 pb-2">
                  <h4 className="font-extrabold text-xs text-brand-800 uppercase tracking-wider">
                    II. Lembar Capaian Tiga Pilar Calistung ({monthName})
                  </h4>
                  <Badge variant="blue" size="sm">Tabel Rincian Rubrik</Badge>
                </div>

                {/* Pilar Membaca */}
                <div className="rounded-2xl border border-blue-200 overflow-hidden">
                  <div className="bg-brand-600 text-white px-3 py-1.5 font-bold text-xs flex justify-between items-center">
                    <span>📖 A. Aspek Literasi & Membaca Ceria</span>
                    <span className="text-[10px] bg-brand-700 px-2 py-0.5 rounded-full">Predikat: BSB</span>
                  </div>
                  <div className="p-3 bg-blue-50/40 divide-y divide-blue-100 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center py-1">
                      <span>1. Mengenal simbol huruf alfabet A-Z</span>
                      <strong className="text-emerald-700">★★★★ BSB</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>2. Melafalkan bunyi suku kata terbuka (ba, ca, da)</span>
                      <strong className="text-emerald-700">★★★★ BSB</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>3. Membaca kalimat 2-3 kata dengan intonasi wajar</span>
                      <strong className="text-blue-700">★★★☆ BSH</strong>
                    </div>
                  </div>
                </div>

                {/* Pilar Menulis */}
                <div className="rounded-2xl border border-pink-200 overflow-hidden">
                  <div className="bg-pastelPink-500 text-white px-3 py-1.5 font-bold text-xs flex justify-between items-center">
                    <span>✍️ B. Aspek Motorik Halus & Menulis Rapi</span>
                    <span className="text-[10px] bg-pink-600 px-2 py-0.5 rounded-full">Predikat: BSH</span>
                  </div>
                  <div className="p-3 bg-pink-50/40 divide-y divide-pink-100 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center py-1">
                      <span>1. Posisi memegang pensil (tripod grip) dengan nyaman</span>
                      <strong className="text-blue-700">★★★☆ BSH</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>2. Menyalin kata pendek pada buku bergaris secara rapi</span>
                      <strong className="text-blue-700">★★★☆ BSH</strong>
                    </div>
                  </div>
                </div>

                {/* Pilar Berhitung */}
                <div className="rounded-2xl border border-emerald-200 overflow-hidden">
                  <div className="bg-emerald-600 text-white px-3 py-1.5 font-bold text-xs flex justify-between items-center">
                    <span>🔢 C. Aspek Logika Angka & Berhitung Asyik</span>
                    <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full">Predikat: BSB</span>
                  </div>
                  <div className="p-3 bg-emerald-50/40 divide-y divide-emerald-100 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center py-1">
                      <span>1. Mengenal simbol angka 1-20 dan perbandingan jumlah</span>
                      <strong className="text-emerald-700">★★★★ BSB</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>2. Menghitung kuantitas benda konkret & penjumlahan dasar</span>
                      <strong className="text-emerald-700">★★★★ BSB</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HALAMAN 3 PREVIEW: REKOMENDASI & PENGESAHAN */}
            {previewPage === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center justify-between border-b border-slateNavy-100 pb-2">
                  <h4 className="font-extrabold text-xs text-brand-800 uppercase tracking-wider">
                    III. Rekomendasi di Rumah, Stempel & Tanda Tangan
                  </h4>
                  <Badge variant="green" size="sm">Halaman Pengesahan</Badge>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-[11px]">
                  <strong className="text-emerald-800 block mb-1">🌟 Karakter Unggul Ananda:</strong>
                  <p className="text-slateNavy-700">{studentStrengths}</p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px]">
                  <strong className="text-amber-800 block mb-1">💡 Fokus yang Terus Dilatih:</strong>
                  <p className="text-slateNavy-700">{focusAreas}</p>
                </div>

                <div className="p-3 rounded-2xl bg-pink-50/80 border border-pink-200 text-[11px]">
                  <strong className="text-pastelPink-700 block mb-1">🏡 Ide Bermain 10 Menit di Rumah:</strong>
                  <p className="text-slateNavy-700 whitespace-pre-line">{homeTips}</p>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-[11px]">
                  <strong className="text-brand-800 block mb-1">🎯 Target Pembelajaran Bulan Depan:</strong>
                  <p className="text-slateNavy-700">{nextTargets}</p>
                </div>

                {/* Stempel & Tanda Tangan Mock */}
                <div className="pt-4 border-t border-slateNavy-200 flex items-center justify-between text-[11px]">
                  <div className="text-center w-36">
                    <p className="text-slateNavy-500">Wali Murid,</p>
                    <div className="h-12" />
                    <p className="font-bold text-slateNavy-800">( {selectedStudent?.parent?.full_name || 'Ayah / Bunda'} )</p>
                  </div>

                  {/* Stamp Center */}
                  <div className="w-16 h-16 rounded-full border-2 border-brand-500 text-brand-700 flex flex-col items-center justify-center text-[7px] font-bold p-1 text-center rotate-[-6deg]">
                    <span>SYAFA COURSE</span>
                    <span className="text-[6px] text-pink-600">★ RESMI ★</span>
                    <span>RAPOR BULANAN</span>
                  </div>

                  <div className="text-center w-36">
                    <p className="text-slateNavy-500">Tutor Pembimbing,</p>
                    <div className="h-12" />
                    <p className="font-bold text-brand-700">( {currentTutor?.full_name || 'Tutor Syafa'} )</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Reports History & WhatsApp Delivery Log */}
      <Card className="p-5 space-y-4 shadow-sm border border-slateNavy-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slateNavy-900">
              Riwayat Rapor Bulanan & Pengiriman ke Wali Murid
            </h2>
          </div>
          <span className="text-xs text-slateNavy-500">
            Total {reports.length} rapor diterbitkan
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 bg-cream-50/60 rounded-2xl border border-dashed border-slateNavy-200 text-xs text-slateNavy-500 space-y-2">
            <p className="font-medium">Belum ada rapor bulanan yang disimpan.</p>
            <p className="text-slateNavy-400">
              Pilih siswa dan bulan di atas, lalu klik <strong>"Terbitkan Rapor Bulanan"</strong>.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slateNavy-100">
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
      </Card>

      {/* WhatsApp Dispatch Modal */}
      <Modal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        title="Kirimkan Rapor Bulanan ke Orang Tua via WhatsApp"
        description="Hubungkan langsung dengan wali murid melalui pesan WhatsApp yang hangat dan santun."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Panduan Mudah Pengiriman Rapor PDF:</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              1. Pastikan Anda telah mengunduh file PDF rapor ke perangkat (ponsel/laptop).<br />
              2. Klik tombol <strong>"Buka WhatsApp Orang Tua"</strong> di bawah untuk membuka ruang obrolan langsung dengan draf pesan pengantar yang telah terisi rapi.<br />
              3. Di dalam WhatsApp, pilih tombol <strong>Lampirkan Dokumen (Paperclip)</strong>, pilih file PDF rapor yang baru diunduh, lalu kirimkan.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slateNavy-700">
              Nomor WhatsApp Wali Murid
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-slateNavy-200 bg-cream-50 text-xs font-mono text-slateNavy-900">
              <span>+{intlPhone}</span>
              <span className="text-slateNavy-500 font-sans font-medium">({parentName})</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slateNavy-700">
              Pratinjau Pesan Pengantar WhatsApp
            </label>
            <textarea
              rows={8}
              readOnly
              className="w-full rounded-xl border border-slateNavy-200 bg-white p-3 text-xs text-slateNavy-800 focus:outline-none font-sans leading-relaxed"
              value={whatsappMessage}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slateNavy-100">
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
