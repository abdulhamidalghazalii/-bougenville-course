import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Student, EducationLevel } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  UserPlus,
  Search,
  Phone,
  Archive,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  BookOpenCheck,
  Edit2,
  Trash2,
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Add Form State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('2020-05-10');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('TK A');
  const [schoolClass, setSchoolClass] = useState('');
  const [learningNeeds, setLearningNeeds] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentWhatsapp, setParentWhatsapp] = useState('');
  const [parentRelationship, setParentRelationship] = useState<'Ayah' | 'Ibu' | 'Wali'>('Ibu');
  const [formError, setFormError] = useState('');

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

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
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
    if (!editingStudent) return;
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

    const result = store.updateStudentWithParent(editingStudent.id, {
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
      setEditingStudent(null);
      showToast(result.message, 'success');
    } else {
      setEditFormError(result.message);
    }
  };

  const handleOpenDelete = (student: Student) => {
    setDeletingStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingStudent) return;
    const res = store.deleteStudent(deletingStudent.id);
    setIsDeleteModalOpen(false);
    setDeletingStudent(null);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slateGray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-navyInk-700">Bougenville Course</span>
            <span className="text-slateGray-300">•</span>
            <span className="text-slateGray-500">Manajemen Siswa</span>
          </div>
          <h1 className="text-2xl font-bold text-navyInk-700 tracking-tight">
            Data Siswa Les Privat
          </h1>
          <p className="text-xs text-slateGray-500 mt-0.5">
            Kelola profil anak didik, data kontak wali murid, dan pantau riwayat perkembangan calistung.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
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
      <div className="bg-white rounded-xl border border-slateGray-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Cari nama, kode siswa, atau nama wali..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slateGray-400" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Jenjang Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slateGray-500">Jenjang:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-lg border border-slateGray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navyInk-700 focus:outline-none focus:ring-1 focus:ring-navyInk-600"
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
          <div className="flex items-center gap-1">
            {(['active', 'archived', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === st
                    ? 'bg-navyInk-700 text-white'
                    : 'bg-slateGray-100 text-slateGray-600 hover:bg-slateGray-200'
                }`}
              >
                {st === 'active' ? 'Aktif' : st === 'archived' ? 'Arsip' : 'Semua'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Students Data Display: Table on Desktop, Compact Cards on Mobile */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="Tidak Ada Siswa Ditemukan"
          description="Belum ada siswa yang sesuai dengan filter pencarian ini. Silakan tambah siswa baru atau ubah kata kunci pencarian."
          icon={<GraduationCap className="w-8 h-8 text-slateGray-400" />}
          actionText="Tambah Siswa Baru"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slateGray-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slateGray-50 border-b border-slateGray-200 text-slateGray-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Siswa</th>
                  <th className="py-3 px-4">Jenjang & Kelas</th>
                  <th className="py-3 px-4">Wali Murid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateGray-100">
                {filteredStudents.map((student) => {
                  const birthDateFormatted = new Date(student.birth_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const isArchived = student.status === 'archived';

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slateGray-50/70 transition-colors ${
                        isArchived ? 'opacity-60 bg-slateGray-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-softBlue text-navyInk-700 font-bold flex items-center justify-center text-sm shrink-0">
                            {student.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-navyInk-700 text-sm">{student.full_name}</div>
                            <div className="text-[11px] font-mono text-slateGray-400 mt-0.5">
                              {student.student_code} • Lahir: {birthDateFormatted}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="blue" size="sm">
                            {student.education_level}
                          </Badge>
                          {student.school_class && (
                            <span className="text-slateGray-500 text-[11px]">{student.school_class}</span>
                          )}
                        </div>
                        {student.learning_needs && (
                          <p className="text-[11px] text-slateGray-400 mt-1 max-w-xs truncate" title={student.learning_needs}>
                            Catatan: {student.learning_needs}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-navyInk-800">
                          {student.parent?.full_name || '-'} ({student.parent_link?.relationship || 'Wali'})
                        </div>
                        {student.parent?.whatsapp_number && (
                          <a
                            href={`https://wa.me/${student.parent.whatsapp_number.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {student.parent.whatsapp_number}
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            isArchived
                              ? 'bg-slateGray-100 text-slateGray-600'
                              : 'bg-sageGreen text-deepSage'
                          }`}
                        >
                          {isArchived ? 'Arsip' : 'Aktif'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => navigate(`/tutor/students/${student.id}`)}
                            title="Lihat Profil & Rapor"
                          >
                            Detail
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEdit(student)}
                            title="Edit data siswa & wali murid"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<BookOpenCheck className="w-3.5 h-3.5" />}
                            onClick={() => navigate('/tutor/sessions')}
                            title="Catat sesi belajar siswa ini"
                          >
                            Catat Sesi
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={isArchived ? 'Pulihkan siswa ke status aktif' : 'Arsipkan siswa'}
                            onClick={() => handleToggleArchive(student)}
                          >
                            {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Hapus siswa permanen"
                            onClick={() => handleOpenDelete(student)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slateGray-100">
            {filteredStudents.map((student) => {
              const birthDateFormatted = new Date(student.birth_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const isArchived = student.status === 'archived';

              return (
                <div key={student.id} className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-softBlue text-navyInk-700 font-bold flex items-center justify-center text-sm shrink-0">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-navyInk-700 text-sm leading-tight">{student.full_name}</div>
                        <span className="text-[11px] font-mono text-slateGray-400 block mt-0.5">
                          {student.student_code}
                        </span>
                      </div>
                    </div>
                    <Badge variant={isArchived ? 'slate' : 'blue'} size="sm">
                      {student.education_level}
                    </Badge>
                  </div>

                  <div className="bg-slateGray-50 p-2.5 rounded-lg space-y-1 text-slateGray-600 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slateGray-400">Lahir:</span>
                      <span>{birthDateFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slateGray-400">Wali ({student.parent_link?.relationship || 'Ortu'}):</span>
                      <span className="font-medium text-navyInk-800">{student.parent?.full_name || '-'}</span>
                    </div>
                    {student.parent?.whatsapp_number && (
                      <div className="flex justify-between">
                        <span className="text-slateGray-400">WhatsApp:</span>
                        <a
                          href={`https://wa.me/${student.parent.whatsapp_number.replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-700"
                        >
                          {student.parent.whatsapp_number}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/tutor/students/${student.id}`)}
                    >
                      Detail
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEdit(student)}
                      title="Edit Data"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title={isArchived ? 'Pulihkan siswa' : 'Arsipkan siswa'}
                      onClick={() => handleToggleArchive(student)}
                    >
                      {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      title="Hapus data siswa"
                      onClick={() => handleOpenDelete(student)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
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
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
                Jenjang Pembelajaran *
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
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
              value={schoolClass}
              onChange={(e) => setSchoolClass(e.target.value)}
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
                  value={parentRelationship}
                  onChange={(e) => setParentRelationship(e.target.value as any)}
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
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                />
              </div>

              <div>
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

          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
              Catatan Kebutuhan Belajar Awal (Opsional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slateGray-200 bg-white p-2.5 text-xs text-navyInk-800 focus:outline-none focus:ring-1 focus:ring-navyInk-600 placeholder:text-slateGray-400"
              placeholder="Contoh: Belum mengenal huruf d dan b, menyukai belajar dengan media benda konkret..."
              value={learningNeeds}
              onChange={(e) => setLearningNeeds(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slateGray-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Siswa
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Data Siswa & Wali Murid */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStudent(null);
        }}
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
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingStudent(null);
              }}
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
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingStudent(null);
        }}
        title="Konfirmasi Hapus Data Siswa"
        description="Tindakan ini permanen dan akan menghapus semua catatan terkait."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-800">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Peringatan Penghapusan Data Permanen</span>
            </div>
            <p className="leading-relaxed">
              Anda akan menghapus data siswa <strong className="font-semibold underline">{deletingStudent?.full_name}</strong> (Kode: {deletingStudent?.student_code}).
            </p>
            <p className="text-[11px] text-rose-700">
              Semua jadwal les, riwayat kehadiran, catatan perkembangan sesi calistung, dan laporan rapor yang telah dibuat untuk siswa ini akan terhapus dari sistem.
            </p>
          </div>

          {deletingStudent && (
            <div className="bg-slateGray-50 border border-slateGray-200 rounded-lg p-3 space-y-1.5 text-slateGray-700">
              <div className="flex justify-between">
                <span className="text-slateGray-400">Jenjang:</span>
                <span className="font-semibold text-navyInk-800">{deletingStudent.education_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slateGray-400">Wali Murid:</span>
                <span className="font-semibold text-navyInk-800">{deletingStudent.parent?.full_name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slateGray-400">WhatsApp:</span>
                <span className="font-mono text-navyInk-800">{deletingStudent.parent?.whatsapp_number || '-'}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slateGray-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingStudent(null);
              }}
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
