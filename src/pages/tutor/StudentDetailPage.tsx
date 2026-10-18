import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../lib/store';
import { ASSESSMENT_CONFIG, AssessmentLevel, EducationLevel } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  ArrowLeft,
  Calendar,
  Phone,
  BookOpenCheck,
  TrendingUp,
  FileText,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const EDUCATION_LEVELS: EducationLevel[] = [
  'PAUD',
  'TK A',
  'TK B',
  'SD Kelas 1',
  'SD Kelas 2',
  'SD Kelas 3',
  'SD Kelas 4',
  'SD Kelas 5',
  'SD Kelas 6',
];

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useAppStore();

  const student = store.getStudentById(id || '');
  const sessions = student ? store.getStudentSessions(student.id) : [];
  const attendances = student ? store.getStudentAttendances(student.id) : [];
  const indicators = store.indicators;

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'ringkasan' | 'sesi' | 'membaca' | 'menulis' | 'berhitung' | 'kehadiran' | 'catatan' | 'laporan'
  >('ringkasan');

  // Edit & Delete Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Form State
  const [editFullName, setEditFullName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editEducationLevel, setEditEducationLevel] = useState<EducationLevel>('TK A');
  const [editSchoolClass, setEditSchoolClass] = useState('');
  const [editLearningNeeds, setEditLearningNeeds] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentWhatsapp, setEditParentWhatsapp] = useState('');
  const [editParentRelationship, setEditParentRelationship] = useState<'Ayah' | 'Ibu' | 'Wali'>('Ibu');
  const [editFormError, setEditFormError] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenEdit = () => {
    if (!student) return;
    setEditFullName(student.full_name);
    setEditBirthDate(student.birth_date);
    setEditEducationLevel(student.education_level);
    setEditSchoolClass(student.school_class || '');
    setEditLearningNeeds(student.learning_needs || '');
    setEditParentName(student.parent?.full_name || '');
    setEditParentWhatsapp(student.parent?.whatsapp_number || '');
    setEditParentRelationship((student.parent_link?.relationship as 'Ayah' | 'Ibu' | 'Wali') || 'Ibu');
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setEditFormError('');

    if (!editFullName.trim() || !editBirthDate || !editParentName.trim() || !editParentWhatsapp.trim()) {
      setEditFormError('Mohon lengkapi nama siswa, tanggal lahir, nama wali, dan nomor WhatsApp.');
      return;
    }

    const cleanPhone = editParentWhatsapp.replace(/\s+/g, '');
    if (!/^(08|\+628|628)[0-9]{8,12}$/.test(cleanPhone)) {
      setEditFormError('Format nomor WhatsApp tidak valid. Gunakan format contoh: 08123456789 atau +628123456789.');
      return;
    }

    const result = store.updateStudentWithParent(student.id, {
      full_name: editFullName.trim(),
      birth_date: editBirthDate,
      education_level: editEducationLevel,
      school_class: editSchoolClass.trim(),
      learning_needs: editLearningNeeds.trim(),
      parent_name: editParentName.trim(),
      parent_whatsapp: cleanPhone,
      parent_relationship: editParentRelationship,
    });

    if (result.success) {
      setIsEditModalOpen(false);
      showToast(result.message, 'success');
    } else {
      setEditFormError(result.message);
    }
  };

  const handleConfirmDelete = () => {
    if (!student) return;
    const res = store.deleteStudent(student.id);
    setIsDeleteModalOpen(false);
    if (res.success) {
      navigate('/tutor/students');
    } else {
      showToast(res.message, 'error');
    }
  };

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="p-8 bg-white rounded-xl border border-slateGray-200 space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-navyInk-700">Siswa Tidak Ditemukan</h2>
          <p className="text-xs text-slateGray-500 max-w-sm mx-auto">
            Data siswa tidak ditemukan atau Anda tidak memiliki akses ke data siswa ini.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/tutor/students')}>
              Kembali ke Daftar Siswa
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Attendance stats
  const totalAtt = attendances.length;
  const presentCount = attendances.filter((a) => a.status === 'present').length;
  const permissionCount = attendances.filter((a) => a.status === 'permission').length;
  const sickCount = attendances.filter((a) => a.status === 'sick').length;
  const absentCount = attendances.filter((a) => a.status === 'absent').length;
  const attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

  // Calistung Indicators categorized
  const readIndicators = indicators.filter((i) => i.category === 'membaca');
  const writeIndicators = indicators.filter((i) => i.category === 'menulis');
  const mathIndicators = indicators.filter((i) => i.category === 'berhitung');

  // Chart data: Trend score for each domain over finalized sessions
  const finalizedSessions = sessions.filter((s) => s.status === 'finalized').reverse();

  const trendData = finalizedSessions.map((ses, idx) => {
    const asm = ses.assessments || [];
    const getAvg = (cat: 'membaca' | 'menulis' | 'berhitung') => {
      const catIndIds = new Set(indicators.filter((i) => i.category === cat).map((i) => i.id));
      const relevant = asm.filter((a) => catIndIds.has(a.indicator_id) && a.assessment_level !== 'UNASSESSED');
      if (relevant.length === 0) return null;
      const scoreSum = relevant.reduce((acc, curr) => acc + (ASSESSMENT_CONFIG[curr.assessment_level]?.score || 0), 0);
      return Number((scoreSum / relevant.length).toFixed(1));
    };

    return {
      sessionName: `Sesi ${idx + 1} (${new Date(ses.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`,
      Membaca: getAvg('membaca'),
      Menulis: getAvg('menulis'),
      Berhitung: getAvg('berhitung'),
    };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-top-5 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-sageGreen text-deepSage border-sageGreen-300'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-deepSage shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slateGray-200 pb-4">
        <button
          onClick={() => navigate('/tutor/students')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slateGray-600 hover:text-navyInk-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data Siswa</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit2 className="w-3.5 h-3.5 text-navyInk-700" />}
            onClick={handleOpenEdit}
            title="Edit data profil siswa & wali murid"
          >
            Edit Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
            onClick={() => setIsDeleteModalOpen(true)}
            title="Hapus data siswa ini secara permanen"
          >
            Hapus
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BookOpenCheck className="w-4 h-4 text-slateGray-600" />}
            onClick={() => navigate('/tutor/sessions')}
          >
            Input Sesi Baru
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => navigate('/tutor/reports')}
          >
            Buat Laporan PDF
          </Button>
        </div>
      </div>

      {/* Student Profile Clean Header */}
      <div className="bg-white rounded-xl border border-slateGray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-softBlue text-navyInk-700 font-bold flex items-center justify-center text-xl shrink-0">
            {student.full_name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-navyInk-700">{student.full_name}</h1>
              <Badge variant="blue" size="sm">{student.education_level}</Badge>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                  student.status === 'active' ? 'bg-sageGreen text-deepSage' : 'bg-slateGray-100 text-slateGray-600'
                }`}
              >
                {student.status === 'active' ? 'Aktif' : 'Arsip'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slateGray-500">
              <span className="font-mono text-navyInk-700 font-semibold">{student.student_code}</span>
              <span>•</span>
              <span>
                Lahir:{' '}
                {new Date(student.birth_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {student.school_class && (
                <>
                  <span>•</span>
                  <span>{student.school_class}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="flex items-center divide-x divide-slateGray-200 bg-slateGray-50 rounded-lg p-2.5 border border-slateGray-200 text-xs">
          <div className="px-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-slateGray-400 block">Total Sesi</span>
            <span className="text-base font-bold text-navyInk-700">{sessions.length}</span>
          </div>
          <div className="px-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-slateGray-400 block">Presensi</span>
            <span className="text-base font-bold text-deepSage">{attRate}%</span>
          </div>
          <div className="px-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-slateGray-400 block">Wali Murid</span>
            <span className="text-xs font-semibold text-navyInk-700 line-clamp-1">
              {student.parent?.full_name?.split(' ')[0] || 'Wali'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slateGray-200 overflow-x-auto">
        <div className="flex space-x-1 min-w-max pb-1">
          {[
            { key: 'ringkasan', label: 'Ringkasan' },
            { key: 'sesi', label: `Riwayat Sesi (${sessions.length})` },
            { key: 'membaca', label: 'Membaca' },
            { key: 'menulis', label: 'Menulis' },
            { key: 'berhitung', label: 'Berhitung' },
            { key: 'kehadiran', label: 'Kehadiran' },
            { key: 'catatan', label: 'Catatan Tutor' },
            { key: 'laporan', label: 'Laporan PDF' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-navyInk-700 text-white'
                  : 'text-slateGray-600 hover:bg-slateGray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Ringkasan */}
      {activeTab === 'ringkasan' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 bg-white rounded-xl border border-slateGray-200 p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-navyInk-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-navyInk-600" />
              <span>Tren Capaian Perkembangan Calistung</span>
            </h3>

            {trendData.length === 0 ? (
              <div className="text-center py-10 bg-slateGray-50 rounded-lg border border-dashed border-slateGray-200">
                <p className="text-xs text-slateGray-500">
                  Grafik tren capaian akan muncul secara otomatis setelah sesi pertama difinalisasi.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="sessionName" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.5rem',
                        backgroundColor: '#17365D',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="Membaca" stroke="#2A68B8" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Menulis" stroke="#DC644D" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Berhitung" stroke="#467F46" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {student.learning_needs && (
              <div className="p-3.5 rounded-lg bg-warmCream border border-slateGray-200 text-xs space-y-1">
                <span className="font-bold text-navyInk-700 uppercase tracking-wider text-[10px]">
                  Kebutuhan Belajar / Karakteristik Siswa:
                </span>
                <p className="text-slateGray-700 leading-relaxed">{student.learning_needs}</p>
              </div>
            )}
          </div>

          {/* Right Column: Profil Wali */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-3 text-xs">
              <h4 className="font-bold text-navyInk-700 uppercase tracking-wider text-[11px] border-b border-slateGray-100 pb-2">
                Informasi Orang Tua / Wali
              </h4>
              <div className="space-y-2 text-slateGray-600">
                <div className="flex justify-between">
                  <span className="text-slateGray-400">Nama:</span>
                  <span className="font-semibold text-navyInk-800">{student.parent?.full_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slateGray-400">Hubungan:</span>
                  <span>{student.parent_link?.relationship || 'Wali'}</span>
                </div>
                {student.parent?.whatsapp_number && (
                  <div className="flex justify-between items-center pt-2 border-t border-slateGray-100">
                    <span className="text-slateGray-400">WhatsApp:</span>
                    <a
                      href={`https://wa.me/${student.parent.whatsapp_number.replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-deepSage font-semibold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {student.parent.whatsapp_number}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-3 text-xs">
              <h4 className="font-bold text-navyInk-700 uppercase tracking-wider text-[11px] border-b border-slateGray-100 pb-2">
                Aksi Cepat Siswa
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate('/tutor/sessions')}
                >
                  <span>Catat Pertemuan Baru</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slateGray-400" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate('/tutor/reports')}
                >
                  <span>Susun Rapor Bulanan</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slateGray-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Riwayat Sesi */}
      {activeTab === 'sesi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navyInk-700">Riwayat Sesi Pembelajaran ({sessions.length})</h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<BookOpenCheck className="w-4 h-4" />}
              onClick={() => navigate('/tutor/sessions')}
            >
              Catat Sesi Baru
            </Button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slateGray-200">
              <p className="text-xs text-slateGray-500">Belum ada sesi pembelajaran yang dicatat untuk ananda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((ses) => (
                <div key={ses.id} className="bg-white rounded-xl border border-slateGray-200 p-4 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slateGray-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-navyInk-600 shrink-0" />
                      <span className="font-bold text-navyInk-700">
                        {new Date(ses.session_date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-slateGray-400 text-[11px]">({ses.duration_minutes} Menit)</span>
                    </div>

                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        ses.status === 'finalized' ? 'bg-sageGreen text-deepSage' : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {ses.status === 'finalized' ? 'Difinalisasi' : 'Draf'}
                    </span>
                  </div>

                  <div className="space-y-2 text-slateGray-700">
                    <div>
                      <span className="font-bold text-navyInk-700 block text-[11px] uppercase">Materi Pembelajaran:</span>
                      <p className="mt-0.5">{ses.material}</p>
                    </div>

                    {ses.achievements && (
                      <div className="p-2.5 bg-sageGreen/40 rounded-lg border border-sageGreen text-deepSage">
                        <span className="font-bold block text-[10px] uppercase">Pencapaian Belajar:</span>
                        <p className="mt-0.5">{ses.achievements}</p>
                      </div>
                    )}

                    {ses.difficulties && (
                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
                        <span className="font-bold block text-[10px] uppercase">Catatan Kendala / Butuh Pendampingan:</span>
                        <p className="mt-0.5">{ses.difficulties}</p>
                      </div>
                    )}

                    {ses.home_recommendations && (
                      <div className="p-2.5 bg-softBlue rounded-lg border border-navyInk-200 text-navyInk-800">
                        <span className="font-bold block text-[10px] uppercase">Rekomendasi Stimulasi di Rumah:</span>
                        <p className="mt-0.5">{ses.home_recommendations}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3, 4, 5: Calistung Evaluasi Matrix */}
      {(activeTab === 'membaca' || activeTab === 'menulis' || activeTab === 'berhitung') && (
        <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-navyInk-700 capitalize">
              Evaluasi Aspek {activeTab}
            </h3>
            <p className="text-xs text-slateGray-500 mt-0.5">
              Capaian berdasarkan evaluasi sesi belajar yang telah difinalisasi tutor.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slateGray-50 text-slateGray-600 font-bold uppercase tracking-wider text-[11px] border-b border-slateGray-200">
                <tr>
                  <th className="py-2.5 px-3">Indikator Kompetensi</th>
                  <th className="py-2.5 px-3">Status Terakhir</th>
                  <th className="py-2.5 px-3">Catatan Observasi Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateGray-100">
                {(activeTab === 'membaca' ? readIndicators : activeTab === 'menulis' ? writeIndicators : mathIndicators).map((ind) => {
                  let latestAssessment = null;
                  for (const ses of sessions) {
                    const match = ses.assessments?.find((a) => a.indicator_id === ind.id);
                    if (match && match.assessment_level !== 'UNASSESSED') {
                      latestAssessment = match;
                      break;
                    }
                  }

                  const level: AssessmentLevel = latestAssessment?.assessment_level || 'UNASSESSED';
                  const conf = ASSESSMENT_CONFIG[level];

                  return (
                    <tr key={ind.id} className="hover:bg-slateGray-50/70">
                      <td className="py-3 px-3 font-semibold text-navyInk-800">
                        {ind.indicator_name}
                        {ind.description && (
                          <span className="block text-[11px] text-slateGray-400 font-normal">{ind.description}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-[11px] border ${conf.bg} ${conf.color} ${conf.border}`}
                        >
                          {conf.label} ({conf.short})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slateGray-600 italic">
                        {latestAssessment?.evidence_notes || 'Belum diamati dalam sesi'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Kehadiran */}
      {activeTab === 'kehadiran' && (
        <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-navyInk-700">Rekapitulasi Kehadiran Siswa</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-lg bg-sageGreen text-deepSage border border-sageGreen-200">
              <span className="text-[11px] font-bold uppercase block">Hadir</span>
              <span className="text-xl font-bold mt-1 block">{presentCount}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-softBlue text-navyInk-700 border border-navyInk-200">
              <span className="text-[11px] font-bold uppercase block">Izin</span>
              <span className="text-xl font-bold mt-1 block">{permissionCount}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <span className="text-[11px] font-bold uppercase block">Sakit</span>
              <span className="text-xl font-bold mt-1 block">{sickCount}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              <span className="text-[11px] font-bold uppercase block">Alpa</span>
              <span className="text-xl font-bold mt-1 block">{absentCount}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slateGray-500">Log Presensi:</h4>
            {attendances.map((att) => (
              <div key={att.id} className="p-2.5 rounded-lg bg-slateGray-50 border border-slateGray-200 flex items-center justify-between text-xs">
                <span>{new Date(att.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="font-semibold text-navyInk-700">
                  {att.status === 'present' ? 'Hadir' : att.status === 'permission' ? 'Izin' : att.status === 'sick' ? 'Sakit' : 'Alpa'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Catatan Tutor */}
      {activeTab === 'catatan' && (
        <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-navyInk-700">Kumpulan Catatan Tutor & Rekomendasi</h3>
          {sessions.length === 0 ? (
            <p className="text-slateGray-500">Belum ada catatan.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((ses) => (
                <div key={ses.id} className="p-3.5 rounded-lg bg-slateGray-50 border border-slateGray-200 space-y-1.5">
                  <div className="flex items-center justify-between text-slateGray-500 text-[11px]">
                    <span className="font-bold text-navyInk-700">
                      Sesi: {new Date(ses.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span>{ses.duration_minutes} Menit</span>
                  </div>
                  {ses.teacher_notes && (
                    <p className="text-slateGray-700">
                      <strong className="text-navyInk-800">Observasi:</strong> {ses.teacher_notes}
                    </p>
                  )}
                  {ses.home_recommendations && (
                    <p className="text-navyInk-800 bg-softBlue p-2 rounded">
                      <strong>Rekomendasi di Rumah:</strong> {ses.home_recommendations}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Laporan PDF */}
      {activeTab === 'laporan' && (
        <div className="bg-white rounded-xl border border-slateGray-200 p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-navyInk-600 mx-auto" />
          <h3 className="font-bold text-base text-navyInk-700">Laporan Perkembangan Belajar Anak (Rapor)</h3>
          <p className="text-xs text-slateGray-500 max-w-md mx-auto">
            Hasilkan lembar rapor editorial 3 halaman resmi Bougenville Course yang personal, informatif, dan siap dikirim via WhatsApp.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => navigate('/tutor/reports')}
            >
              Buka Pembuat Laporan PDF
            </Button>
          </div>
        </div>
      )}

      {/* Modal Edit Data Siswa & Wali Murid */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Data Siswa & Wali Murid"
        description="Perbarui informasi profil siswa atau kontak orang tua/wali bimbingan Anda."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          {editFormError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{editFormError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Nama Lengkap Siswa *"
              placeholder="Contoh: Muhammad Kenzo Pratama"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              required
            />

            <Input
              label="Tanggal Lahir Anak *"
              type="date"
              value={editBirthDate}
              onChange={(e) => setEditBirthDate(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
                Jenjang Pembelajaran *
              </label>
              <select
                value={editEducationLevel}
                onChange={(e) => setEditEducationLevel(e.target.value as EducationLevel)}
                className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-800 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                required
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Nama Kelas / Asal Sekolah"
              placeholder="Contoh: TK B Kelompok Bintang / SDN 01"
              value={editSchoolClass}
              onChange={(e) => setEditSchoolClass(e.target.value)}
            />
          </div>

          <div className="pt-2 border-t border-slateGray-200">
            <h4 className="font-bold uppercase tracking-wider text-navyInk-700 mb-2.5 text-[11px]">
              Data Orang Tua / Wali Siswa
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px] mb-1">
                  Hubungan
                </label>
                <select
                  value={editParentRelationship}
                  onChange={(e) => setEditParentRelationship(e.target.value as any)}
                  className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-800 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                >
                  <option value="Ibu">Ibu</option>
                  <option value="Ayah">Ayah</option>
                  <option value="Wali">Wali</option>
                </select>
              </div>

              <div>
                <Input
                  label="Nama Wali *"
                  placeholder="Contoh: Bunda Rini"
                  value={editParentName}
                  onChange={(e) => setEditParentName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Input
                  label="No. WhatsApp *"
                  placeholder="081234567890"
                  value={editParentWhatsapp}
                  onChange={(e) => setEditParentWhatsapp(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
              Catatan Kebutuhan Belajar Siswa (Opsional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slateGray-200 bg-white p-2.5 text-xs text-navyInk-800 focus:outline-none focus:ring-1 focus:ring-navyInk-600 placeholder:text-slateGray-400"
              placeholder="Contoh: Belum mengenal huruf d dan b, menyukai belajar dengan media benda konkret..."
              value={editLearningNeeds}
              onChange={(e) => setEditLearningNeeds(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slateGray-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus Siswa */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Data Siswa"
        description="Tindakan ini permanen dan akan menghapus seluruh data siswa ini."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-800">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Peringatan Penghapusan Data Permanen</span>
            </div>
            <p className="leading-relaxed">
              Anda akan menghapus data siswa <strong className="font-semibold underline">{student.full_name}</strong> (Kode: {student.student_code}).
            </p>
            <p className="text-[11px] text-rose-700">
              Semua jadwal les, riwayat kehadiran, catatan perkembangan sesi calistung, dan laporan rapor yang telah dibuat untuk siswa ini akan terhapus dari sistem.
            </p>
          </div>

          <div className="bg-slateGray-50 border border-slateGray-200 rounded-lg p-3 space-y-1.5 text-slateGray-700">
            <div className="flex justify-between">
              <span className="text-slateGray-400">Jenjang:</span>
              <span className="font-semibold text-navyInk-800">{student.education_level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateGray-400">Wali Murid:</span>
              <span className="font-semibold text-navyInk-800">{student.parent?.full_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateGray-400">WhatsApp:</span>
              <span className="font-mono text-navyInk-800">{student.parent?.whatsapp_number || '-'}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slateGray-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batalkan
            </Button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-colors shadow-sm"
            >
              Ya, Hapus Permanen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
