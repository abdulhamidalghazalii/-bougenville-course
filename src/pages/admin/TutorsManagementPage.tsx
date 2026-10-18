import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Profile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  UserPlus,
  Search,
  KeyRound,
  Power,
  Edit2,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const TutorsManagementPage: React.FC = () => {
  const store = useAppStore();
  const tutors = store.tutors;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Profile | null>(null);

  // Forms state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered tutors
  const filteredTutors = tutors.filter((t) => {
    const matchesSearch =
      t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterActive === 'all' ||
      (filterActive === 'active' && t.is_active) ||
      (filterActive === 'inactive' && !t.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !email.trim()) {
      setFormError('Nama lengkap dan alamat email wajib diisi.');
      return;
    }

    const res = store.createTutor({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    if (res.success) {
      setIsCreateOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      showToast(res.message, 'success');
    } else {
      setFormError(res.message);
    }
  };

  const handleOpenEdit = (tutor: Profile) => {
    setSelectedTutor(tutor);
    setFullName(tutor.full_name);
    setPhone(tutor.phone || '');
    setFormError('');
    setIsEditOpen(true);
  };

  const handleUpdateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor) return;

    if (!fullName.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }

    const res = store.updateTutor(selectedTutor.id, {
      full_name: fullName.trim(),
      phone: phone.trim(),
    });

    if (res.success) {
      setIsEditOpen(false);
      showToast(res.message, 'success');
    } else {
      setFormError(res.message);
    }
  };

  const handleToggleActive = (tutor: Profile) => {
    const res = store.toggleTutorActive(tutor.id);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleResetPassword = (tutor: Profile) => {
    const res = store.sendResetPassword(tutor.id);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
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
            Manajemen Akun Tutor
          </h1>
          <p className="text-sm text-slateNavy-500 mt-1">
            Buat akun tutor baru, kelola status aktif/nonaktif, dan kirimkan tautan reset kata sandi.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => {
            setFullName('');
            setEmail('');
            setPhone('');
            setFormError('');
            setIsCreateOpen(true);
          }}
        >
          Tambah Tutor Baru
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Cari nama atau email tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slateNavy-500 mr-1">Status:</span>
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterActive(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterActive === status
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                    : 'bg-slateNavy-100 text-slateNavy-600 hover:bg-slateNavy-200'
                }`}
              >
                {status === 'all' ? 'Semua' : status === 'active' ? 'Aktif' : 'Nonaktif'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tutor Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTutors.map((tutor) => (
          <Card key={tutor.id} className="p-5 flex flex-col justify-between" hoverEffect>
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-base shrink-0">
                    {tutor.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slateNavy-900 leading-tight">{tutor.full_name}</h3>
                    <Badge variant={tutor.is_active ? 'green' : 'rose'} size="sm" className="mt-1">
                      {tutor.is_active ? 'Akun Aktif' : 'Dinonaktifkan'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slateNavy-600 my-4 bg-cream-50/70 p-3 rounded-xl border border-slateNavy-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slateNavy-400 shrink-0" />
                  <span className="truncate">{tutor.email}</span>
                </div>
                {tutor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slateNavy-400 shrink-0" />
                    <span>{tutor.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slateNavy-400 text-[11px] pt-1 border-t border-slateNavy-100">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Login:{' '}
                    {tutor.last_sign_in_at
                      ? new Date(tutor.last_sign_in_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Belum pernah'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-3 border-t border-slateNavy-100 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => handleOpenEdit(tutor)}
              >
                Edit
              </Button>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  title="Kirim tautan reset kata sandi resmi"
                  leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                  onClick={() => handleResetPassword(tutor)}
                >
                  Reset
                </Button>

                <Button
                  variant={tutor.is_active ? 'danger' : 'success'}
                  size="sm"
                  title={tutor.is_active ? 'Nonaktifkan akun tutor' : 'Aktifkan akun tutor'}
                  leftIcon={<Power className="w-3.5 h-3.5" />}
                  onClick={() => handleToggleActive(tutor)}
                >
                  {tutor.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Tambah Tutor Baru */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Akun Tutor Baru"
        description="Akun tutor akan otomatis terhubung dengan otorisasi database Supabase."
      >
        <form onSubmit={handleCreateTutor} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Nama Lengkap & Gelar Tutor"
            placeholder="Contoh: Siti Nurhaliza, S.Pd"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Alamat Email Tutor"
            type="email"
            placeholder="contoh: sitinur@syafacourse.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Nomor WhatsApp (Opsional)"
            placeholder="081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-100 text-xs text-brand-800">
            <p className="font-bold">Keamanan Password:</p>
            <p className="mt-0.5">
              Sistem akan membuatkan kredensial aman di backend. Tutor akan menerima undangan login dan link pembuatan password pribadi ke email di atas.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slateNavy-100">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan & Daftarkan Tutor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Informasi Tutor */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Informasi Tutor"
        description={`Mengubah data akun untuk ${selectedTutor?.email}`}
      >
        <form onSubmit={handleUpdateTutor} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Nama Lengkap & Gelar Tutor"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Nomor WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slateNavy-100">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
