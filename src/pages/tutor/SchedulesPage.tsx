import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Schedule, AttendanceStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  CalendarCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SchedulesPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();

  const myStudents = store.getTutorStudents();
  const schedules = store.getTutorSchedules();
  const programs = store.programs;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Form states
  const [studentId, setStudentId] = useState(myStudents[0]?.id || '');
  const [programId, setProgramId] = useState(programs[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [location, setLocation] = useState('Rumah Siswa');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Attendance Form
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('present');
  const [attNotes, setAttNotes] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!studentId || !date || !startTime || !endTime) {
      setFormError('Mohon lengkapi semua field yang diperlukan.');
      return;
    }

    const startDateTime = `${date}T${startTime}:00+07:00`;
    const endDateTime = `${date}T${endTime}:00+07:00`;

    if (new Date(endDateTime).getTime() <= new Date(startDateTime).getTime()) {
      setFormError('Waktu selesai harus lebih lambat daripada waktu mulai.');
      return;
    }

    // Conflict check for tutor schedule
    const hasConflict = schedules.some((s) => {
      if (s.status === 'cancelled') return false;
      const sStart = new Date(s.start_at).getTime();
      const sEnd = new Date(s.end_at).getTime();
      const newStart = new Date(startDateTime).getTime();
      const newEnd = new Date(endDateTime).getTime();
      return (newStart >= sStart && newStart < sEnd) || (newEnd > sStart && newEnd <= sEnd);
    });

    if (hasConflict) {
      setFormError('Peringatan: Terdapat bentrok dengan jadwal les lain pada rentang jam tersebut!');
      return;
    }

    store.createSchedule({
      student_id: studentId,
      program_id: programId,
      start_at: startDateTime,
      end_at: endDateTime,
      location: location.trim(),
      notes: notes.trim(),
    });

    setIsAddModalOpen(false);
    showToast('Jadwal les baru berhasil dibuat.');
  };

  const handleOpenAttendance = (sch: Schedule) => {
    setSelectedSchedule(sch);
    setAttStatus('present');
    setAttNotes('');
    setIsAttendanceModalOpen(true);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    store.recordAttendance({
      schedule_id: selectedSchedule.id,
      student_id: selectedSchedule.student_id,
      status: attStatus,
      notes: attNotes.trim() || undefined,
      date: selectedSchedule.start_at.split('T')[0],
    });

    setIsAttendanceModalOpen(false);
    showToast('Kehadiran siswa berhasil dicatat dan jadwal ditandai selesai.');
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
            Jadwal Les & Kehadiran
          </h1>
          <p className="text-sm text-slateNavy-500 mt-1">
            Kelola agenda pertemuan bimbingan calistung dan catat presensi siswa secara real-time.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setFormError('');
            setIsAddModalOpen(true);
          }}
        >
          Buat Jadwal Baru
        </Button>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <EmptyState
          title="Belum Ada Jadwal Les"
          description="Buat agenda pertemuan pertama dengan siswa Anda untuk memulai bimbingan belajar calistung."
          icon={<Calendar className="w-8 h-8" />}
          actionText="Buat Jadwal Baru"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {schedules.map((sch) => {
            const startDate = new Date(sch.start_at);
            const endDate = new Date(sch.end_at);
            const isCompleted = sch.status === 'completed';
            const isCancelled = sch.status === 'cancelled';

            return (
              <Card
                key={sch.id}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isCancelled ? 'opacity-50 bg-slateNavy-50' : isCompleted ? 'border-emerald-200' : ''
                }`}
                hoverEffect={!isCancelled}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-brand-50 text-brand-600 flex flex-col items-center justify-center text-center w-16 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                      {startDate.toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                    <span className="text-xl font-extrabold text-brand-900 leading-none mt-0.5">
                      {startDate.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slateNavy-900">
                        {sch.student?.full_name || 'Siswa'}
                      </span>
                      <Badge variant="blue" size="sm">
                        {sch.student?.education_level}
                      </Badge>
                      <Badge
                        variant={
                          isCompleted
                            ? 'green'
                            : isCancelled
                            ? 'rose'
                            : sch.status === 'rescheduled'
                            ? 'amber'
                            : 'blue'
                        }
                        size="sm"
                      >
                        {isCompleted
                          ? 'Selesai'
                          : isCancelled
                          ? 'Dibatalkan'
                          : sch.status === 'rescheduled'
                          ? 'Dijadwalkan Ulang'
                          : 'Terjadwal'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slateNavy-500 font-medium pt-1">
                      <span className="flex items-center gap-1.5 text-slateNavy-700">
                        <Clock className="w-3.5 h-3.5 text-slateNavy-400" />
                        {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slateNavy-400" />
                        {sch.location}
                      </span>
                    </div>

                    {sch.notes && <p className="text-xs text-slateNavy-500 italic mt-1">{sch.notes}</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  {!isCompleted && !isCancelled && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenAttendance(sch)}
                      >
                        Catat Kehadiran
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => store.updateScheduleStatus(sch.id, 'cancelled')}
                      >
                        Batalkan
                      </Button>
                    </>
                  )}

                  {isCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      onClick={() => navigate('/tutor/sessions')}
                    >
                      Buka Form Evaluasi
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Buat Jadwal Baru */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Buat Jadwal Les Baru"
        description="Pilih siswa, waktu pertemuan, dan lokasi bimbingan."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
              Pilih Siswa *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-xl border border-slateNavy-200 bg-white px-3.5 py-2.5 text-sm text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              required
            >
              {myStudents.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.full_name} ({stu.education_level})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
              Program Belajar
            </label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full rounded-xl border border-slateNavy-200 bg-white px-3.5 py-2.5 text-sm text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {programs.map((prg) => (
                <option key={prg.id} value={prg.id}>
                  {prg.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Tanggal Les *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jam Mulai *"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="Jam Selesai *"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <Input
            label="Lokasi Pembelajaran"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Contoh: Rumah Siswa / Ruang Belajar Syafa"
          />

          <Input
            label="Catatan Pertemuan (Opsional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Materi yang akan disiapkan..."
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slateNavy-100">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Input Presensi Kehadiran */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title="Catat Kehadiran Siswa"
        description={`Pertemuan untuk ${selectedSchedule?.student?.full_name}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAttendance} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
              Status Presensi *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'present', label: 'Hadir Belajar', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                { val: 'permission', label: 'Izin', color: 'bg-blue-50 text-blue-800 border-blue-300' },
                { val: 'sick', label: 'Sakit', color: 'bg-amber-50 text-amber-800 border-amber-300' },
                { val: 'absent', label: 'Alpa (Tanpa Kabar)', color: 'bg-rose-50 text-rose-800 border-rose-300' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAttStatus(opt.val as any)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    attStatus === opt.val ? `${opt.color} ring-2 ring-brand-400` : 'border-slateNavy-200 bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Catatan Presensi (Opsional)"
            placeholder="Contoh: Sangat tepat waktu dan antusias..."
            value={attNotes}
            onChange={(e) => setAttNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slateNavy-100">
            <Button variant="outline" type="button" onClick={() => setIsAttendanceModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Presensi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
