
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Calendar, User, LogOut, CreditCard, ShoppingBag, Trophy } from 'lucide-react'; // Added Trophy icon
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, logout, isAdmin } = useAuth(); // Destructure isAdmin

  const isActive = (path) => location.pathname === path ? 'var(--color-primary)' : 'var(--color-text)';

  if (location.pathname === '/login') return null; 

  return (
    <nav style={{ 
      backgroundColor: 'rgba(15, 23, 42, 0.8)', 
      backdropFilter: 'blur(10px)',
      padding: '1rem', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      borderBottom: '1px solid rgba(255,255,255,0.05)' 
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={isAdmin ? "/admin" : "/"} style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>

          <span style={{ letterSpacing: '-0.5px' }}>TRAIN<span style={{ color: 'var(--color-primary)' }}>X</span></span>
        </Link>
        
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
             <Link to="/schedule" style={{ color: isActive('/schedule'), transition: 'color 0.2s' }} title="Clases">
               <Calendar size={24} />
             </Link>
             
             {/* Show Plans link only for non-admins */}
             {!isAdmin && (
                 <>
                   <Link to="/plans" style={{ color: isActive('/plans'), transition: 'color 0.2s' }} title="Planes">
                     <CreditCard size={24} />
                   </Link>
                   <Link to="/store" style={{ color: isActive('/store'), transition: 'color 0.2s' }} title="Tienda">
                     <ShoppingBag size={24} />
                   </Link>
                   <Link to="/leaderboard" style={{ color: isActive('/leaderboard'), transition: 'color 0.2s' }} title="Ranking">
                     <Trophy size={24} />
                   </Link>
                 </>
             )}

             <Link to={isAdmin ? "/admin" : "/profile"} style={{ color: isActive(isAdmin ? "/admin" : "/profile"), transition: 'color 0.2s' }} title={isAdmin ? "Panel Admin" : "Perfil"}>
               <User size={24} />
             </Link>
             <button onClick={logout} className="btn" style={{ background: 'none', color: 'var(--color-primary)', padding: 0 }} title="Salir">
               <LogOut size={24} />
             </button>
          </div>
        )}
      </div>
    </nav>
  );
}
