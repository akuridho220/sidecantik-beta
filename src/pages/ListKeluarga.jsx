import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export default function ListKeluarga() {
  const [keluargaData, setKeluargaData] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    loadLocalData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2000);
  };

  const loadLocalData = () => {
    const data = JSON.parse(localStorage.getItem('keluarga')) || [];
    setKeluargaData(data);
  };

  // EDIT
  const handleEdit = (id) => {
    navigate(`/form-keluarga?id=${id}`);
  };

  // DELETE
  const handleDelete = () => {
    const updated = keluargaData.filter(item => item.id !== deleteId);

    localStorage.setItem('keluarga', JSON.stringify(updated));
    setKeluargaData(updated);
    setDeleteId(null);

    showToast('Data berhasil dihapus 🗑️');
  };

  // SYNCHRONIZE KE NODE.JS BACKEND
  const handleSync = async (selectedSlsId = null) => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData || !userData.daftar_sls || userData.daftar_sls.length === 0) {
      showToast('Gagal: Kamu belum memiliki wilayah tugas.', 'error');
      return;
    }
    
    const currentSlsId = userData.daftar_sls[0]; 

    try {
      let localData = JSON.parse(localStorage.getItem('keluarga')) || [];
      const unsynced = localData.filter(item => !item.synced);

      if (unsynced.length > 0) {
        const response = await fetch('http://localhost:3001/api/keluarga/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unsynced)
        });

        if (!response.ok) throw new Error('Gagal mengirim data ke server');
        localData = localData.map(item => ({ ...item, synced: true }));
      }

      const fetchResponse = await fetch(`http://localhost:3001/api/keluarga/sls/${currentSlsId}`);
      if (!fetchResponse.ok) throw new Error('Gagal mengambil data dari server');
      
      const serverData = await fetchResponse.json();

      const merged = [...localData];
      serverData.forEach(serverItem => {
        const exists = merged.find(item => item.id_keluarga === serverItem.id_keluarga);
        if (!exists) {
          merged.push({ ...serverItem, synced: true });
        }
      });

      localStorage.setItem('keluarga', JSON.stringify(merged));
      showToast('Sync berhasil 🚀');
      loadLocalData();

    } catch (err) {
      console.error(err);
      showToast('Sync gagal ❌. Pastikan server menyala.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        Daftar Keluarga
      </h2>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-md text-white z-50 transition-opacity duration-300
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="overflow-x-auto mt-4 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className='p-4 flex justify-between items-center bg-gray-50'>
          <Link 
            to="/form-keluarga" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition"
          >
            + Tambah Keluarga
          </Link>
          <button
            onClick={handleSync}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md transition flex items-center gap-2"
            >
            🔄 Sync ke Server
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-3 text-center w-16">No</th>
              <th className="p-3">Nomor KK</th>
              <th className="p-3">Nama Kepala Keluarga</th>
              <th className="p-3 text-center w-24">Status</th>
              <th className="p-3 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {keluargaData.length > 0 ? (
              keluargaData.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 text-center">{index + 1}</td>
                  
                  {/* Kolom yang disesuaikan */}
                  <td className="p-3 font-medium text-gray-800">{item.no_kk}</td>
                  <td className="p-3 text-gray-800">{item.nama_kepala_keluarga}</td>
                  
                  <td className="p-3 text-center" title={item.synced ? "Tersinkronisasi" : "Menunggu Sync"}>
                    {item.synced ? "✅" : "⏳"}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(item.id)} className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded transition">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500">
                  Belum ada data keluarga di SLS ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Modal Konfirmasi Hapus */}
        {deleteId && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 transition-opacity"
            onClick={() => setDeleteId(null)}>
            <div className="bg-white rounded-xl p-6 w-80 shadow-2xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Hapus Data
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah kamu yakin ingin menghapus data keluarga ini secara permanen?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link 
          to="/" 
          className="inline-block bg-slate-600 hover:bg-slate-700 text-white px-5 py-2 rounded-md transition"
        >
          &larr; Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}