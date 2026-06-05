import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import HomePage from './pages/HomePage';
import CapsulePage from './pages/CapsulePage';
import SharedCapsulePage from './pages/SharedCapsulePage';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/capsule/:date" element={<CapsulePage />} />
          <Route path="/share/:shareId" element={<SharedCapsulePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;