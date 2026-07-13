import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  UserPlus, 
  LogOut, 
  Activity,
  LayoutDashboard,
  Database,
  Plus,
  X,
  RefreshCw
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  // State Statistik
  const [stats, setStats] = useState({
    totalKeluarga: 0,
    totalPenduduk: 0,
    unsynced: 0
  });

  // State untuk kontrol FAB Menu & Loading
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // State Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    // Ambil data user dari localStorage [cite: 405]
    const storedUser = JSON.parse(localStorage.getItem('auth_user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUserData(storedUser);
    kalkulasiStatistik();
  }, [navigate]);

  const kalkulasiStatistik = () => {
    const dataKeluarga = JSON.parse(localStorage.getItem('data_keluarga')) || [];
    const dataPenduduk = JSON.parse(localStorage.getItem('data_penduduk')) || [];

    const unsyncedKeluarga = dataKeluarga.filter(k => !k.synced).length;
    const unsyncedPenduduk = dataPenduduk.filter(p => !p.synced).length;

    setStats({
      totalKeluarga: dataKeluarga.length,
      totalPenduduk: dataPenduduk.length,
      unsynced: unsyncedKeluarga + unsyncedPenduduk
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  // 🔥 FUNGSI FULL SYNC (Menarik semua keluarga & anggota untuk seluruh wilayah tugas)
  const handleFullSync = async () => {
    if (!userData || !userData.daftar_sls || userData.daftar_sls.length === 0) {
      showToast('Gagal: Kamu belum memiliki wilayah tugas.', 'error');
      return;
    }

    setIsSyncing(true);
    showToast('Memulai sinkronisasi data dari server...', 'success');

    try {
      let fetchedKeluarga = [];
      let fetchedPenduduk = [];

      // 1. Looping untuk setiap wilayah tugas (SLS) yang dimiliki user 
      for (const slsId of userData.daftar_sls) {
        
        // Ambil Data Keluarga di SLS ini 
        const resKeluarga = await fetch(`http://localhost:3001/api/keluarga/sls/${slsId}`);
        if (resKeluarga.ok) {
          const dataKeluarga = await resKeluarga.json();
          const syncedKel = dataKeluarga.map(k => ({ ...k, synced: false, status: 'open' }));
          fetchedKeluarga = [...fetchedKeluarga, ...syncedKel];

          // 2. Looping untuk setiap keluarga guna mengambil anggota keluarganya
          for (const kel of dataKeluarga) {
            const idKel = kel.id_keluarga || kel.id;
            const resPenduduk = await fetch(`http://localhost:3001/api/penduduk/keluarga/${idKel}`);
            if (resPenduduk.ok) {
              const dataPenduduk = await resPenduduk.json();
              const syncedPen = dataPenduduk.map(p => ({ ...p, synced: false }));
              fetchedPenduduk = [...fetchedPenduduk, ...syncedPen];
            }
          }
        }
      }

      // 3. Simpan data yang telah ditarik secara massal ke Local Storage
      // Catatan: Ini akan menimpa data lokal. Pastikan data lokal yang unsynced
      // sudah di-push sebelumnya (atau jalankan fungsi upload jika diperlukan).
      localStorage.setItem('data_keluarga', JSON.stringify(fetchedKeluarga));
      localStorage.setItem('data_penduduk', JSON.stringify(fetchedPenduduk));

      kalkulasiStatistik(); // Update angka dashboard
      showToast('Sinkronisasi penuh berhasil! 🚀', 'success');

    } catch (err) {
      console.error(err);
      showToast('Sync gagal ❌. Pastikan server menyala.', 'error');
    } finally {
      setIsSyncing(false);
      setIsFabOpen(false); // Tutup FAB setelah ditekan
    }
  };
  

  if (!userData) return null;

  return (
    <div className="relative min-h-screen bg-slate-50 p-2 md:p-8 max-w-5xl mx-auto flex flex-col gap-8 font-sans">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-md text-white z-50 transition-opacity shadow-lg
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Header Halaman & Profil Singkat */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
            {userData.nama ? userData.nama.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Selamat datang kembali,</p>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">{userData.nama || 'Petugas Pendataan'}</h1>
          </div>
        </div>
        
        {/* Tombol Logout dipindah ke FAB, Header menjadi lebih lega */}
        <div className="hidden sm:flex items-center">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            {userData.daftar_sls?.length || 0} Wilayah Tugas
          </span>
        </div>
      </div>

      {/* Bagian Dashboard / Ringkasan Statistik */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <LayoutDashboard className="text-teal-500" size={24} />
          <h2 className="text-xl font-extrabold text-gray-800">Dashboard Ringkasan</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Keluarga</p>
                <p className="text-4xl font-extrabold text-gray-800">{stats.totalKeluarga}</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Penduduk</p>
                <p className="text-4xl font-extrabold text-gray-800">{stats.totalPenduduk}</p>
              </div>
              <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Menunggu Sync</p>
                <p className={`text-4xl font-extrabold ${stats.unsynced > 0 ? 'text-orange-500' : 'text-gray-800'}`}>
                  {stats.unsynced}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stats.unsynced > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                <Activity size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Menu Navigasi / Aksi Cepat */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <Database className="text-blue-500" size={24} />
          <h2 className="text-xl font-extrabold text-gray-800">Menu Pendataan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            to="/list-keluarga"
            className="flex items-center p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="p-4 bg-gradient-to-br from-teal-400 to-teal-500 text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
              <FileText size={28} />
            </div>
            <div className="ml-5">
              <h3 className="font-bold text-gray-800 text-lg">Daftar Keluarga</h3>
              <p className="text-sm text-gray-500 mt-0.5">Lihat, edit, dan sync data keluarga</p>
            </div>
          </Link>

          {/* <Link 
            to="/form-keluarga"
            className="flex items-center p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
              <UserPlus size={28} />
            </div>
            <div className="ml-5">
              <h3 className="font-bold text-gray-800 text-lg">Tambah Keluarga Baru</h3>
              <p className="text-sm text-gray-500 mt-0.5">Input Nomor KK dan Kepala Keluarga</p>
            </div>
          </Link> */}
        </div>
      </div>

      {/* Ornamen Desain Tambahan */}
      <div className="mt-auto pt-8 text-center pb-24">
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">SIDECANTIK</p>
      </div>

      {/* ========================================= */}
      {/* FLOATING ACTION BUTTON (FAB) MENU         */}
      {/* ========================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <div className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${
            isFabOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
          }`}>
          
          {/* Tombol Logout di dalam FAB */}
          <div className='flex items-center text-red-500 gap-2'>
            {/* <span className="font-semibold pr-1">Keluar (Logout)</span> */}
            <button 
              onClick={() => { setIsFabOpen(false); handleLogout(); }} 
              className="flex items-center gap-2 bg-white text-red-500 p-4 rounded-full shadow-lg border border-gray-100 hover:bg-red-50 transition"
              >
              <LogOut size={28} />
              {/* <span className="font-semibold pr-1">Keluar (Logout)</span> */}
            </button>
          </div>

          {/* Tombol Sync Server Tarik Data Massal */}
          <div className='flex items-center text-teal-600 gap-2'>
            {/* <span className="font-semibold pr-1">
                {isSyncing ? 'Sedang Menarik Data...' : 'Sync Data Awal'}
            </span> */}
            <button 
              onClick={handleFullSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 p-4 rounded-full shadow-lg border transition ${
                isSyncing 
                ? 'bg-teal-50 border-teal-100 text-teal-400 cursor-not-allowed' 
                : 'bg-white border-gray-100 text-teal-600 hover:bg-teal-50'
              }`}
              >
              <RefreshCw size={28} className={isSyncing ? 'animate-spin' : ''} />
              {/* <span className="font-semibold pr-1">
                {isSyncing ? 'Sedang Menarik Data...' : 'Sync Data Awal'}
                </span> */}
            </button>
          </div>
        </div>

        {/* Tombol Utama FAB (Gradient Biru-Teal) */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`text-white p-4 rounded-full shadow-[0_8px_20px_rgba(45,212,191,0.4)] transition-all duration-300 hover:scale-110 focus:outline-none ${
            isFabOpen 
              ? 'bg-red-400 rotate-90 shadow-red-200' 
              : 'bg-gradient-to-r from-blue-400 to-teal-400 rotate-0'
          }`}
        >
          {isFabOpen ? <X size={28} /> : <Plus size={28} />}
        </button>
      </div>

    </div>
  );
}