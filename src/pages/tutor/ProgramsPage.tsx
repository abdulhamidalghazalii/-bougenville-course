import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Target, BookOpen, Sparkles, CheckCircle2, Plus } from 'lucide-react';

export const ProgramsPage: React.FC = () => {
  const store = useAppStore();
  const programs = store.programs;
  const myStudents = store.getTutorStudents();
  const indicators = store.indicators;

  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [progName, setProgName] = useState('');
  const [progLevel, setProgLevel] = useState('');
  const [progDesc, setProgDesc] = useState('');

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName.trim() || !progLevel.trim()) return;

    const newProg = {
      id: 'prg-' + Date.now(),
      name: progName.trim(),
      education_level: progLevel.trim(),
      description: progDesc.trim(),
      is_active: true,
    };
    store.programs = [newProg, ...store.programs];
    setIsAddProgramOpen(false);
    setProgName('');
    setProgLevel('');
    setProgDesc('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 tracking-tight">
            Program & Target Pembelajaran
          </h1>
          <p className="text-sm text-slateNavy-500 mt-1">
            Struktur kurikulum calistung berjenjang dari PAUD, TK, hingga jenjang Sekolah Dasar.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddProgramOpen(true)}
        >
          Tambah Program
        </Button>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {programs.map((prog) => (
          <Card key={prog.id} className="p-5 flex flex-col justify-between" hoverEffect>
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-base text-slateNavy-900">{prog.name}</h3>
                <Badge variant="blue" size="sm">
                  {prog.education_level}
                </Badge>
              </div>
              <p className="text-xs text-slateNavy-600 line-clamp-3 mt-2">{prog.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slateNavy-100 flex items-center justify-between text-xs text-slateNavy-500">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Program Aktif
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Standar Kompetensi Calistung Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-slateNavy-900">Indikator Standar Kurikulum Calistung Bougenville Course</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Membaca */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Literasi & Membaca
            </h3>
            <ul className="space-y-1.5 text-xs text-slateNavy-700">
              {indicators.filter((i) => i.category === 'membaca').map((ind) => (
                <li key={ind.id} className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{ind.indicator_name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Menulis */}
          <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-pink-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" /> Motorik & Menulis
            </h3>
            <ul className="space-y-1.5 text-xs text-slateNavy-700">
              {indicators.filter((i) => i.category === 'menulis').map((ind) => (
                <li key={ind.id} className="flex items-start gap-1.5">
                  <span className="text-pink-500 font-bold">•</span>
                  <span>{ind.indicator_name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Berhitung */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Numerasi & Logika
            </h3>
            <ul className="space-y-1.5 text-xs text-slateNavy-700">
              {indicators.filter((i) => i.category === 'berhitung').map((ind) => (
                <li key={ind.id} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{ind.indicator_name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Modal Tambah Program */}
      <Modal
        isOpen={isAddProgramOpen}
        onClose={() => setIsAddProgramOpen(false)}
        title="Tambah Program Belajar Baru"
        description="Buat paket kurikulum belajar baru untuk jenjang tertentu."
      >
        <form onSubmit={handleAddProgram} className="space-y-4">
          <Input
            label="Nama Program"
            placeholder="Contoh: Belajar Baca Intensif Liburan"
            value={progName}
            onChange={(e) => setProgName(e.target.value)}
            required
          />
          <Input
            label="Jenjang Sasaran"
            placeholder="Contoh: TK B / SD Kelas 1"
            value={progLevel}
            onChange={(e) => setProgLevel(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slateNavy-700">
              Deskripsi & Sasaran
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slateNavy-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Jelaskan metode belajar dan fokus kompetensi..."
              value={progDesc}
              onChange={(e) => setProgDesc(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slateNavy-100">
            <Button variant="outline" type="button" onClick={() => setIsAddProgramOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Program
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
