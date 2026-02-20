import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import LandingPreview from './pages/LandingPreview';
import { GlowingEffectDemo } from './components/glowing-effect-demo';

function App() {
  const hasSeenPreview = localStorage.getItem('hasSeenPreview') === 'true';

  return (
    <Router>
      <Routes>
        <Route path="/" element={hasSeenPreview ? <Navigate to="/verify" /> : <LandingPreview />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/preview" element={<LandingPreview />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard />
          }
        />
        <Route path="/demo" element={<GlowingEffectDemo />} />
      </Routes>
    </Router>
  );
}

export default App;
