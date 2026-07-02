import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ListKuesioner from './pages/ListKuesioner';
import FormKuesioner from './pages/FormKuesioner';
import InstallButton from "./components/InstallButton";

function App() {
  return (
    <Router>
      <div className="w-full max-w-md min-h-screen bg-white shadow-xl p-6 relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/list" element={<ListKuesioner />} />
          <Route path="/form" element={<FormKuesioner />} />
        </Routes>
      </div>
      <InstallButton />
    </Router>
  );
}

export default App;