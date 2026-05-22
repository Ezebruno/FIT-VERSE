import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  // Toggle between Login and Register
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register-specific Fields
  const [name, setName] = useState('');

  // UI States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, registerUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegistering) {
        // Register Logic
        const res = await registerUser({ name, email, password });
        if (res.success) {
            // Auto login after register
            await login(email, password);
            navigate('/');
        } else {
            setError(res.message);
        }
      } else {
        // Login Logic
        const result = await login(email, password);
        if (result.success) {
          if (result.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.');
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ 
      flex: 1, // Fill remaining space in main
      width: '100%',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: 'url(/assets/login-bg-new.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      padding: '20px' 
    }}>
      {/* Dark Overlay for readability */}
      <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1 
      }}></div>

      <div className="card animate-fade-in" style={{ 
          width: '100%', 
          maxWidth: '420px', 
          position: 'relative', 
          zIndex: 2,
          backgroundColor: 'var(--color-surface)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          boxShadow: 'var(--shadow-glow)', 
          padding: '40px',
          borderRadius: '16px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-1px', lineHeight: 1 }}>
                TRAIN<span style={{ color: 'var(--color-primary)' }}>X</span>
            </h2>
            <p className="text-muted" style={{ marginTop: '8px' }}>
                {isRegistering ? 'Únete a la élite.' : 'Accede a tu cuenta.'}
            </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Name Field - Only for Register */}
          {isRegistering && (
             <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Nombre Completo</label>
                <input 
                    type="text" 
                    placeholder="Ej. Juan Pérez" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ 
                        width: '100%', padding: '12px', borderRadius: '8px', 
                        border: '1px solid #444', backgroundColor: '#111', color: '#fff' 
                    }}
                />
             </div>
          )}

          <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Email o Usuario</label>
              <input 
                type="text" 
                placeholder="tu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                    width: '100%', padding: '12px', borderRadius: '8px', 
                    border: '1px solid #444', backgroundColor: '#111', color: '#fff' 
                }}
              />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Contraseña</label>
            <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                    width: '100%', padding: '12px', borderRadius: '8px', 
                    border: '1px solid #444', backgroundColor: '#111', color: '#fff' 
                }}
            />
          </div>

          {error && <div style={{ color: '#ff4d4d', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '10px', width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.1rem' }}>
            {loading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <p className="text-center mt-4 text-muted" style={{ fontSize: '0.9rem' }}>
          {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} 
          <button 
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            style={{ 
                background: 'none', border: 'none', color: 'var(--color-primary)', 
                fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' 
            }}
          >
            {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
}
