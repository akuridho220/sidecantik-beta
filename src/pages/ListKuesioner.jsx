import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';


export default function ListKuesioner() {
  const [kuesionerData, setKuesionerData] = useState([]);

  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = () => {
    const data = JSON.parse(localStorage.getItem('kuesioner')) || [];
    setKuesionerData(data);
  };

  // Synchron database
  const handleSync = async () => {
    try {
      let localData = JSON.parse(localStorage.getItem('kuesioner')) || [];

      const unsynced = localData.filter(item => !item.synced);

      if (unsynced.length > 0) {
        let { data: insertedData, insertError } = await supabase
          .from("response")
          .insert(
            unsynced.map(item => ({
              id: item.id,
              name: item.nama,
              message: item.message
            }))
          ).select();

        if (insertError) throw insertError;

        if (!insertedData) {
          console.warn("Tidak ada data kembali dari insert");
          insertedData = [];
        }

        localData = localData.map(localItem => {
          const isUploaded = insertedData.find(d => d.id === localItem.id);
          if (isUploaded) {
            return { ...localItem, synced: true };
          }
          return localItem;
        });
      }

      const { data: serverData, error: fetchError } = await supabase
        .from('response')
        .select('*');

      if (fetchError) throw fetchError;

      const merged = [...localData];

      serverData.forEach(serverItem => {
        const exists = merged.find(item => item.id === serverItem.id);
        if (!exists) {
          merged.push({
            ...serverItem,
            synced: true
          });
        }
      });

      localStorage.setItem('kuesioner', JSON.stringify(merged));

      alert('Sync berhasil (merge aman) 🚀');

      loadLocalData();

    } catch (err) {
      console.error(err);
      alert('Sync gagal ❌');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
        Daftar Response
      </h2>

      <div className="overflow-x-auto mt-2">
        <div className='my-4 flex justify-between'>
          <Link 
            to="/form" 
            className="bg-blue-500 text-white px-3 py-2 rounded-md"
          >
            Tambah Kuesioner
          </Link>
          <button
            onClick={handleSync}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md"
            >
            🔄 Sync ke Server
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">No</th>
              <th className="p-3">Nama</th>
              <th className="p-3 text-center">Pesan</th>
              <th className='p-3'>Status</th>
            </tr>
          </thead>
          <tbody>
            {kuesionerData.length > 0 ? (
              kuesionerData.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 text-center">{index + 1}</td>
                  <td className="p-3">{item.nama}</td>
                  <td className="p-3 text-center">{item.message}</td>
                  <td className="p-3 text-center">{item.synced ? "✅" : "⏳"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-5 text-gray-500">
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}