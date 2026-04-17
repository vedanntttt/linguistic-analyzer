export default function KeywordsCard({ keywords }) {
  if (!keywords || keywords.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
          <h2 className="text-base font-semibold text-slate-800">TF-IDF Keywords</h2>
        </div>
        <p className="text-sm text-slate-400">No keywords extracted.</p>
      </div>
    )
  }

  const maxScore = keywords[0]?.score || 1

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
        <h2 className="text-base font-semibold text-slate-800">TF-IDF Keywords</h2>
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
          Semantic Analysis
        </span>
      </div>

      <div className="space-y-2.5">
        {keywords.map((kw, i) => {
          const pct = (kw.score / maxScore) * 100
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-4 text-right flex-shrink-0">{i + 1}</span>
              <span className="text-sm font-medium text-slate-700 w-28 truncate flex-shrink-0">
                {kw.word}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 min-w-0">
                <div
                  className="h-2 rounded-full bg-amber-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 w-14 text-right flex-shrink-0">
                {kw.score.toFixed(4)}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
        Scores are average TF-IDF across sentences — rare but frequent words rank highest.
      </p>
    </div>
  )
}
