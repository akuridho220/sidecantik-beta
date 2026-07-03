import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

export default function FormKuesioner() {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const name = form.name.value;
    const message = form.message.value;

    const newData = {
      id: crypto.randomUUID(),
      name,
      message,
      synced: false
    };

    const existingData = JSON.parse(localStorage.getItem('kuesioner')) || [];

    const updatedData = [...existingData, newData];

    localStorage.setItem('kuesioner', JSON.stringify(updatedData));

    setShowAlert(true);

    // Redirect
    setTimeout(() => {
      setShowAlert(false);
      navigate('/list');
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Form Kuesioner</h2>
      
      {showAlert && (
        <div className="absolute top-0 left-0 right-0 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-md animate-fade-in">
          ✅ Data berhasil disimpan (offline-ready)
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Nama Anda:</label>
          <input 
            name="name"
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
      <Link 
        to="/" 
        className="bg-red-500 text-white px-3 py-3 rounded-md text-center"
      >
        Cancel
      </Link>
    </div>
  );
}