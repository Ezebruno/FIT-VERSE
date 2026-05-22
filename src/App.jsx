

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Plans from './pages/Plans';
import Store from './pages/Store'; // Import Store
import Leaderboard from './pages/Leaderboard'; // Import Leaderboard

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Changed from named to default import
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const location = useLocation();
  const showFooter = location.pathname !== '/login';

  return (
    <AuthProvider>
      <ErrorBoundary>
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/store" element={<Store />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: 'var(--color-surface)', padding: '2rem 0', marginTop: 'auto', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="container">
            <p>&copy; 2025 TrainX Gym. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
