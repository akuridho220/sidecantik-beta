import { useNavigate } from 'react-router-dom';

export default function FormKuesioner() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const nama = form.nama.value;
    const message = form.message.value;

    const newData = {
      id: Date.now(),
      nama,
      message,
      synced: false
    };

    // Ambil data lama dari localStorage
    const existingData = JSON.parse(localStorage.getItem('kuesioner')) || [];

    // Tambahkan data baru
    const updatedData = [...existingData, newData];

    // Simpan kembali
    localStorage.setItem('kuesioner', JSON.stringify(updatedData));

    alert('Terima kasih! Kuesioner berhasil dikirim.');

    // Redirect ke halaman list
    navigate('/list');
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Form Kuesioner</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Nama Anda:</label>
          <input 
            name="nama"
            type="text" 
            placeholder="Masukkan nama..." 
            required 
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Kesan & Pesan:</label>
          <textarea 
            name="message"
            rows="4" 
            required 
            className="w-full p-2 border rounded-md"
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          Kirim Jawaban
        </button>
      </form>
    </div>
  );
}