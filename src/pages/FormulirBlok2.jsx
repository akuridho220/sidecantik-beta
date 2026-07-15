import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, ArrowLeft, ArrowRight, AlertTriangle, MapPin } from 'lucide-react';
import Select from 'react-select'; 
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const opsiStatusKeberadaan = [
  { value: 'Ditemukan', label: '1. Ditemukan' },
  { value: 'Baru', label: '2. Baru' },
  { value: 'Pindah Keluar SLS', label: '3. Pindah keluar SLS' },
  { value: 'Tidak Ditemukan', label: '4. Tidak ditemukan' },
  { value: 'Tidak Tahu', label: '5. Tidak tahu' }
];

const opsiKesesuaianDomisili = [
  { value: 'Alamat KK dan domisili sesuai SLS', label: '1. Alamat KK dan domisili sesuai SLS' },
  { value: 'Alamat KK diluar SLS', label: '2. Alamat KK diluar SLS' },
  { value: 'Domisili diluar SLS', label: '3. Domisili diluar SLS' }
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    padding: '0.3rem',
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#14b8a6' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(20, 184, 166, 0.2)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#14b8a6' : '#cbd5e1'
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#0d9488'
      : state.isFocused 
        ? '#ccfbf1'
        : 'white',
    color: state.isSelected ? 'white' : '#334155',
    cursor: 'pointer',
    padding: '10px 15px',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' // setara shadow-lg
  })
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function FormBlok2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idKeluarga = searchParams.get('id_keluarga');

  const [showExitModal, setShowExitModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const defaultPosition = [-0.789275, 113.921327];
  const [mapPosition, setMapPosition] = useState(defaultPosition);
  
  const [formData, setFormData] = useState({
    nomor_kk: '',
    nama_kepala_keluarga: '',
    status_keberadaan: '',
    jumlah_anggota: '',
    alamat: '',
    kesesuaian_domisili: '',
    latitude: '',
    longitude: '',
    nomor_hp: ''
  });

  const markerRef = useRef(null);

  useEffect(() => {
    if (idKeluarga) {
      const semuaDrafBlok2 = JSON.parse(localStorage.getItem('draft_blok2_keberadaan-keluarga')) || [];

      const drafTersimpan = semuaDrafBlok2.find(d => d.id_keluarga === idKeluarga);

      if (drafTersimpan) {
        setFormData(drafTersimpan);
        
        if (drafTersimpan.latitude && drafTersimpan.longitude) {
          setMapPosition([parseFloat(drafTersimpan.latitude), parseFloat(drafTersimpan.longitude)]);
        }
      } else {
        const dataKeluargaLokal = JSON.parse(localStorage.getItem('data_keluarga')) || [];
        const keluargaSaatIni = dataKeluargaLokal.find(k => k.id_keluarga === idKeluarga);

        if (keluargaSaatIni) {
          setFormData(prev => ({
            ...prev,
            nomor_kk: keluargaSaatIni.no_kk || '',
            nama_kepala_keluarga: keluargaSaatIni.nama_kepala_keluarga || '',
            jumlah_anggota: keluargaSaatIni.jumlah_anggota || '',
            latitude: keluargaSaatIni.latitude || '',
            longitude: keluargaSaatIni.longitude || ''
          }));

          if (keluargaSaatIni.latitude && keluargaSaatIni.longitude) {
            setMapPosition([parseFloat(keluargaSaatIni.latitude), parseFloat(keluargaSaatIni.longitude)]);
          }
        }
      }
    }
  }, [idKeluarga]);

  useEffect(() => {
    if (!formData.latitude && !formData.longitude) {
      handleGetLocation();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : '';
    
    if (name === 'status_keberadaan') {
      const isSkipLanjut = ['Pindah Keluar SLS', 'Tidak Ditemukan', 'Tidak Tahu'].includes(value);
      
      if (isSkipLanjut) {
        setFormData(prev => ({
          ...prev,
          status_keberadaan: value,
          jumlah_anggota: '',
          alamat: '',
          kesesuaian_domisili: '',
          latitude: '',
          longitude: '',
          nomor_hp: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setMapPosition([lat, lng]);
          setFormData(prev => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString()
          }));
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Drag pin maps
  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const position = marker.getLatLng();
          setFormData(prev => ({
            ...prev,
            latitude: position.lat.toString(),
            longitude: position.lng.toString()
          }));
        }
      },
    }),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.status_keberadaan) {
      alert("Mohon pilih Status Keberadaan terlebih dahulu.");
      return;
    }

    const dataDisimpan = { ...formData, id_keluarga: idKeluarga};

    let semuaDrafBlok2 = JSON.parse(localStorage.getItem('draft_blok2_keberadaan-keluarga')) || [];
    const indexDraf = semuaDrafBlok2.findIndex(d => d.id_keluarga === idKeluarga);

    if (indexDraf !== -1) {
      semuaDrafBlok2[indexDraf] = dataDisimpan;
    } else {
      semuaDrafBlok2.push(dataDisimpan);
    }

    let dataKeluargaLokal = JSON.parse(localStorage.getItem('data_keluarga'));
    if (Array.isArray(dataKeluargaLokal)) {
      const indexKeluarga = dataKeluargaLokal.findIndex(k => k.id_keluarga === idKeluarga);
      if (indexKeluarga !== -1) {
        dataKeluargaLokal[indexKeluarga].synced = false;
        dataKeluargaLokal[indexKeluarga].status = 'draft';
        localStorage.setItem('data_keluarga', JSON.stringify(dataKeluargaLokal));
      }
    }

    localStorage.setItem('draft_blok2_keberadaan-keluarga', JSON.stringify(semuaDrafBlok2));
    
    const statusSkip = ['Pindah Keluar SLS', 'Tidak Ditemukan', 'Tidak Tahu'].includes(formData.status_keberadaan);
    if (statusSkip) {
      navigate(`/form/blok4?id_keluarga=${idKeluarga}`);
    } else {
      navigate(`/form/blok3/detail-keluarga?id_keluarga=${idKeluarga}`);
    }
  };

  const handleBackClick = () => {
    const isFormFilled = formData.status_keberadaan || formData.alamat || formData.nomor_hp;
    if (isFormFilled) {
      setShowExitModal(true);
    } else {
      navigate(`/form/blok1?id_keluarga=${idKeluarga}`);
    }
  };


  const isSkipLanjut = ['Pindah Keluar SLS', 'Tidak Ditemukan', 'Tidak Tahu'].includes(formData.status_keberadaan);

  const selectedStatus = opsiStatusKeberadaan.find(opt => opt.value === formData.status_keberadaan) || null;
  const selectedKesesuaian = opsiKesesuaianDomisili.find(opt => opt.value === formData.kesesuaian_domisili) || null;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="flex-1 w-full max-w-lg mx-auto p-4 md:p-8 relative z-10 pb-28 flex flex-col justify-center">
        <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-white/30">
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-3 rounded-xl text-white shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-teal-600 tracking-wide uppercase">Blok II</p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Keberadaan Keluarga</h1>
            </div>
          </div>

          <form id="form-blok-2" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1 & 2. Auto-fill ReadOnly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">1. Nomor KK</label>
                <input
                  type="text"
                  name="nomor_kk"
                  required
                  value={formData.nomor_kk}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                  placeholder="Masukkan No KK"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">2. Nama Kepala Keluarga</label>
                <input
                  type="text"
                  name="nama_kepala_keluarga"
                  required
                  value={formData.nama_kepala_keluarga}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                  placeholder="Nama Kepala Keluarga"
                />
              </div>
            </div>

            {/* 3. Status Keberadaan */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">3. Status Keberadaan</label>
              <Select
                options={opsiStatusKeberadaan}
                value={selectedStatus}
                onChange={(option) => handleSelectChange('status_keberadaan', option)}
                styles={customSelectStyles}
                placeholder="-- Pilih Status --"
                isSearchable={false} // Matikan ketik-cari jika opsinya sedikit
              />
            </div>

            {/* Warning Info (Jika status 3, 4, 5) */}
            {isSkipLanjut && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Karena status keberadaan <strong>{formData.status_keberadaan}</strong>, pertanyaan selanjutnya tidak perlu diisi. Anda akan langsung diarahkan ke Blok Catatan setelah menyimpan.
                </p>
              </div>
            )}

            {/* Wrapper dinonaktifkan jika isSkipLanjut true */}
            <div className={`space-y-6 transition-opacity duration-300 ${isSkipLanjut ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              
              {/* 4. Jumlah Anggota */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">4. Jumlah Anggota Keluarga</label>
                <div className="relative">
                  <input
                    type="number"
                    name="jumlah_anggota"
                    min="1"
                    required={!isSkipLanjut}
                    value={formData.jumlah_anggota}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 pr-16 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 font-medium">orang</span>
                </div>
              </div>

              {/* 5. Alamat */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">5. Alamat</label>
                <textarea
                  name="alamat"
                  rows="2"
                  required={!isSkipLanjut}
                  value={formData.alamat}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Tulis alamat lengkap..."
                />
              </div>

              {/* 6. Kesesuaian Alamat Domisili */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">6. Kesesuaian Alamat Domisili</label>
                <Select
                  options={opsiKesesuaianDomisili}
                  value={selectedKesesuaian}
                  onChange={(option) => handleSelectChange('kesesuaian_domisili', option)}
                  styles={customSelectStyles}
                  placeholder="-- Pilih Kesesuaian --"
                  isDisabled={isSkipLanjut} // Fitur bawaan react-select untuk mendisable input
                  isClearable // Bisa dihapus kembali pilihannya
                />
              </div>

              {/* 6. Lokasi (Mengikuti penomoran ganda pada gambar asli) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">6. Lokasi (Geser Pin untuk koreksi)</label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating || isSkipLanjut}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition ${
                      isSkipLanjut 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isLocating ? 'Mencari...' : 'Titik Saya'}</span>
                  </button>
                </div>
                
                {/* Area Peta */}
                <div className="w-full h-64 bg-slate-200 rounded-xl overflow-hidden border border-slate-200 relative z-0 mb-3">
                  <MapContainer center={mapPosition} zoom={16} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapUpdater center={mapPosition} />
                    <Marker
                      draggable={!isSkipLanjut}
                      eventHandlers={markerEventHandlers}
                      position={formData.latitude && formData.longitude ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] : mapPosition}
                      ref={markerRef}
                    >
                    </Marker>
                  </MapContainer>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="latitude"
                    readOnly
                    placeholder="Latitude"
                    value={formData.latitude}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none cursor-not-allowed"
                  />
                  <input
                    type="text"
                    name="longitude"
                    readOnly
                    placeholder="Longitude"
                    value={formData.longitude}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 7. Nomor HP */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">7. Nomor HP</label>
                <input
                  type="tel"
                  name="nomor_hp"
                  required={!isSkipLanjut}
                  value={formData.nomor_hp}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Contoh: 08123456789"
                />
              </div>

            </div>
          </form>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-4 z-40">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/form/blok1?id_keluarga=${idKeluarga}`)}
            className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="inline">Blok I</span>
          </button>
          
          <button
            type="submit"
            form="form-blok-2"
            className="w-1/2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <span>{isSkipLanjut ? 'Ke Blok Catatan' : 'Simpan & Lanjut'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Keluar */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Yakin Ingin Kembali?</h3>
              <p className="text-slate-600 mb-6 text-sm">
                Perubahan pada Blok 2 belum disimpan. Jika kembali sekarang, isian ini akan hilang.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => navigate(`/form/blok1?id_keluarga=${idKeluarga}`)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition duration-200 shadow-md shadow-red-500/30"
                >
                  Ya, Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}