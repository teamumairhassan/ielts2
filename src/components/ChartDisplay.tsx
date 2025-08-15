import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDisplayProps {
  type: 'line-chart' | 'bar-chart' | 'pie-chart';
  title: string;
  data: any;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ type, title, data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: type !== 'pie-chart' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case 'line-chart':
        return <Line data={data} options={options} />;
      case 'bar-chart':
        return <Bar data={data} options={options} />;
      case 'pie-chart':
        return <Pie data={data} options={options} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="w-full h-80">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartDisplay;