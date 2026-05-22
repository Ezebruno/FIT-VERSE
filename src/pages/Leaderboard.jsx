import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, Flame } from "lucide-react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setLeaders(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading)
    return <div className="container section">Cargando ranking...</div>;

  return (
    <div className="container section animate-fade-in">
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <Trophy size={48} className="text-primary" />
          Tabla de Líderes
        </h1>
        <p className="text-muted">¡Los más constantes de TrainX!</p>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {leaders.map((user, index) => {
          let rankIcon = (
            <span
              style={{
                fontWeight: "bold",
                fontSize: "1.2rem",
                color: "#666",
                width: "24px",
                textAlign: "center",
              }}
            >
              {index + 1}
            </span>
          );
          let borderColor = "transparent";
          let bgColor = "var(--color-surface)";
          let scale = "1";

          if (index === 0) {
            rankIcon = <Trophy size={32} color="#FFD700" fill="#FFD700" />;
            borderColor = "#FFD700"; // Gold
            bgColor = "rgba(255, 215, 0, 0.1)";
            scale = "1.05";
          } else if (index === 1) {
            rankIcon = <Medal size={28} color="#C0C0C0" />;
            borderColor = "#C0C0C0"; // Silver
            bgColor = "rgba(192, 192, 192, 0.1)";
          } else if (index === 2) {
            rankIcon = <Medal size={28} color="#CD7F32" />;
            borderColor = "#CD7F32"; // Bronze
            bgColor = "rgba(205, 127, 50, 0.1)";
          }

          return (
            <div
              key={user.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
                border: `1px solid ${borderColor}`,
                background: bgColor,
                transform: `scale(${scale})`,
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "40px",
                }}
              >
                {rankIcon}
              </div>

              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-surface-hover)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{user.name}</h3>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    fontSize: "0.9rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {user.badges &&
                    user.badges.map((badge, i) => (
                      <span key={i} title={badge}>
                        <Award size={14} color="var(--color-primary)" />
                      </span>
                    ))}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {user.attendance}{" "}
                  <Flame size={20} fill="var(--color-primary)" />
                </div>
                <small className="text-muted">Asistencias</small>
              </div>
            </div>
          );
        })}

        {leaders.length === 0 && (
          <div className="text-center text-muted">
            Aún no hay datos suficientes.
          </div>
        )}
      </div>
    </div>
  );
}
