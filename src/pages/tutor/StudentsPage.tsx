import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Student, EducationLevel } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  UserPlus,
  Search,
  Filter,
  Calendar,
  Phone,
  Archive,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export const StudentsPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();
  const myStudents = store.getTutorStudents();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'archived'>('active');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('2020-05-10');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('TK A');
  const [schoolClass, setSchoolClass] = useState('');
  const [learningNeeds, setLearningNeeds] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentWhatsapp, setParentWhatsapp] = useState('');
  const [parentRelationship, setParentRelationship] = useState<'Ayah' | 'Ibu' | 'Wali'>('Ibu');
  const [formError, setFormError] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter students
  const filteredStudents = myStudents.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.parent?.full_name && s.parent.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = selectedLevel === 'all' || s.education_level === selectedLevel;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && s.status === 'active') ||
      (selectedStatus === 'archived' && s.status === 'archived');
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !birthDate || !parentName.trim() || !parentWhatsapp.trim()) {
      setFormError('Mohon lengkapi nama siswa, tanggal lahir, nama wali, dan nomor WhatsApp.');
      return;
    }

    // Indonesian phone validation tolerance: 08xxx or +62xxx
    const cleanPhone = parentWhatsapp.replace(/\s+/g, '');
    if (!/^(08|\+628|628)[0-9]{8,12}$/.test(cleanPhone)) {
      setFormError('Format nomor WhatsApp tidak valid. Gunakan format contoh: 08123456789 atau +628123456789.');
      return;
    }

    try {
      const created = store.createStudent({
        full_name: fullName.trim(),
        birth_date: birthDate,
        education_level: educationLevel,
        school_class: schoolClass.trim(),
        learning_needs: learningNeeds.trim(),
        parent_name: parentName.trim(),
        parent_whatsapp: cleanPhone,
        parent_relationship: parentRelationship,
      });

      setIsAddModalOpen(false);
      setFullName('');
      setSchoolClass('');
      setLearningNeeds('');
      setParentName('');
      setParentWhatsapp('');
      showToast(`Data siswa ${created.full_name} (${created.student_code}) berhasil didaftarkan.`, 'success');
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data siswa.');
    }
  };

  const handleToggleArchive = (student: Student) => {
    if (student.status === 'active') {
      store.archiveStudent(student.id);
      showToast(`Siswa ${student.full_name} diarsipkan. Riwayat belajar tetap aman tersimpan.`, 'success');
    } else {
      store.restoreStudent(student.id);
      showToast(`Siswa ${student.full_name} dikembalikan ke status aktif.`, 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-5 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 tracking-tight">
            Data Siswa Les Privat
          </h1>
          <p className="text-sm text-slateNavy-500 mt-1">
            Kelola profil siswa, kontak wali murid, dan riwayat perkembangan calistung.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => {
            setFormError('');
            setIsAddModalOpen(true);
          }}
        >
          Daftarkan Siswa Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Cari nama, kode siswa, atau nama wali..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Jenjang Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slateNavy-500">Jenjang:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-xl border border-slateNavy-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slateNavy-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="all">Semua Jenjang</option>
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs font-semibold text-slateNavy-500">Status:</span>
            {(['active', 'archived', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === st
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slateNavy-100 text-slateNavy-600 hover:bg-slateNavy-200'
                }`}
              >
                {st === 'active' ? 'Aktif' : st === 'archived' ? 'Arsip' : 'Semua'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="Tidak Ada Siswa Ditemukan"
          description="Belum ada siswa yang sesuai dengan filter pencarian ini. Silakan tambah siswa baru atau ubah kata kunci."
          icon={<GraduationCap className="w-8 h-8" />}
          actionText="Tambah Siswa Baru"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            const birthDateFormatted = new Date(student.birth_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const isArchived = student.status === 'archived';

            return (
              <Card
                key={student.id}
                className={`p-5 flex flex-col justify-between transition-all ${
                  isArchived ? 'opacity-70 bg-slateNavy-50/50' : ''
                }`}
                hoverEffect
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-100 to-pastelPink-100 text-brand-700 font-extrabold flex items-center justify-center text-lg border border-white shadow-sm shrink-0">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slateNavy-900 leading-tight">
                            {student.full_name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono text-brand-600 font-semibold block mt-0.5">
                          {student.student_code}
                        </span>
                      </div>
                    </div>

                    <Badge variant={isArchived ? 'slate' : 'blue'} size="sm">
                      {student.education_level}
                    </Badge>
                  </div>

                  {/* Info Blocks */}
                  <div className="space-y-2 text-xs text-slateNavy-600 my-4 bg-cream-50/80 p-3.5 rounded-2xl border border-slateNavy-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slateNavy-400">Tgl Lahir:</span>
                      <span className="font-medium text-slateNavy-800">{birthDateFormatted}</span>
                    </div>
                    {student.school_class && (
                      <div className="flex items-center justify-between">
                        <span className="text-slateNavy-400">Kelas/Sekolah:</span>
                        <span className="font-medium text-slateNavy-800">{student.school_class}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slateNavy-100">
                      <span className="text-slateNavy-400">Wali ({student.parent_link?.relationship || 'Ortu'}):</span>
                      <span className="font-semibold text-slateNavy-900">{student.parent?.full_name || '-'}</span>
                    </div>
                    {student.parent?.whatsapp_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-slateNavy-400">WhatsApp:</span>
                        <a
                          href={`https://wa.me/${student.parent.whatsapp_number.replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {student.parent.whatsapp_number}
                        </a>
                      </div>
                    )}
                  </div>

                  {student.learning_needs && (
                    <div className="mb-4 text-xs text-slateNavy-500 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                      <span className="font-semibold text-amber-800 block text-[10px] uppercase">Catatan Kebutuhan:</span>
                      <p className="line-clamp-2 mt-0.5">{student.learning_needs}</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slateNavy-100 flex items-center justify-between gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/tutor/students/${student.id}`)}
                  >
                    Detail & Perkembangan
                  </Button>

                  <Button
                    variant={isArchived ? 'outline' : 'ghost'}
                    size="sm"
                    title={isArchived ? 'Pulihkan siswa ke status aktif' : 'Arsipkan siswa'}
                    leftIcon={isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    onClick={() => handleToggleArchive(student)}
                  >
                    {isArchived ? 'Pulihkan' : 'Arsip'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Siswa Baru */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Daftarkan Siswa Les Baru"
        description="Lengkapi data siswa dan kontak orang tua untuk pengiriman laporan berkala."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap Siswa *"
              placeholder="Contoh: Muhammad Kenzo Pratama"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Tanggal Lahir Anak *"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
                Jenjang Pembelajaran *
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                className="w-full rounded-xl border border-slateNavy-200 bg-white px-3.5 py-2.5 text-sm text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
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
              value={schoolClass}
              onChange={(e) => setSchoolClass(e.target.value)}
            />
          </div>

          <div className="pt-2 border-t border-slateNavy-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-3">
              Data Orang Tua / Wali Siswa
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700 mb-1.5">
                  Hubungan
                </label>
                <select
                  value={parentRelationship}
                  onChange={(e) => setParentRelationship(e.target.value as any)}
                  className="w-full rounded-xl border border-slateNavy-200 bg-white px-3 py-2.5 text-sm text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="Ibu">Ibu</option>
                  <option value="Ayah">Ayah</option>
                  <option value="Wali">Wali</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <Input
                  label="Nama Wali *"
                  placeholder="Contoh: Bunda Rini"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <Input
                  label="No. WhatsApp *"
                  placeholder="081234567890"
                  value={parentWhatsapp}
                  onChange={(e) => setParentWhatsapp(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
              Catatan Kebutuhan Belajar Awal (Opsional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-slateNavy-200 bg-white p-3 text-sm text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-slateNavy-400"
              placeholder="Contoh: Belum mengenal huruf d dan b, menyukai belajar dengan media gambar hewan..."
              value={learningNeeds}
              onChange={(e) => setLearningNeeds(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slateNavy-100">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Siswa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
