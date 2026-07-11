import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ArrowLeft, 
  RefreshCw, 
  User, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  Edit3 // <-- Mengimpor kembali ikon Edit3
} from 'lucide-react';

// Fungsi Helper untuk memformat tanggal (dd/mm/yyyy)
const formatTanggal = (tanggal) => {
  if (!tanggal) return '-';
  const date = new Date(tanggal);
  if (isNaN(date)) return tanggal; // Jaga-jaga jika format tanggal tidak valid
  
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  
  return `${d}/${m}/${y}`;
};

export default function DetailKeluarga() {
  const [searchParams] = useSearchParams();
  const idKeluarga = searchParams.get('id');
  const navigate = useNavigate();

  const [keluarga, setKeluarga] = useState(null);
  const [anggotaKeluarga, setAnggotaKeluarga] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [expandedRow, setExpandedRow] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
  };

  useEffect(() => {
    if (!idKeluarga) {
      alert("ID Keluarga tidak ditemukan!");
      navigate('/list-keluarga');
      return;
    }
    loadData();
  }, [idKeluarga, navigate]);

  const loadData = () => {
    const dataKeluarga = JSON.parse(localStorage.getItem('keluarga')) || [];
    const foundKeluarga = dataKeluarga.find(k => k.id_keluarga === idKeluarga || k.id === idKeluarga);
    setKeluarga(foundKeluarga);

    const dataPenduduk = JSON.parse(localStorage.getItem('penduduk')) || [];
    const foundAnggota = dataPenduduk.filter(p => p.id_keluarga === idKeluarga);
    
    foundAnggota.sort((a, b) => {
      if (a.hubungan_keluarga === 'KEPALA KELUARGA') return -1;
      if (b.hubungan_keluarga === 'KEPALA KELUARGA') return 1;
      return 0;
    });

    setAnggotaKeluarga(foundAnggota);
  };

  const handleSyncAnggota = async () => {
    setIsSyncing(true);
    try {
      const allLocalPenduduk = JSON.parse(localStorage.getItem('penduduk')) || [];
      const unsyncedAnggota = allLocalPenduduk.filter(p => p.id_keluarga === idKeluarga && !p.synced);

      if (unsyncedAnggota.length > 0) {
        const response = await fetch('http://localhost:3001/api/penduduk/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unsyncedAnggota)
        });
        if (!response.ok) throw new Error('Gagal mengirim data anggota ke server');
      }

      const fetchResponse = await fetch(`http://localhost:3001/api/penduduk/keluarga/${idKeluarga}`);
      if (!fetchResponse.ok) throw new Error('Gagal memuat data dari server');
      const serverData = await fetchResponse.json();

      const pPendudukKeluargaLain = allLocalPenduduk.filter(p => p.id_keluarga !== idKeluarga);
      const serverDataSynced = serverData.map(s => ({ ...s, synced: true }));
      
      const mergedPenduduk = [...pPendudukKeluargaLain, ...serverDataSynced];

      localStorage.setItem('penduduk', JSON.stringify(mergedPenduduk));
      showToast('Sync data anggota berhasil! 🚀');
      loadData(); 
    } catch (error) {
      console.error(error);
      showToast('Sync gagal ❌. Periksa koneksi ke server.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!keluarga) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3 text-teal-600">
          <RefreshCw className="animate-spin" size={32} />
          <p className="font-medium">Memuat data keluarga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6 font-sans">
      
      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-md text-white z-50 transition-opacity shadow-lg
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Header Halaman & Navigasi */}
      <div className="flex flex-col gap-3">
        <Link 
          to="/list-keluarga" 
          className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition w-fit"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Kembali ke Daftar</span>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Detail Keluarga</h1>
          <div className="w-16 h-1 bg-teal-400 rounded-full mt-2"></div>
        </div>
      </div>

      {/* Kartu Informasi Keluarga */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-50 to-blue-50 rounded-bl-full -z-0 opacity-70"></div>
        
        <div className="relative z-10 p-6 md:p-8">
          <p className="text-gray-500 text-sm mb-5">Informasi Nomor KK dan identitas Kepala Keluarga.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50/80 p-5 rounded-xl border border-gray-100/80 shadow-sm">
              <p className="text-sm font-semibold text-gray-500 mb-1">Nomor KK</p>
              <p className="text-xl font-bold text-gray-800 tracking-wide">{keluarga.no_kk || keluarga.nomor_kk}</p>
            </div>
            <div className="bg-slate-50/80 p-5 rounded-xl border border-gray-100/80 shadow-sm">
              <p className="text-sm font-semibold text-gray-500 mb-1">Kepala Keluarga</p>
              <p className="text-xl font-bold text-gray-800">{keluarga.nama_kepala_keluarga}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Tabel List Anggota Keluarga Modern */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
          <h2 className="text-xl font-bold text-gray-800">
            Daftar Anggota <span className="text-teal-500">({anggotaKeluarga.length} Jiwa)</span>
          </h2>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleSyncAnggota}
              disabled={isSyncing}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-md transition-all ${
                isSyncing ? 'bg-teal-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Anggota'}
            </button>

            <Link 
              to={`/form-anggota-keluarga?id_keluarga=${idKeluarga}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-md transition-all bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:-translate-y-0.5"
            >
              <UserPlus size={18} /> Tambah Anggota
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-[3rem_1fr_auto] items-center p-4 border-b border-gray-100 bg-white text-gray-500 font-semibold text-sm">
          <div className="text-center">No</div>
          <div>Nama Anggota Keluarga</div>
          <div className="pr-4">Detail</div>
        </div>

        <div className="flex flex-col">
          {anggotaKeluarga.length > 0 ? (
            anggotaKeluarga.map((item, index) => {
              const isExpanded = expandedRow === item.id_penduduk;

              return (
                <div key={item.id_penduduk} className="flex flex-col border-b border-gray-50 last:border-0">
                  
                  {/* MAIN ROW ANGGOTA */}
                  <div 
                    onClick={() => setExpandedRow(isExpanded ? null : item.id_penduduk)}
                    className={`grid grid-cols-[3rem_1fr_auto] items-center p-3 sm:p-4 cursor-pointer transition-all duration-300
                      ${isExpanded 
                        ? 'bg-gradient-to-r from-blue-400 to-teal-400 text-white shadow-md scale-[1.01] rounded-lg mx-2 mt-2 z-10' 
                        : 'bg-white text-gray-700 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`text-center font-medium ${isExpanded ? 'text-white' : 'text-gray-500'}`}>
                      {index + 1}
                    </div>

                    <div className="flex items-center gap-3 font-medium">
                      <div className={`p-2 rounded-full flex-shrink-0 ${isExpanded ? 'bg-white/20' : 'bg-slate-100 text-gray-400'}`}>
                        <User size={18} />
                      </div>
                      <span className="truncate font-bold">{item.nama}</span>
                    </div>

                    <div className="flex items-center justify-end pr-2">
                      {isExpanded ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* ACCORDION PANEL */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-x border-b border-gray-100 rounded-b-lg mx-2 mb-2 shadow-inner">
                      <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm pl-4 border-l-4 border-teal-400">
                          
                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">NIK (Nomor Induk Kependudukan)</p>
                            <p className="font-bold text-gray-800 font-mono mt-0.5">{item.nik || '-'}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Hubungan Keluarga</p>
                            <p className="font-bold text-gray-800 mt-0.5">{item.hubungan_keluarga || '-'}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Umur</p>
                            <p className="font-bold text-gray-800 mt-0.5">{item.umur ? `${item.umur} Tahun` : '-'}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Tempat / Tanggal Lahir</p>
                            <p className="font-bold text-gray-800 mt-0.5">
                              {item.tempat_lahir || '-'}, {formatTanggal(item.tanggal_lahir)}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Status Pernikahan</p>
                            <p className="font-bold text-gray-800 mt-0.5">{item.status_pernikahan || '-'}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Golongan Darah</p>
                            <p className="font-bold text-gray-800 mt-0.5">{item.golongan_darah || '-'}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Pendidikan (Sesuai KK)</p>
                            <p className="font-bold text-gray-800 mt-0.5">{item.pendidikan_kk || '-'}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Pekerjaan</p>
                            <p className="font-bold text-gray-800 mt-0.5">{item.pekerjaan || '-'}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Nama Orang Tua (Ayah / Ibu)</p>
                            <p className="font-bold text-gray-800 mt-0.5">
                              {item.nama_ayah || '-'} / {item.nama_ibu || '-'}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Status Kependudukan</p>
                            <p className="font-bold text-gray-800 mt-0.5">{item.status || '-'}</p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium text-xs uppercase">Status Sinkronisasi Server</p>
                            <p className={`font-bold mt-0.5 ${item.synced ? 'text-green-600' : 'text-yellow-600'}`}>
                              {item.synced ? '✓ Tersinkronisasi' : '⏳ Menunggu Sinkronisasi'}
                            </p>
                          </div>

                        </div>

                        {/* 🔥 Tombol Edit di Bagian Bawah Accordion */}
                        <div className="mt-6 pt-5 border-t border-gray-200 flex justify-end">
                          <Link 
                            to={`/form-anggota-keluarga?id_keluarga=${idKeluarga}&id=${item.id_penduduk}`}
                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                          >
                            <Edit3 size={18} /> Edit Data Anggota
                          </Link>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="text-center p-12 bg-white">
              <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                <ShieldAlert size={32} className="opacity-50" />
                <p>Belum ada data anggota keluarga.</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}