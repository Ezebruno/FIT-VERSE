import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { DollarSign, Users, Activity, TrendingUp } from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!stats)
    return <div className="text-center p-5">Cargando estadísticas...</div>;

  // Data for Doughnut (Plans)
  const planData = {
    labels: Object.keys(stats.planStats),
    datasets: [
      {
        data: Object.values(stats.planStats),
        backgroundColor: ["#EF4444", "#00E0FF", "#666"],
        borderColor: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
        borderWidth: 1,
      },
    ],
  };

  // Data for Bar (Class Popularity)
  const classData = {
    labels: stats.classStats.map((c) => c.name),
    datasets: [
      {
        label: "Alumnos Inscriptos",
        data: stats.classStats.map((c) => c.count),
        backgroundColor: "#EF4444",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="animate-fade-in">
      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        <div
          className="card"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              background: "rgba(76, 175, 80, 0.2)",
              padding: "12px",
              borderRadius: "50%",
            }}
          >
            <DollarSign color="#4caf50" size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: "0.9rem" }}>
              Ingresos Totales
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              ${stats.totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              background: "rgba(0, 224, 255, 0.2)",
              padding: "12px",
              borderRadius: "50%",
            }}
          >
            <Users color="#00E0FF" size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: "0.9rem" }}>
              Usuarios Activos
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {stats.activeMembers} / {stats.totalUsers}
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              padding: "12px",
              borderRadius: "50%",
            }}
          >
            <Activity color="#EF4444" size={24} />
          </div>
          <div>
            <span className="text-muted" style={{ fontSize: "0.9rem" }}>
              Retención
            </span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {stats.totalUsers > 0
                ? Math.round((stats.activeMembers / stats.totalUsers) * 100)
                : 0}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Class Popularity */}
        <div className="card">
          <h3 className="mb-4">Clases Populares</h3>
          <div style={{ height: "250px" }}>
            <Bar
              data={classData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    grid: { color: "rgba(255,255,255,0.05)" },
                    ticks: { color: "#888" },
                  },
                  x: { grid: { display: false }, ticks: { color: "#888" } },
                },
              }}
            />
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="card">
          <h3 className="mb-4">Distribución de Planes</h3>
          <div
            style={{
              height: "250px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Doughnut
              data={planData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "right", labels: { color: "#fff" } },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
