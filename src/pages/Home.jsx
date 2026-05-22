
import React from 'react';
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Home() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ 
        padding: '80px 20px', 
        textAlign: 'center', 
        background: 'linear-gradient(to bottom, rgba(239, 68, 68, 0.1), transparent)' 
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Transforma tu <span className="text-primary">Cuerpo</span><br />
            Transforma tu <span className="text-primary">Mente</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Únete a la comunidad de élite de TrainX. Equipo profesional, entrenadores expertos y un ambiente que te impulsa a superarte.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyItems: 'center', justifyContent: 'center' }}>
            <Link to="/schedule" className="btn btn-primary">
              Reserva una clase <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              Seguimiento del progreso
            </Link>
          </div>
        </div>
      </section>

      {/* Gym Info Grid */}
      <section className="container section">
        <h2 className="text-center mb-4">¿Por qué TrainX?</h2>
        <div className="features-grid">
          
          <div className="card">
            <Clock className="text-primary" size={32} style={{ marginBottom: '16px' }} />
            <h3>Entrená a tu ritmo</h3>
            <p className="text-muted">Sin horarios fijos. Vos elegís cuándo entrenar y cómo superarte..</p>
          </div>

          <div className="card">
            <Star className="text-primary" size={32} style={{ marginBottom: '16px' }} />
            <h3>Resultados reales</h3>
            <p className="text-muted">Planes pensados para progresar de verdad, no rutinas genéricas..</p>
          </div>

          <div className="card">
            <MapPin className="text-primary" size={32} style={{ marginBottom: '16px' }} />
            <h3>Un espacio que motiva</h3>
            <p className="text-muted">Ambiente moderno, energía positiva y foco en tu crecimiento..</p>
          </div>

        </div>
      </section>
    </div>
  );
}
