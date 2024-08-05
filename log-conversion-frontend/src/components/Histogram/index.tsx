import React from "react";
import { Bar } from "react-chartjs-2";

interface HistogramProps {
  title: string;
  data: any;
}

const Histogram: React.FC<HistogramProps> = ({ title, data }) => {
  return (
    <div style={{ height: '300px' }}>
      <h3>{title}</h3>
      <Bar
        data={data}
        options={{
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  let label = context.dataset.label || '';

                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y;
                  }
                  return label;
                }
              }
            }
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Data',
              },
              ticks: {
                callback: function (value, index, values) {
                  return data.labels[index]; // Retorna o rótulo de cada dia
                },
              },
            },
            y: {
              title: {
                display: true,
                text: 'Quantidade',
              },
            },
          },
        }}
      />
    </div>
  );
};

export default Histogram;
