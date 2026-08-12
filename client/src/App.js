import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import HomePage from './pages/HomePage';
import StoryPage from './pages/StoryPage';
import CapsulePage from './pages/CapsulePage';
import SharedCapsulePage from './pages/SharedCapsulePage';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  // Site-wide cursor-tracking glow — updates CSS vars read by .cursor-glow
  const frameRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const applyPosition = () => {
      document.documentElement.style.setProperty('--cursor-x', `${posRef.current.x}px`);
      document.documentElement.style.setProperty('--cursor-y', `${posRef.current.y}px`);
      frameRef.current = null;
    };
    const handleMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!frameRef.current) frameRef.current = requestAnimationFrame(applyPosition);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="app">
      <div className="cursor-glow" aria-hidden="true"></div>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/story/:date" element={<StoryPage />} />
          <Route path="/capsule/:date" element={<CapsulePage />} />
          <Route path="/share/:shareId" element={<SharedCapsulePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;