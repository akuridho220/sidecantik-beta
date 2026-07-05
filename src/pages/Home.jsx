import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userData');
    
    navigate('/login');
  };
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[80vh] px-4">

      <img 
        src="/logo-512x512.png" 
        alt="Logo SideCantik"
        className="w-36 h-36 mb-4 object-contain"
      />
      
      {/* HERO */}
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
          Aplikasi Kuesioner <span className="text-blue-600">Offline & Online</span>
        </h1>

        <p className="text-gray-600 mt-4 text-lg">
          Isi kuesioner kapan saja, bahkan tanpa internet. Data akan otomatis tersimpan 
          dan bisa disinkronkan saat online.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {/* <Link
            to="/form"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            ✍️ Isi Kuesioner
          </Link> */}

          <Link
            to="/list-keluarga"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            📊 Lihat Data SLS
          </Link>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Keluar (Logout)
          </button>
        </div>
        
      </div>
    </div>
  );
}