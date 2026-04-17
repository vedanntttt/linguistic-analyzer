export default function SummaryCard({ sentences }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" />
        <h2 className="text-base font-semibold text-slate-800">Extractive Summary</h2>
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
          Word Frequency
        </span>
      </div>

      <div className="space-y-3">
        {sentences.map((sent, i) => (
          <div key={i} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">{sent}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
