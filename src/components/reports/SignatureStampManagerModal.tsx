import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  FileSignature,
  Stamp,
  Upload,
  Eraser,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  Info,
  PenTool,
} from 'lucide-react';

export interface SignatureStampManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signature' | 'stamp';
  onUpdated?: () => void;
}

export const SignatureStampManagerModal: React.FC<SignatureStampManagerModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'signature',
  onUpdated,
}) => {
  const store = useAppStore();
  const currentUser = store.currentUser;

  const [activeTab, setActiveTab] = useState<'signature' | 'stamp'>(defaultTab);

  // Signature state
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw'>('upload');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stamp state
  const [stampData, setStampData] = useState<string | null>(null);

  // Feedback messages
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing data on modal open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSignatureData(store.getTutorSignature());
      setStampData(store.getCourseStamp());
      setFeedback(null);
    }
  }, [isOpen, defaultTab, store]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Canvas drawing handlers (mouse & touch)
  const getCanvasPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getCanvasPos(e.nativeEvent, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    e.preventDefault();
    const pos = getCanvasPos(e.nativeEvent, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#17365D'; // Navy Ink pen color
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  // Helper to process uploaded file with canvas resize for optimal performance
  const processImageFile = (file: File, callback: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      showNotification('Format file tidak didukung. Mohon pilih gambar PNG, JPG, atau WEBP.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 500;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);
        const optimizedUrl = offscreen.toDataURL('image/png');
        callback(optimizedUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => {
        setSignatureData(dataUrl);
        showNotification('Foto tanda tangan berhasil dimuat.', 'success');
      });
    }
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => {
        setStampData(dataUrl);
        showNotification('Gambar cap Bougenville Course berhasil dimuat.', 'success');
      });
    }
  };

  const handleSaveSignature = () => {
    store.setTutorSignature(signatureData);
    showNotification('Tanda tangan tutor berhasil disimpan dan aktif pada laporan PDF!', 'success');
    if (onUpdated) onUpdated();
  };

  const handleDeleteSignature = () => {
    setSignatureData(null);
    clearCanvas();
    store.setTutorSignature(null);
    showNotification('Tanda tangan tutor telah dihapus dari sistem.', 'success');
    if (onUpdated) onUpdated();
  };

  const handleSaveStamp = () => {
    store.setCourseStamp(stampData);
    showNotification('Cap resmi Bougenville Course berhasil disimpan dan aktif pada laporan PDF!', 'success');
    if (onUpdated) onUpdated();
  };

  const handleDeleteStamp = () => {
    setStampData(null);
    store.setCourseStamp(null);
    showNotification('Cap khusus dihapus. Rapor akan kembali menggunakan cap stempel vektor standar.', 'success');
    if (onUpdated) onUpdated();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atur Tanda Tangan Tutor & Cap Lembaga"
      description="Kelola tanda tangan pengajar dan stempel resmi Bougenville Course untuk dicetak pada lembar rapor bulanan siswa."
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs">
        {/* Notification Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-lg border flex items-center gap-2 animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-sageGreen text-deepSage border-sageGreen-300'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-deepSage shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.text}</span>
          </div>
        )}

        {/* Tab Headers */}
        <div className="flex border-b border-slateGray-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('signature')}
            className={`px-3.5 py-2 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'signature'
                ? 'border-navyInk-700 text-navyInk-700 bg-softBlue/30 rounded-t-lg'
                : 'border-transparent text-slateGray-500 hover:text-navyInk-700'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>Tanda Tangan Tutor</span>
            {store.getTutorSignature() && (
              <span className="w-2 h-2 rounded-full bg-deepSage" title="Aktif" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stamp')}
            className={`px-3.5 py-2 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'stamp'
                ? 'border-navyInk-700 text-navyInk-700 bg-softBlue/30 rounded-t-lg'
                : 'border-transparent text-slateGray-500 hover:text-navyInk-700'
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span>Cap Bougenville Course</span>
            {store.getCourseStamp() && (
              <span className="w-2 h-2 rounded-full bg-deepSage" title="Kustom Aktif" />
            )}
          </button>
        </div>

        {/* TAB 1: TANDA TANGAN TUTOR */}
        {activeTab === 'signature' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-navyInk-700 text-sm">Tanda Tangan Pengajar</h4>
                <p className="text-[11px] text-slateGray-500">
                  Tanda tangan ini akan dicetak otomatis di bagian kanan bawah Halaman 3 rapor bulanan atas nama{' '}
                  <strong className="text-navyInk-800">{currentUser?.full_name}</strong>.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-slateGray-100 p-0.5 rounded-lg border border-slateGray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setSignatureMode('upload')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    signatureMode === 'upload'
                      ? 'bg-white text-navyInk-700 shadow-xs'
                      : 'text-slateGray-600 hover:text-navyInk-700'
                  }`}
                >
                  Upload Foto
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMode('draw')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    signatureMode === 'draw'
                      ? 'bg-white text-navyInk-700 shadow-xs'
                      : 'text-slateGray-600 hover:text-navyInk-700'
                  }`}
                >
                  Goreskan Langsung
                </button>
              </div>
            </div>

            {/* Mode A: Upload File */}
            {signatureMode === 'upload' && (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-slateGray-300 hover:border-navyInk-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slateGray-50 hover:bg-softBlue/20 transition-all block">
                  <Upload className="w-8 h-8 text-navyInk-600 mb-2" />
                  <span className="font-bold text-navyInk-700 text-xs">Pilih Foto Tanda Tangan</span>
                  <span className="text-[11px] text-slateGray-400 mt-1">
                    Format PNG transparan atau JPG putih terang (Maks. 5 MB)
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Mode B: Canvas Pad */}
            {signatureMode === 'draw' && (
              <div className="space-y-2">
                <div className="border border-slateGray-300 rounded-xl overflow-hidden bg-white shadow-inner relative">
                  <div className="absolute top-2 left-2 text-[10px] text-slateGray-400 select-none pointer-events-none flex items-center gap-1">
                    <PenTool className="w-3 h-3" />
                    <span>Goreskan tanda tangan dengan jari / mouse di bawah:</span>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={160}
                    className="w-full h-40 touch-none cursor-crosshair block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eraser className="w-3.5 h-3.5" />}
                    onClick={clearCanvas}
                  >
                    Bersihkan Kanvas
                  </Button>
                </div>
              </div>
            )}

            {/* Preview Box */}
            <div className="p-3.5 rounded-xl border border-slateGray-200 bg-slateGray-50 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slateGray-500 block">
                Pratinjau Hasil Tanda Tangan:
              </span>
              <div className="h-24 bg-white rounded-lg border border-slateGray-200 flex items-center justify-center p-2 relative overflow-hidden">
                {signatureData ? (
                  <img
                    src={signatureData}
                    alt="Tanda Tangan Tutor"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-slateGray-400 text-[11px] italic">
                    Belum ada tanda tangan. Silakan upload foto atau goreskan pada kanvas di atas.
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slateGray-100">
              {signatureData ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={handleDeleteSignature}
                >
                  Hapus Tanda Tangan
                </Button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={handleSaveSignature}
                  disabled={!signatureData}
                >
                  Simpan Tanda Tangan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAP RESMI BOUGENVILLE COURSE */}
        {activeTab === 'stamp' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-navyInk-700 text-sm">Cap Stempel Bougenville Course</h4>
              <p className="text-[11px] text-slateGray-500">
                Stempel resmi ini akan dicetak di posisi tengah antara tanda tangan wali murid dan tutor pada Halaman 3 rapor.
              </p>
            </div>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-slateGray-300 hover:border-navyInk-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slateGray-50 hover:bg-softBlue/20 transition-all block">
              <Upload className="w-8 h-8 text-navyInk-600 mb-2" />
              <span className="font-bold text-navyInk-700 text-xs">Pilih Gambar Cap / Stempel Lembaga</span>
              <span className="text-[11px] text-slateGray-400 mt-1">
                Disarankan file PNG bulat dengan latar belakang transparan (Maks. 5 MB)
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleStampUpload}
                className="hidden"
              />
            </label>

            {/* Preview Box */}
            <div className="p-3.5 rounded-xl border border-slateGray-200 bg-slateGray-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slateGray-500">
                  Pratinjau Tampilan Cap pada Rapor:
                </span>
                <span className="text-[10px] text-slateGray-400 font-medium">
                  {stampData ? 'Menggunakan Cap Kustom' : 'Menggunakan Cap Standar Vektor'}
                </span>
              </div>

              <div className="h-32 bg-white rounded-lg border border-slateGray-200 flex items-center justify-center p-3 relative overflow-hidden">
                {stampData ? (
                  <div className="w-24 h-24 flex items-center justify-center rotate-[-3deg]">
                    <img
                      src={stampData}
                      alt="Cap Resmi Bougenville Course"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  /* Default Vector Simulation Stamp */
                  <div className="w-24 h-24 rounded-full border-2 border-navyInk-700 text-navyInk-700 flex flex-col items-center justify-center text-[8px] font-bold p-1 text-center rotate-[-3deg] shadow-xs select-none">
                    <span className="text-[7.5px] tracking-wider">BOUGENVILLE</span>
                    <span className="text-[6.5px] text-softCoral-500 font-extrabold my-0.5">TERVERIFIKASI</span>
                    <span className="text-[7.5px] tracking-wider">COURSE</span>
                    <span className="text-[5.5px] text-slateGray-400 mt-0.5">RAPOR BULANAN</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slateGray-100">
              {stampData ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={handleDeleteStamp}
                >
                  Kembalikan ke Cap Standar
                </Button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={handleSaveStamp}
                  disabled={!stampData}
                >
                  Simpan Cap Lembaga
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
