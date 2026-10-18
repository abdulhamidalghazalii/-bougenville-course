import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { generateReportPdf } from '../../lib/pdfGenerator';
import { LearningReport, Student } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FileText,
  Download,
  Share2,
  Printer,
  Calendar,
  Eye,
  CheckCircle2,
  Send,
  MessageSquare,
  AlertCircle,
  FileCheck,
  Sparkles,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const store = useAppStore();
  const currentTutor = store.currentUser;
  const myStudents = store.getTutorStudents();
  const reports = store.getTutorReports();
  const indicators = store.indicators;

  // Selected student and period
  const [selectedStudentId, setSelectedStudentId] = useState(myStudents[0]?.id || '');
  const [periodType, setPeriodType] = useState<'monthly' | 'weekly' | 'custom'>('monthly');
  const [monthName, setMonthName] = useState('Oktober 2026');
  const [periodStart, setPeriodStart] = useState('2026-10-01');
  const [periodEnd, setPeriodEnd] = useState('2026-10-31');

  // Preview & Distribution Modal States
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<LearningReport | null>(reports[0] || null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedStudent = myStudents.find((s) => s.id === selectedStudentId) || myStudents[0];
  const studentSessions = selectedStudent
    ? store.getStudentSessions(selectedStudent.id).filter((s) => s.status === 'finalized')
    : [];

  const handleGenerateAndSaveReport = () => {
    if (!selectedStudent) return;

    const periodLabel = periodType === 'monthly' ? monthName : `${periodStart} s/d ${periodEnd}`;
    const cleanStudentName = selectedStudent.full_name.replace(/\s+/g, '_');
    const cleanPeriod = periodLabel.replace(/\s+/g, '_');
    const fileName = `Laporan_SyafaCourse_${cleanStudentName}_${cleanPeriod}.pdf`;

    const newReport = store.saveReport({
      student_id: selectedStudent.id,
      period_type: periodType,
      period_start: periodStart,
      period_end: periodEnd,
      status: 'ready',
      file_path: `reports/${fileName}`,
      summary_notes: `Laporan perkembangan belajar calistung ananda ${selectedStudent.full_name} untuk periode ${periodLabel}.`,
    });

    setActiveReport(newReport);
    showToast(`Laporan ${fileName} berhasil dibuat dan disimpan.`);
  };

  const handleDownloadPdf = (report?: LearningReport) => {
    const targetStudent = report?.student || selectedStudent;
    if (!targetStudent) return;

    const periodLabel = report ? `${report.period_start} s/d ${report.period_end}` : monthName;
    const dateFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const doc = generateReportPdf({
      student: targetStudent,
      tutorName: currentTutor?.full_name || 'Tutor Syafa Course',
      periodLabel,
      periodStart: report?.period_start || periodStart,
      periodEnd: report?.period_end || periodEnd,
      generatedDate: dateFormatted,
      sessions: studentSessions,
      indicators,
    });

    const cleanName = targetStudent.full_name.replace(/\s+/g, '_');
    const cleanPeriod = (report?.period_type === 'monthly' ? monthName : periodLabel).replace(/\s+/g, '_');
    doc.save(`Laporan_SyafaCourse_${cleanName}_${cleanPeriod}.pdf`);

    showToast('File PDF berhasil diunduh ke perangkat Anda.');
  };

  const handlePrintPdf = () => {
    if (!selectedStudent) return;

    const doc = generateReportPdf({
      student: selectedStudent,
      tutorName: currentTutor?.full_name || 'Tutor Syafa Course',
      periodLabel: monthName,
      periodStart,
      periodEnd,
      generatedDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      sessions: studentSessions,
      indicators,
    });

    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  // WhatsApp Message Preparation
  const parentName = selectedStudent?.parent?.full_name || 'Bapak/Ibu Orang Tua Siswa';
  const parentPhone = selectedStudent?.parent?.whatsapp_number || '081234567890';
  const intlPhone = parentPhone.replace(/^0/, '62').replace(/\D/g, '');

  const whatsappMessage = `Halo ${parentName}, berikut kami sampaikan laporan perkembangan belajar ananda ${selectedStudent?.full_name} dari Syafa Course untuk periode ${monthName}. Laporan ini berisi capaian calistung (membaca, menulis, berhitung), hal yang masih perlu dilatih, dan rekomendasi kegiatan belajar menyenangkan di rumah. Terima kasih banyak atas kepercayaan dan kerjasamanya! 🙏✨`;

  const handleOpenWhatsApp = () => {
    if (activeReport) {
      store.logReportDelivery(activeReport.id, 'whatsapp', 'opened', 'Tutor membuka tautan WhatsApp');
    }
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${intlPhone}?text=${encoded}`, '_blank');
  };

  const handleMarkSent = () => {
    if (activeReport) {
      store.logReportDelivery(activeReport.id, 'whatsapp', 'sent', 'Tutor mengonfirmasi file PDF terkirim');
      setIsWhatsAppModalOpen(false);
      showToast('Status pengiriman laporan diperbarui: Terkirim!');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 tracking-tight">
            Generator Laporan PDF & Distribusi WhatsApp
          </h1>
          <p className="text-sm text-slateNavy-500 mt-1">
            Buat laporan 3 halaman resmi siap cetak, pratinjau, dan kirimkan langsung kepada orang tua siswa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrintPdf}
          >
            Cetak Laporan
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => handleDownloadPdf()}
          >
            Unduh PDF Sekarang
          </Button>
        </div>
      </div>

      {/* Report Configuration Card */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slateNavy-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span>Pengaturan Parameter Laporan</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slateNavy-600">Pilih Siswa</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-xl border border-slateNavy-200 bg-white px-3 py-2.5 text-sm text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {myStudents.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.full_name} ({stu.education_level})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slateNavy-600">Pilihan Periode</label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as any)}
              className="w-full rounded-xl border border-slateNavy-200 bg-white px-3 py-2.5 text-sm text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="monthly">Laporan Bulanan</option>
              <option value="weekly">Laporan Mingguan</option>
              <option value="custom">Rentang Tanggal Khusus</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slateNavy-600">Label Bulan / Periode</label>
            <input
              type="text"
              value={monthName}
              onChange={(e) => setMonthName(e.target.value)}
              className="w-full rounded-xl border border-slateNavy-200 bg-white px-3 py-2.5 text-sm text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Contoh: Oktober 2026"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slateNavy-100">
          <div className="text-xs text-slateNavy-500">
            Sumber Data: <span className="font-bold text-slateNavy-800">{studentSessions.length} sesi belajar difinalisasi</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye className="w-4 h-4" />}
              onClick={() => setIsPreviewModalOpen(true)}
            >
              Pratinjau Halaman Laporan
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FileCheck className="w-4 h-4" />}
              onClick={handleGenerateAndSaveReport}
            >
              Buat & Simpan Dokumen
            </Button>
          </div>
        </div>
      </Card>

      {/* Interactive 3-Page Document Preview on Screen */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slateNavy-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>Pratinjau Struktur Laporan (Standar Kertas A4 Tiga Halaman)</span>
          </h2>
          <span className="text-xs text-slateNavy-500">Teks tajam, margin presisi & tata letak rapi</span>
        </div>

        {/* 3 Pages Grid Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* HALAMAN 1 PREVIEW */}
          <div className="bg-white rounded-2xl border border-slateNavy-200 p-5 shadow-card space-y-4 text-xs">
            <div className="border-b border-brand-500 pb-2 flex justify-between items-center text-[10px] text-brand-700 font-bold uppercase">
              <span>Halaman 1 / 3: Ringkasan</span>
              <Badge variant="blue" size="sm">Header Syafa</Badge>
            </div>

            <div className="text-center p-3 rounded-xl bg-cream-50 border border-brand-200">
              <h3 className="font-extrabold text-sm text-slateNavy-900">LAPORAN PERKEMBANGAN BELAJAR</h3>
              <p className="text-[11px] text-slateNavy-500 mt-0.5">Periode: {monthName}</p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slateNavy-50 border border-slateNavy-100 text-[11px]">
              <div><strong>Nama Siswa:</strong> {selectedStudent?.full_name}</div>
              <div><strong>Jenjang:</strong> {selectedStudent?.education_level}</div>
              <div><strong>Tutor:</strong> {currentTutor?.full_name}</div>
              <div><strong>Orang Tua:</strong> {selectedStudent?.parent?.full_name}</div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-[11px]">
              <span className="font-bold block">Rekapitulasi:</span>
              <p className="mt-0.5">• Total Sesi: {studentSessions.length} Pertemuan</p>
              <p>• Kehadiran: 100% Aktif & Ceria</p>
            </div>

            <p className="text-[11px] text-slateNavy-600 italic">
              "Ananda menunjukkan lonjakan kemandirian membaca suku kata dan sangat percaya diri saat berhitung..."
            </p>
          </div>

          {/* HALAMAN 2 PREVIEW */}
          <div className="bg-white rounded-2xl border border-slateNavy-200 p-5 shadow-card space-y-4 text-xs">
            <div className="border-b border-pastelPink-500 pb-2 flex justify-between items-center text-[10px] text-pastelPink-600 font-bold uppercase">
              <span>Halaman 2 / 3: Calistung</span>
              <Badge variant="pink" size="sm">Tabel Rubrik</Badge>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px]">
                <strong className="text-blue-800 block mb-1">A. Aspek Membaca & Literasi:</strong>
                <p>• Mengenal alfabet: <span className="font-bold text-emerald-700">BSB</span></p>
                <p>• Menggabungkan suku kata: <span className="font-bold text-emerald-700">BSB</span></p>
                <p>• Membaca kalimat sederhana: <span className="font-bold text-blue-700">BSH</span></p>
              </div>

              <div className="p-2.5 rounded-xl bg-pink-50/70 border border-pink-200 text-[11px]">
                <strong className="text-pink-800 block mb-1">B. Aspek Menulis & Motorik:</strong>
                <p>• Tripod grip memegang pensil: <span className="font-bold text-blue-700">BSH</span></p>
                <p>• Menyalin kata rapi: <span className="font-bold text-amber-700">MB</span></p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px]">
                <strong className="text-emerald-800 block mb-1">C. Aspek Berhitung:</strong>
                <p>• Simbol angka 1-20: <span className="font-bold text-emerald-700">BSB</span></p>
                <p>• Penjumlahan konkret: <span className="font-bold text-blue-700">BSH</span></p>
              </div>
            </div>
          </div>

          {/* HALAMAN 3 PREVIEW */}
          <div className="bg-white rounded-2xl border border-slateNavy-200 p-5 shadow-card space-y-4 text-xs">
            <div className="border-b border-emerald-500 pb-2 flex justify-between items-center text-[10px] text-emerald-700 font-bold uppercase">
              <span>Halaman 3 / 3: Rekomendasi</span>
              <Badge variant="green" size="sm">Tanda Tangan</Badge>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <strong className="text-emerald-800 block">Pencapaian Hebat:</strong>
                <p className="mt-0.5 text-slateNavy-700">Kemandirian membaca meningkat pesat tanpa mengeja berlebih.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-100">
                <strong className="text-brand-800 block">Rekomendasi di Rumah:</strong>
                <p className="mt-0.5 text-slateNavy-700">Luangkan 10 menit bermain kartu kata bersama Ayah Bunda.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-cream-100 border border-slateNavy-100">
                <strong className="text-slateNavy-800 block">Target Berikutnya:</strong>
                <p className="mt-0.5 text-slateNavy-700">Pengenalan suku kata sengau dan penjumlahan 1-10.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slateNavy-100 flex justify-between text-[10px] text-slateNavy-500">
              <div>Wali Siswa: ( {selectedStudent?.parent?.full_name?.split(' ')[0]} )</div>
              <div>Tutor: ( {currentTutor?.full_name?.split(',')[0]} )</div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Reports History & WhatsApp Delivery Log */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-bold text-slateNavy-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <span>Riwayat Laporan & Distribusi ke Orang Tua</span>
        </h2>

        {reports.length === 0 ? (
          <p className="text-xs text-slateNavy-500 py-4 text-center">Belum ada laporan yang diterbitkan.</p>
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
                    <div className="flex items-center gap-2">
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
                          ? 'Terkirim ke Wali'
                          : rep.status === 'ready'
                          ? 'Siap Dikirim'
                          : 'Draf'}
                      </Badge>
                    </div>

                    <p className="text-slateNavy-500 text-[11px]">
                      File: {rep.file_path || 'Laporan_SyafaCourse.pdf'} • Dibuat pada:{' '}
                      {new Date(rep.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>

                    {latestLog && (
                      <p className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>
                          Status WhatsApp: {latestLog.status === 'sent' ? 'Sudah terkirim' : 'Tautan dibuka'} (
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

      {/* WhatsApp Dispatch Modal with Instructions */}
      <Modal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        title="Kirim Laporan PDF ke Orang Tua via WhatsApp"
        description="Siapkan pesan pengantar yang sopan dan buka tautan chat resmi."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instruksi Pengiriman Manual PDF:</span>
            </div>
            <p className="text-emerald-800">
              1. Unduh file PDF laporan ke perangkat Anda terlebih dahulu.
              <br />
              2. Klik tombol <strong>"Buka WhatsApp Orang Tua"</strong> di bawah untuk membuka chat dengan template pesan yang telah terisi.
              <br />
              3. Di aplikasi WhatsApp, lampirkan (attach) file PDF yang telah diunduh, lalu tekan Kirim.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
              Nomor WhatsApp Penerima
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slateNavy-200 bg-cream-50 text-xs font-mono text-slateNavy-800">
              <span>+{intlPhone}</span>
              <span className="text-slateNavy-400 font-sans">({parentName})</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
              Pratinjau Pesan Pengantar WhatsApp
            </label>
            <textarea
              rows={4}
              readOnly
              className="w-full rounded-xl border border-slateNavy-200 bg-white p-3 text-xs text-slateNavy-800 focus:outline-none"
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
                Tandai Terkirim
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
