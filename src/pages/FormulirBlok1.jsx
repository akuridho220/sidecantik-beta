import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, MapPin } from 'lucide-react';

export default function FormIdentitasWilayah() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_desa: '',
    nama_dusun: '',
    nama_rt: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simpan ke localStorage sebagai bagian dari identitas wilayah
    localStorage.setItem('identitas_wilayah', JSON.stringify(formData));
    alert("Identitas wilayah berhasil disimpan!");
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-white/30 relative z-10">
        <Link to="/home" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition">
          <ArrowLeft className="w-5 h-5 mr-1" /> Kembali
        </Link>

        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-3 rounded-xl text-white">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Blok 1: Identitas Wilayah</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Nama Desa */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nama Desa/Kelurahan</label>
            <input
              type="text"
              name="nama_desa"
              required
              value={formData.nama_desa}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Contoh: Desa Sukamaju"
            />
          </div>

          {/* Input Nama Dusun */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nama Dusun</label>
            <input
              type="text"
              name="nama_dusun"
              required
              value={formData.nama_dusun}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Contoh: Dusun Mekarsari"
            />
          </div>

          {/* Input Nama RT */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Nama/Nomor RT</label>
            <input
              type="text"
              name="nama_rt"
              required
              value={formData.nama_rt}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Contoh: RT 01"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-teal-600 transition duration-200 flex items-center justify-center space-x-2 mt-4"
          >
            <Save className="w-5 h-5" />
            <span>Simpan Identitas Wilayah</span>
          </button>
        </form>
      </div>
    </div>
  );
}