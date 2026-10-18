import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import {
  LearningSession,
  AssessmentLevel,
  StudentAssessment,
  ASSESSMENT_CONFIG,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  BookOpenCheck,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  FileCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  BookOpen,
  PenTool,
  Calculator,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MonitoringSessionsPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();

  const myStudents = store.getTutorStudents();
  const sessions = store.getTutorSessions();
  const indicators = store.indicators;

  // Filter
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'draft' | 'finalized'>('all');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form Fields
  const [studentId, setStudentId] = useState(myStudents[0]?.id || '');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [material, setMaterial] = useState('');
  const [objectives, setObjectives] = useState('');
  const [method, setMethod] = useState('');
  const [achievements, setAchievements] = useState('');
  const [difficulties, setDifficulties] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [homeRecommendations, setHomeRecommendations] = useState('');
  const [nextTargets, setNextTargets] = useState('');

  // Assessment matrix: indicator_id -> { level, evidence }
  const [assessmentState, setAssessmentState] = useState<
    Record<string, { level: AssessmentLevel; evidence: string }>
  >({});

  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredSessions = sessions.filter((ses) => {
    const matchStu = selectedStudentFilter === 'all' || ses.student_id === selectedStudentFilter;
    const matchSts = selectedStatusFilter === 'all' || ses.status === selectedStatusFilter;
    return matchStu && matchSts;
  });

  const handleOpenNewSession = () => {
    setEditingSessionId(null);
    setStudentId(myStudents[0]?.id || '');
    setSessionDate(new Date().toISOString().split('T')[0]);
    setDurationMinutes(60);
    setMaterial('');
    setObjectives('');
    setMethod('Permainan flashcard, stiker apresiasi, dan manipulasi benda konkret.');
    setAchievements('');
    setDifficulties('');
    setTeacherNotes('');
    setHomeRecommendations('');
    setNextTargets('');

    // Default indicators to UNASSESSED
    const initialMap: Record<string, { level: AssessmentLevel; evidence: string }> = {};
    indicators.forEach((ind) => {
      initialMap[ind.id] = { level: 'UNASSESSED', evidence: '' };
    });
    setAssessmentState(initialMap);

    setActiveStep(1);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditSession = (ses: LearningSession) => {
    setEditingSessionId(ses.id);
    setStudentId(ses.student_id);
    setSessionDate(ses.session_date);
    setDurationMinutes(ses.duration_minutes);
    setMaterial(ses.material);
    setObjectives(ses.objectives || '');
    setMethod(ses.method || '');
    setAchievements(ses.achievements || '');
    setDifficulties(ses.difficulties || '');
    setTeacherNotes(ses.teacher_notes || '');
    setHomeRecommendations(ses.home_recommendations || '');
    setNextTargets(ses.next_targets || '');

    const map: Record<string, { level: AssessmentLevel; evidence: string }> = {};
    indicators.forEach((ind) => {
      const match = ses.assessments?.find((a) => a.indicator_id === ind.id);
      map[ind.id] = {
        level: match ? match.assessment_level : 'UNASSESSED',
        evidence: match?.evidence_notes || '',
      };
    });
    setAssessmentState(map);

    setActiveStep(1);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleAssessmentChange = (indicatorId: string, level: AssessmentLevel) => {
    setAssessmentState((prev) => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        level,
      },
    }));
  };

  const handleEvidenceChange = (indicatorId: string, evidence: string) => {
    setAssessmentState((prev) => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        evidence,
      },
    }));
  };

  const handleSave = (status: 'draft' | 'finalized') => {
    setFormError('');

    if (!studentId || !material.trim()) {
      setFormError('Siswa dan materi yang diajarkan wajib diisi.');
      setActiveStep(1);
      return;
    }

    if (status === 'finalized' && !teacherNotes.trim()) {
      setFormError('Untuk finalisasi, silakan isi Catatan Tutor / Evaluasi Akhir terlebih dahulu.');
      setActiveStep(5);
      return;
    }

    // Prepare assessments array
    const assessments: StudentAssessment[] = Object.entries(assessmentState).map(
      ([indId, val], idx) => ({
        id: `asm-${Date.now()}-${idx}`,
        session_id: editingSessionId || '',
        student_id: studentId,
        indicator_id: indId,
        assessment_level: val.level,
        evidence_notes: val.evidence,
      })
    );

    const saved = store.saveSession(
      {
        student_id: studentId,
        session_date: sessionDate,
        duration_minutes: durationMinutes,
        material: material.trim(),
        objectives: objectives.trim() || undefined,
        method: method.trim() || undefined,
        achievements: achievements.trim() || undefined,
        difficulties: difficulties.trim() || undefined,
        teacher_notes: teacherNotes.trim() || undefined,
        home_recommendations: homeRecommendations.trim() || undefined,
        next_targets: nextTargets.trim() || undefined,
        status,
        assessments,
      },
      editingSessionId || undefined
    );

    setIsFormModalOpen(false);
    showToast(
      status === 'finalized'
        ? `Sesi pembelajaran tanggal ${saved.session_date} berhasil difinalisasi!`
        : `Draf sesi pembelajaran berhasil disimpan.`
    );
  };

  const readInds = indicators.filter((i) => i.category === 'membaca');
  const writeInds = indicators.filter((i) => i.category === 'menulis');
  const mathInds = indicators.filter((i) => i.category === 'berhitung');

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
            Monitoring Calistung & Evaluasi
          </h1>
          <p className="text-sm text-slateNavy-500 mt-1">
            Pencatatan sesi bimbingan membaca, menulis, berhitung, serta penilaian formatif BB, MB, BSH, dan BSB.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenNewSession}
        >
          Catat Hasil Belajar Baru
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slateNavy-500">Filter Siswa:</span>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="rounded-xl border border-slateNavy-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slateNavy-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="all">Semua Siswa Saya</option>
              {myStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.education_level})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slateNavy-500">Status:</span>
            {(['all', 'finalized', 'draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatusFilter === st
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slateNavy-100 text-slateNavy-600 hover:bg-slateNavy-200'
                }`}
              >
                {st === 'all' ? 'Semua' : st === 'finalized' ? 'Difinalisasi' : 'Draf'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          title="Belum Ada Sesi Belajar Dicatat"
          description="Catat pertemuan pertama setelah Anda selesai mengajar untuk memantau kemajuan calistung anak."
          icon={<BookOpenCheck className="w-8 h-8" />}
          actionText="Catat Sesi Sekarang"
          onAction={handleOpenNewSession}
        />
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((ses) => {
            const isFinalized = ses.status === 'finalized';
            const student = myStudents.find((s) => s.id === ses.student_id);

            return (
              <Card key={ses.id} className="p-5 space-y-3" hoverEffect>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slateNavy-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm shrink-0">
                      {student?.full_name.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slateNavy-900">{student?.full_name}</span>
                        <Badge variant="blue" size="sm">
                          {student?.education_level}
                        </Badge>
                        <Badge variant={isFinalized ? 'green' : 'amber'} size="sm">
                          {isFinalized ? 'Selesai & Difinalisasi' : 'Draf Sementara'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slateNavy-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slateNavy-400" />
                          {new Date(ses.session_date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slateNavy-400" />
                          {ses.duration_minutes} Menit
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEditSession(ses)}
                    >
                      {isFinalized ? 'Revisi Evaluasi' : 'Lanjutkan Isi Draf'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/tutor/students/${ses.student_id}`)}
                    >
                      Lihat Profil
                    </Button>
                  </div>
                </div>

                {/* Content details */}
                <div className="space-y-2 text-xs text-slateNavy-700">
                  <div className="p-3 bg-cream-50 rounded-xl border border-slateNavy-100">
                    <span className="font-bold text-slateNavy-900 block text-[11px] uppercase">
                      Materi Diajarkan:
                    </span>
                    <p className="mt-0.5 text-slateNavy-800">{ses.material}</p>
                  </div>

                  {ses.teacher_notes && (
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-950">
                      <span className="font-bold block text-[10px] uppercase text-blue-800">
                        Catatan Tutor / Observasi:
                      </span>
                      <p className="mt-0.5">{ses.teacher_notes}</p>
                    </div>
                  )}

                  {ses.home_recommendations && (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-emerald-950">
                      <span className="font-bold block text-[10px] uppercase text-emerald-800">
                        Rekomendasi Belajar di Rumah untuk Orang Tua:
                      </span>
                      <p className="mt-0.5">{ses.home_recommendations}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Multi-Step Monitoring Evaluation Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingSessionId ? 'Edit / Revisi Sesi Belajar' : 'Catat Sesi Belajar & Evaluasi Calistung'}
        description="Lakukan penilaian formatif berdasarkan observasi nyata proses belajar ananda."
        maxWidth="3xl"
      >
        <div className="space-y-5">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Stepper Tabs */}
          <div className="flex border-b border-slateNavy-100 pb-2 overflow-x-auto gap-2">
            {[
              { num: 1, label: '1. Info Sesi', icon: Calendar },
              { num: 2, label: '2. Membaca', icon: BookOpen },
              { num: 3, label: '3. Menulis', icon: PenTool },
              { num: 4, label: '4. Berhitung', icon: Calculator },
              { num: 5, label: '5. Catatan & Tindak Lanjut', icon: FileCheck },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStep(step.num as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeStep === step.num
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'text-slateNavy-600 hover:bg-slateNavy-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* STEP 1: INFORMASI SESI */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
                    Pilih Siswa *
                  </label>
                  {myStudents.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                      <span>Belum ada siswa terdaftar.</span>
                      <button
                        type="button"
                        onClick={() => navigate('/tutor/students')}
                        className="font-bold underline text-brand-600 hover:text-brand-800"
                      >
                        Daftarkan Siswa
                      </button>
                    </div>
                  ) : (
                    <select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full rounded-xl border border-slateNavy-200 bg-white px-3 py-2.5 text-sm text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
                      required
                    >
                      {myStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name} ({s.education_level})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <Input
                  label="Tanggal Sesi *"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Durasi Pembelajaran (Menit)"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
                <Input
                  label="Metode / Media Pembelajaran"
                  placeholder="Contoh: Flashcard bergambar, kartu kata, plastisin"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
                  Materi yang Diajarkan Hari Ini *
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slateNavy-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Contoh: Suku kata 'ka-ki-ku', menyalin 3 kata di buku bergaris tiga, penjumlahan kuantitas benda 1-10..."
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Tujuan Pembelajaran"
                placeholder="Contoh: Ananda dapat membaca 5 kartu kata mandiri dan menulis nama sendiri..."
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
              />

              <div className="flex justify-between pt-3 border-t border-slateNavy-100">
                <span className="text-xs text-slateNavy-400">Lanjut ke evaluasi aspek calistung</span>
                <Button variant="primary" size="sm" onClick={() => setActiveStep(2)}>
                  Lanjut ke Penilaian Membaca
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2, 3, 4: CALISTUNG RUBRIC (Membaca, Menulis, Berhitung) */}
          {(activeStep === 2 || activeStep === 3 || activeStep === 4) && (
            <div className="space-y-4">
              <div className="p-3 bg-cream-50 rounded-2xl border border-slateNavy-200/60 text-xs flex items-center justify-between">
                <span className="font-bold text-slateNavy-800">
                  Aspek {activeStep === 2 ? 'Membaca' : activeStep === 3 ? 'Menulis' : 'Berhitung'}
                </span>
                <span className="text-slateNavy-500 text-[11px]">
                  Pilih: BB (Belum Berkembang) • MB (Mulai Berkembang) • BSH (Sesuai Harapan) • BSB (Sangat Baik)
                </span>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {(activeStep === 2 ? readInds : activeStep === 3 ? writeInds : mathInds).map((ind) => {
                  const currentVal = assessmentState[ind.id] || { level: 'UNASSESSED', evidence: '' };

                  return (
                    <div
                      key={ind.id}
                      className="p-3.5 rounded-2xl border border-slateNavy-100 bg-white space-y-2 hover:border-brand-200 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-slateNavy-900">{ind.indicator_name}</div>
                          {ind.description && (
                            <div className="text-[11px] text-slateNavy-400">{ind.description}</div>
                          )}
                        </div>

                        {/* 4 Scale Buttons + Unassessed */}
                        <div className="flex items-center gap-1 shrink-0">
                          {(['BB', 'MB', 'BSH', 'BSB', 'UNASSESSED'] as const).map((lvl) => {
                            const conf = ASSESSMENT_CONFIG[lvl];
                            const isSelected = currentVal.level === lvl;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleAssessmentChange(ind.id, lvl)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                  isSelected
                                    ? `${conf.bg} ${conf.color} ${conf.border} ring-2 ring-brand-400`
                                    : 'border-slateNavy-200 text-slateNavy-400 hover:bg-slateNavy-50'
                                }`}
                              >
                                {conf.short}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Evidence Notes */}
                      <input
                        type="text"
                        placeholder="Catatan bukti observasi (opsional, contoh: sangat lancar, ragu di huruf d)..."
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-slateNavy-100 bg-cream-50/50 text-slateNavy-800 placeholder:text-slateNavy-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                        value={currentVal.evidence}
                        onChange={(e) => handleEvidenceChange(ind.id, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-3 border-t border-slateNavy-100">
                <Button variant="outline" size="sm" onClick={() => setActiveStep((activeStep - 1) as any)}>
                  Kembali
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveStep((activeStep + 1) as any)}>
                  Lanjut Langkah Berikutnya
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: CATATAN & TINDAK LANJUT */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-800">
                    Pencapaian Belajar Hari Ini
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Contoh: Berhasil membaca 8 kartu suku kata tanpa mengeja..."
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Kesulitan yang Perlu Dilatih
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Contoh: Masih tertukar antara huruf b dan d saat menulis..."
                    value={difficulties}
                    onChange={(e) => setDifficulties(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
                  Catatan Tutor & Observasi Sikap Belajar *
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slateNavy-200 bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Contoh: Ananda sangat bersemangat, konsentrasi belajar meningkat saat menggunakan media kancing..."
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-800">
                  Rekomendasi Latihan di Rumah untuk Orang Tua
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/40 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="Contoh: Ajak ananda menunjuk benda berawalan huruf K dan latihan memegang pensil 10 menit..."
                  value={homeRecommendations}
                  onChange={(e) => setHomeRecommendations(e.target.value)}
                />
              </div>

              <Input
                label="Target Pertemuan Berikutnya"
                placeholder="Contoh: Pengenalan suku kata sengau 'nga' dan pengurangan sederhana 1-5"
                value={nextTargets}
                onChange={(e) => setNextTargets(e.target.value)}
              />

              {/* Action Buttons: Save Draft vs Finalize */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slateNavy-100">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(4)}>
                  Kembali ke Berhitung
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave('draft')}
                  >
                    Simpan Sebagai Draf
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<FileCheck className="w-4 h-4" />}
                    onClick={() => handleSave('finalized')}
                  >
                    Finalisasi Sesi Belajar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
