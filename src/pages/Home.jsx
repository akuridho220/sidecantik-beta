import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col gap-4 text-center mt-10">
      <h1 className="text-2xl font-bold text-gray-800">Selamat Datang di Aplikasi Kuesioner</h1>
      <p className="text-gray-600">Pilih menu di bawah ini untuk memulai.</p>
      
      <div className="mt-6">
        <Link 
          to="/list" 
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
        >
          Lihat Daftar Kuesioner
        </Link>
      </div>
    </div>
  );
}