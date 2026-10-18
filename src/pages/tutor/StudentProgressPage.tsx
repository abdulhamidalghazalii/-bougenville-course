import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  TrendingUp,
  PieChart as PieIcon,
  Info,
  Calendar,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { useNavigate } from 'react-router-dom';

export const StudentProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useAppStore();
  const myStudents = store.getTutorStudents();
  const sessions = store.getTutorSessions();
  const indicators = store.indicators;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(myStudents[0]?.id || '');
  const selectedStudent = myStudents.find((s) => s.id === selectedStudentId) || myStudents[0];

  const studentSessions = selectedStudent
    ? sessions.filter((s) => s.student_id === selectedStudent.id && s.status === 'finalized').reverse()
    : [];

  // Line Chart: Trend over time for 3 domains
  const trendData = studentSessions.map((ses, idx) => {
    const asm = ses.assessments || [];
    const getAvg = (cat: 'membaca' | 'menulis' | 'berhitung') => {
      const catIndIds = new Set(indicators.filter((i) => i.category === cat).map((i) => i.id));
      const relevant = asm.filter((a) => catIndIds.has(a.indicator_id) && a.assessment_level !== 'UNASSESSED');
      if (relevant.length === 0) return null;
      const scoreSum = relevant.reduce((acc, curr) => {
        const map: Record<string, number> = { BB: 1, MB: 2, BSH: 3, BSB: 4 };
        return acc + (map[curr.assessment_level] || 0);
      }, 0);
      return Number((scoreSum / relevant.length).toFixed(1));
    };

    return {
      sessionName: `Sesi ${idx + 1} (${new Date(ses.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`,
      Membaca: getAvg('membaca'),
      Menulis: getAvg('menulis'),
      Berhitung: getAvg('berhitung'),
    };
  });

  // Pie Chart: Distribution of all assessed indicators in the latest finalized session
  const latestSession = studentSessions[studentSessions.length - 1];
  const latestAssessments = latestSession?.assessments || [];

  const bsbCount = latestAssessments.filter((a) => a.assessment_level === 'BSB').length;
  const bshCount = latestAssessments.filter((a) => a.assessment_level === 'BSH').length;
  const mbCount = latestAssessments.filter((a) => a.assessment_level === 'MB').length;
  const bbCount = latestAssessments.filter((a) => a.assessment_level === 'BB').length;

  const pieData = [
    { name: 'BSB (Berkembang Sangat Baik)', value: bsbCount, color: '#467F46' },
    { name: 'BSH (Berkembang Sesuai Harapan)', value: bshCount, color: '#2A68B8' },
    { name: 'MB (Mulai Berkembang)', value: mbCount, color: '#D97706' },
    { name: 'BB (Belum Berkembang)', value: bbCount, color: '#DC644D' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slateGray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-navyInk-700">Bougenville Course</span>
            <span className="text-slateGray-300">•</span>
            <span className="text-slateGray-500">Analitik Capaian</span>
          </div>
          <h1 className="text-2xl font-bold text-navyInk-700 tracking-tight">
            Grafik Perkembangan Belajar Siswa
          </h1>
          <p className="text-xs text-slateGray-500 mt-0.5">
            Visualisasi objektif capaian calistung berdasarkan catatan evaluasi nyata dari pertemuan ke pertemuan.
          </p>
        </div>

        {/* Student Selector */}
        {myStudents.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slateGray-500">Pilih Siswa:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-lg border border-slateGray-200 bg-white px-3 py-1.5 text-xs font-bold text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
            >
              {myStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.education_level})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Transparency Note */}
      <div className="p-3.5 rounded-lg bg-slateGray-100 border border-slateGray-200 text-xs text-slateGray-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-navyInk-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-navyInk-800">Pedoman Visualisasi Skor: </span>
          Skor numerik (1: BB, 2: MB, 3: BSH, 4: BSB) digunakan semata-mata untuk memvisualisasikan tren observasi pembelajaran tutor. Skor ini bukan tolok ukur psikometri ilmiah mutlak atas potensi anak, melainkan panduan perkembangan belajar yang memotivasi dan terukur.
        </div>
      </div>

      {studentSessions.length === 0 ? (
        <EmptyState
          title="Belum Ada Data Evaluasi"
          description="Siswa ini belum memiliki sesi pembelajaran yang difinalisasi. Grafik akan tampil secara otomatis setelah sesi pertama disimpan dan difinalisasi."
          icon={<TrendingUp className="w-8 h-8 text-slateGray-400" />}
          actionText="Input Hasil Belajar Sekarang"
          onAction={() => navigate('/tutor/sessions')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Trend Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slateGray-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slateGray-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-navyInk-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-navyInk-600" />
                  <span>Tren Capaian Tiga Aspek Calistung</span>
                </h3>
                <p className="text-xs text-slateGray-400 mt-0.5">Perkembangan nilai rata-rata dari setiap sesi bimbingan</p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-softBlue text-navyInk-700">
                {studentSessions.length} Sesi Final
              </span>
            </div>

            <div className="h-72 w-full pt-2">
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
          </div>

          {/* Donut Chart: Latest Distribution */}
          <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-4">
            <div className="border-b border-slateGray-100 pb-3">
              <h3 className="font-bold text-sm text-navyInk-700 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-navyInk-600" />
                <span>Distribusi Capaian Terakhir</span>
              </h3>
              <p className="text-xs text-slateGray-400 mt-0.5">
                Sesi:{' '}
                {latestSession?.session_date
                  ? new Date(latestSession.session_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-'}
              </p>
            </div>

            {pieData.length === 0 ? (
              <p className="text-xs text-slateGray-400 py-10 text-center">Belum ada indikator dinilai.</p>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-slateGray-100 text-xs">
              <div className="flex justify-between items-center text-deepSage">
                <span>Berkembang Sangat Baik (BSB):</span>
                <span className="font-bold">{bsbCount} Indikator</span>
              </div>
              <div className="flex justify-between items-center text-navyInk-700">
                <span>Berkembang Sesuai Harapan (BSH):</span>
                <span className="font-bold">{bshCount} Indikator</span>
              </div>
              <div className="flex justify-between items-center text-amber-700">
                <span>Mulai Berkembang (MB):</span>
                <span className="font-bold">{mbCount} Indikator</span>
              </div>
              <div className="flex justify-between items-center text-softCoral-500">
                <span>Belum Berkembang (BB):</span>
                <span className="font-bold">{bbCount} Indikator</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
