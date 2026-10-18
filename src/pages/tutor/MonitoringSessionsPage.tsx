import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import {
  LearningSession,
  AssessmentLevel,
  StudentAssessment,
  ASSESSMENT_CONFIG,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  BookOpenCheck,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  PenTool,
  Calculator,
  Search,
  Check,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MonitoringSessionsPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();

  const myStudents = store.getTutorStudents();
  const sessions = store.getTutorSessions();
  const indicators = store.indicators;

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'draft' | 'finalized'>('all');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

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
    const student = myStudents.find((s) => s.id === ses.student_id);
    const matchStu = selectedStudentFilter === 'all' || ses.student_id === selectedStudentFilter;
    const matchSts = selectedStatusFilter === 'all' || ses.status === selectedStatusFilter;
    const matchSearch =
      !searchQuery.trim() ||
      (student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      ses.material.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStu && matchSts && matchSearch;
  });

  const handleOpenNewSession = () => {
    setEditingSessionId(null);
    setStudentId(myStudents[0]?.id || '');
    setSessionDate(new Date().toISOString().split('T')[0]);
    setDurationMinutes(60);
    setMaterial('');
    setObjectives('');
    setMethod('Flashcard kata, manipulasi benda konkret, buku garis tiga');
    setAchievements('');
    setDifficulties('');
    setTeacherNotes('');
    setHomeRecommendations('');
    setNextTargets('');

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
      setFormError('Untuk finalisasi, silakan isi Catatan Tutor / Evaluasi Observasi terlebih dahulu.');
      setActiveStep(5);
      return;
    }

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

  const countAssessed = (categoryList: typeof indicators) => {
    return categoryList.filter((ind) => assessmentState[ind.id]?.level && assessmentState[ind.id].level !== 'UNASSESSED').length;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl shadow-card bg-sageGreen text-navyInk-900 border border-slateGray-200 flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-deepSage shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slateGray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-navyInk-700">
              Evaluasi Formatif Calistung
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navyInk-700 tracking-tight mt-1">
            Monitoring & Evaluasi Hasil Belajar
          </h1>
          <p className="text-xs text-slateGray-500 mt-0.5">
            Catat hasil bimbingan membaca, menulis, berhitung, serta penilaian skala BB, MB, BSH, dan BSB.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenNewSession}
        >
          Catat Pertemuan Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white rounded-xl border border-slateGray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slateGray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama siswa atau materi yang diajarkan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slateGray-200 text-xs focus:outline-none focus:ring-1 focus:ring-navyInk-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slateGray-500">Siswa:</span>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="border border-slateGray-200 rounded-lg px-2.5 py-1.5 bg-white font-medium text-navyInk-700 focus:outline-none"
            >
              <option value="all">Semua Siswa ({myStudents.length})</option>
              {myStudents.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slateGray-500">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="border border-slateGray-200 rounded-lg px-2.5 py-1.5 bg-white font-medium text-navyInk-700 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="finalized">Difinalisasi</option>
              <option value="draft">Draf</option>
            </select>
          </div>
        </div>
      </div>

      {/* Session List: Desktop Table & Mobile Cards */}
      {filteredSessions.length === 0 ? (
        <div className="py-12 bg-white rounded-xl border border-slateGray-200 text-center space-y-2">
          <BookOpenCheck className="w-10 h-10 text-slateGray-300 mx-auto" />
          <h3 className="text-sm font-bold text-navyInk-700">Belum Ada Sesi yang Cocok</h3>
          <p className="text-xs text-slateGray-500 max-w-sm mx-auto">
            Tidak ditemukan sesi pembelajaran yang sesuai dengan kriteria filter saat ini.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={handleOpenNewSession}>
              Catat Sesi Sekarang
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slateGray-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slateGray-50 border-b border-slateGray-200 text-slateGray-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tanggal & Siswa</th>
                  <th className="py-3 px-4">Materi Pembelajaran</th>
                  <th className="py-3 px-4">Catatan Observasi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateGray-100">
                {filteredSessions.map((ses) => {
                  const student = myStudents.find((s) => s.id === ses.student_id);

                  return (
                    <tr key={ses.id} className="hover:bg-slateGray-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-navyInk-700 text-sm">{student?.full_name}</div>
                        <div className="text-[11px] text-slateGray-500">
                          {new Date(ses.session_date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          • {ses.duration_minutes}m
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-medium text-navyInk-800 line-clamp-1">{ses.material}</p>
                        {ses.method && <p className="text-[11px] text-slateGray-400 line-clamp-1">{ses.method}</p>}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        {ses.teacher_notes ? (
                          <p className="text-slateGray-600 line-clamp-2 italic">"{ses.teacher_notes}"</p>
                        ) : (
                          <span className="text-slateGray-400 text-[11px]">Tidak ada catatan khusus</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            ses.status === 'finalized'
                              ? 'bg-sageGreen text-deepSage'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {ses.status === 'finalized' ? 'Difinalisasi' : 'Draf'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditSession(ses)}
                        >
                          {ses.status === 'finalized' ? 'Lihat / Edit' : 'Lanjutkan Draf'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slateGray-100">
            {filteredSessions.map((ses) => {
              const student = myStudents.find((s) => s.id === ses.student_id);

              return (
                <div key={ses.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-navyInk-700 text-sm">{student?.full_name}</div>
                      <div className="text-[11px] text-slateGray-400">
                        {new Date(ses.session_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        ({ses.duration_minutes} Menit)
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ses.status === 'finalized'
                          ? 'bg-sageGreen text-deepSage'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {ses.status === 'finalized' ? 'Final' : 'Draf'}
                    </span>
                  </div>

                  <p className="text-slateGray-700">
                    <strong>Materi:</strong> {ses.material}
                  </p>

                  {ses.teacher_notes && (
                    <p className="text-slateGray-500 italic bg-slateGray-50 p-2 rounded">
                      "{ses.teacher_notes}"
                    </p>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditSession(ses)}
                    >
                      {ses.status === 'finalized' ? 'Lihat / Edit' : 'Lanjutkan Draf'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Multi-Step Monitoring Evaluation Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingSessionId ? 'Revisi Sesi Belajar & Evaluasi Calistung' : 'Catat Pertemuan Belajar & Evaluasi Calistung'}
        description="Isi informasi sesi, nilai indikator calistung, dan simpan catatan observasi nyata."
        maxWidth="3xl"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="flex border-b border-slateGray-200 pb-2 overflow-x-auto gap-1.5 text-xs">
            {[
              { num: 1, label: '1. Info Sesi', icon: Calendar },
              { num: 2, label: `2. Membaca (${countAssessed(readInds)}/${readInds.length})`, icon: BookOpen },
              { num: 3, label: `3. Menulis (${countAssessed(writeInds)}/${writeInds.length})`, icon: PenTool },
              { num: 4, label: `4. Berhitung (${countAssessed(mathInds)}/${mathInds.length})`, icon: Calculator },
              { num: 5, label: '5. Catatan Observasi', icon: FileCheck },
              { num: 6, label: '6. Ringkasan & Simpan', icon: CheckCircle2 },
            ].map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(step.num as any)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeStep === step.num
                    ? 'bg-navyInk-700 text-white'
                    : 'text-slateGray-600 hover:bg-slateGray-100'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>

          {/* STEP 1: INFORMASI SESI */}
          {activeStep === 1 && (
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-bold text-navyInk-700">Pilih Siswa *</label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs font-semibold text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                  >
                    {myStudents.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.full_name} ({stu.education_level})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-navyInk-700">Tanggal Sesi *</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-navyInk-700">Durasi Pembelajaran (Menit)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-navyInk-700">Metode / Media</label>
                  <input
                    type="text"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    placeholder="Contoh: Flashcard kata, benda konkret, buku garis tiga"
                    className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-navyInk-700">Materi yang Diajarkan Hari Ini *</label>
                <textarea
                  rows={3}
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Contoh: Suku kata 'ka-ki-ku', menyalin 3 kata di buku garis, berhitung kuantitas benda 1-10..."
                  className="w-full rounded-lg border border-slateGray-200 bg-white p-2.5 text-xs text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-navyInk-700">Tujuan Pembelajaran</label>
                <input
                  type="text"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Contoh: Ananda dapat membaca 5 kartu kata mandiri dan menulis nama sendiri..."
                  className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slateGray-100">
                <Button variant="primary" size="sm" onClick={() => setActiveStep(2)}>
                  Lanjut ke Penilaian Membaca →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2, 3, 4: CALISTUNG RUBRICS (Segmented Chip Controls) */}
          {(activeStep === 2 || activeStep === 3 || activeStep === 4) && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-warmCream rounded-lg border border-slateGray-200 flex items-center justify-between">
                <span className="font-bold text-navyInk-700">
                  Aspek {activeStep === 2 ? 'Membaca (Literasi)' : activeStep === 3 ? 'Menulis (Motorik)' : 'Berhitung (Numerasi)'}
                </span>
                <span className="text-[11px] text-slateGray-500">
                  Pilih: [○ BB] • [◑ MB] • [● BSH] • [★ BSB] • [— Belum Dinilai]
                </span>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {(activeStep === 2 ? readInds : activeStep === 3 ? writeInds : mathInds).map((ind) => {
                  const currentVal = assessmentState[ind.id] || { level: 'UNASSESSED', evidence: '' };

                  return (
                    <div
                      key={ind.id}
                      className="p-3.5 rounded-lg border border-slateGray-200 bg-white space-y-2 hover:border-navyInk-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-navyInk-700">{ind.indicator_name}</div>
                          {ind.description && (
                            <div className="text-[11px] text-slateGray-400 mt-0.5">{ind.description}</div>
                          )}
                        </div>

                        {/* Segmented accessible chips */}
                        <div className="flex items-center gap-1 shrink-0 flex-wrap">
                          {[
                            { lvl: 'BB', symbol: '○', label: 'BB' },
                            { lvl: 'MB', symbol: '◑', label: 'MB' },
                            { lvl: 'BSH', symbol: '●', label: 'BSH' },
                            { lvl: 'BSB', symbol: '★', label: 'BSB' },
                            { lvl: 'UNASSESSED', symbol: '—', label: 'Belum' },
                          ].map((opt) => {
                            const isSelected = currentVal.level === opt.lvl;
                            return (
                              <button
                                key={opt.lvl}
                                type="button"
                                onClick={() => handleAssessmentChange(ind.id, opt.lvl as AssessmentLevel)}
                                className={`px-2.5 py-1 rounded text-xs font-bold border transition-all ${
                                  isSelected
                                    ? 'bg-navyInk-700 text-white border-navyInk-700'
                                    : 'border-slateGray-200 text-slateGray-600 hover:bg-slateGray-50'
                                }`}
                              >
                                <span>{opt.symbol} {opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Evidence Notes */}
                      <input
                        type="text"
                        placeholder="Catatan observasi bukti konkret (opsional)..."
                        value={currentVal.evidence}
                        onChange={(e) => handleEvidenceChange(ind.id, e.target.value)}
                        className="w-full text-[11px] rounded border border-slateGray-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-navyInk-600 text-slateGray-700"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-3 border-t border-slateGray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveStep((activeStep - 1) as any)}
                >
                  ← Kembali
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveStep((activeStep + 1) as any)}
                >
                  Lanjut →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: CATATAN OBSERVASI & REKOMENDASI */}
          {activeStep === 5 && (
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-navyInk-700">
                  Catatan Observasi Tutor / Evaluasi Pertemuan *
                </label>
                <textarea
                  rows={3}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Tuliskan perkembangan spesifik, respon ananda terhadap materi, dan tingkat konsentrasi hari ini..."
                  className="w-full rounded-lg border border-slateGray-200 bg-white p-2.5 text-xs text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-emerald-800">Capaian Baik Hari Ini</label>
                  <textarea
                    rows={2}
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="Contoh: Cepat menghafal huruf vokal baru..."
                    className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-amber-800">Hal yang Perlu Dilatih</label>
                  <textarea
                    rows={2}
                    value={difficulties}
                    onChange={(e) => setDifficulties(e.target.value)}
                    placeholder="Contoh: Masih tertukar antara huruf b dan d..."
                    className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-navyInk-700">Rekomendasi Bermain di Rumah untuk Orang Tua</label>
                <textarea
                  rows={2}
                  value={homeRecommendations}
                  onChange={(e) => setHomeRecommendations(e.target.value)}
                  placeholder="Contoh: Luangkan waktu 10 menit bermain kartu kata bergambar sebelum tidur..."
                  className="w-full rounded-lg border border-slateGray-200 bg-white p-2.5 text-xs text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                />
              </div>

              <div className="flex justify-between pt-3 border-t border-slateGray-100">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(4)}>
                  ← Kembali ke Berhitung
                </Button>
                <Button variant="primary" size="sm" onClick={() => setActiveStep(6)}>
                  Periksa Ringkasan Sebelum Simpan →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: RINGKASAN & KONFIRMASI SIMPAN */}
          {activeStep === 6 && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slateGray-50 rounded-lg border border-slateGray-200 space-y-2">
                <h4 className="font-bold text-navyInk-700">Periksa Ringkasan Sesi Sebelum Menyimpan:</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong>Siswa:</strong> {myStudents.find((s) => s.id === studentId)?.full_name}</div>
                  <div><strong>Tanggal:</strong> {sessionDate} ({durationMinutes}m)</div>
                  <div><strong>Materi:</strong> {material}</div>
                  <div><strong>Indikator Dinilai:</strong> {countAssessed(indicators)} dari {indicators.length} kompetensi</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                <strong>Perbedaan Simpan Draf vs Finalisasi:</strong>
                <p className="mt-0.5">
                  • <strong>Simpan Draf:</strong> Data tersimpan aman dan masih dapat Anda lengkapi kapan saja.<br />
                  • <strong>Finalisasi:</strong> Sesi resmi disahkan, catatan observasi dikunci dan siap diintegrasikan ke Rapor Bulanan.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slateGray-100">
                <Button variant="outline" size="sm" onClick={() => setActiveStep(5)}>
                  ← Ubah Catatan
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave('draft')}
                  >
                    Simpan Draf
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
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
