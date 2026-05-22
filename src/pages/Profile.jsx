import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Award,
  Calendar,
  Bell,
  FileText,
  AlertTriangle,
  CreditCard,
  History,
  RefreshCcw,
  Plus,
  Medal,
  QrCode,
} from "lucide-react";
import ProgressChart from "../components/ProgressChart";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, registerPayment } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [nextClass, setNextClass] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Progress State
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  const navigate = useNavigate();

  // Fetch classes to see bookings
  React.useEffect(() => {
    if (user) {
      fetch("/api/classes")
        .then((res) => res.json())
        .then((data) => {
          const myClasses = data.filter(
            (c) => c.attendees && c.attendees.some((u) => u.id === user.id),
          );
          if (myClasses.length > 0) {
            setNextClass(myClasses[0]); // Just taking the first one for simplicity
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const handleUpdateWeight = async (e) => {
    e.preventDefault();
    // Call API
    try {
      const res = await fetch(`/api/users/${user.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: newWeight,
          date: new Date().toLocaleDateString(),
        }),
      });
      if (res.ok) {
        alert(
          "Peso registrado. Recarga para ver cambios (o implementa live reload en contexto)",
        );
        setShowWeightModal(false);
        setNewWeight("");
        // Ideally update context user here
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="container section">Cargando...</div>;

  const isOverdue = user.paymentStatus === "Overdue";

  const handlePayment = () => {
    const amount = user.plan === "Personalizado (Pro)" ? 5000 : 3000;
    if (window.confirm(`¿Confirmar pago de $${amount} por ${user.plan}?`)) {
      registerPayment(user.id, amount, user.plan);
      alert("¡Pago registrado con éxito!");
    }
  };

  const goToChangePlan = () => {
    navigate("/plans");
  };

  return (
    <div className="container section animate-fade-in">
      {/* Payment Alert */}
      {isOverdue && (
        <div
          style={{
            backgroundColor: "rgba(244, 67, 54, 0.1)",
            border: "1px solid #f44336",
            color: "#f44336",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <AlertTriangle size={24} />
          <div>
            <strong>¡Atención! Tu cuota está vencida.</strong>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Realiza el pago a continuación para regularizar tu situación.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "var(--color-surface-hover)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>
              {user.name}
            </h1>
            <p className="text-muted">
              {user.role === "admin" ? "Administrador" : `Miembro`}
            </p>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              {user.email} • {user.plan || "Sin Plan"}
            </p>
            <button
              onClick={() => setShowQR(true)}
              className="btn btn-sm btn-outline"
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <QrCode size={16} /> Ver mi Credencial
            </button>
          </div>
        </div>

        {/* Notifications Icon */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ background: "none", color: "#fff", position: "relative" }}
          >
            <Bell size={28} />
            {user.notifications?.some((n) => !n.read) && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "10px",
                  height: "10px",
                  background: "red",
                  borderRadius: "50%",
                }}
              ></span>
            )}
          </button>
          {showNotifs && (
            <div
              className="card animate-fade-in"
              style={{
                position: "absolute",
                top: "40px",
                right: 0,
                width: "300px",
                zIndex: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  fontWeight: "bold",
                }}
              >
                Notificaciones
              </div>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {user.notifications && user.notifications.length > 0 ? (
                  user.notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "0.9rem",
                      }}
                    >
                      <p style={{ margin: "0 0 4px 0" }}>{n.message}</p>
                      <small className="text-muted">{n.date}</small>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    Sin mensajes nuevos
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {user.role === "admin" ? (
        <div className="card text-center">
          <h3>Cuenta de Administrador</h3>
          <p className="text-muted">
            Gestiona usuarios y clases desde el panel principal.
          </p>
          <Link to="/admin" className="btn btn-primary mt-4">
            Ir al Panel
          </Link>
        </div>
      ) : (
        <>
          {/* Badges Section (New) */}
          {user.badges && user.badges.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Award className="text-primary" /> Mis Logros
              </h3>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {user.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minWidth: "150px",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(239, 68, 68, 0.2)",
                        padding: "8px",
                        borderRadius: "50%",
                      }}
                    >
                      <Medal size={20} color="var(--color-primary)" />
                    </div>
                    <span style={{ textTransform: "capitalize" }}>
                      {badge.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unified Profile Grid */}
          <div className="profile-grid" style={{ marginBottom: "24px" }}>
            {/* Payment Card */}
            <div
              className="card"
              style={{
                border: isOverdue
                  ? "1px solid #f44336"
                  : "1px solid var(--color-primary)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <CreditCard
                  color={isOverdue ? "#f44336" : "var(--color-primary)"}
                />
                <h3>Estado de Cuota</h3>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: isOverdue ? "#f44336" : "#4caf50",
                  }}
                >
                  {isOverdue ? "VENCIDO" : "AL DIA"}
                </span>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                  Plan Actual: {user.plan || "Ninguno"}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handlePayment}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Pagar Cuota
                </button>
                <button
                  onClick={goToChangePlan}
                  className="btn btn-secondary"
                  title="Cambiar Plan"
                >
                  <RefreshCcw size={18} />
                </button>
              </div>
            </div>

            {/* Payment History */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <History className="text-muted" />
                <h3>Historial de Pagos</h3>
              </div>
              <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                {user.payments && user.payments.length > 0 ? (
                  <table
                    style={{
                      width: "100%",
                      fontSize: "0.9rem",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          color: "var(--color-text-muted)",
                          textAlign: "left",
                        }}
                      >
                        <th style={{ paddingBottom: "8px" }}>Fecha</th>
                        <th style={{ paddingBottom: "8px" }}>Monto</th>
                        <th style={{ paddingBottom: "8px" }}>Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.payments.map((p) => (
                        <tr
                          key={p.id}
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <td style={{ padding: "8px 0" }}>{p.date}</td>
                          <td style={{ padding: "8px 0" }}>${p.amount}</td>
                          <td style={{ padding: "8px 0" }}>
                            {p.plan?.split(" ")[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                    No hay pagos registrados.
                  </p>
                )}
              </div>
            </div>

            {/* Progress Card (New) */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <TrendingUp className="text-primary" />
                  <h3>Mi Progreso</h3>
                </div>
                <button
                  onClick={() => setShowWeightModal(true)}
                  className="btn btn-sm"
                  style={{ padding: "4px 8px" }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div style={{ height: "200px" }}>
                <ProgressChart data={user.progress} />
              </div>
            </div>

            {/* Routine Card */}
            <div className="card" style={{ gridColumn: "span 1" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <FileText className="text-primary" />
                <h3>Mi Rutina</h3>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "16px",
                  borderRadius: "8px",
                  minHeight: "100px",
                }}
              >
                {user.routine ? (
                  <div style={{ whiteSpace: "pre-wrap", marginBottom: "12px" }}>
                    {user.routine}
                  </div>
                ) : (
                  !user.routinePdf && (
                    <p className="text-muted">
                      Tu entrenador aún no ha cargado tu rutina.
                    </p>
                  )
                )}

                {user.routinePdf && (
                  <a
                    href={`http://localhost:3001${user.routinePdf}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      display: "block",
                      textAlign: "center",
                      backgroundColor: "var(--color-surface-hover)",
                      color: "var(--color-text)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "10px",
                    }}
                  >
                    📄 Ver Rutina (PDF)
                  </a>
                )}
              </div>
            </div>

            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <TrendingUp className="text-primary" />
                <h3>Asistencias</h3>
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "bold",
                  color: "var(--color-primary)",
                }}
              >
                {user.attendance || 0}
              </div>
              <p className="text-muted">Visitas totales al gimnasio</p>
            </div>

            {/* Upcoming Classes */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <Calendar color="#fff" />
                <h3>Proxima Clase</h3>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                {nextClass ? (
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "1.1rem",
                        color: "var(--color-primary)",
                      }}
                    >
                      {nextClass.name}
                    </strong>
                    <span style={{ fontSize: "0.9rem" }}>
                      {nextClass.time} • {nextClass.trainer}
                    </span>
                  </div>
                ) : (
                  <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                    No tienes clases reservadas.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* QR Modal */}
      {showQR && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowQR(false)}
        >
          <div
            className="card animate-fade-in text-center"
            style={{ width: "90%", maxWidth: "300px", padding: "32px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4">Mi Credencial Digital</h3>
            <div
              style={{
                background: "#fff",
                padding: "16px",
                borderRadius: "12px",
                display: "inline-block",
                marginBottom: "24px",
              }}
            >
              <QRCodeSVG value={String(user.id)} size={200} />
            </div>
            <p className="text-muted">Presenta este código en la entrada</p>
            <button
              onClick={() => setShowQR(false)}
              className="btn btn-secondary mt-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {showWeightModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="card animate-fade-in"
            style={{ width: "90%", maxWidth: "350px" }}
          >
            <h3>Registrar Peso</h3>
            <form onSubmit={handleUpdateWeight}>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 75.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "16px",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
