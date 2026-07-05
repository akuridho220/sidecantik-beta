import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ListKuesioner from './pages/ListKuesioner';
import FormKuesioner from './pages/FormKuesioner';
import InstallButton from "./components/InstallButton";
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="w-full max-w-md min-h-screen bg-[#f4f4f3] shadow-xl p-6 relative">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<Home />} />
            <Route path="/list" element={<ListKuesioner />} />
            <Route path="/form" element={<FormKuesioner />} />
          </Route>
        </Routes>
      </div>
      <InstallButton />
    </Router>
  );
}

export default App;