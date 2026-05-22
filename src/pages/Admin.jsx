import React, { useState, useEffect, useRef } from 'react';
import { Users, Calendar, Settings, Plus, Trash2, Upload, FileText, Bell, CheckCircle, Smartphone, Activity, BarChart2, ShoppingBag } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard'; // Import Dashboard
import AdminStore from '../components/AdminStore'; // Import Store Manager

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard
  
  // Classes State
  const [classesList, setClassesList] = useState([]);
  const [usersList, setUsersList] = useState([]); 
  
  const { deleteUser, updateUserField, sendNotification, markAttendance } = useAuth();
  
  // ... (rest of state) ...

  const [scanResult, setScanResult] = useState(null); 
  const scannerRef = useRef(null);

  // ... (useEffects) ...

  // ... (onScan methods) ...

  // ... (handleCheckIn) ...

  // ... (fetch methods) ...

  // ... (handle methods) ...

  return (
    <div className="container section animate-fade-in">
      <h1 className="mb-4">Panel de Administración</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'dashboard' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: activeTab === 'dashboard' ? '#000' : '#fff'
          }}>
          <BarChart2 size={18} style={{ marginRight: '8px' }} /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'users' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: activeTab === 'users' ? '#000' : '#fff'
          }}>
          <Users size={18} style={{ marginRight: '8px' }} /> Alumnos
        </button>
        <button 
          onClick={() => setActiveTab('classes')}
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'classes' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: activeTab === 'classes' ? '#000' : '#fff'
          }}>
          <Calendar size={18} style={{ marginRight: '8px' }} /> Clases
        </button>
        <button 
          onClick={() => setActiveTab('scanner')}
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'scanner' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: activeTab === 'scanner' ? '#000' : '#fff'
          }}>
          <Smartphone size={18} style={{ marginRight: '8px' }} /> Escáner
        </button>
        <button 
          onClick={() => setActiveTab('store')}
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'store' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: activeTab === 'store' ? '#000' : '#fff'
          }}>
          <ShoppingBag size={18} style={{ marginRight: '8px' }} /> Tienda
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && <AdminDashboard />}

      {/* Store Tab */}
      {activeTab === 'store' && <AdminStore />}

      {/* Scanner Tab */}
      {activeTab === 'scanner' && (
          <div className="card text-center" style={{ minHeight: '400px' }}>
              <h3>Escanear Credencial</h3>
              <p className="text-muted mb-4">Apunta la cámara al código QR del alumno.</p>
              
              <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', border: '1px solid #333' }}></div>

              {scanResult && (
                  <div className="animate-fade-in" style={{ 
                      marginTop: '24px', padding: '16px', borderRadius: '12px',
                      backgroundColor: scanResult.success ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                      border: `1px solid ${scanResult.success ? '#4caf50' : '#f44336'}`
                  }}>
                      {scanResult.success ? (
                          <>
                            <CheckCircle size={48} color="#4caf50" style={{ marginBottom: '12px' }} />
                            <h2>{scanResult.message}</h2>
                            <p>Asistencias: {scanResult.user.attendance}</p>
                          </>
                      ) : (
                          <>
                            <Activity size={48} color="#f44336" style={{ marginBottom: '12px' }} />
                            <h2>Error de Acceso</h2>
                            <p>{scanResult.message}</p>
                          </>
                      )}
                  </div>
              )}
          </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
          <div className="card">
            <h3 className="mb-4">Gestión Total</h3>

            {usersList.length === 0 ? (
                <p className="text-muted text-center">No hay alumnos registrados.</p>
            ) : (
                <div style={{ display: 'grid', gap: '24px' }}>
                    {usersList.map((item) => (
                    <div key={item.id} style={{ 
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px',
                        backgroundColor: 'rgba(255,255,255,0.02)'
                    }}>
                        {/* Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{item.name}</h4>
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>{item.email} • {item.plan || 'Sin Plan'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {/* Payment Status Toggle */}
                                <button 
                                    onClick={() => updateUserField(item.id, 'paymentStatus', item.paymentStatus === 'Paid' ? 'Overdue' : 'Paid')}
                                    className="btn"
                                    style={{ 
                                        padding: '6px 12px', fontSize: '0.8rem', 
                                        backgroundColor: item.paymentStatus === 'Paid' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                        color: item.paymentStatus === 'Paid' ? '#4caf50' : '#f44336',
                                        border: `1px solid ${item.paymentStatus === 'Paid' ? '#4caf50' : '#f44336'}`
                                    }}>
                                    {item.paymentStatus === 'Paid' ? 'Al Día' : 'Debe Cuota'}
                                </button>
                                
                                {/* Attendance */}
                                <button 
                                    onClick={() => markAttendance(item.id)}
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                    title="Marcar Asistencia">
                                    <Activity size={14} style={{ marginRight: '4px' }} /> +1 ({item.attendance || 0})
                                </button>

                                {/* Delete */}
                                <button 
                                    onClick={() => { if(window.confirm('¿Borrar alumno?')) deleteUser(item.id); }} 
                                    className="btn" 
                                    style={{ background: 'none', color: '#ff4d4d', padding: '8px' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Expandable Controls */}
                        <div style={{ 
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', 
                            paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' 
                        }}>
                            
                            {/* Routine Editor */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                                    <FileText size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                                    Rutina (Texto o PDF)
                                </label>
                                <textarea 
                                    defaultValue={item.routine || ''}
                                    placeholder="Escribe la rutina..."
                                    onChange={(e) => handleRoutineChange(item.id, e.target.value)}
                                    style={{ 
                                        width: '100%', height: '80px', background: '#222', 
                                        border: '1px solid #333', borderRadius: '8px', color: '#ccc', padding: '8px', resize: 'vertical', marginBottom: '8px'
                                    }}
                                />
                                <input 
                                    type="file" 
                                    accept="application/pdf"
                                    onChange={(e) => handleFileChange(item.id, e.target.files[0])}
                                    style={{ fontSize: '0.8rem', color: '#aaa', width: '100%' }}
                                />
                            </div>

                            {/* Notifications & Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                                        <Bell size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                                        Mensaje / Notificación
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Pago vencido..."
                                        value={notifMsgs[item.id] || ''}
                                        onChange={(e) => handleNotifChange(item.id, e.target.value)}
                                        style={{ 
                                            width: '100%', background: '#222', border: '1px solid #333', 
                                            borderRadius: '8px', color: '#ccc', padding: '8px' 
                                        }}
                                    />
                                </div>
                                
                                <button 
                                    onClick={() => handleSaveChanges(item.id, item.routine)}
                                    className="btn btn-primary"
                                    style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
                                    <CheckCircle size={18} style={{ marginRight: '8px' }} /> Guardar y Enviar
                                </button>
                            </div>

                        </div>
                    </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
          <div className="card">
              <h3 className="mb-4">Reservas y Cupos</h3>
               {classesList.map(c => (
                   <div key={c.id} style={{ 
                       marginBottom: '20px', padding: '16px', borderRadius: '8px', 
                       backgroundColor: c.attendees && c.attendees.length > 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)',
                       border: '1px solid rgba(255,255,255,0.1)'
                   }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                           <div>
                               <h4 style={{ margin: 0 }}>{c.name} <span className="text-muted" style={{ fontSize: '0.9rem', paddingLeft: '8px' }}>{c.time} • {c.trainer}</span></h4>
                               <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                   <span style={{ fontSize: '0.9rem' }}>Cupo Total:</span>
                                   <input 
                                     type="number" 
                                     defaultValue={c.total} 
                                     onBlur={(e) => handleUpdateCapacity(c.id, e.target.value)}
                                     style={{ width: '60px', padding: '4px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                                   />
                                   <span className="text-muted" style={{ fontSize: '0.8rem' }}>(Libres: {c.slots})</span>
                               </div>
                           </div>
                           <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{c.attendees ? c.attendees.length : 0} Anotados</span>
                       </div>

                       {c.attendees && c.attendees.length > 0 ? (
                           <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0 }}>
                               {c.attendees.map((a, idx) => (
                                   <li key={idx} style={{ 
                                       marginBottom: '6px', padding: '8px', background: 'rgba(255,255,255,0.03)', 
                                       borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                   }}>
                                       <span><strong>{a.name}</strong> <span className="text-muted">({a.email})</span></span>
                                       <button 
                                         onClick={() => handleRemoveAttendee(c.id, a.id)}
                                         className="btn" 
                                         style={{ padding: '4px 8px', color: '#ff4d4d', background: 'rgba(255,0,0,0.1)', fontSize: '0.8rem' }}>
                                         <XCircle size={16} /> Sacar
                                       </button>
                                   </li>
                               ))}
                           </ul>
                       ) : (
                           <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Sin alumnos.</p>
                       )}
                   </div>
               ))}
          </div>
      )}
    </div>
  );
}
