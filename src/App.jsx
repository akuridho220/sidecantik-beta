import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ListKeluarga from './pages/ListKeluarga';
import InstallButton from "./components/InstallButton";
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DetailKeluarga from './pages/DetailKeluarga';
import FormulirBlok1 from './pages/FormulirBlok1';
import FormulirBlok2 from './pages/FormulirBlok2';
import FormulirBlok3 from './pages/FormulirBlok3';
import FormulirBlok4 from './pages/FormulirBlok4';

function App() {
  return (
    <Router>
      <div className="w-full max-w-md min-h-screen bg-[#f4f4f3] shadow-xl p-2 relative">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<Home />} />
            <Route path="/list-keluarga" element={<ListKeluarga />} />
            <Route path="/form/blok1" element={<FormulirBlok1 />} />
            <Route path="/form/blok2" element={<FormulirBlok2 />} />
            <Route path='/form/blok3/detail-keluarga' element={<DetailKeluarga />} />
            <Route path='/form/blok3' element={<FormulirBlok3 />} />
            <Route path='/form/blok4' element={<FormulirBlok4 />} />
          </Route>
        </Routes>
      </div>
      <InstallButton />
    </Router>
  );
}

export default App;