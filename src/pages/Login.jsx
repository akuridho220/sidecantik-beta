import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State tambahan untuk error dan loading
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Reset pesan error dan mulai loading
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal login, silakan coba lagi.');
      }

      localStorage.setItem('userData', JSON.stringify(data.user));
      navigate('/');
      
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Masuk ke Akun <br /> SIDECANTIK</h2>
        
        {/* Menampilkan kotak pesan error jika ada */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {/* <img 
            src="/logo-512x512.png" 
            alt="Logo SideCantik"
            className="w-36 h-36 mb-4 object-contain"
        /> */}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Input Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Masukkan email..."
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Masukkan password..."
            />
          </div>

          {/* Tombol Login dengan efek Loading */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 rounded-lg transition duration-200 mt-2 shadow-sm ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* <p className="mt-6 text-center text-sm text-gray-500">
          Belum punya akun? <a href="/register" className="text-blue-500 hover:underline">Daftar di sini</a>
        </p> */}
      </div>
    </div>
  );
}