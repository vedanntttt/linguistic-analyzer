import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const PALETTE = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#84cc16',
]

export default function POSChart({ distribution }) {
  const labels = Object.keys(distribution)
  const values = Object.values(distribution)
  const total = values.reduce((a, b) => a + b, 0)

  const data = {
    labels,
    datasets: [
      {
        label: 'Tokens',
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length] + 'bb'),
        borderColor:     labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.parsed.y} tokens  (${((ctx.parsed.y / total) * 100).toFixed(1)}%)`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, stepSize: 1 },
      },
    },
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" />
        <h2 className="text-base font-semibold text-slate-800">POS Tag Distribution</h2>
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
          Morphological Analysis
        </span>
      </div>
      <Bar data={data} options={options} />
      <p className="text-xs text-slate-400 mt-2 text-center">
        Total tokens: {total}
      </p>
    </div>
  )
}
