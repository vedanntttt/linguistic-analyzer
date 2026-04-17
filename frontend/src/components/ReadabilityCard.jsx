function Bar({ value, max = 100, colorClass }) {
  const pct = Math.min(Math.max(value, 0), max) / max * 100
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function readingLabel(score) {
  if (score >= 90) return { text: 'Very Easy',      color: 'text-green-600' }
  if (score >= 70) return { text: 'Easy',           color: 'text-green-500' }
  if (score >= 50) return { text: 'Moderate',       color: 'text-yellow-500' }
  if (score >= 30) return { text: 'Difficult',      color: 'text-orange-500' }
  return             { text: 'Very Difficult',  color: 'text-red-500'    }
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-700">{value}</span>
    </div>
  )
}

export default function ReadabilityCard({ data }) {
  const level = readingLabel(data.flesch_reading_ease)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
        <h2 className="text-base font-semibold text-slate-800">Readability &amp; Discourse</h2>
      </div>

      {/* Flesch score hero */}
      <div className="text-center mb-4 p-3 bg-slate-50 rounded-xl">
        <div className="text-4xl font-bold text-slate-800">{data.flesch_reading_ease}</div>
        <div className={`text-sm font-semibold mt-0.5 ${level.color}`}>{level.text}</div>
        <div className="text-xs text-slate-400 mt-0.5">Flesch Reading Ease</div>
        <Bar value={data.flesch_reading_ease} colorClass="bg-emerald-400" />
      </div>

      <div className="space-y-0">
        <Row label="Kincaid Grade Level"     value={`Grade ${data.flesch_kincaid_grade}`} />
        <Row label="SMOG Index"              value={data.smog_index} />
        <Row label="Text Standard"           value={data.text_standard} />
        <Row label="Word Count"              value={data.word_count} />
        <Row label="Sentence Count"          value={data.sentence_count} />
        <Row label="Avg Sentence Length"     value={`${data.avg_sentence_length} words`} />
        <Row label="Unique Words"            value={data.unique_words} />
        <Row label="Type-Token Ratio"        value={data.type_token_ratio} />
      </div>
    </div>
  )
}
