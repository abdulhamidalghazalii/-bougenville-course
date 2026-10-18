import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string; // Defaults to currentUser.id
  targetUserName?: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
}) => {
  const store = useAppStore();
  const currentUser = store.currentUser;
  const userId = targetUserId || currentUser?.id || '';
  const userName = targetUserName || currentUser?.full_name || 'Pengguna';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword) {
      setErrorMessage('Kata sandi saat ini wajib diisi.');
      return;
    }

    if (!newPassword) {
      setErrorMessage('Kata sandi baru wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('Kata sandi baru tidak boleh sama dengan kata sandi lama.');
      return;
    }

    setIsSubmitting(true);

    const result = store.changePassword(userId, currentPassword, newPassword);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      setErrorMessage(result.message);
    }

    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ubah Kata Sandi Akun"
      description={`Perbarui kredensial kata sandi untuk ${userName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-sageGreen text-deepSage border border-sageGreen-300 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-deepSage shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Current Password Field */}
        <div className="space-y-1">
          <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
            Kata Sandi Saat Ini *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slateGray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan kata sandi saat ini"
              required
              className="w-full rounded-lg border border-slateGray-200 bg-white pl-9 pr-9 py-2 text-xs text-navyInk-800 focus:outline-none focus:ring-1 focus:ring-navyInk-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slateGray-400 hover:text-navyInk-700"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password Field */}
        <div className="space-y-1">
          <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
            Kata Sandi Baru * (Min. 6 Karakter)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slateGray-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Buat kata sandi baru yang aman"
              required
              minLength={6}
              className="w-full rounded-lg border border-slateGray-200 bg-white pl-9 pr-9 py-2 text-xs text-navyInk-800 focus:outline-none focus:ring-1 focus:ring-navyInk-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slateGray-400 hover:text-navyInk-700"
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-1">
          <label className="block font-bold uppercase tracking-wider text-navyInk-700 text-[11px]">
            Konfirmasi Kata Sandi Baru *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slateGray-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              required
              minLength={6}
              className="w-full rounded-lg border border-slateGray-200 bg-white pl-9 pr-9 py-2 text-xs text-navyInk-800 focus:outline-none focus:ring-1 focus:ring-navyInk-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slateGray-400 hover:text-navyInk-700"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slateGray-100 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" type="button" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            Simpan Kata Sandi Baru
          </Button>
        </div>
      </form>
    </Modal>
  );
};
