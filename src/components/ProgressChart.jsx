
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ProgressChart({ data }) {
    if(!data || data.length === 0) return <p className="text-muted">No hay datos de peso todavía.</p>;

    const chartData = {
        labels: data.map(d => d.date),
        datasets: [
          {
            label: 'Peso (kg)',
            data: data.map(d => d.weight),
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            tension: 0.3,
          },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#fff' }
          },
          title: {
            display: false,
          },
        },
        scales: {
            x: {
                ticks: { color: '#888' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
                ticks: { color: '#888' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        }
    };

    return <Line options={options} data={chartData} />;
}
