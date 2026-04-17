const COLORS = {
  PERSON:     { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  ORG:        { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  GPE:        { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
  LOC:        { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200'   },
  DATE:       { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  TIME:       { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200'  },
  MONEY:      { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  PRODUCT:    { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200'    },
  EVENT:      { bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-200'   },
  NORP:       { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  CARDINAL:   { bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-200'  },
  PERCENT:    { bg: 'bg-lime-100',   text: 'text-lime-700',   border: 'border-lime-200'   },
  default:    { bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-200'  },
}

export default function EntityCard({ entities }) {
  // Build unique label descriptions for the legend
  const legendMap = {}
  entities.forEach(e => { legendMap[e.label] = e.description })

  const colorFor = (label) => COLORS[label] || COLORS.default

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0" />
        <h2 className="text-base font-semibold text-slate-800">Named Entity Recognition</h2>
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
          {entities.length} {entities.length === 1 ? 'entity' : 'entities'} found
        </span>
      </div>

      {entities.length === 0 ? (
        <p className="text-sm text-slate-400">No named entities detected.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {entities.map((ent, i) => {
              const c = colorFor(ent.label)
              return (
                <span
                  key={i}
                  title={ent.description}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm ${c.bg} ${c.text} ${c.border}`}
                >
                  <span className="font-medium">{ent.text}</span>
                  <span className="text-xs opacity-60">{ent.label}</span>
                </span>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-x-5 gap-y-1">
            {Object.entries(legendMap).map(([label, desc]) => {
              const c = colorFor(label)
              return (
                <span key={label} className={`text-xs font-medium ${c.text}`}>
                  {label}: <span className="font-normal opacity-80">{desc}</span>
                </span>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
