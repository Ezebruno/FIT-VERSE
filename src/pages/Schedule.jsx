import React, { useState, useEffect } from "react";
import { Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Schedule() {
  const [classes, setClasses] = useState([]);
  const [booked, setBooked] = useState([]); // In a real app, this should be derived from user history or API
  const { isAdmin, user } = useAuth(); // Hook for Admin check

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data);

      // Determine if user has booked (client-side check for now)
      if (user && data.length > 0) {
        const userBookedIds = data
          .filter(
            (c) => c.attendees && c.attendees.some((u) => u.id === user.id),
          )
          .map((c) => c.id);
        setBooked(userBookedIds);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const [expandedClass, setExpandedClass] = useState(null);

  const toggleClass = (id) => {
    setExpandedClass((prev) => (prev === id ? null : id));
  };

  const handleBook = async (classId) => {
    if (isAdmin) return;
    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }

    try {
      const res = await fetch("/api/classes/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, userId: user.id }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("¡Clase reservada con éxito!");
        fetchClasses(); // Refresh data
      } else {
        alert(data.message || "Error al reservar");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="container section animate-fade-in">
      <h1 className="mb-4">Horario de Clases</h1>

      {!isAdmin && (
        <p className="mb-4 text-muted">
          Reserva tu lugar ahora. Los espacios son limitados!
        </p>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {classes.map((c) => {
          const isFull = c.slots === 0;
          const isBooked = booked.includes(c.id);
          const isExpanded = expandedClass === c.id;

          return (
            <div
              key={c.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                borderLeft: `4px solid ${c.intensity === "High" || c.intensity === "Very High" ? "var(--color-primary)" : "var(--color-secondary)"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  width: "100%",
                }}
              >
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <h3 style={{ marginBottom: "4px" }}>{c.name}</h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      color: "var(--color-text-muted)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Clock size={16} /> {c.time}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Users size={16} /> {c.trainer}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: "120px" }}>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      marginBottom: "8px",
                      color: isFull ? "#ff4d4d" : "var(--color-primary)",
                    }}
                  >
                    {isFull ? "LLENO" : `${c.slots} lugares`}
                  </div>

                  {isAdmin ? (
                    <button
                      onClick={() => toggleClass(c.id)}
                      className="btn"
                      style={{
                        backgroundColor: isExpanded
                          ? "var(--color-primary)"
                          : "#333",
                        color: isExpanded ? "#000" : "#fff",
                        border: "1px solid var(--color-primary)",
                      }}
                    >
                      {isExpanded ? "Ocultar" : "Ver Alumnos"}
                    </button>
                  ) : isBooked ? (
                    <button
                      className="btn"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        cursor: "default",
                      }}
                      disabled
                    >
                      <CheckCircle size={18} style={{ marginRight: "6px" }} />{" "}
                      Reservado
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBook(c.id)}
                      disabled={isFull}
                      className="btn btn-primary"
                      style={{
                        opacity: isFull ? 0.5 : 1,
                        cursor: isFull ? "not-allowed" : "pointer",
                      }}
                    >
                      {isFull ? "Lista de espera" : "Reservar"}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Attendee List */}
              {isExpanded && (
                <div
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    paddingTop: "16px",
                  }}
                  className="animate-fade-in"
                >
                  <h4
                    style={{
                      fontSize: "1rem",
                      color: "#ccc",
                      marginBottom: "12px",
                    }}
                  >
                    Inscriptos ({c.attendees ? c.attendees.length : 0}):
                  </h4>
                  {c.attendees && c.attendees.length > 0 ? (
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "8px",
                      }}
                    >
                      {c.attendees.map((a, idx) => (
                        <li
                          key={idx}
                          style={{
                            padding: "8px",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        >
                          <div style={{ fontWeight: "bold" }}>{a.name}</div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {a.email}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                      Nadie se ha anotado aún.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
