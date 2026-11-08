import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function StatsChart({ repos }) {
  if (!repos.length) return null;

  const topRepos = repos.slice(0, 5);

  const data = {
    labels: topRepos.map((repo) => repo.name),
    datasets: [
      {
        label: "GitHub Stars",
        data: topRepos.map((repo) => repo.stargazers_count),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
        ],
      },
    ],
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 mb-8">
      <h2 className="text-2xl font-bold mb-5">
        Top Repositories
      </h2>

      <Bar data={data} />
    </div>
  );
}

export default StatsChart;