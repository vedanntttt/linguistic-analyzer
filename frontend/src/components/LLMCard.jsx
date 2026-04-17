const SENTIMENT_COLORS = {
  Positive: 'bg-green-100 text-green-700 border-green-200',
  Negative: 'bg-red-100 text-red-700 border-red-200',
  Neutral:  'bg-slate-100 text-slate-600 border-slate-200',
  Mixed:    'bg-yellow-100 text-yellow-700 border-yellow-200',
}

const TONE_COLORS = {
  Formal:           'bg-indigo-100 text-indigo-700',
  Informal:         'bg-pink-100 text-pink-700',
  Technical:        'bg-blue-100 text-blue-700',
  Academic:         'bg-purple-100 text-purple-700',
  Conversational:   'bg-teal-100 text-teal-700',
}

export default function LLMCard({ data, loading, error }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-3 h-3 rounded-full bg-violet-500 flex-shrink-0" />
        <h2 className="text-base font-semibold text-slate-800">LLM Analysis</h2>
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
          Llama 3 · Groq
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 py-8 justify-center text-slate-400">
          <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Asking Llama 3…</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Results */}
      {!loading && data && (
        <div className="space-y-5">

          {/* Sentiment + Tone row */}
          <div className="flex flex-wrap gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Sentiment</p>
              <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full border ${SENTIMENT_COLORS[data.sentiment] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {data.sentiment}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Tone</p>
              <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${TONE_COLORS[data.tone] ?? 'bg-slate-100 text-slate-600'}`}>
                {data.tone}
              </span>
            </div>
            {data.target_audience && (
              <div>
                <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Audience</p>
                <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                  {data.target_audience}
                </span>
              </div>
            )}
          </div>

          {/* Abstractive Summary */}
          <div>
            <p className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">AI Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed bg-violet-50 border border-violet-100 rounded-lg px-4 py-3">
              {data.abstractive_summary}
            </p>
          </div>

          {/* Sentiment explanation */}
          {data.sentiment_explanation && (
            <div>
              <p className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Sentiment Reasoning</p>
              <p className="text-sm text-slate-600 leading-relaxed">{data.sentiment_explanation}</p>
            </div>
          )}

          {/* Writing style */}
          {data.writing_style && (
            <div>
              <p className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Writing Style</p>
              <p className="text-sm text-slate-600 leading-relaxed">{data.writing_style}</p>
            </div>
          )}

          {/* Key Themes */}
          {data.key_themes?.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Key Themes</p>
              <div className="flex flex-wrap gap-2">
                {data.key_themes.map((theme, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Placeholder when not yet run */}
      {!loading && !data && !error && (
        <p className="text-sm text-slate-400 text-center py-6">
          Click <span className="font-semibold">Analyze</span> to run LLM analysis.
        </p>
      )}
    </div>
  )
}
