import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Schedule, AttendanceStatus } from '../../types';
import { Button } from '../../components/ui/Button';
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
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg bg-sageGreen border border-sageGreen-300 text-deepSage flex items-center gap-2 animate-in slide-in-from-top-5">
          <CheckCircle2 className="w-5 h-5 text-deepSage shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slateGray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-navyInk-700">Bougenville Course</span>
            <span className="text-slateGray-300">•</span>
            <span className="text-slateGray-500">Agenda Pembelajaran</span>
          </div>
          <h1 className="text-2xl font-bold text-navyInk-700 tracking-tight">
            Jadwal Les & Kehadiran Siswa
          </h1>
          <p className="text-xs text-slateGray-500 mt-0.5">
            Kelola agenda pertemuan bimbingan calistung dan catat presensi siswa secara real-time.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
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
          icon={<Calendar className="w-8 h-8 text-slateGray-400" />}
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
              <div
                key={sch.id}
                className={`p-4 rounded-xl border border-slateGray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isCancelled ? 'opacity-50 bg-slateGray-50' : isCompleted ? 'border-sageGreen-300' : ''
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-softBlue text-navyInk-700 flex flex-col items-center justify-center text-center w-14 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {startDate.toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-none mt-0.5">
                      {startDate.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-navyInk-700">
                        {sch.student?.full_name || 'Siswa'}
                      </span>
                      <Badge variant="blue" size="sm">
                        {sch.student?.education_level}
                      </Badge>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isCompleted
                            ? 'bg-sageGreen text-deepSage'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-700'
                            : sch.status === 'rescheduled'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-softBlue text-navyInk-700'
                        }`}
                      >
                        {isCompleted
                          ? 'Selesai'
                          : isCancelled
                          ? 'Dibatalkan'
                          : sch.status === 'rescheduled'
                          ? 'Dijadwalkan Ulang'
                          : 'Terjadwal'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slateGray-500 font-medium">
                      <span className="flex items-center gap-1 text-slateGray-700">
                        <Clock className="w-3.5 h-3.5 text-slateGray-400" />
                        {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slateGray-400" />
                        {sch.location}
                      </span>
                    </div>

                    {sch.notes && <p className="text-[11px] text-slateGray-500 italic mt-0.5">{sch.notes}</p>}
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
                      leftIcon={<CalendarCheck className="w-3.5 h-3.5 text-deepSage" />}
                      onClick={() => navigate('/tutor/sessions')}
                    >
                      Buka Form Evaluasi
                    </Button>
                  )}
                </div>
              </div>
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
        <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
              Pilih Siswa *
            </label>
            {myStudents.length === 0 ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Belum ada siswa terdaftar.</span>
                <button
                  type="button"
                  onClick={() => navigate('/tutor/students')}
                  className="font-bold underline text-navyInk-700 hover:text-navyInk-900"
                >
                  Daftarkan Siswa
                </button>
              </div>
            ) : (
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-800 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
                required
              >
                {myStudents.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.full_name} ({stu.education_level})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
              Program Belajar
            </label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full rounded-lg border border-slateGray-200 bg-white p-2 text-xs text-navyInk-800 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
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
            placeholder="Contoh: Rumah Siswa / Ruang Belajar Bougenville"
          />

          <Input
            label="Catatan Pertemuan (Opsional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Materi yang akan disiapkan..."
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slateGray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
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
        <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
              Status Presensi *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'present', label: 'Hadir Belajar', color: 'bg-sageGreen text-deepSage border-sageGreen-300' },
                { val: 'permission', label: 'Izin', color: 'bg-softBlue text-navyInk-700 border-navyInk-200' },
                { val: 'sick', label: 'Sakit', color: 'bg-amber-50 text-amber-800 border-amber-300' },
                { val: 'absent', label: 'Alpa (Tanpa Kabar)', color: 'bg-rose-50 text-rose-800 border-rose-300' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAttStatus(opt.val as any)}
                  className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                    attStatus === opt.val ? `${opt.color} ring-1 ring-navyInk-600` : 'border-slateGray-200 bg-white text-slateGray-600'
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

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slateGray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAttendanceModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Presensi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
