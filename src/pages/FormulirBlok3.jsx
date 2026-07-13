import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import Select from 'react-select';

// --- OPSI DROPDOWN ---
const opsiHubungan = [
  { value: '1', label: '1. Kepala Keluarga' },
  { value: '2', label: '2. Istri/Suami' },
  { value: '3', label: '3. Anak' },
  { value: '4', label: '4. Menantu' },
  { value: '5', label: '5. Cucu' },
  { value: '6', label: '6. Orang tua' },
  { value: '7', label: '7. Mertua' },
  { value: '8', label: '8. Famili lain' },
  { value: '9', label: '9. Pembantu' },
  { value: '10', label: '10. Lainnya (tuliskan)' }
];

const opsiStatusPenduduk = [
  { value: '1', label: '1. Hidup' },
  { value: '2', label: '2. Mati' },
  { value: '3', label: '3. Tinggal diluar SLS' },
  { value: '4', label: '4. Tidak ditemukan' }
];

const opsiJenisKelamin = [
  { value: '1', label: '1. Laki-laki' },
  { value: '2', label: '2. Perempuan' }
];

const opsiAgama = [
  { value: '1', label: '1. Islam' },
  { value: '2', label: '2. Kristen' },
  { value: '3', label: '3. Katolik' },
  { value: '4', label: '4. Hindu' },
  { value: '5', label: '5. Budha' },
  { value: '6', label: '6. Konghucu' },
  { value: '7', label: '7. Kepercayaan lain ...' }
];

const opsiPerkawinan = [
  { value: '1', label: '1. Belum Kawin' },
  { value: '2', label: '2. Kawin' },
  { value: '3', label: '3. Cerai Hidup' },
  { value: '4', label: '4. Cerai Mati' }
];

const opsiPendidikan = [
  { value: '1', label: '1. Tidak/Belum Sekolah' },
  { value: '2', label: '2. Belum Tamat SD/Sederajat' },
  { value: '3', label: '3. Tamat SD/Sederajat' },
  { value: '4', label: '4. SMP/Sederajat' },
  { value: '5', label: '5. SMA/Sederajat' },
  { value: '6', label: '6. Diploma I/II' },
  { value: '7', label: '7. Akademi/Diploma III' },
  { value: '8', label: '8. Diploma IV/Strata I (S1)' },
  { value: '9', label: '9. Strata II (S2)' },
  { value: '10', label: '10. Strata III (S3)' }
];

const opsiPekerjaan = [
  { value: '1', label: '1. Belum/tidak bekerja' },
  { value: '2', label: '2. Mengurus rumah tangga' },
  { value: '3', label: '3. Pelajar/mahasiswa' },
  { value: '4', label: '4. Pensiunan' },
  { value: '5', label: '5. ASN (Aparatur Sipil Negara)' },
  { value: '6', label: '6. Tentara Nasional Indonesia (TNI)' },
  { value: '7', label: '7. Kepolisian RI (POLRI)' },
  { value: '8', label: '8. Wiraswasta/Pedagang' },
  { value: '9', label: '9. Petani/pekebun' },
  { value: '10', label: '10. Nelayan/perikanan' },
  { value: '11', label: '11. Karyawan swasta' },
  { value: '12', label: '12. Karyawan honorer' },
  { value: '13', label: '13. Buruh harian lepas' },
  { value: '14', label: '14. Tenaga Kerja Indonesia (TKI)' },
  { value: '15', label: '15. Lainnya' }
];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    padding: '0.3rem',
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#14b8a6' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(20, 184, 166, 0.2)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#14b8a6' : '#cbd5e1' }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#0d9488' : state.isFocused ? '#ccfbf1' : 'white',
    color: state.isSelected ? 'white' : '#334155',
    cursor: 'pointer',
    padding: '10px 15px',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 50
  })
};

// 🔥 HELPER: Penterjemah Teks Prelist menjadi Value Dropdown
const parseDropdownValue = (prelistValue, options) => {
  if (!prelistValue) return '';
  const valStr = String(prelistValue).trim().toUpperCase();
  
  if (options.find(opt => opt.value === valStr)) return valStr;
  
  let matched = options.find(opt => {
    const labelClean = opt.label.toUpperCase().replace(/[0-9.]/g, '').trim(); 
    return labelClean === valStr;
  });
  if (!matched) {
    matched = options.find(opt => {
      const labelClean = opt.label.toUpperCase().replace(/[0-9.]/g, '').trim(); 
      if (valStr.length < 4 && labelClean.length > 5) return false; 
      
      return valStr.includes(labelClean) || labelClean.includes(valStr);
    });
  }
  
  if (matched) return matched.value;

  // Edge cases (Kasus penulisan spesifik di database)
  if (valStr === 'ISTRI' || valStr === 'SUAMI') return '2';
  if (valStr === 'LAKI-LAKI' || valStr === 'L') return '1';
  if (valStr === 'PEREMPUAN' || valStr === 'P') return '2';
  
  return '';
};

export default function FormAnggotaKeluarga() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idKeluarga = searchParams.get('id_keluarga');
  const idPenduduk = searchParams.get('id_anggota_keluarga'); 

  const [showExitModal, setShowExitModal] = useState(false);
  const [originalData, setOriginalData] = useState(null); // Menyimpan data asli agar atribut lain tidak hilang
  
  const [formData, setFormData] = useState({
    nomor_urut: '',
    nama: '',
    nik: '',
    hubungan_keluarga: '',
    hubungan_lainnya: '',
    status_penduduk: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    agama: '',
    agama_lainnya: '',
    status_perkawinan: '',
    pendidikan_kk: '',
    pekerjaan: ''
  });

  useEffect(() => {
    if (!idKeluarga) {
      alert("ID Keluarga hilang!");
      navigate('/list-keluarga');
      return;
    }

    const dataPendudukLokal = JSON.parse(localStorage.getItem('data_penduduk')) || [];
    
    if (idPenduduk) {
      const anggotaTarget = dataPendudukLokal.find(p => p.id_anggota_keluarga === idPenduduk);
      
      if (anggotaTarget) {
        setOriginalData(anggotaTarget); // Simpan wujud aslinya

        // Ekstrak tanggal untuk input type="date" (YYYY-MM-DD)
        let tglLahirFormatted = anggotaTarget.tanggal_lahir || '';
        if (tglLahirFormatted && tglLahirFormatted.includes('T')) {
          tglLahirFormatted = tglLahirFormatted.split('T')[0];
        }

        setFormData({
          nomor_urut: anggotaTarget.nomor_urut || '',
          nama: anggotaTarget.nama || anggotaTarget.nama_lengkap || '',
          nik: anggotaTarget.nik || '',
          hubungan_keluarga: parseDropdownValue(anggotaTarget.status_hubungan_keluarga, opsiHubungan),
          hubungan_lainnya: anggotaTarget.hubungan_lainnya || '',
          status_penduduk: parseDropdownValue(anggotaTarget.status_penduduk || 'Hidup', opsiStatusPenduduk),
          tempat_lahir: anggotaTarget.tempat_lahir || '',
          tanggal_lahir: tglLahirFormatted,
          jenis_kelamin: parseDropdownValue(anggotaTarget.jenis_kelamin, opsiJenisKelamin),
          agama: parseDropdownValue(anggotaTarget.agama, opsiAgama),
          agama_lainnya: anggotaTarget.agama_lainnya || '',
          status_perkawinan: parseDropdownValue(anggotaTarget.status_perkawinan, opsiPerkawinan),
          pendidikan_kk: parseDropdownValue(anggotaTarget.pendidikan_tertinggi, opsiPendidikan),
          pekerjaan: parseDropdownValue(anggotaTarget.pekerjaan, opsiPekerjaan)
        });
      }
    } else {
      // 🔵 MODE TAMBAH: Hitung No Urut Baru
      const anggotaKeluargaIni = dataPendudukLokal.filter(p => p.id_keluarga === idKeluarga);
      setFormData(prev => ({
        ...prev,
        nomor_urut: (anggotaKeluargaIni.length + 1).toString(),
        status_penduduk: '1' // Default: Hidup
      }));
    }
  }, [idKeluarga, idPenduduk, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.hubungan_keluarga) return alert("Pilih Hubungan dengan Kepala Keluarga!");
    if (!formData.status_penduduk) return alert("Pilih Status Penduduk!");
    if (!formData.jenis_kelamin) return alert("Pilih Jenis Kelamin!");

    let dataPendudukLokal = JSON.parse(localStorage.getItem('data_penduduk'));
    if (!Array.isArray(dataPendudukLokal)) dataPendudukLokal = [];

    // 🔥 GABUNGKAN data asli dengan data yang diedit agar data lain tidak terhapus
    const dataDisimpan = {
      ...(originalData || {}),
      ...formData,
      id_keluarga: idKeluarga,
      id_penduduk: idPenduduk || `PND-${Date.now()}`,
      synced: false // Cascade Unsync
    };

    if (idPenduduk) {
      const index = dataPendudukLokal.findIndex(p => p.id_penduduk === idPenduduk);
      if (index !== -1) dataPendudukLokal[index] = dataDisimpan;
    } else {
      dataPendudukLokal.push(dataDisimpan);
    }
    
    localStorage.setItem('draft_blok3_anggota_keluarga', JSON.stringify(dataPendudukLokal));

    // Cascade Unsync Keluarga
    let dataKeluargaLokal = JSON.parse(localStorage.getItem('data_keluarga'));
    if (Array.isArray(dataKeluargaLokal)) {
      const indexKeluarga = dataKeluargaLokal.findIndex(k => k.id_keluarga === idKeluarga);
      if (indexKeluarga !== -1) {
        dataKeluargaLokal[indexKeluarga].synced = false;
        dataKeluargaLokal[indexKeluarga].status = 'draft';
        localStorage.setItem('data_keluarga', JSON.stringify(dataKeluargaLokal));
      }
    }

    navigate(`/form/blok3/detail-keluarga?id_keluarga=${idKeluarga}`);
  };

  const handleBackClick = () => {
    const isFormFilled = formData.nama || formData.nik || formData.tempat_lahir;
    if (isFormFilled && !idPenduduk) {
      setShowExitModal(true); // Hanya munculkan modal jika mengisi data BARU
    } else {
      navigate(`/form/blok3/detail-keluarga?id_keluarga=${idKeluarga}`);
    }
  };

  const getSelectObj = (options, val) => options.find(opt => opt.value === val) || null;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="flex-1 w-full max-w-xl mx-auto p-4 md:p-8 relative z-10 pb-28 flex flex-col justify-center">
        <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-white/30">
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-3 rounded-xl text-white shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-teal-600 tracking-wide uppercase">Blok III</p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                {idPenduduk ? 'Edit Data Anggota' : 'Tambah Anggota Keluarga'}
              </h1>
            </div>
          </div>

          <form id="form-anggota" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Nomor Urut & 3. NIK */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">1. No. Urut</label>
                <input
                  type="number"
                  name="nomor_urut"
                  min="1"
                  required
                  value={formData.nomor_urut}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="Contoh: 1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">3. NIK</label>
                <input
                  type="text"
                  name="nik"
                  maxLength="16"
                  value={formData.nik}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="16 Digit NIK"
                />
              </div>
            </div>

            {/* 2. Nama */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">2. Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                required
                value={formData.nama}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                placeholder="Nama sesuai KTP/KK"
              />
            </div>

            {/* 4. Status Hubungan dengan KK */}
            <div className="relative z-50">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">4. Status Hubungan dengan Kepala Keluarga</label>
              <Select
                options={opsiHubungan}
                value={getSelectObj(opsiHubungan, formData.hubungan_keluarga)}
                onChange={(option) => handleSelectChange('hubungan_keluarga', option)}
                styles={customSelectStyles}
                placeholder="-- Pilih Hubungan --"
              />
              {formData.hubungan_keluarga === '10' && (
                <input
                  type="text"
                  name="hubungan_lainnya"
                  required
                  value={formData.hubungan_lainnya}
                  onChange={handleChange}
                  className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  placeholder="Tuliskan spesifik hubungan lainnya..."
                />
              )}
            </div>

            {/* 5. Status Penduduk */}
            <div className="relative z-40">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">5. Status Penduduk</label>
              <Select
                options={opsiStatusPenduduk}
                value={getSelectObj(opsiStatusPenduduk, formData.status_penduduk)}
                onChange={(option) => handleSelectChange('status_penduduk', option)}
                styles={customSelectStyles}
                placeholder="-- Pilih Status Penduduk --"
                isSearchable={false}
              />
            </div>

            {/* 6. Tempat Tanggal Lahir */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">6. Tempat & Tanggal Lahir</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="tempat_lahir"
                  required
                  value={formData.tempat_lahir}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="Tempat Lahir"
                />
                <input
                  type="date"
                  name="tanggal_lahir"
                  required
                  value={formData.tanggal_lahir}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-slate-700"
                />
              </div>
            </div>

            {/* 7. Jenis Kelamin */}
            <div className="relative z-30">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">7. Jenis Kelamin</label>
              <Select
                options={opsiJenisKelamin}
                value={getSelectObj(opsiJenisKelamin, formData.jenis_kelamin)}
                onChange={(option) => handleSelectChange('jenis_kelamin', option)}
                styles={customSelectStyles}
                placeholder="-- Pilih Jenis Kelamin --"
                isSearchable={false}
              />
            </div>

            {/* 8. Agama */}
            <div className="relative z-20">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">8. Agama</label>
              <Select
                options={opsiAgama}
                value={getSelectObj(opsiAgama, formData.agama)}
                onChange={(option) => handleSelectChange('agama', option)}
                styles={customSelectStyles}
                placeholder="-- Pilih Agama --"
                isSearchable={false}
              />
              {formData.agama === '7' && (
                <input
                  type="text"
                  name="agama_lainnya"
                  required
                  value={formData.agama_lainnya}
                  onChange={handleChange}
                  className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  placeholder="Sebutkan kepercayaan..."
                />
              )}
            </div>

            {/* 9. Status Perkawinan */}
            <div className="relative z-10">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">9. Status Perkawinan</label>
              <Select
                options={opsiPerkawinan}
                value={getSelectObj(opsiPerkawinan, formData.status_perkawinan)}
                onChange={(option) => handleSelectChange('status_perkawinan', option)}
                styles={customSelectStyles}
                placeholder="-- Pilih Status Perkawinan --"
                isSearchable={false}
              />
            </div>

            {/* 10. Pendidikan Tertinggi */}
            <div className="relative z-0">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">10. Pendidikan Tertinggi</label>
              <Select
                options={opsiPendidikan}
                value={getSelectObj(opsiPendidikan, formData.pendidikan_kk)}
                onChange={(option) => handleSelectChange('pendidikan_kk', option)}
                styles={customSelectStyles}
                placeholder="-- Pilih Pendidikan --"
              />
            </div>

            {/* 11. Pekerjaan */}
            <div className="relative z-0">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">11. Pekerjaan</label>
              <Select
                options={opsiPekerjaan}
                value={getSelectObj(opsiPekerjaan, formData.pekerjaan)}
                onChange={(option) => handleSelectChange('pekerjaan', option)}
                styles={customSelectStyles}
                placeholder="-- Pilih Pekerjaan --"
              />
            </div>

          </form>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-4 z-40">
        <div className="max-w-xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="inline">Kembali</span>
          </button>
          
          <button
            type="submit"
            form="form-anggota"
            className="w-1/2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Simpan Anggota</span>
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Batal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Batal Menambahkan?</h3>
              <p className="text-slate-600 mb-6 text-sm">
                Data anggota keluarga yang sedang diisi akan hilang.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
                >
                  Teruskan Mengisi
                </button>
                <button
                  onClick={() => navigate(`/form/blok3/detail-keluarga?id_keluarga=${idKeluarga}`)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition shadow-md"
                >
                  Ya, Buang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}