import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardList, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

export default function FormBlokCatatan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idKeluarga = searchParams.get('id_keluarga');

  const [showExitModal, setShowExitModal] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [catatanAsli, setCatatanAsli] = useState(''); // Untuk mendeteksi perubahan

  useEffect(() => {
    if (!idKeluarga) {
      alert("ID Keluarga tidak ditemukan!");
      navigate('/list-keluarga');
      return;
    }

    // Mengambil data catatan dari data_keluarga (jika sudah pernah diisi)
    const dataKeluargaLokal = JSON.parse(localStorage.getItem('data_keluarga')) || [];
    const keluargaSaatIni = dataKeluargaLokal.find(k => k.id_keluarga === idKeluarga);

    if (keluargaSaatIni && keluargaSaatIni.catatan) {
      setCatatan(keluargaSaatIni.catatan);
      setCatatanAsli(keluargaSaatIni.catatan);
    }
  }, [idKeluarga, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simpan catatan ke dalam data_keluarga
    let dataKeluargaLokal = JSON.parse(localStorage.getItem('data_keluarga')) || [];
    const indexKeluarga = dataKeluargaLokal.findIndex(k => k.id_keluarga === idKeluarga);

    if (indexKeluarga !== -1) {
      dataKeluargaLokal[indexKeluarga] = {
        ...dataKeluargaLokal[indexKeluarga],
        catatan: catatan,
        status: 'selesai', // Ubah status menjadi selesai setelah mencapai blok terakhir
        synced: false // Tandai butuh sinkronisasi ke server
      };
      localStorage.setItem('data_keluarga', JSON.stringify(dataKeluargaLokal));
    }

    // Selesai! Arahkan petugas kembali ke daftar keluarga
    navigate('/list-keluarga');
  };

  const handleBackClick = () => {
    // Jika ada ketikan baru yang belum disimpan, munculkan peringatan
    if (catatan !== catatanAsli) {
      setShowExitModal(true);
    } else {
      // Kembali ke Blok 3 (Detail Keluarga)
      navigate(`/form/blok3/detail-keluarga?id_keluarga=${idKeluarga}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Latar Belakang Estetik (Blobs) */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Kontainer Utama */}
      <div className="flex-1 w-full max-w-lg mx-auto p-4 md:p-8 relative z-10 pb-28 flex flex-col justify-center">
        <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-white/30">
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-3 rounded-xl text-white shadow-md">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-teal-600 tracking-wide uppercase">Blok IV</p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Catatan</h1>
            </div>
          </div>

          <form id="form-catatan" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Keterangan Tambahan Pencacahan
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Gunakan ruang ini untuk mencatat hal-hal penting di luar kuesioner. Biarkan kosong jika tidak ada catatan khusus.
              </p>
              <textarea
                name="catatan"
                rows="6"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 text-slate-700 shadow-inner"
                placeholder=""
              ></textarea>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Navigasi (Menempel di Bawah) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-4 z-40">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="inline">Blok III</span>
          </button>
          
          <button
            type="submit"
            form="form-catatan"
            className="w-1/2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Simpan & Selesai</span>
          </button>
        </div>
      </div>

      {/* Modal Peringatan Jika Batal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100">
            <div className="flex flex-col items-center text-center">
              <div className="bg-amber-100 p-3 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Catatan Belum Disimpan</h3>
              <p className="text-slate-600 mb-6 text-sm">
                Anda memiliki perubahan catatan yang belum tersimpan. Jika kembali sekarang, tulisan tersebut akan hilang.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
                >
                  Teruskan Mengetik
                </button>
                <button
                  onClick={() => navigate(`/form-blok-3?id_keluarga=${idKeluarga}`)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition shadow-md"
                >
                  Ya, Buang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}