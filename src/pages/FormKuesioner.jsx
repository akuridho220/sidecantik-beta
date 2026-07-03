import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

export default function FormKuesioner() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2000);
  };

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

    showToast('Data berhasil disimpan ✅');

    // Redirect
    setTimeout(() => {
      navigate('/list');
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Form Kuesioner</h2>
      
      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-md text-white z-50
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
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