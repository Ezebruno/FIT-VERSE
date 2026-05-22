
import React, { useState } from 'react';
import { Check, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Plans() {
  const { updateUserPlan, user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(user?.plan === 'Personalizado (Pro)' ? 'pro' : 'common');

  const handleSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleConfirm = () => {
    // In a real app, here we would process the payment or card setup
    updateUserPlan(selectedPlan);
    alert(`¡Plan actualizado a ${selectedPlan === 'pro' ? 'Pro' : 'Común'} exitosamente!`);
    navigate('/profile');
  };

  return (
    <div className="container section animate-fade-in">
      <h1 className="text-center mb-4">Elige tu Plan</h1>
      <p className="text-center text-muted" style={{ marginBottom: '60px' }}>Mejora tu entrenamiento con nuestras opciones premium.</p>

      <div className="plans-grid">
        
        {/* Common Plan */}
        <div className="card" 
             onClick={() => handleSelect('common')}
             style={{ 
               border: selectedPlan === 'common' ? '2px solid var(--color-primary)' : '1px solid var(--color-surface-hover)',
               cursor: 'pointer',
               transform: selectedPlan === 'common' ? 'scale(1.02)' : 'scale(1)',
               transition: 'all 0.3s'
             }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
             <h3>Plan Común</h3>
             <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$3.000<span style={{ fontSize: '1rem', color: '#888' }}>/mes</span></div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
            <li style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}><Check size={18} className="text-primary"/> Acceso ilimitado a máquinas</li>
            <li style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}><Check size={18} className="text-primary"/> Vestuarios y duchas</li>
            <li style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}><Check size={18} className="text-primary"/> WiFi Gratis</li>
          </ul>
          <button className="btn" style={{ 
              width: '100%', 
              backgroundColor: selectedPlan === 'common' ? 'var(--color-primary)' : 'var(--color-surface-hover)',
              color: selectedPlan === 'common' ? '#000' : 'var(--color-text)'
          }}>
            {selectedPlan === 'common' ? 'Seleccionado' : 'Elegir Plan'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="card" 
             onClick={() => handleSelect('pro')}
             style={{ 
               border: selectedPlan === 'pro' ? '2px solid var(--color-primary)' : '1px solid var(--color-surface-hover)',
               cursor: 'pointer',
               transform: selectedPlan === 'pro' ? 'scale(1.02)' : 'scale(1)',
               transition: 'all 0.3s',
               position: 'relative',
               overflow: 'hidden'
             }}>
          <div style={{
              position: 'absolute', top: '16px', right: '16px', 
              backgroundColor: 'var(--color-primary)', color: '#FFFFFF', 
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 10
          }}>RECOMENDADO</div>

          <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '24px' }}>
             <h3>Plan Personalizado</h3>
             <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$5.000<span style={{ fontSize: '1rem', color: '#888' }}>/mes</span></div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
            <li style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}><Check size={18} className="text-primary"/> Rutina personalizada por App</li>
            <li style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}><Check size={18} className="text-primary"/> Seguimiento con entrenador</li>
            <li style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}><Check size={18} className="text-primary"/> Todo lo del Plan Común</li>
          </ul>
          <button className="btn" style={{ 
              width: '100%', 
              backgroundColor: selectedPlan === 'pro' ? 'var(--color-primary)' : 'var(--color-surface-hover)',
              color: selectedPlan === 'pro' ? '#000' : 'var(--color-text)'
          }}>
            {selectedPlan === 'pro' ? 'Seleccionado' : 'Elegir Plan'}
          </button>
        </div>

      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button onClick={handleConfirm} className="btn btn-primary" style={{ padding: '12px 48px', fontSize: '1.2rem' }}>
              Confirmar Cambio de Plan
          </button>
      </div>
    </div>
  );
}
